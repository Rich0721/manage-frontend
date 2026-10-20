# TASK-003 Code Review

Status: OPEN

## Task ID

TASK-003

## Review Result

未通過；Implementation 與 Plan 不一致，並缺少輸入回歸測試。Code Review Date：2026-10-20。

## Implementation Plan

商品表格按商品 ID 維持列表 key；調整單價須為正整數，數量須為非負整數，非法值還原；改價、改量與刪行後通知 Page 重算。

## Existing Implementation

`SellProductTable.tsx` 的 `SellProductRow` 使用元件內 state 保存尚未提交的輸入。價格與數量在 blur 時提交，數量 0 刪行；列表的 key 同時包含商品 ID、調整單價與數量。

## Review Issue

1. `src/components/SellProductTable/SellProductTable.tsx:62` 的 key 為 `${item.product.id}:${item.adjustedPrice}:${item.quantity}`，與 TASK-003 明訂的「列表 key 使用商品 ID」不一致。價格或數量變動時 React 會卸載舊行並建立新行，行內草稿 state 與焦點因此失去穩定性；重掃同商品也會觸發重新掛載。
2. `src/components/SellProductTable/SellProductTable.test.tsx` 只直接測試數量 0，沒有驗證負數、小數、非數字數量輸入會還原原值且不呼叫 `onChange`。純驗證函式測試無法確認表格輸入互動。

## Expected Behavior

同一商品行在調價、改量或重掃後保持穩定的商品 ID key；非法數量輸入不改變行資料與合計。

## Suggested Area To Fix

檢查 `SellProductTable` 的行 key 與草稿同步行為，補足表格非法數量互動測試。

## Resolution

Status: OPEN。待 Programmer 修正並補測後複審。
