"use client";

import { useEffect, useState } from 'react';

export function useServiceWorker() {
    const [isSupported, setIsSupported] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // Check if service workers are supported
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);

            // Check current notification permission
            setNotificationPermission(Notification.permission);

            // Register service worker
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration.scope);
                    setIsRegistered(true);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    const requestNotificationPermission = async (): Promise<boolean> => {
        if (!isSupported) return false;

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            return permission === 'granted';
        } catch (error) {
            console.error('Notification permission request failed:', error);
            return false;
        }
    };

    const scheduleLocalNotification = (title: string, body: string, delayMs: number = 0) => {
        if (notificationPermission !== 'granted') return;

        setTimeout(() => {
            new Notification(title, {
                body,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                dir: 'rtl',
                lang: 'he'
            });
        }, delayMs);
    };

    return {
        isSupported,
        isRegistered,
        notificationPermission,
        requestNotificationPermission,
        scheduleLocalNotification
    };
}
