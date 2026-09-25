<?php

namespace App\Models;

use CodeIgniter\Model;

class SorteoModel extends Model
{
    protected $table            = 'BITACORA_SORTEO';
    protected $primaryKey       = 'ID_Captura';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $deletedField     = 'deleted_at';
    protected $allowedFields    = ['ID_Captura', 'Fecha', 'ID_Cotizacion', 'Horas_Trabajadas', 'Piezas_Sorteadas', 'Monto_Devengado', 'Estatus_Facturacion', 'deleted_at'];
}
