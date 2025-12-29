/* ============================================
   project-card-v2.js - Project Card Pod v2
   ============================================
   
   🔲 DESIGN 2: INLINE TOOLS & STACK
   
   Differences from v1:
   - NO dropdown/expandable section
   - Tools and Stack shown directly on card
   - Max 2 tools and 2 stack items displayed
   - Wider card to fit content
   
   ============================================ */


/**
 * Create a project card HTML string (Design v2)
 * 
 * @param {Object} project - Project data
 * @returns {string} HTML string for the card
 */
function createProjectCardV2(project = {}) {

    // ========================================
    // DEFAULTS - Handle missing data
    // Schema-compliant with backwards compatibility
    // ========================================

    const {
        name = 'Untitled Project',
        description = 'No description available.',
        logo = 'https://via.placeholder.com/80x80/8b5cf6/ffffff?text=?',
        // New schema fields with backwards compat
        originalUrl = project.vercelUrl || '#',
        // Proxy URL for view counting (camelCase from Worker, falls back to originalUrl)
        proxyUrl = project.proxyUrl || project.originalUrl || originalUrl,
        views = 0,
        tags = [],
        tools = [],
        category = 'default',
        // New schema fields with backwards compat
        githubRepo = project.github || '',
        discordThread = project.discord || '#',
        // Builder can be string (old) or object (new)
        builder = {},
        promoted = false,
        isNew = false,
        // Pricing model: free | partial | paid
        pricingModel = 'free',
        // ID for saving
        id = project.slug || ''
    } = project;

    // Handle builder as string (old) or object (new)
    const builderName = typeof builder === 'string' ? builder : (builder.name || '');
    const builderUrl = typeof builder === 'string' ? (project.builderUrl || '#') : (builder.profileUrl || '#');


    // ========================================
    // GLOW COLOR - Based on category
    // ========================================

    const glowColor = CONFIG.CATEGORY_COLORS[category] ||
        CONFIG.CATEGORY_COLORS.default;


    // ========================================
    // BADGE - Star badge for promoted/new
    // ========================================

    const badgeHTML = (promoted || isNew) ? `
        <span class="card-badge" title="${promoted ? 'Promoted' : 'New'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        </span>
    ` : '';


    // ========================================
    // GITHUB ICON - Only if URL provided
    // ========================================

    const githubHTML = githubRepo ? `
        <a href="${githubRepo}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="card-icon github-link" 
           title="View on GitHub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
        </a>
    ` : '';


    // ========================================
    // DISCORD ICON - Always shown
    // ========================================

    const discordHTML = `
        <a href="${discordThread}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="card-icon discord-mandatory" 
           title="Discord Thread">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
        </a>
    `;


    // ========================================
    // SHARE BUTTON
    // ========================================

    const shareHTML = `
        <button class="card-icon stat-share" 
                title="Share Project"
                data-share-url="${proxyUrl}"
                data-share-name="${name.replace(/"/g, '&quot;')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
        </button>
    `;


    // ========================================
    // SAVE BUTTON - Instagram-style bookmark
    // ========================================

    // Check if project is saved in localStorage
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const isSaved = savedProjects.includes(id);

    const saveHTML = `
        <button class="card-icon stat-save ${isSaved ? 'saved' : ''}" 
                title="${isSaved ? 'Unsave' : 'Save'} Project"
                data-project-id="${id}"
                data-project-name="${name.replace(/"/g, '&quot;')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>
    `;


    // ========================================
    // INLINE TOOLS - Max 2 items
    // ========================================

    const displayTools = tools.slice(0, 2);
    const toolsHTML = displayTools.length > 0 ? `
        <div class="card-inline-tech">
            <span class="inline-tech-label">Built with:</span>
            ${displayTools.map(t => `<span class="inline-tech-item">${t}</span>`).join('')}
        </div>
    ` : '';


    // ========================================
    // INLINE STACK - Max 2 items
    // ========================================

    const displayTags = tags.slice(0, 2);
    const tagsHTML = displayTags.length > 0 ? `
        <div class="card-inline-tech">
            <span class="inline-tech-label">Stack:</span>
            ${displayTags.map(t => `<span class="inline-tech-item">${t}</span>`).join('')}
        </div>
    ` : '';


    // ========================================
    // BUILDER LINK
    // ========================================

    const builderHTML = builderName
        ? (builderUrl && builderUrl !== '#'
            ? `<a href="${builderUrl}" class="card-builder" target="_blank" rel="noopener noreferrer">@${builderName}</a>`
            : `<span class="card-builder">@${builderName}</span>`)
        : '';


    // ========================================
    // PRICING BADGE - FREE / FREEMIUM / PAID
    // ========================================

    const pricingLabels = {
        'free': 'FREE',
        'partial': 'FREEMIUM',
        'paid': 'PAID'
    };
    const pricingLabel = pricingLabels[pricingModel] || 'FREE';
    const pricingBadgeHTML = `<span class="pricing-badge pricing-${pricingModel}">${pricingLabel}</span>`;


    // ========================================
    // FINAL HTML BUILD
    // ========================================

    return `
        <article class="project-card-v2" style="--glow-color: ${glowColor}" data-project-name="${name.replace(/"/g, '&quot;')}" data-project-id="${project.publicId || project.id || ''}" data-project-url="${originalUrl}" data-builder-discord="${typeof builder === 'object' ? (builder.discord || '') : ''}">
            <div class="card-wrapper">
            
                <!-- TOP: Badge -->
                <div class="card-top">
                    ${badgeHTML}
                </div>
                
                <!-- MAIN: Logo + Info -->
                <div class="card-main">
                
                    <!-- Left: Logo -->
                    <div class="card-left">
                        <a href="${proxyUrl}" target="_blank" rel="noopener noreferrer" class="card-logo-link">
                            <div class="card-logo">
                                <img src="${logo}" alt="${name} logo" loading="lazy" onerror="this.onerror=null; this.src='/assets/images/white-logo.svg'">
                            </div>
                        </a>
                    </div>
                    
                    <!-- Right: Info -->
                    <div class="card-info">
                    
                        <!-- Title -->
                        <a href="${proxyUrl}" target="_blank" rel="noopener noreferrer" class="card-title-link">
                            <h3 class="card-title">${name}</h3>
                        </a>
                        
                        <!-- Description -->
                        <p class="card-description">${description}</p>
                        
                        <!-- Meta: Views + Builder -->
                        <div class="card-meta">
                            <span class="stat-views">${utils.formatViews(views)} views</span>
                            ${builderHTML}
                        </div>
                        
                    </div>
                </div>
                
                <!-- BOTTOM: Tools, Stack, Icons -->
                <div class="card-bottom">
                    <!-- Row 1: Tools + Icons -->
                    <div class="card-bottom-row">
                        ${toolsHTML}
                        <div class="card-icons">
                            ${githubHTML}
                            ${discordHTML}
                            ${saveHTML}
                            ${shareHTML}
                        </div>
                    </div>
                    
                    <!-- Row 2: Stack + Pricing Badge -->
                    <div class="card-bottom-row">
                        ${tagsHTML}
                        ${pricingBadgeHTML}
                    </div>
                </div>
                
            </div>
        </article>
    `;
}


