// The approved soap-film optics on a smooth, simulated contour. Content is HTML.
(() => {
'use strict';
const {N,smoothOutline}=BubblePhysics;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const states=[],padding=56;
let raf=0,last=0,time=0;
const vshader=`attribute vec2 position;attribute vec2 local;attribute vec2 normal;attribute float depth;uniform vec2 resolution;varying vec2 vLocal;varying vec2 vNormal;varying float vDepth;void main(){vLocal=local;vNormal=normal;vDepth=depth;gl_Position=vec4(position/resolution*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);}`;
const fshader=`precision highp float;varying vec2 vLocal;varying vec2 vNormal;varying float vDepth;uniform float radius;uniform float time;uniform float seed;uniform float mode;uniform float expanded;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),u.x),u.y);}
    vec3 film(float h, float cosT) {
      float k = 4. * 3.14159 * 1.33 * h * cosT;
      vec3 c = vec3(0.);
      c += vec3(.0055,-.0047,.0336) * pow(sin(k / 405.), 2.);
      c += vec3(.0487,-.0620,.4921) * pow(sin(k / 434.), 2.);
      c += vec3(-.0143,-.0172,.4829) * pow(sin(k / 463.), 2.);
      c += vec3(-.1122,.1227,.1133) * pow(sin(k / 492.), 2.);
      c += vec3(-.2069,.3680,-.0172) * pow(sin(k / 521.), 2.);
      c += vec3(-.0291,.4117,-.0487) * pow(sin(k / 550.), 2.);
      c += vec3(.3618,.2206,-.0370) * pow(sin(k / 579.), 2.);
      c += vec3(.5692,.0001,-.0146) * pow(sin(k / 608.), 2.);
      c += vec3(.3094,-.0350,-.0035) * pow(sin(k / 637.), 2.);
      c += vec3(.0633,-.0050,-.0010) * pow(sin(k / 666.), 2.);
      c += vec3(.0047,.0008,-.0002) * pow(sin(k / 695.), 2.);
      return max(c * 2., 0.);
    }

void main(){float d=max(vDepth,0.);float s=clamp(d/radius,0.,1.);float nz=sqrt(max(1.-(1.-s)*(1.-s),0.));vec2 outward=normalize(vNormal);float angle=atan(outward.y,outward.x);float h=600.+250.*vLocal.y+170.*sin(angle*2.+time*.15+seed)+80.*noise(vLocal*3.+vec2(time*.08,seed));h=mix(h,620.+200.*sin(angle+time*.1+seed)+80.*noise(vLocal*.6+seed),expanded);vec3 tint=film(h,sqrt(1.-(1.-nz*nz)/1.769));tint=mix(tint,vec3(dot(tint,vec3(.2126,.7152,.0722))),.23);tint=mix(tint,vec3(1.),pow(1.-nz,4.)*.4);float fresnel=pow(1.-nz,5.);float glow=pow(clamp(1.-d/(radius*.2),0.,1.),1.6);vec3 front=vec3(2.*nz*outward*sqrt(max(1.-nz*nz,0.)),2.*nz*nz-1.);vec3 light=tint*(fresnel*.5+glow*.2);float glint=exp(-pow(length(front-normalize(vec3(-.6,-.66,-.3)))/.34,2.));light+=mix(tint,vec3(1.),.55)*glint*.52;
if(mode>.5&&mode<1.5){vec3 pearl=mix(vec3(.62,.75,.86),vec3(.84,.74,.62),.5+.5*sin(angle+seed));light=mix(light,pearl*(fresnel*.32+glow*.42),.7);light+=pearl*pow(clamp(1.-d/(radius*.36),0.,1.),2.)*.036;}
if(mode>1.5){vec3 aurora=mix(vec3(.34,.87,.85),vec3(.85,.53,.89),.5+.5*sin(angle*2.-time*.2+seed));light=mix(light,aurora*(fresnel*.4+glow*.45),.73);light+=aurora*exp(-pow((d-5.)/4.,2.))*.045;}
light*=mix(1.,.63,expanded);light=1.-exp(-light*1.3);float edge=smoothstep(-.6,.8,vDepth);light*=edge;gl_FragColor=vec4(light,clamp(max(light.r,max(light.g,light.b)),0.,1.));}`;
function panelPoints(w,h,open){
  const rx=Math.max(1,w/2-7),ry=Math.max(1,h/2-7),n=open?(w<500?3.5:2.9):2;
  return Array.from({length:N},(_,i)=>{const a=i/N*Math.PI*2,c=Math.cos(a),s=Math.sin(a);return {x:w/2+rx*Math.sign(c)*Math.pow(Math.abs(c),2/n),y:h/2+ry*Math.sign(s)*Math.pow(Math.abs(s),2/n)};});
}
function initialize(s){
 const gl=s.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,depth:false,powerPreference:'low-power'});
 if(!gl)return;
 s.gl=gl;
 function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;}
 const program=gl.createProgram(),shaders=[compile(gl.VERTEX_SHADER,vshader),compile(gl.FRAGMENT_SHADER,fshader)];
 shaders.forEach(shader=>gl.attachShader(program,shader));gl.linkProgram(program);shaders.forEach(shader=>gl.deleteShader(shader));
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Could not link soap-film material');
 s.program=program;s.buffer=gl.createBuffer();gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,s.buffer);
 for(const [name,count,offset] of [['position',2,0],['local',2,8],['normal',2,16],['depth',1,24]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,count,gl.FLOAT,false,28,offset);}
 s.locations=Object.fromEntries(['resolution','radius','time','seed','mode','expanded'].map(name=>[name,gl.getUniformLocation(program,name)]));
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);s.ready=true;
}
function sizeCanvas(s,left,top,w,h){
 const density=Math.min(devicePixelRatio||1,1.7,2560/Math.max(w,h));
 for(const c of [s.canvas,s.fallback])Object.assign(c.style,{left:`${left}px`,top:`${top}px`,width:`${w}px`,height:`${h}px`});
 const pw=Math.max(1,Math.round(w*density)),ph=Math.max(1,Math.round(h*density));
 for(const c of [s.canvas,s.fallback])if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph;}
 s.ctx.setTransform(density,0,0,density,0,0);
 s.box={left,top,w,h};
 if(s.ready)s.gl.viewport(0,0,pw,ph);
}
function fit(s){
 if(s.morph)return;
 const w=s.bubble.offsetWidth,h=s.bubble.offsetHeight;
 if(!w||!h)return;
 sizeCanvas(s,-padding,-padding,w+padding*2,h+padding*2);
 s.points=!s.bubble.open&&s.target?s.target.map(p=>({...p})):panelPoints(w,h,s.bubble.open);
 s.radius=Math.min(w,h)/2-7;s.openMix=s.bubble.open?1:0;draw(s);
}
function draw(s){
 if(!s.points)return;
 const gl=s.gl,loc=s.locations,points=smoothOutline(s.points),count=points.length;
 let cx=0,cy=0;for(const p of points){cx+=p.x/count;cy+=p.y/count;}
 const normals=points.map((p,i)=>{const a=points[(i+count-1)%count],b=points[(i+1)%count],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;return {x:dy/l,y:-dx/l};});
 if(!s.ready){
  const ctx=s.ctx;ctx.clearRect(0,0,s.box.w,s.box.h);
  const grad=ctx.createLinearGradient(cx-s.radius-s.box.left,cy-s.radius-s.box.top,cx+s.radius-s.box.left,cy+s.radius-s.box.top);
  grad.addColorStop(0,'#bfd4e2');grad.addColorStop(.3,'#b6a6cb');grad.addColorStop(.62,'#89b6b9');grad.addColorStop(1,'#dfb7ca');
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x-s.box.left,p.y-s.box.top):ctx.moveTo(p.x-s.box.left,p.y-s.box.top));ctx.closePath();
  ctx.strokeStyle=grad;ctx.lineWidth=1.6;ctx.shadowColor='#a3c6d540';ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;return;
 }
 const radius=s.radius,rings=[-.7,.4,1.8,4,8,14,radius*.22,radius*.34,radius*.48].sort((a,b)=>a-b);
 const needed=(rings.length-1)*count*6*7;
 if(!s.data||s.data.length!==needed)s.data=new Float32Array(needed);
 let cursor=0;
 function vertex(i,d){const p=points[i],n=normals[i],x=p.x-n.x*d,y=p.y-n.y*d;const data=s.data;data[cursor++]=x-s.box.left;data[cursor++]=y-s.box.top;data[cursor++]=(x-cx)/radius;data[cursor++]=(y-cy)/radius;data[cursor++]=n.x;data[cursor++]=n.y;data[cursor++]=d;}
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<count;i++){const j=(i+1)%count;vertex(i,rings[k]);vertex(j,rings[k]);vertex(i,rings[k+1]);vertex(j,rings[k]);vertex(j,rings[k+1]);vertex(i,rings[k+1]);}
 gl.useProgram(s.program);gl.bindBuffer(gl.ARRAY_BUFFER,s.buffer);gl.bufferData(gl.ARRAY_BUFFER,s.data,gl.DYNAMIC_DRAW);
 gl.uniform2f(loc.resolution,s.box.w,s.box.h);gl.uniform1f(loc.radius,Math.min(radius,156));gl.uniform1f(loc.time,reduced.matches?0:time);gl.uniform1f(loc.seed,s.seed);gl.uniform1f(loc.mode,0);gl.uniform1f(loc.expanded,s.openMix||0);
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,cursor/7);
}
function morph(s,detail){
 const fromPoints=(s.points||panelPoints(detail.from.width,detail.from.height,detail.from.open)).map(p=>({x:p.x+detail.from.left-detail.to.left,y:p.y+detail.from.top-detail.to.top}));
 const toPoints=!detail.to.open&&s.target?s.target.map(p=>({...p})):panelPoints(detail.to.width,detail.to.height,detail.to.open);
 s.morph=null;
 if(reduced.matches||!detail.duration){fit(s);return;}
 const xs=fromPoints.map(p=>p.x),ys=fromPoints.map(p=>p.y);
 const left=Math.min(0,...xs)-padding,top=Math.min(0,...ys)-padding;
 sizeCanvas(s,left,top,Math.max(detail.to.width,...xs)-left+padding,Math.max(detail.to.height,...ys)-top+padding);
 s.morph={from:fromPoints,to:toPoints,start:performance.now(),duration:detail.duration,fromMix:s.openMix||0,toMix:detail.to.open?1:0,fromRadius:s.radius,toRadius:Math.min(detail.to.width,detail.to.height)/2-7};
 s.points=fromPoints;draw(s);schedule();
}
function schedule(){if(!raf&&!document.hidden&&!reduced.matches&&states.some(s=>s.visible||s.morph)){last=performance.now();raf=requestAnimationFrame(tick);}}
function tick(now){
 raf=0;time+=Math.min(.05,(now-last)/1000);last=now;
 for(const s of states){
  if(s.morph){const m=s.morph,t=Math.min(1,(now-m.start)/m.duration),ease=1-Math.pow(1-t,4);
   s.points=m.from.map((p,i)=>({x:p.x+(m.to[i].x-p.x)*ease,y:p.y+(m.to[i].y-p.y)*ease}));s.radius=m.fromRadius+(m.toRadius-m.fromRadius)*ease;s.openMix=m.fromMix+(m.toMix-m.fromMix)*ease;
   if(t===1){s.morph=null;fit(s);}else draw(s);
  }else if(s.visible&&(!s.driven||s.bubble.open))draw(s);
 }
 if(!document.hidden&&!reduced.matches&&states.some(s=>s.visible||s.morph))raf=requestAnimationFrame(tick);
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const s=states.find(s=>s.bubble===entry.target);s.visible=entry.isIntersecting;if(s.visible)draw(s);}schedule();},{rootMargin:'80px'});
for(const [index,bubble] of [...document.querySelectorAll('.work-bubble')].entries()){
 const surface=bubble.querySelector('.bubble-surface'),canvas=document.createElement('canvas');canvas.className='bubble-canvas';canvas.setAttribute('aria-hidden','true');const fallback=document.createElement('canvas');fallback.className='bubble-canvas';fallback.setAttribute('aria-hidden','true');surface.append(canvas,fallback);
 const s={bubble,surface,canvas,fallback,ctx:fallback.getContext('2d'),seed:index*2.31,points:null,target:null,morph:null,ready:false,visible:false,driven:false,radius:100};states.push(s);
 try{initialize(s);if(s.ready)surface.classList.add('has-bubble-engine');}catch{ s.ready=false; }
 canvas.hidden=!s.ready;fallback.hidden=s.ready;surface.classList.add('has-bubble-engine');fit(s);observer.observe(bubble);
 new ResizeObserver(()=>fit(s)).observe(bubble);
 bubble.addEventListener('bubblecontourtarget',event=>{s.target=event.detail.points;s.driven=true;});
 bubble.addEventListener('bubblecontour',event=>{
  s.target=event.detail.points;s.driven=true;
  if(s.morph||bubble.open)return;
  s.points=s.target;s.radius=event.detail.radius;
  if(s.visible||reduced.matches)draw(s);
 });
 bubble.addEventListener('bubblemorph',event=>morph(s,event.detail));
 bubble.addEventListener('bubblesettle',()=>{s.morph=null;fit(s);});
 bubble.addEventListener('bubblestatic',()=>{s.target=null;s.driven=false;s.morph=null;fit(s);});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();s.ready=false;canvas.hidden=true;fallback.hidden=false;draw(s);});
 canvas.addEventListener('webglcontextrestored',()=>{try{initialize(s);canvas.hidden=!s.ready;fallback.hidden=s.ready;fit(s);}catch{s.ready=false;}schedule();});
}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;if(!document.hidden)schedule();});
reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;for(const s of states){s.morph=null;fit(s);}schedule();});
})();
