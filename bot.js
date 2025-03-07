const { Client, GatewayIntentBits } = require('discord.js');
const { getUpcomingEvents } = require('./google_calendar');
const { checkVoiceChannels } = require('./bot_raid');
const dotenv = require('dotenv');

dotenv.config();

// Your Discord bot token
const CHANNEL_ID = 'channel_id'; // Replace with the ID of the channel where you want to send the message

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', async () => {
    console.log('Bot is ready!');

    // Send messages every 5 seconds
    setInterval(async () => {
        const events = await getUpcomingEvents();

        if (events.length) {
            // Check if there's an event happening soon
            for (const event of events) {
                const eventStart = new Date(event.start.dateTime || event.start.date);
                const now = new Date();

                // If the event is happening soon (within the next 10 minutes)
                if ((eventStart - now) <= 10 * 24 * 60 * 60 * 1000) { // 10 minutes in milliseconds
                    const channel = await client.channels.fetch(CHANNEL_ID); // Fetch the channel where you want to send the message

                    // Construct the message
                    const eventTitle = event.summary;
                    const eventStartTime = eventStart.toLocaleTimeString();
                    const eventLocation = event.location || 'No location';

                    console.log(`Event Alert: **${eventTitle}** is starting at **${eventStartTime}** at **${eventLocation}**.`);
                    // Send the message to the channel and tag everyone
                    channel.send(`@everyone Event Alert: **${eventTitle}** is starting at **${eventStartTime}** at **${eventLocation}**.`);
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