// Make functions available globally
window.createProjectCardV2 = createProjectCardV2;

/**
 * Initialize long-press reporting on project cards
 * Call this after cards are rendered
 */
function initProjectCardReporting() {
    const cards = document.querySelectorAll('.project-card-v2');

    cards.forEach(card => {
        let pressTimer = null;
        let isLongPress = false;

        const startPress = (e) => {
            // Don't trigger on links or buttons
            if (e.target.closest('a, button')) return;

            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                handleReport(card);
            }, 1500); // 1.5 seconds
        };

        const cancelPress = () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        };

        // Mouse events
        card.addEventListener('mousedown', startPress);
        card.addEventListener('mouseup', cancelPress);
        card.addEventListener('mouseleave', cancelPress);

        // Touch events
        card.addEventListener('touchstart', startPress, { passive: true });
        card.addEventListener('touchend', cancelPress);
        card.addEventListener('touchcancel', cancelPress);
    });
}

/**
 * Handle reporting a project
 */
async function handleReport(card) {
    const projectInfo = {
        name: card.dataset.projectName || 'Unknown',
        publicId: card.dataset.projectId || 'N/A',
        url: card.dataset.projectUrl || '',
        builderDiscord: card.dataset.builderDiscord || ''
    };

    // Visual feedback - brief flash
    card.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
    setTimeout(() => {
        card.style.boxShadow = '';
    }, 500);

    // Send to Discord
    if (window.sendReportToDiscord) {
        const result = await sendReportToDiscord(projectInfo);
        if (result.success) {
            utils.showToast('📩 Report sent! Thanks for helping.');
        } else {
            utils.showToast('Failed to send report. Try again.');
        }
    }
}


// ============================================
// SHARE & SAVE BUTTON HANDLERS
// ============================================

/**
 * Initialize share and save button handlers
 * Call this after cards are rendered
 */
