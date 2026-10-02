---
name: react
description: 開發、修改、除錯或審查 React 元件、JSX、Hooks、狀態與渲染行為時使用。只提供 React 與必要的 React DOM 規範，可獨立使用或搭配 JavaScript／TypeScript SKILL；純語言工作不適用。
---

# React Skill

## 概述（Overview）

本 Skill 提供使用 React 開發元件與互動介面時，應遵循的共通 React 規範。

規範優先順序：

```text
專案明確指示（Project Instructions）
        ↓
既有專案慣例（Existing Project Convention）
        ↓
React Skill 與所選語言 Skill 的各自職責
```

使用者已提供明確的程式碼規範時，優先遵循專案指示。既有專案存在一致慣例，且未與明確指示衝突時，優先維持既有慣例；若慣例違反 React 的執行規則，應指出問題並在需求範圍內修正。

本 Skill 僅提供 React 共通技術規範，不負責定義專案架構、框架專屬設計、路由、樣式方案、後端或外部套件選型。

### 技能組合與責任邊界

| 責任 | 對應規範 |
|---|---|
| 元件、JSX 的 React 語意、props、state、Hooks 與渲染行為 | React Skill |
| JavaScript 語法、語言版本與一般程式碼規範 | 使用者選擇的 JavaScript Skill 或專案規範 |
| TypeScript 型別、泛型、型別檢查與編譯設定 | 使用者選擇的 TypeScript Skill 或專案規範 |
| 框架、工具鏈、路由、樣式、資料存取與平台整合 | 專案指示或對應技能 |

本 Skill 不依賴指定名稱的 JavaScript 或 TypeScript Skill。未選擇語言 Skill 時，仍可依照現有專案慣例完成 React 工作。

沿用目標檔案的語言，不因本 Skill 將 JSX 改為 TSX、將 TSX 改為 JSX，或新增語言與型別設定。組合技能時，同時滿足 React 行為與語言規範；若存在無法同時滿足的實際衝突，再釐清衝突，不自行宣告 React Skill 優先。

以下程式碼範例使用不含型別註記的 JSX 表達 React 行為，不代表要求選用 JavaScript。實際實作的型別、語法風格與檔案命名，依所選語言 Skill 及專案規範調整。除完整元件範例外，片段預期放在相應的元件或 Hook 中。

說明與交付摘要使用繁體中文；程式識別名稱與產品文案依專案及使用者需求決定。

## 核心原則（Core Principles）

### 開發優先遵守規則

- 渲染正確性優先於提前最佳化。
- 元件組合優先於不必要的繼承與抽象。
- 明確的資料流優先於隱藏的同步行為。
- 單一資料來源優先於重複儲存可推導資料。
- 局部狀態優先於沒有需求的全域狀態。
- 最小必要修改優先於無關重構。

### 允許與建議使用

- 新增元件通常採用函式元件；維護既有類別元件或 Error Boundary 時，保留適合的實作方式。
- 元件依職責、重用需求與狀態邊界拆分，不單純依程式碼行數拆分。
- 新增元件或 Hook 前，確認現有實作是否已能滿足需求。
- 使用 props 傳遞資料、事件回呼回報操作，保持資料流可追蹤。
- 需要共享狀態時，先確認狀態擁有者與使用範圍，再選擇提升狀態或 Context。
- 使用 Effect 同步 React 以外的系統，並為資源提供對應清理。
- 效能改善依實際需求、量測或明確的參照穩定需求決定。

### 禁止或應避免的使用方式

- 不直接修改 props、現有 state 或 Hook 接收的既有資料。
- 不在渲染期間執行請求、訂閱或修改外部系統。
- 不在條件、迴圈或事件處理函式中呼叫一般 Hooks。
- 不以省略 Effect 依賴或關閉 Hooks 檢查來掩蓋錯誤資料流。
- 不使用每次渲染產生的隨機值作為列表 key。
- 不為所有元件固定加入 memo、useMemo 或 useCallback。
- 不把 ref 當成應觸發畫面更新的 state。
- 不為符合本 Skill 自動升級 React、導入框架或新增外部依賴。
- 不因個人偏好改寫與需求無關的元件。


## 程式碼規範（Code Standards）

### 命名規範（Naming）

沿用既有命名慣例。沒有其他規範時，可使用以下 React 命名方式：

| 類型 | 命名方式 | 範例 |
|---|---|---|
| 元件 | PascalCase | UserCard |
| 自訂 Hook | use 開頭，後接用途 | useSelectedItem |
| 元件對外事件 prop | on 加上事件語意 | onSelect |
| 元件內部事件處理函式 | handle 加上事件語意 | handleSelect |
| state 與 setter | 以資料用途配對 | selectedId / setSelectedId |

