# PTCG Daily Log 進捗レポート

作成日: 2026-05-31

## 目的

このプロジェクトは、Discordに蓄積したポケカ考察ログを日次・週次・任意期間で収集し、AIで編集下書きを生成し、CMSで編集して公開するための思考アーカイブ基盤です。

狙いは単なる要約ではなく、「あとから自分で記事を書ける状態」を安定して作ることです。現在は、Discordログ取得、AI下書き生成、CMS編集、画像アップロード、公開、公開サイト表示までの一連の流れが成立しています。

## 現在の構成

### 生成パイプライン

- `scripts/fetch-today.js`
  - Discord guild内のテキストチャンネルからログを取得する。
  - 対応範囲は `today`, `date`, `week`, `period`。
  - JST基準で日付を解釈する。
  - bot投稿、空投稿、除外チャンネルをフィルタする。
  - 出力先は `logs/`。
- `scripts/generate-post.js`
  - `logs/` のMarkdownを読み、Geminiで記事下書きを生成する。
  - `prompts/luka-persona.md`, `prompts/article-style.md`, `prompts/article-structure.md` を組み合わせる。
  - 出力先は `posts/`。
  - `type` は `daily`, `weekly`, `period` に対応。
- `.github/workflows/generate-report.yml`
  - 手動実行で `today`, `date`, `week`, `period` を選択できる。
  - スケジュール実行は毎週日曜23:50 JSTに週次生成。
  - 生成後、`logs` と `posts` をコミットし、Discordへ通知する。

### CMS

- `cms/` は Next.js 16 / React 19 のCMS。
- Basic認証は `cms/middleware.ts` で実装。
- GitHub Contents API経由で `posts/` の下書きを取得・保存する。
- 主な機能:
  - 下書き一覧
  - AI生成起動
  - 手書き記事作成
  - frontmatter編集
  - 本文編集
  - primary imageアップロード
  - 公開処理
- `cms/app/api/generate/route.ts`
  - GitHub Actionsの `generate-report.yml` をdispatchする。
  - 旧workflow入力との互換対策として、`today/week` は必要に応じて `{ range }` のみで再試行する。
- `cms/app/api/publish/route.ts`
  - 下書きを `published/` にコピーする。
  - Vercel BlobへMarkdownを公開する。
  - `published/index.json` を更新する。
  - GitHub Pages用の `publish-pages.yml` も起動する。

### 公開サイト

- `public-site/` はVercel向けの公開Next.jsサイト。
- `public-site/src/lib/posts.ts` がVercel Blob上の `published/index.json` を取得する。
- 機能:
  - 記事一覧
  - 記事詳細
  - 月別アーカイブ
  - タグフィルタ
  - 本文・タグ・summary検索
- `docs/` はGitHub Pages向けの静的出力。
- `scripts/build-site.js` は `published/` から `docs/` を生成する。

## 達成済み

- Discordログから記事下書きを生成する最小パイプラインが成立した。
- persona/style/structureプロンプトにより、記事の温度感をある程度固定できている。
- 今日・週次だけでなく、指定日・指定週・指定期間でログを取得できるようになった。
- CMS上で生成、編集、保存、公開まで操作できる。
- 手書き記事作成に対応した。
- primary imageのアップロードとfrontmatter反映に対応した。
- 公開記事のインデックスをVercel Blobに持たせ、公開サイトから取得できるようになった。
- 静的GitHub Pages出力も残っているため、公開経路が二重化されている。
- Basic認証、GitHub API、Vercel Blob、GitHub Actionsの連携が一通り動く設計になっている。

## 現在の品質評価

### 強い点

- コンテンツ生成の入口から公開までが短い。
- Markdown/frontmatter中心なので、データが読みやすく移行しやすい。
- プロンプトが分離されており、記事スタイルの調整がしやすい。
- 公開済みインデックスがJSON化され、公開サイト側の実装が単純。
- 期間指定生成により、記事の粒度をログの粒度から制御できるようになった。

### 課題

- 自動テストがほぼない。
- 日付範囲計算、frontmatter生成、Markdown parse/serializeの回帰検知が弱い。
- GitHub Contents API保存はSHA競合に弱い。
- CMSのエラー表示が `alert` 中心で、実際の失敗理由がユーザーに見えにくい。
- GitHub Actionsの実行状況をCMS内で追跡できない。
- Discord取得はチャンネルを直列処理しており、規模が大きくなると遅くなる。
- Gemini出力のfrontmatter不備を自動修復する仕組みがない。
- `docs/` 静的公開と `public-site/` Vercel公開の役割整理がまだ曖昧。
- Basic認証のみなので、将来的な共同編集や権限管理には足りない。
- READMEがcreate-next-app初期状態のままで、運用手順がコード外に残っていない。

## 直近の状態

- 作業ツリーは確認時点でクリーン。
- 期間指定対応はコード上に存在する。
- 本番で動かすには、GitHub上のworkflowとVercel上のCMSが同じコミットへ更新されている必要がある。

## 主要コマンド

```bash
npm run fetch:today
npm run fetch:week
npm run fetch:date -- --date=2026-05-28
npm run fetch:period -- --start-date=2026-05-26 --end-date=2026-05-28
npm run generate:today
npm run generate:week
npm run site
```

注意: `package.json` の `fetch:date` と `fetch:period` は引数なしの薄いショートカットです。実運用ではGitHub Actionsまたは `node scripts/fetch-today.js --range=...` を直接使うのが確実です。

## 環境変数

ルート:

- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `GEMINI_API_KEY`

CMS:

- `CMS_PASSWORD`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_TOKEN`
- `BLOB_READ_WRITE_TOKEN`

公開サイト:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_PUBLISHED_INDEX_URL`

## 次の判断ポイント

- 正式な公開面をVercel `public-site` に寄せるか、GitHub Pages `docs/` を残すか。
- 下書きと公開済み記事の正本をGitHub Markdownに置き続けるか、Vercel BlobまたはDBへ寄せるか。
- 記事生成を「単発実行」から「ジョブ状態を持つワークフロー」に進化させるか。
- カード名・デッキ名・環境メタ情報を構造化するか。

