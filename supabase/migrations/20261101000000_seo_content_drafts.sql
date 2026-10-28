-- SEO Content Drafts Migration
-- Inserts requested blog article drafts, FAQs, host family draft, and longer what-to-expect text
-- ALL items are left strictly UNPUBLISHED (status = 'draft' or is_published = false) for host review.

-- 1. Blog Article Drafts
INSERT INTO public.posts (slug, title, summary, body, status, draft_note, published_at)
VALUES
(
  'dinner-with-local-family-marrakech-what-to-expect',
  jsonb_build_object(
    'en', 'Dinner with a local family in Marrakech: what to expect',
    'fr', 'Dîner chez une famille locale à Marrakech : à quoi s''attendre',
    'ar', 'عشاء مع عائلة محلية في مراكش: ماذا تتوقع'
  ),
  jsonb_build_object(
    'en', 'What really happens when you share an evening meal inside a traditional family home in the Marrakech Medina.',
    'fr', 'Ce qui se passe réellement lorsque vous partagez un repas du soir dans une maison familiale traditionnelle de la médina de Marrakech.',
    'ar', 'ما الذي يحدث حقاً عندما تشارك وجبة عشاء في بيت عائلي تقليدي في المدينة القديمة بمراكش.'
  ),
  jsonb_build_object(
    'en', E'Stepping away from commercial restaurants and into a Moroccan family home in Marrakech is one of the most memorable ways to experience authentic Medina culture.\n\nYour evening begins at an accessible meeting point in the Bab Ghmat area of the Marrakech Medina, where a host team member greets you and walks with you through the residential derbs (alleys) into the home. For the family''s privacy and security, the exact address is shared only with confirmed guests.\n\nUpon entering, you are welcomed with the warmth that Moroccan hospitality is famous for. Guests are invited to wash their hands using the traditional aftas (water jug and basin) before being seated in the family salon. Freshly prepared Moroccan mint tea, brewed with fresh herbs, is served alongside traditional biscuits.\n\nThe dinner itself is a succession of genuine home-cooked recipes prepared fresh from the daily souk: colorful cooked and raw Moroccan salads (such as zaalouk and fresh tomatoes with cumin), followed by a simmering central tagine served with warm crusty bread. The meal concludes with seasonal fruit, fragrant orange slices dusted with cinnamon, or sweet pastries.\n\nThroughout the evening, conversation flows naturally. You will have the chance to ask about daily life, culinary traditions, and family customs in Marrakech, while respecting the quiet, unhurried pace of a real home.',
    'fr', E'Quitter les restaurants touristiques pour entrer dans une maison familiale marocaine à Marrakech est l''une des manières les plus authentiques de découvrir la médina.\n\nVotre soirée commence à un point de rencontre accessible dans le quartier de Bab Ghmat, où un membre de l''équipe vous accueille et vous accompagne à pied à travers les ruelles calmes jusqu''à la maison. Par respect pour la vie privée de la famille, l''adresse exacte n''est pas publiée en ligne.\n\nDès votre arrivée, vous découvrez la célèbre hospitalité marocaine. Vous êtes invité à vous laver les mains selon le rituel traditionnel avant de prendre place dans le salon familial. Un thé à la menthe fraîchement infusé est servi avec de petites pâtisseries traditionnelles.\n\nLe dîner se compose de plats faits maison préparés avec les produits frais du marché du jour : salades marocaines cuites et crues (zaalouk, tomates au cumin), suivies d''un grand tajine mijoté servi au centre de la table avec du pain frais. Le repas s''achève par des fruits frais de saison ou des oranges parfumées à la cannelle.\n\nTout au long de la soirée, les échanges se font naturellement autour de la vie quotidienne et des traditions culinaires de Marrakech.',
    'ar', E'إن الابتعاد عن المطاعم السياحية والدخول إلى بيت عائلة مغربية في مراكش هو من أصدق التجارب للتعرف على ثقافة المدينة القديمة.\n\nتبدأ الأمسية عند نقطة التقاء سهلة الوصول في منطقة باب غمات بالمدينة القديمة لمراكش، حيث يستقبلكم أحد أفراد الفريق ويرافقكم سيراً عبر الأزقة الهادئة إلى البيت. وحفاظاً على خصوصية العائلة، لا يُنشر العنوان السكني الدقيق علناً.\n\nعند الوصول، تُستقبلون بترحيب حار يعكس كرم الضيافة المغربية. يُتاح لكم غسل اليدين وفق التقليد المغربي بالماء الزلال، ثم الجلوس في الصالون العائلي، حيث يُقدم الشاي المغربي المنعنع المحضر بأعشاب طازجة مع حلويات تقليدية.\n\nيتكون العشاء من أطباق منزلية مطهوة بمكونات طازجة من السوق المحلي: مقبلات وسلطات مغربية متنوعة (مثل الزعلوك وسلطة الطماطم بالكمون)، يتبعها طاجين مركزي غني بالنكهات يُقدم مع خبز طازج دافئ، وتختتم الوجبة بفواكه موسمية أو شرائح البرتقال بالقرفة.\n\nخلال الأمسية، تدور الأحاديث التلقائية حول العادات والتقاليد وحياة مراكش اليومية في جو أسري دافئ ومريح.'
  ),
  'draft',
  'Created for host review. Comprehensive guide on dinner expectations in Marrakech Medina.',
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  status = 'draft',
  draft_note = EXCLUDED.draft_note,
  updated_at = now();

INSERT INTO public.posts (slug, title, summary, body, status, draft_note, published_at)
VALUES
(
  'moroccan-dining-etiquette',
  jsonb_build_object(
    'en', 'Moroccan dining etiquette',
    'fr', 'L''étiquette du repas marocain',
    'ar', 'آداب المائدة المغربية'
  ),
  jsonb_build_object(
    'en', 'Essential customs and practical tips for sharing a meal politely in a Moroccan home.',
    'fr', 'Coutumes essentielles et conseils pratiques pour partager un repas poliment dans un foyer marocain.',
    'ar', 'القواعد والعادات الأساسية لتناول الطعام باحترام وكياسة في البيت المغربي.'
  ),
  jsonb_build_object(
    'en', E'Sharing a meal with a Moroccan family is a warm and informal experience, but observing a few traditional customs shows gratitude and respect.\n\nShoes and arrival: When arriving, check whether shoes are left at the entryway. Many homes maintain clean woven rugs or carpets and prefer guests to remove outdoor shoes.\n\nHand washing: Before the meal is served, a family member may bring an aftas (a silver or copper basin and ewer) to pour warm water over your hands. Dry your hands with the clean towel provided.\n\nThe central dish: Traditional Moroccan meals are served communally from a single large tagine or platter placed in the center of the table. Etiquette calls for eating from the triangular section directly in front of you rather than reaching across.\n\nEating with bread: In Moroccan culture, crusty bread (khobz) acts as both carbohydrate and utensil. Break a small piece with your right hand and use it to pinch meat, sauce, and vegetables.\n\nTea service: Mint tea is poured from a height to create a light foam on top. It is customary to accept the tea warmly, holding the glass by the rim or base where it is cooler.',
    'fr', E'Partager un repas en famille marocaine est une expérience chaleureuse et conviviale. Quelques règles de politesse simples témoignent de votre respect.\n\nArrivée et chaussures : En entrant, regardez si les membres de la famille retirent leurs chaussures à l''entrée. De nombreux foyers préfèrent marcher sans chaussures sur les tapis.\n\nLavage des mains : Avant de manger, on vous proposera souvent de vous laver les mains avec une aiguière et une bassine traditionnelles.\n\nLe plat commun : Le tajine ou le couscous est traditionnellement partagé dans un grand plat unique posé au centre. Il convient de manger dans la part située directement devant soi.\n\nManger avec le pain : Le pain marocain (khobz) sert à la fois d''aliment et de couvert. Cassez un petit morceau de la main droite pour attraper viande et légumes.\n\nLe thé : Servi en hauteur pour former une écume délicate, le thé à la menthe se déguste lentement en tenant le verre par le haut ou par le fond.',
    'ar', E'تناول الطعام مع عائلة مغربية تجربة إنسانية دافئة، وهناك عادات وتقاليد بسيطة تعبر عن التقدير والاحترام.\n\nخلع الحذاء: عند الدخول، يُستحسن الانتباه إلى ما إذا كانت العائلة تضع الأحذية عند المدخل للحفاظ على نظافة السجاد والزرابي.\n\nغسل اليدين: قبل بدء الأكل، يُقدم إبريق وطست تقليدي لصب الماء على اليدين، يليه منشفة نظيفة للتجفيف.\n\nالأكل من الجانب المقابل: يُقدم الطاجين عادة في طبق مركزي واحد يتشاركه الجميع. ومن الآداب الأكل مما يليك دون مد اليد إلى الجانب المقابل للآخرين.\n\nاستعمال الخبز واليد اليمنى: يُعد الخبز المغربي الطازج وسيلة لتناول اللحم والمرق والخضار، ويُستعمل باليد اليمنى تماشياً مع العرف والتقاليد.\n\nتقديم الشاي: يُصب الشاي المغربي بالنعناع من علو لتشكيل الرغوة الزكية، ويُستحسن شربه دافئاً بتمهل.'
  ),
  'draft',
  'Practical cultural etiquette guide for dining with Moroccan families.',
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  status = 'draft',
  draft_note = EXCLUDED.draft_note,
  updated_at = now();

INSERT INTO public.posts (slug, title, summary, body, status, draft_note, published_at)
VALUES
(
  'traditional-moroccan-dishes-explained',
  jsonb_build_object(
    'en', 'Traditional Moroccan dishes explained',
    'fr', 'Les plats traditionnels marocains expliqués',
    'ar', 'الأطباق المغربية التقليدية وتفاصيلها'
  ),
  jsonb_build_object(
    'en', 'An overview of classic Moroccan home cooking: slow-simmered tagines, handmade couscous, zaalouk, and fresh salads.',
    'fr', 'Un aperçu de la cuisine familiale marocaine : tajines mijotés, couscous fait main, zaalouk et salades fraîches.',
    'ar', 'دليل لأبرز مأكولات المطبخ المغربي المنزلي: الطواجن المطهوة ببطء، الكسكس، الزعلوك والمقبلات الطازجة.'
  ),
  jsonb_build_object(
    'en', E'Moroccan cuisine is renowned worldwide for its harmonious balance of sweet and savory, fragrant spices, and slow cooking methods.\n\nThe Tagine: Named after the conical earthenware dish it is cooked in, a tagine allows steam to circulate and condense back into the food. Popular varieties include tender beef or lamb with prunes and toasted almonds, chicken with preserved lemons and purple olives, or vibrant seasonal vegetarian tagines.\n\nMoroccan Salads: A traditional meal begins with an assortment of small cooked and raw salads. Highlights include Zaalouk (roasted eggplant with tomatoes, garlic, and cumin) and Taktouka (sweet bell peppers stewed with ripe tomatoes and olive oil).\n\nCouscous: Traditionally enjoyed on Fridays and during gatherings, real couscous is steamed multiple times over a simmering broth of meat and seven seasonal vegetables (carrots, pumpkin, zucchini, turnips, and chickpeas).\n\nMoroccan Bread (Khobz): Baked daily in neighborhood communal ovens (ferran), Moroccan round flatbread is essential to every meal, offering a dense crumb perfect for dipping.\n\nMint Tea (Atay): Green gunpowder tea brewed with fresh spearmint leaves and pure sugar cane, serving as both refreshment and hospitality.',
    'fr', E'La gastronomie marocaine se distingue par ses accords subtils entre le sucré et le salé, ses épices douces et sa cuisson lente.\n\nLe Tajine : Nommé d''après le plat conique en terre cuite dans lequel il mijote, le tajine préserve les sucs et la tendreté des viandes. Parmi les classiques : le bœuf aux pruneaux caramélisés et amandes, ou le poulet fermier aux citrons confits et olives violettes.\n\nLes salades marocaines : Servies en entrée, elles comprennent le zaalouk (caviar d''aubergines aux tomates et cumin) et la taktouka (poivrons grillés mijotés à l''huile d''olive).\n\nLe Couscous : Préparé selon la tradition le vendredi, il est cuit à la vapeur au-dessus d''un bouillon parfumé aux sept légumes de saison.\n\nLe pain (Khobz) : Pétri à la maison et souvent cuit au four du quartier, il accompagne chaque bouchée.\n\nLe thé à la menthe : Infusé avec des feuilles de menthe fraîche, il conclut le repas avec convivialité.',
    'ar', E'يتميز المطبخ المغربي بتوازن نكهاته بين الحلو والمالح، واستعمال التوابل العطرية وطرق الطهي المتأنية.\n\nالطاجين المغربي: يحمل اسم الإناء الطيني المخروطي الذي يُطهى فيه ببطء. ومن أشهر أنواعه طاجين اللحم بالبرقوق واللوز، وطاجين الدجاج بالليمون المصير والزيتون، والطواجن النباتية بمحاصيل الموسم.\n\nالمقبلات والسلطات: تبدأ الوجبة بمجموعة سلطات باردة ودافئة، مثل الزعلوك (باذنجان مشوي مع الطماطم والكمون والثوم) والتكتوكة (فلفل حلو وطماطم بزيت الزيتون).\n\nالكسكس: الطبق الأسبوعي التقليدي الذي يُطهى على البخار فوق مرق غني باللحم وسبع خضار متنوعة.\n\nالخبز التقليدي: يُعجن منزلياً ويُخبز طازجاً، وهو ركن أساسي في كل مائدة لمرافقة المرق.\n\nالشاي بالنعناع: يُحضر من الشاي الأخضر وأوراق النعناع الطازج، وهو رمز الترحيب وإكرام الضيف.'
  ),
  'draft',
  'Authentic overview of Moroccan home cooking pillars.',
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  status = 'draft',
  draft_note = EXCLUDED.draft_note,
  updated_at = now();

INSERT INTO public.posts (slug, title, summary, body, status, draft_note, published_at)
VALUES
(
  'home-dinner-marrakech-safe-children',
  jsonb_build_object(
    'en', 'Is a home dinner in Marrakech safe and suitable for children?',
    'fr', 'Un dîner chez l''habitant à Marrakech est-il adapté et sûr pour les enfants ?',
    'ar', 'هل تجربة العشاء المنزلي في مراكش آمنة ومناسبة للأطفال؟'
  ),
  jsonb_build_object(
    'en', 'Practical guidance for families traveling with children who want to experience authentic Moroccan hospitality.',
    'fr', 'Conseils pratiques pour les familles voyageant avec des enfants souhaitant vivre l''hospitalité marocaine authentique.',
    'ar', 'إرشادات عملية للعائلات المسافرة مع أطفال وتود خوض تجربة الضيافة المغربية الأصيلة.'
  ),
  jsonb_build_object(
    'en', E'Parents visiting Marrakech often wonder if a home dining experience with a local family is appropriate and relaxing for their children. The short answer is a resounding yes.\n\nMoroccan culture places great love and honor upon children. Unlike formal or hushed restaurants, a Moroccan home is an environment where children are naturally welcomed as members of the family.\n\nChild-friendly food: Authentic Moroccan home cooking is fragrant with cumin, ginger, coriander, and saffron, but it is not aggressively spicy or hot (chili paste like harissa is always served separately on the side). Mild chicken tagine, soft potatoes, carrots, and sweet prunes are universally enjoyed by young eaters. Fresh fruit and bread ensure every child finds plenty to eat.\n\nComfortable seating: Traditional Moroccan salons feature wide, cushioned banquettes where children can sit comfortably, lean back, or stretch out without needing to sit stiffly in formal chairs.\n\nMeeting logistics: Families meet at an easy landmark in Bab Ghmat and walk together into a calm, residential Medina alley away from busy scooter traffic.\n\nPricing: Children under 6 participate free of charge, and special reduced rates apply for older children.',
    'fr', E'Les parents en voyage à Marrakech se demandent souvent si partager un dîner chez l''habitant convient aux enfants. La réponse est un oui enthousiaste.\n\nDans la culture marocaine, les enfants sont accueillis avec une affection et une bienveillance naturelles. L''ambiance d''un foyer est bien plus détendue que celle d''un restaurant conventionnel.\n\nDes saveurs douces : La cuisine marocaine est parfumée (cumin, coriandre, gingembre) mais n''est pas piquante. Le piment (harissa) est toujours servi à part. Les morceaux de poulet tendre, les légumes fondants et les fruits plaisent beaucoup aux plus jeunes.\n\nDes salons confortables : Les banquettes spacieuses permettent aux enfants de s''asseoir à l''aise ou de se reposer tranquillement.\n\nAccès sécurisé : Le point de rencontre à Bab Ghmat permet de rejoindre la maison à pied dans des ruelles résidentielles calmes.\n\nTarifs famille : La participation est gratuite pour les enfants de moins de 6 ans, avec un tarif adapté pour les enfants plus âgés.',
    'ar', E'تتساءل العائلات التي تزور مراكش عما إذا كان العشاء في بيت عائلي مناسباً وآمناً لأطفالهم. الجواب هو نعم بكل تأكيد.\n\nتحظى الطفولة في الثقافة المغربية بمكانة خاصة ومحبة كبيرة، والبيوت المغربية بطبيعتها بيئة دافئة ومرحبة بالصغار بعيداً عن قيود المطاعم الرسمية.\n\nأطباق تناسب أذواق الأطفال: يعتمد المطبخ المغربي على توابل عطرية غير حارة (مثل الكمون والزنجبيل والكزبرة)، بينما تُقدم التوابل الحارة مثل الهريسة جانباً لمن يرغب. كما أن الدجاج الطري والخضار والبطاطس والفواكه الطازجة تناسب الأطفال تماماً.\n\nجلسة مريحة: تتميز الصالونات المغربية بكنبات مريحة وفسيحة تمنح الأطفال حرية الجلوس أو الاسترخاء بأريحية.\n\nوصول آمن: يتم اللقاء في مكان واضح قرب باب غمات ثم المشي في أزقة سكنية هادئة بالمدينة القديمة.\n\nمراعاة التكاليف: يستفيد الأطفال دون سن 6 سنوات من التجربة مجاناً مع أسعار مخفضة للأطفال الأكبر سناً.'
  ),
  'draft',
  'Family and child-friendly guidance for Marrakech home dinners.',
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  status = 'draft',
  draft_note = EXCLUDED.draft_note,
  updated_at = now();

INSERT INTO public.posts (slug, title, summary, body, status, draft_note, published_at)
VALUES
(
  'things-to-do-marrakech-in-the-evening',
  jsonb_build_object(
    'en', 'Things to do in Marrakech in the evening',
    'fr', 'Que faire à Marrakech en soirée',
    'ar', 'أنشطة وأفكار لقضاء المساء في مراكش'
  ),
  jsonb_build_object(
    'en', 'From sunset calls to prayer and Medina rooftop views to sharing a quiet dinner with a local family.',
    'fr', 'Du coucher de soleil aux appels à la prière, des toits de la médina au calme d''un dîner chez l''habitant.',
    'ar', 'من مشهد غروب الشمس وأجواء المدينة القديمة إلى هدوء العشاء مع عائلة محلية.'
  ),
  jsonb_build_object(
    'en', E'As the afternoon heat fades in Marrakech, the city transforms into a vibrant, cooler atmosphere filled with evening energy.\n\nSunset views over the Medina: Watching the sun dip below the Koutoubia minaret while hearing the evening call to prayer echo across the rooftops is an unforgettable Marrakech experience. Many quiet cafés offer panoramic rooftop terraces for dusk tea.\n\nJemaa el-Fnaa by night: The famous central square comes alive at dusk with musicians, storytelling circles, and glowing lantern stalls. While exhilarating, it can also become overwhelming.\n\nA quiet dinner with a local family: For travelers seeking genuine human connection away from crowds and street vendors, booking a home-cooked dinner in a Medina residential quarter like Bab Ghmat offers a serene, authentic retreat. Sharing a home-cooked tagine in a family salon lets you discover Moroccan culture from within.\n\nStrolling the lighted derbs: Take time to walk through residential alleys lit by warm brass lanterns, observing evening life as neighborhood bakeries and small grocers chat with passing neighbors.',
    'fr', E'Lorsque la chaleur de l''après-midi retombe, Marrakech s''illumine d''une ambiance douce et vivante.\n\nLe coucher de soleil sur les toits : Admirer le soleil descendre derrière le minaret de la Koutoubia au son de l''appel à la prière est un moment suspendu depuis une terrasse de la médina.\n\nPlace Jemaa el-Fnaa : La place s''anime de lumières, de conteurs et de musiciens. C''est un spectacle fascinant, mais qui peut être dense.\n\nUn dîner chez une famille locale : Pour vivre une soirée calme et sincère à l''écart des foules touristiques, partager un repas fait maison dans le quartier de Bab Ghmat permet de vivre l''hospitalité marocaine de l''intérieur.\n\nBalade dans les derbs éclairés : Découvrir la médina en soirée au gré des lanternes de cuivre et des petits commerces de quartier qui ferment paisiblement.',
    'ar', E'مع انكسار حرارة النهار، تكتسي مراكش في المساء طابعاً ساحراً يجمع بين الحيوية والهدوء.\n\nمشهد الغروب فوق أسطح المدينة: من أجمل اللحظات مراقبة غروب الشمس مع صومعة الكتبية وتردد صوت أذان المغرب في سماء المدينة القديمة.\n\nساحة جامع الفنا ليلاً: تتزين الساحة بالفوانيس المضيئة وحلقات الحكواتية والموسيقى الشعبية، وهي تجربة مفعمة بالحيوية.\n\nعشاء هادئ مع عائلة محلية: لمن يبحث عن تواصل إنساني أصيل بعيداً عن صخب المواقع السياحية، يمنحك العشاء المنزلي في حي باب غمات فرصة الاستمتاع بوجبة طازجة وجلسة أسرية طيبة تحكي روح مراكش الحقيقية.\n\nالتجول بين أزقة المدينة المضاءة: الاستمتاع بنزهة مسائية عبر الدروب المضاءة بالفوانيس التقليدية بين البيوت العريقة والمتاجر المحلية الصغيرة.'
  ),
  'draft',
  'Evening ideas in Marrakech Medina emphasizing authentic family dining.',
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  status = 'draft',
  draft_note = EXCLUDED.draft_note,
  updated_at = now();

-- 2. FAQs (Unpublished Drafts answering the 6 key real questions)
INSERT INTO public.faqs (id, category, question, answer, sort_order, is_published)
VALUES
(
  'b2612600-0000-4000-8000-000000000001',
  jsonb_build_object('en', 'Dress & Etiquette', 'fr', 'Tenue & Savoir-vivre', 'ar', 'الملابس والآداب'),
  jsonb_build_object(
    'en', 'What should I wear to dinner with a local Moroccan family?',
    'fr', 'Quelle tenue porter pour un dîner chez une famille marocaine ?',
    'ar', 'ما هي الملابس المناسبة لحضور عشاء مع عائلة مغربية؟'
  ),
  jsonb_build_object(
    'en', 'Modest, comfortable casual clothing is ideal. Covering shoulders and knees is appreciated out of respect when visiting a private home in the traditional Medina. You may also be invited to remove outdoor shoes at the entrance upon arrival.',
    'fr', 'Une tenue décontractée, confortable et respectueuse est recommandée. Il est apprécié de couvrir épaules et genoux lors de la visite d''un foyer dans la médina traditionnelle. Il est également d''usage de retirer ses chaussures à l''entrée.',
    'ar', 'يُفضل ارتداء ملابس مريحة ومحتشمة تغطي الكتفين والركبتين احتراماً لخصوصية البيت العائلي في المدينة القديمة. كما قد يُطلب منكم خلع الأحذية عند المدخل للحفاظ على نظافة المكان.'
  ),
  10,
  false
),
(
  'b2612600-0000-4000-8000-000000000002',
  jsonb_build_object('en', 'Dietary Needs', 'fr', 'Régimes & Allergies', 'ar', 'النظام الغذائي والحساسيات'),
  jsonb_build_object(
    'en', 'Can vegetarian, vegan, or food allergy requirements be accommodated?',
    'fr', 'Les régimes végétariens, végétaliens ou allergies peuvent-ils être pris en compte ?',
    'ar', 'هل يمكن تلبية طلبات الطعام النباتي أو الحساسيات الغذائية؟'
  ),
  jsonb_build_object(
    'en', 'Yes. Every meal is freshly prepared from the market specifically for your visit. Please specify any vegetarian, vegan, gluten-free, or nut allergy requirements in the booking form so the host family can tailor the dishes accordingly.',
    'fr', 'Oui. Chaque repas est préparé spécialement pour vous à partir des produits frais du marché. Merci de préciser vos régimes végétariens, sans gluten ou allergies lors de la réservation afin que la famille adapte le menu.',
    'ar', 'نعم، تُحضر الوجبات بمكونات طازجة من السوق خصيصاً لكل حجز. يُرجى تدوين أي طلب نباتي أو حساسية غذائية (كالغلوتين أو المكسرات) أثناء إتمام الحجز لتتمكن العائلة من إعداد ما يناسبكم.'
  ),
  20,
  false
),
(
  'b2612600-0000-4000-8000-000000000003',
  jsonb_build_object('en', 'Families & Children', 'fr', 'Enfants & Famille', 'ar', 'الأطفال والعائلات'),
  jsonb_build_object(
    'en', 'Is the home dinner safe and suitable for young children?',
    'fr', 'Le dîner en famille est-il adapté et sécurisé pour les jeunes enfants ?',
    'ar', 'هل العشاء العائلي آمن ومناسب للأطفال الصغار؟'
  ),
  jsonb_build_object(
    'en', 'Yes, children of all ages are warmly welcomed. Moroccan homes are family-oriented environments with spacious salon seating. Dishes are mild and non-spicy, and children under 6 participate free of charge.',
    'fr', 'Oui, les enfants de tout âge sont accueillis avec grand plaisir. Les salons marocains offrent des banquettes spacieuses et confortables. Les plats sont doux et non pimentés, et la participation est gratuite pour les enfants de moins de 6 ans.',
    'ar', 'نعم، الأطفال من جميع الأعمار مرحب بهم بحرارة. تتميز البيوت المغربية ببيئة أسرية رحبة ومقاعد مريحة. الأطباق المقدمة معتدلة وغير حارة، والأطفال دون 6 سنوات يشاركون مجاناً.'
  ),
  30,
  false
),
(
  'b2612600-0000-4000-8000-000000000004',
  jsonb_build_object('en', 'Location & Meeting', 'fr', 'Lieu & Arrivée', 'ar', 'الموقع واللقاء'),
  jsonb_build_object(
    'en', 'How do I find the meeting place in Marrakech?',
    'fr', 'Comment trouver le point de rendez-vous à Marrakech ?',
    'ar', 'كيف أجد مكان اللقاء في مراكش؟'
  ),
  jsonb_build_object(
    'en', 'To protect family privacy and ensure your comfort, the private home address is not posted publicly. We meet guests at an easy, accessible landmark in the Bab Ghmat area of the Marrakech Medina, where a host team member greets you and walks with you to the door.',
    'fr', 'Pour préserver l''intimité de la famille, l''adresse résidentielle exacte n''est pas diffusée en ligne. Le point de rendez-vous se situe près d''un repère facile d''accès à Bab Ghmat (médina de Marrakech), où un membre de l''équipe vous accueille pour vous accompagner à pied.',
    'ar', 'حفاظاً على خصوصية العائلة وراحة الضيوف، لا يُنشر العنوان السكني التفصيلي على الإنترنت. نلتقي بضيوفنا عند نقطة معلومة وسهلة الوصول في منطقة باب غمات بالمدينة القديمة لمراكش، حيث يرافقكم أحد أعضاء الفريق مباشرة إلى المنزل.'
  ),
  40,
  false
),
(
  'b2612600-0000-4000-8000-000000000005',
  jsonb_build_object('en', 'Payment', 'fr', 'Paiement', 'ar', 'طريقة الدفع'),
  jsonb_build_object(
    'en', 'How and when do I pay for the dinner?',
    'fr', 'Comment et quand s''effectue le paiement du dîner ?',
    'ar', 'كيف ومتى يتم دفع تكلفة العشاء؟'
  ),
  jsonb_build_object(
    'en', 'Payment is made directly in cash (in Moroccan Dirhams or Euros) to your host upon arrival, or via online deposit if selected during reservation. Family homes do not possess credit card terminals.',
    'fr', 'Le règlement s''effectue directement en espèces (en dirhams marocains ou en euros) auprès de votre hôte à votre arrivée, ou par prépaiement en ligne si proposé lors de la réservation. Les maisons familiales ne disposent pas de terminal bancaire.',
    'ar', 'يتم الدفع نقداً (بالدرهم المغربي أو اليورو) مباشرة للعائلة عند الوصول، أو عبر الحجز المسبق إذا تم تفعيله. البيوت العائلية لا تتوفر على أجهزة الدفع بالبطاقة الائتمانية.'
  ),
  50,
  false
),
(
  'b2612600-0000-4000-8000-000000000006',
  jsonb_build_object('en', 'Cancellations', 'fr', 'Annulation', 'ar', 'الإلغاء والتعديل'),
  jsonb_build_object(
    'en', 'What is the cancellation policy?',
    'fr', 'Quelle est la politique d''annulation ?',
    'ar', 'ما هي شروط إلغاء الحجز؟'
  ),
  jsonb_build_object(
    'en', 'You can cancel or reschedule free of charge up to 24 hours prior to your scheduled meal. Please notify us as early as possible so the family does not make unnecessary fresh market purchases.',
    'fr', 'Vous pouvez annuler ou reporter votre repas sans frais jusqu''à 24 heures avant l''horaire prévu. Merci de nous prévenir le plus tôt possible pour éviter les achats inutiles d''ingrédients frais au marché.',
    'ar', 'يمكنكم إلغاء أو تعديل موعد الوجبة مجاناً حتى 24 ساعة قبل الوقت المحدد. نرجو إبلاغنا مبكراً لتفادي شراء المكونات الطازجة من السوق دون داعٍ.'
  ),
  60,
  false
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  sort_order = EXCLUDED.sort_order,
  is_published = false,
  updated_at = now();

-- 3. Host Family Draft (Left unpublished for review)
INSERT INTO public.host_families (
  id, name, area, languages, signature_dish, story, address, image_url, is_published
)
VALUES
(
  'family-el-amrani',
  jsonb_build_object(
    'en', 'The El Amrani Family',
    'fr', 'La Famille El Amrani',
    'ar', 'عائلة العمراني'
  ),
  jsonb_build_object(
    'en', 'Bab Ghmat, Marrakech Medina',
    'fr', 'Bab Ghmat, Médina de Marrakech',
    'ar', 'باب غمات، المدينة القديمة بمراكش'
  ),
  '["Arabic", "French", "Basic English"]'::jsonb,
  jsonb_build_object(
    'en', 'Slow-simmered beef tagine with caramelized prunes and roasted almonds',
    'fr', 'Tajine de bœuf mijoté aux pruneaux caramélisés et amandes dorées',
    'ar', 'طاجين اللحم البقري بالبرقوق المعسل واللوز المحمص'
  ),
  jsonb_build_object(
    'en', 'Living in the quiet Bab Ghmat quarter of the historic Marrakech Medina, our host family shares genuine Moroccan warmth, traditional culinary knowledge passed down from mother to daughter, and unhurried cultural conversation around the dinner table.',
    'fr', 'Installée dans le quartier paisible de Bab Ghmat au cœur de la médina de Marrakech, notre famille hôte partage avec sincérité la chaleur de l''hospitalité marocaine, des recettes traditionnelles transmises de mère en fille et un échange culturel spontané autour de la table.',
    'ar', 'تقيم العائلة في حي باب غمات الهادئ بالمدينة القديمة لمراكش، وتفتح بيتها بكل مودة لمشاركة دفء الضيافة المغربية الأصيلة، ووصفات عائلية متوارثة عبر الأجيال، وحوارات ثقافية صادقة حول مائدة الطعام.'
  ),
  'Bab Ghmat, Marrakech Medina',
  '/images/family-sharing-tagine-1200.webp',
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  area = EXCLUDED.area,
  languages = EXCLUDED.languages,
  signature_dish = EXCLUDED.signature_dish,
  story = EXCLUDED.story,
  address = EXCLUDED.address,
  image_url = EXCLUDED.image_url,
  is_published = false,
  updated_at = now();

-- 4. Longer "What to expect" text for Experiences
UPDATE public.experiences
SET what_to_expect = jsonb_build_object(
  'en', E'Your experience begins near Bab Ghmat in the Marrakech Medina, where a host team member greets you and walks with you through quiet residential alleys to the family home.\n\nAfter a traditional warm-water hand washing, you are welcomed with fragrant Moroccan mint tea and small pastries in the family salon.\n\nAs the meal is served, you gather around the table to share dishes prepared fresh from the morning market: seasonal cooked and fresh salads, followed by a slow-cooked central tagine served with warm crusty bread. The dinner concludes with seasonal fruits or cinnamon-dusted orange slices.\n\nThroughout the visit, you have ample time to chat, ask questions about life in Marrakech, and experience genuine Moroccan hospitality at an unhurried, natural pace.',
  'fr', E'Votre expérience débute près de Bab Ghmat dans la médina de Marrakech, où un membre de l''équipe vous accueille pour vous accompagner à pied à travers des ruelles calmes jusqu''à la maison familiale.\n\nAprès le rituel traditionnel du lavage des mains à l''eau tiède, vous êtes accueilli avec un thé à la menthe parfumé et de petites pâtisseries dans le salon familial.\n\nLe repas s''ouvre ensuite sur des salades marocaines de saison fraîches et cuites, suivies d''un tajine mijoté au centre de la table accompagné de pain artisanal. Le dîner s''achève par des fruits frais de saison ou des oranges parfumées à la cannelle.\n\nTout au long du repas, vous partagez des échanges spontanés sur les coutumes et la vie quotidienne à Marrakech dans un cadre authentique et paisible.',
  'ar', E'تبدأ تجربتكم بالقرب من باب غمات في المدينة القديمة بمراكش، حيث يستقبلكم أحد أفراد الفريق ويرافقكم سيراً عبر أزقة سكنية هادئة إلى بيت العائلة.\n\nبعد طقس غسل اليدين التقليدي بالماء الدافئ، تُستقبلون بكأس من الشاي المغربي المنعنع وحلويات تقليدية في الصالون العائلي.\n\nتتوالى أطباق العشاء المحضرة من خيرات السوق اليومي: سلطات ومقبلات مغربية موسمية، يليها طاجين مركزي مطهو بعناية مع خبز دافئ. ويختتم العشاء بفواكه موسمية طازجة أو شرائح البرتقال برائحة القرفة.\n\nخلال الزيارة، تتاح لكم فرصة الحديث والتعرف على تفاصيل الحياة اليومية والتقاليد المراكشية في جو حميم وأصيل.'
)
WHERE id IN ('family-dinner-marrakech', 'family-lunch-marrakech');
