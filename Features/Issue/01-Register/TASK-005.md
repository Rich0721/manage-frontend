# TASK-005 Implementation Issue

Status: OPEN

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
