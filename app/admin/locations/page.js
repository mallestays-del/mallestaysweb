'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MapPin, ArrowLeft, ArrowUp, ArrowDown, Eye, EyeOff, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400';

export default function LocationsManager() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchLocations();
    }
  }, [status]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/locations?all=true');
      const data = await res.json();
      setLocations(data.locations || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ name: '', image: '' });
    setDialogOpen(true);
  };

  const openEdit = (loc) => {
    setEditing(loc);
    setFormData({ name: loc.name || '', image: loc.image || '' });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((f) => ({ ...f, image: data.url }));
        toast.success('Image uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Location name is required');
    setSaving(true);
    try {
      const url = editing ? `/api/admin/locations/${editing.id}` : '/api/admin/locations';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), image: formData.image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast.success(editing ? 'Location updated' : 'Location added');
      setDialogOpen(false);
      fetchLocations();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/locations/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast.success('Location deleted');
      setDeleteTarget(null);
      fetchLocations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const patchLocation = async (id, patch) => {
    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Update failed');
      }
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const toggleActive = async (loc) => {
    const ok = await patchLocation(loc.id, { isActive: loc.isActive === false });
    if (ok) fetchLocations();
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= locations.length) return;
    const a = locations[index];
    const b = locations[target];
    // Optimistic swap
    const next = [...locations];
    next[index] = b;
    next[target] = a;
    setLocations(next);
    await Promise.all([
      patchLocation(a.id, { order: target }),
      patchLocation(b.id, { order: index }),
    ]);
    fetchLocations();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" onClick={() => router.push('/admin/dashboard')} className="mb-2 -ml-3" data-testid="back-to-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-teal-600" /> Locations Manager
            </h1>
            <p className="text-slate-600 mt-1">
              Manage the destinations shown on the homepage "Prestigious Locations" section and in search filters.
            </p>
          </div>
          <Button onClick={openAdd} className="bg-teal-600 hover:bg-teal-700" data-testid="add-location-btn">
            <Plus className="h-4 w-4 mr-2" /> Add Location
          </Button>
        </div>

        {locations.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-slate-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              No locations yet. Click "Add Location" to create your first destination.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {locations.map((loc, index) => (
              <Card key={loc.id} className={`overflow-hidden border ${loc.isActive === false ? 'opacity-60' : ''}`} data-testid={`location-item-${loc.id}`}>
                <div className="relative h-40 bg-slate-200">
                  <img
                    src={loc.image || FALLBACK_IMG}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <h3 className="text-white font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{loc.name}</h3>
                    <Badge className={loc.isActive === false ? 'bg-slate-500' : 'bg-green-600'}>
                      {loc.isActive === false ? 'Hidden' : 'Visible'}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2 bg-white/90 text-slate-700 text-xs font-semibold rounded px-2 py-0.5">#{index + 1}</div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => move(index, -1)} disabled={index === 0} title="Move up" data-testid={`move-up-${loc.id}`}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => move(index, 1)} disabled={index === locations.length - 1} title="Move down" data-testid={`move-down-${loc.id}`}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => toggleActive(loc)} title={loc.isActive === false ? 'Show on site' : 'Hide from site'} data-testid={`toggle-${loc.id}`}>
                        {loc.isActive === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEdit(loc)} title="Edit" data-testid={`edit-${loc.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(loc)} title="Delete" data-testid={`delete-${loc.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Location' : 'Add Location'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the destination name or image.' : 'Add a new destination to the homepage and search filters.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Location Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mahabaleshwar"
                required
                data-testid="location-name-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cover Image</label>
              <div className="relative h-36 rounded-lg overflow-hidden bg-slate-100 border mb-2 flex items-center justify-center">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                )}
              </div>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} data-testid="location-image-file" />
                  <div className={`w-full h-10 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-sm cursor-pointer hover:bg-slate-50 ${uploading ? 'opacity-50' : ''}`}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload image'}
                  </div>
                </label>
              </div>
              <Input
                className="mt-2"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="or paste an image URL"
                data-testid="location-image-url"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading} className="bg-teal-600 hover:bg-teal-700" data-testid="save-location-btn">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle>
            <DialogDescription>
              This removes the destination card from the homepage and search filters. Villas in this location are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete} data-testid="confirm-delete-btn">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
