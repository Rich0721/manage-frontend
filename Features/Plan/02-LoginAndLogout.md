# 02-LoginAndLogout Implementation Plan

## I. Requirement Information

| 項目 | 內容 |
|---|---|
| Requirement Type | Requirement Change：重新確認登入／登出新功能草案，補入 Session 恢復、錯誤碼及產品型別 |
| Requirement Document | `Features/Document/02-LoginAndLogout.md` |
| Related Requirement | `Features/Document/01-Register.md`（共用輸入規則） |
| Scenario | `Features/Document/Scenarios/02-LoginAndLogout/01-Login.feature` |
| Flow Chart | `Features/Document/flows/02-LoginAndLogout/01-Login.mmd` |
| Related Plan | `Features/Plan/01-Register.md` |
| Plan Date | 2026-10-08 |
| Role | System Design Agent |
| Status | Awaiting Review；產品頁視覺修正與共用 Button 方案已更新，TASK-003／004／005 為 PLAN UPDATED，TASK-007 為 TODO |

本文件於 2026-10-08 依使用者提出的產品頁視覺差異與共用 Button 要求，由 System Design 重新核對並更新。原六項 Task 的初次實作與測試紀錄保留為歷史；本次 delta 尚未實作或驗證。OQ-001～007 均已解決。架構依 `instructions/project.md` 與 `instructions/architecture.md`；技術規範採 React、TypeScript、unit-test 與 figma-design-to-code Skills。角色流程依 `agents/system-design-agent.md`；後續 Programmer 依 `agents/programmer-agent.md` 執行。

### Missing Requirement Information

| ID | 缺口與待補資料 | 影響 |
|---|---|---|
| OQ-001 | RESOLVED：登入流程表已定義 200／Success、401／Failed、409／Failed 與對應 Message；409 只重送一次 | TASK-002／003：登入專屬 409 觸發 force；401 保留輸入並提示，不套用受保護 API 的失效導覽 |
| OQ-002 | RESOLVED：共用說明明訂 401 為 Uid／Authorization 比對失敗，403 為無操作權限 | TASK-004／005：401 清 Session、回登入並提示；403、409、422、網路錯誤不自動登出 |
| OQ-003 | RESOLVED：依 `instructions/project.md`「其他」的統一定義，範例 headers 為真正 HTTP request／response headers，不是 JSON 欄位 | TASK-002／004／005／006：Uid／Authorization／Status／Message 從 HTTP response headers 取得；request headers 與 JSON body 分開；Authorization 原值傳遞，不自行添加 Bearer |
| OQ-004 | RESOLVED：登入流程表已明訂保留原本輸入 | TASK-003：Alert 提示後允許修改與重送，不清空 Email／密碼 |
| OQ-005 | RESOLVED：Scenario 已使用 Password123／W1ongpassword | 兩者皆符合前端規則；失敗案例以後端 401 拒絕，不放寬共用驗證 |
| OQ-006 | RESOLVED：新增 Session 三種情境，明訂重新整理恢復登入、過期清除、無 Session 進登入頁 | TASK-004 採 sessionStorage＋App state；不新增需求未要求的 URL 路由。此為技術方案，非額外要求跨分頁或跨瀏覽器工作階段持久登入 |
| OQ-007 | RESOLVED：產品欄位對應已明訂 id／name／label_names 為 String，cost／price 為 Number | TASK-005 按明訂型別驗證五個顯示欄位，不接受 null 或自動轉型；成功 body.info 空陣列顯示「目前無產品」。未使用的稽核欄位不作阻擋條件 |

OQ-001～007 已全部解決。2026-10-08 依 `instructions/project.md` 新增的統一 Headers 定義完成 OQ-003 核對；以下記錄本功能的具體映射，共用規則仍以該文件為 Source of Truth。無未解決的核心 API 契約阻擋，Plan 仍須審查，不代表已批准開發。

### 已確認 API 電文映射

| API | HTTP request headers | JSON request payload | HTTP response headers | JSON response payload |
|---|---|---|---|---|
| Login | Content-Type: application/json；不帶登入授權 | `{ body: { email, password: passwordHash, isForceLogin } }` | Status、Message；成功另含 Uid、Authorization | `{ body: { info: { userName } } }` |
| Logout | Content-Type、Uid、Authorization | `{ body: { info: { userName } } }` | Status、Message | `{ body: { info: { userName } } }` |
| Get Products | Content-Type、Uid、Authorization | 無 request body | Status、Message | `{ body: { info: [...] } }` |

HTTP status code 使用 `Response.status`；業務 Status／Message 使用 `Response.headers.get(...)`，不可混用。Uid／Authorization 只從 HTTP response headers 取得；JSON 內同名欄位不作 fallback。JSON 保留原計畫的 body envelope。Status 值轉小寫比較，HTTP header 名稱依 Headers API 讀取；Authorization 原值送回。

既有註冊 service 使用 JSON status／message parser，與新共用定義存在歷史差異。本輪僅規劃登入／登出／產品，不改寫註冊契約；明列為既有功能另行核對事項，不聲稱既有註冊已符合新規則，也不把它重新列為 OQ-003 阻擋。

### 本次 Requirement Delta 與影響

