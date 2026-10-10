#!/usr/bin/env node
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Bridge,bridgeConfig} from '../src/bridge.mjs';
import {App} from '../src/app.mjs';
import {InputParser} from '../src/input.mjs';
import {watchTheme,loadTheme} from '../src/theme.mjs';
import {pointerShape,pointerSequence} from '../src/pointer.mjs';
import {BoardPainter,graphicsQuery} from '../src/graphics.mjs';
const newWindow=process.argv.includes('--window')&&!process.argv.includes('--here');
if(process.argv.includes('--help')){console.log('chess — mouse-driven terminal chess\n  --here       use current terminal (the default)\n  --window     open a separate mouse-enabled Ghostty window\n  --text       explicit basic text fallback\n  --doctor     report local capabilities\n  --setup      print reviewed browser extension setup\n  --local      start in local mode (default)\n  --online     start in Chess.com mode\nNormal launch runs in the current terminal.');process.exit(0);}
if(process.argv.includes('--doctor')){console.log(JSON.stringify({node:process.version,theme:loadTheme().source,term:process.env.TERM,mouseReporting:'Current terminal must permit mouse reporting; --window provides a per-session override',online:'Requires reviewed extension and logged-in Chess.com tab; unofficial integration'},null,2));process.exit(0);}
if(process.argv.includes('--setup')){const c=bridgeConfig();console.log(`Extension: ${path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../extension')}\nPairing token file: ${c.file}\nLoad unpacked in Chromium, open extension options, copy token from file.\nThen log in to Chess.com and keep /play/online open. Run chess and click Browser setup for copy/open controls.\nNo rated games are started by setup.`);process.exit(0);}
// Per-process override only. No writes to Ghostty/Noctalia configuration.
if(newWindow&&(process.env.WAYLAND_DISPLAY||process.env.DISPLAY)){
 const p=spawn('ghostty',['--gtk-single-instance=false','--mouse-reporting=true','--title=Chess','--window-decoration=none','--gtk-titlebar=false','--window-show-tab-bar=never','-e',process.execPath,fileURLToPath(import.meta.url),'--here',...process.argv.slice(2).filter(a=>a!=='--window')],{stdio:'ignore',detached:true});p.on('error',()=>{console.error('Could not open Ghostty. Run chess --here in a mouse-enabled terminal.');process.exitCode=1;});p.unref();
}else{
 if(!process.stdin.isTTY||!process.stdout.isTTY){console.error('chess needs an interactive terminal. Use chess --doctor for diagnostics.');process.exit(1);}
 const config=bridgeConfig(),bridge=new Bridge(config);let bridgeError='';try{await bridge.start();}catch(e){bridge.status=`Online bridge unavailable (${e.code||e.message}); local play works.`;bridgeError=bridge.status;}
 let stopped=false,timer,escapeTimer,probeTimer,unwatch;const app=new App(bridge,{graphics:false,textFallback:process.argv.includes('--text'),mode:process.argv.includes('--online')?'online':'local',quit:()=>void cleanup()});
 const painter=new BoardPainter(s=>{if(!stopped)process.stdout.write(s);});let previousFrame=null,mouse=null,cursor='';const updatePointer=()=>{const next=pointerShape(app,mouse);if(next!==cursor){process.stdout.write(pointerSequence(next));cursor=next;}};let painting=false;const draw=()=>{if(stopped||painting)return;painting=true;const cols=process.stdout.columns||80,rows=process.stdout.rows||40;const frame=app.frame(cols,rows);process.stdout.write(frame.output(previousFrame));previousFrame=frame;updatePointer();if(app.screen==='game'&&!app.modal&&app.geometry&&app.graphics&&!app.textFallback){void painter.paint(app,app.geometry).catch(e=>{app.graphics=false;app.message='Image rendering failed: '+e.message;painter.hide();});}else painter.hide();painting=false;};
 app.changed=draw;bridge.changed=()=>{app.sync();draw();};
 if(bridgeError)app.message=bridgeError;
 process.stdin.setRawMode(true);process.stdin.resume();process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[?1000h\x1b[?1003h\x1b[?1006h\x1b[2J');
 const parser=new InputParser(e=>{if(e.type==='cell'){if(e.w>0&&e.h>0){app.cell={w:e.w,h:e.h};draw();}return;}if(e.type==='graphics'){if(e.report.includes('i=991')&&e.report.endsWith(';OK')){clearTimeout(probeTimer);app.graphics=true;app.graphicsStatus='Kitty graphics verified';draw();}return;}if(e.type==='mouse')mouse=e;Promise.resolve(app.input(e)).then(updatePointer).catch(err=>{app.message=`Action failed: ${err.message}`;draw();});});
 process.stdin.on('data',d=>{clearTimeout(escapeTimer);parser.feed(d.toString());escapeTimer=setTimeout(()=>parser.flush(),35);});process.stdout.on('resize',()=>{app.drag=null;app.pieceDrag=null;process.stdout.write('\x1b[16t');draw();});
 process.stdout.write(graphicsQuery+'\x1b[16t\x1b[c');probeTimer=setTimeout(()=>{if(!app.graphics){app.graphicsStatus='Graphics probe unanswered';app.message='Image support unavailable; try chess --window in Ghostty.';draw();}},800);
 unwatch=watchTheme(t=>{app.theme=t;draw();});timer=setInterval(()=>app.tick(),250);draw();
 async function cleanup(code=0){if(stopped)return;stopped=true;clearInterval(timer);clearTimeout(escapeTimer);clearTimeout(probeTimer);painter.hide();unwatch?.();app.close();process.stdout.write(pointerSequence('')+'\x1b[0m\x1b[?1006l\x1b[?1003l\x1b[?1000l\x1b[?25h\x1b[?1049l');process.stdin.setRawMode(false);process.stdin.pause();await bridge.close().catch(()=>{});process.exit(code);}
 process.on('SIGINT',()=>void cleanup());process.on('SIGTERM',()=>void cleanup());process.on('uncaughtException',e=>{void cleanup(1);process.stderr.write(`Chess stopped: ${e.message}\n`);});
}
