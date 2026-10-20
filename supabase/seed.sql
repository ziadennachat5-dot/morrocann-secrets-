-- =============================================================================
-- MOROCCAN SECRETS - Seed Data
-- Populates experiences, host families, sample approved reviews, and initial availability
-- =============================================================================

-- 1. EXPERIENCES
INSERT INTO public.experiences (id, title, blurb, duration, price, deposit_amount, max_guests, image_url, included, is_published)
VALUES
(
  'family-dinner',
  '{"en": "Family Dinner Evening", "fr": "Soirée dîner en famille", "ar": "أمسية عشاء عائلي"}'::jsonb,
  '{"en": "Our signature: mint tea, a home-cooked feast and the courtyard at dusk.", "fr": "Notre signature : thé, festin maison et patio au crépuscule.", "ar": "تجربتنا المميزة: أتاي ووليمة منزلية وصحن الرياض عند الغروب."}'::jsonb,
  '{"en": "3 hours", "fr": "3 heures", "ar": "3 ساعات"}'::jsonb,
  65.00,
  15.00,
  10,
  '/images/large-riad-dinner-gathering-800.jpg',
  '[
    {"en": "Mint tea ceremony", "fr": "Cérémonie du thé", "ar": "طقس الأتاي"},
    {"en": "4-course dinner", "fr": "Dîner 4 plats", "ar": "عشاء من 4 أطباق"},
    {"en": "Fresh juices", "fr": "Jus frais", "ar": "عصائر طازجة"}
  ]'::jsonb,
  true
),
(
  'cook-and-dine',
  '{"en": "Cook & Dine Workshop", "fr": "Atelier cuisiner & dîner", "ar": "ورشة الطبخ والعشاء"}'::jsonb,
  '{"en": "Hands in the dough: cook three dishes with your host, then eat them together.", "fr": "Les mains dans la pâte : trois plats avec votre hôte, puis à table.", "ar": "اطبخ ثلاثة أطباق مع مضيفك ثم تناولها معاً."}'::jsonb,
  '{"en": "4.5 hours", "fr": "4 h 30", "ar": "4 ساعات ونصف"}'::jsonb,
  89.00,
  20.00,
  8,
  '/images/couple-sharing-riad-dinner-800.jpg',
  '[
    {"en": "Spice market walk", "fr": "Balade au souk aux épices", "ar": "جولة في سوق التوابل"},
    {"en": "Hands-on cooking class", "fr": "Cours de cuisine pratique", "ar": "درس طبخ تطبيقي"},
    {"en": "Dinner & recipe cards", "fr": "Dîner & fiches recettes", "ar": "العشاء وبطاقات الوصفات"}
  ]'::jsonb,
  true
),
(
  'friday-couscous',
  '{"en": "Friday Couscous Lunch", "fr": "Couscous du vendredi", "ar": "غداء كسكس الجمعة"}'::jsonb,
  '{"en": "Join the most sacred meal of the Moroccan week, the way families share it.", "fr": "Le repas le plus important de la semaine, partagé en famille.", "ar": "شارك أهم وجبة في الأسبوع المغربي كما تتقاسمها العائلات."}'::jsonb,
  '{"en": "2.5 hours", "fr": "2 h 30", "ar": "ساعتان ونصف"}'::jsonb,
  49.00,
  10.00,
  12,
  '/images/moroccan-dishes-on-shared-table-800.jpg',
  '[
    {"en": "Seven-vegetable couscous", "fr": "Couscous aux sept légumes", "ar": "كسكس بسبع خضار"},
    {"en": "Lben & dessert", "fr": "Lben & dessert", "ar": "اللبن والحلوى"}
  ]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  blurb = EXCLUDED.blurb,
  duration = EXCLUDED.duration,
  price = EXCLUDED.price,
  deposit_amount = EXCLUDED.deposit_amount,
  max_guests = EXCLUDED.max_guests,
  image_url = EXCLUDED.image_url,
  included = EXCLUDED.included,
  is_published = EXCLUDED.is_published,
  updated_at = now();

