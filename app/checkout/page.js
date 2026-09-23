'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Users, Shield, CreditCard, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const villaSlug = searchParams.get('villa');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = parseInt(searchParams.get('guests') || '2');

  const [villa, setVilla] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState('advance');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestIdType: 'aadhaar',
    guestIdNumber: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (villaSlug && checkIn && checkOut) {
      fetchData();
    }
  }, [villaSlug, checkIn, checkOut, guests]);

  const fetchData = async () => {
    try {
      // Fetch villa details
      const villaRes = await fetch(`/api/villas/${villaSlug}`);
      const villaData = await villaRes.json();
      if (villaData.villa) setVilla(villaData.villa);

      // Fetch pricing
      const pricingRes = await fetch(`/api/v1/pricing?villaId=${villaSlug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      const pricingData = await pricingRes.json();
      setPricing(pricingData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the terms and conditions');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      // Step 1: Create booking
      const bookingRes = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: villa?.slug || villa?.id || villaSlug,
          villaName: villa?.name || '',
          villaSlug: villa?.slug || villaSlug,
          villaLocation: villa?.location || '',
          checkIn,
          checkOut,
          guests,
          ...formData,
          pricing: pricing?.breakdown || {},
          paymentMode,
        }),
      });

      let bookingData;
      try {
        bookingData = await bookingRes.json();
      } catch (_) {
        bookingData = {};
      }
      if (!bookingRes.ok) {
        setError(bookingData.error || `Failed to create booking (HTTP ${bookingRes.status})`);
        setSubmitting(false);
        return;
      }

      const booking = bookingData?.booking;
      if (!booking?.bookingId) {
        setError('Failed to create booking. Please try again.');
        setSubmitting(false);
        return;
      }

      // Step 2: Create Razorpay order
      const orderRes = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          paymentMode,
        }),
      });

      let orderData;
      try {
        orderData = await orderRes.json();
      } catch (_) {
        orderData = {};
      }
      if (!orderRes.ok) {
        const detail = orderData.error || `HTTP ${orderRes.status}`;
        setError(`Failed to create payment order: ${detail}. Booking ID: ${booking.bookingId}`);
        setSubmitting(false);
        return;
      }
      if (!orderData?.orderId || !orderData?.keyId) {
        setError('Payment gateway not configured. Please contact support.');
        setSubmitting(false);
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Malle Stays™',
        description: `Booking: ${villa?.name} | ${checkIn} to ${checkOut}`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.guestName,
          email: formData.guestEmail,
          contact: formData.guestPhone,
        },
        notes: {
          bookingId: booking.bookingId,
          villaName: villa?.name,
        },
        theme: {
          color: '#ca8a04',
        },
        handler: async (response) => {
          // Step 4: Verify payment
          try {
            const verifyRes = await fetch('/api/v1/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                bookingId: booking.bookingId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push(`/booking/confirmation?bookingId=${booking.bookingId}`);
            } else {
              setError('Payment verification failed. Please contact support.');
              setSubmitting(false);
            }
          } catch (err) {
            setError('Payment verification error. Please contact support with your booking ID: ' + booking.bookingId);
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-600" />
      </div>
    );
  }

  if (!villa || !pricing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Invalid Booking Details</h2>
          <p className="text-slate-500 mb-4">Please select dates from the villa page</p>
          <Link href="/villas"><Button>Browse Villas</Button></Link>
        </div>
      </div>
    );
  }

  const breakdown = pricing.breakdown;
  const payAmount = paymentMode === 'advance' ? breakdown.advanceAmount : breakdown.totalAmount;

  return (
    <div className="min-h-screen bg-slate-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/villa/${villaSlug}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </Link>
          <h1 className="text-xl font-bold">Secure Checkout</h1>
          <div className="ml-auto flex items-center text-green-600 text-sm">
            <Shield className="h-4 w-4 mr-1" />
            Secure Payment
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Guest Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary Card */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Booking Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {villa.images?.[0] && (
                    <img src={villa.images[0]} alt={villa.name} className="w-24 h-24 rounded-lg object-cover" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{villa.name}</h3>
                    <p className="text-slate-500 flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{villa.location}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{checkIn} → {checkOut}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{guests} Guests</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{pricing.nightCount} Night{pricing.nightCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Details */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Guest Details</CardTitle></CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input required placeholder="Enter your full name" value={formData.guestName} onChange={(e) => setFormData({...formData, guestName: e.target.value})} />
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input required type="tel" placeholder="+91 XXXXX XXXXX" value={formData.guestPhone} onChange={(e) => setFormData({...formData, guestPhone: e.target.value})} />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="your@email.com" value={formData.guestEmail} onChange={(e) => setFormData({...formData, guestEmail: e.target.value})} />
                    </div>
                    <div>
                      <Label>ID Proof Type</Label>
                      <select className="w-full border rounded-md p-2 text-sm" value={formData.guestIdType} onChange={(e) => setFormData({...formData, guestIdType: e.target.value})}>
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="driving_license">Driving License</option>
                        <option value="passport">Passport</option>
                        <option value="voter_id">Voter ID</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>ID Number</Label>
                      <Input placeholder="Enter ID proof number" value={formData.guestIdNumber} onChange={(e) => setFormData({...formData, guestIdNumber: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label>Special Requests</Label>
                    <textarea className="w-full border rounded-md p-2 text-sm min-h-[80px]" placeholder="Any special requirements (early check-in, cake, decorations, etc.)" value={formData.specialRequests} onChange={(e) => setFormData({...formData, specialRequests: e.target.value})} />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Mode */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Option</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className="space-y-3">
                  <div className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMode === 'advance' ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200'}`} onClick={() => setPaymentMode('advance')}>
                    <RadioGroupItem value="advance" id="advance" />
                    <div className="flex-1">
                      <Label htmlFor="advance" className="font-semibold cursor-pointer">Pay 20% Advance</Label>
                      <p className="text-sm text-slate-500">Lock your booking now, pay remaining at check-in</p>
                    </div>
                    <span className="text-xl font-bold text-yellow-700">₹{breakdown.advanceAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMode === 'full' ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200'}`} onClick={() => setPaymentMode('full')}>
                    <RadioGroupItem value="full" id="full" />
                    <div className="flex-1">
                      <Label htmlFor="full" className="font-semibold cursor-pointer">Pay Full Amount</Label>
                      <p className="text-sm text-slate-500">Complete payment now for a hassle-free check-in</p>
                    </div>
                    <span className="text-xl font-bold text-yellow-700">₹{breakdown.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent className="pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
                  <span className="text-sm text-slate-600">
                    I agree to the <Link href="/terms" className="text-yellow-600 underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-yellow-600 underline">Cancellation Policy</Link>. I confirm that the details provided are correct and I understand that ID proof is mandatory at check-in.
                  </span>
                </label>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Price Breakdown */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader><CardTitle className="text-lg">Price Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {/* Night-by-night */}
                  {pricing.nights?.map((night, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-500">{night.date} ({night.day}){night.isWeekend ? ' 🌟' : ''}</span>
                      <span>₹{night.rate?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Base Total ({pricing.nightCount} nights)</span>
                    <span>₹{breakdown.baseTotal?.toLocaleString('en-IN')}</span>
                  </div>
                  {breakdown.extraGuests > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Extra Guests ({breakdown.extraGuests} × ₹{breakdown.extraGuestCharge})</span>
                      <span>₹{breakdown.extraGuestTotal?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {breakdown.cleaningFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Cleaning Fee</span>
                      <span>₹{breakdown.cleaningFee?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>GST ({breakdown.gstPercent}%)</span>
                    <span>₹{breakdown.gstAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{breakdown.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  {breakdown.securityDeposit > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Security Deposit (Refundable)</span>
                      <span>₹{breakdown.securityDeposit?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex justify-between font-bold text-xl text-yellow-800">
                      <span>Pay Now</span>
                      <span>₹{payAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    {paymentMode === 'advance' && (
                      <p className="text-xs text-yellow-600 mt-1">Balance ₹{(breakdown.totalAmount - breakdown.advanceAmount)?.toLocaleString('en-IN')} to be paid at check-in</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    form="checkout-form"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white h-14 text-lg"
                    disabled={submitting || !agreed}
                  >
                    {submitting ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" />Processing...</>
                    ) : (
                      <><CreditCard className="h-5 w-5 mr-2" />Pay ₹{payAmount?.toLocaleString('en-IN')}</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Shield className="h-3 w-3" />
                    Secured by Razorpay • 256-bit SSL Encryption
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-yellow-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
