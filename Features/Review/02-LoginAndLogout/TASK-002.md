# TASK-002 Code Review

Status: RESOLVED

## Task ID

TASK-002

## 複審結果（2026-10-08）

通過。最新 Plan 依需求勘誤明訂登入 request 為 `body.info`，故下列初審第 1 項的平坦 body 結論已失效。`auth-service.ts` 保留修正後電文；成功 HTTP 回應缺少 Status 時回報 `protocol`；服務測試已涵蓋 409 最多一次、取消、逾時、hash 失敗、非法 JSON、必要 HTTP headers 缺漏及登出失敗。前次同版程式 17 個測試檔、135 項通過，build 與 lint 通過；本次工作樹無程式變更。初審第 2／3 項已解決，未發現新的阻擋問題。Code Review Date：2026-10-08。

## 初審紀錄（歷史；電文結論已由最新 Plan 取代）

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

Status: RESOLVED。上述初審意見保留供追溯；以本次複審及最新 Plan 為準。
