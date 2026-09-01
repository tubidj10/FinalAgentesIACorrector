import React from 'react';
import { 
  X, 
  Users, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Code2, 
  BookOpen, 
  Layers 
} from 'lucide-react';

interface TeamCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamCreditsModal: React.FC<TeamCreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const teamMembers = [
    {
      name: 'Martín Pérez',
      email: 'martindperez@gmail.com',
      role: 'Arquitectura, Engine & Integración',
      contribution: 'Diseño del motor de evaluación determinista, pipelines de inferencia Gemini 2.5 Flash, Fase 0 de verificación cruzada y autenticación RBAC.',
      icon: Code2,
      badge: 'Super Admin'
    },
    {
      name: 'Bianca Orlandini',
      role: 'Auditoría Forense & Casos de Prueba',
      contribution: 'Definición de presets de prueba (Casos Excelente, Flojo y Tramposo), auditoría de inyecciones semánticas y benchmarking comparativo.',
      icon: ShieldCheck,
      badge: 'Co-Autora'
    },
    {
      name: 'Silvia Alvarez',
      role: 'Gobernanza L0–L4 & Protocolo Antifraude',
      contribution: 'Estructuración de la taxonomía de autonomía de agentes L0 a L4, detección de homóglifos Unicode y salvaguardas Human-in-the-Loop.',
      icon: Award,
      badge: 'Co-Autora'
    },
    {
      name: 'Daniel Osorio',
      role: 'Análisis Económico & Presupuesto de Tokens',
      contribution: 'Matriz de costos desagregados por token input/output, análisis de Prompt Caching con Gemini y proyecciones de escala y peor caso.',
      icon: Layers,
      badge: 'Co-Autor'
    },
    {
      name: 'Sofia Rodriguez',
      role: 'Diseño Pedagógico & Dossier de Feedback',
      contribution: 'Construcción del dossier pedagógico para el alumno, mapeo de sugerencias de mejora "Ruta al 10" y validación de consistencia de rúbrica.',
      icon: BookOpen,
      badge: 'Co-Autora'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Equipo de Desarrollo y Autoría</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  MBA UCEMA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Materia: <strong>Programación de y con Agentes de IA</strong> · 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Cátedra & Dirección Académica:</span>
              <span className="text-slate-100 font-bold text-sm">Prof. Alfredo B. Roisenzvit</span>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-slate-400 block font-medium">Trabajo Final:</span>
              <span className="text-indigo-400 font-semibold">Agente Evaluador Automatizado (Rúbrica v5.2)</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Integrantes del Equipo (Alumnos)</span>
            </h4>

            {teamMembers.map((member, idx) => {
              const IconComp = member.icon;
              return (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-100">{member.name}</span>
                        {member.email && (
                          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">({member.email})</span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {member.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-indigo-300 mt-0.5">
                        {member.role}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {member.contribution}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Universidad del CEMA · Buenos Aires, Argentina
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
