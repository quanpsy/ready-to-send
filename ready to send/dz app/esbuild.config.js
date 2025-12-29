/* ============================================
   esbuild.config.js - SPA Build Configuration
   ============================================
   
   Creates production SPA build in dist/:
   - Bundles JS and CSS
   - MERGES all HTML pages into single index.html
   - Adds SPA router
   - Copies assets
   - Adds service worker
   
   Run: node esbuild.config.js
   
   ============================================ */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// JS files in correct load order (router first!)
const jsFiles = [
    'js/router.js',           // SPA Router - MUST BE FIRST
    'js/utils.js',
    'js/config.js',
    'js/utils/mobile-spotlight.js',
    'js/components/nav.js',
    'js/components/footer.js',
    'js/pods/project-card-v2.js',
    'js/pods/carousel.js',
    'js/pods/tool-card.js',
    'js/pods/term-card.js',
    'js/pods/submit-project-form.js',
    'js/pods/submit-idea-form.js',
    'js/pods/home-sections.js',
    'js/pages/home.js',
    'js/pages/projects.js',
    'js/pages/tools.js',
    'js/pages/dictionary.js',
    'js/pages/submit.js',
    'js/discord-webhooks.js',
    'js/supabase-client.js'
];

// CSS files in correct order
const cssFiles = [
    'css/_config.css',
    'css/_reset.css',
    'css/_typography.css',
    'css/_utilities.css',
    'css/layout/grid.css',
    'css/layout/nav.css',
    'css/layout/footer.css',
    'css/components/buttons.css',
    'css/components/cards.css',
    'css/components/carousel.css',
    'css/components/forms.css',
    'css/components/glow.css',
    'css/components/key-modal.css',
    'css/components/modal.css',
    'css/components/tags.css',
    'css/pods/hero.css',
    'css/pods/home-sections.css',
    'css/pods/project-card-v2.css',
    'css/pods/tool-card.css',
    'css/pods/term-card.css',
    'css/pods/submit-project-form.css',
    'css/pods/submit-idea-form.css',
    'css/pods/feature-card.css',
    'css/pages/projects-page.css',
    'css/utils/mobile-spotlight.css'
];

// HTML pages to merge into SPA
const htmlPages = [
    { file: 'index.html', id: 'home', isMain: true },
    { file: 'projects.html', id: 'projects' },
    { file: 'tools.html', id: 'tools' },
    { file: 'dictionary.html', id: 'dictionary' },
    { file: 'submit.html', id: 'submit' }
];

// Copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Extract <body> content from HTML file
function extractBodyContent(html) {
    // Remove nav and footer placeholders (we'll have one global nav/footer)
    html = html.replace(/<div id="nav-placeholder"[^>]*><\/div>/g, '');
    html = html.replace(/<div id="footer-placeholder"><\/div>/g, '');

    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) return '';

    let body = bodyMatch[1];

    // Remove script tags (we'll add them globally)
    body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    return body.trim();
}

// Extract <head> content (only from main page)
function extractHeadContent(html) {
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    return headMatch ? headMatch[1] : '';
}

// Build SPA HTML by merging all pages
function buildSpaHtml() {
    const mainPage = htmlPages.find(p => p.isMain);
    const mainHtml = fs.readFileSync(mainPage.file, 'utf8');

    // Get head from main page
    let head = extractHeadContent(mainHtml);

    // Remove old CSS/JS references
    head = head.replace(/<link rel="stylesheet" href="css\/[^"]+\.css">\s*/g, '');
    head = head.replace(/<script src="js\/[^"]+\.js"><\/script>\s*/g, '');

    // Add CSS bundle at the end of head content
    head += `
    <!-- CSS Bundle -->
    <link rel="stylesheet" href="styles.min.css">`;

    // Add PWA tags if not present
    if (!head.includes('rel="manifest"')) {
        head = head.replace('</title>', `</title>

    <!-- Favicon (using white-logo.svg to save edge request) -->
    <link rel="icon" type="image/svg+xml" href="/assets/images/white-logo.svg">

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#8b5cf6">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="apple-touch-icon" href="/assets/images/white-logo.svg">`);
    }

    // Build page sections
    let pagesHtml = '';
    for (const page of htmlPages) {
        if (!fs.existsSync(page.file)) continue;

        const html = fs.readFileSync(page.file, 'utf8');
        const content = extractBodyContent(html);
        const isActive = page.isMain ? 'active' : '';
        const display = page.isMain ? 'block' : 'none';

        pagesHtml += `
    <!-- PAGE: ${page.id.toUpperCase()} -->
    <div id="page-${page.id}" class="spa-page ${isActive}" style="display: ${display};">
        ${content}
    </div>
`;
    }

    // Build final SPA HTML
    const spaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
${head}

    <!-- SPA Page Styles -->
    <style>
        /* Hide body until router is ready - prevents flash */
        body { opacity: 0; }
        body.ready { opacity: 1; transition: opacity 0.2s ease; }
        
        .spa-page { display: none; }
        .spa-page.active { display: block; }
        
        /* Page open animation for non-home pages */
        @keyframes pageOpen {
            from {
                opacity: 0;
                transform: translateY(15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Apply animation only to non-home pages when active AND not already animated */
        #page-projects.active:not(.animated),
        #page-tools.active:not(.animated),
        #page-dictionary.active:not(.animated),
        #page-submit.active:not(.animated) {
            animation: pageOpen 0.5s ease-out forwards;
        }
        
        /* Min-height for content containers - prevents footer jump during loading */
        #projects-container,
        #tools-container,
        #terms-grid {
            min-height: 60vh;
        }
        
        @media (max-width: 768px) {
            #projects-container,
            #tools-container,
            #terms-grid {
                min-height: 50vh;
            }
        }
    </style>
</head>
<body>
    <!-- NAVIGATION (global) -->
    <div id="nav-placeholder" data-page="home"></div>

    <!-- SPA PAGES CONTAINER -->
    <main id="spa-app">
${pagesHtml}
    </main>

    <!-- FOOTER (global) -->
    <div id="footer-placeholder"></div>

    <!-- JS Bundle -->
    <script src="app.min.js"></script>

    <!-- Service Worker -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered'))
                    .catch(err => console.log('SW error:', err));
            });
        }
    </script>
