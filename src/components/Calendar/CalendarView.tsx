import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  User,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const { jobs } = useData();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  // Convert jobs to calendar events
  const calendarEvents = jobs.map(job => ({
    id: job.id,
    title: job.title,
    customer: job.customerId,
    time: new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: '2 hours', // Default duration
    location: 'Customer Location',
    status: job.status === 'completed' ? 'confirmed' : job.status === 'pending' ? 'pending' : 'confirmed',
    date: new Date(job.scheduledDate),
    jobData: job
  }));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Schedule and manage your appointments</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          New Event
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === viewType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {getDaysInMonth(currentDate).map((date, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-100 rounded-lg ${
                date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              } transition-colors`}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-2 ${
                    date.toDateString() === new Date().toDateString()
                      ? 'text-blue-600'
                      : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {/* Events for this date */}
                  <div className="space-y-1">
                    {getEventsForDate(date).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => {
                          setSelectedJob(event.jobData);
                          setShowJobModal(true);
                        }}
                        className={`p-1 rounded text-xs font-medium truncate ${
                          event.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : event.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {event.time} - {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-4">
          {calendarEvents.slice(0, 5).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                 onClick={() => {
                   setSelectedJob(event.jobData);
                   setShowJobModal(true);
                 }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {event.time} ({event.duration})
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {event.customer}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                event.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : event.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {event.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Job Details</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setSelectedJob(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedJob.title}</h4>
                <p className="text-gray-600">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job ID</label>
                  <p className="text-gray-900 font-mono">{selectedJob.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedJob.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedJob.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    selectedJob.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedJob.status.replace('-', ' ')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-gray-900">{selectedJob.customerId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <p className="text-gray-900">{new Date(selectedJob.scheduledDate).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <p className="text-gray-900">{selectedJob.employeeId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quotation</label>
                  <p className="text-gray-900">${selectedJob.quotation?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              {selectedJob.checklist && selectedJob.checklist.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
                  <div className="space-y-2">
                    {selectedJob.checklist.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          readOnly
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}