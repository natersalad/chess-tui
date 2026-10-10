import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
for(const dir of ['src','bin','extension','scripts','test'])for(const file of fs.readdirSync(dir)){if(/\.(mjs|js)$/.test(file))execFileSync(process.execPath,['--check',`${dir}/${file}`],{stdio:'inherit'});}
const m=JSON.parse(fs.readFileSync('extension/manifest.json'));for(const file of ['background.js',m.options_page,...m.content_scripts.flatMap(x=>x.js)])if(!fs.existsSync(`extension/${file}`))throw Error(`Missing ${file}`);
console.log('All JS syntax and extension assets checked.');
