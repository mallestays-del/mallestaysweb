'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              {sent ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <Mail className="h-12 w-12 text-primary" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {sent ? 'Check Your Email' : 'Forgot Password'}
          </CardTitle>
          <CardDescription>
            {sent 
              ? `We've sent a password reset link to ${email}` 
              : 'Enter your admin email address and we\'ll send you a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 text-sm">
                  A password reset link has been sent to your email. 
                  Please check your inbox (and spam folder) and click the link to reset your password.
                </p>
                <p className="text-green-600 text-xs mt-2">
                  The link will expire in 1 hour.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Again
                </Button>
                <Link href="/admin/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="admin@mallestays.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/admin/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
