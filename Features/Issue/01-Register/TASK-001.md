# TASK-001 Implementation Issue

Status: OPEN

## Task ID

TASK-001

## Issue

類型：System Design／Implementation Plan 不一致。最新 TASK-001 計畫要求只有明確設定 API_UPSTREAM 時才啟用開發代理，未設定時不提供開發後端代理；但目前 Vite 設定與 README 將 http://localhost:8000 作為預設上游。此前使用者已要求 npm run dev 可使用預設值。

## Existing Behavior

vite.config.ts 定義 DEFAULT_API_UPSTREAM 為 http://localhost:8000，env 未設定時仍建立 /userController proxy。README 亦說明此預設值。src/vite-proxy.test.tsx 以臨時 API_UPSTREAM 啟動 Vite 與受控後端，驗證 POST 原始 URI 與 JSON body 會被轉送。

## Plan Definition

Features/Plan/01-Register.md TASK-001 Implementation 仍描述「在明確設定後」代理，並稱「未設定時 README 明確說明無開發後端代理」。

## Why Implementation Cannot Continue

目前程式行為有使用者明確提出的預設上游需求支持，但與最新 Implementation Plan 的設定邏輯直接衝突。Code Reviewer 不應自行修改計畫或要求 Programmer 猜測預設值是否仍適用。

## Suggested Area To Review

請 System Design Agent 核對既有使用者要求及目前驗證結果，更新 TASK-001 的 API_UPSTREAM 預設行為與測試定義。若計畫需修訂，請依流程將 TASK-001 設為 PLAN UPDATED；完成設計確認前，暫不判定 TASK-001 Review 通過。
