# TASK-002 Code Review

Status: OPEN

## Task ID

TASK-002

## Review Result

未通過；Missing Test。Code Review Date：2026-10-20。

## Implementation Plan

訂單服務須驗證 HTTP 200／401／400／其他錯誤、網路、逾時、無效 JSON 及缺少必要訂單欄位；測試 request headers、`body.info` 與數量乘算的金額契約。

## Existing Implementation

`sell-service.ts` 有 30 秒逾時、取消、錯誤分類與回應欄位檢查。`sell-service.test.tsx` 驗證成功 payload、401、400、無效 JSON、網路錯誤及主動取消。

## Review Issue

`src/services/sell-service.test.tsx:19-64` 沒有逾時與「有效 JSON 但必要訂單欄位缺失／格式錯誤」案例，也沒有非 400 的非預期 HTTP 案例。逾時須回報 `timeout` 而非當作主動取消；格式錯誤須拒絕假成功，這些都是 TASK-002 明訂的錯誤邊界，現有測試無法證明。

## Expected Behavior

測試驗證逾時映射為 `timeout`、缺少必要訂單欄位映射為 `protocol`、非預期 HTTP 映射為 `http`，且不回傳成功訂單。

## Suggested Area To Fix

補強 `src/services/sell-service.test.tsx` 的錯誤分類案例；若測試揭露正式程式問題，再修正服務實作。

## Resolution

Status: OPEN。待 Programmer 補測後複審。
