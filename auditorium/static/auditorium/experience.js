import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
import {fabricTexture, cushionGeometry, addStageDetails, createFlame} from "./details.js";

const canvas = document.querySelector("#church-canvas");
const loading = document.querySelector("#loading");
const intro = document.querySelector("#intro-card");
const enterButton = document.querySelector("#enter-button");
const lightButton = document.querySelector("#lighting-button");
const viewLabel = document.querySelector("#view-label");
const controls = [...document.querySelectorAll(".view-control")];
const cameraMenu = document.querySelector("#camera-menu");
const sectionButtons = [...document.querySelectorAll("[data-section]")];
const conferencePanel = document.querySelector("#conference-panel");
const panelTitle = document.querySelector("#panel-title");
const panelContents = [...conferencePanel.querySelectorAll("[data-panel]")];
const ministerButtons = [...conferencePanel.querySelectorAll(".minister-option")];
const ledPlayer = document.querySelector("#led-player");
const ledZoom = document.querySelector("#zoom-video-led");
const skipIntro = document.querySelector("#skip-intro");
const worshipAudio = document.querySelector("#worship-audio");
const musicToggle = document.querySelector("#music-toggle");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070d);
scene.fog = new THREE.Fog(0x18191d, 100, 180);

const camera = new THREE.PerspectiveCamera(window.innerWidth < 700 ? 83 : 58, window.innerWidth / window.innerHeight, .1, 180);
const clock = new THREE.Clock();
const gold = 0xd9942a;
const blue = 0x164fc5;
const ivory = 0xeee1ca;
const black = 0x090b10;
const room = new THREE.Group();
scene.add(room);

const mat = (color, roughness = .55, metalness = .05) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const box = (w, h, d, material, x = 0, y = 0, z = 0) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; room.add(mesh); return mesh; };

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Mirror two identical seating blocks on each side of the centre aisle.
const chairsPerBlock = 9;
const chairPitch = 1.45;
const firstChairX = 1.7;
const aisleChairGap = 2.85; // Centre-to-centre gap across each side aisle.
const outerBlockOffset = (chairsPerBlock - 1) * chairPitch + aisleChairGap;
const sideAisleX = firstChairX + (chairsPerBlock - 1) * chairPitch + aisleChairGap / 2;
const sideWallX = 20.7 + outerBlockOffset;
const hallWidth = 2 * (sideWallX + .3);
const stageWidth = hallWidth - 2;
const stageWingX = 13.4 + outerBlockOffset * .6;
const stageTrussWidth = stageWidth - 9;
const stageFixtureCountPerSide = Math.floor((stageTrussWidth / 2 - .5) / 2);

// Black carpet and raised altar stage.
box(hallWidth, .25, 76, mat(0x08090d, .95), 0, -.16, 0);
box(stageWidth, .65, 7.5, mat(0x11131b, .8), 0, .17, -31);
box(hallWidth, 11, .4, mat(ivory), 0, 5.5, -35.6);
box(hallWidth, .2, 76, mat(0x17171b), 0, 12, 0);
for (let i = 0; i < 3; i++) {
 box(7.2, .16, .55, mat(0x141416, .9), 0, .08 + i * .17, -25.9 - i * .55);
 box(7.1,.025,.035,new THREE.MeshBasicMaterial({color:0xffbd55}),0,.16+i*.17,-25.60-i*.55);
}
box(stageWidth - 1,.025,.035,new THREE.MeshBasicMaterial({color:0xffbd55}),0,.51,-27.23);

// Side and back walls.
box(hallWidth, 12, .55, mat(0x151720), 0, 6, 36.5);
const sideWallMaterial = mat(0x9c958c);
const acoustic = mat(0x161a22, .9);
for (const side of [-1, 1]) {
  box(.55, 12, 76, sideWallMaterial, side * sideWallX, 6, 0);
  for (let z = -23; z < 33; z += 4.2) {
    for (let y = 2.2; y < 9; y += 2.2) box(.16, 1.25, 2.6, acoustic, side * (sideWallX - .37), y, z);
  }
}

// Rear architectural band and technical partitions.
box(hallWidth - 2, 2, .35, mat(0xd6cdbd), 0, 10.7, 35.95);
box(14.5, 2.1, .75, mat(0xd9d0bd), 7.6, 1.05, 33.7);
box(8.8, 2.1, .75, mat(0xd9d0bd), -11.8, 1.05, 33.7);
box(3.4, 3.6, .3, mat(0x513817), -2.7, 1.8, 36.03);

