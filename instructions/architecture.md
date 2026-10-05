# Project Architecture

## Overview

此文件簡單說明本專案的程式碼架構與各主要目錄的責任。*System Design*、*Programmer* 與 *Code Review Agent* 在進行設計、實作與審查時，應依照此架構決定程式碼分類與放置位置。

如果有額外需求要建立其他的資料夾，應優先根據其責任範圍與專案架構的原則進行分類，確認完全沒有重複或衝突的情況，才可以與PM確認後再進行建立。

禁止在各個資料夾中使用`index.ts`作為入口檔案。

## Application Structure

```text
/manage-frontend
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```


## Architecture Layers

前端架構主要依照`Route`、`Page`、`Component`、`Hook` 與 `Service` 的責任進行分類。

```text
Routes
   ↓
Pages
   ├────────────→ Components
   │
   ↓
Hooks
   ↓
Services
   ↓
Backend API
```

各層之間的依賴關係不需要強制經過下一層，應根據實際需求調整使用，但是不可以違反各層的責任範圍。例如頁面中只需要簡單透過API取得資料，且沒有需要重用的邏輯，可以直接使用`Service`，不需要為了符合`Layer Structure`強制建立`Custom Hook`。
```text
Page
 ↓
Service
```


## 資料夾責任

### Overview
| Path | Responsibility | Example |
|---|---|---|
| `src/pages/` | Page Layer | ProductPage、UserPage |
| `src/components/` | Reusable UI Component | ProductTable、Modal、Button |
| `src/hooks/` | Reusable React Logic | useProducts、useAuth |
| `src/routes/` | Application Routing | Router、ProtectedRoute |
| `src/services/` | Backend API Communication | product-service、auth-service |
| `src/types/` | Shared TypeScript Types | Product、User、ApiResponse |
| `src/utils/` | Generic Shared Utility | formatDate、formatCurrency |
| `src/assets/` | Static Assets | Image、Icon、Font |
| `src/styles/` | Shared / Global Styles | variables.css、common.css |
| `src/App.tsx` | Application Root | Application Root Component |
| `src/main.tsx` | Application Entry Point | React Application Bootstrap |
| `src/index.css` | Global Style Entry | Global CSS Import |

### Detailed Responsibility

#### Routes
`routes`資料夾應包含所有與應用程式路由相關的檔案，並負責定義應用程式的路由結構與路由層級的控制，**不應包含任何頁面業務邏輯**。

例如：

```text
/login
/products
/products/:id
/users
```
#### Pages

`pages`負責組合完整頁面的UI與頁面操作流程，主要責任:
- 組合 Components。
- 使用 Hooks。
- 呼叫 Services。
- 管理 Page-level State。
- 處理 Loading、Error 與 Page Interaction。

例如：

```text
pages/
├── LoginPage.tsx
├── LoginPage.test.tsx
├── ProductPage.tsx
├── ProductPage.test.tsx
├── UserPage.tsx
└── UserPage.test.tsx   
```
禁止將所有UI實作集中於單一Page內，應將可重用的UI抽離至`components`資料夾。


#### Components

`components`負責可重用的 UI Component，而不會負責`page`層的業務邏輯，應保持 UI 的純粹性，並且需要將對應的樣式與測試文件與組件保持在同一資料夾內。

例如：

```text
components/
├── ProductCard
|  ├── ProductCard.css
|  └── ProductCard.tsx
|  └── ProductCard.test.tsx
├── ProductTable
│  ├── ProductTable.css
│  └── ProductTable.tsx
│  └── ProductTable.test.tsx
```


#### Hooks

`hooks`負責封裝可重用的 React-specific Logic:
- State Logic。
- Effect Logic。
- Reusable React Behavior。
- API Operation Orchestration。

例如：

```text
hooks/
├── useAuth.ts
├── useProducts.ts
└── usePagination.ts
```

如果該邏輯僅在單一頁面或組件中使用，則不需要額外建立 Custom Hook。


#### Services

`services`負責與後端API進行溝通，封裝所有與後端交互的邏輯:
- HTTP Request
- HTTP Response
- API Endpoint
- Request / Response Mapping

例如：

```text
services/
├── auth-service.ts
├── product-service.ts
└── user-service.ts
```


Service不應包含React State 或 UI Behavior。


#### Types

`types`負責跨多個 Module 共用的 TypeScript Type Definition，如果只有單一 Component 使用的 Type，可以直接定義於該 Component，不需要全部集中到 `types`。

例如：

```text
types/
├── product.ts
├── user.ts
└── api.ts
```

適合放置：

```text
interface
type
Union Type
Shared API Type
```


#### Utils

`utils`負責與 Feature 無關且可以共用的 Utility Function。

例如：

```text
utils/
├── date.ts
└── currency.ts
```

Utility 應符合：

```text
Stateless
Reusable
Feature-independent
```

Feature-specific Business Logic 不應放入 `utils`。


#### Assets

`assets`負責 Static Asset。

```text
assets/
├── images/
├── icons/
└── fonts/
```

CSS Style 不放置於 `assets`。


## Styles

`styles`負責共用或 Global Style。

例如：

```text
styles/
├── variables.css
└── common.css
```

`index.css`作為 Application Global Style Entry。

Component-specific Style 應與 Component Responsibility 保持接近，避免所有 CSS 都集中於 Global Style。


## Type Placement

TypeScript Type 應依使用範圍決定位置。

```text
Single Component
→ Component File

Multiple Components / Pages / Services
→ types/
```

例如：

```typescript
interface ProductCardProps {
  product: Product;
}
```

如果只由 `ProductCard` 使用，可以直接放置於：

```text
ProductCard.tsx
```

而共用的：

```typescript
interface Product {
  id: string;
  name: string;
  cost: number;
  price: number;
}
```

則可以放置於：

```text
types/product.ts
```

## Unit Test

`*.test.tsx` 負責放置所有單元測試文件，通常與被測試的模組保持相同的目錄結構，相關測試規範請參考*Unit Test Skill Guide*。

例如：

```text
components/
├── ProductCard
│  ├── ProductCard.css
|  ├── ProductCard.tsx
│  └── ProductCard.test.tsx
```

