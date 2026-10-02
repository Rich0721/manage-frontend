---
name: typescript
description: 開發、修改、除錯或審查 TypeScript 程式碼時使用。只提供 TypeScript 共通規範，可獨立使用或搭配 JavaScript／React SKILL；純語言工作不適用。
---

# TypeScript Skill

## Overview

這一個Skill提供使用`TypeScript`開發前後端程式時，應遵循的共通程式碼規範。

規範優先順序：

```text
Project Instructions
        ↓
Existing Project Convention
        ↓
TypeScript Skill
```

如果使用者已於`instructions`中提供明確的 Code Standards，應優先遵循 Project Instructions。

如果 Existing Project 已存在一致的 Coding Convention，且未與 Project Instructions 發生衝突，應優先維持 Existing Project Convention。

本 Skill 僅提供 TypeScript 共通技術規範，不負責定義 Project Architecture 或 Framework-specific Design。


## Core Principles

### 開發優先遵守規則

- Type Safety > Convenience
- Readability > Clever Code
- Explicit Intent > Hidden Behavior
- Reuse > Duplication
- Simple Design > Over Engineering
- Minimal Change > Unrelated Refactoring


### 允許使用

- `參數`需定義型別，若為複雜型別可使用`interface`或`type`表達明確的資料結構。
- `回傳值`需定義型別，特別是 Public Function、Method 或重要 Application Boundary。
- `局部變數`應優先使用`const`，只有在需要重新賦值時才使用`let`。
- `函數`或`變數`命名需清楚表達其用途與行為。
- `類別`需具有明確 Responsibility。
- `interface`與`type`需清楚表達資料結構或型別用途。
- 字串需要組合或插值時，優先使用`Template Literal`。
- 可適當使用`Destructuring`提升可讀性。
- 簡單條件可以使用`Ternary`。
- 同一個 Value 存在多個固定 Case 時，可以使用`switch`。
- 優先考慮`Early Return`降低不必要的巢狀層級。
- `Comment`應說明程式碼無法直接表達的原因或設計考量。
- `TODO`應提供足夠 Context，說明待處理事項與原因。
- `Logging`應清楚表達 Operation 與必要 Context。
- `Performance`改善應以 Requirement、資料規模或實際 Performance Problem 為依據。
- `Utility`應保持 Stateless、Reusable 且不包含 Feature-specific Business Logic。
- 新增 Component 前應優先確認是否存在可 Reuse 的 Existing Component。
- 有商業意義、重複使用或需要統一管理的固定值，應定義為具有明確名稱的 Constant。


### 禁止使用

- 禁止使用`var`，應改用`const`或`let`。
- 禁止使用隱式的`any`。
- 應避免使用顯式`any`逃避 TypeScript Type Checking。
- 禁止使用`eval`，避免安全風險與難以追蹤的程式行為。
- 避免散落具有商業意義或重複使用的`Magic Value`。
- 避免使用`Nested Ternary`導致判斷邏輯難以閱讀。
- 不應使用只為縮短程式碼、但沒有提升可讀性的`Destructuring`。
- 不應建立只描述程式碼表面行為的無意義`Comment`。
- 不應留下缺乏 Context 的`TODO`。
- 不應為理論上的 Performance 提前加入複雜 Optimization。
- 不應將 Feature-specific Business Logic 放入`Utility`。
- 不應重新實作已有且能完成相同行為的 Component。
- 不因個人偏好重構與 Requirement 無關的程式碼。
- 不建立沒有明確 Responsibility 或抽象價值的抽象層。
- 不應單純為了使用 Functional Programming 而將簡單邏輯改成難以閱讀的 Collection Chain。
- 不應為了 Design Pattern、Generic 或抽象化本身增加不必要的複雜度。


## TypeScript Configuration

### New Project Recommendation

建議啟用：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

`strict`已包含部分 Strict Type Checking 設定，但可以明確保留其他設定，使 Type Safety Intent 更容易理解。


