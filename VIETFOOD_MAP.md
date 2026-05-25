# VietFood Map 越南美食地圖

## 產品定位

VietFood Map 是一個結合真實地圖、餐廳資訊、價格、評論、收藏、AI 推薦、行程規劃、商家認領與廣告變現的多語系越南美食探索平台。

核心定位：

- 越南自由行美食地圖
- AI 美食推薦與行程規劃工具
- 餐廳商家曝光與認領平台
- 管理員可維護餐廳、景點、服務、醫療診所與多語系內容

## 目標使用者

- 外國旅客：台灣、香港、日本、韓國、歐美旅客。
- 越南外派與長住外國人：找餐廳、價格、評論與語言菜單。
- 越南本地消費者：探索餐廳、優惠與排行榜。
- 餐廳老闆：認領店家、上傳菜單、回覆評論、購買廣告。
- 平台管理員：審核餐廳、評論、廣告、景點、服務與多語系資料。

## 前台頁面

- `/`：首頁
- `/food-map`：美食地圖
- `/restaurants/[slug]`：餐廳資訊頁
- `/ai-food-assistant`：AI 美食推薦
- `/ai-trip-planner`：AI 美食行程規劃
- `/menu-translator`：AI 菜單翻譯
- `/services`：旅遊與美食服務
- `/attractions`：景點介紹與附近美食
- `/medical-clinics`：醫療診所資訊
- `/merchant`：餐廳認領與廣告合作

## 後台頁面

- `/admin`：管理員總覽
- `/admin/restaurants`：餐廳管理、Google 商家匯入、菜單上傳
- `/admin/attractions`：景點管理
- `/admin/services`：服務管理
- `/admin/medical-clinics`：醫療資訊管理
- `/admin/reviews`：評論管理
- `/admin/ads`：廣告管理
- `/admin/translations`：多語系管理
- `/admin/settings`：網站設定

## 多語系規則

目前支援語系：

- `zh-tw`：繁體中文
- `zh-cn`：簡體中文
- `en`：英文
- `vi`：越南文
- `ko`：韓文
- `ja`：日文

語系路由範例：

- `/zh-tw/food-map`
- `/zh-cn/food-map`
- `/en/food-map`
- `/vi/food-map`
- `/ko/food-map`
- `/ja/food-map`

語言切換行為：

- 點擊語言時會切換到同一頁的對應語系路徑。
- 會寫入 `vietfood_locale` cookie。
- 會重新載入頁面，確保 Server Component 依照新語系重新渲染。
- 沒有語系前綴的公開頁面會依 cookie 或瀏覽器語言導向對應語系。

## 核心功能

### 美食地圖

- 地圖、列表、列表加地圖三種模式。
- 餐廳卡片可進入餐廳資訊頁。
- 支援價格、評分、營業狀態、料理類型、語言菜單、米其林餐廳等篩選。
- 支援快速篩選，管理員可在後台設定。

### 餐廳資訊頁

- 餐廳照片、地址、電話、營業時間、價格、評分。
- 菜單照片與菜品資料由管理員後台上傳。
- Google Maps 導航連結。
- AI 評論摘要與加入行程功能。

### AI 功能

- AI 附近餐廳推薦。
- AI 美食行程規劃。
- AI 菜單翻譯。
- AI 評論摘要。
- AI 商家廣告文案與餐廳介紹生成。

### 商家與廣告

- 餐廳認領申請。
- 商家後台管理資料、菜單、照片與評論回覆。
- 廣告類型包含首頁 Banner、地圖置頂、分類頁置頂、搜尋關鍵字與 AI Sponsored 推薦。

### 景點與服務

- 景點頁可顯示景點介紹與附近餐廳距離。
- 服務頁可新增機場接送、簽證文件、上網卡、美食導覽等服務。
- 後台可新增與管理景點、服務與醫療診所資料。

## MVP 建議

第一階段：

- 首頁
- 美食地圖
- 餐廳列表與餐廳詳細頁
- 管理員餐廳管理
- 菜單上傳
- 基本多語系
- AI 美食推薦、菜單翻譯、評論摘要

