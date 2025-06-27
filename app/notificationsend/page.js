'use client';
import { useState } from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Textarea } from 'components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'components/ui/select';
import { Label } from 'components/ui/label';
import { Loader2, Mail, Smartphone, Bell } from 'lucide-react';

export default function NotificationSend() {
  const [data, setData] = useState({
    userId: '',
    type: 'in-app',
    message: '',
    email: '',
    phone: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const trimmed = {
      userId: data.userId.trim(),
      message: data.message.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    };

    const newErrors = {
      userId: !trimmed.userId,
      message: !trimmed.message,
      email: data.type === 'email' && !/^\S+@\S+\.\S+$/.test(trimmed.email),
      phone: data.type === 'sms' && !/^\+?[\d\s\-]{10,}$/.test(trimmed.phone),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const sendNotification = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    setServerError('');

    const payload = {
      userId: data.userId.trim(),
      type: data.type,
      message: data.message.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    };

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to send notification');
      }

      alert('✅ Notification sent successfully!');
      setData({
        userId: '',
        type: 'in-app',
        message: '',
        email: '',
        phone: '',
      });
      setErrors({});
    } catch (err) {
      setServerError(err.message || 'Unexpected error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Send Notification</h1>
          <p className="mt-2 text-gray-600">Send personalized notifications to your users</p>
        </div>

        <div className="space-y-6">
          {serverError && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
              ⚠️ {serverError}
            </p>
          )}

          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID <span className="text-red-500">*</span></Label>
            <Input
              id="userId"
              placeholder="Enter user ID"
              value={data.userId}
              onChange={(e) => setData({ ...data, userId: e.target.value })}
              className={errors.userId ? 'border-red-500' : ''}
            />
            {errors.userId && <p className="text-sm text-red-600">User ID is required</p>}
          </div>

          {/* Notification Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select
              value={data.type}
              onValueChange={(value) => setData({ ...data, type: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-app">
                  <div className="flex items-center gap-2"><Bell className="h-4 w-4" /> In-App</div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> SMS</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email input */}
          {data.type === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-600">Enter a valid email address</p>}
            </div>
          )}

          {/* Phone input */}
          {data.type === 'sms' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                placeholder="+1 123-456-7890"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-600">Enter a valid phone number</p>}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Your message here..."
              value={data.message}
              onChange={(e) => setData({ ...data, message: e.target.value })}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && (
              <p className="text-sm text-red-600">Message content is required</p>
            )}
          </div>

          {/* Submit */}
          <Button onClick={sendNotification} disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" /> Sending...
              </>
            ) : (
              'Send Notification'
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
