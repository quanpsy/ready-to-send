/* ============================================
   submit-project-form.js - Submit Project Pod
   ============================================
   
   🔲 ISOLATED COMPONENT: PROJECT SUBMISSION
   
   Handles:
   - Project form validation
   - Tile/chip selection for tools and stack
   - Form submission to Discord webhook
   
   ============================================ */


/**
 * Initialize project form functionality
 */
function initProjectForm() {
    const form = document.getElementById('project-form');
    if (!form) return;

    initProjectTileSelection(form);
    initProjectValidation(form);
    form.addEventListener('submit', handleProjectSubmit);
}


/**
 * Initialize tile selection for project form
 */
function initProjectTileSelection(form) {
    const tileGrids = form.querySelectorAll('.tile-grid');

    tileGrids.forEach(grid => {
        const tiles = grid.querySelectorAll('.tile');
        const maxSelections = parseInt(grid.dataset.maxSelect) || 5;

        tiles.forEach(tile => {
            tile.addEventListener('click', function () {
                const isSelected = this.classList.contains('selected');
                const selectedCount = grid.querySelectorAll('.tile.selected').length;

                if (isSelected) {
                    this.classList.remove('selected');
                } else if (selectedCount < maxSelections) {
                    this.classList.add('selected');
                } else {
                    utils.showToast(`You can only select up to ${maxSelections} items`);
                }

                updateProjectTileValues(grid);
            });
        });
    });
}


/**
 * Update hidden input with selected values
 */
function updateProjectTileValues(grid) {
    const inputName = grid.dataset.inputName;
    if (!inputName) return;

    const selectedTiles = grid.querySelectorAll('.tile.selected');
    const values = Array.from(selectedTiles).map(t => t.dataset.value);

    const form = grid.closest('form');
    const input = form.querySelector(`input[name="${inputName}"]`);
    if (input) {
        input.value = values.join(',');
    }
}


/**
 * Initialize project form validation
 */
function initProjectValidation(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateProjectInput(this);
        });

        input.addEventListener('input', function () {
            clearProjectInputError(this);
        });
    });
}


/**
 * Validate project form input
 */
function validateProjectInput(input) {
    const value = input.value.trim();
    const group = input.closest('.form-group');

    if (input.required && !value) {
        setProjectInputError(group, 'This field is required');
        return false;
    }

    if (input.type === 'url' && value) {
        try {
            new URL(value);
        } catch {
            setProjectInputError(group, 'Please enter a valid URL');
            return false;
        }
    }

    // Logo URL must be from approved hosts
    if (input.id === 'project-logo' && value) {
        const allowedHosts = ['imgur.com', 'i.imgur.com', 'imgbb.com', 'i.ibb.co', 'github.com', 'raw.githubusercontent.com'];
        try {
            const url = new URL(value);
            const isAllowed = allowedHosts.some(host => url.hostname.includes(host));
            if (!isAllowed) {
                setProjectInputError(group, 'Imgur, ImgBB, GitHub only');
                return false;
            }
        } catch {
            // Already handled above
        }
    }

    // GitHub repo URL must be from github.com
    if (input.id === 'project-github' && value) {
        try {
            const url = new URL(value);
            if (!url.hostname.includes('github.com')) {
                setProjectInputError(group, 'GitHub URLs only');
                return false;
            }
        } catch {
            // Already handled above
        }
    }

    clearProjectInputError(input);
    return true;
}


/**
 * Set error state on input
 */
function setProjectInputError(group, message) {
    if (!group) return;

    group.classList.add('error');
    group.classList.remove('success');

    let hint = group.querySelector('.form-hint');
    if (hint) {
        if (!hint.dataset.originalHint) {
            hint.dataset.originalHint = hint.textContent;
        }
        hint.textContent = message;
        hint.classList.add('warning-text');
    }
}


/**
 * Clear error state on input
 */
function clearProjectInputError(input) {
    const group = input.closest('.form-group');
    if (!group) return;

    group.classList.remove('error');

    const hint = group.querySelector('.form-hint');
    if (hint) {
        hint.classList.remove('warning-text');
        const originalHint = hint.dataset.originalHint;
        if (originalHint) hint.textContent = originalHint;
    }
}


