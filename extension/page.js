// Original adapter informed by chess-tui's documented board API. No upstream code copied.
(()=>{
 let channel=null,working=false,wasActive=false,epoch=0;const seen=new Set(),identities=new WeakMap();
 const startFen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,150);
 const visible=e=>!!e&&e.getClientRects().length>0&&!e.disabled&&e.getAttribute('aria-disabled')!=='true';
 const board=()=>document.querySelector('wc-chess-board,chess-board');
 const game=()=>board()?.game;
 const query=s=>document.querySelector(s);
 function viewer(){const c=window.context?.user||window.chesscom?.user;if(typeof c?.username==='string')return c.username;const link=query('a[data-user-activity-key="profile"][href*="/member/"],a.sidebar-link[href*="/member/"]');return link?.getAttribute('href')?.match(/\/member\/([^/?#]+)/)?.[1]||null;}
 function clock(root){const raw=clean(root?.querySelector('.clock-time-monospace,.clock-time')?.textContent);if(!/^\d+(?::\d+){0,2}(?:\.\d+)?$/.test(raw))return null;return raw.split(':').reduce((a,n)=>a*60+Number(n),0)*1000;}
 function rated(){const checkbox=query('input[name="rated"],input[data-cy="rated-checkbox"],input#rated,input#rated-switch');if(checkbox)return checkbox.checked?'Rated':'Unrated';const e=query('[data-cy="rated-toggle"],[data-test-element="rated-toggle"]');if(e){const v=e.getAttribute('aria-checked');if(v==='true'||v==='false')return v==='true'?'Rated':'Unrated';}return null;}
 function snapshot(){let fen=startFen;try{fen=game()?.getFEN?.()||startFen;}catch{}
  const b=board(),orientation=b?.classList.contains('flipped')||b?.getAttribute('orientation')==='black'?'b':'w';
  const top=query('#board-layout-player-top'),bottom=query('#board-layout-player-bottom');const name=r=>clean(r?.querySelector('[data-test-element="user-tagline-username"],.user-username-component')?.textContent);
  const players={[orientation]:name(bottom),[orientation==='w'?'b':'w']:name(top)},v=viewer();const color=v?(['w','b'].find(c=>players[c]?.toLowerCase()===v.toLowerCase())||null):null;
  const result=clean(query('.game-over-message-component,[data-cy="game-over-message"]')?.textContent);
  const active=!!game()?.getFEN&&!!color&&!!top&&!!bottom&&!result&&!!query('[data-cy="resign-button"],.resign-button-component');
  const g=game();if(g&&typeof g==='object'&&!identities.has(g))identities.set(g,crypto.randomUUID());if(active&&!wasActive)epoch++;wasActive=active;const gameId=location.pathname+':'+(g&&identities.get(g)||'setup')+':'+epoch;return {fen,orientation,color,active,gameId,revision:fen,clocks:{[orientation]:clock(bottom),[orientation==='w'?'b':'w']:clock(top)},players,result,ratedLabel:rated(),notice:active?'Live game observed':v?'Logged in · no owned active game':'Login or game ownership not observed'};
 }
 function post(m){if(channel)window.postMessage({source:'terminal-chess-page',channel,...m},location.origin);}
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 function unique(selector){const es=[...document.querySelectorAll(selector)].filter(visible);if(es.length!==1)throw Error('Required website control missing or ambiguous');return es[0];}
 function buttonWith(labels){const es=[...document.querySelectorAll('button,[role="button"]')].filter(e=>visible(e)&&labels.includes(clean(e.innerText||e.textContent)));if(es.length!==1)throw Error('Website button missing or ambiguous: '+labels.join('/'));return es[0];}
 function click(e){if(!visible(e))throw Error('Website control unavailable');e.click();}
 async function openTimeSelector(){
  const known=[...document.querySelectorAll('[data-cy="time-selector-button"],[data-test-element="time-selector-button"],.time-selector-button')].filter(visible);
  const candidates=known.length?known:[...document.querySelectorAll('button.cc-dropdown-button-component')].filter(e=>visible(e)&&e.querySelector('svg[data-glyph^="game-time-"]')&&/^\d+\s*(?:min|\+)/.test(clean(e.querySelector('.cc-dropdown-button-label')?.textContent)));
  if(candidates.length!==1)throw Error('Time-control dropdown missing or ambiguous');click(candidates[0]);await sleep(200);
 }
 async function command(c){
  if(working)throw Error('Website action already pending');if(seen.has(c.id))throw Error('Duplicate request rejected');seen.add(c.id);if(seen.size>256)seen.delete(seen.values().next().value);working=true;
  try{const s=snapshot();
   if(c.type==='prepare-game'){if(s.active)throw Error('An active game already exists');if(!viewer())throw Error('Log in to Chess.com first');if(!rated())await openTimeSelector();if(!rated())throw Error('Rated/unrated setting unavailable; open browser setup.');post({type:'snapshot',state:snapshot()});return;}
   if(c.type==='create-game'){
    if(s.active)throw Error('An active game already exists');if(!viewer())throw Error('Log in to Chess.com first');
    const allowed={'60:0':['1 min','1|0'],'180:0':['3 min','3|0'],'300:0':['5 min','5|0'],'600:0':['10 min','10|0'],'900:10':['15|10','15 + 10','15 min | 10 sec']};const labels=allowed[`${c.args?.base}:${c.args?.inc}`];if(!labels)throw Error('Unsupported time control');
    let matches=[...document.querySelectorAll('button,[role="button"]')].filter(e=>visible(e)&&labels.includes(clean(e.innerText||e.textContent)));
    if(matches.length===0){await openTimeSelector();matches=[...document.querySelectorAll('button,[role="button"]')].filter(e=>visible(e)&&labels.includes(clean(e.innerText||e.textContent)));}
    if(matches.length!==1)throw Error('Requested time control missing or ambiguous');click(matches[0]);await sleep(150);
    let reopened=false;if(!rated()){await openTimeSelector();reopened=true;}
    const selected=[...document.querySelectorAll('.time-selector-button-button.cc-selected-border')].filter(visible);if(selected.length&&(selected.length!==1||!labels.includes(clean(selected[0].innerText))))throw Error('Selected time control could not be confirmed');
    const setting=rated();if(!setting||setting!==c.args.expectedRated)throw Error('Rated/unrated setting unknown or changed. Check browser, then confirm again; stopped before Play.');
    if(snapshot().active)throw Error('Game started elsewhere; refusing another request');
    // The terminal confirmation shows real-game intent; this is one deliberate Play action.
    if(reopened)await openTimeSelector();click(buttonWith(['Start Game','Play']));return;
   }
   if(c.type==='cancel-search'){click(unique('[data-cy="cancel-search-button"],.search-cancel-button'));return;}
   if(!s.active||!s.color||s.gameId!==c.gameId||s.revision!==c.revision)throw Error('Game state changed or ownership not confirmed');
   if(c.type==='move'){
    const a=c.args;if(!/^[a-h][1-8]$/.test(a?.from)||!/^[a-h][1-8]$/.test(a?.to)||!['q','r','b','n'].includes(a.promotion||'q'))throw Error('Invalid move');if(s.fen.split(' ')[1]!==s.color)throw Error('Not your turn');
    const g=game();if(typeof g?.getLegalMoves!=='function'||typeof g?.move!=='function')throw Error('Website board API unavailable');
    const candidates=g.getLegalMoves().filter(m=>String(m.from??m.start??m.source).slice(0,2)===a.from&&String(m.to??m.end??m.target).slice(0,2)===a.to);
    const m=candidates.find(m=>!m.promotion||String(m.promotion).toLowerCase()[0]===a.promotion);if(!m)throw Error('Website rejected legal-move match');
    g.move({...m,promotion:m.promotion||undefined});
    if(m.promotion){await sleep(50);const pick=query(`.promotion-piece.${s.color}${a.promotion}`);if(visible(pick))click(pick);}
    for(let i=0;i<18;i++){await sleep(100);if(snapshot().fen!==s.fen){post({type:'snapshot',state:snapshot()});return;}}
    throw Error('Move acceptance uncertain; do not resend until browser state is checked');
   }
   if(c.type==='resign'||c.type==='draw'){
    click(unique(c.type==='resign'?'[data-cy="resign-button"],.resign-button-component':'[data-cy="draw-offer-button"],.draw-button-component'));await sleep(100);
    const confirm=[...document.querySelectorAll('[data-cy="confirm-yes"]')].filter(visible);if(confirm.length===1)click(confirm[0]);else if(confirm.length>1)throw Error('Confirmation ambiguous');return;
   }
   throw Error('Unsupported action');
  }finally{working=false;}
 }
 window.addEventListener('message',e=>{if(e.source!==window||e.origin!==location.origin||e.data?.source!=='terminal-chess-content')return;const m=e.data;
  if(m.type==='init'&&typeof m.channel==='string'){channel=m.channel;post({type:'snapshot',state:snapshot()});return;}
  if(m.channel!==channel||m.type!=='command'||typeof m.command?.id!=='string')return;
  command(m.command).then(()=>post({type:'ack',id:m.command.id,ok:true})).catch(err=>post({type:'ack',id:m.command.id,ok:false,error:err.message}));
 });
 setInterval(()=>post({type:'snapshot',state:snapshot()}),500);
})();
