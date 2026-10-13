# 03 - Product Page Implementation Plan

## I. Requirement Information

- Feature Name：`Features/Document/03-Product Page.md`。
- 原始需求與計畫：`Features/Document/02-LoginAndLogout.md`、`Features/Plan/02-LoginAndLogout.md`。
- Scenario：`Features/Document/Scenarios/03-Product Page/` 下 `01-Product Page.feature`、`02-Add Product.feature`、`03-Edit Product.feature`、`04-Delete Product.feature`。
- Flow：`Features/Document/flows/03-Product Page/` 下三份新增、編輯、刪除流程。
- Requirement Type：**Requirement Change**；延伸既有 ProductPage 清單，新增 CRUD、分頁、篩選與分類輸入。
- Plan Date：2026-10-13。
- Plan Status：**Awaiting Review**。本輪需求補充已完成分析；人工審閱前不進入實作。
- 本次僅產生計畫，不修改需求文件、Production Code 或測試。

### 使用者需求補充

```text
Requirement Source: 本次對話使用者回覆
Requirement Date: 2026-10-13
Requirement Summary: 新增後維持目前頁碼（原在第一頁且新增至 16 筆時顯示 1/2）；篩選不分大小寫，名稱及分類以 AND 過濾整筆商品，篩選時回第一頁；分類標籤由已載入商品的分類去重產生候選，API 以逗號串成單一 label_names 字串；數值欄位為 Number；Update 一次傳送完整 body.info，Uid／Authorization 置於 HTTP headers；新增 409 顯示「商品產生ID衝突，請重新送出」；移除 404 驗收情境。
```

此回覆取代新增 Gherkin 的 `2/1` 預期；工作區的 Add Scenario 已同步為 `1/2`、409 文案已同步、Edit／Delete 的 404 Scenario 已移除。這些需求檔變更非本次 System Design 寫入，予以保留。主需求的 Get／Update／Delete API 狀態碼表仍列 404；本計畫只移除其專門業務驗收與特定關窗規則，遇到實際 404 仍按一般 HTTP 錯誤呈現，不視為成功。

### Figma 核對紀錄

2026-10-13 已透過 get_design_context 取得以下節點內容與截圖：

| 畫面 | 節點連結 | 設計觀察 |
| --- | --- | --- |
| 產品頁面1 | [33:896](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=33-896) | 頂部共用導覽、右側批次管理與加入商品、七欄表格、底部分頁 |
| 產品頁面2 | [18:2](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=18-2) | 多筆表格與相同分頁操作；以資料量改變高度，不建立第二份頁面 |
| 新增商品 | [33:3929](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=33-3929) | 標題、編號／名稱／分類／成本／價格／庫存、確認／取消 |
| 編輯商品 | [38:3967](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=38-3967) | 相同表單，編號及欄位已填值，分類顯示多個標籤 |
| 產品標籤 | [38:4054](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=38-4054) | 圓角分類標籤 |

使用現有 CSS 與元件組合，不引入 Tailwind；依專案規範維持介面一致性，不要求背景配色完全一致。稿上的假資料、固定總頁數、重複 ID 不屬於資料契約。刪除視窗沒有獨立設計稿，沿用相同浮動視窗風格。需求明訂的分類清除 x 仍須具備，不能因截圖未呈現而省略。

## II. Requirement Summary

### 已確認行為與驗收

