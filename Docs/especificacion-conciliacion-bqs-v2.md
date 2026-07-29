# Especificación Técnica Completa: Automatización de Conciliación y Suite de Pruebas
**Versión:** 2.0 (Mejorada e Integrada)  
**Proyecto:** Módulo de Conciliación y Directorio de Clientes (Tier 0 & Tier 1)  
**Preparado por:** Dataholics (Gustavo Ruiz)  
**Para:** Equipo de Desarrollo de Software / Arquitectos de BQS  

---

## 1. Introducción y Contexto del Negocio

En Best Quality Solutions (BQS), el flujo contable actual se ve entorpecido por una desconexión crítica entre el sistema de facturación y el registro manual de cobros. 
*   **La fricción:** Elvia (Contabilidad) exporta mensualmente un archivo **CSV** desde su sistema de facturación (SATO). En este archivo, los complementos de pago figuran con un `Total` de `0.00` y sin detalles de qué facturas cubren. 
*   **La solución:** El sistema debe automatizar la lectura de los archivos **XML** de los complementos de pago cargados por el usuario, extraer las relaciones de cobranza (UUIDs de facturas y montos aplicados) y actualizar automáticamente los saldos pendientes de la base de datos de facturas (del CSV).

Este documento sirve como la **especificación técnica final** para el desarrollador, integrando la lógica de cruce de datos, el diseño conceptual de la suite de pruebas bajo el estándar **Arrange-Act-Assert (AAA)**, y un prototipo funcional en Python para acelerar el desarrollo.

---

## 2. Estructura de Datos y Claves de Cruce

### A. Estructura de Entrada 1: Catálogo de Facturación (Archivo CSV)
El archivo CSV consolidado contiene el historial de transacciones mensuales. El desarrollador debe procesar este archivo como la base de datos de facturas vigentes.

| Columna en CSV | Propósito Técnico | Ejemplo de Datos |
| :--- | :--- | :--- |
| `cfdiUUID` | **Clave primaria de cruce**. Identificador único de la factura. | `51F5C13E-0869-4B40-AB83-DF36BC774978` |
| `Folio` | Folio interno asignado a la factura. | `6151` |
| `Tipo` | Identifica el tipo de documento. Filtrar por `Factura`. | `Factura` / `Complemento de Pagos` |
| `Receptor` | Razón social del cliente. | `SUNWAY PRECISION INDUSTRIES` |
| `RFC` | Registro Federal de Contribuyentes. | `XEXX010101000` |
| `Total` | Monto facturado en la divisa original. | `450.00` |
| `Moneda` | Moneda original de emisión. | `Dolar americano` o `Peso Mexicano` |

---

### B. Estructura de Entrada 2: Complemento de Pago (Archivo XML)
El XML cumple con el estándar de Recepción de Pagos (CFDI 4.0) del SAT. El desarrollador debe extraer la información utilizando los namespaces `cfdi:` y `pago20:`.

#### 1. Atributos de cabecera del pago (`<pago20:Pago>`)
*   `FechaPago`: Fecha real de la transferencia del cliente (ej. `2026-06-24T11:01:21`).
*   `MonedaP`: Moneda con la que se pagó (ej. `USD`).
*   `Monto`: Monto total de la transferencia (ej. `450.00`).
*   `TipoCambioP`: Tipo de cambio de la operación (ej. `20.910000`).

#### 2. Atributos de documentos relacionados (`<pago20:DoctoRelacionado>`)
Representa cada factura liquidada con este pago (relación 1-a-Muchos):
*   `IdDocumento`: **UUID de la factura pagada** (Cruza contra `cfdiUUID` del CSV).
*   `Folio`: Folio de la factura relacionada (ej. `6151`).
*   `ImpPagado`: Monto específico aplicado a esta factura (ej. `450.00`).
*   `ImpSaldoInsoluto`: Saldo restante tras el pago (ej. `0.00` indica liquidación completa).

---

## 3. Algoritmo Maestro de Conciliación

```
                   [ Cargar CSV de Facturas ]
                               │
                   [ Cargar XML de Pago ]
                               │
                  Para cada <DoctoRelacionado>:
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   ¿IdDocumento coincide                 ¿IdDocumento NO coincide
    con cfdiUUID del CSV?                 con cfdiUUID del CSV?
            │                                     │
            ▼                                     ▼
Actualizar base de datos:                  Registrar alerta en log:
- FECHA DE PAGO = FechaPago XML            "Alerta: Factura con UUID
- MONTO PAGADO = ImpPagado XML             {UUID} no encontrada en
- SALDO PENDIENTE = ImpSaldoInsoluto       el catálogo mensual."
- ESTADO = Saldo == 0 ? "Pagado" 
                      : "Pago Parcial"
```

---

