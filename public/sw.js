// Service Worker para notificaciones push
const CACHE_NAME = 'dailytracker-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  event.waitUntil(self.clients.claim())
})

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received', event)
  
  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: 'DailyTracker', body: event.data.text() }
    }
  }

  const title = data.title || 'DailyTracker'
  const options = {
    body: data.body || 'Tienes hábitos pendientes',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      { action: 'view', title: 'Ver hábitos' },
      { action: 'dismiss', title: 'Cerrar' }
    ],
    tag: data.tag || 'habit-reminder',
    requireInteraction: false,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked', event)
  
  event.notification.close()

  if (event.action === 'view' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/dashboard')
    )
  }
})

// Background sync (optional, for offline support)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync', event)
  
  if (event.tag === 'sync-habits') {
    event.waitUntil(
      // Sync habits when back online
      fetch('/api/habits')
        .then(response => response.json())
        .catch(err => console.error('[SW] Sync failed', err))
    )
  }
})

