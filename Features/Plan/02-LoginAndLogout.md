# 02-LoginAndLogout Implementation Plan

## I. Requirement Information

| 項目 | 內容 |
|---|---|
| Requirement Type | New Requirement：啟用既有登入占位、新增登出與產品查詢 |
| Requirement Document | `Features/Document/02-LoginAndLogout.md` |
| Related Requirement | `Features/Document/01-Register.md`（共用輸入規則） |
| Scenario | `Features/Document/Scenarios/02-LoginAndLogout/01-Login.feature` |
| Flow Chart | `Features/Document/flows/02-LoginAndLogout/01-Login.mmd` |
| Related Plan | `Features/Plan/01-Register.md` |
| Plan Date | 2026-10-08 |
| Role | System Design Agent |
| Status | Awaiting Review；核心 API 契約待補，尚不可直接開始相依實作 |

本文件為初版規劃。已核對現有程式與測試；未修改需求、應用程式或測試。下列待確認事項不得視為已確認 Business Rule。角色與流程依 `agents/system-design-agent.md`，架構依 `instructions/project.md` 與 `instructions/architecture.md`；技術規範採 React、TypeScript、unit-test Skills。任務狀態遵循角色定義，優先於範本內不一致的重設說明。

### Missing Requirement Information

| ID | 缺口與待補資料 | 影響 |
|---|---|---|
| OQ-001 | 提供「其他裝置已登入」的 HTTP status、JSON 欄位與確切值及回應範例；一般登入失敗亦需範例 | TASK-002／003：不能以任意失敗或文字猜測觸發強制登入 |
| OQ-002 | 提供產品查詢「授權無效」的 HTTP status／業務欄位與確切值 | TASK-004／005：不能將全部網路或業務錯誤當成授權失效 |
| OQ-003 | 確認登入回傳 Uid／Authorization 位於真正 HTTP response headers 或 JSON headers；確認登入／登出 request 的 headers 屬 HTTP headers，JSON 僅包含 body | TASK-002／004：既有註冊採 HTTP headers + JSON body envelope，但尚不能當作登入後端的確認；Authorization 值先按原值傳遞，不自行添加 Bearer |
| OQ-004 | 簡介要求登入失敗保留輸入，流程第 3 點寫「需重新輸入」；請確認是否只是允許修改重送，或需要清空欄位 | TASK-003 的失敗狀態與驗收；建議採簡介明訂的保留行為，未視為已核准 |
| OQ-005 | Scenario 成功密碼 password123 缺大寫；失敗密碼 wrongpassword 缺大寫與數字，會被前端擋下 | 由 PM 修正 Scenario；測試成功可提議 Password123，後端拒絕可提議 Wrongpassword1，不能放寬註冊共用規則來配合資料 |
| OQ-006 | 是否要求重新整理仍登入、獨立頁面 URL 或瀏覽器返回導覽？目前需求只有頁面切換 | 下文提出記憶體 session＋App 畫面切換的最小方案供審查；如需持久化或 URL 路由，先更新 TASK-004，不由 Programmer 自訂 |
| OQ-007 | Product 欄位實際型別／nullable 規則未定義；文件全為字串 placeholder | TASK-005 service parser：需提供實際成功與空集合回應，尤其 id、cost、price、label_names；不猜測數字、陣列或 null 的轉換 |

OQ-001／002／003 是核心契約阻擋項。先保存已知分析及任務草案，收到補充後再定稿相依分支。已透過對話提出主要契約與失敗輸入問題。

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
| `src/services/api-response.ts` / getApiResponseStatus、getApiResponseMessage | 支援 JSON headers/header 及大小寫欄位相容，優先順序已有測試 | REUSE：不得因登入改壞註冊解析規則 |
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
- 設計稿另有「加入商品」；文字需求未定義功能，列 UI 審查問題，不新增商品 API 或自訂操作。本次提議省略，若需顯示占位由 PM 確認。
- 配色與背景依專案指引保持整體一致，不要求逐像素相同。實作階段再核對本地圖示与設計資產，不能保留暫時 Figma URL。

## III. Requirement List

TODO 僅代表尚未開始初次實作；不表示契約阻擋已解除或 Plan 已核准。每項任務含直接相關測試。

