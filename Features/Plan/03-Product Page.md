# 03 - Product Page Implementation Plan

## I. Requirement Information

- Feature Name：`Features/Document/03-Product Page.md`。
- 原始需求與計畫：`Features/Document/02-LoginAndLogout.md`、`Features/Plan/02-LoginAndLogout.md`。
- Scenario：`Features/Document/Scenarios/03-Product Page/` 下 `01-Product Page.feature`、`02-Add Product.feature`、`03-Edit Product.feature`、`04-Delete Product.feature`。
- Flow：`Features/Document/flows/03-Product Page/` 下三份新增、編輯、刪除流程。
- Requirement Type：原始工作為 **Requirement Change**；2026-10-13 追加為 **Bug / Behavior Correction**（下載入口擁擠、標籤樣式）與 **Requirement Change**（Stock API 暫行契約、TASK-003／006 介面視覺驗證暫緩）；2026-10-14 追加 **New Requirement**（2-2-5～2-2-7 檔案操作）、**Bug / Behavior Correction**（Get Product URI 更正），以及 **Requirement Change**（Stock 後端完成，解除暫行契約）。
- Plan Date：2026-10-13。
- Plan Status：**Awaiting Review**。最新 Stock 需求變更之計畫已完成檢查，待人工審閱後交付實作；先前檔案操作的開發與 Code Review 紀錄保留於下方歷史章節。
- 本次僅調整計畫，不修改需求文件、Production Code 或測試；工作區現有 `vite.config.ts` 變更非本計畫寫入。

### 2026-10-13 需求變更（本次）

```text
Requirement Source: 本次對話使用者回覆
Requirement Date: 2026-10-13
Requirement Summary: 下載批次新增商品模板及下載商品報表與操作按鈕過於擁擠，需調整版面；Stock API 暫未實作，回應缺少 stock 時顯示 0，新增／編輯視窗顯示 0 並停用編輯，新增／更新暫不傳 stock；Enter 新增標籤與選取建議後，都依 Figma「產品標籤」模板顯示。
```

本次 Stock 決議由使用者再次確認，暫時覆蓋下方舊版「stock 必填、可編輯、隨新增／更新送出」的規劃及需求文件中的舊版 Stock 範例；成本、售價仍維持 JSON Number。這是前端與尚未實作 Stock 的 API 之間的過渡行為，未修改 PM 原始需求文件。其餘 CRUD、分頁、搜尋、Session 與標籤資料格式不變。

### 2026-10-13 TASK-006 驗證範圍調整

```text
Requirement Source: 本次對話使用者指示
Requirement Date: 2026-10-13
Requirement Summary: TASK-006 的視覺顯示暫時不進行測試。下載入口位置與間距的預期行為保留；桌面／窄螢幕瀏覽器幾何檢查與 Figma 視覺對照暫緩，不作為本輪 TASK-006 Development 或 Code Review 完成門檻。選檔、重選及 disabled 下載占位的功能測試與既有回歸仍須執行。
```

### 2026-10-13 介面驗證範圍再調整（最新）

```text
Requirement Source: 本次對話使用者指示
Requirement Date: 2026-10-13
Requirement Type: Requirement Change（驗證範圍）
Original Requirement: TASK-003 須以瀏覽器／Figma 對照標籤尺寸與 close 圖示幾何；TASK-006 的介面視覺驗證已暫緩。
Updated Requirement: 暫時取消 Plan 中需透過自動化介面確認的測試情境；TASK-003 與 TASK-006 均不以瀏覽器／Figma 介面視覺對照作為本輪開發或 Code Review 完成門檻。
Difference / Impact: 只調整驗證方式與完成門檻；商品標籤與下載入口的預期外觀、既有 Vitest 功能／回歸測試及 API 契約均不變，不新增程式或測試檔工作。
```

本輪可透過既有 Figma 規格、原始碼與本地資產核對尺寸及圖示引用，並沿用已完成的元件／頁面自動化測試驗證互動。未執行的實際畫面對照不得記為通過；若後續恢復介面驗證，需另行規劃其範圍。

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
| 產品頁面1 | [33:896](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=33-896) | 頂部共用導覽、右側批次管理與加入商品、七欄表格、底部分頁；下載文字入口位於操作按鈕下方，需保留可辨識的行距 |
| 產品頁面2 | [18:2](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=18-2) | 多筆表格與相同分頁操作；以資料量改變高度，不建立第二份頁面 |
| 新增商品 | [33:3929](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=33-3929) | 標題、編號／名稱／分類／成本／價格／庫存、確認／取消 |
| 編輯商品 | [38:3967](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=38-3967) | 相同表單，編號及欄位已填值，分類顯示多個標籤 |
| 產品標籤 | [38:4054](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=38-4054) | 淺黃 `#fdfaa9`、約 36px 高、50px 圓角膠囊、14px 文字及右側 12px close 圖示 |

使用現有 CSS 與元件組合，不引入 Tailwind；依專案規範維持介面一致性，不要求背景配色完全一致。稿上的假資料、固定總頁數、重複 ID 不屬於資料契約。刪除視窗沒有獨立設計稿，沿用相同浮動視窗風格。需求明訂的分類清除 x 仍須具備，不能因截圖未呈現而省略。

## II. Requirement Summary

### 已確認行為與驗收

1. 登入後進入 ProductPage，沿用既有 getProducts 全清單查詢與 Session。
2. 每頁 15 筆，0 筆保留表頭且顯示 Pages 1/1；不再於 tbody 放「目前無產品」資料列。第一／最後頁對應方向 disabled；18 筆分為 15 與 3 筆。
3. 僅商品名稱與商品分類支援文字模糊搜尋；搜尋不分大小寫，兩欄同時輸入時以 AND 篩選，符合條件時顯示整筆商品。其他表頭不加入篩選。每次篩選文字變更回到第一頁，總頁數依篩選結果重算。
4. 批次管理只開啟 Excel 選檔視窗，不解析、上傳或呼叫未定義 API。
5. 新增編號空白且不可編輯，名稱／分類／成本／售價必填，成本與售價至少 1。依最新 Stock 需求變更，新增表單庫存預設 0 且可編輯，編輯表單顯示詳情取得的庫存；庫存送出時為至少 0 的有限 Number。清單、詳情、新增／更新與批次上傳的成功商品回應須包含有效 `stock`，缺少時不得再補 0。
6. 分類 Enter 或選取建議後，均以 Figma「產品標籤」的黃色膠囊與單一 close 圖示顯示；右側清除全部 x 仍為獨立操作。輸入即時篩選，候選從已載入商品的 `label_names` 拆分、去重產生，僅代表目前清單資料，不聲稱是後端全部分類。表單以標籤呈現，API 的 `label_names` 將所有分類用 `,` 串成單一字串；詳情回填反向轉換成標籤。尚未存在的分類可先作為當次商品的文字標籤隨商品送出，不另外發新增分類請求；後端自動新增分類尚未實作。
7. 編輯前先 Get Product，成功取得詳情後才顯示可編輯表單；取消不執行 mutation，也不追加請求。先前已執行的 GET 不屬於取消副作用。
8. 新增／編輯／刪除成功才關閉對話框並重新查詢 Table；新增後維持原頁碼，新增第 16 筆且原在第一頁時顯示 1/2。
9. 缺必填欄位顯示「請填寫完整的產品資料」、紅框、保留輸入並允許修正，不送 API。
10. Mutation 401 顯示「使用者未授權」並清 Session 回登入。新增 409 顯示「商品產生ID衝突，請重新送出」，保留表單與輸入供使用者再次送出；不自動重送。404 的專門驗收情境已由 PM 撤回。
11. 下載模板與下載報表仍為 disabled 占位，視覺上位於「批次管理／加入商品」按鈕下方並保留清楚的垂直間距；桌面與窄螢幕皆不得與按鈕文字或彼此重疊。

