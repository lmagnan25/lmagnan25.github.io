import * as THREE from 'three';
const TAU=Math.PI*2;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export function cylinderZ(r,h,material,x=0,y=0,z=0,open=false){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40,1,open).rotateX(Math.PI/2),material);mesh.position.set(x,y,z);return mesh;
}
export function bar(a,b,r,material){
  const direction=b.clone().sub(a),mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,direction.length(),10),material);
  mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(V(0,1,0),direction.normalize());return mesh;
}
export function ring(r,t,z,material){const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,80),material);m.position.z=z;return m;}
export function sectionWall(outer,inner,height,material,start=Math.PI*.55,length=Math.PI*1.45){
  const shape=new THREE.Shape(),first=start,last=start+length;
  shape.absarc(0,0,outer,first,last,false);shape.lineTo(inner*Math.cos(last),inner*Math.sin(last));
  shape.absarc(0,0,inner,last,first,true);shape.closePath();
  return new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:64}),material);
}
export function perforatedPlate(radius,centers,width,z,thickness,material){
  const shape=new THREE.Shape();shape.absarc(0,0,radius,0,TAU,false);
  for(const[x,y]of centers){const h=width/2,hole=new THREE.Path();hole.moveTo(x-h,y-h);hole.lineTo(x-h,y+h);hole.lineTo(x+h,y+h);hole.lineTo(x+h,y-h);hole.closePath();shape.holes.push(hole);}
  const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:80}),material);m.position.z=z;return m;
}

// Reference-informed supports and drives. These are explanatory hardware around
// the unchanged transport model, not a certified reconstruction of a plant.
export function createInternals(scene,meta,material,bladeMaterial){
  const structure=new THREE.Group(),drives=new THREE.Group(),blades=new THREE.Group();scene.add(structure,drives,blades);
  const shroud=sectionWall(33,32,139,material,.4,Math.PI*1.42);shroud.position.z=-69;structure.add(shroud);
  structure.add(perforatedPlate(32,meta.bundle_centers,14.5,-69,2.4,material));
  structure.add(perforatedPlate(32,meta.bundle_centers,14.35,62,1.1,material));
  for(const z of[-69,-32,12,69])structure.add(ring(33,.55,z,material));
  for(const[cx,cy]of meta.bundle_centers){
    const nozzle=new THREE.Mesh(new THREE.ConeGeometry(4,7,32,1,true).rotateX(Math.PI/2),material);nozzle.position.set(cx,cy,-72);structure.add(nozzle);
    structure.add(cylinderZ(2.4,8,material,cx,cy,-78,true));
  }
  const bladeCenters=[[-7.8,-7.8],[7.8,-7.8],[-7.8,7.8],[7.8,7.8]];
  const bladeMeshes=[];
  for(const[x,y]of bladeCenters){
    const g=new THREE.Group();g.position.set(x,y,0);blades.add(g);bladeMeshes.push(g);
    for(const angle of[0,Math.PI/2]){
      const wing=new THREE.Group();wing.rotation.z=angle;g.add(wing);
      const plate=new THREE.Mesh(new THREE.BoxGeometry(.32,14.5,102),bladeMaterial);plate.position.z=13;wing.add(plate);
      for(const side of[-1,1]){
        const rib=bar(V(0,side*6.9,-38),V(0,side*6.9,64),.23,bladeMaterial);wing.add(rib);
      }
    }
    const crown=bar(V(-1.5,0,64),V(1.5,0,64),.35,bladeMaterial);g.add(crown);
    g.add(cylinderZ(.6,45,bladeMaterial,0,0,-60));
    drives.add(cylinderZ(2.3,16,material,x,y,-88,true));
    drives.add(cylinderZ(1.5,39,material,x,y,-111));
    drives.add(cylinderZ(2.7,9,material,x,y,-133));
    for(const z of[-84,-96,-127,-136]){const m=ring(2.8,.25,z,material);m.position.x=x;m.position.y=y;drives.add(m);}
  }
  // Feedwater sparger and distributed standpipe support, all attached to structure.
  const sparger=new THREE.Mesh(new THREE.TorusGeometry(35,1,12,100,Math.PI*1.6),material);sparger.position.z=73;sparger.rotation.z=.25;structure.add(sparger);
  for(let i=0;i<16;i++){
    const a=.25+i/15*Math.PI*1.6;
    structure.add(bar(V(35*Math.cos(a),35*Math.sin(a),73),V(31.5*Math.cos(a),31.5*Math.sin(a),71),.32,material));
  }
  return {structure,drives,blades,bladeMeshes};
}
