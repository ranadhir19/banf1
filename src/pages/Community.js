/**
 * ============================================================
 * BANF - Community Engagement Page
 * Charity, Career Guidance, Scholarships, and Initiatives
 * ============================================================
 * 
 * Features:
 * - Active community initiatives
 * - Charity programs
 * - Career guidance resources
 * - Scholarship opportunities
 * - Volunteer registration
 * - Donation tracking
 */

import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';

// ============================================================
// CONSTANTS
// ============================================================
const PAGES = {
    HOME: '/',
    COMMUNITY: '/community',
    DONATE: '/donate',
    CAREERS: '/careers',
    SCHOLARSHIPS: '/scholarships',
    CHARITY: '/charity',
    VOLUNTEER: '/volunteer',
    LOGIN: '/login'
};

const INITIATIVE_TYPES = {
    CHARITY: 'charity',
    CAREER_GUIDANCE: 'career_guidance',
    EDUCATION: 'education',
    HEALTH_WELLNESS: 'health_wellness',
    SCHOLARSHIP: 'scholarship',
    YOUTH_PROGRAM: 'youth_program',
    SENIOR_SUPPORT: 'senior_support'
};

// ============================================================
// PAGE INITIALIZATION
// ============================================================
$w.onReady(async function () {
    console.log('🤝 BANF Community Page Initializing...');
    
    // Check for URL parameters
    const urlParams = wixLocation.query;
    const initiativeId = urlParams.id;
    const type = urlParams.type;
    
    // Initialize all sections
    await Promise.all([
        setupNavigation(),
        loadActiveInitiatives(type),
        loadCharityPrograms(),
        loadCareerResources(),
        loadScholarships(),
        setupDonationForm(),
        setupVolunteerForm()
    ]);
    
    // If specific initiative ID provided, show detail view
    if (initiativeId) {
        await showInitiativeDetail(initiativeId);
    }
    
    console.log('✅ Community Page Ready!');
});

// ============================================================
// NAVIGATION
// ============================================================
function setupNavigation() {
    // Tab navigation
    const tabs = [
        { id: 'tabAllInitiatives', type: null },
        { id: 'tabCharity', type: INITIATIVE_TYPES.CHARITY },
        { id: 'tabCareers', type: INITIATIVE_TYPES.CAREER_GUIDANCE },
        { id: 'tabScholarships', type: INITIATIVE_TYPES.SCHOLARSHIP },
        { id: 'tabYouth', type: INITIATIVE_TYPES.YOUTH_PROGRAM }
    ];
    
    tabs.forEach(tab => {
        try {
            if ($w(`#${tab.id}`).exists) {
                $w(`#${tab.id}`).onClick(() => {
                    filterInitiatives(tab.type);
                    updateActiveTab(tab.id);
                });
            }
        } catch (e) {
            // Tab doesn't exist
        }
    });
    
    return Promise.resolve();
}

