import "dotenv/config";

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !guildId) {
  throw new Error("DISCORD_BOT_TOKEN と DISCORD_GUILD_ID を設定してください");
}

const url = `https://discord.com/api/v10/guilds/${guildId}/channels`;

const res = await fetch(url, {
  headers: {
    Authorization: `Bot ${token}`,
  },
});

if (!res.ok) {
  const text = await res.text();
  throw new Error(`Discord API error: ${res.status} ${text}`);
}

const channels = await res.json();

for (const channel of channels) {
  console.log(`${channel.name} (${channel.id}) type=${channel.type}`);
}
