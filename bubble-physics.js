// Soap-film membrane adapted from the approved Bubble Model playground.
// Fixed-step XPBD edge, bend and area constraints; point/edge contact.
(() => {
'use strict';
const TAU=Math.PI*2, N=64, DT=1/120;
const presets=[
 {name:'Soap film',edge:.0012,bend:.004,area:0.00002,internal:1.2,drag:.13,recover:.5,flow:1,plastic:0,wave:0,tone:0},
 {name:'Slow glass',edge:.004,bend:.014,area:0.000015,internal:7.5,drag:.42,recover:.17,flow:.64,plastic:.24,wave:0,tone:1},
 {name:'Aurora',edge:.002,bend:.01,area:0.00002,internal:2.2,drag:.23,recover:.65,flow:.8,plastic:0,wave:1,tone:2}
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function center(body){let x=0,y=0;for(const p of body.p){x+=p.x;y+=p.y;}return {x:x/N,y:y/N};}
function area(points){let a=0;for(let i=0;i<N;i++){const p=points[i],q=points[(i+1)%N];a+=p.x*q.y-p.y*q.x;}return a*.5;}
function pointInside(x,y,points){let inside=false;for(let i=0,j=N-1;i<N;j=i++){const p=points[i],q=points[j];if((p.y>y)!=(q.y>y)&&x<(q.x-p.x)*(y-p.y)/(q.y-p.y)+p.x)inside=!inside;}return inside;}
class World{
 constructor(w,h){this.w=w;this.h=h;this.mode=0;this.time=0;this.grab=null;this.meeting=0;this.contacts=0;this.bodies=[];}
 add(cx,cy,rad,index=0){
  const body={p:[],r:rad,target:Math.PI*rad*rad,edges:[],edgeLambda:new Float64Array(N),bendLambda:new Float64Array(N),fairLambda:new Float64Array(N),areaLambda:0,phase:index*2.31,b:index,held:false};
  for(let i=0;i<N;i++){const a=i/N*TAU,r=rad*(1+.022*Math.cos(3*a+index));const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;body.p.push({x,y,ox:x,oy:y,rx:x,ry:y,vx:[13,-14,12,-11,10][index%5],vy:[12,10,-12,-10,-13][index%5]});body.edges.push(TAU*rad/N);}
  const scale=Math.sqrt(body.target/area(body.p));for(const p of body.p){p.x=cx+(p.x-cx)*scale;p.y=cy+(p.y-cy)*scale;p.ox=p.rx=p.x;p.oy=p.ry=p.y;}
  this.bodies.push(body);return body;
 }
 bringTogether(){this.meeting=8;this.grab=null;}
 pick(x,y){for(let b=this.bodies.length-1;b>=0;b--){const body=this.bodies[b];if(pointInside(x,y,body.p)){let nearest=0,d=Infinity;for(let i=0;i<N;i++){let dd=(body.p[i].x-x)**2+(body.p[i].y-y)**2;if(dd<d){d=dd;nearest=i;}}const c=center(body),a=Math.atan2(y-c.y,x-c.x),radial=Math.hypot(x-c.x,y-c.y)/body.r;this.grab={body,index:nearest,x,y,px:x,py:y,offsetX:x-c.x,offsetY:y-c.y,radial,a};return true;}}return false;}
 dragTo(x,y){if(this.grab){this.grab.x=clamp(x,15,this.w-15);this.grab.y=clamp(y,15,this.h-15);}}
 release(){this.grab=null;}
 distanceConstraint(body,i,j,rest,compliance,lambdas,index){const p=body.p[i],q=body.p[j],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,alpha=compliance/(DT*DT),old=lambdas[index];const dl=(-(len-rest)-alpha*old)/(2+alpha);lambdas[index]+=dl;const k=dl/len;p.x-=k*dx;p.y-=k*dy;q.x+=k*dx;q.y+=k*dy;}
 // Maintain a taut local membrane: a pressure-supported perimeter may flatten,
 // but it cannot turn inside out when dragged against a wall.
 preventKinks(body){for(let i=0;i<N;i++){const p=body.p[i],a=body.p[(i+N-1)%N],b=body.p[(i+1)%N],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=dy/len,ny=-dx/len,height=(p.x-(a.x+b.x)*.5)*nx+(p.y-(a.y+b.y)*.5)*ny;if(height<0){const k=-height/1.5;p.x+=nx*k;p.y+=ny*k;a.x-=nx*k*.5;a.y-=ny*k*.5;b.x-=nx*k*.5;b.y-=ny*k*.5;}}}
 areaConstraint(body,cfg){const curr=area(body.p),grads=[];let denom=0;for(let i=0;i<N;i++){const prev=body.p[(i+N-1)%N],next=body.p[(i+1)%N],gx=(next.y-prev.y)*.5,gy=(prev.x-next.x)*.5;grads.push([gx,gy]);denom+=gx*gx+gy*gy;}const alpha=cfg.area/(DT*DT),dl=(-(curr-body.target)-alpha*body.areaLambda)/(denom+alpha);body.areaLambda+=dl;for(let i=0;i<N;i++){body.p[i].x+=dl*grads[i][0];body.p[i].y+=dl*grads[i][1];}}
 contact(A,B){const ca=center(A),cb=center(B);if(Math.hypot(ca.x-cb.x,ca.y-cb.y)>1.18*(A.r+B.r)+8)return;const gap=2.1;
  for(const p of A.p){let best=Infinity,bj=0,bt=0,bx=0,by=0;for(let j=0;j<N;j++){const q=B.p[j],s=B.p[(j+1)%N],dx=s.x-q.x,dy=s.y-q.y,t=clamp(((p.x-q.x)*dx+(p.y-q.y)*dy)/(dx*dx+dy*dy||1),0,1),qx=q.x+t*dx,qy=q.y+t*dy,d=(p.x-qx)**2+(p.y-qy)**2;if(d<best){best=d;bj=j;bt=t;bx=qx;by=qy;}}
   const inside=pointInside(p.x,p.y,B.p);if(!inside&&best>=gap*gap)continue;const dist=Math.sqrt(best),q=B.p[bj],s=B.p[(bj+1)%N];let nx,ny;if(dist>1e-7){nx=(p.x-bx)/dist;ny=(p.y-by)/dist;if(inside){nx=-nx;ny=-ny;}}else{const dx=s.x-q.x,dy=s.y-q.y,l=Math.hypot(dx,dy)||1;nx=dy/l;ny=-dx/l;}let penetration=inside?dist+gap:gap-dist;penetration=Math.min(penetration,12);const w0=1-bt,w1=bt,k=penetration/(1+w0*w0+w1*w1);p.x+=nx*k;p.y+=ny*k;q.x-=nx*k*w0;q.y-=ny*k*w0;s.x-=nx*k*w1;s.y-=ny*k*w1;this.contacts++;
  }
 }
 solveContacts(){for(let i=0;i<this.bodies.length;i++)for(let j=i+1;j<this.bodies.length;j++){this.contact(this.bodies[i],this.bodies[j]);this.contact(this.bodies[j],this.bodies[i]);}}
 // Resolve residual contour penetration after local constraints. This uses the
 // actual membrane's separating axes, never a circle proxy or a clipped image.
 separateContours(A,B){
  let ax0=Infinity,ax1=-Infinity,ay0=Infinity,ay1=-Infinity,bx0=Infinity,bx1=-Infinity,by0=Infinity,by1=-Infinity;
  for(const p of A.p){ax0=Math.min(ax0,p.x);ax1=Math.max(ax1,p.x);ay0=Math.min(ay0,p.y);ay1=Math.max(ay1,p.y);}
  for(const p of B.p){bx0=Math.min(bx0,p.x);bx1=Math.max(bx1,p.x);by0=Math.min(by0,p.y);by1=Math.max(by1,p.y);}
  const gap=.9;if(ax1+gap<bx0||bx1+gap<ax0||ay1+gap<by0||by1+gap<ay0)return 0;
  let minimum=Infinity,nx=0,ny=0;
  for(const body of [A,B])for(let i=0;i<N;i++){
   const p=body.p[i],q=body.p[(i+1)%N],dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy);if(l<1e-6)continue;
   const x=dy/l,y=-dx/l;let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
   for(const v of A.p){const d=v.x*x+v.y*y;amin=Math.min(amin,d);amax=Math.max(amax,d);}
   for(const v of B.p){const d=v.x*x+v.y*y;bmin=Math.min(bmin,d);bmax=Math.max(bmax,d);}
   const left=amax-bmin+gap,right=bmax-amin+gap;if(left<=0||right<=0)return 0;
   if(left<minimum){minimum=left;nx=-x;ny=-y;}if(right<minimum){minimum=right;nx=x;ny=y;}
  }
  if(!Number.isFinite(minimum))return 0;
  for(const p of A.p){p.x+=nx*minimum*.5;p.y+=ny*minimum*.5;}
  for(const p of B.p){p.x-=nx*minimum*.5;p.y-=ny*minimum*.5;}
  return minimum;
 }
 containBody(body){
  const xs=body.p.map(p=>p.x),ys=body.p.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const dx=minX<18?18-minX:maxX>this.w-18?this.w-18-maxX:0,dy=minY<24?24-minY:maxY>this.h-24?this.h-24-maxY:0;
  if(dx||dy)for(const p of body.p){p.x+=dx;p.y+=dy;}return Math.abs(dx)+Math.abs(dy);
 }
 step(ambient=true){const cfg=presets[this.mode];this.time+=DT;this.contacts=0;this.meeting=Math.max(0,this.meeting-DT);const centers=this.bodies.map(center);
  for(let bi=0;bi<this.bodies.length;bi++){const b=this.bodies[bi],c=centers[bi];let meanVX=0,meanVY=0;for(const p of b.p){meanVX+=p.vx/N;meanVY+=p.vy/N;}const other=centers[(bi+1)%centers.length],dx=other.x-c.x,dy=other.y-c.y,dist=Math.hypot(dx,dy)||1;
   b.areaLambda=0;b.edgeLambda.fill(0);b.bendLambda.fill(0);b.fairLambda.fill(0);
   for(let i=0;i<N;i++){const p=b.p[i];p.rx=p.x;p.ry=p.y;p.ox=p.x;p.oy=p.y;
    let ax=0,ay=0;
    if(ambient){const x=(p.x-this.w*.5)/Math.max(200,this.w),y=(p.y-this.h*.5)/Math.max(200,this.h),t=this.time*.15;
     // A common stream function: its curl produces a divergence-free current.
     const sx=Math.sin(2.8*x+t),sy=Math.sin(2.8*y-t*.7),cx=Math.cos(2.8*x+t),cy=Math.cos(2.8*y-t*.7);
     const flowX=(cy*sx*20+Math.cos(t*.35)*9)*cfg.flow,flowY=(-cx*sy*20-Math.sin(t*.4)*9)*cfg.flow;
     ax+=(flowX-meanVX)*.32;ay+=(flowY-meanVY)*.32;
     ax+=(this.w*.5-c.x)*.002;ay+=(this.h*.5-c.y)*.002;
     const cruise=Math.hypot(meanVX,meanVY);if(cruise<18){const a=Math.atan2(meanVY||Math.sin(b.phase),meanVX||Math.cos(b.phase));ax+=Math.cos(a)*(18-cruise)*.8;ay+=Math.sin(a)*(18-cruise)*.8;}
     if(b.held){ax=-meanVX*18;ay=-meanVY*18;}
    }
    if(this.meeting>0){const speed=this.meeting>3?15: -8;ax+=(dx/dist*speed-meanVX)*.9;ay+=(dy/dist*speed-meanVY)*.9;}
    const rx=p.x-c.x,ry=p.y-c.y,r=Math.hypot(rx,ry)||1,ang=Math.atan2(ry,rx);let target=b.r;
    if(cfg.wave)target*=1+.115*Math.sin(3*ang-this.time*.72+b.phase)+.045*Math.cos(2*ang+this.time*.39);
    const recover=(target-r)*cfg.recover;ax+=rx/r*recover;ay+=ry/r*recover;
    // Remove internal velocity while preserving bulk translation.
    const internal=Math.exp(-cfg.internal*DT);p.vx=meanVX+(p.vx-meanVX)*internal;p.vy=meanVY+(p.vy-meanVY)*internal;
    p.vx=(p.vx+ax*DT)*Math.exp(-cfg.drag*DT);p.vy=(p.vy+ay*DT)*Math.exp(-cfg.drag*DT);
    if(this.grab&&this.grab.body===b){const g=this.grab;let diff=Math.abs(i-g.index);diff=Math.min(diff,N-diff);let weight=g.radial<.65?1:Math.exp(-diff*diff/45)*.45+.55;const anchorX=c.x+g.offsetX,anchorY=c.y+g.offsetY;const margin=b.r*1.02,goalX=clamp(g.x-g.offsetX,margin+18,this.w-margin-18)+g.offsetX,goalY=clamp(g.y-g.offsetY,margin+24,this.h-margin-24)+g.offsetY;const gx=clamp(goalX-anchorX,-b.r,b.r),gy=clamp(goalY-anchorY,-b.r,b.r);p.vx+=(gx*weight*55-p.vx*weight*10)*DT;p.vy+=(gy*weight*55-p.vy*weight*10)*DT;}
    const speed=Math.hypot(p.vx,p.vy),cap=230;if(speed>cap){p.vx*=cap/speed;p.vy*=cap/speed;}p.x+=p.vx*DT;p.y+=p.vy*DT;
   }
  }
  for(let iteration=0;iteration<12;iteration++){
   for(const b of this.bodies){for(let i=0;i<N;i++){const wave=cfg.wave?1+.06*Math.sin(i/N*TAU*3-this.time*.72+b.phase):1;this.distanceConstraint(b,i,(i+1)%N,b.edges[i]*wave,cfg.edge,b.edgeLambda,i);this.distanceConstraint(b,i,(i+2)%N,2*b.r*Math.sin(TAU/N)*wave,cfg.bend,b.bendLambda,i);this.distanceConstraint(b,i,(i+4)%N,2*b.r*Math.sin(2*TAU/N)*wave,cfg.bend*.7,b.fairLambda,i);}this.preventKinks(b);this.areaConstraint(b,cfg);}
   if(iteration%3===2)this.solveContacts();
   for(const b of this.bodies)for(const p of b.p){p.x=clamp(p.x,18,this.w-18);p.y=clamp(p.y,24,this.h-24);}
  }
  for(let i=0;i<4;i++){
   for(const b of this.bodies){this.preventKinks(b);for(const p of b.p){p.x=clamp(p.x,18,this.w-18);p.y=clamp(p.y,24,this.h-24);}}
   this.solveContacts();
  }
  for(let pass=0;pass<16;pass++){
   let correction=0;
   for(const b of this.bodies)correction=Math.max(correction,this.containBody(b));
   for(let i=0;i<this.bodies.length;i++)for(let j=i+1;j<this.bodies.length;j++)correction=Math.max(correction,this.separateContours(this.bodies[i],this.bodies[j]));
   if(correction<.001)break;
  }
  for(const b of this.bodies){for(let i=0;i<N;i++){const p=b.p[i];p.x=clamp(p.x,18,this.w-18);p.y=clamp(p.y,24,this.h-24);p.vx=(p.x-p.ox)/DT;p.vy=(p.y-p.oy)/DT;if(cfg.plastic){const q=b.p[(i+1)%N],length=Math.hypot(p.x-q.x,p.y-q.y);b.edges[i]+=(length-b.edges[i])*cfg.plastic*DT;}}if(cfg.plastic){const sum=b.edges.reduce((a,b)=>a+b,0),scale=TAU*b.r/sum;for(let i=0;i<N;i++)b.edges[i]*=scale;}}
 }
}

function smoothOutline(points, subdivisions=4){
 const output=[],count=points.length;
 for(let i=0;i<count;i++)for(let k=0;k<subdivisions;k++){
  const t=k/subdivisions,t2=t*t,t3=t2*t;
  const weights=[(1-3*t+3*t2-t3)/6,(4-6*t2+3*t3)/6,(1+3*t+3*t2-3*t3)/6,t3/6];
  const p=[points[(i+count-1)%count],points[i],points[(i+1)%count],points[(i+2)%count]];
  output.push({x:p.reduce((s,q,j)=>s+q.x*weights[j],0),y:p.reduce((s,q,j)=>s+q.y*weights[j],0)});
 }
 return output;
}
globalThis.BubblePhysics={World,N,DT,area,pointInside,center,smoothOutline,clamp};
})();
