# 03 - Product Page Code Review

Review Date：2026-10-13  
初審結果：未通過；當時 TASK-001～006 均為 `REVIEW FIX`，各 Task Review Status 為 `OPEN`。

複審結果（2026-10-13）：TASK-001／002／003／004／006 通過，Implementation Status 為 `DONE`、Review Status 為 `RESOLVED`。TASK-005 的原實作問題已修正，但 App 層 CRUD 401 整合測試仍缺，Implementation Status 為 `REVIEW FIX`、Review Status 維持 `OPEN`。

最終複審結果（2026-10-13）：TASK-005 通過；六項 Task 的 Implementation Status 均為 `DONE`，Review Status 均為 `RESOLVED`。

## 初審主要發現

| Task | 結果 | 主要問題 |
| --- | --- | --- |
| TASK-001 | REVIEW FIX | payload 未在服務邊界明確映射欄位；回應數值下限未驗證；讀取 JSON 期間的取消／逾時誤分類 |
| TASK-002 | REVIEW FIX | 篩選後刪除末頁商品可能顯示 1/1 卻切出空表格；分頁邊界測試不足 |
| TASK-003 | REVIEW FIX | 中文 IME、單一標籤移除、候選去重與多標籤 round-trip 缺必要回歸測試 |
| TASK-004 | REVIEW FIX | HTML `min` 先阻止 submit，低於下限時無法顯示自訂欄位錯誤；表單／焦點測試不足 |
| TASK-005 | REVIEW FIX | 未完成的詳情 GET 可覆蓋後開啟的新增／刪除視窗；刪除確認缺商品 id；CRUD 狀態轉移測試不足 |
| TASK-006 | REVIEW FIX | 選檔取消／重選、下載占位及完整 API 無副作用缺回歸測試 |

詳情、位置、預期行為與建議檢查範圍見同目錄 `TASK-001.md` 至 `TASK-006.md`。

## Programmer Handoff

2026-10-13：Programmer 已依六份 Review Issue 完成修正與回歸測試；Implementation Plan 的六項狀態已更新為 `DEVELOPED DONE`。完整 Vitest 為 22 個測試檔、180 項通過，build 與 lint 通過。各 Task Review Status 仍為 `OPEN`，等待 Code Reviewer 重新審查；此紀錄不代表 Review Issue 已 RESOLVED。

## 複審當時發現

前次提出的服務契約／取消處理、篩選後頁碼、標籤互動、表單自訂驗證、詳情切換與刪除確認、批次選檔回歸問題，均已由程式碼及相關測試證實修正。複審時 TASK-005 的 `src/App.test.tsx` 尚無 App 層 CRUD 401 整合案例，故當時退回修正；後續補測與驗證詳見本文件末尾的 Programmer Fix Handoff，現等待 Code Reviewer 複審。

複審獨立執行 `npm test -- --run`：22 個測試檔、180 項通過。先前 Programmer 回報 build 與 lint 通過；本次未修改 Production／Test Code，未重跑 build 與 lint。尚未連接真實後端或完成瀏覽器人工視覺驗收。

## Programmer Fix Handoff

2026-10-13：TASK-005 已補上 App 層新增 API 401 整合測試，涵蓋 Session 清除、返回登入頁及指定提示只顯示一次。`npm.cmd test -- --run src/App.test.tsx` 16 項通過；完整 `npm.cmd test -- --run` 為 22 個測試檔、181 項通過；`npm.cmd run lint` 通過。Plan 狀態為 `DEVELOPED DONE`，等待 Code Reviewer 複審；本紀錄不代表 Review Issue 已 `RESOLVED`。

## 最終複審

2026-10-13：Code Reviewer 核對 TASK-005 補充測試以 App 為受測邊界，經新增商品操作重現 API 401，驗證 Session 清除、返回登入頁及指定訊息僅提示一次；對照 Plan 與原 Review Issue，待修缺口已補足。確認 Programmer 本次修正後的單檔測試 16 項、全套 181 項及 lint 通過；此次僅更新審查文件與 Plan 狀態，未重跑測試。TASK-005 Review Status 改為 `RESOLVED`、Implementation Status 改為 `DONE`，六項 Task 全數通過 Code Review。瀏覽器人工視覺驗收仍依計畫另行確認。

## 初次複審驗證與界線

該次檢查最新 Plan、產品服務、頁面／元件、相關測試與既有架構規範。Programmer 前次提供的同版程式驗證為 20 個測試檔、149 項測試通過，build 與 lint 通過；該次僅改審查文件與 Plan 狀態，未修改 Production 或 Test Code，未重跑全套測試。以 jsdom 確認無效的 `min` input 會阻止原生 submit event。尚未連接真實後端或完成瀏覽器人工視覺驗收。
