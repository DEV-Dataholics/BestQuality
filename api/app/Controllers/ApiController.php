<?php

namespace App\Controllers;

use App\Models\ClienteModel;
use App\Models\CotizacionModel;
use App\Models\SorteoModel;
use App\Models\FacturaModel;
use App\Models\PagoModel;
use CodeIgniter\API\ResponseTrait;

class ApiController extends BaseController
{
    use ResponseTrait;

    public function initController(\CodeIgniter\HTTP\RequestInterface $request, \CodeIgniter\HTTP\ResponseInterface $response, \Psr\Log\LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);
        
        // Auto-alter column Evidencia if it doesn't exist
        $db = \Config\Database::connect();
        if (!$db->fieldExists('Evidencia', 'COTIZACIONES')) {
            $db->query("ALTER TABLE COTIZACIONES ADD COLUMN Evidencia TEXT DEFAULT NULL");
        }
    }

    protected $bqsRfc = "BQS120813DF5";

    // ------------------------------------------------------------------------
    // ENDPOINT: Login / Whitelist Check
    // ------------------------------------------------------------------------
    public function login()
    {
        $email = $this->request->getPost('email');
        if (empty($email)) {
            return $this->fail('El correo electrónico es requerido.');
        }

        // Whitelist del MVP
        $whitelist = [
            'eric@bestqualitysolutions.com',
            'admin@bestqualitysolutions.com',
            'facturacion@bestqualitysolutions.com',
            'capturista@bestqualitysolutions.com'
        ];

        if (in_array(strtolower($email), $whitelist)) {
            // Guardar en sesión
            session()->set('user_email', strtolower($email));
            return $this->respond([
                'status' => 'success',
                'email'  => $email,
                'role'   => strtolower($email) === 'eric@bestqualitysolutions.com' ? 'owner' : 'admin'
            ]);
        }

        return $this->failUnauthorized('El correo no se encuentra en la lista de acceso autorizado (Whitelist).');
    }

    public function logout()
    {
        session()->destroy();
        return $this->respond(['status' => 'success']);
    }

    // ------------------------------------------------------------------------
    // ENDPOINT: Dashboard / Resumen (Las 3 Preguntas de Eric)
    // ------------------------------------------------------------------------
    public function dashboard()
    {
        $facturaModel = new FacturaModel();
        $sorteoModel = new SorteoModel();
        $pagoModel = new PagoModel();

        // 1. ¿Qué ya se facturó? (Mes en curso, Vigente o Pagada)
        $firstDayOfMonth = date('Y-m-01');
        $lastDayOfMonth = date('Y-m-t');

        $queryFacturado = $facturaModel->db->query("
            SELECT SUM(Monto_Total) AS total 
            FROM FACTURAS 
            WHERE Fecha_Emision >= ? AND Fecha_Emision <= ? 
            AND Estatus_Pago IN ('Vigente', 'Pagada')
        ", [$firstDayOfMonth, $lastDayOfMonth])->getRow();
        
        $facturadoMes = $queryFacturado->total ?? 0.00;

        // 2. ¿Qué falta por facturar? (Trabajo Devengado no Facturado)
        $queryDevengado = $sorteoModel->db->query("
            SELECT SUM(Monto_Devengado) AS total 
            FROM BITACORA_SORTEO 
            WHERE Estatus_Facturacion = 'Pendiente'
        ")->getRow();
        
        $faltaFacturar = $queryDevengado->total ?? 0.00;

        // 3. ¿Cuánto dinero te deben? (Facturas activas - Pagos aplicados)
        // Tomamos todas las facturas Vigentes o Vencidas y restamos sus pagos
        $queryFacturasActivas = $facturaModel->db->query("
            SELECT Folio_Factura, Monto_Total 
            FROM FACTURAS 
            WHERE Estatus_Pago IN ('Vigente', 'Vencida')
        ")->getResultArray();

        $saldoDeudor = 0.00;
        foreach ($queryFacturasActivas as $fac) {
            $queryPagos = $pagoModel->db->query("
                SELECT SUM(Monto_Pagado) AS total_pagado 
                FROM PAGOS 
                WHERE Folio_Factura = ?
            ", [$fac['Folio_Factura']])->getRow();
            
            $pagado = $queryPagos->total_pagado ?? 0.00;
            $saldoDeudor += ($fac['Monto_Total'] - $pagado);
        }

        // Desglose por cotización para la sección "¿Qué falta por facturar?"
        $desgloseFaltaFacturar = $sorteoModel->db->query("
            SELECT 
                c.ID_Cotizacion,
                cl.Nombre_Comercial AS Cliente,
                COUNT(s.ID_Captura) AS Capturas,
                SUM(s.Monto_Devengado) AS Pendiente
            FROM BITACORA_SORTEO s
            INNER JOIN COTIZACIONES c ON s.ID_Cotizacion = c.ID_Cotizacion
            INNER JOIN CAT_CLIENTES cl ON c.ID_Cliente = cl.ID_Cliente
            WHERE s.Estatus_Facturacion = 'Pendiente'
            GROUP BY c.ID_Cotizacion, cl.Nombre_Comercial
        ")->getResultArray();

        return $this->respond([
            'resumen' => [
                'facturado_mes'  => (float)$facturadoMes,
                'falta_facturar' => (float)$faltaFacturar,
                'deuda_total'    => (float)$saldoDeudor
            ],
            'desglose_por_facturar' => $desgloseFaltaFacturar
        ]);
    }

    // ------------------------------------------------------------------------
    // ENDPOINTS: Catálogos Generales (Solo Lectura o Escritura básica)
    // ------------------------------------------------------------------------
    public function getClientes()
    {
        $model = new ClienteModel();
        return $this->respond($model->findAll());
    }

    public function createCliente()
    {
        $model = new ClienteModel();
        $data = $this->request->getPost();
        if ($model->insert($data)) {
            return $this->respondCreated($data);
        }
        return $this->failValidationError('No se pudo guardar el cliente.');
    }

    public function getCotizaciones()
    {
        $model = new CotizacionModel();
        // Cargar cotizaciones cruzadas con el nombre de cliente
        $db = \Config\Database::connect();
        $builder = $db->table('COTIZACIONES c');
        $builder->select('c.*, cl.Nombre_Comercial AS Cliente');
        $builder->join('CAT_CLIENTES cl', 'c.ID_Cliente = cl.ID_Cliente');
        return $this->respond($builder->get()->getResultArray());
    }

    public function getDevengado()
    {
        $db = \Config\Database::connect();
        $builder = $db->table('BITACORA_SORTEO s');
        $builder->select('s.*, cl.Nombre_Comercial AS Cliente');
        $builder->join('COTIZACIONES c', 's.ID_Cotizacion = c.ID_Cotizacion');
        $builder->join('CAT_CLIENTES cl', 'c.ID_Cliente = cl.ID_Cliente');
        return $this->respond($builder->get()->getResultArray());
    }

    public function getFacturas()
    {
        $db = \Config\Database::connect();
        $builder = $db->table('FACTURAS f');
        $builder->select('f.*, cl.Nombre_Comercial AS Cliente');
        $builder->join('CAT_CLIENTES cl', 'f.ID_Cliente = cl.ID_Cliente');
        return $this->respond($builder->get()->getResultArray());
    }

    public function getFacturaDetalle($id)
    {
        $facturaModel = new FacturaModel();
        $pagoModel = new PagoModel();

        $factura = $facturaModel->find($id);
        if (!$factura) {
            return $this->failNotFound('Factura no encontrada.');
        }

        // Obtener pagos asociados
        $pagos = $pagoModel->where('Folio_Factura', $id)->findAll();

        return $this->respond([
            'factura' => $factura,
            'pagos'   => $pagos
        ]);
    }

    // ------------------------------------------------------------------------
    // ENDPOINT: Conciliación / Carga e Importación Automatizada
    // ------------------------------------------------------------------------
    public function importCSV()
    {
        $file = $this->request->getFile('csv_file');
        if (!$file->isValid()) {
            return $this->fail('Archivo CSV no válido.');
        }

        // Leer el archivo CSV en formato latin1
        $filepath = $file->getTempName();
        $content = file_get_contents($filepath);
        $content = iconv('Windows-1252', 'UTF-8', $content); // Convertir a UTF-8

        $rows = array_map('str_getcsv', explode("\n", $content));
        $header = array_shift($rows);

        if (empty($header) || !in_array('cfdiUUID', $header)) {
            return $this->fail('Formato de CSV incorrecto. Debe contener cfdiUUID.');
        }

        $facturaModel = new FacturaModel();
        $clienteModel = new ClienteModel();
        $importados = 0;

        foreach ($rows as $row) {
            if (count($row) < count($header)) continue;
            
            $data = array_combine($header, array_slice($row, 0, count($header)));
            $uuid = trim($data['cfdiUUID'] ?? '');
            $folio = trim($data['Folio'] ?? '');
            $tipo = trim($data['Tipo'] ?? '');
            
            if (empty($uuid) || empty($folio) || $tipo !== 'Factura') {
                continue; // Saltar complementos de pago y filas vacías
            }

            // Buscar o registrar cliente temporalmente si no existe por RFC
            $rfc = trim($data['RFC'] ?? '');
            $clienteNom = trim($data['Receptor'] ?? '');
            
            $cliente = $clienteModel->where('RFC', $rfc)->first();
            if (!$cliente) {
                // Generar ID_Cliente automático
                $maxId = $clienteModel->selectMax('ID_Cliente')->first();
                $num = 1;
                if ($maxId && preg_match('/CLI-(\d+)/', $maxId['ID_Cliente'], $matches)) {
                    $num = intval($matches[1]) + 1;
                }
                $idClt = 'CLI-' . str_pad($num, 3, '0', STR_PAD_LEFT);
                $clienteModel->insert([
                    'ID_Cliente'       => $idClt,
                    'Nombre_Fiscal'    => $clienteNom,
                    'Nombre_Comercial' => $clienteNom,
                    'RFC'              => $rfc,
                    'Estatus'          => 'Activo'
                ]);
                $clientId = $idClt;
            } else {
                $clientId = $cliente['ID_Cliente'];
            }

            // Convertir fechas YYYY-MM-DD
            $emisionRaw = trim($data['Fecha'] ?? '');
            $emision = '';
            if ($emisionRaw) {
                $parts = explode('/', $emisionRaw);
                if (count($parts) === 3) {
                    $emision = "{$parts[2]}-{$parts[1]}-{$parts[0]}";
                }
            }

            // Límite de vencimiento simple a 30 días
            $vencimiento = date('Y-m-d', strtotime($emision . ' + 30 days'));

            $montoTotal = floatval(trim($data['Total'] ?? '0.00'));
            $montoSub = floatval(trim($data['Subtotal'] ?? '0.00'));
            $moneda = trim($data['Moneda'] ?? 'Peso Mexicano');

            // Insertar o actualizar factura
            $facturaData = [
                'Folio_Factura'     => 'F-' . $folio,
                'cfdiUUID'          => $uuid,
                'ID_Cliente'        => $clientId,
                'Fecha_Emision'     => $emision,
                'Monto_Subtotal'    => $montoSub,
                'Monto_Total'       => $montoTotal,
                'Moneda'            => $moneda,
                'Fecha_Vencimiento' => $vencimiento,
                'Estatus_Pago'      => 'Vigente'
            ];

            if ($facturaModel->find('F-' . $folio)) {
                $facturaModel->update('F-' . $folio, $facturaData);
            } else {
                $facturaModel->insert($facturaData);
            }
            $importados++;
        }

        return $this->respond(['status' => 'success', 'message' => "Se importaron/actualizaron {$importados} facturas."]);
    }

    public function reconcileXML()
    {
        $file = $this->request->getFile('xml_file');
        if (!$file->isValid()) {
            return $this->fail('Archivo XML no válido.');
        }

        $xmlString = file_get_contents($file->getTempName());
        $force = $this->request->getPost('force') === 'true';
        
        try {
            // Desactivar entidades externas para prevenir inyección XML
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($xmlString);
            if ($xml === false) {
                return $this->fail('El archivo XML está mal formado.');
            }

            // Registrar namespaces
            $namespaces = $xml->getNamespaces(true);
            $xml->registerXPathNamespace('cfdi', 'http://www.sat.gob.mx/cfdi/4');
            $xml->registerXPathNamespace('pago20', 'http://www.sat.gob.mx/Pagos20');

            // Seguridad (Test 5): Validar RFC Emisor
            $emisor = $xml->xpath('//cfdi:Emisor');
            if (empty($emisor) || (string)$emisor[0]['Rfc'] !== $this->bqsRfc) {
                return $this->fail('El archivo XML no pertenece a Best Quality Solutions (RFC emisor inválido)');
            }

            // Buscar pagos y documentos relacionados
            $pagos = $xml->xpath('//pago20:Pago');
            $facturaModel = new FacturaModel();
            $pagoModel = new PagoModel();
            
            $logs = [];
            $conciliados = 0;
            $duplicates = [];
            $pendingInserts = [];

            foreach ($pagos as $pago) {
                $fechaPago = explode('T', (string)$pago['FechaPago'])[0];
                $doctos = $pago->xpath('.//pago20:DoctoRelacionado');

                foreach ($doctos as $doc) {
                    $uuid = (string)$doc['IdDocumento'];
                    $impPagado = floatval((string)$doc['ImpPagado']);
                    $impSaldoInsoluto = floatval((string)$doc['ImpSaldoInsoluto']);
                    $folio = (string)$doc['Folio'];

                    // Buscar factura por UUID
                    $factura = $facturaModel->where('cfdiUUID', $uuid)->first();

                    if ($factura) {
                        // Verificar riesgo de duplicidad
                        $existe = $pagoModel->where([
                            'Folio_Factura' => $factura['Folio_Factura'],
                            'Fecha_Pago'    => $fechaPago,
                            'Monto_Pagado'  => $impPagado
                        ])->first();

                        if ($existe) {
                            $duplicates[] = [
                                'Folio_Factura' => $factura['Folio_Factura'],
                                'Fecha_Pago'    => $fechaPago,
                                'Monto_Pagado'  => $impPagado,
                                'Referencia'    => 'XML Pago Relacionado a Folio ' . $folio
                            ];
                        }

                        $pendingInserts[] = [
                            'ID_Pago'       => 'PAG-' . uniqid(),
                            'Folio_Factura' => $factura['Folio_Factura'],
                            'Fecha_Pago'    => $fechaPago,
                            'Monto_Pagado'  => $impPagado,
                            'Referencia'    => 'XML Pago Relacionado a Folio ' . $folio,
                            'impSaldoInsoluto' => $impSaldoInsoluto
                        ];
                    } else {
                        // Test 4: Tolerancia a Errores (UUID Huérfano)
                        $logs[] = "Error de Conciliación: El UUID {$uuid} no existe en el catálogo.";
                    }
                }
            }

            // Si hay riesgo de duplicados y no está forzado, detenerse y advertir
            if (!empty($duplicates) && !$force) {
                return $this->respond([
                    'status'     => 'warning',
                    'message'    => 'Existe riesgo de pago duplicado',
                    'duplicates' => $duplicates
                ]);
            }

            // Realizar inserciones
            foreach ($pendingInserts as $ins) {
                $pagoModel->insert([
                    'ID_Pago'       => $ins['ID_Pago'],
                    'Folio_Factura' => $ins['Folio_Factura'],
                    'Fecha_Pago'    => $ins['Fecha_Pago'],
                    'Monto_Pagado'  => $ins['Monto_Pagado'],
                    'Referencia'    => $ins['Referencia']
                ]);

                // Actualizar estatus de factura
                $estatus = ($ins['impSaldoInsoluto'] == 0.0) ? 'Pagada' : 'Pago Parcial';
                $facturaModel->update($ins['Folio_Factura'], [
                    'Estatus_Pago' => $estatus
                ]);
                
                $conciliados++;
            }

            return $this->respond([
                'status'      => 'success',
                'conciliados' => $conciliados,
                'logs'        => $logs
            ]);

        } catch (\Exception $e) {
            return $this->fail('Error al procesar la conciliación XML: ' . $e->getMessage());
        }
    }

    // ------------------------------------------------------------------------
    // CRUD: CLIENTES
    // ------------------------------------------------------------------------
    public function updateCliente($id)
    {
        $model = new ClienteModel();
        $data = $this->request->getPost();
        if ($model->update($id, $data)) {
            return $this->respond(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo actualizar el cliente.');
    }

    public function deleteCliente($id)
    {
        $cotizacionModel = new CotizacionModel();
        $facturaModel = new FacturaModel();
        if ($cotizacionModel->where('ID_Cliente', $id)->first() || $facturaModel->where('ID_Cliente', $id)->first()) {
            return $this->failValidationError('No se puede eliminar el cliente porque tiene cotizaciones o facturas asociadas.');
        }

        $model = new ClienteModel();
        if ($model->delete($id)) {
            return $this->respondDeleted(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo eliminar el cliente.');
    }

    // ------------------------------------------------------------------------
    // CRUD: COTIZACIONES
    // ------------------------------------------------------------------------
    public function createCotizacion()
    {
        $model = new CotizacionModel();
        $data = $this->request->getPost();
        if ($model->insert($data)) {
            return $this->respondCreated($data);
        }
        return $this->failValidationError('No se pudo guardar la cotización.');
    }

    public function updateCotizacion($id)
    {
        $model = new CotizacionModel();
        $data = $this->request->getPost();
        if ($model->update($id, $data)) {
            return $this->respond(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo actualizar la cotización.');
    }

    public function deleteCotizacion($id)
    {
        $sorteoModel = new SorteoModel();
        if ($sorteoModel->where('ID_Cotizacion', $id)->first()) {
            return $this->failValidationError('No se puede eliminar la cotización porque tiene sorteos o capturas asociadas.');
        }

        $model = new CotizacionModel();
        if ($model->delete($id)) {
            return $this->respondDeleted(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo eliminar la cotización.');
    }

    // ------------------------------------------------------------------------
    // CRUD: DEVENGADO
    // ------------------------------------------------------------------------
    public function createDevengado()
    {
        $model = new SorteoModel();
        $data = $this->request->getPost();
        if ($model->insert($data)) {
            return $this->respondCreated($data);
        }
        return $this->failValidationError('No se pudo guardar el devengado.');
    }

    public function updateDevengado($id)
    {
        $model = new SorteoModel();
        $data = $this->request->getPost();
        if ($model->update($id, $data)) {
            return $this->respond(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo actualizar el devengado.');
    }

    public function deleteDevengado($id)
    {
        $model = new SorteoModel();
        if ($model->delete($id)) {
            return $this->respondDeleted(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo eliminar el devengado.');
    }

    // ------------------------------------------------------------------------
    // CRUD: FACTURAS
    // ------------------------------------------------------------------------
    public function createFactura()
    {
        $model = new FacturaModel();
        $data = $this->request->getPost();
        if ($model->insert($data)) {
            return $this->respondCreated($data);
        }
        return $this->failValidationError('No se pudo guardar la factura.');
    }

    public function updateFactura($id)
    {
        $model = new FacturaModel();
        $data = $this->request->getPost();
        if ($model->update($id, $data)) {
            return $this->respond(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo actualizar la factura.');
    }

    public function deleteFactura($id)
    {
        $pagoModel = new PagoModel();
        $existePago = $pagoModel->where('Folio_Factura', $id)->first();
        if ($existePago) {
            return $this->failValidationError('No se puede eliminar la factura porque tiene pagos registrados.');
        }

        $model = new FacturaModel();
        if ($model->delete($id)) {
            return $this->respondDeleted(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo eliminar la factura.');
    }

    // ------------------------------------------------------------------------
    // CRUD: PAGOS
    // ------------------------------------------------------------------------
    public function getPagos()
    {
        $db = \Config\Database::connect();
        $builder = $db->table('PAGOS p');
        $builder->select('p.*, f.ID_Cliente, cl.Nombre_Comercial AS Cliente');
        $builder->join('FACTURAS f', 'p.Folio_Factura = f.Folio_Factura');
        $builder->join('CAT_CLIENTES cl', 'f.ID_Cliente = cl.ID_Cliente');
        return $this->respond($builder->get()->getResultArray());
    }

    public function createPago()
    {
        $model = new PagoModel();
        $data = $this->request->getPost();
        if ($model->insert($data)) {
            // Actualizar estatus de la factura
            $facturaModel = new FacturaModel();
            $factura = $facturaModel->find($data['Folio_Factura']);
            if ($factura) {
                $totalPagos = $model->where('Folio_Factura', $data['Folio_Factura'])->selectSum('Monto_Pagado')->first()['Monto_Pagado'] ?? 0.00;
                $nuevoEstatus = ($totalPagos >= $factura['Monto_Total']) ? 'Pagada' : 'Pago Parcial';
                $facturaModel->update($data['Folio_Factura'], ['Estatus_Pago' => $nuevoEstatus]);
            }
            return $this->respondCreated($data);
        }
        return $this->failValidationError('No se pudo guardar el pago.');
    }

    public function updatePago($id)
    {
        $model = new PagoModel();
        $data = $this->request->getPost();
        if ($model->update($id, $data)) {
            // Recalcular estatus de la factura
            $pago = $model->find($id);
            if ($pago) {
                $facturaModel = new FacturaModel();
                $factura = $facturaModel->find($pago['Folio_Factura']);
                if ($factura) {
                    $totalPagos = $model->where('Folio_Factura', $pago['Folio_Factura'])->selectSum('Monto_Pagado')->first()['Monto_Pagado'] ?? 0.00;
                    $nuevoEstatus = ($totalPagos >= $factura['Monto_Total']) ? 'Pagada' : 'Pago Parcial';
                    $facturaModel->update($pago['Folio_Factura'], ['Estatus_Pago' => $nuevoEstatus]);
                }
            }
            return $this->respond(['status' => 'success']);
        }
        return $this->failValidationError('No se pudo actualizar el pago.');
    }

    public function deletePago($id)
    {
        $model = new PagoModel();
        $pago = $model->find($id);
        if ($pago) {
            $folioFactura = $pago['Folio_Factura'];
            if ($model->delete($id)) {
                // Recalcular estatus de la factura
                $facturaModel = new FacturaModel();
                $factura = $facturaModel->find($folioFactura);
                if ($factura) {
                    $totalPagos = $model->where('Folio_Factura', $folioFactura)->selectSum('Monto_Pagado')->first()['Monto_Pagado'] ?? 0.00;
                    $nuevoEstatus = ($totalPagos == 0) ? 'Vigente' : (($totalPagos >= $factura['Monto_Total']) ? 'Pagada' : 'Pago Parcial');
                    $facturaModel->update($folioFactura, ['Estatus_Pago' => $nuevoEstatus]);
                }
                return $this->respondDeleted(['status' => 'success']);
            }
        }
        return $this->failValidationError('No se pudo eliminar el pago.');
    }

    // ------------------------------------------------------------------------
    // REPORTES: EXECUTIVE SPLIT-CURRENCY REPORT
    // ------------------------------------------------------------------------
    public function getExecutiveReport()
    {
        $db = \Config\Database::connect();
        
        // Pesos (MXN)
        $pesos = $db->query("
            SELECT 
                cl.Nombre_Comercial AS Cliente,
                COALESCE(fact.facturado, 0) AS facturado,
                COALESCE(fact.pagado, 0) AS pagado,
                (COALESCE(fact.facturado, 0) - COALESCE(fact.pagado, 0)) AS pend_pago
            FROM CAT_CLIENTES cl
            LEFT JOIN (
                SELECT 
                    f.ID_Cliente,
                    SUM(f.Monto_Total) AS facturado,
                    SUM(COALESCE(p.total_pagado, 0)) AS pagado
                FROM FACTURAS f
                LEFT JOIN (
                    SELECT Folio_Factura, SUM(Monto_Pagado) AS total_pagado
                    FROM PAGOS
                    GROUP BY Folio_Factura
                ) p ON f.Folio_Factura = p.Folio_Factura
                WHERE f.Moneda IN ('Peso Mexicano', 'MXN', 'MXP')
                GROUP BY f.ID_Cliente
            ) fact ON cl.ID_Cliente = fact.ID_Cliente
            ORDER BY cl.Nombre_Comercial ASC
        ")->getResultArray();

        // Dolares (USD)
        $dolares = $db->query("
            SELECT 
                cl.Nombre_Comercial AS Cliente,
                COALESCE(fact.facturado, 0) AS facturado,
                COALESCE(fact.pagado, 0) AS pagado,
                (COALESCE(fact.facturado, 0) - COALESCE(fact.pagado, 0)) AS pend_pago
            FROM CAT_CLIENTES cl
            LEFT JOIN (
                SELECT 
                    f.ID_Cliente,
                    SUM(f.Monto_Total) AS facturado,
                    SUM(COALESCE(p.total_pagado, 0)) AS pagado
                FROM FACTURAS f
                LEFT JOIN (
                    SELECT Folio_Factura, SUM(Monto_Pagado) AS total_pagado
                    FROM PAGOS
                    GROUP BY Folio_Factura
                ) p ON f.Folio_Factura = p.Folio_Factura
                WHERE f.Moneda IN ('Dolar americano', 'USD', 'US Dollar')
                GROUP BY f.ID_Cliente
            ) fact ON cl.ID_Cliente = fact.ID_Cliente
            ORDER BY cl.Nombre_Comercial ASC
        ")->getResultArray();

        // Calcular totales
        $totalPesosFacturado = array_sum(array_column($pesos, 'facturado'));
        $totalPesosPagado = array_sum(array_column($pesos, 'pagado'));
        $totalPesosPendiente = array_sum(array_column($pesos, 'pend_pago'));

        $totalDolaresFacturado = array_sum(array_column($dolares, 'facturado'));
        $totalDolaresPagado = array_sum(array_column($dolares, 'pagado'));
        $totalDolaresPendiente = array_sum(array_column($dolares, 'pend_pago'));

        return $this->respond([
            'pesos' => $pesos,
            'dolares' => $dolares,
            'totales' => [
                'pesos_facturado' => $totalPesosFacturado,
                'pesos_pagado' => $totalPesosPagado,
                'pesos_pendiente' => $totalPesosPendiente,
                'dolares_facturado' => $totalDolaresFacturado,
                'dolares_pagado' => $totalDolaresPagado,
                'dolares_pendiente' => $totalDolaresPendiente
            ]
        ]);
    }

    public function uploadCotizacionEvidencia()
    {
        $file = $this->request->getFile('foto');
        if (!$file || !$file->isValid()) {
            return $this->fail('No se pudo subir la foto o el archivo no es válido.');
        }

        if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
            return $this->fail('El archivo debe ser una imagen válida (jpeg, png, gif, webp).');
        }

        // Save to public uploads
        $uploadPath = ROOTPATH . '../public_html/uploads/';
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }

        $newName = $file->getRandomName();
        if ($file->move($uploadPath, $newName)) {
            return $this->respond([
                'status' => 'success',
                'path'   => 'uploads/' . $newName
            ]);
        }

        return $this->fail('No se pudo guardar la imagen en el servidor.');
    }

    public function getMigracionAudit()
    {
        $facturaModel = new FacturaModel();
        $invoices = $facturaModel->select('FACTURAS.*, CAT_CLIENTES.Nombre_Comercial AS Cliente, CAT_CLIENTES.RFC')
            ->join('CAT_CLIENTES', 'FACTURAS.ID_Cliente = CAT_CLIENTES.ID_Cliente')
            ->where('Estatus_Pago !=', 'Pagada')
            ->findAll();

        return $this->respond($invoices);
    }

    public function getFacturacionHistorica()
    {
        $db = \Config\Database::connect();
        $builder = $db->table('FACTURAS');
        $builder->select("DATE_FORMAT(Fecha_Emision, '%Y-%m') as mes, SUM(Monto_Total) as total");
        $builder->groupBy("mes");
        $builder->orderBy("mes", "ASC");
        $historico = $builder->get()->getResultArray();

        return $this->respond($historico);
    }

    public function getFacturacionClienteUltimoMes($idCliente)
    {
        $db = \Config\Database::connect();
        $dateLimit = date('Y-m-d', strtotime('-30 days'));

        $builder = $db->table('FACTURAS');
        $builder->select("Fecha_Emision as fecha, Folio_Factura, Monto_Total, Moneda");
        $builder->where('ID_Cliente', $idCliente);
        $builder->where('Fecha_Emision >=', $dateLimit);
        $builder->orderBy('Fecha_Emision', 'ASC');
        $desglose = $builder->get()->getResultArray();

        return $this->respond($desglose);
    }
}

