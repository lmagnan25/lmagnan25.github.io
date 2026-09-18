import * as THREE from 'three';
import {timing,scrollDistanceVh,scrollFromScene,sceneFromScroll} from './bwr-timing.js?v=1.1b';
import {createBWR, ease} from './bwr-scene.js?v=1.1b';
import {createNeutrons} from './bwr-neutrons.js?v=1.1b';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.querySelector('#reactor');
const status = document.querySelector('#load-status');
const intro = document.querySelector('.intro');
const cue = document.querySelector('#scroll-cue');
const progressBar = document.querySelector('.progress i');
const motionButton = document.querySelector('#motion');
// Keep native anchor jumps on the same compressed timeline as the scene.
document.querySelector('#journey').style.height=`${100+scrollDistanceVh}svh`;
for(const stop of document.querySelectorAll('.scroll-stop'))stop.style.top=`${scrollFromScene(Number(stop.dataset.scene))*scrollDistanceVh}svh`;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let fixedCamera = reducedMotion.matches;
let frozenProgress = .37;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

async function json(file) {
  const response = await fetch(`assets/bwr/${file}`);
  if (!response.ok) throw new Error(`Could not load ${file}`);
  return response.json();
}
async function start() {
  const manifest = await json('manifest.json');
  const meta = manifest.geometry;
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05070a');
  const camera = new THREE.PerspectiveCamera(38, 1, .08, 4000);
  camera.up.set(0, 0, 1);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .65, .65, .5);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const reactor = createBWR(scene, renderer, meta);
  let neutrons=null;
  const dataErrors={};

  // Native scroll drives one reversible sequence, from pellet assembly to the recorded transport paths.
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
    {p:.50,r:412,angle:-.73,z:114,x:0,y:0,targetZ:22},
    {p:.75,r:405,angle:-.40,z:103,x:0,y:0,targetZ:22},
    {p:.86,r:415,angle:-.30,z:110,x:0,y:0,targetZ:22},
    {p:1,r:415,angle:-.30,z:110,x:0,y:0,targetZ:22}
  ];
  const target = new THREE.Vector3();
  function moveCamera(progress) {
    let a=shots[0],b=shots[1];
    for(let i=0;i<shots.length-1;i++)if(progress>=shots[i].p){a=shots[i];b=shots[i+1];}
    const t=ease(a.p,b.p,progress),mix=key=>THREE.MathUtils.lerp(a[key],b[key],t);
    const mobile=innerWidth<700;
    const r=Math.exp(THREE.MathUtils.lerp(Math.log(a.r),Math.log(b.r),t))*(mobile?THREE.MathUtils.lerp(1.65,1.38,ease(.405,.5,progress)):1);
    camera.position.set(mix('x')+r*Math.cos(mix('angle')),mix('y')+r*Math.sin(mix('angle')),mix('z'));
    target.set(mix('x'),mix('y'),mix('targetZ'));camera.lookAt(target);
    const offset=1-smooth(0,.075,progress);
    camera.setViewOffset(innerWidth,innerHeight,mobile?0:-innerWidth*.21*offset,
      mobile?-innerHeight*.13*offset:0,innerWidth,innerHeight);
  }

  let requested = false;
  function render() {
    requested = false;
    if (document.hidden) return;
    const scrollProgress=clamp(scrollY / Math.max(1,document.documentElement.scrollHeight-innerHeight));
    const p=sceneFromScroll(scrollProgress);
    const now=p<timing.neutronStart?-1:clamp((p-timing.neutronStart)/(timing.neutronEnd-timing.neutronStart));
    const reveal=smooth(.435,.465,p)*(1-smooth(...timing.neutronFade,p));
    moveCamera(fixedCamera ? frozenProgress : p);
    reactor.update(p);
    const alive=neutrons?.update(now,reveal)||0;
    const needed=p>.42&&p<.88;
    status.textContent=needed&&dataErrors.neutrons?'Neutron paths could not load. Reload to try again.':needed&&!neutrons?'Loading neutron paths…':'';
    const ending=smooth(...timing.linksFade,p),links=document.querySelector('#destinations');
    links.hidden=ending<.01;links.inert=ending<.55;links.style.opacity=ending;
    links.style.transform='translate(-50%,-50%)';
    intro.style.opacity = fixedCamera ? 0 : 1 - smooth(.005, .055, p);
    intro.style.transform = `translateY(calc(-50% - ${smooth(0, .065, p) * 24}px))`;
    cue.style.opacity = 1 - smooth(.005, .05, p);
    progressBar.style.transform = `scaleY(${scrollProgress})`;
    bloom.strength = p<.09 ? .65 : .20;
    bloom.threshold = p<.09 ? .5 : .9;
    composer.render();
    canvas.dataset.firstFrameMs ||= performance.now().toFixed(1);
    // Readable diagnostics for verifying scroll, reverse playback and idle work.
    canvas.dataset.progress = p.toFixed(5);
    canvas.dataset.scrollProgress=scrollProgress.toFixed(5);
    canvas.dataset.neutronOpacity=reveal.toFixed(4);
    canvas.dataset.vesselOpacity=(ease(.399,.465,p)*(1-ease(...timing.vesselFade,p))).toFixed(4);
    const chapter=p<.13?'Fuel':p<.306?'Assemblies':p<.43?'Reactor':p<timing.linksFade[0]?'Neutrons':'Explore';
    document.querySelector('#chapter').textContent=p<.045?'':chapter;
    document.querySelectorAll('.chapters a').forEach(a=>a.setAttribute('aria-current',a.dataset.chapter===chapter?'step':'false'));
    canvas.dataset.alive = String(alive);
    canvas.dataset.histories = String(neutrons?.count||0);
    canvas.dataset.trails = String(neutrons?.trails||0);
    canvas.dataset.camera = camera.position.toArray().map(v=>v.toFixed(4)).join(',');
    canvas.dataset.renderCount = String(Number(canvas.dataset.renderCount || 0) + 1);
  }
  function schedule() {
    if (!requested) { requested = true; requestAnimationFrame(render); }
  }
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    schedule();
  }
  function updateMotion() {
    motionButton.setAttribute('aria-pressed', String(fixedCamera));
    motionButton.textContent = fixedCamera ? 'Resume camera' : 'Fixed camera';
    schedule();
  }
  motionButton.addEventListener('click', () => {
    if (!fixedCamera) frozenProgress = Number(canvas.dataset.progress || 0);
    fixedCamera = !fixedCamera; updateMotion();
  });
  reducedMotion.addEventListener('change', () => { fixedCamera = reducedMotion.matches; frozenProgress = .37; updateMotion(); });
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', schedule);
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    status.textContent = 'The 3D view was interrupted. Reload to continue.';
  });
  canvas.dataset.ready = 'true';
  status.textContent = '';
  updateMotion();
  resize();
  // Render the opening before downloading the later scientific data.
  // Direct chapter jumps show a useful loading state while their data arrives.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    createNeutrons(scene,renderer).then(value=>{neutrons=value;canvas.dataset.neutronsReady='true';canvas.dataset.neutronsReadyMs=performance.now().toFixed(1);schedule();}).catch(error=>{dataErrors.neutrons=error;console.error(error);schedule();});
  }));
}

start().catch(error => {
  status.textContent = 'The 3D view could not load. Please reload or return to the website using the arrow above.';
  console.error(error);
});