### 需求問題與決議

| ID | 狀態 | 問題／影響 | 相關任務 |
| --- | --- | --- | --- |
| OQ-001 | RESOLVED | 新增第 16 筆停第一頁、1/2，依本次使用者回覆 | TASK-002、005 |
| OQ-002 | RESOLVED | 標籤顯示，以 `,` 合併為單一 `label_names` 字串；候選取已載入商品的分類去重，不增分類 API。未存在分類保留為文字標籤隨商品送出，本階段不另行建立分類 | TASK-001、003、004、005 |
| OQ-003 | RESTORED（2026-10-14） | 使用者確認 Stock 後端已完成，撤銷 2026-10-13 的暫行省略規則；恢復 cost／price／stock 均以 Number 傳送，stock 最小值 0、預設 0 且可編輯。單次 Update 與 Uid／Authorization 放 headers 的決議仍有效 | TASK-001、004、005、007 |
| OQ-004 | RESOLVED | Add 409 顯示「商品產生ID衝突，請重新送出」，留窗與輸入，使用者可手動重送；Scenario 已更新 | TASK-001、005 |
| OQ-005 | RESOLVED | 商品名稱與分類模糊搜尋均不分大小寫；雙欄以 AND 過濾，呈現整筆商品；未指定前後空白特例，不擴充其他正規化規則 | TASK-002 |
| OQ-006 | RESOLVED | 新增後保留目前頁碼，即使總頁數增加；篩選文字變動後跳第一頁、總頁數重算。刪除導致現有頁碼超出新總頁數時，將頁碼限縮到新最後頁，維持有效顯示狀態 | TASK-002、005 |
| OQ-007 | RESOLVED | PM 已移除 Update／Delete 404 的專門 Scenario；不設計專屬訊息或關窗政策，API 狀態碼仍以非成功回應處理 | TASK-001、005 |

編輯流程圖畫成先開窗再讀取，正文明訂先取得詳情再顯示；本計畫按正文規劃。流程圖的一般「失敗保留」不覆蓋 Scenario 對 401 的特例。表頭沿用既有與 Figma 的「價格」，其語意對應需求中的售價 price。

### 首次實作時的 Existing System / Delta / Impact

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

上表保留首次實作時的基線紀錄。本次變更以現有已完成程式為基礎：`ProductPage.css` 的下載列使用負 margin、`ProductLabelInput.css` 的標籤高度與 close 圖示未完全對齊設計；`parseProduct` 要求 stock 必須存在，`ProductForm` 允許編輯 stock，新增／更新皆送 stock。受影響檔案與差異見 V 節「本次差異」。不回寫 02 已完成任務的歷史狀態。

## III. Requirement List

本次僅將需要再實作的已完成 Task 設為 `PLAN UPDATED`，清空其舊開發與審查日期；TASK-002 無直接程式差異，維持 `DONE`。本計畫待人工審閱後交付 Programmer。

| Task ID | Component Name | Plan Type | Plan Date | Implentation Status | Development Date | Code Review Date |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-001 | 產品型別與 API 服務 | MODIFY | 2026-10-14 | DEVELOPED DONE | 2026-10-14 | 2026-10-14 |
| TASK-002 | 產品表格、篩選與分頁 | MODIFY | 2026-10-13 | DONE | 2026-10-13 | 2026-10-13 |
| TASK-003 | 商品分類輸入 | MODIFY | 2026-10-13 | DONE | 2026-10-13 | 2026-10-14 |
| TASK-004 | 共用商品表單與浮動視窗 | MODIFY | 2026-10-14 | DEVELOPED DONE | 2026-10-14 | 2026-10-14 |
| TASK-005 | CRUD 協調、Session 與清單重整 | MODIFY | 2026-10-14 | DEVELOPED DONE | 2026-10-14 | 2026-10-14 |
| TASK-006 | 批次管理入口與視覺整合 | MODIFY | 2026-10-13 | DONE | 2026-10-13 | 2026-10-13 |
| TASK-007 | Excel 批次上傳服務與頁面流程 | MODIFY | 2026-10-14 | DEVELOPED DONE | 2026-10-14 | 2026-10-14 |
| TASK-008 | Excel 模板下載服務與頁面流程 | ADD | 2026-10-14 | DONE | 2026-10-14 | 2026-10-14 |
| TASK-009 | 篩選結果商品報表下載服務與頁面流程 | ADD | 2026-10-14 | DONE | 2026-10-14 | 2026-10-14 |

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

JSON 商品請求沿用同源代理，HTTP request headers 為 Content-Type: application/json、Uid、Authorization；批次上傳沿用瀏覽器產生的 multipart Content-Type。使用者身分只由 Uid／Authorization 傳送，不加入商品 `body.info`。Status／Message 僅從 HTTP response headers 取得，不從 JSON headers 補值；保留 JSON 的 body.info 層。依最新 Stock 需求變更，Update 以**單一 PUT** 一次送出 id、name、label_names、cost、price、stock，不拆成逐欄更新。

| 操作 | Method / URI | JSON body.info | 成功內容 |
| --- | --- | --- | --- |
| 清單 | GET `/productController/getProducts?productId=all` | 無 body | 商品陣列，每筆須含 stock |
| 詳情 | GET `/productController/getProducts?productId=<encoded id>` | 無 body | 含目標商品的單筆陣列，商品須含 stock |
| 新增 | POST `/productController/addProduct` | name、label_names、cost、price、stock；不傳 id | 商品物件，stock 必須存在 |
| 更新 | PUT `/productController/updateProduct` | id、name、label_names、cost、price、stock，一次送出 | 商品物件，stock 必須存在 |
| 刪除 | DELETE `/productController/deleteProduct` | id | id、deleted、updated_user、updated_at |

以 HTTP 狀態碼先辨識 401／409；404 如 API 狀態表所列，屬一般非成功 HTTP 錯誤，不另設撤回的畫面情境。200 仍需 HTTP Status=success 及有效 JSON。外部資料 unknown 逐欄驗證，不使用型別斷言假裝成功。`cost`、`price` 均為有限的 JSON Number 且至少 1，空白不可自動轉成 0。清單、詳情、新增、更新及批次上傳成功回應的每筆商品都必須提供 `stock`，且為有限、至少 0 的 JSON Number；缺少、`null`、字串、負數或非有限值均視為 protocol error，不再補 0。表單中只有新增時預設的 `stock` 為 0，編輯必須採詳情實值；使用者清空欄位不得轉成 0。`label_names` 是以 `,` 分隔的 String；前端標籤來回轉換時保留順序，標籤文字不得包含分隔符。稽核欄位目前不顯示，不為未定義的稽核型別加阻擋驗證；刪除回應至少需正確 id。不自行依 deleted 過濾清單，不改排序。

## V. Implementation Steps

以下原始實作步驟與 2026-10-13 差異保留歷史脈絡；目前列出的檔案／元件均已存在。**本輪只執行文末「2026-10-14 Stock 暫行契約解除」的 TASK-001／004／005／007 最新差異**；舊段落凡提到固定 0、停用庫存、回應缺省補 0 或 request 不送 stock，均由最新章節及上方 HTTP 契約取代。不新增頂層架構或 index.ts。

### TASK-001 產品型別與 API 服務