1. 登入後進入 ProductPage，沿用既有 getProducts 全清單查詢與 Session。
2. 每頁 15 筆，0 筆保留表頭且顯示 Pages 1/1；不再於 tbody 放「目前無產品」資料列。第一／最後頁對應方向 disabled；18 筆分為 15 與 3 筆。
3. 僅商品名稱與商品分類支援文字模糊搜尋；搜尋不分大小寫，兩欄同時輸入時以 AND 篩選，符合條件時顯示整筆商品。其他表頭不加入篩選。每次篩選文字變更回到第一頁，總頁數依篩選結果重算。
4. 批次管理只開啟 Excel 選檔視窗，不解析、上傳或呼叫未定義 API。
5. 新增編號空白且不可編輯，名稱／分類／成本／售價必填，成本與售價至少 1；庫存預設 0 且至少 0。
6. 分類 Enter 轉成標籤、右側 x 清除已輸入分類、輸入即時篩選。候選從已載入商品的 `label_names` 拆分、去重產生，僅代表目前清單資料，不聲稱是後端全部分類。表單以標籤呈現，API 的 `label_names` 將所有分類用 `,` 串成單一字串；詳情回填反向轉換成標籤。尚未存在的分類可先作為當次商品的文字標籤隨商品送出，不另外發新增分類請求；後端自動新增分類尚未實作。
7. 編輯前先 Get Product，成功取得詳情後才顯示可編輯表單；取消不執行 mutation，也不追加請求。先前已執行的 GET 不屬於取消副作用。
8. 新增／編輯／刪除成功才關閉對話框並重新查詢 Table；新增後維持原頁碼，新增第 16 筆且原在第一頁時顯示 1/2。
9. 缺必填欄位顯示「請填寫完整的產品資料」、紅框、保留輸入並允許修正，不送 API。
10. Mutation 401 顯示「使用者未授權」並清 Session 回登入。新增 409 顯示「商品產生ID衝突，請重新送出」，保留表單與輸入供使用者再次送出；不自動重送。404 的專門驗收情境已由 PM 撤回。

### 需求問題與決議

| ID | 狀態 | 問題／影響 | 相關任務 |
| --- | --- | --- | --- |
| OQ-001 | RESOLVED | 新增第 16 筆停第一頁、1/2，依本次使用者回覆 | TASK-002、005 |
| OQ-002 | RESOLVED | 標籤顯示，以 `,` 合併為單一 `label_names` 字串；候選取已載入商品的分類去重，不增分類 API。未存在分類保留為文字標籤隨商品送出，本階段不另行建立分類 | TASK-001、003、004、005 |
| OQ-003 | RESOLVED | cost／price／stock 在 JSON 與解析後均為 Number；Update 一次送出完整 body.info；Uid／Authorization 只放 HTTP headers，不加 body.info 使用者欄位 | TASK-001、004、005 |
| OQ-004 | RESOLVED | Add 409 顯示「商品產生ID衝突，請重新送出」，留窗與輸入，使用者可手動重送；Scenario 已更新 | TASK-001、005 |
| OQ-005 | RESOLVED | 商品名稱與分類模糊搜尋均不分大小寫；雙欄以 AND 過濾，呈現整筆商品；未指定前後空白特例，不擴充其他正規化規則 | TASK-002 |
| OQ-006 | RESOLVED | 新增後保留目前頁碼，即使總頁數增加；篩選文字變動後跳第一頁、總頁數重算。刪除導致現有頁碼超出新總頁數時，將頁碼限縮到新最後頁，維持有效顯示狀態 | TASK-002、005 |
| OQ-007 | RESOLVED | PM 已移除 Update／Delete 404 的專門 Scenario；不設計專屬訊息或關窗政策，API 狀態碼仍以非成功回應處理 | TASK-001、005 |

編輯流程圖畫成先開窗再讀取，正文明訂先取得詳情再顯示；本計畫按正文規劃。流程圖的一般「失敗保留」不覆蓋 Scenario 對 401 的特例。表頭沿用既有與 Figma 的「價格」，其語意對應需求中的售價 price。

### Existing System / Delta / Impact

