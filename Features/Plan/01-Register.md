# 01-Register Implementation Plan

## I. Requirement Information

| 項目 | 內容 |
|---|---|
| Feature Name | `01-Register` |
| Requirement Type | New Requirement |
| Requirement Document | `Features/Document/01-Register.md` |
| Scenario | `Features/Document/Scenarios/01-Register.feature` |
| Flow Chart | `Features/Document/flows/01-Register.mmd` |
| Plan Date | 2026-10-05 |
| Role | System Design Agent |
| Review Status | Review Failed |

```text
Requirement Source: 使用者本輪指示
Requirement Date: 2026-10-05
Requirement Summary: 安排此需求的前端開發計畫；確認 nginx 配置，不存在時先配置。
Execution Scope: 本輪建立計畫與 nginx 基礎配置，不實作註冊應用程式碼。
```

### 本次 Requirement Change

- 更新來源：使用者更新 `Features/Document/01-Register.md` 與 `Features/Document/Scenarios/01-Register.feature`，於對話補充 OQ-006，並確認 OQ-002 採單一 HomePage 切換登入／註冊。
- 更新日期：2026-10-05。
- 已確認 Delta：四個欄位自動去除前後空白；確認密碼套用與密碼相同的必填、長度與字元種類規則，再檢查一致性；連線中斷或伺服器無回應時提示連線異常並保留輸入；後端接收長度 64 的密碼雜湊，長度不足直接回傳失敗。
- OQ-006 技術映射：前端採 UTF-8 輸入、SHA-256 digest 轉 64 字元小寫十六進位字串。64 字元長度是使用者確認的後端要求；小寫 hex 是本計畫的序列化選擇，不代表後端另行確認了大小寫限制。
- 影響範圍：TASK-002 至 TASK-007 為 `PLAN UPDATED`；尚未實作應用程式碼，TASK-001 維持 `TODO`。
- OQ-002 已確認：以單一 `HomePage` 呈現共用導覽與登入／註冊區塊，透過頁籤切換顯示不同表單結構。成功後的「導向登入」對應同頁切換為登入模式。
- 原計畫到新計畫的 Delta：兩個獨立頁面與 URL 導航改為單頁局部 mode state；頁面重載清理改為模式切換時清理、取消請求與忽略過期回應；登入區塊顯示設計稿的 Email、密碼與按鈕結構。登入 API 合約尚未列入此需求。
- 使用者已表示其他 OQ 可進行確認；已明確的技術方案納入下列決定，仍存在的測試資料不一致與工具／部署環境限制分別列明，不將其當作已驗證通過。

### Context 與 Source of Truth

- Role / Workflow：`AGENTS.md`、`agents/system-design-agent.md`。
- Project Instructions：`instructions/project.md`、`instructions/architecture.md`。
- Relevant Skills：`.agents/skills/react/SKILL.md`、`.agents/skills/typescript/SKILL.md`、`.agents/skills/unit-test/SKILL.md`。
- Plan 格式：`Features/Plan/plan-example.md`。
- Figma：[使用者註冊](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=1-84&t=cUjxfcozA0aCtvwi-4)。2026-10-05 重新確認時，已可透過 Edge 瀏覽器連線開啟檔案與 node `1:84`，取得可見畫面截圖、圖層名稱與選取 Frame 屬性。HomePage 下有 Register Frame 與 Login Frame；選取的 Register Frame 為 1920 × 1080。Figma 外掛仍為 installed / ENABLED，但本工作階段尚未提供 get_design_context 等專用工具；瀏覽器存取成功不等於已取得完整結構化設計資料或資產匯出。

  已觀察設計：頂部 TAMAS 導覽列；中央粉色圓角表單區；登入／註冊頁籤；註冊區含姓名、Email、密碼、確認密碼與綠色註冊按鈕；登入區含 Email、密碼與登入按鈕。兩個 Frame 依 OQ-002 映射為同一 HomePage 的兩種顯示模式。

  最新 `instructions/project.md` 要求 Figma 設計稿一律使用 `get_design_context` 讀取需求 URI。先前瀏覽器畫面僅作為已觀察證據；目前工具清單仍無此工具，尚未滿足指定讀取方式。後續 UI 實作前須取得指定工具的設計內容與截圖，遵循 figma-design-to-code 技能；本次可先完成 HomePage 結構與流程規劃。

## II. Requirement Summary

單一 HomePage 提供「登入／註冊」切換。登入模式顯示 Email、密碼與登入按鈕；註冊模式顯示姓名、Email、密碼與確認密碼。註冊表單依有效性立即更新按鈕；欄位操作後失去 Focus 才呈現紅框及欄位錯誤。提交事件再次驗證完整表單，將兩個密碼欄位以 SHA-256 處理後，使用需求指定的 JSON envelope 呼叫 `POST /userController/register`。

