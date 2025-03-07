const axios = require("axios");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

function checkVoiceChannels(client) {
    // Loop through all the guilds the bot is in
    client.guilds.cache.forEach(guild => {
        // Loop through all voice channels in the guild
        guild.channels.cache.filter(channel => channel.isVoiceBased()).forEach(async channel => {
            // Get members in this voice channel
            const membersInChannel = channel.members;
            
            if (membersInChannel.size > 0) {
                console.log(`People in voice channel ${channel.name} in guild ${guild.name}:`);

                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: false, // Set to true if you want the bot to be deafened
                });

                const response = await getAllSoundboardSounds(guild.id);

                // Access the first item from the array inside the "items" property
                const randomIndex = Math.floor(Math.random() * response.items.length);
                const randomSound = response.items[randomIndex];

                // Send the soundboard sound
                try {
                    await sendSoundboardSound(guild.id, channel.id, randomSound.sound_id);
                } catch (error) {
                    console.error(error);
                }
                
                // Wait for 5 seconds before making the bot leave the voice channel
                setTimeout(async () => {
                    const connection = getVoiceConnection(guild.id);
    
                    if (connection) {
                        connection.destroy();
                    }
                }, 5000); // 5000 milliseconds = 5 seconds

            } else {
                console.log(`No one is in voice channel ${channel.name} in guild ${guild.name}`);
            }
        });
    });
}

module.exports = { checkVoiceChannels };

async function sendSoundboardSound(guildId, channelId, soundId) {
    try {
        const response = await axios.post(
            `https://discord.com/api/v10/channels/${channelId}/send-soundboard-sound`,
            {
                sound_id: soundId,
                source_guild_id: guildId
            },
            {
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("Soundboard sound sent successfully:", response.data);
        
    } catch (error) {
        console.error("Error sending soundboard sound:", error.response?.data || error.message);
    }
}

async function getAllSoundboardSounds(guildId) {
    try {
        const response = await axios.get(
            `https://discord.com/api/v10/guilds/${guildId}/soundboard-sounds`,
            {
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("Soundboard sounds sent successfully back:", response.data);
        return response.data
    } catch (error) {
        console.error("Error getting soundboard sounds:", error.response?.data || error.message);
    }
}