import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { LiveEvaluator } from './components/LiveEvaluator';
import { HistoryViewer } from './components/HistoryViewer';
import { CalibrationMatrix } from './components/CalibrationMatrix';
import { RubricViewer } from './components/RubricViewer';
import { TestCasesViewer } from './components/TestCasesViewer';
import { EconomicsCalculator } from './components/EconomicsCalculator';
import { GovernanceViewer } from './components/GovernanceViewer';
import { HeadToHeadComparator } from './components/HeadToHeadComparator';
import { BatchEvaluator } from './components/BatchEvaluator';
import { UserManagementView } from './components/UserManagementView';
import { LoginScreen } from './components/LoginScreen';
import { AccessPendingScreen } from './components/AccessPendingScreen';
import { TeamCreditsModal } from './components/TeamCreditsModal';
import { Scale, RefreshCw, Users, GraduationCap } from 'lucide-react';

function AppContent() {
  const { user, isAuthorized, isAdmin, pendingRequests, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('evaluador');
  const [liveRepoUrl, setLiveRepoUrl] = useState<string | undefined>(undefined);
  const [health, setHealth] = useState<{ has_gemini_key: boolean; has_github_token: boolean } | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error('Health check error:', err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse shadow-lg shadow-indigo-600/20">
          <Scale className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Verificando credenciales de Google y permisos de acceso...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Google login gate
  if (!user) {
    return <LoginScreen />;
  }

  // Logged in but not active/authorized by admin
  if (!isAuthorized) {
    return <AccessPendingScreen />;
  }

  // Authorized user
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        hasGeminiKey={health?.has_gemini_key ?? false}
      />

      {/* Admin Notification Banner for Pending Requests */}
      {isAdmin && pendingRequests.length > 0 && activeTab !== 'usuarios' && (
        <div className="bg-gradient-to-r from-amber-900/80 via-amber-800/80 to-amber-900/80 border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-100 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                <strong>Atención:</strong> Tienes <strong>{pendingRequests.length}</strong> solicitud{pendingRequests.length > 1 ? 'es' : ''} de acceso pendiente{pendingRequests.length > 1 ? 's' : ''} de autorización.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('usuarios')}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg transition shadow-sm"
            >
              Revisar y Habilitar
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'evaluador' && <LiveEvaluator initialRepoUrl={liveRepoUrl} />}
        {activeTab === 'historial' && (
          <HistoryViewer 
            onSelectRepoForLive={(url) => {
              setLiveRepoUrl(url);
              setActiveTab('evaluador');
            }} 
          />
        )}
        {activeTab === 'batch' && <BatchEvaluator />}
        {activeTab === 'comparador' && <HeadToHeadComparator />}
        {activeTab === 'calibracion' && <CalibrationMatrix />}
        {activeTab === 'rubrica' && <RubricViewer />}
        {activeTab === 'casos' && <TestCasesViewer />}
        {activeTab === 'economia' && <EconomicsCalculator />}
        {activeTab === 'gobernanza' && <GovernanceViewer />}
        {activeTab === 'usuarios' && <UserManagementView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">El Agente Evaluador · Rúbrica v5.2</span>
            <span className="text-slate-600">|</span>
            <span>MBA UCEMA · Programación con Agentes de IA</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Prof. Alfredo B. Roisenzvit</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-300">
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-indigo-300 hover:text-indigo-200 transition font-medium text-[11px]"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Equipo: Martín Pérez · Bianca Orlandini · Silvia Alvarez · Daniel Osorio · Sofia Rodriguez</span>
            </button>
          </div>
        </div>
      </footer>

      <TeamCreditsModal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
