import glob
import re

for tf in sorted(glob.glob('test-*.mjs')):
    content = open(tf, encoding='utf-8').read()
    matches = set(re.findall(r'(?:src|backend)/[a-zA-Z0-9_./-]+', content))
    if matches:
        print(f"=== {tf} ===")
        for m in sorted(matches):
            print(f"  {m}")

