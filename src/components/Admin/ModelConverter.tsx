import React, { useState, useRef } from 'react';
import { Upload, Eye, Trash2, Download, Settings, Cuboid as Cube, Image, Zap, X, Play, Pause } from 'lucide-react';

interface Model3D {
  id: string;
  name: string;
  originalImage: string;
  model3D: string;
  thumbnail: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  settings: {
    depth: number;
    quality: 'low' | 'medium' | 'high';
    style: 'extrude' | 'relief' | 'full3d';
  };
}

export function ModelConverter() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    depth: 0.5,
    quality: 'medium' as 'low' | 'medium' | 'high',
    style: 'extrude' as 'extrude' | 'relief' | 'full3d'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsProcessing(true);

    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      
      // Create new model entry
      const newModel: Model3D = {
        id: `model-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        originalImage: imageUrl,
        model3D: '',
        thumbnail: imageUrl,
        status: 'processing',
        createdAt: new Date().toISOString(),
        settings: { ...conversionSettings }
      };

      setModels(prev => [newModel, ...prev]);

      // Simulate 3D conversion process
      setTimeout(() => {
        // In a real implementation, this would call a 3D conversion API
        const convertedModel = {
          ...newModel,
          status: 'completed' as const,
          model3D: generateMock3DModel(imageUrl, conversionSettings)
        };

        setModels(prev => prev.map(m => 
          m.id === newModel.id ? convertedModel : m
        ));

        showSuccessMessage(`3D model "${newModel.name}" created successfully!`);
      }, 3000);

    } catch (error) {
      console.error('Error processing image:', error);
      showErrorMessage('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMock3DModel = (imageUrl: string, settings: any) => {
    // This would be replaced with actual 3D model generation
    // For now, we'll create a mock 3D model URL
    return `data:model/gltf+json,${encodeURIComponent(JSON.stringify({
      asset: { version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{
        primitives: [{
          attributes: { POSITION: 0 },
          indices: 1
        }]
      }],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: 4,
          type: "VEC3"
        },
        {
          bufferView: 1,
          componentType: 5123,
          count: 6,
          type: "SCALAR"
        }
      ],
      bufferViews: [
        { buffer: 0, byteLength: 48, target: 34962 },
        { buffer: 0, byteOffset: 48, byteLength: 12, target: 34963 }
      ],
      buffers: [{ byteLength: 60 }],
      materials: [{
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 }
        }
      }],
      textures: [{ source: 0 }],
      images: [{ uri: imageUrl }]
    }))}`;
  };

  const deleteModel = (modelId: string) => {
    if (window.confirm('Are you sure you want to delete this 3D model?')) {
      setModels(prev => prev.filter(m => m.id !== modelId));
      showSuccessMessage('3D model deleted successfully!');
    }
  };

  const downloadModel = (model: Model3D) => {
    // Create download link for the 3D model
    const link = document.createElement('a');
    link.href = model.model3D;
    link.download = `${model.name}.gltf`;
    link.click();
    showSuccessMessage('3D model download started!');
  };

  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 3000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">3D Model Converter</h1>
          <p className="text-gray-600 mt-2">Convert 2D images into 3D AR models</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5 mr-2" />
            {isProcessing ? 'Processing...' : 'Upload Image'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="font-medium text-blue-900">Converting to 3D Model</h3>
              <p className="text-blue-700 text-sm">This may take a few moments...</p>
            </div>
          </div>
        </div>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={model.thumbnail}
                alt={model.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  model.status === 'completed' ? 'bg-green-100 text-green-800' :
                  model.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {model.status}
                </span>
              </div>
              {model.status === 'processing' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{model.name}</h3>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Style: {model.settings.style}</span>
                <span>Quality: {model.settings.quality}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {model.status === 'completed' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedModel(model);
                        setShowViewer(true);
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View 3D
                    </button>
                    <button
                      onClick={() => downloadModel(model)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteModel(model.id)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {models.length === 0 && (
        <div className="text-center py-12">
          <Cube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No 3D models created yet</p>
          <p className="text-sm text-gray-500">Upload an image to create your first 3D model</p>
        </div>
      )}

      {/* 3D Viewer Modal */}
      {showViewer && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">3D Model Viewer - {selectedModel.name}</h3>
              <button
                onClick={() => setShowViewer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Cube className="w-16 h-16 text-gray-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-700 font-medium">3D Model Viewer</p>
                  <p className="text-sm text-gray-500 mt-2">Interactive 3D model would be displayed here</p>
                  <p className="text-xs text-gray-400 mt-1">Using Three.js or A-Frame for 3D rendering</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Play className="w-4 h-4 mr-2" />
                    Rotate
                  </button>
                  <button className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Zap className="w-4 h-4 mr-2" />
                    Reset View
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Use mouse to rotate • Scroll to zoom
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Conversion Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3D Style
                </label>
                <select
                  value={conversionSettings.style}
                  onChange={(e) => setConversionSettings({
                    ...conversionSettings,
                    style: e.target.value as 'extrude' | 'relief' | 'full3d'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="extrude">Extrude (Simple depth)</option>
                  <option value="relief">Relief (Carved effect)</option>
                  <option value="full3d">Full 3D (Complex geometry)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <select
                  value={conversionSettings.quality}
                  onChange={(e) => setConversionSettings({
                    ...conversionSettings,
                    quality: e.target.value as 'low' | 'medium' | 'high'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low (Fast, smaller file)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Best quality, larger file)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depth: {conversionSettings.depth}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={conversionSettings.depth}
                  onChange={(e) => setConversionSettings({
                    ...conversionSettings,
                    depth: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Shallow</span>
                  <span>Deep</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}