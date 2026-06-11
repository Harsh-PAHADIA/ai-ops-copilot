import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

export interface Bottleneck {
    name: string;
    type: 'high-risk' | 'approval' | 'compliance' | string;
    risk_level: 'Low' | 'Medium' | 'High' | string;
    recommendation: string;
}

export interface ProcessVisualization {
    current_workflow?: string;
    optimized_workflow?: string;
    bottlenecks?: Bottleneck[];
}

// Initialize mermaid configurations
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
    },
    themeVariables: {
        background: 'transparent',
        primaryColor: '#6366f1', // Indigo 500
        primaryTextColor: '#f8fafc', // Slate 50
        primaryBorderColor: 'rgba(255,255,255,0.1)',
        lineColor: '#818cf8', // Indigo 400
        secondaryColor: '#ec4899', // Pink 500
        tertiaryColor: '#1e293b', // Slate 800
    }
});

interface MermaidProps {
    chart: string;
    id: string;
}

const MermaidChart: React.FC<MermaidProps> = ({ chart, id }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        setSvg('');
        setError(false);
        if (!chart || chart.trim() === '') return;

        const renderChart = async () => {
            try {
                // Ensure a safe, alphanumeric ID for rendering
                const cleanId = `mermaid-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const { svg: renderedSvg } = await mermaid.render(cleanId, chart);
                setSvg(renderedSvg);
            } catch (err) {
                console.error("Mermaid rendering error:", err);
                setError(true);
                // Clean up elements that mermaid leaves in the DOM upon crash
                const badElement = document.getElementById(`mermaid-${id.replace(/[^a-zA-Z0-9]/g, '-')}`);
                if (badElement) {
                    badElement.remove();
                }
            }
        };

        renderChart();
    }, [chart, id]);

    if (error) {
        return (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs font-mono leading-relaxed">
                Failed to render workflow diagram. Dynamic syntax check failed.
            </div>
        );
    }

    if (!chart || chart.trim() === '') {
        return (
            <div className="flex items-center justify-center p-6 bg-slate-900/30 border border-white/5 rounded-xl text-slate-500 text-xs italic">
                No workflow diagram generated.
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="flex items-center justify-center p-8 bg-slate-900/30 border border-white/5 rounded-xl text-slate-400 text-xs">
                Generating visualization...
            </div>
        );
    }

    return (
        <div 
            className="mermaid-svg flex justify-center w-full overflow-x-auto p-4 bg-slate-950/20 rounded-xl border border-white/5 shadow-inner"
            dangerouslySetInnerHTML={{ __html: svg }} 
        />
    );
};

interface WorkflowVisualizationProps {
    currentWorkflow?: string;
    optimizedWorkflow?: string;
    loading?: boolean;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({
    currentWorkflow = '',
    optimizedWorkflow = '',
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="glass-card p-8 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Extracting and modeling process visual diagrams...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 bg-slate-900/40">
                <div className="mb-4">
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-300 mb-1">Process Comparison</p>
                    <h3 className="text-xl font-bold text-white">Workflow Map Comparison</h3>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Current Workflow Column */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            <h4 className="text-sm font-bold text-slate-200">Current Manual Workflow</h4>
                        </div>
                        <MermaidChart chart={currentWorkflow} id="current-workflow" />
                    </div>

                    {/* Optimized Workflow Column */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <h4 className="text-sm font-bold text-slate-200">Optimized AI & GCP Workflow</h4>
                        </div>
                        <MermaidChart chart={optimizedWorkflow} id="optimized-workflow" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowVisualization;
