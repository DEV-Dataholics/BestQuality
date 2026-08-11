# Guía de Despliegue y DevOps: Best Quality Solutions (BQS)

Esta guía detalla los requerimientos del sistema, configuración de dominios, base de datos y pasos para desplegar el portal ejecutivo en el servidor de hosting del cliente.

---

## 1. Requerimientos de Servidor y Entorno
El backend está construido bajo el framework PHP CodeIgniter 4. El servidor web debe cumplir con los siguientes requerimientos mínimos:

* **PHP:** Versión 8.1 o superior.
* **Extensiones PHP Requeridas:**
  * `intl` (habilitada obligatoriamente para CodeIgniter 4)
  * `mbstring`
  * `curl`
  * `mysqlnd` o `mysqli`
  * `xml`
  * `json`
* **Base de Datos:** MySQL 5.7+ o MariaDB 10.3+.
* **Servidor Web:** Apache 2.4+ (con soporte para `mod_rewrite` y lectura de `.htaccess`) o Nginx configurado adecuadamente.

---

## 2. Configuración de Hosting y FTP
Para sincronizar el código del portal ejecutivo:

1. **Estructura del Servidor:**
   * La carpeta raíz pública del dominio (`public_html` o `www`) debe apuntar al directorio `public_html/` del portal.
   * El código del backend (directorio `api/`) puede ubicarse un nivel por arriba de la raíz pública para mayor seguridad, o bien en el mismo nivel si el archivo `.htaccess` está correctamente habilitado.

2. **Detalles de Conexión Requeridos:**
   * **Host FTP:** `ftp.tuservidor.com`
   * **Usuario:** `usuario_ftp`
   * **Puerto:** `21` (o SSH `22` si se prefiere SFTP)
   * **Permisos de Escritura:** Habilitar permisos de escritura/lectura (755 para directorios, 644 para archivos) en las carpetas:
     * `api/writable/cache/`
     * `api/writable/logs/`
     * `api/writable/session/`
     * `api/writable/uploads/` (donde se almacenarán las evidencias fotográficas de las cotizaciones).

---

## 3. Configuración del Servidor DNS (Dominio del Cliente)
El administrador del dominio del cliente debe configurar las siguientes entradas DNS en su panel de administración (GoDaddy, Cloudflare, etc.) para apuntar al nuevo hosting:

| Tipo | Host / Nombre | Valor / Destino | Descripción |
| :--- | :--- | :--- | :--- |
| **A** | `@` (o raíz) | `IP_DEL_NUEVO_HOSTING` | Apunta el dominio principal al servidor. |
| **CNAME** | `www` | `dominio.com` | Redirige el tráfico de www al dominio principal. |
| **TXT** | `@` | `v=spf1 ip4:IP_DEL_NUEVO_HOSTING ~all` | Registro SPF para autorizar envío de correos desde el servidor. |

---

## 4. Inicialización de la Base de Datos
1. Crear una base de datos vacía en el hosting (ej. `bqs_prod`).
2. Crear un usuario de base de datos con todos los privilegios sobre dicha base.
3. Importar el archivo `database.sql` disponible en la raíz del proyecto para inicializar las tablas maestras.
4. Si el sistema ya cuenta con datos preexistentes de facturas pendientes, ejecutar el script de auditoría pre-migración para conciliar diferencias antes del paso final.
