jul 7, 2026

## **BQS**

Archivos adjuntos [BQS](https://calendar.google.com/calendar/event?eid=N2RoNW9oZmdscW84NDQ5ZHVobnU3NTI0aWUgaXNpbGk5bHIzbW1mbm8wZHMwMWJmNjZkcTRAZw)

Registros de la reunión [Transcripción](https://docs.google.com/document/d/1AjzdLepZdKURzGbyyS3Y9OVoG-RvrVEuCBvYZ_Fd_E8/edit?usp=drive_web&tab=t.u61llb3tomee) [Grabación](https://drive.google.com/file/d/1t2sbgIUCCSrWH8l1nZl07Y1x27C_4u56/view?usp=drive_web) 

### **Resumen**

Se revisaron los flujos financieros y se aprobó la centralización de datos para automatizar los procesos manuales.

**Análisis de flujo financiero**  
El análisis del flujo de reporte desde el final hacia el inicio permitió entender el procesamiento de datos financieros. Se confirmó la segmentación de facturación basada en diferentes divisas y tipos de empresa.

**Centralización de información cliente**  
Se decidió centralizar el registro de clientes incluyendo tasas de impuestos y términos de pago para optimizar la carga de datos. Esto permitirá consultar información de manera permanente y eficiente.

**Automatización del sistema contable**  
El sistema permitirá la carga automatizada de archivos de formato Comma Separated Values y el procesamiento de complementos de pago mediante archivos XML. Esto elimina la necesidad de realizar conciliaciones manuales de facturas.

### **Próximos pasos**

- [ ] \[nomina bqs\] Enviar reporte facturación: Enviar al menos un mes de datos de facturación al sistema para identificar los campos recurrentes y crear el directorio de clientes con RFC, nombre y porcentaje de IVA.

- [ ] \[nomina bqs\] Compartir archivo exportación: Compartir por WhatsApp el archivo de exportación de facturación original en formato CSV para configurar el sistema de carga automática.

- [ ] \[Gustavo Ruiz (Dataholics)\] Desarrollar demo reporte: Desarrollar el demo del reporte basándose en la información proporcionada sobre la lógica de facturación y complementos de pago.

- [ ] \[Gustavo Ruiz (Dataholics)\] Agendar sesión revisión: Programar una sesión de revisión para el jueves o viernes de esta semana para validar el avance del demo con la usuaria antes de la reunión con Eric.

### **Detalles**

* **Objetivo del demo y análisis del flujo de reporte**: Gustavo Ruiz (Dataholics) inició la reunión definiendo el objetivo de perfilar los documentos actuales para ajustar la lógica de negocio del demo en desarrollo. Se acordó analizar el flujo de trabajo del reporte resumen desde el final hacia el inicio para entender cómo se procesan los datos antes de programar las reglas de negocio en el sistema ([00:00:00](?tab=t.u61llb3tomee#heading=h.54sbwbggt4b)).

* **Estructura del reporte y segmentación de clientes**: Se discutió que el reporte resume la información financiera separada por moneda (pesos y dólares), donde el lado izquierdo corresponde a clientes que cobran en pesos y el derecho a los que cobran en dólares ([00:01:19](?tab=t.u61llb3tomee#heading=h.gw9kw978g299)). Se confirmó que el total de facturación en MXN se deriva de los folios y que la información fluye desde el reporte hacia el sistema de resumen ([00:02:18](?tab=t.u61llb3tomee#heading=h.dvc6smajc3j4)).

* **Cálculo de impuestos y facturación**: Se estableció que el cálculo de impuestos (8% o 16%) varía según el tipo de empresa y las instrucciones recibidas en las órdenes de compra (PO) o correos electrónicos ([00:03:18](?tab=t.u61llb3tomee#heading=h.lk029whrfyqu)). Actualmente, esta información sobre qué tasa de IVA aplicar se gestiona manualmente según las especificaciones de cada cliente, ya sean maquiladoras o clientes foráneos dentro del territorio nacional ([00:04:06](?tab=t.u61llb3tomee#heading=h.hogwhk5igza4)).

* **Creación de un directorio de clientes**: Gustavo Ruiz (Dataholics) propuso centralizar la información de los clientes (RFC, receptor, tasa de IVA, y términos de pago) en un directorio único para optimizar la carga de datos ([00:04:57](?tab=t.u61llb3tomee#heading=h.5e6gzwn7t1w3)). Se planea que este directorio almacene datos permanentes, lo cual permitirá consultar información rápidamente y ahorrar tiempo, independientemente de lo que realice el producto mínimo viable (MVP) ([00:05:59](?tab=t.u61llb3tomee#heading=h.pxx4jitw6i1e)).

* **Gestión de términos de pago y órdenes de compra**: Se discutió que las fechas de pago varían según los términos específicos de cada cliente, con periodos comunes de 30, 60 o 90 días ([00:06:55](?tab=t.u61llb3tomee#heading=h.rq1gq5ipsmlm)). Además, nomina bqs explicó que muchos clientes requieren incluir el número de orden de compra (PO) en la factura para facilitar la relación y conciliación de los pagos ([00:07:52](?tab=t.u61llb3tomee#heading=h.ek689dloc62v)).

* **Automatización de la importación de datos**: El reporte generado por el sistema actual está en formato CSV, y Gustavo Ruiz (Dataholics) ofreció automatizar la carga de estos archivos directamente al sistema para eliminar la necesidad de captura manual ([00:08:46](?tab=t.u61llb3tomee#heading=h.3bba647tzpcm)). Se acordó que nomina bqs compartirá un ejemplo del archivo exportado para que el sistema pueda procesar los datos basándose en el formato existente ([00:09:30](?tab=t.u61llb3tomee#heading=h.kb1b5xbj1kwp)).

* **Generación automática de tablas y reportes**: El sistema automatizará la creación de la tabla concentrada que actualmente se elabora manualmente al ordenar los datos por cliente y divisa ([00:11:09](?tab=t.u61llb3tomee#heading=h.28ft8wvxrx98)). Gustavo Ruiz (Dataholics) planea incluir todos los campos del reporte original en la nueva herramienta, permitiendo que el usuario elija ocultar o eliminar las columnas que no necesite, facilitando la personalización del dashboard ([00:13:45](?tab=t.u61llb3tomee#heading=h.si4fb0o978wl)).

* **Procesamiento de complementos de pago**: Se analizó la complejidad de los complementos de pago, donde nomina bqs debe cotejar manualmente la información de las transferencias con los XML o PDFs para identificar qué facturas están siendo pagadas ([00:14:32](?tab=t.u61llb3tomee#heading=h.u84ovcqcrgni)). Gustavo Ruiz (Dataholics) propuso desarrollar una funcionalidad que permita cargar los archivos XML de los complementos para que el sistema identifique automáticamente las facturas asociadas, basándose en el folio y los montos ([00:18:07](?tab=t.u61llb3tomee#heading=h.51lhx6cotgb9)).

* **Pasos a seguir y planificación del demo**: Gustavo Ruiz (Dataholics) consultará con el equipo de desarrollo sobre la viabilidad técnica para procesar los XML de los complementos de pago ([00:22:11](?tab=t.u61llb3tomee#heading=h.medim6ekoh9z)). Se acordó programar una sesión de revisión del demo para este jueves o viernes, con el objetivo de perfeccionar la propuesta antes de presentarla a Eric la próxima semana ([00:25:21](?tab=t.u61llb3tomee#heading=h.c3f6tguerib3)).

*Revisa las notas de Gemini para asegurarte de que sean precisas. [Obtén sugerencias y descubre cómo Gemini toma notas](https://support.google.com/meet/answer/14754931)*

*Cómo es la calidad de **estas notas específicas?** [Responde una breve encuesta](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=h3E9xjfCGbfYkuTMR8fJDxIXOAIIigIgABgBCA&detailid=standard&screenshot=false) para darnos tu opinión; por ejemplo, cuán útiles te resultaron las notas.*