'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, X, Ban, Phone, Mail, IndianRupee, Users, TrendingUp, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function BookingCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Block form
  const [blockVillaId, setBlockVillaId] = useState('');
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('maintenance');
  
  // Filters
  const [showConfirmed, setShowConfirmed] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showCancelled, setShowCancelled] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, occupancyRate: 0 });

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
      const bookingsRes = await fetch('/api/v1/bookings');
      const bookingsData = await bookingsRes.json();
      const allBookings = bookingsData.bookings || [];
      setBookings(allBookings);

      // Calculate stats
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const monthBookings = allBookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        return checkIn >= monthStart && checkIn <= monthEnd && b.status !== 'cancelled';
      });
      
      const totalRevenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const daysInMonth = monthEnd.getDate();
      const bookedNights = monthBookings.reduce((sum, b) => sum + (b.nights || 1), 0);
      const occupancyRate = Math.round((bookedNights / daysInMonth) * 100);
      
      setStats({
        totalBookings: monthBookings.length,
        totalRevenue,
        occupancyRate
      });

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
      
      // Apply status filters
      if (booking.status === 'confirmed' && !showConfirmed) return false;
      if (booking.status === 'pending' && !showPending) return false;
      if (booking.status === 'cancelled' && !showCancelled) return false;
      
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
      
      // Apply status filters
      if (booking.status === 'confirmed' && !showConfirmed) return null;
      if (booking.status === 'pending' && !showPending) return null;
      if (booking.status === 'cancelled' && !showCancelled) return null;
      
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
        setBlockVillaId('');
        setBlockStartDate('');
        setBlockEndDate('');
        fetchBookingsAndAvailability();
      } else {
        alert('Failed to block dates');
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
      alert('Error blocking dates');
    }
  };

  const handleUnblockDate = async (dateStr) => {
    if (!selectedVilla || selectedVilla === 'all') {
      alert('Please select a specific villa to unblock dates');
      return;
    }
    
    if (!confirm(`Unblock ${dateStr}?`)) return;

    try {
      const response = await fetch('/api/v1/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: selectedVilla,
          dates: [dateStr],
          action: 'unblock'
        })
      });

      if (response.ok) {
        alert('Date unblocked');
        fetchBookingsAndAvailability();
      } else {
        alert('Failed to unblock date');
      }
    } catch (error) {
      console.error('Error unblocking date:', error);
      alert('Error unblocking date');
    }
  };

  const handleCellClick = (dateStr, booking) => {
    if (booking) {
      setSelectedBooking(booking);
      setBookingDialogOpen(true);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-slate-50"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBooked = isDateBooked(dateStr);
      const isBlocked = isDateBlocked(dateStr);
      const booking = getBookingForDate(dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      days.push(
        <div 
          key={day} 
          onClick={() => handleCellClick(dateStr, booking)}
          className={`h-28 border border-slate-200 p-2 relative cursor-pointer transition-all ${
            isToday ? 'ring-2 ring-yellow-500' : ''
          } ${
            isBooked ? 'bg-blue-50 hover:bg-blue-100' : isBlocked ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${isToday ? 'text-yellow-600' : 'text-slate-700'}`}>
              {day}
            </span>
            {isBooked && <Badge className="text-xs bg-blue-600">Booked</Badge>}
            {isBlocked && !isBooked && (
              <Badge 
                className="text-xs bg-red-600 cursor-pointer hover:bg-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnblockDate(dateStr);
                }}
              >
                Blocked ✕
              </Badge>
            )}
          </div>
          {booking && (
            <div className="mt-1 text-xs">
              <p className="font-medium text-slate-900 truncate">{booking.guestName}</p>
              <p className="text-slate-600 truncate">{booking.villaName}</p>
              <div className="flex items-center gap-1 mt-1">
                <Badge className="text-xs" variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
                {booking.totalAmount && (
                  <span className="text-xs text-green-700 font-semibold">₹{booking.totalAmount.toLocaleString()}</span>
                )}
              </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-purple-700">{stats.occupancyRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
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
          <div className="text-lg font-semibold px-4 min-w-[200px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <Checkbox checked={showConfirmed} onCheckedChange={setShowConfirmed} id="confirmed" />
            <label htmlFor="confirmed" className="text-sm cursor-pointer">Confirmed</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={showPending} onCheckedChange={setShowPending} id="pending" />
            <label htmlFor="pending" className="text-sm cursor-pointer">Pending</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={showCancelled} onCheckedChange={setShowCancelled} id="cancelled" />
            <label htmlFor="cancelled" className="text-sm cursor-pointer">Cancelled</label>
          </div>
        </div>

        <Button onClick={() => setBlockDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockDates} className="bg-red-600 hover:bg-red-700">
              Block Dates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Booking ID</p>
                  <p className="font-semibold">{selectedBooking.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge variant={selectedBooking.status === 'confirmed' ? 'default' : 'secondary'}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Guest Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium">{selectedBooking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Guests</p>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedBooking.guests || 2}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <a href={`tel:${selectedBooking.guestPhone}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedBooking.guestPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <a href={`mailto:${selectedBooking.guestEmail}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedBooking.guestEmail || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Villa & Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Villa</p>
                    <p className="font-medium">{selectedBooking.villaName}</p>
                    <p className="text-sm text-slate-500">{selectedBooking.villaLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Duration</p>
                    <p className="font-medium">{selectedBooking.nights || 1} nights</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Check-in</p>
                    <p className="font-medium">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Check-out</p>
                    <p className="font-medium">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Payment Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="font-semibold text-lg text-green-700">₹{(selectedBooking.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Amount Paid</p>
                    <p className="font-semibold text-lg">₹{(selectedBooking.amountPaid || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Mode</p>
                    <Badge>{selectedBooking.paymentMode === 'full' ? 'Full Payment' : '20% Advance'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Status</p>
                    <Badge variant={selectedBooking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {selectedBooking.paymentStatus || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Special Requests</h4>
                  <p className="text-sm text-slate-600">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => window.open(`/villa/${selectedBooking?.villaSlug}`, '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              View Villa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
