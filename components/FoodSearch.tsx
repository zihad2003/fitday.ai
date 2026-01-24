'use client'

import { useState, useEffect, useRef } from 'react'
import Fuse from 'fuse.js'
import './FoodSearch.css'

interface FoodItem {
    id: string
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
    category?: string
    servingSize?: string
}

// Sample South Asian food database (will be expanded)
const southAsianFoods: FoodItem[] = [
    { id: '1', name: 'Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'Grains', servingSize: '100g' },
    { id: '2', name: 'Roti (Whole Wheat)', calories: 71, protein: 3, carbs: 15, fat: 0.4, category: 'Grains', servingSize: '1 piece' },
    { id: '3', name: 'Dal (Lentils)', calories: 116, protein: 9, carbs: 20, fat: 0.4, category: 'Protein', servingSize: '100g' },
    { id: '4', name: 'Chicken Curry', calories: 165, protein: 25, carbs: 5, fat: 6, category: 'Protein', servingSize: '100g' },
    { id: '5', name: 'Paneer', calories: 265, protein: 18, carbs: 3, fat: 20, category: 'Protein', servingSize: '100g' },
    { id: '6', name: 'Biryani', calories: 200, protein: 8, carbs: 30, fat: 5, category: 'Mixed', servingSize: '100g' },
    { id: '7', name: 'Samosa', calories: 262, protein: 5, carbs: 25, fat: 17, category: 'Snacks', servingSize: '1 piece' },
    { id: '8', name: 'Paratha', calories: 126, protein: 3, carbs: 18, fat: 5, category: 'Grains', servingSize: '1 piece' },
    { id: '9', name: 'Yogurt (Dahi)', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, category: 'Dairy', servingSize: '100g' },
    { id: '10', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'Fruits', servingSize: '1 medium' },
    { id: '11', name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, category: 'Fruits', servingSize: '100g' },
    { id: '12', name: 'Egg (Boiled)', calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'Protein', servingSize: '1 large' },
    { id: '13', name: 'Fish Curry', calories: 130, protein: 20, carbs: 3, fat: 4, category: 'Protein', servingSize: '100g' },
    { id: '14', name: 'Aloo Gobi', calories: 85, protein: 2, carbs: 15, fat: 2, category: 'Vegetables', servingSize: '100g' },
    { id: '15', name: 'Chole (Chickpeas)', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, category: 'Protein', servingSize: '100g' },
]

interface FoodSearchProps {
    onSelect: (food: FoodItem) => void
    placeholder?: string
    className?: string
}

export default function FoodSearch({ onSelect, placeholder = 'Search South Asian foods...', className = '' }: FoodSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<FoodItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

    // Fuse.js configuration
    const fuse = new Fuse(southAsianFoods, {
        keys: ['name', 'category'],
        threshold: 0.3,
        includeScore: true,
    })

    // Search handler
    useEffect(() => {
        if (query.trim() === '') {
            setResults([])
            setIsOpen(false)
            return
        }

        const searchResults = fuse.search(query)
        const items = searchResults.map(r => r.item).slice(0, 8)
        setResults(items)
        setIsOpen(items.length > 0)
        setSelectedIndex(0)
    }, [query])

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % results.length)
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
                break
            case 'Enter':
                e.preventDefault()
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                break
        }
    }

    const handleSelect = (food: FoodItem) => {
        onSelect(food)
        setQuery('')
        setIsOpen(false)
        inputRef.current?.blur()
    }

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={`food-search-container ${className}`} ref={resultsRef}>
            <div className="food-search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && setIsOpen(true)}
                    placeholder={placeholder}
                    className="food-search-input"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('')
                            setIsOpen(false)
                        }}
                        className="clear-button"
                    >
                        ✕
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="food-search-results">
                    {results.map((food, index) => (
                        <div
                            key={food.id}
                            className={`food-result-item ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => handleSelect(food)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="food-info">
                                <div className="food-name">{food.name}</div>
                                <div className="food-meta">
                                    {food.category && <span className="food-category">{food.category}</span>}
                                    <span className="food-serving">{food.servingSize}</span>
                                </div>
                            </div>
                            <div className="food-macros">
                                <div className="macro-item">
                                    <span className="macro-value">{food.calories}</span>
                                    <span className="macro-label">cal</span>
                                </div>
                                <div className="macro-divider">•</div>
                                <div className="macro-item">
                                    <span className="macro-value">{food.protein}g</span>
                                    <span className="macro-label">P</span>
                                </div>
                                <div className="macro-item">
                                    <span className="macro-value">{food.carbs}g</span>
                                    <span className="macro-label">C</span>
                                </div>
                                <div className="macro-item">
                                    <span className="macro-value">{food.fat}g</span>
                                    <span className="macro-label">F</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isOpen && results.length === 0 && query && (
                <div className="food-search-results">
                    <div className="no-results">
                        <span>No foods found for "{query}"</span>
                        <button className="add-custom-food">+ Add Custom Food</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export type { FoodItem }