- **File**：MODIFY `src/types/auth.ts`、`src/services/product-service.ts`、`src/services/product-service.test.tsx`。
- **Target**：既有 Product、getProducts、parseProducts；在既有檔案中新增商品表單／payload 型別及 getProduct、addProduct、updateProduct、deleteProduct、ProductServiceError，不為命名另建型別檔案。
- **Current Behavior**：只查清單，沒有 stock、mutation 或詳情服務。
- **Expected Behavior**：依上表封裝五個操作，前端錯誤可區分 unauthorized／not-found／conflict／http／protocol／network／timeout。
- **Implementation**：保持 getProducts 公開介面及 AuthServiceError 既有契約；新增操作使用具產品語意的 ProductServiceError，避免擴大 auth-service 重構。共用 HTTP headers helper；產品模組內若抽取私有 request helper，需保留原查詢的回傳／錯誤行為。id 保持字串並 URL encode，禁止轉為 number。表單型別與 wire payload 分離；只明確映射允許欄位，禁止 spread 外部資料入 payload。cost／price 採 Number，不把缺值補為 0；stock 依本次暫行契約處理。`label_names` 由標籤以逗號合併。Update 僅送一次完整 PUT；Uid／Authorization 仍放 headers。
- **Reuse**：AuthSession、getHttpResponseStatus、getHttpResponseMessage、30 秒 timeout／AbortController 慣例。
- **Impact**：產品 fixture 需同時涵蓋有 stock 與缺 stock；App 整合 fixture 視案例同步。沒有新的環境變數或 DB migration。
- **Error Handling**：外部 signal 已取消時不得啟動有效請求；timer/listener 必須清理。一般 403／404／422／5xx 不清 Session。新增 409 不自動重送，交 Page 顯示「商品產生ID衝突，請重新送出」；mutation 回應損壞時不得宣稱成功。
- **Testing**：mock fetch 驗證 method／URL／headers／body.info、未送 JSON headers；成功單筆／陣列、錯誤狀態、缺 HTTP Status、非法 JSON／欄位型別、取消與 timeout，並保留清單既有回歸。
- **前置條件**：OQ-002／003／004 已依本次回覆確認，實作前以本計畫審閱結果為準。
- **2026-10-13 本次差異**：MODIFY `src/services/product-service.ts`、`product-service.test.tsx`，視需要同步 `src/types/auth.ts`。`Product` 仍對 UI 保持 `stock: number`；`parseProduct` 對清單、詳情及新增／更新回應的**缺省** stock 補 0，已提供者維持 Number／finite／至少 0 驗證。`ProductWriteInput` 不再要求 stock；新增／更新只明確映射本次 HTTP 契約欄位，不因執行期輸入帶 stock 而偷送。測試涵蓋缺省與有效 stock、`null`／字串／負數拒絕、兩種 mutation request body 不含 stock，以及原本非 Stock 的協定／錯誤處理回歸。

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
- **2026-10-13 本次差異**：MODIFY `src/components/ProductLabelInput/ProductLabelInput.tsx`、`.css`、`.test.tsx`；依 Figma 正式資產流程取得 [產品標籤 38:4054](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=38-4054) 的 close 圖示並存為本地資產（提案路徑 `public/icon/label-close.png`），不得引用短期 Figma URL。Enter 與點擊候選沿用同一新增標籤狀態，渲染為約 36px 高、`#fdfaa9`、圓角 50px、14px 文字及右側約 12px close 圖示；寬度隨文字伸縮，多標籤可換行，不把整個清除全部 x 誤當單筆 close。圖示保留可鍵盤操作與可辨識名稱；原 IME、去重、逗號與 `label_names` round-trip 規則不變。元件測試驗證兩種加入方式得到同一標籤結構與單筆移除；本輪以設計規格、CSS 與本地資產核對樣式尺寸及圖示引用，瀏覽器／Figma 介面視覺對照暫緩，不作完成門檻。

### TASK-004 共用商品表單與浮動視窗

- **File**：ADD `src/components/ProductForm/ProductForm.tsx`、`ProductForm.css`、`ProductForm.test.tsx`；ADD `src/components/Modal/Modal.tsx`、`Modal.css`、`Modal.test.tsx`；ADD `src/pages/product-validation.ts`、`product-validation.test.tsx`；MODIFY `src/components/FormField/FormField.tsx`、`FormField.test.tsx`。
- **Target**：新增 ProductForm、Modal、validateProduct；擴充既有 FormFieldProps.type。
- **Current Behavior**：沒有商品表單或共用浮動視窗；既有欄位僅文字、密碼、Email。
- **Expected Behavior**：新增／編輯共用表單與欄位；Modal 同時供商品表單及刪除確認使用，API 仍由 Page 負責。
- **Implementation**：表單可編輯欄位以字串持有草稿以支援清空；新增名稱／分類／成本／價格空白、編號唯讀空白；編輯由 GET 詳情初始化，id 唯讀。庫存欄固定顯示 0 並停用，暫不作為可編輯草稿或必填條件。其餘必填與 min 在送出前驗證，finite number 檢查避免 NaN／Infinity；不擅加最高值、金額小數位或整數限制。送出時 cost／price 轉為 Number。FormField 最小加入 number 類型，保留原登入註冊介面。Modal 提供標題、dialog 語意、焦點進入／限制／返回，鍵盤取消與取消按鈕一致；提交中的關閉政策採阻止關閉以避免誤認取消後端寫入。
- **Reuse**：FormField、Button、ProductLabelInput；驗證為商品專屬，放 pages 不放通用 utils。
- **Impact**：登入／註冊 FormField 需回歸，不改其規則或版型。
- **Error Handling**：缺必填顯示指定文案與欄位紅框、aria-invalid，保留全部輸入；低於最小值顯示對應欄位錯誤。一般提交失敗留窗，特殊錯誤由 Page 決定關閉。
- **Testing**：新增初始值、編輯初始值／id 唯讀、必填與 min 邊界、成本售價 0 拒絕／1 允許、庫存顯示停用 0 且不參與提交、成本與售價送出為 Number、取消無提交、pending 不重送、焦點與鍵盤；不擅加小數位或庫存整數限制斷言。
- **2026-10-13 本次差異**：MODIFY `src/components/ProductForm/ProductForm.tsx`、`.test.tsx`、`src/pages/product-validation.ts`、`product-validation.test.tsx`。新增／編輯視窗均保留庫存欄，值固定為 `0` 並設 `disabled`，不標為必填，不進入表單草稿、驗證錯誤或送出值；其他欄位規則及 Modal 行為不變。`FormField` 已透過 `InputHTMLAttributes` 接受 `disabled`，無需變更共用元件。測試驗證兩種模式均顯示停用的 0、表單不產生庫存驗證錯誤，成本／售價驗證仍有效；移除與本次暫行契約相反的可編輯庫存案例。

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
- **2026-10-13 本次差異**：MODIFY `src/pages/ProductPage.tsx`、`ProductPage.test.tsx`。`toWriteInput` 僅轉換 name／label_names／cost／price，編輯時另附 id；頁面接收服務正規化後的 `stock: 0`，表格維持七欄。新增／編輯成功後重新查詢的流程、Session 與頁碼規則不變。頁面測試驗證清單缺 stock 仍顯示 0、表單庫存為停用 0，新增／更新送出資料不含 stock，並保留既有 CRUD 回歸；若成功回應也缺 stock，不得因解析失敗錯誤地保留視窗。

### TASK-006 批次管理入口與視覺整合

