import * as THREE from 'three';
import {ease} from './bwr-scene.js?v=steam3';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),frac=x=>x-Math.floor(x),TAU=Math.PI*2;
export function createSteam(scene){
 const bubbles=new THREE.Group();scene.add(bubbles);
 const count=84,ages=new Float32Array(count),bubbleGeometry=new THREE.SphereGeometry(1,24,16);
 bubbleGeometry.setAttribute('age',new THREE.InstancedBufferAttribute(ages,1));
 const bubbleMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{gain:{value:0}},
  vertexShader:`attribute float age;varying vec3 n,v;varying float life;void main(){life=age;
   vec3 p=position;float wobble=.018*age*sin(p.y*7.+age*13.)*sin(p.z*5.-age*9.);p*=1.+wobble;
   vec4 mv=modelViewMatrix*instanceMatrix*vec4(p,1.);vec3 scale=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
   n=normalize(normalMatrix*mat3(instanceMatrix)*(normal/(scale*scale)));v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float gain;varying vec3 n,v;varying float life;void main(){vec3 N=normalize(n),V=normalize(v);float rim=pow(1.-abs(dot(N,V)),2.8);
   float highlight=pow(max(dot(reflect(-normalize(vec3(-.55,.25,.8)),N),V),0.),90.);
   float lower=pow(max(dot(N,normalize(vec3(.3,-.4,-.85))),0.),15.);
   vec3 c=mix(vec3(.04,.08,.10),vec3(.90,.94,.95),rim*.85+highlight)+vec3(.12,.19,.22)*lower;
   gl_FragColor=vec4(c,(.035+rim*.78+highlight*.5+lower*.14)*gain);}`});
 const spheres=new THREE.InstancedMesh(bubbleGeometry,bubbleMaterial,count);spheres.frustumCulled=false;bubbles.add(spheres);
 const object=new THREE.Object3D();
 const pipeCurve=new THREE.CatmullRomCurve3([[38,0,109],[61,0,109],[74,-2,117],[79,-10,132],[82,-22,141],[83,-43,145]].map(p=>V(...p)),false,'centripetal');
 const pipe=new THREE.Group();scene.add(pipe);
 const metal=new THREE.MeshStandardMaterial({color:0x65757b,metalness:.72,roughness:.35,side:THREE.DoubleSide,transparent:true});
 // Longitudinally opened pipe, with wall thickness and an honest connected nozzle.
 const samples=160,segments=36,frames=pipeCurve.computeFrenetFrames(samples,false),positions=[],indices=[];
 const span=Math.PI*1.53,view=V(.65,-1,.3).normalize();
 for(const radius of[3.1,2.72])for(let i=0;i<=samples;i++){
  const c=pipeCurve.getPoint(i/samples),n=frames.normals[i],b=frames.binormals[i];
  for(let j=0;j<=segments;j++){const opening=Math.atan2(view.dot(b),view.dot(n)),a=opening+(TAU-span)/2+span*j/segments,p=c.clone().addScaledVector(n,Math.cos(a)*radius).addScaledVector(b,Math.sin(a)*radius);positions.push(...p.toArray());}
 }
 const stride=segments+1,layer=(samples+1)*stride;
 for(let i=0;i<samples;i++)for(let j=0;j<segments;j++)for(let side=0;side<2;side++){
  const a=side*layer+i*stride+j,b=a+stride,c=a+1,d=b+1;indices.push(a,b,c,b,d,c);
 }
 for(let i=0;i<samples;i++)for(const j of[0,segments]){const a=i*stride+j,b=a+stride;indices.push(a,a+layer,b,b,a+layer,b+layer);}
 for(const i of[0,samples])for(let j=0;j<segments;j++){const a=i*stride+j,b=a+1;indices.push(a,b,a+layer,b,b+layer,a+layer);}
 const pipeGeo=new THREE.BufferGeometry();pipeGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));pipeGeo.setIndex(indices);pipeGeo.computeVertexNormals();pipe.add(new THREE.Mesh(pipeGeo,metal));
 for(const t of[0,.25,1]){
  const at=pipeCurve.getPoint(t),direction=pipeCurve.getTangent(t);
  const flange=new THREE.Mesh(new THREE.TorusGeometry(3.4,.35,12,48),metal);flange.position.copy(at);flange.quaternion.setFromUnitVectors(V(0,0,1),direction);pipe.add(flange);
  if(t<1)for(let k=0;k<8;k++){
   const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.7,6).rotateX(Math.PI/2),metal),f=frames.normals[Math.floor(t*samples)],b=frames.binormals[Math.floor(t*samples)],angle=k/8*TAU;
   bolt.position.copy(at).addScaledVector(f,Math.cos(angle)*3.4).addScaledVector(b,Math.sin(angle)*3.4);bolt.quaternion.copy(flange.quaternion);pipe.add(bolt);
  }
 }
 const steamRoute=new THREE.CatmullRomCurve3([[15.6,-15.6,78],[13,-9,91],[19,-3,104],[38,0,109],[61,0,109],[74,-2,117],[79,-10,132],[82,-22,141],[83,-43,145]].map(p=>V(...p)),false,'centripetal');
 const mistCount=560,pointPositions=new Float32Array(mistCount*3),sizes=new Float32Array(mistCount),opacities=new Float32Array(mistCount),seeds=new Float32Array(mistCount);
 const mistGeo=new THREE.BufferGeometry();for(const[name,data,size]of[['position',pointPositions,3],['size',sizes,1],['opacity',opacities,1],['seed',seeds,1]])mistGeo.setAttribute(name,new THREE.BufferAttribute(data,size).setUsage(THREE.DynamicDrawUsage));
 const mistMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pixelRatio:{value:Math.min(devicePixelRatio,1.6)},phase:{value:0}},
  vertexShader:`attribute float size,opacity,seed;uniform float pixelRatio;varying float alpha,id;void main(){alpha=opacity;id=seed;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*700./-mv.z,1.,190.)*pixelRatio;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float alpha,id;uniform float phase;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
   void main(){vec2 uv=gl_PointCoord*2.-1.;float r=dot(uv,uv);if(r>1.)discard;vec2 q=uv*2.4+vec2(id*9.,phase*.6);float f=.55*noise(q)+.28*noise(q*2.1)+.17*noise(q*4.2);float density=smoothstep(.2,.78,f)*pow(1.-r,1.7);gl_FragColor=vec4(mix(vec3(.29,.38,.42),vec3(.78,.83,.84),f),density*alpha);}`});
 const mist=new THREE.Points(mistGeo,mistMaterial);mist.frustumCulled=false;scene.add(mist);
 const point=V(0,0,0),normal=V(0,0,0),binormal=V(0,0,0),tangent=V(0,0,0);
 function update(p){
  const growth=ease(.688,.707,p),rise=ease(.744,.838,p),bubbleFade=1-ease(.816,.842,p),endFade=1-ease(.941,.982,p);
  bubbles.visible=p>.688&&p<.843;bubbleMaterial.uniforms.gain.value=growth*bubbleFade;
  if(bubbles.visible)for(let i=0;i<count;i++){
   const cx=i%2?.815:-.815,cy=Math.floor(i/2)%2?.815:-.815;
   const clock=(Math.min(p,.744)-.688)*18,t=frac(clock+i*.61803398875),detach=ease(.16,.36,t),seed=frac(i*.75487),maxRadius=.065+.065*seed;
   const size=(.017+maxRadius*ease(0,.35,t))*(.96+.08*Math.sin(t*9+i));
   const angle=Math.atan2(-cy,-cx)+Math.sin(i*2.39)*.13,r=.61+size+detach*.13;
   let x=20.49+cx+Math.cos(angle)*r,y=-20.49+cy+Math.sin(angle)*r,z=12.5+seed*1.8+t*7+rise*67;
   const gather=ease(52,65,z);x=THREE.MathUtils.lerp(x,15.6+(x-20.49)*.65,gather);y=THREE.MathUtils.lerp(y,-15.6+(y+20.49)*.65,gather);
   x+=Math.sin(t*11+i)*.018*detach;y+=Math.cos(t*9+i)*.012*detach;
   object.position.set(x,y,z);object.rotation.set(Math.sin(i)*.12*t,Math.cos(i)*.1*t,0);object.scale.set(size*(1+.17*t),size*(1+.06*t),size*(1-.18*t));object.updateMatrix();spheres.setMatrixAt(i,object.matrix);ages[i]=t;
  }
  if(bubbles.visible){spheres.instanceMatrix.needsUpdate=true;bubbleGeometry.attributes.age.needsUpdate=true;}
  const pipeGain=ease(.815,.849,p)*endFade;pipe.visible=pipeGain>.001;metal.opacity=pipeGain;metal.depthWrite=pipeGain>.99;
  const steamGain=ease(.808,.838,p),front=ease(.817,.922,p),outlet=ease(.918,.95,p);let n=0;
  if(steamGain>0){
   for(let i=0;i<320;i++){
    const t=frac((p-.815)*2.4+i*.61803399);if(t>front)continue;
    steamRoute.getPoint(t,point);steamRoute.getTangent(t,tangent);normal.crossVectors(tangent,V(0,0,1)).normalize();binormal.crossVectors(tangent,normal).normalize();
    const a=i*2.39996,r=(.6+frac(i*.4142)*1.2);point.addScaledVector(normal,Math.cos(a)*r).addScaledVector(binormal,Math.sin(a)*r);
    pointPositions.set(point.toArray(),n*3);sizes[n]=2.4+frac(i*.78)*2.7;opacities[n]=.55*steamGain*endFade;seeds[n]=frac(i*.321);n++;
   }
   const mouth=pipeCurve.getPoint(1),direction=pipeCurve.getTangent(1),side=V(1,0,0);
   for(let i=0;i<240;i++){
    const t=frac((p-.918)*4.2+i*.61803399);if(t>outlet)continue;
    const spread=t*t*18,branch=i%2?1:-1;
    point.copy(mouth).addScaledVector(direction,t*42).addScaledVector(side,branch*spread+Math.sin(i*2.4+t*8)*t*5);point.z+=t*t*16+Math.sin(i*1.7)*t*5;
    pointPositions.set(point.toArray(),n*3);sizes[n]=3.2+t*18;opacities[n]=outlet*(.45-.26*t)*(1-ease(.982,1,p));seeds[n]=frac(i*.713);n++;
   }
  }
  mist.visible=n>0;mistGeo.setDrawRange(0,n);for(const a of Object.values(mistGeo.attributes))a.needsUpdate=true;mistMaterial.uniforms.phase.value=p*17;
  return {sceneFade:endFade};
 }
 return {update,pipeCurve};
}
