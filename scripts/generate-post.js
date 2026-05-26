import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function getLatestLogFile() {
  const files = await fs.readdir("logs");

  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  if (markdownFiles.length === 0) {
    throw new Error("logs に markdown ファイルがありません");
  }

  const filesWithStats = await Promise.all(
    markdownFiles.map(async (file) => {
      const fullPath = path.join("logs", file);
      const stat = await fs.stat(fullPath);

      return {
        file,
        fullPath,
        mtime: stat.mtime,
      };
    }),
  );

  filesWithStats.sort((a, b) => b.mtime - a.mtime);

  return filesWithStats[0];
}

const latestLog = await getLatestLogFile();

console.log(`using log: ${latestLog.file}`);

const input = await fs.readFile(latestLog.fullPath, "utf-8");

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

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
});

const article = response.text;

await fs.mkdir("posts", { recursive: true });

const outputFileName = latestLog.file;
const outputPath = path.join("posts", outputFileName);

await fs.writeFile(outputPath, article);

console.log(`created ${outputPath}`);
