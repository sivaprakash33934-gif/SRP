const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\ruthr\\Downloads\\SRP';
const indexPath = path.join(basePath, 'index.html');

let indexContent = fs.readFileSync(indexPath, 'utf-8');

// Match everything from <span class="icon-tile">\s*<svg ... </svg>\s*</span>
// We know their order: rocket, coins, globe, shield-check
const subjects = ['rocket', 'coins', 'globe', 'shield-check'];
let count = 0;

indexContent = indexContent.replace(/<span class="icon-tile">\s*<svg[\s\S]*?<\/svg>\s*<\/span>/g, (match) => {
  const subject = subjects[count];
  count++;
  if (!subject) return match; // just in case
  return `<span class="icon-tile">
                <img src="assets/img/icons/${subject}.svg" alt="" aria-hidden="true" style="width:100%;height:100%;object-fit:contain;" loading="lazy" decoding="async">
              </span>`;
});

fs.writeFileSync(indexPath, indexContent);
console.log(`✅ Updated index.html inline SVGs (${count} found)`);
