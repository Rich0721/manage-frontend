# TASK-009 Code Review

Status: RESOLVED

## Task ID

TASK-009

## Review Result

未通過；報表下載共用的成功回應驗證仍有 TASK-008 所述缺口，且報表特有錯誤情境尚未測試。Code Review Date：2026-10-14。

## Implementation Plan

報表 POST 以逗號串接全部符合篩選條件的 ID；0 筆停用下載；成功下載 Excel Blob，沿用模板的檔名與錯誤處理，401 清 Session，HTTP／協定錯誤不下載。

## Existing Implementation

`filteredProducts` 而非當頁 `visibleProducts` 提供 ID，`downloadProductData()` 組成 `body.info.ids`。頁面測試涵蓋跨頁全量 ID、單一篩選結果及 0 筆停用；服務測試涵蓋 POST 路徑、headers、payload 和回應檔名。

## Review Issue

`src/services/product-service.ts:201-216` 的共用 `parseDownload()` 會將 `text/plain` 成功回應當成報表；`src/pages/ProductPage.test.tsx:440-463` 未驗證報表 401／一般 HTTP／協定錯誤不觸發下載、進行中重複點擊不重送，以及實際檔名與 object URL 清理。這些是 Plan TASK-009 明列的錯誤與驗證路徑。

## Expected Behavior

報表需沿用修正後的 Excel 回應驗證與資源清理；錯誤不能產生下載，重複點擊不能產生第二次 POST。

## Suggested Area To Fix

先處理 TASK-008 的共用下載路徑，再於 `product-service.test.tsx`／`ProductPage.test.tsx` 補報表特有失敗及等待狀態驗證；保留目前正確的篩選結果 ID 資料流。

## Resolution

Status: OPEN。待 Programmer 修正並重新驗證。

## 2026-10-14 Review Fix 複審

Review Status：`RESOLVED`；Implementation Status：`DONE`；Code Review Date：2026-10-14。報表沿用已修正的 Blob 解析與下載資源清理；頁面測試驗證報表 401、一般 HTTP／協定錯誤不下載、等待中防重複請求、檔名及 object URL 清理；跨頁與篩選結果 ID 資料流仍正確。原 Review Issue 已解決。
