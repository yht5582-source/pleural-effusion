# 驗證與部署狀態

- 2026-10-20：Node.js v24.21.0 執行 48 項臨床規則測試，全部通過。
- engine.js／app.js 語法檢查通過。
- HTML id、label、靜態資源與 JavaScript 元素參照檢查通過。
- 無檢驗值上傳、追蹤或瀏覽器儲存程式碼。
- 本機 HTTP server 綁定被環境拒絕，未完成真實瀏覽器視覺與操作驗證。
- GitHub 儲存庫可讀取；create_tree 寫入被拒絕：需要批准，但本次工作階段 approval policy 為 never。
- 尚未寫入 GitHub；未確認 GitHub Pages 設定，尚未部署。

## 準備好的內容

dist：可部署的靜態網站。
tests：判讀規則測試。
.github/workflows/pages.yml：通過測試後發布 dist 至 GitHub Pages。

指定儲存庫：https://github.com/yht5582-source/pleural-effusion
Pages 設定：https://github.com/yht5582-source/pleural-effusion/settings/pages
GitHub Pages 的 Source 應選 GitHub Actions。

待具備寫入授權的工作階段接續提交；保留遠端原有 LICENSE。
