import React from 'react';
import {
    AlertTriangle,
    BadgeDollarSign,
    CheckCircle2,
    ClipboardList,
    ShieldAlert,
    TrendingUp
} from 'lucide-react';
import { WorkflowVisualization, ProcessVisualization, Bottleneck } from './WorkflowVisualization';

export type RiskSeverity = 'Low' | 'Medium' | 'High' | string;

export interface ProcessRisk {
    title: string;
    severity: RiskSeverity;
    explanation: string;
    mitigation: string;
}

export interface ProcessIntelligence {
    executive_insights?: {
        top_findings?: string[];
        top_risks?: string[];
        top_recommendations?: string[];
    };
    risks?: ProcessRisk[];
    roi?: {
        process_steps?: string;
        potential_step_reduction?: string;
        estimated_time_savings?: string;
        productivity_improvement?: string;
        operational_cost_reduction?: string;
        hours_saved?: string;
        efficiency_improvement_percent?: string;
        estimated_annual_cost_savings?: string;
        assumptions?: string[];
    };
}

interface ProcessIntelligencePanelProps {
    intelligence?: ProcessIntelligence | null;
    visualization?: ProcessVisualization | null;
}

const severityStyles: Record<string, string> = {
    low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    high: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const normalizeList = (items?: string[]) => (items || []).filter(Boolean).slice(0, 3);

const severityClass = (severity?: string) => severityStyles[(severity || '').toLowerCase()] || severityStyles.medium;

const MetricCard = ({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value?: string;
    icon: React.ElementType;
}) => (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 min-h-[112px]">
        <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
            <Icon size={18} className="text-indigo-300" />
        </div>
        <p className="text-xl font-bold text-white leading-tight">{value || 'Estimate unavailable'}</p>
    </div>
);

const InsightList = ({
    title,
    items,
    icon: Icon,
}: {
    title: string;
    items: string[];
    icon: React.ElementType;
}) => (
    <div className="bg-slate-950/40 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
            <Icon size={16} className="text-indigo-300" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h4>
        </div>
        <div className="space-y-2">
            {items.length > 0 ? items.map((item, index) => (
                <div key={`${title}-${index}`} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                </div>
            )) : (
                <p className="text-sm text-slate-500">No insight generated.</p>
            )}
        </div>
    </div>
);

const ProcessIntelligencePanel = ({ intelligence, visualization }: ProcessIntelligencePanelProps) => {
    if (!intelligence) {
        return null;
    }

    const executive = intelligence.executive_insights || {};
    const risks = intelligence.risks || [];
    const roi = intelligence.roi || {};
    const assumptions = roi.assumptions || [];

    return (
        <section className="space-y-6">
            {/* 1. Executive Insights */}
            <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/10 via-white/[0.02] to-emerald-500/10 border-indigo-500/20">
                <div className="flex flex-col gap-2 mb-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-300 mb-2">Executive Insights</p>
                        <h3 className="text-2xl font-bold text-white">Process Intelligence Snapshot</h3>
                    </div>
                    <span className="text-xs text-slate-400">AI-generated estimates for business planning</span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <InsightList title="Top Findings" items={normalizeList(executive.top_findings)} icon={ClipboardList} />
                    <InsightList title="Top Risks" items={normalizeList(executive.top_risks)} icon={ShieldAlert} />
                    <InsightList title="Recommendations" items={normalizeList(executive.top_recommendations)} icon={CheckCircle2} />
                </div>
            </div>

            {/* 2. Risk Assessment */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <AlertTriangle size={20} className="text-amber-300" />
                    <h3 className="text-xl font-bold text-white">Risk Assessment</h3>
                </div>
                <div className="space-y-3">
                    {risks.length > 0 ? risks.map((risk, index) => (
                        <article key={`${risk.title}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                            <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="font-bold text-white">{risk.title || 'Operational Risk'}</h4>
                                <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${severityClass(risk.severity)}`}>
                                    {risk.severity || 'Medium'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed mb-3">{risk.explanation || 'No explanation generated.'}</p>
                            <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1">Suggested Mitigation</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{risk.mitigation || 'Assign an owner and define the next control step.'}</p>
                            </div>
                        </article>
                    )) : (
                        <p className="text-sm text-slate-500">No risks generated.</p>
                    )}
                </div>
            </div>

            {/* 3. ROI & Efficiency Analysis */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <BadgeDollarSign size={20} className="text-emerald-300" />
                    <h3 className="text-xl font-bold text-white">ROI & Efficiency Analysis</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <MetricCard label="Process Steps" value={roi.process_steps} icon={ClipboardList} />
                    <MetricCard label="Step Reduction" value={roi.potential_step_reduction} icon={TrendingUp} />
                    <MetricCard label="Hours Saved" value={roi.hours_saved || roi.estimated_time_savings} icon={CheckCircle2} />
                    <MetricCard label="Efficiency Gain" value={roi.efficiency_improvement_percent || roi.productivity_improvement} icon={TrendingUp} />
                    <MetricCard label="Cost Reduction" value={roi.estimated_annual_cost_savings || roi.operational_cost_reduction} icon={BadgeDollarSign} />
                    <MetricCard label="Productivity" value={roi.productivity_improvement} icon={TrendingUp} />
                </div>
                {assumptions.length > 0 && (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Estimate Assumptions</p>
                        <div className="space-y-1">
                            {assumptions.map((assumption, index) => (
                                <p key={index} className="text-xs text-slate-400 leading-relaxed">{assumption}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Workflow Visualization */}
            {visualization && (
                <WorkflowVisualization 
                    currentWorkflow={visualization.current_workflow} 
                    optimizedWorkflow={visualization.optimized_workflow} 
                />
            )}

            {/* 5. Bottleneck Analysis */}
            {visualization?.bottlenecks && visualization.bottlenecks.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <AlertTriangle size={20} className="text-rose-400" />
                        <h3 className="text-xl font-bold text-white">Bottleneck Highlights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {visualization.bottlenecks.map((bottleneck: Bottleneck, index: number) => (
                            <div key={`${bottleneck.name}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/30 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="font-bold text-white text-sm leading-tight">{bottleneck.name}</h4>
                                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityClass(bottleneck.risk_level)}`}>
                                            {bottleneck.risk_level}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">
                                        Type: {bottleneck.type || 'Operational'}
                                    </p>
                                </div>
                                <div className="mt-3 rounded-lg bg-white/[0.03] border border-white/5 p-3">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-1">AI Recommendation</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{bottleneck.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProcessIntelligencePanel;