- **File**：MODIFY `src/pages/ProductPage.tsx`、`ProductPage.css`、`ProductPage.test.tsx`；ADD `public/icon/left-arrow.png`、`public/icon/right-arrow.png`。
- **Target**：ProductPage toolbar／Excel 選檔、ProductTable 分頁資產。
- **Current Behavior**：只有加入商品占位；缺分頁圖片。
- **Expected Behavior**：批次管理開啟原生 Excel 選檔視窗，選取／取消皆不呼叫 API；單筆管理可以操作。
- **Implementation**：使用 file input accept `.xlsx,.xls` 作選檔提示，不加入 Excel parser；reset input 讓相同檔案可再選。設計稿下載模板／報表入口採 disabled 占位並標明尚未開放，不建立假 URL 或檔案，待 API 設計後另行規劃。從 Figma 正式資產流程取得左右箭頭，存為對應本地檔名，不能硬寫暫時 URL；現有 pencil/delete 核對一致後沿用，圖片包按鈕後 CSS 依用途 class 定尺寸，不再依 first-child/last-child 誤套尺寸。
- **Reuse / Impact**：沿用 public/icon、Button、既有 Header；不新增資產頂層或下載依賴。
- **Error Handling**：選檔不表示上傳成功；未開放功能不導向錯誤 URL。資產未取得列為交付阻礙，不能以任意替代圖示宣稱符合設計。
- **Testing**：選檔與取消／重選沒有 fetch；下載占位不可觸發。原規劃的頁面、箭頭及圖示幾何、窄螢幕橫捲與 Modal 等人工視覺對照暫緩，不作為本輪 TASK-006 完成門檻；後續執行時另行記錄結果，不得宣稱已通過。
- **2026-10-13 本次差異**：MODIFY `src/pages/ProductPage.css`；視實際 DOM 需要最小調整 `ProductPage.tsx`、`ProductPage.test.tsx`。操作按鈕與兩個 disabled 下載入口維持同一區域的上下兩列，移除造成擁擠的 `.product-page__downloads` 負 margin，設定明確的正向垂直間距與水平間距；窄螢幕容許下載文字換行或換列，不能覆蓋按鈕、搜尋欄或彼此。不得把 disabled 入口改成有功能的下載連結。原選檔／disabled 回歸維持；桌面與窄螢幕的元素邊界、文字及 Figma 位置關係之瀏覽器檢查依本次驗證範圍調整暫緩。

### 執行順序與驗證

1. OQ-001～007 為首次實作的歷史決議；本次 Stock 過渡契約以 2026-10-13 需求變更為準。需求文件與 Gherkin 仍有可編輯庫存與非零數值案例，Programmer 不得以舊案例覆蓋本次明確決議；如需同步 PM 文件，由 PM 另行調整。
2. Plan Validation 完成後進入 Awaiting Review；人工審閱允許實作後才交 Programmer。
3. 本次差異以 TASK-001 → TASK-004 → TASK-005 處理 Stock；TASK-003 處理標籤、TASK-006 處理下載入口版面，兩者不依賴 Stock。TASK-002 無程式差異，保持 DONE；此順序不要求啟動額外 Agent。
4. 測試沿用仍有效的 Gherkin 情境名稱並註記來源；Stock 可編輯／隨 request 送出部分已被本次使用者決議暫時取代。Service 控制 fetch，Page 控制 service 邊界；不要 mock 待測驗證或分頁演算法。
5. 實作後跑相關 Vitest，再跑受共用欄位／Session 影響的登入註冊與 App 回歸，最後 `npm test`、`npm run build`、`npm run lint`。不引入新的測試框架或假設覆蓋率門檻。
6. TASK-003 與 TASK-006 的瀏覽器／Figma 介面視覺對照依最新使用者指示暫緩，均不阻擋本輪開發與審查狀態；保留原始碼、資產與既有自動化功能／回歸測試的核對。未執行的視覺檢查不得記為通過，亦不宣稱已驗證後端整合。

## VI. Review Status / Plan Validation

- [x] Requirement Type、既有行為差異、影響範圍與需求來源已整理。
- [x] 既有檔案／函數已從 Repository 核對；提案新增路徑已明示。
- [x] 五份 Figma context 與截圖已讀取，三份 Flow 與四份 Scenario 文件已核對。
- [x] 元件重用、API／DB／設定影響、錯誤處理、Session 與測試策略已記錄。
- [x] 使用者確認的 1/2 頁碼已納入，未修改 PM 需求原文。
- [x] 分類來源／多分類格式與數值契約已確認。
- [x] 錯誤文案、搜尋與分頁刷新邊界已納入計畫。
- [x] 所有需求已有對應實作步驟與測試策略。
- [x] TASK-003／006 介面視覺測試暫緩已納入驗證策略，功能與回歸測試維持。
- [ ] Implementation Plan 已完成人工審核。
- [x] 本次差異 Development 完成。
- [ ] 本次差異 Code Review 通過。

先前版本的 `npm test`（22 個測試檔、181 項通過）與 lint 結果僅屬歷史驗證。Figma 左右分頁圖示已下載至 `public/icon/` 並套用；以下 Programmer Handoff 記錄的是本次驗證範圍調整前的開發狀態，最新完成門檻以上方「介面驗證範圍再調整」為準。

### Programmer Handoff（2026-10-13）

Programmer 重新依最新計畫核對 Required Delta、相關測試與 Issue；目前沒有本 Feature 的 OPEN Implementation Issue。`npm test -- --run` 全量測試 22 個測試檔、186 項通過；本次程式變更的 `npm run build` 與 `npm run lint` 均通過。TASK-001／004／005／006 已完成開發並更新為 `DEVELOPED DONE`；TASK-006 視覺檢查依使用者指示暫緩，不阻擋本輪完成。TASK-003 程式與自動化測試已完成，但仍待該 Task 明訂的標籤尺寸及 close 圖示瀏覽器／Figma 對照，因此維持 `PLAN UPDATED`。Code Review Status 尚待 Code Reviewer 處理；本次不將任何項目標為 `DONE`。

### Programmer Fix Handoff（2026-10-13）

已依 TASK-005 複審結果，在 `ProductPage.test.tsx` 驗證庫存為 0 的商品列實際顯示 `0`；服務層仍負責將 API 缺少 stock 的回應正規化為 0。TASK-005 修正已完成，相關定向測試 33 項、全套 Vitest 22 個測試檔／186 項、build 與 lint 均通過，狀態更新為 `DEVELOPED DONE`，等待 Code Reviewer 複審。TASK-003 的 close 圖示尺寸已依設計節點改為 12px，既有標籤互動測試包含在上述測試結果內；但本機瀏覽器控制介面沒有可用瀏覽器，無法完成計畫要求的本機實際渲染對照，因此 TASK-003 維持 `PLAN UPDATED`，不得宣稱視覺驗收完成。

### System Design 驗證範圍更新（2026-10-13，最新）

上述 Programmer Handoff 的 TASK-003「須完成本機瀏覽器／Figma 對照」是更新前門檻，現已依使用者指示暫緩；TASK-006 維持相同暫緩。TASK-003 保持 `PLAN UPDATED` 供 Programmer 依最新 Plan 核對既有程式、資產與測試結果，確認其餘完成條件後再更新為 `DEVELOPED DONE`；TASK-005 的 `DEVELOPED DONE` 與其 Code Review 交接不受影響。本次只修改 Plan，未新增或執行測試，也未變更程式碼。

### Programmer TASK-003 確認與交接（2026-10-13，最新）

依最新驗證範圍核對 `ProductLabelInput`、`ProductForm`、`ProductPage`、本地 `label-close.png` 與既有測試。Enter 與候選點擊共用標籤新增邏輯；已載入商品分類去重、IME、逗號防護、單筆／全部清除、多分類編輯回填及送出均有對應測試或既有 Code Review 紀錄。標籤樣式設定為 36px 最小高度、`#fdfaa9`、50px 圓角、14px 字體及 12px close 圖示，本地圖示檔存在且元件引用正確。前次同版程式的定向測試 33 項、全套 Vitest 186 項、build 與 lint 均通過；本次只有 Plan 變更，未重跑測試。瀏覽器／Figma 介面視覺對照依最新 Plan 暫緩，未記為通過。TASK-003 的其餘完成條件已滿足，Implementation Status 更新為 `DEVELOPED DONE`，Development Date 為 2026-10-13，交由 Code Reviewer 複審；`DONE` 尚未設定。

