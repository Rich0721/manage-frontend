# TASK-005 Code Review

Status: OPEN

## Task ID

TASK-005

## Review Result

Implementation Error：註冊請求 JSON envelope 與已定義的 API request 合約不符；完整測試因此失敗。

## Implementation Plan

TASK-005 要求 Request Body 同時包含 `header.Content-Type` 與 `body.info`，姓名應映射成 `body.info.username`。HTTP `Content-Type` header 不能取代 Request Body 的 `header`。

## Existing Implementation

`src/services/register-service.ts` 第 81 至 91 行僅序列化 `body.info`，缺少 JSON `header`，並將姓名序列化為 `userName`。`src/types/register.ts` 中的 `RegisterRequestBody` 已定義正確的 `header` 與 `username`。

## Review Issue

`npm run test` 在 `src/services/register-service.test.tsx:49` 因 `payload.header` 為 `undefined` 失敗。即使補上 `header`，下一個 `payload.body.info.username` 斷言仍會因實際欄位為 `userName` 而失敗。後端收到的 request body 不符合 Requirement 與 Gherkin 指定格式。

## Expected Behavior

POST `/userController/register` 的 JSON body 應含 `header.Content-Type: application/json`，並以 `body.info.username` 傳送正規化後的姓名；兩個密碼仍需為 SHA-256 hex。

## Suggested Area To Fix

檢查 `src/services/register-service.ts` 的 request body mapping，並以既有 `src/services/register-service.test.tsx` 及相關回歸測試確認完整 envelope。

## Resolution

Status: OPEN。待修正實作且完整測試通過後重新審查。
