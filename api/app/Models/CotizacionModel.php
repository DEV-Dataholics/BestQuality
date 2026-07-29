<?php

namespace App\Models;

use CodeIgniter\Model;

class CotizacionModel extends Model
{
    protected $table            = 'COTIZACIONES';
    protected $primaryKey       = 'ID_Cotizacion';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $allowedFields    = ['ID_Cotizacion', 'ID_Cliente', 'PO_Referencia', 'Monto_Autorizado', 'Piezas_Autorizadas', 'Estatus'];
}