### Handoff 條件

本計畫的本次差異已進入 Awaiting Review。依 `agents/system-design-agent.md` 的 Plan Review 流程，審閱完成並允許實作後，Handoff 應包含本計畫、03 原始需求與本次使用者補充、Requirement Change／Bug Correction 類型及 TASK-001／003／004／005／006 的差異範圍；TASK-002 保持 DONE。不得修改登入註冊規則、權限管理、Excel 上下載 API、分類自動新增後端或進行無關重構。

## VII. 2026-10-14 擴充規劃：商品檔案 API 與 Get Product URI

> 本節是新一輪計畫；上方 2026-10-13 的「本次」、下載功能 disabled 占位及 Handoff 文字均為歷史紀錄。本輪以本節及 III 節最新任務狀態為準。僅規劃，未修改應用程式或測試。

### 需求來源、類型與差異

- **來源**：`Features/Document/03-Product Page.md` 的 2-2-5～2-2-7、2-3 批次管理及兩項下載行為；使用者於 2026-10-14 指出 Get Product URI 原先寫錯，可與 Get All 共用，要求評估重構。
- **New Requirement**：由既有選檔入口實際呼叫批次上傳，啟用 Excel 模板及商品報表下載。批次上傳成功後重新查詢商品清單；報表以目前**全部符合篩選條件**的商品 ID 組字串，並非只有目前 15 筆可見列；未篩選時使用所有已載入商品 ID。
- **Bug / Behavior Correction**：既有 `getProduct()` 使用 `/productController/getProduct?productId=<id>`，與更正後需求不符。應與清單同用 `/productController/getProducts`，以 `productId=all` 或編碼後的單筆 ID 區分。使用者已確認兩者的 `body.info` 均改為陣列；`getProducts()` 公開介面與清單行為不變，ProductPage 編輯前查詳情流程不變。
- **Original → Required → Difference**：檔案入口目前只有 Excel 選檔提示及兩個 disabled 下載按鈕 → 需與三個後端 API 整合 → 新增檔案傳輸、下載觸發、操作狀態與測試。單筆詳情目前走另一 URI 且解析物件 → 共用清單 URI 並解析陣列中的單筆商品 → 修改 service URL 組成、單筆解析及其測試，必要時抽取同一個私有 endpoint builder；保留兩個公開方法的回傳型別。

### 已核對系統與影響

| 檔案 | 現況及計畫影響 |
| --- | --- |
| `src/services/product-service.ts`、`.test.tsx` | 已有 `request()`、HTTP Uid／Authorization、30 秒 timeout／Abort、JSON／Status 解析及 `parseCollection`／`parseSingle`。TASK-001 修改單筆 URI 並測試；TASK-007～009 評估共用認證、逾時、錯誤分類，但檔案回應不得直接經過固定 `response.json()`。 |
| `src/pages/ProductPage.tsx`、`.test.tsx`、`.css` | 已有原生 Excel input、`uploadInputRef`、`filteredProducts`、`visibleProducts`、operation message、refreshProducts() 與兩個 disabled 下載入口。新增選檔後上傳、下載觸發、等待／失敗呈現；報表 ID 來自 `filteredProducts`，不是 `visibleProducts`。 |
| `src/components/Button/Button.tsx` | 既有 Button 支援 disabled，可重用；不必改共用按鈕。 |
| `src/App.tsx` | Session 清理由 App 統一持有；檔案請求若回 401，沿用 `onSessionExpired('使用者未授權')`。 |
| `vite.config.ts`、`nginx/default.conf.template` | 既有 `/productController` 代理前綴涵蓋新路徑；目前不規劃修改。 |

不新增 Excel parser 或下載套件；下載交由瀏覽器處理，僅在後端契約需要時再評估相容 API。無前端資料庫、路由或權限規則變更。勿將檔案內容、下載位置、token 記錄至 console。

### 尚待確認的 API 契約與阻礙

| ID | 需求文件現況 | 必須補充的內容及影響 |
| --- | --- | --- |
| OQ-008 | **RESOLVED**：使用者於 2026-10-14 確認 Get Product 與 Get All 的 `body.info` 都是陣列。 | `getProduct()` 預期陣列中恰有一筆對應 ID 的商品；空陣列、多筆或 ID 不符應視為 protocol error，HTTP 404 仍依原錯誤分類處理。 |
| OQ-009 | **主要傳輸型式 RESOLVED**：使用者於 2026-10-14 確認 POST 使用 `multipart/form-data` 傳 Excel 檔案本體。 | 採表單欄位 `file`（對應需求既有欄位名）；瀏覽器自動產生含 boundary 的 Content-Type，前端不手動設 `application/json` 或 multipart Content-Type。成功回應仍按需求文件的 JSON `body.info` 商品陣列解析；400／404 的訊息如未提供，沿用 HTTP 通用處理。檔案大小上限未定，不自行新增限制。 |
| OQ-010 | **RESOLVED**：使用者於 2026-10-14 指定兩個下載 API 直接回 Excel 位元資料，交由瀏覽器儲存在其設定的下載位置；同意固定檔名。 | 成功回應以 Blob 讀取，絕不解析需求文件中的舊 `body.info.file` 路徑。若後端提供有效 `Content-Disposition` 檔名則採用，否則模板用 `product-template.xlsx`、報表用 `product-report.xlsx`。前端不指定本機任意路徑。 |
| OQ-011 | **RESOLVED**：使用者於 2026-10-14 指定 0 筆符合篩選時停用報表下載，商品 ID 不含逗號；後端會按逗號切割 `ids` 查詢。 | 依篩選後全部商品 ID 以逗號合併；無資料不送 POST。模板與報表其他非成功 HTTP 統一按既有 401／一般 HTTP 錯誤處理，不自行新增特殊狀態碼。 |

需求文件所列 JSON `headers` 依 `instructions/project.md` 視為真正 HTTP headers；不能把認證資料包在 JSON body。檔案傳輸型式以 2026-10-14 使用者補充為準，取代文件中 `file_path` 與 JSON Content-Type 的舊範例；後端仍需同步實際契約。OQ-008～011 均已依使用者回覆關閉。

### Implementation Steps

#### TASK-001 Get Product URI 更正與有限重構（PLAN UPDATED）

- **File / Target / Plan Type**：MODIFY `src/services/product-service.ts` 的 `getProducts()`、`getProduct()` 與產品 endpoint 常數；MODIFY `src/services/product-service.test.tsx` 的單筆／清單請求案例。
- **Current Behavior**：清單 URL 是 `/productController/getProducts?productId=all`，詳情 URL 是 `/productController/getProduct?productId=<encoded id>`；分別由 `parseCollection`／`parseSingle` 驗證。
- **Expected Behavior / Implementation**：兩者共用 `/productController/getProducts` 基底與同一個 productId URL 組成規則；單筆 ID 使用 `encodeURIComponent`，`all` 僅代表清單查詢。保留 `getProducts`／`getProduct` 的方法、型別、認證、Abort 與錯誤邊界；將 `parseSingle` 調整為驗證 `body.info` 為陣列且恰有一筆、其 id 與要求的 productId 相符，回傳該 Product。其他新增／更新的單筆物件回應仍沿用原 parser，須拆開解析責任，不能因 Get 更正破壞 mutation。
- **Reuse / Impact / Error Handling**：沿用現有 `request()`、`parseProduct()`、清單及編輯載入流程；不改 CRUD 其他 endpoint。401／404／network／timeout 的分類維持原狀。
- **Testing**：同時斷言清單及單筆共用路徑、單筆 ID 正確 URL 編碼、陣列單筆成功、空陣列／多筆／ID 不符、錯誤格式、新增／更新物件回應不回歸、編輯頁面仍先取得詳情再開窗。避免只測新常數而漏掉實際 fetch URL。

