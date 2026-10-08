Feature: 使用者於前端進行登入
  
  Scenario: 使用者成功登入
    Given 使用者在登入頁面
     And 使用者未於其他裝置登入
     When 使用者於登入表單輸入以下有效資料
      | email    | password |
      | user@example.com | password123 |
     And 使用者點擊登入按鈕
     And 前端進行密碼加密後，將以下資料送至後端
     | email    | password | isForceLogin |
     | user@example.com | <hashed_password> | false |
    Then 使用者登入成功
     And 使用者被導向ProductPage
     And 商品資訊自動載入
    
    Given 使用者在登入頁面
     And 使用者於其他裝置已登入
     When 使用者於登入表單輸入以下有效資料
      | email    | password |
      | user@example.com | password123 |
     And 使用者點擊登入按鈕
     And 前端進行密碼加密後，將以下資料送至後端
     | email    | password | isForceLogin |
     | user@example.com | <hashed_password> | false |
    Then 系統自動重新發送登入請求
     | email    | password | isForceLogin |
     | user@example.com | <hashed_password> | true |
    Then 使用者登入成功
     And 使用者被導向ProductPage
     And 商品資訊自動載入

Scenario: 使用者登入失敗
    Given 使用者在登入頁面
     When 使用者於登入表單輸入以下無效資料
      | email    | password |
      | user@example.com | wrongpassword |
     And 使用者點擊登入按鈕
     And 前端進行密碼加密後，將以下資料送至後端
     | email    | password | isForceLogin |
     | user@example.com | <hashed_password> | false |
    Then 使用者登入失敗
     And 系統提示錯誤訊息