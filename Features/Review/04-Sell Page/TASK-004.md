# TASK-004 Code Review

Status: OPEN

## Task ID

TASK-004

## Review Result

未通過；Missing Test。Code Review Date：2026-10-20。

## Implementation Plan

金額區塊須在 13 碼時觸發一次查詢，整單調整價只允許正整數，0、負數、小數及非數字須還原；空清單停用調整價與結帳，並測試按鈕 callback 與金額顯示。

## Existing Implementation

`SellAmountPanel.tsx` 有 13 碼觸發、整單價格提交／還原及 disabled 邏輯。`SellAmountPanel.test.tsx` 驗證 13 碼、唯讀總價、400 提交、小數還原，以及空清單清空 callback。

## Review Issue

`src/components/SellAmountPanel/SellAmountPanel.test.tsx` 未驗證整單調整價輸入 0、負數及非數字時還原且不呼叫 callback；也未驗證結帳按鈕 callback。這些是 TASK-004 明訂的元件互動，現有純函式驗證與 Page 成功結帳測試不能完全覆蓋 Panel 的輸入／按鈕邊界。

## Expected Behavior

元件測試覆蓋所有明訂非法整單價格及結帳 callback，並確認非法值不送給 Page。

## Suggested Area To Fix

補強 `src/components/SellAmountPanel/SellAmountPanel.test.tsx`；若測試揭露正式程式問題，再修正元件。

## Resolution

Status: OPEN。待 Programmer 補測後複審。
