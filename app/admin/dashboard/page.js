'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Calendar, MapPin, Plus, Eye, Edit, Trash2, Settings, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalVillas: 0,
    totalLocations: 0,
    totalBookings: 0
  });
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/villas');
      const data = await response.json();
      if (response.ok) {
        setVillas(data.villas || []);
        setStats({
          totalVillas: data.villas?.length || 0,
          totalLocations: new Set(data.villas?.map(v => v.location)).size || 0,
          totalBookings: 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (villaId) => {
    if (!confirm('Are you sure you want to delete this villa?')) return;
    
    try {
      const response = await fetch(`/api/admin/villas/${villaId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Villa deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete villa');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {session?.user?.email}</p>
          </div>
          <div className="space-x-3">
            <Button onClick={() => router.push('/admin/guest-reviews')} variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Guest Reviews
            </Button>
            <Button onClick={() => router.push('/admin/settings')} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => router.push('/admin/villas/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Villa
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              View Website
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Villas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVillas}</div>
              <p className="text-xs text-muted-foreground">Active properties</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLocations}</div>
              <p className="text-xs text-muted-foreground">Different areas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp Inquiries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Check WhatsApp</div>
              <p className="text-xs text-muted-foreground">Direct messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Villas List */}
        <Card>
          <CardHeader>
            <CardTitle>All Villas</CardTitle>
            <CardDescription>Manage your property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {villas.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No villas added yet</p>
                  <Button onClick={() => router.push('/admin/villas/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Villa
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {villas.map((villa) => (
                    <div key={villa.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center space-x-4">
                        {villa.images?.[0] && (
                          <img
                            src={villa.images[0]}
                            alt={villa.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{villa.name}</h3>
                          <p className="text-sm text-slate-600">
                            {villa.location} • {villa.bedrooms} Bedrooms • ₹{villa.pricePerNight?.toLocaleString()}/night
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`/villa/${villa.slug}`, '_blank')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/villas/edit/${villa.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(villa.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
