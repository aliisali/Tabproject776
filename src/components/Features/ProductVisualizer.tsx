import React, { useState } from 'react';
import { 
  Package, 
  Camera, 
  Maximize, 
  RotateCcw, 
  Zap, 
  Info,
  Eye,
  Smartphone
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function ProductVisualizer() {
  const { products } = useData();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'ar'>('2d');

  // Filter active products only
  const activeProducts = products.filter(product => product.isActive);

  const selectedProductData = activeProducts.find(p => p.id === selectedProduct);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Visualizer</h1>
        <p className="text-gray-600 mt-2">View and demonstrate products to customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Catalog</h2>
          <div className="space-y-4">
            {activeProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProduct === product.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <p className="text-sm font-semibold text-blue-600">${product.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedProductData ? (
            <>
              {/* View Mode Selector */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedProductData.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === '2d'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-1 inline" />
                    2D View
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === '3d'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Package className="w-4 h-4 mr-1 inline" />
                    3D View
                  </button>
                  <button
                    onClick={() => setViewMode('ar')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'ar'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mr-1 inline" />
                    AR View
                  </button>
                </div>
              </div>

              {/* Viewer Area */}
              <div className="relative bg-gray-50 rounded-lg h-96 mb-6 overflow-hidden">
                {viewMode === '2d' && (
                  <img
                    src={selectedProductData.image}
                    alt={selectedProductData.name}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {viewMode === '3d' && (
                  <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                    <iframe
                      src={`data:text/html;charset=utf-8,${encodeURIComponent(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <meta charset="utf-8">
                          <title>3D Model Viewer</title>
                          <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
                          <style>
                            body { margin: 0; overflow: hidden; background: linear-gradient(135deg, #1f2937, #374151); }
                            a-scene { width: 100vw; height: 100vh; }
                            #controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 100; background: rgba(255,255,255,0.9); padding: 10px 20px; border-radius: 25px; display: flex; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
                            .control-btn { background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 15px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
                            .control-btn:hover { background: #2563eb; transform: scale(1.05); }
                            #info { position: fixed; top: 20px; left: 20px; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 10px; font-family: Arial, sans-serif; font-size: 14px; max-width: 250px; }
                          </style>
                        </head>
                        <body>
                          <div id="info">
                            <h3 style="margin: 0 0 10px 0; color: #1f2937;">${selectedProductData.name}</h3>
                            <p style="margin: 0 0 5px 0; color: #6b7280;">Price: $${selectedProductData.price.toLocaleString()}</p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">Use controls below to interact</p>
                          </div>
                          
                          <div id="controls">
                            <button class="control-btn" onclick="rotateLeft()">↺ Rotate</button>
                            <button class="control-btn" onclick="zoomIn()">🔍 Zoom In</button>
                            <button class="control-btn" onclick="zoomOut()">🔍 Zoom Out</button>
                            <button class="control-btn" onclick="resetView()">🔄 Reset</button>
                            <button class="control-btn" onclick="toggleWireframe()">📐 Wireframe</button>
                          </div>

                          <a-scene embedded background="color: linear-gradient(135deg, #1f2937, #374151)" vr-mode-ui="enabled: false">
                            <a-assets>
                              <img id="productTexture" src="${selectedProductData.image}" crossorigin="anonymous">
                            </a-assets>
                            
                            <!-- Lighting -->
                            <a-light type="ambient" color="#404040" intensity="0.4"></a-light>
                            <a-light type="directional" position="2 4 5" color="#ffffff" intensity="0.8"></a-light>
                            <a-light type="point" position="-2 2 2" color="#4f46e5" intensity="0.3"></a-light>
                            
                            <!-- 3D Model -->
                            <a-entity id="productModel" position="0 0 -3" rotation="0 0 0" scale="1 1 1">
                              <a-box 
                                id="mainModel"
                                width="2" 
                                height="1.2" 
                                depth="0.3"
                                material="src: #productTexture; metalness: 0.2; roughness: 0.8"
                                animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"
                              ></a-box>
                              
                              <!-- Additional details for realism -->
                              <a-cylinder 
                                position="0 -0.8 0" 
                                radius="1.2" 
                                height="0.1" 
                                color="#2d3748"
                                material="metalness: 0.8; roughness: 0.2"
                              ></a-cylinder>
                            </a-entity>
                            
                            <!-- Camera with controls -->
                            <a-entity id="cameraRig" position="0 1.6 0">
                              <a-camera 
                                id="camera"
                                look-controls="enabled: true; pointerLockEnabled: false"
                                wasd-controls="enabled: false"
                                position="0 0 0"
                              ></a-camera>
                            </a-entity>
                            
                            <!-- Environment -->
                            <a-plane 
                              position="0 -1 0" 
                              rotation="-90 0 0" 
                              width="10" 
                              height="10" 
                              color="#1a202c"
                              material="metalness: 0.1; roughness: 0.9"
                            ></a-plane>
                          </a-scene>

                          <script>
                            let currentRotation = 0;
                            let currentScale = 1;
                            let isWireframe = false;
                            const model = document.querySelector('#productModel');
                            const mainModel = document.querySelector('#mainModel');
                            
                            function rotateLeft() {
                              currentRotation += 45;
                              model.setAttribute('rotation', \`0 \${currentRotation} 0\`);
                            }
                            
                            function zoomIn() {
                              currentScale = Math.min(currentScale * 1.2, 3);
                              model.setAttribute('scale', \`\${currentScale} \${currentScale} \${currentScale}\`);
                            }
                            
                            function zoomOut() {
                              currentScale = Math.max(currentScale * 0.8, 0.3);
                              model.setAttribute('scale', \`\${currentScale} \${currentScale} \${currentScale}\`);
                            }
                            
                            function resetView() {
                              currentRotation = 0;
                              currentScale = 1;
                              model.setAttribute('rotation', '0 0 0');
                              model.setAttribute('scale', '1 1 1');
                              model.setAttribute('position', '0 0 -3');
                            }
                            
                            function toggleWireframe() {
                              isWireframe = !isWireframe;
                              if (isWireframe) {
                                mainModel.setAttribute('material', 'wireframe: true; color: #00ff00');
                              } else {
                                mainModel.setAttribute('material', 'src: #productTexture; metalness: 0.2; roughness: 0.8; wireframe: false');
                              }
                            }
                            
                            // Auto-rotate toggle
                            let autoRotate = true;
                            document.addEventListener('click', function() {
                              if (autoRotate) {
                                mainModel.removeAttribute('animation');
                                autoRotate = false;
                              }
                            });
                          </script>
                        </body>
                        </html>
                      `)}`}
                      className="w-full h-full border-0"
                      title="3D Model Viewer"
                    />
                  </div>
                )}
                
                {viewMode === 'ar' && (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
                    <div className="text-center">
                      <Smartphone className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">AR Experience</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Augmented Reality view would be activated here
                      </p>
                      <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Camera className="w-4 h-4 mr-2 inline" />
                        Launch AR Camera
                      </button>
                    </div>
                  </div>
                )}

                {/* Viewer Controls */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <Maximize className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <Info className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Product Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 mb-4">{selectedProductData.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-blue-600">${selectedProductData.price.toLocaleString()}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      In Stock
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <ul className="space-y-2">
                    {selectedProductData.specifications.map((spec, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <Zap className="w-4 h-4 text-blue-500 mr-2" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Add to Quote
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Share with Customer
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Save to Favorites
                </button>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a product to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}