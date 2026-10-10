import {Chess} from 'chess.js';
import {LocalGame,controls,practiceMove} from './game.mjs';
import {squareAt} from './input.mjs';
import {render} from './render.mjs';
import {loadTheme} from './theme.mjs';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export class App {
 constructor(bridge,options={}){this.bridge=bridge;this.theme=loadTheme();this.mode=options.mode||'local';this.control=2;this.screen='menu';this.modal=null;this.selected=null;this.arrows=[];this.circles=[];this.flip=false;this.annotate=false;this.drag=null;this.message='Click a mode and time control to begin.';this.local=null;this.busy=false;this.onlineChess=new Chess();this.lastOnlineFen='';this.onlineLast=null;this.geometry=null;this.quit=options.quit||(()=>{});this.changed=options.changed||(()=>{});this.onExternal=options.onExternal||this.external.bind(this);}
 chess(){return this.mode==='online'?this.onlineChess:this.local?.chess||new Chess();}
 result(){return this.mode==='online'?this.bridge.snapshot?.result||'':this.local?.result||'';}
 lastMove(){return this.mode==='online'?this.onlineLast:this.local?.lastMove;}
 clocks(){if(this.mode!=='online')return this.local?.remaining||{w:null,b:null};const s=this.bridge.snapshot;if(!s)return {w:null,b:null};const c={...s.clocks};if(s.active&&!s.result){const side=this.onlineChess.turn();if(c[side]!==null)c[side]=Math.max(0,c[side]-Math.min(Date.now()-s.receivedAt,this.bridge.connected?86400000:6000));}return c;}
 sync(){const s=this.bridge.snapshot;if(s&&s.fen!==this.lastOnlineFen){
  const old=this.onlineChess;this.onlineLast=null;for(const m of old.moves({verbose:true})){old.move(m);if(old.fen()===new Chess(s.fen).fen())this.onlineLast=m;old.undo();if(this.onlineLast)break;}
  this.onlineChess=new Chess(s.fen);this.lastOnlineFen=s.fen;this.selected=null;this.arrows=[];this.circles=[];
 }if(this.mode==='online'&&s?.active&&s.color&&this.onlineRequested){this.screen='game';this.flip=s.orientation==='b';this.message=this.bridge.status;}this.changed();}
 frame(cols,rows){this.geometry=null;this.frameState=render(this,cols,rows);return this.frameState;}
 async input(e){
  if(e.type==='key'){const map={'quit':'force-exit','?':'help','f':'flip','a':'annotate','c':'clear','escape':'close'};if(map[e.key])return this.action(map[e.key]);return;}
  if(e.type!=='mouse'||e.wheel)return;
  if(this.modal||this.screen==='menu'||!this.geometry){if(!e.motion&&!e.release&&e.button===0)this.clickButton(e);return;}
  const sq=squareAt(e.x,e.y,this.geometry,this.flip);const annotation=e.button===2||this.annotate;
  if(e.release&&this.drag){if(sq){if(this.drag.from===sq)this.toggleCircle(sq);else this.toggleArrow(this.drag.from,sq);}this.drag=null;this.changed();return;}
  if(e.motion&&this.drag){this.drag.to=sq;this.changed();return;}
  if(e.motion||e.release)return;
  if(!sq){this.clickButton(e);return;}
  if(annotation){this.drag={from:sq,to:sq};this.changed();return;}
  if(e.button!==0||this.busy||this.result())return;
  const ch=this.chess(),p=ch.get(sq);
  if(this.selected===sq){this.selected=null;this.changed();return;}
  if(p&&p.color===ch.turn()){
   if(this.mode==='bot'&&ch.turn()==='b')return;
   if(this.mode==='online'&&(!this.bridge.connected||this.bridge.snapshot?.color!==p.color)){this.message='Not your turn, or browser state is stale.';this.changed();return;}
   this.selected=sq;this.changed();return;
  }
  if(this.selected){const moves=ch.moves({square:this.selected,verbose:true}).filter(m=>m.to===sq);if(!moves.length){this.message='Choose a highlighted destination.';this.changed();return;}
   if(moves.some(m=>m.promotion)){this.promotion={from:this.selected,to:sq};this.modal='promotion';this.changed();return;}
   await this.move(this.selected,sq);
  }
 }
 clickButton(e){if(e.button!==0)return;const b=this.frameState?.buttons.find(b=>e.x>=b.x&&e.x<b.x+b.w&&e.y>=b.y&&e.y<b.y+b.h);if(b)void this.action(b.action);}
 toggleCircle(s){this.circles=this.circles.includes(s)?this.circles.filter(x=>x!==s):[...this.circles,s];}
 toggleArrow(from,to){const a=this.arrows.find(a=>a.from===from&&a.to===to);this.arrows=a?this.arrows.filter(x=>x!==a):[...this.arrows,{from,to}];}
 async move(from,to,promotion='q'){
  if(this.busy)return;this.busy=true;this.selected=null;this.arrows=[];this.circles=[];this.message='';this.changed();
  if(this.mode==='online'){const r=await this.bridge.command('move',{from,to,promotion});this.message=r.ok?'Move submitted · waiting for website state':r.error;}
  else{const m=this.local.move(from,to,promotion);if(!m)this.message='Move could not be applied.';else this.message=`${m.san}`;}
  this.busy=false;this.changed();if(this.mode==='bot'&&this.local.chess.turn()==='b'&&!this.result()){
   this.busy=true;this.message='Practice bot thinking…';this.changed();this.botTimer=setTimeout(()=>{if(this.mode==='bot'&&this.screen==='game'&&!this.result()){const m=practiceMove(this.local.chess);if(m)this.local.move(m.from,m.to,m.promotion||'q');this.message='Your move';}this.busy=false;this.changed();},350);
  }
 }
 async action(a){
  if(a==='force-exit'){this.quit();return;}
  if(a.startsWith('mode:')){this.mode=a.slice(5);this.message=this.mode==='online'?this.bridge.status:'Local play never connects to the website.';}
  else if(a.startsWith('control:'))this.control=Number(a.slice(8));
  else if(a==='start'){
   if(this.mode==='online'){if(this.bridge.snapshot?.active&&this.bridge.snapshot.color&&this.bridge.connected){this.onlineRequested=true;this.screen='game';this.sync();}else{this.busy=true;this.message='Reading browser game settings…';this.changed();const r=await this.bridge.command('prepare-game');this.busy=false;if(r.ok)this.modal='confirm';else this.message=r.error;}}
   else{clearTimeout(this.botTimer);this.busy=false;this.local=new LocalGame(controls[this.control],this.mode);this.screen='game';this.selected=null;this.flip=false;this.arrows=[];this.circles=[];this.message='Click a piece, then its destination.';}
  }else if(a==='yes:confirm'){this.modal=null;this.onlineRequested=true;this.busy=true;this.message='Requesting game…';this.changed();const r=await this.bridge.command('create-game',{base:controls[this.control].base,inc:controls[this.control].inc,expectedRated:this.bridge.snapshot?.ratedLabel});this.busy=false;this.message=r.ok?'Matchmaking requested · waiting for opponent':r.error;}
  else if(a==='close'){this.modal=null;this.promotion=null;}
  else if(['help','setup','theme','actions','resign','draw','exit'].includes(a))this.modal=a;
  else if(a==='flip')this.flip=!this.flip;
  else if(a==='annotate'){this.annotate=!this.annotate;this.selected=null;this.message=this.annotate?'Mark mode: left-drag arrow / click square.':'Click piece then destination.';}
  else if(a==='clear'){this.arrows=[];this.circles=[];this.drag=null;}
  else if(a==='menu')this.modal='leave';
  else if(a==='yes:leave'){clearTimeout(this.botTimer);this.busy=false;this.screen='menu';this.modal=null;this.onlineRequested=false;this.selected=null;this.drag=null;}
  else if(a==='yes:exit'){this.quit();return;}
  else if(a.startsWith('promote:')&&this.promotion){const m=this.promotion;this.promotion=null;this.modal=null;await this.move(m.from,m.to,a.slice(8));}
  else if(a==='yes:resign'||a==='yes:draw'||a==='cancel'){
   this.modal=null;
   if(this.mode==='online'){const cmd=a==='cancel'?'cancel-search':a==='yes:resign'?'resign':'draw';const r=await this.bridge.command(cmd);this.message=r.ok?'Action submitted · check website state':r.error;}
   else if(a==='cancel')this.message='No online search in local mode.';else if(a==='yes:resign')this.local?.resign();else if(this.local)this.local.result='Draw by agreement';
  }else if(['copy','browser','extension'].includes(a))this.onExternal(a);
  this.changed();
 }
 external(a){if(a==='copy'){const p=spawn('wl-copy',[],{stdio:['pipe','ignore','ignore']});p.on('error',()=>{this.message=`Copy unavailable. Token file: ${this.bridge.config.file}`;this.changed();});p.stdin.end(this.bridge.config.token);this.message='Pairing token copied locally.';}
  else{const p=spawn('xdg-open',[a==='browser'?'https://www.chess.com/play/online':path.join(projectRoot,'extension')],{stdio:'ignore',detached:true});p.on('error',()=>{});p.unref();this.message='Opened setup destination.';}}
 tick(){this.local?.tick();this.changed();}
 close(){clearTimeout(this.botTimer);}
}
