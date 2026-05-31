export function postSourceLabel(source: string) {
  return source === "manual" ? "手動" : "AI";
}

export function postTypeLabel(type: string) {
  if (type === "daily") return "日次ログ";
  if (type === "weekly") return "週まとめ";
  if (type === "period") return "期間まとめ";
  if (type === "note") return "メモ";
  return type;
}
