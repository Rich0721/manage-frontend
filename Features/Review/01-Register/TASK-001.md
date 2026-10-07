# TASK-001 Code Review

Status: OPEN

## Task ID

TASK-001

## Review Result

Missing Test：開發伺服器代理的轉發行為尚無可重現的驗證紀錄。

## Implementation Plan

TASK-001 要求以可控制的後端確認 Vite proxy 會將 POST 的原始 `/userController/register` URI 與 JSON body 轉發至後端；Docker/nginx 驗證另屬 TASK-007。

## Existing Implementation

`vite.config.ts` 已設定 `/userController` proxy；現有測試檔案均未啟動 Vite 與可控制的後端來確認轉發。`npm run test` 的 45 項測試未涵蓋這項行為。

## Review Issue

目前只能確認 proxy 設定存在，無法依 TASK-001 的 Testing 項目確認實際 POST 轉發後的 URI 與 body。若路徑或上游設定錯誤，元件與 Service 單元測試仍可能通過。

## Expected Behavior

提供可重現的驗證結果，確認開發伺服器收到註冊 POST 後將原始 URI 與 JSON body 送至設定的 API 上游。

## Suggested Area To Fix

檢查 `vite.config.ts` 的代理設定，補齊 TASK-001 所要求的受控後端驗證或可重現的測試紀錄；保留實際執行結果。

## Resolution

Status: OPEN。待補齊驗證後重新審查。
