import React, { useState } from 'react';
import {
    FileText,
    Cpu,
    MessageSquare,
    BarChart3,
    Settings,
    Languages,
    ArrowRight,
    Zap,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from './LanguageContext';
import Chat from './components/Chat';
import DocAnalysis from './components/DocAnalysis';
import WorkflowOpt from './components/WorkflowOpt';

const Dashboard = () => {
    const { lang, setLang, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'docs', label: t('docAnalysis'), icon: FileText },
        { id: 'workflow', label: t('workflowOpt'), icon: Cpu },
        { id: 'chat', label: t('chat'), icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen flex text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl flex flex-col p-4 fixed h-full z-10">
                <div className="flex items-center gap-3 px-4 py-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{t('title')}</h1>
                        <p className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">Global Ops Hub</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 mt-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                                ? 'bg-white/5 text-white shadow-inner border border-white/5'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-indigo-400' : ''} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-2 p-4">
                    <button
                        onClick={() => setLang(lang === 'en' ? 'jp' : 'en')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <Languages size={18} className="text-slate-400 group-hover:text-indigo-400" />
                            <span className="text-sm font-medium">{lang === 'en' ? 'English' : '日本語'}</span>
                        </div>
                        <Globe size={14} className="text-slate-500" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

                <header className="flex justify-between items-end mb-12 relative">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 pulse-status shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] font-bold text-emerald-500 tracking-[0.2em] uppercase">Engine Online</span>
                        </div>
                        <h2 className="text-5xl font-bold text-white tracking-tight mb-2">{t('subtitle')}</h2>
                        <p className="text-slate-400 max-w-2xl text-lg font-light">{t('heroDesc')}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-right"
                    >
                        <p className="text-[10px] text-indigo-400 font-bold tracking-[0.3em] uppercase mb-2">{t('mission')}</p>
                        <div className="h-1 w-48 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 bg-[length:200%_auto] animate-gradient rounded-full" />
                    </motion.div>
                </header>

                {/* Overview Stats */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Processes Optimized', value: '42', icon: Cpu, color: 'text-indigo-400' },
                                { label: 'Documents Processed', value: '1,284', icon: FileText, color: 'text-pink-400' },
                                { label: t('efficiencyTitle'), value: '+35%', icon: BarChart3, color: 'text-emerald-400' },
                            ].map((stat, i) => (
                                <div key={i} className="glass-card p-6 flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                                        <stat.icon size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h4>
                                        <span className="text-3xl font-bold text-white">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="glass-card p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Zap className="text-indigo-400" size={20} />
                                        Active Automations
                                    </h3>
                                    <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group">
                                        VIEW ALL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Internal Onboarding Bot', status: 'Active', time: 'Saved 12h/week' },
                                        { name: 'SaaS Spend Optimizer', status: 'Analysis', time: 'ROI 150%' },
                                        { name: 'Github PR Reviewer', status: 'Active', time: '98% Coverage' },
                                    ].map((job, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="font-medium">{job.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-indigo-400">{job.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border-indigo-500/20">
                                <h3 className="text-xl font-bold mb-4">{t('efficiencyTitle')}</h3>
                                <p className="text-slate-400 text-sm mb-6">{t('efficiencyDesc')}</p>
                                <div className="flex items-end gap-2 h-40">
                                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                        <div key={i} className="flex-1 space-y-2 group">
                                            <div
                                                className="w-full bg-gradient-to-t from-indigo-500/50 to-pink-500/50 rounded-t-lg transition-all duration-500 hover:from-indigo-400 hover:to-pink-400 cursor-help"
                                                style={{ height: `${h}%` }}
                                            ></div>
                                            <div className="text-[10px] text-slate-500 text-center font-bold">W{i + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tool Sections */}
                {activeTab === 'docs' && <DocAnalysis />}
                {activeTab === 'workflow' && <WorkflowOpt />}
                {activeTab === 'chat' && (
                    <div className="max-w-4xl mx-auto">
                        <Chat />
                    </div>
                )}
            </main>
        </div>
    );
};

const App = () => {
    return (
        <LanguageProvider>
            <Dashboard />
        </LanguageProvider>
    );
};

export default App;