function initProjectCardButtons() {
    // Share buttons
    document.querySelectorAll('.stat-share').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const url = btn.dataset.shareUrl;
            const name = btn.dataset.shareName;

            try {
                await navigator.clipboard.writeText(url);
                utils.showToast(`📋 Link copied: ${name}`);
            } catch (err) {
                utils.showToast('Failed to copy link');
            }
        });
    });

    // Save buttons - with debounce to prevent rapid-click issues
    document.querySelectorAll('.stat-save').forEach(btn => {
        // Skip if already initialized
        if (btn.dataset.initialized) return;
        btn.dataset.initialized = 'true';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const projectId = btn.dataset.projectId;
            const card = btn.closest('.project-card-v2');

            if (!projectId) return;

            // Prevent rapid clicks - simple debounce
            if (btn.dataset.processing === 'true') return;
            btn.dataset.processing = 'true';
            setTimeout(() => btn.dataset.processing = 'false', 100);

            // Toggle saved state based on current CLASS (not localStorage)
            const isSaved = btn.classList.contains('saved');

            if (isSaved) {
                // Remove from saved
                btn.classList.remove('saved');
                btn.querySelector('svg').setAttribute('fill', 'none');
                btn.title = 'Bookmark';
                removeFromSavedCarousel(projectId);

                // Update localStorage
                let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
                savedProjects = savedProjects.filter(id => id !== projectId);
                localStorage.setItem('savedProjects', JSON.stringify(savedProjects));

                // Sync ALL cards with this projectId
                document.querySelectorAll(`.stat-save[data-project-id="${projectId}"]`).forEach(otherBtn => {
                    otherBtn.classList.remove('saved');
                    otherBtn.querySelector('svg').setAttribute('fill', 'none');
                    otherBtn.title = 'Bookmark';
                });
            } else {
                // Add to saved
                btn.classList.add('saved');
                btn.querySelector('svg').setAttribute('fill', 'currentColor');
                btn.title = 'Remove Bookmark';
                addToSavedCarousel(card, projectId);

                // Update localStorage
                let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
                if (!savedProjects.includes(projectId)) {
                    savedProjects.push(projectId);
                }
                localStorage.setItem('savedProjects', JSON.stringify(savedProjects));

                // Sync ALL cards with this projectId
                document.querySelectorAll(`.stat-save[data-project-id="${projectId}"]`).forEach(otherBtn => {
                    otherBtn.classList.add('saved');
                    otherBtn.querySelector('svg').setAttribute('fill', 'currentColor');
                    otherBtn.title = 'Remove Bookmark';
                });
            }
        });
    });
}


/**
 * Add a project card to the Saved carousel
 */
function addToSavedCarousel(card, projectId) {
    let savedSection = document.getElementById('carousel-saved');

    // Create the saved carousel if it doesn't exist
    if (!savedSection) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        savedSection = document.createElement('section');
        savedSection.id = 'carousel-saved';
        savedSection.className = 'category-section project-category';
        savedSection.innerHTML = `
            <div class="category-header">
                <h2 class="category-title">❤️ Your Bookmarks</h2>
            </div>
            <div class="carousel-wrapper">
                <div class="project-carousel" id="saved-track"></div>
            </div>
        `;
        container.appendChild(savedSection);
    }

    // Clone the card and add to saved track
    const track = savedSection.querySelector('.project-carousel') || savedSection.querySelector('#saved-track');
    if (track) {
        const clone = card.cloneNode(true);
        clone.dataset.savedId = projectId;

        // Update the save button in the clone to be already saved
        const cloneSaveBtn = clone.querySelector('.stat-save');
        if (cloneSaveBtn) {
            cloneSaveBtn.classList.add('saved');
            cloneSaveBtn.querySelector('svg').setAttribute('fill', 'currentColor');
        }

        track.appendChild(clone);

        // Re-initialize button handlers for the new clone
        initProjectCardButtons();
    }
}


/**
 * Remove a project card from the Saved carousel
 */
function removeFromSavedCarousel(projectId) {
    const savedSection = document.getElementById('carousel-saved');
    if (!savedSection) return;

    // Find and remove the card with this projectId
    const cards = savedSection.querySelectorAll(`[data-saved-id="${projectId}"], [data-project-id="${projectId}"]`);
    cards.forEach(card => card.remove());

    // If no more saved items, remove the whole section
    const track = savedSection.querySelector('.carousel-track') || savedSection.querySelector('#saved-track');
    if (track && track.children.length === 0) {
        savedSection.remove();
    }
}


/**
 * Get saved project IDs from localStorage
 */
function getSavedProjectIds() {
    return JSON.parse(localStorage.getItem('savedProjects') || '[]');
}


// Make functions available globally
window.initProjectCardReporting = initProjectCardReporting;
window.initProjectCardButtons = initProjectCardButtons;
window.getSavedProjectIds = getSavedProjectIds;
