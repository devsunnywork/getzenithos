
from bs4 import BeautifulSoup
import subprocess
import os

filepath = r"c:\Advik\Development\Project Alpha\admin.html"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')
scripts = soup.find_all('script')

print(f"Found {len(scripts)} scripts")

for i, script in enumerate(scripts):
    if script.get('src'):
        continue
    code = script.string
    if not code:
        continue
    
    # Save code to a temp file
    temp_js = f"c:\\Advik\\Development\\Project Alpha\\tmp_script_{i}.js"
    with open(temp_js, "w", encoding="utf-8") as tf:
        tf.write(code)
    
    print(f"Checking script {i}...")
    result = subprocess.run(["node", "--check", temp_js], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR IN SCRIPT {i}:")
        print(result.stderr)
    else:
        print(f"Script {i} is valid.")
    
    # OS cleanup
    # os.remove(temp_js) # Leave for now if we want to debug
