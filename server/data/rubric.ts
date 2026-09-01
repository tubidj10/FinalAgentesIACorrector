export interface RubricDimension {
  id: string;
  nombre: string;
  peso: number;
  descripcion: string;
  procedimiento: string;
  checklist_6_8: string[];
  checklist_9_10: string[];
  niveles: {
    rango: string;
    nombre: string;
    evidencia: string;
  }[];
}

export const RUBRIC_DIMENSIONS: RubricDimension[] = [
  {
    id: "sistema",
    nombre: "Sistema completo y funcionando",
    peso: 30,
    descripcion: "Mide que el agente entregado sea real y trazable de punta a punta, no una simulación narrada.",
    procedimiento: "Cruzar cada variable/parámetro mencionado en prompts/user_prompt.md contra los logs en corridas/. Cada variable debe aparecer con el mismo nombre y un valor consistente en al menos una corrida.",
    checklist_6_8: [
      "Cada variable/parámetro de prompts/user_prompt.md aparece, con el mismo nombre, en al menos una corrida de corridas/. Sin variables fantasma.",
      "Los logs tienen estructura de API real (campos como request, response, usage/tokens, timestamp o equivalente) — no prosa narrada.",
      "Si algún log declara usage/tokens, el orden de magnitud es plausible contra el texto real involucrado (Fase 0, regla 3).",
      "Al menos una corrida corresponde al camino feliz (caso exitoso, sin errores)."
    ],
    checklist_9_10: [
      "Al menos una corrida documenta una falla real manejada (timeout, error de API/herramienta, rechazo de schema, rate limit).",
      "El manejo de esa falla es visible en la propia corrida (un campo de error poblado, un reintento registrado, una confianza baja disparando una regla del contrato)."
    ],
    niveles: [
      { rango: "1–3", nombre: "Deficiente", evidencia: "corridas/ no existe, vacía o texto plano narrado. Logs sin estructura de API real." },
      { rango: "4–5", nombre: "Flojo", evidencia: "Logs con estructura de API pero solo camino feliz, o variable fantasma, o inconsistencias de valor." },
      { rango: "6–8", nombre: "Muy bueno", evidencia: "Cumple todo el checklist de 6–8 (sin variables fantasma, API real, usage plausible, camino feliz)." },
      { rango: "9–10", nombre: "Sobresaliente", evidencia: "Cumple checklist 6–8 y 9–10: falla real manejada documentada en log con reintento/error visible." }
    ]
  },
  {
    id: "proceso",
    nombre: "Proceso documentado",
    peso: 25,
    descripcion: "Mide la honestidad y profundidad técnica con que el grupo relata su propio proceso de construcción.",
    procedimiento: "Buscar en DECISIONES.md el relato de tropiezos reales, decisiones de diseño explícitas, alternativas descartadas y su justificación.",
    checklist_6_8: [
      "Al menos un tropiezo real documentado en DECISIONES.md con detalle técnico.",
      "Dice cómo se resolvió ese tropiezo y qué cambió en el agente a partir de eso.",
      "Al menos 2 decisiones de diseño con este nivel de detalle."
    ],
    checklist_9_10: [
      "Más de 2 decisiones de diseño con estructura completa (problema, alternativa descartada, motivo concreto).",
      "Cada decisión nombra la alternativa descartada con su motivo técnico concreto.",
      "El relato es verificable contra la historia real del repositorio o los logs de corridas/."
    ],
    niveles: [
      { rango: "1–3", nombre: "Deficiente", evidencia: "DECISIONES.md no existe o solo contiene generalidades ('decidimos usar IA porque es el futuro')." },
      { rango: "4–5", nombre: "Flojo", evidencia: "Menciona decisiones pero sin documentar tropiezos reales, o sin explicar alternativas descartadas." },
      { rango: "6–8", nombre: "Muy bueno", evidencia: "Al menos un tropiezo real resuelto y 2 decisiones con detalle técnico y alternativas." },
      { rango: "9–10", nombre: "Sobresaliente", evidencia: "Múltiples iteraciones documentadas, alternativas descartadas con métricas/costos, trazable con git." }
    ]
  },
  {
    id: "formato",
    nombre: "Formato y reproducibilidad",
    peso: 15,
    descripcion: "Mide que cualquier persona pueda clonar el repositorio y reproducir la ejecución exactamente como fue entregada.",
    procedimiento: "Verificar presencia estricta de las 5 rutas obligatorias (README.md, prompts/system_prompt.md, prompts/user_prompt.md, corridas/, DECISIONES.md), ausencia de secretos y rutas locales, e instrucciones claras de instalación y ejecución.",
    checklist_6_8: [
      "Las 5 rutas obligatorias existen en la raíz del repositorio.",
      "Instalación documentada paso a paso (ej. requirements.txt o package.json).",
      "Ejecución documentada con comando exacto.",
      "Variables de entorno nombradas por su nombre exacto (sin secretos hardcodeados en el código).",
      "Sin rutas absolutas dependientes de una máquina local."
    ],
    checklist_9_10: [
      "Dependencias con versión exactamente fijada (== en Python, package-lock.json o versiones fijas en Node) — >= no califica para 9–10.",
      "Mecanismo de reproducción de un solo paso (script ejecutable o flujo automatizado documentado)."
    ],
    niveles: [
      { rango: "1", nombre: "Falta Estructural", evidencia: "Falta alguna de las 5 rutas obligatorias (pasa a 1/10 automáticamente)." },
      { rango: "2–3", nombre: "Deficiente", evidencia: "Rutas existen pero hay secretos hardcodeados, rutas absolutas rotas o sin pasos de instalación." },
      { rango: "4–5", nombre: "Flojo", evidencia: "Instalación incompleta o dependencias no declaradas; requiere adivinanza para correr." },
      { rango: "6–8", nombre: "Muy bueno", evidencia: "5 rutas presentes, sin secretos, instalación y ejecución claras y reproducibles." },
      { rango: "9–10", nombre: "Sobresaliente", evidencia: "Versiones fijadas exactamente (==) y script de ejecución en un solo paso verificado." }
    ]
  },
  {
    id: "economico",
    nombre: "Análisis económico",
    peso: 15,
    descripcion: "Mide que el grupo entienda cuánto cuesta operar su agente en producción y pueda justificar su viabilidad económica.",
    procedimiento: "Verificar en README.md o DECISIONES.md la presencia de fórmula explícita de costo por llamada/corrida, supuestos de volumen declarados, orden de magnitud verificado y proyecciones razonadas.",
    checklist_6_8: [
      "Muestra la fórmula de costo desagregada (tokens input, tokens output, precios del proveedor).",
      "Declara los supuestos de volumen y frecuencia de uso.",
      "El orden de magnitud calculado es matemáticamente correcto contra los precios del modelo usado.",
      "Justifica la elección de modelo con el criterio de la materia: el modelo más chico que resuelve bien la tarea, no 'el mejor disponible' sin argumento."
    ],
    checklist_9_10: [
      "Proyección de costo a escala (mes/año o volumen de producción) con escenario base y peor caso.",
      "Análisis de optimizaciones de costo (ej. prompt caching, modelo más chico para sub-tarea, truncado de historial)."
    ],
    niveles: [
      { rango: "1–3", nombre: "Deficiente", evidencia: "Sin análisis económico o afirmaciones vagas sin números ni fórmulas ('es muy barato')." },
      { rango: "4–5", nombre: "Flojo", evidencia: "Cita un costo total pero sin fórmula desagregada o con supuestos no declarados." },
      { rango: "6–8", nombre: "Muy bueno", evidencia: "Fórmula explícita, supuestos declarados y cálculo matemáticamente coherente." },
      { rango: "9–10", nombre: "Sobresaliente", evidencia: "Análisis completo con escenarios base/peor caso, proyecciones de escala y estrategias de optimización evaluadas." }
    ]
  },
  {
    id: "gobierno",
    nombre: "Gobierno y riesgo",
    peso: 15,
    descripcion: "Mide la conciencia de seguridad, delimitación de alcance, clasificación de herramientas y mitigación de riesgos del agente.",
    procedimiento: "Revisar la clasificación de herramientas (L0–L4), delimitación de lo que el agente NO debe hacer, medidas contra inyecciones y manejo de datos sensibles.",
    checklist_6_8: [
      "Cada herramienta o acción del agente está clasificada explícitamente en niveles de autonomía/riesgo (ej. L0–L4 o equivalente).",
      "Define explícitamente qué NO hace el agente (límites de alcance y gobierno).",
      "Identifica al menos 2 riesgos concretos y su mecanismo de mitigación."
    ],
    checklist_9_10: [
      "Human-in-the-loop implementado o especificado para acciones de riesgo L2+.",
      "Análisis de prompt injection y medidas de contención de datos no confiables."
    ],
    niveles: [
      { rango: "1–3", nombre: "Deficiente", evidencia: "Sin análisis de riesgo ni delimitación de alcance; el agente tiene permisos ilimitados sin control." },
      { rango: "4–5", nombre: "Flojo", evidencia: "Menciona riesgos genéricos sin clasificación de herramientas ni salvaguardas concretas." },
      { rango: "6–8", nombre: "Muy bueno", evidencia: "Herramientas clasificadas L0–L4, límites de alcance explícitos y riesgos mitigados." },
      { rango: "9–10", nombre: "Sobresaliente", evidencia: "Matriz de gobierno exhaustiva, human-in-the-loop en acciones críticas y aislamiento estricto de prompts." }
    ]
  }
];
