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
- 初版計畫影響範圍：TASK-002 至 TASK-007 為 `PLAN UPDATED`；當時尚未實作應用程式碼，TASK-001 維持 `TODO`。
- OQ-002 已確認：以單一 `HomePage` 呈現共用導覽與登入／註冊區塊，透過頁籤切換顯示不同表單結構。成功後的「導向登入」對應同頁切換為登入模式。
- 原計畫到新計畫的 Delta：兩個獨立頁面與 URL 導航改為單頁局部 mode state；頁面重載清理改為模式切換時清理、取消請求與忽略過期回應；登入區塊顯示設計稿的 Email、密碼與按鈕結構。登入 API 合約尚未列入此需求。
- 使用者已表示其他 OQ 可進行確認；已明確的技術方案納入下列決定，仍存在的測試資料不一致與工具／部署環境限制分別列明，不將其當作已驗證通過。

### 2026-10-07 TASK-005 契約更新

- Requirement Type：Requirement Change；來源為最新需求文件與使用者本輪關於 fetch headers／JSON body 的明確說明。
- Delta：姓名 key 改為 userName；Content-Type 僅設定於 HTTP headers，JSON 僅保留 body.info；共用回應解析器支援最新 headers.status/message，並保留已提供實際回應的相容格式。
- Request 文件仍以「Request Body」展示 headers/body，標題易造成整體序列化的誤解；實作以本輪澄清與 TASK-005 電文範例為準。需求原文保留，供 PM 同步說明。
- TASK-005 改為 PLAN UPDATED，清除舊開發與審查日期；其餘 Task 狀態維持。共用型別調整歸 TASK-005。
- TASK-005 Issue 的設計疑義已解決。此項計畫修訂為 Awaiting Review；全功能既有 Review Failed 結果保留，不表示本次實作已完成。
- 已核對 File／Target、最小影響範圍、契約、相容策略、錯誤處理及驗收案例；無新增依賴、DB 或部署變更。

### 2026-10-07 整合任務延期

- 依使用者指示，從目前 Requirement List 移除原 TASK-007；目前不建立該項的 Implementation Status 或 Development Date。
- 整合測試、Docker/nginx、瀏覽器與交付說明檢查保留於「後續整合測試與交付檢查」，待 TASK-001 至 TASK-006 開發完成及實際整合測試結果出爐後，再決定是否需要新增任務或修改文件。
- 同步更新實作順序、TASK-001／006 驗證說明、OQ-002 與 Handoff，避免將延期事項誤認為目前待開發 Task。

### 2026-10-07 Review 問題的 SD 判定

| Task | 是否需要 PM 補需求 | SD 判定與後續 |
|---|---|---|
| TASK-001 | 不需要 | 使用者先前已指定後端 http://localhost:8000、env 可設定，並要求 npm run dev 有預設值。原計畫「未設定時無開發 proxy」為漏同步，現已修正。Implementation Issue 結案，Task 改為 PLAN UPDATED 並清除舊日期；Programmer 核對現有設定並補齊預設值驗證。 |
| TASK-005 | 不需要 | 最新計畫已規定有效 success status／message 時，不因未提供 body.info 而判為失敗。Review 指出的是缺少該案例測試，屬 Programmer 修正，維持 REVIEW FIX；無須重擬業務行為或重新開啟已結案的 API 契約 Issue。 |

本次分類：TASK-001 為既有需求的計畫同步修正；TASK-005 為 Missing Regression Test。TASK-001 修訂待 Review；既有 Code Review 的 OPEN 紀錄仍由 Reviewer 於後續複查結案。正式部署後端位址仍屬後續整合資訊，不影響這兩項工作的需求判定。本輪僅更新計畫與 Issue，不代表實作或測試完成。

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

`API_UPSTREAM` 為 nginx 容器可連線的後端 origin，格式為 `http(s)://host:port`，不含路徑或結尾斜線。現有 Dockerfile 預設 `http://localhost:8000`；此為使用者指定的開發預設值，正式部署需設定容器可連線的實際 origin。容器中的 localhost 指向該容器本身。現有 Dockerfile 已搭配 lockfile 使用 `npm ci`。目前環境未提供 Docker 或 nginx 執行檔，未執行容器建置與 `nginx -t`；須在可用環境完成並記錄結果。

### Business Rule 與資料流