#### TASK-007 Excel 批次上傳（TODO）

- **File / Target / Plan Type**：MODIFY `src/services/product-service.ts`、`.test.tsx`，新增私有／匯出的上傳服務函數；MODIFY `src/pages/ProductPage.tsx`、`.test.tsx` 的 `handleFileSelected`、操作狀態及批次管理按鈕。
- **Current Behavior**：input 僅選擇 `.xlsx,.xls`，選後提示尚未開放，不送 API；重選同檔可再次觸發。
- **Expected Behavior / Implementation**：選檔後呼叫 POST `/productController/batchProducts`；以 `FormData` 的 `file` 欄放入選定 Excel `File`，附 HTTP Uid／Authorization，不送本機路徑，且不手動設定 Content-Type。成功按需求文件的 JSON `body.info` 商品陣列驗證，然後沿用 `refreshProducts()` 更新 Table 與原有篩選／有效頁碼；選檔取消不送請求，同一檔案可重選。上傳期間禁止重複送出，卸載／Session 變更要停止套用舊結果。
- **Reuse / Impact / Error Handling**：沿用 input、頁面訊息、401 Session 過期處理與 refresh；400／404／網路／timeout 不宣稱成功，顯示後端允許的訊息。後端可能已收檔但前端 timeout 時不自動重送；上傳成功而清單 refresh 失敗時只提供重查清單，不重新上傳。
- **Testing**：取消選檔 0 次 POST、實際選檔只送一次、檔案本體／headers 符合確認的契約、成功刷新清單、401 清 Session、400／404 及協定錯誤呈現、重選同檔、重複點擊、取消／卸載的晚到回應、refresh 失敗不重複 POST。

#### TASK-008 Excel 模板下載（TODO）

- **File / Target / Plan Type**：MODIFY `src/services/product-service.ts`、`.test.tsx` 增加下載模板呼叫；MODIFY `src/pages/ProductPage.tsx`、`.test.tsx` 啟用既有「下載批次新增商品模板」入口並呈現等待／錯誤。
- **Current Behavior**：disabled 占位，不發請求。
- **Expected Behavior / Implementation**：使用者點擊時 GET `/productController/downloadTemplate`，帶 HTTP Uid／Authorization；成功時讀取 Excel Blob，建立暫時 object URL 並觸發瀏覽器下載，儲存位置由瀏覽器設定決定。不得將位元資料交給既有 `response.json()`；不把舊 `file_path` 範例當成實際回應。下載流程只由點擊觸發，進行中避免重複請求。
- **Reuse / Impact / Error Handling**：重用 Button、Page Session 處理及 service 的 HTTP／401／timeout 錯誤分類；成功以 Blob 讀取，HTTP 非成功不得當成 Excel 下載；優先採用有效 `Content-Disposition` 檔名，否則使用 `product-template.xlsx`。object URL 使用後釋放。
- **Testing**：一次點擊一次 GET、Session headers、成功下載資料／檔名依確認契約、401、非成功 HTTP、格式錯誤、重複點擊與清理；不以僅移除 disabled 代表完成。

#### TASK-009 篩選結果商品報表下載（TODO）

- **File / Target / Plan Type**：MODIFY `src/services/product-service.ts`、`.test.tsx` 增加報表請求；MODIFY `src/pages/ProductPage.tsx`、`.test.tsx` 啟用「下載商品報表」。
- **Current Behavior**：disabled 占位；`filteredProducts` 已依名稱與分類搜尋推導全量結果，`visibleProducts` 只代表當頁 15 筆。
- **Expected Behavior / Implementation**：點擊時取 `filteredProducts.map(product => product.id)`，以逗號合併後放入 POST `/productController/downloadProductData` 的 `body.info.ids`，供後端切割後查詢；商品 ID 不含逗號。有篩選時只含所有符合項，無篩選時含所有已載入商品，不受頁碼影響。0 筆符合時停用下載，不送 POST；成功回 Excel Blob，重用 TASK-008 的瀏覽器下載處理與有效 `Content-Disposition` 檔名處理，缺少檔名時使用 `product-report.xlsx`。
- **Reuse / Impact / Error Handling**：重用現有篩選結果與 TASK-008 確認後的下載處理，不另做一套搜尋；帶 Session headers，401 沿用 App 清理；逾時／網路錯誤不自動重送 POST，避免重複產生報表。
- **Testing**：未篩選傳全量 ID、雙欄篩選傳所有符合 ID、第二頁仍包含第一頁符合商品、無資料依 OQ-011、Session／HTTP／協定錯誤、成功下載與重複點擊。測試實際 `body.info.ids`，不能只驗證 UI 文案。

### 執行順序、驗證及 Review

1. OQ-008～011 已確認；實作時按本節的 HTTP request／response 契約執行。若 PM 同步更新需求文件，以更新後文件為準，若與本節衝突須重新分析。
2. TASK-001 的 URI 與回應形狀修正可獨立進行設計審閱。TASK-007 與 TASK-008 可於契約確認後分別實作，TASK-009 重用 TASK-008 的已驗證下載處理。若調整已完成 TASK-006 的 input／disabled 入口，僅作 TASK-007～009 的必要修改，不重置其歷史 DONE。
3. 定向執行 `product-service.test.tsx`、`ProductPage.test.tsx` 及 Session 回歸，再執行 `npm test -- --run`、`npm run build`、`npm run lint`。只有本計畫完成後的實際結果可記入新一輪驗證紀錄；目前沒有新增測試或執行驗證。
4. 本輪計畫狀態為 **Awaiting Review**；通過人工審閱後，再進入 Programmer Handoff。Handoff 包含原始需求文件、本節使用者補充、TASK-001／007～009 的實作範圍與檔案傳輸契約；不得修改登入註冊、無關 CRUD／庫存規則或引入 Excel parser。2026-10-13 已完成的其他 Task 狀態保持原樣，TASK-001 因重新修改規格標為 `PLAN UPDATED` 並清除舊開發／審查日期；新任務標為 `TODO`。

### Plan Validation（2026-10-14）

- [x] 新需求與 URI 更正已分別判定 Requirement Type，記錄原行為、目標行為及差異。
- [x] 已核對既有 service、Page、篩選／分頁資料流、Session、測試、代理設定及可重用的 Button／refresh 邏輯。
- [x] 每個 Task 均指定已存在的實作與測試檔案、方法、錯誤路徑和驗證方式；未新增無關依賴、資料庫或設定變更。
- [x] OQ-008～011 已依使用者回覆處理；舊版 `file_path`／JSON 下載範例與新契約的差異已記錄，後端仍須與本節契約一致。
- [x] 下載範圍使用篩選後全量清單，0 筆停用；Session、逾時及重複請求已納入測試策略。
- [ ] Implementation Plan 已完成人工審核。
- [x] TASK-001／007～009 Development 完成。
- [x] TASK-001／007～009 Code Review 通過。

### Programmer Handoff（2026-10-14）

已完成 TASK-001／007～009：Get Product 與 Get All 共用查詢 URI，單筆 GET 驗證陣列恰有目標商品，新增／更新仍驗證物件；批次上傳以 `FormData.file` 傳檔並在成功後重新查詢清單；模板與報表以 Blob 觸發瀏覽器下載，優先採回應檔名、否則使用已確認的固定檔名。報表傳送全部符合篩選條件的商品 ID，0 筆時停用下載。未改動既有登入註冊、庫存及其他 CRUD 契約。

