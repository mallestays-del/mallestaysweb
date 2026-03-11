'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Key, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [emailData, setEmailData] = useState({
    currentEmail: '',
    newEmail: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      setEmailData({ ...emailData, currentEmail: session?.user?.email || '' });
    }
  }, [status, session]);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    
    if (!emailData.newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    if (emailData.newEmail === emailData.currentEmail) {
      toast.error('New email must be different from current email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentEmail: emailData.currentEmail,
          newEmail: emailData.newEmail 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Email updated successfully! Please login again with your new email.');
        // Wait a moment then redirect to login
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to update email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: session?.user?.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === 'loading') {
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-slate-600 mt-1">Manage your admin account credentials</p>
        </div>

        <div className="space-y-6">
          {/* Current Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Current Account
              </CardTitle>
              <CardDescription>Your current admin account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <p className="text-lg font-semibold">{session?.user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <p className="text-lg font-semibold capitalize">{session?.user?.role?.replace('_', ' ')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Change Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Change Email Address
              </CardTitle>
              <CardDescription>Update your admin email address (requires re-login)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Email</label>
                  <Input
                    type="email"
                    value={emailData.currentEmail}
                    disabled
                    className="bg-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">New Email Address *</label>
                  <Input
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                    placeholder="newemail@example.com"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Updating Email...' : 'Update Email'}
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Note: You will be logged out and need to login with your new email address.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your admin password for security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Password *</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">New Password *</label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Confirm New Password *</label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={passwordLoading}>
                  <Key className="h-4 w-4 mr-2" />
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Tip: Use a strong password with letters, numbers, and special characters.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-yellow-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Security Best Practices</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Change your password regularly (every 3-6 months)</li>
                    <li>• Never share your admin credentials with anyone</li>
                    <li>• Use a unique, strong password for your admin account</li>
                    <li>• If you suspect unauthorized access, change your password immediately</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
