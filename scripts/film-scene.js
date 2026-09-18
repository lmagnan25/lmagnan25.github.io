import * as THREE from 'three';
import {timing} from '../bwr-timing.js?v=1.1b';
import {filmDuration,filmSceneAtTime,filmTimeAtScene} from './film-timing.js';
import {createFilmGrid} from './film-grid.js';
import {createEntranceBlend} from './film-entrances.js';
import {createBWR,ease} from '../bwr-scene.js?v=1.1b';
import {createNeutrons} from '../bwr-neutrons.js?v=1.1b';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
// Offline film renderer: same scene and recorded paths, deterministic frame clock.
const clamp=v=>Math.min(1,Math.max(0,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const meta=(await (await fetch('assets/bwr/manifest.json')).json()).geometry;
const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.localClippingEnabled=true;
const scene=new THREE.Scene();scene.background=new THREE.Color('#05070a');
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.08,4000);camera.up.set(0,0,1);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.65,.65,.5);composer.addPass(bloom);composer.addPass(new OutputPass());
const entrances=createEntranceBlend(renderer,composer,innerWidth,innerHeight);
const reactor=createBWR(scene,renderer,meta,{rigidSpacerArrival:true,assembledFade:true}),neutrons=await createNeutrons(scene,renderer);
const grid=createFilmGrid(scene,meta);
  const shots = [
    {p:0, r:17, angle:-1.15, z:5, x:reactor.featured.x,y:reactor.featured.y,targetZ:0},
    {p:.085,r:13,angle:-.75,z:3,x:reactor.featured.x,y:reactor.featured.y,targetZ:0},
    {p:.115,r:18,angle:-.75,z:4,x:reactor.featured.x,y:reactor.featured.y,targetZ:0},
    {p:.19,r:245,angle:-.78,z:30,x:0,y:0,targetZ:1},
    {p:.22,r:245,angle:-.78,z:30,x:0,y:0,targetZ:1},
    {p:.245,r:245,angle:-.83,z:65,x:0,y:0,targetZ:0},
    {p:.27,r:245,angle:-.83,z:95,x:0,y:0,targetZ:2},
    {p:.302,r:330,angle:-.84,z:136,x:0,y:0,targetZ:4},
    {p:.37,r:445,angle:-.88,z:162,x:0,y:0,targetZ:8},
    {p:.405,r:420,angle:-.83,z:140,x:0,y:0,targetZ:17},
    // Hold the built vessel while its materials dissolve; push in afterward.
    {p:.465,r:420,angle:-.83,z:140,x:0,y:0,targetZ:17},
    {p:.585,r:94,angle:-.65,z:20,x:0,y:0,targetZ:0},
    {p:.75,r:90,angle:-.52,z:16,x:0,y:0,targetZ:0},
    {p:.86,r:90,angle:-.48,z:16,x:0,y:0,targetZ:0},
    {p:1,r:90,angle:-.48,z:16,x:0,y:0,targetZ:0}
  ];
  const target = new THREE.Vector3();
  function moveCamera(progress) {
    let a=shots[0],b=shots[1];
    for(let i=0;i<shots.length-1;i++)if(progress>=shots[i].p){a=shots[i];b=shots[i+1];}
    const t=ease(a.p,b.p,progress),mix=key=>THREE.MathUtils.lerp(a[key],b[key],t);
    const mobile=false;
    const r=Math.exp(THREE.MathUtils.lerp(Math.log(a.r),Math.log(b.r),t))*(mobile?THREE.MathUtils.lerp(1.65,1.38,ease(.405,.5,progress)):1);
    camera.position.set(mix('x')+r*Math.cos(mix('angle')),mix('y')+r*Math.sin(mix('angle')),mix('z'));
    target.set(mix('x'),mix('y'),mix('targetZ'));camera.lookAt(target);
  }

// A clean registered dissolve: blend two complete images, instead of turning
// hundreds of overlapping rods transparent and exposing their back surfaces.
moveCamera(.405);reactor.update(.405);grid.update(.405);neutrons.update(-1,0);
bloom.strength=.20;bloom.threshold=.9;composer.render();
const assembledFrame=new THREE.FramebufferTexture(innerWidth,innerHeight);
renderer.copyFramebufferToTexture(assembledFrame);
const dissolvePass=new ShaderPass({
 uniforms:{tDiffuse:{value:null},assembled:{value:null},hold:{value:0}},
 vertexShader:'varying vec2 uvFilm;void main(){uvFilm=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform sampler2D tDiffuse,assembled;uniform float hold;varying vec2 uvFilm;void main(){gl_FragColor=mix(texture2D(tDiffuse,uvFilm),texture2D(assembled,uvFilm),hold);}'
});
dissolvePass.uniforms.assembled.value=assembledFrame;
composer.addPass(dissolvePass);

window.filmConfig={duration:filmDuration};
window.filmTimeAtScene=filmTimeAtScene;
window.renderFilmFrame=(time)=>{
 // End after the original particle fade; portfolio content belongs to the page.
 const p=filmSceneAtTime(time);
 const now=p<timing.neutronStart?-1:clamp((p-timing.neutronStart)/(timing.neutronEnd-timing.neutronStart));
 const reveal=smooth(.435,.465,p)*(1-smooth(...timing.neutronFade,p));
 moveCamera(p);reactor.update(p);grid.update(p);const alive=neutrons.update(now,reveal);
 if(p>=.405)reactor.hideSolidGeometry();
 dissolvePass.uniforms.hold.value=p>=.405?1-ease(.405,.465,p):0;
 bloom.strength=p<.09?.65:.20;bloom.threshold=p<.09?.5:.9;
 entrances.render(p<.39?reactor.entranceLayers(p):[]);
 document.querySelector('canvas').dataset.progress=p.toFixed(5);
 return {p,alive};
};
window.renderFilmFrame(0);document.documentElement.dataset.ready='true';
