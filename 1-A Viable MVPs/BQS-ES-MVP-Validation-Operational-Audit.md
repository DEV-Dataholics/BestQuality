# Reporte de Auditoría Operativa y Validación de MVP
**Cliente:** Best Quality Solutions México (BQS)  
**Fecha:** 9 de junio de 2026  
**Auditor:** Agente de Auditoría Operativa y Evaluación de Riesgos Senior  

---

## 1. Matriz de Referencia Cruzada

| MVP Propuesto | Dolor Operativo Principal Abordado | Respaldo en Entrevistas (Fuerte/Débil) | Preparación Operativa (Alta/Media/Baja) |
| :--- | :--- | :--- | :--- |
| **Mobile Daily Sorting Capturer** | Captura manual de reportes de inspección desde fotos borrosas/ilegibles [OpDoc:3.1.1], Recopilación de datos del supervisor (todo manual, no digital) [OpDoc:3.3.1], Sumas incorrectas [OpDoc:3.3.5]. | **Fuerte (Cualitativo):** Juan Manuel afirma explícitamente que la recopilación de datos es su mayor cuello de botella [OpDoc:3.3.1, INT:1082]. Lourdes destaca errores de lectura por mala letra [OpDoc:3.1.1, OpDoc:4]. Soledad sugiere una herramienta de captura basada en tablets [INT:215]. | **Baja:** Fuerte dependencia de datos móviles personales [OpDoc:3.3.3, INT:951], restricciones de seguridad sobre el uso de celulares en piso de las maquilas [INT:1021] y alta movilidad de inspectores entre números de parte [OpDoc:3.4.5]. La administración también prefiere mantener la captura fuera de piso inicialmente [INT:1604]. |
| **Quote Balance & Over-limit Alerting Dashboard** | Inspectores que se pasan de la cantidad autorizada (sobre-sorteo) [OpDoc:3.3.6]. | **Fuerte:** Soledad describe disputas de facturación y la necesidad de obtener autorizaciones posteriores de clientes debido al sobre-sorteo [OpDoc:3.3.6, INT:1491, INT:1524]. | **Media:** Limitada por el desfase de 24 a 48 horas en la transcripción [OpDoc:3.1.1] (reactiva, no preventiva) y la excepción operativa de arrancar trabajos de sorteo sin cotizaciones formales ni Órdenes de Compra (PO) [OpDoc:3.5.1]. |
| **Executive Accounts Receivable and Billing Portal** | El dueño no puede consultar información desde el teléfono [OpDoc:3.6.1], Informes complejos que el dueño no lee [OpDoc:3.1.6], Servicios ejecutados que no se facturaron [OpDoc:3.2.1]. | **Fuerte:** Soledad enfatiza que Eric (dueño) solo lee resúmenes desde su celular, enfocándose únicamente en cuánto le deben [OpDoc:3.1.6, INT:43-45, INT:66]. | **Media-Alta:** Las hojas de cálculo fuente están actualmente aisladas y son propensas a errores de sincronización en la nube [OpDoc:3.1.2, OpDoc:3.1.5]. Sin embargo, la lógica del dashboard es simple una vez que se normalizan los nombres de clientes [OpDoc:3.5.3]. |

---

## 2. Desglose de Validación de MVP

### Evaluación: Mobile Daily Sorting Capturer
- **Estado de Validación:** Requiere Revisión
- **Puntuación de Riesgo:** 4/5 (Riesgo de ejecución alto)
- **Alineación:** Este concepto se alinea perfectamente con las quejas declaradas por los usuarios respecto a las fotos ilegibles de reportes en papel enviadas por WhatsApp [OpDoc:3.1.1, INT:1557] y los cuellos de botella de transcripción. Sin embargo, choca directamente con la realidad operativa de piso.
- **Complejidad Operativa Oculta:**
  1. **Costos de Infraestructura y Datos:** Los inspectores usan celulares personales y con frecuencia carecen de saldo/datos móviles para subir reportes [OpDoc:3.3.3, INT:951-952].
  2. **Políticas de Seguridad de la Maquiladora:** Las plantas de maquila tienen reglas estrictas que prohíben a proveedores el uso de dispositivos móviles o cámaras personales en piso de producción [INT:1021].
  3. **Alta Movilidad y Variedad de Partes:** Los inspectores cambian de parte o línea frecuentemente durante un turno (p. ej., 2 horas en una parte, 4 horas en otra) [OpDoc:3.4.5, INT:1200], lo que haría tedioso el registro en tiempo real en una interfaz móvil pequeña.
  4. **Estrategia Administrativa Contradictoria:** La administración señaló explícitamente que en la primera etapa desean que la captura permanezca fuera de piso para mantener control de calidad [INT:1604-1605].
- **La Pregunta del Interruptor de Apagado (Kill Switch):** *¿Tienen los inspectores y supervisores permitido física y contractualmente usar dispositivos móviles/tablets en el piso de producción de las cuatro maquilas activas (Strattec, Valeo, Marelli, Vitesco), y existe acceso a internet estable en esas áreas específicas?*

