import React, { useState } from 'react';
import { Package, Camera, Check, ArrowRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Job, SelectedProduct } from '../../types';

interface ProductSelectionProps {
  job: Job;
  onComplete: (data: { selectedProducts: SelectedProduct[] }) => void;
}

export function ProductSelection({ job, onComplete }: ProductSelectionProps) {
  const { products } = useData();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(job.selectedProducts || []);
  const [showARCamera, setShowARCamera] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  const handleProductSelect = (product: any) => {
    const existingProduct = selectedProducts.find(p => p.productId === product.id);
    
    if (existingProduct) {
      // Update quantity
      setSelectedProducts(prev => prev.map(p => 
        p.productId === product.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      // Add new product
      const newSelectedProduct: SelectedProduct = {
        id: `selected-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        customerApproved: false,
        createdAt: new Date().toISOString()
      };
      
      setSelectedProducts(prev => [...prev, newSelectedProduct]);
    }
  };

  const handleARDemo = (product: any) => {
    setCurrentProduct(product);
    setShowARCamera(true);
  };

  const handleARScreenshot = (screenshot: string) => {
    if (currentProduct) {
      setSelectedProducts(prev => prev.map(p => 
        p.productId === currentProduct.id 
          ? { ...p, arScreenshot: screenshot, customerApproved: true }
          : p
      ));
    }
    setShowARCamera(false);
  };

  const handleComplete = () => {
    onComplete({ selectedProducts });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Selection</h3>
        <p className="text-gray-600">Show products to customer and demonstrate with AR</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.filter(p => p.isActive).map(product => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
            <p className="text-lg font-bold text-blue-600 mb-3">${product.price}</p>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleProductSelect(product)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Package className="w-4 h-4 mr-1 inline" />
                Select
              </button>
              <button
                onClick={() => handleARDemo(product)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Selected Products</h4>
          <div className="space-y-2">
            {selectedProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">Qty: {product.quantity} | ${product.price}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {product.arScreenshot && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      AR Demo
                    </span>
                  )}
                  {product.customerApproved && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AR Camera Modal */}
      {showARCamera && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AR Demo: {currentProduct.name}
            </h3>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">AR Camera would be active here</p>
                <button
                  onClick={() => handleARScreenshot('mock-screenshot-url')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  📸 Capture Screenshot
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowARCamera(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={selectedProducts.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Measurements
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </div>
  );
}