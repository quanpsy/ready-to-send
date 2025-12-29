/* ============================================
   Division Zero - Cloudflare Worker
   ============================================
   
   PURPOSE:
   - Syncs projects from Supabase to KV storage
   - Calculates trending rankings every 1 hour
   - Rotates view slots for trend calculation
   - Outputs SINGLE JSON with all carousels
   
   CONFIG:
   - REFRESH_INTERVAL: 1 hour (configurable)
   - TRENDING_TOP: 10 projects
   - CATEGORY: 2 trending + 2 most viewed + 4 new
   
   ============================================ */

// ============================================
// CONFIGURATION (editable)
// ============================================
const CONFIG = {
    REFRESH_HOURS: 1,
    TRENDING_TOP: 10,
    EDITORS_PICK_MAX: 8,
    PROMOTED_MAX: 4,
    DIVISION_ZERO_MAX: 4,
    ALLTIME_MAX: 10,
    // Category mix: 2 trending + 2 most viewed + 4 new = 8 total
    CATEGORY_TRENDING: 2,
    CATEGORY_VIEWS: 2,
    CATEGORY_NEW: 4,
    CATEGORIES: ['Productivity', 'Developer Tools', 'Games', 'AI Agents', 'Design']
};


export default {
    // ========================================
    // CRON TRIGGER (every 6 hours)
    // ========================================
    async scheduled(event, env, ctx) {
        console.log('⏰ Cron triggered:', new Date().toISOString());
        ctx.waitUntil(fullSync(env));
    },

    // ========================================
    // HTTP REQUESTS
    // ========================================
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // GET /projects - Returns the single JSON with all carousels
        if (path === '/projects' || path === '/') {
            const projects = await env.PROJECTS_KV.get('projects:current');
            if (!projects) {
                return new Response(JSON.stringify({ error: 'No data yet. Run /sync first.' }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
            return new Response(projects, {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // GET /sync - Manual sync trigger
        if (path === '/sync') {
            const secret = url.searchParams.get('key');
            if (env.SYNC_SECRET && secret !== env.SYNC_SECRET) {
                return new Response('Unauthorized', { status: 401, headers: corsHeaders });
            }

            try {
                const result = await fullSync(env);
                return new Response(JSON.stringify({
                    success: true,
                    message: '✅ Sync complete!',
                    ...result
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return new Response(JSON.stringify({
                    success: false,
                    error: error.message
                }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // GET /status - Shows sync status
        if (path === '/status') {
            const lastSync = await env.PROJECTS_KV.get('projects:lastSync');
            const current = await env.PROJECTS_KV.get('projects:current');
            let stats = {};
            if (current) {
                const data = JSON.parse(current);
                stats = {
                    promoted: data.promoted?.length || 0,
                    trending: data.trending?.length || 0,
                    editorsPick: data.editorsPick?.length || 0,
                    divisionZero: data.divisionZero?.length || 0,
                    allTime: data.allTime?.length || 0,
                    categories: Object.keys(data.categories || {}).length
                };
            }

            return new Response(JSON.stringify({
                lastSync: lastSync || 'Never',
                config: CONFIG,
                stats
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // GET /previous - Returns backup
        if (path === '/previous') {
            const projects = await env.PROJECTS_KV.get('projects:previous');
            if (!projects) {
                return new Response(JSON.stringify({ error: 'No backup available' }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
            return new Response(projects, {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
};


// ============================================
// FULL SYNC FUNCTION
// ============================================
async function fullSync(env) {
    console.log('🔄 Starting full sync...');

    // Step 1: Rotate view slots in Supabase
    await rotateViewSlots(env);

    // Step 2: Calculate trending scores and update ranks
    await calculateTrendingRanks(env);

    // Step 3: Fetch all data and build single JSON
    const projectsJson = await buildProjectsJson(env);

    // Step 4: Rotate KV (current → previous)
    const current = await env.PROJECTS_KV.get('projects:current');
    if (current) {
        await env.PROJECTS_KV.put('projects:previous', current);
    }

    // Step 5: Save new JSON to KV
    await env.PROJECTS_KV.put('projects:current', JSON.stringify(projectsJson));
    await env.PROJECTS_KV.put('projects:lastSync', new Date().toISOString());

    console.log('✅ Sync complete!');
    return {
        timestamp: new Date().toISOString(),
        totalProjects: projectsJson.allTime?.length || 0
    };
}


// ============================================
// ROTATE VIEW SLOTS (every 6h)
// ============================================
async function rotateViewSlots(env) {
    console.log('📊 Rotating view slots...');

    // Call Supabase RPC function to rotate slots
    // This shifts: slot4 = slot3, slot3 = slot2, slot2 = slot1, slot1 = 0
    const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/rpc/rotate_view_slots`,
        {
            method: 'POST',
            headers: {
                'apikey': env.SUPABASE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: '{}'
        }
    );

    if (!response.ok) {
        console.log('⚠️ rotate_view_slots RPC not found, skipping...');
    }
}


// ============================================
// CALCULATE TRENDING RANKS
// ============================================
async function calculateTrendingRanks(env) {
    console.log('🔥 Calculating trending ranks...');

    // Fetch all approved projects with view data
    const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/projects?status=eq.approved&select=id,views_6h_slot1,views_6h_slot2,views_6h_slot3,views_6h_slot4,views_3day,clicks,saves`,
        {
            headers: {
                'apikey': env.SUPABASE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_KEY}`
            }
        }
    );

    if (!response.ok) return;

    const projects = await response.json();

    // Calculate trending score for each
    const scored = projects.map(p => ({
        id: p.id,
        score: (p.views_6h_slot1 || 0) * 4 +
            (p.views_6h_slot2 || 0) * 3 +
            (p.views_6h_slot3 || 0) * 2 +
            (p.views_6h_slot4 || 0) * 1 +
            (p.views_3day || 0) * 0.5 +
            (p.clicks || 0) * 2 +
            (p.saves || 0) * 5
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Update top 10 with ranks, others with NULL
    for (let i = 0; i < scored.length; i++) {
        const rank = i < CONFIG.TRENDING_TOP ? i + 1 : null;
        const trendingScore = Math.round(scored[i].score);

        await fetch(
            `${env.SUPABASE_URL}/rest/v1/projects?id=eq.${scored[i].id}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': env.SUPABASE_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    trending_rank: rank,
                    trending_score: trendingScore
                })
            }
        );
    }

    console.log(`📈 Updated ${scored.length} projects with trending ranks`);
}


// ============================================
// BUILD SINGLE JSON FOR FRONTEND
// ============================================
async function buildProjectsJson(env) {
    console.log('📦 Building projects JSON...');

    // Fetch all approved projects
    const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/projects?status=eq.approved&select=*`,
        {
            headers: {
                'apikey': env.SUPABASE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_KEY}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
    }

    const allProjects = await response.json();
    console.log(`📥 Fetched ${allProjects.length} approved projects`);

    // Transform all to frontend format
    const formatted = allProjects.map(formatProject);

    // Build carousel arrays
    const json = {
        // Promoted (manual)
        promoted: formatted
            .filter(p => p.isPromoted)
            .sort((a, b) => (a.promotedOrder || 99) - (b.promotedOrder || 99))
            .slice(0, CONFIG.PROMOTED_MAX),

        // Trending (algorithm)
        trending: formatted
            .filter(p => p.trendingRank !== null && p.trendingRank !== undefined)
            .sort((a, b) => a.trendingRank - b.trendingRank)
            .slice(0, CONFIG.TRENDING_TOP),

        // Editor's Pick (manual)
        editorsPick: formatted
            .filter(p => p.featured)
            .sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99))
            .slice(0, CONFIG.EDITORS_PICK_MAX),

        // Division Zero
        divisionZero: formatted
            .filter(p => p.isDivisionZero)
            .slice(0, CONFIG.DIVISION_ZERO_MAX),

        // All-Time Best (by views)
        allTime: [...formatted]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, CONFIG.ALLTIME_MAX),

        // Categories
        categories: {},

        // Metadata
        lastUpdated: new Date().toISOString(),
        totalProjects: allProjects.length
    };

    // ============================================
    // DEDUPLICATE: Remove projects that appear in higher priority carousels
    // Priority: Promoted > Trending > Editor's Pick > Division Zero > All-Time > Categories
    // ============================================
    const usedIds = new Set();

    // 1. Promoted gets first priority
    json.promoted.forEach(p => usedIds.add(p.id));

    // 2. Trending - remove items already in Promoted
    json.trending = json.trending.filter(p => !usedIds.has(p.id));
    json.trending.forEach(p => usedIds.add(p.id));

    // 3. Editor's Pick - remove items already used
    json.editorsPick = json.editorsPick.filter(p => !usedIds.has(p.id));
    json.editorsPick.forEach(p => usedIds.add(p.id));

    // 4. Division Zero - remove items already used
    json.divisionZero = json.divisionZero.filter(p => !usedIds.has(p.id));
    json.divisionZero.forEach(p => usedIds.add(p.id));

    // 5. All-Time Best - remove items already used
    json.allTime = json.allTime.filter(p => !usedIds.has(p.id));
    json.allTime.forEach(p => usedIds.add(p.id));

    // Build category arrays with mix: 2 trending + 2 most viewed + 4 new
    // Categories also exclude items from higher priority carousels
    for (const category of CONFIG.CATEGORIES) {
        const key = category.toLowerCase().replace(/\s+/g, '');
        // Only include projects NOT already used in other carousels
        const categoryProjects = formatted.filter(p => p.category === category && !usedIds.has(p.id));

        // 2 Trending (by trending score)
        const trending = [...categoryProjects]
            .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
            .slice(0, CONFIG.CATEGORY_TRENDING);

        // 2 Most Viewed (exclude already picked)
        const trendingIds = new Set(trending.map(p => p.id));
        const mostViewed = [...categoryProjects]
            .filter(p => !trendingIds.has(p.id))
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, CONFIG.CATEGORY_VIEWS);

        // 4 New (exclude already picked)
        const pickedIds = new Set([...trending, ...mostViewed].map(p => p.id));
        const newest = [...categoryProjects]
            .filter(p => !pickedIds.has(p.id))
            .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime())
            .slice(0, CONFIG.CATEGORY_NEW);

        // Combine in order: trending, most viewed, new
        json.categories[key] = [...trending, ...mostViewed, ...newest];
    }

    return json;
}


// ============================================
// FORMAT PROJECT FOR FRONTEND
// ============================================
function formatProject(p) {
    // Generate proxyUrl from slug if not in database
    const proxyUrl = p.proxy_url || (p.slug ? `https://${p.slug}.divisionzero.dev` : p.original_url);

    return {
        id: p.id,
        name: p.name,
        description: p.description,
        tagline: p.tagline,
        logo: p.logo,
        originalUrl: p.original_url,
        proxyUrl: proxyUrl,  // For view counting
        githubRepo: p.github_repo,
        slug: p.slug,
        category: p.category,

        // Arrays (handle string or array)
        tools: parseArray(p.tools),
        tags: parseArray(p.tags),

        // Pricing
        pricingModel: p.pricing_model || 'free',

        // Builder
        builder: {
            name: p.builder_name,
            discord: p.builder_discord,
            profileUrl: p.builder_profile_url
        },

        // Flags
        featured: p.featured || false,
        featuredRank: p.featured_rank,
        isPromoted: p.is_promoted || false,
        promotedOrder: p.promoted_order,
        isDivisionZero: p.is_division_zero || false,
        trendingRank: p.trending_rank,
        trendingScore: p.trending_score || 0,

        // Stats
        views: p.views_total || 0,
        clicks: p.clicks || 0,
        saves: p.saves || 0,

        // Dates
        createdAt: p.created_at,
        approvedAt: p.approved_at,

        // Discord
        discordThread: p.discord_thread
    };
}


// ============================================
// HELPER: Parse array (handles string or array)
// ============================================
function parseArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
        return JSON.parse(val);
    } catch {
        return [];
    }
}