| Task ID | Component Name | Plan Type | Plan Date | Implementation Status | Development Date | Code Review Date |
|---|---|---|---|---|---|---|
| TASK-001 | 共用認證欄位驗證 | MODIFY | 2026-10-08 | TODO | — | — |
| TASK-002 | 登入／登出 Service 與契約 | ADD | 2026-10-08 | TODO | — | — |
| TASK-003 | LoginForm 與 HomePage 登入流程 | MODIFY | 2026-10-08 | TODO | — | — |
| TASK-004 | Session、頁面切換與共用導覽 | MODIFY | 2026-10-08 | TODO | — | — |
| TASK-005 | 產品查詢與 ProductPage | ADD | 2026-10-08 | TODO | — | — |
| TASK-006 | 產品 API 代理 | MODIFY | 2026-10-08 | TODO | — | — |

順序：補齊核心契約與 Plan Review → TASK-001／002／006 → TASK-003／004 → TASK-005 → 整合驗證。新元件資料夾僅屬既有 components 架構下的 colocated 元件，無新增架構層或 barrel index.ts。

## IV. Technical Stack

TypeScript 5.9.3、React／React DOM 18.3.1、Vite 7.3.1、npm、原生 CSS／fetch／Web Crypto；沿用已安裝 Vitest 5.0.3、Testing Library React 16.3.3、user-event 14.6.7、jsdom 30.1.2。無新增 dependency、TSConfig 變更或 migration。

### 提議資料流與責任

1. HomePage 管理輸入與提交，LoginForm 僅渲染與回報事件；共用 validator 不依賴 React。
2. loginUser 管理 hash、初次請求與最多一次強制重送，回傳可辨識的結果；成功 callback 交給 App 保存 session。
3. App 提議保存唯一 `AuthSession | null`（uid、authorization、userName），不保存密碼／雜湊；不另建全域狀態套件。記憶體方案與 URL 行為待 OQ-006 審查。
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

- **File**：ADD `src/services/auth-service.ts`、`src/services/auth-service.test.tsx`；擴充新 `src/types/auth.ts`。
- **Target**：新增 loginUser、logoutUser、AuthServiceError、AuthSession 與結果 union；具體後端錯誤映射待 OQ-001／003。
- **Plan Type**：ADD。
- **Current Behavior**：沒有登入／登出 API。
- **Expected Behavior**：POST `/userController/login`；初次 false，只有已確認其他裝置回應才重送一次 true。POST `/userController/logout` 攜帶當次授權與 userName。
- **Implementation**：提議沿用 HTTP Content-Type 與 JSON body envelope：登入 JSON 為 `{ body: { email, password: passwordHash, isForceLogin } }`，不套用註冊的 body.info；登出 JSON 為 `{ body: { info: { userName } } }`。此序列化須 OQ-003 確認後才定稿。重送沿用同一次輸入快照及雜湊，不將 digest 再 hash；不對一般失敗、斷網、timeout 自動強制重送。成功 response 以 unknown 解析，Uid／Authorization 必須為非空字串，userName 需符合登出契約；缺必要值列 protocol error，不能半登入。
- **Reuse**：sha256、getApiResponseStatus、getApiResponseMessage；沿用既有 30 秒 timeout、AbortSignal 與 finally 清理模式。新增服務明確區分 timeout／network／http／protocol／crypto，不修改 RegisterServiceError。
- **Impact**：只新增必要 API 型別與服務；不改既有註冊 request。
- **Error Handling**：取消後不得啟動第二次登入；強制登入再遇相同回應也停止，不無限重試。失敗由上層提示；登出錯誤不阻止上層 finally 清除 session。日誌不得輸出密碼、雜湊、Authorization 或完整電文。
- **Testing**：核對 URL／method／envelope／headers、false→true 次序與最多兩次請求、同一 hash、錯誤不得觸發 force；取消、hash 失敗、timeout、非法 JSON、成功缺授權；登出成功／failed／HTTP error／斷網皆可被上層處理。Mock fetch 邊界，雜湊以既有模組與已知向量驗證，不 mock 待測服務。

### TASK-003 LoginForm 與 HomePage 登入流程