成功時顯示提示並切換同一 HomePage 的登入模式；失敗時以 Alert 顯示後端訊息，保留四個欄位讓使用者修改與重送。頁籤顯示目前模式，切換模式清除輸入、錯誤及失敗提示，URL 不變且無整頁重載。此功能包含登入表單版面；登入 API、身分驗證、Token、重複帳號判定與資料庫變更待各自需求定義。

### 既有系統分析

| 範圍 | 實際現況 | 設計影響 |
|---|---|---|
| Application | `src/App.tsx` 是 Vite 計數器範本 | 以註冊功能替換範本內容 |
| Styles | `src/App.css`、`src/index.css` 是範本樣式 | 移除會干擾表單版面的範本規則 |
| Entry | `src/main.tsx` 使用 `StrictMode` 與 `createRoot` | 保留入口與 StrictMode，不在 mount 時送出註冊請求 |
| HomePage / Login | 無認證頁面或路由套件 | `App` 組合 `src/pages/HomePage.tsx`；以局部 mode state 切換兩種表單，無需新增 routes 或路由套件 |
| API / Validation | 無 Service、型別、驗證與雜湊模組 | 新增本功能必要模組，不建立通用框架 |
| Testing | 無測試套件、test scripts 或既有測試 | 安排最小單元／元件測試環境 |
| npm Lock | 已建立 `package-lock.json` 並安裝驗證現有相依 | 新增測試依賴時同步更新 lockfile；Docker 已使用 `npm ci` |
| Framework | React / React DOM 18.3.1；@types/react 18.3.31、@types/react-dom 18.3.7 | 已依使用者確認版本並修正型別相依，符合 project.md 的 React 18 規範 |
| Database / Backend | 本 repository 無後端實作與 DB 定義 | 僅依需求呼叫既定 API，不修改後端或 schema |

現有專案沒有可重用的表單、API、路由、錯誤處理或 Logging 模組。重用 Vite 工具鏈、React 入口、TypeScript strict 設定與 ESLint；不加入全域 state、Custom Hook、表單框架、HTTP client 或路由套件。所有新增路徑皆是本計畫定義的 ADD 項目，不是聲稱既有檔案存在；不建立 `index.ts` barrel。

### 已配置的 nginx 先決條件

使用者要求先配置 nginx。檢查原 repository 後尚無配置，本輪已由 Programmer 工作完成以下基礎配置；本節僅記錄現況，不表示註冊功能已實作。

| 已配置檔案 | 責任 |
|---|---|
| `Dockerfile` | Node 多階段建置 Vite dist，由 nginx 提供靜態檔 |
| `.dockerignore` | 排除 node_modules、dist、文件與本機環境檔等建置不需要的內容 |
| `nginx/default.conf.template` | SPA `try_files` 回到 index.html；`/userController/` 反向代理保留原始路徑 |
| `README.md` | Docker 建置／啟動與 `API_UPSTREAM` 設定說明 |

`API_UPSTREAM` 為 nginx 容器可連線的後端 origin，格式為 `http(s)://host:port`，不含路徑或結尾斜線。現有預設 `http://127.0.0.1:8080` 不是已確認的後端部署位址；正式部署需設定實際 origin。現有 Dockerfile 已搭配 lockfile 使用 `npm ci`。目前環境未提供 Docker 或 nginx 執行檔，未執行容器建置與 `nginx -t`；須在可用環境完成並記錄結果。

### Business Rule 與資料流

| 欄位 / 行為 | 已確認規則 |
|---|---|
| 姓名 | 去除前後空白後必填，2–50 個字元；送出時對應 API `username` |
| Email | 去除前後空白後必填，符合 Email 格式，15–250 個字元，包含 @ 與域名 |
| 密碼 | 去除前後空白後必填，8–20 個字元，包含大寫字母、小寫字母與數字 |
| 確認密碼 | 去除前後空白後套用與密碼相同的必填、長度與字元種類規則，且兩欄正規化後須相同 |
| 按鈕 | 任一欄位不合法時 disabled；修改時即時計算，不等待 blur |
| 欄位錯誤 | 使用者操作欄位後 blur 才顯示；修正後依目前驗證結果清除 |
| 提交 | 再次驗證，不依賴 disabled 或 HTML 限制保護 API |
| API 成功 | `header.status === "success"`，提示成功並切換 HomePage 為登入模式 |
| API 失敗 | `header.status === "failed"`，Alert 顯示 `header.message` 並保留已填寫資訊（密碼維持文字值，不以雜湊取代） |
| 連線異常 | 網路中斷或伺服器無回應時提示連線異常，保留已填資訊並允許重送 |
| 雜湊長度 | 兩個密碼欄位皆送出 64 字元 SHA-256 hex；後端對不足 64 字元的資訊回傳失敗 |
| 頁面切換 | 本需求對應同頁模式切換：清除兩種表單輸入、touched、欄位錯誤、紅框及舊結果提示，取消進行中的註冊請求 |
| 頁籤 | 目前模式粗體且有底線；另一模式無選取樣式；重複點選目前模式不清空輸入 |

