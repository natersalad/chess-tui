// Streaming parser: UTF-8 text, fragmented SGR mouse reports, and common keys.
export class InputParser {
 constructor(emit){this.emit=emit;this.buffer='';}
 feed(data){this.buffer+=data;while(this.buffer){
  if(this.buffer.startsWith('\x1b_G')){const end=this.buffer.indexOf('\x1b\\',3);if(end<0)return;const report=this.buffer.slice(3,end);this.buffer=this.buffer.slice(end+2);this.emit({type:'graphics',report});continue;}
  if(this.buffer==='\x1b_')return;
  const cell=this.buffer.match(/^\x1b\[6;(\d+);(\d+)t/);if(cell){this.buffer=this.buffer.slice(cell[0].length);this.emit({type:'cell',h:+cell[1],w:+cell[2]});continue;}
  const mode=this.buffer.match(/^\x1b\[\?1016;(\d+)\$y/);if(mode){this.buffer=this.buffer.slice(mode[0].length);this.emit({type:'pixel-mode',supported:[1,2].includes(+mode[1])});continue;}
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

export function pixelMouseEvent(e,cell){return {...e,pixelX:e.x-1,pixelY:e.y-1,x:1+(e.x-1)/cell.w,y:1+(e.y-1)/cell.h};}
