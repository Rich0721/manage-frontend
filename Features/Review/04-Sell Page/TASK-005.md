# TASK-005 Code Review

Status: OPEN

## Task ID

TASK-005

## Review Result

未通過；販售頁存在掃碼與結帳期間的狀態競爭，並缺少計畫指定的回歸測試。Code Review Date：2026-10-20。

## Implementation Plan

13 碼掃碼成功後新 ID 新增、舊 ID 加一；非同步完成順序不得遺漏掃描或讓舊結果覆蓋新狀態。確認後只建立一次訂單；成功清空、失敗保留。測試 404、401、查詢／建立失敗、防重複送出、清單保留及登出取消未完成請求。

## Existing Implementation

`SellPage.tsx` 的每次查詢先取消前一筆，再以最新 request id 接受結果。結帳時複製當時清單為訂單 payload；訂單送出期間只有整單調整價、結帳與清空按鈕 disabled，商品 ID 輸入及表格仍可操作。成功回應會清空當時整份清單。

## Review Issue

1. `src/pages/SellPage.tsx:60-76`：第一筆 13 碼商品尚未查完就掃入第二筆時，第二次呼叫會取消前一筆，第一筆永遠不進清單；同 ID 快速重掃也只加一次。這與每次有效掃描都應新增／合併的計畫行為不符。`SellPage.test.tsx:38-55` 只測循序重掃，無法發現此情況。
2. `src/pages/SellPage.tsx:103-116,138-142`：訂單送出後仍可掃碼、調整商品行或刪行，但成功回應一律 `replaceItems([])`。送出期間新加入或變更、卻不在已提交 payload 內的商品資料會被清除。若期間又有未完成的商品查詢，成功清空後查詢結果仍可能重新加入清單。這使「成功清空」與實際送出的訂單內容不一致，並可能造成資料遺失。
3. `src/pages/SellPage.test.tsx` 缺少 TASK-005 指定的 404、401、查詢失敗、重複確認防重送、送出中狀態及登出／卸載取消未完成請求測試；現有建立失敗案例只覆蓋一般 `Error`。

## Expected Behavior

有效掃描在非同步查詢交錯時仍各自正確新增或合併，同一掃描不重複加入；結帳期間購物清單與訂單快照保持一致，成功／失敗的清單處理符合實際提交內容；明訂錯誤與取消路徑有頁面測試。

## Suggested Area To Fix

檢查 `SellPage` 的查詢生命週期、送出期間清單編輯與查詢回應處理；以可控制完成順序的 service mock 補強 `SellPage.test.tsx`，涵蓋快速掃碼、送出期間變更、成功／失敗與上述錯誤邊界。

## Resolution

Status: OPEN。待 Programmer 修正並補測後複審。
