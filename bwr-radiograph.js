import * as THREE from 'three';
import {timing} from './bwr-timing.js?v=1.1b';
import {ease} from './bwr-scene.js?v=1.1b';

// A radiograph of selected existing parts: no triangle wireframe, scan grids,
// or invented instruments. The stronger core edges locate the transport volume.
export function createRadiograph(scene,meta,{shell,lids,fittings,separators,structure}){
 const group=new THREE.Group();scene.add(group);const materials=[];
 function surface(gain){
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,
   uniforms:{reveal:{value:0}},
   vertexShader:`varying vec3 n,v;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
   // Roundoff can put the dot product just above 1. A negative base raised to
   // 2.4 becomes NaN, which the bloom blur spreads into large flashing blocks.
   fragmentShader:`uniform float reveal;varying vec3 n,v;void main(){float facing=clamp(abs(dot(normalize(n),normalize(v))),0.,1.);float edge=pow(1.-facing,2.4);gl_FragColor=vec4(vec3(.38,.53,.64)*(${gain.toFixed(3)}*edge+.002),reveal);}`});
  materials.push(m);return m;
 }
 function copy(root,mat,select=()=>true){
  root.updateMatrixWorld(true);root.traverse(source=>{if(!source.isMesh||!select(source))return;
   const m=new THREE.Mesh(source.geometry,mat);m.matrixAutoUpdate=false;m.matrix.copy(source.matrixWorld);m.renderOrder=1;group.add(m);
  });
 }
 copy(shell,surface(.15));copy(lids,surface(.11));
 copy(fittings,surface(.12),m=>m.userData.radiograph||m.geometry.type==='TorusGeometry');
 copy(structure,surface(.065),m=>m.geometry.type==='ExtrudeGeometry');
 // The faint upper internals distinguish a reactor vessel from an empty tube.
 copy(separators,surface(.095),m=>m.geometry.type==='CylinderGeometry');
 copy(separators,surface(.035),m=>m.geometry.type==='TorusGeometry');
 copy(separators,surface(.025),m=>m.geometry.type==='ExtrudeGeometry');
 copy(separators,surface(.018),m=>m.geometry.type==='BoxGeometry');
 const ends=[],rails=[];
 for(const[x,y]of meta.bundle_centers){
  const corners=[[x-7,y-7],[x+7,y-7],[x+7,y+7],[x-7,y+7]];
  for(const z of meta.z_fuel)for(let i=0;i<4;i++)ends.push(...corners[i],z,...corners[(i+1)%4],z);
  for(const[cx,cy]of corners)rails.push(cx,cy,meta.z_fuel[0],cx,cy,meta.z_fuel[1]);
 }
 const lines=[];
 for(const[data,opacity]of[[ends,.23],[rails,.038]]){
  const mat=new THREE.LineBasicMaterial({color:0x7594a6,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  const line=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(data,3)),mat);line.renderOrder=2;group.add(line);lines.push({mat,opacity});
 }
 return {update(p){const reveal=ease(.399,.465,p)*(1-ease(...timing.vesselFade,p));group.visible=reveal>.001;for(const m of materials)m.uniforms.reveal.value=reveal;for(const{mat,opacity}of lines)mat.opacity=opacity*reveal;}};
}
