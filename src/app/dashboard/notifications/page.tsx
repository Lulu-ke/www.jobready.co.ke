'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellOff,
  Briefcase,
  Info,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useDashboardUser } from '../dashboard-shell';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Briefcase> = {
  APPLICATION_UPDATE: Briefcase,
  JOB_ALERT: Bell,
  SYSTEM: Info,
};

const typeColors: Record<string, string> = {
  APPLICATION_UPDATE: 'bg-purple-50 text-purple-600',
  JOB_ALERT: 'bg-teal-50 text-teal-600',
  SYSTEM: 'bg-gray-100 text-gray-600',
};

export default function NotificationsPage() {
  useDashboardUser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('All notifications marked as read');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } else {
        toast.error(data.error || 'Failed to mark as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50"
          >
            <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            const colorClass = typeColors[notification.type] || 'bg-gray-100 text-gray-600';

            const content = (
              <Card
                className={`rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.isRead ? 'bg-teal-50/30 border-l-4 border-l-teal-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.link && (
                          <span className="text-xs text-teal-600 flex items-center gap-1">
                            View <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            if (notification.link) {
              return (
                <Link
                  key={notification.id}
                  href={notification.link}
                  onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && handleMarkRead(notification.id)}
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No notifications</h3>
            <p className="text-sm text-gray-500 mt-1">
              We&apos;ll let you know when something important happens
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
