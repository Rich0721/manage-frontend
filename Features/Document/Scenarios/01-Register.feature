Feature: 使用者於前端註冊
  未登入的使用者填寫姓名、Email、密碼及確認密碼。
  前端依欄位規則更新註冊按鈕，於提交時再次驗證資料。
  註冊成功後顯示提示並導向登入頁；註冊失敗後顯示 Alert 並保留輸入。

  Background:
    Given 使用者尚未登入

  Rule: 進入註冊頁面時呈現初始狀態

    Scenario: 使用者首次進入註冊頁面
      When 使用者進入註冊頁面
      Then 註冊表單應包含以下四個欄位
        | 欄位 |
        | 姓名 |
        | Email |
        | 密碼 |
        | 確認密碼 |
      And 四個欄位的內容均應為空字串
      And 註冊按鈕應為 disabled 狀態
      And 前端不應發出註冊 API 請求

    Scenario: 註冊頁面顯示目前選取的頁籤
      When 使用者進入註冊頁面
      Then 「註冊」頁籤應顯示粗體與底線
      And 「登入」頁籤不應顯示粗體與底線

  Rule: 必填欄位及格式錯誤應於操作後移除 Focus 時提示

    Background:
      Given 使用者位於註冊頁面
      And 註冊表單已填入以下有效資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | user@example.com | ValidPass123 | ValidPass123 |

    Scenario Outline: 必填欄位被清空後顯示錯誤
      When 使用者清空「<欄位>」欄位
      And 使用者移除「<欄位>」欄位的 Focus
      Then 「<欄位>」欄位應顯示紅框
      And 「<欄位>」欄位應顯示必填錯誤訊息
      And 註冊按鈕應為 disabled 狀態
      And 前端不應發出註冊 API 請求

      Examples:
        | 欄位 |
        | 姓名 |
        | Email |
        | 密碼 |
        | 確認密碼 |

    Scenario Outline: 姓名長度不合法時顯示錯誤
      When 使用者將「姓名」欄位修改為 "<姓名>"
      And 使用者移除「姓名」欄位的 Focus
      Then 「姓名」欄位應顯示紅框
      And 「姓名」欄位應顯示長度須為 2 至 50 個字元的錯誤訊息
      And 註冊按鈕應為 disabled 狀態

      Examples:
        | 測試條件 | 姓名 |
        | 1 個字元 | a |
        | 51 個字元 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa |

    Scenario Outline: Email 格式不合法時顯示錯誤
      When 使用者將「Email」欄位修改為 "<Email>"
      And 使用者移除「Email」欄位的 Focus
      Then 「Email」欄位應顯示紅框
      And 「Email」欄位應顯示格式不合法的錯誤訊息
      And 註冊按鈕應為 disabled 狀態

      Examples:
        | Email |
        | invalid-email |
        | user@ |
        | @example.com |

    Scenario Outline: Email 長度超出允許範圍時禁止註冊
      When 使用者將「Email」欄位修改為 "<Email>"
      And 使用者移除「Email」欄位的 Focus
      Then 「Email」欄位應顯示紅框
      And 「Email」欄位應顯示格式或長度不合法的錯誤訊息
      And 註冊按鈕應為 disabled 狀態

      Examples:
        | 測試條件 | Email |
        | 14 個字元 | a@bcdefghijklm |
        | 251 個字元 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com |

    Scenario Outline: 密碼長度不合法時顯示錯誤
      When 使用者將「密碼」與「確認密碼」欄位均修改為 "<密碼>"
      And 使用者移除「密碼」欄位的 Focus
      Then 「密碼」欄位應顯示紅框
      And 「密碼」欄位應顯示長度須為 8 至 20 個字元的錯誤訊息
      And 註冊按鈕應為 disabled 狀態

      Examples:
        | 測試條件 | 密碼 |
        | 7 個字元 | Ab12345 |
        | 21 個字元 | Ab1111111111111111111 |

    Scenario Outline: 密碼缺少必要字元種類時顯示錯誤
      When 使用者將「密碼」與「確認密碼」欄位均修改為 "<密碼>"
      And 使用者移除「密碼」欄位的 Focus
      Then 「密碼」欄位應顯示紅框
      And 「密碼」欄位應顯示須包含大小寫字母及數字的錯誤訊息
      And 註冊按鈕應為 disabled 狀態

      Examples:
        | 測試條件 | 密碼 |
        | 缺少大寫字母 | validpass123 |
        | 缺少小寫字母 | VALIDPASS123 |
        | 缺少數字 | ValidPassword |

    Scenario: 確認密碼與密碼不一致時顯示錯誤
      When 使用者將「確認密碼」欄位修改為 "OtherPass123"
      And 使用者移除「確認密碼」欄位的 Focus
      Then 「確認密碼」欄位應顯示紅框
      And 「確認密碼」欄位應顯示密碼不一致並要求重新輸入的錯誤訊息
      And 註冊按鈕應為 disabled 狀態

  Rule: 註冊按鈕依所有欄位的有效性動態更新

    Background:
      Given 使用者位於註冊頁面

    Scenario Outline: 所有欄位有效時允許註冊
      When 使用者填入以下註冊資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | <姓名> | <Email> | <密碼> | <密碼> |
      Then 註冊按鈕應為 enabled 狀態
      And 前端不應發出註冊 API 請求

      Examples:
        | 測試條件 | 姓名 | Email | 密碼 |
        | 一般有效資料 | user123 | user@example.com | ValidPass123 |
        | 姓名下限 2 個字元 | ab | user@example.com | ValidPass123 |
        | 姓名上限 50 個字元 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | user@example.com | ValidPass123 |
        | Email 上限 250 個字元 | user123 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com | ValidPass123 |
        | 密碼下限 8 個字元 | user123 | user@example.com | Ab123456 |
        | 密碼上限 20 個字元 | user123 | user@example.com | Ab111111111111111111 |



    Scenario: 符合專案 Email 格式的 15 個字元 Email 可通過長度驗證
      Given 有一個符合專案 Email 格式且長度為 15 個字元的測試 Email
      When 使用者填入以下註冊資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | acx@example.com | ValidPass123 | ValidPass123 |
      Then 註冊按鈕應為 enabled 狀態

    Scenario: 有效表單的欄位改成不合法後立即停用註冊按鈕
      Given 註冊表單已填入以下有效資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | user@example.com | ValidPass123 | ValidPass123 |
      And 註冊按鈕為 enabled 狀態
      When 使用者將「Email」欄位修改為 "invalid-email"
      Then 註冊按鈕應為 disabled 狀態
      And 前端不應發出註冊 API 請求

    Scenario: 修正最後一個不合法欄位後啟用註冊按鈕
      Given 註冊表單已填入以下資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | invalid-email | ValidPass123 | ValidPass123 |
      And 註冊按鈕為 disabled 狀態
      When 使用者將「Email」欄位修改為 "user@example.com"
      Then 註冊按鈕應為 enabled 狀態

    Scenario: 修改密碼後確認密碼不再一致時停用註冊按鈕
      Given 註冊表單已填入以下有效資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | user@example.com | ValidPass123 | ValidPass123 |
      When 使用者將「密碼」欄位修改為 "OtherPass123"
      Then 註冊按鈕應為 disabled 狀態

    Scenario: 更新確認密碼使兩欄再次一致後啟用註冊按鈕
      Given 註冊表單已填入以下資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | user@example.com | OtherPass123 | ValidPass123 |
      When 使用者將「確認密碼」欄位修改為 "OtherPass123"
      Then 註冊按鈕應為 enabled 狀態

  Rule: 前端僅提交再次驗證通過的資料

    Background:
      Given 使用者位於註冊頁面

    Scenario Outline: 表單提交事件不能略過前端驗證
      # 測試透過表單提交事件驗證防線，不以點擊 disabled 按鈕觸發。
      Given 註冊表單已填入以下資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | <姓名> | <Email> | <密碼> | <確認密碼> |
      When 前端收到該表單的提交事件
      Then 前端應在傳送請求前判定表單驗證失敗
      And 前端不應發出註冊 API 請求
      And 使用者應仍位於註冊頁面

      Examples:
        | 測試條件 | 姓名 | Email | 密碼 | 確認密碼 |
        | 姓名未填寫 | | user@example.com | ValidPass123 | ValidPass123 |
        | Email 未填寫 | user123 | | ValidPass123 | ValidPass123 |
        | 密碼未填寫 | user123 | user@example.com | | ValidPass123 |
        | 確認密碼未填寫 | user123 | user@example.com | ValidPass123 | |
        | 姓名太短 | a | user@example.com | ValidPass123 | ValidPass123 |
        | 姓名太長 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | user@example.com | ValidPass123 | ValidPass123 |
        | Email 格式錯誤 | user123 | invalid-email | ValidPass123 | ValidPass123 |
        | Email 長度不足 | user123 | a@bc | ValidPass123 | ValidPass123 |
        | Email 太長 | user123 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com | ValidPass123 | ValidPass123 |
        | 密碼太短 | user123 | user@example.com | Ab12345 | Ab12345 |
        | 密碼太長 | user123 | user@example.com | Ab1111111111111111111 | Ab1111111111111111111 |
        | 密碼缺少大寫 | user123 | user@example.com | validpass123 | validpass123 |
        | 密碼缺少小寫 | user123 | user@example.com | VALIDPASS123 | VALIDPASS123 |
        | 密碼缺少數字 | user123 | user@example.com | ValidPassword | ValidPassword |
        | 確認密碼不一致 | user123 | user@example.com | ValidPass123 | OtherPass123 |


    Scenario: 有效資料通過驗證後以 SHA-256 處理密碼並提交
      Given 註冊表單已填入以下有效資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | user@example.com | ValidPass123 | ValidPass123 |
      And 註冊 API 的回應由測試環境控制
      When 使用者點擊註冊按鈕
      Then 前端應發出 POST 請求至 "/userController/register"
      And Request Body 的 header.Content-Type 應為 "application/json"
      And Request Body 的 body.info.email 應為 "user@example.com"
      And Request Body 的 body.info.username 應為 "user123"
      And Request Body 的 body.info.password 應為 "ValidPass123" 的 SHA-256 雜湊值
      And Request Body 的 body.info.confirmPassword 應為 "ValidPass123" 的 SHA-256 雜湊值
      And Request Body 的兩個密碼欄位不應包含原始密碼

  Rule: 前端依註冊 API 的回應顯示結果

    Background:
      Given 使用者位於註冊頁面
      And 註冊表單已填入以下有效資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | user@example.com | ValidPass123 | ValidPass123 |

    Scenario: API 回傳成功時提示並導向登入頁面
      Given 註冊 API 將回傳以下 JSON
        """json
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
        """
      When 使用者點擊註冊按鈕
      Then 使用者應看到註冊成功提示
      And 使用者應被導向登入頁面

    Scenario Outline: API 回傳失敗時以 Alert 顯示訊息並保留資料
      Given 註冊 API 將回傳 header.status 為 "failed"
      And 回應的 header.message 為 "<錯誤訊息>"
      When 使用者點擊註冊按鈕
      Then Alert 應顯示 "<錯誤訊息>"
      And 使用者應仍位於註冊頁面
      And 註冊表單應保留以下資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | user@example.com | ValidPass123 | ValidPass123 |

      # 以下是模擬 API 的失敗訊息，並非新增後端重複帳號規則。
      Examples:
        | 錯誤訊息 |
        | 此帳號已存在 |
        | 註冊失敗，請稍後再試 |

    Scenario: 註冊失敗後使用者可修改保留的資料並重新提交
      Given 前次註冊 API 已回傳 failed 並顯示錯誤 Alert
      And 前次提交的四個欄位內容均已保留
      And 使用者已關閉該錯誤 Alert
      And 本次註冊 API 將回傳 header.status 為 "success"
      When 使用者將「Email」欄位修改為 "newuser@example.com"
      And 使用者點擊註冊按鈕
      Then 本次註冊請求的 body.info.email 應為 "newuser@example.com"
      And 使用者應看到註冊成功提示
      And 使用者應被導向登入頁面

  Rule: 頁面切換時清除註冊頁面的資料與錯誤狀態

    Scenario: 切換至登入頁後清除資料與欄位錯誤
      Given 使用者位於註冊頁面
      And 註冊表單已填入以下資料
        | 姓名 | Email | 密碼 | 確認密碼 |
        | user123 | invalid-email | ValidPass123 | ValidPass123 |
      And 使用者已移除「Email」欄位的 Focus
      And 「Email」欄位已顯示錯誤訊息與紅框
      When 使用者切換至登入頁面
      And 使用者再返回註冊頁面
      Then 四個欄位的內容均應為空字串
      And 所有註冊欄位的錯誤訊息及紅框均應清除
      And 註冊按鈕應為 disabled 狀態

    Scenario: API 註冊失敗後切換頁面應清除失敗提示與輸入
      Given 使用者位於註冊頁面
      And 前次註冊 API 已回傳 failed 並顯示錯誤 Alert
      And 前次提交的四個欄位內容均已保留
      And 使用者已關閉該錯誤 Alert
      When 使用者切換至登入頁面
      And 使用者再返回註冊頁面
      Then 四個欄位的內容均應為空字串
      And 所有註冊錯誤訊息及紅框均應清除
      And 前次註冊失敗的 Alert 不應再次顯示
      And 註冊按鈕應為 disabled 狀態
