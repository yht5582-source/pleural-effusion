# 胸水鑑別診斷導航 · Pleural Guide

繁體中文成人胸水臨床／教學輔助工具。以 Light’s criteria 為主，結合假性滲出液、感染風險與病因線索。未經前瞻性臨床驗證，不取代醫師判斷。

## 功能

- 急症優先：生理不穩定、肉眼膿液、胸水微生物陽性與疑似感染的可靠低 pH。
- Light’s criteria 三項逐一計算；缺值保留未知，任一陽性才標記滲出液、三項陰性才標記漏出液。
- SPAG／protein gradient、心衰竭與 CKD／透析情境。保留原始 Light 分類，不自動排除混合病因。
- 感染分層僅用於相符臨床情境；使用前確認 pH 採檢品質。
- 2026 triple combination 獨立列為研究比較，不取代正式標準。
- 六個虛構教學病例、單位換算、摘要複製、文字下載與列印 PDF。
- 完全前端運算；沒有個資欄位、資料庫、分析追蹤或自動儲存。重整即清空。

## 使用與測試

直接開啟 `dist/index.html`，或執行 `python3 -m http.server 8765 --directory dist`。

使用 Node.js 20 以上執行 `node --test tests/engine.test.cjs`。

## GitHub Pages

GitHub repository Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
推送 main 後 workflow 先執行判讀測試，再部署 dist。
預期網址： https://yht5582-source.github.io/pleural-effusion/ （部署成功才可使用）。

## 臨床證據

1. [BTS Guideline for pleural disease, 2023](https://www.brit-thoracic.org.uk/document-library/guidelines/pleural-disease/bts-guideline-for-pleural-disease/)
2. [ICS/NCCP guidelines, 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11093145/)
3. [Porcel et al., blood-free triple combination, 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12991015/)
4. [Bielsa et al., false exudates, 2012](https://doi.org/10.1111/j.1440-1843.2012.02155.x)
5. [PD-related hydrothorax single-center experience, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8722551/)
6. [BANCA diagnostic study, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12208600/)

版本 v1.0；文獻檢視 2026-10-20。僅適用成人胸水，不適用腹水或心包積液。
