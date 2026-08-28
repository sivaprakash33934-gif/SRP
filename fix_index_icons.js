const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\ruthr\\Downloads\\SRP';
const indexPath = path.join(basePath, 'index.html');

let indexContent = fs.readFileSync(indexPath, 'utf-8');

// The 4 inline SVGs in index.html to replace:
const replacements = [
  {
    find: /<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"[^>]*><path d="M4.5 16.5[^<]*<\/svg>/,
    replace: '<img src="assets/img/icons/rocket.svg" alt="" aria-hidden="true" style="width:100%;height:100%;object-fit:contain;" loading="lazy" decoding="async">'
  },
  {
    find: /<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"[^>]*><circle cx="8" cy="8" r="6"\/><path d="M18.09 10.37A6[^<]*<\/svg>/,
    replace: '<img src="assets/img/icons/coins.svg" alt="" aria-hidden="true" style="width:100%;height:100%;object-fit:contain;" loading="lazy" decoding="async">'
  },
  {
    find: /<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"[^>]*><circle cx="12" cy="12" r="10"\/><path d="M12 2a14.5[^<]*<\/svg>/,
    replace: '<img src="assets/img/icons/globe.svg" alt="" aria-hidden="true" style="width:100%;height:100%;object-fit:contain;" loading="lazy" decoding="async">'
  },
  {
    find: /<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"[^>]*><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0[^<]*<\/svg>/,
    replace: '<img src="assets/img/icons/shield-check.svg" alt="" aria-hidden="true" style="width:100%;height:100%;object-fit:contain;" loading="lazy" decoding="async">'
  }
];

let changed = false;
replacements.forEach(rep => {
  if (rep.find.test(indexContent)) {
    indexContent = indexContent.replace(rep.find, rep.replace);
    changed = true;
  }
});

if (changed) {
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Updated index.html inline SVGs');
} else {
  console.log('⚠️ No inline SVGs matched');
}

// Update style.css
const cssPath = path.join(basePath, 'assets', 'css', 'style.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf-8');
  const fix = '\n/* ICON HOVER FIX */\n' +
'.card:hover .icon-tile {\n' +
'  background: transparent !important;\n' +
'  color: inherit !important;\n' +
'  box-shadow: none !important;\n' +
'}\n';
  if (!css.includes('/* ICON HOVER FIX */')) {
    fs.appendFileSync(cssPath, fix);
    console.log('✅ Updated style.css');
  }
}
