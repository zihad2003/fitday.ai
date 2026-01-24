'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import Fuse from 'fuse.js'
import './GlobalSearch.css'

interface SearchItem {
    id: string
    title: string
    description?: string
    category: 'page' | 'exercise' | 'food' | 'action'
    url?: string
    action?: () => void
    icon?: string
}

const searchableItems: SearchItem[] = [
    // Pages
    { id: 'dashboard', title: 'Dashboard', description: 'View your fitness overview', category: 'page', url: '/dashboard', icon: '📊' },
    { id: 'profile', title: 'Profile', description: 'Manage your account', category: 'page', url: '/profile', icon: '👤' },
    { id: 'calendar', title: 'Calendar', description: 'View your schedule', category: 'page', url: '/calendar', icon: '📅' },
    { id: 'activity', title: 'Activity', description: 'Track your progress', category: 'page', url: '/activity', icon: '📈' },
    { id: 'map', title: 'Map', description: 'Find nearby gyms', category: 'page', url: '/map', icon: '🗺️' },
    { id: 'chat', title: 'AI Coach', description: 'Chat with your AI fitness coach', category: 'page', url: '/chat', icon: '💬' },
    { id: 'videos', title: 'Exercise Library', description: 'Browse exercise videos', category: 'page', url: '/videos', icon: '🎥' },

    // Quick Actions
    {
        id: 'logout', title: 'Logout', description: 'Sign out of your account', category: 'action', icon: '🚪', action: () => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login')
        }
    },
]

export default function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [filteredItems, setFilteredItems] = useState<SearchItem[]>(searchableItems)
    const router = useRouter()

    // Fuse.js configuration for fuzzy search
    const fuse = new Fuse(searchableItems, {
        keys: ['title', 'description', 'category'],
        threshold: 0.3,
        includeScore: true,
    })

    // Handle search
    useEffect(() => {
        if (search.trim() === '') {
            setFilteredItems(searchableItems)
        } else {
            const results = fuse.search(search)
            setFilteredItems(results.map(r => r.item))
        }
    }, [search])

    // Keyboard shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const handleSelect = useCallback((item: SearchItem) => {
        setOpen(false)
        setSearch('')

        if (item.action) {
            item.action()
        } else if (item.url) {
            router.push(item.url)
        }
    }, [router])

    if (!open) return null

    return (
        <div className="global-search-overlay" onClick={() => setOpen(false)}>
            <Command className="global-search-command" onClick={(e) => e.stopPropagation()}>
                <div className="search-header">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <Command.Input
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search pages, exercises, foods... (Cmd+K)"
                        className="search-input"
                        autoFocus
                    />
                    <kbd className="search-kbd">ESC</kbd>
                </div>

                <Command.List className="search-list">
                    {filteredItems.length === 0 && (
                        <Command.Empty className="search-empty">
                            No results found for "{search}"
                        </Command.Empty>
                    )}

                    {/* Pages */}
                    {filteredItems.some(item => item.category === 'page') && (
                        <Command.Group heading="Pages" className="search-group">
                            {filteredItems
                                .filter(item => item.category === 'page')
                                .map(item => (
                                    <Command.Item
                                        key={item.id}
                                        value={item.title}
                                        onSelect={() => handleSelect(item)}
                                        className="search-item"
                                    >
                                        <span className="item-icon">{item.icon}</span>
                                        <div className="item-content">
                                            <div className="item-title">{item.title}</div>
                                            {item.description && (
                                                <div className="item-description">{item.description}</div>
                                            )}
                                        </div>
                                    </Command.Item>
                                ))}
                        </Command.Group>
                    )}

                    {/* Actions */}
                    {filteredItems.some(item => item.category === 'action') && (
                        <Command.Group heading="Actions" className="search-group">
                            {filteredItems
                                .filter(item => item.category === 'action')
                                .map(item => (
                                    <Command.Item
                                        key={item.id}
                                        value={item.title}
                                        onSelect={() => handleSelect(item)}
                                        className="search-item"
                                    >
                                        <span className="item-icon">{item.icon}</span>
                                        <div className="item-content">
                                            <div className="item-title">{item.title}</div>
                                            {item.description && (
                                                <div className="item-description">{item.description}</div>
                                            )}
                                        </div>
                                    </Command.Item>
                                ))}
                        </Command.Group>
                    )}

                    {/* Exercises (will be populated dynamically) */}
                    {filteredItems.some(item => item.category === 'exercise') && (
                        <Command.Group heading="Exercises" className="search-group">
                            {filteredItems
                                .filter(item => item.category === 'exercise')
                                .slice(0, 5)
                                .map(item => (
                                    <Command.Item
                                        key={item.id}
                                        value={item.title}
                                        onSelect={() => handleSelect(item)}
                                        className="search-item"
                                    >
                                        <span className="item-icon">{item.icon || '💪'}</span>
                                        <div className="item-content">
                                            <div className="item-title">{item.title}</div>
                                            {item.description && (
                                                <div className="item-description">{item.description}</div>
                                            )}
                                        </div>
                                    </Command.Item>
                                ))}
                        </Command.Group>
                    )}
                </Command.List>

                <div className="search-footer">
                    <div className="footer-shortcuts">
                        <kbd>↑↓</kbd> Navigate
                        <kbd>↵</kbd> Select
                        <kbd>ESC</kbd> Close
                    </div>
                </div>
            </Command>
        </div>
    )
}

// Hook to control the search from anywhere
export function useGlobalSearch() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return { open, setOpen }
}
