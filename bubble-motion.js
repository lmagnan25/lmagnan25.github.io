// The website bridge for the playground's pressure-supported membranes.
(() => {
'use strict';
const {World,DT,N,center,clamp}=BubblePhysics;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const arenas=[];
let raf=0,last=0,accumulator=0;
function paint(arena,alpha=1,endpoint=false){
 for(const body of arena.world.bodies){
  const item=body.item,points=body.p.map(p=>({x:p.rx+(p.x-p.rx)*alpha,y:p.ry+(p.y-p.ry)*alpha}));
  const c=points.reduce((s,p)=>({x:s.x+p.x/N,y:s.y+p.y/N}),{x:0,y:0});
  const left=c.x-item.size/2,top=c.y-item.size/2;
  item.element.style.transform=`translate3d(${left.toFixed(3)}px,${(arena.top+top).toFixed(3)}px,0)`;
  // Match pointer targeting to the membrane, so a neighbor's transparent
  // bounding-box corner cannot steal a click or a drag.
  const hit=points.map(p=>{const dx=p.x-c.x,dy=p.y-c.y,l=Math.hypot(dx,dy)||1;return `${(p.x-left+dx/l*3).toFixed(2)}px ${(p.y-top+dy/l*3).toFixed(2)}px`;});
  item.element.querySelector('summary').style.clipPath=endpoint?'':`polygon(${hit.join(',')})`;
  item.element.dispatchEvent(new CustomEvent(endpoint?'bubblecontourtarget':'bubblecontour',{detail:{points:points.map(p=>({x:p.x-left,y:p.y-top})),radius:body.r}}));
 }
}
function stopDrag(arena){
 if(arena.drag){arena.drag.item.element.classList.remove('is-dragging');arena.drag=null;}
 arena.world?.release();
}
function measurements(arena){
 const width=arena.list.clientWidth;
 const sizes=arena.items.map(item=>{
  const css=getComputedStyle(item.element);
  return Math.min(parseFloat(css.getPropertyValue('--bubble-size')),width*.4)*1.25*parseFloat(css.getPropertyValue('--bubble-scale'));
 });
 return width>0&&sizes.every(size=>Number.isFinite(size)&&size>14)?{width,sizes}:null;
}
function staticLayout(arena){
 arena.world=null;arena.width=0;arena.openHeight=0;arena.top=0;
 arena.list.classList.remove('is-floating');arena.list.style.removeProperty('height');
 for(const item of arena.items){
  item.element.style.removeProperty('--floating-size');item.element.style.removeProperty('transform');
  item.element.querySelector('summary').style.removeProperty('clip-path');
  item.element.dispatchEvent(new Event('bubblestatic'));
 }
}
function layout(arena,duration=0){
 const {list,items}=arena;
 stopDrag(arena);
 clearTimeout(arena.retry);arena.retry=0;
 if(reduced.matches){staticLayout(arena);return;}
 // A cold load can reach this code before the first usable style/layout pass.
 // Never take the cards out of flow or seed physics with missing dimensions.
 const measured=measurements(arena);
 if(!measured){
  if(arena.world||list.classList.contains('is-floating'))staticLayout(arena);
  arena.retry=setTimeout(()=>layout(arena),document.hidden?1000:250);
  return;
 }
 const {width,sizes}=measured;
 const closed=items.filter(item=>!item.element.open),open=items.find(item=>item.element.open);
 const narrow=width<620;
 for(const [index,item] of items.entries())item.size=sizes[index];
 const maxSize=Math.max(...closed.map(i=>i.size),180);
 const height=narrow?Math.max(350,closed.length*(maxSize*.96)+36):Math.max(420,closed.length>3?maxSize*2.9:maxSize*2.25);
 const old=arena.world,world=new World(width,height);
 // ATLAS is first in reading order and starts at the uppermost position.
 const positions=[[.5,.19],[.23,.49],[.77,.48],[.35,.81],[.67,.81]];
 const targets=closed.map((item,index)=>{
  const oldBody=old?.bodies.find(body=>body.item===item&&body.p.every(p=>[p.x,p.y,p.vx,p.vy].every(Number.isFinite))),c=oldBody?center(oldBody):null;
  const r=item.size/2-7;
  const xy=narrow?[(index%2?.63:.37),(index+.5)/closed.length]:positions[index];
  return {item,r,x:c?c.x*width/old.w:width*xy[0],y:c?c.y*height/old.h:height*xy[1],oldBody};
 });
 // Repacks only at an actual layout change, never during simulation.
 for(let pass=0;pass<48;pass++){
  for(const b of targets){b.x=clamp(b.x,b.r+22,width-b.r-22);b.y=clamp(b.y,b.r+28,height-b.r-28);}
  for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){
   const a=targets[i],b=targets[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,over=a.r+b.r+10-d;
   if(over>0){a.x-=dx/d*over*.5;a.y-=dy/d*over*.5;b.x+=dx/d*over*.5;b.y+=dy/d*over*.5;}
  }
 }
 for(const b of targets){
  const index=items.indexOf(b.item),body=world.add(b.x,b.y,b.r,index);body.item=b.item;
  // A stronger opening impulse brings the membranes into contact sooner.
  // Preserve momentum when a project opens or the layout resizes.
  const velocity=b.oldBody
   ? b.oldBody.p.reduce((v,p)=>[v[0]+p.vx/N,v[1]+p.vy/N],[0,0])
   : [[4,30],[28,-5],[-28,7],[19,-21],[-21,-19]][index];
  for(const p of body.p){p.vx=velocity[0];p.vy=velocity[1];}
 }
 // Commit the floating layout only after every body has valid geometry.
 for(const item of items){
  item.element.style.setProperty('--floating-size',`${item.size}px`);
  if(item.element.open){item.element.style.removeProperty('transform');item.element.querySelector('summary').style.removeProperty('clip-path');}
 }
 list.classList.add('is-floating');
 arena.world=world;arena.width=width;arena.openHeight=open?open.element.offsetHeight:0;arena.top=arena.openHeight?arena.openHeight+40:0;
 list.style.height=`${arena.top+height}px`;arena.freezeUntil=performance.now()+duration+32;
 paint(arena,1,duration>0);schedule();
}
function schedule(){if(raf||document.hidden||reduced.matches||!arenas.some(a=>a.visible&&a.world))return;last=performance.now();accumulator=0;raf=requestAnimationFrame(tick);}
function tick(now){
 raf=0;if(document.hidden||reduced.matches)return;
 accumulator+=Math.min(.05,(now-last)/1000)*1.64;last=now;
 while(accumulator>=DT){for(const arena of arenas){if(!arena.world||!arena.visible||now<arena.freezeUntil)continue;for(const b of arena.world.bodies)b.held=b.item.element.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');arena.world.step();}accumulator-=DT;}
 for(const arena of arenas)if(arena.world&&arena.visible&&now>=arena.freezeUntil)paint(arena,accumulator/DT);
 if(arenas.some(a=>a.visible&&a.world))raf=requestAnimationFrame(tick);
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const arena=arenas.find(a=>a.list===entry.target);arena.visible=entry.isIntersecting;if(!arena.visible)stopDrag(arena);}schedule();},{rootMargin:'80px'});
for(const list of document.querySelectorAll('.bubble-list')){
 const items=[...list.querySelectorAll('.work-bubble')].map(element=>({element,size:0,suppressUntil:0}));
 const arena={list,items,world:null,width:0,openHeight:0,top:0,visible:false,freezeUntil:0,drag:null,retry:0};arenas.push(arena);
 const eventPoint=event=>{const r=list.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top-arena.top};};
 for(const item of items){
  const summary=item.element.querySelector('summary');
  summary.addEventListener('pointerdown',event=>{
   if(!arena.world||event.button!==0||item.element.open||reduced.matches||performance.now()<arena.freezeUntil)return;
   const p=eventPoint(event);
   if(!arena.world.pick(p.x,p.y))return;
   arena.drag={item,id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
   summary.setPointerCapture(event.pointerId);
  });
  summary.addEventListener('pointermove',event=>{
   const drag=arena.drag;if(!drag||drag.item!==item||drag.id!==event.pointerId)return;
   if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;
   if(drag.moved){const p=eventPoint(event);arena.world.dragTo(p.x,p.y);item.element.classList.add('is-dragging');event.preventDefault();}
  });
  function release(event){const drag=arena.drag;if(!drag||drag.item!==item||drag.id!==event.pointerId)return;if(drag.moved)item.suppressUntil=performance.now()+500;stopDrag(arena);}
  summary.addEventListener('pointerup',release);summary.addEventListener('pointercancel',release);summary.addEventListener('lostpointercapture',release);
  summary.addEventListener('click',event=>{if(performance.now()<item.suppressUntil){event.preventDefault();event.stopImmediatePropagation();item.suppressUntil=0;}},true);
 }
 list.addEventListener('bubblelayout',event=>layout(arena,event.detail.duration));
 const refresh=()=>{
  if(reduced.matches)return;
  const measured=measurements(arena);
  const open=items.find(item=>item.element.open),height=open?open.element.offsetHeight:0;
  if(!arena.world||!measured||Math.abs(measured.width-arena.width)>.5||height!==arena.openHeight||measured.sizes.some((size,i)=>Math.abs(size-items[i].size)>.5)){
   list.dispatchEvent(new Event('bubblecanceltransition'));layout(arena);items.forEach(item=>item.element.dispatchEvent(new Event('bubblesettle')));
  }
 };
 // Apply layout in the next frame, outside ResizeObserver delivery. Writing
 // measured sizes in its callback can drop Safari's pending notifications.
 let resizeFrame=0;
 const resize=new ResizeObserver(()=>{
  if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;refresh();});
 });
 resize.observe(list);items.forEach(item=>resize.observe(item.element));
 // Retry after loading/restoring the page as well as after geometry changes.
 addEventListener('load',refresh,{once:true});addEventListener('pageshow',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 requestAnimationFrame(()=>layout(arena));observer.observe(list);
}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;arenas.forEach(stopDrag);if(!document.hidden)schedule();});
reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;for(const arena of arenas){arena.list.dispatchEvent(new Event('bubblecanceltransition'));layout(arena);arena.items.forEach(item=>item.element.dispatchEvent(new Event('bubblesettle')));}schedule();});
})();
