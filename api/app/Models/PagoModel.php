<?php

namespace App\Models;

use CodeIgniter\Model;

class PagoModel extends Model
{
    protected $table            = 'PAGOS';
    protected $primaryKey       = 'ID_Pago';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $deletedField     = 'deleted_at';
    protected $allowedFields    = ['ID_Pago', 'Folio_Factura', 'Fecha_Pago', 'Monto_Pagado', 'Referencia', 'deleted_at'];
}
