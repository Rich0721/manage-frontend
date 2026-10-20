# 04 - Sell Page Implementation Plan

## I. Requirement Information

- Feature Name：`Features/Document/04-Sell Page.md`
- Scenario：`Features/Document/Scenarios/04-Sell Page/01-Sell Page.feature`
- Flow：`Features/Document/flows/04-Sell Page/01-Sell Page.mmd`
- Requirement Type：**New Requirement**。現有應用只有登入與商品管理，沒有販售頁或建立訂單流程。
- Plan Date：2026-10-20
- Plan Status：**Development Complete / Awaiting Code Review**。TASK-001、005 的 Review Fix 已完成並待複審；TASK-002～004 維持已通過。桌面／窄畫面瀏覽器截圖與 Figma 視覺對照仍未執行。

## II. Requirement Summary

登入使用者可由 Header 切換至商品販售。鍵盤或 USB 掃描器輸入 13 碼商品 ID 後查詢商品；同 ID 合併數量並保留既有行調整價格。商品行可改數量與調整價格、刪除；合計由各行計算。右側金額資訊可調整結帳金額，結帳須二次確認；成功清空，失敗保留；清空操作重置列表及金額。

### 需求釐清與決議

| ID | 問題 | 影響 |
|---|---|---|
| OQ-001 | **已確認**：`orderItems.discount` 傳各商品調整後單價，`totalAmount`＝Σ(`orderItems.discount` × `quantity`)，是包含單品調價的訂單原價；`totalDiscount` 傳整單調整後的實際成交價。整單成交價可以高於商品合計，無需分攤至商品行。`orderItems.price` 依 API 範例傳查詢所得商品原價。 | TASK-002 payload、TASK-005 結帳、對應測試。 |
| OQ-002 | **已確認**：PM 指定商品行調整價格不可為 0；與 Gherkin 的非法價格範例一致。 | TASK-003 驗證及測試。 |
| OQ-003 | **已確認**：整單調整價格只允許正整數；0、負數、小數及非數字輸入需還原原值。 | TASK-004 欄位驗證、TASK-005 payload。 |

以上決議來自本次 PM 回覆；Figma 範例數值不作為 Business Rule。需求文件與 Gherkin 尚未同步更新，日後若文件調整應先進行差異分析。

## III. Existing System / Impact Analysis

- React 18、TypeScript、Vite；`src/App.tsx` 以 session state 決定顯示 `HomePage` 或 `ProductPage`，沒有 routes 目錄／路由器。新頁面沿用此頁面切換方式，不為本需求引入路由依賴。
- `src/components/SiteHeader/SiteHeader.tsx` 目前只有「商品管理」、「權限管理」、「登出」，activePage 只有 `auth | products`。需增加販售入口、目前頁面狀態和切換回商品管理的操作。登入狀態與登出由 App 統一處理。
- `src/services/product-service.ts` 已有 `getProduct(session, productId, signal)`，URL 為 `/productController/getProducts?productId=...`，並驗證單筆回應；可直接重用，不另建查詢端點。`Product`、`AuthSession` 在 `src/types/auth.ts`。`src/services/api-response.ts` 從 HTTP response headers 讀 Status／Message。401 的會話失效與 AbortController 模式可沿用。
- 可重用 `src/components/Button/Button.tsx` 與 `src/components/Modal/Modal.tsx`。商品管理的 `ProductTable` 職責及欄位不同，販售表格應另建元件。`src/pages/ProductPage.css`／Header CSS 供視覺慣例參考。
- Figma 節點 `64:279`、`69:466`、`69:486` 已透過 `get_design_context` 核對：Header 下方為左側商品表格與右側金額區塊；表格有商品 ID、價格、調整價格、數量、總價格及刪除操作；右側有商品 ID、總價格、調整價格、結帳與清空。需求另明列商品名稱，應保留可見欄位。使用專案 CSS 和既有元件實作，不引入 Tailwind。參考圖中的單一刪除圖示若使用設計資產，實作時依 Figma 資產下載規範儲存本機並核對位置。
- API／Database／Configuration：新增前端 `POST /sellController/sellProduct`；沒有資料庫、環境設定或套件變更。既有商品 CRUD 與登入流程須保持相容。

## IV. Requirement List

