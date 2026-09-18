import * as THREE from 'three';
import {ease} from './bwr-scene.js?v=field8';
import {bar, cylinderZ} from './bwr-hardware.js?v=field8';
const V=(x,y,z)=>new THREE.Vector3(x,y,z), frac=x=>x-Math.floor(x);
const stops=[[0,0x183d64],[.22,0x267f98],[.44,0x75a99d],[.65,0xc8bc76],[.82,0xd78744],[1,0xa53e29]].map(([t,c])=>[t,new THREE.Color(c)]);
function color(t){t=THREE.MathUtils.clamp(t,0,1);for(let i=1;i<stops.length;i++)if(t<=stops[i][0])return stops[i-1][1].clone().lerp(stops[i][1],(t-stops[i-1][0])/(stops[i][0]-stops[i-1][0]));return stops.at(-1)[1].clone();}
const ramp=`vec3 ramp(float t){
 vec3 c=mix(vec3(.009,.047,.127),vec3(.019,.212,.314),smoothstep(0.,.22,t));
 c=mix(c,vec3(.178,.397,.337),smoothstep(.22,.44,t));
 c=mix(c,vec3(.578,.503,.181),smoothstep(.44,.65,t));
 c=mix(c,vec3(.68,.242,.058),smoothstep(.65,.82,t));
 return mix(c,vec3(.376,.048,.022),smoothstep(.82,1.,t));}`;
async function buffer(name){const r=await fetch(`assets/bwr/${name}`);if(!r.ok)throw Error(`Could not load ${name}`);return new Float32Array(await r.arrayBuffer());}
async function meta(name){const r=await fetch(`assets/bwr/${name}`);if(!r.ok)throw Error(`Could not load ${name}`);return r.json();}

