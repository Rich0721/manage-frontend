# TASK-002 Code Review

Status: RESOLVED

## Task ID

TASK-002

## Review Result

未通過；Missing Test。Code Review Date：2026-10-20。

## Implementation Plan

訂單服務須驗證 HTTP 200／401／400／其他錯誤、網路、逾時、無效 JSON 及缺少必要訂單欄位；測試 request headers、`body.info` 與數量乘算的金額契約。

## Existing Implementation

`sell-service.ts` 有 30 秒逾時、取消、錯誤分類與回應欄位檢查。`sell-service.test.tsx` 驗證成功 payload、401、400、無效 JSON、網路錯誤及主動取消。

## Review Issue

`src/services/sell-service.test.tsx:19-64` 沒有逾時與「有效 JSON 但必要訂單欄位缺失／格式錯誤」案例，也沒有非 400 的非預期 HTTP 案例。逾時須回報 `timeout` 而非當作主動取消；格式錯誤須拒絕假成功，這些都是 TASK-002 明訂的錯誤邊界，現有測試無法證明。

## Expected Behavior

測試驗證逾時映射為 `timeout`、缺少必要訂單欄位映射為 `protocol`、非預期 HTTP 映射為 `http`，且不回傳成功訂單。

## Suggested Area To Fix

補強 `src/services/sell-service.test.tsx` 的錯誤分類案例；若測試揭露正式程式問題，再修正服務實作。

## Resolution

Status: OPEN。待 Programmer 補測後複審。

## Programmer Fix Handoff（2026-10-20）

`src/services/sell-service.test.tsx` 新增 503 HTTP、有效 JSON 缺少訂單欄位、非法明細及 30 秒逾時案例，逾時使用 fake timers 並確認分類為 `timeout`。完整測試套件 279 項通過。Review Status 維持 `OPEN`，等待 Code Reviewer 複審。

## 2026-10-20 複審

Review Status：`RESOLVED`；Implementation Status：`DONE`。已核對 `sell-service.test.tsx`：503、必要欄位缺失與明細格式錯誤皆拒絕成功回應，fake timers 推進 30 秒後驗證 `timeout`，並保留既有 200／401／400／網路／主動取消及 payload 測試。服務程式的分類與檢查符合本 Task；原 Review Issue 已解決。採用 Programmer 提供的全套 279 項通過、Lint 與 Build 通過結果，本次未重跑。

## 2026-10-20 簡易測試修正審查

Review Status：`RESOLVED`；Implementation Status：`DONE`。`nginx/default.conf.template` 的 `/sellController/` 規則與既有代理一致，`proxy_pass` 不加 URI，可保留原始 `/sellController/sellProduct` 路徑；`vite.config.ts` 同步加入開發代理，README 已更新。Reviewer 啟動 Vite 後以無認證空資料 POST 驗證，收到後端 Uvicorn 的 400 回應及缺少 `Uid` 的驗證訊息，確認開發代理已轉發；未建立訂單。容器環境無 Docker 指令，nginx 實際轉發及真實訂單整合未驗證。未發現程式碼或設定問題。
