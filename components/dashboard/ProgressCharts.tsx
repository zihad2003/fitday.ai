'use client'

import React from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface ProgressChartsProps {
    data: any[]
}

export default function ProgressCharts({ data }: ProgressChartsProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-zinc-950 border border-white/5 rounded-[3rem]">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">
                    Insufficient Data for Pattern Analysis
                </p>
            </div>
        )
    }

    const chartData = data.map(d => ({
        ...d,
        name: format(parseISO(d.date), 'MMM dd'),
        // Calories in thousands for better scaling if needed, or just raw
        cal: d.calories_consumed,
        weight: d.weight_kg,
    }))

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[10px] font-black text-white uppercase italic">{entry.name}:</span>
                            <span className="text-xs font-black font-outfit text-white">{entry.value} {entry.unit}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-12">
            {/* WEIGHT TRAJECTORY */}
            <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                            Physiological Drift
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Weight variance over sync window</p>
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#3f3f46', fontSize: 9, fontWeight: 900 }}
                                minTickGap={30}
                            />
                            <YAxis
                                hide={true}
                                domain={['dataMin - 2', 'dataMax + 2']}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="weight"
                                name="Weight"
                                unit="kg"
                                stroke="#9333ea"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorWeight)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* METABOLIC LOAD CHART */}
            <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                            Metabolic Precision
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Caloric intake vs training intensity</p>
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#3f3f46', fontSize: 9, fontWeight: 900 }}
                                minTickGap={30}
                            />
                            <YAxis hide={true} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', paddingTop: 20 }}
                            />
                            <Line
                                type="stepAfter"
                                dataKey="cal"
                                name="Caloric Intake"
                                unit="kcal"
                                stroke="#f97316"
                                strokeWidth={3}
                                dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={2500}
                            />
                            <Line
                                type="monotone"
                                dataKey="energy_level"
                                name="Energy State"
                                unit="/ 5"
                                stroke="#06b6d4"
                                strokeWidth={3}
                                dot={false}
                                animationDuration={3000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
