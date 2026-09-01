import fs from 'fs';
import path from 'path';

export interface CalibrationRunRecord {
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

export function loadCalibrationRuns(): CalibrationRunRecord[] {
  const corridasDir = path.join(process.cwd(), 'calibracion', 'corridas');
  if (!fs.existsSync(corridasDir)) {
    return [];
  }

  const files = fs.readdirSync(corridasDir).filter(f => f.endsWith('.json')).sort().reverse();
  const records: CalibrationRunRecord[] = [];

  for (const file of files) {
    try {
      const fullPath = path.join(corridasDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const json = JSON.parse(content);

      let evaluacion = json.evaluacion || json.response?.evaluacion || [];
      if (!Array.isArray(evaluacion) && evaluacion.dimensiones) {
        evaluacion = evaluacion.dimensiones;
      }

      let notaFinal = 0;
      const dims: any[] = [];

      if (Array.isArray(evaluacion)) {
        for (const dim of evaluacion) {
          const pond = typeof dim.puntaje_ponderado === 'number'
            ? dim.puntaje_ponderado
            : parseFloat(String(dim.puntaje_ponderado || 0).replace(/[^\d.]/g, '')) || 0;
          notaFinal += pond;
          dims.push({
            nombre: dim.dimension || 'Dimensión',
            puntaje: dim.puntaje_asignado || dim.puntaje_literal || `${pond}/10`,
            ponderado: pond,
            justificacion: dim.justificacion || '',
            checklist: dim.checklist || dim.checklist_por_mapeo || []
          });
        }
      }

      // Check if report specifies final grade
      if (json.response?.evaluacion?.nota_final) {
        notaFinal = json.response.evaluacion.nota_final;
      } else if (json.evaluacion?.nota_final) {
        notaFinal = json.evaluacion.nota_final;
      }

      records.push({
        id: file.replace('.json', ''),
        filename: file,
        timestamp: json.timestamp || file.substring(0, 10),
        repo_evaluado: json.repositorio_evaluado || file,
        version_rubrica: json.version_rubrica || 'v1',
        modo: json.modo_generacion || 'automático',
        proveedor: json.proveedor || 'anthropic',
        modelo: json.modelo || 'claude-sonnet-5',
        nota_final: Math.round(notaFinal * 10) / 10,
        dimensiones: dims,
        data: json
      });
    } catch (e) {
      console.error(`Error loading calibration run ${file}:`, e);
    }
  }

  return records;
}