export async function createFields(scene){
 const [field,fieldMeta,temp,velocity,channelMeta]=await Promise.all([buffer('fission-field.bin'),meta('field.json'),buffer('channel-temperature.bin'),buffer('channel-velocity.bin'),meta('channel.json')]);
 const root=new THREE.Group();scene.add(root);
 // Exposed cell faces retain the tally's spatial texture. A quadrant is cut away.
 const scale=2*field.reduce((sum,v)=>sum+v,0)/field.length;
 const [nx,ny,nz]=fieldMeta.dimension, lo=fieldMeta.lower_left, hi=fieldMeta.upper_right;
 const dx=(hi[0]-lo[0])/nx,dy=(hi[1]-lo[1])/ny,dz=(hi[2]-lo[2])/nz;
 const active=(x,y,z)=>x>=0&&x<nx&&y>=0&&y<ny&&z>=0&&z<nz&&!(x>=nx/2&&y<ny/2)&&field[x+nx*(y+ny*z)]>fieldMeta.maximum*.012;
 const pos=[],rgb=[],shades=[];
 const faces=[[[1,0,0],[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],.94],[[-1,0,0],[[0,1,0],[0,0,0],[0,0,1],[0,1,1]],.7],[[0,1,0],[[1,1,0],[0,1,0],[0,1,1],[1,1,1]],.77],[[0,-1,0],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],1],[[0,0,1],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],1.08],[[0,0,-1],[[0,1,0],[1,1,0],[1,0,0],[0,0,0]],.6]];
 for(let z=0;z<nz;z++)for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(active(x,y,z)){
  const t=field[x+nx*(y+ny*z)]/scale;
  for(const[d,vertices,light]of faces)if(!active(x+d[0],y+d[1],z+d[2])){
   const c=color(t).multiplyScalar(light);
   for(const i of[0,1,2,0,2,3]){const q=vertices[i];pos.push(lo[0]+(x+q[0])*dx,lo[1]+(y+q[1])*dy,lo[2]+(z+q[2])*dz);rgb.push(c.r,c.g,c.b);shades.push(light);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(rgb,3));
 g.setAttribute('shade',new THREE.Float32BufferAttribute(shades,1));
 const coreTexture=new THREE.Data3DTexture(field,nx,ny,nz);coreTexture.format=THREE.RedFormat;coreTexture.type=THREE.FloatType;coreTexture.minFilter=coreTexture.magFilter=THREE.LinearFilter;coreTexture.unpackAlignment=1;coreTexture.needsUpdate=true;
 const fieldMat=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms:{field:{value:coreTexture},scale:{value:scale},gain:{value:0}},
  vertexShader:`attribute float shade;varying vec3 q;varying float lighting;void main(){q=position;lighting=shade;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`precision highp sampler3D;uniform sampler3D field;uniform float scale,gain;varying vec3 q;varying float lighting;${ramp}
   void main(){vec3 uv=vec3(q.xy/46.8+.5,q.z/120.+.5);float t=clamp(texture(field,clamp(uv,vec3(.017,.017,.0125),vec3(.983,.983,.9875))).r/scale,0.,1.);
   gl_FragColor=vec4(ramp(t)*lighting*1.22,gain);}`});
 const core=new THREE.Mesh(g,fieldMat);root.add(core);
 const box=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(46.8,46.8,120)),new THREE.LineBasicMaterial({color:0x65808c,transparent:true,opacity:.17}));root.add(box);

 // A resolved four-rod passage in the front bundle; identical pitch and radius.
 const channel=new THREE.Group();channel.position.set(20.49,-20.49,12);scene.add(channel);
 const metal=new THREE.MeshStandardMaterial({color:0x879395,metalness:.68,roughness:.39,transparent:true});
 const dark=metal.clone();dark.color.set(0x3d5057);
 const openRod=metal.clone();openRod.clippingPlanes=[new THREE.Plane(V(-1,1,0).normalize(),28.976225768+0.8)];
 for(const x of[-.815,.815])for(const y of[-.815,.815]){
  const material=x>.0&&y<0?openRod:metal;
  channel.add(cylinderZ(.61,9.78,material,x,y,4.89));
 }
 const edges=[];
 for(const x of[-1.63,1.63])for(const y of[-1.63,1.63])edges.push(x,y,0,x,y,9.78);
 for(const z of[0,9.78]){edges.push(-1.63,-1.63,z,1.63,-1.63,z,1.63,-1.63,z,1.63,1.63,z,1.63,1.63,z,-1.63,1.63,z,-1.63,1.63,z,-1.63,-1.63,z);}
 const boundary=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(edges,3)),new THREE.LineBasicMaterial({color:0x8ba9b0,transparent:true,opacity:.3}));channel.add(boundary);
 const [cn,cm,cz]=channelMeta.dimension;
 const texture=new THREE.Data3DTexture(temp,cn,cm,cz);texture.format=THREE.RedFormat;texture.type=THREE.FloatType;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.unpackAlignment=1;texture.needsUpdate=true;
 const temperatureMat=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,
  uniforms:{field:{value:texture},gain:{value:0},cut:{value:.5}},
  vertexShader:`varying vec3 q;void main(){q=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`precision highp sampler3D;uniform sampler3D field;uniform float gain;varying vec3 q;${ramp}
   void main(){for(int i=0;i<2;i++)for(int j=0;j<2;j++){vec2 c=vec2(float(i)*1.63-.815,float(j)*1.63-.815);if(length(q.xy-c)<.613)discard;}
    vec3 uv=vec3(q.xy/3.26+.5,q.z/9.78);float t=texture(field,clamp(uv,vec3(0.),vec3(1.))).r;
    float isoline=1.-smoothstep(.015,.035,abs(fract(t*12.+.5)-.5));
    gl_FragColor=vec4(ramp(t)*(1.-isoline*.22)*1.5,gain*.86);}`});
 // Two intersecting longitudinal cuts and a cross-section show the passage depth.
 function plane(corners){const p=[];for(const i of[0,1,2,0,2,3])p.push(...corners[i]);return new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(p,3)),temperatureMat);}
 const cuts=new THREE.Group();channel.add(cuts);
 cuts.add(plane([[-1.63,-.0,0],[1.63,-.0,0],[1.63,-.0,9.78],[-1.63,-.0,9.78]]));
 cuts.add(plane([[0,-1.63,0],[0,1.63,0],[0,1.63,9.78],[0,-1.63,9.78]]));
 cuts.add(plane([[-1.63,-1.63,7.6],[1.63,-1.63,7.6],[1.63,1.63,7.6],[-1.63,1.63,7.6]]));
 const streamPositions=new Float32Array(420*6),streamColors=new Float32Array(420*6);
 const streamsGeometry=new THREE.BufferGeometry();streamsGeometry.setAttribute('position',new THREE.BufferAttribute(streamPositions,3).setUsage(THREE.DynamicDrawUsage));streamsGeometry.setAttribute('color',new THREE.BufferAttribute(streamColors,3).setUsage(THREE.DynamicDrawUsage));
 const streamMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.5,depthWrite:false});
 const streams=new THREE.LineSegments(streamsGeometry,streamMat);streams.frustumCulled=false;channel.add(streams);
 const seeds=[];
 for(let i=0;seeds.length<420;i++){
  const u=frac(i*.61803398875),v=frac(i*.754877666),ix=Math.min(cn-1,Math.floor(u*cn)),iy=Math.min(cm-1,Math.floor(v*cm)),speed=velocity[ix+cn*iy];
  if(speed>.05)seeds.push({x:(u-.5)*3.26,y:(v-.5)*3.26,ix,iy,speed,phase:frac(i*.41421356)});
 }
 // Phase change is a subsequent illustration, spatially attached to the same rods.
 const bubbleMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{gain:{value:0}},
  vertexShader:`varying vec3 n,v;void main(){vec4 mv=modelViewMatrix*instanceMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec3 n,v;uniform float gain;void main(){vec3 N=normalize(n),V=normalize(v);float rim=pow(1.-abs(dot(N,V)),2.3);float glint=pow(max(dot(reflect(-normalize(vec3(-.4,.7,.6)),N),V),0.),45.);gl_FragColor=vec4(mix(vec3(.10,.18,.21),vec3(.80,.90,.92),rim+glint),(.06+rim*.66+glint*.28)*gain);}`});
 const bubbles=new THREE.InstancedMesh(new THREE.SphereGeometry(1,20,12),bubbleMat,100);bubbles.frustumCulled=false;channel.add(bubbles);
 const object=new THREE.Object3D();
 const legend=document.querySelector('#field-legend'),quantity=legend.querySelector('strong'),range=legend.querySelector('.range'),note=legend.querySelector('small');
 function update(p){
  const coreGain=ease(.555,.59,p)*(1-ease(.665,.699,p));root.visible=coreGain>.001;fieldMat.uniforms.gain.value=coreGain;box.material.opacity=coreGain*.18;
  const channelGain=ease(.681,.709,p)*(1-ease(.825,.847,p));channel.visible=channelGain>.001;
  const boiling=ease(.783,.807,p),thermalGain=channelGain*ease(.723,.742,p)*(1-ease(.782,.812,p));
  const crop=ease(.682,.736,p);channel.scale.z=THREE.MathUtils.lerp(120/9.78,1,crop);channel.position.z=THREE.MathUtils.lerp(-60,12,crop);
  metal.opacity=openRod.opacity=channelGain;metal.depthWrite=openRod.depthWrite=channelGain>.98;boundary.material.opacity=channelGain*.3;temperatureMat.uniforms.gain.value=thermalGain;
  bubbleMat.uniforms.gain.value=boiling*channelGain;openRod.clippingPlanes[0].constant=29.776225768+5*ease(.785,.804,p);
  if(channel.visible){
   seeds.forEach((s,i)=>{
    const t=frac((p-.704)*15*s.speed+s.phase),z=t*9.78,length=.15+.23*s.speed;
    streamPositions.set([s.x,s.y,z,s.x,s.y,Math.min(9.78,z+length)],i*6);
    const iz=Math.min(cz-1,Math.floor(t*cz)),value=temp[s.ix+cn*(s.iy+cm*iz)],c=boiling>.3?new THREE.Color(0x8cafb8):color(value).lerp(new THREE.Color(0xe6ece8),.5);
    streamColors.set([c.r,c.g,c.b,c.r,c.g,c.b],i*6);
   });streamsGeometry.attributes.position.needsUpdate=true;streamsGeometry.attributes.color.needsUpdate=true;streamMat.opacity=channelGain*ease(.723,.742,p)*(.52-.28*boiling);
   for(let i=0;i<100;i++){
    const x=i%2? .815:-.815,y=Math.floor(i/2)%2?.815:-.815,t=frac((p-.784)*16+i*.61803399),angle=-Math.PI*.25+Math.sin(i*2.4)*.9;
    const growth=Math.min(1,t*5),detach=ease(.14,.36,t),r=.61+.06*growth+detach*.26;
    object.position.set(x+Math.cos(angle)*r+Math.sin(t*14+i)*.045*detach,y+Math.sin(angle)*r,.45+frac(i*.314)*2+t*6.8);
    const size=(.045+.11*growth+.055*t)*boiling;object.scale.set(size*(1+.1*t),size,size*(1-.12*t));object.updateMatrix();bubbles.setMatrixAt(i,object.matrix);
   }bubbles.instanceMatrix.needsUpdate=true;
  }
  const coreLegend=coreGain>.12,fluidLegend=channelGain>.12&&p>.733,plantLegend=p>.884;
  legend.hidden=!coreLegend&&!fluidLegend&&!plantLegend;legend.classList.toggle('plant',plantLegend);
  if(coreLegend){quantity.textContent='Relative fission heating';range.innerHTML='<span>0</span><span>≥2 × mean</span>';note.textContent='OpenMC · cold fixed-source model';legend.classList.remove('boiling');}
  else if(fluidLegend){quantity.textContent=boiling>.5?'Surface boiling':'Channel temperature';range.innerHTML='<span>Inlet</span><span>Wall</span>';note.textContent=boiling>.5?'Illustrated bubble growth and departure':'Reduced laminar model · normalized';legend.classList.toggle('boiling',boiling>.5);}
  else if(plantLegend){quantity.textContent='Steam to water';range.innerHTML='<span class=steam>Steam</span><span class=water>Condensate</span><span class=cooling>Cooling water</span>';note.textContent='Illustrated flow';legend.classList.remove('boiling');}
  return {channelGain,coreGain};
 }
 return {update};
}
