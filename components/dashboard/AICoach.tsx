'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Camera, Languages } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function AICoach({ fullHeight = false }: { fullHeight?: boolean }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Greeting sequence complete. I am the FitDay Neural Coach. How may I assist your metabolic evolution today?', sender: 'bot', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEnglish, setIsEnglish] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/coach/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: input, language: isEnglish ? 'en' : 'bn' })
            });

            const data = (await response.json()) as { answer?: string };
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.answer || "Communication error. Re-syncing neural links...",
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex flex-col w-full mx-auto relative overflow-hidden bg-transparent ${fullHeight ? 'h-full' : 'h-[600px]'}`}>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 subtle-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg ${msg.sender === 'user' ? 'bg-purple-600' : 'bg-zinc-900'
                                    }`}>
                                    {msg.sender === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-purple-400" />}
                                </div>
                                <div>
                                    <div className={`p-5 rounded-[1.8rem] text-[13px] leading-relaxed relative ${msg.sender === 'user'
                                            ? 'bg-purple-600/90 text-white rounded-tr-none shadow-[0_10px_25px_rgba(147,51,234,0.2)]'
                                            : 'bg-white/[0.03] text-zinc-300 border border-white/5 rounded-tl-none backdrop-blur-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className={`text-[8px] font-mono text-zinc-700 uppercase mt-1.5 ${msg.sender === 'user' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/5 px-5 py-4 rounded-[1.5rem] rounded-tl-none border border-white/5 flex items-center gap-3">
                            <Loader2 className="w-3 h-3 text-purple-500 animate-spin" />
                            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest font-mono">Synthesizing Response...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 md:p-8 bg-zinc-900/20 border-t border-white/5 relative z-20">
                {/* Language Toggle */}
                <div className="flex justify-center mb-4">
                    <button
                        onClick={() => setIsEnglish(!isEnglish)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all group"
                    >
                        <Languages size={12} className="text-purple-500 group-hover:rotate-12 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-purple-400">
                            {isEnglish ? 'English (Global)' : 'Bengali (Bangla)'}
                        </span>
                    </button>
                </div>

                <div className="relative flex items-center group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isEnglish ? 'Communicate with Neural Coach...' : 'কোচের সাথে কথা বলুন...'}
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl py-5 pl-7 pr-28 text-[13px] text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all font-medium backdrop-blur-xl"
                    />
                    <div className="absolute right-3 flex gap-2">
                        <button className="p-2.5 text-zinc-600 hover:text-purple-400 transition-colors hidden md:block" title="Visual Analysis">
                            <Camera size={20} />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 rounded-xl text-white transition-all shadow-[0_10px_20px_rgba(147,51,234,0.3)] active:scale-95 flex items-center justify-center"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-6 text-[9px] text-zinc-800 font-bold uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-1.5"><Sparkles size={10} className="text-purple-900" /> Powered by Gemini LLM</div>
                    <div className="w-1 h-1 bg-zinc-900 rounded-full" />
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-900 rounded-full" /> Biometric Analysis On</div>
                </div>
            </div>
        </div>
    );
}

