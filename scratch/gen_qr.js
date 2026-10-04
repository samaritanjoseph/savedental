const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/jobjo/.gemini/antigravity-ide/brain/5e087b1c-ede9-4975-be32-1a6a5d61b60e';

QRCode.toString('http://10.121.208.6:5173', { type: 'svg', width: 300, margin: 2 }, function(err, svg) {
  if (err) { console.error(err); return; }

  const html = [
    '<!DOCTYPE html>',
    '<html><head><style>',
    'body{background:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;font-family:sans-serif;}',
    'svg{width:300px;height:300px;}',
    'p{color:#333;margin-top:12px;font-size:14px;font-weight:bold;}',
    '</style></head><body>',
    svg,
    '<p>http://10.121.208.6:5173</p>',
    '</body></html>'
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'qr_final.html'), html);
  console.log('HTML QR done');
});

QRCode.toFile(path.join(outDir, 'qr_save_dental.png'), 'http://10.121.208.6:5173', {
  width: 350, margin: 2,
  color: { dark: '#000000', light: '#ffffff' }
}, function(err) {
  if (err) console.error(err);
  else console.log('PNG QR done');
});
