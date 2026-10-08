# 02-Login

## I. 需求簡介
當使用者透過 `Homepage`進行登入操作時，系統應驗證Email格式是否正確後，當使用者進行提交時，系統會傳送至後端進行驗證，如果驗證成功將會登入系統，並且切換至`ProductPage`;若驗證失敗，系統應提示錯誤訊息，並保留使用者輸入以便修改後重新提交。


## II. 需求說明

### 2-1. 參考文件
Figma設計稿:
    - [登入頁面](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=1-5&t=x3UsbawINDG8iYep-4)
    - [產品頁面](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=18-2&t=x3UsbawINDG8iYep-4)
Flow Chart:
    - [登入流程](./flows/02-LoginAndLogout/01-Login.mmd)
Gherkin:
    - [登入場景](./scenarios/02-LoginAndLogout/01-Login.feature)

### 2-2. API Format

#### 2-2-1. Login API
API URI: `userController/login`
Method: `POST`
Request Body:
```json
{
    "headers":{
        "Content-Type": "application/json"
    },
    "body": {
        "email": "<user_email>",
        "password": "<user_password>",
        "isForceLogin": "<is_force_login>"
    }
}
```

Response Body:
```json
{
    "headers":{
        "Content-Type": "application/json",
        "Status": "success",
        "Message": "Login successful",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body":{
        "info": {
            "userName": "<user_name>"
        }
    }
}

```

#### 2-2-2. Logout API
API URI: `userController/logout`
Method: `POST`
Request Body:
```json
{
    "headers": {
        "Content-Type": "application/json",
        "Uid": "<user_id>",
        "Authorization": "<auth_token>"
    },
    "body":{
        "info": {
            "userName": "<user_name>"
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
        "Message": "Logout successful"
    },
    "body": {
        "info": {
            "userName": "<user_name>"
        }
    }
}
```
#### 2-2-3. Get Products API
API URI: `/productController/getProducts?productId=all`
Method: `GET`
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
        "Message": "Products retrieved successfully"
    },
    "body": {
        "info": [
            {
                "id": "<product_id>",
                "name": "<product_name>",
                "label_names": "<label_names>",
                "cost": "<product_cost>",
                "price": "<product_price>",
                "deleted": "<product_deleted>",
                "updated_user": "<product_updated_user>",
                "updated_at": "<product_updated_at>"
            }
        ]
    }
}
```

### 2-3. Business Logic

#### 登入流程
1. 使用者輸入`Email`與`密碼`，相關輸入檢查規範與`01-Register.md`一致，請使用成共用模組進行驗證。
2. 使用者點擊`登入`按鈕後，系統會將密碼進行'SHA-256'加密，並將加密後的密碼與`Email`一併送至後端進行驗證。
3. 後端驗證情境:
    - 使用者未於其他裝置登入，系統會直接登入並返回授權資訊後，使用者直接切換至`ProductPage`。
    - 使用者於其他裝置登入，目前直接先強制重送一次登入請求，並且將`isForceLogin`設為`true`。若後端驗證成功，系統會返回授權資訊，使用者直接切換至`ProductPage`。
    - 若後端驗證失敗，系統會返回錯誤訊息，使用者需重新輸入`Email`與`密碼`進行登入。
4. Header中的`Authorization`與`Uid`需隨每次請求一併送出，以確保使用者身份驗證的有效性。
5. `ProductPage`會直接使用Header中的`Authorization`與`Uid`進行身份驗證，確保使用者的操作權限後，自動載入所有的產品資訊。

#### 登出流程
1. 使用者的`Authorization`與`Uid`存在時，`登出`按鈕才會顯示，否則不顯示給使用者。
2. 使用者點擊`登出`按鈕後，系統會將`Authorization`與`Uid`一併送至後端進行登出操作，無論驗證成功與否，都會將使用者導回`HomePage`登入頁面。

#### ProductPage
- Page Header `商品管理`: 粗體底線，且不可點擊
- Page Header `權限管理`: 可點擊，預計會導向`PermissionPage`，可先保留為占位，後續再根據需求進行實作。
- `ProductPage`:
    - 欄位名稱與內容對應:
        - `商品編號` - id
        - `商品名稱` - name
        - `商品分類` - label_names
        - `成本` - cost
        - `價格` - price
        - `編輯` - 會放入`pencil.png`和`delete.png`，用於編輯與刪除操作，可先實作前端顯示，但相關功能暫時不實作。
    - 根據產品數量動態生成表格行，若無產品則顯示提示訊息`目前無產品`。
    - 如果授權無效，則直接導回`HomePage`登入頁面。
