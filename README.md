# 微光知識庫

一個以繁體中文整理學習筆記的靜態個人知識庫。讀者可以依分類瀏覽、用關鍵字搜尋，點開卡片閱讀完整摘要；內容與畫面分離，之後只要依照 `AGENTS.md` 的資料格式，就能快速增加新的筆記或頁面。

## 專案亮點

- 零建置步驟：HTML、CSS、JavaScript 可直接部署到 GitHub Pages。
- 資料與介面分離：筆記集中放在 `content/notes.js`，不需要手動複製卡片 HTML。
- 可延伸規則：`AGENTS.md` 定義內容格式、命名、無障礙與 AI 修改流程。
- 具體互動：搜尋、分類篩選、清除條件、精選筆記與 hash 詳情視窗。

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

## 發布到 GitHub Pages

1. 在 GitHub 建立一個新的 repository，例如 `glow-knowledge-base`。
2. 將本專案推送到 `main` 分支。
3. 到 **Settings → Pages**，將來源切換為 **GitHub Actions**。
4. `main` 分支每次更新都會觸發 `.github/workflows/pages.yml`，等待部署完成後，網站網址通常會是 `https://你的帳號.github.io/glow-knowledge-base/`。

## 之後如何新增內容

閱讀 `AGENTS.md` 的「筆記資料格式」與「新增一個頁面的流程」，在 `content/notes.js` 增加符合欄位順序的物件即可。AI 會依照同一份資料來源自動產生卡片與詳情內容，不必重新設計頁面。