### Existing Project Recommendation

已存在專案如果未啟用上述設定，應先評估調整 Compiler Configuration 對現有程式碼的影響。

不得單純為了符合本 Skill 開啟新的 Compiler Option，導致大量與 Requirement 無關的 Type Error。

應先確認：

```text
Current Configuration
        ↓
Requirement Scope
        ↓
Impact
        ↓
是否需要調整
```


## Code Standards

### 命名規範(Naming)

相關`參數`、`函數`、`類別`、`介面`、`型別`等命名應根據使用情境進行定義，使其可直接表達實際用途，減少透過`Comment`解釋命名意圖。

如果沒有其他命名規範，建議：

| 類型 | Naming | Example |
|---|---|---|
| Variable | camelCase | `userName` |
| Function | camelCase | `getUser()` |
| Method | camelCase | `calculateTotal()` |
| Class | PascalCase | `UserService` |
| Interface | PascalCase | `User` |
| Type | PascalCase | `UserStatus` |
| Enum | PascalCase | `UserStatus` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Boolean | `is` / `has` / `can` / `should` | `isActive` |
| File | kebab-case | `user-service.ts` |

Boolean Variable 應清楚表達 Boolean Intent。

```typescript
const isActive = true;
const hasPermission = false;
const canEdit = true;
```

避免：

```typescript
const status = true;
const flag = false;
```

Collection Variable 應使用複數名稱。

```typescript
const user = getUser();
const users = getUsers();
```


#### 變數聲明(Variable Declaration)

變數聲明時，應根據是否需要重新賦值使用`const`或`let`。

- 不需要重新賦值使用`const`。
- 需要重新賦值使用`let`。
- Object Property 可能修改，不代表 Variable Binding 需要使用`let`。

```typescript
const name = "Tom";

let age = 30;
age += 1;

const user = {
  name: "Tom",
};
```

不建議：

```typescript
var name = "Tom";
var age = 30;
```


#### 型態類別(Type Inference)

如果 TypeScript 可以清楚推導型別，不需要重複宣告型別。

```typescript
const name = "Tom";
const count = 10;
const enabled = true;
```

Function Parameter、Return Type、Public API 或 Complex Object 等重要 Boundary 應明確定義型別。

```typescript
function calculateTotal(
  price: number,
  quantity: number,
): number {
  return price * quantity;
}
```

複雜 Object 應定義明確 Type。

```typescript
interface User {
  id: string;
  name: string;
}

const user: User = {
  id: "123",
  name: "Tom",
};

function getUser(): User {
  return {
    id: "123",
    name: "Tom",
  };
}
```


#### Unknown取代Any

型別已知時應明確定義型別。

真正無法確定 External Data Type 時，應優先使用`unknown`，再透過 Validation 或 Type Narrowing 處理。

常見情境：

- API Response
- JSON Parse Result
- External Library
- Message Queue
- User Input

不建議：

```typescript
function processData(data: any): any {
  return data.value;
}
```

建議：

```typescript
function processData(data: unknown): unknown {
  if (
    typeof data !== "object" ||
    data === null ||
    !("value" in data)
  ) {
    throw new Error("Invalid data");
  }

  return data.value;
}
```

只有 External Library Typing Limitation 或其他無法合理定義型別的情況，才考慮使用`any`，且應限制其 Scope。


#### Type Assertion

避免使用 Type Assertion 逃避 Type Checking。

不建議：

```typescript
const user = response as User;
```

External Data 應先 Validate。

```typescript
function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "id" in value && "name" in value;
}

if (!isUser(response)) {
  throw new Error("Invalid user response");
}

const user = response;
```

Type Assertion 僅應使用於：

```text
Developer 已能證明型別
+
Compiler 無法正確推導
```

的情況。


#### Non-null Assertion

應避免直接使用`!`消除 Compiler Error。

```typescript
user!.name;
```

不會提供 Runtime Safety。

