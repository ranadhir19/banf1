/**
 * ============================================================
 * BANF - Reports Page
 * Comprehensive reporting dashboard for admins
 * ============================================================
 * 
 * Features:
 * - Financial reports
 * - Membership reports
 * - Event reports
 * - Engagement reports
 * - Export to PDF/Excel/CSV
 * - Scheduled reports
 */

import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';

// ============================================================
// CONSTANTS
// ============================================================
const PAGES = {
    HOME: '/',
    REPORTS: '/reports',
    ADMIN: '/admin',
    LOGIN: '/login'
};

const REPORT_TYPES = {
    FINANCIAL_SUMMARY: 'financial_summary',
    INCOME_STATEMENT: 'income_statement',
    EXPENSE_REPORT: 'expense_report',
    MEMBERSHIP_GROWTH: 'membership_growth',
    EVENT_ATTENDANCE: 'event_attendance',
    EVENT_REVENUE: 'event_revenue',
    VOLUNTEER_HOURS: 'volunteer_hours',
    SPONSOR_ROI: 'sponsor_roi',
    AD_PERFORMANCE: 'ad_performance'
};

const TIME_PERIODS = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
    CUSTOM: 'custom'
};

// ============================================================
// PAGE INITIALIZATION
// ============================================================
$w.onReady(async function () {
    console.log('📊 BANF Reports Page Initializing...');
    
    // Check admin permission
    const isLoggedIn = wixUsers.currentUser.loggedIn;
    if (!isLoggedIn) {
        wixLocation.to(`${PAGES.LOGIN}?redirect=${PAGES.REPORTS}`);
        return;
    }
    
    // Check if user has report permission
    const hasPermission = await checkReportPermission();
    if (!hasPermission) {
        showAccessDenied();
        return;
    }
    
    // Initialize report dashboard
    await Promise.all([
        setupReportSelection(),
        loadReportHistory(),
        setupScheduledReports(),
        setupExportOptions()
    ]);
    
    console.log('✅ Reports Page Ready!');
});

// ============================================================
// PERMISSION CHECK
// ============================================================
async function checkReportPermission() {
    try {
        const { hasSpecializedPermission } = await import('backend/specialized-admin-roles.jsw');
        return await hasSpecializedPermission(wixUsers.currentUser.id, 'reports_view');
    } catch (e) {
        console.log('Permission check error:', e.message);
        return false;
    }
}

function showAccessDenied() {
    if ($w('#sectionReports').exists) {
        $w('#sectionReports').hide();
    }
    if ($w('#sectionAccessDenied').exists) {
        $w('#sectionAccessDenied').show();
    }
}

// ============================================================
// REPORT SELECTION
// ============================================================
function setupReportSelection() {
    // Report type dropdown
    if ($w('#dropdownReportType').exists) {
        $w('#dropdownReportType').options = [
            { label: 'Financial Summary', value: REPORT_TYPES.FINANCIAL_SUMMARY },
            { label: 'Income Statement', value: REPORT_TYPES.INCOME_STATEMENT },
            { label: 'Expense Report', value: REPORT_TYPES.EXPENSE_REPORT },
            { label: 'Membership Growth', value: REPORT_TYPES.MEMBERSHIP_GROWTH },
            { label: 'Event Attendance', value: REPORT_TYPES.EVENT_ATTENDANCE },
            { label: 'Event Revenue', value: REPORT_TYPES.EVENT_REVENUE },
            { label: 'Volunteer Hours', value: REPORT_TYPES.VOLUNTEER_HOURS },
            { label: 'Sponsor ROI', value: REPORT_TYPES.SPONSOR_ROI },
            { label: 'Ad Performance', value: REPORT_TYPES.AD_PERFORMANCE }
        ];
    }
    
    // Time period dropdown
    if ($w('#dropdownTimePeriod').exists) {
        $w('#dropdownTimePeriod').options = [
            { label: 'Daily', value: TIME_PERIODS.DAILY },
            { label: 'Weekly', value: TIME_PERIODS.WEEKLY },
            { label: 'Monthly', value: TIME_PERIODS.MONTHLY },
            { label: 'Quarterly', value: TIME_PERIODS.QUARTERLY },
            { label: 'Yearly', value: TIME_PERIODS.YEARLY },
            { label: 'Custom Range', value: TIME_PERIODS.CUSTOM }
        ];
        
        $w('#dropdownTimePeriod').onChange(() => {
            const period = $w('#dropdownTimePeriod').value;
            if (period === TIME_PERIODS.CUSTOM) {
                showCustomDateRange();
            } else {
                hideCustomDateRange();
            }
        });
    }
    
    // Generate report button
    if ($w('#btnGenerateReport').exists) {
        $w('#btnGenerateReport').onClick(() => generateReport());
    }
    
    return Promise.resolve();
}

