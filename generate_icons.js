const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, 'assets', 'img', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const iconMap = {
  'rocket': 'rocket',
  'coins': 'coins',
  'globe': 'globe',
  'shield-check': 'shield-check',
  'lightbulb': 'lightbulb',
  'document-pen': 'file-edit',
  'check-badge': 'badge-check',
  'building': 'building-2',
  'wrench': 'wrench',
  'money-bag': 'banknote',
  'chart-up': 'trending-up',
  'flag': 'flag',
  'lightning': 'zap',
  'key': 'key',
  'coffee': 'coffee',
  'meeting-screen': 'monitor-play',
  'printer': 'printer',
  'sofa': 'armchair',
  'flask': 'flask-conical',
  'mic': 'mic',
  'brain': 'brain',
  'microscope': 'microscope',
  'scales': 'scale',
  'handshake': 'handshake',
  'target': 'target',
  'shield': 'shield',
  'search': 'search',
  'document': 'file-text',
  'mail': 'mail',
  'phone': 'phone',
  'pin': 'map-pin',
  'clock': 'clock'
};

const getSvg = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
          https.get("https://unpkg.com" + res.headers.location, (res2) => {
              let data = '';
              res2.on('data', chunk => data += chunk);
              res2.on('end', () => resolve(data));
          });
      } else {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
};

const baseTemplate = (innerContent) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0d575"/>
      <stop offset="20%" stop-color="#d4af37"/>
      <stop offset="50%" stop-color="#fff2b2"/>
      <stop offset="80%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#ffd700"/>
    </linearGradient>
    <radialGradient id="white-badge" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8f8f8"/>
      <stop offset="100%" stop-color="#e0e0e0"/>
    </radialGradient>
    <linearGradient id="gold-glyph" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe58f"/>
      <stop offset="30%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#d4af37"/>
    </linearGradient>
    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
    <filter id="glyph-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#553a05" flood-opacity="0.4"/>
    </filter>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#white-badge)" filter="url(#drop-shadow)" stroke="url(#gold-rim)" stroke-width="6"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#000000" stroke-width="1" opacity="0.05"/>
  <g transform="translate(25, 25) scale(2.08)" filter="url(#glyph-shadow)" fill="none" stroke="url(#gold-glyph)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${innerContent}
  </g>
</svg>`;

async function main() {
  for (const [name, lucideName] of Object.entries(iconMap)) {
    try {
      const url = "https://unpkg.com/lucide-static@0.292.0/icons/" + lucideName + ".svg";
      const svg = await getSvg(url);
      
      const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
      if (match && match[1]) {
        let inner = match[1].trim();
        const highlightInner = inner.replace(/stroke="currentColor"/g, 'stroke="#ffffff"').replace(/stroke-width="2"/g, 'stroke-width="0.75"');
        
        const finalContent = 
          '<!-- Base metallic gold stroke -->\n' +
          inner.replace(/stroke="currentColor"/g, 'stroke="url(#gold-glyph)"') + '\n' +
          '<!-- Highlight for bevel -->\n' +
          '<g transform="translate(-0.3, -0.3)" opacity="0.7">\n' +
          highlightInner + '\n' +
          '</g>';

        const fullSvg = baseTemplate(finalContent);
        fs.writeFileSync(path.join(outDir, name + '.svg'), fullSvg);
        console.log('✅ ' + name + '.svg created');
      } else {
        console.log('❌ Failed to parse ' + name);
      }
    } catch (e) {
      console.log('❌ Error on ' + name + ': ' + e.message);
    }
  }
}

main();
