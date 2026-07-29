# DOCUMENTO DE ALCANCE Y DECLARACION DE TRABAJO (SOW)
# Executive Accounts Receivable and Billing Portal

**Empresa Contratante:** Dataholics  
**Version de SOW:** 1.0.0  
**Nombre del Proyecto:** BQS Executive Accounts Receivable and Billing Portal (Portal Ejecutivo de CXC y Facturación BQS)  
**Fecha de Elaboracion:** 16/06/2026  
**Contratista / Desarrollador:** Profesional Independiente  
**Aprobador Tecnico:** Luis Morales (CTO)

---

## 1. Objetivo del Proyecto
Desarrollar un portal ejecutivo amigable para móviles y navegadores web que permita a la dirección general de Best Quality Solutions (BQS) visualizar y responder en tiempo real tres preguntas financieras críticas en la palma de su mano:
1. **¿Qué ya se facturó?** (Control exacto del ingreso asegurado).
2. **¿Qué falta por facturar?** (Identificación de servicios terminados devengados pero no facturados para que no se quede dinero sobre la mesa).
3. **¿Cuánto dinero exacto te deben?** (Saldos reales de cuentas por cobrar para toma de decisiones comerciales).

El sistema consolida la información dispersa de múltiples hojas de cálculo de Excel en una base de datos maestra con identificadores únicos estandarizados (Tier 0).

### 1.1 Flujo obligatorio Comercial -> Produccion
Este proyecto se rige por el siguiente ciclo de validacion para asegurar alineacion con el cliente:

1. Comercial entrega a Produccion toda la informacion de contexto, alcance, objetivos y prioridades del cliente antes de iniciar el MVP.
2. Produccion genera el SOW con base en dichos insumos.
3. Produccion y Comercial revisan conjuntamente el SOW hasta confirmar que representa lo que busca el cliente.
4. Con SOW aprobado por Comercial, Produccion desarrolla el MVP.
5. MVP terminado: Produccion lo regresa a Comercial para validar frontend y funcionalidades.
6. Se realiza una ultima pasada de ajustes antes de presentar al cliente.

## 2. Stack Tecnologico Requerido
- **Frontend / Aplicación:** HTML5 + Vanilla JS / Alpine.js (Mobile & Web responsive) con estilos en TailwindCSS.
- **Base de Datos / Backend:** Base de datos relacional MySQL hospedada en servidor Site5 de Dataholics, expuesta mediante API RESTful en CodeIgniter 4 con seguridad Shield.
- **Hosting/Despliegue:** Site5 / cPanel (directorio `public_html` para frontend estático y carpeta superior para backend en CodeIgniter 4).

## 3. Alcance del Proyecto (Scope)

### 3.1. LO QUE SI INCLUYE (In Scope):
- **Estandarización y Normalización de Datos (Tier 0):** Consolidación de archivos administrativos de BQS y asignación de un ID Único inalterable a cada cliente e inspector para unificar variantes de texto (p. ej., "NIDEC Mobility" y "NIDEC México" bajo el mismo ID).
- **Módulo de Consultas Ejecutivas en el Celular (Tier 1):**
  - **Sección 1: ¿Qué ya se facturó?** Control exacto y en tiempo real del ingreso asegurado en el mes.
  - **Sección 2: ¿Qué falta por facturar?** Identificación al instante de servicios terminados pendientes de facturar.
  - **Sección 3: ¿Cuánto dinero exacto te deben?** Seguimiento de saldos reales de cobranza de clientes.
- **Conexión de Datos Directa:** Comunicación asíncrona segura mediante peticiones fetch/axios desde el frontend estático a la API RESTful de CodeIgniter 4 conectada a MySQL.

### 3.2. LO QUE NO INCLUYE (Out of Scope):
- Procesamiento directo de pagos o pasarelas de pago integradas (Stripe, SPEI, etc.).
- Conciliación bancaria automatizada con cuentas de banco en vivo.
- Facturación electrónica directa (conexión directa a PAC para timbrado).
- Captura de reportes diarios en piso desde esta app (en pausa estratégica en Tiers 2 y 3).
- Tablero de alertas preventivas de sobre-sorteo (en pausa estratégica en Tiers 2 y 3).

## 4. Criterios de Aceptacion (Definition of Done)
Para que el proyecto se considere finalizado y se proceda a la autorizacion de pago, el Contratista debera cumplir a entera satisfaccion de la Direccion de Tecnologia con los siguientes entregables:

1. **Código Fuente / Configuración de la App:** Aplicación configurada y accesible en el entorno acordado sin errores críticos de visualización o fórmulas rotas.
2. **Hojas de Cálculo Estructuradas:** Google Sheet maestro operando bajo el esquema relacional de IDs únicos definido, sincronizando correctamente con la app.
3. **Documentación Técnica obligatoria:**
   - Instrucciones de actualización y mantenimiento de la estructura de datos (Google Sheets).
   - Diagrama de flujo de sincronización de datos.

## 5. Cronograma e Hitos (Milestones)
- **Entrega de Insumos de Comercial a Produccion:** 17/06/2026
- **Revision y Aprobacion de SOW (Comercial):** 19/06/2026
- **Fecha de Inicio del Proyecto:** 22/06/2026
- **Revision de Avance (50%):** 29/06/2026 - Revisión de la normalización del catálogo y primeras pantallas del portal.
- **Fecha de Entrega Final para QA:** 06/07/2026 - Entrega para revisión de calidad y validación de datos frente a hojas fuente.
- **Validacion Comercial de MVP (frontend + funciones):** 09/07/2026 - Validación final con Comercial antes de la presentación a Eric.

## 6. Condiciones Comerciales y de Pago
El presente proyecto se ejecutara bajo el esquema de precio cerrado (Fixed Price).

- **Monto Total Acordado:** [Monto acordado]
- **Condiciones de Liberacion:** El pago se procesara en una sola exhibicion en un plazo no mayor a 5 dias habiles posteriores a la validacion de los Criterios de Aceptacion (Seccion 4) por parte del CTO de Dataholics y la recepcion de la factura o recibo de honorarios correspondiente.
- **Modificaciones al Alcance:** Cualquier requerimiento adicional, modificacion sustancial o tarea no estipulada en la Seccion 3.1 debera ser cotizada, documentada y aprobada mediante un SOW independiente.

---

## Historial de Versiones de la Plantilla

| Version | Fecha | Autor | Descripcion |
|---------|-------|-------|--------------|
| 1.0.0 | 16/06/2026 | Antigravity AI | Versión inicial de SOW de proyecto basada en la validación y pivotaje operativo. |

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
