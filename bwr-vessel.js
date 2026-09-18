import * as THREE from 'three';
import {sectionWall} from './bwr-hardware.js?v=1.1b';
const TAU=Math.PI*2,V=(x,y,z)=>new THREE.Vector3(x,y,z);

function annulus(outer,inner,depth,material,z){
 const shape=new THREE.Shape();shape.absarc(0,0,outer,0,TAU,false);
 const hole=new THREE.Path();hole.absarc(0,0,inner,0,TAU,true);shape.holes.push(hole);
 const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.13,bevelThickness:.13,curveSegments:72}),material);
 mesh.position.z=z;mesh.userData.radiograph=true;return mesh;
}
function head(material,direction){
 const profile=[new THREE.Vector2(41,0),new THREE.Vector2(41,2)];
 for(let i=1;i<=40;i++){const a=i/40*Math.PI/2;profile.push(new THREE.Vector2(41*Math.cos(a),2+20.5*Math.sin(a)));}
 for(let i=40;i>=0;i--){const a=i/40*Math.PI/2;profile.push(new THREE.Vector2(39*Math.cos(a),2+18.5*Math.sin(a)));}
 profile.push(new THREE.Vector2(39,0),new THREE.Vector2(41,0));
 const geo=new THREE.LatheGeometry(profile,112).rotateX(direction*Math.PI/2);
 return new THREE.Mesh(geo,material);
}
function stud(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);return m;}

export function buildVessel(shell,lids,fittings,shellMat,ringMat){
 const wallMat=shellMat.clone();
 const nozzleSpecs=[{angle:.69,z:103,r:3.8},{angle:4.56,z:103,r:3.8},{angle:.69,z:74,r:2.3},{angle:4.56,z:74,r:2.3}];
 // Cut bores through the upper illustrative wall where the short nozzles join.
 // The unchanged OpenMC transport slab ends at z=60, below these features.
 wallMat.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vesselLocal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvesselLocal=position;');
  const cuts=nozzleSpecs.map(({angle,z,r})=>`if(dot(vesselLocal.xy,vec2(${Math.cos(angle)},${Math.sin(angle)}))>34. && length(vec2(dot(vesselLocal.xy,vec2(${-Math.sin(angle)},${Math.cos(angle)})),vesselLocal.z-${z+75}.))<${r-.58})discard;`).join('\n');
  shader.fragmentShader='varying vec3 vesselLocal;\n'+shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>\n${cuts}`);
 };
 wallMat.customProgramCacheKey=()=> 'bwr-wall-bores-v11';
 const wall=sectionWall(41,39,195,wallMat,.48,Math.PI*1.4);wall.position.z=-75;shell.add(wall);
 // A machined mating pair at the removable top, not toroidal rings at both ends.
 shell.add(annulus(44.2,39,2.1,ringMat,117.75));
 fittings.add(annulus(44.2,39,2.1,ringMat,120.15));
 const seal=annulus(42.8,39,.24,shellMat,119.92);shell.add(seal);
 for(const[z,direction]of[[-75,-1],[120,1]]){
  const cap=head(shellMat,direction);cap.position.z=z;lids.add(cap);
 }
 const shaftGeo=new THREE.CylinderGeometry(.46,.46,5.9,16).rotateX(Math.PI/2);
 const nutGeo=new THREE.CylinderGeometry(.82,.82,1.05,6).rotateX(Math.PI/2);
 const washerGeo=new THREE.CylinderGeometry(.92,.92,.20,28).rotateX(Math.PI/2);
 for(let i=0;i<28;i++){
  const a=i/28*TAU,x=42.5*Math.cos(a),y=42.5*Math.sin(a);
  fittings.add(stud(shaftGeo,ringMat,x,y,122.6),stud(washerGeo,ringMat,x,y,122.45),stud(nutGeo,ringMat,x,y,123.05));
 }
 // Integral lower head: a restrained weld seam instead of a second bolted lid.
 const weld=new THREE.Mesh(new THREE.TorusGeometry(41,.22,8,112),shellMat);weld.position.z=-75;shell.add(weld);
 for(const{angle,z,r}of nozzleSpecs){
  const axis=V(Math.cos(angle),Math.sin(angle),0),nozzle=new THREE.Group();nozzle.position.set(axis.x*39,axis.y*39,z);
  nozzle.quaternion.setFromUnitVectors(V(0,0,1),axis);
  const profile=[[r,0],[r+.75,1.8],[r+.68,3],[r+.05,5],[r,8.2],[r-.18,8.4],[r-.58,8.4],[r-.58,0],[r,0]].map(p=>new THREE.Vector2(...p));
  const tube=new THREE.Mesh(new THREE.LatheGeometry(profile,64).rotateX(Math.PI/2),shellMat);nozzle.add(tube);
  const lip=annulus(r,r-.58,.24,ringMat,8.14);nozzle.add(lip);shell.add(nozzle);
 }
 return {wallMat};
}
