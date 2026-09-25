<?php

namespace App\Models;

use CodeIgniter\Model;

class ClienteModel extends Model
{
    protected $table            = 'CAT_CLIENTES';
    protected $primaryKey       = 'ID_Cliente';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $deletedField     = 'deleted_at';
    protected $allowedFields    = ['ID_Cliente', 'Nombre_Fiscal', 'Nombre_Comercial', 'RFC', 'Estatus', 'Direccion', 'CP', 'deleted_at'];
}
