import React, { useState } from 'react';
import { FileText, Search, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext';

const DocAnalysis = () => {
    const { t } = useLanguage();
    const [content, setContent] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeMode, setActiveMode] = useState('summarize');

    const modes = [
        { id: 'summarize', label: 'Summarize', icon: FileText },
        { id: 'extract_tasks', label: 'Tasks', icon: CheckCircle2 },
        { id: 'analyze_sentiment', label: 'Sensitivity', icon: Search }
    ];

    const handleAnalyze = async () => {
        if (!content.trim() || loading) return;
        setLoading(true);
      try {
          const res = await axios.post(
             'https://ai-ops-copilot-backend.onrender.com/document/analyze',
        {
            content,
            action: activeMode
        }
    );
            setResult(res.data.analysis);
        } catch (err) {
            setResult('Error: Analysis engine unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
                <div className="glass-card p-6">
                    <label className="block text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4">Internal Document Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste document text here..."
                        className="w-full h-64 bg-slate-900/50 border border-white/5 rounded-xl p-4 text-slate-200 focus:border-indigo-500/50 focus:ring-0 transition-all resize-none"
                    />
                    <div className="mt-6 flex flex-wrap gap-2">
                        {modes.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setActiveMode(mode.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${activeMode === mode.id
                                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <mode.icon size={16} />
                                <span className="text-sm">{mode.label}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !content.trim()}
                        className="w-full mt-6 btn-primary justify-center py-4 text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : t('analyze')}
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="glass-card p-8 bg-slate-900/30">
                <label className="block text-xs font-bold text-pink-400 tracking-widest uppercase mb-6">AI Insight Strategy</label>
                <div className="min-h-[300px] prose prose-invert max-w-none">
                    {result ? (
                        <div className="animate-in fade-in duration-700">
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4 py-20">
                            <FileText size={48} className="opacity-10" />
                            <p className="text-sm font-medium italic">Waiting for analysis trigger...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocAnalysis;