應改為明確判斷：

```typescript
if (!user) {
  return;
}

logger.info(user.name);
```

如果資料本身允許不存在，可以使用 Optional Chaining：

```typescript
const userName = user?.name;
```


#### Null / Undefined

應明確區分`undefined`與`null`。

通常：

- `undefined`: 尚未提供或不存在。
- `null`: 明確表示沒有值。

Optional Property：

```typescript
interface User {
  id: string;
  nickname?: string;
}
```

Property 必須存在，但允許空值：

```typescript
interface User {
  id: string;
  nickname: string | null;
}
```

避免沒有必要地同時使用：

```typescript
nickname?: string | null | undefined;
```


#### Optional Chaining

Object 本身允許不存在時，可以使用`?.`。

不建議：

```typescript
if (
  user &&
  user.profile &&
  user.profile.address &&
  user.profile.address.city
) {
  return user.profile.address.city;
}
```

建議：

```typescript
return user?.profile?.address?.city;
```

如果該 Object 在 Business Rule 中必須存在，不應使用 Optional Chaining 靜默返回`undefined`。

```typescript
if (!user) {
  throw new UserNotFoundError();
}

return user.id;
```


#### Nullish Coalescing

如果只有`null`或`undefined`時才需要 Default Value，應使用`??`。

```typescript
const pageSize = request.pageSize ?? 20;
```

避免：

```typescript
const pageSize = request.pageSize || 20;
```

因為：

```text
0
""
false
```

也會被`||`視為 Falsy。


#### Interface

適合描述 Object Contract 或 Object Structure。

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}
```

例如：

```typescript
interface UserRepository {
  getById(id: string): Promise<User | null>;
}
```


#### Type

適合描述：

- Union
- Intersection
- Literal Type
- Utility Type
- Function Type

```typescript
type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "LOCKED";

type UserFilter = (user: User) => boolean;
```


##### Union Type

如果 Value 只有固定幾種可能，優先使用 Literal Union，而不是過度寬泛的`string`。

```typescript
type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED";
```

可避免：

```typescript
const status: OrderStatus = "UNKNOWN";
```


##### Discriminated Union

具有不同 State 且各 State 有不同資料結構時，可使用 Discriminated Union。

```typescript
type ApiResult<T> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "error";
      error: string;
    };
```

使用：

```typescript
function handleResult(
  result: ApiResult<User>,
): void {
  if (result.status === "success") {
    logger.info(result.data);
    return;
  }

  logger.error(result.error);
}
```

相比：

```typescript
interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

後者可能產生：

```text
success = true
data = undefined
error = "failed"
```

等不合理狀態。


##### Exhaustive Check

固定 Union 可以搭配`switch`與`never`進行 Exhaustive Check。

```typescript
type Status =
  | "ACTIVE"
  | "INACTIVE"
  | "LOCKED";

function getStatusLabel(status: Status): string {
  switch (status) {
    case "ACTIVE":
      return "啟用";

    case "INACTIVE":
      return "停用";

    case "LOCKED":
      return "鎖定";

    default: {
      const exhaustiveCheck: never = status;
      return exhaustiveCheck;
    }
  }
}
```


#### Function Design

Function 應根據 Responsibility 進行劃分，而不是單純根據行數。

主要判斷：

- Responsibility
- Business Meaning
- Reuse
- Readability

如果 Expression 本身已經清楚，不應建立沒有額外語意的 Wrapper Function。


##### Function Parameters

避免 Function 存在大量容易混淆的 Position Parameters。

可以使用 Object：

```typescript
interface CreateUserInput {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  enabled: boolean;
}

function createUser(
  input: CreateUserInput,
): User {
  // ...
}
```

避免：

```typescript
createUser(
  "001",
  "Tom",
  "tom@example.com",
  20,
  "ADMIN",
  true,
);
```


##### Default Parameter

存在合理 Default Value 時，可以直接定義：

