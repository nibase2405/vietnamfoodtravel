insert into public.destinations (city, slug, region, latitude, longitude, cover_image_url, status, sort_order) values
('Ho Chi Minh City','ho-chi-minh','south',10.7769,106.7009,'https://images.unsplash.com/photo-1583417319070-4a69db38a482','published',1),
('Hanoi','hanoi','north',21.0278,105.8342,'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a','published',2),
('Da Nang','da-nang','central',16.0544,108.2022,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b','published',3),
('Hoi An','hoi-an','central',15.8801,108.3380,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b','published',4),
('Phu Quoc','phu-quoc','south',10.2899,103.9840,'https://images.unsplash.com/photo-1528127269322-539801943592','published',5),
('Sapa','sapa','north',22.3364,103.8438,'https://images.unsplash.com/photo-1528127269322-539801943592','published',6),
('Da Lat','da-lat','central',11.9404,108.4583,'https://images.unsplash.com/photo-1528127269322-539801943592','published',7)
on conflict (slug) do nothing;

insert into public.tours (destination_id, title, slug, tour_type, theme, duration_days, duration_nights, min_people, max_people, base_price, cover_image_url, status, is_featured)
select id,'胡志明 3 天 2 夜半自助旅行','ho-chi-minh-3d2n-semi-self-guided','semi_self_guided',array['城市','美食','文化'],3,2,2,8,399,'https://images.unsplash.com/photo-1583417319070-4a69db38a482','published',true from public.destinations where slug='ho-chi-minh'
union all select id,'河內下龍灣 4 天 3 夜','hanoi-halong-bay-4d3n','private',array['自然','文化','高端'],4,3,2,6,699,'https://images.unsplash.com/photo-1528127269322-539801943592','published',true from public.destinations where slug='hanoi'
union all select id,'峴港會安 4 天 3 夜','da-nang-hoi-an-4d3n','semi_self_guided',array['海灘','古城','親子'],4,3,2,10,599,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b','published',true from public.destinations where slug='da-nang'
union all select id,'富國島親子度假 3 天 2 夜','phu-quoc-family-3d2n','private',array['親子','海島','度假'],3,2,2,8,499,'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee','published',false from public.destinations where slug='phu-quoc'
union all select id,'沙壩攝影旅行 3 天 2 夜','sapa-photo-3d2n','group',array['攝影','山城','健行'],3,2,2,12,459,'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee','published',false from public.destinations where slug='sapa'
union all select id,'越南美食私人旅行','vietnam-private-food-tour','private',array['美食','市場','在地體驗'],5,4,2,6,899,'https://images.unsplash.com/photo-1559847844-5315695dadae','published',true from public.destinations where slug='ho-chi-minh'
on conflict (slug) do nothing;

insert into public.restaurants (destination_id, name, slug, cuisine_type, price_range, address, latitude, longitude, rating_avg, review_count, cover_image_url, status, is_featured)
select id,'Bep Me In','bep-me-in',array['越南菜','家庭料理'],'medium','136 Le Thanh Ton, District 1',10.7739,106.6992,4.7,220,'https://images.unsplash.com/photo-1559847844-5315695dadae','published',true from public.destinations where slug='ho-chi-minh'
union all select id,'Pizza 4P''s Ben Thanh','pizza-4ps-ben-thanh',array['義式','越式融合'],'high','8 Thu Khoa Huan',10.7756,106.6975,4.8,510,'https://images.unsplash.com/photo-1513104890138-7c749659a591','published',true from public.destinations where slug='ho-chi-minh'
union all select id,'Pho Thin Hanoi','pho-thin-hanoi',array['河粉'],'low','13 Lo Duc',21.0188,105.8560,4.5,860,'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43','published',true from public.destinations where slug='hanoi'
union all select id,'Bun Cha Huong Lien','bun-cha-huong-lien',array['烤肉米線'],'low','24 Le Van Huu',21.0186,105.8545,4.4,940,'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12','published',false from public.destinations where slug='hanoi'
union all select id,'Madame Lan','madame-lan-da-nang',array['越南菜'],'medium','4 Bach Dang',16.0750,108.2231,4.6,430,'https://images.unsplash.com/photo-1559847844-5315695dadae','published',true from public.destinations where slug='da-nang'
union all select id,'La Maison 1888','la-maison-1888',array['法式','Fine Dining'],'luxury','InterContinental Danang',16.1233,108.3066,4.9,180,'https://images.unsplash.com/photo-1414235077428-338989a2e8c0','published',false from public.destinations where slug='da-nang'
union all select id,'Secret Garden','secret-garden-saigon',array['越南菜'],'medium','158 Pasteur',10.7779,106.7002,4.5,610,'https://images.unsplash.com/photo-1559847844-5315695dadae','published',false from public.destinations where slug='ho-chi-minh'
union all select id,'Quan An Ngon Hanoi','quan-an-ngon-hanoi',array['街頭小吃','越南菜'],'medium','18 Phan Boi Chau',21.0242,105.8412,4.4,700,'https://images.unsplash.com/photo-1559847844-5315695dadae','published',false from public.destinations where slug='hanoi'
union all select id,'Nen Danang','nen-danang',array['新越南菜'],'high','16 My Da Tay 2',16.0374,108.2413,4.7,190,'https://images.unsplash.com/photo-1414235077428-338989a2e8c0','published',false from public.destinations where slug='da-nang'
union all select id,'Com Tam Ba Ghien','com-tam-ba-ghien',array['碎米飯'],'low','84 Dang Van Ngu',10.7933,106.6766,4.3,520,'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12','published',false from public.destinations where slug='ho-chi-minh'
on conflict (slug) do nothing;

insert into public.attractions (destination_id, name, slug, category, address, latitude, longitude, price_info, cover_image_url, rating_avg, status)
select id,'中央郵局','saigon-central-post-office',array['歷史','建築'],'2 Cong Xa Paris',10.7798,106.6990,'免費','https://images.unsplash.com/photo-1583417319070-4a69db38a482',4.6,'published' from public.destinations where slug='ho-chi-minh'
union all select id,'戰爭遺跡博物館','war-remnants-museum',array['博物館','歷史'],'28 Vo Van Tan',10.7795,106.6920,'約 40,000 VND','https://images.unsplash.com/photo-1583417319070-4a69db38a482',4.5,'published' from public.destinations where slug='ho-chi-minh'
union all select id,'還劍湖','hoan-kiem-lake',array['湖泊','散步'],'Hoan Kiem',21.0287,105.8520,'免費','https://images.unsplash.com/photo-1509030450996-dd1a26dda07a',4.7,'published' from public.destinations where slug='hanoi'
union all select id,'文廟','temple-of-literature',array['歷史','文化'],'58 Quoc Tu Giam',21.0280,105.8358,'約 30,000 VND','https://images.unsplash.com/photo-1509030450996-dd1a26dda07a',4.6,'published' from public.destinations where slug='hanoi'
union all select id,'巴拿山','ba-na-hills',array['主題樂園','山景'],'Hoa Vang',15.9956,107.9968,'依季節票價','https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',4.4,'published' from public.destinations where slug='da-nang'
union all select id,'美溪海灘','my-khe-beach',array['海灘'],'Vo Nguyen Giap',16.0618,108.2460,'免費','https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',4.7,'published' from public.destinations where slug='da-nang'
union all select id,'會安古城','hoi-an-ancient-town',array['古城','文化'],'Hoi An Ancient Town',15.8801,108.3380,'古城套票','https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',4.8,'published' from public.destinations where slug='hoi-an'
union all select id,'富國島星星海灘','sao-beach',array['海灘','親子'],'An Thoi',10.0550,104.0340,'免費','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',4.5,'published' from public.destinations where slug='phu-quoc'
union all select id,'番西邦峰','fansipan',array['山景','纜車'],'Sapa',22.3033,103.7750,'纜車票價','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',4.6,'published' from public.destinations where slug='sapa'
union all select id,'大叻夜市','da-lat-night-market',array['夜市','美食'],'Nguyen Thi Minh Khai',11.9404,108.4383,'免費','https://images.unsplash.com/photo-1528127269322-539801943592',4.4,'published' from public.destinations where slug='da-lat'
on conflict (slug) do nothing;

insert into public.guides (display_name, bio, languages, service_cities, specialties, hourly_rate, daily_rate, rating_avg, review_count, status) values
('Annie Nguyen','胡志明在地中文導遊，熟悉咖啡、歷史與市場路線。',array['zh-TW','en','vi'],array['Ho Chi Minh City'],array['美食','歷史','攝影'],25,160,4.9,38,'approved'),
('Minh Tran','河內與下龍灣路線規劃專家。',array['zh-TW','en','vi'],array['Hanoi','Ha Long'],array['文化','自然'],22,145,4.8,31,'approved'),
('Linh Pham','峴港會安親子與古城半自助導覽。',array['zh-TW','en','vi'],array['Da Nang','Hoi An'],array['親子','古城'],24,155,4.7,27,'approved'),
('Hana Vo','富國島度假、海島與餐廳預約支援。',array['zh-TW','en','vi'],array['Phu Quoc'],array['海島','親子'],26,170,4.9,19,'approved'),
('Kai Le','沙壩攝影與健行導遊。',array['zh-TW','en','vi'],array['Sapa'],array['攝影','健行'],28,180,4.8,22,'approved');

insert into public.blog_posts (title, slug, category, tags, cover_image_url, excerpt, content, status, published_at, seo_title, seo_description) values
('越南自由行新手攻略','vietnam-first-time-guide','越南自由行',array['自由行','新手','交通'],'https://images.unsplash.com/photo-1528127269322-539801943592','第一次到越南前需要知道的城市、交通與預算。','{"blocks":[{"type":"paragraph","text":"越南自由行適合用半自助方式升級體驗。"}]}','published',now(),'越南自由行新手攻略','第一次越南自由行的完整規劃指南。'),
('胡志明旅遊攻略','ho-chi-minh-travel-guide','胡志明旅遊攻略',array['胡志明','美食'],'https://images.unsplash.com/photo-1583417319070-4a69db38a482','胡志明市區三天兩夜玩法。','{"blocks":[]}','published',now(),'胡志明旅遊攻略','胡志明自由行景點、美食與行程安排。'),
('河內旅遊攻略','hanoi-travel-guide','河內旅遊攻略',array['河內','下龍灣'],'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a','河內老城區與下龍灣安排。','{"blocks":[]}','published',now(),'河內旅遊攻略','河內自由行與下龍灣行程建議。'),
('峴港自由行','da-nang-travel-guide','峴港自由行',array['峴港','會安'],'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b','峴港會安四天三夜懶人包。','{"blocks":[]}','published',now(),'峴港自由行','峴港會安自由行攻略。'),
('越南美食地圖怎麼吃','vietnam-food-map-guide','越南美食',array['美食','餐廳'],'https://images.unsplash.com/photo-1559847844-5315695dadae','從河粉、法國麵包到 Fine Dining。','{"blocks":[]}','published',now(),'越南美食地圖','越南餐廳與在地小吃推薦。'),
('越南中文導遊怎麼選','vietnam-chinese-guide','越南中文導遊',array['導遊','包車'],'https://images.unsplash.com/photo-1528127269322-539801943592','中文導遊服務、價格與預約注意事項。','{"blocks":[]}','published',now(),'越南中文導遊','越南中文導遊與地陪預約指南。')
on conflict (slug) do nothing;

insert into public.reviews (entity_type, entity_id, rating, title, content, status)
select 'tour', id, 5, '行程安排流暢', '半自助彈性很好，導遊也很準時。', 'published' from public.tours limit 3;
insert into public.reviews (entity_type, entity_id, rating, title, content, status)
select 'restaurant', id, 5, '值得收藏', '餐點穩定，地點也方便。', 'published' from public.restaurants limit 3;
insert into public.reviews (entity_type, entity_id, rating, title, content, status)
select 'attraction', id, 4, '適合第一次造訪', '停留時間約一到兩小時剛好。', 'published' from public.attractions limit 3;
insert into public.reviews (entity_type, entity_id, rating, title, content, status)
select 'guide', id, 5, '中文溝通順暢', '路線建議實用，也很懂拍照點。', 'published' from public.guides limit 3;
