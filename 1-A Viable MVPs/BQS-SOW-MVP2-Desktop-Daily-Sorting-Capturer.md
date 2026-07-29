# DOCUMENTO DE ALCANCE Y DECLARACION DE TRABAJO (SOW)
# Desktop Daily Sorting Capturer

**Empresa Contratante:** Dataholics  
**Version de SOW:** 1.0.0  
**Nombre del Proyecto:** BQS Desktop Daily Sorting Capturer (Capturador de Escritorio de Sorteo Diario BQS)  
**Fecha de Elaboracion:** 16/06/2026  
**Contratista / Desarrollador:** Profesional Independiente  
**Aprobador Tecnico:** Luis Morales (CTO)

---

## 1. Objetivo del Proyecto
Desarrollar una aplicación web de escritorio optimizada para la transcripción y captura de reportes diarios de inspección. Esta herramienta será utilizada por la capturista (Lourdes) y el supervisor (Juan Manuel) de forma centralizada al final de la jornada de trabajo. Resuelve el cuello de botella causado por fotos de reportes en papel borrosas/ilegibles compartidas por WhatsApp y previene errores matemáticos mediante validación de datos y cálculos automatizados.

### 1.1 Flujo obligatorio Comercial -> Produccion
Este proyecto se rige por el siguiente ciclo de validacion para asegurar alineacion con el cliente:

1. Comercial entrega a Produccion toda la informacion de contexto, alcance, objetivos y prioridades del cliente antes de iniciar el MVP.
2. Produccion genera el SOW con base en dichos insumos.
3. Produccion y Comercial revisan conjuntamente el SOW hasta confirmar que representa lo que busca el cliente.
4. Con SOW aprobado por Comercial, Produccion desarrolla el MVP.
5. MVP terminado: Produccion lo regresa a Comercial para validar frontend y funcionalidades.
6. Se realiza una ultima pasada de ajustes antes de presentar al cliente.

## 2. Stack Tecnologico Requerido
- **Backend API:** CodeIgniter 4 (PHP 8.1+)
- **Frontend:** HTML5 + Alpine.js + Tailwind CSS
- **Base de datos:** MySQL
- **Hosting/Deploy:** Site5 / cPanel de Dataholics.

## 3. Alcance del Proyecto (Scope)

### 3.1. LO QUE SI INCLUYE (In Scope):
- **Formulario de Registro Estructurado (Desktop):** Interfaz web optimizada para teclado numérico y navegación rápida que permita transcribir los reportes diarios de inspección rápidamente.
- **Validación Matemática en Tiempo Real:** Automatización de cálculos matemáticos (ej: suma de piezas aprobadas + piezas rechazadas + scrap debe ser igual al total sorteado) y campos obligatorios para evitar sumas erróneas.
- **Catálogo Unificado de Inspectores y Números de Parte:** Identificación inequívoca de inspectores y piezas a través de IDs fijos y autocompletado para evitar variaciones de nombres.
- **Aislamiento de Datos por Proyecto:** Permite asociar las capturas a proyectos/cotizaciones específicas de forma directa.

### 3.2. LO QUE NO INCLUYE (Out of Scope):
- Interfaz nativa para móviles o pantallas táctiles pequeñas para uso en piso de producción.
- Funcionalidades offline o almacenamiento local persistente en caso de caída prolongada de internet (requiere conexión activa al servidor).
- Lector de código de barras o reconocimiento óptico de caracteres (OCR) sobre los reportes físicos de papel.

## 4. Criterios de Aceptacion (Definition of Done)
Para que el proyecto se considere finalizado y se proceda a la autorizacion de pago, el Contratista debera cumplir a entera satisfaccion de la Direccion de Tecnologia con los siguientes entregables:

1. **Código Fuente:** Entregado y subido al repositorio privado de Dataholics, estructurado en carpetas `api/` y `public_html/`.
2. **Esquema de Base de Datos:** Script SQL (`database.sql`) con la estructura de tablas para reportes diarios, inspectores y partes.
3. **Pruebas de Funcionamiento:** Demostración de captura de un reporte completo sin errores y con validaciones automáticas activas.
4. **Documentación:** Archivo README con instrucciones de despliegue en Site5.

## 5. Cronograma e Hitos (Milestones)
- **Entrega de Insumos de Comercial a Produccion:** 17/06/2026
- **Revision y Aprobacion de SOW (Comercial):** 19/06/2026
- **Fecha de Inicio del Proyecto:** 22/06/2026
- **Revision de Avance (50%):** 30/06/2026 - Backend API funcional y base de datos MySQL desplegada.
- **Fecha de Entrega Final para QA:** 08/07/2026 - Frontend del capturador integrado con validaciones en Alpine.js.
- **Validacion Comercial de MVP (frontend + funciones):** 10/07/2026 - Validación final de usabilidad con Lourdes y Comercial.

## 6. Condiciones Comerciales y de Pago
El presente proyecto se ejecutara bajo el esquema de precio cerrado (Fixed Price).

- **Monto Total Acordado:** [Monto acordado]
- **Condiciones de Liberacion:** El pago se procesara en una sola exhibicion en un plazo no mayor a 5 dias habiles posteriores a la validacion de los Criterios de Aceptacion (Seccion 4) por parte del CTO de Dataholics.
- **Modificaciones al Alcance:** Cualquier requerimiento adicional, modificacion sustancial o tarea no estipulada en la Seccion 3.1 debera ser cotizada, documentada y aprobada mediante un SOW independiente.

---

## Historial de Versiones de la Plantilla

| Version | Fecha | Autor | Descripcion |
|---------|-------|-------|--------------|
| 1.0.0 | 16/06/2026 | Antigravity AI | Versión inicial de SOW adaptada para el capturador de escritorio centralizado. |

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
