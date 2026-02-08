/**
 * ============================================================
 * BANF - Insights & Analytics Dashboard
 * Real-time analytics and KPI tracking for admins
 * ============================================================
 * 
 * Features:
 * - Executive overview dashboard
 * - Real-time KPIs
 * - Trend analysis
 * - Predictive insights
 * - Custom dashboards
 */

import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';

// ============================================================
// CONSTANTS
// ============================================================
const PAGES = {
    HOME: '/',
    INSIGHTS: '/insights',
    REPORTS: '/reports',
    ADMIN: '/admin',
    LOGIN: '/login'
};

const DASHBOARD_TYPES = {
    EXECUTIVE_OVERVIEW: 'executive_overview',
    FINANCIAL_DASHBOARD: 'financial_dashboard',
    MEMBERSHIP_DASHBOARD: 'membership_dashboard',
    EVENT_DASHBOARD: 'event_dashboard',
    ENGAGEMENT_DASHBOARD: 'engagement_dashboard'
};

// ============================================================
// PAGE INITIALIZATION
// ============================================================
$w.onReady(async function () {
    console.log('📈 BANF Insights Page Initializing...');
    
    // Check admin permission
    const isLoggedIn = wixUsers.currentUser.loggedIn;
    if (!isLoggedIn) {
        wixLocation.to(`${PAGES.LOGIN}?redirect=${PAGES.INSIGHTS}`);
        return;
    }
    
    // Check if user has insights permission
    const hasPermission = await checkInsightsPermission();
    if (!hasPermission) {
        showAccessDenied();
        return;
    }
    
    // Initialize dashboard
    await Promise.all([
        setupDashboardNavigation(),
        loadExecutiveOverview(),
        loadAlerts(),
        setupRefreshInterval()
    ]);
    
    console.log('✅ Insights Page Ready!');
});

// ============================================================
// PERMISSION CHECK
// ============================================================
async function checkInsightsPermission() {
    try {
        const { hasSpecializedPermission } = await import('backend/specialized-admin-roles.jsw');
        return await hasSpecializedPermission(wixUsers.currentUser.id, 'insights_view');
    } catch (e) {
        console.log('Permission check error:', e.message);
        return false;
    }
}

function showAccessDenied() {
    if ($w('#sectionInsights').exists) {
        $w('#sectionInsights').hide();
    }
    if ($w('#sectionAccessDenied').exists) {
        $w('#sectionAccessDenied').show();
    }
}

// ============================================================
// DASHBOARD NAVIGATION
// ============================================================
function setupDashboardNavigation() {
    const dashboardTabs = [
        { id: 'tabExecutive', type: DASHBOARD_TYPES.EXECUTIVE_OVERVIEW },
        { id: 'tabFinancial', type: DASHBOARD_TYPES.FINANCIAL_DASHBOARD },
        { id: 'tabMembership', type: DASHBOARD_TYPES.MEMBERSHIP_DASHBOARD },
        { id: 'tabEvents', type: DASHBOARD_TYPES.EVENT_DASHBOARD },
        { id: 'tabEngagement', type: DASHBOARD_TYPES.ENGAGEMENT_DASHBOARD }
    ];
    
    dashboardTabs.forEach(tab => {
        try {
            if ($w(`#${tab.id}`).exists) {
                $w(`#${tab.id}`).onClick(() => {
                    loadDashboard(tab.type);
                    updateActiveTab(tab.id);
                });
            }
        } catch (e) {
            // Tab doesn't exist
        }
    });
    
    // Refresh button
    if ($w('#btnRefreshDashboard').exists) {
        $w('#btnRefreshDashboard').onClick(() => refreshCurrentDashboard());
    }
    
    // Go to Reports
    if ($w('#btnGoToReports').exists) {
        $w('#btnGoToReports').onClick(() => wixLocation.to(PAGES.REPORTS));
    }
    
    return Promise.resolve();
}

