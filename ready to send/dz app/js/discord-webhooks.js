/* ============================================
   discord-webhooks.js - Discord Webhook Integration
   ============================================
   
   Submits projects and ideas directly to Discord
   via webhooks. Bot then handles approval flow.
   
   Flow:
   Website → Webhook → Discord channel
   Bot adds buttons → Mod approves
   Bot → Supabase (only approved items)
   
   ============================================ */

// Discord Webhook URLs
const WEBHOOKS = {
    PROJECT_APPROVAL: 'https://discord.com/api/webhooks/1449506383069315245/BhfXAwwxW2PjAo8AIbpaSFddZFHFKAV1WjU8yv44aSz2ZqtgP0r2XjcoelZ9FvmnuFBR',
    IDEA_VALIDATION: 'https://discord.com/api/webhooks/1449506809051086878/P0GtjwJYX7tDinZHai6hwDFXzOAwvvJk1faJZS5DQ6MVvFr5-oe4sy8FRs3PbwjDD3eJ',
    PAID_IDEA: 'https://discord.com/api/webhooks/1449507093039157481/eIef8VBiWEuFqex4W9LXKTtsaRA4R27pgjXk_G8OQkYDCrX0q0-fu-ltx9fBtv3aZFSX',
    REPORT: 'https://discord.com/api/webhooks/1450053123820486668/1g1uqEvKLkOlzN3rcdXcRvpTiazd5LSUXMmzXsfSPxDa8ttFF56Z5V2A9E2QndfDQocP'
};

/**
 * Generate a 12-character secret key for project ownership
 * Uses unambiguous characters (no 0/O, 1/I/L)
 * @returns {string} 12-char alphanumeric key
 */
