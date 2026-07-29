import urllib.request
import zipfile
import io
import os
import shutil

api_dir = r"C:\Users\luisc\Documents\Dataholics\Dataholics Guidelines\proyectos\BestQuality\api"
os.makedirs(api_dir, exist_ok=True)

# We download codeigniter4/framework v4.5.1 or v4.5.5. Let's try downloading the standard framework zip.
url = "https://github.com/codeigniter4/framework/archive/refs/tags/v4.5.5.zip"

print(f"Downloading CodeIgniter 4 from {url}...")
try:
    with urllib.request.urlopen(url) as response:
        zip_data = response.read()
    print("Download complete. Extracting zip file...")
    
    with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_ref:
        # CodeIgniter framework zip extracts to folder "framework-4.5.5"
        # We want to extract its contents directly into api/
        for member in zip_ref.infolist():
            # Remove top level folder from member path
            parts = member.filename.split('/')
            if len(parts) > 1:
                parts.pop(0) # Remove "framework-4.5.5"
                new_filename = os.path.join(api_dir, *parts)
                if member.is_dir():
                    os.makedirs(new_filename, exist_ok=True)
                else:
                    os.makedirs(os.path.dirname(new_filename), exist_ok=True)
                    with zip_ref.open(member) as source, open(new_filename, "wb") as target:
                        shutil.copyfileobj(source, target)
                        
    print("CodeIgniter 4 installed successfully in api/ folder.")
except Exception as e:
    print(f"Error installing CodeIgniter 4: {e}")
