import {Chess} from 'chess.js';
export const controls=[{label:'1 min',base:60,inc:0},{label:'3 min',base:180,inc:0},{label:'5 min',base:300,inc:0},{label:'10 min',base:600,inc:0},{label:'15 + 10',base:900,inc:10}];
export class LocalGame {
 constructor(control=controls[2],mode='local',fen){this.chess=new Chess(fen);this.control=control;this.mode=mode;this.remaining={w:control.base*1000,b:control.base*1000};this.lastTick=0;this.started=false;this.result='';this.lastMove=null;}
 tick(now=Date.now()){if(!this.started||this.result)return;const side=this.chess.turn();this.remaining[side]=Math.max(0,this.remaining[side]-(now-this.lastTick));this.lastTick=now;if(this.remaining[side]===0)this.result=`${side==='w'?'Black':'White'} wins on time`;}
 move(from,to,promotion='q',now=Date.now()){this.tick(now);if(this.result)return null;let move;try{move=this.chess.move({from,to,promotion});}catch{return null;}const moved=move.color;this.remaining[moved]+=this.control.inc*1000;this.lastTick=now;this.started=true;this.lastMove=move;this.detectResult();return move;}
 detectResult(){if(this.chess.isCheckmate())this.result=`${this.chess.turn()==='w'?'Black':'White'} wins by checkmate`;else if(this.chess.isStalemate())this.result='Draw · stalemate';else if(this.chess.isThreefoldRepetition())this.result='Draw · repetition';else if(this.chess.isInsufficientMaterial())this.result='Draw · insufficient material';else if(this.chess.isDraw())this.result='Draw';}
 resign(){this.result=`${this.chess.turn()==='w'?'White':'Black'} resigned`;}
}
// Deliberately weak offline practice opponent. Never imported by the browser bridge.
export function practiceMove(chess){
 const values={p:100,n:320,b:330,r:500,q:900,k:0};let best=null,score=-Infinity;
 for(const m of chess.moves({verbose:true})){
  chess.move(m);let s=(values[m.captured]||0)*2+(m.promotion?800:0)+(chess.isCheck()?25:0);
  if(chess.isCheckmate())s+=100000;
  const danger=Math.max(0,...chess.moves({verbose:true}).map(x=>values[x.captured]||0));s-=danger;
  s+=4-Math.abs(3.5-(m.to.charCodeAt(0)-97));if(m.piece==='p'||m.piece==='n')s+=4;
  chess.undo();if(s>score){score=s;best=m;}
 }return best;
}
