'use client';

import { useState } from 'react';
import { Handshake, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format the message for WhatsApp
      const whatsappMessage = `*New Partnership Request*

🤝 *Property Owner Details:*

👤 *Name:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Phone:* ${formData.phone}
📍 *Property Location:* ${formData.location}

🏠 *Property Description:*
${formData.description}

---
Sent via Malle Stays Partnership Form`;

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      
      // Your WhatsApp number
      const whatsappNumber = '918446620191';
      
      // Construct WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // Show success message
      toast.success('Redirecting to WhatsApp... Please send the partnership request from there.');
      
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', location: '', description: '' });
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="partner-page">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Handshake className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">Partner With Us</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            List your luxury villa on Malle Stays and reach thousands of travelers looking for premium accommodation
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Benefits */}
          <div className="space-y-6" data-testid="benefits-section">
            <Card>
              <CardHeader>
                <CardTitle>Why Partner With Malle Stays?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Increase Your Bookings</h3>
                    <p className="text-slate-600">Get access to thousands of travelers actively looking for luxury stays</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Professional Marketing</h3>
                    <p className="text-slate-600">We handle all marketing and promotion of your property</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Easy Management</h3>
                    <p className="text-slate-600">Simple dashboard to manage bookings and availability</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Transparent Pricing</h3>
                    <p className="text-slate-600">Fair commission structure with no hidden fees</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">5</div>
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Support</h3>
                    <p className="text-slate-600">Dedicated support team to help you succeed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What We Look For</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Luxury villas with premium amenities
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Well-maintained properties
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Excellent location and accessibility
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Professional hospitality standards
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Commitment to guest satisfaction
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Partnership Form */}
          <Card data-testid="partnership-form">
            <CardHeader>
              <CardTitle>Submit Your Property</CardTitle>
              <CardDescription>Fill out the form below and our team will get in touch with you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    required
                    data-testid="name-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                    data-testid="email-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone *</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                    data-testid="phone-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Lonavala, Maharashtra"
                    required
                    data-testid="location-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your property - size, amenities, unique features..."
                    rows={6}
                    required
                    data-testid="description-input"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="submit-button">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Partnership Request'}
                </Button>
                <p className="text-xs text-center text-slate-600">
                  By submitting this form, you agree to our terms and conditions
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
