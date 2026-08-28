const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\ruthr\\Downloads\\SRP';
const jsPath = path.join(basePath, 'assets', 'js');
const bundlesPath = path.join(jsPath, 'bundles');
if (!fs.existsSync(bundlesPath)) {
  fs.mkdirSync(bundlesPath, { recursive: true });
}

// We can read index.html to get the script tags in exact order.
const indexHtml = fs.readFileSync(path.join(basePath, 'index.html'), 'utf-8');
const scriptRegex = /<script src="(assets\/js\/[^"]+)" defer><\/script>/g;
let match;
const allScripts = [];
while ((match = scriptRegex.exec(indexHtml)) !== null) {
  if (!match[1].includes('main.js') && !match[1].includes('bundles')) {
    allScripts.push(match[1]);
  }
}

// We need to group them.
// The prompt specifies:
// core.js (utils, config, event-bus, manifest, performance, routes, manager)
// animations.js (fade, slide, depth, mask, wave)
// components.js (cursor, magnetic, progress-bar, counters, hover, page-transition)
// modules.js (ALL page modules: hero, stats, showcase, chairman, etc.)

const coreScripts = [];
const animationsScripts = [];
const componentsScripts = [];
const modulesScripts = [];

allScripts.forEach(script => {
  if (script.includes('utils/') || script.includes('config.js') || script.includes('theme.js') || script.includes('motion-config.js') || script.includes('event-bus.js') || script.includes('manifest.js') || script.includes('performance.js') || script.includes('routes.js') || script.includes('manager.js')) {
    coreScripts.push(script);
  } else if (script.includes('animations/')) {
    animationsScripts.push(script);
  } else if (script.includes('components/')) {
    componentsScripts.push(script);
  } else if (script.includes('modules/')) {
    modulesScripts.push(script);
  }
});

function concatScripts(fileList, outputName) {
  let content = '';
  fileList.forEach(file => {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
      content += `\n/* --- ${file} --- */\n` + fs.readFileSync(fullPath, 'utf-8') + '\n';
    } else {
      console.log(`⚠️ File not found: ${file}`);
    }
  });
  fs.writeFileSync(path.join(bundlesPath, outputName), content);
  console.log(`✅ ${outputName} bundled (${fileList.length} files)`);
}

concatScripts(coreScripts, 'core.js');
concatScripts(animationsScripts, 'animations.js');
concatScripts(componentsScripts, 'components.js');
concatScripts(modulesScripts, 'modules.js');

// Now update all 10 HTML files
const htmlFiles = [
  'index.html', 'about.html', 'incubation.html', 'coworking.html',
  'people.html', 'portfolio.html', 'events.html', 'internships.html',
  'blog.html', 'contact.html'
];

const newScriptsBlock = `
  <!-- Bundled JS -->
  <script src="assets/js/bundles/core.js" defer></script>
  <script src="assets/js/bundles/animations.js" defer></script>
  <script src="assets/js/bundles/components.js" defer></script>
  <script src="assets/js/bundles/modules.js" defer></script>
  <script src="assets/js/main.js" defer></script>
</body>`;

// Head injections
const headInjections = `
  <!-- Resource Hints -->
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="preconnect" href="https://unpkg.com" crossorigin>
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="preload" as="image" href="assets/svg/logos/srp-logo.svg">
</head>`;

htmlFiles.forEach(file => {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Replace Scripts
  // Remove all local scripts
  const localScriptRegex = /[ \t]*<script src="assets\/js\/[^"]+" defer><\/script>\r?\n/g;
  content = content.replace(localScriptRegex, '');
  
  // Clean up any remaining main.js or other local scripts just in case
  content = content.replace(/[ \t]*<script src="assets\/js\/main\.js" defer><\/script>\r?\n/g, '');
  
  // Insert bundled block right before </body>
  content = content.replace('</body>', newScriptsBlock);
  
  // 2. Head Injections
  // Remove existing hints to avoid duplicates if script runs twice
  content = content.replace(/[ \t]*<!-- Resource Hints -->\r?\n[ \t]*<link rel="preconnect"[^\n]+\r?\n[ \t]*<link rel="preconnect"[^\n]+\r?\n[ \t]*<link rel="dns-prefetch"[^\n]+\r?\n[ \t]*<link rel="preload"[^\n]+\r?\n/g, '');
  content = content.replace('</head>', headInjections);
  
  // 3. Image Lazy Loading & Priorities
  // We want to add loading="lazy" decoding="async" to images, EXCEPT for hero.
  // We can do this carefully using regex.
  // First, remove existing loading/fetchpriority/decoding to reset
  content = content.replace(/ (loading="lazy"|decoding="async"|fetchpriority="high")/g, '');
  
  // Find all <img> tags
  // Add lazy loading to all
  content = content.replace(/<img([^>]+)>/g, (match, p1) => {
    // If it has class="hero-image" or similar, or it's early in the document.
    // Let's identify the hero image by context or class.
    // Or simpler: The first 1-2 images in <main> could be hero.
    // But we know SRP logo is usually <img src="assets/svg/logos/srp-logo.svg" ...>
    if (p1.includes('srp-logo.svg') || p1.includes('hero')) {
      return `<img${p1} fetchpriority="high">`;
    } else {
      return `<img${p1} loading="lazy" decoding="async">`;
    }
  });

  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${file}`);
});