| 欄位 / 行為 | 已確認規則 |
|---|---|
| 姓名 | 去除前後空白後必填，2–50 個字元；送出時對應 API `userName` |
| Email | 去除前後空白後必填，符合 Email 格式，15–250 個字元，包含 @ 與域名 |
| 密碼 | 去除前後空白後必填，8–20 個字元，包含大寫字母、小寫字母與數字 |
| 確認密碼 | 去除前後空白後套用與密碼相同的必填、長度與字元種類規則，且兩欄正規化後須相同 |
| 按鈕 | 任一欄位不合法時 disabled；修改時即時計算，不等待 blur |
| 欄位錯誤 | 使用者操作欄位後 blur 才顯示；修正後依目前驗證結果清除 |
| 提交 | 再次驗證，不依賴 disabled 或 HTML 限制保護 API |
| API 成功 | 共用解析後 status 為 success，提示成功並切換 HomePage 為登入模式 |
| API 失敗 | 共用解析後 status 為 failed，Alert 顯示後端 message 並保留已填資訊 |
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

以下列出本需求目前納入管理的實作任務與狀態。Development Date 與 Code Review Date 依對應角色的完成進度更新。

| Task ID | Component Name | Plan Type | Plan Date | Implementation Status | Development Date | Code Review Date |
|---|---|---|---|---|---|---|
| TASK-001 | 開發 API Proxy 與測試工具 | MODIFY | 2026-10-07 | DEVELOPED DONE | 2026-10-07 | — |
| TASK-002 | HomePage 與登入／註冊切換 | ADD | 2026-10-05 | DONE | 2026-10-07 | 2026-10-07 |
| TASK-003 | 註冊型別與欄位驗證 | ADD | 2026-10-05 | DONE | 2026-10-07 | 2026-10-07 |
| TASK-004 | 共用欄位與認證頁籤 | ADD | 2026-10-05 | DONE | 2026-10-07 | 2026-10-07 |
| TASK-005 | SHA-256 與註冊 API Service | MODIFY | 2026-10-07 | DEVELOPED DONE | 2026-10-07 | — |
| TASK-006 | 註冊表單與 HomePage 狀態生命週期 | ADD | 2026-10-05 | DONE | 2026-10-07 | 2026-10-07 |

目前任務實作順序：先處理影響實作的 Open Questions 與 Plan Review；TASK-001 → TASK-002／003／004／005 → TASK-006。TASK-003 與 TASK-005 共用型別，TASK-005 應在型別確定後實作。整合測試與交付檢查延至主要任務開發完成後再依測試結果確認是否需要新增任務。

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

- **File**：核對既有 `vite.config.ts`、`README.md`；MODIFY `src/vite-proxy.test.tsx` 補齊設定案例。REUSE package.json／package-lock.json、vitest.config.ts 與 src/test-setup.ts；不新增依賴。
- **Target**：Vite loadEnv、DEFAULT_API_UPSTREAM、server.proxy 與既有受控後端測試。
- **Plan Type**：MODIFY（2026-10-07 同步既有使用者要求）。
- **Current Behavior**：Vite 已在 API_UPSTREAM 未設定或 trim 後為空時使用 http://localhost:8000，README 亦如此記載。既有代理測試驗證明確指定上游後 POST 原始 URI／JSON body 的轉送；預設值案例尚未直接覆蓋。
- **Expected Behavior**：npm run dev 無須先設定 env 即可將 /userController 代理至 http://localhost:8000；設定有效 API_UPSTREAM 時覆寫預設值，原始 URI 與 body 保留。
- **Implementation**：沿用 loadEnv 讀取伺服器端 API_UPSTREAM；先 trim，有非空設定時使用該值，未設定、空字串或全空白時採 DEFAULT_API_UPSTREAM。有效上游使用 http(s) origin，不得含帳密、非根路徑、query 或 hash。不合法的非空設定須回報設定錯誤，不得靜默退回預設值。保留 React plugin、同源 API URI、既有 proxy 與測試 scripts；不將 API_UPSTREAM 改為 VITE_ 客戶端設定。
- **Reuse / Impact**：現有 Vite 與 README 已符合預期，Programmer 核對後可直接重用；本次主要 Delta 是補齊預設設定的驗證。Dockerfile 既有 API_UPSTREAM 預設與 nginx 執行期環境替換保留，該值不嵌入瀏覽器 bundle；Docker/nginx 真實驗證依既有決定延至整合階段。
- **Error Handling**：上游無法連線時呈現既有連線失敗，不將 proxy 錯誤當作註冊成功。沿用現有 origin 檢查。
- **Testing**：在既有 src/vite-proxy.test.tsx 隔離 env／dotenv 來源，分別確認未設定、空字串、全空白時解析後的 proxy target 為 http://localhost:8000；有效 env 覆寫預設值，無效非空 origin 被拒絕。設定案例檢查實際 Vite 設定的解析結果，無須佔用固定 8000 port 或要求真實後端。保留以動態 port 受控後端驗證 POST 原始 URI／JSON body 的測試；每個案例還原環境設定並清理 server。執行對應測試與 build／lint。

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
- **Implementation**：四個受控欄位保持 string。`normalizeRegisterForm` 對四欄各自使用 trim 去除前後空白、保留中間字元，不修改傳入 object；`validateRegisterForm` 以相同正規化結果驗證，回傳每欄位錯誤或無錯誤，不寫 React state、不呼叫 API。長度與格式依 II 節規則，常數只定義一次。姓名以 userName 對應 API（型別與 mapping 更新歸 TASK-005）。必填先於長度／格式；確認密碼也檢查 8–20、大寫、小寫與數字，最後比較正規化後的兩欄。全空白視為空字串。Email predicate 採 `^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$`，即非空 local、單一 @、至少兩個非空 domain 區段且無空白；全部長度以 Unicode code point 計數。此為 OQ-005 的前端技術決定，不進行大小寫轉換、域名 allowlist 或縮短 Email 上限。驗證的是去除前後空白後的密碼文字，雜湊不作為表單值。特定業務驗證放 pages，不放 feature-independent utils；共用型別放 types，不以 any 逃避 API 型別檢查。
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

