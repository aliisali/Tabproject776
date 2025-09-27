import React, { useState, useRef } from 'react';
import { PenTool, RotateCcw, Check, ArrowRight } from 'lucide-react';
import { Job } from '../../types';

interface SignatureCaptureProps {
  job: Job;
  onComplete: (data: { signature: string }) => void;
}

export function SignatureCapture({ job, onComplete }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setSignatureCaptured(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureCaptured(false);
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (canvas && signatureCaptured) {
      const signatureData = canvas.toDataURL();
      onComplete({ signature: signatureData });
    } else {
      alert('Please capture customer signature first');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Signature</h3>
        <p className="text-gray-600">Get customer signature to confirm satisfaction</p>
      </div>

      {/* Signature Pad */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Signature Pad</h4>
          <button
            onClick={clearSignature}
            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full border border-gray-200 rounded-lg cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ touchAction: 'none' }}
        />

        <p className="text-sm text-gray-500 mt-2 text-center">
          Customer: Please sign above to confirm you are satisfied with the installation
        </p>
      </div>

      {/* Installation Photos */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Installation Photos</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {job.images.map((image, index) => (
            <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img src={image} alt={`Installation ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          <button className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
            <div className="text-center">
              <PenTool className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Add Photo</p>
            </div>
          </button>
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!signatureCaptured}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4 mr-2 inline" />
          Complete Installation
        </button>
      </div>
    </div>
  );
}