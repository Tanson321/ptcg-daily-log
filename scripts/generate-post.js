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

function getTargetLogPath(range, { dateValue, startDateValue, endDateValue }) {
  const now = new Date();
  const todayParts = getTokyoDateParts(now);
  const todayStart = toTokyoStartOfDayUtcDate(todayParts);

  if (range === "today") {
    return `logs/${formatDateInTokyo(todayStart)}.md`;
  }

  if (range === "date") {
    const targetStart = parseDateValue(dateValue, "date");
    return `logs/${formatDateInTokyo(targetStart)}.md`;
  }

  if (range === "week") {
    const targetStart = dateValue ? parseDateValue(dateValue, "date") : todayStart;
    const { weekStart } = getWeekRange(targetStart);

    return `logs/${formatDateInTokyo(weekStart)}-week.md`;
  }

  if (range === "period") {
    const periodStart = parseDateValue(startDateValue, "start-date");
    const periodEnd = parseDateValue(endDateValue, "end-date");

    if (periodEnd < periodStart) {
      throw new Error("--end-date は --start-date 以降の日付を指定してください");
    }

    return `logs/${formatDateInTokyo(periodStart)}_to_${formatDateInTokyo(periodEnd)}.md`;
  }

  throw new Error("--range は today, date, week, period のいずれかを指定してください");
}

function createPostPath(logPath) {
  const fileName = path.basename(logPath);
  return path.join("posts", fileName);
}

function getPostDateFromLogPath(logPath) {
  const fileName = path.basename(logPath);
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : formatDateInTokyo(new Date());
}

function getPostType(range) {
  if (range === "week") return "weekly";
  if (range === "today" || range === "date") return "daily";
  if (range === "period") return "period";
  return range;
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
const logPath = getTargetLogPath(range, {
  dateValue: getArgValue("date", ""),
  startDateValue: getArgValue("start-date", ""),
  endDateValue: getArgValue("end-date", ""),
});

console.log(`using log: ${logPath}`);

const input = await fs.readFile(logPath, "utf-8");

const postDate = getPostDateFromLogPath(logPath);
const postType = getPostType(range);

const persona = await fs.readFile("prompts/luka-persona.md", "utf-8");
const style = await fs.readFile("prompts/article-style.md", "utf-8");
const structure = await fs.readFile("prompts/article-structure.md", "utf-8");

const prompt = `
${persona}

${style}

${structure}

# 出力メタデータ

出力するMarkdownの先頭には、必ずYAML frontmatterを付けてください。
frontmatterは必ずMarkdownの一番先頭に置き、前に空行や説明文を入れないでください。

必須形式:

---
title: 記事タイトル
date: ${postDate}
type: ${postType}
tags:
  - タグ1
  - タグ2
source: ai
summary: この記事の要約
---

# 記事タイトル

frontmatterのルール:
- title は本文最初の h1 と同じ内容にする
- date は必ず \`${postDate}\` にする
- type は必ず \`${postType}\` にする
- tags は本文中で重要だったカード名、デッキ名、テーマを3〜8個程度入れる
- tags には \`#\` を付けない
- summary は一覧表示用の短い要約にする
- summary は1〜2文程度にする
- frontmatter以外の説明文を出力しない
- source は必ず ai にする
- コードブロックで囲まない

Discordログ:

${input}
`;

const response = await generateWithRetry(prompt);

const article = response.text;

await fs.mkdir("posts", { recursive: true });

const outputPath = createPostPath(logPath);

await fs.writeFile(outputPath, article);

console.log(`created ${outputPath}`);
