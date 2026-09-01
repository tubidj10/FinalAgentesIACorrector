import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Send, LogOut, Clock, CheckCircle2, User, Mail } from 'lucide-react';

export const AccessPendingScreen: React.FC = () => {
  const { user, hasPendingRequest, submitAccessRequest, logout } = useAuth();
  const [requestSent, setRequestSent] = useState(hasPendingRequest);
  const [sending, setSending] = useState(false);

  const handleRequest = async () => {
    try {
      setSending(true);
      await submitAccessRequest();
      setRequestSent(true);
    } catch (err) {
      console.error('Error enviando solicitud de acceso:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      <header className="border-b border-slate-800/80 bg-slate-900/60 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-slate-100 tracking-tight">El Agente Evaluador</span>
          <button
            onClick={() => logout()}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            
            {/* User Avatar */}
            <div className="relative mb-6">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-20 h-20 rounded-full border-2 border-amber-500/40 object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-amber-500/40 flex items-center justify-center text-slate-300">
                  <User className="w-10 h-10" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-100 mb-1">
              {user?.displayName || 'Usuario de Google'}
            </h2>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-6 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs mb-6 text-left leading-relaxed">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Acceso pendiente de autorización
              </p>
              Tu cuenta aún no ha sido dada de alta por el administrador del sistema (<strong>martindperez@gmail.com</strong>).
            </div>

            {requestSent ? (
              <div className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center space-x-2 mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Solicitud de acceso enviada al administrador.</span>
              </div>
            ) : (
              <button
                id="btn-request-access"
                disabled={sending}
                onClick={handleRequest}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition mb-4"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Enviando Solicitud...' : 'Solicitar Habilitación de Acceso'}</span>
              </button>
            )}

            <button
              onClick={() => logout()}
              className="text-xs text-slate-400 hover:text-slate-200 underline transition"
            >
              Iniciar sesión con otra cuenta de Google
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        MBA UCEMA · Programación con Agentes de IA
      </footer>
    </div>
  );
};
