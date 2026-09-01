import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LiveEvaluator } from './components/LiveEvaluator';
import { CalibrationMatrix } from './components/CalibrationMatrix';
import { RubricViewer } from './components/RubricViewer';
import { TestCasesViewer } from './components/TestCasesViewer';
import { EconomicsCalculator } from './components/EconomicsCalculator';
import { GovernanceViewer } from './components/GovernanceViewer';
import { HeadToHeadComparator } from './components/HeadToHeadComparator';
import { BatchEvaluator } from './components/BatchEvaluator';
import { Scale, Heart, Github, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('evaluador');
  const [health, setHealth] = useState<{ has_gemini_key: boolean; has_github_token: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error('Health check error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        hasGeminiKey={health?.has_gemini_key ?? false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'evaluador' && <LiveEvaluator />}
        {activeTab === 'batch' && <BatchEvaluator />}
        {activeTab === 'comparador' && <HeadToHeadComparator />}
        {activeTab === 'calibracion' && <CalibrationMatrix />}
        {activeTab === 'rubrica' && <RubricViewer />}
        {activeTab === 'casos' && <TestCasesViewer />}
        {activeTab === 'economia' && <EconomicsCalculator />}
        {activeTab === 'gobernanza' && <GovernanceViewer />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">El Agente Evaluador · Rúbrica v5</span>
            <span className="text-slate-600">|</span>
            <span>MBA UCEMA · Programación con Agentes de IA</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">
              Prof. Alfredo B. Roisenzvit · Martín Pérez
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
