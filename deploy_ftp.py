import os
from ftplib import FTP

def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        raise FileNotFoundError("No se encontró el archivo .env con las credenciales de FTP.")
    
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split('=', 1)
            if len(parts) == 2:
                env_vars[parts[0].strip()] = parts[1].strip()
    return env_vars

def upload_directory(ftp, local_dir, remote_dir):
    """
    Sube recursivamente un directorio local a un directorio remoto en el servidor FTP.
    """
    for name in os.listdir(local_dir):
        local_path = os.path.join(local_dir, name)
        remote_path = f"{remote_dir}/{name}"
        
        # Ignorar archivos del sistema local y el script de deploy mismo
        if name in ['.git', '.gitignore', 'deploy_ftp.py', 'test_reconciliation.py', 'database.sql', 'install_ci4.py', 'seed.php', 'extracted_temp', 'unpack_walkthrough.py', 'system', 'user_guide', 'tests']:
            continue
            
        if os.path.isdir(local_path):
            # Crear directorio remoto si no existe
            try:
                ftp.mkd(remote_path)
                print(f"Directorio remoto creado: {remote_path}")
            except Exception:
                # El directorio probablemente ya existe
                pass
            upload_directory(ftp, local_path, remote_path)
        else:
            # Subir archivo
            print(f"Subiendo: {local_path} -> {remote_path}")
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)

def main():
    print("--- INICIANDO DESPLIEGUE FTP ---")
    
    # 1. Cargar credenciales del archivo .env
    try:
        env = load_env()
        ftp_host = env.get('FTP_HOST', 'ftp.dataholics.com.mx')
        ftp_user = env.get('FTP_USER', 'DEF_bqs@bqs.dataholics.com.mx')
        ftp_pass = env.get('FTP_PASS')
        ftp_port = int(env.get('FTP_PORT', '21'))
    except Exception as e:
        print(f"Error al cargar credenciales del .env: {e}")
        return

    # 2. Conectar al servidor FTP
    print(f"Conectando a {ftp_host}:{ftp_port}...")
    try:
        ftp = FTP()
        ftp.connect(ftp_host, ftp_port)
        ftp.login(ftp_user, ftp_pass)
        print("Conexión FTP establecida con éxito.")
    except Exception as e:
        print(f"Error de conexión FTP: {e}")
        return

    # 3. Subir carpetas del proyecto
    base_dir = os.path.dirname(__file__)
    public_html_local = os.path.join(base_dir, 'public_html')
    api_local = os.path.join(base_dir, 'api')

    try:
        # Subir el frontend a la carpeta raíz del FTP
        if os.path.exists(public_html_local):
            print("Subiendo frontend (public_html)...")
            upload_directory(ftp, public_html_local, '')
            
        # Subir el backend a una carpeta superior para seguridad
        if os.path.exists(api_local):
            print("Subiendo backend (api)...")
            try:
                ftp.mkd('api')
            except Exception:
                pass
            upload_directory(ftp, api_local, 'api')
            
        print("\n--- DESPLIEGUE FINALIZADO CON ÉXITO ---")
    except Exception as e:
        print(f"Error durante el despliegue: {e}")
    finally:
        ftp.quit()

if __name__ == '__main__':
    main()
