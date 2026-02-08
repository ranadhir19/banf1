/**
 * ============================================================
 * BANF - Advertisement Management Page
 * Google Ads-like system for vendor advertising
 * ============================================================
 * 
 * Features:
 * - Campaign management
 * - Ad creation and preview
 * - Performance analytics
 * - Billing and budget management
 * - Ad placement selection
 */

import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';

// ============================================================
// CONSTANTS
// ============================================================
const PAGES = {
    HOME: '/',
    ADS: '/ads',
    ADMIN: '/admin',
    LOGIN: '/login'
};

const AD_TYPES = {
    BANNER: 'banner',
    SIDEBAR: 'sidebar',
    POPUP: 'popup',
    VIDEO: 'video',
    NATIVE: 'native',
    SPONSORED: 'sponsored',
    CAROUSEL: 'carousel'
};

const AD_PLACEMENTS = {
    HOME_HERO: 'home_hero',
    HOME_SIDEBAR: 'home_sidebar',
    HOME_FOOTER: 'home_footer',
    EVENT_PAGE: 'event_page',
    MEMBER_DIRECTORY: 'member_directory',
    MAGAZINE_PAGE: 'magazine_page',
    EMAIL_NEWSLETTER: 'email_newsletter'
};

const BILLING_MODELS = {
    CPM: 'cpm',
    CPC: 'cpc',
    FLAT_RATE: 'flat'
};

// ============================================================
// PAGE INITIALIZATION
// ============================================================
$w.onReady(async function () {
    console.log('📢 BANF Ads Page Initializing...');
    
    // Check login
    const isLoggedIn = wixUsers.currentUser.loggedIn;
    if (!isLoggedIn) {
        wixLocation.to(`${PAGES.LOGIN}?redirect=${PAGES.ADS}`);
        return;
    }
    
    // Check permission (sponsor/vendor or admin)
    const hasPermission = await checkAdPermission();
    if (!hasPermission) {
        showAccessDenied();
        return;
    }
    
    // Initialize ad dashboard
    await Promise.all([
        setupNavigation(),
        loadCampaigns(),
        loadAdPerformance(),
        setupCreateCampaign()
    ]);
    
    console.log('✅ Ads Page Ready!');
});

// ============================================================
// PERMISSION CHECK
// ============================================================
async function checkAdPermission() {
    try {
        const { hasSpecializedPermission } = await import('backend/specialized-admin-roles.jsw');
        const isAdManager = await hasSpecializedPermission(wixUsers.currentUser.id, 'ads_full');
        
        // Also allow sponsors/vendors to manage their own ads
        const { isSponsorOrVendor } = await import('backend/ad-management.jsw');
        const isSponsor = await isSponsorOrVendor(wixUsers.currentUser.id);
        
        return isAdManager || isSponsor;
    } catch (e) {
        console.log('Permission check error:', e.message);
        return false;
    }
}

