import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
export const palettePath = process.env.CHESS_PALETTE || path.join(os.homedir(), '.cache/noctalia/reaper-palette.json');
export const fallback = {surface:'#101411',on_surface:'#f0f1e9',on_surface_variant:'#c5c8ba',primary:'#b1d18a',primary_container:'#344e16',secondary:'#bfcbad',secondary_container:'#404a33',tertiary:'#a0d0cc',outline:'#8e9285',outline_variant:'#44483d',error:'#ffb4ab'};
export const rgb = h => h.slice(1).match(/../g).map(x=>parseInt(x,16));
const lum = h => rgb(h).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0);
export const contrast = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
export function readable(fg,bg,min=4.5) {if(contrast(fg,bg)>=min)return fg;return contrast('#ffffff',bg)>contrast('#000000',bg)?'#ffffff':'#000000';}
export function loadTheme(file=palettePath) {
 try {const p=JSON.parse(fs.readFileSync(file,'utf8'));if(file===palettePath&&!process.env.CHESS_PALETTE){const ghost=path.join(os.homedir(),'.config/ghostty/themes/noctalia');if(fs.existsSync(ghost)){const text=fs.readFileSync(ghost,'utf8');if(!text.includes('palette = 2='+p.primary)||!text.includes('foreground = '+p.on_surface))throw Error('Generated theme mismatch');}}for(const k of Object.keys(fallback))if(!/^#[\da-f]{6}$/i.test(p[k]))throw Error('Missing color role');return {...p,source:file,text:readable(p.on_surface,p.surface),muted:readable(p.on_surface_variant,p.surface),accent:readable(p.primary,p.surface)};}
 catch{return {...fallback,source:'bundled fallback',text:fallback.on_surface,muted:fallback.on_surface_variant,accent:fallback.primary};}
}
export function watchTheme(onChange,file=palettePath,interval=1500) {
 let last=JSON.stringify(loadTheme(file));
 const timer=setInterval(()=>{const p=loadTheme(file);if(p.source==='bundled fallback'&&!last.includes('bundled fallback'))return;const next=JSON.stringify(p);if(next!==last){last=next;onChange(p);}},interval);timer.unref();return ()=>clearInterval(timer);
}
const ansi256=h=>{const [r,g,b]=rgb(h),c=[r,g,b].map(x=>Math.round(x/255*5));const cube=[0,95,135,175,215,255],dist=(a,b)=>a.reduce((s,x,i)=>s+(x-b[i])**2,0);const gray=Math.max(0,Math.min(23,Math.round(((r+g+b)/3-8)/10)));return dist([r,g,b],c.map(x=>cube[x]))<=dist([r,g,b],[8+gray*10,8+gray*10,8+gray*10])?16+36*c[0]+6*c[1]+c[2]:232+gray;};
export const fg = h => process.env.CHESS_COLOR_MODE==='256'?`\x1b[38;5;${ansi256(h)}m`:`\x1b[38;2;${rgb(h).join(';')}m`;
export const bg = h => process.env.CHESS_COLOR_MODE==='256'?`\x1b[48;5;${ansi256(h)}m`:`\x1b[48;2;${rgb(h).join(';')}m`;
