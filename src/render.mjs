import {fg,bg,readable} from './theme.mjs';
import {squareCenter} from './input.mjs';
import {controls} from './game.mjs';
export class Frame {
 constructor(cols,rows,t){this.cols=cols;this.rows=rows;this.t=t;this.cells=Array.from({length:rows},()=>Array.from({length:cols},()=>({ch:' ',f:t.text,b:t.surface})));this.buttons=[];}
 text(x,y,s,f=this.t.text,b=this.t.surface){for(const ch of String(s).replace(/[\x00-\x1f\x7f-\x9f]/g,' ')){if(x>=1&&x<=this.cols&&y>=1&&y<=this.rows)this.cells[y-1][x-1]={ch,f,b};x++;}return this;}
 rect(x,y,w,h,b,f=this.t.text){for(let r=0;r<h;r++)this.text(x,y+r,' '.repeat(Math.max(0,w)),f,b);}
 button(x,y,w,label,action,active=false){const t=this.t,b=active?t.primary_container:t.surface_container_high||t.surface_variant||t.outline_variant;const f=readable(active?t.primary:t.text,b);this.rect(x,y,w,3,b,f);this.text(x+1,y+1,label.slice(0,w-2),f,b);this.buttons.push({x,y,w,h:3,action});}
 line(x1,y1,x2,y2,color){const dx=x2-x1,dy=y2-y1,n=Math.max(Math.abs(dx),Math.abs(dy));for(let i=1;i<n;i++){const x=Math.round(x1+dx*i/n),y=Math.round(y1+dy*i/n),c=this.cells[y-1]?.[x-1];if(c)this.text(x,y,Math.abs(dx)>Math.abs(dy)*2?'━':Math.abs(dy)>Math.abs(dx)*2?'┃':dx*dy>0?'╲':'╱',readable(color,c.b),c.b);}const c=this.cells[y2-1]?.[x2-1];if(c)this.text(x2,y2,Math.abs(dx)>Math.abs(dy)?dx>0?'▶':'◀':dy>0?'▼':'▲',readable(color,c.b),c.b);}
 output(){let s='\x1b[H',pf='',pb='';for(let y=0;y<this.rows;y++){s+=`\x1b[${y+1};1H`;for(const c of this.cells[y]){if(c.f!==pf){s+=fg(c.f);pf=c.f;}if(c.b!==pb){s+=bg(c.b);pb=c.b;}s+=c.ch;}}return s+'\x1b[0m';}
}
const art={k:['  +  ',' /#\\ ',' [_] '],q:[' \\W/ ',' /#\\ ',' [_] '],r:[' |=| ',' |#| ',' [_] '],b:['  /  ',' /o\\ ',' [_] '],n:[' /7) ',' |/  ',' [_] '],p:['  o  ',' /|\\ ',' [_] ']};
export function clock(ms){if(ms===null||ms===undefined)return '--:--';const sec=Math.ceil(Math.max(0,ms)/1000);return `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;}
export function render(app,cols,rows){const t=app.theme,f=new Frame(cols,rows,t);f.text(3,2,'C H E S S',t.accent);f.text(15,2,app.mode==='online'?'CHESS.COM':app.mode==='bot'?'LOCAL PRACTICE':'LOCAL CHESS',t.muted);f.button(cols-10,1,9,'Exit','exit');
 if(cols<72||rows<36){f.text(3,6,'Resize to at least 72 columns × 36 rows.',t.accent);f.text(3,8,'Your game and annotations are preserved.');f.button(3,11,18,'Help','help');return f;}
 if(app.screen==='menu'){const mx=Math.max(5,Math.floor((cols-66)/2));
  f.text(mx,6,'Choose how to play',t.text);f.text(mx,8,'All controls work with the mouse. Keyboard is optional.',t.muted);
  ['local','bot','online'].forEach((m,i)=>f.button(mx+i*21,10,19,{local:'Two players',bot:'Practice bot',online:'Chess.com'}[m],`mode:${m}`,app.mode===m));
  f.text(mx,15,'TIME CONTROL',t.muted);controls.forEach((c,i)=>f.button(mx+i*12,17,10,c.label,`control:${i}`,app.control===i));
  f.button(mx,23,23,app.mode==='online'?'Continue online':'Start local game','start');f.button(mx+26,23,16,'Browser setup','setup');f.button(mx+45,23,14,'Help','help');
  f.text(mx,28,app.bridge.status.slice(0,cols-9),t.muted);f.text(mx,30,app.message.slice(0,cols-mx-1),t.accent);if(app.mode==='online')f.button(mx,32,23,'Cancel search','cancel');
 }else{
  const sw=cols>=88?8:6,sh=rows>=44?4:3,g={x:Math.max(5,Math.floor((cols-sw*8-20)/2)),y:7,sw,sh};app.geometry=g;
  const ch=app.chess();const online=app.mode==='online',snap=app.bridge.snapshot;const flip=app.flip;const top=flip?'w':'b',bottom=flip?'b':'w';const remaining=app.clocks();
  f.text(g.x,4,`${online?(snap?.players?.[top]||'Opponent'):top==='w'?'WHITE':'BLACK'}  ${clock(remaining[top])}`,t.text);
  f.text(g.x+sw*8-15,4,app.result()?'GAME OVER':`${online?'LIVE':controls[app.control].label}`,t.muted);
  const selected=app.selected,legal=selected?ch.moves({square:selected,verbose:true}):[],last=app.lastMove();
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
   const sq=String.fromCharCode(97+(flip?7-c:c))+(flip?r+1:8-r);const p=ch.get(sq),x=g.x+c*sw,y=g.y+r*sh;
   let b=(r+c)%2?t.secondary_container:t.secondary;if(last&&(sq===last.from||sq===last.to))b=t.primary_container;if(selected===sq)b=t.primary;
   const sf=readable(t.on_surface,b);f.rect(x,y,sw,sh,b,sf);
   if(p){const card=p.color==='w'?'#e9ece2':'#131811',pf=p.color==='w'?'#182015':'#f1f2e9';const px=x+Math.floor((sw-5)/2);
    art[p.type].forEach((s,i)=>f.text(px,y+i,s,pf,card));
    if(sh===4)f.text(x+sw-2,y+3,p.color==='w'?p.type.toUpperCase():p.type,sf,b);
   }
   if(legal.some(m=>m.to===sq)){f.text(x+sw-1,y+Math.floor(sh/2),p?'◉':'•',sf,b);}
   if(app.circles.includes(sq)){f.text(x,y,'○',readable(t.tertiary,b),b);f.text(x+sw-1,y+sh-1,'○',readable(t.tertiary,b),b);}
  }
  for(let r=0;r<8;r++)f.text(g.x-2,g.y+r*sh+1,String(flip?r+1:8-r),t.muted);
  for(let c=0;c<8;c++)f.text(g.x+c*sw+Math.floor(sw/2),g.y+8*sh,String.fromCharCode(97+(flip?7-c:c)),t.muted);
  for(const a of [...app.arrows,...(app.drag?.to&&app.drag.to!==app.drag.from?[app.drag]:[])]){const p1=squareCenter(a.from,g,flip),p2=squareCenter(a.to,g,flip);f.line(p1.x,p1.y,p2.x,p2.y,t.tertiary);}
  const by=g.y+sh*8+2;f.text(g.x,by,`${online?(snap?.players?.[bottom]||'You'):bottom==='w'?'WHITE':'BLACK'}  ${clock(remaining[bottom])}   ${app.result()||`${ch.turn()==='w'?'White':'Black'} to move${ch.isCheck()?' · CHECK':''}`}`.slice(0,cols-8),t.accent);
  f.text(g.x,by+2,app.message.slice(0,cols-8),t.muted);
  const sx=g.x+sw*8+3;[['Help','help'],['Flip','flip'],[app.annotate?'Mark: ON':'Mark','annotate'],['Clear','clear'],['Menu','menu'],['Actions','actions']].forEach(([label,a],i)=>f.button(sx,6+i*4,Math.min(16,cols-sx-1),label,a,a==='annotate'&&app.annotate));
  f.text(sx,31,online?(app.bridge.connected?'PAIRED':'STALE'):'OFFLINE',online&&!app.bridge.connected?t.error:t.accent);
 }
 if(app.modal)modal(f,app);
 return f;
}
function modal(f,app){const t=f.t,w=Math.min(66,f.cols-6),h=app.modal==='setup'?25:app.modal==='help'?23:app.modal==='theme'?22:15,x=Math.floor((f.cols-w)/2)+1,y=Math.max(4,Math.floor((f.rows-h)/2));f.rect(x,y,w,h,t.surface,t.text);for(let r=0;r<h;r++){f.text(x,y+r,'│',t.accent);f.text(x+w-1,y+r,'│',t.accent);}f.text(x,y,'┌'+'─'.repeat(w-2)+'┐',t.accent);f.text(x,y+h-1,'└'+'─'.repeat(w-2)+'┘',t.accent);f.buttons=[];f.button(x+w-11,y+1,9,'Close','close');
 const title={help:'MOUSE CONTROLS',setup:'CHESS.COM BROWSER BRIDGE',theme:'NOCTALIA THEME',promotion:'CHOOSE PROMOTION',actions:'GAME ACTIONS',confirm:'CONFIRM ONLINE GAME',resign:'RESIGN GAME?',draw:'DRAW GAME?',leave:'RETURN TO MENU?',exit:'EXIT TERMINAL CHESS?'}[app.modal];f.text(x+3,y+2,title,t.accent);
 const lines=app.modal==='help'?['Left-click a piece, then a destination.','Right-drag to draw an arrow; right-click marks.','If right-click is captured, click Mark, then','left-drag for arrows / click for square marks.','Click Clear to erase annotations.','Promotion choices and every menu are clickable.','Flip changes orientation. Menu keeps online play','in the browser. Actions opens draw/resign.','Local practice bot is offline-only and deliberately weak.','Keyboard: ? help · f flip · a mark · c clear','Esc closes an overlay · Ctrl+C exits safely.']:
 app.modal==='setup'?['1. Load the reviewed extension/ folder in a Chromium','   browser via Extensions → Load unpacked.','2. Open the extension options; paste the pairing token.','3. Keep a logged-in Chess.com /play/online tab open.','4. Return here, choose Chess.com, then your time.','Credentials remain in your browser. No cloud relay.','Online integration is unofficial and may change.','A paired indicator is not proof of a live game.','Click Copy token, then paste into extension options.']:
 app.modal==='theme'?[`Source: ${app.theme.source}`, 'Reads semantic palette; refreshes every 1.5 seconds.','Text and indicators receive contrast correction.','White/black piece cards use fixed contrast-safe colors.','No Noctalia or terminal configuration is modified.']:
 app.modal==='confirm'?[`${controls[app.control].label} · Chess.com`, `Observed setting: ${app.bridge.snapshot?.ratedLabel||'not known'}`, 'This requests a real game when the browser is ready.','The browser validates preset and rated setting.','No automatic retry after uncertain submission.']:
 app.modal==='leave'?['Local game will be left. Online game stays in browser.','Returning to menu does not resign or cancel a search.']:
 app.modal==='exit'?['Closes this client; an online game stays in the browser.','This does not resign or cancel matchmaking.']:[];
 lines.forEach((s,i)=>f.text(x+3,y+5+i,s.slice(0,w-6),t.muted));
 if(app.modal==='promotion')['q','r','b','n'].forEach((p,i)=>f.button(x+4+i*14,y+7,12,{q:'Queen',r:'Rook',b:'Bishop',n:'Knight'}[p],`promote:${p}`));
 else if(app.modal==='actions'){f.button(x+3,y+6,17,'Resign','resign');f.button(x+23,y+6,17,app.mode==='online'?'Offer draw':'Agree draw','draw');f.button(x+3,y+10,23,'Cancel matchmaking','cancel');}
 else if(app.modal==='setup'){f.button(x+3,y+h-5,16,'Copy token','copy');f.button(x+21,y+h-5,18,'Open Chess.com','browser');f.button(x+41,y+h-5,18,'Open extension','extension');}
 else if(app.modal==='help')f.button(x+3,y+h-5,18,'Theme details','theme');
 else if(['confirm','leave','exit','resign','draw'].includes(app.modal)){f.button(x+3,y+h-5,23,{confirm:'Create game',leave:'Return to menu',exit:'Exit now',resign:'Confirm resign',draw:'Confirm draw'}[app.modal],`yes:${app.modal}`);f.button(x+29,y+h-5,17,'Cancel','close');}
}
