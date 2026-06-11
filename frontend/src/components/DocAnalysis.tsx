import React, { useState } from 'react';
import { FileText, Search, Loader2, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../LanguageContext';
import ProcessIntelligencePanel, { ProcessIntelligence } from './ProcessIntelligencePanel';

interface SensitiveItem {
    finding: string;
    type: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical' | string;
    recommendation: string;
}

interface TaskItem {
    task: string;
    owner?: string;
}

const renderSensitivityResults = (jsonText: string) => {
    try {
        const items: SensitiveItem[] = JSON.parse(jsonText);
        if (!Array.isArray(items)) throw new Error("Not an array");

        const severityBadgeColor = (severity: string) => {
            switch ((severity || '').toLowerCase()) {
                case 'critical':
                    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
                case 'high':
                    return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
                case 'medium':
                    return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                case 'low':
                    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                default:
                    return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
            }
        };

        return (
            <div className="space-y-4 animate-in fade-in duration-700 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {items.length > 0 ? items.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                                {item.type}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityBadgeColor(item.severity)}`}>
                                {item.severity}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200">{item.finding}</p>
                        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Recommendation</p>
                            <p className="text-xs text-slate-300 leading-relaxed">{item.recommendation}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-slate-500 italic">No sensitive items or policy risks detected.</p>
                )}
            </div>
        );
    } catch (e) {
        return (
            <div className="animate-in fade-in duration-700">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{jsonText}</p>
            </div>
        );
    }
};

const renderTaskResults = (jsonText: string) => {
    try {
        const items: TaskItem[] = JSON.parse(jsonText);
        if (!Array.isArray(items)) throw new Error("Not an array");

        return (
            <div className="space-y-3 animate-in fade-in duration-700 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {items.length > 0 ? items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-indigo-500/50 bg-indigo-500/10 text-indigo-400 text-xs font-bold">
                            {idx + 1}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-slate-200 leading-relaxed">{item.task}</p>
                            {item.owner && (
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                    Owner: <span className="text-indigo-300">{item.owner}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-slate-500 italic">No actionable tasks extracted.</p>
                )}
            </div>
        );
    } catch (e) {
        return (
            <div className="animate-in fade-in duration-700">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{jsonText}</p>
            </div>
        );
    }
};

const DocAnalysis = () => {
    const { t } = useLanguage();
    const [content, setContent] = useState('');
    const [result, setResult] = useState('');
    const [intelligence, setIntelligence] = useState<ProcessIntelligence | null>(null);
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
    setIntelligence(null);

    try {
        const res = await api.post(
            '/document/analyze',
            {
                content,
                action: activeMode
            }
        );

        console.log("Response:", res.data);
        setResult(res.data.analysis);
        setIntelligence(res.data.intelligence || null);

    } catch (err: any) {
        console.error("API Error:", err);
        setIntelligence(null);
        setResult(
            `Error: ${
                err?.response?.data?.detail ||
                err?.message ||
                "Analysis engine unreachable."
            }`
        );
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
                        activeMode === 'analyze_sentiment' ? (
                            renderSensitivityResults(result)
                        ) : activeMode === 'extract_tasks' ? (
                            renderTaskResults(result)
                        ) : (
                            <div className="animate-in fade-in duration-700">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result}</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4 py-20">
                            <FileText size={48} className="opacity-10" />
                            <p className="text-sm font-medium italic">Waiting for analysis trigger...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <ProcessIntelligencePanel intelligence={intelligence} />
            </div>
        </div>
    );
};

export default DocAnalysis;