第二階段：

- 餐廳認領
- 商家後台
- 廣告購買與報表
- 優惠券
- AI 廣告文案

第三階段：

- AI 行程規劃
- 路線優化
- 城市攻略
- 排行榜
- 社群分享
- 多城市擴張

## 第三階段功能規格

### AI 行程規劃

目標：讓使用者輸入城市、天數、預算、同行人數、飲食偏好與移動方式後，自動產生可收藏、可編輯、可分享的越南美食行程。

核心功能：

- 產生每日早餐、午餐、下午茶、晚餐與宵夜建議。
- 依預算、評分、營業時間、語言菜單、距離與飲食限制推薦餐廳。
- 可替換單一餐廳，不需要重新產生整份行程。
- 可把 AI 行程儲存到會員的「我的行程」。
- 可從餐廳頁、景點頁、美食地圖直接加入 AI 行程。

需要資料：

- 餐廳經緯度、營業時間、平均消費、料理類型、評分、評論摘要。
- 使用者偏好：語言、預算、不吃辣、素食、不吃牛、不吃豬、不吃海鮮等。
- 景點經緯度與城市區域資料。

驗收標準：

- 使用者可在 30 秒內產生一份 1 到 3 天行程。
- 每個時段都能顯示餐廳、推薦理由、預估價格與距離。
- 行程可儲存、編輯、刪除與分享。

### 路線優化

目標：把行程中的餐廳與景點依地理位置排序，減少繞路與移動時間。

核心功能：

- 依目前行程自動排序路線。
- 顯示每一站之間的距離與預估移動時間。
- 支援步行、Grab / 計程車、機車、公車等交通方式欄位。
- 一鍵開啟 Google Maps 導航。
- 若某餐廳未營業，提示替代餐廳。

後台需求：

- 管理員可設定城市中心點、熱門區域與交通提示。
- 管理員可標記不適合排入行程的餐廳或景點。

驗收標準：

- 行程頁可顯示完整地圖路線。
- 使用者調整餐廳順序後，距離與時間會重新計算。

### 城市攻略

目標：建立可 SEO 的城市美食內容頁，吸引「城市 + 美食 / 餐廳推薦 / 咖啡廳 / 海鮮」搜尋流量。

核心頁面：

- 胡志明市美食攻略
- 河內美食攻略
- 峴港海鮮攻略
- 會安古城美食攻略
- 芽莊海鮮與咖啡廳攻略
- 富國島度假美食攻略

頁面內容：

- 城市介紹
- 熱門區域
- 必吃料理
- 推薦餐廳
- 價格區間
- 地圖探索
- 一日 / 三日美食路線
- 常見問題

後台需求：

- 管理員可新增城市攻略文章。
- 城市攻略可綁定餐廳、景點、服務與排行榜。
- 支援多語系 SEO title、description 與 hreflang。

### 排行榜

目標：建立動態榜單，提高探索效率與 SEO 長尾流量。

排行榜類型：

- 本週熱門餐廳
- 米其林 / 必比登餐廳
- 台灣人常收藏餐廳
- 韓國人常收藏餐廳
- 日本旅客推薦餐廳
- 在地人預訂最多
- 瀏覽最多
- 預訂最多
- CP 值最高
- 適合約會
- 適合家庭
- 適合商務聚餐

排序依據：

- 瀏覽數
- 收藏數
- 預訂數
- 評分
- 評論數
- 導航點擊
- 電話點擊
- 近期熱度
- 國籍 / 語系族群行為

後台需求：

- 管理員可手動置頂或排除餐廳。
- 可設定排行榜城市、分類、語系與更新週期。
- Sponsored 餐廳必須清楚標示。

### 社群分享

目標：讓使用者可以分享餐廳、收藏清單、景點附近美食與 AI 行程，提升自然流量。

分享內容：

- 餐廳資訊頁
- 美食地圖搜尋結果
- 收藏清單
- AI 美食行程
- 景點附近餐廳
- 城市攻略
- 排行榜