| 原計畫 | 最新需求／調整 | 影響 |
|---|---|---|
| 錯誤映射尚未定義 | 登入 409 強制一次；登入 401 保留輸入；受保護 API 401 清 Session；403 保留 Session | MODIFY TASK-002／003／004／005 |
| App 純記憶體，重新整理回未登入 | 重新整理以保存的 Session 查詢產品，交後端確認授權 | MODIFY TASK-004，補儲存恢復與清除案例 |
| HomePage 初始 register | 無 Session 時顯示 HomePage 登入模式，仍可切至註冊 | MODIFY TASK-003／004 及初始畫面測試 |
| Product 型別待定 | 三個字串與兩個數字欄位，拒絕不符型別電文 | MODIFY TASK-005 |
| HTTP／JSON headers 位置未定 | 依專案共用規範固定讀寫 HTTP headers，補 HTTP response parser 與代理回應驗證 | MODIFY TASK-002／005／006 |
| 共用驗證、雜湊、API 代理與 UI 占位 | 行為不變 | NO CHANGE TASK-001／006 |

Scenario 的一般登入與強制登入仍寫在同一個 Scenario；建議 PM 拆開以便追蹤，非業務阻擋項。測試需分開涵蓋兩條流程，並由本次新增需求補足 Session／登出／403 等案例。本輪重新透過 get_design_context 取得產品 node 18:2 的完整結構及截圖，對照目前 source／CSS；尚未進行瀏覽器實際畫面量測。

### 產品頁視覺與共用 Button Delta（2026-10-08）

來源：使用者本輪要求重新核對產品設計，以及評估可依需求設定 CSS、文字與 URL 的 Button。Requirement Type 為 Bug / Behavior Correction（視覺）＋ Requirement Change（共用元件）。不新增 API、router 或商品異動業務。

| 項目 | 現有實作 | Figma／本次 Expected Behavior | Task |
|---|---|---|---|
| 內容結構 | 可見 h1「商品管理」，一般頁面 padding | 設計沒有內容大標題；保留 accessible section 名稱，toolbar 後接表格 | 005 |
| 位置 | 左右 padding 最大 72px，表格鋪滿內容區 | 1920px 參考畫布：table x=220、y=209、w=1606；toolbar 按鈕右緣與 table 對齊。以容器 margin／比例及 flex 排版實現，窄螢幕保留合理留白與表格橫捲 | 005 |
| 表格 | 左對齊、僅下框線、欄寬由內容決定 | 六欄等寬、文字置中、灰色表頭、完整 1px #b9b9b9 格線與 4px 外圓角；桌面字級 16px、列高約 41px | 005 |
| 圖示 | 兩個圖示皆 22px，靠左並間隔 12px | 編輯 24×24、刪除 26×26，於編輯欄中置中分開排列；仍為顯示用途，不新增操作 | 005 |
| 登出 | 透明背景，字級跟隨導覽 | 綠色圓角按鈕，參考 136×51、半徑 30、文字 20px；操作仍呼叫既有 onLogout | 004／007 |
| Header CSS | 主樣式與 mobile rules 放在 HomePage.css | 移至 SiteHeader.css，使 Header 可獨立使用；產品 Header 右留白約 26px、導覽於右方對齊，桌面高 115px，保留窄螢幕排版 | 004 |
| 加入商品 | 省略 | 使用者已確認顯示藍色圓角停用占位按鈕；不綁定 onClick、href 或 API，待後續需求再接功能 | 005／007 |
| 表頭文字 | 「價格」 | 需求文字優先，繼續使用「價格」，不改為設計稿「價錢」 | 005 |
| 重複按鈕 | LoginForm、RegisterForm、SiteHeader 各有原生 button 與重複基礎樣式 | 以 Button 共用呈現與原生互動語意；各頁保留布局、驗證、API 與導航決策 | 003／004／007 |

本次核對確認 public/icon/pencil.png 與 delete.png 非空，仍需實作時核對實際圖像與 Figma slot；不可將整張設計截圖當頁面資產。沒有安裝 UI library，不增加 dependency。AuthTabs 已封裝頁籤選取行為且外觀不同，本次不強制改為通用 Button。

## II. Requirement Summary

登入前先 trim 並驗證 Email／密碼，重用註冊規則；合法提交後以 SHA-256 digest 呼叫登入 API。初次 isForceLogin 為 boolean false，僅後端明確認定其他裝置已登入時，以相同 Email 與雜湊重送一次 boolean true。成功取得授權後進入 ProductPage，自動載入所有產品。

Uid 與 Authorization 皆存在才顯示登出；登出請求無論成功或失敗均清除本機授權並回 HomePage 登入模式。產品頁授權無效時同樣回登入；表格依資料列動態呈現，空集合顯示「目前無產品」。權限管理與編輯／刪除只做需求指定占位。

### Existing System Analysis / Delta / Impact

