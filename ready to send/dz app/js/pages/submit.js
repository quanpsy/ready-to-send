/* ============================================
   submit.js - Submit Page Script
   ============================================
   
   📄 SUBMIT PAGE INITIALIZATION
   
   This script runs on submit.html.
   It handles:
   - Form toggle (project vs idea)
   - Initializes both form pods
   
   ============================================ */


let submitPageInitialized = false;

/**
 * Initialize the submit page
 */
function initSubmitPage() {
    // Prevent re-initialization
    if (submitPageInitialized) {
        console.log('[Submit] Already initialized, skipping');
        return;
    }
    submitPageInitialized = true;

    // NOTE: Nav and footer are now rendered by Router

    // Initialize form toggle
    initFormToggle();

    // Initialize form pods
    initProjectForm();
    initIdeaForm();
}


/**
 * Initialize form toggle (project vs idea)
 */
function initFormToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const projectForm = document.getElementById('project-form');
    const ideaForm = document.getElementById('idea-form');

    if (!toggleBtns.length || !projectForm || !ideaForm) return;

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active button
            toggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show/hide forms
            const formType = this.dataset.form;
            if (formType === 'project') {
                projectForm.classList.remove('hidden');
                ideaForm.classList.add('hidden');
            } else {
                projectForm.classList.add('hidden');
                ideaForm.classList.remove('hidden');
            }
        });
    });
}


// NOTE: initSubmitPage is called by Router when navigating to submit page
// DO NOT add DOMContentLoaded listener here - Router handles page initialization
window.initSubmitPage = initSubmitPage;
