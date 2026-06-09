import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'jp';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        title: 'AI Ops Copilot',
        subtitle: 'Accelerating Internal Efficiency',
        mission: 'Maximize the value of people through data',
        docAnalysis: 'Document Analysis',
        workflowOpt: 'Workflow Optimization',
        chat: 'Internal AI Chat',
        analyze: 'Analyze',
        optimize: 'Optimize',
        send: 'Send message',
        efficiencyTitle: 'Efficiency Gained',
        efficiencyDesc: 'Global operational impact across departments',
        heroDesc: 'An intelligent companion for Corporate Engineers, designed to automate the mundane and elevate the mission.'
    },
    jp: {
        title: 'AI Ops コパイロット',
        subtitle: '社内業務効率を加速',
        mission: 'データによって人の価値を最大化する',
        docAnalysis: 'ドキュメント分析',
        workflowOpt: 'ワークフロー最適化',
        chat: '社内AIチャット',
        analyze: '分析する',
        optimize: '最適化する',
        send: 'メッセージを送信',
        efficiencyTitle: '向上した効率性',
        efficiencyDesc: '全部署にわたるグローバルな業務への影響',
        heroDesc: 'コーポレートエンジニア向けのインテリジェントなアシスタント。日常業務を自動化し、ミッションを支援します。'
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLang] = useState<Language>('en');

    const t = (key: string) => translations[lang][key] || key;

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