## 4. Suite de Pruebas Automatizadas (Patrón AAA)

Para garantizar la estabilidad del software, el desarrollador debe implementar los siguientes casos de prueba utilizando el patrón **Arrange, Act, Assert (AAA)**. Esto aísla el comportamiento de negocio y previene regresiones.

### Test 1: Camino Feliz (Conciliación Exitosa 1-a-1)
*   **Objetivo:** Validar que una factura vigente se liquide completamente cuando el XML de pago coincide en monto y UUID.
*   **Arrange (Preparar):**
    *   Registrar una factura en el sistema con `cfdiUUID = "51F5C13E-0869-4B40-AB83-DF36BC774978"`, `Folio = "6151"`, y saldo pendiente de **$450.00 USD**.
    *   Simular la carga del XML del complemento `BA14D31B-CE9E-490A-B86F-1FBB00445F10` que contiene un nodo `DoctoRelacionado` con `IdDocumento = "51F5C13E-0869-4B40-AB83-DF36BC774978"`, `ImpPagado = "450.00"`, e `ImpSaldoInsoluto = "0.00"`.
*   **Act (Ejecutar):**
    *   Invocar la función `conciliar_pago(csv_data, xml_data)`.
*   **Assert (Verificar):**
    *   El saldo insoluto de la factura `6151` en la base de datos debe ser exactamente **$0.00 USD**.
    *   La columna `FECHA DE PAGO` debe actualizarse automáticamente a **2026-06-24** (extraída de la transferencia).
    *   El estado de la factura en el Tablero Ejecutivo debe cambiar a **PAGADA**.

### Test 2: Soporte Multifactura (Conciliación 1-a-Muchos)
*   **Objetivo:** Confirmar que una sola transferencia bancaria (un solo XML) puede conciliar múltiples facturas a la vez, tal como ocurre en el flujo real de Elvia.
*   **Arrange (Preparar):**
    *   Registrar tres facturas en la base de datos:
        *   Factura A (UUID: `AAAA-1111`, Folio: `1001`, Saldo: `$100.00 USD`)
        *   Factura B (UUID: `BBBB-2222`, Folio: `1002`, Saldo: `$200.00 USD`)
        *   Factura C (UUID: `CCCC-3333`, Folio: `1003`, Saldo: `$150.00 USD`)
    *   Simular un XML de pago con un monto total de **$450.00 USD** que contiene tres nodos `DoctoRelacionado`:
        *   Doc 1: `IdDocumento = "AAAA-1111"`, `ImpPagado = "100.00"`
        *   Doc 2: `IdDocumento = "BBBB-2222"`, `ImpPagado = "200.00"`
        *   Doc 3: `IdDocumento = "CCCC-3333"`, `ImpPagado = "150.00"`
*   **Act (Ejecutar):**
    *   Procesar el XML multifactura en el módulo de conciliación.
*   **Assert (Verificar):**
    *   Las tres facturas en el sistema deben actualizarse individualmente a **$0.00** de saldo pendiente.
    *   Cada registro debe recibir la misma fecha de pago correspondiente al complemento.

### Test 3: Pago Parcial o Abono (Saldos Insolutos)
*   **Objetivo:** Asegurar que un abono parcial mantenga el control correcto de saldos sin marcar la factura como liquidada.
*   **Arrange (Preparar):**
    *   Registrar una factura con `cfdiUUID = "9E214A8A-A93B-4271-8C89-D4FDA6774431"` (Aptiv Services) con un saldo de **$1,318.56 USD**.
    *   Simular un XML de pago que relaciona dicho UUID pero con un `ImpPagado = "500.00"` e `ImpSaldoInsoluto = "818.56"`.
*   **Act (Ejecutar):**
    *   Ejecutar el proceso de conciliación.
*   **Assert (Verificar):**
    *   El saldo de la factura debe actualizarse a exactamente **$818.56 USD**.
    *   El estado del documento debe marcarse como **PAGO PARCIAL** en el portal administrativo, previniendo que se archive antes de liquidarse.

### Test 4: Tolerancia a Errores (UUID Huérfano)
*   **Objetivo:** Validar que si el XML tiene un UUID que no existe en nuestro CSV, el sistema registre el error en logs pero no detenga el proceso de forma catastrófica (anti-patrón de caída).
*   **Arrange (Preparar):**
    *   Preparar un XML de pago con un UUID inexistente: `UUID-INVENTADO-9999`.
*   **Act (Ejecutar):**
    *   Procesar la conciliación.
*   **Assert (Verificar):**
    *   El sistema no debe arrojar una excepción no controlada (`Crash`).
    *   Se debe generar una entrada en la bitácora de auditoría indicando: *"Error de Conciliación: El UUID UUID-INVENTADO-9999 no existe en el catálogo."*

