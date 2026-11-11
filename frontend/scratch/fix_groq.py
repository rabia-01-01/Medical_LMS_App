with open('backend/route/aiRoutes.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_str = '"qwen/qwen3.8-27b"'
new_str = '"openai/gpt-oss-120b",\n    "openai/gpt-oss-20b",\n    "qwen/qwen3.8-27b"'

if old_str in text:
    text = text.replace(old_str, new_str)
    with open('backend/route/aiRoutes.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully updated aiRoutes.js")
else:
    print("Target not found")

