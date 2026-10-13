# TASK-003 Code Review

Status: OPEN

## Task ID

TASK-003

## Review Result

未通過。分類輸入的必要行為缺少回歸測試。Code Review Date：2026-10-13。

## Implementation Plan

候選從已載入商品去重；即時篩選、Enter 轉標籤、中文 IME 輸入期間不提交、單一 x 移除、清除所有標籤、逗號格式 round-trip 均需驗證。

## Existing Implementation

`ProductLabelInput.tsx` 實作了候選、Enter、IME 與移除按鈕；`ProductLabelInput.test.tsx` 只涵蓋一般候選、未知標籤、逗號拒絕及全部清除。

## Review Issue

缺少計畫指定的中文 IME Enter、單一標籤 x、候選由載入商品去重，以及多標籤編輯回填／送出 round-trip 測試。這些互動牽涉意外表單提交與 `label_names` 資料完整性；現有兩個案例無法驗證。

## Expected Behavior

相關測試應驗證上述可觀察行為，且不以複製元件內部演算法作為預期值。

## Suggested Area To Fix

補齊 `ProductLabelInput.test.tsx` 與必要的 Page／Form 整合測試。

## Resolution

Status: OPEN。待 Programmer 補測後重新審查。
