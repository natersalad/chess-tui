import fs from 'node:fs';import {execFileSync} from 'node:child_process';
// Resize only the focused Ghostty window that owns this process, never desktop config.
export function fitChessWindow(cols,rows,cell){
 if(!process.env.NIRI_SOCKET)return ()=>{};
 const query=type=>JSON.parse(execFileSync('niri',['msg','-j',type],{encoding:'utf8',timeout:1000}));
 try{const ancestors=new Set();let pid=process.pid;for(let i=0;i<16&&pid>1;i++){ancestors.add(pid);const stat=fs.readFileSync(`/proc/${pid}/stat`,'utf8');pid=Number(stat.slice(stat.lastIndexOf(')')+2).split(' ')[1]);}
  const candidates=query('windows').filter(w=>w.app_id==='com.mitchellh.ghostty'&&ancestors.has(w.pid)),win=candidates.find(w=>w.is_focused)||(candidates.length===1?candidates[0]:null);if(!win)return ()=>{};
  const prior=win.layout.window_size[0],logicalPerPixel=win.layout.window_size[1]/(rows*cell.h),size=Math.min((cols-2)*cell.w,(rows-10)*cell.h),width=Math.round((size+2*cell.w)*logicalPerPixel+8);
  if(prior-width<24)return ()=>{};
  execFileSync('niri',['msg','action','set-window-width','--id',String(win.id),String(width)],{timeout:1000});
  return ()=>{try{const now=query('windows').find(w=>w.id===win.id);if(now&&Math.abs(now.layout.window_size[0]-width)<12)execFileSync('niri',['msg','action','set-window-width','--id',String(win.id),String(prior)],{timeout:1000});}catch{}};
 }catch{return ()=>{};}
}
