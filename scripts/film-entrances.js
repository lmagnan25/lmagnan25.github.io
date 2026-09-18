import * as THREE from 'three';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

// Blend complete opaque renders so arriving hardware gradually takes its place
// without exposing bright back faces or changing the physical part dimensions.
export function createEntranceBlend(renderer,composer,width,height){
 const accumulated=new THREE.FramebufferTexture(width,height);
 const pass=new ShaderPass({
  uniforms:{tDiffuse:{value:null},previous:{value:null},currentWeight:{value:1}},
  vertexShader:'varying vec2 filmUV;void main(){filmUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse,previous;uniform float currentWeight;varying vec2 filmUV;
   void main(){vec4 current=texture2D(tDiffuse,filmUV);if(currentWeight>=1.){gl_FragColor=current;}else{gl_FragColor=mix(texture2D(previous,filmUV),current,currentWeight);}}`
 });
 pass.uniforms.previous.value=accumulated;
 composer.addPass(pass);
 return {render(layers=[]){
  pass.uniforms.currentWeight.value=1;
  composer.render();
  if(!layers.length)return;
  renderer.copyFramebufferToTexture(accumulated);
  let weight=1-layers[0].gain;
  for(let i=0;i<layers.length;i++){
   for(const root of layers[i].roots)root.visible=true;
   const portion=layers[i].gain-(layers[i+1]?.gain||0);
   weight+=portion;
   if(portion<=0)continue;
   pass.uniforms.currentWeight.value=portion/weight;
   composer.render();
   renderer.copyFramebufferToTexture(accumulated);
  }
 }};
}
