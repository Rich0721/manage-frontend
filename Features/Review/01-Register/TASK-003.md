# TASK-003 Code Review

Status: OPEN

## Task ID

TASK-003

## Review Result

Missing Test：計畫要求的確認密碼長度與 Unicode 邊界案例未完整覆蓋。

## Implementation Plan

TASK-003 要求對密碼及確認密碼分別驗證 7／8／20／21 字元邊界，並驗證以 Unicode code point 計算長度的邊界行為。

## Existing Implementation

`src/pages/register-validation.ts` 對確認密碼共用密碼規則。`src/pages/register-validation.test.tsx` 測試了密碼長度邊界、確認密碼缺少字元種類，以及一個單一 emoji 的姓名下限案例。

## Review Issue

測試未直接覆蓋確認密碼的 7／8／20／21 字元邊界，也未覆蓋 Unicode 字元在上限附近的計數結果。這些是 TASK-003 Testing 明列的案例。

## Expected Behavior

測試應證明確認密碼本身的長度上下限，以及 Unicode code point 長度邊界，均符合欄位規則。

## Suggested Area To Fix

補齊 `src/pages/register-validation.test.tsx` 的對應案例，使用獨立預期值與實際長度邊界。

## Resolution

Status: OPEN。待補齊測試後重新審查。
