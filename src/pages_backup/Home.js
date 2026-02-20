/**
 * ============================================================
 * BANF - Bengali Association of North Florida
 * HOME PAGE - Comprehensive Landing Page with All Functionalities
 * ============================================================
 * 
 * Features:
 * - Hero section with Bengali/English welcome
 * - Quick access navigation to all services
 * - Live stats (members, events, sponsors)
 * - Featured events carousel
 * - Latest news/announcements
 * - Radio player widget
 * - Magazine preview
 * - Sponsor showcase
 * - Membership CTA
 * - Contact/Feedback quick form
 */

import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';
import wixData from 'wix-data';

// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================
const COLORS = {
    GREEN_PRIMARY: '#006A4E',  // Bangladesh green
    RED_ACCENT: '#F42A41',     // Bangladesh red
    GOLD: '#FFD700',           // Gold accent
    ORANGE: '#ff6b35',         // BANF orange
    DARK: '#1a1a2e',
    WHITE: '#ffffff'
};

const PAGES = {
    HOME: '/',
    EVENTS: '/events',
    MEMBERS: '/members',
    GALLERY: '/gallery',
    MAGAZINE: '/magazine',
    RADIO: '/radio',
    SPONSORS: '/sponsors',
    VOLUNTEER: '/volunteer',
    CONTACT: '/contact',
    ADMIN: '/admin',
    LOGIN: '/login',
    REGISTER: '/register',
    HERITAGE: '/heritage',
    LEADERSHIP: '/leadership',
    FEEDBACK: '/feedback',
    NEWCOMER: '/newcomer-guide',
    // New Feature Pages (v3.0)
    REPORTS: '/reports',
    INSIGHTS: '/insights',
    COMMUNITY: '/community',
    ADS: '/ads',
    DONATE: '/donate',
    CAREERS: '/careers',
    SCHOLARSHIPS: '/scholarships',
    CHARITY: '/charity'
};

// ============================================================
// PAGE READY - MAIN INITIALIZATION
// ============================================================
$w.onReady(async function () {
    console.log('🏠 BANF Home Page Initializing...');
    
    // Check user login status
    const isLoggedIn = wixUsers.currentUser.loggedIn;
    updateUserMenu(isLoggedIn);
    
    // Initialize all sections (parallel loading for performance)
    await Promise.all([
        setupNavigation(),
        loadHeroContent(),
        loadQuickStats(),
        loadFeaturedEvents(),
        loadLatestNews(),
        loadRadioStatus(),
        loadMagazinePreview(),
        loadSponsorShowcase(),
        loadMembershipInfo(),
        setupQuickActions(),
        setupContactForm(),
        // New Feature Sections (v3.0)
        loadCommunityHighlights(),
        loadInsightsPreview()
    ]);
    
    console.log('✅ BANF Home Page Ready!');
});

