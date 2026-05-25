import "dotenv/config";
import fs from "node:fs/promises";

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !guildId) {
  throw new Error("DISCORD_BOT_TOKEN と DISCORD_GUILD_ID を設定してください");
}

const headers = {
  Authorization: `Bot ${token}`,
};

const today = new Date();
today.setHours(0, 0, 0, 0);

async function fetchChannels() {
  const url = `https://discord.com/api/v10/guilds/${guildId}/channels`;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to fetch channels: ${res.status}`);
  }

  return await res.json();
}

async function fetchMessages(channelId) {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.log(`skip channel ${channelId}`);
    return [];
  }

  return await res.json();
}

function isToday(timestamp) {
  return new Date(timestamp) >= today;
}

const channels = await fetchChannels();

const textChannels = channels.filter(
  (c) => c.type === 0, // Guild Text
);

let output = "";

for (const channel of textChannels) {
  console.log(`fetching #${channel.name}`);

  const messages = await fetchMessages(channel.id);

  const todaysMessages = messages
    .filter((m) => !m.author.bot)
    .filter((m) => m.content?.trim())
    .filter((m) => isToday(m.timestamp));

  if (todaysMessages.length === 0) continue;

  output += `# ${channel.name}\n\n`;

  for (const msg of todaysMessages.reverse()) {
    output += `- ${msg.author.username}: ${msg.content}\n`;
  }

  output += "\n\n";
}

await fs.writeFile("logs/today.md", output || "No messages today");

console.log("saved logs/today.md");
