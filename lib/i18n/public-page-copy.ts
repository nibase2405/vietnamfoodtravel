import { defaultLocale, normalizeLocale, type SupportedLocale } from "@/lib/i18n/config";

type FeatureCopy = [string, string];

type MedicalCopy = {
  title: string;
  description: string;
  badge: string;
  heading: string;
  intro: string;
  view: string;
  update: string;
  imageAlt: string;
  features: FeatureCopy[];
  search: string;
  allCities: string;
  allCategories: string;
  allLanguages: string;
  emergencyAny: string;
  emergency: string;
  filter: string;
  listTitle: string;
  note: string;
};

type ServicesCopy = {
  title: string;
  description: string;
  badge: string;
  heading: string;
  intro: string;
  view: string;
  contact: string;
  features: FeatureCopy[];
  listTitle: string;
  listDescription: string;
};

type AttractionsCopy = {
  title: string;
  description: string;
  badge: string;
  heading: string;
  intro: string;
  explore: string;
  foodMap: string;
  imageAlt: string;
  features: FeatureCopy[];
};

type SimpleFeaturePageCopy = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  features: FeatureCopy[];
};

type MerchantCopy = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  claim: string;
  ads: string;
  features: FeatureCopy[];
  claimFlow: string;
  claimSteps: string[];
  adTypes: string;
  adPlans: FeatureCopy[];
};

export type PublicPageCopy = {
  medical: MedicalCopy;
  services: ServicesCopy;
  attractions: AttractionsCopy;
  aiFood: SimpleFeaturePageCopy;
  aiTrip: SimpleFeaturePageCopy;
  menuTranslator: SimpleFeaturePageCopy;
  merchant: MerchantCopy;
};

