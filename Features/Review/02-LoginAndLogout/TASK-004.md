# TASK-004 Code Review

Status: OPEN

## Task ID

TASK-004

## Review Result

未通過。登出請求尚未完成時，使用者可以在登入頁重新登入；舊登出完成後可能清除這次新登入的畫面 Session。

## Implementation Plan

TASK-004 要求登出開始即移除舊 Session 並停止產品互動，且舊非同步結果不得覆蓋新登入或重寫儲存。登出不論結果都要返回登入頁；Session 清理應只影響當次登出憑證。

## Existing Implementation

`src/App.tsx:67` 登出開始時立即 `setSession(null)`，讓 HomePage 可重新登入。`handleLoginSuccess` 在第 48 行附近可儲存新 Session 並呼叫 `setSession(next)`；然而舊 `logoutUser` 結束後的 `finally` 在第 76 行無條件再次 `setSession(null)`。`App.test.tsx` 涵蓋登出中的舊產品請求取消，沒有涵蓋登出等待中重新登入。

## Review Issue

**舊登出覆蓋新登入（高）**：在登出 API 尚未完成時成功登入另一個 Session，產品頁會先出現；當舊登出 Promise resolve／reject，`finally` 清除 React Session 並返回登入頁。`sessionStorage` 可能仍保存新 Session，造成畫面與儲存不同步，違反 TASK-004 明訂的舊非同步結果隔離。

## Expected Behavior

舊登出不論成功或失敗，均完成其原 Session 的清理與錯誤回報；若使用者在等待期間已成功建立新 Session，舊登出完成不得清除該新 Session 或改變其畫面。

## Suggested Area To Fix

檢查 `src/App.tsx` 的登出 `finally` 與登入成功之間的 Session 身分／時序保護，並在 `src/App.test.tsx` 加入可控制登出完成時間的重新登入回歸案例。

## Verification

依現有程式的非同步狀態轉移及測試斷言確認；前次同版程式 135 項測試通過，但未涵蓋此競態。本次未修改程式或測試。

## Resolution

Status: OPEN。待 Programmer 修正並將 TASK-004 設為 `DEVELOPED DONE` 後複審。
