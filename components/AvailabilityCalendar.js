'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AvailabilityCalendar({ villaId, villaName }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (villaId) {
      fetchAvailability();
    }
  }, [villaId, currentMonth]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Fetch bookings for this villa
      const bookingsRes = await fetch('/api/v1/bookings');
      const bookingsData = await bookingsRes.json();
      
      const villaBookings = (bookingsData.bookings || []).filter(
        b => b.villaId === villaId && b.status !== 'cancelled'
      );
      setBookings(villaBookings);

      // Fetch blocked dates
      const availRes = await fetch(`/api/v1/availability?villaId=${villaId}`);
      const availData = await availRes.json();
      setBlockedDates(availData.blockedDates || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateBooked = (dateStr) => {
    return bookings.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const date = new Date(dateStr);
      return date >= checkIn && date < checkOut;
    });
  };

  const isDateBlocked = (dateStr) => {
    return blockedDates.includes(dateStr);
  };

  const isPastDate = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < today;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 md:h-16"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBooked = isDateBooked(dateStr);
      const isBlocked = isDateBlocked(dateStr);
      const isPast = isPastDate(dateStr);
      const isToday = dateStr === today;
      
      let bgColor = 'bg-white hover:bg-slate-50';
      let textColor = 'text-slate-900';
      let status = 'Available';
      
      if (isPast) {
        bgColor = 'bg-slate-100';
        textColor = 'text-slate-400';
        status = 'Past';
      } else if (isBooked) {
        bgColor = 'bg-red-100 border-red-300';
        textColor = 'text-red-900';
        status = 'Booked';
      } else if (isBlocked) {
        bgColor = 'bg-orange-100 border-orange-300';
        textColor = 'text-orange-900';
        status = 'Blocked';
      } else {
        bgColor = 'bg-green-50 hover:bg-green-100 border-green-200';
        textColor = 'text-green-900';
      }
      
      days.push(
        <div 
          key={day}
          title={status}
          className={`h-12 md:h-16 border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${bgColor} ${
            isToday ? 'ring-2 ring-yellow-500' : ''
          }`}
        >
          <span className={`text-sm md:text-base font-semibold ${textColor}`}>
            {day}
          </span>
          {(isBooked || isBlocked) && (
            <span className="text-[8px] md:text-xs font-medium mt-0.5">
              {isBooked ? '🔒' : '⛔'}
            </span>
          )}
        </div>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Loading Availability...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-xl md:text-2xl mb-2">Availability Calendar</CardTitle>
            <p className="text-sm text-slate-600">Check available dates for {villaName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-base md:text-lg font-semibold px-3 min-w-[140px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span className="text-xs md:text-sm text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-xs md:text-sm text-slate-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span className="text-xs md:text-sm text-slate-600">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded"></div>
            <span className="text-xs md:text-sm text-slate-600">Past</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs md:text-sm font-semibold text-slate-700">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 p-2 bg-slate-50">
            {renderCalendar()}
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-blue-900">
              <p className="font-semibold mb-1">How to book:</p>
              <p>Select your dates in the booking form below. Green dates are available for reservation. 
              For bookings or inquiries, contact us via WhatsApp or use the Book Now button.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {getDaysInMonth(currentMonth).daysInMonth - bookings.length - blockedDates.length}
            </p>
            <p className="text-xs md:text-sm text-slate-600">Available Days</p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xl md:text-2xl font-bold text-red-600">{bookings.length}</p>
            <p className="text-xs md:text-sm text-slate-600">Booked Days</p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center col-span-2 md:col-span-1">
            <p className="text-xl md:text-2xl font-bold text-orange-600">{blockedDates.length}</p>
            <p className="text-xs md:text-sm text-slate-600">Blocked Days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