| 已核對檔案 | Original Behavior | Required Behavior / Impact |
| --- | --- | --- |
| `src/pages/ProductPage.tsx`、`.css` | 六欄全部顯示、空資料提示列、加入商品 disabled、編輯刪除純圖片 | MODIFY：七欄含庫存、15 筆分頁、兩欄搜尋、可操作 CRUD、選檔入口 |
| `src/services/product-service.ts` | getProducts；parseProducts 驗證五個顯示欄位；30 秒 timeout、abort、HTTP headers | MODIFY：保留既有查詢 endpoint，補庫存契約與 CRUD；不進行每列詳情查詢補庫存 |
| `src/types/auth.ts` | Product 實際位於此處，id/name/label_names string、cost/price number | MODIFY：擴充既有 Product；新增商品表單／payload 型別，不為命名搬移既有型別 |
| `src/App.tsx` | onSessionExpired 無參數、固定登入逾期文案 | MODIFY：可接受本次錯誤提示，預設保持舊查詢逾期提示，仍由 App 清 Session |
| `src/components/FormField/FormField.tsx` | type 僅 text/email/password，已有 error 與 aria 關聯 | MODIFY：最小擴充 number，沿用紅框及原生 min 等屬性 |
| `src/components/Button/Button.tsx`、`SiteHeader/SiteHeader.tsx` | 已有按鈕變體、登出與導覽 | REUSE：不另建按鈕或改權限管理 |
| `public/icon/pencil.png`、`delete.png` | 已存在 | REUSE：包成可鍵盤操作按鈕，維持比例 |
| `public/icon/left-arrow.png`、`right-arrow.png` | 未存在 | ADD：取得需求對應圖示資產；不是已存在檔案 |
| `vite.config.ts`、`nginx/default.conf.template` | 已有 /productController 代理 | NO CHANGE：現有 prefix 可涵蓋四個 CRUD endpoint |
| `ProductPage.test.tsx`、`product-service.test.tsx`、`App.test.tsx` | 占位與舊清單行為、協定／取消／Session 回歸 | MODIFY：替換過時占位預期，保留安全與協定案例；補新行為 |

這是 03 功能的新 Task 集，初始狀態 TODO；不回寫 02 已完成任務的歷史狀態。日後修改已實作的 03 Task，依 Agent Definition 設 PLAN UPDATED 並清除開發／審查日期。

## III. Requirement List

所有 TODO 代表尚未實作；本計畫待人工審閱後交付 Programmer。

| Task ID | Component Name | Plan Type | Plan Date | Implentation Status | Development Date | Code Review Date |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-001 | 產品型別與 API 服務 | MODIFY | 2026-10-13 | DEVELOPED DONE | 2026-10-13 | — |
| TASK-002 | 產品表格、篩選與分頁 | MODIFY | 2026-10-13 | DEVELOPED DONE | 2026-10-13 | — |
| TASK-003 | 商品分類輸入 | ADD | 2026-10-13 | DEVELOPED DONE | 2026-10-13 | — |
| TASK-004 | 共用商品表單與浮動視窗 | ADD | 2026-10-13 | DEVELOPED DONE | 2026-10-13 | — |
| TASK-005 | CRUD 協調、Session 與清單重整 | MODIFY | 2026-10-13 | DEVELOPED DONE | 2026-10-13 | — |
| TASK-006 | 批次管理入口與視覺整合 | MODIFY | 2026-10-13 | DEVELOPED DONE | 2026-10-13 | — |

## IV. Technical Stack / System Design

- TypeScript 5.9.3、React／React DOM 18.3.1、Vite 7.3.1、npm，原生 fetch、CSS。
- Vitest 5.0.3、Testing Library React 16.3.3、user-event 14.6.7、jsdom 30.1.2；`vitest.config.ts` 僅納入 `src/**/*.test.tsx`，新服務／驗證測試也沿用此副檔名。
- 遵循 React、TypeScript、unit-test Skills。沿用 TS strict／ES2022，不變更編譯選項。
- 無新套件、路由、全域 store、資料庫 schema 或部署設定變更。Repository 沒有本功能後端實作，不能宣稱已驗證後端契約。
- Page 持有清單請求狀態、搜尋文字、頁碼與對話框狀態；Table 收 props 與回呼；Form 持有未送出的欄位；Service 僅負責 HTTP／解析。
- filteredProducts、pageCount、visibleProducts 從清單與搜尋推導，不另存同步 state。名稱與分類各用不分大小寫的子字串比對，兩者以 AND 結合並顯示整筆資料。只在已取得完整清單後本機分頁；不增設後端分頁參數。搜尋文字改變時將 currentPage 設為 1；新增成功刷新後保持原 currentPage；刪除導致頁碼失效時限縮至新最後頁。
- 對話框以 discriminated union 區分 closed／create／loading-detail／edit／delete，避免新增與刪除窗同時開啟。詳情載入狀態呈現在頁面操作區。
- 只在使用者確認事件送出 mutation，不用 Effect 監聽表單去寫入。單頁專用協調維持 Page，不強制增加 Hook。
- 讀取、mutation、refresh 分別辨識結果；mutation 成功而 refresh 失敗要提示「操作已完成，但清單重新載入失敗」並提供只重試 GET 的方式，不能自動再新增／更新／刪除。
- Session 變更／卸載時 abort 並忽略過期完成與錯誤；快速切換詳情時舊結果不得覆蓋新目標。abort 不代表後端 mutation 已回滾。
- 同一提交在進行中停用確認並同步防重複呼叫。timeout／網路中斷不自動 retry mutation；無法確認寫入結果時讓使用者重新查詢。
- 不新增遙測服務，不記錄 token、Uid、完整商品 payload；錯誤由 Page 呈現，既有專案沒有必須延伸的產品 logger。

