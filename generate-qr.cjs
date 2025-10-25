const QRCode = require('qrcode');
const fs = require('fs');

const url = 'https://leovoiceagent-landing.netlify.app/waitlist';

// Generate QR code as PNG
QRCode.toFile('leo-waitlist-qr.png', url, {
  errorCorrectionLevel: 'H',
  type: 'png',
  quality: 0.95,
  margin: 1,
  width: 500,
  color: {
    dark: '#1E293B',  // Dark blue from your brand
    light: '#FFFFFF'
  }
}, (err) => {
  if (err) {
    console.error('Error generating QR code:', err);
  } else {
    console.log('QR code generated successfully: leo-waitlist-qr.png');
    console.log(`URL encoded: ${url}`);
  }
});

// Also generate as SVG
QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'H',
  margin: 1,
  color: {
    dark: '#1E293B',
    light: '#FFFFFF'
  }
}, (err, svg) => {
  if (err) {
    console.error('Error generating SVG:', err);
  } else {
    fs.writeFileSync('leo-waitlist-qr.svg', svg);
    console.log('QR code SVG generated successfully: leo-waitlist-qr.svg');
  }
});
