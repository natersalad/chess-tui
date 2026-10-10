// Streaming parser: UTF-8 text, fragmented SGR mouse reports, and common keys.
export class InputParser {
 constructor(emit){this.emit=emit;this.buffer='';}
 feed(data){this.buffer+=data;while(this.buffer){
  if(this.buffer.startsWith('\x1b[<')){
   const m=this.buffer.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
   if(!m){if(this.buffer.length>80)this.buffer='';return;}
   this.buffer=this.buffer.slice(m[0].length);const b=+m[1];
   this.emit({type:'mouse',x:+m[2],y:+m[3],button:b&3,motion:!!(b&32),wheel:!!(b&64),release:m[4]==='m',shift:!!(b&4)});continue;
  }
  if(this.buffer==='\x1b'||this.buffer==='\x1b[')return;
  const key=this.buffer.match(/^\x1b\[([ABCD])/);
  if(key){this.buffer=this.buffer.slice(key[0].length);this.emit({type:'key',key:{A:'up',B:'down',C:'right',D:'left'}[key[1]]});continue;}
  if(this.buffer.startsWith('\x1b[')){const skip=this.buffer.match(/^\x1b\[[0-9;?]*[a-zA-Z~]/);if(skip){this.buffer=this.buffer.slice(skip[0].length);continue;}if(this.buffer.length<32)return;}
  const c=this.buffer[0];this.buffer=this.buffer.slice(1);this.emit({type:'key',key:c==='\x03'?'quit':c==='\r'?'enter':c==='\x1b'?'escape':c});
 }}
 flush(){if(this.buffer==='\x1b'){this.buffer='';this.emit({type:'key',key:'escape'});}}
}
export function squareAt(x,y,g,flip=false){const c=Math.floor((x-g.x)/g.sw),r=Math.floor((y-g.y)/g.sh);if(c<0||c>7||r<0||r>7)return null;return String.fromCharCode(97+(flip?7-c:c))+(flip?r+1:8-r);}
export function squareCenter(s,g,flip=false){const f=s.charCodeAt(0)-97,r=8-Number(s[1]);return {x:g.x+(flip?7-f:f)*g.sw+Math.floor(g.sw/2),y:g.y+(flip?7-r:r)*g.sh+Math.floor(g.sh/2)};}