### HTTP 契約

所有請求沿用同源代理，HTTP request headers 為 Content-Type: application/json、Uid、Authorization。使用者身分只由 Uid／Authorization 傳送，不加入商品 `body.info`。Status／Message 僅從 HTTP response headers 取得，不從 JSON headers 補值；保留 JSON 的 body.info 層。Update 以**單一 PUT** 一次送出 id、name、label_names、cost、price、stock，不拆成逐欄更新。

| 操作 | Method / URI | JSON body.info | 成功內容 |
| --- | --- | --- | --- |
| 清單 | GET `/productController/getProducts?productId=all` | 無 body | 商品陣列 |
| 詳情 | GET `/productController/getProduct?productId=<encoded id>` | 無 body | 商品物件 |
| 新增 | POST `/productController/addProduct` | name、label_names、cost、price、stock；不傳 id | 商品物件 |
| 更新 | PUT `/productController/updateProduct` | id 及上述可編輯欄位，一次送出 | 商品物件 |
| 刪除 | DELETE `/productController/deleteProduct` | id | id、deleted、updated_user、updated_at |

以 HTTP 狀態碼先辨識 401／409；404 如 API 狀態表所列，屬一般非成功 HTTP 錯誤，不另設撤回的畫面情境。200 仍需 HTTP Status=success 及有效 JSON。外部資料 unknown 逐欄驗證，不使用型別斷言假裝成功。`cost`、`price`、`stock` 均為 JSON Number，必須有限且符合表單最小值；空白不可自動轉成 0。`label_names` 是以 `,` 分隔的 String；前端標籤來回轉換時保留順序，標籤文字不得包含分隔符。稽核欄位目前不顯示，不為未定義的稽核型別加阻擋驗證；刪除回應至少需正確 id。不自行依 deleted 過濾清單，不改排序。

## V. Implementation Steps

以下新增檔案與 Target 均為**提案**，不是宣稱既存模組。元件子目錄依既有 components 慣例，沒有新增頂層架構，也不建立 index.ts。

### TASK-001 產品型別與 API 服務

- **File**：MODIFY `src/types/auth.ts`、`src/services/product-service.ts`、`src/services/product-service.test.tsx`。
- **Target**：既有 Product、getProducts、parseProducts；在既有檔案中新增商品表單／payload 型別及 getProduct、addProduct、updateProduct、deleteProduct、ProductServiceError，不為命名另建型別檔案。
- **Current Behavior**：只查清單，沒有 stock、mutation 或詳情服務。
- **Expected Behavior**：依上表封裝五個操作，前端錯誤可區分 unauthorized／not-found／conflict／http／protocol／network／timeout。
- **Implementation**：保持 getProducts 公開介面及 AuthServiceError 既有契約；新增操作使用具產品語意的 ProductServiceError，避免擴大 auth-service 重構。共用 HTTP headers helper；產品模組內若抽取私有 request helper，需保留原查詢的回傳／錯誤行為。id 保持字串並 URL encode，禁止轉為 number。表單型別與 wire payload 分離；只明確映射允許欄位，禁止 spread 外部資料入 payload。stock 與 cost／price 採 Number，不把缺值補為 0；`label_names` 由標籤以逗號合併。Update 僅送一次完整 PUT；Uid／Authorization 仍放 headers。
- **Reuse**：AuthSession、getHttpResponseStatus、getHttpResponseMessage、30 秒 timeout／AbortController 慣例。
- **Impact**：所有產品 fixture 需補最終契約的 stock；App 整合 fixture 同步。沒有新的環境變數或 DB migration。
- **Error Handling**：外部 signal 已取消時不得啟動有效請求；timer/listener 必須清理。一般 403／404／422／5xx 不清 Session。新增 409 不自動重送，交 Page 顯示「商品產生ID衝突，請重新送出」；mutation 回應損壞時不得宣稱成功。
- **Testing**：mock fetch 驗證 method／URL／headers／body.info、未送 JSON headers；成功單筆／陣列、錯誤狀態、缺 HTTP Status、非法 JSON／欄位型別、取消與 timeout，並保留清單既有回歸。
- **前置條件**：OQ-002／003／004 已依本次回覆確認，實作前以本計畫審閱結果為準。

