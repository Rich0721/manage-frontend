# TASK-007 Code Review

Status: OPEN

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

## 2026-10-14 Stock 契約審查

Review Status：`OPEN`；Implementation Status：`REVIEW FIX`；Code Review Date：2026-10-14。先前已解決的 Issue 不重開。

### Review Issue（Missing Test）

`src/services/product-service.test.tsx:264-285` 的上傳成功回應只有非零 stock 8，格式錯誤只有缺省 stock；最新 Plan TASK-007 要求驗證上傳成功陣列含 0／非零均可解析、非法 stock 判為 `protocol`。頁面上傳成功測試 `src/pages/ProductPage.test.tsx:419-433` 的刷新結果未斷言庫存值，故也未直接驗證上傳後刷新顯示真實 stock。共用 `parseCollection()` 程式路徑正確，缺少的是指定的上傳回歸案例。

### Expected Behavior / Suggested Area To Fix

在 uploadProducts 服務測試加入 stock 0 成功與非法 stock 失敗案例；於相關頁面上傳測試確認成功刷新後商品列顯示後端庫存，並沿用既有 protocol 錯誤不刷新測試。無需新增 Excel 內容解析或服務分支。

### Resolution

Status: OPEN。待 Programmer 補測後複審。

## Programmer Fix Handoff（2026-10-14）

上傳服務測試驗證成功回應同時含 stock 0／非零、缺省與負數 stock 回應以 protocol 拒絕；頁面上傳成功案例確認重新載入後的非零庫存顯示於表格。四個相關測試檔合計 99 項通過，lint 通過。Review Status 保持 `OPEN`，等待 Code Reviewer 複審。