| Task ID | Component Name | Plan Type | Plan Date | Implentation Status | Development Date | Code Review Date |
|---|---|---|---|---|---|---|
| TASK-001 | 頁面切換與 Header | MODIFY | 2026-10-20 | DEVELOPED DONE | 2026-10-20 | 2026-10-20 |
| TASK-002 | 訂單 API Service 與型別 | ADD | 2026-10-20 | DONE | 2026-10-20 | 2026-10-20 |
| TASK-003 | 商品資訊表格 | ADD | 2026-10-20 | DONE | 2026-10-20 | 2026-10-20 |
| TASK-004 | 金額資訊與輸入 | ADD | 2026-10-20 | DONE | 2026-10-20 | 2026-10-20 |
| TASK-005 | 販售頁協調與結帳 | ADD | 2026-10-20 | DEVELOPED DONE | 2026-10-20 | 2026-10-20 |

## V. Technical Stack / System Design

- TypeScript、React 18、Vite 7.3.1、原生 CSS、Vitest 與 React Testing Library；使用既有固定版本，無新依賴。
- 販售頁以商品 ID 為 key 保持購物清單。每行至少保有查詢所得商品、調整單價及數量；顯示單行總價格＝調整單價 × 數量，商品總價＝所有行總價之和。整單調整價為另一輸入值，不覆寫商品行價格。`orderItems.price` 傳商品原價，`orderItems.discount` 傳商品調整單價，`totalAmount`＝Σ(調整單價 × 數量)，`totalDiscount` 傳整單實際成交價。改行／刪行／新增同 ID 後依需求重算商品總價及整單調整價；明確的重新計算行為以需求中「重新輸入商品 ID 會重新計算」及 Gherkin 的改行、刪行範例為準。
- 商品 ID 僅在達 13 碼時自動查詢；鍵盤輸入與掃描器作為同一輸入來源處理。查詢載入、重複輸入與非同步完成順序須避免同一掃描被重複加入及舊請求覆蓋新狀態；卸載／切頁時取消待處理請求。
- API 認證資料放 HTTP request headers：`Content-Type: application/json`、`Uid`、`Authorization`。JSON body 僅含 `{ body: { info: ... } }`；回應中的範例 `headers` 不作為 HTTP headers 替代來源。成功需 HTTP 200 及有效回應。401 交 App 清除 session；其餘失敗保留清單與金額並顯示錯誤。對逾時／網路中斷的訂單提交，不自動重送，避免可能的重複訂單；結果不明時保留內容供使用者確認。

## VI. Implementation Steps

### TASK-001 頁面切換與 Header

- **File / Target**：`src/App.tsx` 的 `App`；`src/components/SiteHeader/SiteHeader.tsx` 的 `SiteHeader`；同目錄 `SiteHeader.css`、`SiteHeader.test.tsx`；`src/App.test.tsx`。
- **Plan Type / Current Behavior**：MODIFY；登入後只顯示 `ProductPage`，Header 沒有販售入口。
- **Expected Behavior / Implementation**：在 App 的已登入分支管理 `products | sell` 畫面狀態並傳切換 callback；Session 失效或登出後回登入，販售狀態不跨使用者保留。擴充 SiteHeader 的 activePage 與商品管理／販售入口，標示目前頁。`ProductPage` 現有 Header 呼叫需接收切換 callback；新頁沿用同一 Header。
- **Reuse / Impact**：沿用 App 的 `AuthSession`、`handleLogout`、`handleSessionExpired` 與 Header/Button；不新增路由套件，不改商品 CRUD。
- **Error Handling / Testing**：登入狀態之外不顯示販售頁；測試登入後兩頁切換、登出／401 返回登入及 Header active 狀態。

### TASK-002 訂單 API Service 與型別

- **File / Target**：新增 `src/services/sell-service.ts` 的訂單建立函式及 `src/services/sell-service.test.tsx`；若多模組共用訂單型別，新增 `src/types/sell.ts`。
- **Plan Type / Current Behavior**：ADD；目前沒有訂單 API 服務。
- **Expected Behavior / Implementation**：`POST /sellController/sellProduct`，以 App session 傳 Uid／Authorization HTTP headers，以 `body.info` 傳 `totalAmount`、`totalDiscount`、`orderItems`。每筆 item 傳 `productId`、`quantity`、商品原價 `price`、調整單價 `discount`；`totalAmount`＝Σ(`discount` × `quantity`)，`totalDiscount` 傳整單實際成交價。Service 只處理 HTTP、格式檢查與錯誤分類，不管理 React state。核對 200、401、400、非預期 HTTP、網路、逾時與無效 JSON／缺少必要訂單欄位。
- **Reuse / Impact**：沿用 `src/services/product-service.ts` 的 fetch／AbortController／30 秒 timeout 模式及 `api-response.ts` 的 HTTP header 處理；不可直接重用未匯出的 request 私有函式或修改既有商品 API 行為。
- **Error Handling / Testing**：mock fetch 驗證 URL、method、HTTP headers、無 JSON `headers` 封包、body.info 與成功／錯誤映射；以數量 2、原價 200、調整單價 150、整單成交價 400 驗證 item `{ price: 200, discount: 150, quantity: 2 }`、`totalAmount: 300`、`totalDiscount: 400`。401 可辨識；失敗不可回傳假成功。

