'use client'

import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { getExercisesByMuscleGroup, type ExerciseDBItem } from '@/lib/exercise-db'
import './ExerciseSearch.css'

interface ExerciseSearchProps {
    onSelect: (exercise: ExerciseDBItem) => void
    className?: string
}

const muscleGroups = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Arms',
    'Legs',
    'Core',
    'Cardio',
]

const difficulties = ['All', 'Beginner', 'Intermediate', 'Expert']

export default function ExerciseSearch({ onSelect, className = '' }: ExerciseSearchProps) {
    const [query, setQuery] = useState('')
    const [exercises, setExercises] = useState<ExerciseDBItem[]>([])
    const [filteredExercises, setFilteredExercises] = useState<ExerciseDBItem[]>([])
    const [selectedMuscle, setSelectedMuscle] = useState('All')
    const [selectedDifficulty, setSelectedDifficulty] = useState('All')
    const [isLoading, setIsLoading] = useState(true)

    // Load exercises
    useEffect(() => {
        const loadExercises = async () => {
            setIsLoading(true)
            try {
                // Load exercises from all muscle groups
                const allExercises: ExerciseDBItem[] = []
                for (const muscle of muscleGroups) {
                    if (muscle !== 'All') {
                        const exercises = await getExercisesByMuscleGroup(muscle.toLowerCase())
                        allExercises.push(...exercises)
                    }
                }
                setExercises(allExercises)
                setFilteredExercises(allExercises.slice(0, 20))
            } catch (error) {
                console.error('Failed to load exercises:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadExercises()
    }, [])

    // Fuse.js configuration
    const fuse = new Fuse(exercises, {
        keys: ['name', 'primaryMuscles', 'secondaryMuscles', 'equipment'],
        threshold: 0.3,
        includeScore: true,
    })

    // Filter exercises
    useEffect(() => {
        let results = exercises

        // Filter by muscle group
        if (selectedMuscle !== 'All') {
            results = results.filter(ex =>
                ex.primaryMuscles?.some(m => m.toLowerCase().includes(selectedMuscle.toLowerCase())) ||
                ex.category?.toLowerCase().includes(selectedMuscle.toLowerCase())
            )
        }

        // Filter by difficulty
        if (selectedDifficulty !== 'All') {
            results = results.filter(ex =>
                ex.level?.toLowerCase() === selectedDifficulty.toLowerCase()
            )
        }

        // Search query
        if (query.trim()) {
            const searchResults = fuse.search(query)
            results = searchResults.map(r => r.item)
        }

        setFilteredExercises(results.slice(0, 20))
    }, [query, selectedMuscle, selectedDifficulty, exercises])

    return (
        <div className={`exercise-search-container ${className}`}>
            {/* Search Input */}
            <div className="exercise-search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search exercises..."
                    className="exercise-search-input"
                />
                {query && (
                    <button onClick={() => setQuery('')} className="clear-button">
                        ✕
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="exercise-filters">
                <div className="filter-group">
                    <label className="filter-label">Muscle Group</label>
                    <div className="filter-chips">
                        {muscleGroups.map(muscle => (
                            <button
                                key={muscle}
                                onClick={() => setSelectedMuscle(muscle)}
                                className={`filter-chip ${selectedMuscle === muscle ? 'active' : ''}`}
                            >
                                {muscle}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Difficulty</label>
                    <div className="filter-chips">
                        {difficulties.map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`filter-chip ${selectedDifficulty === diff ? 'active' : ''}`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="exercise-results">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading exercises...</p>
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <div className="no-results">
                        <span>No exercises found</span>
                        <p>Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <div className="exercise-grid">
                        {filteredExercises.map((exercise, index) => (
                            <div
                                key={`${exercise.id}-${index}`}
                                className="exercise-card"
                                onClick={() => onSelect(exercise)}
                            >
                                <div className="exercise-image-wrapper">
                                    {exercise.images?.[0] ? (
                                        <img
                                            src={exercise.images[0]}
                                            alt={exercise.name}
                                            className="exercise-image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="exercise-placeholder">💪</div>
                                    )}
                                    {exercise.level && (
                                        <span className={`difficulty-badge ${exercise.level.toLowerCase()}`}>
                                            {exercise.level}
                                        </span>
                                    )}
                                </div>
                                <div className="exercise-info">
                                    <h3 className="exercise-name">{exercise.name}</h3>
                                    <div className="exercise-meta">
                                        {exercise.primaryMuscles?.[0] && (
                                            <span className="muscle-tag">{exercise.primaryMuscles[0]}</span>
                                        )}
                                        {exercise.equipment && (
                                            <span className="equipment-tag">{exercise.equipment}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {filteredExercises.length > 0 && (
                <div className="results-count">
                    Showing {filteredExercises.length} of {exercises.length} exercises
                </div>
            )}
        </div>
    )
}