```typescript
function getUsers(
  limit = 20,
): User[] {
  // ...
}
```

避免：

```typescript
function getUsers(
  limit?: number,
): User[] {
  const actualLimit =
    limit === undefined ? 20 : limit;

  // ...
}
```


##### Early Return

巢狀 Condition 過深時，優先考慮 Early Return。

```typescript
function processUser(
  user: User | null,
): void {
  if (!user) {
    return;
  }

  if (!user.isActive) {
    return;
  }

  if (!user.hasPermission) {
    return;
  }

  process(user);
}
```

Early Return 應用於改善 Readability，而不是作為強制寫法。


#### Boolean Condition

Boolean 不需要與`true`或`false`比較。

```typescript
if (user.isActive) {
}

if (!user.isActive) {
}
```

複雜 Condition 建議建立具語意的 Variable。

```typescript
const canUpdateUser =
  user.isActive &&
  user.hasPermission &&
  !user.isLocked;

if (canUpdateUser) {
  updateUser(user);
}
```


### Collection

Collection 操作應根據目的選擇 Method。

| 功能目的 | 對應 Method |
|---|---|
| 轉換每一筆資料 | `map` |
| 篩選資料 | `filter` |
| 取得單一資料 | `find` |
| 至少一筆符合 | `some` |
| 全部符合 | `every` |
| 累積計算 | `reduce` |
| 單純 Side Effect | `forEach` / `for...of` |
| 需要 break / continue | `for...of` |
| 需要 await 且依序執行 | `for...of` |
| 需要 await 且可以平行執行 | `Promise.all` + `map` |


#### map

資料轉換時使用`map`。

```typescript
const names = users.map(
  (user) => user.name,
);
```

Object Mapping：

```typescript
const responses = users.map(
  (user): UserResponse => ({
    id: user.id,
    name: user.name,
  }),
);
```

不應使用`map`執行純 Side Effect。

不建議：

```typescript
users.map((user) => {
  logger.info(user.id);
});
```

應使用：

```typescript
users.forEach((user) => {
  logger.info(user.id);
});
```

或：

```typescript
for (const user of users) {
  logger.info(user.id);
}
```


#### filter

資料篩選使用`filter`。

```typescript
const activeUsers = users.filter(
  (user) => user.isActive,
);
```


#### find

取得第一筆符合條件的資料使用`find`。

```typescript
const targetUser = users.find(
  (user) => user.id === userId,
);
```


#### some

判斷是否至少一筆符合條件：

```typescript
const hasAdmin = users.some(
  (user) => user.isAdmin,
);
```


#### every

判斷是否全部符合：

```typescript
const allActive = users.every(
  (user) => user.isActive,
);
```


#### reduce

`reduce`適合真正的：

- Aggregate
- Sum
- Group
- Accumulator

例如：

```typescript
const totalPrice = products.reduce(
  (total, product) =>
    total + product.price,
  0,
);
```

如果實際意圖只是`filter + map`，應直接使用：

```typescript
const responses = users
  .filter((user) => user.isActive)
  .map((user) => ({
    id: user.id,
    name: user.name,
  }));
```


#### Collection Chain

簡單 Chain 可以使用：

```typescript
const names = users
  .filter((user) => user.isActive)
  .map((user) => user.name);
```

過於複雜時，應：

- 建立 Intermediate Variable。
- 拆分 Responsibility。
- 使用`for...of`。

例如：

```typescript
const activeUsers = users.filter(
  (user) => user.isActive,
);

const sortedUsers = activeUsers.toSorted(
  (left, right) =>
    left.name.localeCompare(right.name),
);

const names = sortedUsers.map(
  (user) => user.name,
);
```

不應追求 One-liner 而犧牲 Readability。


#### forEach

適合簡單且同步的 Side Effect。

```typescript
users.forEach((user) => {
  logger.info(user.id);
});
```

如果需要：

- `break`
- `continue`
- `await`
- 複雜流程控制

