import re
import json
import base64
import gzip
import os

html_path = r"C:\Users\luisc\Documents\Dataholics\Dataholics Guidelines\proyectos\BestQuality\Docs\Portal BQS Walkthrough.html"
output_dir = r"C:\Users\luisc\Documents\Dataholics\Dataholics Guidelines\proyectos\BestQuality\Docs\unpacked_demo"

os.makedirs(output_dir, exist_ok=True)

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the manifest tag
manifest_match = re.search(r'<script type="__bundler/manifest">\s*({.*?})\s*</script>', content, re.DOTALL)
template_match = re.search(r'<script type="__bundler/template">\s*({.*?})\s*</script>', content, re.DOTALL)

if not manifest_match or not template_match:
    print("Failed to find manifest or template in the HTML.")
    exit(1)

manifest = json.loads(manifest_match.group(1))
template_data = json.loads(template_match.group(1))

# Unpack assets from manifest
asset_mapping = {}
for uuid, entry in manifest.items():
    data_bytes = base64.b64decode(entry["data"])
    if entry.get("compressed"):
        try:
            data_bytes = gzip.decompress(data_bytes)
        except Exception as e:
            print(f"Failed to decompress {uuid}: {e}")
    
    # Save asset
    mime = entry.get("mime", "")
    ext = ".bin"
    if "javascript" in mime:
        ext = ".js"
    elif "css" in mime:
        ext = ".css"
    elif "html" in mime:
        ext = ".html"
    elif "image/png" in mime:
        ext = ".png"
    elif "image/jpeg" in mime:
        ext = ".jpg"
        
    filename = f"{uuid}{ext}"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "wb") as out_f:
        out_f.write(data_bytes)
    
    asset_mapping[uuid] = filename
    print(f"Unpacked asset {uuid} ({mime}) -> {filename}")

# Save pages from template
pages = template_data.get("pages", {})
for page_id, page_html in pages.items():
    # Replace UUIDs with unpacked filenames for reference
    for uuid, filename in asset_mapping.items():
        page_html = page_html.replace(uuid, filename)
        
    page_filepath = os.path.join(output_dir, f"page_{page_id}.html")
    with open(page_filepath, "w", encoding="utf-8") as out_f:
        out_f.write(page_html)
    print(f"Saved page {page_id} -> page_{page_id}.html")

print("Unpacking complete!")
