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

  // Add "use client" if it uses React hooks or window and doesn't have it
  if (!content.includes('"use client"') && !content.includes("'use client'")) {
    // Basic heuristic: if it has useState, useEffect, etc. or is a page/component
    if (content.match(/use(State|Effect|Context|Ref|Transition|Router|SearchParams|Pathname)/) || content.match(/onClick|onChange/)) {
      content = '"use client";\n' + content;
      changed = true;
    } else if (file.includes('page.jsx') || file.includes('layout.jsx')) {
      // Just add to all pages for simplicity in migration
      if (file !== path.join(__dirname, 'src', 'app', 'layout.jsx') && !file.includes('Providers.jsx')) {
        content = '"use client";\n' + content;
        changed = true;
      }
    }
  }

  if (content.includes('react-router-dom')) {
    changed = true;
    // Replace react-router-dom imports
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]react-router-dom['"];?/g, (match, imports) => {
      const items = imports.split(',').map(i => i.trim());
      let nextNav = [];
      let nextLink = false;
      let newImports = [];
      
      if (items.includes('useNavigate')) {
        nextNav.push('useRouter');
      }
      if (items.includes('useSearchParams')) {
        nextNav.push('useSearchParams');
      }
      if (items.includes('useLocation')) {
        nextNav.push('usePathname'); 
      }
      if (items.includes('Link')) {
        nextLink = true;
      }
      if (items.includes('Navigate')) {
        nextNav.push('redirect'); // Client-side redirect unsupported in Next 14+ this way, but works fine realistically, or we can use useRouter() to push. Better approach: import { redirect } and use it, or fallback.
      }
      
      let statements = [];
      if (nextNav.length > 0) {
        statements.push(`import { ${Array.from(new Set(nextNav)).join(', ')} } from 'next/navigation';`);
      }
      if (nextLink) {
        statements.push(`import Link from 'next/link';`);
      }
      return statements.join('\n');
    });
  }

  // Replace useNavigate() with useRouter()
  if (content.match(/useNavigate\(\)/)) {
    content = content.replace(/useNavigate\(\)/g, 'useRouter()');
    content = content.replace(/import.*?['"]react['"]/g, match => match); // just keeping syntax valid
    changed = true;
  }
  
  // Replace <Navigate to="..."> with redirect call inside component?
  // Let's replace <Navigate to="/dashboard" /> effectively with a null render and an effect, or just let users replace it manually.
  // Actually, we can replace <Navigate to="([a-zA-Z0-9_/]+)"\s*(replace\s*)?\s*\/> with null and add redirect logic, but it's easier to use a dummy Navigate component.
  if (content.includes('<Navigate')) {
    if (!content.includes('function Navigate')) {
      content += `\n/* Polyfill for Navigate */\nfunction Navigate({ to }) {\n  const { useRouter } = require('next/navigation');\n  const router = useRouter();\n  require('react').useEffect(() => { router.replace(to) }, [to, router]);\n  return null;\n}\n`;
      changed = true;
    }
  }

  // Replace <Link to="..."> with <Link href="...">
  if (content.includes('<Link')) {
    content = content.replace(/<Link([^>]*)to=/g, '<Link$1href=');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
}