// Shallow scalloped relief panels, with luminous recessed edges.
function contour(radius) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= 180; i++) {
    const a = i / 180 * Math.PI * 2;
    const r = radius * (1 + .025 * Math.sin(a * 19) + .016 * Math.cos(a * 11));
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  return shape;
}
for (const side of [-1, 1]) {
  const group = new THREE.Group();
  group.position.set(side * stageWingX, 5.3, -35.25);
  group.scale.x = stageWidth / 40;
  room.add(group);
  for (let i = 0; i < 6; i++) {
    const radius = 5.2 - i * .67;
    const glow = new THREE.Mesh(new THREE.ShapeGeometry(contour(radius + .11)), new THREE.MeshBasicMaterial({color:0xffa514}));
    glow.position.z = i * .09; group.add(glow);
    const panel = new THREE.Mesh(new THREE.ExtrudeGeometry(contour(radius), {depth:.075, bevelEnabled:true, bevelSegments:2, steps:1, bevelSize:.025, bevelThickness:.025}), mat(i%2 ? 0xc3aa84 : 0xe9d8b9));
    panel.position.z = i * .09 + .012; group.add(panel);
  }
}
// The tall flowing central relief connects the two side features.
for (const side of [-1, 1]) {
  const shape = new THREE.Shape();
  shape.moveTo(side * 1.2, 10.8);
  shape.bezierCurveTo(side * .6, 7.5, side * 5.3, 7.1, side * 5.8, .7);
  shape.lineTo(side * 7.5, .7);
  shape.bezierCurveTo(side * 7.2, 7.8, side * 3.4, 7.8, side * 3.1, 10.8);
  shape.closePath();
  const panel = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.32, bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:3}),mat(ivory));
  panel.position.z=-35.05; room.add(panel);
  const edge=new THREE.Line(new THREE.BufferGeometry().setFromPoints(shape.getPoints(80).map(p=>new THREE.Vector3(p.x,p.y,-34.87))),new THREE.LineBasicMaterial({color:0xffb13b}));room.add(edge);
}
// The real central relief has three tall hanging lobes above the LED.
for(const [x,w,bottom] of [[-3.4,2.8,6.9],[0,2.5,6.5],[3.4,2.8,6.9]]){
 const s=new THREE.Shape();s.moveTo(x-w/2,10.9);s.lineTo(x+w/2,10.9);
 s.bezierCurveTo(x+w*.55,9,x+w*.3,bottom,x,bottom);
 s.bezierCurveTo(x-w*.3,bottom,x-w*.55,9,x-w/2,10.9);
 const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.28,bevelEnabled:true,bevelSize:.06,bevelThickness:.08,bevelSegments:3}),mat(0xe5d3b3));
 m.position.z=-34.86;room.add(m);
}

// Main central screen and two side screens.
const screenMat = new THREE.MeshStandardMaterial({ color: 0x0e47ba, emissive: 0x0e47ba, emissiveIntensity: 2.6, roughness: .35 });
const screenCanvas = document.createElement("canvas"); screenCanvas.width=1024; screenCanvas.height=512;
const ctx=screenCanvas.getContext("2d");
const bg=ctx.createLinearGradient(0,0,1024,512); bg.addColorStop(0,"#031036"); bg.addColorStop(.6,"#063785"); bg.addColorStop(1,"#060e27");
ctx.fillStyle=bg;ctx.fillRect(0,0,1024,512);
for(let i=0;i<34;i++){ctx.beginPath();ctx.lineWidth=i%5===0?3:1;ctx.strokeStyle=i<17?"rgba(255,185,56,.6)":"rgba(69,167,255,.55)";ctx.shadowColor=i<17?"#ffb333":"#269bff";ctx.shadowBlur=14; for(let x=0;x<=1024;x+=4){const y=275+Math.sin(x/170+i*.025)*72+Math.sin(x/360)*38+(i-17)*2; if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}
const screenTexture=new THREE.CanvasTexture(screenCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;
ctx.shadowBlur=0;ctx.textAlign="center";ctx.fillStyle="#fff3d5";
ctx.font="bold 92px Georgia";ctx.fillText("SILOAM",512,205);
ctx.font="54px Georgia";ctx.fillStyle="#ffc465";ctx.fillText("2027",512,285);
ctx.font="18px Arial";ctx.fillStyle="#e9e4d9";ctx.fillText("LAYERS OF TRUTH",512,355);
screenTexture.needsUpdate=true;
const display=new THREE.MeshBasicMaterial({map:screenTexture});
const portraitCanvas = document.createElement("canvas");
portraitCanvas.width = 800;
portraitCanvas.height = 500;
const portraitContext = portraitCanvas.getContext("2d");
const portraitTexture = new THREE.CanvasTexture(portraitCanvas);
portraitTexture.colorSpace = THREE.SRGBColorSpace;
box(11.4, 4.3, .25, mat(0x08090b), 0, 4.5, -34.5);
const mainDisplay=new THREE.Mesh(new THREE.PlaneGeometry(11.2,4.1),display.clone());mainDisplay.position.set(0,4.5,-34.35);room.add(mainDisplay);
const ledScreens = {centre: mainDisplay};
for (const side of [-1, 1]) {
  const x = side * stageWingX;
  box(4.1, 2.6, .2, mat(0x08090b), x, 7, -34.25);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.95, 2.45), display);
  panel.position.set(x, 7, -34.13);
  room.add(panel);
  ledScreens[side < 0 ? "left" : "right"] = panel;
}
const screenMeshes = Object.values(ledScreens);