function showAccessDenied() {
    if ($w('#sectionAds').exists) {
        $w('#sectionAds').hide();
    }
    if ($w('#sectionAccessDenied').exists) {
        $w('#sectionAccessDenied').show();
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNavigation() {
    const tabs = [
        { id: 'tabCampaigns', section: 'sectionCampaigns' },
        { id: 'tabCreateAd', section: 'sectionCreateAd' },
        { id: 'tabPerformance', section: 'sectionPerformance' },
        { id: 'tabBilling', section: 'sectionBilling' }
    ];
    
    tabs.forEach(tab => {
        try {
            if ($w(`#${tab.id}`).exists) {
                $w(`#${tab.id}`).onClick(() => {
                    showSection(tab.section);
                    updateActiveTab(tab.id);
                });
            }
        } catch (e) {
            // Tab doesn't exist
        }
    });
    
    return Promise.resolve();
}

function showSection(sectionId) {
    const allSections = ['sectionCampaigns', 'sectionCreateAd', 'sectionPerformance', 'sectionBilling'];
    allSections.forEach(section => {
        try {
            if ($w(`#${section}`).exists) {
                if (section === sectionId) {
                    $w(`#${section}`).show();
                } else {
                    $w(`#${section}`).hide();
                }
            }
        } catch (e) {
            // Section doesn't exist
        }
    });
}

function updateActiveTab(activeTabId) {
    const allTabs = ['tabCampaigns', 'tabCreateAd', 'tabPerformance', 'tabBilling'];
    allTabs.forEach(tabId => {
        try {
            if ($w(`#${tabId}`).exists) {
                if (tabId === activeTabId) {
                    $w(`#${tabId}`).style.backgroundColor = '#006A4E';
                    $w(`#${tabId}`).style.color = '#ffffff';
                } else {
                    $w(`#${tabId}`).style.backgroundColor = '#ffffff';
                    $w(`#${tabId}`).style.color = '#333333';
                }
            }
        } catch (e) {
            // Element doesn't exist
        }
    });
}

// ============================================================
// LOAD CAMPAIGNS
// ============================================================
async function loadCampaigns() {
    try {
        const { getCampaigns } = await import('backend/ad-management.jsw');
        const campaigns = await getCampaigns(wixUsers.currentUser.id);
        
        if ($w('#repeaterCampaigns').exists && campaigns && campaigns.length > 0) {
            $w('#repeaterCampaigns').data = campaigns.map((item, index) => ({
                ...item,
                _id: item._id || `campaign_${index}`
            }));
            
            $w('#repeaterCampaigns').onItemReady(($item, itemData) => {
                // Campaign card content
                if ($item('#txtCampaignName').exists) {
                    $item('#txtCampaignName').text = itemData.name || 'Campaign';
                }
                if ($item('#txtCampaignStatus').exists) {
                    $item('#txtCampaignStatus').text = formatStatus(itemData.status);
                }
                if ($item('#txtCampaignBudget').exists) {
                    $item('#txtCampaignBudget').text = `$${itemData.budget?.total || 0}`;
                }
                if ($item('#txtCampaignSpent').exists) {
                    $item('#txtCampaignSpent').text = `Spent: $${itemData.budget?.spent || 0}`;
                }
                if ($item('#txtCampaignDates').exists) {
                    $item('#txtCampaignDates').text = `${formatDate(itemData.schedule?.startDate)} - ${formatDate(itemData.schedule?.endDate)}`;
                }
                
                // Performance metrics
                if ($item('#txtImpressions').exists) {
                    $item('#txtImpressions').text = `${(itemData.metrics?.impressions || 0).toLocaleString()} impressions`;
                }
                if ($item('#txtClicks').exists) {
                    $item('#txtClicks').text = `${itemData.metrics?.clicks || 0} clicks`;
                }
                if ($item('#txtCTR').exists) {
                    const ctr = itemData.metrics?.impressions > 0 
                        ? ((itemData.metrics.clicks / itemData.metrics.impressions) * 100).toFixed(2)
                        : 0;
                    $item('#txtCTR').text = `${ctr}% CTR`;
                }
                
                // Action buttons
                if ($item('#btnEditCampaign').exists) {
                    $item('#btnEditCampaign').onClick(() => editCampaign(itemData._id));
                }
                if ($item('#btnPauseCampaign').exists) {
                    const isPaused = itemData.status === 'paused';
                    $item('#btnPauseCampaign').label = isPaused ? 'Resume' : 'Pause';
                    $item('#btnPauseCampaign').onClick(() => toggleCampaignStatus(itemData._id, !isPaused));
                }
                if ($item('#btnViewAds').exists) {
                    $item('#btnViewAds').onClick(() => viewCampaignAds(itemData._id));
                }
            });
            
            // Hide no campaigns message
            if ($w('#txtNoCampaigns').exists) {
                $w('#txtNoCampaigns').hide();
            }
        } else {
            // Show no campaigns message
            if ($w('#txtNoCampaigns').exists) {
                $w('#txtNoCampaigns').show();
            }
        }
    } catch (e) {
        console.log('Load campaigns error:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// CREATE CAMPAIGN
// ============================================================
function setupCreateCampaign() {
    // Ad type dropdown
    if ($w('#dropdownAdType').exists) {
        $w('#dropdownAdType').options = [
            { label: 'Banner Ad', value: AD_TYPES.BANNER },
            { label: 'Sidebar Ad', value: AD_TYPES.SIDEBAR },
            { label: 'Sponsored Content', value: AD_TYPES.SPONSORED },
            { label: 'Video Ad', value: AD_TYPES.VIDEO },
            { label: 'Carousel', value: AD_TYPES.CAROUSEL }
        ];
    }
    
    // Placement dropdown
    if ($w('#dropdownPlacement').exists) {
        $w('#dropdownPlacement').options = [
            { label: 'Home Page Hero', value: AD_PLACEMENTS.HOME_HERO },
            { label: 'Home Page Sidebar', value: AD_PLACEMENTS.HOME_SIDEBAR },
            { label: 'Events Page', value: AD_PLACEMENTS.EVENT_PAGE },
            { label: 'Member Directory', value: AD_PLACEMENTS.MEMBER_DIRECTORY },
            { label: 'Magazine Page', value: AD_PLACEMENTS.MAGAZINE_PAGE },
            { label: 'Email Newsletter', value: AD_PLACEMENTS.EMAIL_NEWSLETTER }
        ];
    }
    
    // Billing model dropdown
    if ($w('#dropdownBilling').exists) {
        $w('#dropdownBilling').options = [
            { label: 'Cost Per 1000 Impressions (CPM)', value: BILLING_MODELS.CPM },
            { label: 'Cost Per Click (CPC)', value: BILLING_MODELS.CPC },
            { label: 'Flat Rate', value: BILLING_MODELS.FLAT_RATE }
        ];
    }
    
    // Create campaign button
    if ($w('#btnCreateCampaign').exists) {
        $w('#btnCreateCampaign').onClick(() => createCampaign());
    }
    
    // Preview ad button
    if ($w('#btnPreviewAd').exists) {
        $w('#btnPreviewAd').onClick(() => previewAd());
    }
    
    return Promise.resolve();
}

async function createCampaign() {
    const campaignData = {
        name: $w('#inputCampaignName')?.value,
        objective: $w('#dropdownObjective')?.value || 'awareness',
        totalBudget: parseFloat($w('#inputBudget')?.value) || 0,
        dailyBudget: parseFloat($w('#inputDailyBudget')?.value) || 0,
        startDate: $w('#datePickerStart')?.value,
        endDate: $w('#datePickerEnd')?.value,
        billingModel: $w('#dropdownBilling')?.value || BILLING_MODELS.CPM,
        maxBid: parseFloat($w('#inputMaxBid')?.value) || 0
    };
    
    if (!campaignData.name) {
        showToast('Please enter a campaign name', 'error');
        return;
    }
    
    if (campaignData.totalBudget <= 0) {
        showToast('Please enter a valid budget', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const { createCampaign } = await import('backend/ad-management.jsw');
        const result = await createCampaign(campaignData, wixUsers.currentUser.id);
        
        if (result.success) {
            showToast('Campaign created successfully!', 'success');
            
            // Now create the ad
            await createAd(result.campaignId);
            
            // Refresh campaigns list
            await loadCampaigns();
            
            // Show campaigns section
            showSection('sectionCampaigns');
            updateActiveTab('tabCampaigns');
        } else {
            showToast(result.error || 'Failed to create campaign', 'error');
        }
    } catch (e) {
        console.log('Create campaign error:', e.message);
        showToast('Failed to create campaign. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function createAd(campaignId) {
    const adData = {
        type: $w('#dropdownAdType')?.value || AD_TYPES.BANNER,
        placement: $w('#dropdownPlacement')?.value || AD_PLACEMENTS.HOME_SIDEBAR,
        headline: $w('#inputHeadline')?.value,
        description: $w('#inputDescription')?.value,
        callToAction: $w('#inputCTA')?.value || 'Learn More',
        destinationUrl: $w('#inputDestinationUrl')?.value,
        primaryImage: $w('#uploadAdImage')?.value?.[0]?.url
    };
    
    try {
        const { createAd } = await import('backend/ad-management.jsw');
        const result = await createAd(campaignId, adData, wixUsers.currentUser.id);
        
        if (result.success) {
            showToast('Ad created and pending review', 'success');
        } else {
            showToast(result.error || 'Failed to create ad', 'error');
        }
    } catch (e) {
        console.log('Create ad error:', e.message);
    }
}

function previewAd() {
    const adData = {
        type: $w('#dropdownAdType')?.value,
        headline: $w('#inputHeadline')?.value,
        description: $w('#inputDescription')?.value,
        callToAction: $w('#inputCTA')?.value || 'Learn More',
        image: $w('#uploadAdImage')?.value?.[0]?.url
    };
    
    wixWindow.openLightbox('AdPreview', { adData });
}

// ============================================================
// CAMPAIGN ACTIONS
// ============================================================
function editCampaign(campaignId) {
    wixWindow.openLightbox('EditCampaign', { campaignId });
}

async function toggleCampaignStatus(campaignId, pause) {
    try {
        const { updateCampaignStatus } = await import('backend/ad-management.jsw');
        const newStatus = pause ? 'paused' : 'active';
        const result = await updateCampaignStatus(campaignId, newStatus, wixUsers.currentUser.id);
        
        if (result.success) {
            showToast(`Campaign ${pause ? 'paused' : 'resumed'}`, 'success');
            await loadCampaigns();
        } else {
            showToast(result.error || 'Failed to update campaign', 'error');
        }
    } catch (e) {
        console.log('Toggle campaign status error:', e.message);
    }
}

function viewCampaignAds(campaignId) {
    wixWindow.openLightbox('CampaignAds', { campaignId });
}

// ============================================================
// PERFORMANCE ANALYTICS
// ============================================================
async function loadAdPerformance() {
    try {
        const { getAdPerformance } = await import('backend/ad-management.jsw');
        const performance = await getAdPerformance(wixUsers.currentUser.id);
        
        if (performance.success) {
            // Update performance metrics
            if ($w('#txtTotalImpressions').exists) {
                $w('#txtTotalImpressions').text = (performance.totalImpressions || 0).toLocaleString();
            }
            if ($w('#txtTotalClicks').exists) {
                $w('#txtTotalClicks').text = (performance.totalClicks || 0).toLocaleString();
            }
            if ($w('#txtOverallCTR').exists) {
                $w('#txtOverallCTR').text = `${performance.overallCTR || 0}%`;
            }
            if ($w('#txtTotalSpend').exists) {
                $w('#txtTotalSpend').text = `$${(performance.totalSpend || 0).toFixed(2)}`;
            }
            if ($w('#txtActiveCampaigns').exists) {
                $w('#txtActiveCampaigns').text = performance.activeCampaigns || 0;
            }
        }
    } catch (e) {
        console.log('Load ad performance error:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatStatus(status) {
    const statusNames = {
        'draft': 'Draft',
        'pending_review': 'Pending Review',
        'approved': 'Approved',
        'active': 'Active',
        'paused': 'Paused',
        'rejected': 'Rejected',
        'completed': 'Completed',
        'expired': 'Expired'
    };
    return statusNames[status] || status || 'Unknown';
}

function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function showLoading(show) {
    if ($w('#loadingIndicator').exists) {
        if (show) {
            $w('#loadingIndicator').show();
        } else {
            $w('#loadingIndicator').hide();
        }
    }
}

function showToast(message, type = 'info') {
    try {
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