- **File**：MODIFY `src/services/register-service.ts`、`src/services/register-service.test.tsx`、`src/services/api-response.ts`、`src/services/api-response.test.tsx`、`src/types/register.ts`；REUSE `src/utils/sha256.ts` 與既有雜湊測試。
- **Target**：registerUser、getApiResult、getApiResponseMessage、getApiResponseStatus、RegisterRequestBody 與註冊回應型別。
- **Plan Type**：MODIFY（2026-10-07 Requirement Change）。
- **Current Behavior**：Service 已將 Content-Type 設於 fetch headers，JSON 僅含 body.info，姓名 key 已為 userName；型別與 Service 測試仍要求 JSON header 與 username。共用回應解析器僅支援 JSON header，尚未支援最新文件的 headers。成功處理已不依賴 body.info。
- **Expected Behavior**：HTTP metadata 與 JSON payload 分別定義，只傳送必要資料；共用解析器支援最新回應格式與既有實際回應，保留失敗後修正並重試的行為。

#### Request 傳輸定義

最新需求文件仍以「Request Body」展示 headers/body 組合；依本輪使用者明確澄清，其中 Content-Type 應作為 HTTP headers。下列定義取代舊計畫將 header 放入 JSON body 的要求：

1. fetch options 的 headers 設為 `{ 'Content-Type': 'application/json' }`。
2. fetch options 的 body 為 JSON.stringify(payload)；payload 僅含下列 body.info 結構，保留 body.info 路徑。
3. JSON payload 不得加入 header、headers 或 Content-Type；不得序列化整個 fetch options，也不得將 headers 重複複製到 JSON。
4. RegisterRequestBody 僅描述 JSON payload；HTTP headers 由 RequestInit.headers 表達。Service 建立符合 RegisterRequestBody 的 payload，使型別與電文一致。
5. 表單 name 映射為 body.info.userName，大小寫固定；其餘 key 為 email、password、confirmPassword。舊 username mapping 與斷言須同步更新。
6. 延用原生 fetch 與同源 URI /userController/register，不新增通用 HTTP client 或額外電文包裝層。

HTTP request header：`Content-Type: application/json`。

實際 JSON request body：

```json
{
  "body": {
    "info": {
      "email": "user@example.com",
      "userName": "user123",
      "password": "<64-character SHA-256 hex of trimmed password>",
      "confirmPassword": "<64-character SHA-256 hex of trimmed confirmPassword>"
    }
  }
}
```

#### Response 共用解析

- 最新文件的 JSON 回應節點為 headers，內含 status/message。這些業務欄位從 response.json() 讀取，不從 HTTP Response.headers 取得；回應中的 Content-Type 不作為成功判斷條件，也不回送到後續請求。
- 保留先前使用者提供的 header.Status/Message 與既有 header.status/message 相容處理；相容性僅限讀取回應，不增加請求電文。
- api-response.ts 接收 unknown 並檢查 object。JSON 存在 headers 時使用該節點，否則使用 header；選定節點後，小寫 status/message 優先，再相容 Status/Message。不得跨節點拼湊狀態與訊息；主要節點或欄位存在但型別無效時回報無有效值，不退回衝突資料。此為明確的解析優先順序設計。
- status 字串正規化為小寫；message 必須是非空白字串，保留原訊息供 Page 顯示。共用模組不含註冊專屬欄位、Alert 或 React state。
- HTTP 2xx 且 status 為 success 才回傳成功；failed 回傳業務失敗。維持既有 RegisterResult 介面。
- 依先前「修改帳號重試後不應誤報伺服器異常」的需求，成功只依狀態與訊息判定。body.info 的 uid、email、userName 為文件中的回應資料，Page 目前不使用；缺少或空 info 不得單獨將成功判為失敗。回應型別應反映此使用邊界，姓名 key 使用 userName。
- 非 2xx 仍先解析 JSON，使用共用 message 透過既有 http error 交給 Page；不能僅因 !response.ok 就捨棄後端訊息。非 JSON、無有效訊息或未知業務狀態依 protocol error 處理，不導向登入。
- Request 與 Response 分別定義型別，不因節點名稱相似而共用同一電文型別。