```text
App → HomePage（mode、表單 state、請求流程）
         ├─ AuthTabs → onModeChange → 清理 state 與切換 mode
         ├─ LoginForm（登入版面）
         └─ RegisterForm → FormField
                  │ onSubmit
                  ▼
         normalizeRegisterForm → validateRegisterForm
                  │ 合法
                  ▼
         registerUser → SHA-256 → POST /userController/register
                  │
                  ▼
         HomePage：成功提示並切登入／失敗提示並保留輸入
```

## III. Requirement List

以下皆為尚未初次實作的功能任務。Development Date 與 Code Review Date 在對應角色完成工作前留空。

| Task ID | Component Name | Plan Type | Plan Date | Implementation Status | Development Date | Code Review Date |
|---|---|---|---|---|---|---|
| TASK-001 | 開發 API Proxy 與測試工具 | ADD | 2026-10-05 | DEVELOPED DONE | 2026-10-07 | 2026-10-07 |
| TASK-002 | HomePage 與登入／註冊切換 | ADD | 2026-10-05 | DONE | 2026-10-07 | 2026-10-07 |
| TASK-003 | 註冊型別與欄位驗證 | ADD | 2026-10-05 | DEVELOPED DONE | 2026-10-07 | 2026-10-07 |
| TASK-004 | 共用欄位與認證頁籤 | ADD | 2026-10-05 | DONE | 2026-10-07 | 2026-10-07 |
| TASK-005 | SHA-256 與註冊 API Service | ADD | 2026-10-05 | REVIEW FIX | 2026-10-07 | 2026-10-07 |
| TASK-006 | 註冊表單與 HomePage 狀態生命週期 | ADD | 2026-10-05 | DEVELOPED DONE | 2026-10-07 | 2026-10-07 |
| TASK-007 | 整合驗證與交付說明 | MODIFY | 2026-10-05 | PLAN UPDATED | — | — |

實作順序：先處理影響實作的 Open Questions 與 Plan Review；TASK-001 → TASK-002／003／004／005 → TASK-006 → TASK-007。TASK-003 與 TASK-005 共用型別，TASK-005 應在型別確定後實作。

## IV. Technical Stack

| 項目 | 現況 / 計畫 |
|---|---|
| Language | TypeScript `5.9.3`，固定版本，沿用 strict 與既有 TSConfig |
| Framework | React / React DOM 18.3.1；Vite 7.3.1；@vitejs/plugin-react 5.1.1 |
| Package Manager | npm；新增直接依賴使用確切版本，不使用 `^` |
| UI / HTTP | 原生 HTML + CSS、React、fetch；不另增 UI 與 HTTP 套件 |
| Page / View State | 單一 `HomePage`，使用 `mode: 'login' \| 'register'` 切換表單；不以 URL 或 history 保存模式 |
| Password Processing | Web Crypto `crypto.subtle.digest("SHA-256", ...)` 與 UTF-8 TextEncoder |
| Testing | 計畫使用 Vitest + React Testing Library + user-event + jest-dom + jsdom；安裝前查官方相容性並鎖定確切版本 |
| Deployment | 已配置 Docker + nginx template；前端 API 使用同源相對路徑 |
| Database | 無變更 |

新增測試套件的需求依據是現有 Gherkin 的欄位驗證、請求內容與互動情境，無須新增額外 E2E 套件。實作時將選定版本、Node 條件與核對來源記錄於 README；尚未查驗的版本不宣稱已相容。

### External Research

