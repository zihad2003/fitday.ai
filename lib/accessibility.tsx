'use client'

/**
 * Accessibility Utilities
 * Helper functions and hooks for implementing WCAG 2.1 AA compliance
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Trap focus within a modal or dialog
 */
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (!isActive || !containerRef.current) return

        const container = containerRef.current
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Focus first element on mount
        firstElement?.focus()

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement?.focus()
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement?.focus()
                }
            }
        }

        container.addEventListener('keydown', handleTabKey)
        return () => container.removeEventListener('keydown', handleTabKey)
    }, [isActive])

    return containerRef
}

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
        document.body.removeChild(announcement)
    }, 1000)
}

/**
 * Generate unique IDs for form elements
 */
let idCounter = 0
export function useUniqueId(prefix: string = 'id'): string {
    const idRef = useRef<string>()

    if (!idRef.current) {
        idRef.current = `${prefix}-${++idCounter}`
    }

    return idRef.current
}

/**
 * Check if an element has sufficient color contrast
 * Returns true if contrast ratio is >= 4.5:1 (WCAG AA)
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
    const getLuminance = (color: string): number => {
        // Simple RGB extraction (works for hex colors)
        const hex = color.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16) / 255
        const g = parseInt(hex.substr(2, 2), 16) / 255
        const b = parseInt(hex.substr(4, 2), 16) / 255

        const [rs, gs, bs] = [r, g, b].map(c => {
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        })

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

    return ratio >= 4.5
}

/**
 * Skip to main content link (for keyboard navigation)
 */
export function SkipToContent() {
    return (
        <a
            href="#main-content"
            className="skip-to-content"
            aria-label="Skip to main content"
        >
            Skip to main content
        </a>
    )
}

/**
 * Visually hidden but accessible to screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
    return (
        <span className="sr-only">
            {children}
        </span>
    )
}

/**
 * Hook to manage keyboard navigation in lists
 */
export function useKeyboardNavigation(itemCount: number, onSelect: (index: number) => void) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % itemCount)
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount)
                break
            case 'Home':
                e.preventDefault()
                setSelectedIndex(0)
                break
            case 'End':
                e.preventDefault()
                setSelectedIndex(itemCount - 1)
                break
            case 'Enter':
            case ' ':
                e.preventDefault()
                onSelect(selectedIndex)
                break
        }
    }

    return { selectedIndex, setSelectedIndex, handleKeyDown }
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    return prefersReducedMotion
}

/**
 * Format number for screen readers
 */
export function formatForScreenReader(value: number, unit?: string): string {
    const formatted = new Intl.NumberFormat('en-US').format(value)
    return unit ? `${formatted} ${unit}` : formatted
}