// ============================================================
// NAVIGATION SETUP
// ============================================================
function setupNavigation() {
    // Main Navigation Menu
    const mainMenuItems = [
        { id: 'btnHome', page: PAGES.HOME, label: 'Home' },
        { id: 'btnEvents', page: PAGES.EVENTS, label: 'Events' },
        { id: 'btnMembers', page: PAGES.MEMBERS, label: 'Members' },
        { id: 'btnGallery', page: PAGES.GALLERY, label: 'Gallery' },
        { id: 'btnMagazine', page: PAGES.MAGAZINE, label: 'প্রতিবিম্ব' },
        { id: 'btnRadio', page: PAGES.RADIO, label: 'Radio' },
        { id: 'btnSponsors', page: PAGES.SPONSORS, label: 'Sponsors' },
        { id: 'btnVolunteer', page: PAGES.VOLUNTEER, label: 'Volunteer' },
        { id: 'btnContact', page: PAGES.CONTACT, label: 'Contact' }
    ];
    
    // Secondary Navigation (Services)
    const serviceMenuItems = [
        { id: 'btnHeritage', page: PAGES.HERITAGE, label: 'Heritage' },
        { id: 'btnLeadership', page: PAGES.LEADERSHIP, label: 'Leadership' },
        { id: 'btnNewcomer', page: PAGES.NEWCOMER, label: 'New in Jax?' },
        { id: 'btnFeedback', page: PAGES.FEEDBACK, label: 'Feedback' },
        // New Features (v3.0)
        { id: 'btnCommunity', page: PAGES.COMMUNITY, label: 'Community' },
        { id: 'btnDonate', page: PAGES.DONATE, label: 'Donate' }
    ];
    
    // User Menu Items
    const userMenuItems = [
        { id: 'btnLogin', page: PAGES.LOGIN, label: 'Login' },
        { id: 'btnRegister', page: PAGES.REGISTER, label: 'Join BANF' },
        { id: 'btnMyProfile', page: '/my-profile', label: 'My Profile' },
        { id: 'btnLogout', action: 'logout', label: 'Logout' }
    ];
    
    // Bind all menu items
    [...mainMenuItems, ...serviceMenuItems, ...userMenuItems].forEach(item => {
        try {
            const element = $w(`#${item.id}`);
            if (element && typeof element.onClick === 'function') {
                if (item.action === 'logout') {
                    element.onClick(handleLogout);
                } else {
                    element.onClick(() => wixLocation.to(item.page));
                }
            }
        } catch (e) {
            // Element doesn't exist - skip
        }
    });
    
    // Quick Access Strip Navigation
    const quickAccessItems = [
        { id: 'quickEvents', page: PAGES.EVENTS },
        { id: 'quickMembers', page: PAGES.MEMBERS },
        { id: 'quickRadio', page: PAGES.RADIO },
        { id: 'quickMagazine', page: PAGES.MAGAZINE },
        { id: 'quickGallery', page: PAGES.GALLERY },
        { id: 'quickVolunteer', page: PAGES.VOLUNTEER },
        // New Feature Quick Access (v3.0)
        { id: 'quickCommunity', page: PAGES.COMMUNITY },
        { id: 'quickDonate', page: PAGES.DONATE },
        { id: 'quickCareers', page: PAGES.CAREERS },
        { id: 'quickScholarships', page: PAGES.SCHOLARSHIPS }
    ];
    
    quickAccessItems.forEach(item => {
        try {
            const element = $w(`#${item.id}`);
            if (element && typeof element.onClick === 'function') {
                element.onClick(() => wixLocation.to(item.page));
            }
        } catch (e) {
            // Element doesn't exist - skip
        }
    });
    
    return Promise.resolve();
}