### Test 5: Seguridad e Integridad (Validación de RFC)
*   **Objetivo:** Impedir la carga accidental de XML de pagos de otras empresas o RFCs ajenos a Best Quality Solutions.
*   **Arrange (Preparar):**
    *   Cargar un XML de pago emitido a un RFC receptor diferente al de BQS (`BQS120813DF5`).
*   **Act (Ejecutar):**
    *   Intentar procesar la carga del XML.
*   **Assert (Verificar):**
    *   La aplicación debe rechazar inmediatamente el archivo.
    *   Debe arrojar un error de validación claro en pantalla: *"El archivo XML no pertenece a Best Quality Solutions (RFC receptor inválido)"*.

---

## 5. El Cimiento (Tier 0): Catálogo de Clientes y Reglas de Validación

Para evitar errores en el parseo, la base de datos debe implementar un catálogo estricto de clientes para evitar variaciones de nombres (ej. "Nidec Mexico" vs. "Nidec Mobility").

1.  **Regla de Identificación Única:** Cada cliente debe estar registrado con su **RFC** oficial y un **ID Interno**. El sistema debe mapear las razones sociales contra el RFC antes de asociar el cobro.
2.  **Validación de IVA:** El directorio debe predeterminar el tipo de IVA por cliente según la zona geográfica (8% para Maquiladoras de la frontera, 16% para Clientes Nacionales/Foráneos), alertando en administración si el XML de cobro tiene discrepancias de impuestos con la orden de compra (PO) correspondiente.

---

## 6. Prototipo de Implementación en Python (Script de Prueba)

El siguiente script en Python utiliza únicamente librerías estándar para que el equipo de desarrollo pueda validar el flujo y las expresiones XPath de inmediato:

```python
import xml.etree.ElementTree as ET
import csv
import json

# XML de complemento de pago simplificado (Datos reales de Sunway Precision)
xml_data = """<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfdi/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" Version="4.0" Folio="6193">
    <cfdi:Receptor Rfc="XEXX010101000" Nombre="SUNWAY PRECISION INDUSTRIES" RegimenFiscalReceptor="616" UsoCFDI="CP01"/>
    <cfdi:Complemento>
        <pago20:Pagos Version="2.0">
            <pago20:Pago FechaPago="2026-06-24T11:01:21" MonedaP="USD" Monto="450.00" TipoCambioP="20.910000">
                <pago20:DoctoRelacionado IdDocumento="51F5C13E-0869-4B40-AB83-DF36BC774978" Folio="6151" MonedaDR="USD" ImpPagado="450.00" ImpSaldoInsoluto="0.00"/>
            </pago20:Pago>
        </pago20:Pagos>
    </cfdi:Complemento>
</cfdi:Comprobante>"""

def parsear_xml_complemento(xml_string):
    """
    Parsea el complemento de pago extrayendo los UUIDs de facturas
    asociadas y los montos correspondientes.
    """
    root = ET.fromstring(xml_string)
    
    # Namespaces estándar CFDI 4.0 y Pagos 2.0
    ns = {
        'cfdi': 'http://www.sat.gob.mx/cfdi/4',
        'pago20': 'http://www.sat.gob.mx/Pagos20'
    }
    
    resultados_pago = []
    
    # Validar RFC receptor
    receptor = root.find('.//cfdi:Receptor', ns)
    rfc_receptor = receptor.get('Rfc') if receptor is not None else None
    
    # Buscar el nodo de Pagos
    pagos = root.findall('.//pago20:Pago', ns)
    for pago in pagos:
        fecha_pago = pago.get('FechaPago').split('T')[0] # Extraer solo fecha YYYY-MM-DD
        
        # Buscar los documentos relacionados en el pago
        doctos_relacionados = pago.findall('.//pago20:DoctoRelacionado', ns)
        for doc in doctos_relacionados:
            relacion = {
                'rfc_receptor': rfc_receptor,
                'fecha_pago': fecha_pago,
                'factura_uuid': doc.get('IdDocumento'),
                'folio_relacionado': doc.get('Folio'),
                'monto_pagado': float(doc.get('ImpPagado')),
                'saldo_insoluto': float(doc.get('ImpSaldoInsoluto'))
            }
            resultados_pago.append(relacion)
            
    return resultados_pago

# Ejecutar el parser de prueba
if __name__ == "__main__":
    print("--- INICIANDO PARSEO DE PRUEBA XML COMPLEMENTO ---")
    datos_extraidos = parsear_xml_complemento(xml_data)
    print(json.dumps(datos_extraidos, indent=4, ensure_ascii=False))
```

Este script demuestra que el mapeo de datos se realiza de forma limpia y transparente, sirviendo de base directa para la codificación del backend del portal ejecutivo.
