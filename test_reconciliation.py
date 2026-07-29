import xml.etree.ElementTree as ET
import csv
import io
import unittest
import sys

# =========================================================================
# LÓGICA DE NEGOCIO (RECONCILIATION ENGINE)
# =========================================================================

BQS_RFC = "BQS120813DF5"

class ReconciliationError(Exception):
    pass

def parsear_xml_pago(xml_string):
    """
    Parsea el complemento de pago XML (CFDI 4.0 / Pagos 2.0).
    Verifica que el emisor sea BQS y retorna el listado de documentos relacionados.
    """
    try:
        root = ET.fromstring(xml_string)
    except Exception as e:
        raise ReconciliationError(f"Error de parseo XML: {e}")

    ns = {
        'cfdi': 'http://www.sat.gob.mx/cfdi/4',
        'pago20': 'http://www.sat.gob.mx/Pagos20'
    }

    # Validación de Seguridad (Test 5): Validar que sea emitido por BQS
    emisor = root.find('.//cfdi:Emisor', ns)
    if emisor is None:
        raise ReconciliationError("El archivo XML no contiene información del emisor.")
    
    rfc_emisor = emisor.get('Rfc')
    if rfc_emisor != BQS_RFC:
        raise ReconciliationError("El archivo XML no pertenece a Best Quality Solutions (RFC emisor inválido)")

    pagos = root.findall('.//pago20:Pago', ns)
    resultados = []
    
    for pago in pagos:
        fecha_pago = pago.get('FechaPago').split('T')[0] # Extraer YYYY-MM-DD
        doctos = pago.findall('.//pago20:DoctoRelacionado', ns)
        for doc in doctos:
            resultados.append({
                'uuid': doc.get('IdDocumento'),
                'folio': doc.get('Folio'),
                'monto_pagado': float(doc.get('ImpPagado')),
                'saldo_insoluto': float(doc.get('ImpSaldoInsoluto')),
                'fecha_pago': fecha_pago
            })
            
    return resultados

def conciliar_cruce(csv_content, xml_string, logs_list=None):
    """
    Realiza el cruce de datos entre el CSV de facturas y la información del XML.
    Retorna la lista de facturas actualizadas.
    """
    if logs_list is None:
        logs_list = []
        
    # Leer el CSV (formato latin1)
    f = io.StringIO(csv_content)
    reader = csv.DictReader(f)
    facturas_db = {row['cfdiUUID']: row for row in reader if row.get('cfdiUUID')}
    
    # Parsear el XML
    pagos_relacionados = parsear_xml_pago(xml_string)
    
    facturas_actualizadas = []
    
    for pago in pagos_relacionados:
        uuid = pago['uuid']
        if uuid in facturas_db:
            factura = facturas_db[uuid]
            # Actualizar saldo y estado
            factura['FECHA DE PAGO'] = pago['fecha_pago']
            factura['MONTO PAGADO'] = str(pago['monto_pagado'])
            factura['SALDO PENDIENTE'] = str(pago['saldo_insoluto'])
            factura['ESTADO'] = "Pagado" if pago['saldo_insoluto'] == 0.0 else "Pago Parcial"
            facturas_actualizadas.append(factura)
        else:
            # Test 4: Tolerancia a Errores (UUID Huérfano)
            log_msg = f"Error de Conciliación: El UUID {uuid} no existe en el catálogo."
            logs_list.append(log_msg)
            
    return facturas_actualizadas, logs_list


# =========================================================================
# SUITE DE PRUEBAS AUTOMATIZADAS (PATRÓN AAA)
# =========================================================================