### TASK-002 產品表格、篩選與分頁

- **File**：MODIFY `src/pages/ProductPage.tsx`、`ProductPage.css`、`ProductPage.test.tsx`；ADD `src/components/ProductTable/ProductTable.tsx`、`ProductTable.css`、`ProductTable.test.tsx`。
- **Target**：既有 ProductPage；新增 ProductTable。
- **Current Behavior**：表格寫在 Page，顯示所有筆數，無搜尋／分頁。
- **Expected Behavior**：七欄依序編號、名稱、分類、成本、價格、庫存、編輯；末欄有編輯／刪除按鈕，表格下方 Pages current/total。
- **Implementation**：Page 以名稱及分類各自不分大小寫的子字串條件作 AND 過濾，命中時顯示整筆商品，再 slice 每頁 15 筆；pageCount 至少 1，0 筆 tbody 無資料列，分頁不當成商品列。資料 id 作 key；按鈕 aria-label 包含商品識別。名稱／分類提供有 label 的文字輸入；不對其餘欄位加 filter 或排序。任一篩選文字變動時 currentPage=1 並重算總頁數；新增後保持原頁碼，15→16 且原在第一頁顯示 1/2。
- **Reuse**：Button、既有圖示、清單服務；保留 Header 與窄螢幕橫捲，改七欄寬度，樣式限制在 ProductTable 避免影響表單。
- **Impact**：替換既有「加入商品不可操作」「所有資料一次顯示」「colspan=6 空列」測試，這些是需求改變而非刪除回歸保障。
- **Error Handling**：loading／讀取失敗不得偽裝為成功空清單；頁碼不得小於 1 或超出總頁數。不能用未取得詳情的清單資料直接打開編輯表單。
- **Testing**：0、1、15、16、18 筆；前後頁 15／3 筆、按鈕邊界、大小寫不分的兩欄 AND 搜尋與無結果、篩選後回第一頁且總頁數縮減；庫存與價格正確映射，點擊回傳正確字串 id。

### TASK-003 商品分類輸入

- **File**：ADD `src/components/ProductLabelInput/ProductLabelInput.tsx`、`ProductLabelInput.css`、`ProductLabelInput.test.tsx`。
- **Target**：新增 ProductLabelInput。
- **Current Behavior**：只有清單上的 label_names 文字，無候選查詢或標籤編輯。
- **Expected Behavior**：受控標籤與輸入、即時候選篩選、Enter 成為標籤、右側 x 清除，供新增與編輯共用。
- **Implementation**：Page 從已載入商品的 `label_names` 依逗號拆分，去除空項、去重產生候選並透過 props 傳入；元件不呼叫分類 API。使用者輸入時以不分大小寫的文字即時篩選候選，Enter 把文字轉成標籤並阻止意外提交商品，中文 IME composition 中 Enter 不提交。新增／編輯使用同一解碼／編碼契約；標籤文字不含逗號，避免破壞 wire 格式。尚未存在候選的文字也可成為商品標籤並在商品 API 的 `label_names` 傳送，本階段不單獨建立後端分類。
- **Reuse / Impact**：Button 的清除操作與既有欄位錯誤風格；分類提交邊界影響 TASK-001／004／005。
- **Error Handling**：候選為空仍可輸入新文字標籤；不得顯示「已建立後端分類」之類尚未實作的成功訊息。
- **Testing**：已載入清單分類去重與即時篩選、既有分類選取、未知分類轉成文字標籤、Enter 不送商品、IME、x、多分類逗號 round-trip，以及含逗號輸入的防護。

### TASK-004 共用商品表單與浮動視窗

