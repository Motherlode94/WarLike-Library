// Builtin Library files only. Personal resources are read from their stored Blob.
export function safeCatalogPath(path){return typeof path==='string'&&!path.includes('..')&&/^\.\/assets\/(?:[a-z0-9_.-]+\/)*[a-z0-9_. -]+\.(glb|gltf|svg|png|jpg|jpeg|webp|ogg|wav|js|wls|ts|cs|py|cpp|h|md|txt|json)$/i.test(path)?path:null;}