---

### Evaluación: Quote Balance & Over-limit Alerting Dashboard
- **Estado de Validación:** Validado (con Pivotes)
- **Puntuación de Riesgo:** 3/5 (Riesgo de ejecución medio)
- **Alineación:** Aborda directamente el problema de sobre-sorteo en el que BQS inspecciona más piezas de las autorizadas por el cliente, lo que genera trabajo no pagado y renegociaciones [OpDoc:3.3.6, INT:1491].
- **Complejidad Operativa Oculta:**
  1. **Desfase de Datos Reactivo:** Dado que los datos de reportes diarios tardan hasta 24 horas en ser transcritos por Lourdes [OpDoc:3.1.1], una alerta de que se alcanzó el límite el martes podría no aparecer en el dashboard hasta el miércoles por la tarde, después de que los inspectores ya se hayan sobrepasado durante otro turno.
  2. **Arranques Verbales (Excepción de PO Cero):** Los trabajos frecuentemente inician con solicitudes verbales urgentes de ingenieros de maquila sin una cotización o límite de PO registrado [OpDoc:3.5.1, INT:1006]. El dashboard fallará o marcará límites rojos falsos de inmediato a menos que exista una opción de omitir o estado de "PO Pendiente / Autorización Verbal".
- **La Pregunta del Interruptor de Apagado (Kill Switch):** *Dado que los conteos diarios se transcriben con un desfase de hasta 24 horas y los trabajos inician frecuentemente con autorizaciones verbales sin PO, ¿cómo evitará el dashboard el sobre-sorteo en tiempo real sin bloquear solicitudes urgentes del cliente?*

---

### Evaluación: Executive Accounts Receivable and Billing Portal
- **Estado de Validación:** Validado
- **Puntuación de Riesgo:** 2/5 (Riesgo de ejecución bajo-medio)
- **Alineación:** Excelente alineación. Eric (dueño) es altamente móvil y demanda visibilidad simple y amigable desde el celular sobre lo facturado, lo pendiente y el trabajo sin facturar [OpDoc:3.6.1, INT:66]. Elimina la carga de Soledad de recopilar reportes manuales que el dueño no termina de leer [OpDoc:3.1.6, INT:43].
- **Complejidad Operativa Oculta:**
  1. **Fragmentación de Bases de Datos:** Los datos se encuentran dispersos en hojas de cálculo desconectadas (cotizaciones, remisiones, facturas, pagos) [OpDoc:3.1.2], las cuales son propensas a errores de sincronización en la nube que ocasionalmente borran datos [OpDoc:3.1.5, INT:530].
  2. **Falta de Claves Únicas:** Los clientes se identifican únicamente por variaciones de texto de sus nombres (p. ej., "NIDEC Mobility", "NIDEC México", "NIDEC US") en lugar de IDs únicos de cliente [OpDoc:3.5.3, INT:8-21], lo que romperá el rastreo consolidado en el dashboard a menos que se limpien y estandaricen primero.
- **La Pregunta del Interruptor de Apagado (Kill Switch):** *¿Podemos establecer un directorio maestro estandarizado de clientes y sincronizar los archivos Excel subyacentes en una base de datos única y confiable antes de construir el portal, o correremos el riesgo de que el dueño visualice métricas fragmentadas?*

---

## 3. Recomendación Estratégica Final

### El Ganador
El **Executive Accounts Receivable and Billing Portal** es el claro ganador. Presenta la menor fricción operativa, cuenta con la mayor demanda a nivel directivo [OpDoc:3.6.1] y puede construirse de inmediato usando un frontend estático desacoplado (HTML5/Tailwind CSS) conectado a una API de CodeIgniter 4 y base de datos MySQL (sincronizada desde datos limpios), sin requerir cambios de proceso en piso ni inversiones en hardware.

### Pivotes Requeridos
1. **Para el Mobile Daily Sorting Capturer:** Pivotar de una *app móvil de piso para inspectores* a una *utilidad web de escritorio centralizada para Lourdes (la capturista) y/o Juan Manuel al final de la jornada*. Esto elimina los problemas de fotos de WhatsApp al pasar a un formulario estructurado y automatizar los cálculos de sumas [OpDoc:3.3.5] sin violar las restricciones de piso de la maquiladora.
2. **Para el Quote Balance & Over-limit Alerting Dashboard:** Pivotar la lógica de alertas para incluir un estado de "Aprobación Verbal / Límite Temporal". Asimismo, establecer un umbral operativo diario (p. ej., alertar al 80% en lugar del 90%) para absorber el desfase de 24 horas en la transcripción.
3. **Normalización de Cimientos:** Antes de ejecutar cualquier MVP, BQS debe implementar un sistema de códigos unificados tanto para clientes como para inspectores (alejándose de la identificación exclusiva por nombre) [OpDoc:3.4.1, OpDoc:3.5.3] para garantizar la integridad de los datos en todos los sistemas.
