# 作業繳交資訊（可直接複製）

## 1. 專案簡介

「微光知識庫」是一個以繁體中文整理學習、設計與數位工具筆記的靜態網站。讀者可以使用關鍵字搜尋、依最近類別篩選、管理類別、依最近點擊排序、開啟編輯器、刪除筆記、設定個人提醒、以 Markdown 閱讀內容、預覽匯入 Obsidian Markdown 並匯出 JSON。網站使用原生 HTML、CSS 與 JavaScript，不需要建置工具；預設筆記集中在 `content/notes.js`，瀏覽器修改則保存於 `localStorage`。

## 2. GitHub Repository

<!-- 推送後將下方網址替換成實際 repository URL -->

待補：`https://github.com/你的帳號/glow-knowledge-base`

## 3. 網頁連結

<!-- GitHub Pages 部署完成後將下方網址替換成實際網址 -->

待補：`https://你的帳號.github.io/glow-knowledge-base/`

## 4. AGENTS.md

[`AGENTS.md`](./AGENTS.md) 定義專案目的、視覺方向、檔案責任、筆記資料格式、新增頁面流程、AI 修改規則與提交前檢查表。

## 5. 之後如何新增頁面或內容

AI 先閱讀 `AGENTS.md`，再依照其中的欄位順序在 `content/notes.js` 新增筆記，或協助整理從 Obsidian 匯入的來源。使用者也能直接在網站編輯、刪除與匯出本機筆記。卡片、搜尋、分類與詳情視窗會從同一份資料自動產生，不需要重新複製 HTML。若要建立獨立主題頁，則依照文件中的流程在 `pages/` 建立 kebab-case 檔名，沿用既有頁首、頁尾、色彩變數與無障礙規則，並同步更新 README 的網站地圖。這讓新頁面可以快速完成，也能維持整個網站的一致性。
