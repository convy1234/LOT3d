import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

export function fabricTexture() {
  const canvas=document.createElement("canvas");canvas.width=canvas.height=128;
  const c=canvas.getContext("2d"); c.fillStyle="#929292";c.fillRect(0,0,128,128);
  for(let y=0;y<128;y+=2)for(let x=0;x<128;x+=2){
    const v=100+((x*17+y*31)%65);c.fillStyle=`rgb(${v},${v},${v})`;
    c.fillRect(x,y,1,2);c.fillRect(x+1,y+(x%4?0:1),1,1);
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(9,9);
  return texture;
}

export function cushionGeometry(w,h,d,r=.12){
  const s=new THREE.Shape(); const x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const geo=new THREE.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.035,bevelThickness:.035,curveSegments:5});
  geo.translate(0,0,-d/2);return geo;
}

export function addStageDetails(room){
  const material=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness:metalness?.35:.7});
  const chrome=material(0x90969c,.85),dark=material(0x11151b),white=material(0xe9e7da),brass=material(0xb89543,.75);
  const group=new THREE.Group();group.name="stage-instruments";room.add(group);
  function mesh(geometry,mat,x,y,z){const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);group.add(o);return o;}
  function box(w,h,d,mat,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
  function rod(a,b,r=.024,mat=chrome){
    const delta=new THREE.Vector3().subVectors(b,a);
    const o=mesh(new THREE.CylinderGeometry(r,r,delta.length(),8),mat,0,0,0);
    o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;
  }
  const v=(x,y,z)=>new THREE.Vector3(x,y,z);
  // Keyboard with individual white and raised black keys and crossed legs.
  box(3,.2,.85,dark,-7.1,1.95,-31.8);
  for(let i=0;i<36;i++){
    box(.074,.045,.6,white,-8.52+i*.079,2.07,-31.66);
    if(![2,6].includes(i%7))box(.042,.075,.33,dark,-8.48+i*.079,2.12,-31.91);
  }
  rod(v(-8.2,.55,-31.8),v(-6.2,1.85,-31.8),.045,dark);
  rod(v(-6.2,.55,-31.8),v(-8.2,1.85,-31.8),.045,dark);
  box(.8,.16,.65,dark,-7.1,1.15,-33);
  // Full drum kit, heads, metal rims, cymbals and tripod stands.
  const shell=material(0x69351d,.25);
  for(const [x,y,z,r,depth,vertical] of [[8,1.23,-32,.65,.7,false],[7.4,1.95,-32.2,.32,.4,true],[8.25,2.03,-32.3,.37,.42,true],[9,1.35,-32.5,.44,.65,true],[7.05,1.3,-31.8,.35,.25,true]]){
    const drum=mesh(new THREE.CylinderGeometry(r,r,depth,32),shell,x,y,z);
    if(!vertical)drum.rotation.x=Math.PI/2;
    for(const sign of [-1,1]){
      const head=mesh(new THREE.CylinderGeometry(r*.98,r*.98,.025,32),sign===1?white:dark,x,y,z);
      if(vertical)head.position.y+=sign*depth/2;else{head.rotation.x=Math.PI/2;head.position.z+=sign*depth/2;}
      const rim=mesh(new THREE.TorusGeometry(r,.025,6,32),chrome,head.position.x,head.position.y,head.position.z);
      if(vertical)rim.rotation.x=Math.PI/2;
    }
  }
  for(const [x,y,z] of [[6.65,2.65,-32.5],[9.35,2.7,-33],[8.7,2.8,-31.6],[7,2.1,-31.1]]){
    mesh(new THREE.CylinderGeometry(.48,.52,.035,32),brass,x,y,z);
    rod(v(x,.55,z),v(x,y+.07,z));
    for(let a=0;a<3;a++)rod(v(x,.9,z),v(x+Math.cos(a*2.094)*.4,.55,z+Math.sin(a*2.094)*.4));
  }
  // Transparent three-sided drum enclosure with thin chrome joints.
  const glass=new THREE.MeshPhysicalMaterial({color:0xc4d5e5,transparent:true,opacity:.12,roughness:.12,depthWrite:false,side:THREE.DoubleSide});
  for(const x of [6.1,7.1,8.1,9.1,10.1]){
    box(.018,2.7,.025,chrome,x,1.9,-30.65);
    if(x<10)box(.97,2.7,.025,glass,x+.5,1.9,-30.65);
  }
  box(.025,2.7,2.7,glass,10.1,1.9,-32);
  // Pair of orange congas, curved shells and chrome tuning lugs.
  for(const [x,r] of [[11,.32],[11.85,.38]]){
    mesh(new THREE.CylinderGeometry(r,r*.68,1.45,24),material(0xd67a1e,.2),x,1.3,-32);
    mesh(new THREE.CylinderGeometry(r*1.04,r*1.04,.08,24),white,x,2.06,-32);
    for(let a=0;a<8;a++)rod(v(x+Math.cos(a*Math.PI/4)*r,1.65,-32+Math.sin(a*Math.PI/4)*r),v(x+Math.cos(a*Math.PI/4)*r,1.98,-32+Math.sin(a*Math.PI/4)*r),.013);
  }
  // Microphone booms and tripod feet, all above the raised deck.
  for(const x of [-10,-4,0,4,12.8]){
    rod(v(x,.55,-30),v(x,2.4,-30),.018,dark);
    rod(v(x,2.35,-30),v(x+.5,2.55,-30),.018,dark);
    for(let a=0;a<3;a++)rod(v(x,.68,-30),v(x+Math.cos(a*2.094)*.4,.54,-30+Math.sin(a*2.094)*.4),.018,dark);
  }
  // Potted plants frame the LED.
  const leaf=material(0x246039);
  for(const x of [-5.5,5.5]){
    mesh(new THREE.CylinderGeometry(.27,.21,.65,20),white,x,.85,-33.2);
    for(let i=0;i<9;i++){
      const a=i*2.4;const tip=v(x+Math.cos(a)*.65,1.4+(i%3)*.35,-33.2+Math.sin(a)*.5);
      rod(v(x,1.1,-33.2),tip,.012,leaf);
      const blade=mesh(new THREE.SphereGeometry(1,8,6),leaf,tip.x,tip.y,tip.z);blade.scale.set(.11,.5,.045);blade.rotation.z=Math.cos(a)*.7;
    }
  }
}