// Ceiling trusses.
const trussMat = mat(0x111318, .45, .65);
for (const z of [-27.7, -22.2]) {
  box(stageTrussWidth, .16, .16, trussMat, 0, 10.3, z);
  for (let i = -stageFixtureCountPerSide; i <= stageFixtureCountPerSide; i++) {
    box(.08, .48, .08, trussMat, i * 2, 10.05, z);
  }
}

// Chair models: single front blue zone, rear red-and-gold zone, all face the stage at negative z.
const chairBlue = mat(0x123773, .65);
const chairRed = mat(0x8d1218, .62);
const chairGold = mat(0xb8832a, .35, .7);
const cloth=fabricTexture();
for(const m of [chairBlue,chairRed]){m.roughness=.96;m.metalness=0;m.bumpMap=cloth;m.bumpScale=.018;}
const blueFrame=mat(0x3f4147,.35,.65);
const seatGeometry=cushionGeometry(1.05,.91,.18,.12);
const backGeometry=cushionGeometry(1.04,1.15,.18,.18);
const frameGeometry=cushionGeometry(1.14,1.25,.12,.2);
const legGeometry=new THREE.CylinderGeometry(.027,.027,.92,6);
const seatSections = [
  { range: [-22, 11], fabric: chairBlue, frame: blueFrame },
  { range: [13.4, 31.3], fabric: chairRed, frame: chairGold },
];
for (const { range, fabric, frame } of seatSections) {
  const positions = [];
  for (let z = range[0]; z <= range[1]; z += 1.7) {
    for (const side of [-1, 1]) {
      for (const offset of [0, outerBlockOffset]) {
        for (let col = 0; col < chairsPerBlock; col++) {
          positions.push([side * (firstChairX + offset + col * chairPitch), z]);
        }
      }
    }
  }

  // Draw each repeated chair part in a batch as the number of seats grows.
  const seats = new THREE.InstancedMesh(seatGeometry, fabric, positions.length);
  const backs = new THREE.InstancedMesh(backGeometry, fabric, positions.length);
  const frames = new THREE.InstancedMesh(frameGeometry, frame, positions.length);
  const legs = new THREE.InstancedMesh(legGeometry, frame, positions.length * 4);
  const transform = new THREE.Object3D();
  function setPart(mesh, index, x, y, z, tilt = 0) {
    transform.position.set(x, y, z);
    transform.rotation.x = tilt;
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  }
  positions.forEach(([x, z], index) => {
    setPart(seats, index, x, .98, z, -Math.PI / 2);
    setPart(backs, index, x, 1.6, z + .42, -.06);
    setPart(frames, index, x, 1.6, z + .43);
    let legIndex = index * 4;
    for (const dx of [-.45, .45]) {
      for (const dz of [-.36, .36]) setPart(legs, legIndex++, x + dx, .46, z + dz);
    }
  });
  room.add(seats, backs, frames, legs);
}

addStageDetails(room);

// AC columns.
for (const side of [-1, 1]) for (const z of [-8, 18, 32]) box(.75, 3.1, .72, mat(0xe5e2dc), side * (sideWallX - 1.9), 1.55, z);

