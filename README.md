# 微光知識庫

一個以繁體中文整理學習筆記的靜態個人知識庫。讀者可以依分類瀏覽、用關鍵字搜尋，點開卡片閱讀完整摘要；內容與畫面分離，之後只要依照 `AGENTS.md` 的資料格式，就能快速增加新的筆記或頁面。

## 專案亮點

- 零建置步驟：HTML、CSS、JavaScript 可直接部署到 GitHub Pages。
- 資料與介面分離：`content/notes.js` 提供預設筆記，瀏覽器用 `localStorage` 保存新增、編輯與刪除後的版本。
- 可延伸規則：`AGENTS.md` 定義內容格式、命名、無障礙與 AI 修改流程。
- 具體互動：搜尋、最近類別篩選、類別管理、最近點擊排序、筆記詳情、編輯、刪除、個人提醒、Obsidian Markdown 預覽匯入與 JSON 匯出。

## 網站地圖

| 路徑 | 用途 |
| --- | --- |
| `index.html` | 知識庫首頁與所有筆記索引 |
| `pages/` | 預留給未來獨立主題頁，例如閱讀清單或學習路線 |
| `content/notes.js` | 筆記資料來源 |

## 本機預覽

在專案根目錄執行任一個靜態伺服器，例如：

```bash
python -m http.server 8000
```

再開啟 <http://localhost:8000>。直接雙擊 HTML 也能看到靜態畫面，但使用伺服器更接近 GitHub Pages 的環境。

新增、編輯或刪除的筆記會留在目前瀏覽器的 `localStorage`。要備份或換裝置，請在筆記列表按「匯出 JSON」。按「匯入 Obsidian 檔案」或「匯入 Vault 資料夾」可以選取 Markdown 來源，網站會先顯示預覽，確認後才加入本機清單；這個版本不會直接寫回 Git repository 或 Obsidian Vault。

## Obsidian 與 LLM Wiki 評估

Obsidian Vault 可以作為未來的 raw source，但目前不直接把整個 Vault 匯入網站。少量筆記先由 AI 依照 `AGENTS.md` 轉成標題、摘要、段落、標籤與日期，再人工確認後加入資料。當來源數量增加、筆記需要大量交叉連結或出現矛盾時，才評估導入 LLM Wiki 的 `index.md`、`log.md`、來源引用與 lint 流程；完整評估與匯入規則請看 `AGENTS.md`。

## 發布到 GitHub Pages

1. 在 GitHub 建立一個新的 repository，例如 `glow-knowledge-base`。
2. 將本專案推送到 `main` 分支。
3. 到 **Settings → Pages**，將來源切換為 **GitHub Actions**。
4. `main` 分支每次更新都會觸發 `.github/workflows/pages.yml`，等待部署完成後，網站網址通常會是 `https://你的帳號.github.io/glow-knowledge-base/`。

## 之後如何新增內容

閱讀 `AGENTS.md` 的「筆記資料格式」與「新增一個頁面的流程」。一般使用者可直接點擊「新增一則筆記」使用編輯器；若要把內容提交到專案，則在 `content/notes.js` 增加符合欄位順序的物件。AI 會依照同一份資料來源自動產生卡片與詳情內容，不必重新設計頁面。
