const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const fs = require('fs');
//const { path } = require('path');
const calendar = google.calendar('v3');

// Path to your service account credentials JSON file
const SERVICE_ACCOUNT_FILE = path.join(__dirname, '/service-account.json'); //Path to google service-account.json file from google cloud api

const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

async function getUpcomingEvents() {
    const authClient = await auth.getClient();
    const calendarApi = google.calendar({ version: 'v3', auth: authClient });

    const res = await calendarApi.events.list({
        calendarId: 'google_calendar_id', // Replace with your calendar ID
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = res.data.items;
    return events;
}

module.exports = { getUpcomingEvents };