- **File**：ADD `src/components/ProductForm/ProductForm.tsx`、`ProductForm.css`、`ProductForm.test.tsx`；ADD `src/components/Modal/Modal.tsx`、`Modal.css`、`Modal.test.tsx`；ADD `src/pages/product-validation.ts`、`product-validation.test.tsx`；MODIFY `src/components/FormField/FormField.tsx`、`FormField.test.tsx`。
- **Target**：新增 ProductForm、Modal、validateProduct；擴充既有 FormFieldProps.type。
- **Current Behavior**：沒有商品表單或共用浮動視窗；既有欄位僅文字、密碼、Email。
- **Expected Behavior**：新增／編輯共用表單與欄位；Modal 同時供商品表單及刪除確認使用，API 仍由 Page 負責。
- **Implementation**：表單欄位以字串持有草稿以支援清空；新增名稱／分類／成本／價格空白，stock='0'、編號唯讀空白；編輯由 GET 詳情初始化，id 唯讀。必填與 min 在送出前驗證，finite number 檢查避免 NaN／Infinity；不擅加最高值、金額小數位或整數限制。庫存若由使用者清空應視為未填寫並阻止送出，不自動轉為 0；送出時 cost／price／stock 轉為 Number。FormField 最小加入 number 類型，保留原登入註冊介面。Modal 提供標題、dialog 語意、焦點進入／限制／返回，鍵盤取消與取消按鈕一致；提交中的關閉政策採阻止關閉以避免誤認取消後端寫入。
- **Reuse**：FormField、Button、ProductLabelInput；驗證為商品專屬，放 pages 不放通用 utils。
- **Impact**：登入／註冊 FormField 需回歸，不改其規則或版型。
- **Error Handling**：缺必填顯示指定文案與欄位紅框、aria-invalid，保留全部輸入；低於最小值顯示對應欄位錯誤。一般提交失敗留窗，特殊錯誤由 Page 決定關閉。
- **Testing**：新增初始值、編輯初始值／id 唯讀、必填與 min 邊界、成本售價 0 拒絕／1 允許、庫存 0 允許／空白及負數拒絕、數值送出為 Number、取消無提交、pending 不重送、焦點與鍵盤；不擅加小數位或庫存整數限制斷言。

### TASK-005 CRUD 協調、Session 與清單重整

- **File**：MODIFY `src/pages/ProductPage.tsx`、`ProductPage.test.tsx`、`src/App.tsx`、`App.test.tsx`。
- **Target**：既有 ProductPage、App.handleSessionExpired；新增 Page 事件處理與操作狀態。
- **Current Behavior**：只有清單讀取與統一過期提示。
- **Expected Behavior**：新增開空表單；編輯先詳情後開窗；刪除先確認；mutation 成功後關窗並 GET 清單。取消新增／刪除不發 API，取消編輯不發 PUT 或額外 GET。
- **Implementation**：組合 TASK-001～004。刪除確認顯示商品名稱／id，確認只送目標 id。onSessionExpired 可接受可選提示字串；一般清單保留預設提示，CRUD 401 傳「使用者未授權」。App 統一清 state 與 sessionStorage，避免 Page 先 alert 然後 App 重複 alert；清除儲存失敗仍回登入並保留既有提示能力。
- **Reuse**：現有 Session 擁有權、SiteHeader、Modal、Button；不新增 logout API 作為 401 處理。
- **Impact**：App 的登入／還原／登出流程需回歸。過期操作回應不得清除新 Session。
- **Error Handling**：Add 409 顯示「商品產生ID衝突，請重新送出」，留窗保留值並供使用者手動重送；不自動重試。404 不再有特定驗收路徑，若實際收到，沿用一般 HTTP 錯誤呈現與 Session 保留，詳情載入失敗不進入可編輯狀態；不設計已撤回的專屬關窗規則。403 與一般失敗保留 Session。成功 refresh 與失敗恢復依 IV 節，不把 mutation 成功誤報為失敗。新增後保持原頁，篩選改變時回第一頁，刪除後若頁碼超出則限縮至最後頁。
- **Testing**：逐一對應更新後的新增／編輯／刪除 Scenario；測試詳情載入前無表單、快速切換／卸載、重複確認只送一次、401 清 Session 與指定提示一次、409 指定文案與留窗、不再加入 404 專門情境、mutation 成功但 refresh 失敗僅重試 GET、新增 15→16 第一頁 1/2、非第一頁新增保留頁碼及刪除後頁碼有效。

