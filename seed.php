<?php

// standalone script to seed local or remote BQS database

$envFile = __DIR__ . '/api/.env';
if (!file_exists($envFile)) {
    die("No se encontró el archivo api/.env. Por favor confígalo primero.\n");
}

$env = parse_ini_file($envFile);
$host = $env['database.default.hostname'] ?? 'localhost';
$db   = $env['database.default.database'] ?? 'noodluis_bqs';
$user = $env['database.default.username'] ?? 'noodluis_dev_bqs';
$pass = $env['database.default.password'] ?? '0Qmu1tomSbjY';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "Conexión exitosa a la base de datos: $db\n";
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage() . "\n");
}

// 1. Limpiar tablas
echo "Limpiando tablas...\n";
$pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
$pdo->exec("TRUNCATE TABLE PAGOS;");
$pdo->exec("TRUNCATE TABLE FACTURAS;");
$pdo->exec("TRUNCATE TABLE BITACORA_SORTEO;");
$pdo->exec("TRUNCATE TABLE COTIZACIONES;");
$pdo->exec("TRUNCATE TABLE CAT_CLIENTES;");
$pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

// 2. Insertar Clientes
echo "Sembrando CAT_CLIENTES...\n";
$clientes = [
    ['CLI-001', 'Nidec Mobility México S.A. de C.V.', 'NIDEC Mobility', 'NMM120304AA1', 'Activo'],
    ['CLI-002', 'Bocar Group S.A. de C.V.', 'Bocar', 'BGR990817AB2', 'Activo'],
    ['CLI-003', 'Nemak S.A.B. de C.V.', 'Nemak', 'NEM790521C34', 'Activo'],
    ['CLI-004', 'Metalsa S.A. de C.V.', 'Metalsa', 'MET850612D58', 'Activo'],
    ['CLI-005', 'Rassini S.A.B. de C.V.', 'Rassini', 'RAS760310E21', 'Activo'],
    ['CLI-006', 'Kostal Mexicana S.A. de C.V.', 'Kostal', 'KME031118F09', 'Activo'],
    ['CLI-007', 'Grupo Industrial Saltillo S.A.B. de C.V.', 'GIS', 'GIS680425G77', 'Activo'],
];

$stmt = $pdo->prepare("INSERT INTO CAT_CLIENTES (ID_Cliente, Nombre_Fiscal, Nombre_Comercial, RFC, Estatus) VALUES (?, ?, ?, ?, ?)");
foreach ($clientes as $c) {
    $stmt->execute($c);
}

// 3. Insertar Cotizaciones
echo "Sembrando COTIZACIONES...\n";
$cotizaciones = [
    ['COT-0001', 'CLI-001', 'PO-NIDEC-1001', 100000, 1000, 'Aprobada'],
    ['COT-0002', 'CLI-001', 'PO-NIDEC-1002', 150000, 1500, 'Aprobada'],
    ['COT-0003', 'CLI-002', 'PO-BOCAR-2001', 320000, 3000, 'Aprobada'],
    ['COT-0004', 'CLI-002', 'PO-BOCAR-2002', 90000, 900, 'Pendiente PO'],
    ['COT-0005', 'CLI-003', 'PO-NEMAK-3001', 540000, 5000, 'Aprobada'],
    ['COT-0006', 'CLI-003', 'PO-NEMAK-3002', 210000, 2000, 'Cerrada'],
    ['COT-0007', 'CLI-004', 'PO-METAL-4001', 410000, 4000, 'Aprobada'],
    ['COT-0008', 'CLI-005', 'PO-RASS-5001', 175000, 1700, 'Aprobada'],
    ['COT-0009', 'CLI-005', 'PO-RASS-5002', 60000, 600, 'Pendiente PO'],
    ['COT-0010', 'CLI-006', 'PO-KOST-6001', 280000, 2800, 'Aprobada'],
    ['COT-0011', 'CLI-007', 'PO-GIS-7001', 720000, 7000, 'Aprobada'],
];

$stmt = $pdo->prepare("INSERT INTO COTIZACIONES (ID_Cotizacion, ID_Cliente, PO_Referencia, Monto_Autorizado, Piezas_Autorizadas, Estatus) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($cotizaciones as $c) {
    $stmt->execute($c);
}

