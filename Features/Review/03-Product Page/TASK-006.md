# TASK-006 Code Review

Status: RESOLVED

## Task ID

TASK-006

## Review Result

未通過。批次管理及下載占位的必要互動測試未完整執行。Code Review Date：2026-10-13。

## Implementation Plan

批次管理開啟原生 Excel 選檔；選取、取消及重選相同檔案皆不發 API。下載模板／報表維持 disabled 占位，左右箭頭使用本地 Figma 資產；需驗證相關互動。

## Existing Implementation

`ProductPage.tsx` 具備 file input、清空 value 與 disabled 下載按鈕；左右箭頭檔案存在並由 `ProductTable.tsx` 引用。`ProductPage.test.tsx` 只測試觸發一次 file input change 後不呼叫新增 API。

## Review Issue

現有測試沒有驗證批次管理按鈕實際觸發選檔、取消／重選同一檔案不發任何產品 API、下載占位不可觸發；`reset input` 的目的也沒有可觀察回歸測試。計畫列出的瀏覽器人工視覺驗收尚未完成，本次審查不視為已驗證。

## Expected Behavior

以可觀察的 UI 與 API 副作用測試完整覆蓋選檔／重選與 disabled 占位；視覺驗收依計畫另行確認。

## Suggested Area To Fix

補充 `ProductPage.test.tsx` 的批次入口與下載占位案例，並確認資產在實際畫面的幾何位置。

## Resolution

Status: RESOLVED。2026-10-13 複審：測試確認批次按鈕觸發檔案選擇、重選同一檔案後 input 清空、商品 mutation API 無副作用及下載按鈕 disabled；左右箭頭使用本地資產。程式碼複審通過；Figma 畫面幾何仍需依計畫另作瀏覽器人工驗收。

## 2026-10-13 本次 Plan 更新複審

Review Status：`RESOLVED`；Implementation Status：`DONE`；Code Review Date：2026-10-13。下載區移除負 margin，與操作按鈕保持正向垂直間距，窄螢幕允許換行；兩個下載入口仍為 disabled。原選檔、重選及無產品 API 副作用的測試保留。依最新 Plan，TASK-006 桌面／窄螢幕及 Figma 視覺驗收暫緩，不作本輪審查門檻；本次未宣稱視覺驗收通過。未發現其餘待修問題。
