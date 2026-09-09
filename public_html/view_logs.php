<?php

// view_logs.php - Protegido contra acceso no autorizado
header('HTTP/1.1 403 Forbidden');
header('Location: /');
exit('Acceso no autorizado. Los logs están protegidos y disponibles únicamente en el portal para el perfil Administrador.');
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
