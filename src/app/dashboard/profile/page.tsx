'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, X, Save, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDashboardUser } from '../dashboard-shell';

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface ProfileForm {
  title: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  location: string;
  county: string;
}

const emptyExperience = (): Experience => ({ company: '', role: '', duration: '', description: '' });
const emptyEducation = (): Education => ({ institution: '', degree: '', field: '', year: '' });

export default function ProfileBuilderPage() {
  useDashboardUser(); // Ensure context is available

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState<ProfileForm>({
    title: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    location: '',
    county: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        const profile = data.data;

        if (profile && profile.id) {
          setForm({
            title: profile.title || '',
            summary: profile.summary || '',
            skills: profile.skills ? JSON.parse(profile.skills) : [],
            experience: Array.isArray(profile.experience) ? profile.experience : [],
            education: Array.isArray(profile.education) ? profile.education : [],
            location: profile.location || '',
            county: profile.county || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addExperience = () => {
    setForm((prev) => ({ ...prev, experience: [...prev.experience, emptyExperience()] }));
  };

  const removeExperience = (index: number) => {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }));
  };

  const addEducation = () => {
    setForm((prev) => ({ ...prev, education: [...prev.education, emptyEducation()] }));
  };

  const removeEducation = (index: number) => {
    setForm((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Profile saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Card className="rounded-2xl"><CardContent className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Builder</h1>
        <p className="text-gray-500 mt-1">Create and manage your professional profile</p>
      </div>

      {/* Personal Info */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Tell employers about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title / Role</Label>
            <Input
              id="title"
              placeholder="e.g. Software Engineer"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary / Bio</Label>
            <Textarea
              id="summary"
              placeholder="Write a brief summary about yourself, your experience, and career goals..."
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              rows={4}
              className="rounded-xl"
            />
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
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                placeholder="e.g. Nairobi County"
                value={form.county}
                onChange={(e) => setForm((prev) => ({ ...prev, county: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
          <CardDescription>Add your professional skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a skill and press Add"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="rounded-xl"
            />
            <Button onClick={addSkill} type="button" variant="outline" className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 pl-3 pr-1 py-1.5 rounded-lg">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-2 p-0.5 hover:bg-teal-200 rounded-full transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Work Experience</CardTitle>
              <CardDescription>Add your work history</CardDescription>
            </div>
            <Button onClick={addExperience} type="button" variant="outline" size="sm" className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.experience.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No experience added yet</p>
            </div>
          )}
          {form.experience.map((exp, index) => (
            <div key={index} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
              <button
                onClick={() => removeExperience(index)}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm font-medium text-gray-500">Experience #{index + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Company</Label>
                  <Input
                    placeholder="Company name"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Input
                    placeholder="Job title"
                    value={exp.role}
                    onChange={(e) => updateExperience(index, 'role', e.target.value)}
                    className="rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duration</Label>
                <Input
                  placeholder="e.g. Jan 2023 - Present"
                  value={exp.duration}
                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                  className="rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  placeholder="Brief description of your responsibilities..."
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  rows={2}
                  className="rounded-xl text-sm"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Education</CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </div>
            <Button onClick={addEducation} type="button" variant="outline" size="sm" className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.education.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <GraduationCap className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No education added yet</p>
            </div>
          )}
          {form.education.map((edu, index) => (
            <div key={index} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
              <button
                onClick={() => removeEducation(index)}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm font-medium text-gray-500">Education #{index + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Institution</Label>
                  <Input
                    placeholder="University name"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Degree</Label>
                  <Input
                    placeholder="e.g. Bachelor's, Diploma"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Field of Study</Label>
                  <Input
                    placeholder="e.g. Computer Science"
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Year</Label>
                  <Input
                    placeholder="e.g. 2023"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    className="rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
