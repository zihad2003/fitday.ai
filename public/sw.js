// Service Worker for FitDayAI PWA
// Version: 2.1.0 - Fixed fetch error handling
// Advanced caching strategies with offline support

const CACHE_VERSION = 'fitday-v2.1.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const API_CACHE = `${CACHE_VERSION}-api`

// Cache duration in milliseconds
const CACHE_DURATION = {
  static: 30 * 24 * 60 * 60 * 1000, // 30 days
  dynamic: 7 * 24 * 60 * 60 * 1000, // 7 days
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
  api: 5 * 60 * 1000, // 5 minutes
}

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/profile',
  '/login',
  '/register',
  '/offline',
  '/manifest.json',
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/auth/me',
  '/api/user/profile',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      console.log('[SW] Static assets cached')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('fitday-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      console.log('[SW] Service worker activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event

  try {
    const url = new URL(request.url)

    // Skip non-GET requests
    if (request.method !== 'GET') {
      return
    }

    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
      return
    }

    // Skip browser-extension and chrome-extension URLs
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
      return
    }

    // API requests - Network First with cache fallback
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        networkFirstStrategy(request, API_CACHE).catch(err => {
          console.error('[SW] API request failed:', err)
          return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        })
      )
      return
    }

    // Images - Cache First with network fallback
    if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      event.respondWith(
        cacheFirstStrategy(request, IMAGE_CACHE).catch(err => {
          console.error('[SW] Image request failed:', err)
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1e293b" width="200" height="200"/><text fill="#64748b" x="50%" y="50%" text-anchor="middle" dy=".3em">Error</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          )
        })
      )
      return
    }

    // Static assets - Cache First
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname.match(/\.(js|css|woff2?)$/)) {
      event.respondWith(
        cacheFirstStrategy(request, STATIC_CACHE).catch(err => {
          console.error('[SW] Static asset request failed:', err)
          return fetch(request)
        })
      )
      return
    }

    // Dynamic content - Stale While Revalidate
    event.respondWith(
      staleWhileRevalidateStrategy(request, DYNAMIC_CACHE).catch(err => {
        console.error('[SW] Dynamic content request failed:', err)
        return fetch(request)
      })
    )
  } catch (error) {
    console.error('[SW] Fetch event error:', error)
    // Let the request pass through to the network
    event.respondWith(fetch(request))
  }
})

// Network First Strategy (for API calls)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }

    // Return offline JSON for API requests
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline',
        message: 'You are currently offline. Please check your internet connection.'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }
    )
  }
}

// Cache First Strategy (for static assets and images)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    // Check if cache is still fresh
    const cacheTime = await getCacheTime(request)
    const now = Date.now()
    const maxAge = cacheName === IMAGE_CACHE ? CACHE_DURATION.images : CACHE_DURATION.static

    if (cacheTime && (now - cacheTime) < maxAge) {
      return cachedResponse
    }
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
      await setCacheTime(request, Date.now())
    }

    return networkResponse
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse
    }

    // Return placeholder for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1e293b" width="200" height="200"/><text fill="#64748b" x="50%" y="50%" text-anchor="middle" dy=".3em">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }

    throw error
  }
}

// Stale While Revalidate Strategy (for dynamic content)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone()
      const cache = await caches.open(cacheName)
      await cache.put(request, responseToCache)
    }
    return networkResponse
  }).catch(() => cachedResponse)

  // Always return a valid Response object
  const response = cachedResponse || await fetchPromise

  // If still no response, return a basic error response
  if (!response) {
    return new Response('Service Worker: Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  return response
}

// Helper: Get cache timestamp
async function getCacheTime(request) {
  const cache = await caches.open('cache-timestamps')
  const response = await cache.match(request.url)
  if (response) {
    return parseInt(await response.text())
  }
  return null
}

// Helper: Set cache timestamp
async function setCacheTime(request, timestamp) {
  const cache = await caches.open('cache-timestamps')
  await cache.put(
    request.url,
    new Response(timestamp.toString())
  )
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-workout-data') {
    event.waitUntil(syncWorkoutData())
  } else if (event.tag === 'sync-meal-data') {
    event.waitUntil(syncMealData())
  }
})

// Sync workout data when back online
async function syncWorkoutData() {
  try {
    const db = await openIndexedDB()
    const pendingWorkouts = await getPendingWorkouts(db)

    for (const workout of pendingWorkouts) {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout),
      })

      if (response.ok) {
        await removePendingWorkout(db, workout.id)
        console.log('[SW] Synced workout:', workout.id)
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync workout data:', error)
    throw error
  }
}

// Sync meal data when back online
async function syncMealData() {
  try {
    const db = await openIndexedDB()
    const pendingMeals = await getPendingMeals(db)

    for (const meal of pendingMeals) {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      })

      if (response.ok) {
        await removePendingMeal(db, meal.id)
        console.log('[SW] Synced meal:', meal.id)
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync meal data:', error)
    throw error
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  const data = event.data ? event.data.json() : {}
  const title = data.title || 'FitDay AI'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/'

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  }
})

// IndexedDB helpers (simplified)
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FitDayDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pendingWorkouts')) {
        db.createObjectStore('pendingWorkouts', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('pendingMeals')) {
        db.createObjectStore('pendingMeals', { keyPath: 'id' })
      }
    }
  })
}

function getPendingWorkouts(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingWorkouts'], 'readonly')
    const store = transaction.objectStore('pendingWorkouts')
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function getPendingMeals(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMeals'], 'readonly')
    const store = transaction.objectStore('pendingMeals')
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function removePendingWorkout(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingWorkouts'], 'readwrite')
    const store = transaction.objectStore('pendingWorkouts')
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

function removePendingMeal(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMeals'], 'readwrite')
    const store = transaction.objectStore('pendingMeals')
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

console.log('[SW] Service Worker loaded - Version:', CACHE_VERSION)