Feature: 使用者進入產品頁面

    Scenario: 使用者查看產品列表，且產品數量未超過15筆
        Given 使用者已登入
         When 使用者進入產品頁面
          And 產品Table顯示所有資料
         Then 顯示產品列表
          And Pages顯示為1/1
          And 上一頁按鈕為不可點擊
          And 下一頁按鈕為不可點擊
    
    Scenario: 使用者查看產品列表，且產品數量超過15筆
        Given 使用者已登入
         When 使用者進入產品頁面
          And 產品Table顯示前15筆資料
         Then 顯示產品列表
          And Pages顯示為1/N
          And 上一頁按鈕為不可點擊
          And 下一頁按鈕為可點擊
    
    Scenario: 使用者查看產品列表，且產品數量正好為15筆
        Given 使用者已登入
         When 使用者進入產品頁面
          And 產品Table顯示15筆資料
         Then 顯示產品列表
          And Pages顯示為1頁
          And 上一頁按鈕為不可點擊
          And 下一頁按鈕為不可點擊
    
    Scenario: 使用者查看產品列表，且產品數量為0
        Given 使用者已登入
         When 使用者進入產品頁面
          And 產品Table僅顯示表頭
         Then 顯示產品列表
          And Pages顯示為1/1
          And 上一頁按鈕為不可點擊
          And 下一頁按鈕為不可點擊
    
    Scenario: 使用者查看產品列表，且點擊下一頁
        Given 使用者已登入
          And 產品數量總共18筆
         When 使用者進入產品頁面
          And 產品Table顯示前15筆資料
          And Pages顯示為1/2
          And 上一頁按鈕為不可點擊
          And 下一頁按鈕為可點擊
          And 使用者點擊下一頁
         Then 產品Table顯示剩餘3筆資料
          And Pages顯示為2/2
          And 上一頁按鈕為可點擊
          And 下一頁按鈕為不可點擊
    
    Scenario: 使用者查看產品列表，且點擊上一頁
        Given 使用者已登入
          And 產品數量總共18筆
          And 使用者已在第二頁
         When 產品Table顯示剩餘3筆資料
          And Pages顯示為2/2
          And 上一頁按鈕為可點擊
          And 下一頁按鈕為不可點擊
          And 使用者點擊上一頁
         Then 產品Table顯示前15筆資料
          And Pages顯示為1/2
          And 上一頁按鈕為不可點擊
          And 下一頁按鈕為可點擊
    

