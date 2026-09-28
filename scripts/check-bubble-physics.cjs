// Stress five interacting membranes, including edge grabs into stage walls.
require('../bubble-physics.js');
const {World,N,center,area,pointInside}=BubblePhysics;
function orient(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
function cross(a,b,c,d){return orient(a,b,c)*orient(a,b,d)<-1e-7&&orient(c,d,a)*orient(c,d,b)<-1e-7;}
let self=0,mutual=0,bad=0,error=0;
for(const [w,h,r] of [[1100,820,125],[346,900,80],[276,850,68]])for(let trial=0;trial<3;trial++){
 const world=new World(w,h),narrow=w<500;
 const positions=[[.5,.18],[.23,.48],[.77,.48],[.35,.8],[.67,.8]];
 for(let i=0;i<5;i++)world.add(narrow?w*.5:w*positions[i][0],narrow?(i+.5)*h/5:h*positions[i][1],r,i);
 const b=world.bodies[trial],c=center(b);world.pick(c.x+b.r*.82,c.y);world.dragTo(trial===0?20:w-20,trial===2?20:h-20);
 for(let t=0;t<1800;t++){
  if(t===600)world.dragTo(w*.5,h*.5);if(t===900)world.release();world.step();
  if(t%20===0){for(const b of world.bodies){error=Math.max(error,Math.abs(area(b.p)/b.target-1));for(let i=0;i<N;i++){if(!Number.isFinite(b.p[i].x+b.p[i].y))bad++;for(let j=i+2;j<N;j++)if(!(i===0&&j===N-1)&&cross(b.p[i],b.p[(i+1)%N],b.p[j],b.p[(j+1)%N]))self++;}}
   for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)for(const p of world.bodies[i].p)if(pointInside(p.x,p.y,world.bodies[j].p))mutual++;
  }
 }

}
console.log({cases:9,self,mutual,bad,error});if(self||mutual||bad||error>.05)process.exitCode=1;
