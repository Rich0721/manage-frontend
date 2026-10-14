# 03 - Product Page

## I. 需求簡介
使用者可以透過`ProductPage`查詢產品的相關資訊，並且可以透過此頁面進行商品的新增、編輯與刪除操作。


## II. 需求說明

### 2-1. 參考文件
Figma設計稿:
    - [產品頁面1](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=33-896&t=YcEAVbW5X59SRkSM-4)
    - [產品頁面2](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=18-2&t=YcEAVbW5X59SRkSM-4)
    - [新增商品](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=33-3929&t=YcEAVbW5X59SRkSM-4)
    - [編輯商品](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=38-3967&t=YcEAVbW5X59SRkSM-4)
    - [產品標籤](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=38-4054&t=YcEAVbW5X59SRkSM-4)
Flow Chart:
    - [新增商品流程](./flows/03-Product%20Page/01-Add%20Product.mmd)
    - [編輯商品流程](./flows/03-Product%20Page/02-Edit%20Product.mmd)
    - [刪除商品流程](./flows/03-Product%20Page/03-Delete%20Product.mmd)
Gherkin:
    - [Product Page基礎](./Scenarios/03-Product%20Page/01-Product%20Page.feature)
    - [新增產品](./Scenarios/03-Product%20Page/02-Add%20Product.feature)
    - [編輯產品](./Scenarios/03-Product%20Page/03-Edit%20Product.feature)
    - [刪除產品](./Scenarios/03-Product%20Page/04-Delete%20Product.feature)


### 2-2. API Format

#### 2-2-1. Add Product API
API URI: `productController/addProduct`
Method: POST
Request Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body": {
        "info": {
            "name": "<product_name>",
            "label_names": "<label_names>",
            "cost": "<product_cost>",
            "price": "<product_price>",
            "stock": "<product_stock>"
        }
    }
}
```

Response Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Product added successfully"
    },
    "body": {
        "info": {
            "id": "<product_id>",
            "name": "<product_name>",
            "label_names": "<label_names>",
            "cost": "<product_cost>",
            "price": "<product_price>",
            "stock": "<product_stock>",
            "deleted": "<product_deleted>",
            "updated_user":"<product_updated_user>",
            "updated_at": "<product_updated_at>"
        }
    }
}
```

Status Code與情境:

| Status Code | Status | 情境 |
|-------------|--------|-----|
| 200         | Success| 成功新增商品 |
| 401         | Failed |  使用者未授權 |
| 409 | Failed |商品產生ID衝突，請重新送出 |

#### 2-2-2. Get Product API
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
        "info": {
            "id": "<product_id>",
            "name": "<product_name>",
            "label_names": "<label_names>",
            "cost": "<product_cost>",
            "price": "<product_price>",
            "stock": "<product_stock>",
            "deleted": "<product_deleted>",
            "updated_user":"<product_updated_user>",
            "updated_at": "<product_updated_at>"
        }
    }
}
```

Status Code與情境:

| Status Code | Status |  情境 |
|-------------|--------|-----|
| 200         | Success| 成功取得商品 |
| 401         | Failed | 使用者未授權 |
| 404| Failed | 商品不存在|

#### 2-2-3. Update Product API
API URI: `productController/updateProduct`
Method: PUT

Request Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body": {
        "info": {
            "id": "<product_id>",
            "name": "<product_name>",
            "label_names": "<label_names>",
            "cost": "<product_cost>",
            "price": "<product_price>",
            "stock": "<product_stock>"
        }
    }
}
```

Response Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Product updated successfully"
    },
    "body": {
        "info": {
            "id": "<product_id>",
            "name": "<product_name>",
            "label_names": "<label_names>",
            "cost": "<product_cost>",
            "price": "<product_price>",
            "stock": "<product_stock>",
            "deleted": "<product_deleted>",
            "updated_user":"<product_updated_user>",
            "updated_at": "<product_updated_at>"
        }
    }
}
```
Status Code與情境:

| Status Code | Status |  情境 |
|-------------|--------|-----|
| 200         | Success| 成功更新商品 |
| 401         | Failed | 使用者未授權 |
| 404 | Failed | 商品不存在|

#### 2-2-4. Delete Product API
API URI: `productController/deleteProduct`
Method: DELETE
Request Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body": {
        "info": {
            "id": "<product_id>"
        }
    }
}
```

Response Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Product deleted successfully"
    },
    "body": {
        "info": {
            "id": "<product_id>",
            "deleted": "<product_deleted>",
            "updated_user":"<product_updated_user>",
            "updated_at": "<product_updated_at>"
        }
    }
}
```

Status Code與情境:

| Status Code | Status |  情境 |
|-------------|--------|-----|
| 200         | Success| 成功刪除商品 |
| 401         | Failed | 使用者未授權 |
| 404| Failed | 商品不存在|

#### 2-2-5. Upload Product File API
API URI: `productController/batchProducts`
METHOD: POST
Request Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body": {
        "info": {
            "file": "<file_path>"
        }
    }
}
```

