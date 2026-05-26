import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const TIME_ZONE = "Asia/Tokyo";

function getArgValue(name, defaultValue) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : defaultValue;
}

function formatDateInTokyo(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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

function getTargetLogPath(range) {
  const now = new Date();
  const todayParts = getTokyoDateParts(now);
  const todayStart = toTokyoStartOfDayUtcDate(todayParts);

  if (range === "today") {
    return `logs/${formatDateInTokyo(todayStart)}.md`;
  }

  if (range === "week") {
    const weekdayIndexMap = {
      Mon: 0,
      Tue: 1,
      Wed: 2,
      Thu: 3,
      Fri: 4,
      Sat: 5,
      Sun: 6,
    };

    const daysFromMonday = weekdayIndexMap[todayParts.weekday] ?? 0;
    const weekStart = addDays(todayStart, -daysFromMonday);

    return `logs/${formatDateInTokyo(weekStart)}-week.md`;
  }

  throw new Error("--range は today または week を指定してください");
}

function createPostPath(logPath) {
  const fileName = path.basename(logPath);
  return path.join("posts", fileName);
}

async function generateWithRetry(prompt, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    } catch (error) {
      lastError = error;

      const status = error?.status;
      const message = error?.message ?? "";

      const retryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes("UNAVAILABLE") ||
        message.includes("high demand");

      if (!retryable || attempt === maxRetries) {
        throw error;
      }

      const waitMs = attempt * 15000;

      console.log(
        `Gemini API retry ${attempt}/${maxRetries} after ${waitMs / 1000}s`,
      );

      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

const range = getArgValue("range", "today");
const logPath = getTargetLogPath(range);

console.log(`using log: ${logPath}`);

const input = await fs.readFile(logPath, "utf-8");

const persona = await fs.readFile("prompts/luka-persona.md", "utf-8");
const style = await fs.readFile("prompts/article-style.md", "utf-8");
const structure = await fs.readFile("prompts/article-structure.md", "utf-8");

const prompt = `
${persona}

${style}

${structure}

Discordログ:

${input}
`;

const response = await generateWithRetry(prompt);

const article = response.text;

await fs.mkdir("posts", { recursive: true });

const outputPath = createPostPath(logPath);

await fs.writeFile(outputPath, article);

console.log(`created ${outputPath}`);
