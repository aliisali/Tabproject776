import React, { useState, useEffect } from 'react';
import { Clock, Save, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { EmployeeWorkingHours } from '../../types';

export function WorkingHoursManager() {
  const { user } = useAuth();
  const [workingHours, setWorkingHours] = useState<EmployeeWorkingHours | null>(null);

  useEffect(() => {
    if (user) {
      loadWorkingHours();
    }
  }, [user]);

  const loadWorkingHours = () => {
    try {
      const stored = localStorage.getItem(`working_hours_${user?.id}`);
      if (stored) {
        setWorkingHours(JSON.parse(stored));
      } else {
        // Create default working hours
        const defaultHours: EmployeeWorkingHours = {
          userId: user?.id || '',
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '13:00', available: false },
          sunday: { start: '09:00', end: '13:00', available: false }
        };
        setWorkingHours(defaultHours);
      }
    } catch (error) {
      console.error('Error loading working hours:', error);
    }
  };

  const saveWorkingHours = () => {
    if (workingHours) {
      try {
        localStorage.setItem(`working_hours_${user?.id}`, JSON.stringify(workingHours));
        showSuccessMessage('Working hours saved successfully!');
      } catch (error) {
        console.error('Error saving working hours:', error);
      }
    }
  };

  const updateDayHours = (day: keyof Omit<EmployeeWorkingHours, 'userId'>, field: 'start' | 'end' | 'available', value: string | boolean) => {
    if (workingHours) {
      setWorkingHours({
        ...workingHours,
        [day]: {
          ...workingHours[day],
          [field]: value
        }
      });
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

  if (!workingHours) {
    return <div>Loading...</div>;
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ] as const;

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Working Hours</h1>
          <p className="text-gray-600 mt-2">Set your availability for automatic job assignment</p>
        </div>
        <button
          onClick={saveWorkingHours}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Hours
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-24">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={workingHours[key].available}
                    onChange={(e) => updateDayHours(key, 'available', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="font-medium text-gray-900">{label}</span>
                </label>
              </div>

              {workingHours[key].available ? (
                <div className="flex items-center space-x-4 flex-1">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={workingHours[key].start}
                      onChange={(e) => updateDayHours(key, 'start', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={workingHours[key].end}
                      onChange={(e) => updateDayHours(key, 'end', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1 text-sm text-gray-600">
                    Available: {workingHours[key].start} - {workingHours[key].end}
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-500 italic">
                  Not available
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Automatic Job Assignment</h4>
          <p className="text-blue-800 text-sm">
            When automatic booking is enabled, jobs will only be assigned to you during your available hours.
            Make sure to keep your working hours updated for accurate job assignment.
          </p>
        </div>
      </div>
    </div>
  );
}