分享渠道：

- LINE
- Facebook
- Messenger
- WhatsApp
- Zalo
- 複製連結

功能需求：

- 每個分享頁都要有 Open Graph 圖片與標題。
- 分享行程時可設定公開、私人、連結可見。
- 分享頁需保留語系，例如 `/zh-tw/trips/[id]` 與 `/en/trips/[id]`。

### 多城市擴張

目標：把平台從單一城市擴張到越南主要旅遊城市，形成全越南美食與旅遊資料庫。

優先城市：

- 胡志明市
- 河內
- 峴港
- 會安
- 芽莊
- 大叻
- 富國島
- 順化
- 芹苴

每個城市需要資料：

- 城市中心點
- 區域 / 商圈
- 熱門景點
- 餐廳資料
- 特色料理
- 價格區間
- 旅遊服務
- 醫療診所
- 城市攻略文章

後台需求：

- 管理員可新增城市、區域與商圈。
- 餐廳、景點、服務、醫療診所都需綁定城市。
- 城市頁自動聚合餐廳、景點、服務、攻略與排行榜。

階段驗收：

- 每個城市至少有 50 間餐廳。
- 每個城市至少有 10 個景點。
- 每個城市至少有 1 篇城市攻略。
- 每個城市至少支援繁中、英文與越文內容。

## 第三階段已實作 MVP

本次已完成可操作版本：

- AI 行程規劃：支援城市、天數、預算、人數、交通方式、飲食偏好與必要條件，並加入餐廳、景點與服務推薦。
- 路線優化：新增 `lib/geo/route-optimization.ts`，用餐廳座標做 nearest-neighbor 排序，並回傳距離與預估移動時間。
- 城市攻略：新增 `/city-guides` 與 `/city-guides/[slug]`，支援胡志明市、河內、峴港、會安、芽莊、大叻、富國島、順化、芹苴。
- 排行榜：新增 `/rankings`，包含預訂最多、在地人預訂最多、瀏覽最多、米其林餐廳、CP 值最高與聚餐情境推薦。
- 排行榜：新增「不同料理餐廳排行榜」，並依餐廳 `cuisine_type` 自動產生越南料理、河粉、海鮮、咖啡廳等菜系榜單。
- 排行榜頁已改成列表式榜單，每個榜單以排名列呈現餐廳名稱、菜系、城市、評分、評論、瀏覽、預訂與餐廳頁連結。
- 排行榜頁改為每個區塊同時呈現 3 個排行榜，桌機三欄、手機單欄，每個榜單顯示前 5 名餐廳。
- 社群分享：新增 `SocialShare` 元件，支援原生分享、LINE、Facebook、WhatsApp、Zalo 與複製連結。
- 多城市擴張：新增 `lib/city-guides.ts` 與 `lib/city-guide-records.ts`，集中管理城市中心點、熱門區域、必吃主題、SEO 關鍵字、多語系內容與擴張狀態。
- MENU：前台導覽列已新增城市攻略與排行榜入口。
- 後台城市攻略管理：`/admin/city-guides` 已改成資料庫 CRUD 表單，可新增、更新、刪除城市攻略與多語系內容。
- 後台排行榜管理：`/admin/rankings` 已改成資料庫 CRUD 表單，可新增、編輯、移除前台要顯示的排行榜類型，並設定城市、分類、語系、排序、狀態與 Sponsored 顯示規則。
- Open Graph：城市攻略詳細頁新增動態 OG 圖片 `/city-guides/[slug]/og`，並在頁面 metadata 中套用。

## 2026-05-20 開發更新

### 新增資料表

新增 migration：

- `supabase/migrations/002_city_guides_rankings.sql`
- `supabase/migrations/003_ranking_configs_ranking_key.sql`

- `city_guides`：城市攻略主資料，包含城市、slug、區域、座標、封面、主題、區域、建議路線、SEO 關鍵字、狀態、精選與排序。
- `city_guide_translations`：城市攻略多語系內容，包含語系、標題、摘要、SEO title、SEO description 與 JSON 內容。
- `ranking_configs`：排行榜設定，`id` 是設定主鍵，`ranking_key` 指向榜單類型，並包含標題、說明、城市、分類、語系、Sponsored 規則、狀態、排序與規則 JSON。
- 已啟用 RLS：公開只能讀取已發布資料，寫入需 admin / super_admin。