const ambient = new THREE.HemisphereLight(0xfff5e0, 0x8a8780, 3); scene.add(ambient);
const fill=new THREE.DirectionalLight(0xffecd2,2.6);fill.position.set(0,10,2);scene.add(fill);
for(const side of [-1,1]){
 // Hang the speaker stacks inboard of the sightlines to the side LEDs.
 for(let n=0;n<5;n++){box(1.1,.55,.65,mat(0x121318),side*(stageWingX-8.5),9.3-n*.54,-29.8);}
 for(const z of [-29,-12,6,24]){
   const x = side * (z === -29 ? stageWidth / 2 - 1 : sideWallX - 1.7);
   box(.8,3.4,.8,mat(0xf2eee4),x,1.7,z);
   for(let n=0;n<7;n++)box(.65,.035,.025,mat(0x484b4b),x,3.03-n*.075,z+.414);
 }
}
for(const z of [-29,-19,-7,7,22])for(const x of [-28,-14,0,14,28]){
 box(1.4,.04,1,new THREE.MeshBasicMaterial({color:0xffefd5}),x,11.85,z);
}
for(let n=0;n<9;n++){box(.8,.4,.65,mat(0x25272d),-9+n*2.3,.85,-28.7);}
for(let x=-5;x<=5;x+=2.5){box(.04,1.7,.04,mat(0x26282c),x,1.4,-30);box(.5,.04,.04,mat(0x26282c),x,.58,-30);}
const stageLight = new THREE.SpotLight(0xffbd67, 150, 75, .46, .5, 1.3); stageLight.position.set(0, 10, -11); stageLight.target.position.set(0, 0, -33); stageLight.castShadow = true; scene.add(stageLight, stageLight.target);
// Ceiling tile seams are real geometry, available for later animation.
const ceilingGrid=new THREE.Group();ceilingGrid.name="ceiling-grid";room.add(ceilingGrid);
const seamMaterial=mat(0x39383a);
for(let x=-Math.floor(sideWallX/2)*2;x<sideWallX;x+=2){const line=new THREE.Mesh(new THREE.BoxGeometry(.018,.015,74),seamMaterial);line.position.set(x,11.87,0);ceilingGrid.add(line);}
for(let z=-36;z<=36;z+=2){const line=new THREE.Mesh(new THREE.BoxGeometry(hallWidth - 1,.015,.018),seamMaterial);line.position.set(0,11.87,z);ceilingGrid.add(line);}
function beamBetween(a,b,radius,material){
 const delta=new THREE.Vector3().subVectors(b,a);
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),6),material);
 mesh.position.copy(a).add(b).multiplyScalar(.5);
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());room.add(mesh);return mesh;
}
for(const z of [-27.7,-22.2]){
 for(const y of [10.05,10.55])box(stageTrussWidth,.055,.055,trussMat,0,y,z+.4);
 for(let x=-stageTrussWidth/2;x<stageTrussWidth/2;x+=1.2){
   beamBetween(new THREE.Vector3(x,10.05,z),new THREE.Vector3(Math.min(x+1.2,stageTrussWidth/2),10.55,z+.4),.026,trussMat);
 }
}
// Separate stage fixture housings, glowing lenses and warm pools of light.
for(let n=-stageFixtureCountPerSide;n<=stageFixtureCountPerSide;n++){
 const x=n*2;const color=n%3===0?0xffb247:0x2678ff;
 box(.28,.45,.32,trussMat,x,9.8,-27.7);
 box(.23,.08,.22,new THREE.MeshBasicMaterial({color}),x,9.54,-27.7);
}
for(const x of [-stageWingX,0,stageWingX]){
 const light=new THREE.PointLight(0xffb854,95,16,2);light.position.set(x,5,-32.8);scene.add(light);
}
for (const x of [-13, -8, -3, 3, 8, 13]) { const p = new THREE.PointLight(x % 2 ? blue : gold, 4, 12, 1.8); p.position.set(x, 9.7, -25); scene.add(p); }

const targets = {
  altar: { pos: new THREE.Vector3(0, 5.8, 9), look: new THREE.Vector3(0, 5, -33), label: "ALTAR VIEW" },
  centre: { pos: new THREE.Vector3(-sideAisleX, 4.1, 6), look: new THREE.Vector3(0, 3.8, -30), label: "SIDE AISLE" },
  rear: { pos: new THREE.Vector3(0, 8.5, 34), look: new THREE.Vector3(0, 3.2, -12), label: "REAR SECTION" },
  stage: { pos:new THREE.Vector3(0,3.2,-24),look:new THREE.Vector3(0,2.3,-32),label:"STAGE" },
  drums: { pos:new THREE.Vector3(8,3,-27.7),look:new THREE.Vector3(8,1.8,-32),label:"INSTRUMENTS" },
  audience: {pos:new THREE.Vector3(0,3.2,-25),look:new THREE.Vector3(0,1.5,10),label:"FACING THE SEATING"},
};
let desired = targets.altar;
camera.position.copy(desired.pos);
let lookAt = desired.look.clone();
let isDim = false;
let dragging = false;
let previous = { x: 0, y: 0 };
let yaw = 0;
let pitch = 0;
let revealStart=null;
let revealComplete=false;
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrowLayout = window.matchMedia("(max-width: 760px)");
const screenView = {pos: new THREE.Vector3(), look: mainDisplay.position.clone(), label: "CENTRE LED"};
let activeSection = null;
let selectedMinister = null;
let activePlayer = null;
let previousFocus = null;
const frameOffset = new THREE.Vector2();
const screenOffset = new THREE.Vector2();
let screenFov = camera.fov;
let usingScreenView = false;
let focusedLED = null;
const revealOrigin = new THREE.Vector3(0, 5.8, 35.8);
const flameTravelSeconds = 7.5;
let musicWanted = false;
// Capture designed brightness once; animate actual lights and luminous surfaces together.
const hallLights=[];scene.traverse(object=>{if(object.isLight)hallLights.push({object,intensity:object.intensity});});
const luminousMaterials=new Map();
scene.traverse(object=>{if((object.isMesh&&object.material.isMeshBasicMaterial||object.isLine)&&object!==mainDisplay){const material=object.material;if(!luminousMaterials.has(material))luminousMaterials.set(material,material.color.clone());}});
function setHallBrightness(value){
 hallLights.forEach(({object,intensity})=>object.intensity=intensity*value);
 luminousMaterials.forEach((color,material)=>material.color.copy(color).multiplyScalar(value));
}
setHallBrightness(0);
mainDisplay.material.color.setScalar(0);
const flame=createFlame(scene);
camera.position.copy(revealOrigin);
desired = {pos: revealOrigin.clone(), look: targets.altar.look.clone()};