- **File**：MODIFY `src/components/LoginForm/LoginForm.tsx`、`LoginForm.css`、`LoginForm.test.tsx`（皆同目錄）；MODIFY `src/pages/HomePage.tsx`、`src/pages/HomePage.test.tsx`。
- **Target**：LoginForm props；HomePage 的登入 values／touched／submitting、handleChange、handleBlur、handleSubmit、cancelRequest。
- **Plan Type**：MODIFY。
- **Current Behavior**：登入無驗證或提交，按鈕固定停用。
- **Expected Behavior**：有效欄位可提交、錯誤 blur 提示、送出中停用；成功將完整 session 回報 App。
- **Implementation**：改為 form onSubmit，支援 Enter；重用 FormField 的 error 顯示；獨立登入與註冊 touched／error 或明確依 mode 分支。新增 onLoginSuccess 與 initialMode props；預設保留現有 register 初始模式，登出／失效返回時明確指定 login。沿用 request lock、requestId 與 AbortController；切換頁籤／卸載取消請求、忽略過期回應。不要由表單直接存 token。
- **Reuse**：AuthTabs、FormField、TASK-001、loginUser，以及現有模式切換清理。
- **Impact / Error Handling**：移除「登入功能尚未開放」。一般錯誤沿用 Alert 風格；失敗輸入保留或清除依 OQ-004 定稿。crypto／protocol／network 各提供可理解提示；取消不跳錯誤。註冊成功轉登入及註冊失敗保留行為維持。
- **Testing**：非法直接 submit 不發請求、按鈕狀態、blur 錯誤、重複送出、成功 callback、失敗後重送、切換期間舊 response 不導航；修正原占位測試但保留註冊測試。Scenario 無效資料差異須註明，不降低驗證門檻。

### TASK-004 Session、頁面切換與共用導覽

- **File**：MODIFY `src/App.tsx`、`src/pages/HomePage.tsx`、`src/pages/HomePage.css`；ADD `src/App.test.tsx`、`src/components/SiteHeader/SiteHeader.tsx`、`SiteHeader.css`、`SiteHeader.test.tsx`（皆同元件目錄）。
- **Target**：App session／畫面控制與 handleLogout；新增 SiteHeader；HomePage header 抽出。
- **Plan Type**：MODIFY。
- **Current Behavior**：App 永遠 HomePage；Header 只在 HomePage。
- **Expected Behavior**：session 完整才能呈現產品頁與登出；登出任何結果與授權無效均回 HomePage 登入模式。
- **Implementation**：提議 OQ-006 採 App 記憶體 state，重新整理回未登入；不新增 routes 資料夾或路由 dependency。App 經 props 傳 session 與失效回呼，SiteHeader 只處理呈現。商品管理於 ProductPage 粗體底線且不可點擊；權限管理用可鍵盤操作按鈕，顯示「權限管理尚未開放」占位，不實作 PermissionPage／權限 API。登出立即使產品畫面停止互動並取消其請求；logout finally 清空 session 並卸載受保護頁，舊非同步結果不得覆蓋新登入。
- **Reuse**：現有 site-header 樣式、logoutUser、HomePage 模式切換模式。
- **Impact / Error Handling**：登入失敗不建立 session；缺少任一授權值不顯示登出、不呼叫產品 API。HTTP／業務／逾時／斷網／解析錯誤都不能阻止登出返回；不清除後又從舊 response 還原憑證。
- **Testing**：登入成功轉產品；無／部分授權不顯示登出；登出各類結果均回空登入表單；失效時清 session；登出與產品請求 race、連按登出；商品不可點、權限占位不呼叫 API。若 OQ-006 要求 URL／持久化，先修訂此任務與案例。

### TASK-005 產品查詢與 ProductPage

