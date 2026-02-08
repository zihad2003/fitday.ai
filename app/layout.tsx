import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import GlobalSearch from '@/components/GlobalSearch'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FitDay AI',
  description: 'Your personal fitness and lifestyle assistant',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased bg-slate-950 text-white">
        <ErrorBoundary>
          <Providers>
            <GlobalSearch />
            <PWAInstallPrompt />
            {children}
          </Providers>
        </ErrorBoundary>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async function() {
                  try {
                    // Check for existing registrations
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    
                    // Unregister old/broken service workers
                    for (const registration of registrations) {
                      const sw = registration.active || registration.waiting || registration.installing;
                      if (sw) {
                        // Check if it's an old version or broken
                        const scriptURL = sw.scriptURL;
                        if (!scriptURL.includes('/sw.js')) {
                          console.log('[SW] Unregistering old service worker:', scriptURL);
                          await registration.unregister();
                        }
                      }
                    }
                    
                    // Register new service worker
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                      scope: '/',
                      updateViaCache: 'none'
                    });
                    
                    console.log('[SW] Service Worker registered successfully:', registration);
                    
                    // Check for updates every 60 seconds
                    setInterval(() => {
                      registration.update().catch(err => {
                        console.warn('[SW] Update check failed:', err);
                      });
                    }, 60000);
                    
                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[SW] New version available. Refresh to update.');
                          }
                        });
                      }
                    });
                  } catch (err) {
                    console.warn('[SW] Service Worker registration failed:', err);
                    // If registration fails, try to unregister all and clear caches
                    try {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      for (const registration of registrations) {
                        await registration.unregister();
                      }
                      const cacheNames = await caches.keys();
                      await Promise.all(cacheNames.map(name => caches.delete(name)));
                      console.log('[SW] Cleared broken service workers and caches');
                    } catch (cleanupErr) {
                      console.error('[SW] Cleanup failed:', cleanupErr);
                    }
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}