### TASK-003 商品資訊表格

- **File / Target**：新增 `src/components/SellProductTable/SellProductTable.tsx`、`.css`、`.test.tsx`；必要的純輸入驗證可置於 `src/pages/sell-validation.ts` 及對應測試。
- **Plan Type / Current Behavior**：ADD；現有 `ProductTable` 是管理列表，沒有販售數量與調價欄位。
- **Expected Behavior / Implementation**：顯示商品 ID、名稱、原價、調整單價、數量、行總價與 Delete；ID／名稱／原價／行總價唯讀。調整單價預設原價，同 ID 重掃只加數量且保留已調單價。數量預設 1，合法非負整數；輸入 0 刪行；負數、小數、非數字還原原值。調整單價只允許正整數；0、負數、小數與非數字還原原值。修改、刪除後通知 Page 更新清單及合計，列表 key 使用商品 ID。
- **Reuse / Impact**：使用 `Product` 與 Button；不修改管理用 `ProductTable`。
- **Error Handling / Testing**：依 Gherkin 驗證新增、重複合併、刪行、數量 0、合法改價／改量、0／負數／小數／非數字價格還原及計算。

### TASK-004 金額資訊與輸入

- **File / Target**：新增 `src/components/SellAmountPanel/SellAmountPanel.tsx`、`.css`、`.test.tsx`。
- **Plan Type / Current Behavior**：ADD；目前沒有掃碼與金額區塊。
- **Expected Behavior / Implementation**：呈現商品 ID 輸入、唯讀商品合計、可編輯整單調整價、結帳及清空。掃描器的鍵盤輸入與手動輸入共享 13 碼觸發規則；未達 13 碼不查詢。空列表時調整價與結帳 disabled，顯示金額 0。整單調整價只允許正整數；0、負數、小數、非數字均恢復原值。清空按鈕交 Page 重置。
- **Reuse / Impact**：Button；API 查詢仍由 Page 呼叫既有 `getProduct`，Panel 不直接 fetch。
- **Error Handling / Testing**：測試 13 碼觸發一次、非法輸入還原、空列表 disabled、按鈕 callback、金額變動顯示。未指定的 ID 字元集合與超長輸入不自行衍生 Business Rule。

### TASK-005 販售頁協調與結帳

- **File / Target**：新增 `src/pages/SellPage.tsx`、`SellPage.css`、`SellPage.test.tsx`；使用 `src/services/product-service.ts` 的 `getProduct` 與 TASK-002 訂單服務；`src/components/Modal/Modal.tsx` 不需修改。
- **Plan Type / Current Behavior**：ADD；目前沒有販售 state、確認視窗或結帳流程。
- **Expected Behavior / Implementation**：持有商品清單、查詢中、查詢／結帳錯誤、整單調整價、確認視窗與送出中狀態。13 碼商品 ID 查詢成功後新 ID 新增、舊 ID 加一；404 顯示商品不存在且保留清單。改行、刪行、重掃或清空時重算；清空與結帳成功均重置清單和金額。點結帳時 Modal 顯示「訂單金額為<調整後的總價格>，請確認是否要結帳」；取消關閉並保留資料；確認後只送一次訂單，成功清空，非 200 顯示訂單建立失敗並保留。建立訂單時按 TASK-002 的公式傳商品行資料、`totalAmount` 與整單實際成交價 `totalDiscount`。
- **Reuse / Impact**：既有 `getProduct`、`Modal`、`AuthSession`、App 401 callback；不新增庫存扣減或查詢功能，因需求未規定。
- **Error Handling / Testing**：依 Gherkin 驗證成功、404、401、查詢／建立失敗、取消無 request、送出中防重複、成功／失敗清單保留規則及登出時取消未完成請求。對非 200 與網路失敗保留表單；不擅自重試建立訂單。

### 執行順序與驗證

