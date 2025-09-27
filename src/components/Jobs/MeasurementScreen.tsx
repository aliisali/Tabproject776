import React, { useState } from 'react';
import { Plus, Ruler, Save, ArrowRight, Trash2 } from 'lucide-react';
import { Job, JobMeasurement } from '../../types';

interface MeasurementScreenProps {
  job: Job;
  onComplete: (data: { measurements: JobMeasurement[] }) => void;
}

export function MeasurementScreen({ job, onComplete }: MeasurementScreenProps) {
  const [measurements, setMeasurements] = useState<JobMeasurement[]>(job.measurements || []);
  const [newMeasurement, setNewMeasurement] = useState({
    windowId: '',
    width: '',
    height: '',
    notes: '',
    location: ''
  });

  const handleAddMeasurement = () => {
    if (!newMeasurement.windowId || !newMeasurement.width || !newMeasurement.height) {
      alert('Please fill in all required fields');
      return;
    }

    const measurement: JobMeasurement = {
      id: `measurement-${Date.now()}`,
      windowId: newMeasurement.windowId,
      width: parseFloat(newMeasurement.width),
      height: parseFloat(newMeasurement.height),
      notes: newMeasurement.notes,
      location: newMeasurement.location,
      createdAt: new Date().toISOString()
    };

    setMeasurements(prev => [...prev, measurement]);
    setNewMeasurement({
      windowId: '',
      width: '',
      height: '',
      notes: '',
      location: ''
    });
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const handleComplete = () => {
    if (measurements.length === 0) {
      alert('Please add at least one measurement');
      return;
    }
    onComplete({ measurements });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Window Measurements</h3>
        <p className="text-gray-600">Take accurate measurements for each window</p>
      </div>

      {/* Add New Measurement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4">Add New Measurement</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Window ID *
            </label>
            <input
              type="text"
              value={newMeasurement.windowId}
              onChange={(e) => setNewMeasurement({...newMeasurement, windowId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="W1, W2, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={newMeasurement.width}
              onChange={(e) => setNewMeasurement({...newMeasurement, width: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="120.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={newMeasurement.height}
              onChange={(e) => setNewMeasurement({...newMeasurement, height: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="150.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={newMeasurement.location}
              onChange={(e) => setNewMeasurement({...newMeasurement, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Living room, bedroom, etc."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={newMeasurement.notes}
              onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Special requirements, obstacles, etc."
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddMeasurement}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Measurement
          </button>
        </div>
      </div>

      {/* Measurements List */}
      {measurements.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Recorded Measurements</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {measurements.map(measurement => (
              <div key={measurement.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Window {measurement.windowId}</p>
                      <p className="text-sm text-gray-600">
                        {measurement.width} × {measurement.height} cm
                      </p>
                      {measurement.location && (
                        <p className="text-sm text-gray-500">{measurement.location}</p>
                      )}
                      {measurement.notes && (
                        <p className="text-sm text-gray-500 italic">{measurement.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMeasurement(measurement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={measurements.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Measurements & Continue
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </div>
  );
}