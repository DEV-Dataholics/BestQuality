# Runbook General: Crear una Aplicacion Web MVP con Antigravity
## Dataholics Hybrid Stack - Proceso Replicable

**Empresa:** Dataholics  
**Version:** 1.0.1  

> **Para que sirve:** Guia estandar para crear cualquier aplicacion web interna o externa
> desde cero usando Antigravity como asistente de desarrollo.
> Aplica para sistemas de gestion, portales de clientes, herramientas internas, etc.
>
> **Complementa:** MVP_Development_Guideline.md y Tech_Stack_Guideline.md

---

## Stack Estandar Dataholics

| Capa | Tecnologia |
|---|---|
| Backend API | CodeIgniter 4 (PHP 8.1+) |
| Frontend | HTML5 + Alpine.js + Tailwind CSS |
| Base de datos | MySQL |
| Hosting | Site5 / cPanel (Shared Hosting) |
| Deploy | Script Python via FTP |

---

## Antes de empezar - Insumos requeridos

Define estos puntos **antes** de abrir Antigravity:

### Del negocio
- [ ] **Nombre del sistema** - ?Como se llama la aplicacion?
- [ ] **Problema que resuelve** - ?Que hace el sistema en una oracion?
- [ ] **Actores** - ?Quienes lo usan? (roles: admin, operador, cliente, etc.)
- [ ] **Entidades principales** - ?Cuales son los "sustantivos" del dominio? (pedidos, tickets, reportes, pagos, etc.)
- [ ] **Flujos criticos** - ?Cuales son los "verbos"? (crear, aprobar, asignar, cerrar, exportar, etc.)
- [ ] **Estados de la entidad principal** - ?Por que estados pasa? (ej: Borrador -> Activo -> Cerrado)

### Del servidor (configurar en cPanel antes de codificar)
- [ ] Subdominio o dominio creado y apuntando al document root correcto
- [ ] Base de datos MySQL creada con usuario y contrasena
- [ ] Cuenta FTP creada para el subdominio/dominio
- [ ] FTP Server anotado desde cPanel -> FTP Accounts -> **Manual Settings**

> **Importante:** El FTP Server en Site5 siempre es ftp.tudominio.com.
> No uses el dominio raiz directamente o la conexion fallara.

---

## Compuertas obligatorias Comercial -> Produccion

Este flujo es mandatorio para evitar retrabajo y asegurar que el MVP responda a lo que busca el cliente:

1. **Entrega inicial de informacion (Comercial -> Produccion):**
   - Antes de iniciar el MVP, Comercial entrega a Produccion contexto completo del cliente, objetivos, alcance funcional, restricciones y prioridades.
2. **Generacion de SOW (Produccion):**
   - Produccion redacta el SOW con base en los insumos recibidos.
3. **Validacion de SOW (Produccion <-> Comercial):**
   - El SOW se revisa con Comercial y se corrige hasta confirmar que refleja lo solicitado por el cliente.
   - El MVP no inicia sin aprobacion explicita de Comercial sobre el SOW.
4. **Construccion del MVP (Produccion):**
   - Produccion ejecuta el desarrollo conforme al SOW aprobado.
5. **Validacion pre-cliente (Produccion -> Comercial):**
   - Al terminar el MVP, Produccion regresa el entregable a Comercial para validar frontend y funcionalidades.
   - Se realiza una ultima pasada de ajustes antes de presentar al cliente.

---

## PASO 0 - Configurar el servidor (cPanel)

Ejecuta estos pasos **una sola vez por proyecto** antes de llamar a Antigravity:

### 0.1 Base de datos
1. cPanel -> **MySQL Databases**
2. Crear base de datos: recomendado [prefix]_[nombreproyecto]
3. Crear usuario MySQL con contrasena fuerte
4. Asignar usuario a la DB con **All Privileges**
5. Anotar: hostname, database, usuario, contrasena

### 0.2 Subdominio o dominio
1. cPanel -> **Subdomains** (o **Addon Domains**)
2. Crear el dominio/subdominio
3. Anotar el **Document Root exacto** que cPanel asigna

### 0.3 Cuenta FTP
1. cPanel -> **FTP Accounts**
2. Crear usuario FTP con directorio = Document Root del paso anterior
3. Anotar desde **Manual Settings**: FTP Server, usuario completo, contrasena

---

## PASO 1 - Prompt inicial a Antigravity

Abre una **conversacion nueva** y envia este prompt.
Reemplaza todo lo que esta en [CORCHETES]:

