import {gltfSummary,glbSummary,classify,extension,MAX_FILE} from './core.js';
// Validate bytes before catalog registration. Multi-file glTF dependencies are intentionally
// rejected until a dependency-aware archive installer is implemented.
export function inspectImportedBytes(filename,buffer){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength===0||buffer.byteLength>MAX_FILE)throw Error('Fichier vide ou trop volumineux.');
 const kind=classify(filename),ext=extension(filename),bytes=new Uint8Array(buffer);
 let info={};
 if(kind==='model')info=ext==='gltf'?gltfSummary(new TextDecoder('utf-8',{fatal:true}).decode(buffer)):glbSummary(buffer);
 if(ext==='png'&&!(bytes.length>=24&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)))throw Error('Signature PNG invalide.');
 if(ext==='webp'&&!(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'))throw Error('Signature WebP invalide.');
 if(ext==='jpg'||ext==='jpeg')if(!(bytes.length>=4&&bytes[0]===255&&bytes[1]===216&&bytes[bytes.length-2]===255&&bytes[bytes.length-1]===217))throw Error('Signature JPEG invalide.');
 if(ext==='gif'&&!(bytes.length>=6&&['GIF87a','GIF89a'].includes(new TextDecoder().decode(bytes.subarray(0,6)))))throw Error('Signature GIF invalide.');
 if(ext==='svg'){const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(!/^\s*(?:<\?xml[^>]*>\s*)?<svg(?:\s|>)/i.test(content)||/<script\b|\bon\w+\s*=|<foreignObject\b|(?:href|src)\s*=\s*["'](?:https?:|javascript:|data:)/i.test(content))throw Error('SVG incompatible ou potentiellement actif.');}
 return {kind,...info,bytes:buffer.byteLength};
}
