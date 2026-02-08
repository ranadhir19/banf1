// Home.js - Simplified version that embeds the landing page HTML
// This file CAN be git-pushed and will work with just ONE HTML Component in Wix Editor

import wixWindow from 'wix-window';
import wixLocation from 'wix-location';

// Backend imports for data
import { getUpcomingEvents } from 'backend/events.jsw';
import { getMemberStats } from 'backend/members.jsw';
import { getRadioStatus } from 'backend/radio.jsw';

$w.onReady(async function () {
    console.log("🏠 BANF Home Page Loading...");
    
    // Setup the HTML Component (iframe) with our landing page
    setupLandingPage();
    
    // Load data and send to the iframe
    await loadAndSendData();
});

// Setup the HTML Component
function setupLandingPage() {
    const htmlComponent = $w('#htmlLanding');
    
    if (htmlComponent) {
        // The HTML component should have our landing-page.html URL set
        // Or we can set it programmatically:
        // htmlComponent.src = "https://static.wixstatic.com/.../landing-page.html";
        
        // Listen for messages from the iframe
        htmlComponent.onMessage((event) => {
            handleIframeMessage(event.data);
        });
        
        console.log("✅ HTML Component configured");
    } else {
        console.warn("⚠️ HTML Component #htmlLanding not found");
        console.log("Please add an HTML Component with ID 'htmlLanding' in Wix Editor");
    }
}

// Handle messages from the landing page iframe
function handleIframeMessage(data) {
    console.log("📨 Message from landing page:", data);
    
    switch (data.action) {
        case 'pageReady':
            // Page is loaded, send initial data
            sendStatsToPage();
            sendEventsToPage();
            break;
            
        case 'navigate':
            // Handle navigation requests
            if (data.page) {
                wixLocation.to(data.page);
            }
            break;
            
        case 'submitContact':
            // Handle contact form submission
            handleContactSubmission(data.formData);
            break;
            
        case 'playRadio':
            // Could trigger Wix audio player
            console.log("Radio play requested");
            break;
    }
}

// Load data from backend and send to iframe
async function loadAndSendData() {
    try {
        // Load stats
        const stats = await getMemberStats();
        sendMessageToIframe('updateStats', {
            members: stats?.totalMembers || 500,
            events: 50,
            volunteers: stats?.totalVolunteers || 100
        });
        
        // Load events
        const events = await getUpcomingEvents(3);
        if (events && events.length > 0) {
            sendMessageToIframe('updateEvents', {
                events: events.map(e => ({
                    title: e.title,
                    date: formatDate(e.eventDate),
                    location: e.location || 'TBD',
                    icon: getEventIcon(e.category)
                }))
            });
        }
        
        // Load radio status
        const radioStatus = await getRadioStatus();
        sendMessageToIframe('updateRadio', {
            isLive: radioStatus?.isLive || false,
            nowPlaying: radioStatus?.currentShow || 'Bengali Music Hour'
        });
        
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Send message to the iframe
function sendMessageToIframe(action, data) {
    const htmlComponent = $w('#htmlLanding');
    if (htmlComponent) {
        htmlComponent.postMessage({ action, ...data });
    }
}

// Send stats to the landing page
async function sendStatsToPage() {
    try {
        const stats = await getMemberStats();
        sendMessageToIframe('updateStats', {
            members: stats?.totalMembers || 500,
            events: 50,
            volunteers: 100
        });
    } catch (e) {
        console.log("Stats load error:", e);
    }
}

// Send events to the landing page
async function sendEventsToPage() {
    try {
        const events = await getUpcomingEvents(3);
        sendMessageToIframe('updateEvents', { events });
    } catch (e) {
        console.log("Events load error:", e);
    }
}

// Handle contact form submission
async function handleContactSubmission(formData) {
    try {
        // Import contact service
        const { submitContactForm } = await import('backend/contact-service.jsw');
        const result = await submitContactForm(formData);
        
        sendMessageToIframe('contactResult', {
            success: result.success,
            message: result.success ? 'Message sent!' : 'Error sending message'
        });
    } catch (error) {
        sendMessageToIframe('contactResult', {
            success: false,
            message: 'Error: ' + error.message
        });
    }
}

// Helper: Format date
function formatDate(date) {
    if (!date) return 'TBD';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Helper: Get event icon based on category
function getEventIcon(category) {
    const icons = {
        'cultural': '🎭',
        'religious': '🪔',
        'celebration': '🎉',
        'music': '🎵',
        'food': '🍛',
        'sports': '⚽',
        'education': '📚',
        'community': '🤝'
    };
    return icons[category?.toLowerCase()] || '📅';
}
