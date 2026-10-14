# TASK-007 Code Review

Status: RESOLVED

## Task ID

TASK-007

## Review Result

未通過；批次上傳的必要失敗與取消情境缺頁面層回歸測試。Code Review Date：2026-10-14。

## Implementation Plan

成功上傳後僅刷新清單；401 清 Session；400／404／協定錯誤呈現；選檔取消、重選、重複觸發及卸載晚到回應需驗證。

## Existing Implementation

`uploadProducts()` 使用 `FormData.file` 且不手動設 Content-Type，成功回應驗證商品陣列。ProductPage 在選檔後呼叫上傳、刷新清單，並以 `fileControllerRef` 防止重送。現有測試涵蓋成功、取消選檔、重選、400／401 服務分類及刷新失敗不重送。

## Review Issue

`src/pages/ProductPage.test.tsx:391-505` 未驗證上傳 401 會呼叫 Session 擁有者，也未驗證 400／404／協定錯誤會顯示失敗且不刷新、不清 Session；卸載或 Session 變更後的晚到成功回應亦未驗證不更新舊頁面。這些是 Plan TASK-007 明列的測試條件，目前僅以 service 單元測試或成功路徑間接覆蓋。

## Expected Behavior

上述失敗與晚到回應應有可觀察斷言，避免檔案 API 的錯誤被誤認為上傳成功或舊 Session 的結果寫回畫面。

## Suggested Area To Fix

在 `ProductPage.test.tsx` 增加上傳失敗與卸載／Session 切換案例；沿用既有 service mock 與頁面 Session callback，無需重寫已通過的 FormData 路徑。

## Resolution

Status: OPEN。待 Programmer 補測並重新驗證。

## 2026-10-14 Review Fix 複審

Review Status：`RESOLVED`；Implementation Status：`DONE`；Code Review Date：2026-10-14。頁面測試已驗證上傳 401 通知 Session 擁有者且不刷新；一般 HTTP、404 與協定錯誤顯示失敗、不刷新也不結束 Session；卸載時中止請求，並忽略晚到的成功結果。原 Review Issue 已解決。
