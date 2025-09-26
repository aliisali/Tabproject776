import React, { useEffect, useRef } from 'react';
import { Camera, Headphones, Info, Cuboid as Cube } from 'lucide-react';

export default function ARCameraModule() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // The HTML content will be injected into the iframe
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BlindsCloud AR Camera — Professional Blinds Demonstration</title>
  <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.1/dist/aframe-extras.loaders.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <style>
    html,body{height:100%;margin:0;overflow:hidden;font-family:system-ui,Segoe UI,Roboto,Arial;}
    #webcamVideo{position:fixed;left:0;top:0;width:100%;height:100%;object-fit:cover;z-index:0;background:#000;}
    a-scene{position:fixed;left:0;top:0;width:100%;height:100%;z-index:1;}
    #ui{position:fixed;right:10px;top:10px;z-index:3;background:rgba(255,255,255,0.96);padding:15px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:480px;display:none;}
    #ui button,#ui input,#ui select{margin:5px 0;padding:6px 10px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:#fff;cursor:pointer}
    #toggleBtn{position:fixed;bottom:12px;right:12px;z-index:4;background:linear-gradient(135deg, #6366f1, #8b5cf6);color:white;padding:12px 16px;border-radius:50%;border:none;box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;font-size:18px;}
    #newTabBtn{position:fixed;bottom:12px;left:12px;z-index:4;background:linear-gradient(135deg, #3b82f6, #1d4ed8);color:white;padding:8px 12px;border-radius:8px;border:none;box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;font-size:14px;}
    #status{font-size:12px;color:#333;margin-top:6px}
    .ar-overlay{position:fixed;top:10px;left:10px;z-index:3;background:rgba(0,0,0,0.7);color:white;padding:8px 12px;border-radius:8px;font-size:12px;}
  </style>
</head>
<body>
  <div class="ar-overlay">BlindsCloud AR Demo - Professional Blinds Visualization</div>
  
  <div id="ui">
    <h3 style="margin:0 0 10px;color:#333;font-size:14px;">📱 BlindsCloud AR Camera</h3>
    <button id="startCam">🎥 Start Camera (back)</button>
    <button id="switchCam" disabled>Switch Camera</button>
    <input id="imageInput" type="file" accept="image/*,.max,.fbx,.gltf,.glb" style="width:100%;margin:8px 0;">
    <div>
      <button id="placeToggle" disabled>🎯 Place Blinds</button>
      <button id="removeItem" disabled>❌ Remove</button>
      <button id="screenshotBtn" disabled>📸 Capture Demo</button>
    </div>
    <div>
      <label for="shapeSelect">Blinds Style:</label>
      <select id="shapeSelect">
        <option value="plane">Flat Panel Blinds</option>
        <option value="box">Venetian Blinds</option>
        <option value="cylinder">Curved Blinds</option>
        <option value="sphere">Rounded Blinds</option>
        <option value="custom">Custom Blinds Model</option>
      </select>
    </div>
    <div>
      <button id="rotateLeft">↺ Left</button>
      <button id="rotateRight">↻ Right</button>
      <button id="rotateUp">⬆️ Up</button>
      <button id="rotateDown">⬇️ Down</button>
      <button id="resetBtn">Reset</button>
    </div>
    <div id="status">Upload blinds images or 3D models (.max, .fbx, .gltf). Show customers how blinds will look!</div>
  </div>

  <button id="toggleBtn">⚙️</button>
  <button id="newTabBtn" onclick="window.open(window.location.href, '_blank')">🔗 New Tab</button>

  <video id="webcamVideo" playsinline autoplay muted></video>

  <a-scene embedded renderer="alpha: true" vr-mode-ui="enabled: false">
    <a-assets>
      <img id="vrTex" crossorigin="anonymous" />
      <a-asset-item id="customModel" crossorigin="anonymous"></a-asset-item>
    </a-assets>
    <a-entity id="cameraRig">
      <a-entity id="aframeCamera" camera look-controls-enabled="false" position="0 0 0">
        <a-entity id="vrItem" visible="false" position="0 -0.2 -1" rotation="0 0 0" scale="1 1 1"></a-entity>
      </a-entity>
    </a-entity>
  </a-scene>