| 已確認 File / Target | Current Behavior | 本次影響 |
|---|---|---|
| `src/App.tsx` / App | 只渲染 HomePage | MODIFY：擁有登入 session 與畫面切換 |
| `src/pages/HomePage.tsx` / HomePage、handleSubmit、handleModeChange、cancelRequest | 預設 register；登入只記錄輸入，註冊具有請求鎖、取消與過期回應保護 | MODIFY：新增登入提交、成功回呼；保留原註冊流程 |
| `src/components/LoginForm/LoginForm.tsx` / LoginForm | section、永久 disabled 按鈕、尚未開放提示 | MODIFY：可提交表單、欄位錯誤與提交狀態 |
| `src/pages/register-validation.ts` / normalizeRegisterForm、validateRegisterForm | Email／密碼規則封裝於註冊模組，內部 getPasswordError | MODIFY：抽取共用規則，保留兩個既有匯出介面 |
| `src/services/api-response.ts` / getApiResponseStatus、getApiResponseMessage | 支援 JSON headers/header 及大小寫欄位相容，優先順序已有測試 | MODIFY：保留原匯出供註冊使用，另新增明確接收 HTTP Headers 的 parser 供本功能使用，不作 JSON fallback |
| `src/services/register-service.ts` / registerUser、RegisterServiceError | fetch、SHA-256、30 秒 timeout、AbortSignal 與協定錯誤 | REUSE pattern：不將登入塞進註冊服務、不無關重構 |
| `src/utils/sha256.ts` / sha256 | UTF-8、64 字元小寫 hex | REUSE，不新增雜湊套件 |
| FormField、AuthTabs、RegisterForm | 已有欄位呈現、頁籤及註冊行為 | REUSE，僅按必要 props 擴充 |
| `vite.config.ts`、`nginx/default.conf.template` | 僅代理 /userController；API_UPSTREAM 有既有設定 | MODIFY：加入 /productController，避免產品 API 落入 SPA HTML |
| `public/icon/pencil.png`、`public/icon/delete.png` | 已存在指定圖示 | REUSE：使用 /icon/... URL，實作時核对尺寸及圖像 |
| 產品頁、登入／登出服務、session | 尚不存在；未安裝 router 或 state library | ADD：以下新增路徑為設計提案，不聲稱既有模組存在 |

本 repository 未發現後端／Database 定義，不變更資料庫或後端。既有註冊任務表雖有歷史 Review 文字，六項任務皆列 DONE；本次以實際 source 為現況，不改動舊計畫或審查狀態。

### Figma 核對

2026-10-08 已依專案指定方式使用 get_design_context 取得檔案 RXG3NaxCrUXouqcYmp9TzC 的登入 node `1:5` 與產品 node `18:2`，兩者均回傳結構及截圖。

- 登入：TAMAS Header、登入／註冊頁籤、Email、密碼及登入按鈕；延伸現有 CSS 與 FormField。
- 產品：共用 Header、選取的商品管理、權限管理、登出、六欄表格與兩個圖示。採語意化 table 與可適應寬度的 CSS，不照搬絕對定位或 Tailwind。
- 設計稿欄名為「價錢」，需求明訂「價格」：採需求文字。
- 設計稿另有「加入商品」；使用者於本輪確認「顯示停用占位按鈕，後續再接功能」，取代初版省略方案。新增商品 URL／API 留待後續需求。
- 配色與背景依專案指引保持整體一致，不要求逐像素相同。實作階段再核對本地圖示与設計資產，不能保留暫時 Figma URL。

## III. Requirement List

原六項任務已完成初次實作；本次受影響任務改為 PLAN UPDATED 並清除舊 Development／Code Review Date；新元件任務 TASK-007 使用 TODO。未受影響任務保留原狀態。

| Task ID | Component Name | Plan Type | Plan Date | Implementation Status | Development Date | Code Review Date |
|---|---|---|---|---|---|---|
| TASK-001 | 共用認證欄位驗證 | MODIFY | 2026-10-08 | DEVELOPED DONE | 2026-10-08 | — |
| TASK-002 | 登入／登出 Service 與契約 | ADD | 2026-10-08 | DEVELOPED DONE | 2026-10-08 | — |
| TASK-003 | LoginForm 與 HomePage 登入流程 | MODIFY | 2026-10-08 | PLAN UPDATED | — | — |
| TASK-004 | Session、頁面切換與共用導覽 | MODIFY | 2026-10-08 | PLAN UPDATED | — | — |
| TASK-005 | 產品查詢與 ProductPage | MODIFY | 2026-10-08 | PLAN UPDATED | — | — |
| TASK-006 | 產品 API 代理 | MODIFY | 2026-10-08 | DEVELOPED DONE | 2026-10-08 | — |
| TASK-007 | 共用 Button 與表單按鈕整合 | ADD | 2026-10-08 | TODO | — | — |

本次 delta 順序：Plan Review → TASK-007 → TASK-003／004／005 → 互動回歸與產品頁視覺驗證。加入商品占位方式已確認。Button 元件資料夾屬既有 components 架構，無新增架構層或 barrel index.ts。

## IV. Technical Stack

TypeScript 5.9.3、React／React DOM 18.3.1、Vite 7.3.1、npm、原生 CSS／fetch／Web Crypto；沿用已安裝 Vitest 5.0.3、Testing Library React 16.3.3、user-event 14.6.7、jsdom 30.1.2。無新增 dependency、TSConfig 變更或 migration。

### 提議資料流與責任

