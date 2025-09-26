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
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Visualizer</h1>
        <p className="text-gray-600 mt-2">Showcase blinds collections and demonstrate to customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Blinds Catalog</h2>
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center">
                      <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">3D Model Viewer</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Interactive 3D model would be displayed here
                      </p>
                    </div>
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