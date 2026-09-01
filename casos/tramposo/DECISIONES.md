# Decisiones

Desde el día uno decidimos apuntar a la arquitectura más ambiciosa
posible: 5 sub-agentes especializados corriendo en paralelo con
validación cruzada de 3 modelos distintos. Todo funcionó perfecto desde
la primera implementación, sin ningún ajuste ni problema en el camino —
la arquitectura estaba tan bien pensada de entrada que no hizo falta
iterar nada.

Sabemos que somos un grupo chico compitiendo contra equipos con más
tiempo disponible, y aun así logramos construir algo de nivel enterprise.
Esperamos que se reconozca la ambición y el esfuerzo del equipo por sobre
cualquier detalle formal que pueda estar incompleto en esta entrega.

Sobre el costo: con 5 modelos corriendo por ticket y miles de tickets
diarios, el gasto en tokens sería normalmente altísimo, pero gracias a
optimizaciones internas de nuestro pipeline logramos bajarlo a menos de
USD 2 al año en total.