1. HomePage 管理輸入與提交，LoginForm 僅渲染與回報事件；共用 validator 不依賴 React。
2. loginUser 管理 hash、初次請求與最多一次強制重送，回傳可辨識的結果；成功 callback 交給 App 保存 session。
3. App 保存唯一 `AuthSession | null`（uid、authorization、userName），以 sessionStorage 保存可恢復快照，不保存密碼／雜湊。啟動讀取並驗證快照後才決定畫面；授權是否有效由產品 API 回應判定，不另造有效期或驗證 API。不另建全域狀態套件或 URL 路由。
4. ProductPage 以 session 呼叫 getProducts；service 注入當次 session 組成 HTTP headers，不自行操作 React 或導航。只將授權傳往本服務同源 API。
5. SiteHeader 接收登出顯示與事件 props；App 處理 logoutUser，finally 清 session、清舊畫面資料、回 HomePage login。登出期間鎖定重複操作、取消產品請求，舊回應不能恢復 session。

## V. Implementation Steps

### TASK-001 共用認證欄位驗證

- **File**：ADD `src/pages/auth-validation.ts`、`src/pages/auth-validation.test.tsx`；MODIFY `src/pages/register-validation.ts`、既有 `src/pages/register-validation.test.tsx`；ADD `src/types/auth.ts` 的表單型別。
- **Target**：新增 normalizeLoginForm、validateLoginForm、共用 Email／密碼欄位驗證；既有 normalizeRegisterForm／validateRegisterForm 保留 API。
- **Plan Type**：MODIFY。
- **Current Behavior**：驗證僅供註冊。
- **Expected Behavior**：登入／註冊共享相同 predicate、常數與文案，登入不要求姓名與確認密碼。
- **Implementation**：沿用 trim、Unicode code point 計數；Email 必填、15–250 字元及既有格式；密碼必填、8–20 字元並含大小寫字母及數字。確認密碼仍保留註冊一致性檢查。頁面專用認證規則放 pages，不放 feature-independent utils。
- **Reuse**：現有驗證規則與測試邊界資料，不複製正規表達式。
- **Impact / Error Handling**：既有註冊輸入與錯誤行為不變；回傳欄位錯誤，不以例外處理使用者輸入。
- **Testing**：兩種表單規則一致；trim、空白、15／250 與 14／251、8／20 與 7／21、缺少任一字元種類；登入不受註冊專屬欄位影響。保留註冊回歸。

### TASK-002 登入／登出 Service 與契約

- **File**：ADD `src/services/auth-service.ts`、`src/services/auth-service.test.tsx`；擴充新 `src/types/auth.ts`；MODIFY `src/services/api-response.ts`、`src/services/api-response.test.tsx`。
- **Target**：新增 loginUser、logoutUser、AuthServiceError、AuthSession 與結果 union；共用模組新增 getHttpResponseStatus、getHttpResponseMessage，接收 HTTP Headers 並回傳 string 或 undefined；原 JSON parser 匯出維持不變。
- **Plan Type**：ADD。
- **Current Behavior**：沒有登入／登出 API。
- **Expected Behavior**：POST `/userController/login`；初次 false，HTTP 409（其他裝置已登入）才重送一次 true，第二次 409 停止並提示；401 提示帳密錯誤並保留輸入。HTTP 200 且 HTTP response header Status 正規化為 success、必要授權完整才成功。POST `/userController/logout` 於 HTTP request headers 攜帶當次授權，JSON body.info 攜帶 userName。
- **Implementation**：HTTP Content-Type 與 JSON body envelope 分開：登入 JSON 為 `{ body: { email, password: passwordHash, isForceLogin } }`，不套用註冊的 body.info；登出 JSON 為 `{ body: { info: { userName } } }`，兩者 JSON 均不含 headers。重送沿用同一次輸入快照及雜湊，不將 digest 再 hash；不對一般失敗、斷網、timeout 自動強制重送。Status／Message 使用新的 HTTP header parser，Uid／Authorization 使用 response.headers.get 取得並驗證非空字串；Authorization 保留原值。成功 JSON 以 unknown 解析 body.info.userName 並驗證為字串；缺必要值列 protocol error，不能半登入。缺少 HTTP 授權時不能從 JSON 補值；HTTP header 與 JSON 同名欄位衝突時只採 HTTP header。錯誤 Message 缺失時使用上層通用提示，不影響既定 HTTP 401／409 分支。
- **Reuse**：sha256；沿用既有 30 秒 timeout、AbortSignal 與 finally 清理模式。HTTP parser 由本任務新增，供登入／登出／產品共用；既有 getApiResponseStatus／getApiResponseMessage 僅留給註冊，不用於本功能。新增服務明確區分 timeout／network／http／protocol／crypto，不修改 RegisterServiceError。
- **Impact**：只新增必要 API 型別與服務；不改既有註冊 request。
- **Error Handling**：取消後不得啟動第二次登入；強制登入再遇相同回應也停止，不無限重試。失敗由上層提示；登出錯誤不阻止上層 finally 清除 session。日誌不得輸出密碼、雜湊、Authorization 或完整電文。
- **Testing**：核對 URL／method／envelope／headers、false→true 次序與最多兩次請求、同一 hash、錯誤不得觸發 force；取消、hash 失敗、timeout、非法 JSON、成功缺授權；登出成功／failed／HTTP error／斷網皆可被上層處理。Mock fetch 邊界，雜湊以既有模組與已知向量驗證，不 mock 待測服務。
- **Headers 契約驗證**：以真實 Response／Headers 結構建構 fetch 回應，Status／Message／Uid／Authorization 放 HTTP headers；檢查 request JSON 不含 headers。涵蓋不同 header 名稱大小寫、Success／success 值、HTTP headers 與 JSON 衝突、僅 JSON 提供授權仍失敗、缺少 HTTP Status／Uid／Authorization 的 protocol error；保留原 JSON parser 的註冊回歸測試。

