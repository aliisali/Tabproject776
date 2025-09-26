import React from 'react';
import { Camera, Upload, RotateCcw, Move3d as Move3D, ZoomIn, ZoomOut } from 'lucide-react';

export function VRView() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">VR View</h1>
        <p className="text-gray-600 mt-2">Fullscreen AR Camera with 2D to 3D conversion and background removal</p>
      </div>

      {/* VR Interface Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">AR Camera Controls</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Camera className="w-4 h-4" />
              <span>Touch: 1 finger move, 2 fingers pinch/twist/tilt</span>
            </div>
          </div>
        </div>

        {/* Embedded VR Content */}
        <div className="relative" style={{ height: '80vh' }}>
          <iframe
            src={`data:text/html;charset=utf-8,${encodeURIComponent(`
              <!doctype html>
              <html lang="en">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>Enhanced AR Camera — 3D Models with Background Removal</title>
                <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
                <style>
                  html,body{height:100%;margin:0;overflow:hidden;font-family:system-ui,Segoe UI,Roboto,Arial;}
                  #webcamVideo{position:fixed;left:0;top:0;width:100%;height:100%;object-fit:cover;z-index:0;background:#000;}
                  a-scene{position:fixed;left:0;top:0;width:100%;height:100%;z-index:1;}
                  #ui{position:fixed;right:10px;top:10px;z-index:3;background:rgba(255,255,255,0.96);padding:10px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:440px;display:none;}
                  #ui button,#ui input,#ui select{margin:5px 0;padding:6px 10px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:#fff;cursor:pointer}
                  #toggleBtn{position:fixed;bottom:12px;right:12px;z-index:4;background:#fff;padding:10px 14px;border-radius:50%;border:1px solid rgba(0,0,0,0.2);box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;font-size:18px;}
                  #status{font-size:12px;color:#333;margin-top:6px}
                  #modelLibrary{position:fixed;left:10px;top:10px;z-index:3;background:rgba(255,255,255,0.96);padding:10px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:200px;display:none;}
                  .model-item{display:flex;align-items:center;padding:5px;margin:2px 0;border-radius:5px;cursor:pointer;transition:background 0.2s;}
                  .model-item:hover{background:rgba(59,130,246,0.1);}
                  .model-item img{width:30px;height:30px;border-radius:4px;margin-right:8px;object-fit:cover;}
                  .model-item span{font-size:12px;color:#333;}
                </style>
              </head>
              <body>
                <div id="ui">
                  <button id="startCam">Start Camera (back)</button>
                  <button id="switchCam" disabled>Switch Camera</button>
                  <input id="imageInput" type="file" accept="image/*">
                  <div>
                    <button id="placeToggle" disabled>Place 3D Model</button>
                    <button id="removeItem" disabled>Remove</button>
                    <button id="screenshotBtn" disabled>📸 Screenshot</button>
                  </div>
                  <div>
                    <label for="shapeSelect">Model Type:</label>
                    <select id="shapeSelect">
                      <option value="realistic">Realistic 3D</option>
                      <option value="box">Box Shape</option>
                      <option value="cylinder">Curved</option>
                      <option value="sphere">Sphere</option>
                    </select>
                  </div>
                  <div>
                    <button id="rotateLeft">↺ Left</button>
                    <button id="rotateRight">↻ Right</button>
                    <button id="rotateUp">⬆️ Up</button>
                    <button id="rotateDown">⬇️ Down</button>
                    <button id="resetBtn">Reset</button>
                  </div>
                  <div id="status">Enhanced AR with 3D models. Tap ⚙️ to toggle controls.</div>
                </div>

                <div id="modelLibrary">
                  <h4 style="margin:0 0 10px 0;font-size:14px;color:#333;">3D Models</h4>
                  <div class="model-item" onclick="loadModel('hvac')">
                    <img src="https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=60" alt="HVAC">
                    <span>HVAC Unit</span>
                  </div>
                  <div class="model-item" onclick="loadModel('electrical')">
                    <img src="https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=60" alt="Electrical">
                    <span>Electrical Panel</span>
                  </div>
                  <div class="model-item" onclick="loadModel('plumbing')">
                    <img src="https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=60" alt="Plumbing">
                    <span>Plumbing System</span>
                  </div>
                </div>

                <button id="toggleBtn" onclick="toggleUI()">⚙️</button>
                <button id="modelsBtn" onclick="toggleModels()" style="position:fixed;bottom:12px;left:12px;z-index:4;background:#fff;padding:10px 14px;border-radius:50%;border:1px solid rgba(0,0,0,0.2);box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;font-size:18px;">📦</button>

                <video id="webcamVideo" playsinline autoplay muted></video>

                <a-scene embedded renderer="alpha: true" vr-mode-ui="enabled: false">
                  <a-assets>
                    <img id="vrTex" crossorigin="anonymous" />
                    <img id="hvacTex" src="https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400" crossorigin="anonymous" />
                    <img id="electricalTex" src="https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400" crossorigin="anonymous" />
                    <img id="plumbingTex" src="https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=400" crossorigin="anonymous" />
                  </a-assets>
                  
                  <!-- Enhanced lighting for realistic 3D models -->
                  <a-light type="ambient" color="#404040" intensity="0.4"></a-light>
                  <a-light type="directional" position="2 4 5" color="#ffffff" intensity="0.8"></a-light>
                  <a-light type="point" position="-2 2 2" color="#4f46e5" intensity="0.3"></a-light>
                  
                  <a-entity id="cameraRig">
                    <a-entity id="aframeCamera" camera look-controls-enabled="false" position="0 0 0">
                      <a-entity id="vrItem" visible="false" position="0 -0.2 -1" rotation="0 0 0" scale="1 1 1"></a-entity>
                    </a-entity>
                  </a-entity>
                </a-scene>

                <script>
                  // Enhanced AR Camera with 3D Model Support
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
                  const modelLibrary=document.getElementById('modelLibrary');

                  let stream=null,usingFront=false,vrPlaced=false;
                  let itemPos={x:0,y:-0.2,z:-1};
                  let itemRot={x:0,y:0,z:0};
                  let itemScale=1;
                  let currentModel=null;

                  // Camera functions
                  async function startCamera(facingMode='environment'){
                    if(stream) stopCamera();
                    try{
                      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode},audio:false});
                      video.srcObject=stream; await video.play();
                      startCamBtn.textContent='Stop Camera'; switchCamBtn.disabled=false;
                      status.textContent=\`Enhanced AR Camera started (\${facingMode}). Load 3D models from library.\`;
                    }catch(err){alert('Camera error: '+err.message);}
                  }
                  
                  function stopCamera(){
                    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
                    try{video.pause();video.srcObject=null;}catch(e){}
                    startCamBtn.textContent='Start Camera (back)'; switchCamBtn.disabled=true;
                    status.textContent='Camera stopped.';
                  }

                  startCamBtn.onclick=()=>{ if(!stream) startCamera(usingFront?'user':'environment'); else stopCamera(); }
                  switchCamBtn.onclick=()=>{ usingFront=!usingFront; startCamera(usingFront?'user':'environment'); switchCamBtn.textContent=usingFront?'Switch to Back':'Switch to Front'; }

                  // Load 3D model
                  function loadModel(modelType) {
                    let texId, modelName;
                    switch(modelType) {
                      case 'hvac': texId='hvacTex'; modelName='HVAC Unit'; break;
                      case 'electrical': texId='electricalTex'; modelName='Electrical Panel'; break;
                      case 'plumbing': texId='plumbingTex'; modelName='Plumbing System'; break;
                      default: return;
                    }
                    
                    vrTex.src = document.getElementById(texId).src;
                    currentModel = {type: modelType, name: modelName};
                    placeToggle.disabled=false; screenshotBtn.disabled=false;
                    status.textContent=\`\${modelName} loaded. Ready to place in AR.\`;
                    modelLibrary.style.display='none';
                  }

                  // Enhanced 3D model creation
                  function applyShape(shape){
                    vrItem.innerHTML='';
                    let el;
                    
                    if(shape==='realistic' && currentModel){
                      // Create realistic 3D model based on type
                      if(currentModel.type === 'hvac'){
                        el=document.createElement('a-box');
                        el.setAttribute('width','2'); el.setAttribute('height','1.2'); el.setAttribute('depth','0.8');
                        el.setAttribute('material',\`src:#vrTex; metalness:0.3; roughness:0.7; side:double;\`);
                        
                        // Add details
                        const detail1=document.createElement('a-cylinder');
                        detail1.setAttribute('position','0 0.7 0'); detail1.setAttribute('radius','0.3'); detail1.setAttribute('height','0.2');
                        detail1.setAttribute('material','color:#666; metalness:0.8; roughness:0.2');
                        el.appendChild(detail1);
                      } else if(currentModel.type === 'electrical'){
                        el=document.createElement('a-box');
                        el.setAttribute('width','1.5'); el.setAttribute('height','2'); el.setAttribute('depth','0.3');
                        el.setAttribute('material',\`src:#vrTex; metalness:0.1; roughness:0.9; side:double;\`);
                      } else {
                        el=document.createElement('a-cylinder');
                        el.setAttribute('radius','0.8'); el.setAttribute('height','1.5');
                        el.setAttribute('material',\`src:#vrTex; metalness:0.2; roughness:0.8; side:double;\`);
                      }
                    } else {
                      // Fallback to basic shapes
                      if(shape==='box'){ el=document.createElement('a-box'); el.setAttribute('depth','0.2'); el.setAttribute('height','0.6'); el.setAttribute('width','1'); }
                      else if(shape==='cylinder'){ el=document.createElement('a-cylinder'); el.setAttribute('radius','0.7'); el.setAttribute('theta-length','60'); el.setAttribute('height','0.6'); }
                      else if(shape==='sphere'){ el=document.createElement('a-sphere'); el.setAttribute('radius','0.7'); }
                      else { el=document.createElement('a-plane'); el.setAttribute('width','1'); el.setAttribute('height','0.6'); }
                      
                      el.setAttribute('material',\`src:#vrTex; side:double; transparent:true;\`);
                    }
                    
                    vrItem.appendChild(el);
                  }

                  // UI Controls
                  placeToggle.onclick=()=>{ vrPlaced=!vrPlaced; if(vrPlaced){ applyShape(shapeSelect.value); } vrItem.setAttribute('visible', vrPlaced); placeToggle.textContent=vrPlaced?'Hide 3D Model':'Place 3D Model'; removeItemBtn.disabled=!vrPlaced; }
                  removeItemBtn.onclick=()=>{ vrPlaced=false; vrItem.setAttribute('visible', false); placeToggle.textContent='Place 3D Model'; removeItemBtn.disabled=true; }
                  shapeSelect.onchange=()=>{ if(vrPlaced) applyShape(shapeSelect.value); }

                  // Rotation controls
                  rotateLeft.onclick=()=>{ itemRot.y -= 15; vrItem.setAttribute('rotation', itemRot); }
                  rotateRight.onclick=()=>{ itemRot.y += 15; vrItem.setAttribute('rotation', itemRot); }
                  rotateUp.onclick=()=>{ itemRot.x -= 15; vrItem.setAttribute('rotation', itemRot); }
                  rotateDown.onclick=()=>{ itemRot.x += 15; vrItem.setAttribute('rotation', itemRot); }
                  resetBtn.onclick=()=>{ itemPos={x:0,y:-0.2,z:-1}; itemRot={x:0,y:0,z:0}; itemScale=1; vrItem.setAttribute('position', itemPos); vrItem.setAttribute('rotation', itemRot); vrItem.setAttribute('scale', \`\${itemScale} \${itemScale} \${itemScale}\`); }

                  // Screenshot
                  function takeScreenshot(){ ui.style.display='none'; modelLibrary.style.display='none'; document.getElementById('modelsBtn').style.display='none'; document.getElementById('toggleBtn').style.display='none'; setTimeout(()=>{ html2canvas(document.body,{useCORS:true}).then(canvas=>{ const link=document.createElement('a'); link.download='ar-screenshot.png'; link.href=canvas.toDataURL(); link.click(); ui.style.display='block'; document.getElementById('modelsBtn').style.display='block'; document.getElementById('toggleBtn').style.display='block'; status.textContent='AR screenshot saved with 3D model.'; }); },200); }
                  screenshotBtn.onclick=()=>takeScreenshot();

                  // UI toggles
                  function toggleUI(){ ui.style.display = (ui.style.display==='none' || ui.style.display==='') ? 'block' : 'none'; }
                  function toggleModels(){ modelLibrary.style.display = (modelLibrary.style.display==='none' || modelLibrary.style.display==='') ? 'block' : 'none'; }

                  // Touch gestures for 3D models
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

                  // Listen for external model loading
                  window.addEventListener('message', function(event) {
                    if (event.data.type === 'LOAD_3D_MODEL') {
                      const model = event.data.model;
                      vrTex.src = model.image;
                      currentModel = {type: model.name.toLowerCase(), name: model.name};
                      placeToggle.disabled=false; screenshotBtn.disabled=false;
                      status.textContent=\`\${model.name} loaded from library. Ready to place in AR.\`;
                    }
                  });

                  status.textContent='Enhanced AR Camera ready. Load 3D models and place them in your environment.';
                </script>
              </body>
              </html>
            `)}`}
            className="w-full h-full border-0"
            title="VR View - AR Camera"
            allow="camera; microphone"
          />
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">How to use VR View:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Start Camera:</strong> Click "Start Camera" to begin AR experience</li>
                <li>• <strong>Upload Image:</strong> Select an image file - background will be auto-removed</li>
                <li>• <strong>3D Conversion:</strong> Choose shape (Plane, Box, Curved, Sphere) to convert 2D to 3D</li>
                <li>• <strong>Touch Controls:</strong> 1 finger to move, 2 fingers to pinch/twist/tilt</li>
                <li>• <strong>Screenshot:</strong> Capture and save your AR creation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}