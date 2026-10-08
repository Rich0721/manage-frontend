# TASK-002 Implementation Issue

Status: RESOLVED

## Task ID

TASK-002

## Issue

使用者確認原需求書登入 request 撰寫錯誤，並已修正 `Features/Document/02-LoginAndLogout.md` 的 2-2-1 為 body.info。問題類型：Requirement Definition Correction；須同步 Plan 並重新判定舊 Review 的適用範圍。

## Existing Behavior

`src/services/auth-service.ts` 與 `src/types/auth.ts` 已使用 body.info；`src/services/auth-service.test.tsx` 仍以 body 直屬欄位斷言普通／強制登入。HomePage 傳入表單值並由 service 序列化，App 使用 AuthSession，代理只透傳電文。

## Plan Definition

更新後登入 request 為 `{ body: { info: { email, password: passwordHash, isForceLogin } } }`。isForceLogin 是 boolean；HTTP headers 與 JSON body 分離。response、強制重送、授權及 Session 規則不變。

## Why Implementation Cannot Continue

若繼續依舊 Review 第 1 項修改為平坦 body，將再次違反已修正需求。此衝突已透過 Plan Update 排除。

## Suggested Area To Review

TASK-002 的 request 測試預期；其餘六項 Task 的介面依賴與既有 Review 是否仍成立。

## Resolution

2026-10-08 System Design 已更新 Plan 的 API 映射、TASK-002 delta 及七項任務影響表。TASK-002 改為 PLAN UPDATED，清除 Development／Code Review Date。既有服務／型別的 body.info 符合新需求，不需改回舊結構；測試須同步。原 Review 第 2／3 項錯誤分類與缺漏測試仍有效；Review 的 OPEN 狀態不由本次設計分析關閉。

其他 Task 無新增設計變更；TASK-006 原代理測試補強仍需處理，新增登入 fixture 遵循最新契約。未修改應用程式、測試或需求文件；本次 Plan Update 待確認後交 Programmer。
