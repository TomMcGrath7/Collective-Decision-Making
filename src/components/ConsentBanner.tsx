import { useState, useEffect } from 'react';
import { hasConsentBeenAsked, setAnalyticsConsent } from '../lib/analytics';

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show banner if consent hasn't been asked yet
    if (!hasConsentBeenAsked()) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 z-50 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            We use anonymous analytics to understand how this educational tool is used.
            No personal data or voting preferences are collected.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
