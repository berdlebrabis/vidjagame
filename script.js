"use strict";
const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
const overlay=document.getElementById("overlay"),message=document.getElementById("message"),hint=document.getElementById("hint"),startButton=document.getElementById("start");
const scoreLabel=document.getElementById("score"),bestLabel=document.getElementById("best");
const W=canvas.width,H=canvas.height,playerX=160,speed=3.1,verticalSpeed=3.2;
let state="ready",holding=false,y=H/2,trail=[],obstacles=[],distance=0,score=0,best=0,last=0,spawnDistance=0;
try{best=Number(localStorage.getItem("neonWaveBest"))||0}catch(e){}
bestLabel.textContent="Best: "+best;
function reset(){y=H/2;trail=[];obstacles=[];distance=0;score=0;spawnDistance=0;holding=false;scoreLabel.textContent="Score: 0";state="playing";overlay.classList.add("hidden");last=performance.now();requestAnimationFrame(frame)}
function finish(){state="over";holding=false;message.textContent="Wave crashed!";hint.textContent="Score: "+score+" · Try again!";startButton.textContent="Restart";overlay.classList.remove("hidden");if(score>best){best=score;bestLabel.textContent="Best: "+best;try{localStorage.setItem("neonWaveBest",String(best))}catch(e){}}}
function spawn(){const gap=225,top=65+Math.random()*125;obstacles.push({x:W+30,top,bottom:top+gap,width:56})}
function update(dt){const step=Math.min(dt/16.667,2);y+=(holding?-verticalSpeed:verticalSpeed)*step;distance+=speed*step;spawnDistance+=speed*step;
if(spawnDistance>=290){spawnDistance-=290;spawn()}
for(const o of obstacles)o.x-=speed*step;
obstacles=obstacles.filter(o=>o.x+o.width>-10);
trail.push({x:playerX,y});if(trail.length>42)trail.shift();
score=Math.floor(distance/10);scoreLabel.textContent="Score: "+score;
if(y<12||y>H-12){finish();return}
for(const o of obstacles){if(playerX+9>o.x&&playerX-9<o.x+o.width&&(y-9<o.top||y+9>o.bottom)){finish();return}}
}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle="#0a1026";ctx.fillRect(0,0,W,H);
ctx.strokeStyle="#1a2750";ctx.lineWidth=1;const offset=distance%40;
for(let x=-offset;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
for(let yy=0;yy<H;yy+=40){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke()}
ctx.strokeStyle="#8c4bff";ctx.shadowColor="#9b45ff";ctx.shadowBlur=12;ctx.lineWidth=4;ctx.strokeRect(2,2,W-4,H-4);ctx.shadowBlur=0;
for(const o of obstacles){ctx.fillStyle="#492277";ctx.strokeStyle="#f46dff";ctx.lineWidth=3;ctx.shadowColor="#e352ff";ctx.shadowBlur=16;
ctx.fillRect(o.x,0,o.width,o.top);ctx.strokeRect(o.x,0,o.width,o.top);
ctx.fillRect(o.x,o.bottom,o.width,H-o.bottom);ctx.strokeRect(o.x,o.bottom,o.width,H-o.bottom);ctx.shadowBlur=0}
if(trail.length>1){ctx.beginPath();trail.forEach((p,i)=>i?ctx.lineTo(p.x-(trail.length-1-i)*3,p.y):ctx.moveTo(p.x-(trail.length-1-i)*3,p.y));ctx.strokeStyle="#00f5ff";ctx.lineWidth=3;ctx.shadowColor="#00f5ff";ctx.shadowBlur=16;ctx.stroke();ctx.shadowBlur=0}
ctx.save();ctx.translate(playerX,y);ctx.rotate(holding?-Math.PI/4:Math.PI/4);ctx.fillStyle="#b8ffff";ctx.strokeStyle="#00f5ff";ctx.lineWidth=3;ctx.shadowColor="#00f5ff";ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-10,-10);ctx.lineTo(-5,0);ctx.lineTo(-10,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
function frame(now){if(state!=="playing")return;const dt=now-last;last=now;update(dt);draw();if(state==="playing")requestAnimationFrame(frame)}
function press(e){if(e&&e.type==="keydown"&&e.code!=="Space")return;if(e&&e.cancelable)e.preventDefault();if(state==="playing")holding=true}
function release(e){if(e&&e.type==="keyup"&&e.code!=="Space")return;holding=false}
window.addEventListener("keydown",e=>{if(e.code==="KeyR"){reset();return}press(e)});
window.addEventListener("keyup",release);window.addEventListener("blur",()=>holding=false);
canvas.addEventListener("pointerdown",e=>{press(e);canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener("pointerup",release);canvas.addEventListener("pointercancel",release);
startButton.addEventListener("click",reset);draw();
