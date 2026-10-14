# 03 - Product Page Code Review

## 2026-10-14 商品檔案 API 與 Get Product URI 審查（最新結果）

審查最新 Plan 中六項 `DEVELOPED DONE` 任務。TASK-003／005 通過，Implementation Status 為 `DONE`、Review Status 為 `RESOLVED`；TASK-001／007～009 標為 `REVIEW FIX`，Review Status 為 `OPEN`。TASK-002／004／006 的既有 `DONE` 不變。主要待修問題：共用 request 改變舊 JSON 錯誤文案；上傳缺失敗／晚到回應測試；下載錯把非 Excel `text/plain` 成功回應當成檔案，且檔名、資源清理及錯誤／重複請求測試不足。各 Task 詳見同目錄 `TASK-001.md`、`TASK-007.md`、`TASK-008.md`、`TASK-009.md`。

Reviewer 核對 Plan、程式、相關測試與先前審查紀錄，並獨立執行 Product service／Page 定向測試 68 項及 ProductLabelInput／App 定向測試 21 項，均通過。全套 196 項、build 與 lint 通過為 Programmer 交接結果；本次未重跑。審查只更新 Plan／Review 文件，未修改 Production 或 Test Code，未連接實際後端。

## Programmer Fix Handoff（2026-10-13）

TASK-005 缺少頁面表格庫存顯示 0 的斷言已補齊，Plan 狀態為 `DEVELOPED DONE`，等待複審；Review Status 仍為 `OPEN`。定向測試 33 項、全套 186 項、build 與 lint 通過。TASK-003 的 close 圖示 CSS 已調整為 12px；程式及自動化測試完成，但本機瀏覽器控制介面無可用瀏覽器，Figma 實際渲染對照未完成，故維持 `PLAN UPDATED`。

## 2026-10-13 本次 Plan 更新複審（最新結果）

審查範圍為最新 Plan 中 `DEVELOPED DONE` 的 TASK-001／004／005／006。TASK-001／004／006 通過，Implementation Status 更新為 `DONE`，其 Review Status 維持 `RESOLVED`；TASK-005 因缺少表格庫存 0 的頁面可見結果測試，更新為 `REVIEW FIX`，Review Status 為 `OPEN`。TASK-003 仍為 `PLAN UPDATED`，未進入本輪正式 Code Review；TASK-002 既有 `DONE` 維持不變。

TASK-005 的服務測試已證明回應缺少 stock 時正規化為 0，但 `ProductPage.test.tsx` 尚未確認表格庫存格顯示 0，與 Plan TASK-005 的本次差異測試要求不符。問題位置、期望行為與修正範圍見 `TASK-005.md`。TASK-006 的瀏覽器視覺檢查依最新 Plan 暫緩，未記為驗收通過。

Programmer 交接的全量測試為 22 個測試檔、186 項通過，build 與 lint 亦通過；本次 Code Review 依該結果與程式／測試內容核對，未修改 Production 或 Test Code，也未重跑測試。上述歷史審查紀錄保留，最新狀態以本節及 Implementation Plan 的 Requirement List 為準。

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

## 2026-10-14 Stock 契約 Code Review

最新 Plan 的 TASK-001／004／005／007 共四項待審。本輪核對程式與測試後，主要 Stock 資料流已實作，但四項任務各缺少 Plan 明列的回歸斷言；詳細問題與期望行為分別記錄於同目錄的 `TASK-001.md`、`TASK-004.md`、`TASK-005.md`、`TASK-007.md`。四項 Implementation Status 為 `REVIEW FIX`，Review Status 為 `OPEN`，Code Review Date 為 2026-10-14。先前已解決的歷史 Issue 保持原紀錄，其他任務狀態不變。

Reviewer 執行 Stock 相關四個測試檔，94 項通過；沙箱中的 esbuild 無法讀取 Vitest 設定，因此同一命令於核准的沙箱外執行成功。本輪未修改 Production／Test Code，未重跑全套測試、build 或 lint；Programmer 的全套 217 項、build 及 lint 通過屬前次驗證紀錄。尚未連接真實後端。

### Programmer Review Fix Handoff（2026-10-14）

Programmer 已補齊上述四項 Review Issue 所列測試，四個定向測試檔 99 項及 lint 通過；Plan 中 TASK-001／004／005／007 已恢復 `DEVELOPED DONE`。各 Task Review Status 維持 `OPEN`，待 Code Reviewer 複審。未修改 Production Code，也未重跑全套測試或 build。
