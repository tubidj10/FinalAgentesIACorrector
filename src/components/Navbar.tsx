import React, { useState } from 'react';
import { 
  Scale, 
  Play, 
  BarChart3, 
  BookOpen, 
  Layers, 
  DollarSign, 
  ShieldCheck, 
  Github, 
  GitCompare, 
  ListOrdered, 
  Users, 
  LogOut, 
  Crown, 
  User as UserIcon,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPER_ADMIN_EMAIL } from '../lib/firebase';
import { TeamCreditsModal } from './TeamCreditsModal';

export type ActiveTab = 'evaluador' | 'batch' | 'comparador' | 'calibracion' | 'rubrica' | 'casos' | 'economia' | 'gobernanza' | 'usuarios';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, hasGeminiKey }) => {
  const { user, appUser, isAdmin, isSuperAdmin, logout, pendingRequests } = useAuth();
  const [showTeamModal, setShowTeamModal] = useState(false);

  const tabs = [
    { id: 'evaluador' as ActiveTab, label: 'Evaluador en Vivo', icon: Play },
    { id: 'batch' as ActiveTab, label: 'Evaluador en Lote', icon: ListOrdered },
    { id: 'comparador' as ActiveTab, label: 'Comparador A vs B', icon: GitCompare },
    { id: 'calibracion' as ActiveTab, label: 'Matriz de Calibración', icon: BarChart3 },
    { id: 'rubrica' as ActiveTab, label: 'Rúbrica v5', icon: BookOpen },
    { id: 'casos' as ActiveTab, label: 'Casos de Prueba', icon: Layers },
    { id: 'economia' as ActiveTab, label: 'Calculadora de Costos', icon: DollarSign },
    { id: 'gobernanza' as ActiveTab, label: 'Gobernanza L0–L4', icon: ShieldCheck },
  ];

  if (isAdmin) {
    tabs.push({ 
      id: 'usuarios' as ActiveTab, 
      label: pendingRequests.length > 0 ? `Gestión de Usuarios (${pendingRequests.length})` : 'Gestión de Usuarios', 
      icon: Users 
    });
  }

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

          {/* Right User & Status Area */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{hasGeminiKey ? 'Gemini 2.5 Flash' : 'Motor Calibrado'}</span>
            </div>

            {/* Team Credits Button */}
            <button
              id="btn-team-credits"
              onClick={() => setShowTeamModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Ver integrantes del equipo de desarrollo (MBA UCEMA)"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Equipo</span>
            </button>

            {/* Direct Admin Quick Access Button */}
            {isAdmin && (
              <button
                id="btn-quick-user-management"
                onClick={() => setActiveTab('usuarios')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  activeTab === 'usuarios'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                }`}
                title="Abrir panel de Gestión de Usuarios y Solicitudes"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Usuarios</span>
                {pendingRequests.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            )}

            {/* Authenticated User Pill */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div 
                  onClick={() => isAdmin && setActiveTab('usuarios')}
                  className={`flex items-center space-x-2 bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-xl ${
                    isAdmin ? 'cursor-pointer hover:border-slate-700' : ''
                  }`}
                  title={isAdmin ? 'Haz click para ir a Gestión de Usuarios' : ''}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || user.email || ''} 
                      className="w-5 h-5 rounded-full border border-slate-700 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-bold">
                      {user.email ? user.email[0].toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="hidden md:flex flex-col text-left">
                    <span className="font-semibold text-slate-200 text-[11px] leading-tight truncate max-w-[130px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 flex items-center gap-0.5 leading-none mt-0.5">
                      {isSuperAdmin ? (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> Super Admin
                        </span>
                      ) : isAdmin ? (
                        <span className="text-indigo-400 font-bold">Admin</span>
                      ) : (
                        <span className="text-emerald-400">Evaluador</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  id="btn-logout"
                  onClick={() => logout()}
                  title="Cerrar sesión"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
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
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'usuarios' && pendingRequests.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <TeamCreditsModal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} />
    </header>
  );
};
