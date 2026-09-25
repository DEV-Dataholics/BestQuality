<?php

namespace App\Models;

use CodeIgniter\Model;

class FacturaModel extends Model
{
    protected $table            = 'FACTURAS';
    protected $primaryKey       = 'Folio_Factura';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $deletedField     = 'deleted_at';
    protected $allowedFields    = ['Folio_Factura', 'cfdiUUID', 'ID_Cliente', 'Fecha_Emision', 'Monto_Subtotal', 'Monto_Total', 'Moneda', 'Fecha_Vencimiento', 'Estatus_Pago', 'ID_Cotizacion', 'deleted_at'];
}
