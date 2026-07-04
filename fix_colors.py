import re

with open("src/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

# Replace hardcoded solid white backgrounds
css = re.sub(r'background(-color)?:\s*#(?:fff|ffffff)\b;?', r'background\1: var(--surface);', css, flags=re.IGNORECASE)

# Replace translucent whites and light greens (often used for panels/headers)
css = re.sub(r'background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[0-9]+\s*\)\s*;?', r'background: var(--surface);', css)
css = re.sub(r'background:\s*rgba\(\s*248\s*,\s*251\s*,\s*243\s*,\s*0\.[0-9]+\s*\)\s*;?', r'background: var(--surface);', css)

# Replace #f8fbf3 backgrounds
css = re.sub(r'background(-color)?:\s*#f8fbf3\b;?', r'background\1: var(--bg);', css, flags=re.IGNORECASE)

# Fix header background specifically if needed (it uses the rgba replaced above)
# Fix border colors that are hardcoded to #dcebd4
css = re.sub(r'border(-bottom|-top|-left|-right)?:\s*([0-9px]+)\s*(solid|dashed|dotted)\s*rgba\(\s*220\s*,\s*235\s*,\s*212\s*,\s*0\.[0-9]+\s*\)\s*;?', r'border\1: \2 \3 var(--line);', css)

# Fix the body background gradient
css = re.sub(r'linear-gradient\(180deg,\s*#fffdf8\s*0%,\s*var\(--bg\)\s*42%,\s*#ffffff\s*100%\)', r'linear-gradient(180deg, var(--bg) 0%, var(--bg) 42%, var(--bg) 100%)', css)

with open("src/styles.css", "w", encoding="utf-8") as f:
    f.write(css)

print("CSS backgrounds safely updated for dark mode!")
