import React from 'react';
import { 
  Scale, 
  Play, 
  BarChart3, 
  BookOpen, 
  Layers, 
  DollarSign, 
  ShieldCheck,
  Sparkles,
  Github,
  GitCompare,
  ListOrdered
} from 'lucide-react';

export type ActiveTab = 'evaluador' | 'batch' | 'comparador' | 'calibracion' | 'rubrica' | 'casos' | 'economia' | 'gobernanza';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, hasGeminiKey }) => {
  const tabs = [
    { id: 'evaluador' as ActiveTab, label: 'Evaluador en Vivo', icon: Play },
    { id: 'batch' as ActiveTab, label: 'Evaluador en Lote (Listado)', icon: ListOrdered },
    { id: 'comparador' as ActiveTab, label: 'Comparador A vs B', icon: GitCompare },
    { id: 'calibracion' as ActiveTab, label: 'Matriz de Calibración', icon: BarChart3 },
    { id: 'rubrica' as ActiveTab, label: 'Rúbrica v5', icon: BookOpen },
    { id: 'casos' as ActiveTab, label: 'Casos de Prueba', icon: Layers },
    { id: 'economia' as ActiveTab, label: 'Calculadora de Costos', icon: DollarSign },
    { id: 'gobernanza' as ActiveTab, label: 'Gobernanza L0–L4', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('evaluador')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">El Agente Evaluador</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Rúbrica v5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">MBA UCEMA · Programación con Agentes de IA</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{hasGeminiKey ? 'Gemini 2.5 Flash Activo' : 'Motor Calibrado Local'}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fase 0 Verificación Cruzada</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
