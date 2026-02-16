/**
 * BANF Wix HTTP Functions — Self-Contained Version
 * ==================================================
 * All endpoints use wixData directly. NO .jsw imports.
 * 
 * Landing page (docs/index.html) calls these via:
 *   fetchFromAPI()   → /_functions/get_events, get_radio, get_sponsors, get_gallery
 *   apiUrl()         → /_functions/email_*, send_email, contacts*, rsvp_check
 *   zelleApiFetch()  → /_functions/zelle_*
 *   RADIO_ENDPOINTS  → /_functions/radio_schedule, radio_status, radio_start, radio_next, radio_previous
 *   MemberPortal     → /_functions/post_member_login, post_member_signup, post_submit_contact
 *   Direct           → /_functions/getPublicPhotos, getMemberPhotos
 *
 * Accessible at: https://www.jaxbengali.org/_functions/<endpoint>
 */

import { ok, badRequest, serverError, notFound, forbidden } from 'wix-http-functions';
import wixData from 'wix-data';

// ============================================
// UTILITY FUNCTIONS
// ============================================

function jsonResponse(data) {
    return ok({
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        },
        body: JSON.stringify(data)
    });
}

function errorResponse(message, statusCode = 500) {
    const resp = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        },
        body: JSON.stringify({ success: false, error: message })
    };
    if (statusCode === 400) return badRequest(resp);
    if (statusCode === 404) return notFound(resp);
    if (statusCode === 403) return forbidden(resp);
    return serverError(resp);
}

function handleCors() {
    return ok({
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400'
        },
        body: ''
    });
}

async function parseBody(request) {
    try {
        const body = await request.body.text();
        return JSON.parse(body);
    } catch (e) {
        return null;
    }
}

function getQueryParam(request, name) {
    try {
        const url = request.url;
        const parts = url.split('?');
        if (parts.length < 2) return null;
        const params = new URLSearchParams(parts[1]);
        return params.get(name);
    } catch (e) {
        return null;
    }
}


// ╔══════════════════════════════════════════════╗
// ║  1. HEALTH / STATUS                          ║
// ╚══════════════════════════════════════════════╝

