/* ============================================
   app.js - Main JavaScript Entry Point
   ============================================
   
   Imports all JS modules for bundling with esbuild.
   Order matters - dependencies first!
   
   ============================================ */

// === UTILITIES (First - other modules depend on these) ===
import './utils/utils.js';
import './utils/mobile-spotlight.js';

// === PODS (Reusable components) ===
import './pods/nav.js';
import './pods/footer.js';
import './pods/project-card-v2.js';
import './pods/carousel.js';
import './pods/tool-card.js';
import './pods/term-card.js';
import './pods/submit-project-form.js';
import './pods/submit-idea-form.js';
import './pods/home-sections.js';

// === PAGES (Page-specific logic) ===
import './pages/home.js';
import './pages/projects.js';
import './pages/tools.js';
import './pages/dictionary.js';

// === DISCORD WEBHOOKS ===
import './discord-webhooks.js';

console.log('📦 Division Zero app loaded');