function syncMusic() {
  musicToggle.textContent = musicWanted ? "Music on" : "Music off";
  musicToggle.setAttribute("aria-pressed", String(musicWanted));
  if (!musicWanted) {
    worshipAudio.pause();
    return;
  }
  worshipAudio.play().catch(error => {
    if (error.name === "AbortError") return;
    musicWanted = false;
    syncMusic();
  });
}
musicToggle.addEventListener("click", () => {
  musicWanted = !musicWanted;
  syncMusic();
});

function chooseView(name) {
  if(!revealComplete)return;
  usingScreenView = false;
  focusedLED = null;
  const view = targets[name];
  desired = {pos:view.pos.clone(),look:view.look.clone()};
  const direction=desired.look.clone().sub(desired.pos).normalize();
  yaw=Math.atan2(direction.x,-direction.z);pitch=Math.asin(direction.y);
  viewLabel.textContent = view.label;
  controls.forEach(button => {
    const selected = button.dataset.view === name;
    button.classList.toggle("is-active", selected);
    if (button.dataset.view) button.setAttribute("aria-pressed", String(selected));
  });
}
controls.filter(button => button.dataset.view).forEach(button => button.addEventListener("click", () => {
  chooseView(button.dataset.view);
  cameraMenu.open = false;
  cameraMenu.querySelector("summary").focus();
}));

function drawPortrait(button) {
  const image = button.querySelector("img");
  const name = button.querySelector("span").textContent;
  const {width, height} = portraitCanvas;
  portraitContext.fillStyle = "#10182d";
  portraitContext.fillRect(0, 0, width, height);
  if (image.naturalWidth) {
    const scale = Math.min(width / image.naturalWidth, (height - 75) / image.naturalHeight);
    const imageWidth = image.naturalWidth * scale;
    portraitContext.drawImage(image, (width - imageWidth) / 2, 0, imageWidth, image.naturalHeight * scale);
  }
  portraitContext.fillStyle = "#f5d099";
  portraitContext.font = "bold 39px Georgia";
  portraitContext.textAlign = "center";
  portraitContext.fillText(name, width / 2, height - 25, width - 30);
  portraitTexture.needsUpdate = true;
}

function selectMinister(button) {
  if (button === selectedMinister) return;
  selectedMinister = button;
  const name = button.querySelector("span").textContent;
  const videoId = button.dataset.video;
  ministerButtons.forEach(option => option.setAttribute("aria-pressed", String(option === button)));
  document.querySelector("#minister-name").textContent = name;
  document.querySelector("#minister-role").textContent = button.dataset.role;
  document.querySelector("#watch-minister").href = `https://www.youtube.com/watch?v=${videoId}`;
  drawPortrait(button);
  display.map = portraitTexture;
  mountMinisterVideo(name, videoId);
}

