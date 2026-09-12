'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tag, Calendar, Percent, Gift, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function OffersManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [offers, setOffers] = useState([]);
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    couponCode: '',
    validFrom: '',
    validTo: '',
    minBookingAmount: 0,
    maxDiscount: 0,
    applicableVillas: [],
    showOnHomepage: true,
    isActive: true,
    bannerColor: 'blue'
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchOffers();
      fetchVillas();
    }
  }, [status]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/offers');
      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/admin/villas');
      const data = await response.json();
      setVillas(data.villas || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.validFrom || !formData.validTo) {
      alert('Please fill required fields');
      return;
    }

    try {
      const url = editingOffer 
        ? `/api/admin/offers/${editingOffer.id}`
        : '/api/admin/offers';
      
      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingOffer?.id || `OFFER-${Date.now()}`
        })
      });

      if (response.ok) {
        alert(editingOffer ? 'Offer updated!' : 'Offer created!');
        setDialogOpen(false);
        resetForm();
        fetchOffers();
      } else {
        alert('Failed to save offer');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error saving offer');
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue || 0,
      couponCode: offer.couponCode || '',
      validFrom: offer.validFrom || '',
      validTo: offer.validTo || '',
      minBookingAmount: offer.minBookingAmount || 0,
      maxDiscount: offer.maxDiscount || 0,
      applicableVillas: offer.applicableVillas || [],
      showOnHomepage: offer.showOnHomepage !== false,
      isActive: offer.isActive !== false,
      bannerColor: offer.bannerColor || 'blue'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (offerId) => {
    if (!confirm('Delete this offer?')) return;

    try {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Offer deleted!');
        fetchOffers();
      } else {
        alert('Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Error deleting offer');
    }
  };

  const toggleOfferStatus = async (offer) => {
    try {
      const response = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...offer,
          isActive: !offer.isActive
        })
      });

      if (response.ok) {
        fetchOffers();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      couponCode: '',
      validFrom: '',
      validTo: '',
      minBookingAmount: 0,
      maxDiscount: 0,
      applicableVillas: [],
      showOnHomepage: true,
      isActive: true,
      bannerColor: 'blue'
    });
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900'
    };
    return colors[color] || colors.blue;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Offers & Promotions Manager</h1>
        <p className="text-slate-600">Create and manage special offers, discounts, and promotional campaigns</p>
      </div>

      <div className="mb-6">
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Offer
        </Button>
      </div>

      {/* Active Offers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.filter(o => o.isActive).map(offer => (
            <Card key={offer.id} className={`border-2 ${getColorClass(offer.bannerColor)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-yellow-600" />
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      {offer.showOnHomepage && (
                        <Badge className="bg-green-600">Homepage</Badge>
                      )}
                    </div>
                    <CardDescription className="text-slate-700">{offer.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleOfferStatus(offer)}>
                      <EyeOff className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(offer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(offer.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold text-green-700">
                      {offer.discountType === 'percentage' 
                        ? `${offer.discountValue}% OFF`
                        : `₹${offer.discountValue} OFF`}
                    </span>
                    {offer.maxDiscount > 0 && offer.discountType === 'percentage' && (
                      <span className="text-slate-600">(Max ₹{offer.maxDiscount})</span>
                    )}
                  </div>
                  
                  {offer.couponCode && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-500" />
                      <span>Code: <span className="font-mono font-bold">{offer.couponCode}</span></span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>
                      {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {offer.minBookingAmount > 0 && (
                    <div className="text-slate-600">
                      Min. booking: ₹{offer.minBookingAmount.toLocaleString()}
                    </div>
                  )}
                  
                  {offer.applicableVillas?.length > 0 && offer.applicableVillas[0] !== 'all' && (
                    <div className="text-slate-600">
                      Applies to {offer.applicableVillas.length} specific villa(s)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {offers.filter(o => o.isActive).length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Gift className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No active offers</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Inactive Offers */}
      {offers.filter(o => !o.isActive).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Inactive Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.filter(o => !o.isActive).map(offer => (
              <Card key={offer.id} className="opacity-60 border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {offer.title}
                        <Badge variant="secondary">Inactive</Badge>
                      </CardTitle>
                      <CardDescription>{offer.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleOfferStatus(offer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(offer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
            <DialogDescription>
              Configure your promotional offer details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Offer Title *</label>
                <Input 
                  placeholder="e.g., FLAT 50% OFF on 2nd Night"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input 
                  placeholder="Short description of the offer"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Discount Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Discount Type</label>
                <Select value={formData.discountType} onValueChange={(val) => setFormData({...formData, discountType: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Discount Value</label>
                <Input 
                  type="number"
                  placeholder={formData.discountType === 'percentage' ? '10' : '1000'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Max Discount (₹)</label>
                <Input 
                  type="number"
                  placeholder="0 = unlimited"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({...formData, maxDiscount: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Coupon & Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Coupon Code</label>
                <Input 
                  placeholder="WELCOME50"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({...formData, couponCode: e.target.value.toUpperCase()})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Valid From *</label>
                <Input 
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Valid To *</label>
                <Input 
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                />
              </div>
            </div>

            {/* Min Booking */}
            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Booking Amount (₹)</label>
              <Input 
                type="number"
                placeholder="0 = no minimum"
                value={formData.minBookingAmount}
                onChange={(e) => setFormData({...formData, minBookingAmount: parseInt(e.target.value)})}
              />
            </div>

            {/* Applicable Villas */}
            <div>
              <label className="text-sm font-medium mb-2 block">Applicable To</label>
              <Select 
                value={formData.applicableVillas[0] || 'all'} 
                onValueChange={(val) => setFormData({...formData, applicableVillas: [val]})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Villas</SelectItem>
                  {villas.map(villa => (
                    <SelectItem key={villa.id} value={villa.id}>{villa.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banner Color */}
            <div>
              <label className="text-sm font-medium mb-2 block">Banner Color</label>
              <Select value={formData.bannerColor} onValueChange={(val) => setFormData({...formData, bannerColor: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={formData.showOnHomepage} 
                  onCheckedChange={(checked) => setFormData({...formData, showOnHomepage: checked})}
                  id="homepage"
                />
                <label htmlFor="homepage" className="text-sm cursor-pointer">
                  Display banner on homepage
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  id="active"
                />
                <label htmlFor="active" className="text-sm cursor-pointer">
                  Activate this offer immediately
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-yellow-600 hover:bg-yellow-700">
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
