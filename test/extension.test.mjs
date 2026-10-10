import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {chromium} from '@playwright/test';import {Bridge} from '../src/bridge.mjs';import {Chess} from 'chess.js';
test('real unpacked extension transports fixture state and terminal moves through all layers',async()=>{
 const token='b'.repeat(64),bridge=await new Bridge({port:0,token}).start(),dir=fs.mkdtempSync(path.join(os.tmpdir(),'chess-extension-')),ext=path.join(dir,'extension');fs.cpSync('extension',ext,{recursive:true});const port=bridge.server.address().port;
 // Only remap loopback port in a temporary copy to avoid interfering with a running client.
 for(const p of ['background.js','manifest.json']){const file=path.join(ext,p);fs.writeFileSync(file,fs.readFileSync(file,'utf8').replaceAll('17391',String(port)));}
 let context;try{
  context=await chromium.launchPersistentContext(path.join(dir,'profile'),{executablePath:process.env.CHESS_TEST_BROWSER||chromium.executablePath(),headless:true,args:['--no-sandbox',`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
  let worker=context.serviceWorkers()[0];if(!worker)worker=await context.waitForEvent('serviceworker');await worker.evaluate(token=>chrome.storage.local.set({token}),token);
  await context.route('https://www.chess.com/**',route=>route.fulfill({contentType:'text/html',body:'<html><body><chess-board></chess-board><div id="board-layout-player-bottom"><span data-test-element="user-tagline-username">Nathan</span><span class="clock-time-monospace">5:00</span></div><div id="board-layout-player-top"><span data-test-element="user-tagline-username">Fixture</span><span class="clock-time-monospace">5:00</span></div><button data-cy="resign-button">Resign</button><script>window.context={user:{username:"Nathan"}};window.fixtureFen="'+new Chess().fen()+'";window.moves=0;document.querySelector("chess-board").game={getFEN:()=>window.fixtureFen,getLegalMoves:()=>[{from:"e2",to:"e4"}],move:()=>{window.moves++;window.fixtureFen="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";}};</script></body></html>'}));
  const page=await context.newPage();await page.goto('https://www.chess.com/play/online');
  const until=async pred=>{const start=Date.now();while(!pred()){if(Date.now()-start>8000)throw Error('Extension transport timeout');await new Promise(r=>setTimeout(r,100));}};
  await until(()=>bridge.connected&&bridge.snapshot?.active);assert.equal(bridge.snapshot.color,'w');
  const r=await bridge.command('move',{from:'e2',to:'e4',promotion:'q'});assert.ok(r.ok,r.error);await until(()=>bridge.snapshot.fen.includes(' b '));assert.equal(await page.evaluate(()=>window.moves),1);
  assert.equal((await bridge.command('move',{from:'d2',to:'d4'})).ok,false);
 }finally{await context?.close();await bridge.close();fs.rmSync(dir,{recursive:true,force:true});}
});
