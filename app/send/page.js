'use client';

import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from 'components/ui/dialog';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from 'components/ui/table';

import { Loader2, Info, Check } from 'lucide-react';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';

export default function NotificationView() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [markingRead, setMarkingRead] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [updatedMessage, setUpdatedMessage] = useState('');

  const fetchNotifications = async () => {
    const trimmedId = userId.trim();
    if (!trimmedId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/user/${trimmedId}/notifications`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch');

      setNotifications(result.notifications || []);
    } catch (error) {
      alert(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setMarkingRead(true);
    try {
      const response = await fetch(`/api/user/${userId.trim()}/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setMarkingRead(false);
    }
  };

  const markAllAsRead = async () => {
    const trimmedId = userId.trim();
    if (!trimmedId) return;

    setMarkingRead(true);
    try {
      const response = await fetch(`/api/user/${trimmedId}/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      alert(error.message);
    } finally {
      setMarkingRead(false);
    }
  };

  const openEditDialog = (notification) => {
    setEditingNotification(notification);
    setUpdatedMessage(notification.message);
    setEditOpen(true);
  };

  const updateNotification = async () => {
    const trimmedMessage = updatedMessage.trim();
    if (!trimmedMessage) return alert('Message cannot be empty.');

    try {
      const response = await fetch(`/api/user/${userId.trim()}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: editingNotification.id,
          newMessage: trimmedMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to update notification');

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === editingNotification.id
            ? { ...n, message: trimmedMessage }
            : n
        )
      );
      setEditOpen(false);
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/user/${userId.trim()}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const getTypeVariant = (type) => {
    return type === 'email'
      ? 'secondary'
      : type === 'sms'
      ? 'outline'
      : 'default';
  };

  const getReadVariant = (read) => (read ? 'default' : 'secondary');

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Your Notifications</h1>
          <p className="mt-2 text-gray-600">View, mark, edit, or delete your notifications</p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Input
            placeholder="Enter user ID (e.g., user_123)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={fetchNotifications} disabled={!userId.trim() || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              'View Notifications'
            )}
          </Button>
        </div>

        <div className="rounded-md border">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Info className="h-8 w-8 mb-2" />
              <p>
                {userId
                  ? 'No notifications found'
                  : 'Enter a User ID to view notifications'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id} className={n.read ? 'bg-gray-50' : ''}>
                    <TableCell>{n.userId}</TableCell>
                    <TableCell className="max-w-xs truncate hover:whitespace-normal">
                      {n.message}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={getTypeVariant(n.type)}>
                            {n.type.toUpperCase()}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{n.type.toUpperCase()} Notification</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={getReadVariant(n.read)}
                        onClick={() => markAsRead(n.id)}
                        disabled={n.read || markingRead}
                      >
                        {n.read ? (
                          <Check className="h-4 w-4" />
                        ) : markingRead ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Mark Read'
                        )}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteNotification(n.id)}>
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(n)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="mt-4 text-right">
            <Button onClick={markAllAsRead} disabled={markingRead} variant="outline">
              {markingRead ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking All...
                </>
              ) : (
                'Mark All As Read'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Edit Notification Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
          </DialogHeader>
          <Input
            value={updatedMessage}
            onChange={(e) => setUpdatedMessage(e.target.value)}
            placeholder="Update message"
          />
          <DialogFooter className="mt-4">
            <Button onClick={updateNotification}>Save</Button>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