### TASK-006 批次管理入口與視覺整合

- **File**：MODIFY `src/pages/ProductPage.tsx`、`ProductPage.css`、`ProductPage.test.tsx`；ADD `public/icon/left-arrow.png`、`public/icon/right-arrow.png`。
- **Target**：ProductPage toolbar／Excel 選檔、ProductTable 分頁資產。
- **Current Behavior**：只有加入商品占位；缺分頁圖片。
- **Expected Behavior**：批次管理開啟原生 Excel 選檔視窗，選取／取消皆不呼叫 API；單筆管理可以操作。
- **Implementation**：使用 file input accept `.xlsx,.xls` 作選檔提示，不加入 Excel parser；reset input 讓相同檔案可再選。設計稿下載模板／報表入口採 disabled 占位並標明尚未開放，不建立假 URL 或檔案，待 API 設計後另行規劃。從 Figma 正式資產流程取得左右箭頭，存為對應本地檔名，不能硬寫暫時 URL；現有 pencil/delete 核對一致後沿用，圖片包按鈕後 CSS 依用途 class 定尺寸，不再依 first-child/last-child 誤套尺寸。
- **Reuse / Impact**：沿用 public/icon、Button、既有 Header；不新增資產頂層或下載依賴。
- **Error Handling**：選檔不表示上傳成功；未開放功能不導向錯誤 URL。資產未取得列為交付阻礙，不能以任意替代圖示宣稱符合設計。
- **Testing**：選檔與取消／重選沒有 fetch；下載占位不可觸發；人工對照兩種清單、新增／編輯、標籤、箭頭與圖示幾何，窄螢幕表格可橫捲，Modal 不超出視窗。

### 執行順序與驗證

1. 本輪 OQ-001～007 已依 PM 回覆與更新後 Scenario 收斂；先核對本計畫與需求的一致性。
2. Plan Validation 完成後進入 Awaiting Review；人工審閱允許實作後才交 Programmer。
3. TASK-001 → TASK-002／003 → TASK-004 → TASK-005 → TASK-006。這是相依順序，不要求啟動額外 Agent。
4. 測試沿用 Gherkin 情境名稱並註記來源；PM 回覆的頁碼例外註記本計畫 I 節。Service 控制 fetch，Page 控制 service 邊界；不要 mock 待測驗證或分頁演算法。
5. 實作後跑相關 Vitest，再跑受共用欄位／Session 影響的登入註冊與 App 回歸，最後 `npm test`、`npm run build`、`npm run lint`。不引入新的測試框架或假設覆蓋率門檻。
6. Figma 對照為實作後人工／瀏覽器驗收；本次僅讀取稿件，沒有宣稱渲染或後端整合已通過。

## VI. Review Status / Plan Validation

- [x] Requirement Type、既有行為差異、影響範圍與需求來源已整理。
- [x] 既有檔案／函數已從 Repository 核對；提案新增路徑已明示。
- [x] 五份 Figma context 與截圖已讀取，三份 Flow 與四份 Scenario 文件已核對。
- [x] 元件重用、API／DB／設定影響、錯誤處理、Session 與測試策略已記錄。
- [x] 使用者確認的 1/2 頁碼已納入，未修改 PM 需求原文。
- [x] 分類來源／多分類格式與數值契約已確認。
- [x] 錯誤文案、搜尋與分頁刷新邊界已納入計畫。
- [x] 所有需求已有對應實作步驟與測試策略。
- [ ] Implementation Plan 已完成人工審核。
- [x] Development 完成。
- [ ] Code Review 通過。

開發驗證：`npm test`（20 個測試檔、149 個測試通過）、`npm run build`、`npm run lint` 均通過。Figma 左右分頁圖示已下載至 `public/icon/` 並套用；仍待 Code Review 與瀏覽器人工視覺驗收。

### Handoff 條件

本計畫已進入 Awaiting Review。依 `agents/system-design-agent.md` 的 Plan Review 流程，審閱完成並允許實作後，Handoff 應包含本計畫、03 原始需求及本次 PM 補充、Requirement Change 類型與六項任務範圍。不得修改登入註冊規則、權限管理、Excel 上下載 API、分類自動新增後端或進行無關重構。
