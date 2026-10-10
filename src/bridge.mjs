import {WebSocketServer} from 'ws';
import {randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {Chess} from 'chess.js';
export function bridgeConfig(dir=path.join(os.homedir(),'.local/state/terminal-chess')){
 fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,'bridge.json');let config;
 try{config=JSON.parse(fs.readFileSync(file));if(!/^[a-f0-9]{64}$/.test(config.token))throw Error('invalid token');}catch{config={port:17391,token:randomBytes(32).toString('hex')};fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n',{mode:0o600});}fs.chmodSync(file,0o600);return {...config,file};
}
export function validSnapshot(s){
 if(!s||typeof s.fen!=='string'||!['w','b',null].includes(s.color)||typeof s.active!=='boolean')return false;
 try{new Chess(s.fen);}catch{return false;}
 return (!s.players||(['w','b'].every(c=>typeof s.players[c]==='string'&&s.players[c].length<=150)))&&(!s.result||(typeof s.result==='string'&&s.result.length<=200))&&(!s.ratedLabel||['Rated','Unrated'].includes(s.ratedLabel))&&typeof s.gameId==='string'&&s.gameId.length<300&&typeof s.revision==='string'&&s.revision.length<500&&['w','b'].includes(s.orientation)&&['w','b'].every(c=>s.clocks?.[c]===null||(Number.isFinite(s.clocks?.[c])&&s.clocks[c]>=0&&s.clocks[c]<86400000));
}
export class Bridge {
 constructor(config,changed=()=>{}){this.config=config;this.changed=changed;this.peer=null;this.snapshot=null;this.pending=new Map();this.lastSeen=0;this.status='Browser not paired';}
 async start(){
  this.server=new WebSocketServer({host:'127.0.0.1',port:this.config.port,maxPayload:16384,verifyClient:({origin})=>!origin||origin.startsWith('chrome-extension://')});
  this.server.on('connection',ws=>{let authed=false;const deadline=setTimeout(()=>{if(!authed)ws.close(1008,'Pairing required');},3000);
   ws.on('error',()=>{});ws.on('message',raw=>{let m;try{m=JSON.parse(raw);}catch{ws.close(1008,'Invalid JSON');return;}
    if(!authed){const t=typeof m.token==='string'?Buffer.from(m.token):Buffer.alloc(0),expected=Buffer.from(this.config.token);if(m.type!=='hello'||t.length!==expected.length||!timingSafeEqual(t,expected)){ws.close(1008,'Invalid pairing');return;}authed=true;clearTimeout(deadline);if(this.peer&&this.peer!==ws)this.peer.close(1008,'New session');this.peer=ws;this.lastSeen=Date.now();this.status='Browser paired · waiting for Chess.com';ws.send(JSON.stringify({type:'hello',version:1}));this.changed();return;}
    if(this.peer!==ws)return;this.lastSeen=Date.now();
    if(m.type==='snapshot'&&validSnapshot(m.state)){this.snapshot={...m.state,receivedAt:Date.now()};this.status=m.state.notice||'Browser connected';this.changed();}
    else if(m.type==='notice'){this.status=String(m.text).slice(0,180);this.changed();}
    else if(m.type==='ack'&&typeof m.id==='string'){const p=this.pending.get(m.id);if(p){clearTimeout(p.timer);this.pending.delete(m.id);p.resolve({ok:m.ok===true,error:String(m.error||'').slice(0,200)});}this.changed();}
   });ws.on('close',()=>{clearTimeout(deadline);if(this.peer===ws){this.peer=null;this.status='Browser disconnected · submissions disabled';this.rejectPending('Disconnected; submission uncertain. Check browser before retry.');this.changed();}});
  });
  await new Promise((resolve,reject)=>{this.server.once('listening',resolve);this.server.once('error',reject);});
  this.timer=setInterval(()=>{if(this.peer&&Date.now()-this.lastSeen>6000){this.status='Browser state stale · submissions disabled';this.changed();}},2000);this.timer.unref();return this;
 }
 get connected(){return !!this.peer&&Date.now()-this.lastSeen<6000;}
 command(type,args={}){
  if(!this.connected)return Promise.resolve({ok:false,error:'Pair browser first'});
  if(this.pending.size)return Promise.resolve({ok:false,error:'An action is already awaiting confirmation'});
  if(!['move','prepare-game','create-game','cancel-search','resign','draw'].includes(type))return Promise.resolve({ok:false,error:'Unsupported action'});
  const s=this.snapshot;
  if(type==='move'){
   if(!s?.active||!s.color)return Promise.resolve({ok:false,error:'No owned active game'});
   const ch=new Chess(s.fen);if(ch.turn()!==s.color)return Promise.resolve({ok:false,error:'Not your turn'});
   try{ch.move(args);}catch{return Promise.resolve({ok:false,error:'Illegal move'});}
  }
  const id=randomUUID();return new Promise(resolve=>{const timer=setTimeout(()=>{this.pending.delete(id);resolve({ok:false,error:'Timed out; submission uncertain. Check browser before retry.'});this.changed();},7000);this.pending.set(id,{resolve,timer});this.peer.send(JSON.stringify({type,id,args,gameId:s?.gameId,revision:s?.revision}));});
 }
 rejectPending(error){for(const p of this.pending.values()){clearTimeout(p.timer);p.resolve({ok:false,error});}this.pending.clear();}
 async close(){clearInterval(this.timer);this.rejectPending('Client closed');for(const ws of this.server?.clients||[])ws.terminate();if(this.server)await new Promise(r=>this.server.close(r));}
}
