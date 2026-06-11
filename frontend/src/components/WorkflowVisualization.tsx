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

// Mermaid syntax sanitizer
export const sanitizeMermaidSyntax = (chartText: string): string => {
    if (!chartText) return '';
    
    let sanitized = chartText.trim();
    
    // 1. Remove markdown fences (like ```mermaid or ```)
    sanitized = sanitized.replace(/^```mermaid\s*/i, '');
    sanitized = sanitized.replace(/^```\s*/, '');
    sanitized = sanitized.replace(/```$/, '');
    sanitized = sanitized.trim();
    
    // 2. Normalize line breaks
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 3. Ensure a valid flowchart TD prefix exists
    if (!sanitized.match(/^(flowchart|graph)\s+/i)) {
        sanitized = 'flowchart TD\n' + sanitized;
    }
    
    // 4. Sanitize unescaped quotes inside bracket nodes
    sanitized = sanitized.replace(/\["([^"]*)"\]/g, '[$1]'); // Remove outer quotes A["Label"] -> A[Label]
    sanitized = sanitized.replace(/\{"([^"]*)"\}/g, '{$1}'); // Remove outer quotes A{"Label"} -> A{Label}
    sanitized = sanitized.replace(/\("([^"]*)"\)/g, '($1)'); // Remove outer quotes A("Label") -> A(Label)
    
    // Replace remaining double quotes inside label tags with single quotes
    sanitized = sanitized.replace(/\[([^\]]*)"([^\]]*)\]/g, '[$1\'$2]');
    sanitized = sanitized.replace(/\{([^\}]*)"([^\}]*)\}/g, '{$1\'$2}');
    sanitized = sanitized.replace(/\(([^\)]*)"([^\)]*)\)/g, '($1\'$2)');
    
    return sanitized;
};

// Safe fallback chart generator
const getFallbackChart = (title: string): string => {
    return `flowchart TD
    A[Start ${title}] --> B[Review Process]
    B --> C[AI Automation Plan]
    C --> D[Target Achieved]`;
};

// Static HTML fallback if mermaid rendering is fully failing/offline
const getStaticHTMLFallback = (title: string): string => {
    return `<div class="flex flex-col items-center justify-center p-6 space-y-4 w-full bg-slate-950/20 border border-white/5 rounded-xl text-slate-300">
        <div class="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">${title} Visual Process Map</div>
        <div class="flex flex-col items-center space-y-2 w-full max-w-[200px]">
            <div class="w-full text-center py-2 px-3 border border-white/10 bg-slate-900/50 rounded-lg text-xs font-medium">Start</div>
            <div class="text-indigo-400">↓</div>
            <div class="w-full text-center py-2 px-3 border border-white/10 bg-slate-900/50 rounded-lg text-xs font-medium">Process Plan</div>
            <div class="text-indigo-400">↓</div>
            <div class="w-full text-center py-2 px-3 border border-white/10 bg-slate-900/50 rounded-lg text-xs font-medium">Automation</div>
            <div class="text-indigo-400">↓</div>
            <div class="w-full text-center py-2 px-3 border border-white/10 bg-slate-900/50 rounded-lg text-xs font-medium">Complete</div>
        </div>
    </div>`;
};

interface MermaidProps {
    chart: string;
    id: string;
}

const MermaidChart: React.FC<MermaidProps> = ({ chart, id }) => {
    const [svg, setSvg] = useState<string>('');
    const [renderedChart, setRenderedChart] = useState<string>('');
    const [isFallback, setIsFallback] = useState<boolean>(false);

    useEffect(() => {
        setSvg('');
        setRenderedChart(chart);
        setIsFallback(false);
    }, [chart]);

    useEffect(() => {
        if (!renderedChart || renderedChart.trim() === '') return;

        const renderChart = async () => {
            const uniqueSuffix = Math.random().toString(36).substring(2, 9);
            const baseCleanId = `mermaid-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;
            const cleanId = `${baseCleanId}-${uniqueSuffix}`;
            
            // Create temporary container attached to DOM
            const container = document.createElement('div');
            container.id = `${cleanId}-container`;
            container.style.display = 'none';
            document.body.appendChild(container);

            try {
                const { svg: renderedSvg } = await mermaid.render(cleanId, renderedChart, container);
                setSvg(renderedSvg);
            } catch (err) {
                console.error("Mermaid rendering error for chart:", renderedChart, err);
                
                // Cleanup crashed container elements
                const badElement = document.getElementById(cleanId);
                if (badElement) {
                    badElement.remove();
                }

                if (!isFallback) {
                    setIsFallback(true);
                    setRenderedChart(getFallbackChart(id === 'current-workflow' ? 'Current' : 'Optimized'));
                } else {
                    setSvg(getStaticHTMLFallback(id === 'current-workflow' ? 'Current Workflow' : 'Optimized Workflow'));
                }
            } finally {
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
            }
        };

        renderChart();
    }, [renderedChart, id, isFallback]);

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
    // 1. Sanitize Mermaid Syntax
    const sanitizedCurrent = sanitizeMermaidSyntax(currentWorkflow);
    const sanitizedOptimized = sanitizeMermaidSyntax(optimizedWorkflow);

    // 2. Console Diagnostics
    console.log("Current Mermaid:", sanitizedCurrent);
    console.log("Optimized Mermaid:", sanitizedOptimized);

    if (loading) {
        return (
            <div className="glass-card p-8 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Extracting and modeling process visual diagrams...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
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
                        <MermaidChart chart={sanitizedCurrent} id="current-workflow" />
                    </div>

                    {/* Optimized Workflow Column */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <h4 className="text-sm font-bold text-slate-200">Optimized AI & GCP Workflow</h4>
                        </div>
                        <MermaidChart chart={sanitizedOptimized} id="optimized-workflow" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowVisualization;
