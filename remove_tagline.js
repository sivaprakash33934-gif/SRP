const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\ruthr\\Downloads\\SRP';
const htmlFiles = [
  'index.html', 'about.html', 'incubation.html', 'coworking.html',
  'people.html', 'portfolio.html', 'events.html', 'internships.html',
  'blog.html', 'contact.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Remove from brand-name (navbar & footer)
  content = content.replace(/<span class="brand-name">Sriram Research Park<small>formerly Anna Incubator<\/small><\/span>/g, '<span class="brand-name">Sriram Research Park</span>');
  
  // 2. Remove from footer bottom line
  content = content.replace(/<p>Formerly Anna Incubator<\/p>\s*/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${file}`);
});
