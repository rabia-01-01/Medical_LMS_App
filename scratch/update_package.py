with open('package.json', 'r', encoding='utf-8') as f:
    text = f.read()

target = '"dev": "vite",'
replacement = '"dev": "vite",\n    "dev:backend": "node backend/server.js",'

if target in text:
    text = text.replace(target, replacement)
    with open('package.json', 'w', encoding='utf-8') as f:
        f.write(text)
    print("package.json updated successfully")
else:
    print("Target not found")