const zhTw: PublicPageCopy = {
  medical: {
    title: "越南醫療診所資訊",
    description: "查詢越南主要城市的醫療診所、科別、語言、電話、地圖與旅客常用醫療資訊。",
    badge: "越南醫療診所",
    heading: "查詢旅途中可能需要的診所資訊",
    intro: "瀏覽城市、科別、語言、電話、營業時間與地圖位置，讓旅客能快速找到越南在地醫療資源。",
    view: "查看診所",
    update: "協助更新資訊",
    imageAlt: "醫療診所接待櫃台",
    features: [
      ["診所資訊", "依城市、科別、語言與急診協助快速篩選。"],
      ["旅客語言", "標示英文、越文、繁中、簡中、韓文與日文服務資訊。"],
      ["地圖定位", "可查看診所位置，出發前再向診所確認看診資訊。"]
    ],
    search: "搜尋診所、服務或關鍵字",
    allCities: "全部城市",
    allCategories: "全部科別",
    allLanguages: "全部語言",
    emergencyAny: "不限急診協助",
    emergency: "急診協助",
    filter: "篩選",
    listTitle: "醫療診所列表",
    note: "資訊僅供旅客查詢，實際看診、費用與急症處理請以診所或醫院官方資訊為準。"
  },
  services: {
    title: "越南旅遊與美食服務",
    description: "預約越南機場接送、簽證文件協助、在地美食導覽、上網卡與自由行支援服務。",
    badge: "VietFood Map 服務",
    heading: "把越南自由行需要的服務放在同一個地方",
    intro: "從機場接送、簽證文件、上網卡到在地美食導覽，讓旅客在找餐廳之外，也能直接安排越南旅程需要的服務。",
    view: "查看服務",
    contact: "聯絡我們",
    features: [
      ["旅遊服務整合", "把交通、文件、通訊與導覽集中管理。"],
      ["後台可管理", "管理員可新增服務、設定價格與上架狀態。"],
      ["導入諮詢", "服務 CTA 可連到聯絡頁或客製需求表單。"]
    ],
    listTitle: "服務列表",
    listDescription: "精選越南自由行與美食探索常用服務。"
  },
  attractions: {
    title: "越南景點介紹與周邊美食",
    description: "越南景點介紹、城市分類、地圖位置，並依距離推薦景點附近餐廳與美食路線。",
    badge: "越南景點介紹",
    heading: "用景點串起附近美食路線",
    intro: "探索越南市場、夜生活、海灘與文化景點，查看地圖位置，並直接看到景點附近有哪些餐廳與距離。",
    explore: "探索景點",
    foodMap: "查看美食地圖",
    imageAlt: "越南城市景點與美食街景",
    features: [
      ["景點介紹", "市場、夜生活、海灘與文化景點都能快速比較。"],
      ["附近美食", "用距離挑選景點旁的餐廳，安排更順路的用餐節奏。"],
      ["地圖導覽", "景點與餐廳同圖呈現，方便接續導航與行程收藏。"]
    ]
  },
  aiFood: {
    title: "AI 美食推薦",
    description: "依位置、預算、飲食偏好、評分、營業時間與收藏紀錄推薦越南餐廳。",
    heading: "AI 美食推薦助手",
    intro: "輸入城市、預算、口味、用餐情境與飲食限制，AI 會從餐廳資料、價格、評論摘要與地圖位置中推薦 3 到 5 間實用選擇。",
    features: [
      ["口味與預算", "支援河粉、咖啡、海鮮、火鍋與不同價格帶。"],
      ["多語內容", "可延伸繁中、簡中、英文、越文、韓文與日文回覆。"],
      ["地圖距離", "結合目前位置、移動時間與營業狀態。"],
      ["個人化", "可依收藏、評論、偏好與行程紀錄調整推薦。"]
    ]
  },
  aiTrip: {
    title: "AI 美食行程規劃",
    description: "輸入城市、天數、預算與飲食偏好，AI 產生越南美食行程、路線與預估花費。",
    heading: "AI 美食行程規劃",
    intro: "輸入城市、日期、預算、交通方式與料理偏好，AI 會安排早餐、午餐、下午茶、晚餐與宵夜，並產生可收藏的路線。",
    features: [
      ["智慧推薦", "依餐廳評分、價格、評論摘要與飲食偏好排序。"],
      ["順路安排", "把餐廳串成每日路線，減少繞路與移動時間。"],
      ["預算估算", "依平均消費估算每日餐費與總預算。"]
    ]
  },
  menuTranslator: {
    title: "AI 菜單翻譯",
    description: "上傳越南菜單照片，AI 協助翻譯菜名、食材、辣度、牛豬海鮮與過敏原資訊。",
    heading: "AI 菜單翻譯",
    intro: "拍下越南菜單，快速翻成繁中、簡中、英文、韓文與日文，並標示主要食材、辣度、過敏原與可能口味。",
    features: [
      ["OCR 辨識", "從菜單照片擷取菜名與價格。"],
      ["食材提醒", "標示牛、豬、海鮮、花生與辣度。"],
      ["人工校正", "後台可審核 AI 翻譯並補完缺漏資料。"]
    ]
  },
  merchant: {
    title: "餐廳認領與廣告合作",
    description: "餐廳老闆可認領店家、更新菜單價格、回覆評論、查看流量並購買地圖與搜尋廣告。",
    heading: "餐廳認領、菜單管理與廣告曝光",
    intro: "讓餐廳老闆管理店家資訊、價格、照片、優惠、評論回覆與多語系介紹，並透過地圖置頂、搜尋廣告與 AI Sponsored 推薦獲取曝光。",
    claim: "認領餐廳",
    ads: "購買廣告",
    features: [
      ["地圖曝光", "餐廳 marker、城市頁、分類頁與搜尋結果。"],
      ["菜單上傳", "照片、菜品、價格、推薦菜與多語翻譯。"],
      ["AI 商家工具", "餐廳介紹、廣告文案、評論回覆與 SEO 描述。"],
      ["流量數據", "瀏覽、導航、電話、收藏、廣告曝光與點擊。"]
    ],
    claimFlow: "餐廳認領流程",
    claimSteps: ["填寫商家資料", "上傳營業證明與店面照片", "驗證電話、Email 或 Zalo", "管理員審核", "開通商家後台"],
    adTypes: "廣告類型",
    adPlans: [
      ["首頁 Banner", "在首頁曝光城市推薦與限時優惠。"],
      ["地圖置頂", "在地圖搜尋結果與 marker 列表優先顯示。"],
      ["AI 贊助推薦", "在 AI 推薦結果中清楚標示 Sponsored。"],
      ["分類置頂", "在火鍋、咖啡、海鮮等分類頁固定曝光。"],
      ["搜尋關鍵字", "購買 District 1、pho、coffee、seafood 等關鍵字。"]
    ]
  }
};