// 4. Insertar Trabajo Devengado (BITACORA_SORTEO)
echo "Sembrando BITACORA_SORTEO...\n";
$sorteos = [
    ['BIT-0001', date('Y-m-d', strtotime('-5 days')), 'COT-0001', 120, 2000, 30000, 'facturado'],
    ['BIT-0002', date('Y-m-d', strtotime('-2 days')), 'COT-0001', 90, 1500, 30000, 'pendiente'],
    ['BIT-0003', date('Y-m-d', strtotime('-1 days')), 'COT-0002', 150, 2500, 45000, 'pendiente'],
    ['BIT-0004', date('Y-m-d', strtotime('-1 days')), 'COT-0003', 300, 5000, 90000, 'pendiente'],
    ['BIT-0005', date('Y-m-d', strtotime('-3 days')), 'COT-0005', 500, 8000, 150000, 'pendiente'],
    ['BIT-0006', date('Y-m-d', strtotime('-4 days')), 'COT-0007', 310, 4500, 95000, 'pendiente'],
    ['BIT-0007', date('Y-m-d', strtotime('-6 days')), 'COT-0011', 600, 9000, 180000, 'pendiente'],
];

$stmt = $pdo->prepare("INSERT INTO BITACORA_SORTEO (ID_Captura, Fecha, ID_Cotizacion, Horas_Trabajadas, Piezas_Sorteadas, Monto_Devengado, Estatus_Facturacion) VALUES (?, ?, ?, ?, ?, ?, ?)");
foreach ($sorteos as $s) {
    $stmt->execute($s);
}

// 5. Insertar Facturas
echo "Sembrando FACTURAS...\n";
$facturas = [
    ['F-6082', 'EED2D94F-CACF-4476-AC56-A60A6E0F2550', 'CLI-001', date('Y-m-05'), 80000.00, 84795.14, 'Dolar americano', date('Y-m-d', strtotime('+30 days')), 'Vigente'],
    ['F-6083', '1B83DE7F-F03C-447D-A6B6-5FEBF7868AE6', 'CLI-001', date('Y-m-08'), 81600.00, 88128.00, 'Peso Mexicano', date('Y-m-d', strtotime('+30 days')), 'Vigente'],
    ['F-6084', 'F46D63CC-7F45-40DD-A68C-62A90FC40E5A', 'CLI-002', date('Y-m-08'), 46740.00, 50479.20, 'Peso Mexicano', date('Y-m-d', strtotime('+30 days')), 'Vigente'],
    ['F-6085', '8789DBF7-3C26-44C4-B820-8B80712A33AD', 'CLI-002', date('Y-m-08'), 8550.00, 9234.00, 'Peso Mexicano', date('Y-m-d', strtotime('+30 days')), 'Vigente'],
    ['F-6086', '134586B0-09BF-4C04-B4C4-788309599A0C', 'CLI-003', date('Y-m-08'), 46740.00, 50479.20, 'Peso Mexicano', date('Y-m-d', strtotime('+30 days')), 'Pagada'],
    ['F-6087', '13ECA987-47F7-403D-AEAA-EA9C414CE5BF', 'CLI-003', date('Y-m-08'), 8550.00, 9234.00, 'Peso Mexicano', date('Y-m-d', strtotime('+30 days')), 'Pagada'],
    ['F-6088', '2048E9CE-DECA-41E1-8734-91B94DBAADBA', 'CLI-004', date('Y-m-08'), 8000.00, 8640.00, 'Peso Mexicano', date('Y-m-d', strtotime('+30 days')), 'Vigente'],
    ['F-6089', '8B9B81A5-4592-4D96-8A7A-898C1BBAEAFD', 'CLI-005', date('Y-m-08'), 11400.00, 12312.00, 'Peso Mexicano', date('Y-m-d', strtotime('+30 days')), 'Vigente'],
    ['F-6090', '9A9178F4-76EB-4873-B3DB-1825F0DA5EBB', 'CLI-007', date('Y-m-d', strtotime('-5 days')), 400000.00, 464000.00, 'Peso Mexicano', date('Y-m-d', strtotime('-5 days')), 'Vencida'],
];

$stmt = $pdo->prepare("INSERT INTO FACTURAS (Folio_Factura, cfdiUUID, ID_Cliente, Fecha_Emision, Monto_Subtotal, Monto_Total, Moneda, Fecha_Vencimiento, Estatus_Pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($facturas as $f) {
    $stmt->execute($f);
}

// 6. Insertar Pagos
echo "Sembrando PAGOS...\n";
$pagos = [
    ['PAG-0001', 'F-6086', date('Y-m-12'), 50479.20, 'SPEI BANORTE 9122'],
    ['PAG-0002', 'F-6087', date('Y-m-12'), 9234.00, 'SPEI BANORTE 9122'],
    ['PAG-0003', 'F-6082', date('Y-m-15'), 50000.00, 'Abono parcial de Sunway'],
];

$stmt = $pdo->prepare("INSERT INTO PAGOS (ID_Pago, Folio_Factura, Fecha_Pago, Monto_Pagado, Referencia) VALUES (?, ?, ?, ?, ?)");
foreach ($pagos as $p) {
    $stmt->execute($p);
}

echo "Base de datos sembrada con éxito!\n";