---

```text
Necesito desarrollar una aplicacion web para [DESCRIPCION DEL PROBLEMA].

NOMBRE DEL SISTEMA: [NOMBRE]
CARPETA LOCAL: [RUTA COMPLETA EN TU EQUIPO]
DOMINIO/URL: [URL DEL SERVIDOR]

ACTORES Y ROLES:
[Lista cada rol y que puede hacer]
Ejemplo:
- Administrador: gestion total de usuarios y entidades
- Operador: procesar y actualizar registros
- Cliente: crear solicitudes y consultar su estado

ENTIDADES PRINCIPALES:
[Lista las entidades (tablas) principales con sus campos clave]
Ejemplo:
- Empresa: nombre, tipo, estado
- Usuario: nombre, email, contrasena, rol, empresa
- [Entidad principal]: campo1, campo2, estado, prioridad, creador

ESTADOS DE [ENTIDAD PRINCIPAL]:
[Estado inicial] -> [Estado 2] -> [Estado 3] -> [Estado final]

FLUJOS PRINCIPALES:
1. [Actor] puede [accion] un/una [entidad]
2. [Actor] puede cambiar el estado de [entidad] a [estado]
3. [Actor] solo puede ver [entidades] de su [scope]

REGLAS DE NEGOCIO:
- [Regla 1: ej. Un cliente solo ve sus propias solicitudes]
- [Regla 2: ej. Solo el admin puede eliminar registros]
- [Regla 3: ej. Al pasar al estado "cerrado" se guarda la fecha de cierre]

SEGURIDAD:
- Autenticacion por sesion PHP (cookies HttpOnly)
- RBAC por rol en cada endpoint
- Aislamiento de datos por empresa/tenant si aplica

STACK TECNICO (Dataholics Hybrid Stack):
- Backend: CodeIgniter 4 (API REST)
- Frontend: HTML estatico + Alpine.js + Tailwind CSS
- Base de datos: MySQL
- Hosting: Site5 (shared hosting cPanel)
- Estructura: api/ para backend, public_html/ para frontend

Por favor, presenta el plan de implementacion antes de generar codigo.
```

---

**Tip:** Entre mas detallado sea el prompt, mas preciso sera el plan.
Si algo no esta claro, escribelo como pregunta dentro del prompt y Antigravity lo resolvera.

---

## PASO 2 - Revisar y aprobar el plan

Antigravity presentara fases de desarrollo, archivos a crear y schema de la DB.

**Tu respuesta:** continua - o ajusta lo que no coincida con tu vision antes de aprobar.

---

## PASO 3 - Proveer credenciales de base de datos

Cuando Antigravity las solicite, responde asi:

```yaml
mysql:
  hostname: localhost
  database: [nombre_database]
  username: [usuario_mysql]
  password: [contrasena]
```

Antigravity configurara api/.env automaticamente.

---

## PASO 4 - Instalar CodeIgniter 4

Si Antigravity te lo indica:

1. Ve a: https://github.com/codeigniter4/framework/releases
2. Descarga el ZIP de la ultima version estable
3. Extrae el contenido dentro de la carpeta api/ del proyecto
4. Confirma a Antigravity: listo

---

## PASO 5 - Generacion del backend

Antigravity generara en orden: rutas, filtros, controladores y schema SQL.
Tu rol es **revisar y aprobar** cada archivo con: continua

**Al recibir el database.sql:**
1. cPanel -> phpMyAdmin -> selecciona tu DB -> pestana SQL
2. Pega y ejecuta el contenido
3. Confirma a Antigravity que la DB esta lista

---

## PASO 6 - Generacion del frontend

Antigravity generara vistas HTML para cada rol.
Si falta alguna funcionalidad, indicala: "falta la pantalla de [nombre]"

**Tu respuesta entre archivos:** continua

---

## PASO 7 - Deploy al servidor

### 7.1 Solicitar preparacion para produccion
```text
prepara el deploy al servidor, el dominio es: [URL]
```

### 7.2 Proveer credenciales FTP
Comparte la captura de Manual Settings en cPanel -> FTP Accounts, o escribe:

```text
FTP Server: ftp.[dominio]
Usuario: [usuario]@[dominio]
Contrasena: [contrasena]
Directorio: [document root]
```

### 7.3 Aprobar el comando de deploy
```text
python deploy_ftp.py
```

> **Error frecuente:** Si el FTP falla, verifica que el host sea ftp.dominio.com
> y que la ruta del directorio en el servidor sea la correcta (consultar File Manager de cPanel).