const zhCn: PublicPageCopy = {
  medical: {
    ...zhTw.medical,
    title: "越南医疗诊所信息",
    description: "查询越南主要城市的医疗诊所、科别、语言、电话、地图与旅客常用医疗信息。",
    badge: "越南医疗诊所",
    heading: "查询旅途中可能需要的诊所信息",
    intro: "浏览城市、科别、语言、电话、营业时间与地图位置，让旅客能快速找到越南在地医疗资源。",
    update: "协助更新信息",
    search: "搜索诊所、服务或关键词",
    allCities: "全部城市",
    allCategories: "全部科别",
    allLanguages: "全部语言",
    emergencyAny: "不限急诊协助",
    emergency: "急诊协助",
    filter: "筛选",
    listTitle: "医疗诊所列表",
    note: "信息仅供旅客查询，实际看诊、费用与急症处理请以诊所或医院官方信息为准。"
  },
  services: {
    ...zhTw.services,
    title: "越南旅游与美食服务",
    description: "预约越南机场接送、签证文件协助、在地美食导览、上网卡与自由行支持服务。",
    heading: "把越南自由行需要的服务放在同一个地方",
    intro: "从机场接送、签证文件、上网卡到在地美食导览，让旅客在找餐厅之外，也能直接安排越南旅程需要的服务。",
    view: "查看服务",
    contact: "联系我们",
    listTitle: "服务列表",
    listDescription: "精选越南自由行与美食探索常用服务。"
  },
  attractions: {
    ...zhTw.attractions,
    title: "越南景点介绍与周边美食",
    description: "越南景点介绍、城市分类、地图位置，并依距离推荐景点附近餐厅与美食路线。",
    badge: "越南景点介绍",
    heading: "用景点串起附近美食路线",
    intro: "探索越南市场、夜生活、海滩与文化景点，查看地图位置，并直接看到景点附近有哪些餐厅与距离。",
    explore: "探索景点",
    foodMap: "查看美食地图"
  },
  aiFood: {
    ...zhTw.aiFood,
    title: "AI 美食推荐",
    description: "依位置、预算、饮食偏好、评分、营业时间与收藏记录推荐越南餐厅。",
    heading: "AI 美食推荐助手",
    intro: "输入城市、预算、口味、用餐情境与饮食限制，AI 会从餐厅资料、价格、评论摘要与地图位置中推荐 3 到 5 间实用选择。"
  },
  aiTrip: {
    ...zhTw.aiTrip,
    title: "AI 美食行程规划",
    description: "输入城市、天数、预算与饮食偏好，AI 生成越南美食行程、路线与预估花费。",
    heading: "AI 美食行程规划",
    intro: "输入城市、日期、预算、交通方式与料理偏好，AI 会安排早餐、午餐、下午茶、晚餐与宵夜，并生成可收藏的路线。"
  },
  menuTranslator: {
    ...zhTw.menuTranslator,
    title: "AI 菜单翻译",
    description: "上传越南菜单照片，AI 协助翻译菜名、食材、辣度、牛猪海鲜与过敏原信息。",
    heading: "AI 菜单翻译",
    intro: "拍下越南菜单，快速翻成繁中、简中、英文、韩文与日文，并标示主要食材、辣度、过敏原与可能口味。"
  },
  merchant: {
    ...zhTw.merchant,
    title: "餐厅认领与广告合作",
    description: "餐厅老板可认领店家、更新菜单价格、回复评论、查看流量并购买地图与搜索广告。",
    heading: "餐厅认领、菜单管理与广告曝光",
    intro: "让餐厅老板管理店家信息、价格、照片、优惠、评论回复与多语言介绍，并通过地图置顶、搜索广告与 AI Sponsored 推荐获取曝光。",
    claim: "认领餐厅",
    ads: "购买广告",
    claimFlow: "餐厅认领流程",
    adTypes: "广告类型"
  }
};

