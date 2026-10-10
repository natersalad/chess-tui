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
const here=process.argv.includes('--here');
if(process.argv.includes('--help')){console.log('chess — mouse-driven terminal chess\n  --here       use current terminal (mouse reporting must work)\n  --doctor     report local capabilities\n  --setup      print reviewed browser extension setup\n  --local      start in local mode (default)\n  --online     start in Chess.com mode\nNormal launch opens a dedicated mouse-enabled Ghostty session when needed.');process.exit(0);}
if(process.argv.includes('--doctor')){console.log(JSON.stringify({node:process.version,theme:loadTheme().source,term:process.env.TERM,mouseReporting:'Ghostty global config may suppress input; standard launch uses a per-session override',online:'Requires reviewed extension and logged-in Chess.com tab; unofficial integration'},null,2));process.exit(0);}
if(process.argv.includes('--setup')){const c=bridgeConfig();console.log(`Extension: ${path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../extension')}\nPairing token file: ${c.file}\nLoad unpacked in Chromium, open extension options, copy token from file.\nThen log in to Chess.com and keep /play/online open. Run chess and click Browser setup for copy/open controls.\nNo rated games are started by setup.`);process.exit(0);}
// Per-process override only. No writes to Ghostty/Noctalia configuration.
if(!here&&(process.env.WAYLAND_DISPLAY||process.env.DISPLAY)){
 const p=spawn('ghostty',['--mouse-reporting=true','--title=Terminal Chess','-e',process.execPath,fileURLToPath(import.meta.url),'--here',...process.argv.slice(2)],{stdio:'ignore',detached:true});p.on('error',()=>{console.error('Could not open Ghostty. Run chess --here in a mouse-enabled terminal.');process.exitCode=1;});p.unref();
}else{
 if(!process.stdin.isTTY||!process.stdout.isTTY){console.error('chess needs an interactive terminal. Use chess --doctor for diagnostics.');process.exit(1);}
 const config=bridgeConfig(),bridge=new Bridge(config);let bridgeError='';try{await bridge.start();}catch(e){bridge.status=`Online bridge unavailable (${e.code||e.message}); local play works.`;bridgeError=bridge.status;}
 let stopped=false,timer,escapeTimer,unwatch;const app=new App(bridge,{mode:process.argv.includes('--online')?'online':'local',quit:()=>void cleanup()});
 let painting=false;const draw=()=>{if(stopped||painting)return;painting=true;const cols=process.stdout.columns||80,rows=process.stdout.rows||40;process.stdout.write(app.frame(cols,rows).output());painting=false;};
 app.changed=draw;bridge.changed=()=>{app.sync();draw();};
 if(bridgeError)app.message=bridgeError;
 process.stdin.setRawMode(true);process.stdin.resume();process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[?1000h\x1b[?1002h\x1b[?1006h\x1b[2J');
 const parser=new InputParser(e=>{Promise.resolve(app.input(e)).catch(err=>{app.message=`Action failed: ${err.message}`;draw();});});
 process.stdin.on('data',d=>{clearTimeout(escapeTimer);parser.feed(d.toString());escapeTimer=setTimeout(()=>parser.flush(),35);});process.stdout.on('resize',()=>{app.drag=null;draw();});
 unwatch=watchTheme(t=>{app.theme=t;draw();});timer=setInterval(()=>app.tick(),250);draw();
 async function cleanup(code=0){if(stopped)return;stopped=true;clearInterval(timer);clearTimeout(escapeTimer);unwatch?.();app.close();process.stdout.write('\x1b[0m\x1b[?1006l\x1b[?1002l\x1b[?1000l\x1b[?25h\x1b[?1049l');process.stdin.setRawMode(false);process.stdin.pause();await bridge.close().catch(()=>{});process.exit(code);}
 process.on('SIGINT',()=>void cleanup());process.on('SIGTERM',()=>void cleanup());process.on('uncaughtException',e=>{void cleanup(1);process.stderr.write(`Chess stopped: ${e.message}\n`);});
}
