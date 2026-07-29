<?php

// view_logs.php
// Script to read CodeIgniter 4 error logs on the remote server

$logDir = __DIR__ . '/api/writable/logs/';
if (!is_dir($logDir)) {
    $logDir = __DIR__ . '/../api/writable/logs/';
}

if (!is_dir($logDir)) {
    die("ERROR: No se encontró el directorio de logs: " . realpath($logDir));
}

echo "<h3>Logs de CodeIgniter 4</h3>";
$files = glob($logDir . 'log-*.log');
if (empty($files)) {
    echo "No se encontraron archivos de logs en: " . realpath($logDir);
    exit;
}

// Ordenar por fecha de modificación descendente
usort($files, function($a, $b) {
    return filemtime($b) - filemtime($a);
});

foreach ($files as $file) {
    echo "<h4>Archivo: " . basename($file) . " (" . date("Y-m-d H:i:s", filemtime($file)) . ")</h4>";
    echo "<pre style='background:#f4f4f4; padding:10px; border:1px solid #ccc; max-height:400px; overflow:auto;'>";
    echo htmlspecialchars(file_get_contents($file));
    echo "</pre>";
}
