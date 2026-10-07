# 01-Register Code Review 總結

Review Date: 2026-10-07

Result: Review Failed

## 審查範圍

依 `Features/Plan/01-Register.md` 審查 `DEVELOPED DONE` 的 TASK-001 至 TASK-006。TASK-007 仍為 `PLAN UPDATED`，不在本次可結案的 Review 範圍。

## 驗證結果

- `npm run test`：45 項中 44 項通過、1 項失敗。失敗案例為 `registerUser > posts a JSON envelope with hashes and maps name to username`，在 `src/services/register-service.test.tsx:49` 讀取不存在的 `payload.header` 時失敗。
- `npm run lint`：通過。
- `npm run build`：TypeScript 編譯與 Vite production build 通過。
- 本次未取得 Vite proxy 至可控制後端、Docker/nginx、真實後端回應或瀏覽器端對端驗證結果。這些檢查不能以單元測試或 build 通過替代。

## Task 結果

| Task | 結果 | 理由 |
|---|---|---|
| TASK-001 | REVIEW FIX | 缺少計畫要求的開發代理轉發驗證紀錄 |
| TASK-002 | DONE | 單頁模式切換、取消舊請求與登入版面符合本次審查範圍 |
| TASK-003 | REVIEW FIX | 確認密碼長度與 Unicode 邊界測試不足 |
| TASK-004 | DONE | 共用欄位、錯誤語意與切換按鈕符合本次審查範圍 |
| TASK-005 | REVIEW FIX | Request Body 缺少 `header` 且使用 `userName`，違反 API 合約並造成測試失敗 |
| TASK-006 | REVIEW FIX | 缺少修改 Email 後第二次提交新值的頁面回歸斷言 |
| TASK-007 | PLAN UPDATED | 尚未進入 Code Review |

各待修正項目詳見同目錄的 Task Review。API 回應格式與目前 Plan 的差異另記於 `Features/Issue/01-Register/TASK-005.md`，需由 System Design 確認。
