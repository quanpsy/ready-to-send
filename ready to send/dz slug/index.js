/**
 * Division Zero - Cloudflare Worker
 * 
 * Purpose:
 * 1. Proxy URLs: slug.divisionzero.dev → original URL
 * 2. View counting: Increment views in Supabase before redirect
 * 
 * Routes:
 * - GET /          → Homepage redirect
 * - GET /:slug     → Lookup project, count view, redirect
 */

// Supabase config (use environment variables in production)
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const hostname = url.hostname;
        const pathname = url.pathname;

        // Check if this is a subdomain request (slug.divisionzero.dev)
        // OR a path-based request (projects.divisionzero.dev/slug)
        let slug = null;

        // Option 1: Subdomain routing (taskflow.divisionzero.dev)
        if (hostname.endsWith('.divisionzero.dev') && hostname !== 'divisionzero.dev' && hostname !== 'www.divisionzero.dev') {
            slug = hostname.split('.')[0];
        }

        // Option 2: Path routing (projects.divisionzero.dev/taskflow)
        if (pathname !== '/' && pathname.length > 1) {
            slug = pathname.substring(1).split('/')[0];
        }

        // No slug found - redirect to main site
        if (!slug) {
            return Response.redirect('https://divisionzero.dev', 302);
        }

        // Look up project by slug
        const project = await getProjectBySlug(slug);

        if (!project) {
            // Project not found - show 404 page or redirect to projects
            return new Response(notFoundHTML(slug), {
                status: 404,
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // Increment view count (fire and forget)
        ctx.waitUntil(incrementViews(project.id));

        // Redirect to original URL
        return Response.redirect(project.original_url, 302);
    }
};

/**
 * Fetch project from Supabase by slug
 */
async function getProjectBySlug(slug) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/projects?slug=eq.${encodeURIComponent(slug)}&status=eq.approved&select=id,name,original_url`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );

        if (!response.ok) {
            console.error('Supabase error:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (err) {
        console.error('Error fetching project:', err);
        return null;
    }
}

/**
 * Increment view count in Supabase
 */
async function incrementViews(projectId) {
    try {
        // Use Supabase RPC or direct update
        await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/increment_project_view`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ project_id: projectId })
            }
        );
    } catch (err) {
        console.error('Error incrementing views:', err);
    }
}

/**
 * 404 Not Found HTML
 */
function notFoundHTML(slug) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Project Not Found - Division Zero</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #0a0a0a;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 {
            color: #8b5cf6;
            font-size: 4rem;
            margin-bottom: 0.5rem;
        }
        p {
            color: #888;
            margin-bottom: 2rem;
        }
        a {
            color: #8b5cf6;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border: 1px solid #8b5cf6;
            border-radius: 8px;
        }
        a:hover {
            background: #8b5cf6;
            color: #fff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <p>Project "${slug}" not found</p>
        <a href="https://divisionzero.dev/projects.html">Browse Projects →</a>
    </div>
</body>
</html>
    `;
}
