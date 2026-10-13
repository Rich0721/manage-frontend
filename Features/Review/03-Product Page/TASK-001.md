# TASK-001 Code Review

Status: RESOLVED

## Task ID

TASK-001

## Review Result

未通過。HTTP payload 映射、回應數值邊界與讀取 JSON 期間的取消／逾時處理不符合計畫。Code Review Date：2026-10-13。

## Implementation Plan

`body.info` 僅送明列欄位；新增不送 id、更新一次送完整欄位。解析 `cost`／`price`／`stock` 時需為有限的 Number 且符合表單最小值。取消與逾時須能區分，並以相應測試驗證。

## Existing Implementation

`src/services/product-service.ts` 在 `request` 直接序列化呼叫端傳入的 `payload.info`；`parseProduct` 只檢查 Number 與 finite；`response.json()` 的所有失敗均轉成 `protocol`。

## Review Issue

1. `product-service.ts:71,125-132`：`ProductWriteInput` 允許 `id?`，服務直接傳送整個 `input`。新增若收到帶 id 或其他執行期欄位的物件，會送出計畫禁止的欄位；更新也未在服務邊界排除多餘欄位。
2. `product-service.ts:37-42`：清單／詳情／mutation 成功回應接受成本或售價 0、負數及負庫存。`product-service.test.tsx` 甚至以成本 0 作為成功案例，與計畫 IV 節最小值契約相反。
3. `product-service.ts:83-91`：若外部取消或 30 秒逾時發生在讀取 response body 時，JSON 解析失敗先被轉成 `protocol`，後續無法辨識取消或 `timeout`。目前只測試 fetch 尚未回應時的取消／逾時，缺少讀取 body 期間的情境；另缺非法 JSON 與 mutation 回應損壞等計畫列出的測試。

## Expected Behavior

所有操作只送 HTTP 契約欄位；違反數值下限的成功回應視為無效資料；body 讀取期間仍正確傳遞取消或逾時。對應測試應在服務邊界驗證。

## Suggested Area To Fix

檢查 `addProduct`／`updateProduct` payload 建構、`parseProduct`、`request` 的 JSON 讀取與相應服務測試。

## Resolution

Status: RESOLVED。2026-10-13 複審：服務已對新增／更新明確映射契約欄位，回應驗證成本／售價至少 1、庫存至少 0，讀取 JSON 期間可區分外部取消與逾時。服務測試涵蓋多餘欄位、數值下限、非法 JSON、取消／逾時與損壞的 mutation 回應；複審通過。