class TestReconciliationAAA(unittest.TestCase):

    def setUp(self):
        # Generar un CSV de base común para las pruebas
        self.csv_base_header = "Serie,Folio,cfdiUUID,Tipo,Receptor,RFC,Total,Moneda,FECHA DE PAGO,MONTO PAGADO,SALDO PENDIENTE,ESTADO\n"

    def test_1_happy_path(self):
        # --- Arrange (Preparar) ---
        csv_data = self.csv_base_header + (
            ",6151,51F5C13E-0869-4B40-AB83-DF36BC774978,Factura,SUNWAY PRECISION INDUSTRIES,XEXX010101000,450.00,Dolar americano,,,,Vigente\n"
        )
        xml_data = """<?xml version="1.0" encoding="utf-8"?>
        <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfdi/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" Version="4.0" Folio="6193">
            <cfdi:Emisor Rfc="BQS120813DF5" Nombre="BEST QUALITY SOLUTIONS MEXICO" />
            <cfdi:Receptor Rfc="XEXX010101000" Nombre="SUNWAY PRECISION INDUSTRIES" />
            <cfdi:Complemento>
                <pago20:Pagos Version="2.0">
                    <pago20:Pago FechaPago="2026-06-24T11:01:21" MonedaP="USD" Monto="450.00">
                        <pago20:DoctoRelacionado IdDocumento="51F5C13E-0869-4B40-AB83-DF36BC774978" Folio="6151" ImpPagado="450.00" ImpSaldoInsoluto="0.00"/>
                    </pago20:Pago>
                </pago20:Pagos>
            </cfdi:Complemento>
        </cfdi:Comprobante>"""

        # --- Act (Ejecutar) ---
        actualizadas, logs = conciliar_cruce(csv_data, xml_data)

        # --- Assert (Verificar) ---
        self.assertEqual(len(actualizadas), 1)
        factura_result = actualizadas[0]
        self.assertEqual(factura_result['Folio'], '6151')
        self.assertEqual(float(factura_result['SALDO PENDIENTE']), 0.00)
        self.assertEqual(factura_result['FECHA DE PAGO'], '2026-06-24')
        self.assertEqual(factura_result['ESTADO'], 'Pagado')

    def test_2_multifactura(self):
        # --- Arrange (Preparar) ---
        csv_data = self.csv_base_header + (
            ",1001,AAAA-1111,Factura,CLIENTE A,XAXX010101000,100.00,Dolar americano,,,,\n"
            ",1002,BBBB-2222,Factura,CLIENTE A,XAXX010101000,200.00,Dolar americano,,,,\n"
            ",1003,CCCC-3333,Factura,CLIENTE A,XAXX010101000,150.00,Dolar americano,,,,\n"
        )
        xml_data = """<?xml version="1.0" encoding="utf-8"?>
        <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfdi/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" Version="4.0" Folio="6193">
            <cfdi:Emisor Rfc="BQS120813DF5" Nombre="BEST QUALITY SOLUTIONS MEXICO" />
            <cfdi:Receptor Rfc="XAXX010101000" Nombre="CLIENTE A" />
            <cfdi:Complemento>
                <pago20:Pagos Version="2.0">
                    <pago20:Pago FechaPago="2026-06-24T11:01:21" MonedaP="USD" Monto="450.00">
                        <pago20:DoctoRelacionado IdDocumento="AAAA-1111" Folio="1001" ImpPagado="100.00" ImpSaldoInsoluto="0.00"/>
                        <pago20:DoctoRelacionado IdDocumento="BBBB-2222" Folio="1002" ImpPagado="200.00" ImpSaldoInsoluto="0.00"/>
                        <pago20:DoctoRelacionado IdDocumento="CCCC-3333" Folio="1003" ImpPagado="150.00" ImpSaldoInsoluto="0.00"/>
                    </pago20:Pago>
                </pago20:Pagos>
            </cfdi:Complemento>
        </cfdi:Comprobante>"""

        # --- Act (Ejecutar) ---
        actualizadas, logs = conciliar_cruce(csv_data, xml_data)

        # --- Assert (Verificar) ---
        self.assertEqual(len(actualizadas), 3)
        for fac in actualizadas:
            self.assertEqual(float(fac['SALDO PENDIENTE']), 0.00)
            self.assertEqual(fac['FECHA DE PAGO'], '2026-06-24')
            self.assertEqual(fac['ESTADO'], 'Pagado')

    def test_3_abono_parcial(self):
        # --- Arrange (Preparar) ---
        csv_data = self.csv_base_header + (
            ",6152,9E214A8A-A93B-4271-8C89-D4FDA6774431,Factura,APTIV SERVICES,APT010101000,1318.56,Dolar americano,,,,\n"
        )
        xml_data = """<?xml version="1.0" encoding="utf-8"?>
        <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfdi/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" Version="4.0" Folio="6193">
            <cfdi:Emisor Rfc="BQS120813DF5" Nombre="BEST QUALITY SOLUTIONS MEXICO" />
            <cfdi:Receptor Rfc="APT010101000" Nombre="APTIV SERVICES" />
            <cfdi:Complemento>
                <pago20:Pagos Version="2.0">
                    <pago20:Pago FechaPago="2026-06-24T11:01:21" MonedaP="USD" Monto="500.00">
                        <pago20:DoctoRelacionado IdDocumento="9E214A8A-A93B-4271-8C89-D4FDA6774431" Folio="6152" ImpPagado="500.00" ImpSaldoInsoluto="818.56"/>
                    </pago20:Pago>
                </pago20:Pagos>
            </cfdi:Complemento>
        </cfdi:Comprobante>"""

        # --- Act (Ejecutar) ---
        actualizadas, logs = conciliar_cruce(csv_data, xml_data)

        # --- Assert (Verificar) ---
        self.assertEqual(len(actualizadas), 1)
        self.assertEqual(float(actualizadas[0]['SALDO PENDIENTE']), 818.56)
        self.assertEqual(actualizadas[0]['ESTADO'], 'Pago Parcial')

    def test_4_uuid_huerfano(self):
        # --- Arrange (Preparar) ---
        csv_data = self.csv_base_header + (
            ",1001,AAAA-1111,Factura,CLIENTE A,XAXX010101000,100.00,Dolar americano,,,,\n"
        )
        xml_data = """<?xml version="1.0" encoding="utf-8"?>
        <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfdi/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" Version="4.0" Folio="6193">
            <cfdi:Emisor Rfc="BQS120813DF5" Nombre="BEST QUALITY SOLUTIONS MEXICO" />
            <cfdi:Receptor Rfc="XAXX010101000" Nombre="CLIENTE A" />
            <cfdi:Complemento>
                <pago20:Pagos Version="2.0">
                    <pago20:Pago FechaPago="2026-06-24T11:01:21" MonedaP="USD" Monto="450.00">
                        <pago20:DoctoRelacionado IdDocumento="UUID-INVENTADO-9999" Folio="1002" ImpPagado="450.00" ImpSaldoInsoluto="0.00"/>
                    </pago20:Pago>
                </pago20:Pagos>
            </cfdi:Complemento>
        </cfdi:Comprobante>"""

        # --- Act (Ejecutar) ---
        # El sistema no debe crashar, sino agregar una alerta en la bitácora
        logs = []
        actualizadas, logs = conciliar_cruce(csv_data, xml_data, logs)

        # --- Assert (Verificar) ---
        self.assertEqual(len(actualizadas), 0)
        self.assertEqual(len(logs), 1)
        self.assertIn("Error de Conciliación: El UUID UUID-INVENTADO-9999 no existe en el catálogo.", logs[0])

    def test_5_rfc_invalido(self):
        # --- Arrange (Preparar) ---
        csv_data = self.csv_base_header + (
            ",1001,AAAA-1111,Factura,CLIENTE A,XAXX010101000,100.00,Dolar americano,,,,\n"
        )
        # XML de otra empresa (Rfc="OTRO990909AA1")
        xml_data = """<?xml version="1.0" encoding="utf-8"?>
        <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfdi/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" Version="4.0" Folio="6193">
            <cfdi:Emisor Rfc="OTRO990909AA1" Nombre="OTRA EMPRESA SA" />
            <cfdi:Receptor Rfc="XAXX010101000" Nombre="CLIENTE A" />
            <cfdi:Complemento>
                <pago20:Pagos Version="2.0">
                    <pago20:Pago FechaPago="2026-06-24T11:01:21" MonedaP="USD" Monto="450.00">
                        <pago20:DoctoRelacionado IdDocumento="AAAA-1111" Folio="1001" ImpPagado="450.00" ImpSaldoInsoluto="0.00"/>
                    </pago20:Pago>
                </pago20:Pagos>
            </cfdi:Complemento>
        </cfdi:Comprobante>"""

        # --- Act & Assert (Ejecutar y verificar rechazo) ---
        with self.assertRaises(ReconciliationError) as context:
            parsear_xml_pago(xml_data)
            
        self.assertIn("El archivo XML no pertenece a Best Quality Solutions", str(context.exception))

if __name__ == '__main__':
    unittest.main()