自訂元件的 JSX 標籤須以大寫開頭，使 React 能區分元件與內建標籤。只有需要遵守 Hooks 規則的可重用邏輯才使用 Hook 命名，不將一般工具函式任意命名為 use 開頭。

一般變數、型別、模組、匯入順序與檔案副檔名，由語言 Skill 或專案規範負責。

### 元件設計（Component Design）

元件應具有明確職責。需要組合內容時，可透過 children 或明確的元件介面表達。

```jsx
function Panel({ title, children }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

使用 JSX 讓 React 渲染元件，不直接呼叫元件函式。

建議：

```jsx
<UserCard user={user} />
```

不建議：

```jsx
UserCard({ user });
```

不要在另一個元件的渲染函式內定義元件。這會在重新渲染時建立新的元件類型，可能重設子元件狀態；元件定義應放在適合的模組範圍。

### 渲染純粹性（Render Purity）

同一份 props、state 與 Context 輸入，應產生一致的渲染結果。React 可能重複執行或中斷渲染，不應依賴元件只執行一次。

- 不在渲染中建立外部連線或註冊事件。
- 不在渲染中直接修改 React 管理的 DOM。
- 不在無條件的情況下，在渲染中呼叫 state setter。
- 必須改變外部系統時，依觸發原因放入事件流程或 Effect。

局部建立、且未在外部共享的新資料，可用於計算畫面；限制重點是避免改動既有輸入與外部系統。

### Props 與資料流

Props 視為唯讀輸入。子元件需改變資料時，透過事件回呼通知擁有資料的元件。

```jsx
function UserCard({ user, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user.id)}
    >
      {user.name}
    </button>
  );
}
```

不要直接修改 user 等 props，也不要把所有 props 無限制傳入 DOM。需要轉傳時，明確區分元件專用資料與適合底層元素的屬性。

不要僅為方便使用，就將 props 複製到 state。若資料只用於初始值，應以 initial 等清楚語意表達，並明確決定後續 props 變動是否應影響狀態。

### 狀態設計（State Design）

State 只保存無法從其他資料直接推導、且需要驅動畫面的資訊。

不建議：

```jsx
const [visibleItems, setVisibleItems] = useState([]);

useEffect(() => {
  setVisibleItems(items.filter((item) => item.isActive));
}, [items]);
```

建議：

```jsx
const visibleItems = items.filter((item) => item.isActive);
```

重點是避免多份資料需要同步，不是禁止資料轉換。只有計算成本確實需要處理時，才進一步考慮快取。

#### 狀態更新（State Update）

目前渲染的 state 是快照。呼叫 setter 會安排後續更新，不會立即改變目前流程讀到的變數。

下一個狀態依賴上一個狀態，尤其同一次互動需要連續更新時，使用函式更新。

需要增加兩次時，不建議：

```jsx
setCount(count + 1);
setCount(count + 1);
```

建議：

```jsx
setCount((previousCount) => previousCount + 1);
setCount((previousCount) => previousCount + 1);
```

#### 狀態不可直接修改（State Immutability）

不要改動既有 state，再將同一份參照傳回 setter。

不建議：

```jsx
items.push(newItem);
setItems(items);
```

建議：

```jsx
setItems((previousItems) => [...previousItems, newItem]);
```

巢狀資料更新時，從變更位置到最外層建立必要的新參照；淺層複製不代表巢狀資料已全部複製。

#### 狀態擁有者（State Ownership）

```text
單一元件需要
        ↓
保留局部狀態

多個元件需要同一份資料
        ↓
提升至最近的共同祖先

跨層共享且 props 或元件組合不適合
        ↓
評估 Context
```

不要將所有狀態放入根元件或 Context。狀態擁有者應能清楚管理資料生命週期與更新方式。

### 列表與 Key

Key 在同層兄弟節點間須唯一，並在同一資料項目的生命週期內保持穩定。

對可能刪除、插入或重排的列表，不建議：

```jsx
items.map((item, index) => (
  <ItemRow key={index} item={item} />
));
```

建議：

```jsx
items.map((item) => (
  <ItemRow key={item.id} item={item} />
));
```

Key 放在列表直接產生的最外層節點。不要在每次渲染時產生隨機 key，也不要用 useId 取代資料項目的身分。

Key 不會以一般 prop 傳入元件；元件需要識別值時，另外傳遞。

React 依元件在樹中的位置、類型與 key 決定狀態是否保留。只有確實需要重設整個子樹狀態時，才刻意改變 key。

### 條件渲染（Conditional Rendering）

明確表示條件，避免把數字誤當成是否顯示的判斷。

不建議：

```jsx
{items.length && <ItemList items={items} />}
```

建議：

```jsx
{items.length > 0 && <ItemList items={items} />}
```

前者在長度為 0 時，可能將 0 渲染到畫面。

### Hooks

一般 Hooks 與自訂 Hooks，只能在函式元件或自訂 Hook 的頂層呼叫，位於條件式提前回傳之前。

不建議：

```jsx
if (isEnabled) {
  const [count, setCount] = useState(0);
}
```

建議：

```jsx
const [count, setCount] = useState(0);

