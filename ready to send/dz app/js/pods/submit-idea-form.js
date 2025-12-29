/* ============================================
   submit-idea-form.js - Submit Idea Pod
   ============================================
   
   🔲 ISOLATED COMPONENT: IDEA SUBMISSION
   
   Handles:
   - Idea form validation
   - Purpose dropdown (shows budget if client)
   - Form submission
   
   ============================================ */


/**
 * Initialize idea form functionality
 */
function initIdeaForm() {
    const form = document.getElementById('idea-form');
    if (!form) return;

    initPurposeToggle(form);
    initIdeaValidation(form);
    form.addEventListener('submit', handleIdeaSubmit);
}


/**
 * Initialize purpose dropdown toggle
 * Shows budget field when "client" is selected
 */
function initPurposeToggle(form) {
    const purposeSelect = form.querySelector('#idea-purpose');
    const budgetGroup = form.querySelector('.budget-group');
    const budgetInput = form.querySelector('#idea-budget');

    if (!purposeSelect || !budgetGroup) return;

    purposeSelect.addEventListener('change', function () {
        if (this.value === 'client') {
            // Show budget field
            budgetGroup.classList.remove('hidden');
            budgetGroup.classList.add('visible');
            budgetInput.required = true;
        } else {
            // Hide budget field
            budgetGroup.classList.add('hidden');
            budgetGroup.classList.remove('visible');
            budgetInput.required = false;
            budgetInput.value = '';
        }
    });
}


/**
 * Initialize idea form validation
 */
function initIdeaValidation(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateIdeaInput(this);
        });

        input.addEventListener('input', function () {
            clearIdeaInputError(this);
        });
    });
}


/**
 * Validate idea form input
 */
function validateIdeaInput(input) {
    const value = input.value.trim();
    const group = input.closest('.form-group');

    // Skip validation if budget is not required (hidden)
    if (input.id === 'idea-budget' && !input.required) {
        return true;
    }

    if (input.required && !value) {
        setIdeaInputError(group, 'This field is required');
        return false;
    }

    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setIdeaInputError(group, 'Please enter a valid email');
            return false;
        }
    }

    if (input.type === 'url' && value) {
        try {
            new URL(value);
        } catch {
            setIdeaInputError(group, 'Please enter a valid URL');
            return false;
        }
    }

    clearIdeaInputError(input);
    return true;
}


/**
 * Set error state on input
 */
function setIdeaInputError(group, message) {
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
function clearIdeaInputError(input) {
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
 * Handle idea form submission
 */
async function handleIdeaSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');

    // Validate all required fields
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateIdeaInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        utils.showToast('Please fix the errors before submitting');
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Format budget with $ if present
    if (data.budget) {
        data.budget = '$' + data.budget;
    }

    // Build schema-compliant object based on purpose
    const isClient = data.purpose === 'client';

    const ideaData = {
        // Section 1: Submitter Info (matches form field names)
        name: data.name || '',
        email: data.email || '',
        discordId: data.discordId || '',

        // Section 2: Idea Details
        title: data.title || '',
        docsLink: data.docsLink || '',
        category: data.category || '',

        // Section 3: Purpose-specific
        purpose: data.purpose || 'validation',

        // Client-only fields (only if purpose = 'client')
        ...(isClient && {
            budget: data.budget || ''
        })
    };

    console.log('Idea submission:', ideaData);
    console.log('Is paid client:', isClient);

    // Submit to Discord webhook
    try {
        // Use the submitIdeaToDiscord function from discord-webhooks.js
        if (typeof submitIdeaToDiscord === 'function') {
            const result = await submitIdeaToDiscord(ideaData);
            if (result.success) {
                utils.showToast('Idea submitted successfully!');
                resetIdeaForm(form);
            } else {
                utils.showToast('Submission failed. Please try again.');
            }
        } else {
            console.error('submitIdeaToDiscord function not found');
            utils.showToast('Submission error. Please try again.');
        }
    } catch (error) {
        console.error('Idea submission error:', error);
        utils.showToast('Submission failed. Please try again.');
    }

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Idea';
}


/**
 * Reset idea form and hide budget field
 */
function resetIdeaForm(form) {
    form.reset();

    // Hide budget field
    const budgetGroup = form.querySelector('.budget-group');
    const budgetInput = form.querySelector('#idea-budget');
    if (budgetGroup) {
        budgetGroup.classList.add('hidden');
        budgetGroup.classList.remove('visible');
    }
    if (budgetInput) {
        budgetInput.required = false;
    }
}


// Make functions available globally
window.initIdeaForm = initIdeaForm;
