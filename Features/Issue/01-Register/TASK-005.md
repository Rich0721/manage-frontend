# TASK-005 Implementation Issue

Status: RESOLVED

## Task ID

TASK-005

## Issue

類型：Requirement／API Contract。最新使用者提供的實際失敗回應採 `header.Status: "Failed"` 與 `header.Message`，而現有需求與實作計畫記載小寫 `header.status`／`header.message`。計畫另要求成功回應具有 `body.info.uid`、`email`、`username`，但近期實作為避免已成功註冊卻顯示伺服器異常，已改為依成功狀態與訊息判斷，不再強制檢查這些欄位。

## Existing Behavior

`src/services/api-response.ts` 同時接受兩種欄位大小寫；`src/services/register-service.ts` 以 `success`／`failed` 狀態和訊息決定頁面結果，成功時不依賴 `body.info`。

## Plan Definition

`Features/Plan/01-Register.md` TASK-005 指定解析小寫 `status`／`message`，並檢查成功回應的 `uid`、`email`、`username` 型別。

## Why Implementation Cannot Continue

目前無法僅依現有 Plan 判斷哪些回應格式是正式合約、哪些只是相容處理。這屬 API Contract 與 Plan 更新問題，Code Reviewer 不應自行改寫 Requirement 或要求 Programmer 猜測後端成功回應格式。

## Suggested Area To Review

請 System Design Agent 依使用者提供的實際 API 回應確認正式的 `Status`／`Message` 大小寫、成功回應 `body.info` 的必要欄位，以及非 2xx 時的訊息處理；同步更新需求情境與 Implementation Plan。請保留已確認的「失敗後可修改資料並再次提交」行為。

## Resolution（2026-10-07）

- 依最新需求與本輪指示更新 TASK-005，狀態為 PLAN UPDATED，清除舊 Development Date／Code Review Date。
- 請求姓名固定為 body.info.userName。Content-Type 僅透過 fetch HTTP headers 傳送；JSON 僅保留 body.info，不含 header 或 headers。
- 共用解析器支援最新 JSON headers.status/message，保留既有 header.Status/Message 與小寫格式相容；優先順序、無效型別與非 2xx 訊息處理已明定於計畫。
- 依既有重試需求，成功依狀態與訊息判定，未使用的 body.info 不作為成功門檻；回應姓名 key 為 userName。
- 舊 Review 要求補回 JSON header／username 的項目由本次契約修訂取代；Programmer 需同步型別、共用解析器與測試，Code Reviewer 再依新契約複查。Issue 結案代表設計問題解決，不代表實作或 Review 已通過。
- 本輪完成計畫更新，保持 System Design 角色，尚未執行 Programmer 實作或測試。
