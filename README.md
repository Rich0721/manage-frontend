# TAMAS 前端

此專案使用 React 18、TypeScript 與 Vite 建置登入／註冊及商品查詢介面。

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

開發伺服器預設將 `/userController` 與 `/productController` 代理至 `http://localhost:8000`。需要使用其他後端時，可在啟動 Vite 前設定 `API_UPSTREAM` 為可連線的 `http(s)://host:port` origin；不能包含路徑、帳密、query 或 hash。Vite 會保留原始 URI，例如 `/userController/register` 與 `/productController/getProducts?productId=all`。

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

專案以 Docker 多階段建置 Vite 靜態檔，再由 nginx 提供前端頁面。`nginx/default.conf.template` 讓前端路由重新整理時回到 `index.html`，並將 `/userController/` 與 `/productController/` 請求轉發至後端，保留原始 API 路徑及 HTTP headers。

```sh
docker build -t manage-frontend .
docker run --rm -p 8080:80 -e API_UPSTREAM=http://backend:8080 manage-frontend
```

`API_UPSTREAM` 必須是 nginx 容器可連線的後端 origin，不含路徑或結尾斜線。容器預設值為 `http://localhost:8000`；容器中的 `localhost` 指向 nginx 容器本身，若後端在其他容器或主機，請設定該環境可連線的位址。Web Crypto 需要安全環境，正式環境應透過 HTTPS 提供前端。

Docker 建置使用鎖定檔執行 `npm ci`。後端位址、TLS 終止與真實 API 行為依部署環境設定；本 repository 未包含後端或資料庫。
