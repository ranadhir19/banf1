import pathlib,re
missing = {
'ad-management.jsw':['getAdPerformance','getCampaigns','isSponsorOrVendor'],
'admin-auth.jsw':['getAdminDashboard'],
'communication-hub.jsw':['getAnnouncements','sendContactMessage','submitFeedback'],
'community-engagement.jsw':['getActiveInitiatives','getActiveScholarships','getCareerResources','getCharityPrograms'],
'dashboard-service.jsw':['getDashboardStats','getRecentActivity'],
'insights-analytics.jsw':['dismissAlert','getActiveAlerts','getEngagementDashboard','getEventDashboard','getFinancialDashboard','getMembershipDashboard','getQuickInsights'],
'magazine.jsw':['getArticles','getLatestIssue','getMagazineIssue','getMagazineIssues','getRecentArticles'],
'member-auth.jsw':['getCurrentMember','login','register'],
'member-directory-service.jsw':['searchMembers'],
'members.jsw':['getMemberStats'],
'photo-gallery-service.jsw':['getAlbums','getPhotos','getPhotosByEvent'],
'radio-scheduler.jsw':['getRadioSchedule','getRadioShows'],
'radio.jsw':['getCurrentSchedule','getRadioStatus'],
'reporting-module.jsw':['getReportHistory'],
'sponsor-management.jsw':['getActiveSponsors','getSponsorDetails','getSponsorsByTier'],
'streaming-service.jsw':['getCurrentShow','getSchedule','getStreamStatus','getUpcomingShows'],
'volunteer-service.jsw':['applyForVolunteer','getMyVolunteerHistory'],
}
root=pathlib.Path('src/backend')
for mod, syms in missing.items():
    txt=(root/mod).read_text(encoding='utf-8',errors='ignore')
    print(f'\n=== {mod} ===')
    for s in syms:
        exists=bool(re.search(rf'function\s+{re.escape(s)}\b',txt))
        export_exists=bool(re.search(rf'export\s+(?:async\s+)?function\s+{re.escape(s)}\b',txt))
        print(f'{s}: declared={exists} exported={export_exists}')