| Technology / Version | Reason | Compatibility / 來源 |
|---|---|---|
| Web Crypto / 瀏覽器 API | 需求指定 SHA-256，無需新增雜湊套件 | digest 支援 SHA-256、以 Promise 回傳結果，需 secure context；本功能採 UTF-8 編碼與明確 hex mapping。參考 [MDN digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)。 |
| Vite / 現有 7.3.1 | 開發期轉發既有後端 URI | `server.proxy` 提供路徑前綴轉發；本計畫不設定 rewrite，因此保留 `/userController/register`。參考 [Vite server.proxy](https://vite.dev/config/server-options.html#server-proxy)。 |
| Vitest / 安裝版本待選定 | 與現有 Vite 整合測試 | 官方提供獨立 vitest.config 與 run 模式。具體套件版本仍需核對 Node、Vite 與 React Testing Library 相容性再鎖定。參考 [Vitest Getting Started](https://vitest.dev/guide/)。 |

## V. Implementation Steps

### TASK-001 開發 API Proxy 與測試工具

- **File**：MODIFY `package.json`、`package-lock.json`、`vite.config.ts`、`README.md`；ADD `vitest.config.ts`、`src/test-setup.ts`。
- **Target**：Vite `server.proxy`、Vitest 設定與 npm scripts。
- **Plan Type**：ADD（功能基礎配置；上述既有檔案依列示 MODIFY）。
- **Current Behavior**：Vite 無 API proxy；沒有測試 scripts 與套件；現有應用相依已建立 lockfile。nginx 已反向代理 `/userController/`。
- **Expected Behavior**：開發與 nginx 部署都使用相同 API URI；可執行元件與 Service 測試；依賴可重現。
- **Implementation**：透過 Vite `loadEnv` 讀取僅伺服器使用的 `API_UPSTREAM`，在明確設定後將 `/userController` 代理到該 origin，保留路徑；不要把部署設定作為 VITE_ 客戶端環境值公開。未設定時 README 明確說明無開發後端代理。保留 React plugin。Vitest 使用 jsdom、setup 與明確的 `*.test.tsx` discovery；scripts 提供 `test`（run）與 `test:watch`。安裝並鎖定前節列示的測試依賴，同步更新 package-lock。沿用現有 Docker `npm ci --no-audit --no-fund` 與 nginx 代理合約。
- **Reuse / Impact**：沿用 Vite、npm、現有 Docker/nginx 與 TS strict；不建立新架構資料夾。測試型別以檔案 import 提供，避免不必要的全域 compiler 設定。
- **Error Handling**：不合法 origin 明確回報設定錯誤；不將未知後端位址或 proxy 失敗當成註冊成功。
- **Testing**：確認測試可以 discovery 與執行；`npm run build`、`npm run lint`；以可控制後端檢查 dev proxy POST 原始 URI／JSON body。Docker/nginx 驗證歸 TASK-007。

### TASK-002 HomePage 與登入／註冊切換

- **File**：MODIFY `src/App.tsx`、`src/App.css`、`src/index.css`、`index.html`；ADD `src/pages/HomePage.tsx`、`src/pages/HomePage.css`、`src/pages/HomePage.test.tsx`、`src/components/LoginForm/LoginForm.tsx`、`src/components/LoginForm/LoginForm.css`、`src/components/LoginForm/LoginForm.test.tsx`。
- **Target**：`App`、新增 `HomePage`、`LoginForm`、`handleModeChange`。
- **Plan Type**：ADD；既有 root 與入口樣式依 File 欄列示 MODIFY。
- **Current Behavior**：只有計數器範本，無 HomePage、表單或切換狀態；前版規劃的獨立頁面尚未建立。
- **Expected Behavior**：`/` 顯示單一 HomePage，共用頂部導覽與表單容器；登入／註冊切換只改變目前表單內容。沿用前版註冊入口的初始選擇，初次載入預設 register；此為本次功能的技術預設，未新增登入業務規則。
- **Implementation**：`App` 組合 HomePage；HomePage 保存 mode、兩種表單 values、註冊 touched／submitting 與請求識別。`handleModeChange(nextMode)` 先判斷是否真的切換，再取消請求、使舊請求失效、清空兩種表單和錯誤，最後改變 mode。點選目前模式是 no-op。AuthTabs 使用回呼，HomePage 條件渲染 LoginForm 或 RegisterForm；URL 不變，不發起頁面導航、不整頁重載、不建立另一個 Page。

  LoginForm 呈現 Email、密碼及登入按鈕，值與事件由 HomePage 傳入，重用 FormField。此需求尚無登入 API 合約，因此按鈕保持 disabled 並附「登入功能尚未開放」提示；不可送出註冊 API 或假造登入成功。此限制待登入需求補齊後另行調整。HomePage 依設計稿安排 TAMAS 頂部導覽與中央表單區，導覽項未定義的業務功能只呈現文字。共用版面支援窄螢幕，語系改繁體中文並移除 Vite 品牌入口內容；正式視覺核對遵循 project.md 的 get_design_context 規定。
- **Reuse / Impact**：保留 `src/main.tsx`、StrictMode；使用既有架構的 pages/components，重用 TASK-004 的 FormField/AuthTabs。HomePage 負責業務狀態，表單 Component 只呈現 UI 與回報事件。
- **Error Handling**：切換後的舊回應不得提示或改變新模式；登入區塊不可意外提交註冊請求。
- **Testing**：同一 HomePage 內切換兩種欄位結構；初始 register；mode 切換不變更 URL；目前模式重複點選保留輸入；實際切換清空兩種表單、touched 與錯誤；登入按鈕狀態與無 API 行為；切換後可重新填寫註冊。

### TASK-003 註冊型別與欄位驗證

- **File**：ADD `src/types/register.ts`、`src/pages/register-validation.ts`、`src/pages/register-validation.test.tsx`。
- **Target**：新增 `RegisterFormValues`、`RegisterFieldName`、`RegisterValidationErrors`、Request／Response 型別、`normalizeRegisterForm(values)` 與 `validateRegisterForm(values)`。
- **Plan Type**：ADD。
- **Current Behavior**：無本功能型別或驗證。
- **Expected Behavior**：相同驗證結果同時用於按鈕 enabled、blur 錯誤與提交驗證，避免三套規則分歧。
- **Implementation**：四個受控欄位保持 string。`normalizeRegisterForm` 對四欄各自使用 trim 去除前後空白、保留中間字元，不修改傳入 object；`validateRegisterForm` 以相同正規化結果驗證，回傳每欄位錯誤或無錯誤，不寫 React state、不呼叫 API。長度與格式依 II 節規則，常數只定義一次。姓名以 username 對應 API。必填先於長度／格式；確認密碼也檢查 8–20、大寫、小寫與數字，最後比較正規化後的兩欄。全空白視為空字串。Email predicate 採 `^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$`，即非空 local、單一 @、至少兩個非空 domain 區段且無空白；全部長度以 Unicode code point 計數。此為 OQ-005 的前端技術決定，不進行大小寫轉換、域名 allowlist 或縮短 Email 上限。驗證的是去除前後空白後的密碼文字，雜湊不作為表單值。特定業務驗證放 pages，不放 feature-independent utils；共用型別放 types，不以 any 逃避 API 型別檢查。
- **Reuse / Impact**：HomePage、RegisterForm 與 Service 共用 request／form 型別；無 DB 影響。
- **Error Handling**：依需求顯示繁體中文必填、長度、Email 格式與密碼不一致訊息。
- **Testing**：Gherkin 的四個必填；姓名 1／2／50／51；Email 14／15／250／251 與三個錯誤格式；密碼與確認密碼各自 7／8／20／21、缺大寫／小寫／數字及不一致。新增四欄前後空白去除、全空白必填失敗、trim 後再算長度／格式／一致性、中間字元保持、正規化不修改輸入及 Unicode code point 邊界案例。Email 多個 @、空域名區段、內含空白應失敗。使用明確 fixture，不以待測 validator 產生預期結果。『Email 太長』已修正為 251；另兩筆 boundary fixture 與標示不符，依 OQ-004 記錄處理。測試以 `'a'.repeat(238) + '@example.com'` 與 `'a'.repeat(239) + '@example.com'` 建立真正 250／251 邊界並先確認長度，不使用錯誤 fixture 假裝已驗收。

### TASK-004 共用欄位與認證頁籤

- **File**：ADD `src/components/FormField/FormField.tsx`、`FormField.css`、`FormField.test.tsx`；ADD `src/components/AuthTabs/AuthTabs.tsx`、`AuthTabs.css`、`AuthTabs.test.tsx`（各檔案置於同名 Component 目錄）。
- **Target**：新增 `FormField`、`AuthTabs`；props 定義於各 Component 檔案。
- **Plan Type**：ADD。
- **Current Behavior**：無可重用 UI。
- **Expected Behavior**：欄位清楚標示姓名／Email／密碼／確認密碼與錯誤；登入／註冊按鈕呈現 HomePage 目前模式。
- **Implementation**：FormField 只接收 id、label、type、value、onChange、onBlur、error 與必要 HTML 屬性，不包含註冊規則或 API。Label 與 input 關聯，錯誤以 aria-describedby 與 aria-invalid 表達，紅框 class 根據傳入 error。密碼欄使用 password type。AuthTabs 接收 mode 與 onModeChange，使用 `type="button"` 的原生按鈕群組，選取項粗體＋底線並設 aria-pressed；Tab、Enter、Space 可操作。不使用 href 或觸發表單 submit。樣式位於元件旁；focus-visible、disabled 與窄螢幕內容保持可辨識。按鈕具有頁籤視覺，但採可存取的切換按鈕語意；UI 細節依 get_design_context 回傳核對。
- **Reuse / Impact**：FormField 重用於登入／註冊欄位；HomePage 只放置一份 AuthTabs，元件不擁有業務狀態。
- **Error Handling**：未傳 error 時不呈現紅框或錯誤；錯誤文案以文字渲染，不解讀 HTML。
- **Testing**：label 可以找到 input；error 與 aria-invalid 一致；沒有 error 時無錯誤樣式；切換按鈕的 mode 回呼、aria-pressed、選取樣式、鍵盤操作與不提交表單。避免以整頁快照取代具體斷言。

### TASK-005 SHA-256 與註冊 API Service

- **File**：ADD `src/utils/sha256.ts`、`src/utils/sha256.test.tsx`、`src/services/register-service.ts`、`src/services/register-service.test.tsx`；使用 TASK-003 `src/types/register.ts`。
- **Target**：新增 `sha256(value): Promise<string>` 與 `registerUser(values, signal): Promise<RegisterResult>`。
- **Plan Type**：ADD。
- **Current Behavior**：無請求與雜湊處理。
- **Expected Behavior**：兩個密碼均為 SHA-256，請求 URI、HTTP method 與 JSON envelope 完全符合需求；Page 收到可區分的業務結果／技術失敗。
- **Implementation**：通用 sha256 utility 以 TextEncoder 將傳入字串 UTF-8 編碼，使用 Web Crypto digest 並轉為 64 字元小寫十六進位字串。Service 接收 TASK-003 正規化且驗證通過的 snapshot，兩個密碼各自雜湊，確認輸出皆符合 64 字元 hex 後才送出；不得補字元湊長度或截短雜湊。後端對長度不足回傳失敗，前端使用既有 failed 流程呈現。Service 明確 mapping 姓名為 username，HTTP 真正的 Content-Type 亦為 application/json。需求的 header 是 Request Body 的欄位，不能只移到 HTTP header。fetch 使用同源相對路徑，不硬編碼後端位址，不修改傳入 object。解析外部 JSON 先視為 unknown，確認 header/status/message；成功資料依需求確認 uid、email、username 型別。failed 回應無已定義 body 合約，不要求與 success 相同的 body.info。成功依 header.status 而非僅 response.ok 判斷；非 2xx、不可解析 JSON 或未知 status 都不導向登入。失敗 message 以純文字交給 Page。傳遞 AbortSignal，雜湊後、fetch 前確認未取消。

  無回應偵測採可調整的 30 秒前端請求逾時（技術初始值，不是後端 SLA）。計時涵蓋 fetch 與回應內容讀取；超時取消請求並回報連線異常。區分頁面離開取消與逾時，前者靜默、後者提示；finally 清除計時器與取消訂閱。

  Request 合約：

  ```json
  {
    "header": { "Content-Type": "application/json" },
    "body": {
      "info": {
        "email": "user@example.com",
        "username": "user123",
        "password": "<64-character SHA-256 hex of trimmed password>",
        "confirmPassword": "<64-character SHA-256 hex of trimmed confirmPassword>"
      }
    }
  }
  ```

- **Reuse / Impact**：sha256 為 feature-independent utility；Service 只負責 API mapping 與通訊，無 Alert、React state 或導航。無新 HTTP／加密套件。
- **Error Handling**：網路、HTTP、protocol、Web Crypto 不可用或 digest 失敗由 Page 統一提示；不降級為明文提交。abort 是取消，不顯示錯誤。部署需在支援 Web Crypto 的 secure context 提供前端，例如 HTTPS 或 localhost；nginx SSL 終止點與憑證不是已確認的部署設定。
- **Testing**：雜湊以獨立已知 SHA-256 test vector 驗證（如 abc），不呼叫待測函式產生期望值；Service 控制 fetch 邊界，檢查 POST URI、HTTP header、JSON header/body.info、username mapping、兩個密碼雜湊且無原文、success／failed mapping、非 2xx、未知 status、非 JSON／不符合 schema、取消與 hash 失敗不送請求。保留真正 digest 測試，不以 mock digest 作為雜湊正確性的證據。
- **Delta Testing**：兩個輸出均為 64 字元 hex；雜湊輸入是去除前後空白後的密碼；錯誤長度輸出不得送出。以 fake timers 與可控制 Promise 驗證伺服器無回應、逾時後取消、計時器清理及逾時與頁面取消的不同結果。模擬後端長度檢查失敗訊息時，使用既有 failed 處理，不刻意由正式前端送出短雜湊。

### TASK-006 註冊表單與 HomePage 狀態生命週期

- **File**：MODIFY TASK-002 的 `src/pages/HomePage.tsx`、`src/pages/HomePage.test.tsx`；ADD `src/components/RegisterForm/RegisterForm.tsx`、`src/components/RegisterForm/RegisterForm.css`、`src/components/RegisterForm/RegisterForm.test.tsx`。
- **Target**：新增 `RegisterForm`，完善 HomePage 的欄位事件、`handleSubmit`、`handleModeChange` 與請求清理。
- **Plan Type**：ADD；TASK-002 所建立的 HomePage 在此整合註冊行為。
- **Current Behavior**：現有程式無註冊表單；TASK-002 將先建立單頁容器與切換介面。
- **Expected Behavior**：完整符合需求與 Scenario；註冊輸入、blur、提交、失敗重試及同頁模式切換一致。
- **Implementation**：RegisterForm 只組合四個 FormField、表單與註冊按鈕，從 props 接收 values、errors、submitting、canSubmit 與事件，不持有業務狀態或直接呼叫 API。HomePage 保存四個 values、touched、submitting；errors 與 isValid 從正規化結果推導。初始空字串、無紅框／錯誤、按鈕 disabled、無 API。

  輸入中保留編輯文字；blur 將該欄 trim 並設 touched；未 touched 錯誤不提前顯示。change 即時計算按鈕，密碼改變也重新計算確認密碼。已 touched 欄位修正後清除錯誤。form onSubmit preventDefault，確認目前為 register 模式，正規化四欄、更新可見值，再驗證 snapshot；無效時不呼叫 Service 並顯示需要修正的欄位。

  合法提交進入 submitting 並停用重複提交，加同步請求鎖避免同一 tick 重送。等待 registerUser；success 顯示成功 Alert，關閉後呼叫 HomePage 的 `handleModeChange('login')`，清空兩種表單與錯誤，顯示登入區塊，URL 保持不變。failed 顯示後端 message Alert 並保留已填 values。斷線或逾時顯示「連線異常，請稍後再試」，保留資料並恢復重試；其他技術失敗顯示適當文字。錯誤回應不以舊 snapshot 覆蓋等待期間的新編輯；密碼值不被 hash 取代。Alert 使用 window.alert；不在 effect 發出註冊請求。

  HomePage 模式切換不會使 Page 本身 unmount，因此清理必須明確在 `handleModeChange` 執行：AbortController 取消、使請求識別失效、解除請求鎖、清空 values／touched／submitting／提示。模式按鈕在提交中仍可使用。Promise 的 success、catch、finally 都核對請求識別，舊結果不得 Alert、切換 mode 或重設新請求 state。HomePage unmount／pagehide 也取消請求；從 bfcache 恢復時清理輸入、錯誤與 pending 狀態。表單 state 僅存在 HomePage，不放 store、URL 或 storage。
- **Reuse / Impact**：TASK-002 的 HomePage、TASK-003 normalizer／validator、TASK-004 UI、TASK-005 Service。HomePage 管理模式與業務流程，Form Component 保持呈現職責。
- **Error Handling**：無效或非 register 模式提交不發 API；頁籤切換的取消不顯示連線異常；真正逾時提示並保留資料；不記錄密碼、雜湊或完整個資請求。
- **Testing**：HomePage 測試驗證初始、blur、即時 disabled、密碼相依、直接 submit 再驗證、成功 Alert 後顯示登入欄位、failed 四欄保留及重試。RegisterForm 測試檢查可見欄位、錯誤關聯及事件傳遞，不重複測試 validator 演算法。
- **Delta Testing**：同一掛載中的 HomePage 切換後清空表單與錯誤；重複點目前模式保持輸入；註冊中切登入再切回並發新請求，舊請求的 resolve／reject／finally 都不得干擾；切換 URL 不變。另驗證 trim 規則、確認密碼格式、斷線／無回應提示與恢復重試。使用可控制 Service Promise 與 Alert 邊界，實際瀏覽器整合歸 TASK-007。

### TASK-007 整合驗證與交付說明

- **File**：MODIFY `README.md`、本 Plan 的對應 Task Status；測試修正限於 TASK-001 至 006 已列檔案。
- **Target**：需求追蹤、整合 smoke check、部署說明與驗證紀錄。
- **Plan Type**：MODIFY。
- **Current Behavior**：只有 scaffold 說明與本輪 nginx 配置，無註冊操作／測試說明。
- **Expected Behavior**：Reviewer 能重現本需求，區分已驗證與環境限制。
- **Implementation**：README 記錄 npm scripts、開發 proxy origin、Docker API_UPSTREAM、Node／依賴實際版本、secure context 條件及尚無登入業務實作。以 Gherkin 每條 Rule 對應相關單元／元件／瀏覽器驗證，不變更 Business Requirement。Task 完成後依 Programmer workflow 更新狀態與日期，不能將未執行的檢查記成通過。
- **Reuse / Impact**：使用現有 build/lint 與 TASK-001 的 test，不新增只測文件或 CSS 常數的無效測試。
- **Error Handling**：測試執行環境、Figma、實際 backend origin、Docker/nginx 不可用時記錄具體未驗證項目，不捏造端對端結果。
- **Testing**：`npm run test`、`npm run build`、`npm run lint`。瀏覽器驗證桌面／窄螢幕、focus、頁籤樣式、填寫／失敗保留／成功切登入／切換返回清除／bfcache，並確認模式切換無 URL 變更或文件重載。容器執行 `nginx -t`、GET `/` 與重新整理 HomePage、檢查建置靜態資源與前端回退；透過可控制後端驗證 POST 原始 URI、JSON envelope。nginx 上游錯誤不能回 SPA HTML 當成功。依 get_design_context 截圖核對兩種模式，共用 header 與 panel 保持一致；真實 API 驗證使用提供的測試環境，不以 mock 取代實際整合結果。
- **Delta Testing**：整合核對 trim → 格式與一致性驗證 → 64 字元 SHA-256 → API 的資料流，以及斷線／逾時保留資料與重試；原始需求與 Scenario 的差異須如實記錄。

## VI. Review Status

**Status: Review Failed**

- [x] Implementation Plan 已完成人工審核。
- [ ] Open Questions 已確認並更新計畫。
- [ ] Development 完成。
- [ ] Code Review 通過。

### Open Questions 與審查事項

| ID | 待確認項目 | 影響 / 處理 |
|---|---|---|
| OQ-001（已解決） | 使用者要求確認已改為 React 18 的套件相依版本 | 2026-10-05 已確認 React / React DOM 18.3.1，修正 @types/react 為 18.3.31、@types/react-dom 為 18.3.7，TypeScript 固定 5.9.3；npm 安裝與相依樹檢查、TypeScript／Vite build、ESLint 均通過，驗證環境 Node 24.15.0。新增測試套件仍需依 React 18 核對相容性。 |
| OQ-002（已確認） | 使用者指定單一 HomePage，切換登入／註冊顯示不同表單結構 | TASK-002／004／006／007 已改為 mode state、回呼切換、明確清理及成功後切回登入。兩種表單為 Component，Page 僅 HomePage；登入版面納入、API 合約待獨立登入需求。 |
| OQ-003（畫面已取得；指定工具待補） | 已能透過 Edge 看到設計，但新增規範要求 get_design_context | 已觀察 node 1:84 的 Register Frame（1920 × 1080）及 Login Frame；目前工具清單無 get_design_context。後續 UI 實作前須按最新 project.md 取得指定工具回傳，不將瀏覽器截圖當成已滿足該規範。此限制不妨礙完成使用者已確認的單頁結構規劃。 |
| OQ-004（主要案例已修正；另兩筆待修正） | 重新計算所有相關 Email 長度邊界資料 | 『表單提交事件不能略過前端驗證／Email 太長』已為 **251**，符合預期；但『Email 長度超出允許範圍／251 個字元』實為 **250**，『所有欄位有效／Email 上限 250 個字元』實為 **249**。後兩筆仍需各補 1 字元；前者會造成錯誤的預期失敗，後者未涵蓋上限。原需求／Scenario 保持使用者版本，測試以真正 250／251 邊界驗證並註明差異。 |
| OQ-005（已確認規劃） | 四欄 trim、確認密碼完整規則與前端驗證方案 | 先 trim 再驗證／比對／雜湊；Email 採 TASK-003 明定 predicate，長度以 Unicode code point 計數。這些技術細節作為本次可實作規劃，不增加 Email 域名白名單或縮短明訂長度。 |
| OQ-006（已確認規劃） | 後端要求 64 字元雜湊，長度不足回傳失敗 | 前端採 UTF-8／SHA-256／64 字元小寫 hex，提交前檢查輸出；後端 failed 沿用錯誤提示。後端長度要求有使用者直接確認，小寫 hex 為前端實作選擇。 |
| OQ-007（行為已確認；環境待整合） | 斷線或伺服器無回應時提示、保留資料與重試 | 使用 30 秒可調整前端逾時並區分頁籤切換取消；API_UPSTREAM 為部署參數。實際 backend origin、錯誤 HTTP status 細節與 HTTPS 終止設定尚未提供，留作整合驗證資訊；不阻擋單元測試規劃。 |

### Plan Validation

- [x] 功能整體為 New Requirement；已記錄本次需求補充與單頁設計的 Requirement Change／Impact，尚無已實作功能需 Migration。
- [x] 每項文字需求、流程與 Gherkin Rule 都有任務與驗證方式。
- [x] 所有既有修改路徑已確認；新增 File／Target 明確標為 ADD。
- [x] 遵守 Pages／Components／Services／Types／Utils 邊界；單頁模式切換無需 Routes，並遵守禁止 index.ts 規則。
- [x] 優先重用入口、工具鏈與設定，無無關重構或不必要應用依賴。
- [x] Request Body envelope、SHA-256、結果分支與 state 清理已定義。
- [x] API／Configuration／External Integration 影響已定義；DB 無變更。
- [x] 技術失敗、取消、重試、Logging／敏感資料與測試策略已定義。
- [x] Backward Compatibility：只替換範本入口，無既有業務／持久化資料需相容。
- [x] nginx 先配置現況已記錄，與後續註冊任務分開。
- [x] OQ-002 單頁模式切換已完整映射至檔案、狀態生命週期與測試；測試資料差異、指定 Figma 工具與部署限制已列明。

### Handoff

交付 PM／Reviewer 審查本 Plan。後續允許實作時，Programmer 以本 Plan 及最新 Task Status 為依據，範圍為 nginx 現況延伸、單一 HomePage、登入／註冊表單切換、註冊 API 與必要測試。UI 依指定 get_design_context 取得設計後核對；登入 API／驗證另依登入需求定義。不得自行變更 Requirement、後端／DB 或無關架構；不能執行的設計事項以 `Features/Issue/01-Register/<Task ID>.md` 回報 System Design Agent。
