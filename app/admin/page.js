'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, LayoutDashboard, Home, Calendar, Star, MapPin, 
  Users, Settings, LogOut, Plus, Edit, Trash2, Check, X, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [villas, setVillas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [statsRes, villasRes, bookingsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/villas'),
        fetch('/api/bookings'),
        fetch('/api/reviews')
      ]);

      const [statsData, villasData, bookingsData, reviewsData] = await Promise.all([
        statsRes.json(),
        villasRes.json(),
        bookingsRes.json(),
        reviewsRes.json()
      ]);

      setStats(statsData);
      setVillas(villasData.villas || []);
      setBookings(bookingsData.bookings || []);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Booking updated successfully');
        fetchData();
      } else {
        toast.error('Failed to update booking');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const updateReview = async (reviewId, approved) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        toast.success(approved ? 'Review approved' : 'Review rejected');
        fetchData();
      } else {
        toast.error('Failed to update review');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const deleteVilla = async (villaId) => {
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

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Review deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isSuperAdmin = session.user.role === 'super_admin';

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Malle Stays Admin</h1>
                <p className="text-sm text-slate-600">{session.user.name} ({session.user.role})</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="outline" data-testid="view-website-btn">
                  <Eye className="h-4 w-4 mr-2" />
                  View Website
                </Button>
              </Link>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: '/admin/login' })} data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-testid="stats-cards">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Villas</CardDescription>
              <CardTitle className="text-3xl">{stats.totalVillas || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl">{stats.totalBookings || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Confirmed Bookings</CardDescription>
              <CardTitle className="text-3xl">{stats.confirmedBookings || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl">₹{(stats.totalRevenue || 0).toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="villas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="villas" data-testid="tab-villas">Villas</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Villas Tab */}
          <TabsContent value="villas" data-testid="villas-content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Villas Management</CardTitle>
                  <Link href="/admin/villas/add">
                    <Button data-testid="add-villa-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Villa
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Bedrooms</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {villas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          No villas found. Add your first villa!
                        </TableCell>
                      </TableRow>
                    ) : (
                      villas.map((villa) => (
                        <TableRow key={villa.id}>
                          <TableCell className="font-medium">{villa.name}</TableCell>
                          <TableCell>{villa.location}</TableCell>
                          <TableCell>₹{villa.pricePerNight?.toLocaleString()}</TableCell>
                          <TableCell>{villa.bedrooms}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link href={`/admin/villas/edit/${villa.id}`}>
                                <Button size="sm" variant="outline" data-testid={`edit-villa-${villa.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              {isSuperAdmin && (
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => deleteVilla(villa.id)}
                                  data-testid={`delete-villa-${villa.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" data-testid="bookings-content">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Villa</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500">
                          No bookings yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.name}</TableCell>
                          <TableCell>{booking.villaName}</TableCell>
                          <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                disabled={booking.status === 'confirmed'}
                                data-testid={`confirm-booking-${booking.id}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                disabled={booking.status === 'cancelled'}
                                data-testid={`cancel-booking-${booking.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" data-testid="reviews-content">
            <Card>
              <CardHeader>
                <CardTitle>Reviews Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Villa</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500">
                          No reviews yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{review.name}</TableCell>
                          <TableCell>{review.villaName}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              {review.rating}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                          <TableCell>
                            <Badge variant={review.approved ? 'default' : 'secondary'}>
                              {review.approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateReview(review.id, true)}
                                disabled={review.approved}
                                data-testid={`approve-review-${review.id}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              {isSuperAdmin && (
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteReview(review.id)}
                                  data-testid={`delete-review-${review.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
