# 04 - Sell Page

## I. 需求簡介
使用者可以透過此介面進行輸入或使用讀碼機掃描商品條碼，查詢相對應商品資訊，並進行商品的結帳操作。

## II. 需求說明
### 2-1. 參考文件
Figma設計稿:
    -  [販售頁面](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=64-279&t=KiDxztsMXDybEHAS-4)
    - [商品資訊](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=69-466&t=KiDxztsMXDybEHAS-4)
    - [金額資訊](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=69-486&t=KiDxztsMXDybEHAS-4)
Flow Chart:
Gherkin:


### 2-2. API Format

#### 2-2-1. Get Product API
API URI: `productController/getProducts?productId=<product_id>`
Method: GET

Request Headers:
```json
{
    "Content-Type": "application/json",
    "Uid": "<user_id>",
    "Authorization": "<auth_token>"
}
```


Response Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Product retrieved successfully"
    },
    "body": {
        "info": [{
            "id": "<product_id>",
            "name": "<product_name>",
            "label_names": "<label_names>",
            "cost": "<product_cost>",
            "price": "<product_price>",
            "stock": "<product_stock>",
            "deleted": "<product_deleted>",
            "updated_user":"<product_updated_user>",
            "updated_at": "<product_updated_at>"
        }]
    }
}
```

Status Code與情境:

| Status Code | Status |  情境 |
|-------------|--------|-----|
| 200         | Success| 成功取得商品 |
| 401         | Failed | 使用者未授權 |
| 404         | Failed | 商品不存在|
| 500         | Failed | 伺服器錯誤 |


#### 2-2-2. Create Order API
API URI: `/sellController/sellProduct`
METHOD: POST

Request Body:
```json
{
    "headers":{
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body": { 
        "info": {
            "totalAmount": 1000.00,
            "totalDiscount": 100.00,
            "orderItems": [
                {
                    "productId": "P123456",
                    "quantity": 2,
                    "price": 500.00,
                    "discount": 50.00
                }
            ]
        } 
    }
}
```
Response Body:
```json
{
    "headers":{
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body": { 
        "info": {
            "orderId": "1234567890",
            "totalAmount": 1000.00,
            "totalDiscount": 100.00,
            "orderItems": [
                {
                    "productId": "P123456",
                    "quantity": 2,
                    "price": 500.00,
                    "discount": 50.00
                }
            ]
        } 
    }
}
```
Status Code與情境:
| Status | Message | 條件 |
|--------|---------|------|
| 200    | OK    | 請求成功 |
| 400    | Bad Request    | 請求參數錯誤 |
| 401    | Unauthorized  | Authorization失效或缺失 |

### 2-3. Business Logic
- 使用者可於`Header`切換至`商品販售`進行商品銷售的操作
- `商品資訊`: 包含商品ID, 商品名稱, 價格, 調整價格, 數量, 總價格
    - 商品ID, 商品名稱, 價格: 唯獨顯示，無法編輯
    - 調整價格: 可編輯，但預設為商品原價，如果因使用者新增相同商品ID時，會保留當下的調整價格，不會自動覆蓋成商品原價。
    - 數量: 可以編輯，預設唯一，如果使用者於輸入框中新增相同ID的商品，系統會自動根據當前數量+1，例如原本為5，新增後會變成6。
    - 總價格: 系統根據調整價格與數量計算，無法手動編輯。
    - 新增商品時，如果商品ID已存在，系統會自動合併數量，而不會新增重複的商品行；如果商品ID不存在，系統會新增一行新的商品資訊。
    - 使用者可以點擊`Delete` icon將該商品行刪除，並且重新計算總價格，商品會自動重新渲染成最新的商品列表。
- `金額資訊`:包含商品ID, 總價格, 調整價格, 結帳與清空按鈕。
    - 商品ID: 提供使用者使用keyboard輸入ID，也可以讓使用者讀取USB掃描器掃描商品ID，當符合13碼的商品ID時，系統會自動呼叫`Get Product API`取得商品資訊。
    - 總價格: 系統根據商品的調整價格與數量計算，無法手動編輯。
    - 調整價格: 使用者可手動修改，但如果調整後，又重新輸入商品ID，系統會重新計算，需注意總價格可能會變動。
    - 結帳按鈕: 點擊後，會跳出確認視窗，顯示`訂單金額為<調整後的總價格>，請確認是否要結帳`，
        - 當使用者點擊`確認`按鈕時，會送出`Create Order API`，如果訂單無誤，系統會自動清空`商品資訊`，並重置總價格；如果回傳非200，系統會顯示錯誤訊息，並保留`商品資訊`。
        - 當使用者點擊`取消`按鈕時，會關閉確認視窗，並保留`商品資訊`。
    - 清空按鈕: 點擊後會清空所有`商品資訊`，並重置總價格。