</body>
</html>`;

    return spaHtml;
}

async function build() {
    console.log('🔨 Building SPA production...\n');

    // Clean and create dist folder
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true });
    }
    fs.mkdirSync('dist');

    // === BUNDLE JS ===
    console.log('📦 Bundling JavaScript (with router)...');
    let jsContent = '';
    let jsCount = 0;
    for (const file of jsFiles) {
        if (fs.existsSync(file)) {
            jsContent += fs.readFileSync(file, 'utf8') + '\n';
            jsCount++;
        }
    }
    fs.writeFileSync('dist/_temp.js', jsContent);
    await esbuild.build({
        entryPoints: ['dist/_temp.js'],
        minify: true,
        outfile: 'dist/app.min.js',
        target: ['es2020']
    });
    fs.unlinkSync('dist/_temp.js');

    // === BUNDLE CSS ===
    console.log('🎨 Bundling CSS...');
    let cssContent = '';
    let cssCount = 0;
    for (const file of cssFiles) {
        if (fs.existsSync(file)) {
            cssContent += fs.readFileSync(file, 'utf8') + '\n';
            cssCount++;
        }
    }
    fs.writeFileSync('dist/_temp.css', cssContent);
    await esbuild.build({
        entryPoints: ['dist/_temp.css'],
        minify: true,
        outfile: 'dist/styles.min.css'
    });
    fs.unlinkSync('dist/_temp.css');

    // === BUILD SPA HTML ===
    console.log('🏠 Building SPA (merging all pages)...');
    const spaHtml = buildSpaHtml();
    fs.writeFileSync('dist/index.html', spaHtml);

    // === COPY PWA FILES ===
    console.log('📱 Adding PWA files...');
    fs.copyFileSync('manifest.json', 'dist/manifest.json');
    fs.copyFileSync('sw.js', 'dist/sw.js');
    // Note: favicon.svg removed - using /assets/images/white-logo.svg instead

    // === COPY VERCEL CONFIG (for SPA routing) ===
    if (fs.existsSync('vercel.json')) {
        fs.copyFileSync('vercel.json', 'dist/vercel.json');
    }

    // === COPY ASSETS ===
    console.log('📁 Copying assets...');
    copyDir('assets', 'dist/assets');
    copyDir('data', 'dist/data');

    // === SUMMARY ===
    const jsSize = fs.statSync('dist/app.min.js').size;
    const cssSize = fs.statSync('dist/styles.min.css').size;
    const htmlSize = fs.statSync('dist/index.html').size;

    console.log(`\n✅ SPA build complete!\n`);
    console.log(`   Location: dist/`);
    console.log(`   HTML: 5 pages → 1 SPA (${(htmlSize / 1024).toFixed(2)} KB)`);
    console.log(`   JS:   ${jsCount} files → ${(jsSize / 1024).toFixed(2)} KB`);
    console.log(`   CSS:  ${cssCount} files → ${(cssSize / 1024).toFixed(2)} KB`);
    console.log(`   Total: ${((jsSize + cssSize + htmlSize) / 1024).toFixed(2)} KB`);
    console.log(`   PWA: ✓ manifest.json, sw.js`);
    console.log(`\n   🚀 Only 6 edge requests for entire site!\n`);
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