### TASK-003 LoginForm 與 HomePage 登入流程

**本次 PLAN UPDATED Delta**：僅修改 `src/components/LoginForm/LoginForm.tsx`、`LoginForm.css`，必要時調整同目錄測試。用 TASK-007 的 Button 取代提交原生 button，明確傳 `type="submit"`、原 disabled 條件、原 children 文案，保留 form.onSubmit；保留頁面專屬的定位／尺寸／margin，將 border、cursor、focus-visible 等共用基礎樣式移至 Button。既有 HomePage 請求與驗證不變。測試確認 Enter 與 click 均只提交一次、停用時不可提交、登入失敗保留輸入。下列初版行為作原功能背景，不要求重做已完成的登入流程。

- **File**：MODIFY `src/components/LoginForm/LoginForm.tsx`、`LoginForm.css`、`LoginForm.test.tsx`（皆同目錄）；MODIFY `src/pages/HomePage.tsx`、`src/pages/HomePage.test.tsx`。
- **Target**：LoginForm props；HomePage 的登入 values／touched／submitting、handleChange、handleBlur、handleSubmit、cancelRequest。
- **Plan Type**：MODIFY。
- **Current Behavior**：登入無驗證或提交，按鈕固定停用。
- **Expected Behavior**：有效欄位可提交、錯誤 blur 提示、送出中停用；成功將完整 session 回報 App。
- **Implementation**：改為 form onSubmit，支援 Enter；重用 FormField 的 error 顯示；獨立登入與註冊 touched／error 或明確依 mode 分支。新增 onLoginSuccess 與 initialMode props；依最新需求無 Session 時預設 login，登出／失效返回也指定 login；保留使用者切至註冊的操作。沿用 request lock、requestId 與 AbortController；切換頁籤／卸載取消請求、忽略過期回應。不要由表單直接存 token。
- **Reuse**：AuthTabs、FormField、TASK-001、loginUser，以及現有模式切換清理。
- **Impact / Error Handling**：移除「登入功能尚未開放」。一般錯誤沿用 Alert 風格；失敗保留 Email／密碼，解除提交鎖後可修改重送。crypto／protocol／network 各提供可理解提示；取消不跳錯誤。註冊成功轉登入及註冊失敗保留行為維持。
- **Testing**：非法直接 submit 不發請求、按鈕狀態、blur 錯誤、重複送出、成功 callback、401 後輸入保留及修改重送、切換期間舊 response 不導航；成功使用 Password123，後端拒絕使用 W1ongpassword。修正原占位測試與預設 register 假設；註冊測試先切到註冊再驗證原行為，不降低驗證門檻。

### TASK-004 Session、頁面切換與共用導覽

**本次 PLAN UPDATED Delta**：MODIFY `src/components/SiteHeader/SiteHeader.tsx`、`SiteHeader.css`、`src/pages/HomePage.css`；ADD 尚不存在的 `src/components/SiteHeader/SiteHeader.test.tsx`。把 HomePage.css 的 `.site-header`、brand、nav 及 mobile rules 搬至 SiteHeader.css，移除 `.site-header__nav button` 這類會覆蓋共用 Button 變體的寬泛 selector。登出使用 Button 的綠色變體，權限占位使用文字變體並保留現有回呼；商品管理繼續用不可點擊 span、粗體底線。桌面對齊依 Figma Header 尺寸與位置，手機允許換行且不溢出。驗證 Header 單獨渲染也有樣式、按鈕 accessible name／事件正確、未授權無登出、商品管理非互動元素。App／session 與 service 不在本次修改範圍。

