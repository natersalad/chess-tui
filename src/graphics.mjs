import sharp from 'sharp';
import {pieceSVG} from './pieces.mjs';
import {readable,rgb,contrast} from './theme.mjs';
export const imageId=41;
export const deleteBoard=`\x1b_Ga=d,d=I,i=${imageId},q=2\x1b\\`;
export const graphicsQuery='\x1b_Ga=q,i=991,s=1,v=1,f=24;AAAA\x1b\\';
const mix=(a,b,n)=>'#'+rgb(a).map((v,i)=>Math.round(v*(1-n)+rgb(b)[i]*n).toString(16).padStart(2,'0')).join('');
export function boardLayout(cols,rows,cell={w:12,h:26}){
 const available=Math.min((cols-10)*cell.w,(rows-12)*cell.h),gcd=(a,b)=>b?gcd(b,a%b):a,lcm=cell.w*cell.h/gcd(cell.w,cell.h);
 let size=Math.floor(available/lcm)*lcm;if(size<available*.6)size=Math.floor(available/cell.w)*cell.w;
 const width=size/cell.w,height=size/cell.h,x=Math.max(3,Math.floor((cols-width)/2)+1),y=6;
 return {x,y,sw:width/8,sh:height/8,cols:width,rows:Math.ceil(height),size,cell};
}
export function annotationRed(t){return /^#[0-9a-f]{6}$/i.test(t.error||'')?mix(t.error,'#b00000',.6):'#ef5350';}
export function boardColors(t){let light=t.secondary,dark=t.secondary_container;for(let i=0;i<20&&contrast('#292a27',dark)<3;i++)dark=mix(dark,light,.09);if(contrast('#292a27',dark)<3)dark=mix(dark,'#ffffff',.4);return {light,dark};}
export function boardSVG(app,size=960){const t=app.theme,ch=app.chess(),flip=app.flip,s=size/8;
 const xy=sq=>({x:(flip?7-(sq.charCodeAt(0)-97):sq.charCodeAt(0)-97)*s,y:(flip?Number(sq[1])-1:8-Number(sq[1]))*s});
 const {light,dark}=boardColors(t),last=app.lastMove();let parts=[];
 const legal=app.selected?ch.moves({square:app.selected,verbose:true}):[];
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){
  const sq=String.fromCharCode(97+(flip?7-c:c))+(flip?r+1:8-r),x=c*s,y=r*s,b=(r+c)%2?dark:light;
  parts.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${b}"/>`);
  if(last&&(last.from===sq||last.to===sq))parts.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#ffe65c" opacity=".50"/>`);
  if(app.selected===sq)parts.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${t.primary}" opacity=".65"/>`);
  if(app.circles.includes(sq))parts.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${annotationRed(t)}" opacity=".46"/>`);
  const p=ch.get(sq);if(p&&!(app.pieceDrag?.moved&&app.pieceDrag.from===sq)){const extent=s*.86,offset=(s-extent)/2;parts.push(`<g transform="translate(${x+offset} ${y+offset}) scale(${extent/100})">${pieceSVG(p.type,p.color)}</g>`);}
  if(legal.some(m=>m.to===sq))parts.push(p?`<circle cx="${x+s/2}" cy="${y+s/2}" r="${s*.43}" fill="none" stroke="${mix(b,'#000000',.4)}" stroke-width="${s*.07}"/>`:`<circle cx="${x+s/2}" cy="${y+s/2}" r="${s*.11}" fill="#000000" opacity=".22"/>`);
  const coord=readable((r+c)%2?light:dark,b,3),font=s*.19;
  if(c===0)parts.push(`<text x="${x+s*.065}" y="${y+s*.22}" fill="${coord}" font-family="sans-serif" font-size="${font}">${flip?r+1:8-r}</text>`);
  if(r===7)parts.push(`<text x="${x+s*.86}" y="${y+s*.94}" fill="${coord}" font-family="sans-serif" font-size="${font}">${String.fromCharCode(97+(flip?7-c:c))}</text>`);
 }
 for(const a of app.arrows){
  const from=xy(a.from),to=xy(a.to),x=from.x+s/2,y=from.y+s/2,ex=to.x+s/2,ey=to.y+s/2,dx=ex-x,dy=ey-y,knight=(Math.abs(dx)===s&&Math.abs(dy)===2*s)||(Math.abs(dx)===2*s&&Math.abs(dy)===s),bend=knight?(Math.abs(dx)>Math.abs(dy)?{x:ex,y}:{x,y:ey}):null,angle=Math.atan2(ey-(bend?.y??y),ex-(bend?.x??x)),head=s*.36,bx=ex-head*Math.cos(angle),by=ey-head*Math.sin(angle),half=s*.22;
  parts.push(`<g fill="#ffbc32" stroke="#ffbc32" opacity=".72"><path d="M${x} ${y} ${bend?`L${bend.x} ${bend.y} `:''}L${bx} ${by}" fill="none" stroke-width="${s*.19}" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M${ex} ${ey} L${bx-half*Math.sin(angle)} ${by+half*Math.cos(angle)} L${bx+half*Math.sin(angle)} ${by-half*Math.cos(angle)} Z" stroke="none"/></g>`);
 }
 if(app.pieceDrag?.moved&&app.geometry){const d=app.pieceDrag,g=app.geometry,p=ch.get(d.from);if(p){const extent=s*.86,x=(d.x-g.x+.5)*size/(g.sw*8),y=(d.y-g.y+.5)*size/(g.sh*8);parts.push(`<g transform="translate(${x-extent/2} ${y-extent/2}) scale(${extent/100})">${pieceSVG(p.type,p.color)}</g>`);}}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${parts.join('')}</svg>`;
}
export async function rasterBoard(app,g){return sharp(Buffer.from(boardSVG(app,g.size))).png().toBuffer();}
export function transmitPNG(png,g,id=imageId,display=true){const data=png.toString('base64');let out=`\x1b[${g.y};${g.x}H`;for(let at=0;at<data.length;at+=4096){const more=at+4096<data.length?1:0;out+=`\x1b_G${at===0?`a=${display?'T':'t'},f=100,i=${id},q=2,z=1,C=1,c=${g.cols},`:''}m=${more};${data.slice(at,at+4096)}\x1b\\`;}return out;}
export class BoardPainter{
 constructor(write){this.write=write;this.key='';this.revision=0;this.active=null;}
 async paint(app,g){const key=JSON.stringify([app.chess().fen(),app.theme,app.selected,app.lastMove(),app.flip,app.arrows,app.circles,app.pieceDrag,g]);if(key===this.key)return;this.key=key;const rev=++this.revision;const png=await rasterBoard(app,g);if(rev!==this.revision)return;const next=this.active===41?42:41;const old=this.active;this.write(transmitPNG(png,g,next,false)+`\x1b[?2026h\x1b[${g.y};${g.x}H\x1b_Ga=p,i=${next},q=2,z=1,C=1,c=${g.cols}\x1b\\`+(old?`\x1b_Ga=d,d=I,i=${old},q=2\x1b\\`:'')+'\x1b[?2026l');this.active=next;}
 hide(){if(this.key){this.revision++;this.key='';this.write('\x1b_Ga=d,d=I,i=41,q=2\x1b\\\x1b_Ga=d,d=I,i=42,q=2\x1b\\');this.active=null;}}
}
