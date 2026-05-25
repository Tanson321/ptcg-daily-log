import "dotenv/config";
import fs from "node:fs/promises";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const input = await fs.readFile("logs/today.md", "utf-8");
const today = new Date().toISOString().slice(0, 10);

const prompt = `
あなたはポケモンカードの考察ログを整理する編集者です。
以下のDiscordログをもとに、研究アーカイブとして読み返しやすいMarkdown記事を作成してください。

方針:
- 雑談は省く
- 有用な考察・仮説・検証事項を抽出する
- 断定しすぎず、ログから言える範囲で書く
- ポケカプレイヤーが後から読んで役立つ形にする
- 不明点や未検証事項は「今後の検証」に分ける

記事構成:
# タイトル
## 今日の要約
## 重要な考察
## 新しい仮説
## デッキ・カードごとのメモ
## 今後の検証
## 元ログからの抜粋

Discordログ:
${input}
`;

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
});

const article = response.text;

await fs.mkdir("posts", { recursive: true });
await fs.writeFile(`posts/${today}.md`, article);

console.log(`created posts/${today}.md`);