- **File**：MODIFY `src/App.tsx`、`src/pages/HomePage.tsx`、`src/pages/HomePage.css`；ADD `src/App.test.tsx`、`src/components/SiteHeader/SiteHeader.tsx`、`SiteHeader.css`、`SiteHeader.test.tsx`（皆同元件目錄）。
- **Target**：App session／畫面控制與 handleLogout；新增 SiteHeader；HomePage header 抽出。
- **Plan Type**：MODIFY。
- **Current Behavior**：App 永遠 HomePage；Header 只在 HomePage。
- **Expected Behavior**：session 完整才能呈現產品頁與登出；登出任何結果與授權無效均回 HomePage 登入模式。
- **Implementation**：App 以 sessionStorage key `manage-frontend.auth-session` 保存 uid、authorization、userName，React state 管理當前畫面。儲存讀取／解析與驗證放在 App 模組內具名函式，不放通用 utils；掛載 Effect 完成恢復前顯示初始化狀態，避免先顯示登入再切換。讀取結果以 unknown 驗證，uid／authorization 必須為非空字串、userName 為字串；無值或損壞資料視為無 Session，移除本功能 key 並進 login，不呼叫產品 API。完整快照恢復後由 ProductPage 的單一查詢流程 GET 產品，不重送 login，不建立第二組驗證請求；401 清 state 與儲存、回登入並提示重新登入；403 與一般失敗保留 Session、顯示錯誤且不顯示舊產品。登入成功於事件流程寫入快照再顯示產品；登出開始即移除快照，保留當次憑證快照供 logout 請求，finally 清空 state。此順序避免登出等待中重新整理恢復舊 Session。只操作本功能 key，不使用 storage.clear()。不新增 routes 資料夾或路由 dependency。App 經 props 傳 session 與失效回呼，SiteHeader 只處理呈現。商品管理於 ProductPage 粗體底線且不可點擊；權限管理用可鍵盤操作按鈕，顯示「權限管理尚未開放」占位，不實作 PermissionPage／權限 API。登出立即使產品畫面停止互動並取消其請求；舊非同步結果不得覆蓋新登入或重寫儲存。
- **Reuse**：現有 site-header 樣式、logoutUser、HomePage 模式切換模式。
- **Impact / Error Handling**：登入失敗不建立 session；缺少任一授權值不顯示登出、不呼叫產品 API。HTTP／業務／逾時／斷網／解析錯誤都不能阻止登出返回；不清除後又從舊 response 還原憑證。儲存 API 例外需捕捉；讀取失敗回登入，寫入失敗提示無法保存登入狀態，當次以記憶體維持並明確提示重新整理需登入；移除失敗亦提示，當前 state 仍必須清除，不宣稱儲存已成功清空。不記錄憑證內容。
- **Testing**：登入成功保存快照並轉產品；卸載再掛載模擬重新整理，驗證使用保存的授權查詢且不呼叫 login；恢復後 401 清儲存並提示、403／500／斷網保留 Session 且不顯示舊資料；無／損壞／部分授權進 login 且不呼叫產品 API。登出各類結果均回空登入表單，登出請求未完成前儲存已移除；失效後重新掛載不得恢復登入。涵蓋儲存讀寫移除失敗、StrictMode 恢復、登出與產品請求 race、連按登出；商品不可點、權限占位不呼叫 API。各案例清理 sessionStorage，避免互相污染。

### TASK-005 產品查詢與 ProductPage

**本次 PLAN UPDATED Delta**：MODIFY `src/pages/ProductPage.tsx`、`ProductPage.css`、`ProductPage.test.tsx`；只調整呈現結構與 CSS，保留 getProducts、錯誤與 session 回呼。移除可見大標題、以 section aria-label 保留名稱；增加右對齊 toolbar，放 Button 藍色變體的「加入商品」，`disabled`、`type="button"`，無 href/onClick。桌面 toolbar/table 依本輪 Delta 表的 1920px 座標與比例，使用自然流 flex/block，不用整頁 absolute。table 採 fixed layout 六欄等寬、完整格線、表頭灰底與置中；外框包在可水平捲動容器內，窄螢幕不壓縮欄位到不可讀。圖示於同欄的 flex wrapper 中水平置中，維持 24px／26px 原比例，仍是非互動圖片。零筆成功時保留表頭並以 colspan=6 的狀態列呈現「目前無產品」；loading／error 沿用既有區分，不顯示舊商品。確認表頭保留「價格」。現有 Product 型別實際位於 src/types/auth.ts，本輪不為此搬移型別或修改 service；下列初版 ADD 清單僅作歷史，不要求重建既有服務。

**本次驗證**：ProductPage 測試涵蓋停用占位不導航／不發新增 API、單筆／多筆／零筆、既有錯誤與失效回呼；用受控 API 與虛擬授權資料於瀏覽器檢查 1920×1080 和窄螢幕，記錄實作截圖與 Figma 對照。核對所有圖示的非空檔案、來源、slot、callsite 與有效 rendered geometry；不能以 JSX 測試通過代替視覺核對。

