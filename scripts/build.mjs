import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await cp('study','dist',{recursive:true});