應使用`for...of`。


##### Avoid Async forEach

不應使用：

```typescript
users.forEach(async (user) => {
  await updateUser(user);
});
```

期待外層等待所有 Promise。

依序執行：

```typescript
for (const user of users) {
  await updateUser(user);
}
```

可以 Parallel：

```typescript
await Promise.all(
  users.map((user) =>
    updateUser(user),
  ),
);
```

`Promise.all`適用前應確認：

- Operation 是否彼此獨立。
- Database Connection Limit。
- External API Rate Limit。
- Memory Usage。
- Transaction。
- Requirement 是否要求執行順序。

各 Promise 的完成時間順序不保證，但 Result Array 順序與 Input Promise 順序一致。


### Object

Object 建立應優先使用明確 Property Mapping。

```typescript
const response: UserResponse = {
  id: user.id,
  name: user.name,
  email: user.email,
};
```

名稱相同時可使用 Property Shorthand：

```typescript
const id = user.id;
const name = user.name;

const response = {
  id,
  name,
};
```


#### Object Spread

Object Spread 可以用於已知 Object 的 Copy 或 Immutable Update。

```typescript
const updatedUser = {
  ...user,
  name: newName,
};
```

不得將未限制欄位的 External Object 直接 Spread 到 Domain Object。

不建議：

```typescript
const updatedUser = {
  ...request,
};
```

如果只允許更新：

```text
name
email
```

則明確 Mapping：

```typescript
const updatedUser = {
  ...user,
  name: request.name,
  email: request.email,
};
```

避免意外修改：

```text
id
role
permission
createdAt
createdBy
```


#### Immutability

Function 不應在沒有明確語意的情況下修改 Caller 傳入的 Object。

```typescript
function updateName(
  user: User,
  name: string,
): User {
  return {
    ...user,
    name,
  };
}
```

核心原則是：

```text
避免意外 Side Effect
```

而不是強制所有 Object 都使用 Immutable Design。


### Array Mutation

如果 Array 為 Function Input 或 Shared State，應避免意外 Mutation。

Mutation Method：

```typescript
arr.sort();
arr.reverse();
arr.splice(1, 1);
```

Non-Mutation：

```typescript
const sortedArr = arr.toSorted();
const reversedArr = arr.toReversed();
const slicedArr = arr.slice(1);
```

如果 Array 為 Local-owned Data，而且 Mutation 行為清楚，不需要強制建立新 Array。


### Set

需要：

- Unique Value
- 重複 Membership Check

時可以使用`Set`。

```typescript
const userIds = new Set(
  users.map((user) => user.id),
);

const exists = userIds.has(userId);
```

小型 Collection 或只搜尋一次時，不需要因理論 Performance 強制建立`Set`。


### Map

資料本質為：

```text
Key → Value
```

而且需要頻繁 Lookup 時，可使用`Map`。

```typescript
const userById = new Map(
  users.map(
    (user) => [user.id, user],
  ),
);

const user = userById.get(userId);
```

簡單 JSON-compatible Mapping 可以使用 Object 或`Record`。


### Record

固定 Key / Value Mapping 可以使用`Record`。

```typescript
type StatusLabel = Record<
  UserStatus,
  string
>;

const STATUS_LABEL: StatusLabel = {
  ACTIVE: "啟用",
  INACTIVE: "停用",
  LOCKED: "鎖定",
};
```

特別適合 Key 為固定 Union 的情況。


### Readonly

Property 或 Input 不應被修改時，可以使用`readonly`表達 Intent。

```typescript
interface User {
  readonly id: string;
  name: string;
}
```

Array：

```typescript
function calculateTotal(
  products: readonly Product[],
): number {
  return products.reduce(
    (total, product) =>
      total + product.price,
    0,
  );
}
```


### Async

#### Async Function

Async Function 應明確回傳`Promise<T>`。

需要`await`後進一步處理：