測試新增單筆 URI／回應形狀、multipart 上傳、Excel 下載、跨頁篩選 ID、401、重複上傳與清單重查失敗。`npm.cmd test -- --run`：22 個測試檔／196 項通過；`npm.cmd run build`、`npm.cmd run lint` 均通過；`git diff --check` 通過。未連接實際後端驗證檔案傳輸。TASK-001／007～009 狀態為 `DEVELOPED DONE`，交由 Code Review Agent 審查；`DONE` 尚未設定。

### Code Review（2026-10-14）

本輪審查 Requirement List 中全部六項 `DEVELOPED DONE` 任務。TASK-003／005 通過並更新為 `DONE`，Review Status 為 `RESOLVED`；TASK-001／007～009 均為 `REVIEW FIX`，Review Status 為 `OPEN`，Code Review Date 均為 2026-10-14。TASK-001 的共用 request 重構改變既有 JSON 錯誤文案；TASK-007 缺 Plan 指定的上傳失敗與晚到回應頁面測試；TASK-008／009 的共用 Blob 解析接受非 Excel 的 `text/plain` 回應，下載檔名／清理及錯誤／重複請求測試亦不足。詳細位置與修正範圍記錄於各 Task Review 文件。審查未修改 Production 或 Test Code；Reviewer 定向執行 Product service／Page 測試 68 項及 ProductLabelInput／App 測試 21 項，均通過。Programmer 前次全套 196 項、build 與 lint 通過屬前次驗證紀錄，不能取代本輪發現的缺口。

### Programmer Review Fix Handoff（2026-10-14）

依 `Features/Review/03-Product Page/` 的 TASK-001／007／008／009 OPEN Issue 完成修正：JSON 讀取失敗恢復既有文案「產品回應不是有效 JSON」，Blob 讀取失敗保留檔案專屬錯誤；Excel 下載拒絕 `text/plain` 等非 Excel Content-Type；下載連結觸發失敗時也移除暫時 DOM 節點並釋放 object URL。新增上傳 401、HTTP／404／協定錯誤及卸載晚到回應測試；下載測試驗證檔名、object URL 清理、HTTP／協定錯誤、401 與等待中防重複請求。已通過定向測試 2 檔／81 項、完整 Vitest 22 檔／209 項、`npm.cmd run build`、`npm.cmd run lint` 與 `git diff --check`。四項 Implementation Status 由 `REVIEW FIX` 更新為 `DEVELOPED DONE`，交由 Code Reviewer 複審；Review Status 仍為 `OPEN`，不由 Programmer 修改。未連接真實後端驗證檔案傳輸。

### Code Review Fix Validation（2026-10-14）

重新審查 TASK-001／007／008／009 的既有 OPEN Issue 與最新實作。JSON 讀取錯誤維持原訊息及取消／逾時分類；上傳頁面測試涵蓋 401、一般 HTTP／404／協定錯誤與卸載後晚到成功；下載共用服務拒絕 `text/plain`，頁面測試涵蓋檔名、object URL 清理、錯誤／401 不觸發下載及等待中防重複請求。未發現本次修正造成的 Plan 範圍內回歸。實際執行 `npm.cmd test -- --run`：22 檔／209 項通過；`npm.cmd run build`、`npm.cmd run lint` 通過。四份 Review Status 更新為 `RESOLVED`，四項 Implementation Status 更新為 `DONE`，Code Review Date 為 2026-10-14。尚未以真實後端驗證檔案傳輸契約。

## VII. 2026-10-14 Stock 暫行契約解除（最新計畫）

### Requirement Change 與差異

- **來源**：本次使用者明確告知「庫存的部分後端已開發完畢，請解除 Stock 被暫時忽略的設計」，對照 `Features/Document/03-Product Page.md` 2-2-1～2-2-3、2-3，以及新增／編輯 Gherkin。原 PM 需求文件的 Stock 規則未曾移除；2026-10-13 僅以暫行契約覆蓋。
- **Original Behavior（目前實作）**：`parseProduct()` 對缺省 `stock` 補 0；`ProductWriteInput` 不含 stock，新增／更新服務與 Page 均不送 stock；新增與編輯表單固定顯示停用的 0，驗證器不檢查庫存。批次上傳成功商品陣列也經過同一個 `parseCollection()`，因此目前接受缺省 stock。
- **Required Behavior**：恢復原需求的庫存欄位。新增表單初始值為 0，編輯表單以 Get Product 詳情的實際 stock 回填；兩者皆可編輯，送出值為有限且至少 0 的 JSON Number。新增／更新 payload 均包含 stock。清單、詳情、新增／更新與批次上傳成功回應的商品均要求有效 stock，缺省不得再轉 0；表格顯示服務驗證後的真實庫存。
- **Difference / Compatibility**：取消僅為後端尚未實作而設的前端容錯與停用行為；舊後端若仍省略 stock，成功回應將改判為 protocol error。既有 `Product.stock: number`、ProductTable 七欄、Get Product 共用 URI 與陣列形狀、HTTP headers、CRUD 狀態碼、分頁／篩選／下載規則維持。未取得真實後端回應或進行端對端驗證，後端完成情況以本次使用者告知為需求依據。
- **規則邊界**：Stock 以 JSON Number 傳輸；接受 0 與符合 Number／finite／非負條件的數值，不自行新增整數、上限或小數位限制。空白欄位不可因 `Number('')` 變成 0；無效輸入保留表單並顯示欄位錯誤及既有摘要，不呼叫 API。不對 Excel 檔案內容新增前端解析或驗證，批次上傳檔案仍由後端處理。

### Impact Analysis

| 範圍 | 變更 | 既有模組／資料流 |
| --- | --- | --- |
| API 解析與寫入 | MODIFY | `src/services/product-service.ts` 的 `parseProduct`、`ProductWriteInput`、`addProduct`、`updateProduct`；`src/services/product-service.test.tsx` 的正常／錯誤回應與 payload 案例。既有 `Product` 型別已要求 stock，無需新增型別檔。 |
| 商品表單與驗證 | MODIFY | `src/components/ProductForm/ProductForm.tsx`、`.test.tsx`、`src/pages/product-validation.ts`、`.test.tsx`；重用 FormField 的 number、min、error 與 aria 處理，無需修改共用 FormField 或 Modal。 |
| Page 協調 | MODIFY | `src/pages/ProductPage.tsx` 的 `toWriteInput` 與 `ProductPage.test.tsx` 的新增／編輯／顯示案例；沿用現有詳情載入、成功後 refresh、Session 與錯誤處理。 |
| 批次上傳 | MODIFY（共用解析影響） | `uploadProducts()` 仍使用 FormData.file 與 `parseCollection()`；其成功 fixture 須包含 stock，缺省／非法 stock 須驗證為 protocol error。不修改上傳 URI 或檔案傳輸格式。 |
| 商品表格、App、下載 | NO CHANGE | ProductTable 已直接呈現 `Product.stock`，App Session 擁有權與下載 ID 資料流不變；若相關測試 fixture 依新回應契約需補 stock，僅更新受影響資料。 |
| 設定／依賴／資料庫 | NO CHANGE | 不修改 `vite.config.ts`、代理、npm 套件或前端儲存結構；Repository 無本功能後端程式或資料庫 schema。 |

### Implementation Steps（覆蓋相同 Task 的舊 Stock 差異）

#### TASK-001 產品型別與 API 服務 — MODIFY／PLAN UPDATED