function showCustomDateRange() {
    if ($w('#boxCustomDateRange').exists) {
        $w('#boxCustomDateRange').show();
    }
}

function hideCustomDateRange() {
    if ($w('#boxCustomDateRange').exists) {
        $w('#boxCustomDateRange').hide();
    }
}

// ============================================================
// GENERATE REPORT
// ============================================================
async function generateReport() {
    const reportType = $w('#dropdownReportType')?.value;
    const timePeriod = $w('#dropdownTimePeriod')?.value;
    const startDate = $w('#datePickerStart')?.value;
    const endDate = $w('#datePickerEnd')?.value;
    
    if (!reportType) {
        showToast('Please select a report type', 'error');
        return;
    }
    
    // Show loading
    showLoading(true);
    
    try {
        const { generateReport } = await import('backend/reporting-module.jsw');
        const result = await generateReport(reportType, {
            timePeriod,
            startDate,
            endDate
        }, wixUsers.currentUser.id);
        
        if (result.success) {
            displayReportResults(result);
            showToast('Report generated successfully!', 'success');
        } else {
            showToast(result.error || 'Report generation failed', 'error');
        }
    } catch (e) {
        console.log('Generate report error:', e.message);
        showToast('Failed to generate report. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================================
// DISPLAY REPORT
// ============================================================
function displayReportResults(report) {
    // Update report header
    if ($w('#txtReportTitle').exists) {
        $w('#txtReportTitle').text = formatReportType(report.reportType);
    }
    if ($w('#txtReportDateRange').exists) {
        $w('#txtReportDateRange').text = `${formatDate(report.dateRange.start)} - ${formatDate(report.dateRange.end)}`;
    }
    if ($w('#txtReportGenerated').exists) {
        $w('#txtReportGenerated').text = `Generated: ${formatDateTime(report.generatedAt)}`;
    }
    
    // Display data based on report type
    const data = report.data;
    
    // Summary metrics
    if (data.summary && $w('#repeaterSummaryMetrics').exists) {
        const metrics = Object.entries(data.summary).map(([key, value], index) => ({
            _id: `metric_${index}`,
            label: formatMetricLabel(key),
            value: formatMetricValue(value)
        }));
        
        $w('#repeaterSummaryMetrics').data = metrics;
        $w('#repeaterSummaryMetrics').onItemReady(($item, itemData) => {
            if ($item('#txtMetricLabel').exists) {
                $item('#txtMetricLabel').text = itemData.label;
            }
            if ($item('#txtMetricValue').exists) {
                $item('#txtMetricValue').text = itemData.value;
            }
        });
    }
    
    // Data table
    if (data.rows && $w('#tableReportData').exists) {
        $w('#tableReportData').rows = data.rows;
    }
    
    // Chart data (if visualization enabled)
    if (data.chartData && $w('#chartReport').exists) {
        // Chart visualization would go here
        // Wix uses specific chart components
    }
    
    // Show results section
    if ($w('#sectionReportResults').exists) {
        $w('#sectionReportResults').show();
    }
    
    // Store report ID for export
    $w('#sectionReportResults').customId = report.reportId;
}

// ============================================================
// EXPORT OPTIONS
// ============================================================
function setupExportOptions() {
    // Export to PDF
    if ($w('#btnExportPDF').exists) {
        $w('#btnExportPDF').onClick(() => exportReport('pdf'));
    }
    
    // Export to Excel
    if ($w('#btnExportExcel').exists) {
        $w('#btnExportExcel').onClick(() => exportReport('excel'));
    }
    
    // Export to CSV
    if ($w('#btnExportCSV').exists) {
        $w('#btnExportCSV').onClick(() => exportReport('csv'));
    }
    
    // Print report
    if ($w('#btnPrintReport').exists) {
        $w('#btnPrintReport').onClick(() => wixWindow.print());
    }
    
    return Promise.resolve();
}

async function exportReport(format) {
    const reportId = $w('#sectionReportResults')?.customId;
    
    if (!reportId) {
        showToast('No report to export', 'error');
        return;
    }
    
    try {
        const { exportReport } = await import('backend/reporting-module.jsw');
        const result = await exportReport(reportId, format);
        
        if (result.success && result.downloadUrl) {
            // Trigger download
            wixWindow.openModal(result.downloadUrl, { target: '_blank' });
            showToast(`Report exported to ${format.toUpperCase()}!`, 'success');
        } else {
            showToast(result.error || 'Export failed', 'error');
        }
    } catch (e) {
        showToast('Failed to export report. Please try again.', 'error');
    }
}

// ============================================================
// REPORT HISTORY
// ============================================================
async function loadReportHistory() {
    try {
        const { getReportHistory } = await import('backend/reporting-module.jsw');
        const history = await getReportHistory(wixUsers.currentUser.id, 10);
        
        if ($w('#repeaterReportHistory').exists && history && history.length > 0) {
            $w('#repeaterReportHistory').data = history.map((item, index) => ({
                ...item,
                _id: item._id || `history_${index}`
            }));
            
            $w('#repeaterReportHistory').onItemReady(($item, itemData) => {
                if ($item('#txtHistoryType').exists) {
                    $item('#txtHistoryType').text = formatReportType(itemData.reportType);
                }
                if ($item('#txtHistoryDate').exists) {
                    $item('#txtHistoryDate').text = formatDateTime(itemData.generatedAt);
                }
                if ($item('#txtHistoryPeriod').exists) {
                    $item('#txtHistoryPeriod').text = itemData.timePeriod;
                }
                if ($item('#btnViewHistoryReport').exists) {
                    $item('#btnViewHistoryReport').onClick(() => {
                        displayReportResults({ ...itemData, reportId: itemData._id });
                    });
                }
            });
        }
    } catch (e) {
        console.log('Load report history error:', e.message);
    }
    
    return Promise.resolve();
}

// ============================================================
// SCHEDULED REPORTS
// ============================================================
function setupScheduledReports() {
    if ($w('#btnScheduleReport').exists) {
        $w('#btnScheduleReport').onClick(() => {
            wixWindow.openLightbox('ScheduleReport', {
                reportType: $w('#dropdownReportType')?.value,
                timePeriod: $w('#dropdownTimePeriod')?.value
            });
        });
    }
    
    return Promise.resolve();
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatReportType(type) {
    const typeNames = {
        'financial_summary': 'Financial Summary',
        'income_statement': 'Income Statement',
        'expense_report': 'Expense Report',
        'membership_growth': 'Membership Growth',
        'event_attendance': 'Event Attendance',
        'event_revenue': 'Event Revenue',
        'volunteer_hours': 'Volunteer Hours',
        'sponsor_roi': 'Sponsor ROI',
        'ad_performance': 'Ad Performance'
    };
    return typeNames[type] || type || 'Report';
}

function formatMetricLabel(key) {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .replace(/^\w/, c => c.toUpperCase())
              .trim();
}

function formatMetricValue(value) {
    if (typeof value === 'number') {
        if (value % 1 !== 0) {
            return value.toFixed(2);
        }
        return value.toLocaleString();
    }
    return String(value);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
