import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Loader2, ArrowRight } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../LanguageContext';

const WorkflowOpt = () => {
    const { t } = useLanguage();
    const [description, setDescription] = useState('');
    const [plan, setPlan] = useState('');
    const [loading, setLoading] = useState(false);
    const [commonWorkflows, setCommonWorkflows] = useState<any[]>([]);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const res = await api.get('/workflows/common');
                setCommonWorkflows(res.data.workflows);
            } catch (err) {
                console.error('Failed to fetch workflows');
            }
        };
        fetchWorkflows();
    }, []);

    const handleOptimize = async () => {
        if (!description.trim() || loading) return;
        setLoading(true);
        try {
            const res = await api.post('/workflow/optimize', {
                task_description: description
            });
            setPlan(res.data.optimization_plan);
        } catch (err) {
            setPlan('Error: Optimization engine offline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-left-4 duration-500">
            <div className="space-y-6">
                <div className="glass-card p-6">
                    <label className="block text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4">Manual Process Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe a manual internal process you want to automate..."
                        className="w-full h-40 bg-slate-900/50 border border-white/5 rounded-xl p-4 text-slate-200 focus:border-indigo-500/50 focus:ring-0 transition-all resize-none mb-6"
                    />
                    <button
                        onClick={handleOptimize}
                        disabled={loading || !description.trim()}
                        className="w-full btn-primary justify-center py-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : t('optimize')}
                        <Zap size={18} className="fill-current" />
                    </button>
                </div>

                <div className="glass-card p-6">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Common Operational Workflows</h4>
                    <div className="space-y-3">
                        {commonWorkflows.map(w => (
                            <div
                                key={w.id}
                                onClick={() => setDescription(`Optimize the ${w.name} process.`)}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all group"
                            >
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{w.name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${w.impact === 'High' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {w.impact}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/5 to-pink-500/5">
                <div className="flex items-center gap-2 mb-6">
                    <Cpu size={20} className="text-indigo-400" />
                    <h3 className="text-xl font-bold">Automation Blueprint</h3>
                </div>

                {plan ? (
                    <div className="animate-in fade-in duration-700">
                        <div className="prose prose-invert max-w-none">
                            {plan.split('\n').map((line, i) => (
                                <p key={i} className="text-slate-300 text-sm leading-relaxed mb-4">{line}</p>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 opacity-30">
                            <ArrowRight size={32} />
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs">Enter a process description to see how GPT-5 suggests automating it using modern tech stacks.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkflowOpt;
