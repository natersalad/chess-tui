import fs from 'node:fs';
// Read only left/right mouse button transitions; never grab devices or retain input.
export function watchMouseButtons(callback,{root='/sys/class/input',devices='/dev/input'}={}){
 const readers=[];if(process.platform!=='linux')return ()=>{};
 try{for(const name of fs.readdirSync(root).filter(n=>/^event\d+$/.test(n))){try{
  const bits=BigInt('0x'+fs.readFileSync(`${root}/${name}/device/capabilities/key`,'utf8').trim().replace(/\s/g,''));if((bits>>272n&3n)!==3n)continue;
  readers.push({fd:fs.openSync(`${devices}/${name}`,fs.constants.O_RDONLY|fs.constants.O_NONBLOCK),pending:Buffer.alloc(0)});
 }catch{}}}catch{}
 const buffer=Buffer.alloc(1536);const timer=readers.length?setInterval(()=>{for(const reader of readers){try{const n=fs.readSync(reader.fd,buffer);if(!n)continue;reader.pending=Buffer.concat([reader.pending,buffer.subarray(0,n)]);while(reader.pending.length>=24){const event=reader.pending.subarray(0,24);reader.pending=reader.pending.subarray(24);if(event.readUInt16LE(16)!==1)continue;const code=event.readUInt16LE(18),value=event.readInt32LE(20);if((code===272||code===273)&&(value===0||value===1))callback({button:code===272?0:2,release:value===0});}}catch{}}},8):null;
 timer?.unref();return ()=>{clearInterval(timer);for(const r of readers)try{fs.closeSync(r.fd);}catch{}};
}
