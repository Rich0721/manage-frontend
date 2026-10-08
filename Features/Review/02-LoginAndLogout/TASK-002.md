# TASK-002 Code Review

Status: OPEN

## Task ID

TASK-002

## Review Result

未通過。登入 request JSON 結構與最新 Plan 及需求不符，對應的兩項服務測試失敗；另有必要的服務錯誤與契約測試尚未涵蓋。

## Implementation Plan

登入 request JSON 應為 `{ body: { email, password: passwordHash, isForceLogin } }`，登入 response 的 `userName` 才位於 `body.info`。TASK-002 另要求區分 HTTP／協定錯誤，並驗證取消、逾時、失敗不強制重送，以及缺少 HTTP Status／授權等情境。

## Existing Implementation

`src/types/auth.ts:15` 的 `LoginRequestBody` 與 `src/services/auth-service.ts:86` 的 payload 多包一層 `info`。`src/services/auth-service.ts:95` 將 HTTP 200 但缺少 Status header 的回應列為 `http` 錯誤。`src/services/auth-service.test.tsx` 目前只有 4 個案例。

## Review Issue

1. **登入電文錯誤（高）**：後端依需求讀取 `body.email` 等欄位時，現有電文的值位於 `body.info`，正常登入與 409 強制重送都可能失敗。服務測試中驗證普通與強制登入 body 的 2 項案例已失敗。Plan 驗證段落將測試誤述為舊格式，與 Plan 的 API 映射表及 TASK-002 Implementation 相反。
2. **錯誤分類不符（中）**：成功 HTTP 回應若缺少必要的 HTTP Status header，Plan 要求 `protocol` error，目前回傳 `http` error。
3. **缺少必要回歸案例（中）**：尚未測試 401／一般失敗不重送、第二次 409 停止、取消、雜湊失敗、timeout、非法 JSON、缺少 Status／Uid／Authorization、response header 與 JSON 衝突，以及登出失敗／斷網等 TASK-002 明列案例。

## Expected Behavior

登入與強制重送均使用 Plan 指定的 `body` 欄位結構；缺少必要 HTTP Status 時回報協定錯誤。補齊 TASK-002 明列的服務與 Header 契約測試後，完整測試應通過。

## Suggested Area To Fix

檢查 `src/types/auth.ts`、`src/services/auth-service.ts` 及同目錄測試；同步修正 Plan 驗證紀錄中對登入 body 的錯誤敘述。保持註冊、登出 payload 各自原有的契約。

## Verification

2026-10-08 執行相關 6 個測試檔：47/49 項通過，失敗 2 項均位於 `auth-service.test.tsx` 的登入 body 斷言。

## Resolution

Status: OPEN。待 Programmer 修正並將 Task 重新設為 `DEVELOPED DONE` 後複審。
