'use client';

import { useEffect, useState } from 'react';
import {
  BellRing,
  Plus,
  Trash2,
  Search,
  MapPin,
  Tag,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useDashboardUser } from '../dashboard-shell';

interface JobAlert {
  id: string;
  keywords: string | null;
  location: string | null;
  category: string | null;
  frequency: string;
  isActive: boolean;
  createdAt: string;
}

export default function JobAlertsPage() {
  useDashboardUser();

  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    keywords: '',
    location: '',
    category: '',
    frequency: 'DAILY',
  });

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async () => {
    if (!form.keywords && !form.location && !form.category) {
      toast.error('Please fill in at least one field');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: form.keywords || null,
          location: form.location || null,
          category: form.category || null,
          frequency: form.frequency,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Job alert created!');
        setForm({ keywords: '', location: '', category: '', frequency: 'DAILY' });
        setShowForm(false);
        fetchAlerts();
      } else {
        toast.error(data.error || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
      toast.error('Failed to create alert');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      const data = await res.json();

      if (data.success) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a)));
      } else {
        toast.error(data.error || 'Failed to update alert');
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('Alert deleted');
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(data.error || 'Failed to delete alert');
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
          <p className="text-gray-500 mt-1">Get notified when new jobs match your criteria</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-1" /> Create Alert
        </Button>
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <Card className="rounded-2xl border-0 shadow-sm border-l-4 border-l-teal-600">
          <CardHeader>
            <CardTitle className="text-lg">Create New Alert</CardTitle>
            <CardDescription>Define your job search criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="keywords"
                  placeholder="e.g. software engineer, accountant"
                  value={form.keywords}
                  onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                  className="rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="e.g. Nairobi"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="category"
                    placeholder="e.g. IT, Engineering"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm((prev) => ({ ...prev, frequency: v }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTANT">Instant</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                {creating ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {alert.keywords && (
                        <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                          <Search className="w-3 h-3 mr-1" /> {alert.keywords}
                        </Badge>
                      )}
                      {alert.location && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                          <MapPin className="w-3 h-3 mr-1" /> {alert.location}
                        </Badge>
                      )}
                      {alert.category && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                          <Tag className="w-3 h-3 mr-1" /> {alert.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {alert.frequency}
                      </span>
                      <span>·</span>
                      <span>Created {format(new Date(alert.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`switch-${alert.id}`} className="text-xs text-gray-500">
                        {alert.isActive ? 'Active' : 'Paused'}
                      </Label>
                      <Switch
                        id={`switch-${alert.id}`}
                        checked={alert.isActive}
                        onCheckedChange={() => handleToggle(alert.id, alert.isActive)}
                      />
                    </div>
                    <Button
                      onClick={() => handleDelete(alert.id)}
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <BellRing className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No job alerts yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Create alerts to get notified about new jobs matching your criteria
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
