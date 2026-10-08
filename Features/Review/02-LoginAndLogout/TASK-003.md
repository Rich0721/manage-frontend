# TASK-003 Code Review

Status: OPEN

## Task ID

TASK-003

## Review Result

未通過。登入請求被頁籤切換取消後，再切回登入頁時，提交按鈕可能一直停用。

## Implementation Plan

TASK-003 要求切換頁籤取消請求、忽略舊回應，並維持可重新輸入及提交的登入流程。提交中只在當次請求進行時停用按鈕。

## Existing Implementation

`src/pages/HomePage.tsx:145` 在送出登入時設 `loginSubmitting=true`。`handleModeChange` 會執行 `cancelRequest()` 與 `clearForms()`；後者在第 74 行附近清除註冊提交狀態，卻沒有清除 `loginSubmitting`。舊請求的 `finally` 於 requestId 改變後不會執行第 164 行的重設。`HomePage.test.tsx` 目前只驗證切換到註冊及忽略舊回應，沒有切回登入後再次提交的案例。

## Review Issue

**取消後登入狀態未復原（中）**：送出有效登入資料，在請求未完成時切至註冊，再切回登入並填入有效資料，`LoginForm` 仍收到 `submitting=true`，登入按鈕持續 disabled。此為 TASK-003 的實作與回歸測試缺口。

## Expected Behavior

取消或切換頁籤後，舊登入回應不得導航；回到登入頁時，提交狀態應恢復，合法輸入可再次送出。

## Suggested Area To Fix

檢查 `src/pages/HomePage.tsx` 的取消／清理流程，以及 `src/pages/HomePage.test.tsx` 的登入請求中切換與重送案例。

## Verification

依現有程式的狀態轉移及測試斷言確認；前次同版程式 135 項測試通過，但未涵蓋此操作序列。本次未修改程式或測試。

## Resolution

Status: OPEN。待 Programmer 修正並將 TASK-003 設為 `DEVELOPED DONE` 後複審。
