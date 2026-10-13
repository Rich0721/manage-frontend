# TASK-004 Code Review

Status: OPEN

## Task ID

TASK-004

## Review Result

未通過。數值下限的錯誤呈現遭原生表單驗證攔截，且共用表單測試缺漏。Code Review Date：2026-10-13。

## Implementation Plan

提交前驗證必填與最小值；成本／售價低於 1、庫存低於 0 時顯示對應欄位錯誤與紅框，保留輸入。ProductForm、Modal、FormField 應有對應測試，包含焦點與鍵盤行為。

## Existing Implementation

`ProductForm.tsx` 的 `handleSubmit` 才呼叫 `validateProduct`，但成本、售價、庫存 input 設有 HTML `min`，form 未使用 `noValidate`；`ProductForm.test.tsx` 不存在，`FormField.test.tsx` 未增加 number 回歸案例。

## Review Issue

`ProductForm.tsx:32-36,49-51`：例如成本輸入 0 時，瀏覽器的 constraint validation 會阻止 `submit` event，`handleSubmit` 不執行，計畫要求的欄位錯誤、紅框及提示都不出現。以 jsdom 表單確認 `input.checkValidity()` 為 false 且 `submit` listener 未觸發。現有純函式驗證測試不足以發現此 UI 行為；Modal 的焦點限制／返回也未由測試覆蓋。

## Expected Behavior

無效數值送出時顯示產品表單定義的欄位錯誤與紅框，保留輸入且不呼叫 API；元件層測試驗證此行為與計畫要求的焦點鍵盤邊界。

## Suggested Area To Fix

檢查 `ProductForm` 的 HTML 驗證與 `validateProduct` 執行順序，補齊 ProductForm、FormField 與 Modal 相關測試。

## Resolution

Status: OPEN。待 Programmer 修正後重新審查。
