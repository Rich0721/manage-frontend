# TASK-008 Code Review

Status: OPEN

## Task ID

TASK-008

## Review Result

未通過；下載回應驗證與瀏覽器下載資源清理未符合 Plan 的錯誤處理及測試要求。Code Review Date：2026-10-14。

## Implementation Plan

模板 GET 成功時下載 Excel Blob，失敗不得當作 Excel；優先採 `Content-Disposition` 檔名，否則使用 `product-template.xlsx`；object URL 用後須釋放。測試需驗證成功下載、檔名、401、非成功 HTTP、格式錯誤、重複點擊與清理。

## Existing Implementation

`requestDownload()` 讀 Blob；`parseDownload()` 只拒絕空檔或 Content-Type 包含 `json`／`html`；ProductPage 建立 object URL、設定 `link.download`、點擊連結，排程在下個 timer 釋放。測試驗證 service fallback／回應檔名與頁面連結 `click()`，以及 Session callback 的 401。

## Review Issue

1. `src/services/product-service.ts:201-207`：帶 `Status: success` 的非空 `text/plain` 回應仍被當作 Excel 下載，最後取得 `.xlsx` 檔名。此情境違反 Plan「失敗不得當成 Excel 下載」及格式錯誤處理要求；現有格式錯誤測試只涵蓋 `application/json`。
2. `src/pages/ProductPage.test.tsx:465-485`：僅斷言 `createObjectURL` 與連結 `click`，未檢查實際 `download` 檔名、object URL 是否釋放，也沒有模板非成功 HTTP／協定錯誤不觸發下載、進行中重複點擊不重送的案例。若連結點擊前拋錯，目前 `link.remove()` 與 URL 清理不會執行；需確保資源在失敗路徑也被清理。

## Expected Behavior

明顯不是 Excel 的成功回應應拒絕下載；有效 Blob 應以正確檔名觸發瀏覽器下載，且不論觸發過程是否成功，都不能遺留暫時 DOM 節點與 object URL。失敗及重複操作應有可觀察測試。

## Suggested Area To Fix

檢查 `parseDownload()` 的媒體型別判斷、`ProductPage.saveDownload()` 的資源生命週期，以及 `product-service.test.tsx`／`ProductPage.test.tsx` 的下載斷言。維持已確認的 Blob 契約及固定檔名政策。

## Resolution

Status: OPEN。待 Programmer 修正並重新驗證。