function generateSecretKey() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No 0,O,1,I,L
    let key = '';
    for (let i = 0; i < 12; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

/**
 * Extract direct image URL from ImgBB HTML or BBCode
 * @param {string} input - HTML like: <a href="..."><img src="https://i.ibb.co/xxx/img.png"...></a>
 * @returns {string} Direct image URL (https://i.ibb.co/xxx/img.png)
 */
function extractImageUrl(input) {
    if (!input) return '';

    // Already a direct URL? Return as-is
    if (input.startsWith('https://i.ibb.co/') ||
        input.startsWith('https://i.imgur.com/') ||
        input.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
        return input.trim();
    }

    // Extract from HTML: <img src="URL"...>
    const htmlMatch = input.match(/src=["']([^"']+)["']/i);
    if (htmlMatch) return htmlMatch[1];

    // Extract from BBCode: [img]URL[/img]
    const bbMatch = input.match(/\[img\]([^\[]+)\[\/img\]/i);
    if (bbMatch) return bbMatch[1];

    // Fallback: return as-is (might be a plain URL)
    return input.trim();
}


/**
 * Submit a project via Discord webhook
 * @param {Object} projectData - Project data from form
 * @returns {Object} Result with success, message, and secretKey
 */
async function submitProjectToDiscord(projectData) {
    try {
        // Generate secret key for this project
        const secretKey = generateSecretKey();

        // Add secret key to project data
        projectData.secretKey = secretKey;

        // Extract direct image URL from ImgBB HTML
        projectData.logo = extractImageUrl(projectData.logo);

        // Encode project data as base64 to hide it but still make it parseable by bot
        const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(projectData))));

        // Theme colors matching divisionzero.dev
        const THEME = {
            PENDING: 0x8b5cf6,     // Purple - primary brand color
            SUCCESS: 0x22c55e,     // Green
            DANGER: 0xef4444,      // Red
            INFO: 0x3b82f6         // Blue
        };

        // Build Discord embed (themed like project-card-v2)
        const embed = {
            title: `📦 ${projectData.name || 'New Project'}`,
            description: projectData.description || '_No description provided_',
            color: THEME.PENDING,
            thumbnail: projectData.logo ? { url: projectData.logo } : null,
            fields: [
                {
                    name: '━━━━━━ Project Details ━━━━━━',
                    value: '\u200b',
                    inline: false
                },
                { name: '📂 Category', value: `\`${projectData.category || 'N/A'}\``, inline: true },
                { name: '💰 Pricing', value: `\`${projectData.pricingModel || 'free'}\``, inline: true },
                { name: '🔗 Live URL', value: projectData.originalUrl ? `[Visit →](${projectData.originalUrl})` : '_Not provided_', inline: true },
                { name: '💻 GitHub', value: projectData.githubRepo ? `[Repo →](${projectData.githubRepo})` : '_Not provided_', inline: true },
                {
                    name: '━━━━━━ Builder Info ━━━━━━',
                    value: '\u200b',
                    inline: false
                },
                { name: '👤 Builder', value: projectData.builder?.name || '_Anonymous_', inline: true },
                { name: '💬 Discord', value: projectData.builder?.discord || '_Not provided_', inline: true },
                {
                    name: '━━━━━━ Tech Stack ━━━━━━',
                    value: '\u200b',
                    inline: false
                },
                { name: '🛠️ Tools', value: projectData.tools?.length ? projectData.tools.map(t => `\`${t}\``).join(' ') : '_None_', inline: false },
                { name: '🏷️ Tags', value: projectData.tags?.length ? projectData.tags.map(t => `\`${t}\``).join(' ') : '_None_', inline: false }
            ],
            // Hide data in author URL (invisible to users but parseable by bot)
            author: {
                name: '📦 NEW SUBMISSION',
                url: `https://divisionzero.dev/data#${encodedData}`
            },
            footer: {
                text: `Division Zero • Key: ${secretKey}`,
                icon_url: 'https://divisionzero.dev/images/logo.png'
            },
            timestamp: new Date().toISOString()
        };

        // Send to Discord webhook (no visible JSON!)
        const response = await fetch(WEBHOOKS.PROJECT_APPROVAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Division Zero',
                avatar_url: 'https://divisionzero.dev/images/logo.png',
                embeds: [embed]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Webhook failed: ${error}`);
        }

        console.log('Project submitted to Discord with key:', secretKey);
        return { success: true, message: 'Project submitted for review!', secretKey };

    } catch (error) {
        console.error('Discord webhook error:', error);
        return { success: false, message: 'Failed to submit. Please try again.', secretKey: null };
    }
}

/**
 * Submit an idea via Discord webhook
 * Routes to IDEA_VALIDATION or PAID_IDEA based on purpose
 * @param {Object} ideaData - Idea data from form
 */
async function submitIdeaToDiscord(ideaData) {
    try {
        const isPaid = ideaData.purpose === 'client';

        // Build embed based on type
        const embed = isPaid ? {
            // PAID IDEAS - Green color
            title: '� New Paid Idea Request',
            color: 0x10b981,
            fields: [
                { name: '📝 Title', value: ideaData.title || 'N/A', inline: true },
                { name: '📂 Category', value: ideaData.category || 'N/A', inline: true },
                { name: '� Budget', value: ideaData.budget || 'Not specified', inline: true },
                { name: '🔗 Docs Link', value: ideaData.docsLink ? `[View Document](${ideaData.docsLink})` : 'N/A', inline: false },
                { name: '👤 Name', value: ideaData.name || 'Anonymous', inline: true },
                { name: '📧 Email', value: ideaData.email || 'N/A', inline: true }
            ],
            footer: { text: 'Paid Lead - DM owner with details' },
            timestamp: new Date().toISOString()
        } : {
            // VALIDATION IDEAS - Blue color
            title: '💡 New Idea Submission',
            color: 0x3b82f6,
            fields: [
                { name: '📝 Title', value: ideaData.title || 'N/A', inline: true },
                { name: '📂 Category', value: ideaData.category || 'N/A', inline: true },
                { name: '🔗 Docs Link', value: ideaData.docsLink ? `[View Document](${ideaData.docsLink})` : 'N/A', inline: false },
                { name: '👤 Name', value: ideaData.name || 'Anonymous', inline: true },
                { name: '📧 Email', value: ideaData.email || 'N/A', inline: true }
            ],
            footer: { text: 'Validation Idea - Use bot commands to approve' },
            timestamp: new Date().toISOString()
        };

        // Choose webhook based on purpose
        const webhookUrl = isPaid ? WEBHOOKS.PAID_IDEA : WEBHOOKS.IDEA_VALIDATION;

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Division Zero',
                embeds: [embed]
                // No JSON content block - only embed
            })
        });

        if (!response.ok) throw new Error('Webhook failed');

        return { success: true, message: 'Idea submitted for review!' };

    } catch (error) {
        console.error('Discord webhook error:', error);
        return { success: false, message: 'Failed to submit. Please try again.' };
    }
}

/**
 * Submit a paid idea (commission) via Discord webhook
 * @param {Object} ideaData - Paid idea data from form
 */
async function submitPaidIdeaToDiscord(ideaData) {
    try {
        const embed = {
            title: '💰 New Paid Idea Request',
            color: 0x10b981, // Green for paid
            fields: [
                { name: '📝 Title', value: ideaData.ideaTitle || 'N/A', inline: true },
                { name: '📂 Category', value: ideaData.category || 'N/A', inline: true },
                { name: '💵 Budget', value: ideaData.budgetRange || 'N/A', inline: true },
                { name: '⏱️ Timeline', value: ideaData.timeline || 'N/A', inline: true },
                { name: '📄 Description', value: ideaData.ideaDescription || 'No description', inline: false },
                { name: '👤 Client Name', value: ideaData.clientName || 'N/A', inline: true },
                { name: '📧 Email', value: ideaData.clientEmail || 'N/A', inline: true },
                { name: '💬 Discord', value: ideaData.discordId || 'N/A', inline: true },
                { name: '📝 Additional Notes', value: ideaData.additionalNotes || 'None', inline: false }
            ],
            footer: { text: '🔔 Paid Commission - Owner notified' },
            timestamp: new Date().toISOString()
        };

        const response = await fetch(WEBHOOKS.PAID_IDEA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Division Zero',
                embeds: [embed],
                content: `<@1447688725399081186> 🔔 **New Paid Lead!**\n\`\`\`json\n${JSON.stringify(ideaData, null, 2)}\n\`\`\``
            })
        });

        if (!response.ok) throw new Error('Webhook failed');

        return { success: true, message: 'Request submitted! We\'ll contact you soon.' };

    } catch (error) {
        console.error('Discord webhook error:', error);
        return { success: false, message: 'Failed to submit. Please try again.' };
    }
}