function mountMinisterVideo(name, videoId) {
  const iframe = document.createElement("iframe");
  iframe.title = `Centre LED video featuring ${name}`;
  iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1`;
  activePlayer = iframe;
  ledPlayer.replaceChildren(iframe);
}
document.querySelector("#reload-led-video").addEventListener("click", () => {
  if (!selectedMinister) return;
  mountMinisterVideo(selectedMinister.querySelector("span").textContent, selectedMinister.dataset.video);
});
ministerButtons.forEach(button => {
  button.addEventListener("click", () => selectMinister(button));
  button.querySelector("img").addEventListener("load", () => {
    if (button === selectedMinister) drawPortrait(button);
  });
});

function clearMinister() {
  selectedMinister = null;
  activePlayer = null;
  ledPlayer.hidden = true;
  ledZoom.hidden = true;
  ledPlayer.replaceChildren();
  display.map = screenTexture;
}

function availableScreenWidth() {
  const {clientWidth, clientHeight} = canvas;
  const besidePanel = activeSection === "ministers" && !narrowLayout.matches;
  const width = besidePanel ? conferencePanel.getBoundingClientRect().left : clientWidth;
  screenOffset.set((clientWidth - width) / 2, activeSection === "ministers" && narrowLayout.matches ? clientHeight * .17 : 0);
  return width;
}

function frameScreens() {
  focusedLED = null;
  // Move toward the altar and widen the lens to fit the outer screens beside the panel.
  const availableWidth = availableScreenWidth();
  const stageWidthInFrame = 2 * stageWingX + 4.1 + 3;
  const usableAspect = availableWidth / canvas.clientHeight;
  const maxFov = THREE.MathUtils.degToRad(114);
  const distance = Math.max(21, stageWidthInFrame / (2 * usableAspect * Math.tan(maxFov / 2)));
  screenFov = THREE.MathUtils.radToDeg(2 * Math.atan(stageWidthInFrame / (2 * usableAspect * distance)));
  screenView.pos.set(0, 3.45, mainDisplay.position.z + distance);
  desired = {pos: screenView.pos.clone(), look: screenView.look};
  usingScreenView = true;
  yaw = 0;
  pitch = Math.atan2(mainDisplay.position.y - screenView.pos.y, distance);
  viewLabel.textContent = screenView.label;
  controls.filter(button => button.dataset.view).forEach(button => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });
}

function focusLED(name) {
  if (!revealComplete) return;
  const screen = ledScreens[name];
  const availableWidth = availableScreenWidth();
  const {width, height} = screen.geometry.parameters;
  screenFov = 46;
  const halfFovTangent = Math.tan(THREE.MathUtils.degToRad(screenFov / 2));
  const verticalShare = activeSection === "ministers" && narrowLayout.matches ? .35 : .55;
  const distance = Math.max(
    width / (2 * halfFovTangent * .77 * availableWidth / canvas.clientHeight),
    height / (2 * halfFovTangent * verticalShare),
  );
  const look = screen.position.clone();
  desired = {pos: look.clone().add(new THREE.Vector3(0, 0, distance)), look};
  usingScreenView = true;
  focusedLED = name;
  yaw = pitch = 0;
  viewLabel.textContent = `${name.toUpperCase()} LED`;
  controls.filter(button => button.dataset.view).forEach(button => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });
}

document.querySelectorAll("[data-led]").forEach(button => button.addEventListener("click", () => {
  focusLED(button.dataset.led);
  if (cameraMenu.open) {
    cameraMenu.open = false;
    cameraMenu.querySelector("summary").focus();
  }
}));

function openSection(button) {
  if (!revealComplete) return;
  const section = button.dataset.section;
  if (activeSection === section) {
    closeSection();
    return;
  }
  activeSection = section;
  previousFocus = button;
  cameraMenu.open = false;
  dragging = false;
  panelTitle.textContent = button.textContent;
  panelContents.forEach(content => { content.hidden = content.dataset.panel !== section; });
  conferencePanel.hidden = false;
  conferencePanel.scrollTop = 0;
  document.body.classList.add("has-panel");
  sectionButtons.forEach(option => {
    option.setAttribute("aria-expanded", String(option === button));
    option.classList.toggle("is-active", option === button);
  });
  if (section === "ministers") {
    frameScreens();
    selectMinister(ministerButtons[0]);
  } else {
    clearMinister();
    chooseView("altar");
  }
  panelTitle.focus({preventScroll: true});
}

function closeSection(restoreFocus = true) {
  if (!activeSection) return;
  activeSection = null;
  clearMinister();
  conferencePanel.hidden = true;
  document.body.classList.remove("has-panel");
  sectionButtons.forEach(button => {
    button.setAttribute("aria-expanded", "false");
    button.classList.remove("is-active");
  });
  chooseView("altar");
  if (restoreFocus) previousFocus?.focus();
  previousFocus = null;
}
sectionButtons.forEach(button => button.addEventListener("click", () => openSection(button)));
document.querySelector("#close-panel").addEventListener("click", () => closeSection());
document.querySelector("#reframe-leds").addEventListener("click", frameScreens);
document.querySelector("#hall-home").addEventListener("click", () => {
  closeSection(false);
  cameraMenu.open = false;
  chooseView("altar");
});

const {width: ledWidth, height: ledHeight} = mainDisplay.geometry.parameters;
const playerHeight = 270;
const playerWidth = playerHeight * ledWidth / ledHeight;
ledPlayer.style.width = `${playerWidth}px`;
ledPlayer.style.height = `${playerHeight}px`;
const ledCorners = [
  [-ledWidth / 2, ledHeight / 2], [ledWidth / 2, ledHeight / 2],
  [ledWidth / 2, -ledHeight / 2], [-ledWidth / 2, -ledHeight / 2],
].map(([x, y]) => mainDisplay.position.clone().add(new THREE.Vector3(x, y, 0)));
const projectedCorners = ledCorners.map(() => new THREE.Vector3());
function updateLEDPlayer() {
  if (!activePlayer) return;
  ledCorners.forEach((corner, i) => projectedCorners[i].copy(corner).project(camera));
  if (projectedCorners.some(point => point.z <= -1 || point.z >= 1)) {
    ledPlayer.hidden = true;
    ledZoom.hidden = true;
    return;
  }
  const {clientWidth, clientHeight} = canvas;
  const [topLeft, topRight, bottomRight, bottomLeft] = projectedCorners;
  const x0 = (topLeft.x + 1) * clientWidth / 2;
  const y0 = (1 - topLeft.y) * clientHeight / 2;
  const x1 = (topRight.x + 1) * clientWidth / 2;
  const y1 = (1 - topRight.y) * clientHeight / 2;
  const x2 = (bottomRight.x + 1) * clientWidth / 2;
  const y2 = (1 - bottomRight.y) * clientHeight / 2;
  const x3 = (bottomLeft.x + 1) * clientWidth / 2;
  const y3 = (1 - bottomLeft.y) * clientHeight / 2;
  // Map the rectangular player onto the four projected corners of the LED.
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const determinant = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(determinant) < 1) {
    ledPlayer.hidden = true;
    ledZoom.hidden = true;
    return;
  }
  const gx = (dx3 * dy2 - dx2 * dy3) / determinant;
  const gy = (dx1 * dy3 - dx3 * dy1) / determinant;
  ledPlayer.style.transform = `matrix3d(${(x1 - x0 + gx * x1) / playerWidth}, ${(y1 - y0 + gx * y1) / playerWidth}, 0, ${gx / playerWidth}, ${(x3 - x0 + gy * x3) / playerHeight}, ${(y3 - y0 + gy * y3) / playerHeight}, 0, ${gy / playerHeight}, 0, 0, 1, 0, ${x0}, ${y0}, 0, 1)`;
  ledPlayer.hidden = false;
  ledZoom.style.left = `${(x0 + x1) / 2}px`;
  ledZoom.style.top = `${Math.min(y0, y1) - 5}px`;
  ledZoom.hidden = focusedLED === "centre";
}

const screenRay = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let press = null;
function screenAt(event) {
  const bounds = canvas.getBoundingClientRect();
  pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
  screenRay.setFromCamera(pointer, camera);
  return screenRay.intersectObjects(screenMeshes, false)[0]?.object;
}
canvas.addEventListener("pointerdown", event => {
  if (!revealComplete || !event.isPrimary || event.button !== 0) return;
  press = {x: event.clientX, y: event.clientY};
  previous = press;
  dragging = false;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointerup", event => {
  if (!press || !event.isPrimary) return;
  if (!dragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 6) {
    const hit = screenAt(event);
    const name = Object.keys(ledScreens).find(key => ledScreens[key] === hit);
    if (name) focusLED(name);
  }
  press = null;
  dragging = false;
});
canvas.addEventListener("pointercancel", () => {
  press = null;
  dragging = false;
});
canvas.addEventListener("pointermove", event => {
  if (!revealComplete || !event.isPrimary) return;
  if (!press) {
    canvas.style.cursor = screenAt(event) ? "pointer" : "";
    return;
  }
  if (!dragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 6) return;
  dragging = true;
  yaw -= (event.clientX - previous.x) * .004;
  pitch = THREE.MathUtils.clamp(pitch - (event.clientY - previous.y) * .003, -1.2, 1.2);
  previous = {x: event.clientX, y: event.clientY};
});
function moveCamera(distance){
 if(!revealComplete)return;
 desired.pos.addScaledVector(new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw)),distance);
 desired.pos.x=THREE.MathUtils.clamp(desired.pos.x,-sideWallX+1,sideWallX-1);
 desired.pos.z=THREE.MathUtils.clamp(desired.pos.z,-33.6,34);
}
canvas.addEventListener("wheel", event => {event.preventDefault();moveCamera(-event.deltaY*.012);}, { passive: false });
document.querySelector("#closer").addEventListener("click",()=>moveCamera(2));
document.querySelector("#further").addEventListener("click",()=>moveCamera(-2));
document.querySelector("#turn-around").addEventListener("click",()=>{
 if (!revealComplete) return;
 yaw+=Math.PI;
});
window.addEventListener("keydown",event=>{
 if (event.key === "Escape") {
   if (cameraMenu.open) {
     cameraMenu.open = false;
     cameraMenu.querySelector("summary").focus();
   } else closeSection();
   return;
 }
 if(event.target.closest?.("button,input,textarea,summary,a"))return;
 if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","w","s"].includes(event.key)){event.preventDefault();if(!revealComplete)return;}
 if(event.key==="ArrowLeft")yaw+=.12;if(event.key==="ArrowRight")yaw-=.12;
 if(event.key==="ArrowUp"||event.key==="w")moveCamera(1);
 if(event.key==="ArrowDown"||event.key==="s")moveCamera(-1);
});
enterButton.addEventListener("click", () => {
 if(revealStart!==null)return;
 intro.classList.add("is-hidden");enterButton.disabled=true;
 document.body.classList.add("is-revealing");
 musicWanted = true;
 syncMusic();
 revealStart=clock.getElapsedTime();
});
function finishReveal() {
  revealComplete = true;
  intro.classList.add("is-hidden");
  intro.inert = true;
  document.body.classList.remove("is-intro", "is-revealing");
  flame.update(1, 0);
  mainDisplay.material.color.setScalar(1);
  setHallBrightness(1);
  chooseView("altar");
  camera.position.copy(desired.pos);
  sectionButtons[0].focus({preventScroll: true});
}
skipIntro.addEventListener("click", finishReveal);
lightButton.addEventListener("click", () => {
  if (!revealComplete) return;
  isDim = !isDim;
  setHallBrightness(isDim ? .3 : 1);
  lightButton.textContent = isDim ? "BRIGHTEN LIGHTS" : "DIM LIGHTS";
  lightButton.setAttribute("aria-pressed", String(isDim));
});

function animate() {
  const elapsed = clock.getElapsedTime();
  if(revealStart!==null&&!revealComplete){
   const t=(elapsed-revealStart)*(reducedMotion?4:1);
   const travel=THREE.MathUtils.smoothstep(t,0,flameTravelSeconds);
   camera.position.lerpVectors(revealOrigin, targets.altar.pos, travel);
   desired.pos.copy(camera.position);
   flame.update(THREE.MathUtils.clamp(t/flameTravelSeconds,0,1),elapsed);
   mainDisplay.material.color.setScalar(THREE.MathUtils.smoothstep(t,flameTravelSeconds,flameTravelSeconds+1));
   setHallBrightness(THREE.MathUtils.smoothstep(t,flameTravelSeconds+1.8,flameTravelSeconds+4.5));
   if(t>=flameTravelSeconds+4.5)finishReveal();
  }
  camera.position.lerp(desired.pos, reducedMotion ? 1 : .065);
  lookAt.lerp(desired.look, .04);
  const orbitTarget = revealComplete ? camera.position.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))) : lookAt;
  camera.lookAt(orbitTarget);
  const onMinisters = activeSection === "ministers";
  const framingEase = reducedMotion ? 1 : .12;
  const defaultFov = narrowLayout.matches ? 83 : 58;
  frameOffset.x = THREE.MathUtils.lerp(frameOffset.x, onMinisters ? screenOffset.x : 0, framingEase);
  frameOffset.y = THREE.MathUtils.lerp(frameOffset.y, onMinisters ? screenOffset.y : 0, framingEase);
  const nextFov = THREE.MathUtils.lerp(camera.fov, usingScreenView ? screenFov : defaultFov, framingEase);
  if (Math.abs(camera.fov - nextFov) > .001) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
  if (Math.abs(frameOffset.x) + Math.abs(frameOffset.y) > .1) {
    camera.setViewOffset(canvas.clientWidth, canvas.clientHeight, frameOffset.x, frameOffset.y, canvas.clientWidth, canvas.clientHeight);
  } else if (camera.view?.enabled) camera.clearViewOffset();
  renderer.render(scene, camera);
  updateLEDPlayer();
  requestAnimationFrame(animate);
}
function resize() {
  const {clientWidth, clientHeight} = canvas;
  camera.aspect = clientWidth / clientHeight;
  camera.fov = narrowLayout.matches ? 83 : 58;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
  if (focusedLED) focusLED(focusedLED);
  else if (activeSection === "ministers") {
    ledPlayer.hidden = true;
    frameScreens();
  }
}
window.addEventListener("resize", resize);
resize();
setTimeout(() => {
  loading.classList.add("is-done");
  skipIntro.hidden = false;
}, 750);
animate();