const en: PublicPageCopy = {
  medical: {
    title: "Vietnam Medical Clinics",
    description: "Find medical clinics in major Vietnam cities with specialties, languages, phone numbers, maps, and traveler-friendly notes.",
    badge: "Vietnam Medical Clinics",
    heading: "Find clinic information you may need while traveling",
    intro: "Browse cities, specialties, languages, phone numbers, opening hours, and map locations so travelers can quickly find medical resources in Vietnam.",
    view: "View clinics",
    update: "Help update info",
    imageAlt: "Medical clinic reception area",
    features: [
      ["Clinic details", "Filter by city, specialty, language, and emergency support."],
      ["Traveler languages", "Shows English, Vietnamese, Traditional Chinese, Simplified Chinese, Korean, and Japanese support."],
      ["Map locations", "Check clinic locations and confirm details with the clinic before visiting."]
    ],
    search: "Search clinics, services, or keywords",
    allCities: "All cities",
    allCategories: "All specialties",
    allLanguages: "All languages",
    emergencyAny: "Any emergency support",
    emergency: "Emergency support",
    filter: "Filter",
    listTitle: "Medical Clinic List",
    note: "Information is for traveler reference only. Confirm appointments, prices, and urgent care details with the clinic or hospital."
  },
  services: {
    title: "Vietnam Travel and Food Services",
    description: "Book airport transfers, visa document help, local food tours, SIM cards, and independent travel support in Vietnam.",
    badge: "VietFood Map Services",
    heading: "Keep the services you need for Vietnam travel in one place",
    intro: "From airport transfers, visa documents, and SIM cards to local food tours, travelers can arrange trip services beyond restaurants.",
    view: "View services",
    contact: "Contact us",
    features: [
      ["Integrated travel services", "Manage transport, documents, connectivity, and guides in one place."],
      ["Admin managed", "Admins can add services, prices, and publishing status."],
      ["Lead capture", "Service CTAs can link to contact or custom request forms."]
    ],
    listTitle: "Service List",
    listDescription: "Selected services commonly used for independent Vietnam travel and food discovery."
  },
  attractions: {
    title: "Vietnam Attractions and Nearby Food",
    description: "Explore Vietnam attractions by city, map location, and nearby restaurant distance.",
    badge: "Vietnam Attractions",
    heading: "Connect attractions with nearby food routes",
    intro: "Explore markets, nightlife, beaches, and cultural spots in Vietnam, then see nearby restaurants and distances on the same map.",
    explore: "Explore attractions",
    foodMap: "View food map",
    imageAlt: "Vietnam city attractions and food streets",
    features: [
      ["Attraction guides", "Compare markets, nightlife, beaches, and cultural spots."],
      ["Nearby food", "Choose restaurants near attractions and plan smoother meal timing."],
      ["Map navigation", "Show attractions and restaurants together for routes and saved trips."]
    ]
  },
  aiFood: {
    title: "AI Restaurant Recommendations",
    description: "Recommend Vietnam restaurants by location, budget, diet, rating, opening hours, and saved places.",
    heading: "AI Restaurant Recommendation Assistant",
    intro: "Enter city, budget, taste, dining scenario, and dietary restrictions. AI recommends 3 to 5 practical options from restaurant data, prices, review summaries, and map locations.",
    features: [
      ["Taste and budget", "Pho, coffee, seafood, hot pot, and budget ranges."],
      ["Multilingual content", "Traditional Chinese, Simplified Chinese, English, Vietnamese, Korean, and Japanese can be expanded."],
      ["Map distance", "Combines current location, travel time, and opening status."],
      ["Personalization", "Can use saved places, reviews, preferences, and trips."]
    ]
  },
  aiTrip: {
    title: "AI Food Trip Planner",
    description: "Enter city, days, budget, and food preferences. AI creates Vietnam food routes and estimated costs.",
    heading: "AI Food Trip Planner",
    intro: "Enter city, dates, budget, transport, and cuisine preferences. AI schedules breakfast, lunch, tea, dinner, late-night food, and creates a saveable route.",
    features: [
      ["Smart picks", "Sorts by restaurant ratings, prices, review summaries, and dietary preferences."],
      ["Route planning", "Links restaurants into a practical daily route with less detour."],
      ["Budget estimate", "Estimates daily meal costs and total budget by average spend."]
    ]
  },
  menuTranslator: {
    title: "AI Menu Translation",
    description: "Upload Vietnamese menu photos and translate dish names, ingredients, spice level, beef, pork, seafood, and allergens.",
    heading: "AI Menu Translation",
    intro: "Take a photo of a Vietnamese menu and translate it into Traditional Chinese, Simplified Chinese, English, Korean, and Japanese with ingredient and allergen notes.",
    features: [
      ["OCR detection", "Extract dish names and prices from menu photos."],
      ["Ingredient checks", "Mark beef, pork, seafood, peanuts, and spice level."],
      ["Human review", "Admins can review AI translations and complete missing data."]
    ]
  },
  merchant: {
    title: "Restaurant Claims and Advertising",
    description: "Restaurant owners can claim listings, update menus and prices, reply to reviews, view traffic, and buy map/search ads.",
    heading: "Restaurant claims, menu management, and ad exposure",
    intro: "Let restaurant owners manage listing details, prices, photos, promotions, review replies, and multilingual descriptions while gaining exposure through map placement, search ads, and AI Sponsored recommendations.",
    claim: "Claim restaurant",
    ads: "Buy ads",
    features: [
      ["Map exposure", "Restaurant markers, city pages, category pages, and search results."],
      ["Menu upload", "Photos, dishes, prices, recommended items, and multilingual translation."],
      ["AI merchant tools", "Restaurant descriptions, ad copy, review replies, and SEO descriptions."],
      ["Traffic analytics", "Views, directions, calls, saves, ad impressions, and clicks."]
    ],
    claimFlow: "Restaurant Claim Flow",
    claimSteps: ["Fill business details", "Upload business proof and storefront photos", "Verify phone, email, or Zalo", "Admin review", "Open merchant dashboard"],
    adTypes: "Ad Types",
    adPlans: [
      ["Homepage Banner", "Expose city recommendations and limited-time offers on the homepage."],
      ["Map Placement", "Prioritize display in map search results and marker lists."],
      ["AI Sponsored Pick", "Show a Sponsored label in AI recommendation results."],
      ["Category Placement", "Fixed exposure on hot pot, cafe, seafood, and other category pages."],
      ["Search Keywords", "Buy keywords such as District 1, pho, coffee, and seafood."]
    ]
  }
};