<script>
// Elements
const startCamBtn=document.getElementById('startCam');
const switchCamBtn=document.getElementById('switchCam');
const imageInput=document.getElementById('imageInput');
const placeToggle=document.getElementById('placeToggle');
const removeItemBtn=document.getElementById('removeItem');
const screenshotBtn=document.getElementById('screenshotBtn');
const rotateLeft=document.getElementById('rotateLeft');
const rotateRight=document.getElementById('rotateRight');
const rotateUp=document.getElementById('rotateUp');
const rotateDown=document.getElementById('rotateDown');
const resetBtn=document.getElementById('resetBtn');
const shapeSelect=document.getElementById('shapeSelect');
const status=document.getElementById('status');
const video=document.getElementById('webcamVideo');
const vrTex=document.getElementById('vrTex');
const vrItem=document.getElementById('vrItem');
const ui=document.getElementById('ui');
const toggleBtn=document.getElementById('toggleBtn');

// State
let stream=null,usingFront=false,vrPlaced=false;
let itemPos={x:0,y:-0.2,z:-1};
let itemRot={x:0,y:0,z:0};
let itemScale=1;
let currentShape=null;
let currentFileType=null;
let customModelUrl=null;

// Camera
async function startCamera(facingMode='environment'){
  stopCamera();
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode},audio:false});
    video.srcObject=stream; await video.play();
    startCamBtn.textContent='Stop Camera'; switchCamBtn.disabled=false;
    status.textContent=\`Camera started (\${facingMode}). Screenshot will auto-save.\`;
    setTimeout(()=>takeScreenshot(),1000);
  }catch(err){alert('Camera error: '+err.message);}
}
function stopCamera(){ if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;} try{video.pause();video.srcObject=null;}catch(e){} startCamBtn.textContent='Start Camera (back)'; switchCamBtn.disabled=true; status.textContent='Camera stopped.'; }
startCamBtn.onclick=()=>{ if(!stream) startCamera(usingFront?'user':'environment'); else stopCamera(); }
switchCamBtn.onclick=()=>{ usingFront=!usingFront; startCamera(usingFront?'user':'environment'); switchCamBtn.textContent=usingFront?'Switch to Back':'Switch to Front'; }

// Simple background removal (corner color)
function removeBackground(img,callback){
  const canvas=document.createElement('canvas'); const ctx=canvas.getContext('2d');
  img.onload=()=>{
    canvas.width=img.width; canvas.height=img.height; ctx.drawImage(img,0,0);
    const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
    const data=imageData.data;
    function getPixel(x,y){let i=(y*canvas.width+x)*4;return [data[i],data[i+1],data[i+2]];}
    const c1=getPixel(0,0),c2=getPixel(canvas.width-1,0),c3=getPixel(0,canvas.height-1),c4=getPixel(canvas.width-1,canvas.height-1);
    const bg=[(c1[0]+c2[0]+c3[0]+c4[0])/4,(c1[1]+c2[1]+c3[1]+c4[1])/4,(c1[2]+c2[2]+c3[2]+c4[2])/4];
    const threshold=80;
    for(let i=0;i<data.length;i+=4){
      const r=data[i],g=data[i+1],b=data[i+2];
      const dist=Math.sqrt((r-bg[0])**2+(g-bg[1])**2+(b-bg[2])**2);
      if(dist<threshold){ data[i+3]=0; }
    }
    ctx.putImageData(imageData,0,0);
    callback(canvas.toDataURL('image/png'));
  }
}

// Load image
imageInput.onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const fileName=f.name.toLowerCase();
  currentFileType=fileName.split('.').pop();
  const url=URL.createObjectURL(f);
  
  if(currentFileType==='max'||currentFileType==='fbx'||currentFileType==='gltf'||currentFileType==='glb'){
    // Handle 3D model files
    customModelUrl=url;
    document.getElementById('customModel').setAttribute('src',url);
    placeToggle.disabled=false; 
    screenshotBtn.disabled=false; 
    shapeSelect.value='custom';
    status.textContent='3D model loaded: '+f.name+'. Ready to place in AR.';
  } else {
    // Handle image files
    const img=new Image(); img.crossOrigin='anonymous'; img.src=url;
    removeBackground(img,(png)=>{ 
      vrTex.src=png; 
      placeToggle.disabled=false; 
      screenshotBtn.disabled=false; 
      status.textContent='Image loaded with background removed.'; 
    });
  }
}

// Place/remove
placeToggle.onclick=()=>{ vrPlaced=!vrPlaced; if(vrPlaced){ applyShape(shapeSelect.value); } vrItem.setAttribute('visible', vrPlaced); placeToggle.textContent=vrPlaced?'Hide AR item':'Place AR item'; removeItemBtn.disabled=!vrPlaced; }
removeItemBtn.onclick=()=>{ vrPlaced=false; vrItem.setAttribute('visible', false); placeToggle.textContent='Place AR item'; removeItemBtn.disabled=true; }

// Shape change
shapeSelect.onchange=()=>{ if(vrPlaced) applyShape(shapeSelect.value); }

function applyShape(shape){
  vrItem.innerHTML='';
  let el;
  
  if(shape==='custom'&&customModelUrl){
    // Use custom 3D model
    el=document.createElement('a-entity');
    if(currentFileType==='gltf'||currentFileType==='glb'){
      el.setAttribute('gltf-model','#customModel');
    } else if(currentFileType==='fbx'){
      el.setAttribute('fbx-model','#customModel');
    } else if(currentFileType==='max'){
      // .max files need conversion to gltf first
      status.textContent='Note: .max files need conversion to .gltf format for web display.';
      el.setAttribute('gltf-model','#customModel');
    }
    el.setAttribute('scale','0.5 0.5 0.5'); // Scale down 3D models
  } else {
    // Use geometric shapes with texture
    if(shape==='plane'){ el=document.createElement('a-plane'); el.setAttribute('width','1'); el.setAttribute('height','0.6'); }
    else if(shape==='box'){ el=document.createElement('a-box'); el.setAttribute('depth','0.2'); el.setAttribute('height','0.6'); el.setAttribute('width','1'); }
    else if(shape==='cylinder'){ el=document.createElement('a-cylinder'); el.setAttribute('radius','0.7'); el.setAttribute('theta-length','60'); el.setAttribute('height','0.6'); }
    else if(shape==='sphere'){ el=document.createElement('a-sphere'); el.setAttribute('radius','0.7'); }
    el.setAttribute('material',\`src:#vrTex; side:double; transparent:true;\`);
  }
  
  vrItem.appendChild(el);
  currentShape=shape;
}

// Buttons
rotateLeft.onclick=()=>{ itemRot.y -= 15; vrItem.setAttribute('rotation', itemRot); }
rotateRight.onclick=()=>{ itemRot.y += 15; vrItem.setAttribute('rotation', itemRot); }
rotateUp.onclick=()=>{ itemRot.x -= 15; vrItem.setAttribute('rotation', itemRot); }
rotateDown.onclick=()=>{ itemRot.x += 15; vrItem.setAttribute('rotation', itemRot); }
resetBtn.onclick=()=>{ itemPos={x:0,y:-0.2,z:-1}; itemRot={x:0,y:0,z:0}; itemScale=1; vrItem.setAttribute('position', itemPos); vrItem.setAttribute('rotation', itemRot); vrItem.setAttribute('scale', \`\${itemScale} \${itemScale} \${itemScale}\`); }

// Screenshot hides UI then captures
function takeScreenshot(){ ui.style.display='none'; toggleBtn.style.display='none'; setTimeout(()=>{ html2canvas(document.body,{useCORS:true}).then(canvas=>{ const link=document.createElement('a'); link.download='screenshot.png'; link.href=canvas.toDataURL(); link.click(); ui.style.display='block'; toggleBtn.style.display='block'; status.textContent='Screenshot saved.'; }); },200); }
screenshotBtn.onclick=()=>takeScreenshot();

// Toggle UI
toggleBtn.onclick=()=>{ ui.style.display = (ui.style.display==='none' || ui.style.display==='') ? 'block' : 'none'; }

// File type detection and handling
function handleFileUpload(file){
  const fileName=file.name.toLowerCase();
  const fileType=fileName.split('.').pop();
  
  if(['max','fbx','gltf','glb'].includes(fileType)){
    return 'model';
  } else if(['jpg','jpeg','png','gif','webp'].includes(fileType)){
    return 'image';
  }
  return 'unknown';
}

// Touch gestures: move / pinch / rotate
const sceneEl=document.querySelector('a-scene');
let touchState={dragging:false,startX:0,startY:0,startPos:null,pinchActive:false,startDist:0,startAngle:0,startScale:1,startRotX:0,startRotY:0,startMidY:0};
function getItemPos(){ const p=vrItem.getAttribute('position'); return {x:p.x,y:p.y,z:p.z}; }
sceneEl.addEventListener('touchstart',function(e){
  if(!vrPlaced) return;
  if(e.touches.length===1){ touchState.dragging=true; touchState.startX=e.touches[0].clientX; touchState.startY=e.touches[0].clientY; touchState.startPos=getItemPos(); }
  else if(e.touches.length===2){ const t1=e.touches[0],t2=e.touches[1]; touchState.pinchActive=true; touchState.startDist=Math.hypot(t2.clientX-t1.clientX,t2.clientY-t1.clientY); touchState.startAngle=Math.atan2(t2.clientY-t1.clientY,t2.clientX-t1.clientX)*180/Math.PI; touchState.startScale=itemScale; touchState.startRotY=itemRot.y; touchState.startRotX=itemRot.x; touchState.startMidY=(t1.clientY+t2.clientY)/2; }
},{passive:false});
sceneEl.addEventListener('touchmove',function(e){
  if(!vrPlaced) return;
  if(touchState.dragging&&e.touches.length===1){ const t=e.touches[0]; const dx=(t.clientX-touchState.startX)/240; const dy=(t.clientY-touchState.startY)/240; itemPos.x=touchState.startPos.x+dx; itemPos.y=touchState.startPos.y-dy; vrItem.setAttribute('position',itemPos); }
  else if(touchState.pinchActive&&e.touches.length===2){ const t1=e.touches[0],t2=e.touches[1]; const curDist=Math.hypot(t2.clientX-t1.clientX,t2.clientY-t1.clientY); const curAngle=Math.atan2(t2.clientY-t1.clientY,t2.clientX-t1.clientX)*180/Math.PI; const scaleFactor=curDist/touchState.startDist; itemScale=Math.max(0.2,Math.min(4,touchState.startScale*scaleFactor)); const angleDelta=curAngle-touchState.startAngle; itemRot.y=touchState.startRotY+angleDelta; const midY=(t1.clientY+t2.clientY)/2; const midDelta=midY-touchState.startMidY; itemRot.x=touchState.startRotX+(midDelta/5); vrItem.setAttribute('scale',\`\${itemScale} \${itemScale} \${itemScale}\`); vrItem.setAttribute('rotation',itemRot); }
},{passive:false});
sceneEl.addEventListener('touchend',function(e){ if(e.touches.length===0){ touchState.dragging=false; touchState.pinchActive=false; } },{passive:false});

status.textContent='Controls hidden. Tap ⚙️ to open. Upload images or 3D models (.max, .fbx, .gltf). Touch: 1 finger move, 2 fingers pinch/twist/tilt.';
</script>
</body>
</html>`;

    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.srcdoc = htmlContent;
    }
  }, []);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Headphones className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AR Camera Module</h1>
            <p className="text-gray-600 mt-2">Demonstrate blinds in customer spaces with AR visualization</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => window.open('/ar-camera-fullscreen', '_blank')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Camera className="w-5 h-5 mr-2" />
              Open in New Tab
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-800">
              <h3 className="font-semibold mb-2">How to demonstrate blinds with AR:</h3>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Start Camera:</strong> Point camera at customer's window</li>
                <li>• <strong>Upload Blinds:</strong> Select blinds image - background auto-removed</li>
                <li>• <strong>3D Visualization:</strong> Convert blinds to 3D for realistic preview</li>
                <li>• <strong>Position Blinds:</strong> Touch to move and resize blinds on window</li>
                <li>• <strong>Customer Demo:</strong> Show how blinds will look in their space</li>
                <li>• <strong>Settings:</strong> Tap ⚙️ button to show/hide controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AR Module Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">AR Camera Interface</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Camera className="w-4 h-4" />
              <span>Live blinds demonstration tool</span>
            </div>
          </div>
        </div>

        {/* Embedded AR Module */}
        <div className="relative" style={{ height: '80vh' }}>
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="AR Camera Module"
            allow="camera; microphone"
            sandbox="allow-scripts allow-same-origin allow-downloads"
          />
        </div>
      </div>
    </div>
  );
}