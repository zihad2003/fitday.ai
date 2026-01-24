'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { VisuallyHidden } from '@/lib/accessibility'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    loadingText?: string
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
    fullWidth?: boolean
}

/**
 * Accessible Button Component
 * - Proper ARIA attributes
 * - Loading states
 * - Keyboard accessible
 * - Screen reader friendly
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            loadingText = 'Loading...',
            icon,
            iconPosition = 'left',
            fullWidth = false,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading

        return (
            <button
                ref={ref}
                className={`
          accessible-button
          accessible-button--${variant}
          accessible-button--${size}
          ${fullWidth ? 'accessible-button--full' : ''}
          ${loading ? 'accessible-button--loading' : ''}
          ${className}
        `}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-busy={loading}
                {...props}
            >
                {loading && (
                    <>
                        <span className="button-spinner" role="status" aria-hidden="true">
                            <svg className="spinner-icon" viewBox="0 0 24 24">
                                <circle
                                    className="spinner-circle"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    fill="none"
                                    strokeWidth="3"
                                />
                            </svg>
                        </span>
                        <VisuallyHidden>{loadingText}</VisuallyHidden>
                    </>
                )}

                {!loading && icon && iconPosition === 'left' && (
                    <span className="button-icon button-icon--left" aria-hidden="true">
                        {icon}
                    </span>
                )}

                <span className="button-text">{children}</span>

                {!loading && icon && iconPosition === 'right' && (
                    <span className="button-icon button-icon--right" aria-hidden="true">
                        {icon}
                    </span>
                )}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
