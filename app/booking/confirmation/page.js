'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, MapPin, Calendar, Users, CreditCard, Download, Phone, MessageCircle, Loader2, Home } from 'lucide-react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/v1/bookings?bookingId=${bookingId}`);
      const data = await res.json();
      if (data.booking) setBooking(data.booking);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    // Simple text-based invoice download
    if (!booking) return;
    const p = booking.pricing || {};
    const invoice = `
═══════════════════════════════════════
        MALLE STAYS™ - BOOKING INVOICE
═══════════════════════════════════════

Booking ID: ${booking.bookingId}
Date: ${new Date(booking.confirmedAt || booking.createdAt).toLocaleDateString('en-IN')}

PROPERTY DETAILS
─────────────────
Villa: ${booking.villaName}
Location: ${booking.villaLocation}
Check-in: ${booking.checkIn}
Check-out: ${booking.checkOut}
Nights: ${booking.nights}
Guests: ${booking.guests}

GUEST DETAILS
─────────────
Name: ${booking.guestName}
Phone: ${booking.guestPhone}
Email: ${booking.guestEmail || 'N/A'}

PAYMENT DETAILS
───────────────
Base Amount: ₹${(p.baseTotal || 0).toLocaleString('en-IN')}
${p.extraGuestTotal > 0 ? `Extra Guests: ₹${p.extraGuestTotal.toLocaleString('en-IN')}\n` : ''}Cleaning Fee: ₹${(p.cleaningFee || 0).toLocaleString('en-IN')}
GST (${p.gstPercent || 12}%): ₹${(p.gstAmount || 0).toLocaleString('en-IN')}
─────────────
Total: ₹${(p.totalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}
Security Deposit: ₹${(p.securityDeposit || 0).toLocaleString('en-IN')} (Refundable)

Payment Mode: ${booking.paymentMode === 'advance' ? '20% Advance' : 'Full Payment'}
Amount Paid: ₹${(booking.amountPaid || 0).toLocaleString('en-IN')}
${booking.paymentMode === 'advance' ? `Balance Due: ₹${((p.totalAmount || booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString('en-IN')} (Pay at check-in)\n` : ''}
Payment Status: ${booking.paymentStatus?.toUpperCase()}
Razorpay Payment ID: ${booking.razorpayPaymentId || 'N/A'}

═══════════════════════════════════════
       Thank you for choosing
          MALLE STAYS™
     📞 +91 8446620191
═══════════════════════════════════════
    `;

    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MalleStays_Invoice_${booking.bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const p = booking.pricing || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-slate-600">Your booking has been successfully confirmed. Details below.</p>
        </div>

        {/* Booking ID Card */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">BOOKING ID</p>
              <p className="text-3xl font-bold text-green-800 tracking-wider">{booking.bookingId}</p>
              <p className="text-xs text-green-500 mt-1">Save this for your reference</p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" />Booking Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Property</p>
                <p className="font-semibold">{booking.villaName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-semibold flex items-center gap-1"><MapPin className="h-3 w-3" />{booking.villaLocation}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Check-in</p>
                <p className="font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" />{booking.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Check-out</p>
                <p className="font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" />{booking.checkOut}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Guests</p>
                <p className="font-semibold flex items-center gap-1"><Users className="h-3 w-3" />{booking.guests}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nights</p>
                <p className="font-semibold">{booking.nights}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-slate-500">Guest Name</p>
              <p className="font-semibold">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-semibold">{booking.guestPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-semibold">₹{(p.totalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-semibold text-green-600">₹{(booking.amountPaid || 0).toLocaleString('en-IN')}</span>
            </div>
            {booking.paymentMode === 'advance' && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Balance Due (at check-in)</span>
                <span className="font-semibold text-amber-600">₹{((p.totalAmount || booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString('en-IN')}</span>
              </div>
            )}
            {p.securityDeposit > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Security Deposit (Refundable)</span>
                <span>₹{p.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Payment Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {booking.paymentStatus === 'partial' ? 'ADVANCE PAID' : booking.paymentStatus?.toUpperCase()}
              </span>
            </div>
            {booking.razorpayPaymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment ID</span>
                <span className="font-mono text-xs">{booking.razorpayPaymentId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Button onClick={downloadInvoice} variant="outline" className="h-12">
            <Download className="h-4 w-4 mr-2" />Download Invoice
          </Button>
          <a href={`https://wa.me/918446620191?text=Hi! I just booked ${booking.villaName} (${booking.bookingId}). Dates: ${booking.checkIn} to ${booking.checkOut}.`} target="_blank">
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700">
              <MessageCircle className="h-4 w-4 mr-2" />WhatsApp Confirmation
            </Button>
          </a>
        </div>

        {/* Important Info */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h3 className="font-bold text-amber-800 mb-3">📋 Important Information</h3>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>✅ Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
              <li>✅ Carry a valid ID proof (Aadhaar/Driving License)</li>
              <li>✅ Security deposit is refundable at checkout</li>
              {booking.paymentMode === 'advance' && (
                <li>✅ Balance amount of ₹{((p.totalAmount || booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString('en-IN')} to be paid at check-in</li>
              )}
              <li>📞 For any queries, call: <a href="tel:+918446620191" className="underline font-semibold">+91 8446620191</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/"><Button variant="outline" size="lg"><Home className="h-4 w-4 mr-2" />Back to Home</Button></Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-yellow-600" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
