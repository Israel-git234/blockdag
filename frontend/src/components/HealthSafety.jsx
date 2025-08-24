import React, { useState, useCallback } from 'react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Shield, 
  User, 
  FileText, 
  Clock,
  Navigation,
  Building,
  Users,
  CheckCircle,
  Plus,
  AlertCircle
} from 'lucide-react';

const HealthSafety = ({ account, contracts, onTransaction }) => {
  const [activeTab, setActiveTab] = useState('records');
  const [showBooking, setShowBooking] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  // Mock medical records data
  const [medicalRecords] = useState([
    {
      id: 1,
      date: '2024-01-15',
      hospital: 'Johannesburg General Hospital',
      doctor: 'Dr. Sarah Mokoena',
      diagnosis: 'Regular checkup - Healthy',
      treatment: 'Blood pressure monitoring',
      medication: 'None required'
    },
    {
      id: 2,
      date: '2023-12-20',
      hospital: 'Pretoria Medical Centre',
      doctor: 'Dr. Lebo Nkosi',
      diagnosis: 'Seasonal flu',
      treatment: 'Rest and fluids',
      medication: 'Paracetamol 500mg'
    }
  ]);

  // Mock assistance centers data
  const [assistanceCenters] = useState([
    {
      id: 1,
      name: 'Women\'s Safety Center - Johannesburg',
      type: 'Safety & Support',
      address: '123 Commissioner Street, Johannesburg CBD',
      phone: '+27 11 123 4567',
      services: ['Emergency shelter', 'Legal advice', 'Counseling'],
      distance: '2.3 km',
      coordinates: { lat: -26.2041, lng: 28.0473 }
    },
    {
      id: 2,
      name: 'Maternal Health Clinic - Pretoria',
      type: 'Healthcare',
      address: '456 Church Street, Pretoria Central',
      phone: '+27 12 987 6543',
      services: ['Prenatal care', 'Emergency delivery', 'Postnatal support'],
      distance: '5.1 km',
      coordinates: { lat: -25.7479, lng: 28.2293 }
    },
    {
      id: 3,
      name: 'Community Support Hub - Cape Town',
      type: 'Community Support',
      address: '789 Long Street, Cape Town CBD',
      phone: '+27 21 456 7890',
      services: ['Job training', 'Financial literacy', 'Childcare support'],
      distance: '1.8 km',
      coordinates: { lat: -33.9249, lng: 18.4241 }
    }
  ]);

  // Mock appointment booking form
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    reason: '',
    hospital: '',
    date: '',
    time: '',
    priority: 'normal'
  });

  const validateBookingForm = useCallback(() => {
    if (!bookingForm.name.trim()) {
      setBookingError('Please enter your full name');
      return false;
    }
    
    if (!bookingForm.phone.trim()) {
      setBookingError('Please enter your phone number');
      return false;
    }
    
    if (!bookingForm.reason) {
      setBookingError('Please select a reason for visit');
      return false;
    }
    
    if (!bookingForm.date) {
      setBookingError('Please select a preferred date');
      return false;
    }
    
    if (!bookingForm.time) {
      setBookingError('Please select a preferred time');
      return false;
    }
    
    // Check if date is in the future
    const selectedDate = new Date(bookingForm.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setBookingError('Please select a future date');
      return false;
    }
    
    return true;
  }, [bookingForm]);

  const handleBookingSubmit = useCallback(async (e) => {
    e.preventDefault();
    setBookingError('');
    
    if (!validateBookingForm()) return;
    
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      if (onTransaction) {
        const priorityText = bookingForm.priority === 'pregnant' ? ' (Priority)' : 
                           bookingForm.priority === 'emergency' ? ' (Emergency)' : '';
        onTransaction(Promise.resolve(), `Appointment booked successfully!${priorityText}`);
      }
      
      setShowBooking(false);
      setBookingForm({
        name: '',
        phone: '',
        reason: '',
        hospital: '',
        date: '',
        time: '',
        priority: 'normal'
      });
    } catch (error) {
      console.error('Booking failed:', error);
      setBookingError('Booking failed. Please try again.');
    }
  }, [bookingForm, onTransaction, validateBookingForm]);

  const triggerSOS = useCallback(async () => {
    try {
      setShowSOS(true);
      setBookingError('');
      
      // Simulate SOS process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success message
      if (onTransaction) {
        onTransaction(Promise.resolve(), 'Emergency SOS activated! Location shared with nearest assistance center.');
      }
      
      setShowSOS(false);
    } catch (error) {
      console.error('SOS failed:', error);
      setBookingError('SOS activation failed. Please try again.');
    }
  }, [onTransaction]);

  const handleInputChange = useCallback((field, value) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
    if (bookingError) setBookingError('');
  }, [bookingError]);

  const handleCancelBooking = useCallback(() => {
    setShowBooking(false);
    setBookingForm({
      name: '',
      phone: '',
      reason: '',
      hospital: '',
      date: '',
      time: '',
      priority: 'normal'
    });
    setBookingError('');
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'emergency': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-orange-600 bg-orange-50';
      case 'pregnant': return 'text-purple-600 bg-purple-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  }, []);

  const getPriorityLabel = useCallback((priority) => {
    switch (priority) {
      case 'emergency': return 'Emergency';
      case 'urgent': return 'Urgent';
      case 'pregnant': return 'Pregnant';
      default: return 'Normal';
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-600" />
          Health & Safety
        </h1>
        <p className="text-gray-600 mt-2">Your health records, appointments, and safety resources</p>
      </div>

      {/* Emergency SOS Button */}
      <div className="mb-8">
        <button
          onClick={triggerSOS}
          disabled={showSOS}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg text-xl font-semibold"
        >
          {showSOS ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Activating SOS...
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6" />
              EMERGENCY SOS - Tap for Immediate Help
            </>
          )}
        </button>
        {showSOS && (
          <div className="mt-4 text-center text-red-600 font-medium">
            🚨 Sharing your location with nearest assistance center...
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'records'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Medical Records
        </button>
        <button
          onClick={() => setActiveTab('booking')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'booking'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Book Appointment
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'safety'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Safety & Assistance
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Your Medical History</h3>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                <Plus className="w-4 h-4 inline mr-1" />
                Add Record
              </button>
            </div>
            
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{record.date}</span>
                    </div>
                    <span className="text-sm text-gray-500">{record.hospital}</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Doctor</p>
                      <p className="font-medium text-gray-900">{record.doctor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Diagnosis</p>
                      <p className="font-medium text-gray-900">{record.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Treatment</p>
                      <p className="font-medium text-gray-900">{record.treatment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Medication</p>
                      <p className="font-medium text-gray-900">{record.medication}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Why Blockchain Medical Records?</h4>
              <p className="text-blue-700 text-sm">
                In South Africa, medical records are often fragmented across hospitals. Our blockchain solution ensures 
                your complete medical history is accessible to any doctor, preventing duplicate treatments and saving costs.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'booking' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Book Hospital Appointment</h3>
              <button
                onClick={() => setShowBooking(!showBooking)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {showBooking ? 'Cancel' : 'New Booking'}
              </button>
            </div>

            {showBooking && (
              <form onSubmit={handleBookingSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
                {/* Error Display */}
                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    {bookingError}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bookingForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingForm.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select reason...</option>
                      <option value="prenatal">Prenatal Care</option>
                      <option value="emergency">Emergency</option>
                      <option value="checkup">Regular Checkup</option>
                      <option value="specialist">Specialist Consultation</option>
                      <option value="followup">Follow-up Visit</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                    <select
                      value={bookingForm.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="normal">Normal</option>
                      <option value="pregnant">Pregnant (Priority)</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingForm.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select time...</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Priority Booking for Special Cases</h4>
              <p className="text-green-700 text-sm">
                Pregnant women, emergency cases, and urgent medical needs receive priority scheduling. 
                Our system automatically allocates the best available slots based on medical urgency.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Assistance Centers Near You</h3>
            
            <div className="space-y-4">
              {assistanceCenters.map((center) => (
                <div key={center.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{center.name}</h4>
                      <p className="text-sm text-purple-600 font-medium">{center.type}</p>
                    </div>
                    <span className="text-sm text-gray-500">{center.distance}</span>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{center.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600">{center.phone}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-wrap gap-1">
                      {center.services.map((service, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Call Now
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Safety Features</h4>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Emergency SOS button shares your live location</li>
                <li>• 24/7 assistance center network across all provinces</li>
                <li>• Direct connection to nearest safety resources</li>
                <li>• Anonymous reporting for sensitive situations</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthSafety;