### 新增 API

#### `/api/city-guides`

用途：讀取與新增城市攻略資料。

- `GET`：回傳資料庫城市攻略；沒有 Supabase 或資料為空時使用內建城市 fallback。
- `POST`：新增或 upsert 城市攻略與目前語系翻譯，需要 admin / super_admin。

#### `/api/city-guides/[slug]`

用途：單筆城市攻略 CRUD。

- `GET`：讀取單筆城市攻略。
- `PATCH`：更新城市攻略與翻譯。
- `DELETE`：刪除城市攻略。

#### `/api/ranking-configs`

用途：讀取與新增排行榜設定。

- `GET`：回傳資料庫排行榜設定。
- `POST`：新增或 upsert 排行榜設定。

#### `/api/ranking-configs/[id]`

用途：單筆排行榜設定 CRUD。

- `GET`：讀取單筆設定。
- `PATCH`：更新設定。
- `DELETE`：刪除設定。

### 後台頁面

#### `/admin/city-guides`

功能：

- 新增 / 更新 / 刪除城市攻略。
- 編輯城市、slug、目的地 slug、區域、座標、封面圖片、必吃主題、熱門區域、建議路線與 SEO 關鍵字。
- 設定 published / draft / archived、精選與排序。
- 編輯繁中、簡中、英文、越文、韓文、日文的標題、摘要、SEO title、SEO description、內文與語系化清單。

#### `/admin/rankings`

功能：

- 新增 / 更新 / 刪除前台要顯示的排行榜類型。
- 可從系統自動產生的榜單來源選擇 `ranking_key`，例如預訂最多、在地人預訂最多、瀏覽最多、米其林餐廳、不同料理與各菜系榜單。
- 設定排行榜類型 ID、名稱、說明、城市、分類、語系、狀態與排序。
- Sponsored 規則支援 `include`、`only`、`exclude`。
- 狀態支援 `published`、`draft`、`archived`；只有 published 會顯示在前台。
- 前台會依目前語系、城市與分類套用對應設定，後台儲存或刪除後會重新驗證排行榜頁快取。

### 前台讀取規則

城市攻略：

- `/city-guides`
- `/city-guides/[slug]`

讀取順序：

1. 伺服器讀取 `city_guides` 與 `city_guide_translations`。
2. 依目前語系選擇對應翻譯；缺少時 fallback 到繁中、英文，再 fallback 到內建資料。
3. 若資料表尚未建立或沒有資料，使用程式內建城市資料。

排行榜：

- `/rankings`

讀取順序：

1. 伺服器讀取 `ranking_configs`。
2. 依目前語系、城市、分類與 Sponsored 規則篩選。
3. 若有對應語系 / 城市 / 分類的設定，只顯示 published 類型；draft / archived 會被隱藏。
4. 若完全沒有對應設定，使用程式內建排行榜規則作為 fallback。

### AI 行程規劃更新

- `/api/ai-trip-plans/generate` 現在會輸出餐廳、景點與推薦服務。
- 每日行程會插入一個景點停留，前台可連到景點頁並加入行程清單。
- 行程結果新增 `suggested_services`，可顯示機場接送、簽證協助、在地美食導覽、eSIM 等服務。
- 地圖點位支援餐廳與景點兩種 marker。

### 目前驗證結果

已通過：

- TypeScript `tsc --noEmit`
- `/api/city-guides`
- `/api/ranking-configs`
- `/zh-tw/city-guides/ho-chi-minh`
- `/zh-tw/rankings`
- `/admin/city-guides`
- `/admin/rankings`
- `/city-guides/ho-chi-minh/og`
- `/api/ai-trip-plans/generate`

## 2026-05-20 KOL 推薦專區

### 前台功能

