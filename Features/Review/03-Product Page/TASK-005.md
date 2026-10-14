# TASK-005 Code Review

Status: RESOLVED

## Task ID

TASK-005

## Initial Review Result

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

## Review Issue Identified During Re-review

`src/App.test.tsx` 只有初始清單 GET 401 的 Session 測試；CRUD 401 測試僅在 `ProductPage.test.tsx` 斷言 `onSessionExpired('使用者未授權')` 被呼叫，沒有經 App 驗證 Session 清除、返回登入頁與指定提示只出現一次。Implementation Plan TASK-005 Testing 與原 Review Issue 3 明確要求此整合回歸。請補一項以 App 為受測邊界的 CRUD 401 測試，驗證上述可觀察結果；不需改動已通過的產品程式碼。

## Programmer Fix Handoff

2026-10-13：`src/App.test.tsx` 新增新增商品 API 回傳 401 的 App 整合案例，確認 sessionStorage 已清除、畫面回到登入表單、只呼叫新增一次且只顯示一次「使用者未授權」。驗證 `npm.cmd test -- --run src/App.test.tsx`（16 項通過）、完整 `npm.cmd test -- --run`（22 個測試檔、181 項通過）及 `npm.cmd run lint` 均通過。Implementation Plan TASK-005 狀態更新為 `DEVELOPED DONE`；Review Status 保持 `OPEN`，等待 Code Reviewer 複審。

## Final Re-review

Status: RESOLVED。Code Review Date：2026-10-13。已核對 `src/App.test.tsx`：測試經由 App 實際開啟新增表單並送出，由產品服務邊界回傳 401，接著驗證 sessionStorage 清空、登入表單出現、`window.alert` 僅呼叫一次且內容為「使用者未授權」。先前複審確認的詳情切換、刪除確認與頁面回歸仍有效；Programmer 於本次修正後執行單檔 16 項、全套 181 項及 lint 均通過。沒有新增待修問題，TASK-005 通過複審。

## 2026-10-13 本次 Plan 更新複審

Review Result：未通過；Review Status 為 `OPEN`，Implementation Status 為 `REVIEW FIX`，Code Review Date：2026-10-13。此節處理 Stock 暫行契約的新差異，不重開上方已解決的歷史 Issue。

Review Issue：最新 Plan 的 TASK-005「本次差異」明訂頁面測試須驗證清單回應缺少 `stock` 時表格顯示 `0`。`src/services/product-service.test.tsx` 已證明服務解析缺省 stock 會回傳 0；但 `src/pages/ProductPage.test.tsx` 的清單顯示案例使用 stock 7，新增表單案例只檢查停用的 stock 0，尚無表格庫存格顯示 0 的斷言。服務與頁面分層驗證未完整覆蓋 Plan 指定的可見結果。

Expected Behavior：頁面測試接收服務正規化後的 `stock: 0` 商品，確認該商品的庫存格顯示 `0`，並保留既有七欄及 CRUD 測試。服務層缺省 stock 的回應案例已存在，無需重複頁面中的解析邏輯。

Suggested Area To Fix：檢查 `src/pages/ProductPage.test.tsx` 的清單顯示案例與 `ProductTable` 可觀察的庫存儲存格。補足頁面斷言後執行相關回歸，再交由 Code Reviewer 複審。

## Programmer Fix Handoff

2026-10-13：`src/pages/ProductPage.test.tsx` 的清單顯示案例使用正規化後 `stock: 0` 商品，並以該商品列斷言表格庫存儲存格顯示 `0`。定向 ProductPage／ProductLabelInput 測試 33 項通過；全套 Vitest 22 個測試檔、186 項通過；`npm.cmd run build` 與 `npm.cmd run lint` 通過。Implementation Status 已更新為 `DEVELOPED DONE`，本 Review Status 保持 `OPEN`，等待複審。

## 2026-10-14 Stock 差異複審

Review Status：`RESOLVED`；Implementation Status：`DONE`；Code Review Date：2026-10-14。`ProductPage.test.tsx` 的表格案例已以 `stock: 0` 商品斷言庫存格實際顯示 0；服務測試另驗證 API 缺省時正規化。新增／編輯仍不送 stock，既有詳情切換、Session 401、refresh 與頁碼回歸未見本輪修改破壞。Reviewer 執行 Product service／Page 測試 68 項及 ProductLabelInput／App 測試 21 項通過。先前 OPEN Issue 已解決，本次沒有新增待修問題。

## 2026-10-14 Stock 恢復審查

Review Status：`OPEN`；Implementation Status：`REVIEW FIX`；Code Review Date：2026-10-14。先前已解決的 Issue 不重開。

### Review Issue（Missing Test）

`src/pages/ProductPage.test.tsx:140-163,213-254` 驗證新增預設 0 但只送出自訂 12、編輯 9 改 15，以及負數阻止新增；`src/pages/ProductPage.test.tsx:33-40` 僅斷言初始清單的 0。最新 Plan TASK-005 明訂頁面層測試新增預設 0 的數值 payload、空白 stock 不呼叫 API，以及成功刷新後表格顯示後端 stock。目前這三項沒有直接頁面斷言；純函式的空白驗證和初始清單 0 無法取代新增／刷新資料流測試。

### Expected Behavior / Suggested Area To Fix

在 ProductPage 測試補足預設 0 提交、空白 stock 阻止 service 呼叫，以及新增或編輯成功後使用刷新結果的非零 stock 顯示於目標商品列。保留既有詳情 id、Session、refresh 失敗與頁碼測試。

### Resolution

Status: OPEN。待 Programmer 補測後複審。
