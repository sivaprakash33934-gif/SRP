const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\ruthr\\Downloads\\SRP';
const htmlFiles = [
  'index.html', 'about.html', 'incubation.html', 'coworking.html',
  'people.html', 'portfolio.html', 'events.html', 'internships.html',
  'blog.html', 'contact.html'
];

const emojiMap = {
  '🚀': 'rocket',
  '💰': 'coins',
  '🌍': 'globe',
  '🛡️': 'shield-check',
  '💡': 'lightbulb',
  '📝': 'document-pen',
  '✅': 'check-badge',
  '🏢': 'building',
  '🔧': 'wrench',
  '💵': 'money-bag',
  '📈': 'chart-up',
  '🏁': 'flag',
  '⚡': 'lightning',
  '🔑': 'key',
  '☕': 'coffee',
  '📹': 'meeting-screen',
  '🖨️': 'printer',
  '🧘': 'sofa',
  '🧪': 'flask',
  '🔬': 'microscope',
  '🎤': 'mic',
  '🧠': 'brain',
  '⚖️': 'scales',
  '🤝': 'handshake',
  '🎯': 'target',
  '🔍': 'search',
  '📄': 'document',
  '✉️': 'mail',
  '📞': 'phone',
  '📍': 'pin',
  '🕒': 'clock'
};

htmlFiles.forEach(file => {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  Object.entries(emojiMap).forEach(([emoji, subject]) => {
    const imgTag = '\n<img src="assets/img/icons/' + subject + '.svg" alt="" aria-hidden="true" style="width:100%;height:100%;object-fit:contain;">\n';
    if (content.includes(emoji)) {
      content = content.split(emoji).join(imgTag);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('✅ Updated ' + file);
  }
});

const cssPath = path.join(basePath, 'assets', 'css', 'style.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf-8');
  const fix = '\n/* ICON UPDATE FIX */\n' +
'.icon-tile, .journey-step-icon {\n' +
'  background: transparent !important;\n' +
'  border: none !important;\n' +
'}\n' +
'.icon-tile {\n' +
'  width: 64px !important;\n' +
'  height: 64px !important;\n' +
'}\n' +
'.journey-step-icon {\n' +
'  width: 48px !important;\n' +
'  height: 48px !important;\n' +
'}\n' +
'.info-card .icon-tile {\n' +
'  width: 48px !important;\n' +
'  height: 48px !important;\n' +
'}\n';
  if (!css.includes('/* ICON UPDATE FIX */')) {
    fs.appendFileSync(cssPath, fix);
    console.log('✅ Updated style.css');
  }
}