#### 保留行為與影響

- Service 接收正規化且驗證通過的 snapshot；兩個密碼各自採 UTF-8／SHA-256 轉成 64 字元小寫 hex，檢查格式後才送出，不補字元、不截短、不修改輸入、不降級明文。
- 保留 AbortSignal、雜湊後取消檢查及涵蓋 fetch／回應讀取的 30 秒 timeout；finally 清除計時器與取消訂閱。頁籤取消靜默；逾時／斷線保留輸入並允許重試。
- 重用共用回應解析器與 SHA-256 utility；HomePage 仍負責提示及模式切換。無 DB、依賴、nginx、Vite 或 UI 變更；型別檔調整歸本 TASK，無須重做 TASK-003 的驗證邏輯。
- 舊 Review 要求補回 JSON header／username 的結論已被本輪需求取代。Programmer 應同步過期型別與測試，不得為通過舊測試而補入多餘電文；Code Reviewer 需依最新契約複查。

#### Testing

- Service fetch 邊界驗證 POST URI、HTTP Content-Type；完整比對 JSON 僅含 body.info 與 email/userName/password/confirmPassword，不含 header、headers、username 或明文密碼。保留真實 SHA-256 已知向量測試。
- 共用解析器涵蓋 headers.status/message、header.Status/Message、header.status/message、狀態大小寫、無效型別、空訊息及同時存在節點／欄位時的優先順序。
- Service 涵蓋新格式 success／failed、非 2xx 訊息、舊格式相容、未知 status、非 JSON；成功時完整 info、空 info、未提供 info 均依狀態與訊息判定。
- 保留失敗後修改 Email 再提交成功的回歸案例；第二次請求使用新 Email 且不重播舊提示。保留取消、雜湊失敗／格式不符不發請求、timeout 與清理驗證。
- Programmer 完成後執行 Service／共用解析器與 HomePage 回歸測試，以及專案 test、build、lint。此次計畫更新不代表實作或新測試已通過。

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
- **Delta Testing**：同一掛載中的 HomePage 切換後清空表單與錯誤；重複點目前模式保持輸入；註冊中切登入再切回並發新請求，舊請求的 resolve／reject／finally 都不得干擾；切換 URL 不變。另驗證 trim 規則、確認密碼格式、斷線／無回應提示與恢復重試。實際瀏覽器整合延至後續整合階段。

### 後續整合測試與交付檢查（暫不列入任務）

- **執行時機**：TASK-001 至 TASK-006 開發完成後再進行整合測試；依實際測試結果確認是否需補充任務或修改交付說明。目前不建立任務狀態或開發日期。
- **範圍**：更新 `README.md` 的 npm scripts、開發 proxy origin、Docker API_UPSTREAM、Node／依賴版本、secure context 與尚未開放的登入功能；以 Gherkin 規則核對單元、元件與瀏覽器驗證結果，記錄已驗證項目和環境限制。
- **驗證**：執行 `npm run test`、`npm run build`、`npm run lint`；瀏覽器檢查桌面／窄螢幕、focus、頁籤、成功／失敗／重試／清除、bfcache 及 URL 不變；Docker/nginx 執行 `nginx -t`、GET `/`、前端路由重新整理、靜態資源與 API 上游代理。以可控制後端檢查 POST 原始 URI 與 JSON body，並確認上游錯誤不回傳 SPA HTML 作為成功結果。依指定 `get_design_context` 核對畫面；真實 API 驗證須使用提供的測試環境。
- **資料流核對**：trim → 格式與一致性驗證 → 64 字元 SHA-256 → API；覆蓋斷線／逾時保留資料與重試，並如實記錄需求文件與 Scenario 的差異。

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
| OQ-002（已確認） | 使用者指定單一 HomePage，切換登入／註冊顯示不同表單結構 | TASK-002／004／006 已改為 mode state、回呼切換、明確清理及成功後切回登入。兩種表單為 Component，Page 僅 HomePage；登入版面納入、API 合約待獨立登入需求。 |
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

交付 PM／Reviewer 審查本 Plan。Programmer 以本 Plan 及最新 Task Status 執行 TASK-001 至 TASK-006。主要任務完成後再進行整合測試，依結果決定是否建立後續整合任務與更新交付說明。UI 依指定 get_design_context 取得設計後核對；登入 API／驗證另依登入需求定義。不得自行變更 Requirement、後端／DB 或無關架構；不能執行的設計事項以 `Features/Issue/01-Register/<Task ID>.md` 回報 System Design Agent。
