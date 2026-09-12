'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Save, Calendar, Users, Sparkles, Copy, History, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    gstPercent: 12,
    minimumStay: 1,
    weekendMinimumStay: 2
  });

  // Seasonal pricing
  const [seasonalPricing, setSeasonalPricing] = useState([]);
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    startDate: '',
    endDate: '',
    weekdayRate: 0,
    weekendRate: 0
  });

  // Copy pricing dialog
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [targetVillas, setTargetVillas] = useState([]);

  // Bulk update
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkVillas, setBulkVillas] = useState([]);
  const [bulkPercentage, setBulkPercentage] = useState(0);

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
          gstPercent: data.breakdown?.gstPercent || 12,
          minimumStay: 1,
          weekendMinimumStay: 2
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

  const handleCopyPricing = async () => {
    if (targetVillas.length === 0) {
      alert('Please select at least one villa');
      return;
    }

    setSaving(true);
    try {
      for (const villaId of targetVillas) {
        await fetch('/api/v1/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            villaId,
            ...pricingData
          })
        });
      }
      alert(`Pricing copied to ${targetVillas.length} villas!`);
      setCopyDialogOpen(false);
      setTargetVillas([]);
    } catch (error) {
      console.error('Error copying pricing:', error);
      alert('Error copying pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkVillas.length === 0) {
      alert('Please select villas');
      return;
    }

    if (!bulkPercentage) {
      alert('Please enter percentage');
      return;
    }

    setSaving(true);
    try {
      for (const villaId of bulkVillas) {
        // Fetch current pricing
        const res = await fetch(`/api/v1/pricing?villaId=${villaId}&checkIn=2026-05-01&checkOut=2026-05-02&guests=2`);
        const data = await res.json();
        
        if (data.pricing) {
          const multiplier = 1 + (bulkPercentage / 100);
          await fetch('/api/v1/pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              villaId,
              weekdayRate: Math.round(data.pricing.weekdayRate * multiplier),
              weekendRate: Math.round(data.pricing.weekendRate * multiplier),
              maxGuestsIncluded: data.pricing.maxGuestsIncluded,
              extraGuestCharge: Math.round((data.breakdown?.extraGuestCharge || 500) * multiplier),
              cleaningFee: Math.round((data.breakdown?.cleaningFee || 1000) * multiplier),
              securityDeposit: data.breakdown?.securityDeposit || 2000,
              gstPercent: data.breakdown?.gstPercent || 12
            })
          });
        }
      }
      alert(`Bulk update applied to ${bulkVillas.length} villas!`);
      setBulkDialogOpen(false);
      setBulkVillas([]);
      setBulkPercentage(0);
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('Error applying bulk update');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSeason = () => {
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate) {
      alert('Please fill all fields');
      return;
    }
    setSeasonalPricing([...seasonalPricing, { ...newSeason, id: Date.now() }]);
    setNewSeason({ name: '', startDate: '', endDate: '', weekdayRate: 0, weekendRate: 0 });
    setSeasonDialogOpen(false);
  };

  const handleRemoveSeason = (id) => {
    setSeasonalPricing(seasonalPricing.filter(s => s.id !== id));
  };

  // Calculate example pricing
  const calculateExample = () => {
    const nights = 2;
    const guests = 8;
    
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

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <Button variant="outline" onClick={() => setCopyDialogOpen(true)} disabled={!selectedVilla}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to Other Villas
        </Button>
        <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
          <DollarSign className="h-4 w-4 mr-2" />
          Bulk Price Update
        </Button>
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
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Pricing</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Pricing</TabsTrigger>
            <TabsTrigger value="rules">Booking Rules</TabsTrigger>
          </TabsList>

          {/* Basic Pricing Tab */}
          <TabsContent value="basic" className="space-y-6">
            {/* Nightly Rates */}
            <Card>
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

            {/* Guest Capacity */}
            <Card>
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

            {/* Fees */}
            <Card>
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
            <Card className="border-yellow-200 bg-yellow-50">
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
          </TabsContent>

          {/* Seasonal Pricing Tab */}
          <TabsContent value="seasonal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Seasonal & Peak Pricing</CardTitle>
                    <CardDescription>Set special rates for holidays and peak seasons</CardDescription>
                  </div>
                  <Button onClick={() => setSeasonDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Season
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {seasonalPricing.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No seasonal pricing configured yet</p>
                    <p className="text-sm">Add special rates for holidays and peak seasons</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seasonalPricing.map((season) => (
                      <div key={season.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{season.name}</h4>
                          <p className="text-sm text-slate-600">
                            {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>Weekday: ₹{season.weekdayRate.toLocaleString()}</span>
                            <span>Weekend: ₹{season.weekendRate.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveSeason(season.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minimum Stay Requirements</CardTitle>
                <CardDescription>Set minimum night requirements for bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Weekday Minimum Stay</label>
                    <Input 
                      type="number" 
                      min="1"
                      value={pricingData.minimumStay}
                      onChange={(e) => handleChange('minimumStay', e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum nights for weekday bookings</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Weekend Minimum Stay</label>
                    <Input 
                      type="number" 
                      min="1"
                      value={pricingData.weekendMinimumStay}
                      onChange={(e) => handleChange('weekendMinimumStay', e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum nights for weekend bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedVilla && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Please select a villa to configure pricing</p>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {selectedVilla && (
        <div className="flex justify-end gap-3 mt-6">
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
      )}

      {/* Copy Pricing Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Pricing to Other Villas</DialogTitle>
            <DialogDescription>
              Select villas to copy the current pricing configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {villas.filter(v => v.id !== selectedVilla).map(villa => (
              <div key={villa.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={targetVillas.includes(villa.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTargetVillas([...targetVillas, villa.id]);
                    } else {
                      setTargetVillas(targetVillas.filter(id => id !== villa.id));
                    }
                  }}
                  className="rounded"
                />
                <label className="flex-1 cursor-pointer">
                  {villa.name} - {villa.location}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyPricing} disabled={saving}>
              {saving ? 'Copying...' : `Copy to ${targetVillas.length} Villas`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Price Update</DialogTitle>
            <DialogDescription>
              Increase or decrease prices for multiple villas by a percentage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Villas</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                {villas.map(villa => (
                  <div key={villa.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bulkVillas.includes(villa.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkVillas([...bulkVillas, villa.id]);
                        } else {
                          setBulkVillas(bulkVillas.filter(id => id !== villa.id));
                        }
                      }}
                      className="rounded"
                    />
                    <label className="flex-1 cursor-pointer text-sm">
                      {villa.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Percentage Change</label>
              <Input 
                type="number"
                step="1"
                placeholder="e.g., 10 for +10%, -15 for -15%"
                value={bulkPercentage}
                onChange={(e) => setBulkPercentage(parseFloat(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">
                Positive for increase, negative for decrease
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate} disabled={saving}>
              {saving ? 'Updating...' : `Update ${bulkVillas.length} Villas`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Season Dialog */}
      <Dialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Seasonal Pricing</DialogTitle>
            <DialogDescription>
              Set special rates for a specific date range
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Season Name</label>
              <Input 
                placeholder="e.g., Christmas, Diwali, Summer Peak"
                value={newSeason.name}
                onChange={(e) => setNewSeason({...newSeason, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input 
                  type="date"
                  value={newSeason.startDate}
                  onChange={(e) => setNewSeason({...newSeason, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input 
                  type="date"
                  value={newSeason.endDate}
                  onChange={(e) => setNewSeason({...newSeason, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Weekday Rate</label>
                <Input 
                  type="number"
                  placeholder="₹"
                  value={newSeason.weekdayRate}
                  onChange={(e) => setNewSeason({...newSeason, weekdayRate: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Weekend Rate</label>
                <Input 
                  type="number"
                  placeholder="₹"
                  value={newSeason.weekendRate}
                  onChange={(e) => setNewSeason({...newSeason, weekendRate: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeasonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSeason}>
              Add Season
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
