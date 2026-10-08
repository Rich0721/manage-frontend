# TASK-006 Code Review

Status: RESOLVED

## Task ID

TASK-006

## 複審結果（2026-10-08）

通過。`vite.config.ts` 與 `nginx/default.conf.template` 保留產品 API 原路徑代理設定；受控 backend 測試現已斷言產品 GET 的完整 URI／query 與授權 request headers、產品 Status／Message、登入 Status／Message／Uid／Authorization response headers，以及 503 狀態／headers／body 透傳；既有註冊 POST 回歸保留。前次同版程式 17 個測試檔、135 項通過，build 與 lint 通過；本次工作樹無程式變更。原 Review 缺漏已補足。nginx 容器執行驗證仍依 Plan 列為環境待驗，未將靜態檢查視為通過。Code Review Date：2026-10-08。

## 初審紀錄（歷史）

## Review Result

未通過。Vite／nginx 產品代理設定已新增，但代理整合測試尚未涵蓋 Plan 明列的關鍵轉送契約。

## Implementation Plan

TASK-006 要求受控 backend 驗證 GET URI 與 `productId=all`、Uid／Authorization、非成功狀態透傳；原有註冊 POST 保留。另須驗證 `/userController` 與 `/productController` 均保留 HTTP response 的 Status／Message，登入另保留 Uid／Authorization。

## Existing Implementation

`vite.config.ts` 與 `nginx/default.conf.template` 已設定產品代理。`src/vite-proxy.test.tsx:228` 的產品測試有檢查授權 request headers 與產品 response Status／Message，但受控 backend 未記錄並斷言收到的 URI／query；亦未驗證非成功狀態、登入 response 的授權 headers 及 userController 的 response headers。

## Review Issue

**必要代理回歸測試不足（中）**：目前測試即使代理改寫 `/productController/getProducts?productId=all` 的路徑或 query，或未透傳非成功狀態與登入授權 response headers，也可能通過。這些都是 TASK-006 的明列驗收項目。

## Expected Behavior

受控 backend 測試須對實際接收的完整 URI／query、授權 request headers、非成功 response，以及兩種 API 的關鍵 response headers 做可觀察斷言。nginx 容器測試仍按 Plan 記錄為環境待驗項，不以靜態檢查冒充已通過。

## Suggested Area To Fix

補強 `src/vite-proxy.test.tsx` 的受控 backend 案例；檢查新增斷言時是否暴露 `vite.config.ts` 的代理缺陷。保留現有註冊 POST 回歸。

## Verification

2026-10-08 執行相關測試時 `src/vite-proxy.test.tsx` 現有案例通過；本次審查未執行 nginx 容器測試。

## Resolution

Status: RESOLVED。初審測試缺漏已於本次複審確認解決。