export function createFlame(scene){
 const canvas=document.createElement("canvas");canvas.width=canvas.height=128;
 const c=canvas.getContext("2d");const glow=c.createRadialGradient(64,64,0,64,64,64);
 glow.addColorStop(0,"rgba(255,255,235,1)");glow.addColorStop(.14,"rgba(255,223,115,.95)");glow.addColorStop(.45,"rgba(255,117,14,.35)");glow.addColorStop(1,"rgba(255,80,0,0)");
 c.fillStyle=glow;c.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(canvas);
 const group=new THREE.Group();group.visible=false;scene.add(group);
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,blending:THREE.AdditiveBlending,depthWrite:false}));sprite.scale.set(1.5,2.4,1);group.add(sprite);
 const light=new THREE.PointLight(0xffa12f,0,13,2);group.add(light);
 const trail=[];
 for(let i=0;i<35;i++){const s=new THREE.Sprite(sprite.material.clone());scene.add(s);s.visible=false;trail.push(s);}
 const curve = new THREE.CatmullRomCurve3([
   new THREE.Vector3(0, 5.15, 34.2),
   new THREE.Vector3(-.7, 3.2, 26),
   new THREE.Vector3(-2, 3, 13),
   new THREE.Vector3(2, 3, -2),
   new THREE.Vector3(-1.5, 3.4, -17),
   new THREE.Vector3(0, 4.5, -34.1),
 ]);
 return {update(progress,time){
  group.visible=progress<1;curve.getPointAt(THREE.MathUtils.clamp(progress,0,1),group.position);
  light.intensity=group.visible?110+Math.sin(time*19)*18:0;
  sprite.scale.set(1.2+Math.sin(time*15)*.16,2.3+Math.cos(time*13)*.25,1);
  trail.forEach((s,i)=>{const t=progress-i*.003;s.visible=progress<1&&t>0;curve.getPointAt(THREE.MathUtils.clamp(t,0,1),s.position);s.position.y+=Math.sin(time*8+i)*.08;s.scale.setScalar((1-i/35)*.75);s.material.opacity=(1-i/35)*.5;});
 }};
}
