export interface ChecklistItem {
  item: string;
  cumple: boolean;
  evidencia: string;
}

export interface DimensionEvaluation {
  dimension: string;
  peso?: number;
  checklist: ChecklistItem[];
  checklist_por_mapeo?: ChecklistItem[];
  puntaje_asignado: string; // e.g. "9/10", "3/10"
  puntaje_ponderado: string | number; // e.g. "27.0", "9.0"
  justificacion: string;
  puntaje_literal?: string;
  puntaje_asignado_por_mapeo?: string;
  puntaje_ponderado_usado_en_la_nota?: string;
  escala_elegida?: string;
  evidencia_citada?: string;
  sugerencia_concreta?: string;
}

export interface HallazgoCodigo {
  archivo: string;
  linea_aprox?: string;
  tipo: 'seguridad' | 'robustez' | 'diseno' | 'costo' | 'observacion';
  descripcion: string;
  sugerencia: string;
}

export interface RevisionCodigo {
  archivos_analizados: string[];
  hallazgos: HallazgoCodigo[];
  resumen: string;
}

export interface Fase0Verificacion {
  afirmaciones_verificadas: { afirmacion: string; cita: string; archivo: string }[];
  afirmaciones_no_verificadas: { afirmacion: string; motivo: string }[];
  inconsistencias: { descripcion: string; archivos_involucrados: string[]; severidad: 'leve' | 'critica' | 'fraude' }[];
}

export interface EvaluacionCompleta {
  fase0?: Fase0Verificacion;
  dimensiones: DimensionEvaluation[];
  nota_final: number;
  protocolo_antifraude?: {
    activado: boolean;
    motivos?: string[];
  };
  revision_de_codigo?: RevisionCodigo;
}

export interface TransactionLog {
  timestamp: string;
  repositorio_evaluado: string;
  modo_generacion: string;
  modo_generacion_nota?: string;
  version_rubrica?: string;
  nota_metodologica?: string;
  proveedor?: string;
  modelo?: string;
  request?: {
    system_prompt_sha256?: string;
    user_prompt_sha256?: string;
    archivos_faltantes?: string[];
    archivos_extraidos?: string[];
  };
  response?: {
    texto_crudo?: string;
    json_valido?: boolean;
    evaluacion?: DimensionEvaluation[] | EvaluacionCompleta;
  };
  evaluacion?: DimensionEvaluation[] | EvaluacionCompleta;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    thoughts_tokens?: number;
    total_tokens?: number;
  };
  latencia_ms?: number;
}

export interface CalibrationRunSummary {
  id: string;
  filename: string;
  timestamp: string;
  repo_evaluado: string;
  version_rubrica: string;
  modo: string;
  nota_final: number;
  proveedor?: string;
  modelo?: string;
  dimensiones: {
    nombre: string;
    puntaje: string;
    ponderado: number;
    justificacion: string;
    checklist?: any[];
  }[];
  data: any;
}

export interface TestPreset {
  id: string;
  nombre: string;
  categoria: 'excelente' | 'flojo' | 'tramposo' | 'repo_real' | 'autoevaluacion';
  repo_url: string;
  descripcion: string;
  nota_esperada: number;
  puntos_clave: string[];
  archivos: Record<string, string>;
}

export interface RubricDimensionDef {
  id: string;
  nombre: string;
  peso: number;
  descripcion: string;
  procedimiento: string;
  niveles: {
    rango: string;
    nombre: string;
    evidencia: string;
  }[];
  checklist_6_8: string[];
  checklist_9_10: string[];
}