- **File**：ADD `src/types/product.ts`、`src/services/product-service.ts`、`src/services/product-service.test.tsx`、`src/pages/ProductPage.tsx`、`src/pages/ProductPage.css`、`src/pages/ProductPage.test.tsx`。
- **Target**：新增 Product、getProducts、ProductPage；Product 型別由 OQ-007 範例確認後定稿。
- **Plan Type**：ADD。
- **Current Behavior**：沒有產品頁或查詢。
- **Expected Behavior**：進入時 GET `/productController/getProducts?productId=all`，HTTP headers 帶 Content-Type、Uid、Authorization；成功 body.info 陣列映射六欄。
- **Implementation**：Page 的 Effect 發起服務呼叫，依 session 改變取消／重載；卸載取消並忽略舊回應，兼容現有 StrictMode。Service 解析 unknown 並區分授權失效／業務失敗／協定錯誤。表格使用 id 作穩定 key；欄位依 id、name、label_names、cost、price，編輯欄放 /icon/pencil.png 與 /icon/delete.png。僅呈現圖示、提供用途文字，不發編輯／刪除請求。不自行依 deleted 篩選、不新增排序、分頁或金額計算。
- **Reuse**：SiteHeader、共用 status／message parser、既有圖片；GET 無 request body。
- **Impact / Error Handling**：loading、success、empty、error 分開；只有有效成功空陣列顯示「目前無產品」。授權失效依 OQ-002 通知 App 清 session；一般錯誤保留畫面並提示，不冒充空清單或強制登出。沿用 30 秒 timeout 及取消清理；取消不顯示錯誤。缺必要欄位或 info 非陣列視為 protocol error，不靜默捨棄整筆資料。
- **Testing**：所有 headers 與 query、單／多／零筆映射、loading、授權失效返回、其他錯誤不返回、非法回應、取消及舊 session 結果；圖示存在且無編輯／刪除副作用。成本與價格數字／字串案例待契約確認，不預設任意型別皆有效。

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

### 驗收對應與整合檢查

| 需求 | 任務 | 驗證重點 |
|---|---|---|
| 共用驗證及 SHA-256 | 001／002／003 | trim → validate → hash → request，無明碼出網 |
| 普通登入及其他裝置強制登入 | 002／003／004 | false 初次、指定衝突才 true 一次、成功轉產品 |
| 登入失败與重送 | 002／003 | 正確錯誤提示、資料處理依 OQ-004、恢復提交 |
| 登出條件及無論結果返回 | 002／004 | 双憑證可見、headers 正確、finally 清理與 login mode |
| 產品授權及查詢 | 004／005／006 | 授權失效與一般錯誤可區分，query／header 正確 |
| 六欄／空資料／占位 | 004／005 | 指定欄名、目前無產品、無額外 API 副作用 |

實作完成後執行 `npm run test`、`npm run build`、`npm run lint`；新增測試和註冊相鄰回歸必須通過。以可控制 API 驗證完整登入→產品→登出及強制登入流程，真實後端契約需另作整合核對。瀏覽器檢查鍵盤提交、窄畫面表格橫向捲動、Figma 結構、登入／註冊切換、登出後不呈現舊產品。使用受控 Promise／fake timers 驗證 timeout 與 race，不以固定 sleep 或重跑取代斷言。

本輪是文件規劃，未執行應用測試、後端 API、build、lint 或部署驗證；不宣稱功能可運行。

## VI. Review Status

**Status: Awaiting Review — 核心契約待確認。**

- [x] 核對需求、流程、Scenario、既有計畫與相關 source／tests。
- [x] 核對 Figma 指定節點及既有圖示路徑。
- [x] 新增與既有檔案已分開標示；技術方案遵循既有分層，無不必要依賴。
- [x] API、Configuration、相容性、錯誤處理與測試影響已列出。
- [x] 不修改既有註冊 Business Rule、不擴充產品異動或權限業務。
- [ ] OQ-001～003 核心契約補齊，服務結果映射與電文定稿。
- [ ] OQ-004／005 輸入保留與 Scenario 差異確認。
- [ ] OQ-006／007 session 導覽方案與產品型別確認。
- [ ] Implementation Plan 已完成人工審核。
- [ ] Development 完成。
- [ ] Code Review 通過。

### Handoff

先交 PM／Reviewer 補齊上述資訊並審查；System Design 依回覆更新此文件，確認完成前不交 Programmer 開始相依實作。實作範圍為六項 Task，不含更新 PM 原需求、後端／DB、商品新增編輯刪除、真實 PermissionPage、token refresh 或未確認的持久化登入。Programmer 發現契約與實際回應不符時，以 `Features/Issue/02-LoginAndLogout/<Task ID>.md` 回報，不能依文字猜測強制登入或授權失效。