```typescript
async function getUser(
  id: string,
): Promise<User> {
  const user =
    await userRepository.getById(id);

  if (!user) {
    throw new UserNotFoundError(id);
  }

  return user;
}
```

只直接 Return Promise 時不需要`async`：

```typescript
function getUser(
  id: string,
): Promise<User | null> {
  return userRepository.getById(id);
}
```


#### Promise Parallelism

彼此沒有資料依賴且可以 Parallel Execution 時，可使用`Promise.all`。

```typescript
const [
  user,
  permissions,
] = await Promise.all([
  getUser(userId),
  getPermissions(userId),
]);
```

不適合使用 Parallel 的情況：

- Execution Order 有要求。
- Transaction Dependency。
- Rate Limit。
- Resource Limit。
- 後一個 Operation 需要前一個結果。


### Error Handling

Error 不應被無條件忽略。

應根據情況：

```text
Handle
Translate
Propagate
```

Catch Value 應視為`unknown`。

```typescript
try {
  await process();
} catch (error: unknown) {
  if (error instanceof ValidationError) {
    throw error;
  }

  throw error;
}
```

需要讀取 Error Property 時先 Narrow：

```typescript
if (error instanceof Error) {
  logger.error(
    "Failed to process request",
    {
      message: error.message,
    },
  );
}
```

不應每一層都進行：

```text
catch
↓
log
↓
throw
```

避免同一 Error 被重複 Logging。

Custom Error 適合：

- 具有獨立 Domain/Application Semantics。
- 需要特別 Catch。
- 需要轉換成不同 Response。
- Caller 需要區分 Error Type。

例如：

```typescript
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(
      `User not found: ${userId}`,
    );

    this.name = "UserNotFoundError";
  }
}
```

如果只有 Error Message 不同，但處理方式完全相同，不需要建立額外 Error Class。


### Class

Class 應具有明確 Responsibility。

- `Constructor`: Dependency Assignment / Simple Initialization。
- `Method`: 應與 Class Responsibility 有關。
- `Property`: 應與 Class Responsibility 有關。
- 使用適當的`private`、`protected`、`public`表達 Access Scope。

```typescript
class UserService {
  private userRepository: UserRepository;

  constructor(
    userRepository: UserRepository,
  ) {
    this.userRepository =
      userRepository;
  }

  getUser(
    id: string,
  ): Promise<User | null> {
    return this.userRepository.getById(
      id,
    );
  }
}
```


#### Constructor

Constructor 不應執行大量 Business Logic 或 External Operation。

不建議：

```typescript
class UserService {
  constructor() {
    // query database
    // read files
    // call API
    // business logic
  }
}
```

Constructor 主要應處理：

```text
Dependency Assignment
Simple Initialization
```


### Generic

Generic 應用於真正存在 Type Relationship 或 Reuse 的情況。

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
}

type UserResponse =
  ApiResponse<User>;

type ProductResponse =
  ApiResponse<Product>;
```

存在 Constraint 時應明確定義：

```typescript
interface Identifiable {
  id: string;
}

function findById<
  T extends Identifiable,
>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find(
    (item) => item.id === id,
  );
}
```

不應為了讓 Function 看起來更彈性而建立沒有實際價值的 Generic。


### Import

Import 應清楚區分 Runtime Dependency 與 Type Dependency。

建議順序：

1. Standard / Runtime Library
2. External Dependency
3. Internal Module
4. Relative Module
5. Type-only Import

Type-only Dependency：

```typescript
import type { User } from "./user";

import {
  UserRepository,
} from "./userRepository";
```


### Barrel Export

`Barrel Export`應依實際 Dependency 結構使用，不應只為縮短 Import Path 而大量建立。

應注意：

- Circular Dependency
- Hidden Dependency
- Bundle Impact
- Import Traceability

例如：

```text
users/
├── user.ts
├── user-service.ts
└── index.ts
```

只有在 Barrel 能改善 Module Boundary 且不造成上述問題時才使用。