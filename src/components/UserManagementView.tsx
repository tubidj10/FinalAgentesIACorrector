import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  Mail, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  KeyRound, 
  Crown,
  Search,
  Sparkles
} from 'lucide-react';
import { SUPER_ADMIN_EMAIL, AppUser, AccessRequest } from '../lib/firebase';

export const UserManagementView: React.FC = () => {
  const { 
    user,
    usersList, 
    pendingRequests, 
    createUser, 
    setUserStatus, 
    setUserRole, 
    removeUser, 
    approveAccessRequest, 
    rejectAccessRequest,
    isSuperAdmin
  } = useAuth();

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'evaluator' | 'viewer'>('evaluator');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await createUser(newEmail.trim(), newRole, newName.trim() || undefined);
      setSuccessMsg(`Usuario ${newEmail} habilitado con éxito con rol ${newRole}.`);
      setNewEmail('');
      setNewName('');
      setNewRole('evaluator');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error al dar de alta el usuario en Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Control de Acceso y Gestión de Usuarios
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                RBAC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Administración de usuarios autorizados para ingresar y ejecutar el Agente Evaluador de Rúbrica v5.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <Crown className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">Super Administrador</span>
              <span className="font-semibold text-slate-200">{SUPER_ADMIN_EMAIL}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Usuarios Habilitados</span>
            <div className="text-lg font-bold text-slate-100 mt-0.5">
              {usersList.filter(u => u.status === 'active').length + (usersList.some(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) ? 0 : 1)}
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Solicitudes Pendientes</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">
              {pendingRequests.length}
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Administradores</span>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">
              {usersList.filter(u => u.role === 'admin' && u.status === 'active').length + 1}
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Evaluadores Activos</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {usersList.filter(u => u.role === 'evaluator' && u.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Access Requests Banner (if any) */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm mb-4">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Solicitudes de Acceso Pendientes ({pendingRequests.length})</span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div 
                key={req.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 gap-3"
              >
                <div className="flex items-center space-x-3">
                  {req.photoURL ? (
                    <img src={req.photoURL} alt={req.displayName || req.email} className="w-8 h-8 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                      {req.email[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-xs text-slate-100">{req.displayName || req.email}</div>
                    <div className="text-[11px] text-slate-400">{req.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => approveAccessRequest(req, 'evaluator')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprobar como Evaluador</span>
                  </button>

                  <button
                    onClick={() => approveAccessRequest(req, 'admin')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1 transition shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Aprobar como Admin</span>
                  </button>

                  <button
                    onClick={() => rejectAccessRequest(req.id)}
                    className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Rechazar solicitud"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Create User Form + User List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form: Add User */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-100 mb-4 pb-3 border-b border-slate-800">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Dar de Alta Nuevo Usuario</span>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Correo Electrónico (Google Account) *
              </label>
              <input
                id="input-new-user-email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="ejemplo@gmail.com o usuario@ucema.edu.ar"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre / Referencia (Opcional)
              </label>
              <input
                id="input-new-user-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del alumno o profesor"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Rol Asignado
              </label>
              <select
                id="select-new-user-role"
                value={newRole}
                onChange={(e: any) => setNewRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="evaluator">Evaluador (Ejecutar correcciones, lote y comparador)</option>
                <option value="admin">Administrador (Control total y gestión de usuarios)</option>
                <option value="viewer">Lector (Solo visualización de rúbrica y casos)</option>
              </select>
            </div>

            <button
              id="btn-submit-create-user"
              type="submit"
              disabled={isSubmitting || !newEmail.trim()}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center space-x-2 shadow-lg transition-all ${
                isSubmitting || !newEmail.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Habilitando...' : 'Habilitar Usuario'}</span>
            </button>
          </form>
        </div>

        {/* User Directory */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-100">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Directorio de Usuarios Registrados ({usersList.length + 1})</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por email o nombre..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[520px] pr-1">
            {/* Super Admin item */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-100">Martín Pérez</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{SUPER_ADMIN_EMAIL}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Activo Permanente
                </span>
              </div>
            </div>

            {/* Other Users */}
            {filteredUsers
              .filter(u => u.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase())
              .map((usr) => (
                <div
                  key={usr.email}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all gap-3 ${
                    usr.status === 'active'
                      ? 'bg-slate-950/60 border-slate-800/90'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {usr.photoURL ? (
                      <img src={usr.photoURL} alt={usr.displayName || usr.email} className="w-8 h-8 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                        {usr.email[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-200">{usr.displayName || usr.email.split('@')[0]}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          usr.role === 'admin'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : usr.role === 'evaluator'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {usr.role === 'admin' ? 'Admin' : usr.role === 'evaluator' ? 'Evaluador' : 'Lector'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{usr.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Role Selector */}
                    <select
                      value={usr.role}
                      onChange={(e: any) => setUserRole(usr.email, e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="evaluator">Evaluador</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Lector</option>
                    </select>

                    {/* Status Toggle */}
                    <button
                      onClick={() => setUserStatus(usr.email, usr.status === 'active' ? 'inactive' : 'active')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition ${
                        usr.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                      title={usr.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {usr.status === 'active' ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar autorización para ${usr.email}?`)) {
                          removeUser(usr.email);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No se encontraron usuarios que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
