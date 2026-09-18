import * as THREE from 'three';
import {ease} from '../bwr-scene.js?v=1.1b';
import {timing} from '../bwr-timing.js?v=1.1b';

// Geometry guides from the real 8×8 pin lattice, not an invented tally mesh.
// Cross-sections sit at three of the scene's existing spacer elevations.
export function createFilmGrid(scene,meta){
 const cells=[],channels=[],zLevels=[-30,0,30],half=4*meta.pitch,wall=meta.channel_width/2;
 for(const [cx,cy]of meta.bundle_centers){
  for(const z of zLevels){
   for(let i=0;i<=8;i++){
    const q=(i-4)*meta.pitch;
    cells.push(cx+q,cy-half,z,cx+q,cy+half,z,cx-half,cy+q,z,cx+half,cy+q,z);
   }
   const corners=[[cx-wall,cy-wall],[cx+wall,cy-wall],[cx+wall,cy+wall],[cx-wall,cy+wall]];
   for(let i=0;i<4;i++)channels.push(...corners[i],z,...corners[(i+1)%4],z);
  }
 }
 const group=new THREE.Group();scene.add(group);
 function lines(vertices,opacity){
  const geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  const material=new THREE.LineBasicMaterial({color:0x65838c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  const line=new THREE.LineSegments(geometry,material);line.renderOrder=2;group.add(line);
  return {material,opacity};
 }
 const layers=[lines(cells,.095),lines(channels,.15)];
 return {update(p){
  const reveal=ease(.465,.575,p)*(1-ease(...timing.neutronFade,p));
  group.visible=reveal>.001;
  for(const {material,opacity}of layers)material.opacity=opacity*reveal;
 }};
}
