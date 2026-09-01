import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale, ShieldCheck, Lock, Sparkles, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await login();
    } catch (err: any) {
      console.error(err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setLoginError('No se pudo completar la autenticación con Google. Verifique los permisos de ventana emergente.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top subtle bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-100 tracking-tight">El Agente Evaluador</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Rúbrica v5
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            MBA UCEMA · Programación con Agentes de IA
          </span>
        </div>
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-xl">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mb-2">
              Acceso Restringido
            </h1>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Plataforma de evaluación automática y auditoría de repositorios de alumnos. Requiere autenticación institucional con Google.
            </p>

            {loginError && (
              <div className="w-full mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start space-x-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              id="btn-google-login"
              disabled={isLoggingIn || loading}
              onClick={handleGoogleLogin}
              className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-3 transition-all duration-200 shadow-xl ${
                isLoggingIn || loading
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-900 hover:shadow-white/10 active:scale-[0.99] border border-slate-200'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoggingIn ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
            </button>

            <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex flex-col space-y-2 text-left">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Super Administrador: <strong>martindperez@gmail.com</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Autorización y control de acceso gestionado por roles (RBAC)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 px-6 text-center text-xs text-slate-500">
        MBA UCEMA · Cátedra Programación con Agentes de Inteligencia Artificial
      </footer>
    </div>
  );
};