- 新增 `/kol-recommendations` KOL 推薦專區，並加入網站 Menu。
- 新增 `/kol-recommendations/[slug]` 單一 KOL 詳細頁，可呈現 KOL 個人推薦地圖、社群資料、推薦美食與景點清單。
- KOL 專區新增城市、主題、美食 / 景點下拉篩選，左側 KOL 清單、地圖 marker 與去過地點清單會同步更新。
- KOL 專區可呈現 KOL 基本資料、社群連結、擅長主題、粉絲數與推薦介紹。
- KOL 去過的地方支援餐廳、景點與自訂地點，可在同一張地圖顯示 KOL 美食與景點 marker。
- KOL 去過的餐廳可連到餐廳資訊頁，景點可連到景點資訊頁，自訂地點可保留 KOL 內容連結。
- 支援 `/kol-recommendations?kol=annie-eats-saigon` 這類分享連結，直接聚焦指定 KOL。

### 後台功能

- 新增 `/admin/kols` KOL 推薦管理，並加入管理員側欄。
- 後台可新增、更新、刪除 KOL 基本資料：名稱、slug、handle、城市、語言、主題標籤、粉絲數、頭像、封面、介紹、社群連結、狀態、排序、精選。
- 後台可設定 KOL 去過的地方：類型、餐廳 slug、景點 slug、標題、城市、介紹、地址、經緯度、評分、排序、到訪日期、照片、KOL 內容 URL、狀態。

### 資料庫與 API

- 新增 migration：`supabase/migrations/004_kol_recommendations.sql`
- 新增資料表：
  - `kols`
  - `kol_visits`
- 新增 API：
  - `GET /api/kols`
  - `POST /api/kols`
  - `GET /api/kols/[slug]`
  - `PATCH /api/kols/[slug]`
  - `DELETE /api/kols/[slug]`
- Public 只讀取 published KOL 與 published visit；寫入與刪除需要 admin / super_admin。

### SEO

- `/kol-recommendations` 已加入 sitemap。
- sitemap 會為每個 published KOL 產生 `/kol-recommendations/[slug]` 詳細頁入口。

## 2026-05-21 排行榜類型後台管理

- `/admin/rankings` 已改為「排行榜類型管理」，管理員可在同一頁新增、編輯與移除前台顯示的排行榜類型。
- 後台可選擇榜單來源 `ranking_key`，支援系統內建榜單與依 `cuisine_type` 自動產生的不同料理榜單。
- 每個排行榜類型可設定標題、說明、城市、分類、語系、排序、狀態與 Sponsored 顯示規則。
- 儲存後會寫入 `ranking_configs`；移除已儲存類型會刪除資料庫設定，未儲存草稿只會從畫面移除。
- 前台 `/rankings` 會依 `ranking_configs` 顯示 published 類型；若同語系 / 城市 / 分類有設定但全部為 draft 或 archived，前台不會 fallback 顯示被隱藏的榜單。
- `/api/ranking-configs` 與 `/api/ranking-configs/[id]` 在新增、更新、刪除後會重新驗證排行榜頁，讓前台更快反映後台設定。
- 已驗證 `/admin/rankings`、`/zh-tw/rankings`、`/api/ranking-configs` 與 TypeScript `tsc --noEmit`。

## 2026-05-21 速度優化

- 公開頁不再於 `proxy.ts` 每次請求都呼叫 Supabase `auth.getUser()`；只有 `/admin`、會員、商家與導遊後台等受保護路徑才進行登入檢查。
- 城市攻略資料加入 5 分鐘伺服端快取，減少重複查詢 `city_guides` 與 `city_guide_translations`。
- `getCityGuides()` 加入記憶體快取，避免每次頁面渲染都重新計算城市、餐廳、景點、服務與醫療資料關聯。
- `/city-guides` 與 `/city-guides/[slug]` 加入 `revalidate = 300`。
- 城市攻略詳細頁地圖改成 `DeferredMapView`，地圖套件延遲到接近可視區再載入。
- 城市攻略列表改成 Server Component，降低前台 hydration JavaScript。
