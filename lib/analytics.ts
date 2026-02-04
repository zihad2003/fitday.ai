/**
 * Neural Analytics Engine
 * Client-side utility for logging user behavior and system performance
 */

export const logEvent = async (
    eventName: string,
    featureName?: string,
    metadata?: any
) => {
    try {
        // Optimized for performance: don't block UI
        fetch('/api/analytics/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: eventName,
                feature_name: featureName,
                event_metadata: metadata,
                url: typeof window !== 'undefined' ? window.location.href : null
            })
        }).catch(err => console.debug('Analytics failed silently', err))
    } catch (e) {
        // Silent fail to ensure app stability
    }
}

/**
 * Premade event helpers for consistency
 */
export const Analytics = {
    trackPageView: (url: string) => logEvent('page_view', undefined, { url }),

    trackFeatureUsage: (feature: string, action: string, data?: any) =>
        logEvent('feature_used', feature, { action, ...data }),

    trackInteraction: (elementId: string, metadata?: any) =>
        logEvent('interaction', undefined, { elementId, ...metadata }),

    trackProtocolExecution: (protocolType: string, status: string) =>
        logEvent('protocol_execution', protocolType, { status }),

    trackConversion: (goalType: string, value?: number) =>
        logEvent('conversion', goalType, { value })
}
