'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Camera } from 'lucide-react';
import { t } from '@/lib/food-data';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function AICoach() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hello! I am your FitDay AI Coach. How can I help you today?', sender: 'bot', timestamp: new Date() }
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
                body: JSON.stringify({ question: input })
            });

            const data = (await response.json()) as { answer?: string };
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.answer || "I'm sorry, I couldn't process that. Please try again.",
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
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Bot className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">FitDay AI Coach</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-emerald-100 text-xs">Online & Ready</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsEnglish(!isEnglish)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
                >
                    {isEnglish ? 'বাংলা' : 'English'}
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-teal-500' : 'bg-gray-700'
                                    }`}>
                                    {msg.sender === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-teal-600 text-white rounded-tr-none'
                                    : 'bg-white/10 text-white border border-white/5 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                            <span className="text-white/60 text-xs">Coach is thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 pt-2">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isEnglish ? 'Ask about your calories or food...' : 'আপনার ক্যালোরি বা খাবার সম্পর্কে জিজ্ঞাসা করুন...'}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-24 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                    />
                    <div className="absolute right-2 flex gap-1">
                        <button className="p-2 text-white/40 hover:text-white transition-colors">
                            <Camera size={20} />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:hover:bg-teal-500 rounded-xl text-white transition-all shadow-lg shadow-teal-500/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-white/20 uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1"><Sparkles size={10} /> Powered by Gemini 1.5</span>
                    <span>•</span>
                    <span>Bangla Language Support</span>
                </div>
            </div>
        </div>
    );
}
