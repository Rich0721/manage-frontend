# TASK-003 Code Review

Status: RESOLVED

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

## Programmer Fix Handoff（2026-10-20）

`SellProductTable` 使用商品 ID 作為行 key，並以來源值衍生顯示草稿，讓外部掃碼合併數量後草稿同步且保留未提交的調價。補上負數、小數、非數字數量還原測試及行更新期間草稿／焦點保留測試。完整測試套件 279 項通過，Lint 通過。Review Status 維持 `OPEN`，等待 Code Reviewer 複審。

## 2026-10-20 複審

Review Status：`RESOLVED`；Implementation Status：`DONE`。`SellProductTable.tsx:67` 已用商品 ID 作為 key；行內草稿依目前商品值決定顯示，重掃更新數量時可保留未提交的調價，數量輸入同步顯示新值。表格測試直接驗證負數、小數、非數字還原及行更新時焦點／草稿保留；頁面測試驗證重掃數量及合計。原兩項 Review Issue 已解決。採用 Programmer 提供的全套 279 項通過、Lint 與 Build 通過結果，本次未重跑。

## 2026-10-20 簡易測試修正審查

Review Status：`RESOLVED`；Implementation Status：`DONE`。價格與數量欄位失焦時，相同有效值不再通知 Page；非法值仍還原，實際變更仍通知更新。刪除按鈕使用既有 `/icon/delete.png`，保留商品 ID 的可存取名稱及原點擊、停用行為。表格與頁面測試覆蓋相同值、非法值與實際改動；Reviewer 重跑相關 3 個測試檔，共 35 項通過。未發現新問題。
