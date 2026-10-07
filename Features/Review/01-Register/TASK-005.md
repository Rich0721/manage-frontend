# TASK-005 Code Review

Status: RESOLVED

## Task ID

TASK-005

## Review Result

複查通過。最新實作符合已更新計畫的 request body、共用回應解析與非 2xx 訊息處理；新增測試補足缺少 `body.info` 時仍判定成功的回歸案例。

## Implementation Plan

- HTTP Content-Type 只放在 fetch 的 HTTP headers；JSON 只含 body.info，姓名 key 為 userName。
- 共用解析器支援最新 headers.status/message 與既有 header.Status/Message／小寫格式。
- 註冊成功以狀態與訊息判定；body.info 缺少或為空不應單獨使成功回應變成 protocol error。
- 測試應驗證成功回應含完整 info、空 info、未提供 info 均依狀態與訊息判定。

## Existing Implementation

`src/services/register-service.ts` 使用 fetch headers 設 Content-Type，將只含 body.info 的 RegisterRequestBody 序列化；姓名映射到 userName。共用解析器依計畫優先讀取 JSON headers，支援舊 header 格式。Service 測試確認新格式成功／失敗、非 2xx 訊息、舊格式與空 info 成功回應。

## Review Issue

`src/services/register-service.test.tsx` 有驗證成功回應含完整 info，並在重試案例驗證空的 `body.info: {}` 可成功；目前沒有成功回應完全省略 `body.info`（或 body）的案例。此行為在 TASK-005 Testing 明確列出，缺少回歸測試無法防止日後又把未使用的 response body 欄位加入成功門檻。

## Expected Behavior

新增 Service 測試：HTTP 2xx 回應具有效 success status 與 message，但未提供 body.info 時，仍回傳成功結果。

## Suggested Area To Fix

只需補強 `src/services/register-service.test.tsx` 的成功回應案例，使用可控制 fetch response，並斷言 registerUser 回傳成功。完成後重跑相關測試及專案必要檢查。

## Verification

- `npm run test`：10 個測試檔、52 個測試通過。
- `npm run lint`：通過。
- `npm run build`：通過。

## Resolution

複查通過。`src/services/register-service.test.tsx` 現在以 2xx、有效 success status/message 且完全省略 `body` 的回應執行 `registerUser`，並斷言回傳成功結果；符合成功判斷不依賴 `body.info` 的計畫要求。Review 無未結項目。

Status: RESOLVED

## Re-review Verification

- `npm run test -- src/vite-proxy.test.tsx src/services/register-service.test.tsx`：2 個測試檔、13 個測試通過。
- `npm run test`：10 個測試檔、58 個測試通過。
- `npm run build`：通過。
- `npm run lint`：通過。
