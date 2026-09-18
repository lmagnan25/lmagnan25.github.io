import * as THREE from 'three';

// Fine, deterministic ceramic texture. No chips, grime or invented damage.
export function createPelletMaterial(){
 const n=256,data=new Uint8Array(n*n*4);let state=330449;
 function random(){state=(1664525*state+1013904223)>>>0;return state/4294967296;}
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const grain=random(),pore=grain>.985?-.20:0,value=Math.round(150+18*(grain-.5)+pore*100);
  const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
 return new THREE.MeshPhysicalMaterial({color:0x3e403d,metalness:0,roughness:.53,ior:1.8,specularIntensity:.5,
  envMapIntensity:.68,bumpMap:texture,bumpScale:.0013,transparent:true,opacity:1,depthWrite:false});
}

export function createPelletGeometry(){
 // Shallow dishes, a flat bearing land and a narrow rounded chamfer.
 // Preserve the existing 0.52 cm outer radius and 1.00 cm overall height.
 const half=[[0,.468],[.08,.469],[.16,.476],[.24,.488],[.31,.498],[.335,.5],[.474,.5],[.489,.489],[.510,.464],[.52,.449]];
 const profile=[...half.map(([r,z])=>new THREE.Vector2(r,-z)),...half.slice().reverse().map(([r,z])=>new THREE.Vector2(r,z))];
 return new THREE.LatheGeometry(profile,80).rotateX(Math.PI/2);
}
