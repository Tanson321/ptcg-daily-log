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

const TIME_ZONE = "Asia/Tokyo";
const DISCORD_TEXT_CHANNEL_TYPE = 0;

// 必要に応じて除外したいチャンネル名をここに追加する
const EXCLUDED_CHANNEL_NAMES = [
  // "雑談",
  // "bot",
];

// 必要に応じて除外したいチャンネルIDをここに追加する
const EXCLUDED_CHANNEL_IDS = [
  "1281205350913277954",
  "1301856426565566519",
  "1333286723106508881",
  "1393106402599506018",
  "1401741428866154496",
];

function getArgValue(name, defaultValue) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : defaultValue;
}

function parseDateValue(value, name) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`--${name} は YYYY-MM-DD 形式で指定してください`);
  }

  const date = new Date(`${value}T00:00:00+09:00`);

  if (Number.isNaN(date.getTime()) || formatDateInTokyo(date) !== value) {
    throw new Error(`--${name} に正しい日付を指定してください`);
  }

  return date;
}

function formatDateInTokyo(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function getTokyoDateParts(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: parts.weekday,
  };
}

function toTokyoStartOfDayUtcDate({ year, month, day }) {
  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  return new Date(`${yyyy}-${mm}-${dd}T00:00:00+09:00`);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function createOutputPath(range, start, end) {
  const startDate = formatDateInTokyo(start);

  if (range === "today" || range === "date") {
    return `logs/${startDate}.md`;
  }

  if (range === "week") {
    return `logs/${startDate}-week.md`;
  }

  if (range === "period") {
    const endDate = formatDateInTokyo(addDays(end, -1));
    return `logs/${startDate}_to_${endDate}.md`;
  }

  return `logs/${startDate}-${range}.md`;
}

function getWeekRange(targetStart) {
  const parts = getTokyoDateParts(targetStart);
  const weekdayIndexMap = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  const daysFromMonday = weekdayIndexMap[parts.weekday] ?? 0;
  const weekStart = addDays(targetStart, -daysFromMonday);
  const weekEnd = addDays(weekStart, 7);

  return { weekStart, weekEnd };
}

function getRange(range, { dateValue, startDateValue, endDateValue }) {
  const now = new Date();
  const todayParts = getTokyoDateParts(now);
  const todayStart = toTokyoStartOfDayUtcDate(todayParts);

  if (range === "today") {
    return {
      range,
      start: todayStart,
      end: addDays(todayStart, 1),
      outputPath: createOutputPath(range, todayStart, addDays(todayStart, 1)),
      title: `今日のDiscordログ (${formatDateInTokyo(todayStart)})`,
    };
  }

  if (range === "date") {
    const targetStart = parseDateValue(dateValue, "date");
    const targetEnd = addDays(targetStart, 1);

    return {
      range,
      start: targetStart,
      end: targetEnd,
      outputPath: createOutputPath(range, targetStart, targetEnd),
      title: `Discordログ (${formatDateInTokyo(targetStart)})`,
    };
  }

  if (range === "week") {
    const targetStart = dateValue ? parseDateValue(dateValue, "date") : todayStart;
    const { weekStart, weekEnd } = getWeekRange(targetStart);

    return {
      range,
      start: weekStart,
      end: weekEnd,
      outputPath: createOutputPath(range, weekStart, weekEnd),
      title: `週次Discordログ (${formatDateInTokyo(weekStart)}〜${formatDateInTokyo(addDays(weekEnd, -1))})`,
    };
  }

  if (range === "period") {
    const periodStart = parseDateValue(startDateValue, "start-date");
    const periodEndInclusive = parseDateValue(endDateValue, "end-date");
    const periodEnd = addDays(periodEndInclusive, 1);

    if (periodEnd <= periodStart) {
      throw new Error("--end-date は --start-date 以降の日付を指定してください");
    }

    return {
      range,
      start: periodStart,
      end: periodEnd,
      outputPath: createOutputPath(range, periodStart, periodEnd),
      title: `Discordログ (${formatDateInTokyo(periodStart)}〜${formatDateInTokyo(periodEndInclusive)})`,
    };
  }

  throw new Error("--range は today, date, week, period のいずれかを指定してください");
}

function isWithinRange(timestamp, start, end) {
  const date = new Date(timestamp);
  return date >= start && date < end;
}

async function fetchChannels() {
  const url = `https://discord.com/api/v10/guilds/${guildId}/channels`;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch channels: ${res.status} ${text}`);
  }

  return await res.json();
}

async function fetchMessages(channelId, start) {
  const allMessages = [];
  let before;

  while (true) {
    const params = new URLSearchParams({ limit: "100" });

    if (before) {
      params.set("before", before);
    }

    const url = `https://discord.com/api/v10/channels/${channelId}/messages?${params.toString()}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      console.log(`skip channel ${channelId}: ${res.status}`);
      return allMessages;
    }

    const messages = await res.json();

    if (messages.length === 0) {
      return allMessages;
    }

    allMessages.push(...messages);

    const oldestMessage = messages[messages.length - 1];
    const oldestDate = new Date(oldestMessage.timestamp);

    if (oldestDate < start) {
      return allMessages;
    }

    before = oldestMessage.id;
  }
}

function formatMessage(message) {
  const author = message.author?.username ?? "unknown";
  const timestamp = new Date(message.timestamp).toISOString();
  const content = message.content.trim();

  return `- [${timestamp}] ${author}: ${content}`;
}

const rangeName = getArgValue("range", "today");
const range = getRange(rangeName, {
  dateValue: getArgValue("date", ""),
  startDateValue: getArgValue("start-date", ""),
  endDateValue: getArgValue("end-date", ""),
});

const channels = await fetchChannels();

const textChannels = channels
  .filter((channel) => channel.type === DISCORD_TEXT_CHANNEL_TYPE)
  .filter((channel) => !EXCLUDED_CHANNEL_NAMES.includes(channel.name))
  .filter((channel) => !EXCLUDED_CHANNEL_IDS.includes(channel.id));

let output = `# ${range.title}\n\n`;
let totalMessageCount = 0;

for (const channel of textChannels) {
  console.log(`fetching #${channel.name}`);

  const messages = await fetchMessages(channel.id, range.start);

  const targetMessages = messages
    .filter((message) => !message.author?.bot)
    .filter((message) => message.content?.trim())
    .filter((message) =>
      isWithinRange(message.timestamp, range.start, range.end),
    )
    .reverse();

  if (targetMessages.length === 0) continue;

  totalMessageCount += targetMessages.length;

  output += `## #${channel.name}\n\n`;
  output += targetMessages.map(formatMessage).join("\n");
  output += "\n\n";
}

await fs.mkdir("logs", { recursive: true });
await fs.writeFile(
  range.outputPath,
  totalMessageCount > 0 ? output : `${output}No messages found.\n`,
);

console.log(`saved ${range.outputPath}`);
console.log(
  `range: ${range.range} ${range.start.toISOString()}〜${range.end.toISOString()}`,
);
console.log(`fetched ${totalMessageCount} messages`);
