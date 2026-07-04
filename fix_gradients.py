import re

with open("src/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

# Fix gradients that have hardcoded light colors
def replace_gradient_colors(match):
    gradient_str = match.group(0)
    # Don't replace if it's the booking-section radial gradient with rgba
    if 'rgba' in gradient_str and '#07863f' in gradient_str:
        return gradient_str
        
    gradient_str = re.sub(r'#ffffff\b', 'var(--surface)', gradient_str, flags=re.IGNORECASE)
    gradient_str = re.sub(r'#fff\b', 'var(--surface)', gradient_str, flags=re.IGNORECASE)
    gradient_str = re.sub(r'#fffdf8\b', 'var(--bg)', gradient_str, flags=re.IGNORECASE)
    gradient_str = re.sub(r'#f8fbf3\b', 'var(--bg)', gradient_str, flags=re.IGNORECASE)
    gradient_str = re.sub(r'#f4f8ec\b', 'var(--surface-soft)', gradient_str, flags=re.IGNORECASE)
    return gradient_str

css = re.sub(r'background:\s*linear-gradient\([^;]+;', replace_gradient_colors, css)

with open("src/styles.css", "w", encoding="utf-8") as f:
    f.write(css)

print("Gradients fixed!")
