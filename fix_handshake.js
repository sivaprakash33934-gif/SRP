const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'img', 'icons');
const name = 'handshake';
const innerContent = '<path d="M9 11v2"/><path d="M11 11v2"/><path d="M13 11v2"/><path d="M15 11v2"/><path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"/><path d="M6 12a6 6 0 0 0 12 0"/>';

const baseTemplate = (innerContent) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">' +
  '<defs>' +
    '<linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#f0d575"/>' +
      '<stop offset="20%" stop-color="#d4af37"/>' +
      '<stop offset="50%" stop-color="#fff2b2"/>' +
      '<stop offset="80%" stop-color="#aa7c11"/>' +
      '<stop offset="100%" stop-color="#ffd700"/>' +
    '</linearGradient>' +
    '<radialGradient id="white-badge" cx="35%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="70%" stop-color="#f8f8f8"/>' +
      '<stop offset="100%" stop-color="#e0e0e0"/>' +
    '</radialGradient>' +
    '<linearGradient id="gold-glyph" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffe58f"/>' +
      '<stop offset="30%" stop-color="#d4af37"/>' +
      '<stop offset="70%" stop-color="#aa7c11"/>' +
      '<stop offset="100%" stop-color="#d4af37"/>' +
    '</linearGradient>' +
    '<filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.15"/>' +
    '</filter>' +
    '<filter id="glyph-shadow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#553a05" flood-opacity="0.4"/>' +
    '</filter>' +
  '</defs>' +
  '<circle cx="50" cy="50" r="44" fill="url(#white-badge)" filter="url(#drop-shadow)" stroke="url(#gold-rim)" stroke-width="6"/>' +
  '<circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/>' +
  '<circle cx="50" cy="50" r="40" fill="none" stroke="#000000" stroke-width="1" opacity="0.05"/>' +
  '<g transform="translate(25, 25) scale(2.08)" filter="url(#glyph-shadow)" fill="none" stroke="url(#gold-glyph)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    innerContent +
  '</g>' +
'</svg>';

fs.writeFileSync(path.join(outDir, name + '.svg'), baseTemplate(innerContent));
console.log('✅ handshake.svg created manually');
