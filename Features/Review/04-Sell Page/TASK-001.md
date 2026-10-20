# TASK-001 Code Review

Status: OPEN

## Task ID

TASK-001

## Review Result

未通過；Missing Test。Code Review Date：2026-10-20。

## Implementation Plan

登入後可在商品管理與販售頁切換；登出或販售頁收到 401 後清除 Session、回登入頁。TASK-001 Testing 明訂兩頁切換、登出／401 及 Header active 狀態。

## Existing Implementation

`App.tsx` 已集中處理頁面切換、登出與 Session 失效。`App.test.tsx` 驗證兩頁切換與商品管理的 401；`SiteHeader.test.tsx` 驗證商品管理 active 與販售入口 callback。

## Review Issue

`src/App.test.tsx` 缺少從販售頁觸發登出／401 的整合回歸。現有 401 案例由商品管理的新增商品 API 觸發，未驗證販售頁的查詢或建立訂單 401 會清除 Session、返回登入頁並只顯示一次指定提示。販售頁有獨立的 `onSessionExpired` 呼叫路徑，因此商品管理案例無法覆蓋這條路徑。

## Expected Behavior

由 App 進入販售頁後，販售 API 回傳 401 時驗證 Session 清除、登入頁出現及提示次數；販售頁登出後也應返回登入且不保留該頁狀態。

## Suggested Area To Fix

補強 `src/App.test.tsx` 的販售頁 Session 回歸，重用既有 App／service mock。正式程式目前未發現 TASK-001 的明確缺陷。

## Resolution

Status: OPEN。待 Programmer 補測後複審。

## Programmer Fix Handoff（2026-10-20）

`src/App.test.tsx` 新增販售頁查詢 401 案例，驗證 Session 清除、返回登入表單及授權提示只顯示一次；新增從販售頁登出時取消待處理商品查詢的案例。相關測試包含於完整測試套件 279 項通過結果。Review Status 維持 `OPEN`，等待 Code Reviewer 複審。
