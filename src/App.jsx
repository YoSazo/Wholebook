import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Check, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { trackBooking, trackPageView } from './trackingService';


const BookingPage = () => {
  const [step, setStep] = useState('video');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeSlotsRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    trackPageView();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showTimeSlots && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [showTimeSlots]);

  useEffect(() => {
    if (selectedTime && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedTime]);

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  // Phone formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

// Fix the date comparison
const handleDateClick = (date) => {
  if (!date) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return;
  
  setSelectedDate(date);
  setSelectedTime(null);
  setShowTimeSlots(true);
  
  // Scroll to time slots after animation
  setTimeout(() => {
    if (timeSlotsRef.current) {
      timeSlotsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 200);
};



  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep('booking');
      setIsAnimating(false);
    }, 300);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    setIsAnimating(true);
    
    await trackBooking({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      selectedDate: formatDate(selectedDate),
      selectedTime: selectedTime,
    });
    
    setTimeout(() => {
      setStep('confirmation');
      setIsAnimating(false);
    }, 300);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Video Step (Mobile Only)
  if (isMobile && step === 'video') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-md transform transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="aspect-[9/16] bg-black rounded-2xl mb-6 border border-gray-700/30 overflow-hidden relative">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
                id="mobileVideo"
              >
                <source src="/zach.mov" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Unmute button */}
              <button
                onClick={(e) => {
                  const video = document.getElementById('mobileVideo');
                  video.muted = !video.muted;
                  e.currentTarget.textContent = video.muted ? '🔇' : '🔊';
                }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-10"
              >
                🔇
              </button>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3 text-center">
              Hi, I'm Zach
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Schedule a quick call with us so we can review your property and give you a fair, all-cash offer—no repairs, no fees, no middlemen.
            </p>
            
            <button
              onClick={handleNextStep}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-2"
            >
              Book Your Call
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (step === 'confirmation') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 md:p-8 lg:px-16 xl:px-24">
      <div className={`w-full transform transition-all duration-700 ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 shadow-2xl text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center transform animate-bounce">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              ✨ You're All Set! ✨
            </h2>
            
            <p className="text-gray-400 text-lg mb-8">
              Your meeting with Zach has been confirmed.
            </p>
            
            <div className="bg-black/30 rounded-2xl p-6 border border-gray-700/30 mb-8 text-left">
              <div className="flex items-start gap-4 mb-4">
                <Calendar className="w-6 h-6 text-purple-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Date & Time</p>
                  <p className="text-white font-semibold text-lg">{formatDate(selectedDate)}</p>
                  <p className="text-purple-400 font-semibold">{selectedTime}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700/50 pt-4">
                <p className="text-gray-400 text-sm mb-2">Meeting Details</p>
                <p className="text-white font-medium">{formData.firstName} {formData.lastName}</p>
                <p className="text-gray-400 text-sm">{formData.email}</p>
                <p className="text-gray-400 text-sm">+1 {formData.phone}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/20">
              <p className="text-gray-300 text-sm">
                📧 A confirmation email has been sent to <span className="text-purple-400 font-semibold">{formData.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Booking Step
  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-x-hidden">
    <div className="w-full h-full mx-auto p-4 md:p-8 lg:px-16 xl:px-24">
      <div className={`grid md:grid-cols-2 gap-8 items-start min-h-[calc(100vh-4rem)] transition-all duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Left Side - Video (Desktop Only) */}
        {!isMobile && (
          <div className="sticky top-8 transform transition-all duration-700 hover:scale-105">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="aspect-[9/16] max-h-[600px] bg-black rounded-2xl mb-6 border border-gray-700/30 overflow-hidden relative">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                    id="desktopVideo"
                  >
                    <source src="/zach.mov" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Unmute button */}
                  <button
                    onClick={(e) => {
                      const video = document.getElementById('desktopVideo');
                      video.muted = !video.muted;
                      e.currentTarget.textContent = video.muted ? '🔇' : '🔊';
                    }}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-10"
                  >
                    🔇
                  </button>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">
                  Hi, I'm Zach
                </h2>
                <p className="text-gray-400">
                  Schedule a quick call with us so we can review your property and give you a fair, all-cash offer—no repairs, no fees, no middlemen.
                </p>
              </div>
            </div>
          )}
          
          {/* Right Side - Booking Widget */}
          <div className="transform transition-all duration-700 w-full">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-700/50 shadow-2xl">
              
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Book Your Strategy Call
                </h3>
                <p className="text-gray-400">30 minutes • Free consultation</p>
              </div>

              {/* Calendar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-600/50"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => changeMonth(1)}
                      className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-600/50"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>


                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(currentMonth).map((date, idx) => {
                    const isSelected = selectedDate && date && 
                      date.toDateString() === selectedDate.toDateString();
                    
                    // Fixed isPast check
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = date && date < today;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(date)}
                        disabled={!date || isPast}
                        className={`
                          aspect-square rounded-xl text-sm font-medium transition-all duration-300
                          ${!date ? 'invisible' : ''}
                          ${isPast ? 'text-gray-700 cursor-not-allowed bg-gray-800/20' : ''}
                          ${isSelected 
                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white scale-110 shadow-lg shadow-purple-500/50' 
                            : date && !isPast 
                              ? 'bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:scale-105 hover:shadow-md' 
                              : ''
                          }
                        `}
                      >
                        {date ? date.getDate() : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div 
                ref={timeSlotsRef}
                className={`transition-all duration-500 overflow-hidden ${showTimeSlots ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
              >
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Select Time
                  </h4>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeClick(time)}
                        className={`
                          py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300
                          ${selectedTime === time
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white scale-105 shadow-lg shadow-purple-500/30'
                            : 'bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:scale-105'
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              {selectedTime && (
                <div ref={formRef} className="animate-fadeIn">
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="First Name"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full bg-gray-700/30 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Last Name"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full bg-gray-700/30 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Your Email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-700/30 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        +1
                      </span>
                      <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        maxLength={14}
                        className="w-full bg-gray-700/30 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                    >
                      Confirm Booking
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #3b82f6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a855f7, #60a5fa);
        }
      `}</style>
    </div>
  );
};

export default BookingPage;