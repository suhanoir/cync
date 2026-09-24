'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export function InstallPWA({ variant = 'button' }: { variant?: 'button' | 'card' | 'banner' }) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if dismissed before
    const isDismissed = localStorage.getItem('cync-install-dismissed') === 'true';
    setDismissedBanner(isDismissed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      // Show modal instructions for iOS or desktop
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setDismissedBanner(true);
    localStorage.setItem('cync-install-dismissed', 'true');
  };

  if (isStandalone) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-cync-green-light border border-cync-green-border text-foreground">
          <div className="w-8 h-8 rounded-full bg-cync-green text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-semibold block">App Installed</span>
            <span className="text-[11px] text-muted-foreground">
              You are running Cync in native standalone app mode.
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* 1. Header / Icon Button Variant */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Install App"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-cync-green" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {/* 2. Settings Card Variant */}
      {variant === 'card' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-cync-green-light border border-cync-green-border flex items-center justify-center text-cync-green shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Download App to Phone</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Install Cync directly to your home screen for full-screen performance, instant access, and offline caching.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleInstallClick}
            className="shrink-0"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Install on Phone</span>
          </Button>
        </div>
      )}

      {/* 3. Subtle Mobile Banner Variant */}
      {variant === 'banner' && !dismissedBanner && (
        <div className="md:hidden flex items-center justify-between gap-2 px-3 py-2 bg-card border-b border-border text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-cync-green/20 text-cync-green flex items-center justify-center shrink-0">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <p className="text-foreground text-[11px] truncate">
              Install Cync on your home screen for fast access.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-cync-green text-white hover:bg-cync-green-muted"
            >
              Install
            </button>
            <button
              onClick={handleDismissBanner}
              aria-label="Dismiss banner"
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Installation Guide Modal (especially for iOS Safari & manual installation) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Install Cync on Your Phone"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Cync is designed as a high-performance progressive mobile web application that runs directly on your iPhone or Android device without App Store bloat.
          </p>

          {isIOS ? (
            <div className="space-y-3 p-3.5 rounded-lg bg-muted/40 border border-border text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>Apple iOS Safari Instructions:</span>
              </div>
              <ol className="space-y-2.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-border text-foreground font-semibold shrink-0 text-[10px]">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-foreground">Share</strong> icon{' '}
                    <Share className="inline w-3.5 h-3.5 text-cync-green mx-0.5" /> in Safari&apos;s bottom toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-border text-foreground font-semibold shrink-0 text-[10px]">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong>{' '}
                    <PlusSquare className="inline w-3.5 h-3.5 text-cync-green mx-0.5" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-border text-foreground font-semibold shrink-0 text-[10px]">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-foreground">Add</strong> in the top right. Cync will launch as a native standalone app!
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-lg bg-muted/40 border border-border text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>Android Chrome / Browser Instructions:</span>
              </div>
              <ol className="space-y-2.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-border text-foreground font-semibold shrink-0 text-[10px]">
                    1
                  </span>
                  <span>
                    Tap the browser menu (three dots <strong className="text-foreground">⋮</strong>) in Chrome.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-border text-foreground font-semibold shrink-0 text-[10px]">
                    2
                  </span>
                  <span>
                    Select <strong className="text-foreground">Install App</strong> or <strong className="text-foreground">Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-border text-foreground font-semibold shrink-0 text-[10px]">
                    3
                  </span>
                  <span>
                    Confirm the install prompt. Cync will appear directly on your home screen with its dedicated icon!
                  </span>
                </li>
              </ol>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setShowModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

