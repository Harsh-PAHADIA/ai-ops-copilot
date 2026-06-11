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

// 7. Verify Mermaid initialization
mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'dark',
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

// Interface for parsed steps
interface ParsedNode {
    id: string;
    label: string;
    type: 'process' | 'decision' | 'start' | 'end';
}

// Robust parsing of Mermaid flowchart to steps
const parseMermaidToSteps = (mermaidText: string): ParsedNode[] => {
    if (!mermaidText) return [];
    
    const steps: ParsedNode[] = [];
    const lines = mermaidText.split('\n');
    const seenIds = new Set<string>();
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('flowchart') || trimmed.startsWith('graph')) {
            continue;
        }
        
        // Match A[Label], A{Label}, A(Label), A["Label"] etc. globally per line
        const nodeRegex = /(\w+)\s*(?:\["([^"]+)"\]|\[([^\]]+)\]|\{"([^"]+)"\}|\{([^\}]+)\}|\("([^"]+)"\)|\(([^\)]+)\))/g;
        let match;
        while ((match = nodeRegex.exec(trimmed)) !== null) {
            const id = match[1];
            if (!seenIds.has(id)) {
                const label = match[2] || match[3] || match[4] || match[5] || match[6] || match[7] || id;
                let type: 'process' | 'decision' | 'start' | 'end' = 'process';
                
                if (match[0].includes('{')) {
                    type = 'decision';
                } else if (label.toLowerCase() === 'start') {
                    type = 'start';
                } else if (label.toLowerCase() === 'end' || label.toLowerCase() === 'complete' || label.toLowerCase() === 'finish') {
                    type = 'end';
                }
                
                steps.push({ id, label, type });
                seenIds.add(id);
            }
        }
    }
    
    // Fallback simple scanner if regex fails to yield nodes
    if (steps.length === 0) {
        const bracketRegex = /\[([^\]]+)\]/g;
        let match;
        let count = 1;
        while ((match = bracketRegex.exec(mermaidText)) !== null) {
            steps.push({
                id: `step-${count++}`,
                label: match[1],
                type: 'process'
            });
        }
    }
    
    return steps;
};

// 9. Display workflow as HTML process cards if Mermaid SVG render fails
const HTMLProcessMap: React.FC<{ chartText: string; title: string }> = ({ chartText, title }) => {
    const steps = parseMermaidToSteps(chartText);
    
    if (steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/20 border border-white/5 rounded-xl text-slate-400">
                <p className="text-xs italic">No process steps found to render.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center space-y-4 w-full p-6 bg-slate-950/20 rounded-xl border border-white/5 shadow-inner">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">{title} Visual Process Map</div>
            <div className="flex flex-col items-center w-full space-y-2 max-w-md">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {index > 0 && (
                            <div className="flex flex-col items-center justify-center py-1">
                                <span className="text-indigo-400 font-bold text-lg animate-bounce">↓</span>
                            </div>
                        )}
                        <div className={`w-full p-4 border rounded-xl flex items-center justify-between gap-3 transition-all hover:border-indigo-500/20 ${
                            step.type === 'decision'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                : step.type === 'start' || step.type === 'end'
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                                : 'bg-slate-900/50 border-white/10 text-slate-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    step.type === 'decision'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-indigo-500/20 text-indigo-300'
                                }`}>
                                    {index + 1}
                                </span>
                                <span className="text-xs font-semibold leading-relaxed">{step.label}</span>
                            </div>
                            {step.type === 'decision' && (
                                <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0">
                                    Decision
                                </span>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

interface MermaidProps {
    chart: string;
    id: string;
}

const MermaidChart: React.FC<MermaidProps> = ({ chart, id }) => {
    const [svg, setSvg] = useState<string>('');
    const [renderedChart, setRenderedChart] = useState<string>('');
    const [isFallback, setIsFallback] = useState<boolean>(false);
    const [useHTMLFallback, setUseHTMLFallback] = useState<boolean>(false);

    useEffect(() => {
        setSvg('');
        setRenderedChart(chart);
        setIsFallback(false);
        setUseHTMLFallback(false);
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
            
            // 6. Verify container dimensions: width > 0, height > 0, overflow visible (not display: none)
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            container.style.width = '800px';
            container.style.height = '600px';
            container.style.overflow = 'visible';
            container.style.visibility = 'hidden';
            
            document.body.appendChild(container);

            try {
                // 3. Verify that Mermaid receives valid graph definitions
                console.log(`[Mermaid] Rendering ${id} using definition:`, renderedChart);
                
                const { svg: renderedSvg } = await mermaid.render(cleanId, renderedChart, container);
                
                // 4. After mermaid.render(), log generated SVG length
                console.log(`[Mermaid] SVG generated for ${id}. Length:`, renderedSvg ? renderedSvg.length : 0);
                
                if (renderedSvg && renderedSvg.length > 0) {
                    // 5. Confirm that generated SVG is actually inserted into container
                    container.innerHTML = renderedSvg;
                    console.log(`[Mermaid] SVG successfully inserted into container for ${id}`);
                    setSvg(renderedSvg);
                } else {
                    throw new Error("Rendered SVG is empty");
                }
            } catch (err) {
                // 1. Inspect browser console for Mermaid runtime errors
                console.error(`[Mermaid] Runtime rendering error for ${id}:`, err);
                
                // Cleanup crashed container elements from DOM
                const badElement = document.getElementById(cleanId);
                if (badElement) {
                    badElement.remove();
                }

                if (!isFallback) {
                    setIsFallback(true);
                    setRenderedChart(getFallbackChart(id === 'current-workflow' ? 'Current' : 'Optimized'));
                } else {
                    // 9. If fallback rendering also fails, use HTML process card fallback
                    setUseHTMLFallback(true);
                }
            } finally {
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
            }
        };

        renderChart();
    }, [renderedChart, id, isFallback]);

    if (useHTMLFallback) {
        return <HTMLProcessMap chartText={chart} title={id === 'current-workflow' ? 'Current' : 'Optimized'} />;
    }

    if (!svg) {
        return (
            <div className="flex items-center justify-center p-8 bg-slate-900/30 border border-white/5 rounded-xl text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-indigo-400 border-t-transparent animate-spin" />
                    <span>Generating visualization...</span>
                </div>
            </div>
        );
    }

    // 8. If SVG generation succeeds, force render using dangerouslySetInnerHTML and override CSS
    return (
        <div className="w-full">
            <style dangerouslySetInnerHTML={{ __html: `
                .mermaid-svg svg {
                    max-width: 100% !important;
                    height: auto !important;
                    display: block;
                    margin: 0 auto;
                }
            `}} />
            <div 
                className="mermaid-svg flex justify-center w-full overflow-x-auto p-4 bg-slate-950/20 rounded-xl border border-white/5 shadow-inner"
                dangerouslySetInnerHTML={{ __html: svg }} 
            />
        </div>
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

    // 2. Log exact requested visualization structure
    const visualization = {
        current: currentWorkflow,
        optimized: optimizedWorkflow
    };
    console.log("Current visualization:", visualization.current);
    console.log("Optimized visualization:", visualization.optimized);

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
