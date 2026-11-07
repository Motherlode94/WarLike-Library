import {safeCatalogPath} from './catalog-path.js';
import {readAll,openStore} from './storage.js';
import {mergeLibrary} from './core.js';
export async function libraryAssets(){const response=await fetch('./assets/catalog.json');if(!response.ok)throw Error('Catalogue indisponible.');const catalog=await response.json();await openStore();return mergeLibrary(catalog,await readAll()).filter(a=>!a.deleted);}
export async function resourceBytes(asset){if(asset.blob instanceof Blob)return asset.blob.arrayBuffer();if(!safeCatalogPath(asset.url))throw Error('Fichier Library absent.');const r=await fetch(asset.url,{credentials:'same-origin'});if(!r.ok)throw Error('Fichier inaccessible : HTTP '+r.status);return r.arrayBuffer();}
