const { Client, GatewayIntentBits } = require('discord.js');
const { getUpcomingEvents } = require('./google_calendar');

// Your Discord bot token
const DISCORD_TOKEN = '<DISCORD_TOKEN>';
const CHANNEL_ID = '<CHANNEL_ID>';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

let knownEventIds = new Set(); // Store IDs of already seen events

client.once('ready', async () => {
    console.log('Bot is ready!');

    setInterval(async () => {
        const events = await getUpcomingEvents();

        if (events.length) {
            for (const event of events) {
                const eventId = event.id;
                const eventStart = new Date(event.start.dateTime || event.start.date);
                const now = new Date();

                // Check if the event is new
                if (!knownEventIds.has(eventId)) {
                    knownEventIds.add(eventId); // Mark event as seen
                    console.log(`New event added: ${event.summary} on ${eventStart}`);

                    const channel = await client.channels.fetch(CHANNEL_ID);
                    channel.send(`@everyone A new event has been added: **${event.summary}** on **${eventStart.toLocaleString()}**.`);
                }

                // Check if the event is happening soon (within the next 10 minutes)
                if ((eventStart - now) <= 10 * 60 * 1000) {
                    const channel = await client.channels.fetch(CHANNEL_ID);
                    console.log(`Event Alert: **${event.summary}** is starting at **${eventStart.toLocaleTimeString()}**.`);
                    channel.send(`@everyone Event Alert: **${event.summary}** is starting at **${eventStart.toLocaleTimeString()}**.`);
                }
            }
        } else {
            console.log('No upcoming events.');
        }
    }, 5000);
});

client.login(DISCORD_TOKEN);