Response Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Product file uploaded successfully"
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
            }
        ]
    }
}
```

Status Code與情境:

| Status Code | Status |  情境 |
|-------------|--------|-----|
| 200         | Success| 成功上傳商品檔案 |
| 400         | Failed | 檔案內容檢查缺失 |
| 401         | Failed | 使用者未授權 |
| 404         | Failed | 商品不存在 |



#### 2-2-6. Download Product File Template API
API URI: `productController/downloadTemplate`
METHOD: GET
Request Header:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    }
}
```

Response Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Product file template downloaded successfully"
    },
    "body": {
        "info": {
            "file": "<file_path>"
        }
    }
}
```

#### 2-2-7. Download Product File API
API URI: `productController/downloadProductData`
METHOD : POST
Request body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body": {
        "info": {
            "ids": "<product_id1>,<product_id2>,<product_id3>"
        }
    }
}
```

Response Body:

```json
{
    "headers": {
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Product data downloaded successfully"
    },
    "body": {
        "info": {
            "file": "<file_path>"
        }
    }
}
```

Status Code與情境:

| Status Code | Status |  情境 |
|-------------|--------|-----|
| 200         | Success| 成功下載商品檔案 |
| 401         | Failed | 使用者未授權 |

### 2-3. Business Logic

- 當使用者登入後會自動切換至`ProductPage`，根據Product的數量會顯示**產品頁面1**或**產品頁面2**，主要差異在Table的顯示方式。
    - **產品頁面1**: 當Product數量小於等於15筆時顯示。
    - **產品頁面2**: 當Product數量大於15筆時顯示。
    - 如果小於1頁時，*previous*和*next*按鈕使用Disabled狀態。
    - Prvious icon: `left-arrow.png`
    - Next icon: `right-arrow.png`
    - 如果當前頁面是第一頁，*previous*按鈕使用Disabled狀態。
    - 如果當前頁面是最後一頁，*next*按鈕使用Disabled狀態。
- Table Column Title只有*商品名稱*, *商品分類*可以進行Filter，其餘欄位不可進行Filter。
    - 商品名稱：根據使用者輸入文字進行**模糊搜尋**。
    - 商品分類：根據使用者輸入文字進行**模糊搜尋**，只要符合條件的分類都會顯示。
- 當使用者點擊**批次管理**時，會跳出可以上傳Excel檔案的選擇視窗，當使用者選擇檔案後，執行**Upload Product File API**，並刷新Table顯示最新的商品資料。
- 當使用者點擊**加入商品**時，會跳出浮動視窗(顯示方式參考`新增商品`)，提供給使用者新增單一商品的功能。
    - 商品編號: 空值且不可編輯
    - 商品名稱: 空值且可編輯，必填
    - 商品分類: 空值且可編輯，必填
        - 當使用者於該欄位點擊`Enter`時，顯示前端請參考`產品標籤`的顯示方式。
        - 最右邊有一個`x`按鈕，用於清除已輸入的分類。
        - 當使用者輸入該欄位時，根據使用者輸入文字即時篩選。
        - 如果使用者輸入未存在的分類，系統會自動新增該分類至後端，並在前端顯示，目前尚未實作自動新增功能，請先保留此行為。
    - 成本: 空值且可編輯，必填，最小值為1
    - 售價: 空值且可編輯，必填，最小值為1
    - 庫存: 預設為0且可編輯，最小值為0
    - 使用者點擊**確認**後，會執行**Add Product API**，並且關閉視窗重新整理Table。
    - 使用者點擊**取消**後，會關閉浮動視窗且不會執行任何API。
- 當使用者點擊Table內編輯列的`Pencil icon`時，會跳出浮動視窗(顯示方式參考`編輯商品`)，提供給使用者編輯該商品的功能，相關邏輯與新增商品類似，但開啟浮動式窗前，會先透過*Get Product API*取得該商品的詳細資訊後再顯示於該視窗。
    - 使用者點擊**確認**後，會執行**Edit Product API**，並且關閉視窗重新整理Table。
    - 使用者點擊**取消**後，會關閉浮動視窗且不會執行任何API。
- 當使用者點擊Table內刪除列的`Trash icon`時，會跳出確認視窗，提供給使用者刪除該商品的功能。
    - 使用者點擊**確認**後，會執行**Delete Product API**，並且關閉視窗重新整理Table。
    - 使用者點擊**取消**後，會關閉浮動視窗且不會執行任何API。
- 當使用者點擊**下載商品報表**時，會將目前於前端顯示的商品資料將`商品編號`組成String後，呼叫**Download Product File API**下載商品報表。
    - 如果使用者有進行過濾操作，下載的商品報表將只包含符合過濾條件的商品。
    - 如果使用者未進行過濾操作，下載的商品報表將包含所有商品。
- 當使用者點擊**下載批次新增商品模板**時，會呼叫**Download Product File Template API**下載批次新增商品的Excel模板。
