const { Client, GatewayIntentBits } = require('discord.js');
const { getUpcomingEvents } = require('./google_calendar');
const { checkVoiceChannels } = require('./bot_raid');
const dotenv = require('dotenv');

dotenv.config();

const CHANNEL_ID = '<CHANNEL_ID>';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

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

    }, 5000); // Send message every 5 seconds (5000 ms)
    
    scheduleNextCheck();
});

function scheduleNextCheck() {
    const randomTime = Math.floor(Math.random() * (25200000 - 600000) + 600000); // Random time between 10 min and 7 hours
    setTimeout(() => {
        checkVoiceChannels(client);
        scheduleNextCheck(); // Schedule the next run
    }, randomTime);
}

client.login(process.env.DISCORD_TOKEN);
