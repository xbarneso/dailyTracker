import { useState, useEffect } from 'react'

interface NotificationPermission {
  granted: boolean
  denied: boolean
  loading: boolean
}

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    loading: true,
  })
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Check if notifications are supported
  const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

  useEffect(() => {
    if (!isSupported) {
      setPermission({ granted: false, denied: true, loading: false })
      return
    }

    // Check current permission
    const currentPermission = Notification.permission
    setPermission({
      granted: currentPermission === 'granted',
      denied: currentPermission === 'denied',
      loading: false,
    })

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[Notifications] Service Worker registered', reg)
          setRegistration(reg)
        })
        .catch((err) => {
          console.error('[Notifications] Service Worker registration failed', err)
        })
    }
  }, [isSupported])

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[Notifications] Not supported')
      return false
    }

    try {
      setPermission((prev) => ({ ...prev, loading: true }))
      const result = await Notification.requestPermission()
      
      const granted = result === 'granted'
      setPermission({
        granted,
        denied: result === 'denied',
        loading: false,
      })

      if (granted) {
        console.log('[Notifications] Permission granted')
      } else {
        console.log('[Notifications] Permission denied')
      }

      return granted
    } catch (error) {
      console.error('[Notifications] Error requesting permission', error)
      setPermission({ granted: false, denied: true, loading: false })
      return false
    }
  }

  // Show a local notification
  const showNotification = async (options: NotificationOptions): Promise<void> => {
    if (!isSupported || !permission.granted) {
      console.warn('[Notifications] Cannot show notification - permission not granted')
      return
    }

    try {
      if (registration) {
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          badge: '/icon-96.png',
          vibrate: [200, 100, 200],
          tag: options.tag || 'habit-reminder',
          data: options.data || {},
          requireInteraction: options.requireInteraction || false,
          actions: [
            { action: 'view', title: 'Ver' },
            { action: 'dismiss', title: 'Cerrar' },
          ],
        })
        console.log('[Notifications] Notification shown', options.title)
      } else {
        // Fallback to browser notification
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          tag: options.tag,
          data: options.data,
        })
      }
    } catch (error) {
      console.error('[Notifications] Error showing notification', error)
    }
  }

  // Schedule a notification (simplified - will use server-side scheduling in production)
  const scheduleNotification = (time: Date, options: NotificationOptions): void => {
    const now = new Date()
    const delay = time.getTime() - now.getTime()

    if (delay <= 0) {
      console.warn('[Notifications] Cannot schedule notification in the past')
      return
    }

    console.log(`[Notifications] Scheduling notification in ${Math.round(delay / 1000)}s`)
    
    setTimeout(() => {
      showNotification(options)
    }, delay)
  }

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    registration,
  }
}

// Helper to schedule daily reminder
export function scheduleDailyReminder(hour: number, minute: number, message: string) {
  const now = new Date()
  const scheduledTime = new Date()
  scheduledTime.setHours(hour, minute, 0, 0)

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  return scheduledTime
}

// Helper to get pending habits count
export async function getPendingHabitsCount(): Promise<number> {
  try {
    const response = await fetch('/api/habits', { credentials: 'include' })
    const data = await response.json()
    
    const completionsResponse = await fetch('/api/completions', { credentials: 'include' })
    const completionsData = await completionsResponse.json()
    
    const today = new Date().toISOString().split('T')[0]
    const completedToday = completionsData.completions?.filter((c: any) => c.date === today) || []
    
    return data.habits?.length - completedToday.length || 0
  } catch (error) {
    console.error('[Notifications] Error getting pending habits', error)
    return 0
  }
}