- **File / Target**：MODIFY `src/services/product-service.ts` 的 `parseProduct()`、`ProductWriteInput`、`addProduct()`、`updateProduct()`；MODIFY `src/services/product-service.test.tsx`。
- **Implementation**：`ProductWriteInput` 要求 `stock: number`；新增與更新仍分別明確映射契約欄位，新增不送 id、更新僅一次 PUT，兩者都送 stock，且不以 spread 帶出額外執行期欄位。`parseProduct()` 不再為缺省欄位補 0；每筆商品的 stock 必須是有限且至少 0 的 Number，維持既有 protocol error 分類。`getProducts`／`getProduct` 的 URI、單筆陣列檢查與 mutation 物件檢查不變。
- **Error Handling / Testing**：清單、詳情、新增、更新及共用 `parseCollection()` 使用者的正常 fixture 包含 stock；驗證 0 與非零可讀取，缺省、null、字串、負數與非有限值拒絕；驗證新增／更新 `body.info.stock` 為 Number 且不洩漏額外欄位，保留 HTTP、取消、逾時及 Session 錯誤回歸。

#### TASK-004 共用商品表單與浮動視窗 — MODIFY／PLAN UPDATED

- **File / Target**：MODIFY `src/components/ProductForm/ProductForm.tsx`、`.test.tsx`、`src/pages/product-validation.ts`、`.test.tsx`；目標為 `ProductFormValues`、`ProductFormErrors`、`validateProduct()` 與庫存欄位。
- **Implementation**：將 stock 納入字串草稿與驗證錯誤，新增初始值 `'0'`、編輯以 `String(initialProduct.stock)` 初始化。庫存欄使用既有 FormField number、`min="0"`、可編輯與錯誤呈現；表單清空後保留空字串供使用者修正。驗證 stock 非空、Number 可轉換、finite 且至少 0；不新增整數、最大值或精度政策。保留成本／售價最小 1、分類、Modal 與原有摘要／紅框規則。
- **Error Handling / Testing**：驗證新增初始 0 可提交、編輯顯示詳情真值且可修改，空白／負數／非數值拒絕且不呼叫 onSubmit，0 與正數可提交，欄位錯誤可於更正後清除。原停用 0 與「不驗證 Stock」案例改按新契約更新。

#### TASK-005 CRUD 協調、Session 與清單重整 — MODIFY／PLAN UPDATED

- **File / Target**：MODIFY `src/pages/ProductPage.tsx` 的 `toWriteInput()`；MODIFY `src/pages/ProductPage.test.tsx`。
- **Implementation**：在表單驗證通過後將庫存草稿轉為 Number，加入 ProductWriteInput，新增與編輯均傳給既有 service；編輯保留詳情的 id，不以清單值覆蓋。清單顯示回應中的真實 stock；成功關窗及刷新、401、409、重複提交與頁碼流程不變。
- **Error Handling / Testing**：頁面測試檢查新增預設 0 與自訂非零 stock、編輯詳情非零 stock 回填並修改、兩種 service 呼叫的實際數值 payload、空白／負數拒絕不送 API、刷新後表格顯示後端 stock。保留取消、Session、refresh 失敗及 CRUD 回歸；不再期待缺省 stock 顯示 0。

#### TASK-007 Excel 批次上傳服務與頁面流程 — MODIFY／PLAN UPDATED

- **File / Target**：MODIFY `src/services/product-service.test.tsx` 的 `uploadProducts()` 成功與格式錯誤案例；必要時調整 `src/pages/ProductPage.test.tsx` 的上傳結果 fixture。正式服務沿用 TASK-001 修改後的 `parseCollection()`，不另加解析分支。
- **Implementation / Testing**：驗證上傳成功商品陣列含 stock 0／非零時可解析並刷新清單，缺少或非法 stock 時不視為成功且不觸發成功刷新；原 multipart 檔案本體、HTTP headers、401、重複送出與晚到回應測試維持。

### Plan Validation 與 Handoff

- [x] Requirement Type 為 Requirement Change；原暫行契約、恢復後行為及不相容處已列出。
- [x] 原需求、Gherkin、現有 service／表單／驗證器／Page／測試及共用上傳解析已核對；受影響檔案、資料流與可重用元件均已指明。
- [x] API input／output、數值驗證、錯誤處理、Session、回歸策略及不修改範圍已定義；無新套件、設定或 DB 工作。
- [x] TASK-001／004／005／007 已設 `PLAN UPDATED` 並清除舊開發／審查日期；其餘完成任務維持 `DONE`。
- [ ] 本輪 Implementation Plan 人工審閱完成。
- [x] 本輪 Development 完成；依 TASK-001 → TASK-004 → TASK-005 → TASK-007 驗證，Stock 相關 4 檔／94 項與完整 Vitest 22 檔／217 項、build、lint 均通過。
- [x] 本輪 Code Review 通過。

本輪 Plan Status：**Awaiting Review**。依 `agents/system-design-agent.md` 的 Plan Review 流程，人工審閱完成後交 Programmer 實作；Handoff 包含本需求變更、原 PM 文件、上述四項 Task 與 Stock JSON Number／必填回應契約。僅變更 Stock 相關 service、表單、Page 與測試；保留 `vite.config.ts` 現有工作區修改，不改無關登入、下載、標籤或分頁規則。

### Programmer Stock Plan Update Handoff（2026-10-14）

依最新 Stock 暫行契約解除計畫完成 TASK-001／004／005／007：Product service 要求清單、詳情、CRUD 與批次上傳商品回應皆提供有限且非負的 JSON Number `stock`，新增／更新 payload 明確帶入 stock；新增表單預設 0、編輯表單回填詳情值，兩者可編輯，空白／負數／非法值均阻止送出並顯示欄位錯誤。沿用既有 `parseCollection()`，不改 multipart 傳輸與頁面 Session／CRUD 流程。Stock 相關定向測試 4 檔／94 項、完整 Vitest 22 檔／217 項、`npm.cmd run build`、`npm.cmd run lint` 及 `git diff --check` 通過。四項 Implementation Status 更新為 `DEVELOPED DONE`，Code Review Date 留空，交由 Code Reviewer 審查。未連接實際後端驗證 API 整合；工作區原有 `vite.config.ts` 修改予以保留。

### Code Review Result（2026-10-14 Stock 契約）

本輪僅審查 TASK-001／004／005／007 的最新 Stock 差異。服務解析、明確 payload 映射、表單草稿與驗證、Page 數值轉換及共用上傳解析均符合主要實作要求；Reviewer 定向執行四個相關測試檔，94 項通過。仍缺 Plan 明列的測試：TASK-001 非有限 stock 回應、TASK-004 預設 0 直接提交與欄位錯誤互動、TASK-005 預設 0 payload／空白阻止 API／刷新後後端庫存顯示，以及 TASK-007 上傳 stock 0／非法值與刷新顯示。四項 Review Status 設為 `OPEN`、Implementation Status 設為 `REVIEW FIX`，Code Review Date 為 2026-10-14；詳細修正範圍見 `Features/Review/03-Product Page/TASK-001.md`、`TASK-004.md`、`TASK-005.md`、`TASK-007.md`。既有已解決的歷史 Issue 不重開，未修改 Production 或 Test Code。

### Programmer Review Fix Handoff（2026-10-14）

依四項 OPEN Review Issue 補齊測試：TASK-001 使用 JSON `1e999` 確認非有限 stock 回應分類為 protocol；TASK-004 驗證新增表單預設 0 可提交，以及負數錯誤更正後可提交；TASK-005 驗證預設 0 payload、空白 stock 阻止 service 呼叫，並確認新增成功刷新後顯示回應庫存；TASK-007 驗證上傳回應的 0／非零 stock 可解析、缺省／負數拒絕，且成功刷新後表格顯示後端庫存。四個定向測試檔 99 項通過，`npm.cmd run lint` 與 `git diff --check` 通過。TASK-001／004／005／007 已更新為 `DEVELOPED DONE`，Review Status 維持 `OPEN`，交 Code Reviewer 複審。
