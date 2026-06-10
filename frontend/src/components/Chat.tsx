import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext';

const Chat = () => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/chat', { message: userMessage });
            setMessages(prev => [...prev, { role: 'bot', content: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: 'Error: Failed to connect to AI Ops engine.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] animate-in slide-in-from-bottom-4 duration-500">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 pr-2 custom-scrollbar"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <Bot size={48} className="opacity-20" />
                        <p className="text-sm font-medium">{t('chat')} interface ready.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-white/5 border border-white/10 text-slate-200'
                            }`}>
                            <div className="shrink-0">
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-indigo-400" />}
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                            <Loader2 size={18} className="text-indigo-400 animate-spin" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">GPT-5 Reasoning...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 p-2 glass-card flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`${t('chat')}...`}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 px-4 py-2"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Send size={20} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default Chat;
