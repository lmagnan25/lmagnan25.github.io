import * as THREE from 'three';
const clamp=THREE.MathUtils.clamp;

// The viewer's soft additive marks and energy palette, applied to this BWR's
// own OpenMC records. All bends below come from recorded straight segments.
const ramp=`vec3 energyColor(float e){
 vec3 c=mix(vec3(.14,.32,.58),vec3(.36,.57,.76),smoothstep(-1.6,1.5,e));
 c=mix(c,vec3(.79,.86,.89),smoothstep(1.5,5.,e));
 c=mix(c,vec3(.95,.69,.40),smoothstep(5.,6.4,e));
 return mix(c,vec3(.83,.33,.21),smoothstep(6.7,7.1,e));}`;
export async function createNeutrons(scene,renderer){
 const response=await fetch('assets/bwr/event.json');if(!response.ok)throw Error('Neutron metadata unavailable');
 const event=await response.json();
 const [xyz,loge]=await Promise.all(['xyz','loge'].map(async key=>{
  const r=await fetch(`assets/bwr/${event.buffers[key].file}`);if(!r.ok)throw Error('Neutron paths unavailable');return new Float32Array(await r.arrayBuffer());
 }));
 const {offsets,counts}=event,N=event.n_particles,clock=new Float32Array(event.n_states),duration=new Float64Array(N);
 for(let p=0;p<N;p++){
  const o=offsets[p],n=counts[p];
  for(let k=1;k<n;k++){
   const j=o+k,a=(j-1)*3,b=j*3,d=Math.hypot(xyz[b]-xyz[a],xyz[b+1]-xyz[a+1],xyz[b+2]-xyz[a+2]);
   const speed=1.3831e6*Math.sqrt(10**loge[j-1]);
   clock[j]=clock[j-1]+d/(2.2e5*(speed/2.2e5)**.3);
  }
  duration[p]=clock[o+n-1];
 }
 const sorted=Array.from(duration).filter(d=>d>0).sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)];
 // Independent histories are staggered for presentation. Within each history,
 // retain speed-compressed relative flight times; there is no claimed genealogy.
 for(let p=0;p<N;p++){
  const o=offsets[p],d=duration[p],span=clamp(.060*(d/median)**.4,.012,.16),begin=.84*((p*.61803398875)%1);
  for(let k=0;k<counts[p];k++)clock[o+k]=begin+(d>0?clock[o+k]/d:0)*span;
 }
 const headPositions=new Float32Array(N*3),headEnergy=new Float32Array(N),headGain=new Float32Array(N);
 const headGeo=new THREE.BufferGeometry();
 for(const[name,array,size]of[['position',headPositions,3],['energy',headEnergy,1],['gain',headGain,1]])headGeo.setAttribute(name,new THREE.BufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));
 const headMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{pixelRatio:{value:renderer.getPixelRatio()},reveal:{value:0}},
  vertexShader:`attribute float energy,gain;uniform float pixelRatio;varying float e,g;void main(){e=energy;g=gain;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(4.1*300./-mv.z,1.8,6.)*pixelRatio;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float reveal;varying float e,g;${ramp}void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float core=1.-smoothstep(.08,1.,d);vec3 color=mix(energyColor(e),vec3(.94,.97,1.),.20*pow(1.-d,3.));gl_FragColor=vec4(color*core*.78,g*reveal);}`});
 const heads=new THREE.Points(headGeo,headMat);heads.frustumCulled=false;heads.renderOrder=4;scene.add(heads);
 const maxSegments=18,capacity=N*maxSegments*2;
 const tailPositions=new Float32Array(capacity*3),tailEnergy=new Float32Array(capacity),tailAge=new Float32Array(capacity);
 const tailGeo=new THREE.BufferGeometry();
 for(const[name,array,size]of[['position',tailPositions,3],['energy',tailEnergy,1],['age',tailAge,1]])tailGeo.setAttribute(name,new THREE.BufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));
 const tailMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{reveal:{value:0}},
  vertexShader:`attribute float energy,age;varying float e,a;void main(){e=energy;a=age;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float reveal;varying float e,a;${ramp}void main(){float glow=exp(-a*2.8)*(1.-smoothstep(.6,1.,a));gl_FragColor=vec4(energyColor(e)*.50,glow*reveal);}`});
 const tails=new THREE.LineSegments(tailGeo,tailMat);tails.frustumCulled=false;tails.renderOrder=3;scene.add(tails);
 function writeVertex(j,f,age){
  const o=j*3,i=vertices*3;for(let k=0;k<3;k++)tailPositions[i+k]=THREE.MathUtils.lerp(xyz[o+k],xyz[o+3+k],f);
  tailEnergy[vertices]=loge[j];tailAge[vertices++]=age;
 }
 let vertices=0;
 return {count:N,trails:N,update(now,reveal){
  heads.visible=tails.visible=reveal>.001;headMat.uniforms.reveal.value=tailMat.uniforms.reveal.value=reveal;
  if(reveal<=.001)return 0;
  let alive=0;vertices=0;
  for(let p=0;p<N;p++){
   const o=offsets[p],n=counts[p],start=clock[o],end=clock[o+n-1],tailWindow=Math.min(.009,(end-start)*.12);
   if(n<2||now<start||now>end+tailWindow)continue;
   let lo=0,hi=n-1;
   while(hi-lo>1){const mid=(hi+lo)>>1;if(clock[o+mid]<=now)lo=mid;else hi=mid;}
   const j=o+lo,delta=clock[j+1]-clock[j],f=delta>0?clamp((now-clock[j])/delta,0,1):1;
   if(now<end){
    for(let k=0;k<3;k++)headPositions[alive*3+k]=THREE.MathUtils.lerp(xyz[j*3+k],xyz[(j+1)*3+k],f);
    headEnergy[alive]=loge[j];headGain[alive++]=Math.min(1,(now-start)/.0007,(end-now)/.0007);
   }
   for(let seg=j;seg>=o&&seg>j-maxSegments;seg--){
    const a=clock[seg],b=clock[seg+1];if(b<now-tailWindow)break;if(b<=a)continue;
    const first=clamp((now-tailWindow-a)/(b-a),0,1),last=clamp((now-a)/(b-a),0,1);if(last<=first)continue;
    writeVertex(seg,first,(now-THREE.MathUtils.lerp(a,b,first))/tailWindow);
    writeVertex(seg,last,(now-THREE.MathUtils.lerp(a,b,last))/tailWindow);
   }
  }
  headGeo.setDrawRange(0,alive);tailGeo.setDrawRange(0,vertices);
  for(const a of Object.values(headGeo.attributes)){a.clearUpdateRanges();a.addUpdateRange(0,alive*a.itemSize);a.needsUpdate=true;}
  for(const a of Object.values(tailGeo.attributes)){a.clearUpdateRanges();a.addUpdateRange(0,vertices*a.itemSize);a.needsUpdate=true;}
  return alive;
 }};
}
