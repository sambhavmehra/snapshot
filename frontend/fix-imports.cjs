const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace `import ... from '../something'` with absolute or relative fix
  content = content.replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, (match, p1) => {
    changed = true;
    return `from '@/${p1}'`;
  });
  
  content = content.replace(/from\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, (match, p1) => {
    changed = true;
    return `from '@/${p1}'`;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed imports in:', file);
  }
}
