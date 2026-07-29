# DOCUMENTO DE ALCANCE Y DECLARACION DE TRABAJO (SOW)
# Quote Balance & Over-limit Alerting Dashboard

**Empresa Contratante:** Dataholics  
**Version de SOW:** 1.0.0  
**Nombre del Proyecto:** BQS Quote Balance & Over-limit Alerting Dashboard (Dashboard de Saldos y Alertas BQS)  
**Fecha de Elaboracion:** 16/06/2026  
**Contratista / Desarrollador:** Profesional Independiente  
**Aprobador Tecnico:** Luis Morales (CTO)

---

## 1. Objetivo del Proyecto
Desarrollar un dashboard de monitoreo para administración y coordinadores de proyecto que compare el avance acumulado de piezas o dinero sorteado frente a las cantidades autorizadas en las Órdenes de Compra (PO) o cotizaciones. Su fin es mitigar pérdidas por sobre-sorteo (inspeccionar más piezas de las pagadas por el cliente) mediante alertas tempranas y contemplando las flexibilidades operativas de arranques con autorizaciones verbales.

### 1.1 Flujo obligatorio Comercial -> Produccion
Este proyecto se rige por el siguiente ciclo de validacion para asegurar alineacion con el cliente:

1. Comercial entrega a Produccion toda la informacion de contexto, alcance, objetivos y prioridades del cliente antes de iniciar el MVP.
2. Produccion genera el SOW con base en dichos insumos.
3. Produccion y Comercial revisan conjuntamente el SOW hasta confirmar que representa lo que busca el cliente.
4. Con SOW aprobado por Comercial, Produccion desarrolla el MVP.
5. MVP terminado: Produccion lo regresa a Comercial para validar frontend y funcionalidades.
6. Se realiza una ultima pasada de ajustes antes de presentar al cliente.

## 2. Stack Tecnologico Requerido
- **Backend API:** CodeIgniter 4 (PHP 8.1+) para el cálculo de saldos y lógica de alertas.
- **Frontend:** HTML5 + Alpine.js + Tailwind CSS (integrado en el portal o panel administrativo existente).
- **Base de datos:** MySQL (compartida con la base de datos de capturas diarias y cotizaciones).
- **Hosting/Deploy:** Site5 / cPanel de Dataholics.

## 3. Alcance del Proyecto (Scope)

### 3.1. LO QUE SI INCLUYE (In Scope):
- **Cálculo de Consumo Acumulado:** Lógica para sumar las piezas y horas reportadas diariamente contra el límite establecido en la cotización o PO de referencia.
- **Regla de Alertas Preventivas (Umbral del 80%):** Alertas visuales dentro de la aplicación cuando el consumo acumulado de un proyecto alcanza el 80% del límite contratado (esto compensa el desfase de 24 horas de la captura de Lourdes).
- **Mecanismo de "Autorización Verbal / Límite Temporal":** Opción para iniciar servicios de sorteo urgente con un indicador de "Autorización Verbal" y una cantidad temporal autorizada para evitar banderas rojas falsas o bloqueos antes de recibir la PO formal.
- **Panel Visual de Alertas:** Pantalla para administradores donde se listan de forma prioritaria los proyectos en estado de alerta (ej. Consumo crítico > 80% o Proyectos activos sin PO).

### 3.2. LO QUE NO INCLUYE (Out of Scope):
- Envío de correos automáticos o alertas vía WhatsApp/SMS (se evaluará para fases posteriores).
- Bloqueo automatizado de accesos o detención de operaciones en piso de manera forzosa (es una herramienta únicamente de monitoreo e información).
- Modificación directa o edición de las cotizaciones originales desde este dashboard (el control de cotizaciones se mantiene en su propio flujo/hojas).

## 4. Criterios de Aceptacion (Definition of Done)
Para que el proyecto se considere finalizado y se proceda a la autorizacion de pago, el Contratista debera cumplir a entera satisfaccion de la Direccion de Tecnologia con los siguientes entregables:

1. **Código Fuente:** Implementación de la lógica de alertas en backend (`api/`) y su correspondiente vista frontend.
2. **Base de Datos Actualizada:** Tablas y campos adicionales requeridos para soportar las autorizaciones verbales y límites temporales.
3. **Pruebas de Funcionamiento:** Evidencia de disparo de alerta visual al superar el 80% de consumo acumulado en un proyecto de prueba.
4. **Documentación:** Explicación técnica de la lógica de cálculo de porcentajes de consumo y configuraciones de alertas.

## 5. Cronograma e Hitos (Milestones)
- **Entrega de Insumos de Comercial a Produccion:** 17/06/2026
- **Revision y Aprobacion de SOW (Comercial):** 19/06/2026
- **Fecha de Inicio del Proyecto:** 22/06/2026
- **Revision de Avance (50%):** 01/07/2026 - Lógica de cálculo acumulado programada y base de datos con campos de autorización verbal listos.
- **Fecha de Entrega Final para QA:** 09/07/2026 - Panel de alertas integrado visualmente.
- **Validacion Comercial de MVP (frontend + funciones):** 13/07/2026 - Validación con el equipo administrativo (Soledad) y Comercial.

## 6. Condiciones Comerciales y de Pago
El presente proyecto se ejecutara bajo el esquema de precio cerrado (Fixed Price).

- **Monto Total Acordado:** [Monto acordado]
- **Condiciones de Liberacion:** El pago se procesara en una sola exhibicion en un plazo no mayor a 5 dias habiles posteriores a la validacion de los Criterios de Aceptacion (Seccion 4) por parte del CTO de Dataholics.
- **Modificaciones al Alcance:** Cualquier requerimiento adicional, modificacion sustancial o tarea no estipulada en la Seccion 3.1 debera ser cotizada, documentada y aprobada mediante un SOW independiente.

---

## Historial de Versiones de la Plantilla

| Version | Fecha | Autor | Descripcion |
|---------|-------|-------|--------------|
| 1.0.0 | 16/06/2026 | Antigravity AI | Versión inicial de SOW adaptada para el dashboard de control de saldos y alertas preventivas. |

---

### Firmas de Conformidad:
Al firmar este documento, ambas partes aceptan el alcance, los entregables y las condiciones comerciales descritas para la ejecucion de este proyecto.

________________________________________  
**Luis Morales**  
CTO / Cofundador - Dataholics  
Fecha: 

________________________________________  
**[Nombre del Contratista]**  
Desarrollador Independiente  
Fecha: 