/**
 * Handle project form submission
 */
async function handleProjectSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');

    // Validate all required fields
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateProjectInput(input)) {
            isValid = false;
        }
    });

    // Also validate logo URL
    const logoInput = form.querySelector('#project-logo');
    if (logoInput && !validateProjectInput(logoInput)) {
        isValid = false;
    }

    // Also validate GitHub repo URL
    const githubInput = form.querySelector('#project-github');
    if (githubInput && githubInput.value.trim() && !validateProjectInput(githubInput)) {
        isValid = false;
    }

    if (!isValid) {
        utils.showToast('Please fix the errors before submitting');
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Collect form data
    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData.entries());

    // Get selected tools and tags from tile grids
    const tileGrids = form.querySelectorAll('.tile-grid');
    const tileData = {};
    tileGrids.forEach(grid => {
        const inputName = grid.dataset.inputName;
        const selected = Array.from(grid.querySelectorAll('.tile.selected'))
            .map(t => t.dataset.value);
        tileData[inputName] = selected;
    });

    // Build schema-compliant JSON
    const projectData = {
        name: rawData.name || '',
        description: rawData.description || '',
        category: rawData.category || '',
        builder: {
            name: rawData.builderName || '',
            discord: rawData.discord || '',
            profileUrl: rawData.profileUrl || '',
            email: rawData.email || ''
        },
        originalUrl: rawData.url || '',
        githubRepo: rawData.github || '',
        logo: rawData.logo || '',
        tools: tileData.tools || [],
        tags: tileData.tags || [],
        pricingModel: rawData.pricingModel || 'free'
    };

    console.log('Submitting project to Discord:', projectData);

    // Submit to Discord webhook (bot handles approval and Supabase insert)
    if (window.submitProjectToDiscord) {
        const result = await submitProjectToDiscord(projectData);

        if (result.success && result.secretKey) {
            // Show secret key modal instead of just a toast
            showSecretKeyModal(result.secretKey);
            form.reset();
            resetProjectTiles(form);
        } else if (result.success) {
            utils.showToast('🎉 Project submitted for review!');
            form.reset();
            resetProjectTiles(form);
        } else {
            utils.showToast(result.message || 'Submission failed. Please try again.');
        }
    } else {
        console.error('Discord webhook client not loaded');
        utils.showToast('Submission system not available. Please try again later.');
    }

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Project';
}


/**
 * Show secret key modal to user
 * @param {string} secretKey - The 12-char secret key
 */
function showSecretKeyModal(secretKey) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'key-modal-overlay';
    overlay.id = 'key-modal-overlay';

    overlay.innerHTML = `
        <div class="key-modal">
            <div class="key-modal-icon">🎉</div>
            <h2 class="key-modal-title">Project Submitted!</h2>
            <p class="key-modal-subtitle">
                Your project is now pending review. Save your secret key below - 
                you'll need it to contact us about your project.
            </p>
            
            <div class="key-display">
                <span class="key-value" id="key-value">${secretKey}</span>
                <button class="key-copy-btn" id="key-copy-btn">
                    📋 Copy
                </button>
            </div>
            
            <div class="key-warning">
                <span class="key-warning-icon">⚠️</span>
                <span>
                    <strong>Save this key now!</strong> This is the only time you'll see it. 
                    We cannot recover lost keys.
                </span>
            </div>
            
            <button class="key-noted-btn" id="key-noted-btn">
                ✓ I've Saved My Key
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Show with animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    // Copy button handler
    const copyBtn = document.getElementById('key-copy-btn');
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(secretKey);
            copyBtn.innerHTML = '✓ Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = '📋 Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const keyValue = document.getElementById('key-value');
            const range = document.createRange();
            range.selectNode(keyValue);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            copyBtn.innerHTML = '✓ Copied!';
            copyBtn.classList.add('copied');
        }
    });

    // Noted button handler - only way to close
    const notedBtn = document.getElementById('key-noted-btn');
    notedBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    });
}


/**
 * Reset tile selections
 */
function resetProjectTiles(form) {
    const tiles = form.querySelectorAll('.tile.selected');
    tiles.forEach(tile => tile.classList.remove('selected'));
}


// Make functions available globally
window.initProjectForm = initProjectForm;