// ============================================================
// HERO SECTION
// ============================================================
async function loadHeroContent() {
    // Bengali welcome text
    const bengaliWelcome = 'স্বাগতম - নর্থ ফ্লোরিডার বাঙালি সমাজে';
    const englishWelcome = 'Welcome to the Bengali Association of North Florida';
    const tagline = 'Preserving Bengali Culture • Building Community • Celebrating Heritage Since 1988';
    
    try {
        if ($w('#txtBengaliWelcome').exists) {
            $w('#txtBengaliWelcome').text = bengaliWelcome;
        }
        if ($w('#txtEnglishWelcome').exists) {
            $w('#txtEnglishWelcome').text = englishWelcome;
        }
        if ($w('#txtTagline').exists) {
            $w('#txtTagline').text = tagline;
        }
        
        // Hero CTA buttons
        if ($w('#btnJoinBANF').exists) {
            $w('#btnJoinBANF').onClick(() => wixLocation.to(PAGES.REGISTER));
        }
        if ($w('#btnExploreEvents').exists) {
            $w('#btnExploreEvents').onClick(() => wixLocation.to(PAGES.EVENTS));
        }
    } catch (e) {
        console.log('Hero content setup:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// QUICK STATS (LIVE DATA)
// ============================================================
async function loadQuickStats() {
    try {
        const { getDashboardStats } = await import('backend/dashboard-service.jsw');
        const stats = await getDashboardStats();
        
        // Default stats if API fails
        const defaultStats = {
            totalMembers: '500+',
            totalEvents: '50+',
            totalSponsors: '20+',
            yearsActive: '35+'
        };
        
        const displayStats = {
            members: stats?.totalMembers || defaultStats.totalMembers,
            events: stats?.totalEvents || defaultStats.totalEvents,
            sponsors: stats?.totalSponsors || defaultStats.totalSponsors,
            years: stats?.yearsActive || defaultStats.yearsActive
        };
        
        // Update stat display elements
        const statElements = [
            { id: 'txtMemberCount', value: displayStats.members, label: 'Members' },
            { id: 'txtEventCount', value: displayStats.events, label: 'Events Hosted' },
            { id: 'txtSponsorCount', value: displayStats.sponsors, label: 'Sponsors' },
            { id: 'txtYearsCount', value: displayStats.years, label: 'Years Strong' }
        ];
        
        statElements.forEach(stat => {
            try {
                if ($w(`#${stat.id}`).exists) {
                    $w(`#${stat.id}`).text = String(stat.value);
                }
            } catch (e) {
                // Element doesn't exist
            }
        });
        
    } catch (e) {
        console.log('Stats loading (using defaults):', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// FEATURED EVENTS SECTION
// ============================================================
async function loadFeaturedEvents() {
    try {
        const { getUpcomingEvents } = await import('backend/events.jsw');
        const events = await getUpcomingEvents(6); // Get 6 upcoming events
        
        if ($w('#repeaterEvents').exists && events && events.length > 0) {
            $w('#repeaterEvents').data = events.map((event, index) => ({
                ...event,
                _id: event._id || `event_${index}`
            }));
            
            $w('#repeaterEvents').onItemReady(($item, itemData) => {
                // Event card content
                if ($item('#txtEventName').exists) {
                    $item('#txtEventName').text = itemData.title || 'Upcoming Event';
                }
                if ($item('#txtEventDate').exists) {
                    $item('#txtEventDate').text = formatEventDate(itemData.date);
                }
                if ($item('#txtEventVenue').exists) {
                    $item('#txtEventVenue').text = itemData.venue || 'TBA';
                }
                if ($item('#txtEventCategory').exists) {
                    $item('#txtEventCategory').text = itemData.category || 'Community';
                }
                if ($item('#imgEvent').exists && itemData.imageUrl) {
                    $item('#imgEvent').src = itemData.imageUrl;
                }
                
                // Event card click handler
                if ($item('#btnEventDetails').exists) {
                    $item('#btnEventDetails').onClick(() => {
                        wixLocation.to(`${PAGES.EVENTS}?id=${itemData._id}`);
                    });
                }
                
                // Register button
                if ($item('#btnRegisterEvent').exists) {
                    $item('#btnRegisterEvent').onClick(async () => {
                        if (!wixUsers.currentUser.loggedIn) {
                            wixLocation.to(`${PAGES.LOGIN}?redirect=${PAGES.EVENTS}?id=${itemData._id}`);
                            return;
                        }
                        await registerForEvent(itemData._id);
                    });
                }
            });
        } else {
            // Show "no events" message
            if ($w('#txtNoEvents').exists) {
                $w('#txtNoEvents').show();
            }
        }
        
        // View All Events button
        if ($w('#btnViewAllEvents').exists) {
            $w('#btnViewAllEvents').onClick(() => wixLocation.to(PAGES.EVENTS));
        }
        
    } catch (e) {
        console.log('Events loading:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// LATEST NEWS & ANNOUNCEMENTS
// ============================================================
async function loadLatestNews() {
    try {
        const { getAnnouncements } = await import('backend/communication-hub.jsw');
        const news = await getAnnouncements(5);
        
        if ($w('#repeaterNews').exists && news && news.length > 0) {
            $w('#repeaterNews').data = news.map((item, index) => ({
                ...item,
                _id: item._id || `news_${index}`
            }));
            
            $w('#repeaterNews').onItemReady(($item, itemData) => {
                if ($item('#txtNewsTitle').exists) {
                    $item('#txtNewsTitle').text = itemData.title || 'Announcement';
                }
                if ($item('#txtNewsDate').exists) {
                    $item('#txtNewsDate').text = timeAgo(itemData.createdAt);
                }
                if ($item('#txtNewsPreview').exists) {
                    const preview = itemData.content ? itemData.content.substring(0, 100) + '...' : '';
                    $item('#txtNewsPreview').text = preview;
                }
                if ($item('#badgeNewsType').exists) {
                    $item('#badgeNewsType').text = itemData.type || 'News';
                }
            });
        }
        
    } catch (e) {
        console.log('News loading:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// RADIO WIDGET SECTION
// ============================================================
async function loadRadioStatus() {
    try {
        const { getRadioStatus, getCurrentSchedule } = await import('backend/radio.jsw');
        
        // Get radio status
        const status = await getRadioStatus();
        const isLive = status?.isLive || false;
        
        // Update live indicator
        if ($w('#txtRadioStatus').exists) {
            $w('#txtRadioStatus').text = isLive ? '🔴 LIVE NOW' : '📻 On Air Soon';
        }
        
        // Current/next show
        const schedule = await getCurrentSchedule();
        if ($w('#txtCurrentShow').exists && schedule) {
            $w('#txtCurrentShow').text = schedule.currentShow || 'BANF Radio';
        }
        if ($w('#txtNextShow').exists && schedule) {
            $w('#txtNextShow').text = `Next: ${schedule.nextShow || 'Stay Tuned'}`;
        }
        
        // Play button
        if ($w('#btnPlayRadio').exists) {
            $w('#btnPlayRadio').onClick(() => {
                wixLocation.to(PAGES.RADIO);
            });
        }
        
        // Full schedule link
        if ($w('#btnRadioSchedule').exists) {
            $w('#btnRadioSchedule').onClick(() => {
                wixLocation.to(`${PAGES.RADIO}#schedule`);
            });
        }
        
    } catch (e) {
        console.log('Radio status:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// MAGAZINE (PRATIBIMBO) PREVIEW
// ============================================================
async function loadMagazinePreview() {
    try {
        const { getLatestIssue, getRecentArticles } = await import('backend/magazine.jsw');
        
        // Latest issue
        const latestIssue = await getLatestIssue();
        if ($w('#txtMagazineTitle').exists && latestIssue) {
            $w('#txtMagazineTitle').text = latestIssue.title || 'প্রতিবিম্ব - Pratibimbo';
        }
        if ($w('#txtMagazineIssue').exists && latestIssue) {
            $w('#txtMagazineIssue').text = `Issue: ${latestIssue.issueNumber || 'Latest'}`;
        }
        if ($w('#imgMagazineCover').exists && latestIssue?.coverImage) {
            $w('#imgMagazineCover').src = latestIssue.coverImage;
        }
        
        // Download latest issue
        if ($w('#btnDownloadMagazine').exists) {
            $w('#btnDownloadMagazine').onClick(() => {
                if (latestIssue?.pdfUrl) {
                    wixWindow.openLightbox('DownloadMagazine', { url: latestIssue.pdfUrl });
                } else {
                    wixLocation.to(PAGES.MAGAZINE);
                }
            });
        }
        
        // View all issues
        if ($w('#btnViewMagazine').exists) {
            $w('#btnViewMagazine').onClick(() => wixLocation.to(PAGES.MAGAZINE));
        }
        
    } catch (e) {
        console.log('Magazine loading:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// SPONSOR SHOWCASE
// ============================================================
async function loadSponsorShowcase() {
    try {
        const { getActiveSponsors } = await import('backend/sponsor-management.jsw');
        const sponsors = await getActiveSponsors();
        
        // Featured sponsors (Platinum & Gold)
        const featuredSponsors = sponsors?.filter(s => 
            s.tier === 'Platinum' || s.tier === 'Gold'
        ) || [];
        
        if ($w('#repeaterSponsors').exists && featuredSponsors.length > 0) {
            $w('#repeaterSponsors').data = featuredSponsors.slice(0, 6).map((sponsor, index) => ({
                ...sponsor,
                _id: sponsor._id || `sponsor_${index}`
            }));
            
            $w('#repeaterSponsors').onItemReady(($item, itemData) => {
                if ($item('#imgSponsorLogo').exists && itemData.logoUrl) {
                    $item('#imgSponsorLogo').src = itemData.logoUrl;
                }
                if ($item('#txtSponsorName').exists) {
                    $item('#txtSponsorName').text = itemData.name || '';
                }
                if ($item('#txtSponsorTier').exists) {
                    $item('#txtSponsorTier').text = itemData.tier || '';
                }
                
                // Click to sponsor page
                $item('#boxSponsor')?.onClick(() => {
                    if (itemData.website) {
                        wixWindow.openModal(itemData.website, { target: '_blank' });
                    }
                });
            });
        }
        
        // Become a sponsor CTA
        if ($w('#btnBecomeASponsor').exists) {
            $w('#btnBecomeASponsor').onClick(() => wixLocation.to(`${PAGES.SPONSORS}#packages`));
        }
        
        // View all sponsors
        if ($w('#btnViewAllSponsors').exists) {
            $w('#btnViewAllSponsors').onClick(() => wixLocation.to(PAGES.SPONSORS));
        }
        
    } catch (e) {
        console.log('Sponsors loading:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// MEMBERSHIP SECTION
// ============================================================
async function loadMembershipInfo() {
    try {
        const { getMembershipTypes, getMembershipBenefits } = await import('backend/membership.jsw');
        
        // Membership types
        const types = await getMembershipTypes();
        if ($w('#repeaterMembership').exists && types && types.length > 0) {
            $w('#repeaterMembership').data = types.map((type, index) => ({
                ...type,
                _id: type._id || `membership_${index}`
            }));
            
            $w('#repeaterMembership').onItemReady(($item, itemData) => {
                if ($item('#txtMembershipType').exists) {
                    $item('#txtMembershipType').text = itemData.name || 'Membership';
                }
                if ($item('#txtMembershipPrice').exists) {
                    $item('#txtMembershipPrice').text = `$${itemData.price || '0'}/year`;
                }
                if ($item('#txtMembershipDesc').exists) {
                    $item('#txtMembershipDesc').text = itemData.description || '';
                }
                
                // Join button
                if ($item('#btnJoinMembership').exists) {
                    $item('#btnJoinMembership').onClick(() => {
                        wixLocation.to(`${PAGES.REGISTER}?type=${itemData.code}`);
                    });
                }
            });
        }
        
        // Join BANF CTA
        if ($w('#btnJoinBANFMain').exists) {
            $w('#btnJoinBANFMain').onClick(() => wixLocation.to(PAGES.REGISTER));
        }
        
    } catch (e) {
        console.log('Membership loading:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// QUICK ACTIONS SETUP
// ============================================================
function setupQuickActions() {
    // Quick action buttons
    const quickActions = [
        { id: 'btnQuickDonate', action: () => wixLocation.to(PAGES.DONATE) },
        { id: 'btnQuickVolunteer', action: () => wixLocation.to(PAGES.VOLUNTEER) },
        { id: 'btnQuickFeedback', action: () => wixLocation.to(PAGES.FEEDBACK) },
        { id: 'btnQuickNewcomer', action: () => wixLocation.to(PAGES.NEWCOMER) },
        // New Feature Quick Actions (v3.0)
        { id: 'btnQuickCommunity', action: () => wixLocation.to(PAGES.COMMUNITY) },
        { id: 'btnQuickCareers', action: () => wixLocation.to(PAGES.CAREERS) },
        { id: 'btnQuickScholarships', action: () => wixLocation.to(PAGES.SCHOLARSHIPS) },
        { id: 'btnQuickCharity', action: () => wixLocation.to(PAGES.CHARITY) },
        { id: 'btnQuickReports', action: () => wixLocation.to(PAGES.REPORTS) },
        { id: 'btnQuickInsights', action: () => wixLocation.to(PAGES.INSIGHTS) }
    ];
    
    quickActions.forEach(item => {
        try {
            if ($w(`#${item.id}`).exists) {
                $w(`#${item.id}`).onClick(item.action);
            }
        } catch (e) {
            // Element doesn't exist
        }
    });
    
    return Promise.resolve();
}

// ============================================================
// CONTACT/FEEDBACK QUICK FORM
// ============================================================
function setupContactForm() {
    // Quick contact form submission
    if ($w('#btnSubmitQuickContact').exists) {
        $w('#btnSubmitQuickContact').onClick(async () => {
            const name = $w('#inputContactName')?.value || '';
            const email = $w('#inputContactEmail')?.value || '';
            const message = $w('#inputContactMessage')?.value || '';
            
            if (!email || !message) {
                showToast('Please fill in email and message', 'error');
                return;
            }
            
            try {
                const { submitContact } = await import('backend/contact-service.jsw');
                await submitContact({ name, email, message, source: 'home-page' });
                showToast('Message sent! We\'ll get back to you soon.', 'success');
                
                // Clear form
                if ($w('#inputContactName').exists) $w('#inputContactName').value = '';
                if ($w('#inputContactEmail').exists) $w('#inputContactEmail').value = '';
                if ($w('#inputContactMessage').exists) $w('#inputContactMessage').value = '';
                
            } catch (e) {
                showToast('Failed to send message. Please try again.', 'error');
            }
        });
    }
    
    // Full contact page link
    if ($w('#btnFullContactForm').exists) {
        $w('#btnFullContactForm').onClick(() => wixLocation.to(PAGES.CONTACT));
    }
    
    return Promise.resolve();
}

// ============================================================
// USER AUTHENTICATION
// ============================================================
function updateUserMenu(isLoggedIn) {
    try {
        // Show/hide appropriate menu items based on login status
        if (isLoggedIn) {
            if ($w('#btnLogin').exists) $w('#btnLogin').hide();
            if ($w('#btnRegister').exists) $w('#btnRegister').hide();
            if ($w('#btnMyProfile').exists) $w('#btnMyProfile').show();
            if ($w('#btnLogout').exists) $w('#btnLogout').show();
            
            // Update welcome message
            const user = wixUsers.currentUser;
            if ($w('#txtWelcomeUser').exists) {
                $w('#txtWelcomeUser').text = `Welcome back!`;
            }
        } else {
            if ($w('#btnLogin').exists) $w('#btnLogin').show();
            if ($w('#btnRegister').exists) $w('#btnRegister').show();
            if ($w('#btnMyProfile').exists) $w('#btnMyProfile').hide();
            if ($w('#btnLogout').exists) $w('#btnLogout').hide();
        }
    } catch (e) {
        console.log('User menu update:', e.message);
    }
}

async function handleLogout() {
    try {
        await wixUsers.logout();
        wixLocation.to(PAGES.HOME);
    } catch (e) {
        console.log('Logout error:', e.message);
    }
}

// ============================================================
// EVENT REGISTRATION
// ============================================================
async function registerForEvent(eventId) {
    try {
        const { registerForEvent } = await import('backend/events.jsw');
        const user = wixUsers.currentUser;
        
        const result = await registerForEvent(eventId, {
            userId: user.id,
            registeredAt: new Date()
        });
        
        if (result.success) {
            showToast('Successfully registered for event!', 'success');
        } else {
            showToast(result.message || 'Registration failed', 'error');
        }
    } catch (e) {
        showToast('Failed to register. Please try again.', 'error');
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatEventDate(dateStr) {
    if (!dateStr) return 'Date TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

function showToast(message, type = 'info') {
    try {
        // Try to use Wix's notification system
        if ($w('#toastMessage').exists) {
            $w('#toastMessage').text = message;
            $w('#toastContainer').show();
            setTimeout(() => $w('#toastContainer').hide(), 3000);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    } catch (e) {
        console.log(message);
    }
}

// ============================================================
// COMMUNITY ENGAGEMENT SECTION (v3.0)
// ============================================================
async function loadCommunityHighlights() {
    try {
        const { getActiveInitiatives } = await import('backend/community-engagement.jsw');
        const initiatives = await getActiveInitiatives(4); // Get 4 active initiatives
        
        if ($w('#repeaterCommunity').exists && initiatives && initiatives.length > 0) {
            $w('#repeaterCommunity').data = initiatives.map((item, index) => ({
                ...item,
                _id: item._id || `community_${index}`
            }));
            
            $w('#repeaterCommunity').onItemReady(($item, itemData) => {
                if ($item('#txtInitiativeName').exists) {
                    $item('#txtInitiativeName').text = itemData.title || 'Community Initiative';
                }
                if ($item('#txtInitiativeType').exists) {
                    $item('#txtInitiativeType').text = itemData.initiativeType || 'Community';
                }
                if ($item('#txtGoalProgress').exists) {
                    const progress = itemData.goalAmount > 0 
                        ? Math.round((itemData.currentAmount / itemData.goalAmount) * 100)
                        : 0;
                    $item('#txtGoalProgress').text = `${progress}% of goal`;
                }
                if ($item('#imgCommunity').exists && itemData.imageUrl) {
                    $item('#imgCommunity').src = itemData.imageUrl;
                }
                
                // View details button
                if ($item('#btnViewInitiative').exists) {
                    $item('#btnViewInitiative').onClick(() => {
                        wixLocation.to(`${PAGES.COMMUNITY}?id=${itemData._id}`);
                    });
                }
                
                // Donate button
                if ($item('#btnDonateInitiative').exists) {
                    $item('#btnDonateInitiative').onClick(() => {
                        wixLocation.to(`${PAGES.DONATE}?initiative=${itemData._id}`);
                    });
                }
            });
        }
        
        // View All Community button
        if ($w('#btnViewAllCommunity').exists) {
            $w('#btnViewAllCommunity').onClick(() => wixLocation.to(PAGES.COMMUNITY));
        }
        
        // Charity button
        if ($w('#btnViewCharity').exists) {
            $w('#btnViewCharity').onClick(() => wixLocation.to(PAGES.CHARITY));
        }
        
        // Career Guidance button
        if ($w('#btnViewCareers').exists) {
            $w('#btnViewCareers').onClick(() => wixLocation.to(PAGES.CAREERS));
        }
        
        // Scholarships button
        if ($w('#btnViewScholarships').exists) {
            $w('#btnViewScholarships').onClick(() => wixLocation.to(PAGES.SCHOLARSHIPS));
        }
        
    } catch (e) {
        console.log('Community highlights loading:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// INSIGHTS PREVIEW SECTION (v3.0)
// ============================================================
async function loadInsightsPreview() {
    try {
        // Only show insights for logged-in admins
        const isLoggedIn = wixUsers.currentUser.loggedIn;
        if (!isLoggedIn) {
            if ($w('#sectionInsights').exists) {
                $w('#sectionInsights').hide();
            }
            return Promise.resolve();
        }
        
        const { getQuickInsights } = await import('backend/insights-analytics.jsw');
        const insights = await getQuickInsights();
        
        if (insights && insights.success) {
            // Update quick insight cards
            const insightCards = [
                { id: 'txtInsightMembers', value: insights.membership?.totalMembers || '500+', label: 'Total Members' },
                { id: 'txtInsightGrowth', value: `${insights.membership?.growthRate || 0}%`, label: 'Growth Rate' },
                { id: 'txtInsightEvents', value: insights.events?.upcomingEvents || '0', label: 'Upcoming Events' },
                { id: 'txtInsightRevenue', value: `$${insights.financial?.incomeThisMonth || 0}`, label: 'This Month' }
            ];
            
            insightCards.forEach(card => {
                try {
                    if ($w(`#${card.id}`).exists) {
                        $w(`#${card.id}`).text = String(card.value);
                    }
                } catch (e) {
                    // Element doesn't exist
                }
            });
            
            // Show insights section
            if ($w('#sectionInsights').exists) {
                $w('#sectionInsights').show();
            }
        }
        
        // View Full Insights button
        if ($w('#btnViewInsights').exists) {
            $w('#btnViewInsights').onClick(() => wixLocation.to(PAGES.INSIGHTS));
        }
        
        // View Reports button
        if ($w('#btnViewReports').exists) {
            $w('#btnViewReports').onClick(() => wixLocation.to(PAGES.REPORTS));
        }
        
    } catch (e) {
        console.log('Insights preview loading:', e.message);
        // Hide insights section on error
        if ($w('#sectionInsights').exists) {
            $w('#sectionInsights').hide();
        }
    }
    
    return Promise.resolve();
}

// ============================================================
// ADMIN PANEL QUICK ACCESS (v3.0)
// ============================================================
function setupAdminQuickAccess() {
    // Admin quick links (shown only to admins)
    const adminLinks = [
        { id: 'btnAdminReports', page: PAGES.REPORTS, label: 'Reports' },
        { id: 'btnAdminInsights', page: PAGES.INSIGHTS, label: 'Insights' },
        { id: 'btnAdminAds', page: PAGES.ADS, label: 'Ad Manager' },
        { id: 'btnAdminCommunity', page: `${PAGES.ADMIN}#community`, label: 'Community' },
        { id: 'btnAdminMembers', page: `${PAGES.ADMIN}#members`, label: 'Members' },
        { id: 'btnAdminEvents', page: `${PAGES.ADMIN}#events`, label: 'Events' },
        { id: 'btnAdminFinance', page: `${PAGES.ADMIN}#finance`, label: 'Finance' },
        { id: 'btnAdminRadio', page: `${PAGES.ADMIN}#radio`, label: 'Radio' },
        { id: 'btnAdminMagazine', page: `${PAGES.ADMIN}#magazine`, label: 'Magazine' }
    ];
    
    adminLinks.forEach(link => {
        try {
            if ($w(`#${link.id}`).exists) {
                $w(`#${link.id}`).onClick(() => wixLocation.to(link.page));
            }
        } catch (e) {
            // Element doesn't exist
        }
    });
}