---

## Historial de Versiones

| Version | Fecha | Autor | Descripcion |
|---------|-------|-------|--------------|
| 1.0.1 | 2026-05-05 | Luis Carlos Morales (CTO) | **Patch:** se agregan compuertas obligatorias Comercial -> Produccion -> Comercial, incluyendo validacion del SOW y validacion final pre-cliente del frontend y funcionalidades. |
| 1.0.0 | 2026-05-05 | Luis Carlos Morales (CTO) | Version inicial de produccion. **Major:** proceso replicable estable. **Minor:** sin nuevas etapas o pasos desde el lanzamiento. **Patch:** sin correcciones aplicadas. |

---

## PASO 8 - Crear el primer usuario administrador

El archivo setup_admin.php fue subido automaticamente al servidor.

**Sin Terminal en cPanel** (caso mas comun en Site5):

```text
https://[tu-dominio]/setup_admin.php?token=[TOKEN]
```

El token lo genera Antigravity. Las credenciales aparecen en pantalla.

> **Obligatorio:** Eliminar setup_admin.php del servidor inmediatamente despues.
> cPanel -> File Manager -> buscar el archivo -> Delete.

---

## PASO 9 - Validacion E2E

Pide a Antigravity:

```text
haz una prueba end-to-end: crea un usuario de prueba, ejecuta el flujo
principal y verifica que todo funciona correctamente
```

Antigravity navegara el sistema con su agente de browser y reportara resultados.
Si algo falla, describe exactamente lo que ves y Antigravity lo corregira.

---

## PASO 10 - Validacion Comercial final (pre-presentacion)

Antes de presentar al cliente, Comercial debe validar explicitamente:

- Frontend: estructura, textos, flujo visual y consistencia con lo prometido.
- Funcionalidad: flujos criticos, reglas de negocio y casos de uso acordados.
- Alineacion con SOW: que lo entregado coincida con alcance y prioridades aprobadas.

Si Comercial detecta diferencias, Produccion aplica correcciones y se repite esta validacion.

---

## Resolucion de errores frecuentes

| Lo que ves | Causa | Que decirle a Antigravity |
|---|---|---|
| 403 en la URL raiz | .htaccess muy restrictivo | "tengo 403 en la raiz del dominio" |
| 403 al llamar al API | .htaccess bloquea rutas virtuales | "el endpoint /api/... devuelve 403" |
| 404 despues del login | URL de redireccion no existe | "despues del login lleva a una 404" |
| FTP no conecta | Host FTP incorrecto | "FTP falla" + captura de Manual Settings |
| Archivos en ruta incorrecta | Rutas absolutas con FTP chrooteado | captura del File Manager con la estructura real |
| PHP visible sin ejecutar | PHP no activo en ese dominio | "el servidor muestra codigo PHP sin ejecutarlo" |
| Error 500 sin detalle | Modo production oculta errores | "500 sin detalle, activa modo development" |
| Sesion no persiste | Permisos en writable/session/ | "la sesion no se mantiene entre paginas" |

---

## Checklist final

### Seguridad
- [ ] setup_admin.php eliminado del servidor
- [ ] .env no esta en Git (verificar .gitignore)
- [ ] api/ no es accesible directamente via browser
- [ ] Cookies son HttpOnly (DevTools -> Application -> Cookies)

### Funcionalidad
- [ ] Login funciona para todos los roles
- [ ] Cada rol ve solo lo que debe ver
- [ ] El flujo principal funciona de inicio a fin
- [ ] Comercial valido frontend y funciones antes de presentar al cliente
- [ ] SOW aprobado por Comercial coincide con lo implementado

### Servidor
- [ ] Sitio carga en https://[dominio]
- [ ] Permisos de api/writable/ son 755
- [ ] .env tiene CI_ENVIRONMENT = production

---

## Tiempo estimado

| Etapa | Tiempo tipico |
|---|---|
| Configuracion cPanel | 15-30 min |
| Prompt + aprobacion del plan | 5-10 min |
| Generacion backend (Antigravity) | 10-20 min |
| Generacion frontend (Antigravity) | 10-20 min |
| Deploy y configuracion servidor | 10-30 min |
| Resolucion de errores de servidor | 15-45 min |
| Prueba E2E | 5-10 min |
| **Total** | **~1.5 a 3 horas** |

---

*Dataholics Development Standards - 2026*  
*Ver tambien: MVP_Development_Guideline.md · Tech_Stack_Guideline.md*
