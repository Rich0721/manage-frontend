# 02-Login

## I. 需求簡介
當使用者透過 `Homepage`進行登入操作時，系統應驗證Email格式是否正確後，當使用者進行提交時，系統會傳送至後端進行驗證，如果驗證成功將會登入系統，並且切換至`ProductPage`;若驗證失敗，系統應提示錯誤訊息，並保留使用者輸入以便修改後重新提交。


## II. 需求說明

### 2-1. 參考文件
Figma設計稿:
    - [登入頁面](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=1-5&t=x3UsbawINDG8iYep-4)
    - [產品頁面](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=18-2&t=wdrWxOlTeJeVuUv6-4)
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

| 情境 | 後續行為 | Status Code | Status | Message |
|-------------|--------|---------|--------|---------|
| 使用者未於其他裝置登入 | 直接登入並返回授權資訊，使用者切換至`ProductPage` | 200         | Success| Login successful |
| 使用者輸入錯誤的`Email`或`密碼` | 使用Alert提示錯誤訊息，並要求使用者重新輸入，並保留原本輸入的資訊 | 401         | Failed  | User login failed |
| 使用者於其他裝置登入 | 強制重送一次登入請求，並將`isForceLogin`設為`true`，若後端驗證成功，使用者切換至`ProductPage` | 409         | Failed  | User login failed because already logged in on another device |

4. Headers中的`Authorization`與`Uid`需隨每次請求一併送出，以確保使用者身份驗證的有效性。
5. `ProductPage`會直接使用Headers中的`Authorization`與`Uid`進行身份驗證，確保使用者的操作權限後，自動載入所有的產品資訊。
6. 使用Session保存登入狀態，因後端有限制登入時間，所以如果授權資訊過期，因將頁面導向`HomePage`登入頁面，並提示使用者重新登入，Session存在後參考下列情境處理：

| 情境 | 後續行為 |
|-------------|--------|
| Session存在，重新整理頁面後，Uid與Authorization仍有效 | 導向`ProductPage`，將Session的資訊放入`Authorization`與`Uid`中，由後端回傳結果進行下一步行為 |
| Session存在，重新整理頁面後，Uid與Authorization已過期 | 導向`HomePage`登入頁面，移除Session中的資訊 |
| Session不存在 | 導向`HomePage`登入頁面，無需保留任何Session資訊 |


#### 登出流程
1. 使用者的`Authorization`與`Uid`存在時，`登出`按鈕才會顯示，否則不顯示給使用者。
2. 使用者點擊`登出`按鈕後，系統會將`Authorization`與`Uid`一併送至後端進行登出操作，無論驗證成功與否，都會將使用者導回`HomePage`登入頁面。

#### ProductPage
- Page Header `商品管理`: 粗體底線，且不可點擊
- Page Header `權限管理`: 可點擊，預計會導向`PermissionPage`，可先保留為占位，後續再根據需求進行實作。
- `ProductPage`:
    - 欄位名稱與內容對應:
        - `商品編號` - id(String)
        - `商品名稱` - name(String)
        - `商品分類` - label_names(String)
        - `成本` - cost(Number)
        - `價格` - price(Number)
        - `編輯` - 會放入`pencil.png`和`delete.png`，用於編輯與刪除操作，可先實作前端顯示，但相關功能暫時不實作。
    - 根據產品數量動態生成表格行，若無產品則顯示提示訊息`目前無產品`。

#### 共用說明
- 除了使用`userController/login`和`userController/register`之外，所有的API都需要包含`Authorization`與`Uid`於Headers中，以確保使用者身份驗證的有效性。

| Status Code | Status | Message | 情境 |
| --  | -- | -- | -- |
| 401 | Failed  | Unauthorized | 後端比對`Uid`與`Authorization`失敗 |
| 403 | Failed  | Forbidden | 後端比對`Uid`與`Authorization`成功，但使用者無操作權限 |
| 409 | Failed  | Conflict | 資源衝突，例如使用者已在其他裝置登入 |
| 422 | Failed  | Unprocessable Entity | 請求格式錯誤或缺少必要參數  |