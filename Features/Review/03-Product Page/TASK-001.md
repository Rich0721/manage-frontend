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

## 2026-10-13 本次 Plan 更新複審

Review Status：`RESOLVED`；Implementation Status：`DONE`；Code Review Date：2026-10-13。`parseProduct` 僅對未提供的 stock 補 0，已提供的欄位仍驗證 Number、finite 與非負；新增／更新以明確欄位映射排除 stock。服務測試涵蓋清單／詳情／mutation 缺省、有效與非法 stock，以及請求內容不送 stock。未發現本次差異的待修問題。

## 2026-10-14 Get Product URI 更正審查

Review Status：`OPEN`；Implementation Status：`REVIEW FIX`；Code Review Date：2026-10-14。

### Review Issue

`src/services/product-service.ts:95`：抽取共用 `requestResponse()` 後，JSON body 解析失敗的既有訊息由「產品回應不是有效 JSON」改為「產品回應內容格式錯誤」。最新 Plan TASK-001 要求保留原查詢的錯誤行為，且此訊息會由 ProductPage 顯示。現有測試僅檢查 `kind: 'protocol'`，未發現此回歸。

### Expected Behavior / Suggested Area To Fix

保留既有 JSON 解析錯誤訊息與取消／逾時分類，同時讓 Blob 讀取失敗有合適的訊息。檢查 `requestResponse()` 與 JSON request 呼叫端，補對應回歸測試。共用 URI、單筆陣列解析、mutation 物件解析及編碼本身已符合本輪 Plan，無需重作。

### Resolution

Status: OPEN。待 Programmer 修正並重新驗證。

## 2026-10-14 Review Fix 複審

Review Status：`RESOLVED`；Implementation Status：`DONE`；Code Review Date：2026-10-14。`requestResponse()` 的 JSON 讀取失敗預設訊息已恢復為「產品回應不是有效 JSON」，Blob 讀取失敗則使用檔案專屬訊息；服務測試明確斷言兩者，既有取消／逾時分類未被更動。原 Review Issue 已解決。

## 2026-10-14 Stock 契約審查

Review Status：`OPEN`；Implementation Status：`REVIEW FIX`；Code Review Date：2026-10-14。先前已解決的 Issue 不重開。

### Review Issue（Missing Test）

`src/services/product-service.test.tsx:132-143` 已驗證缺省、null、字串及負數 stock，但沒有驗證最新 Plan TASK-001 明列的非有限數值。`parseProduct()` 已使用 `Number.isFinite`，本次缺的是服務邊界回歸測試；現有 94 項定向測試通過不代表此條件已受測。

### Expected Behavior / Suggested Area To Fix

在產品成功回應測試加入可經 JSON 解析成非有限 Number 的 stock 案例，確認 `getProducts()` 以 `protocol` 拒絕。保留既有清單、詳情、mutation、HTTP 及取消／逾時測試。

### Resolution

Status: OPEN。待 Programmer 補測後複審。

## Programmer Fix Handoff（2026-10-14）

已新增成功清單回應包含 JSON `1e999` stock 的案例；`getProducts()` 必須以 `protocol` 拒絕非有限 Number。四個相關測試檔合計 99 項通過，lint 通過。Review Status 保持 `OPEN`，等待 Code Reviewer 複審。

## 2026-10-14 Stock Review Fix 複審

Review Status：`RESOLVED`；Implementation Status：`DONE`；Code Review Date：2026-10-14。核對成功清單回應的 JSON `1e999` 測試確實經 `getProducts()` 與 `parseProduct()`，非有限 Number 以 `protocol` 拒絕。原缺測已補足，既有欄位及 payload 回歸保留；前次定向測試 99 項與 lint 通過，本次未重跑。
