import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  Box, 
  Download, 
  Eye, 
  Trash2, 
  Settings, 
  Zap,
  Layers,
  RotateCcw,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface ConversionSettings {
  depth: number;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'stylized' | 'geometric';
  smoothing: boolean;
  textureEnhancement: boolean;
}

interface ARModel {
  id: string;
  name: string;
  originalImage: string;
  modelUrl: string;
  thumbnailUrl: string;
  settings: ConversionSettings;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  fileSize: number;
  businessAccess: string[];
}

export function ModelConverter() {
  const [models, setModels] = useState<ARModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<ARModel | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<ConversionSettings>({
    depth: 50,
    quality: 'medium',
    style: 'realistic',
    smoothing: true,
    textureEnhancement: true
  });

  const [newModel, setNewModel] = useState({
    name: '',
    image: null as File | null,
    imagePreview: ''
  });

  // Mock existing models
  const mockModels: ARModel[] = [
    {
      id: 'model-1',
      name: 'HVAC Unit Model',
      originalImage: 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400',
      modelUrl: '/models/hvac-unit.glb',
      thumbnailUrl: 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=200',
      settings: {
        depth: 60,
        quality: 'high',
        style: 'realistic',
        smoothing: true,
        textureEnhancement: true
      },
      status: 'completed',
      createdAt: '2024-01-15T10:30:00Z',
      fileSize: 2.5,
      businessAccess: ['business-1', 'business-2']
    },
    {
      id: 'model-2',
      name: 'Electrical Panel 3D',
      originalImage: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
      modelUrl: '/models/electrical-panel.glb',
      thumbnailUrl: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=200',
      settings: {
        depth: 40,
        quality: 'medium',
        style: 'geometric',
        smoothing: false,
        textureEnhancement: true
      },
      status: 'completed',
      createdAt: '2024-01-16T14:20:00Z',
      fileSize: 1.8,
      businessAccess: ['business-1']
    }
  ];

  React.useEffect(() => {
    setModels(mockModels);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewModel({
          name: file.name.replace(/\.[^/.]+$/, ''),
          image: file,
          imagePreview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateConversion = async () => {
    setIsConverting(true);
    setConversionProgress(0);

    // Simulate AI processing steps
    const steps = [
      { progress: 20, message: 'Analyzing image structure...' },
      { progress: 40, message: 'Generating depth map...' },
      { progress: 60, message: 'Creating 3D mesh...' },
      { progress: 80, message: 'Applying textures...' },
      { progress: 100, message: 'Finalizing model...' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConversionProgress(step.progress);
    }

    // Create new model
    const newARModel: ARModel = {
      id: `model-${Date.now()}`,
      name: newModel.name,
      originalImage: newModel.imagePreview,
      modelUrl: `/models/${newModel.name.toLowerCase().replace(/\s+/g, '-')}.glb`,
      thumbnailUrl: newModel.imagePreview,
      settings: { ...settings },
      status: 'completed',
      createdAt: new Date().toISOString(),
      fileSize: Math.random() * 3 + 1, // Random size between 1-4 MB
      businessAccess: []
    };

    setModels(prev => [newARModel, ...prev]);
    setIsConverting(false);
    setConversionProgress(0);
    setNewModel({ name: '', image: null, imagePreview: '' });
    
    showSuccessMessage('3D model generated successfully!');
  };

  const handleConvert = () => {
    if (!newModel.image) return;
    simulateConversion();
  };

  const deleteModel = (modelId: string) => {
    if (window.confirm('Are you sure you want to delete this 3D model?')) {
      setModels(prev => prev.filter(model => model.id !== modelId));
      showSuccessMessage('Model deleted successfully!');
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Box className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">3D AR Model Converter</h1>
          <p className="text-gray-600 mt-2">Convert 2D images to 3D AR models using AI technology</p>
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
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Image
          </button>
        </div>
      </div>

      {/* Conversion Interface */}
      {(newModel.imagePreview || isConverting) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI 2D to 3D Conversion</h2>
          
          {isConverting ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Converting to 3D Model</h3>
              <p className="text-gray-600 mb-4">AI is processing your image...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${conversionProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{conversionProgress}% complete</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Image</h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={newModel.imagePreview}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conversion Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={newModel.name}
                      onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter model name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Depth Level: {settings.depth}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.depth}
                      onChange={(e) => setSettings({...settings, depth: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <select
                      value={settings.quality}
                      onChange={(e) => setSettings({...settings, quality: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low (Fast)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Best Quality)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <select
                      value={settings.style}
                      onChange={(e) => setSettings({...settings, style: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="realistic">Realistic</option>
                      <option value="stylized">Stylized</option>
                      <option value="geometric">Geometric</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.smoothing}
                        onChange={(e) => setSettings({...settings, smoothing: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Surface Smoothing</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.textureEnhancement}
                        onChange={(e) => setSettings({...settings, textureEnhancement: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Texture Enhancement</span>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleConvert}
                    disabled={!newModel.name.trim()}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Convert to 3D Model
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-100 overflow-hidden relative">
              <img
                src={model.thumbnailUrl}
                alt={model.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {getStatusIcon(model.status)}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{model.name}</h3>
                  <p className="text-sm text-gray-600">
                    {model.fileSize.toFixed(1)} MB • {model.settings.quality} quality
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedModel(model);
                      setShowPreview(true);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteModel(model.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Business Access:</p>
                <div className="flex flex-wrap gap-1">
                  {model.businessAccess.length > 0 ? (
                    model.businessAccess.map((businessId) => (
                      <span key={businessId} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {businessId}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      No access granted
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created {new Date(model.createdAt).toLocaleDateString()}</span>
                <button className="text-blue-600 hover:text-blue-800">
                  Manage Access
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {models.length === 0 && (
        <div className="text-center py-12">
          <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No 3D models created yet</p>
          <p className="text-sm text-gray-500 mt-2">Upload an image to create your first 3D AR model</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Model Preview Modal */}
      {showPreview && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">3D Model Preview</h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedModel(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Original Image</h4>
                <img
                  src={selectedModel.originalImage}
                  alt="Original"
                  className="w-full rounded-lg"
                />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">3D Model Preview</h4>
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Box className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">3D Model Viewer</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Interactive 3D preview would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Model Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <p className="font-medium">{selectedModel.settings.quality}</p>
                </div>
                <div>
                  <span className="text-gray-600">Style:</span>
                  <p className="font-medium">{selectedModel.settings.style}</p>
                </div>
                <div>
                  <span className="text-gray-600">Depth:</span>
                  <p className="font-medium">{selectedModel.settings.depth}%</p>
                </div>
                <div>
                  <span className="text-gray-600">File Size:</span>
                  <p className="font-medium">{selectedModel.fileSize.toFixed(1)} MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">AI Conversion Technology</h4>
                <p className="text-blue-800 text-sm">
                  Our advanced AI system analyzes your 2D images and generates realistic 3D models 
                  suitable for AR visualization. Adjust the settings below to customize the conversion process.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Quality Setting
                </label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings({...settings, quality: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low - Fast processing, smaller files</option>
                  <option value="medium">Medium - Balanced quality and speed</option>
                  <option value="high">High - Best quality, larger files</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Style
                </label>
                <select
                  value={settings.style}
                  onChange={(e) => setSettings({...settings, style: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="realistic">Realistic - Natural looking models</option>
                  <option value="stylized">Stylized - Artistic interpretation</option>
                  <option value="geometric">Geometric - Clean, angular shapes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Depth Level: {settings.depth}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.depth}
                  onChange={(e) => setSettings({...settings, depth: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Shallow</span>
                  <span>Deep</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Processing Options</h4>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smoothing}
                    onChange={(e) => setSettings({...settings, smoothing: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Surface Smoothing - Reduces rough edges
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.textureEnhancement}
                    onChange={(e) => setSettings({...settings, textureEnhancement: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Texture Enhancement - Improves surface details
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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