if (!isEnabled) {
  return null;
}
```

不要在迴圈、事件處理函式、巢狀回呼、一般工具函式、類別元件或 try/catch/finally 中呼叫一般 Hooks。

use API 有獨立規則：版本及環境支援時，可以在渲染過程的條件或迴圈內呼叫，但仍須在元件或 Hook 的渲染過程中執行，不能放在事件回呼或 try/catch。不要將這個例外套用到 useState、useEffect 等一般 Hooks。

#### 自訂 Hook（Custom Hook）

存在可重用的 React 邏輯，或需要明確分離職責時，才抽取自訂 Hook。

- 輸入與回傳內容應表達實際用途。
- 不只為隱藏幾行程式碼而建立 Hook。
- 自訂 Hook 共用邏輯，每次呼叫仍有各自的狀態。
- 需要共享狀態時，仍須建立明確的狀態擁有者。
- 不建立 useMount 等包裝來隱藏實際依賴或略過 Hooks 檢查。

### Effect

Effect 用於與 React 以外的系統同步，不作為通用流程控制。

| 情況 | 優先處理位置 |
|---|---|
| 從 props 或 state 計算畫面資料 | 渲染過程 |
| 使用者點擊、輸入或提交造成的操作 | 相應事件處理流程 |
| 與外部訂閱、計時器、連線或非 React 元件同步 | Effect |

不要只因某個 state 改變，就使用 Effect 串接下一個 state 更新。先確認能否直接推導資料，或在引發操作的事件中完成。

#### 依賴陣列（Dependencies）

Effect 使用的反應性資料，應反映在依賴陣列中。

- 不用空陣列強迫 Effect 只執行一次，卻仍讀取會改變的 props 或 state。
- 不關閉依賴檢查來保留過期閉包。
- 物件或函式使同步過於頻繁時，先調整 Effect 職責及建立位置。
- 不將應反映更新的資料藏入 ref 以逃避依賴。

#### 清理（Cleanup）

建立計時器、事件訂閱或連線時，提供對應清理。

不建議：

```jsx
useEffect(() => {
  setInterval(() => {
    setElapsed((previousElapsed) => previousElapsed + 1);
  }, 1000);
}, []);
```

建議：

```jsx
useEffect(() => {
  const timerId = setInterval(() => {
    setElapsed((previousElapsed) => previousElapsed + 1);
  }, 1000);

  return () => clearInterval(timerId);
}, []);
```

確認依賴改變、元件卸載與開發模式的額外建立／清理循環，都不會留下重複訂閱或資源。

#### 非同步結果（Async Result）

在 Effect 中整合非同步工作時，處理載入與錯誤，並防止較舊的回應覆蓋較新的狀態。依現有資料來源的能力，取消工作或忽略過期結果。

不要將 Effect 回呼本身宣告為 async；Effect 回傳值應為清理函式或不回傳。需要非同步流程時，在 Effect 內建立相應工作，並提供清理策略。

### Ref

useRef 適合保存 DOM 參照或不參與畫面渲染的可變資料。修改 ref.current 不會觸發重新渲染。

| 需求 | 選擇 |
|---|---|
| 資料改變後需要更新畫面 | state |
| 保存 DOM 參照、計時器識別值等資料 | ref |

Ref 的一般讀寫應放在事件或 Effect 中，避免渲染時依賴可變 ref。只有符合 React 規則的可預測初始化例外，才在渲染期間處理。

DOM ref 用於必要的聚焦、捲動或量測，不任意修改 React 管理的 DOM 結構。元件間的 ref 傳遞方式，以專案 React 版本與既有介面為準，不強制使用特定版本的新寫法。

只有畫面繪製前量測或同步確實必要時，才使用 useLayoutEffect；一般同步優先使用 useEffect。

### Reducer 與 Context

狀態轉移具有多個相關操作，且集中管理能提升可讀性時，考慮 useReducer。Reducer 保持純粹，不在其中執行請求或修改外部系統。

Context 用於跨層共享明確的資料或能力。使用前先評估 props 與元件組合是否已足夠。

Context 的值改變會影響訂閱該 Context 的元件；不要假設只加入 memo 就能阻止它們因 Context 更新而重新渲染。高頻更新與不同共享責任是否需要分開，依實際需求評估。

### 表單與事件（Forms and Events）

明確選擇受控或非受控欄位，不在生命週期中任意切換。

對預期可編輯的受控欄位，不建議：

```jsx
<input value={name} />
```

建議：

```jsx
import { useState } from "react";

