"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  deferredPrompt: unknown;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'failed';
  pendingActions: number;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'failed'>('idle');
  const [pendingActions, setPendingActions] = useState(0);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                             (window.navigator as any).standalone ||
                             document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('PWA: Install prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA: App installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      triggerBackgroundSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('PWA: Service Worker registered', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              console.log('PWA: Update available');
            }
          });
        }
      });

      // Get active service worker
      if (registration.active) {
        setServiceWorker(registration.active);
      }

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Controller changed');
        window.location.reload();
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('PWA: Message from service worker', event.data);
        
        if (event.data.type === 'SYNC_STATUS') {
          setSyncStatus(event.data.status);
        } else if (event.data.type === 'PENDING_ACTIONS') {
          setPendingActions(event.data.count);
        }
      });

    } catch (error) {
      console.error('PWA: Service Worker registration failed', error);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await (deferredPrompt as any).prompt();
      console.log('PWA: Install prompt result', result);
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setIsInstallable(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA: Install failed', error);
    }
  };

  const updateApp = async () => {
    if (!serviceWorker) return;

    try {
      serviceWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    } catch (error) {
      console.error('PWA: Update failed', error);
    }
  };

  const triggerBackgroundSync = () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        setSyncStatus('syncing');
        
        const syncRegistration = registration as any;
        return Promise.all([
          syncRegistration.sync.register('workflow-save'),
          syncRegistration.sync.register('task-update'),
          syncRegistration.sync.register('agent-status')
        ]);
      }).then(() => {
        console.log('PWA: Background sync triggered');
        setSyncStatus('completed');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }).catch((error) => {
        console.error('PWA: Background sync failed', error);
        setSyncStatus('failed');
        setTimeout(() => setSyncStatus('idle'), 3000);
      });
    }
  };

  // Public API for caching data offline
  const cacheWorkflow = (workflow: unknown) => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: 'CACHE_WORKFLOW',
        workflow
      });
    }
  };

  const cacheTask = (task: unknown) => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: 'CACHE_TASK',
        task
      });
    }
  };

  const requestPersistentStorage = async () => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const isPersistent = await navigator.storage.persist();
        console.log('PWA: Persistent storage', isPersistent);
        return isPersistent;
      } catch (error) {
        console.error('PWA: Persistent storage request failed', error);
        return false;
      }
    }
    return false;
  };

  const getStorageEstimate = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        console.log('PWA: Storage estimate', estimate);
        return estimate;
      } catch (error) {
        console.error('PWA: Storage estimate failed', error);
        return null;
      }
    }
    return null;
  };

  const contextValue: PWAContextType = {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    deferredPrompt,
    installApp,
    updateAvailable,
    updateApp,
    syncStatus,
    pendingActions
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

// Utility hooks for common PWA operations
export const useInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  
  return {
    canInstall: isInstallable,
    install: installApp
  };
};

export const useOfflineStatus = () => {
  const { isOnline, syncStatus, pendingActions } = usePWA();
  
  return {
    isOnline,
    isOffline: !isOnline,
    syncStatus,
    pendingActions,
    hasPendingActions: pendingActions > 0
  };
};

export const useAppUpdate = () => {
  const { updateAvailable, updateApp } = usePWA();
  
  return {
    updateAvailable,
    updateApp
  };
};

export default PWAProvider;