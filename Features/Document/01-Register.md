# 01-Register

## I. 需求簡介
此功能介面主要實作使用者註冊的流程，包括輸入帳號、密碼、確認密碼以及提交註冊請求。


## II. 需求說明

### 2-1. 參考文件
Figma設計稿: [使用者註冊](https://www.figma.com/design/RXG3NaxCrUXouqcYmp9TzC/Manage-frontend?node-id=1-84&t=cUjxfcozA0aCtvwi-4)
Flow Chart: [使用者註冊流程](./flows/01-Register.mmd)
Gherkin: [使用者註冊情境](./scenarios/01-Register.feature)

### 2-2. API Format
API URI: /userController/register
Method: POST
Request Body:
```json
{
    "header": {
        "Content-Type": "application/json"
    },
    "body": {
        "info":{
            "email": "user@example.com",
            "username": "user123",
            "password": "userpassword",
            "confirmPassword": "userpassword"
        }
    }
}
```
Response Body:
```json
{
    "header": {
        "Content-Type": "application/json",
        "status": "success",
        "message": "User registered successfully"
    },
    "body": {
        "info": {
            "uid": "user-unique-id",
            "email": "user@example.com",
            "username": "user123"
        }
    }
}
```


### 2-3. Business Logic

#### 註冊流程
1. 需確認使用者註冊頁面的相關資訊*姓名*、*Email*、*密碼*及*確認密碼*是否有正確填寫，若未正確填寫需提示使用者補充完整
    - *姓名*: 必填
        - 前後空白需自動去除
        - 長度限制為2-50個字元
    - *Email*: 必填
        - 長度限制為15-250個字元(包含@及域名部分)
        - 前後空白需自動去除
        - 需符合Email格式
    - *密碼*: 必填
        - 前後空白需自動去除
        - 需包含大小寫字母及數字
        - 長度限制為8-20個字元
    - *確認密碼*: 必填
        - 相關規則同*密碼*欄位
2. *密碼*與*確認密碼*需一致，若不一致需提示使用者重新輸入
3. *密碼*與*確認密碼*需經過`SHA-256`加密後，才可以提交註冊請求
4. 根據回傳的結果，進行下列處理:
    - status為"success"時，表示註冊成功，需提示使用者註冊成功並導向登入頁面
    - status為"failed"時，表示註冊失敗，需提示使用者錯誤訊息，並保留使用者已填寫的資訊以便修改
    - 如果與後端連線中斷，例如網路中斷或伺服器無回應，需提示使用者連線異常，並保留使用者已填寫的資訊以便重新提交
5. 如果使用者有任何錯誤、未填寫的情況，註冊的按鈕須保持`disabled`狀態，直到所有欄位均符合格式要求。

#### 頁面邏輯說明
1. 未符合格式的欄位，需在使用者操作後，移除Focus時以紅框提示錯誤，並顯示錯誤訊息
2. 當使用者註冊失敗時，跳出Alert提示錯誤訊息，並保留使用者已填寫的資訊以便修改
3. 當使用者輸入的*密碼*與*確認密碼*不一致時，需提示使用者重新輸入
4. 使用者進行頁面切換時，需移除所有填寫訊息、錯誤提示及紅框標記
5. 註冊按鈕的`disabled`狀態應根據欄位的格式驗證結果動態更新，確保使用者在所有欄位均符合格式要求前無法提交註冊請求，但傳送請求時仍需再次驗證所有欄位的格式，避免不正確的資料被提交。
