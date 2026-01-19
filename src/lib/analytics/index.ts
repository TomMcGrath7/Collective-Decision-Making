import type { AnalyticsEvent, AnalyticsEventType } from '../../types';

// Configuration - set your Google Analytics measurement ID here
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const CONSENT_KEY = 'cdm_analytics_consent';

// Check if user has given analytics consent
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'granted';
}

// Set analytics consent
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');

  if (granted && GA_MEASUREMENT_ID) {
    // Initialize analytics if consent was just granted
    loadGoogleAnalytics();
  }
}

// Check if consent has been asked
export function hasConsentBeenAsked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) !== null;
}

// Load Google Analytics script
function loadGoogleAnalytics(): void {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true, // GDPR: anonymize IP addresses
    send_page_view: false,
    cookie_flags: 'SameSite=Strict;Secure', // GDPR: secure cookies
  });

  console.log('[Analytics] Initialized with ID:', GA_MEASUREMENT_ID);
}

// Initialize Google Analytics (only if consent given)
export function initAnalytics(): void {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    console.log('[Analytics] No measurement ID configured, running in debug mode');
    return;
  }

  // Only load if user has consented
  if (hasAnalyticsConsent()) {
    loadGoogleAnalytics();
  } else {
    console.log('[Analytics] Waiting for user consent');
  }
}

// Track a custom event (only if consent given)
export function trackEvent(
  eventType: AnalyticsEventType,
  data: Record<string, unknown> = {}
): void {
  const event: AnalyticsEvent = {
    type: eventType,
    timestamp: Date.now(),
    data,
  };

  // Log in development
  if (import.meta.env.DEV) {
    console.log('[Analytics Event]', event);
  }

  // Only send if consent given and gtag available
  if (hasAnalyticsConsent() && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventType, {
      ...data,
      event_category: 'collective_decision',
    });
  }
}

// Track page view (only if consent given)
export function trackPageView(pagePath: string, pageTitle: string): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics PageView]', { pagePath, pageTitle });
  }

  if (hasAnalyticsConsent() && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

// Specific tracking functions for common events
export function trackProblemTypeSelected(problemType: string): void {
  trackEvent('problem_type_selected', { problem_type: problemType });
}

export function trackAxiomToggled(axiomId: string, selected: boolean, totalSelected: number): void {
  trackEvent('axiom_toggled', {
    axiom_id: axiomId,
    selected,
    total_selected: totalSelected,
  });
}

export function trackMechanismSelected(mechanismId: string, axiomCount: number): void {
  trackEvent('mechanism_selected', {
    mechanism_id: mechanismId,
    axiom_count: axiomCount,
  });
}

export function trackCalculationCompleted(
  mechanismId: string,
  voterCount: number,
  candidateCount: number,
  hadTie: boolean
): void {
  trackEvent('calculation_completed', {
    mechanism_id: mechanismId,
    voter_count: voterCount,
    candidate_count: candidateCount,
    had_tie: hadTie,
  });
}

export function trackSessionStart(): void {
  trackEvent('session_start', {});
}

export function trackSessionEnd(durationMs: number): void {
  trackEvent('session_end', {
    duration_seconds: Math.round(durationMs / 1000),
  });
}

// Type declarations for global gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
