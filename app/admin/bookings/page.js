'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, X, Check, Clock, Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function BookingCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockVillaId, setBlockVillaId] = useState('');
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('maintenance');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchVillas();
      fetchBookingsAndAvailability();
    }
  }, [status, currentMonth, selectedVilla]);

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/admin/villas');
      const data = await response.json();
      setVillas(data.villas || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
    }
  };

  const fetchBookingsAndAvailability = async () => {
    setLoading(true);
    try {
      // Fetch all bookings
      const bookingsRes = await fetch('/api/v1/bookings');
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings || []);

      // Fetch blocked dates for selected villa
      if (selectedVilla !== 'all') {
        const availRes = await fetch(`/api/v1/availability?villaId=${selectedVilla}`);
        const availData = await availRes.json();
        setBlockedDates(availData.blockedDates || []);
      } else {
        setBlockedDates([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
      if (selectedVilla !== 'all' && booking.villaId !== selectedVilla) return false;
      if (booking.status === 'cancelled') return false;
      
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const date = new Date(dateStr);
      return date >= checkIn && date < checkOut;
    });
  };

  const isDateBlocked = (dateStr) => {
    return blockedDates.includes(dateStr);
  };

  const getBookingForDate = (dateStr) => {
    return bookings.find(booking => {
      if (selectedVilla !== 'all' && booking.villaId !== selectedVilla) return null;
      if (booking.status === 'cancelled') return null;
      
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const date = new Date(dateStr);
      return date >= checkIn && date < checkOut;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleBlockDates = async () => {
    if (!blockVillaId || !blockStartDate || !blockEndDate) {
      alert('Please fill all fields');
      return;
    }

    const dates = [];
    let current = new Date(blockStartDate);
    const end = new Date(blockEndDate);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    try {
      const response = await fetch('/api/v1/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: blockVillaId,
          dates,
          action: 'block',
          reason: blockReason
        })
      });

      if (response.ok) {
        alert(`Blocked ${dates.length} dates`);
        setBlockDialogOpen(false);
        fetchBookingsAndAvailability();
      } else {
        alert('Failed to block dates');
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
      alert('Error blocking dates');
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBooked = isDateBooked(dateStr);
      const isBlocked = isDateBlocked(dateStr);
      const booking = getBookingForDate(dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      days.push(
        <div 
          key={day} 
          className={`h-24 border border-slate-200 p-2 relative ${
            isToday ? 'ring-2 ring-yellow-500' : ''
          } ${
            isBooked ? 'bg-blue-50' : isBlocked ? 'bg-red-50' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${isToday ? 'text-yellow-600' : 'text-slate-700'}`}>
              {day}
            </span>
            {isBooked && <Badge className="text-xs bg-blue-600">Booked</Badge>}
            {isBlocked && !isBooked && <Badge className="text-xs bg-red-600">Blocked</Badge>}
          </div>
          {booking && (
            <div className="mt-1 text-xs">
              <p className="font-medium text-slate-900 truncate">{booking.guestName}</p>
              <p className="text-slate-600 truncate">{booking.villaName}</p>
              <Badge className="mt-1" variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                {booking.status}
              </Badge>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Calendar</h1>
        <p className="text-slate-600">View and manage all villa bookings and availability</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Select value={selectedVilla} onValueChange={setSelectedVilla}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Villa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Villas</SelectItem>
            {villas.map(villa => (
              <SelectItem key={villa.id} value={villa.id}>{villa.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold px-4">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={() => setBlockDialogOpen(true)} className="ml-auto bg-red-600 hover:bg-red-700">
          <Ban className="h-4 w-4 mr-2" />
          Block Dates
        </Button>
      </div>

      {/* Legend */}
      <div className="mb-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200"></div>
          <span>Manually Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-yellow-500"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-slate-700 bg-slate-50">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      {/* Block Dates Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Dates</DialogTitle>
            <DialogDescription>
              Manually block dates for maintenance or other reasons
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Villa</label>
              <Select value={blockVillaId} onValueChange={setBlockVillaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Villa" />
                </SelectTrigger>
                <SelectContent>
                  {villas.map(villa => (
                    <SelectItem key={villa.id} value={villa.id}>{villa.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input 
                type="date" 
                value={blockStartDate}
                onChange={(e) => setBlockStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input 
                type="date" 
                value={blockEndDate}
                onChange={(e) => setBlockEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Select value={blockReason} onValueChange={setBlockReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="owner_use">Owner Use</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockDates} className="bg-red-600 hover:bg-red-700">
              Block Dates
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