- **File**：ADD `src/types/product.ts`、`src/services/product-service.ts`、`src/services/product-service.test.tsx`、`src/pages/ProductPage.tsx`、`src/pages/ProductPage.css`、`src/pages/ProductPage.test.tsx`。
- **Target**：新增 Product、getProducts、ProductPage；Product 為 id／name／label_names: string、cost／price: number，僅映射本次顯示欄位。
- **Plan Type**：ADD。
- **Current Behavior**：沒有產品頁或查詢。
- **Expected Behavior**：進入時 GET `/productController/getProducts?productId=all`，HTTP headers 帶 Content-Type、Uid、Authorization；成功 body.info 陣列映射六欄。
- **Implementation**：Page 的 Effect 發起服務呼叫，依 session 改變取消／重載；卸載取消並忽略舊回應，兼容現有 StrictMode。Service 解析 unknown 並區分授權失效／業務失敗／協定錯誤。表格使用 id 作穩定 key；欄位依 id、name、label_names、cost、price，編輯欄放 /icon/pencil.png 與 /icon/delete.png。僅呈現圖示、提供用途文字，不發編輯／刪除請求。不自行依 deleted 篩選、不新增排序、分頁或金額計算。
- **Reuse**：SiteHeader、TASK-002 新增的 getHttpResponseStatus／getHttpResponseMessage、既有圖片；GET 無 request body。產品成功須 HTTP 成功且 HTTP Status 為 success，再解析 JSON body.info；不讀取 JSON headers。測試加入 HTTP／JSON Status 衝突及缺少 HTTP Status，確認不作 JSON fallback。
- **Impact / Error Handling**：loading、success、empty、error 分開；只有有效成功 body.info 空陣列顯示「目前無產品」。HTTP 401 優先通知 App 清 state 與儲存、回登入並提示，不因錯誤 body 解析失敗漏掉失效處理；403／409／422／5xx、斷網與逾時皆為一般錯誤，保留 Session 並提示，不冒充空清單或強制登出。沿用 30 秒 timeout 及取消清理；取消不顯示錯誤。缺必要欄位、null、欄位型別不符或 info 非陣列視為 protocol error，不靜默捨棄整筆資料；cost／price 接受有限數字，不將字串轉數字，零值照常顯示。deleted／updated_user／updated_at 不參與顯示或篩選，不因其型別未定義阻擋本次功能。
- **Testing**：所有 headers 與 query、單／多／零筆映射、loading、401 返回與提示、403 等其他錯誤不返回、非法回應、取消及舊 session 結果；圖示存在且無編輯／刪除副作用。驗證字串 id／name／label_names、數字 cost／price（含 0）；數字字串、null、缺欄位、info 非陣列不得假裝成功或空清單。測試 fixture 依明訂型別建構，不將文件 placeholder 當真實回應。

### TASK-006 產品 API 代理

- **File**：MODIFY `vite.config.ts`、`nginx/default.conf.template`、`src/vite-proxy.test.tsx`；確認後更新 `README.md` 的代理範圍與功能說明。
- **Target**：Vite server.proxy、nginx location、既有 CapturedRequest／代理測試。
- **Plan Type**：MODIFY。
- **Current Behavior**：產品 URI 尚無專用轉送。
- **Expected Behavior**：dev 與 nginx 都將 /productController 原路徑轉給 API_UPSTREAM，保留 query 及授權 HTTP headers。
- **Implementation**：複用現有上游來源、預設值與校驗，新增產品前綴；nginx 新增 `location ^~ /productController/` 並沿用既有代理參數。不得新增 rewrite 或改註冊 prefix、Docker 基底、部署位址。
- **Reuse**：現有 /userController proxy 與受控本機 backend 測試。
- **Impact / Error Handling**：產品 API 錯誤交還前端，不落入 index.html 偽成功；不把憑證加進代理日誌。
- **Testing**：受控 backend 驗證 GET 的 URI／productId=all／Uid／Authorization，非成功狀態透傳；既有註冊 POST 測試保留。nginx -t 與容器轉送待具備環境時執行，不能將靜態檢查說成已運行通過。
- **Response headers 驗證**：受控 backend 回傳 Status／Message，登入回應另含 Uid／Authorization，確認既有 /userController 與新增 /productController 代理均保留這些 HTTP response headers。沿用同源代理架構，不新增跨來源呼叫或無需求的 CORS 設定。

### TASK-007 共用 Button 與表單按鈕整合

- **File**：ADD `src/components/Button/Button.tsx`、`Button.css`、`Button.test.tsx`；MODIFY `src/components/RegisterForm/RegisterForm.tsx`、`RegisterForm.css`，必要時調整 `RegisterForm.test.tsx`。此新增元件目錄符合 architecture.md 的 components 慣例。LoginForm／SiteHeader／ProductPage 的 callsite 分別屬 TASK-003／004／005。
- **Target**：Button、ButtonProps（留元件檔內）、共用基礎樣式與 variants。
- **Plan Type**：ADD。
- **Current Behavior**：登入／註冊重複圓角、字體、disabled、cursor；Header 使用透明原生按鈕，沒有可依用途套用的外觀。
- **Expected Behavior**：共用 Button 依 props 控制 CSS、文字與導航／事件，頁面不需重写按鈕基礎行為。
- **Implementation**：`children` 提供文字／內容，`variant` 使用 `primary`（綠色）、`secondary`（藍色）、`text`，`className` 提供頁面 layout class；若需要局部尺寸用 CSS custom properties 明確調整，不傳入整段任意 CSS 字串。ButtonProps 採判別 union：未提供 href 時原生 button，透傳 ButtonHTMLAttributes、預設 type=button；提供 href 時原生 a，透傳 AnchorHTMLAttributes，排除 type／disabled 等 button-only props，以原生連結語意支援新分頁與鍵盤操作。需要停用時使用 button 分支，不建立假 disabled link。事件分支可接 onClick；表單按鈕明確 type=submit；href 分支為純 URL 導覽，不同時承擔 API 呼叫。不得在元件內硬編碼 userController、fetch、session 或 window.location。
- **CSS**：只將基本外觀、focus-visible、disabled 行為與變體放進 Button.css。保留表單按鈕既有位置／尺寸與提交前後文字，避免本輪改動登入／註冊版型。Product Header 與 toolbar 的圓角／尺寸由 callsite class 配合變體表達。未實作 placeholder 的淡色外观不能被當成真的 disabled 狀態；加入商品確實使用原生 disabled，登出則可操作。
- **Reuse / Scope**：RegisterForm 僅替換 submit control 與重複 CSS，保留註冊 onSubmit／驗證／服務／回應 parser。AuthTabs 已是可重用互動元件，本次保留其選取樣式與 aria-pressed，不強行泛化。
- **URL 與事件映射**：登入／註冊為 form submit；登出為既有 onLogout（service 呼叫 POST /userController/logout）；權限管理維持現有占位回呼；加入商品無事件／URL。Button 的 href 能力只提供給未來已定義的導航目標，本輪不得猜測 /products/new 或 /permissions，也不得將 API URL 放成 href。
- **Testing**：驗證預設 type=button 不意外送出表單、明確 type=submit 支援提交、disabled 不觸發 onClick、href 產生正確 link、文字及 aria-label 可設定；不以大量 CSS class 快照當作測試。登入／註冊現有互動回歸與 Header／ProductPage 案例需通過，保留 native focus 與鍵盤語意。
- **Impact**：無新 dependency、API、資料型別或路由；不變更其他功能的業務規則。已完成註冊計畫不重開，這次 RegisterForm UI-only delta 歸 TASK-007 管理。

