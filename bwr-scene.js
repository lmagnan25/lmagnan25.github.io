import * as THREE from 'three';
import {createPelletMaterial,createPelletGeometry} from './bwr-surfaces.js?v=1.1b';
import {buildVessel} from './bwr-vessel.js?v=1.1b';
import {createRadiograph} from './bwr-radiograph.js?v=1.1b';
import {createInternals,sectionWall,bar,cylinderZ} from './bwr-hardware.js?v=1.1b';
const TAU = Math.PI * 2;
export const ease = (a,b,p) => {const t=Math.min(1,Math.max(0,(p-a)/(b-a)));return t*t*t*(t*(t*6-15)+10);};
const lerp = THREE.MathUtils.lerp;
const v = (x,y,z) => new THREE.Vector3(x,y,z);

export function createBWR(scene, renderer, meta, options={}) {
  const studio = new THREE.Scene();
  for (const [color,intensity,pos,size] of [
    [0xcde6ff,4,[12,-8,5],[6,18]], [0xffd5a5,2,[-10,4,0],[4,16]],
    [0xffffff,3,[0,0,14],[14,14]], [0x4973a0,1,[0,9,-7],[14,8]]]) {
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(...size),new THREE.MeshBasicMaterial({color}));
    panel.material.color.multiplyScalar(intensity);panel.position.set(...pos);panel.lookAt(0,0,0);studio.add(panel);
  }
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(studio,.04).texture;pmrem.dispose();
  studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  const key=new THREE.DirectionalLight(0xe0edff,2.2);key.position.set(100,-150,230);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffd3a2,.7);rim.position.set(-100,80,30);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x8a9ead,.3));
  const metal=(color=0x6e8191,opacity=1)=>new THREE.MeshStandardMaterial({color,metalness:.76,roughness:.43,envMapIntensity:.8,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
  const shellMat=metal(0x575e62), ringMat=metal(0x92999b), rodMat=metal(0xa0a7a8);
  rodMat.roughness=.38;rodMat.envMapIntensity=.66;
  shellMat.roughness=.62;shellMat.metalness=.58;shellMat.envMapIntensity=.48;
  ringMat.roughness=.34;ringMat.envMapIntensity=.72;
  const channelMat=metal(0x848d91),pelletMat=createPelletMaterial();
  channelMat.roughness=.52;channelMat.envMapIntensity=.58;
  const separatorMat=metal(0x818b8f),featuredSeparatorMat=separatorMat.clone();

  const shell=new THREE.Group(), lids=new THREE.Group(), fittings=new THREE.Group(), separators=new THREE.Group();
  scene.add(shell,lids,fittings,separators);
  const cylinder=(radius,height,material,group,x=0,y=0,z=0,open=false)=>{
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,48,1,open).rotateX(Math.PI/2),material);
    mesh.position.set(x,y,z);group.add(mesh);return mesh;
  };
  const {wallMat}=buildVessel(shell,lids,fittings,shellMat,ringMat);
  const core=new THREE.Group();scene.add(core);
  const rodGeo=new THREE.CylinderGeometry(meta.clad_radius,meta.clad_radius,120,16,1,false).rotateX(Math.PI/2);
  const rods=new THREE.InstancedMesh(rodGeo,rodMat,meta.pins.length);rods.frustumCulled=false;core.add(rods);
  const featured=v(meta.pitch*3.5,-meta.pitch*3.5,0);
  const pelletRows=112;
  const pellets=new THREE.InstancedMesh(createPelletGeometry(),pelletMat,pelletRows);
  for(let i=0;i<pelletRows;i++){const tone=.94+.06*((i*.61803398875)%1);pellets.setColorAt(i,new THREE.Color(tone,tone,tone));}
  pellets.frustumCulled=false;scene.add(pellets);
  const bundles=[];
  const spacerMat=metal(0x979b96);
  const tieMat=metal(0x686e70);
  const tieShape=new THREE.Shape();tieShape.moveTo(-6.6,-6.6);tieShape.lineTo(6.6,-6.6);tieShape.lineTo(6.6,6.6);tieShape.lineTo(-6.6,6.6);tieShape.closePath();
  for(let x=0;x<8;x++)for(let y=0;y<8;y++){
    const hole=new THREE.Path();hole.absarc((x-3.5)*meta.pitch,(y-3.5)*meta.pitch,.66,0,TAU,true);tieShape.holes.push(hole);
  }
  const tieGeometry=new THREE.ExtrudeGeometry(tieShape,{depth:1.7,bevelEnabled:false,curveSegments:8});
  for(const [cx,cy] of meta.bundle_centers){
    const bundle=new THREE.Group(),channel=new THREE.Group(),spacers=new THREE.Group(),ties=new THREE.Group();
    const primary=cx===0&&cy===0;
    bundle.userData={center:v(cx,cy,0),primary,channel,spacers,ties};bundles.push(bundle);core.add(bundle);bundle.add(channel,spacers,ties);
    // A deliberate open corner on the focal bundle preserves the rod-to-channel story.
    for(const side of[-1,1]){
      if(!primary||side===-1){const wall=new THREE.Mesh(new THREE.BoxGeometry(.12,14,120),channelMat);wall.position.x=side*6.94;channel.add(wall);}
      if(!primary||side===1){const wall=new THREE.Mesh(new THREE.BoxGeometry(13.76,.12,120),channelMat);wall.position.y=side*6.94;channel.add(wall);}
    }
    if(primary){
      for(const z of[-54,54]){
        const a=new THREE.Mesh(new THREE.BoxGeometry(.12,14,12),channelMat);a.position.set(6.94,0,z);channel.add(a);
        const b=new THREE.Mesh(new THREE.BoxGeometry(14,.12,12),channelMat);b.position.set(0,-6.94,z);channel.add(b);
      }
      for(const side of[-1,1]){
        const a=new THREE.Mesh(new THREE.BoxGeometry(.12,.7,96),channelMat);a.position.set(6.94,side*6.55,0);channel.add(a);
        const b=new THREE.Mesh(new THREE.BoxGeometry(.7,.12,96),channelMat);b.position.set(side*6.55,-6.94,0);channel.add(b);
      }
    }
    for(const z of[-57,-30,0,30,57]){
      for(const side of[-1,1]){
        const a=new THREE.Mesh(new THREE.BoxGeometry(.25,14,1.15),spacerMat);a.position.set(side*7,0,z);spacers.add(a);
        const b=new THREE.Mesh(new THREE.BoxGeometry(14,.25,1.15),spacerMat);b.position.set(0,side*7,z);spacers.add(b);
      }
      if(primary)for(let k=-3;k<=3;k++){
        const a=new THREE.Mesh(new THREE.BoxGeometry(.07,12.5,1.0),spacerMat);a.position.set(k*meta.pitch,0,z);spacers.add(a);
        const b=new THREE.Mesh(new THREE.BoxGeometry(12.5,.07,1.0),spacerMat);b.position.set(0,k*meta.pitch,z);spacers.add(b);
      }
    }
    for(const z of[-62,62]){
      const plate=new THREE.Mesh(tieGeometry,tieMat);plate.position.z=z-.85;ties.add(plate);
      if(primary)for(let k=-3;k<=3;k++){
        const slot=new THREE.Mesh(new THREE.BoxGeometry(.25,12,.06),spacerMat);slot.position.set(k*meta.pitch,0,z+1);ties.add(slot);
      }
    }
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(4.5,2.2,6,24).rotateX(Math.PI/2),tieMat);foot.position.z=-66;ties.add(foot);
    const bailPoints=[v(-4.5,0,63),v(-4.5,0,69),v(-3.5,0,70),v(3.5,0,70),v(4.5,0,69),v(4.5,0,63)];
    for(let i=1;i<bailPoints.length;i++)ties.add(bar(bailPoints[i-1],bailPoints[i],.46,tieMat));
    // Separator standpipe connects the upper plenum to the separator barrel.
    const localSeparatorMat=cx===15.6&&cy===-15.6?featuredSeparatorMat:separatorMat;
    cylinder(1.65,12,localSeparatorMat,separators,cx,cy,72,true);
    cylinder(2.6,13,localSeparatorMat,separators,cx,cy,83,true);
    for(const z of[77,83,89]){const rim=new THREE.Mesh(new THREE.TorusGeometry(2.65,.25,8,28),localSeparatorMat);rim.position.set(cx,cy,z);separators.add(rim);}
  }
  const deckShape=new THREE.Shape();deckShape.absarc(0,0,31,0,TAU,false);
  for(const[x,y]of meta.bundle_centers){const hole=new THREE.Path();hole.absarc(x,y,1.66,0,TAU,true);deckShape.holes.push(hole);}
  const separatorDeck=new THREE.Mesh(new THREE.ExtrudeGeometry(deckShape,{depth:1.5,bevelEnabled:false,curveSegments:24}),separatorMat);separatorDeck.position.z=65.25;separators.add(separatorDeck);
  for(const side of[-1,1]){
    const housing=new THREE.Mesh(new THREE.BoxGeometry(.7,43,12),separatorMat);housing.position.set(side*25,0,101);separators.add(housing);
    for(const y of[-21,21])separators.add(bar(v(side*25,y,90),v(side*25,y,107),.6,separatorMat));
  }
  for(let i=-7;i<=7;i++){
    const vane=new THREE.Mesh(new THREE.BoxGeometry(.28,42,8),separatorMat);vane.position.set(i*3.35,0,101);vane.rotation.y=(i%2?1:-1)*.3;separators.add(vane);
  }
  const controlMat=metal(0xa5aaa4), supportMat=metal(0x6c7477);
  const extra=createInternals(scene,meta,supportMat,controlMat);
  const radiograph=createRadiograph(scene,meta,{shell,lids,fittings,separators,structure:extra.structure});
  const fluidMat=new THREE.MeshBasicMaterial({color:0x39769b,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
  const fluid=cylinder(38.8,1,fluidMat,scene,0,0,-70,true);
  const surfaceMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{phase:{value:0},gain:{value:0}},vertexShader:`varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 p;uniform float phase,gain;void main(){float r=length(p)/38.8;float wave=pow(.5+.5*sin(r*70.-phase*26.),14.);gl_FragColor=vec4(vec3(.23,.49,.69),(.18+.5*pow(r,20.)+.06*wave)*gain);}`});
  const surface=new THREE.Mesh(new THREE.CircleGeometry(38.8,96),surfaceMat);scene.add(surface);
  const object=new THREE.Object3D();
  const offsets=meta.bundle_centers.map(()=>v(0,0,0));
  function assemblyOffset(cx,cy,p){
    const corner=Math.abs(cx)>0&&Math.abs(cy)>0;
    const t=ease(.222+(corner?.004:0),.258,p),off=1-t;
    return v(cx*5*off,cy*5*off,145*off);
  }
  function update(p){
    meta.bundle_centers.forEach(([x,y],i)=>offsets[i].copy(x===0&&y===0?v(0,0,0):assemblyOffset(x,y,p)));
    const dissolve=ease(.405,.452,p),presence=1-dissolve;
    radiograph.update(p);
    const shellArrival=ease(.307,.363,p), lidArrival=ease(.327,.387,p);
    shell.visible=p>.305;lids.visible=p>.324;fittings.visible=p>.337;separators.visible=p>.316;
    shell.position.set((1-shellArrival)*-260,0,(1-shellArrival)*100);
    lids.children.forEach((o,i)=>o.position.z=(i===0?-75:120)+(1-lidArrival)*(i===0?-230:270));
    // Upper flange and studs stay attached to the arriving top head.
    fittings.position.z=(1-lidArrival)*270;
    separators.position.z=(1-ease(.316,.371,p))*280;
    shellMat.opacity=wallMat.opacity=presence;ringMat.opacity=presence;separatorMat.opacity=featuredSeparatorMat.opacity=presence;
    rods.visible=p>.09;pellets.visible=p<.445;core.visible=p>.09;
    extra.structure.visible=p>.306;extra.drives.visible=p>.33;extra.blades.visible=p>.245&&p<(options.assembledFade ? .452 : .427);
    extra.structure.position.z=-180*(1-ease(.306,.35,p));
    extra.drives.position.z=-130*(1-ease(.33,.373,p));
    extra.blades.position.z=-126*(1-ease(.278,.302,p))-(options.assembledFade?0:132*ease(.382,.423,p));
    supportMat.opacity=presence;
    rodMat.opacity=channelMat.opacity=spacerMat.opacity=tieMat.opacity=controlMat.opacity=presence;
    pelletMat.opacity=1-dissolve;
    rodMat.emissive.setRGB(0,0,0);
    key.color.set(p<.09?0xeeeee8:0xf2f3ef);rim.intensity=p<.09?.7:.27;
    if(pellets.visible){
      for(let i=0;i<pelletRows;i++){
        const z=(i-(pelletRows-1)/2)*1.06,dist=Math.abs(z)/60;
        const t=ease(-.025+dist*.025,.065+dist*.065,p),s=1-t,sign=i%2?1:-1;
        // Keep a few central pellets in the opening frame; the surrounding
        // pellets retain their arrival from beyond the edges.
        const scatter=1-.72*Math.exp(-.5*(z/3.5)**2);
        object.position.set(featured.x+sign*(10+dist*16)*s*scatter,featured.y+Math.sin(i*2.4)*9*s*scatter,z+Math.sign(z)*15*s*scatter);
        object.rotation.set(s*sign*.8,s*Math.sin(i),0);object.scale.setScalar(1);object.updateMatrix();pellets.setMatrixAt(i,object.matrix);
      }pellets.instanceMatrix.needsUpdate=true;
    }
    if(rods.visible){
      meta.pins.forEach(([x,y],i)=>{
        const cx=Math.round(x/15.6)*15.6,cy=Math.round(y/15.6)*15.6;
        const primary=cx===0&&cy===0,isFeatured=Math.abs(x-featured.x)<.01&&Math.abs(y-featured.y)<.01;
        let px=x,py=y,pz=0,size=1;
        if(primary){
          if(isFeatured)pz=170*(1-ease(.085,.125,p));
          else {const t=ease(.126+(i%8)*.0015,.168+(i%8)*.0015,p);px=lerp(featured.x,x,t);py=lerp(featured.y,y,t);size=Math.max(.0001,t);}
        }else{
          const index=(Math.round(cx/15.6)+1)*3+Math.round(cy/15.6)+1,off=offsets[index];
          px=x+off.x;py=y+off.y;pz=off.z;size=Math.max(.0001,ease(.218,.228,p));
        }
        object.position.set(px,py,pz);object.rotation.set(0,0,0);object.scale.setScalar(size);object.updateMatrix();rods.setMatrixAt(i,object.matrix);
      });rods.instanceMatrix.needsUpdate=true;
    }
    bundles.forEach((bundle,i)=>{
      const {center:c,primary,channel,spacers,ties}=bundle.userData;
      if(primary){
        bundle.visible=p>.164;bundle.position.set(0,0,0);
        const seat=ease(.168,.19,p);
        if(options.rigidSpacerArrival){
          // Film: rigid spacers slide a short distance into place at full size.
          spacers.scale.setScalar(1);spacers.position.z=18*(1-seat);
        }else spacers.scale.set(1+(1-seat)*2,1+(1-seat)*2,1);
        channel.visible=p>.19;channel.position.z=150*(1-ease(.192,.216,p));
        ties.visible=p>.183;ties.position.z=90*(1-ease(.182,.207,p));
      }else{
        bundle.visible=p>.218;
        const off=offsets[i];bundle.position.set(c.x+off.x,c.y+off.y,off.z);

      }
    });
    const fill=ease(.37,.407,p), waterFade=1-ease(.405,.445,p);
    fluid.visible=surface.visible=options.waterAnimation!==false&&fill>.001;fluid.scale.z=Math.max(.001,145*fill);fluid.position.z=-70+145*fill/2;
    fluidMat.opacity=.022*waterFade;surface.position.z=-70+145*fill;
    surfaceMat.uniforms.phase.value=p*6;surfaceMat.uniforms.gain.value=.25*waterFade;
    for(const m of[shellMat,wallMat,ringMat,rodMat,channelMat,spacerMat,tieMat,controlMat,supportMat,separatorMat,featuredSeparatorMat,pelletMat]){m.depthWrite=m.opacity>.98;}
    rods.visible=p>.09&&rodMat.opacity>.001;
    if(presence<.001){shell.visible=lids.visible=fittings.visible=separators.visible=core.visible=extra.structure.visible=extra.drives.visible=extra.blades.visible=pellets.visible=false;}
  }
  function hideSolidGeometry(){
    for(const group of [shell,lids,fittings,separators,core,extra.structure,extra.drives,extra.blades,pellets,fluid,surface])group.visible=false;
  }
  const primary=bundles.find(bundle=>bundle.userData.primary);
  const entrances=[
    {name:'spacers',roots:[primary.userData.spacers],range:[.158,.188]},
    {name:'ties',roots:[primary.userData.ties],range:[.176,.205]},
    {name:'channel',roots:[primary.userData.channel],range:[.186,.216]},
    {name:'neighbor bundles',roots:bundles.filter(bundle=>!bundle.userData.primary),range:[.210,.244]},
    {name:'control blades',roots:[extra.blades],range:[.240,.285]},
    {name:'core supports',roots:[extra.structure],range:[.292,.334]},
    {name:'vessel wall',roots:[shell],range:[.298,.346]},
    {name:'upper internals',roots:[separators],range:[.306,.348]},
    {name:'heads and closure',roots:[lids,fittings],range:[.316,.361]},
    {name:'control drives',roots:[extra.drives],range:[.316,.356]}
  ];
  // Film compositor opts in to smooth, whole-image entrance blends. Normal
  // scrolling retains its existing behavior unless this method is called.
  function entranceLayers(p){
    if(p>=.39)return [];
    primary.visible=p>.158;
    const active=[];
    for(const entry of entrances){
      const gain=ease(...entry.range,p);
      for(const root of entry.roots)root.visible=gain>=1;
      if(gain>0&&gain<1)active.push({...entry,gain});
    }
    return active.sort((a,b)=>b.gain-a.gain);
  }
  return {featured,update,hideSolidGeometry,entranceLayers};
}
