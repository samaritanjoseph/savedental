import qrcode
import base64
from io import BytesIO
import os
import socket

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

local_ip = get_local_ip()
url = f"http://{local_ip}:5173"

qr = qrcode.QRCode(version=1, box_size=10, border=4)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color='black', back_color='white')

buffered = BytesIO()
img.save(buffered, format='PNG')
img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Scan QR Code</title>
    <style>
        body {{ display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f0f4ff; margin: 0; }}
        .card {{ background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; }}
        img {{ max-width: 100%; height: auto; }}
        .url {{ background: #f0f4ff; padding: 10px; border-radius: 8px; margin-top: 20px; color: #3b5bdb; font-weight: bold; font-size: 1.2rem; }}
    </style>
</head>
<body>
    <div class="card">
        <h1>Scan to open on your phone</h1>
        <p>Ensure phone is on same WiFi as PC</p>
        <img src="data:image/png;base64,{img_str}" alt="QR Code">
        <div class="url">{url}</div>
    </div>
</body>
</html>"""

with open('local_qr.html', 'w', encoding='utf-8') as f:
    f.write(html)
