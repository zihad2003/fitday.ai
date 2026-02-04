'use client'

import { motion, useMotionValue, useTransform, useSpring, MotionValue } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState } from 'react'

/**
 * Magnetic Button - Follows cursor on hover
 */
interface MagneticProps {
    children: ReactNode
    className?: string
    strength?: number
}

export function Magnetic({ children, className = '', strength = 0.3 }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { damping: 20, stiffness: 300 }
    const springX = useSpring(x, springConfig)
    const springY = useSpring(y, springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distanceX = (e.clientX - centerX) * strength
        const distanceY = (e.clientY - centerY) * strength

        x.set(distanceX)
        y.set(distanceY)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Parallax Scroll - Element moves at different speed than scroll
 */
interface ParallaxProps {
    children: ReactNode
    speed?: number
    className?: string
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [elementTop, setElementTop] = useState(0)
    const [clientHeight, setClientHeight] = useState(0)

    const y = useMotionValue(0)

    useEffect(() => {
        if (!ref.current) return

        const onResize = () => {
            setElementTop(ref.current?.getBoundingClientRect().top || 0)
            setClientHeight(window.innerHeight)
        }

        onResize()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        const onScroll = () => {
            const scrolled = window.scrollY
            const parallax = (scrolled - elementTop + clientHeight) * speed
            y.set(parallax)
        }

        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [elementTop, clientHeight, speed, y])

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    )
}

/**
 * Reveal on Scroll - Animates when element enters viewport
 */
interface RevealProps {
    children: ReactNode
    className?: string
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right'
}

export function Reveal({ children, className = '', delay = 0, direction = 'up' }: RevealProps) {
    const directionOffset = {
        up: { y: 40 },
        down: { y: -40 },
        left: { x: 40 },
        right: { x: -40 },
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...directionOffset[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Tilt Card - 3D tilt effect on hover
 */
interface TiltCardProps {
    children: ReactNode
    className?: string
    maxTilt?: number
}

export function TiltCard({ children, className = '', maxTilt = 10 }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt])
    const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5

        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Counter Animation - Animates numbers
 */
interface CounterProps {
    from?: number
    to: number
    duration?: number
    className?: string
    suffix?: string
    prefix?: string
}

export function Counter({ from = 0, to, duration = 2, className = '', suffix = '', prefix = '' }: CounterProps) {
    const count = useMotionValue(from)
    const rounded = useTransform(count, (latest) => Math.round(latest))
    const [displayValue, setDisplayValue] = useState(from)

    useEffect(() => {
        const controls = count.set(to)
        return () => controls
    }, [to, count])

    useEffect(() => {
        const unsubscribe = rounded.on('change', (latest) => {
            setDisplayValue(latest)
        })
        return unsubscribe
    }, [rounded])

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {prefix}{displayValue.toLocaleString()}{suffix}
        </motion.span>
    )
}

/**
 * Ripple Effect - Click ripple animation
 */
interface RippleProps {
    children: ReactNode
    className?: string
    rippleColor?: string
}

export function Ripple({ children, className = '', rippleColor = 'rgba(147, 51, 234, 0.5)' }: RippleProps) {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const newRipple = { x, y, id: Date.now() }
        setRipples([...ripples, newRipple])

        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
        }, 1000)
    }

    return (
        <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
            {children}
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 0,
                        height: 0,
                        backgroundColor: rippleColor,
                    }}
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: 500, height: 500, opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            ))}
        </div>
    )
}

/**
 * Text Reveal - Reveals text character by character
 */
interface TextRevealProps {
    text: string
    className?: string
    delay?: number
    staggerDelay?: number
}

export function TextReveal({ text, className = '', delay = 0, staggerDelay = 0.03 }: TextRevealProps) {
    const letters = text.split('')

    return (
        <motion.span className={className}>
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: delay + index * staggerDelay,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ display: 'inline-block' }}
                >
                    {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
            ))}
        </motion.span>
    )
}

/**
 * Gradient Border - Animated gradient border
 */
interface GradientBorderProps {
    children: ReactNode
    className?: string
    borderWidth?: number
    gradientColors?: string[]
}

export function GradientBorder({
    children,
    className = '',
    borderWidth = 2,
    gradientColors = ['#a855f7', '#ec4899', '#06b6d4']
}: GradientBorderProps) {
    return (
        <motion.div
            className={`relative ${className}`}
            style={{
                background: `linear-gradient(90deg, ${gradientColors.join(', ')})`,
                backgroundSize: '200% 200%',
                padding: borderWidth,
                borderRadius: 'inherit',
            }}
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            <div className="bg-black rounded-[inherit] w-full h-full">
                {children}
            </div>
        </motion.div>
    )
}

/**
 * Floating Element - Continuous floating animation
 */
interface FloatingProps {
    children: ReactNode
    className?: string
    duration?: number
    distance?: number
    delay?: number
}

export function Floating({ children, className = '', duration = 6, distance = 20, delay = 0 }: FloatingProps) {
    return (
        <motion.div
            className={className}
            animate={{
                y: [0, -distance, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
            }}
        >
            {children}
        </motion.div>
    )
}