/**
 * Send a project report to Discord (long-press report)
 * @param {Object} projectInfo - Basic project info
 * @param {string} projectInfo.name - Project name
 * @param {string} projectInfo.publicId - 6-char public ID
 * @param {string} projectInfo.url - Project URL
 * @param {string} projectInfo.builderDiscord - Builder's Discord ID
 */
async function sendReportToDiscord(projectInfo) {
    try {
        // Encode report data for bot to parse
        const reportData = {
            name: projectInfo.name,
            publicId: projectInfo.publicId,
            url: projectInfo.url,
            builderDiscord: projectInfo.builderDiscord || ''
        };
        const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(reportData))));

        const embed = {
            title: '🚨 Project Report',
            color: 0xef4444, // Red
            fields: [
                { name: '📦 Project', value: projectInfo.name || 'Unknown', inline: true },
                { name: '🔑 ID', value: `\`${projectInfo.publicId || 'N/A'}\``, inline: true },
                { name: '💬 Owner', value: projectInfo.builderDiscord || '_No Discord_', inline: true },
                { name: '🔗 URL', value: projectInfo.url || '_N/A_', inline: false }
            ],
            // Hide data in author URL for bot to parse
            author: {
                name: '🚨 REPORT',
                url: `https://divisionzero.dev/report#${encodedData}`
            },
            footer: { text: 'Long-press report • Check if link is broken' },
            timestamp: new Date().toISOString()
        };

        const response = await fetch(WEBHOOKS.REPORT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Division Zero',
                embeds: [embed]
            })
        });

        if (!response.ok) throw new Error('Webhook failed');

        return { success: true };

    } catch (error) {
        console.error('Report webhook error:', error);
        return { success: false };
    }
}

// Make functions globally available
window.submitProjectToDiscord = submitProjectToDiscord;
window.submitIdeaToDiscord = submitIdeaToDiscord;
window.submitPaidIdeaToDiscord = submitPaidIdeaToDiscord;
window.sendReportToDiscord = sendReportToDiscord;
