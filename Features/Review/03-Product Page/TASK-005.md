# TASK-005 Code Review

Status: OPEN

## Task ID

TASK-005

## Review Result

未通過。詳情載入與其他操作可互相覆蓋，刪除確認內容與部分回歸測試不符計畫。Code Review Date：2026-10-13。

## Implementation Plan

編輯須先取得詳情再開表單，快速切換詳情時舊結果不得覆蓋新操作；刪除確認顯示商品名稱與 id。需驗證重複確認、401、409、refresh 失敗只重試 GET、非第一頁新增保留頁碼及刪除後有效頁碼。

## Existing Implementation

`ProductPage.tsx` 在 `handleEdit` 啟動詳情 GET；新增和刪除按鈕仍可操作，切換這些對話框不會取消進行中的詳情請求。刪除確認只顯示商品名稱。現有 Page 測試主要涵蓋單次成功操作、409 與選檔。

## Review Issue

1. `ProductPage.tsx:124-132,210,226`：使用者點編輯後，在詳情尚未回應時點「加入商品」或刪除，舊 GET 成功會執行 `setDialog({mode:'edit'})`，覆蓋剛開啟的新增／刪除視窗；不符合計畫的快速切換與過期結果忽略要求。
2. `ProductPage.tsx:239`：刪除確認缺商品 id；同名商品並存時使用者無法從視窗確認目標，與 TASK-005 明訂的名稱／id 不符。
3. 缺少計畫明訂的重複確認、成功 mutation 後 refresh 失敗僅重試 GET、15→16 與非第一頁新增保留頁碼，以及刪除末頁邊界測試。`App.test.tsx` 也未驗證 CRUD 401 的指定提示只顯示一次。

## Expected Behavior

已過期詳情結果不覆蓋目前操作；刪除確認同時顯示名稱與 id；測試覆蓋上述狀態轉移及 Session 回歸。

## Suggested Area To Fix

檢查 `ProductPage` 的詳情載入生命週期、刪除確認內容與 Page／App 測試。

## Resolution

Status: OPEN。2026-10-13 複審：詳情請求已在切換新增／刪除時取消並以 request id 阻止過期結果覆蓋；刪除確認已顯示名稱與 id。頁面測試已涵蓋重複送出、刷新失敗只重試 GET、非第一頁新增保留頁碼、刪除後頁碼有效及過期 Session 回應。仍有下列測試缺口，因此 TASK-005 未通過複審。

## Remaining Review Issue

`src/App.test.tsx` 只有初始清單 GET 401 的 Session 測試；CRUD 401 測試僅在 `ProductPage.test.tsx` 斷言 `onSessionExpired('使用者未授權')` 被呼叫，沒有經 App 驗證 Session 清除、返回登入頁與指定提示只出現一次。Implementation Plan TASK-005 Testing 與原 Review Issue 3 明確要求此整合回歸。請補一項以 App 為受測邊界的 CRUD 401 測試，驗證上述可觀察結果；不需改動已通過的產品程式碼。
