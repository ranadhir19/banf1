// HTTP Functions for Backend Services
// Auto-generated for DEV site testing
// Add this to your http-functions.js file in Wix

import { ok, badRequest, serverError } from 'wix-http-functions';

// Import backend services
import * as members from 'backend/members.jsw';
import * as events from 'backend/events.jsw';
import * as radio from 'backend/radio.jsw';
import * as sponsors from 'backend/sponsor-management.jsw';
import * as gallery from 'backend/photo-gallery-service.jsw';

// Members Endpoints
export function get_members(request) {
    return members.getMemberCount()
        .then(count => ok({ body: JSON.stringify({ count }) }))
        .catch(err => serverError({ body: JSON.stringify({ error: err.message }) }));
}

// Events Endpoints
export function get_events(request) {
    return events.getUpcomingEvents()
        .then(data => ok({ body: JSON.stringify(data) }))
        .catch(err => serverError({ body: JSON.stringify({ error: err.message }) }));
}

// Radio Endpoints
export function get_radio(request) {
    return radio.getNowPlaying()
        .then(data => ok({ body: JSON.stringify(data) }))
        .catch(err => serverError({ body: JSON.stringify({ error: err.message }) }));
}

// Sponsors Endpoints
export function get_sponsors(request) {
    return sponsors.getSponsors()
        .then(data => ok({ body: JSON.stringify(data) }))
        .catch(err => serverError({ body: JSON.stringify({ error: err.message }) }));
}

// Gallery Endpoints
export function get_gallery(request) {
    return gallery.getGalleries()
        .then(data => ok({ body: JSON.stringify(data) }))
        .catch(err => serverError({ body: JSON.stringify({ error: err.message }) }));
}

// Health Check
export function get_health(request) {
    return ok({ body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }) });
}
