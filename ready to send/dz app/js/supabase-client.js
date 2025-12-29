/* ============================================
   supabase-client.js - Supabase Connection
   ============================================
   
   Handles all Supabase operations:
   - Project submissions
   - Fetching data for display
   
   ============================================ */

// Supabase configuration
const SUPABASE_URL = 'https://sdylzvdnvyhcvgmxhxza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWx6dmRudnloY3ZnbXhoeHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MzU0MzgsImV4cCI6MjA4MTIxMTQzOH0.rOpb5FoMDnXBvEOno3T2GmTDCrwgxenBOYC22s02i-4';

// Discord bot webhook for notifications (called after Supabase insert)
const BOT_WEBHOOK_URL = ''; // Will be set up if needed, or bot polls Supabase

/**
 * Submit a project to Supabase
 * @param {Object} projectData - The project data to submit
 * @returns {Object} - Result with success status and data/error
 */
async function submitProjectToSupabase(projectData) {
    try {
        // Transform frontend data to database column names
        const dbData = {
            name: projectData.name,
            description: projectData.description,
            category: projectData.category,
            builder_name: projectData.builder?.name || '',
            builder_discord: projectData.builder?.discord || '',
            builder_profile_url: projectData.builder?.profileUrl || '',
            builder_email: projectData.builder?.email || '',
            original_url: projectData.originalUrl,
            github_repo: projectData.githubRepo,
            logo: projectData.logo,
            tools: projectData.tools || [],
            tags: projectData.tags || [],
            pricing_model: projectData.pricingModel || 'free',
            status: 'pending'
        };

        // Insert into Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(dbData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit project');
        }

        const result = await response.json();
        console.log('Project submitted to Supabase:', result);

        return {
            success: true,
            data: result[0],
            message: 'Project submitted successfully!'
        };

    } catch (error) {
        console.error('Supabase submission error:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to submit project. Please try again.'
        };
    }
}

/**
 * Submit an idea to Supabase (for future use)
 */
async function submitIdeaToSupabase(ideaData) {
    // TODO: Implement when ideas table is set up
    console.log('Idea submission:', ideaData);
    return { success: true, message: 'Idea received!' };
}

/**
 * Fetch approved projects from Supabase
 */
async function fetchApprovedProjects() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/projects?status=eq.approved&order=approved_at.desc`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        return await response.json();

    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

/**
 * Increment view count for a project
 */
async function incrementProjectViews(projectId) {
    // This will be handled by Cloudflare Worker
    // Just a placeholder for now
}

// Make functions globally available
window.submitProjectToSupabase = submitProjectToSupabase;
window.submitIdeaToSupabase = submitIdeaToSupabase;
window.fetchApprovedProjects = fetchApprovedProjects;