const vi: PublicPageCopy = {
  ...en,
  medical: {
    ...en.medical,
    title: "Phòng khám y tế tại Việt Nam",
    description: "Tìm phòng khám tại các thành phố lớn ở Việt Nam theo chuyên khoa, ngôn ngữ, điện thoại, bản đồ và ghi chú cho du khách.",
    badge: "Phòng khám Việt Nam",
    heading: "Tìm thông tin phòng khám khi đi du lịch",
    intro: "Xem thành phố, chuyên khoa, ngôn ngữ, số điện thoại, giờ mở cửa và vị trí bản đồ để nhanh chóng tìm nguồn hỗ trợ y tế tại Việt Nam.",
    view: "Xem phòng khám",
    update: "Cập nhật thông tin",
    search: "Tìm phòng khám, dịch vụ hoặc từ khóa",
    allCities: "Tất cả thành phố",
    allCategories: "Tất cả chuyên khoa",
    allLanguages: "Tất cả ngôn ngữ",
    emergencyAny: "Bất kỳ hỗ trợ khẩn cấp",
    emergency: "Hỗ trợ khẩn cấp",
    filter: "Lọc",
    listTitle: "Danh sách phòng khám"
  },
  services: {
    ...en.services,
    title: "Dịch vụ du lịch và ẩm thực Việt Nam",
    badge: "Dịch vụ VietFood Map",
    heading: "Đặt các dịch vụ cần cho chuyến đi Việt Nam ở một nơi",
    view: "Xem dịch vụ",
    contact: "Liên hệ"
  },
  attractions: {
    ...en.attractions,
    title: "Điểm tham quan Việt Nam và món ngon gần đó",
    badge: "Điểm tham quan Việt Nam",
    heading: "Kết nối điểm tham quan với tuyến ẩm thực gần đó",
    explore: "Khám phá điểm tham quan",
    foodMap: "Xem bản đồ ẩm thực"
  },
  aiFood: { ...en.aiFood, title: "AI gợi ý nhà hàng", heading: "Trợ lý AI gợi ý nhà hàng" },
  aiTrip: { ...en.aiTrip, title: "AI lập lịch trình ẩm thực", heading: "AI lập lịch trình ẩm thực" },
  menuTranslator: { ...en.menuTranslator, title: "AI dịch thực đơn", heading: "AI dịch thực đơn" },
  merchant: { ...en.merchant, title: "Nhận quyền nhà hàng và quảng cáo", claim: "Nhận quyền nhà hàng", ads: "Mua quảng cáo" }
};

