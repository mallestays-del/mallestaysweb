'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Lock, Unlock, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminAvailability() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockMode, setBlockMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchVillas();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedVilla) {
      fetchAvailability();
    }
  }, [selectedVilla, currentMonth]);

  const fetchVillas = async () => {
    try {
      const res = await fetch('/api/villas');
      const data = await res.json();
      setVillas(data.villas || []);
      if (data.villas && data.villas.length > 0) {
        setSelectedVilla(data.villas[0].id);
      }
    } catch (error) {
      console.error('Error fetching villas:', error);
      toast.error('Failed to load villas');
    }
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const bookingsRes = await fetch('/api/v1/bookings');
      const bookingsData = await bookingsRes.json();
      const villaBookings = (bookingsData.bookings || []).filter(
        b => b.villaId === selectedVilla && b.status !== 'cancelled'
      );
      setBookings(villaBookings);

      // Fetch blocked dates
      const availRes = await fetch(`/api/v1/availability?villaId=${selectedVilla}`);
      const availData = await availRes.json();
      setBlockedDates(availData.blockedDates || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDate = async (dateStr) => {
    try {
      const res = await fetch('/api/v1/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: selectedVilla,
          date: dateStr,
          action: 'block'
        })
      });

      if (!res.ok) throw new Error('Failed to block date');
      
      toast.success('Date blocked successfully');
      fetchAvailability();
    } catch (error) {
      console.error('Error blocking date:', error);
      toast.error('Failed to block date');
    }
  };

  const handleUnblockDate = async (dateStr) => {
    try {
      const res = await fetch('/api/v1/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: selectedVilla,
          date: dateStr,
          action: 'unblock'
        })
      });

      if (!res.ok) throw new Error('Failed to unblock date');
      
      toast.success('Date unblocked successfully');
      fetchAvailability();
    } catch (error) {
      console.error('Error unblocking date:', error);
      toast.error('Failed to unblock date');
    }
  };

  const handleBulkBlock = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select dates to block');
      return;
    }

    try {
      for (const dateStr of selectedDates) {
        await fetch('/api/v1/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            villaId: selectedVilla,
            date: dateStr,
            action: 'block'
          })
        });
      }
      
      toast.success(`${selectedDates.length} dates blocked successfully`);
      setSelectedDates([]);
      setBlockMode(false);
      fetchAvailability();
    } catch (error) {
      console.error('Error bulk blocking:', error);
      toast.error('Failed to block dates');
    }
  };

  const handleDateClick = (dateStr, isBooked, isBlocked, isPast) => {
    if (isPast || isBooked) return;

    if (blockMode) {
      // Bulk selection mode
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter(d => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else {
      // Single click toggle
      if (isBlocked) {
        handleUnblockDate(dateStr);
      } else {
        handleBlockDate(dateStr);
      }
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
    
    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBooked = isDateBooked(dateStr);
      const isBlocked = isDateBlocked(dateStr);
      const isPast = isPastDate(dateStr);
      const isSelected = selectedDates.includes(dateStr);
      
      let bgColor = 'bg-white hover:bg-slate-50';
      let textColor = 'text-slate-900';
      let borderColor = 'border-slate-200';
      let cursor = 'cursor-pointer';
      let icon = null;
      
      if (isPast) {
        bgColor = 'bg-slate-100';
        textColor = 'text-slate-400';
        cursor = 'cursor-not-allowed';
      } else if (isBooked) {
        bgColor = 'bg-red-100';
        textColor = 'text-red-900';
        borderColor = 'border-red-300';
        cursor = 'cursor-not-allowed';
        icon = <Lock className="h-3 w-3" />;
      } else if (isBlocked) {
        bgColor = 'bg-orange-100 hover:bg-orange-200';
        textColor = 'text-orange-900';
        borderColor = 'border-orange-300';
        icon = <Lock className="h-3 w-3" />;
      } else {
        bgColor = 'bg-green-50 hover:bg-green-100';
        textColor = 'text-green-900';
        borderColor = 'border-green-200';
        icon = <Unlock className="h-3 w-3 opacity-50" />;
      }

      if (isSelected) {
        bgColor = 'bg-blue-200';
        borderColor = 'border-blue-400 border-2';
      }
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(dateStr, isBooked, isBlocked, isPast)}
          disabled={isPast || isBooked}
          className={`h-16 border rounded-lg flex flex-col items-center justify-center transition-all ${bgColor} ${borderColor} ${cursor} ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <span className={`text-sm font-semibold ${textColor}`}>{day}</span>
          {icon && <span className="mt-1">{icon}</span>}
        </button>
      );
    }
    
    return days;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedVillaData = villas.find(v => v.id === selectedVilla);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Availability Management</h1>
          <p className="text-slate-600 mt-2">Block or unblock dates for your villas</p>
        </div>

        {/* Villa Selector & Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Villa
                </label>
                <Select value={selectedVilla} onValueChange={setSelectedVilla}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a villa" />
                  </SelectTrigger>
                  <SelectContent>
                    {villas.map(villa => (
                      <SelectItem key={villa.id} value={villa.id}>
                        {villa.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                {!blockMode ? (
                  <Button
                    onClick={() => setBlockMode(true)}
                    className="bg-yellow-700 hover:bg-yellow-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Bulk Block Mode
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleBulkBlock}
                      disabled={selectedDates.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Block Selected ({selectedDates.length})
                    </Button>
                    <Button
                      onClick={() => {
                        setBlockMode(false);
                        setSelectedDates([]);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {blockMode && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Bulk Block Mode:</strong> Click on available dates to select them, then click "Block Selected" to block all at once.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl">
                  {selectedVillaData?.name || 'Select a Villa'}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Click dates to block/unblock</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-semibold px-3 min-w-[180px] text-center">
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
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                <span className="text-sm text-slate-600">Available (Click to Block)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-sm text-slate-600">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                <span className="text-sm text-slate-600">Blocked (Click to Unblock)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded"></div>
                <span className="text-sm text-slate-600">Past</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-lg overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-slate-50 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-semibold text-slate-700">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 p-2 bg-slate-50">
                {renderCalendar()}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {getDaysInMonth(currentMonth).daysInMonth - bookings.length - blockedDates.length}
                </p>
                <p className="text-sm text-slate-600">Available</p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{bookings.length}</p>
                <p className="text-sm text-slate-600">Booked</p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{blockedDates.length}</p>
                <p className="text-sm text-slate-600">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
