'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Save, Calendar, Users, Sparkles } from 'lucide-react';

export default function PricingManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Pricing form state
  const [pricingData, setPricingData] = useState({
    weekdayRate: 5000,
    weekendRate: 6500,
    maxGuestsIncluded: 6,
    extraGuestCharge: 500,
    cleaningFee: 1000,
    securityDeposit: 2000,
    gstPercent: 12
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchVillas();
    }
  }, [status]);

  useEffect(() => {
    if (selectedVilla) {
      fetchPricing();
    }
  }, [selectedVilla]);

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/admin/villas');
      const data = await response.json();
      setVillas(data.villas || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
    }
  };

  const fetchPricing = async () => {
    setLoading(true);
    try {
      // Try to fetch existing pricing
      const response = await fetch(`/api/v1/pricing?villaId=${selectedVilla}&checkIn=2026-05-01&checkOut=2026-05-02&guests=2`);
      const data = await response.json();
      
      if (data.pricing) {
        setPricingData({
          weekdayRate: data.pricing.weekdayRate || 5000,
          weekendRate: data.pricing.weekendRate || 6500,
          maxGuestsIncluded: data.pricing.maxGuestsIncluded || 6,
          extraGuestCharge: data.breakdown?.extraGuestCharge || 500,
          cleaningFee: data.breakdown?.cleaningFee || 1000,
          securityDeposit: data.breakdown?.securityDeposit || 2000,
          gstPercent: data.breakdown?.gstPercent || 12
        });
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedVilla) {
      alert('Please select a villa');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/v1/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: selectedVilla,
          ...pricingData
        })
      });

      if (response.ok) {
        alert('Pricing updated successfully!');
      } else {
        alert('Failed to update pricing');
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Error saving pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setPricingData(prev => ({
      ...prev,
      [field]: field === 'gstPercent' ? parseFloat(value) : parseInt(value)
    }));
  };

  // Calculate example pricing
  const calculateExample = () => {
    const nights = 2; // Example: 2 nights (1 weekday + 1 weekend)
    const guests = 8; // Example: 8 guests
    
    const baseTotal = pricingData.weekdayRate + pricingData.weekendRate;
    const extraGuests = Math.max(0, guests - pricingData.maxGuestsIncluded);
    const extraGuestTotal = extraGuests * pricingData.extraGuestCharge * nights;
    const subtotal = baseTotal + extraGuestTotal;
    const gstAmount = Math.round(subtotal * pricingData.gstPercent / 100);
    const totalAmount = subtotal + gstAmount + pricingData.cleaningFee;
    const grandTotal = totalAmount + pricingData.securityDeposit;
    
    return { baseTotal, extraGuestTotal, subtotal, gstAmount, totalAmount, grandTotal };
  };

  const example = calculateExample();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pricing Manager</h1>
        <p className="text-slate-600">Configure pricing rates, fees, and charges for each villa</p>
      </div>

      {/* Villa Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Villa</CardTitle>
          <CardDescription>Choose a villa to configure its pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedVilla} onValueChange={setSelectedVilla}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a villa..." />
            </SelectTrigger>
            <SelectContent>
              {villas.map(villa => (
                <SelectItem key={villa.id} value={villa.id}>
                  {villa.name} - {villa.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedVilla && (
        <>
          {/* Nightly Rates */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <CardTitle>Nightly Rates</CardTitle>
              </div>
              <CardDescription>Set different rates for weekdays and weekends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Weekday Rate (Mon-Thu)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <Input 
                      type="number" 
                      value={pricingData.weekdayRate}
                      onChange={(e) => handleChange('weekdayRate', e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Per night rate for Monday to Thursday</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Weekend Rate (Fri-Sat)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <Input 
                      type="number" 
                      value={pricingData.weekendRate}
                      onChange={(e) => handleChange('weekendRate', e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Per night rate for Friday and Saturday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Capacity & Charges */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-yellow-600" />
                <CardTitle>Guest Capacity & Extra Charges</CardTitle>
              </div>
              <CardDescription>Configure maximum guests and extra guest charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Guests Included</label>
                  <Input 
                    type="number" 
                    value={pricingData.maxGuestsIncluded}
                    onChange={(e) => handleChange('maxGuestsIncluded', e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Base capacity included in nightly rate</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Extra Guest Charge</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <Input 
                      type="number" 
                      value={pricingData.extraGuestCharge}
                      onChange={(e) => handleChange('extraGuestCharge', e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Per guest per night beyond max capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fees & Deposits */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <CardTitle>Fees & Deposits</CardTitle>
              </div>
              <CardDescription>One-time charges and refundable deposits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Cleaning Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <Input 
                      type="number" 
                      value={pricingData.cleaningFee}
                      onChange={(e) => handleChange('cleaningFee', e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">One-time fee per booking</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Security Deposit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <Input 
                      type="number" 
                      value={pricingData.securityDeposit}
                      onChange={(e) => handleChange('securityDeposit', e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Refundable at checkout</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">GST %</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={pricingData.gstPercent}
                    onChange={(e) => handleChange('gstPercent', e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Tax percentage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Calculation */}
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <CardTitle>Example Calculation</CardTitle>
              </div>
              <CardDescription>2 nights (1 weekday + 1 weekend), 8 guests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Rate (2 nights)</span>
                  <span className="font-medium">₹{example.baseTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Extra Guests (2 guests × 2 nights)</span>
                  <span className="font-medium">₹{example.extraGuestTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">₹{example.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">GST ({pricingData.gstPercent}%)</span>
                  <span className="font-medium">₹{example.gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cleaning Fee</span>
                  <span className="font-medium">₹{pricingData.cleaningFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-base">
                  <span>Total Amount</span>
                  <span className="text-yellow-700">₹{example.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>+ Security Deposit (Refundable)</span>
                  <span>₹{pricingData.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Grand Total</span>
                  <span className="text-slate-900">₹{example.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Pricing
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {!selectedVilla && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Please select a villa to configure pricing</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