const ko: PublicPageCopy = {
  ...en,
  medical: {
    ...en.medical,
    title: "베트남 의료 클리닉",
    description: "베트남 주요 도시의 클리닉, 진료과, 지원 언어, 전화번호, 지도와 여행자 참고 정보를 확인하세요.",
    badge: "베트남 의료 클리닉",
    heading: "여행 중 필요한 클리닉 정보를 찾기",
    intro: "도시, 진료과, 언어, 전화번호, 영업시간과 지도 위치를 확인해 베트남 현지 의료 정보를 빠르게 찾을 수 있습니다.",
    view: "클리닉 보기",
    update: "정보 업데이트",
    search: "클리닉, 서비스 또는 키워드 검색",
    allCities: "모든 도시",
    allCategories: "모든 진료과",
    allLanguages: "모든 언어",
    emergencyAny: "응급 지원 전체",
    emergency: "응급 지원",
    filter: "필터",
    listTitle: "의료 클리닉 목록"
  },
  services: {
    ...en.services,
    title: "베트남 여행 및 미식 서비스",
    badge: "VietFood Map 서비스",
    heading: "베트남 여행에 필요한 서비스를 한곳에서",
    view: "서비스 보기",
    contact: "문의하기"
  },
  attractions: {
    ...en.attractions,
    title: "베트남 관광지와 주변 맛집",
    badge: "베트남 관광지",
    heading: "관광지와 주변 맛집 루트를 연결하세요",
    explore: "관광지 둘러보기",
    foodMap: "맛집 지도 보기"
  },
  aiFood: { ...en.aiFood, title: "AI 맛집 추천", heading: "AI 맛집 추천 도우미" },
  aiTrip: { ...en.aiTrip, title: "AI 미식 일정 플래너", heading: "AI 미식 일정 플래너" },
  menuTranslator: { ...en.menuTranslator, title: "AI 메뉴 번역", heading: "AI 메뉴 번역" },
  merchant: { ...en.merchant, title: "식당 등록 인증 및 광고", heading: "식당 인증, 메뉴 관리와 광고 노출", claim: "식당 인증", ads: "광고 구매" }
};

const ja: PublicPageCopy = {
  ...en,
  medical: {
    ...en.medical,
    title: "ベトナム医療クリニック",
    description: "ベトナム主要都市のクリニック、診療科、対応言語、電話番号、地図、旅行者向け情報を確認できます。",
    badge: "ベトナム医療クリニック",
    heading: "旅行中に必要なクリニック情報を探す",
    intro: "都市、診療科、言語、電話番号、営業時間、地図位置を確認し、ベトナム現地の医療情報をすばやく探せます。",
    view: "クリニックを見る",
    update: "情報を更新",
    search: "クリニック、サービス、キーワードを検索",
    allCities: "すべての都市",
    allCategories: "すべての診療科",
    allLanguages: "すべての言語",
    emergencyAny: "救急対応すべて",
    emergency: "救急対応",
    filter: "絞り込み",
    listTitle: "医療クリニック一覧"
  },
  services: {
    ...en.services,
    title: "ベトナム旅行・グルメサービス",
    badge: "VietFood Map サービス",
    heading: "ベトナム旅行に必要なサービスを一か所で",
    view: "サービスを見る",
    contact: "問い合わせ"
  },
  attractions: {
    ...en.attractions,
    title: "ベトナム観光スポットと周辺グルメ",
    badge: "ベトナム観光スポット",
    heading: "観光スポットから周辺グルメルートへ",
    explore: "観光スポットを見る",
    foodMap: "グルメ地図を見る"
  },
  aiFood: { ...en.aiFood, title: "AI レストラン推薦", heading: "AI レストラン推薦アシスタント" },
  aiTrip: { ...en.aiTrip, title: "AI グルメ旅程プランナー", heading: "AI グルメ旅程プランナー" },
  menuTranslator: { ...en.menuTranslator, title: "AI メニュー翻訳", heading: "AI メニュー翻訳" },
  merchant: { ...en.merchant, title: "レストラン認証と広告", heading: "レストラン認証、メニュー管理、広告露出", claim: "レストラン認証", ads: "広告を購入" }
};

export const publicPageCopy: Record<SupportedLocale, PublicPageCopy> = {
  "zh-tw": zhTw,
  "zh-cn": zhCn,
  en,
  vi,
  ko,
  ja
};

export function getPublicPageCopy(locale: string | null | undefined): PublicPageCopy {
  return publicPageCopy[normalizeLocale(locale)] ?? publicPageCopy[defaultLocale];
}
