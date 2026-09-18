import * as THREE from 'three';
import {ease} from './bwr-scene.js?v=field8';
import {bar,cylinderZ} from './bwr-hardware.js?v=field8';
const TAU=Math.PI*2,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const frac=x=>x-Math.floor(x);

// The thermal section is an explanatory illustration, separate from OpenMC.
// Geometry, phase change and the closed route matter more than decorative light.
export function createThermal(scene) {
  const hardware=new THREE.Group();scene.add(hardware);
  const steel=new THREE.MeshStandardMaterial({color:0x858c8d,metalness:.72,roughness:.43,envMapIntensity:.75,transparent:true});
  const cast=new THREE.MeshStandardMaterial({color:0x515d63,metalness:.45,roughness:.6,envMapIntensity:.7,transparent:true});
  const copper=new THREE.MeshStandardMaterial({color:0x997857,metalness:.7,roughness:.44,transparent:true});
  const inside=new THREE.MeshStandardMaterial({color:0x8a9396,metalness:.7,roughness:.42,transparent:true,side:THREE.DoubleSide});
  const clipped=inside.clone();clipped.clippingPlanes=[new THREE.Plane(V(0,1,0),0)];clipped.clipShadows=true;
  const rotor=new THREE.Group();rotor.position.set(133,0,30);hardware.add(rotor);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,90,36).rotateZ(Math.PI/2),steel);rotor.add(shaft);

  // A small lofted airfoil. Chord and twist vary from root to tip; no wire hoops.
  function bladeGeometry(){
    const positions=[],indices=[],stations=9,sides=16;
    for(let j=0;j<stations;j++){
      const span=j/(stations-1),twist=.38-span*.55,chord=1.0-span*.25;
      for(let k=0;k<sides;k++){
        const a=k/sides*TAU,u=Math.cos(a)*chord,w=Math.sin(a)*.09+(.12*Math.sin(a*2));
        positions.push(u*Math.cos(twist)-w*Math.sin(twist),span,u*Math.sin(twist)+w*Math.cos(twist));
      }
    }
    for(let j=0;j<stations-1;j++)for(let k=0;k<sides;k++){
      const a=j*sides+k,b=j*sides+(k+1)%sides,c=a+sides,d=b+sides;indices.push(a,c,b,b,c,d);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  }
  const blades=new THREE.InstancedMesh(bladeGeometry(),steel,10*58),object=new THREE.Object3D();let instance=0;
  for(let stage=0;stage<10;stage++){
    const x=-28+stage*6.0,r=stage<4?6.0+stage*.65:8.2+(stage-4)*1.08;
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(3.25,3.25,2.5,40).rotateZ(Math.PI/2),steel);hub.position.x=x;rotor.add(hub);
    for(let j=0;j<58;j++){
      const a=j/58*TAU+stage*.035;
      object.position.set(x,Math.cos(a)*3.1,Math.sin(a)*3.1);object.rotation.set(a,0,0);object.scale.set(1.25,r-3.1,.85);object.updateMatrix();blades.setMatrixAt(instance++,object.matrix);
    }
  }
  rotor.add(blades);
  const statorGeometry=bladeGeometry();statorGeometry.scale(-1,1,1);
  const stators=new THREE.InstancedMesh(statorGeometry,inside,9*42);let fixedBlade=0;
  for(let stage=0;stage<9;stage++){
    const x=108+stage*6,r=stage<4?6.0+stage*.65:8.2+(stage-4)*1.08;
    for(let j=0;j<42;j++){
      const a=j/42*TAU;
      object.position.set(x,Math.cos(a)*3.1,30+Math.sin(a)*3.1);object.rotation.set(a,0,0);object.scale.set(.8,r-3.1,.65);object.updateMatrix();stators.setMatrixAt(fixedBlade++,object.matrix);
    }
  }
  hardware.add(stators);
  // Three substantial casing sections, opened toward the camera.
  for(const [x,len,r]of [[112,27,10],[144,35,16],[163,11,18]]){
    const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,64,1,true).rotateZ(Math.PI/2),clipped);c.position.set(x,0,30);hardware.add(c);
    for(const side of[-1,1]){
      const flange=new THREE.Mesh(new THREE.TorusGeometry(r,.9,12,64).rotateY(Math.PI/2),steel);flange.position.set(x+len*.5*side,0,30);hardware.add(flange);
      for(let k=0;k<18;k++){
        const a=k/18*TAU,bolt=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,2.2,6).rotateZ(Math.PI/2),steel);
        bolt.position.set(x+len*.5*side,Math.cos(a)*r,30+Math.sin(a)*r);hardware.add(bolt);
      }
    }
  }
  for(const x of[94,177]){
    const bearing=new THREE.Mesh(new THREE.BoxGeometry(7,11,10),cast);bearing.position.set(x,0,21);hardware.add(bearing);
    const foot=new THREE.Mesh(new THREE.BoxGeometry(12,19,2),cast);foot.position.set(x,0,15);hardware.add(foot);
  }
  const bed=new THREE.Mesh(new THREE.BoxGeometry(105,23,3),cast);bed.position.set(145,0,12);hardware.add(bed);
  // Generator stator: enclosed steel body, visible rotor and a limited winding section.
  const coupling=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,12,32).rotateZ(Math.PI/2),steel);coupling.position.set(183,0,30);hardware.add(coupling);
  const generator=new THREE.Mesh(new THREE.CylinderGeometry(11,11,31,48).rotateZ(Math.PI/2),cast);generator.position.set(205,0,30);hardware.add(generator);
  const end=new THREE.Mesh(new THREE.CylinderGeometry(8.5,8.5,.8,48).rotateZ(Math.PI/2),steel);end.position.set(189,0,30);hardware.add(end);
  const winding=new THREE.Mesh(new THREE.TorusGeometry(6.5,1.3,10,48).rotateY(Math.PI/2),copper);winding.position.set(188.4,0,30);hardware.add(winding);
  for(const x of[193,217]){const mount=new THREE.Mesh(new THREE.BoxGeometry(7,23,5),cast);mount.position.set(x,0,17);hardware.add(mount);}
  const cooler=new THREE.Mesh(new THREE.BoxGeometry(25,14,6),cast);cooler.position.set(205,0,43);hardware.add(cooler);
  for(let k=0;k<10;k++){const vent=new THREE.Mesh(new THREE.BoxGeometry(.6,12,.4),inside);vent.position.set(194+k*2.3,0,46.1);hardware.add(vent);}

  // Steam exhaust enters a broad hood below the low-pressure casing, before the shaft coupling.
  const hood=new THREE.Mesh(new THREE.CylinderGeometry(10,14,44,4,1,true).rotateX(Math.PI/2),clipped);
  hood.rotation.z=Math.PI/4;hood.position.set(157,0,-10);hardware.add(hood);
  const condenser=new THREE.Mesh(new THREE.CylinderGeometry(14,14,58,64,1,true).rotateZ(Math.PI/2),clipped);condenser.position.set(138,0,-43);hardware.add(condenser);
  const tubeMat=steel.clone();tubeMat.color.set(0x748e94);tubeMat.roughness=.34;
  const tubes=[];
  for(let y=-9;y<=9;y+=1.8)for(let z=-9;z<=9;z+=1.8)if(y*y+z*z<105){
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,52,8).rotateZ(Math.PI/2),tubeMat);tube.position.set(138,y,-43+z);hardware.add(tube);tubes.push([y,z]);
  }
  for(const x of[107,169]){
    const waterbox=new THREE.Mesh(new THREE.CylinderGeometry(14,14,5,48).rotateZ(Math.PI/2),cast);waterbox.position.set(x,0,-43);hardware.add(waterbox);
    const flange=new THREE.Mesh(new THREE.TorusGeometry(14,.7,12,60).rotateY(Math.PI/2),steel);flange.position.set(x,0,-43);hardware.add(flange);
  }
  const hotwell=new THREE.Mesh(new THREE.BoxGeometry(34,15,8),clipped);hotwell.position.set(136,0,-59);hardware.add(hotwell);
  for(const x of[117,158]){const leg=new THREE.Mesh(new THREE.BoxGeometry(5,20,5),cast);leg.position.set(x,0,-60);hardware.add(leg);}
  const pump=new THREE.Mesh(new THREE.TorusGeometry(3.0,1.4,16,36,Math.PI*1.7),cast);pump.position.set(75,0,-46);pump.rotation.x=Math.PI/2;hardware.add(pump);
  const motor=cylinderZ(3.5,10,cast,75,8,-46);motor.rotation.x=Math.PI/2;hardware.add(motor);
  const pumpFoot=new THREE.Mesh(new THREE.BoxGeometry(12,17,2),cast);pumpFoot.position.set(75,4,-51);hardware.add(pumpFoot);

  const curve=points=>new THREE.CatmullRomCurve3(points.map(p=>V(...p)),false,'centripetal');
  const steam=curve([[38,0,109],[62,0,109],[77,0,102],[80,0,80],[80,0,44],[88,0,36],[103,0,36]]);
  const feed=curve([[119,0,-59],[97,0,-59],[80,0,-50],[75,0,-43],[67,0,-5],[52,0,40],[38,0,40]]);
  const cold=curve([[107,-38,-43],[107,-20,-43],[111,0,-43],[163,0,-43],[170,20,-43],[170,38,-43]]);
  const pipeMaterials=[];
  for(const[c,r]of[[steam,2.6],[feed,1.35],[cold,2.0]]){
    const m=clipped.clone();pipeMaterials.push(m);hardware.add(new THREE.Mesh(new THREE.TubeGeometry(c,100,r,18,false),m));
    for(const t of[.16,.79]){
      const at=c.getPoint(t),tangent=c.getTangent(t),flange=new THREE.Mesh(new THREE.TorusGeometry(r*1.3,.28,10,32),m);
      flange.position.copy(at);flange.quaternion.setFromUnitVectors(V(0,0,1),tangent);hardware.add(flange);
    }
  }
  const paths=[];
  const waterColor=new THREE.Color(0x91c1cd),steamColor=new THREE.Color(0xe2c79c),coolColor=new THREE.Color(0x7eaea5);
  function addFlow(c,start,end,color,radius,count){paths.push({c,start,end,color,radius,count});}
  addFlow(curve([[5,0,90],[9,0,98],[22,0,106],[38,0,109]]),.725,.757,steamColor,4.0,65);
  addFlow(steam,.757,.81,steamColor,1.65,90);
  addFlow(curve([[104,0,36],[112,-5,34],[133,-8,34],[158,-11,31],[158,-6,10],[157,-3,-31]]),.80,.885,steamColor,3.0,85);
  addFlow(curve([[156,0,-32],[147,0,-40],[138,0,-52],[130,0,-59],[119,0,-59]]),.87,.925,waterColor,3.8,70);
  addFlow(feed,.92,.98,waterColor,.8,70);
  addFlow(cold,.91,.98,coolColor,.9,70);
  addFlow(curve([[37,0,40],[36,0,5],[35,0,-40],[23,0,-64],[1,0,-64]]),.957,1,waterColor,.7,50);
  // Camera-facing flow bands: a fine dark edge keeps the route legible on steel.
  // These explain the illustrated plant path; they are not CFD streamlines.
  const routeMaterials=[];
  paths.forEach((f,routeIndex)=>{
    const vertices=[],tangents=[],coordinates=[],sides=[],steps=150;
    for(let j=0;j<steps;j++)for(const [end,side]of[[0,-1],[1,-1],[1,1],[0,-1],[1,1],[0,1]]){
      const t=(j+end)/steps,a=f.c.getPoint(t),d=f.c.getTangent(t);
      vertices.push(...a.toArray());tangents.push(...d.toArray());coordinates.push(t);sides.push(side);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('tangent',new THREE.Float32BufferAttribute(tangents,3));geometry.setAttribute('along',new THREE.Float32BufferAttribute(coordinates,1));geometry.setAttribute('side',new THREE.Float32BufferAttribute(sides,1));
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,
      uniforms:{resolution:{value:new THREE.Vector2(innerWidth,innerHeight)},front:{value:0},phase:{value:0},color:{value:routeIndex===3?steamColor:f.color},endColor:{value:f.color},condenses:{value:routeIndex===3?1:0}},
      vertexShader:`attribute vec3 tangent;attribute float along,side;uniform vec2 resolution;varying float t,s;
       void main(){t=along;s=side;vec4 a=projectionMatrix*modelViewMatrix*vec4(position,1.);vec4 b=projectionMatrix*modelViewMatrix*vec4(position+tangent,1.);vec2 d=normalize((b.xy/b.w-a.xy/a.w)*resolution);a.xy+=vec2(-d.y,d.x)*side*3.2/resolution*a.w;gl_Position=a;}`,
      fragmentShader:`uniform float front,phase,condenses;uniform vec3 color,endColor;varying float t,s;
       void main(){if(t>front)discard;float packet=pow(.5+.5*cos((t-phase)*56.55),16.);float center=1.-smoothstep(.47,.75,abs(s));float edge=1.-smoothstep(.8,1.,abs(s));vec3 c=mix(color,endColor,condenses*smoothstep(.18,.78,t));gl_FragColor=vec4(mix(vec3(.008,.015,.019),c,center),edge*(.24+.69*packet));}`});
    const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=8;scene.add(mesh);routeMaterials.push({material,path:f,mesh});
  });
  const max=paths.reduce((n,f)=>n+f.count,0),position=new Float32Array(max*3),colors=new Float32Array(max*3),size=new Float32Array(max);
  const flowGeo=new THREE.BufferGeometry();flowGeo.setAttribute('position',new THREE.BufferAttribute(position,3).setUsage(THREE.DynamicDrawUsage));flowGeo.setAttribute('color',new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));flowGeo.setAttribute('size',new THREE.BufferAttribute(size,1).setUsage(THREE.DynamicDrawUsage));
  const flowMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,
    vertexShader:`attribute vec3 color;attribute float size;varying vec3 c;void main(){c=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*650./-mv.z,1.6,5.);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying vec3 c;void main(){float r=length(gl_PointCoord-.5)*2.;float a=1.-smoothstep(.15,1.,r);if(a<.01)discard;gl_FragColor=vec4(c,a*.82);}`});
  const flowTailPositions=new Float32Array(max*6),flowTailColors=new Float32Array(max*6);
  const flowTailGeo=new THREE.BufferGeometry();flowTailGeo.setAttribute('position',new THREE.BufferAttribute(flowTailPositions,3).setUsage(THREE.DynamicDrawUsage));flowTailGeo.setAttribute('color',new THREE.BufferAttribute(flowTailColors,3).setUsage(THREE.DynamicDrawUsage));
  const flowTails=new THREE.LineSegments(flowTailGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.32,depthWrite:false,depthTest:false}));flowTails.frustumCulled=false;scene.add(flowTails);
  const poolMat=new THREE.MeshBasicMaterial({color:0x628b9a,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(32,14),poolMat);pool.position.set(136,0,-56);hardware.add(pool);
  const flow=new THREE.Points(flowGeo,flowMaterial);flow.frustumCulled=false;scene.add(flow);

  // Surface-originating bubbles grow as they rise. No central luminous disk,
  // uniform red core or long parallel energy wires.
  const bubbleMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    vertexShader:`varying vec3 n,v;void main(){vec4 mv=modelViewMatrix*instanceMatrix*vec4(position,1.);n=normalize(normalMatrix*mat3(instanceMatrix)*normal);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying vec3 n,v;void main(){vec3 N=normalize(n),V=normalize(v);float edge=pow(1.-abs(dot(N,V)),2.2);float glint=pow(max(dot(reflect(-normalize(vec3(-.4,.7,.6)),N),V),0.),64.);vec3 c=mix(vec3(.13,.19,.22),vec3(.86,.93,.95),min(1.,edge+glint));gl_FragColor=vec4(c,.07+edge*.62+glint*.22);}`});
  const bubbles=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),bubbleMaterial,720);bubbles.frustumCulled=false;scene.add(bubbles);
  const heatMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{gain:{value:0}},vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec3 p;uniform float gain;void main(){float band=exp(-pow((p.z-12.)/25.,2.));gl_FragColor=vec4(.65,.35,.14,band*.12*gain);}`});
  const heatSkins=new THREE.Group();scene.add(heatSkins);
  for(let ix=6;ix<8;ix++)for(let iy=0;iy<2;iy++){
    const x=15.6+(ix-3.5)*1.63,y=-15.6+(iy-3.5)*1.63;
    heatSkins.add(cylinderZ(.615,120,heatMat,x,y,0,true));
  }
  const liquidPos=new Float32Array(160*6),liquidColors=new Float32Array(160*6),liquidGeo=new THREE.BufferGeometry();
  liquidGeo.setAttribute('position',new THREE.BufferAttribute(liquidPos,3).setUsage(THREE.DynamicDrawUsage));liquidGeo.setAttribute('color',new THREE.BufferAttribute(liquidColors,3));
  const liquidMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.18,depthWrite:false});
  const liquid=new THREE.LineSegments(liquidGeo,liquidMat);liquid.frustumCulled=false;scene.add(liquid);
  const point=V(0,0,0),tangent=V(0,0,0),normal=V(0,0,0),binormal=V(0,0,0);
  function update(p,focus=0){
    // Static pipework connects before the steam arrives. Only opacity reveals it.
    const reveal=ease(.715,.749,p);
    hardware.visible=p>.715;
    for(const m of[steel,cast,copper,inside,clipped,tubeMat,...pipeMaterials]){m.opacity=reveal;m.depthWrite=reveal>.98;}
    rotor.rotation.x=(p-.81)*64;
    routeMaterials.forEach(({material,path:f,mesh})=>{const front=ease(f.start,f.end,p);mesh.visible=front>0;material.uniforms.front.value=front;material.uniforms.phase.value=(p-f.start)*2;material.uniforms.resolution.value.set(innerWidth,innerHeight);});
    let n=0;
    for(const f of paths){
      const front=ease(f.start,f.end,p),clock=(p-f.start)*7;
      if(front===0)continue;
      for(let i=0;i<f.count;i++){
        const t=frac(clock+i*.61803398875);if(t>front)continue;
        f.c.getPoint(t,point);f.c.getTangent(t,tangent);normal.crossVectors(tangent,V(0,1,0)).normalize();binormal.crossVectors(tangent,normal).normalize();
        const a=i*2.39996,r=f.radius*Math.sqrt(frac(i*.4142));point.addScaledVector(normal,Math.cos(a)*r).addScaledVector(binormal,Math.sin(a)*r);
        const previous=f.c.getPoint(Math.max(0,t-.014));
        flowTailPositions.set([...previous.toArray(),...point.toArray()],n*6);flowTailColors.set([f.color.r,f.color.g,f.color.b,f.color.r,f.color.g,f.color.b],n*6);
        position.set(point.toArray(),n*3);colors.set([f.color.r,f.color.g,f.color.b],n*3);size[n]=.6+frac(i*.73)*.6;n++;
      }
    }
    flowTailGeo.setDrawRange(0,n*2);flowTailGeo.attributes.position.needsUpdate=true;flowTailGeo.attributes.color.needsUpdate=true;poolMat.opacity=.6*ease(.87,.925,p);
    flowGeo.setDrawRange(0,n);flowGeo.attributes.position.needsUpdate=true;flowGeo.attributes.color.needsUpdate=true;flowGeo.attributes.size.needsUpdate=true;
    const boiling=ease(.648,.673,p);bubbles.visible=liquid.visible=heatSkins.visible=p>.716&&focus<.2;heatMat.uniforms.gain.value=boiling*(1-.5*ease(.715,.755,p));
    if(bubbles.visible){
      for(let i=0;i<720;i++){
        const focused=i<260,ix=focused?6+i%2:i%8,iy=focused?Math.floor(i/2)%2:Math.floor(i/8)%8,local=i<520;
        const cx=local?15.6:((i%3)-1)*15.6,cy=local?-15.6:((Math.floor(i/3)%3)-1)*15.6;
        const x=cx+(ix-3.5)*1.63,y=cy+(iy-3.5)*1.63,a=focused?-.8+Math.sin(i*2.4)*.6:i*2.39996;
        const t=frac((p-.648)*12+i*.61803398875),birth=-18+frac(i*.431)*35,z=birth+t*68;
        const radius=.62+t*.35;
        object.position.set(x+Math.cos(a)*radius+Math.sin(t*11+i)*.09*t,y+Math.sin(a)*radius,z);
        object.rotation.set(0,0,0);const s=(.04+.15*t)*boiling;object.scale.set(s,s,s*(1-.12*t));object.updateMatrix();bubbles.setMatrixAt(i,object.matrix);
      }bubbles.instanceMatrix.needsUpdate=true;
      for(let i=0;i<160;i++){
        const t=frac((p-.65)*3+i*.618),z=-58+t*119,x=15.6+((i%8)-3.5)*1.63+.8,y=-15.6+((Math.floor(i/8)%8)-3.5)*1.63+.8;
        liquidPos.set([x,y,z,x+.025,y,z+1.2],i*6);
        const c=waterColor.clone().lerp(steamColor,ease(-8,60,z)*.65);liquidColors.set([c.r,c.g,c.b,c.r,c.g,c.b],i*6);
      }liquidGeo.attributes.position.needsUpdate=true;liquidGeo.attributes.color.needsUpdate=true;liquidMat.opacity=.26*boiling;
    }
  }
  return {update};
}