-- 2. HOST FAMILIES
INSERT INTO public.host_families (id, name, area, languages, signature_dish, story, address, image_url, is_published)
VALUES
(
  'amrani',
  '{"en": "The Amrani Family", "fr": "La famille Amrani", "ar": "عائلة العمراني"}'::jsonb,
  '{"en": "Riad Zitoun", "fr": "Riad Zitoun", "ar": "رياض الزيتون"}'::jsonb,
  '{"en": "Arabic, French, English", "fr": "Arabe, français, anglais", "ar": "العربية، الفرنسية، الإنجليزية"}'::jsonb,
  '{"en": "Lamb tagine with prunes", "fr": "Tajine d''agneau aux pruneaux", "ar": "طاجين اللحم بالبرقوق"}'::jsonb,
  '{"en": "Youssef and Khadija have hosted friends in this riad for twenty years; their daughter Lina now leads the tea ceremony.", "fr": "Youssef et Khadija reçoivent dans ce riad depuis vingt ans ; leur fille Lina sert désormais le thé.", "ar": "يستقبل يوسف وخديجة الضيوف في هذا الرياض منذ عشرين عاماً، وابنتهما لينا تقدّم الأتاي الآن."}'::jsonb,
  'Derb Chtouka 14, Riad Zitoun Jdid, Medina, Marrakesh (Meeting point: Place des Ferblantiers)',
  '/assets/family.jpg',
  true
),
(
  'benali',
  '{"en": "Lalla Fatima & daughters", "fr": "Lalla Fatima & ses filles", "ar": "لالة فاطمة وبناتها"}'::jsonb,
  '{"en": "Mouassine", "fr": "Mouassine", "ar": "المواسين"}'::jsonb,
  '{"en": "Arabic, French", "fr": "Arabe, français", "ar": "العربية، الفرنسية"}'::jsonb,
  '{"en": "Hand-rolled couscous", "fr": "Couscous roulé à la main", "ar": "كسكس مفتول باليد"}'::jsonb,
  '{"en": "Three generations, one kitchen. Lalla Fatima learned couscous at six and still rolls it every Friday morning.", "fr": "Trois générations, une cuisine. Lalla Fatima roule le couscous depuis ses six ans.", "ar": "ثلاثة أجيال في مطبخ واحد. تعلمت لالة فاطمة فتل الكسكس في السادسة وما زالت تفتله كل جمعة."}'::jsonb,
  'Derb El Hammam 8, Mouassine, Medina, Marrakesh (Meeting point: Mouassine Mosque Fountain)',
  '/assets/cooking.jpg',
  true
),
(
  'idrissi',
  '{"en": "The Idrissi Brothers", "fr": "Les frères Idrissi", "ar": "الإخوة الإدريسي"}'::jsonb,
  '{"en": "Kasbah", "fr": "Kasbah", "ar": "القصبة"}'::jsonb,
  '{"en": "Arabic, English, Spanish", "fr": "Arabe, anglais, espagnol", "ar": "العربية، الإنجليزية، الإسبانية"}'::jsonb,
  '{"en": "Pastilla with pigeon", "fr": "Pastilla au pigeon", "ar": "بسطيلة الحمام"}'::jsonb,
  '{"en": "Former culinary chefs who returned home to celebrate their mother''s recipes for guests at her own table.", "fr": "Anciens cuisiniers revenus cuisiner les recettes de leur mère à sa propre table.", "ar": "طاهيان سابقان عادا إلى البيت ليطبخا وصفات والدتهما للضيوف على مائدتها."}'::jsonb,
  'Derb Boutouil 22, Kasbah, Medina, Marrakesh (Meeting point: Bab Agnaou)',
  '/assets/hero.jpg',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  area = EXCLUDED.area,
  languages = EXCLUDED.languages,
  signature_dish = EXCLUDED.signature_dish,
  story = EXCLUDED.story,
  address = EXCLUDED.address,
  image_url = EXCLUDED.image_url,
  is_published = EXCLUDED.is_published,
  updated_at = now();

-- 3. APPROVED REVIEWS
INSERT INTO public.reviews (experience_id, author, origin, quote, rating, approved)
VALUES
(
  'family-dinner',
  'Sarah & Tom',
  'London',
  '{"en": "The highlight of our whole trip. We came as tourists and left with an invitation to come back for Eid.", "fr": "Le moment fort de notre voyage. Venus en touristes, repartis avec une invitation pour l''Aïd.", "ar": "أجمل لحظة في رحلتنا. جئنا سياحاً وغادرنا بدعوة للعودة في العيد."}'::jsonb,
  5,
  true
),
(
  'cook-and-dine',
  'Julien',
  'Lyon',
  '{"en": "Khadija''s tagine ruined every restaurant for me.", "fr": "Le tajine de Khadija m''a gâché tous les restaurants.", "ar": "طاجين خديجة أفسد عليّ كل المطاعم."}'::jsonb,
  5,
  true
),
(
  'friday-couscous',
  'Maria',
  'Madrid',
  '{"en": "Warm, unhurried and real. My kids still talk about rolling couscous.", "fr": "Chaleureux, sans hâte et vrai. Mes enfants en parlent encore.", "ar": "دافئة وهادئة وحقيقية. أطفالي ما زالوا يتحدثون عن فتل الكسكس."}'::jsonb,
  5,
  true
);

-- 4. AVAILABILITY SLOTS (Upcoming 14 days sample slots)
INSERT INTO public.availability (date, experience_id, capacity, booked_count, status)
SELECT
  d::date,
  exp.id,
  exp.max_guests,
  0,
  'available'
FROM generate_series(CURRENT_DATE + 1, CURRENT_DATE + 14, interval '1 day') AS d
CROSS JOIN (SELECT id, max_guests FROM public.experiences) AS exp
ON CONFLICT (date, experience_id) DO NOTHING;
