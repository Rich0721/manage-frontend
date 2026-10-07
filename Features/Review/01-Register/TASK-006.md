# TASK-006 Code Review

Status: RESOLVED

## Task ID

TASK-006

## Review Result

Missing Regression Test：失敗後修改 Email 再送出的頁面流程未驗證新的提交資料。

## Implementation Plan

TASK-006 與註冊 Gherkin 要求第一次失敗後保留表單，修改 Email 為 `newuser@example.com`，再次提交時使用新 Email，並只顯示第二次請求的結果。

## Existing Implementation

`HomePage.tsx` 會在提交時從目前欄位建立 snapshot。`HomePage.test.tsx` 的失敗後重試案例連續提交兩次，但第二次提交前未修改 Email，也未檢查 `registerUser` 第二次收到的 values。

## Review Issue

近期已出現第一次失敗後再次註冊的問題。現有頁面測試即使第二次仍傳送舊 Email，也可能通過；Service 的重試測試直接傳入新 values，未覆蓋 HomePage 的欄位狀態與提交邊界。

## Expected Behavior

頁面回歸測試應驗證：修改保留的 Email 後，第二次 `registerUser` 接收新 Email，Alert 與頁面切換只依第二次結果執行。

## Suggested Area To Fix

補強 `src/pages/HomePage.test.tsx` 中的失敗後重試情境與第二次 Service 呼叫參數斷言。

## Resolution

Status: RESOLVED。確認失敗後修改 Email，再次提交時第二次 registerUser 收到 newuser@example.com，且後續登入畫面及 Alert 只依第二次成功結果呈現。