function updateActiveTab(activeTabId) {
    const allTabs = ['tabAllInitiatives', 'tabCharity', 'tabCareers', 'tabScholarships', 'tabYouth'];
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
// LOAD INITIATIVES
// ============================================================
async function loadActiveInitiatives(filterType = null) {
    try {
        const { getActiveInitiatives, INITIATIVE_TYPES } = await import('backend/community-engagement.jsw');
        let initiatives = await getActiveInitiatives(20);
        
        // Apply filter if specified
        if (filterType) {
            initiatives = initiatives.filter(i => i.initiativeType === filterType);
        }
        
        if ($w('#repeaterInitiatives').exists && initiatives && initiatives.length > 0) {
            $w('#repeaterInitiatives').data = initiatives.map((item, index) => ({
                ...item,
                _id: item._id || `initiative_${index}`
            }));
            
            $w('#repeaterInitiatives').onItemReady(($item, itemData) => {
                // Initiative card content
                if ($item('#txtInitiativeTitle').exists) {
                    $item('#txtInitiativeTitle').text = itemData.title || 'Community Initiative';
                }
                if ($item('#txtInitiativeDesc').exists) {
                    const desc = itemData.description ? itemData.description.substring(0, 150) + '...' : '';
                    $item('#txtInitiativeDesc').text = desc;
                }
                if ($item('#txtInitiativeType').exists) {
                    $item('#txtInitiativeType').text = formatInitiativeType(itemData.initiativeType);
                }
                if ($item('#imgInitiative').exists && itemData.imageUrl) {
                    $item('#imgInitiative').src = itemData.imageUrl;
                }
                
                // Progress bar
                if ($item('#progressBar').exists && itemData.goalAmount > 0) {
                    const progress = Math.round((itemData.currentAmount / itemData.goalAmount) * 100);
                    $item('#progressBar').value = progress;
                }
                if ($item('#txtProgress').exists) {
                    const current = itemData.currentAmount || 0;
                    const goal = itemData.goalAmount || 0;
                    $item('#txtProgress').text = `$${current.toLocaleString()} of $${goal.toLocaleString()}`;
                }
                
                // Participants count
                if ($item('#txtParticipants').exists) {
                    $item('#txtParticipants').text = `${itemData.currentParticipants || 0} participants`;
                }
                
                // Action buttons
                if ($item('#btnViewDetails').exists) {
                    $item('#btnViewDetails').onClick(() => showInitiativeDetail(itemData._id));
                }
                if ($item('#btnDonate').exists) {
                    $item('#btnDonate').onClick(() => {
                        wixLocation.to(`${PAGES.DONATE}?initiative=${itemData._id}`);
                    });
                }
                if ($item('#btnVolunteer').exists) {
                    $item('#btnVolunteer').onClick(() => {
                        registerAsVolunteer(itemData._id);
                    });
                }
            });
            
            // Hide no initiatives message
            if ($w('#txtNoInitiatives').exists) {
                $w('#txtNoInitiatives').hide();
            }
        } else {
            // Show no initiatives message
            if ($w('#txtNoInitiatives').exists) {
                $w('#txtNoInitiatives').show();
            }
        }
        
    } catch (e) {
        console.log('Load initiatives error:', e.message);
    }
    
    return Promise.resolve();
}

function filterInitiatives(type) {
    loadActiveInitiatives(type);
}

// ============================================================
// INITIATIVE DETAIL
// ============================================================
async function showInitiativeDetail(initiativeId) {
    try {
        const { getInitiativeDetails } = await import('backend/community-engagement.jsw');
        const initiative = await getInitiativeDetails(initiativeId);
        
        if (initiative) {
            // Show detail lightbox
            wixWindow.openLightbox('InitiativeDetail', { initiative });
        }
    } catch (e) {
        console.log('Show initiative detail error:', e.message);
    }
}

// ============================================================
// CHARITY PROGRAMS
// ============================================================
async function loadCharityPrograms() {
    try {
        const { getCharityPrograms } = await import('backend/community-engagement.jsw');
        const programs = await getCharityPrograms(6);
        
        if ($w('#repeaterCharity').exists && programs && programs.length > 0) {
            $w('#repeaterCharity').data = programs.map((item, index) => ({
                ...item,
                _id: item._id || `charity_${index}`
            }));
            
            $w('#repeaterCharity').onItemReady(($item, itemData) => {
                if ($item('#txtCharityName').exists) {
                    $item('#txtCharityName').text = itemData.name || 'Charity Program';
                }
                if ($item('#txtCharityDesc').exists) {
                    $item('#txtCharityDesc').text = itemData.description || '';
                }
                if ($item('#imgCharity').exists && itemData.imageUrl) {
                    $item('#imgCharity').src = itemData.imageUrl;
                }
                if ($item('#btnDonateCharity').exists) {
                    $item('#btnDonateCharity').onClick(() => {
                        wixLocation.to(`${PAGES.DONATE}?charity=${itemData._id}`);
                    });
                }
            });
        }
    } catch (e) {
        console.log('Load charity programs error:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// CAREER RESOURCES
// ============================================================
async function loadCareerResources() {
    try {
        const { getCareerResources } = await import('backend/community-engagement.jsw');
        const resources = await getCareerResources(8);
        
        if ($w('#repeaterCareers').exists && resources && resources.length > 0) {
            $w('#repeaterCareers').data = resources.map((item, index) => ({
                ...item,
                _id: item._id || `career_${index}`
            }));
            
            $w('#repeaterCareers').onItemReady(($item, itemData) => {
                if ($item('#txtCareerTitle').exists) {
                    $item('#txtCareerTitle').text = itemData.title || 'Career Resource';
                }
                if ($item('#txtCareerCategory').exists) {
                    $item('#txtCareerCategory').text = itemData.category || 'General';
                }
                if ($item('#btnViewCareer').exists) {
                    $item('#btnViewCareer').onClick(() => {
                        if (itemData.url) {
                            wixWindow.openModal(itemData.url, { target: '_blank' });
                        }
                    });
                }
            });
        }
    } catch (e) {
        console.log('Load career resources error:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// SCHOLARSHIPS
// ============================================================
async function loadScholarships() {
    try {
        const { getActiveScholarships } = await import('backend/community-engagement.jsw');
        const scholarships = await getActiveScholarships();
        
        if ($w('#repeaterScholarships').exists && scholarships && scholarships.length > 0) {
            $w('#repeaterScholarships').data = scholarships.map((item, index) => ({
                ...item,
                _id: item._id || `scholarship_${index}`
            }));
            
            $w('#repeaterScholarships').onItemReady(($item, itemData) => {
                if ($item('#txtScholarshipName').exists) {
                    $item('#txtScholarshipName').text = itemData.name || 'Scholarship';
                }
                if ($item('#txtScholarshipAmount').exists) {
                    $item('#txtScholarshipAmount').text = `$${itemData.amount || 0}`;
                }
                if ($item('#txtScholarshipDeadline').exists) {
                    $item('#txtScholarshipDeadline').text = `Deadline: ${formatDate(itemData.deadline)}`;
                }
                if ($item('#txtScholarshipEligibility').exists) {
                    $item('#txtScholarshipEligibility').text = itemData.eligibility || '';
                }
                if ($item('#btnApplyScholarship').exists) {
                    $item('#btnApplyScholarship').onClick(() => {
                        wixWindow.openLightbox('ScholarshipApplication', { scholarship: itemData });
                    });
                }
            });
        }
    } catch (e) {
        console.log('Load scholarships error:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// DONATION FORM
// ============================================================
function setupDonationForm() {
    if ($w('#btnSubmitDonation').exists) {
        $w('#btnSubmitDonation').onClick(async () => {
            // Check login
            if (!wixUsers.currentUser.loggedIn) {
                wixLocation.to(`${PAGES.LOGIN}?redirect=${PAGES.COMMUNITY}`);
                return;
            }
            
            const amount = $w('#inputDonationAmount')?.value;
            const initiativeId = $w('#dropdownInitiative')?.value;
            const message = $w('#inputDonationMessage')?.value || '';
            
            if (!amount || amount <= 0) {
                showToast('Please enter a valid donation amount', 'error');
                return;
            }
            
            try {
                const { recordDonation } = await import('backend/community-engagement.jsw');
                const result = await recordDonation({
                    amount: parseFloat(amount),
                    initiativeId,
                    message,
                    type: 'monetary'
                }, wixUsers.currentUser.id);
                
                if (result.success) {
                    showToast('Thank you for your generous donation!', 'success');
                    // Reset form
                    $w('#inputDonationAmount').value = '';
                    $w('#inputDonationMessage').value = '';
                } else {
                    showToast(result.error || 'Donation failed', 'error');
                }
            } catch (e) {
                showToast('Failed to process donation. Please try again.', 'error');
            }
        });
    }
    
    return Promise.resolve();
}

// ============================================================
// VOLUNTEER REGISTRATION
// ============================================================
function setupVolunteerForm() {
    if ($w('#btnSubmitVolunteer').exists) {
        $w('#btnSubmitVolunteer').onClick(async () => {
            if (!wixUsers.currentUser.loggedIn) {
                wixLocation.to(`${PAGES.LOGIN}?redirect=${PAGES.COMMUNITY}`);
                return;
            }
            
            const initiativeId = $w('#dropdownVolunteerInitiative')?.value;
            const skills = $w('#inputVolunteerSkills')?.value || '';
            const availability = $w('#dropdownAvailability')?.value || 'flexible';
            
            if (!initiativeId) {
                showToast('Please select an initiative to volunteer for', 'error');
                return;
            }
            
            try {
                const { registerVolunteer } = await import('backend/community-engagement.jsw');
                const result = await registerVolunteer(initiativeId, {
                    skills,
                    availability,
                    name: wixUsers.currentUser.nickname
                }, wixUsers.currentUser.id);
                
                if (result.success) {
                    showToast('Thank you for volunteering! We will contact you soon.', 'success');
                } else {
                    showToast(result.error || 'Registration failed', 'error');
                }
            } catch (e) {
                showToast('Failed to register. Please try again.', 'error');
            }
        });
    }
    
    return Promise.resolve();
}

async function registerAsVolunteer(initiativeId) {
    if (!wixUsers.currentUser.loggedIn) {
        wixLocation.to(`${PAGES.LOGIN}?redirect=${PAGES.COMMUNITY}`);
        return;
    }
    
    // Open volunteer registration lightbox
    wixWindow.openLightbox('VolunteerRegistration', { initiativeId });
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatInitiativeType(type) {
    const typeNames = {
        'charity': 'Charity',
        'career_guidance': 'Career Guidance',
        'education': 'Education',
        'health_wellness': 'Health & Wellness',
        'scholarship': 'Scholarship',
        'youth_program': 'Youth Program',
        'senior_support': 'Senior Support',
        'community_service': 'Community Service'
    };
    return typeNames[type] || type || 'Community';
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
