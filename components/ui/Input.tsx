'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { useUniqueId } from '@/lib/accessibility'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    helperText?: string
    showLabel?: boolean
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

/**
 * Accessible Input Component
 * - Proper label association
 * - Error handling with ARIA
 * - Helper text support
 * - Required field indication
 * - Screen reader friendly
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            showLabel = true,
            icon,
            iconPosition = 'left',
            required,
            disabled,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = useUniqueId('input')
        const inputId = id || generatedId
        const errorId = `${inputId}-error`
        const helperId = `${inputId}-helper`
        const [isFocused, setIsFocused] = useState(false)

        return (
            <div className={`input-wrapper ${className}`}>
                <label
                    htmlFor={inputId}
                    className={`input-label ${required ? 'required' : ''} ${!showLabel ? 'sr-only' : ''}`}
                >
                    {label}
                </label>

                <div
                    className={`
            input-container
            ${error ? 'input-container--error' : ''}
            ${disabled ? 'input-container--disabled' : ''}
            ${isFocused ? 'input-container--focused' : ''}
          `}
                >
                    {icon && iconPosition === 'left' && (
                        <span className="input-icon input-icon--left" aria-hidden="true">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              accessible-input
              ${icon && iconPosition === 'left' ? 'accessible-input--with-left-icon' : ''}
              ${icon && iconPosition === 'right' ? 'accessible-input--with-right-icon' : ''}
            `}
                        required={required}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? errorId : helperText ? helperId : undefined
                        }
                        aria-required={required}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...props}
                    />

                    {icon && iconPosition === 'right' && (
                        <span className="input-icon input-icon--right" aria-hidden="true">
                            {icon}
                        </span>
                    )}
                </div>

                {error && (
                    <div
                        id={errorId}
                        className="input-error"
                        role="alert"
                        aria-live="polite"
                    >
                        <svg
                            className="error-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5h2v4H7V5zm0 5h2v2H7v-2z"
                                fill="currentColor"
                            />
                        </svg>
                        {error}
                    </div>
                )}

                {!error && helperText && (
                    <div id={helperId} className="input-helper">
                        {helperText}
                    </div>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
