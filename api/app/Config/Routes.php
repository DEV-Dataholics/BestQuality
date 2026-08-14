<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// ------------------------------------------------------------------------
// ROOT LEVEL ROUTES (Fallback under Apache /api/ rewrite subfolder)
// ------------------------------------------------------------------------
$routes->post('login', 'ApiController::login');
$routes->post('logout', 'ApiController::logout');
$routes->get('dashboard/resumen', 'ApiController::dashboard');

// Clientes
$routes->get('clientes', 'ApiController::getClientes');
$routes->post('clientes', 'ApiController::createCliente');
$routes->post('clientes/update/(:segment)', 'ApiController::updateCliente/$1');
$routes->post('clientes/delete/(:segment)', 'ApiController::deleteCliente/$1');

// Cotizaciones
$routes->get('cotizaciones', 'ApiController::getCotizaciones');
$routes->post('cotizaciones', 'ApiController::createCotizacion');
$routes->post('cotizaciones/update/(:segment)', 'ApiController::updateCotizacion/$1');
$routes->post('cotizaciones/delete/(:segment)', 'ApiController::deleteCotizacion/$1');

// Devengado
$routes->get('devengado', 'ApiController::getDevengado');
$routes->post('devengado', 'ApiController::createDevengado');
$routes->post('devengado/update/(:segment)', 'ApiController::updateDevengado/$1');
$routes->post('devengado/delete/(:segment)', 'ApiController::deleteDevengado/$1');

// Facturas
$routes->get('facturas', 'ApiController::getFacturas');
$routes->post('facturas', 'ApiController::createFactura');
$routes->post('facturas/update/(:segment)', 'ApiController::updateFactura/$1');
$routes->post('facturas/delete/(:segment)', 'ApiController::deleteFactura/$1');
$routes->get('facturas/(:segment)', 'ApiController::getFacturaDetalle/$1');

// Pagos
$routes->get('pagos', 'ApiController::getPagos');
$routes->post('pagos', 'ApiController::createPago');
$routes->post('pagos/update/(:segment)', 'ApiController::updatePago/$1');
$routes->post('pagos/delete/(:segment)', 'ApiController::deletePago/$1');

// Reportes & Imports
$routes->get('reportes/resumen', 'ApiController::getExecutiveReport');
$routes->post('importar/csv', 'ApiController::importCSV');
$routes->post('importar/xml', 'ApiController::reconcileXML');

// Nuevos endpoints Sprint
$routes->post('cotizaciones/upload', 'ApiController::uploadCotizacionEvidencia');
$routes->get('migracion/audit', 'ApiController::getMigracionAudit');
$routes->get('reportes/historico', 'ApiController::getFacturacionHistorica');
$routes->get('reportes/cliente-mes/(:segment)', 'ApiController::getFacturacionClienteUltimoMes/$1');
$routes->post('admin/clear-database-zero', 'ApiController::clearAllData');


// ------------------------------------------------------------------------
// GROUPED ROUTES (For direct URL mapping /api/public/index.php/api/...)
// ------------------------------------------------------------------------
$routes->group('api', function($routes) {
    $routes->post('login', 'ApiController::login');
    $routes->post('logout', 'ApiController::logout');
    $routes->get('dashboard/resumen', 'ApiController::dashboard');

    // Clientes
    $routes->get('clientes', 'ApiController::getClientes');
    $routes->post('clientes', 'ApiController::createCliente');
    $routes->post('clientes/update/(:segment)', 'ApiController::updateCliente/$1');
    $routes->post('clientes/delete/(:segment)', 'ApiController::deleteCliente/$1');

    // Cotizaciones
    $routes->get('cotizaciones', 'ApiController::getCotizaciones');
    $routes->post('cotizaciones', 'ApiController::createCotizacion');
    $routes->post('cotizaciones/update/(:segment)', 'ApiController::updateCotizacion/$1');
    $routes->post('cotizaciones/delete/(:segment)', 'ApiController::deleteCotizacion/$1');

    // Devengado
    $routes->get('devengado', 'ApiController::getDevengado');
    $routes->post('devengado', 'ApiController::createDevengado');
    $routes->post('devengado/update/(:segment)', 'ApiController::updateDevengado/$1');
    $routes->post('devengado/delete/(:segment)', 'ApiController::deleteDevengado/$1');

    // Facturas
    $routes->get('facturas', 'ApiController::getFacturas');
    $routes->post('facturas', 'ApiController::createFactura');
    $routes->post('facturas/update/(:segment)', 'ApiController::updateFactura/$1');
    $routes->post('facturas/delete/(:segment)', 'ApiController::deleteFactura/$1');
    $routes->get('facturas/(:segment)', 'ApiController::getFacturaDetalle/$1');

    // Pagos
    $routes->get('pagos', 'ApiController::getPagos');
    $routes->post('pagos', 'ApiController::createPago');
    $routes->post('pagos/update/(:segment)', 'ApiController::updatePago/$1');
    $routes->post('pagos/delete/(:segment)', 'ApiController::deletePago/$1');

    // Reportes & Imports
    $routes->get('reportes/resumen', 'ApiController::getExecutiveReport');
    $routes->post('importar/csv', 'ApiController::importCSV');
    $routes->post('importar/xml', 'ApiController::reconcileXML');

    // Nuevos endpoints Sprint
    $routes->post('cotizaciones/upload', 'ApiController::uploadCotizacionEvidencia');
    $routes->get('migracion/audit', 'ApiController::getMigracionAudit');
    $routes->get('reportes/historico', 'ApiController::getFacturacionHistorica');
    $routes->get('reportes/cliente-mes/(:segment)', 'ApiController::getFacturacionClienteUltimoMes/$1');
    $routes->post('admin/clear-database-zero', 'ApiController::clearAllData');
});