export function get_health(request) {
    return jsonResponse({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0-selfcontained',
        endpoints: 'all'
    });
}
export function options_health(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  2. EVENTS                                    ║
// ╚══════════════════════════════════════════════╝

export async function get_events(request) {
    try {
        const now = new Date();
        const results = await wixData.query('Events')
            .ge('date', now)
            .ascending('date')
            .limit(50)
            .find();
        return jsonResponse({
            success: true,
            events: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch events: ' + error.message);
    }
}
export function options_events(request) { return handleCors(); }

export async function get_past_events(request) {
    try {
        const now = new Date();
        const results = await wixData.query('Events')
            .lt('date', now)
            .descending('date')
            .limit(50)
            .find();
        return jsonResponse({
            success: true,
            events: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch past events: ' + error.message);
    }
}
export function options_past_events(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  3. RADIO                                     ║
// ╚══════════════════════════════════════════════╝

export async function get_radio(request) {
    try {
        const results = await wixData.query('RadioStations')
            .limit(10)
            .find();
        const station = results.items.length > 0 ? results.items[0] : null;
        return jsonResponse({
            success: true,
            station: station,
            stations: results.items
        });
    } catch (error) {
        return errorResponse('Failed to fetch radio config: ' + error.message);
    }
}
export function options_radio(request) { return handleCors(); }

export async function get_radio_schedule(request) {
    try {
        const results = await wixData.query('RadioSchedule')
            .ascending('startTime')
            .limit(50)
            .find();
        return jsonResponse({
            success: true,
            schedule: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch radio schedule: ' + error.message);
    }
}
export function options_radio_schedule(request) { return handleCors(); }

export async function get_radio_status(request) {
    try {
        const results = await wixData.query('RadioStations')
            .limit(1)
            .find();
        const station = results.items.length > 0 ? results.items[0] : {};
        return jsonResponse({
            success: true,
            isPlaying: station.isPlaying || false,
            currentTrack: station.currentTrack || null,
            station: station
        });
    } catch (error) {
        return errorResponse('Failed to get radio status: ' + error.message);
    }
}
export function options_radio_status(request) { return handleCors(); }

export async function post_radio_start(request) {
    return jsonResponse({ success: true, message: 'Radio control not available via HTTP' });
}
export function get_radio_start(request) {
    return jsonResponse({ success: true, message: 'Use POST for radio control' });
}
export function options_radio_start(request) { return handleCors(); }

export async function post_radio_next(request) {
    return jsonResponse({ success: true, message: 'Radio control not available via HTTP' });
}
export function get_radio_next(request) {
    return jsonResponse({ success: true, message: 'Use POST for radio control' });
}
export function options_radio_next(request) { return handleCors(); }

export async function post_radio_previous(request) {
    return jsonResponse({ success: true, message: 'Radio control not available via HTTP' });
}
export function get_radio_previous(request) {
    return jsonResponse({ success: true, message: 'Use POST for radio control' });
}
export function options_radio_previous(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  4. SPONSORS                                  ║
// ╚══════════════════════════════════════════════╝

export async function get_sponsors(request) {
    try {
        const results = await wixData.query('Sponsors')
            .eq('active', true)
            .ascending('tier')
            .limit(100)
            .find();
        return jsonResponse({
            success: true,
            sponsors: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch sponsors: ' + error.message);
    }
}
export function options_sponsors(request) { return handleCors(); }

export async function get_sponsor_tiers(request) {
    try {
        const results = await wixData.query('SponsorTiers')
            .ascending('order')
            .limit(20)
            .find();
        return jsonResponse({
            success: true,
            tiers: results.items
        });
    } catch (error) {
        return errorResponse('Failed to fetch sponsor tiers: ' + error.message);
    }
}
export function options_sponsor_tiers(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  5. GALLERY / PHOTOS                          ║
// ╚══════════════════════════════════════════════╝

export async function get_gallery(request) {
    try {
        const results = await wixData.query('PhotoAlbums')
            .eq('isPublic', true)
            .descending('_createdDate')
            .limit(50)
            .find();
        return jsonResponse({
            success: true,
            galleries: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch galleries: ' + error.message);
    }
}
export function options_gallery(request) { return handleCors(); }

export async function get_album_photos(request) {
    try {
        const albumId = getQueryParam(request, 'albumId');
        if (!albumId) return errorResponse('albumId is required', 400);

        const results = await wixData.query('Photos')
            .eq('albumId', albumId)
            .ascending('order')
            .limit(200)
            .find();
        return jsonResponse({
            success: true,
            photos: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch album photos: ' + error.message);
    }
}
export function options_album_photos(request) { return handleCors(); }

export async function get_getPublicPhotos(request) {
    try {
        const results = await wixData.query('Photos')
            .eq('isPublic', true)
            .descending('_createdDate')
            .limit(100)
            .find();
        return jsonResponse({
            success: true,
            photos: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch public photos: ' + error.message);
    }
}
export function options_getPublicPhotos(request) { return handleCors(); }

export async function get_getMemberPhotos(request) {
    try {
        const memberId = getQueryParam(request, 'memberId');
        let query = wixData.query('Photos');
        if (memberId) {
            query = query.eq('uploadedBy', memberId);
        }
        const results = await query
            .descending('_createdDate')
            .limit(100)
            .find();
        return jsonResponse({
            success: true,
            photos: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch member photos: ' + error.message);
    }
}
export function options_getMemberPhotos(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  6. MEMBERS                                   ║
// ╚══════════════════════════════════════════════╝

export async function get_members(request) {
    try {
        const results = await wixData.query('Members')
            .limit(200)
            .find();
        const safeItems = results.items.map(m => ({
            _id: m._id,
            name: m.name || m.firstName,
            firstName: m.firstName,
            lastName: m.lastName,
            memberType: m.memberType,
            status: m.status,
            joinDate: m.joinDate || m._createdDate
        }));
        return jsonResponse({
            success: true,
            members: safeItems,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch members: ' + error.message);
    }
}
export function options_members(request) { return handleCors(); }

export async function post_member_login(request) {
    try {
        const body = await parseBody(request);
        if (!body || !body.email || !body.password) {
            return errorResponse('Email and password are required', 400);
        }

        const results = await wixData.query('Members')
            .eq('email', body.email.toLowerCase().trim())
            .limit(1)
            .find();

        if (results.items.length === 0) {
            return errorResponse('Invalid email or password', 401);
        }

        const member = results.items[0];
        if (member.password !== body.password) {
            return errorResponse('Invalid email or password', 401);
        }

        return jsonResponse({
            success: true,
            member: {
                _id: member._id,
                name: member.name || (member.firstName + ' ' + member.lastName),
                email: member.email,
                memberType: member.memberType,
                isAdmin: member.isAdmin || false
            },
            token: member._id
        });
    } catch (error) {
        return errorResponse('Login failed: ' + error.message);
    }
}
export function options_member_login(request) { return handleCors(); }

export async function post_member_signup(request) {
    try {
        const body = await parseBody(request);
        if (!body || !body.email) {
            return errorResponse('Email is required', 400);
        }

        const existing = await wixData.query('Members')
            .eq('email', body.email.toLowerCase().trim())
            .limit(1)
            .find();

        if (existing.items.length > 0) {
            return errorResponse('Email already registered', 400);
        }

        const newMember = {
            email: body.email.toLowerCase().trim(),
            firstName: body.firstName || '',
            lastName: body.lastName || '',
            name: (body.firstName || '') + ' ' + (body.lastName || ''),
            password: body.password || '',
            phone: body.phone || '',
            memberType: 'standard',
            status: 'active',
            isAdmin: false,
            joinDate: new Date()
        };

        const result = await wixData.insert('Members', newMember);
        return jsonResponse({
            success: true,
            member: {
                _id: result._id,
                name: result.name,
                email: result.email,
                memberType: result.memberType
            },
            message: 'Registration successful'
        });
    } catch (error) {
        return errorResponse('Signup failed: ' + error.message);
    }
}
export function options_member_signup(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  7. SURVEYS                                   ║
// ╚══════════════════════════════════════════════╝

export async function get_surveys(request) {
    try {
        const results = await wixData.query('Surveys')
            .eq('status', 'active')
            .descending('_createdDate')
            .limit(20)
            .find();
        return jsonResponse({
            success: true,
            surveys: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch surveys: ' + error.message);
    }
}
export function options_surveys(request) { return handleCors(); }

export async function get_survey(request) {
    try {
        const id = getQueryParam(request, 'id');
        if (!id) return errorResponse('Survey ID is required', 400);

        const survey = await wixData.get('Surveys', id);
        if (!survey) return errorResponse('Survey not found', 404);

        return jsonResponse({ success: true, survey: survey });
    } catch (error) {
        return errorResponse('Failed to fetch survey: ' + error.message);
    }
}
export function options_survey(request) { return handleCors(); }

export async function post_submit_survey(request) {
    try {
        const body = await parseBody(request);
        if (!body || !body.surveyId) {
            return errorResponse('Survey ID and responses are required', 400);
        }

        const response = {
            surveyId: body.surveyId,
            responses: body.responses || {},
            memberId: body.memberId || 'anonymous',
            submittedAt: new Date()
        };

        const result = await wixData.insert('SurveyResponses', response);
        return jsonResponse({
            success: true,
            message: 'Survey response submitted',
            responseId: result._id
        });
    } catch (error) {
        return errorResponse('Failed to submit survey: ' + error.message);
    }
}
export function options_submit_survey(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  8. COMPLAINTS                                ║
// ╚══════════════════════════════════════════════╝

export async function post_submit_complaint(request) {
    try {
        const body = await parseBody(request);
        if (!body || !body.description) {
            return errorResponse('Description is required', 400);
        }

        const complaint = {
            description: body.description,
            category: body.category || 'general',
            email: body.email || '',
            name: body.name || 'Anonymous',
            status: 'submitted',
            trackingId: 'CMP-' + Date.now().toString(36).toUpperCase(),
            submittedAt: new Date()
        };

        const result = await wixData.insert('Complaints', complaint);
        return jsonResponse({
            success: true,
            message: 'Complaint submitted successfully',
            trackingId: complaint.trackingId,
            id: result._id
        });
    } catch (error) {
        return errorResponse('Failed to submit complaint: ' + error.message);
    }
}
export function options_submit_complaint(request) { return handleCors(); }

export async function get_complaint_status(request) {
    try {
        const trackingId = getQueryParam(request, 'trackingId');
        if (!trackingId) return errorResponse('Tracking ID is required', 400);

        const results = await wixData.query('Complaints')
            .eq('trackingId', trackingId)
            .limit(1)
            .find();

        if (results.items.length === 0) {
            return errorResponse('Complaint not found', 404);
        }

        const complaint = results.items[0];
        return jsonResponse({
            success: true,
            status: complaint.status,
            trackingId: complaint.trackingId,
            submittedAt: complaint.submittedAt,
            lastUpdated: complaint._updatedDate
        });
    } catch (error) {
        return errorResponse('Failed to check complaint status: ' + error.message);
    }
}
export function options_complaint_status(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  9. CONTACT FORM                              ║
// ╚══════════════════════════════════════════════╝

export async function post_submit_contact(request) {
    try {
        const body = await parseBody(request);
        if (!body || !body.name || !body.message) {
            return errorResponse('Name and message are required', 400);
        }

        const submission = {
            name: body.name,
            email: body.email || '',
            phone: body.phone || '',
            subject: body.subject || 'Contact Form',
            message: body.message,
            status: 'new',
            submittedAt: new Date()
        };

        const result = await wixData.insert('ContactSubmissions', submission);
        return jsonResponse({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            id: result._id
        });
    } catch (error) {
        return errorResponse('Failed to submit contact form: ' + error.message);
    }
}
export function options_submit_contact(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  10. EMAIL / GMAIL (Stub Endpoints)           ║
// ║      Need Gmail API credentials to work.      ║
// ║      Return safe stubs so UI doesn't crash.   ║
// ╚══════════════════════════════════════════════╝

function emailNotConfigured() {
    return jsonResponse({
        success: false,
        configured: false,
        error: 'Email service not configured. Gmail API credentials required.',
        status: 'disconnected'
    });
}

export function get_email_status(request) { return emailNotConfigured(); }
export function options_email_status(request) { return handleCors(); }

export function get_email_unread(request) {
    return jsonResponse({ success: true, count: 0, configured: false });
}
export function options_email_unread(request) { return handleCors(); }

export function get_email_inbox(request) {
    return jsonResponse({ success: true, emails: [], total: 0, configured: false });
}
export function options_email_inbox(request) { return handleCors(); }

export function get_email_message(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_email_message(request) { return handleCors(); }

export function post_email_mark_read(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_email_mark_read(request) { return handleCors(); }

export function post_email_delete(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_email_delete(request) { return handleCors(); }

export function post_send_email(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_send_email(request) { return handleCors(); }

export function post_send_evite(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_send_evite(request) { return handleCors(); }

export function get_email_search(request) {
    return jsonResponse({ success: true, emails: [], total: 0, configured: false });
}
export function options_email_search(request) { return handleCors(); }

export function get_contacts(request) {
    return jsonResponse({ success: true, contacts: [], total: 0, configured: false });
}
export function options_contacts(request) { return handleCors(); }

export function post_contact_group_create(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_contact_group_create(request) { return handleCors(); }

export function post_contact_group_add(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_contact_group_add(request) { return handleCors(); }

export function post_contact_group_remove(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_contact_group_remove(request) { return handleCors(); }

export function post_contact_group_delete(request) {
    return errorResponse('Email service not configured', 503);
}
export function options_contact_group_delete(request) { return handleCors(); }

export function get_rsvp_check(request) {
    return jsonResponse({ success: true, rsvp: null, found: false, configured: false });
}
export function options_rsvp_check(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  11. ZELLE (Stub Endpoints)                   ║
// ║      Need Zelle/bank API integration.          ║
// ║      Return safe stubs so UI doesn't crash.   ║
// ╚══════════════════════════════════════════════╝

function zelleNotConfigured() {
    return jsonResponse({
        success: false,
        configured: false,
        error: 'Zelle integration not configured'
    });
}

export function get_zelle_stats(request) {
    return jsonResponse({
        success: true,
        configured: false,
        stats: { total: 0, matched: 0, unmatched: 0, pending: 0 }
    });
}
export function options_zelle_stats(request) { return handleCors(); }

export function get_zelle_payments(request) {
    return jsonResponse({ success: true, configured: false, payments: [], total: 0 });
}
export function options_zelle_payments(request) { return handleCors(); }

export function post_zelle_scan(request) { return zelleNotConfigured(); }
export function options_zelle_scan(request) { return handleCors(); }

export function get_zelle_poller(request) {
    return jsonResponse({ success: true, configured: false, newPayments: 0 });
}
export function options_zelle_poller(request) { return handleCors(); }

export function post_zelle_verify(request) { return zelleNotConfigured(); }
export function options_zelle_verify(request) { return handleCors(); }

export function post_zelle_reject(request) { return zelleNotConfigured(); }
export function options_zelle_reject(request) { return handleCors(); }

export function get_zelle_members(request) {
    return jsonResponse({ success: true, configured: false, members: [] });
}
export function options_zelle_members(request) { return handleCors(); }

export function post_zelle_match(request) { return zelleNotConfigured(); }
export function options_zelle_match(request) { return handleCors(); }

export function post_zelle_seed(request) { return zelleNotConfigured(); }
export function options_zelle_seed(request) { return handleCors(); }

export function get_zelle_history(request) {
    return jsonResponse({ success: true, configured: false, history: [], total: 0 });
}
export function options_zelle_history(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  12. DOCUMENTS / MEETING MINUTES              ║
// ╚══════════════════════════════════════════════╝

export async function get_documents(request) {
    try {
        const category = getQueryParam(request, 'category');
        let query = wixData.query('Documents')
            .eq('isPublic', true)
            .descending('_createdDate');

        if (category) {
            query = query.eq('category', category);
        }

        const results = await query.limit(100).find();
        return jsonResponse({
            success: true,
            documents: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch documents: ' + error.message);
    }
}
export function options_documents(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  13. MAGAZINE                                 ║
// ╚══════════════════════════════════════════════╝

export async function get_magazines(request) {
    try {
        const results = await wixData.query('Magazines')
            .eq('status', 'published')
            .descending('publishDate')
            .limit(20)
            .find();
        return jsonResponse({
            success: true,
            magazines: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch magazines: ' + error.message);
    }
}
export function options_magazines(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  14. GUIDE                                    ║
// ╚══════════════════════════════════════════════╝

export async function get_guide(request) {
    try {
        const category = getQueryParam(request, 'category');
        let query = wixData.query('GuideListings')
            .eq('status', 'active');

        if (category) {
            query = query.eq('category', category);
        }

        const results = await query
            .ascending('name')
            .limit(100)
            .find();
        return jsonResponse({
            success: true,
            listings: results.items,
            total: results.totalCount
        });
    } catch (error) {
        return errorResponse('Failed to fetch guide: ' + error.message);
    }
}
export function options_guide(request) { return handleCors(); }


// ╔══════════════════════════════════════════════╗
// ║  15. SETUP / ADMIN                            ║
// ╚══════════════════════════════════════════════╝

export async function get_setup_collections(request) {
    try {
        const expectedCollections = [
            'Events', 'Members', 'RadioStations', 'RadioSchedule',
            'Sponsors', 'SponsorTiers', 'PhotoAlbums', 'Photos',
            'Surveys', 'SurveyResponses', 'Complaints', 'ContactSubmissions',
            'Documents', 'Magazines', 'GuideListings'
        ];
        return jsonResponse({
            success: true,
            expectedCollections: expectedCollections,
            message: 'Create these collections in your Wix database if they do not exist'
        });
    } catch (error) {
        return errorResponse('Setup error: ' + error.message);
    }
}
export function options_setup_collections(request) { return handleCors(); }
