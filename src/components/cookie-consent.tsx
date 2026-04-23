'use client';

import { useState, useEffect } from 'react';
import { Cookie, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
}

const COOKIE_CONSENT_KEY = 'jobready_cookie_consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Delay showing banner slightly to avoid layout shift
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
    // Apply preferences (e.g., enable/disable analytics scripts)
    if (prefs.analytics && typeof window !== 'undefined') {
      // Placeholder: enable analytics
    }
  };

  const handleAcceptAll = () => {
    savePreferences({ necessary: true, analytics: true, advertising: true });
  };

  const handleRejectNonEssential = () => {
    savePreferences({ necessary: true, analytics: false, advertising: false });
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {!showSettings ? (
            /* Main banner */
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  We use cookies to improve your experience. By continuing to use this site, you agree to our{' '}
                  <a href="/cookies" className="text-teal-600 hover:text-teal-700 underline">Cookie Policy</a>.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-xs border-gray-300 hover:border-gray-400"
                >
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectNonEssential}
                  className="text-xs border-gray-300 hover:border-gray-400"
                >
                  Reject Non-Essential
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            /* Settings panel */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Cookie Settings
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Necessary</p>
                    <p className="text-xs text-gray-500">Required for the site to function properly.</p>
                  </div>
                  <input type="checkbox" checked disabled className="w-4 h-4 accent-teal-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">Help us understand how visitors interact with our site.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="w-4 h-4 accent-teal-600"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Advertising</p>
                    <p className="text-xs text-gray-500">Used to deliver personalized advertisements.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.advertising}
                    onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
                    className="w-4 h-4 accent-teal-600"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleRejectNonEssential} className="text-xs">
                  Reject Non-Essential
                </Button>
                <Button size="sm" onClick={handleSaveSettings} className="text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
