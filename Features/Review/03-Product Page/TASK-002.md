# TASK-002 Code Review

Status: OPEN

## Task ID

TASK-002

## Review Result

未通過。篩選後的頁碼與資料列可能不一致，且分頁邊界測試不完整。Code Review Date：2026-10-13。

## Implementation Plan

表格每頁 15 筆；頁碼必須落在篩選後的總頁數內。篩選改變時回到第一頁；刪除後若頁碼失效須限縮至新的最後頁。測試涵蓋 0、1、15、16、18 筆及兩欄 AND 搜尋。

## Existing Implementation

`src/pages/ProductPage.tsx` 先計算 `filteredProducts` 與 `pageCount`，但 `visibleProducts` 用原 `currentPage` 切片；`refreshProducts` 用未篩選的 `nextProducts.length` 限縮頁碼，傳給表格時才把顯示頁碼取 `Math.min(currentPage, pageCount)`。

## Review Issue

`ProductPage.tsx:72-74,115-116,226`：例如全部 30 筆、篩選後 16 筆且位於第 2 頁，刪除該頁唯一符合項後，未篩選總數仍有 29 筆，`currentPage` 保持 2；畫面顯示 `Pages 1/1`，但 `visibleProducts` 仍切第 2 頁而呈現空表格。現有測試未涵蓋 1／15／16 筆邊界或篩選中刪除造成的頁碼縮減。

## Expected Behavior

資料列切片與顯示頁碼使用同一個有效頁碼；篩選後的刪除與清單刷新不會留下超出範圍的空頁。

## Suggested Area To Fix

檢查 `ProductPage` 的有效頁碼推導、刷新後頁碼處理，以及相關分頁測試。

## Resolution

Status: OPEN。待 Programmer 修正後重新審查。
