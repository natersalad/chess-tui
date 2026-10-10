import {squareAt} from './input.mjs';
export function pointerShape(app,mouse){
 if(app.modal||app.screen!=='game'||!app.geometry)return 'default';
 if(app.pieceDrag)return 'grabbing';
 if(!mouse||app.busy||app.result())return 'default';
 const sq=squareAt(mouse.x,mouse.y,app.geometry,app.flip),p=sq&&app.chess().get(sq);
 if(!p||p.color!==app.chess().turn()||app.annotate)return 'default';
 if(app.mode==='bot'&&p.color==='b')return 'default';
 if(app.mode==='online'&&(!app.bridge.connected||app.bridge.snapshot?.color!==p.color))return 'default';
 return 'grab';
}
export const pointerSequence=shape=>`\x1b]22;${shape}\x1b\\`;