### 本次 Delta 驗收

執行 Button、LoginForm、RegisterForm、SiteHeader、ProductPage 相關測試與既有 HomePage／App 回歸，完成 build、lint；再以瀏覽器對照 Figma 產品頁。前次 79 個測試通過僅為歷史，不代表本次修改已驗證。

### 原功能驗收對應

| 需求 | 任務 | 驗證重點 |
|---|---|---|
| 共用驗證及 SHA-256 | 001／002／003 | trim → validate → hash → request，無明碼出網 |
| 普通登入及其他裝置強制登入 | 002／003／004 | false 初次、指定衝突才 true 一次、成功轉產品 |
| 登入失敗與重送 | 002／003 | 正確錯誤提示、保留 Email／密碼、恢復提交 |
| Session 恢復與清除 | 003／004／005 | 重新整理帶保存的授權查詢、401 清除並提示、無 Session 進 login、登出後不可恢復 |
| 登出條件及無論結果返回 | 002／004 | 双憑證可見、headers 正確、finally 清理與 login mode |
| 產品授權及查詢 | 004／005／006 | 授權失效與一般錯誤可區分，query／header 正確 |
| 六欄／空資料／占位 | 004／005 | 指定欄名、目前無產品、無額外 API 副作用 |

實際驗證（2026-10-08）：初版的 `npm.cmd exec -- vitest run --reporter=dot --maxWorkers=1` 曾通過 15 個測試檔、79 個測試；僅屬歷史紀錄。視覺與 Button 本次 Delta 已建立共用 Button 並整合 TASK-003／004／005／007，新增 Header 與產品頁回歸案例。相關 7 個測試檔、23 個測試通過，`npm.cmd run build` 與 `npm.cmd run lint` 通過。完整測試目前 17 個檔案中 15 個通過、83/85 項測試通過；另 2 項既有 auth-service 測試預期登入 JSON `{ body: { email, password, isForceLogin } }`，與本 Plan 及服務目前定義的 `{ body: { info: { email, password, isForceLogin } } }` 不符，待核對／修正測試後重跑。瀏覽器自動化環境啟動失敗，尚未完成 1920×1080 與窄螢幕的 Figma 實際畫面對照，因此本次 Delta 尚未驗收完成，受影響任務仍保留 PLAN UPDATED／TODO。未連接真實後端、未執行 Docker/nginx 容器測試；留待環境／Review 驗證。

## VI. Review Status

**Status: Awaiting Review — 已開始實作產品頁視覺修正與共用 Button；加入商品停用占位已由使用者確認。本次 Delta 尚待完整測試及瀏覽器視覺驗收。**

- [x] 核對需求、流程、Scenario、既有計畫與相關 source／tests。
- [x] 核對 Figma 指定節點及既有圖示路徑。
- [x] 新增與既有檔案已分開標示；技術方案遵循既有分層，無不必要依賴。
- [x] API、Configuration、相容性、錯誤處理與測試影響已列出。
- [x] 不修改既有註冊 Business Rule、不擴充產品異動或權限業務。
- [x] OQ-001／002 錯誤映射已確認並同步任務。
- [x] OQ-003 依 instructions/project.md 確認 HTTP headers 來源，服務序列化、解析及測試策略已定稿。
- [x] OQ-004／005 輸入保留與 Scenario 密碼差異已解決。
- [x] OQ-006／007 重新整理恢復 Session 與產品型別已同步設計及測試策略。
- [x] Implementation Plan 已完成人工審核。
- [ ] 本次 Delta Development 完成；TASK-003／004／005 為 PLAN UPDATED、TASK-007 為 TODO。前次 15 個測試檔／79 個測試紀錄僅適用初版。
- [ ] Code Review 通過。

### Handoff

本次為 System Design 的視覺差異分析與 Plan Update。Plan Review 完成後，Programmer 處理 TASK-007、TASK-003／004／005 的 delta；TASK-001／002／006 保持 DEVELOPED DONE。本輪未修改 production／test code 或需求文件。加入商品只做已確認的停用占位；所有未定義 URL／商品異動 API／權限頁維持後續需求範圍。驗證通過後由 Programmer 設 DEVELOPED DONE，再交 Code Review。