1. 人工 Review 本計畫與 PM 的 OQ-001～003 決議。
2. Review 完成後，Programmer 依 TASK-001 → 002 → 003／004 → 005 實作；只改列明範圍，必要的新檔位於既有架構目錄，禁止 `index.ts` 入口檔。
3. 執行定向 Vitest、`npm test`、`npm run build`、`npm run lint`；核對桌面與窄畫面中表格／金額區及 Modal 互動，對照已讀取的 Figma 節點。後端整合驗證需實際 API 環境，不能以 mock 測試宣稱完成。

## VII. Review Status / Plan Validation

- [x] Requirement Type、現有架構與可重用模組已確認。
- [x] API、Database、Configuration、Dependency、相容性及錯誤處理影響已列出。
- [x] 需求各主要互動已對應 Task 與測試策略。
- [x] OQ-001～003 已由 PM 定案並記錄於本計畫；原需求文件尚未同步。
- [x] 金額 payload／驗證規則已完成 Plan Validation。
- [x] Implementation Plan 已完成人工審核。
- [x] Development 完成。
- [ ] Code Review 通過。

### Programmer Handoff（2026-10-20）

五項 Task 已依計畫實作並標記 `DEVELOPED DONE`。`npm.cmd test`：26 個測試檔、257 項通過；`npm.cmd run build` 與 `npm.cmd run lint` 通過。瀏覽器桌面／窄畫面與 Figma 視覺核對尚未執行；本次 `cua` 瀏覽器清單為空且無法建立 `iab`，請 Code Reviewer 在可用瀏覽器環境補核對。未驗證真實後端訂單整合。

### Code Review（2026-10-20）

五項 Task 審查結果均為 `REVIEW FIX`，Review Status 為 `OPEN`；問題與修正範圍記錄於 `Features/Review/04-Sell Page/TASK-001.md` 至 `TASK-005.md`。主要缺陷為快速掃碼可能遺漏商品，以及訂單送出期間仍可變更清單而導致已提交內容與成功後清空內容不一致。另有明訂測試缺口及商品行 key 與計畫不符。Reviewer 執行 5 個相關測試檔、37 項通過；因沙箱限制，測試在核准的沙箱外執行。未進行桌面／窄畫面與 Figma 視覺核對，也未驗證真實後端整合。

### Programmer Review Fix Handoff（2026-10-20）

五項 Task 已完成 Review Fix，狀態更新為 `DEVELOPED DONE`，Review Status 維持 `OPEN` 等待複審。掃碼查詢改為各自追蹤並允許並行完成，清空／卸載時取消全部待處理查詢；查詢期間停用結帳，確認視窗與送出期間鎖定商品清單，避免訂單快照外的變更被成功回應清除。商品表格使用商品 ID 作為 key，行內草稿依外部價格／數量更新同步。補足 App 販售頁 Session 401／登出取消測試、訂單服務逾時／協定／HTTP 測試、表格／整單非法輸入及結帳互動測試。驗證：`npm.cmd test -- --run`（26 個檔案、279 項通過）、`npm.cmd run lint` 通過、`npm.cmd run build` 通過。視覺與真實後端整合仍待環境可用後驗證。

### Code Review 複審（2026-10-20）

TASK-002、003、004 的原 Review Issue 已解決，Review Status 更新為 `RESOLVED`，Implementation Status 更新為 `DONE`。TASK-001 的單筆販售查詢 401／登出測試已補齊，但並行查詢同時回傳 401 時，Session 失效回呼可能重複顯示提示；TASK-005 的一般查詢失敗、清空／待處理查詢及真正送出期間防重複回歸仍未覆蓋。兩項維持 Review Status `OPEN`、Implementation Status `REVIEW FIX`。已核對 Programmer 提供的全套 279 項測試、Lint 與 Build 通過紀錄；本次複審未修改或重跑程式與測試。視覺及真實後端整合仍未驗證。

### Programmer Review Fix Handoff（2026-10-20，複審修正）

TASK-001 對同一登入狀態的 Session 失效處理加入冪等保護，新增 App 整合測試：兩筆並行販售查詢同時回傳 401 時只清除 Session 並顯示一次提示。TASK-005 新增一般查詢錯誤下保留商品與調整金額的測試、實際頁面結帳按鈕送出期間停用及僅呼叫一次 API 的測試，以及清空重置清單／金額並忽略晚到查詢結果的測試。驗證：定向測試 2 個檔案、34 項通過；全套測試 26 個檔案、282 項通過；`npm.cmd run lint`、`npm.cmd run build` 及 `git diff --check` 通過。TASK-001、TASK-005 標記 `DEVELOPED DONE`，Review Status 維持 `OPEN` 等待複審。
