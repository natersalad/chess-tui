import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const dir=path.join(os.homedir(),'.local/bin'),link=path.join(dir,'chess'),target=path.join(root,'bin/chess.mjs');
fs.mkdirSync(dir,{recursive:true});try{const stat=fs.lstatSync(link);if(!stat.isSymbolicLink()||fs.realpathSync(link)!==target)throw Error('A different chess command already exists; no file was overwritten.');}catch(e){if(e.code==='ENOENT')fs.symlinkSync(target,link);else throw e;}
console.log(`Installed ${link} → ${target}\nRun: chess\nNo desktop configuration was changed.`);
