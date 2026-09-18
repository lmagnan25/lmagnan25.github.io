import * as THREE from 'three';
import {ease} from './bwr-scene.js?v=steam3';
import {cylinderZ} from './bwr-hardware.js?v=steam3';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),frac=x=>x-Math.floor(x);
const palette=`vec3 temperatureColor(float t){
 vec3 c=mix(vec3(.009,.047,.127),vec3(.019,.212,.314),smoothstep(0.,.22,t));
 c=mix(c,vec3(.178,.397,.337),smoothstep(.22,.44,t));
 c=mix(c,vec3(.578,.503,.181),smoothstep(.44,.65,t));
 c=mix(c,vec3(.68,.242,.058),smoothstep(.65,.82,t));
 return mix(c,vec3(.376,.048,.022),smoothstep(.82,1.,t));}`;
export async function createChannel(scene){
 const response=await fetch('assets/bwr/channel.json');if(!response.ok)throw Error('Channel metadata unavailable');
 const meta=await response.json();
 const [packed,velocity]=await Promise.all([meta.temperature_file,meta.velocity_file].map(async(name,i)=>{
  const r=await fetch(`assets/bwr/${name}`);if(!r.ok)throw Error('Channel field unavailable');const data=await r.arrayBuffer();return i===0?new Uint16Array(data):new Float32Array(data);
 }));
 const [nx,ny,nz]=meta.dimension,P=meta.pitch_cm,R=meta.rod_radius_cm;
 const low=meta.bounds_pitch_units[0].map(v=>v*P),high=meta.bounds_pitch_units[1].map(v=>v*P),width=high[0]-low[0],length=high[2]-low[2];
 const group=new THREE.Group();group.position.set(20.49,-20.49,12);scene.add(group);
 const metal=new THREE.MeshStandardMaterial({color:0x788589,metalness:.69,roughness:.36,transparent:true});
 const cutMetal=metal.clone();cutMetal.clippingPlanes=[new THREE.Plane(V(-1,1,0).normalize(),29.71)];
 for(const [px,py]of meta.rod_centers_pitch_units){group.add(cylinderZ(R,length,px>0&&py<0?cutMetal:metal,px*P,py*P,length/2));}
 const texture=new THREE.Data3DTexture(packed,nx,ny,nz);texture.format=THREE.RedFormat;texture.type=THREE.HalfFloatType;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.unpackAlignment=1;texture.needsUpdate=true;
 const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,
  uniforms:{field:{value:texture},gain:{value:0},width:{value:width},length:{value:length},radius:{value:R}},
  vertexShader:`varying vec3 q;void main(){q=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`precision highp sampler3D;uniform sampler3D field;uniform float gain,width,length,radius;varying vec3 q;${palette}
   void main(){for(int i=0;i<2;i++)for(int j=0;j<2;j++){vec2 c=vec2(float(i)-.5,float(j)-.5)*width;if(distance(q.xy,c)<radius+.001)discard;}
   vec3 uv=vec3(q.xy/width+.5,q.z/length);float t=texture(field,clamp(uv,vec3(0.),vec3(1.))).r;
   float contour=1.-smoothstep(.008,.022,abs(fract(t*10.+.5)-.5));gl_FragColor=vec4(temperatureColor(t)*(1.-contour*.17)*1.15,gain*.92);}`});
 function surface(corners){const a=[];for(const i of[0,1,2,0,2,3])a.push(...corners[i]);return new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(a,3)),material);}
 const h=width/2;
 group.add(surface([[-h,-h,0],[h,h,0],[h,h,length],[-h,-h,length]]));
 group.add(surface([[-h,-h,length*.83],[h,-h,length*.83],[h,h,length*.83],[-h,h,length*.83]]));
 // Only open symmetry-edge marks. These are not a wall or enclosing cage.
 const marks=[];for(const z of[0,length*.83])for(const s of[-1,1]){marks.push(-h+R,s*h,z,h-R,s*h,z,s*h,-h+R,z,s*h,h-R,z);}
 const markMat=new THREE.LineBasicMaterial({color:0x9caeb2,transparent:true,opacity:0});
 group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(marks,3)),markMat));
 function sample(u,v){const xx=THREE.MathUtils.clamp(u*nx-.5,0,nx-1),yy=THREE.MathUtils.clamp(v*ny-.5,0,ny-1),x=Math.floor(xx),y=Math.floor(yy),a=xx-x,b=yy-y;
  const at=(i,j)=>velocity[Math.min(nx-1,i)+nx*Math.min(ny-1,j)];return THREE.MathUtils.lerp(THREE.MathUtils.lerp(at(x,y),at(x+1,y),a),THREE.MathUtils.lerp(at(x,y+1),at(x+1,y+1),a),b);
 }
 const seeds=[];for(let i=1;seeds.length<180;i++){
  const u=frac(i*.61803398875),v=frac(i*.754877666),x=(u-.5)*width,y=(v-.5)*width;
  if(meta.rod_centers_pitch_units.some(([cx,cy])=>Math.hypot(x-cx*P,y-cy*P)<R+.004))continue;
  const speed=sample(u,v);if(speed>0)seeds.push({x,y,speed,phase:frac(i*.41421356237)});
 }
 const positions=new Float32Array(seeds.length*6),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
 const tracerMat=new THREE.LineBasicMaterial({color:0xb2c8ca,transparent:true,opacity:0,depthWrite:false});
 const tracers=new THREE.LineSegments(geo,tracerMat);tracers.frustumCulled=false;group.add(tracers);
 const legend=document.querySelector('#field-legend'),title=legend.querySelector('strong'),range=legend.querySelector('.range'),note=legend.querySelector('small');
 function update(p){
  const gain=ease(.553,.585,p)*(1-ease(.815,.85,p));group.visible=gain>.001;
  const enter=ease(.553,.604,p),extend=ease(.738,.78,p),selectedLength=THREE.MathUtils.lerp(120,length,enter);
  group.scale.z=THREE.MathUtils.lerp(selectedLength,120,extend)/length;
  group.position.z=THREE.MathUtils.lerp(THREE.MathUtils.lerp(-60,12,enter),-60,extend);
  metal.opacity=cutMetal.opacity=gain;metal.depthWrite=cutMetal.depthWrite=gain>.995;
  const scalar=ease(.607,.624,p)*(1-ease(.669,.686,p));material.uniforms.gain.value=scalar;
  tracerMat.opacity=scalar*.66;markMat.opacity=scalar*.35;
  cutMetal.clippingPlanes[0].constant=29.71;
  if(group.visible&&scalar>0){seeds.forEach((s,i)=>{const z=frac((p-.6)*13*s.speed+s.phase)*length;positions.set([s.x,s.y,z,s.x,s.y,Math.min(length,z+.055+.13*s.speed)],i*6);});geo.attributes.position.needsUpdate=true;}
  const thermalLegend=scalar>.25,boilLegend=p>.696&&p<.745;
  legend.hidden=!thermalLegend&&!boilLegend;legend.classList.toggle('boiling',boilLegend);
  if(thermalLegend){title.textContent='Channel temperature';range.innerHTML='<span>Inlet</span><span>Heated wall</span>';note.textContent='Interior passage · reduced laminar model';}
  else if(boilLegend){title.textContent='Surface boiling';note.textContent='Illustrated bubble growth and departure';}
  return {focus:gain};
 }
 return {update};
}