function NameField() {
  const [name, setName] = useState("");

  return (
    <label>
      姓名
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
    </label>
  );
}
```

- 文字型受控欄位維持適合的字串值，避免 undefined 或 null 造成模式切換。
- 核取方塊以 checked 表達受控狀態。
- 刻意唯讀的受控欄位可使用 readOnly，不必新增無意義的更新事件。
- 非受控欄位依需求使用 defaultValue、defaultChecked 或 ref。
- React DOM 表單內，一般操作按鈕明確指定 type="button"；提交按鈕使用 type="submit"。
- 使用一般事件流程處理提交時，依需求防止瀏覽器預設提交；已有 Actions 或框架提交機制時，沿用其流程。
- 保留標籤關聯、鍵盤操作與適當焦點，不只依靠 placeholder 說明欄位用途。

### 載入、Suspense 與錯誤處理

非同步互動依需求提供載入、空結果、錯誤與重試狀態。沿用專案既有資料來源，不為畫面增加載入狀態就另選資料查詢套件。

Suspense 適用於程式碼分割或已支援 Suspense 的資料來源。一般在 Effect 中發出的請求，不會因外層加入 Suspense 而自動顯示 fallback。

| 錯誤來源 | 處理方向 |
|---|---|
| 子元件渲染失敗 | 適合的 Error Boundary |
| 事件處理流程失敗 | 在該操作流程處理並回報畫面 |
| 一般非同步工作失敗 | 在工作流程處理錯誤與恢復狀態 |

Error Boundary 不會攔截所有事件與非同步錯誤，也無法攔截自身渲染失敗；不要把它當成所有錯誤的唯一處理機制。

use、Transitions、Actions 與 Server Components，只有需求、版本與執行環境支持時才採用。使用 use 讀取 Promise 時，確保來源跨重新渲染維持穩定，不在每次渲染建立新的未快取請求 Promise。

### 效能（Performance）

先定位使用者可觀察的效能問題，再決定改善方式。

```text
確認慢的互動或畫面
        ↓
量測與定位
        ↓
改善狀態位置、Effect 或元件邊界
        ↓
必要時加入快取或其他 React 機制
        ↓
重新驗證改善效果
```

| 機制 | 主要用途 |
|---|---|
| memo | 在 props 不變時，嘗試略過元件重新渲染 |
| useMemo | 快取計算結果 |
| useCallback | 在依賴不變時，維持函式參照 |

這些機制不能代替正確性，不固定套用在所有元件、計算或回呼。若專案啟用 React Compiler，先確認既有處理方式，再評估是否需要手動快取。

### 伺服器渲染（Server Rendering）

只有專案涉及伺服器渲染時，套用此節。

- 初次客戶端渲染應與伺服器輸出一致，避免 hydration 不一致。
- 不在不支援的渲染階段讀取 window、document 或其他瀏覽器專用值。
- Effect 不在伺服器渲染時執行，不能依賴 Effect 提供初始伺服器畫面所需資料。
- Server／Client Components 的能力及邊界，依既有環境處理；不為使用 Hook 擴大不必要的客戶端範圍。

## 驗證與交付（Validation and Delivery）

使用專案既有檢查與測試工具，依變更風險驗證實際 React 行為。

相關情境包括：

- 互動後畫面與 state 是否一致。
- Props 更新是否正確反映。
- 列表新增、刪除與重排是否保留正確項目狀態。
- 表單輸入、唯讀與提交行為是否符合需求。
- Effect 的依賴更新、清理與非同步結果是否正確。
- 載入與錯誤狀態是否能恢復。
- 涉及伺服器渲染時，是否存在 hydration 問題。

只驗證與變更相關的情境，不為小幅修改另建測試堆疊。需要補測試時，優先檢查使用者可觀察的行為，不以元件內部實作細節作為唯一斷言。

交付時說明完成的 React 行為、必要設計取捨與實際驗證結果。未執行的檢查及其原因明確列出，不將推測當成已驗證。
