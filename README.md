# TAMAS 前端

此專案使用 React 18、TypeScript 與 Vite 建置登入／註冊介面。登入畫面目前僅提供版面，登入功能尚未開放。

## 開發環境

- Node.js：24.x（Vite 7.3.1 支援 `^20.19.0 || >=22.12.0`）
- npm：11.x
- React／React DOM：18.3.1
- TypeScript：5.9.3
- Vite：7.3.1

安裝相依套件並啟動：

```sh
npm ci
npm run dev
```

開發伺服器預設不設定後端代理。需要連接後端時，在啟動 Vite 前設定 `API_UPSTREAM` 為可連線的 `http(s)://host:port` origin；不能包含路徑、帳密、query 或 hash。Vite 會代理 `/userController` 並保留原始 URI，例如 `/userController/register`。

PowerShell 範例：

```powershell
$env:API_UPSTREAM = 'http://localhost:8080'
npm run dev
```

## 測試與檢查

```sh
npm run test
npm run test:watch
npm run build
npm run lint
```

測試使用 Vitest 5、jsdom、React Testing Library、user-event 與 jest-dom，套件版本固定於 `package.json` 與 `package-lock.json`。

## nginx 部署

專案以 Docker 多階段建置 Vite 靜態檔，再由 nginx 提供前端頁面。`nginx/default.conf.template` 讓前端路由重新整理時回到 `index.html`，並將 `/userController/` 請求轉發至後端，保留原始 API 路徑。

```sh
docker build -t manage-frontend .
docker run --rm -p 8080:80 -e API_UPSTREAM=http://backend:8080 manage-frontend
```

`API_UPSTREAM` 必須是 nginx 容器可連線的後端 origin，不含路徑或結尾斜線。容器預設值 `http://127.0.0.1:8080` 僅適用於後端與 nginx 共用網路命名空間的環境；正式部署請設定實際後端位址。Web Crypto 需要安全環境，正式環境應透過 HTTPS 提供前端。

Docker 建置使用鎖定檔執行 `npm ci`。後端位址、TLS 終止與真實 API 行為依部署環境設定；本 repository 未包含後端或資料庫。