function updateActiveTab(activeTabId) {
    const allTabs = ['tabExecutive', 'tabFinancial', 'tabMembership', 'tabEvents', 'tabEngagement'];
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
// LOAD EXECUTIVE OVERVIEW
// ============================================================
async function loadExecutiveOverview() {
    try {
        const { getExecutiveOverview } = await import('backend/insights-analytics.jsw');
        const data = await getExecutiveOverview(wixUsers.currentUser.id);
        
        if (!data.success) {
            showToast(data.error || 'Failed to load dashboard', 'error');
            return;
        }
        
        const overview = data.overview;
        
        // Membership KPIs
        updateKPICard('membershipTotal', overview.membership.totalMembers, 'Total Members');
        updateKPICard('membershipActive', overview.membership.activeMembers, 'Active Members');
        updateKPICard('membershipNew', overview.membership.newThisMonth, 'New This Month');
        updateKPICard('membershipGrowth', `${overview.membership.growthRate}%`, 'Growth Rate', overview.membership.trend);
        
        // Financial KPIs
        updateKPICard('financialIncome', `$${formatNumber(overview.financial.incomeThisMonth)}`, 'Income This Month');
        updateKPICard('financialExpenses', `$${formatNumber(overview.financial.expensesThisMonth)}`, 'Expenses');
        updateKPICard('financialNet', `$${formatNumber(overview.financial.netIncomeThisMonth)}`, 'Net Income', overview.financial.trend);
        
        // Event KPIs
        updateKPICard('eventsUpcoming', overview.events.upcomingEvents, 'Upcoming Events');
        updateKPICard('eventsRegistrations', overview.events.registrationsThisMonth, 'Registrations');
        updateKPICard('eventsRevenue', `$${formatNumber(overview.events.totalRevenue)}`, 'Event Revenue');
        
        // Engagement KPIs
        if (overview.engagement) {
            updateKPICard('engagementActive', overview.engagement.activeUsers || 0, 'Active Users');
            updateKPICard('engagementVolunteers', overview.engagement.volunteerHours || 0, 'Volunteer Hours');
        }
        
        // Update last refresh time
        if ($w('#txtLastRefresh').exists) {
            $w('#txtLastRefresh').text = `Last updated: ${new Date().toLocaleTimeString()}`;
        }
        
    } catch (e) {
        console.log('Load executive overview error:', e.message);
        showToast('Failed to load dashboard. Please refresh.', 'error');
    }
    
    return Promise.resolve();
}

function updateKPICard(cardId, value, label, trend = null) {
    try {
        if ($w(`#kpi_${cardId}_value`).exists) {
            $w(`#kpi_${cardId}_value`).text = String(value);
        }
        if ($w(`#kpi_${cardId}_label`).exists) {
            $w(`#kpi_${cardId}_label`).text = label;
        }
        if (trend && $w(`#kpi_${cardId}_trend`).exists) {
            const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
            const trendColor = trend === 'up' ? '#28a745' : trend === 'down' ? '#dc3545' : '#6c757d';
            $w(`#kpi_${cardId}_trend`).text = trendIcon;
            $w(`#kpi_${cardId}_trend`).style.color = trendColor;
        }
    } catch (e) {
        // Card element doesn't exist
    }
}

// ============================================================
// LOAD SPECIFIC DASHBOARDS
// ============================================================
async function loadDashboard(dashboardType) {
    showLoading(true);
    
    try {
        switch (dashboardType) {
            case DASHBOARD_TYPES.EXECUTIVE_OVERVIEW:
                await loadExecutiveOverview();
                break;
            case DASHBOARD_TYPES.FINANCIAL_DASHBOARD:
                await loadFinancialDashboard();
                break;
            case DASHBOARD_TYPES.MEMBERSHIP_DASHBOARD:
                await loadMembershipDashboard();
                break;
            case DASHBOARD_TYPES.EVENT_DASHBOARD:
                await loadEventDashboard();
                break;
            case DASHBOARD_TYPES.ENGAGEMENT_DASHBOARD:
                await loadEngagementDashboard();
                break;
        }
        
        // Store current dashboard type
        $w('#sectionInsights').customId = dashboardType;
        
    } catch (e) {
        console.log('Load dashboard error:', e.message);
        showToast('Failed to load dashboard', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadFinancialDashboard() {
    try {
        const { getFinancialDashboard } = await import('backend/insights-analytics.jsw');
        const data = await getFinancialDashboard(wixUsers.currentUser.id);
        
        if (data.success) {
            // Update financial-specific KPIs
            // Implementation would depend on Wix page elements
        }
    } catch (e) {
        console.log('Load financial dashboard error:', e.message);
    }
}

async function loadMembershipDashboard() {
    try {
        const { getMembershipDashboard } = await import('backend/insights-analytics.jsw');
        const data = await getMembershipDashboard(wixUsers.currentUser.id);
        
        if (data.success) {
            // Update membership-specific KPIs
        }
    } catch (e) {
        console.log('Load membership dashboard error:', e.message);
    }
}

async function loadEventDashboard() {
    try {
        const { getEventDashboard } = await import('backend/insights-analytics.jsw');
        const data = await getEventDashboard(wixUsers.currentUser.id);
        
        if (data.success) {
            // Update event-specific KPIs
        }
    } catch (e) {
        console.log('Load event dashboard error:', e.message);
    }
}

async function loadEngagementDashboard() {
    try {
        const { getEngagementDashboard } = await import('backend/insights-analytics.jsw');
        const data = await getEngagementDashboard(wixUsers.currentUser.id);
        
        if (data.success) {
            // Update engagement-specific KPIs
        }
    } catch (e) {
        console.log('Load engagement dashboard error:', e.message);
    }
}

// ============================================================
// ALERTS
// ============================================================
async function loadAlerts() {
    try {
        const { getActiveAlerts } = await import('backend/insights-analytics.jsw');
        const alerts = await getActiveAlerts();
        
        if ($w('#repeaterAlerts').exists && alerts && alerts.length > 0) {
            $w('#repeaterAlerts').data = alerts.map((alert, index) => ({
                ...alert,
                _id: alert._id || `alert_${index}`
            }));
            
            $w('#repeaterAlerts').onItemReady(($item, itemData) => {
                if ($item('#txtAlertTitle').exists) {
                    $item('#txtAlertTitle').text = itemData.title || 'Alert';
                }
                if ($item('#txtAlertMessage').exists) {
                    $item('#txtAlertMessage').text = itemData.message || '';
                }
                if ($item('#txtAlertSeverity').exists) {
                    $item('#txtAlertSeverity').text = itemData.severity || 'info';
                    // Set color based on severity
                    const colors = {
                        critical: '#dc3545',
                        warning: '#ffc107',
                        info: '#17a2b8'
                    };
                    $item('#txtAlertSeverity').style.color = colors[itemData.severity] || colors.info;
                }
                if ($item('#btnDismissAlert').exists) {
                    $item('#btnDismissAlert').onClick(() => dismissAlert(itemData._id));
                }
            });
            
            // Show alerts section
            if ($w('#sectionAlerts').exists) {
                $w('#sectionAlerts').show();
            }
        } else {
            // Hide alerts section if no alerts
            if ($w('#sectionAlerts').exists) {
                $w('#sectionAlerts').hide();
            }
        }
    } catch (e) {
        console.log('Load alerts error:', e.message);
    }
}

async function dismissAlert(alertId) {
    try {
        const { dismissAlert } = await import('backend/insights-analytics.jsw');
        await dismissAlert(alertId, wixUsers.currentUser.id);
        await loadAlerts(); // Refresh alerts
    } catch (e) {
        console.log('Dismiss alert error:', e.message);
    }
}

// ============================================================
// AUTO-REFRESH
// ============================================================
let refreshInterval;

function setupRefreshInterval() {
    // Refresh dashboard every 5 minutes
    refreshInterval = setInterval(() => {
        refreshCurrentDashboard();
    }, 5 * 60 * 1000);
    
    // Clean up on page leave
    wixWindow.onMessage((message) => {
        if (message === 'page-leave') {
            clearInterval(refreshInterval);
        }
    });
    
    return Promise.resolve();
}

function refreshCurrentDashboard() {
    const currentDashboard = $w('#sectionInsights')?.customId || DASHBOARD_TYPES.EXECUTIVE_OVERVIEW;
    loadDashboard(currentDashboard);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
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
