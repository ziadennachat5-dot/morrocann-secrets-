// PLACEHOLDER CONTENT — every item below (names, prices, contacts, photos) is
// sample data to be replaced with the real details.
import type { L10n } from "./i18n";
import family from "@/assets/family.jpg";
import cooking from "@/assets/cooking.jpg";
import hero from "@/assets/hero.jpg";

export const CONTACT = {
  whatsapp: "212600000000", // PLACEHOLDER number
  email: "hello@moroccansecrets.com", // PLACEHOLDER
  instagram: "https://instagram.com/moroccansecrets", // PLACEHOLDER
};

export type Experience = {
  id: string; title: L10n; duration: L10n; price: number; maxGuests: number; included: L10n[]; blurb: L10n; image: string;
};

export const experiences: Experience[] = [
  {
    id: "family-dinner",
    title: { en: "Family Dinner Evening", fr: "Soirée dîner en famille", ar: "أمسية عشاء عائلي" },
    blurb: { en: "Our signature: mint tea, a home-cooked feast and the courtyard at dusk.", fr: "Notre signature : thé, festin maison et patio au crépuscule.", ar: "تجربتنا المميزة: أتاي ووليمة منزلية وصحن الرياض عند الغروب." },
    duration: { en: "3 hours", fr: "3 heures", ar: "3 ساعات" }, price: 65, maxGuests: 10, image: hero,
    included: [
      { en: "Mint tea ceremony", fr: "Cérémonie du thé", ar: "طقس الأتاي" },
      { en: "4-course dinner", fr: "Dîner 4 plats", ar: "عشاء من 4 أطباق" },
      { en: "Fresh juices", fr: "Jus frais", ar: "عصائر طازجة" },
    ],
  },
  {
    id: "cook-and-dine",
    title: { en: "Cook & Dine Workshop", fr: "Atelier cuisiner & dîner", ar: "ورشة الطبخ والعشاء" },
    blurb: { en: "Hands in the dough: cook three dishes with your host, then eat them together.", fr: "Les mains dans la pâte : trois plats avec votre hôte, puis à table.", ar: "اطبخ ثلاثة أطباق مع مضيفك ثم تناولها معاً." },
    duration: { en: "4.5 hours", fr: "4 h 30", ar: "4 ساعات ونصف" }, price: 89, maxGuests: 8, image: cooking,
    included: [
      { en: "Spice market walk", fr: "Balade au souk aux épices", ar: "جولة في سوق التوابل" },
      { en: "Hands-on cooking class", fr: "Cours de cuisine pratique", ar: "درس طبخ تطبيقي" },
      { en: "Dinner & recipe cards", fr: "Dîner & fiches recettes", ar: "العشاء وبطاقات الوصفات" },
    ],
  },
  {
    id: "friday-couscous",
    title: { en: "Friday Couscous Lunch", fr: "Couscous du vendredi", ar: "غداء كسكس الجمعة" },
    blurb: { en: "Join the most sacred meal of the Moroccan week, the way families share it.", fr: "Le repas le plus important de la semaine, partagé en famille.", ar: "شارك أهم وجبة في الأسبوع المغربي كما تتقاسمها العائلات." },
    duration: { en: "2.5 hours", fr: "2 h 30", ar: "ساعتان ونصف" }, price: 49, maxGuests: 12, image: family,
    included: [
      { en: "Seven-vegetable couscous", fr: "Couscous aux sept légumes", ar: "كسكس بسبع خضار" },
      { en: "Lben & dessert", fr: "Lben & dessert", ar: "اللبن والحلوى" },
    ],
  },
];

export type Family = { id: string; name: L10n; area: L10n; languages: L10n; dish: L10n; story: L10n; image: string };

export const families: Family[] = [
  {
    id: "amrani", image: family,
    name: { en: "The Amrani Family", fr: "La famille Amrani", ar: "عائلة العمراني" },
    area: { en: "Riad Zitoun", fr: "Riad Zitoun", ar: "رياض الزيتون" },
    languages: { en: "Arabic, French, English", fr: "Arabe, français, anglais", ar: "العربية، الفرنسية، الإنجليزية" },
    dish: { en: "Lamb tagine with prunes", fr: "Tajine d'agneau aux pruneaux", ar: "طاجين اللحم بالبرقوق" },
    story: { en: "Youssef and Khadija have hosted friends in this riad for twenty years; their daughter Lina now leads the tea.", fr: "Youssef et Khadija reçoivent dans ce riad depuis vingt ans ; leur fille Lina sert désormais le thé.", ar: "يستقبل يوسف وخديجة الضيوف في هذا الرياض منذ عشرين عاماً، وابنتهما لينا تقدّم الأتاي الآن." },
  },
  {
    id: "benali", image: cooking,
    name: { en: "Lalla Fatima & daughters", fr: "Lalla Fatima & ses filles", ar: "لالة فاطمة وبناتها" },
    area: { en: "Mouassine", fr: "Mouassine", ar: "المواسين" },
    languages: { en: "Arabic, French", fr: "Arabe, français", ar: "العربية، الفرنسية" },
    dish: { en: "Hand-rolled couscous", fr: "Couscous roulé à la main", ar: "كسكس مفتول باليد" },
    story: { en: "Three generations, one kitchen. Lalla Fatima learned couscous at six and still rolls it every Friday.", fr: "Trois générations, une cuisine. Lalla Fatima roule le couscous depuis ses six ans.", ar: "ثلاثة أجيال في مطبخ واحد. تعلمت لالة فاطمة فتل الكسكس في السادسة وما زالت تفتله كل جمعة." },
  },
  {
    id: "idrissi", image: hero,
    name: { en: "The Idrissi Brothers", fr: "Les frères Idrissi", ar: "الإخوة الإدريسي" },
    area: { en: "Kasbah", fr: "Kasbah", ar: "القصبة" },
    languages: { en: "Arabic, English, Spanish", fr: "Arabe, anglais, espagnol", ar: "العربية، الإنجليزية، الإسبانية" },
    dish: { en: "Pastilla with pigeon", fr: "Pastilla au pigeon", ar: "بسطيلة الحمام" },
    story: { en: "Former restaurant cooks who returned home to cook their mother's recipes for guests at her table.", fr: "Anciens cuisiniers revenus cuisiner les recettes de leur mère à sa propre table.", ar: "طاهيان سابقان عادا إلى البيت ليطبخا وصفات والدتهما للضيوف على مائدتها." },
  },
];

export const menu: { course: L10n; dish: L10n; note: L10n }[] = [
  { course: { en: "To welcome", fr: "Bienvenue", ar: "للترحيب" }, dish: { en: "Mint tea & msemen", fr: "Thé à la menthe & msemen", ar: "أتاي بالنعناع ومسمن" }, note: { en: "with argan honey", fr: "au miel d'argan", ar: "مع عسل الأركان" } },
  { course: { en: "Starters", fr: "Entrées", ar: "المقبلات" }, dish: { en: "Zaalouk, taktouka & harira", fr: "Zaalouk, taktouka & harira", ar: "زعلوك، تكتوكة وحريرة" }, note: { en: "seasonal salads", fr: "salades de saison", ar: "سلطات موسمية" } },
  { course: { en: "Main", fr: "Plat", ar: "الطبق الرئيسي" }, dish: { en: "Chicken tagine, preserved lemon & olives", fr: "Tajine de poulet, citron confit & olives", ar: "طاجين الدجاج بالحامض المرقد والزيتون" }, note: { en: "cooked over charcoal", fr: "cuit au charbon", ar: "مطهو على الفحم" } },
  { course: { en: "Dessert", fr: "Dessert", ar: "الحلوى" }, dish: { en: "Orange blossom oranges & cinnamon", fr: "Oranges à la fleur d'oranger & cannelle", ar: "برتقال بماء الزهر والقرفة" }, note: { en: "and gazelle horns", fr: "et cornes de gazelle", ar: "وكعب الغزال" } },
];

export const reviews: { quote: L10n; author: string; origin: string }[] = [
  { quote: { en: "The highlight of our whole trip. We came as tourists and left with an invitation to come back for Eid.", fr: "Le moment fort de notre voyage. Venus en touristes, repartis avec une invitation pour l'Aïd.", ar: "أجمل لحظة في رحلتنا. جئنا سياحاً وغادرنا بدعوة للعودة في العيد." }, author: "Sarah & Tom", origin: "London" },
  { quote: { en: "Khadija's tagine ruined every restaurant for me.", fr: "Le tajine de Khadija m'a gâché tous les restaurants.", ar: "طاجين خديجة أفسد عليّ كل المطاعم." }, author: "Julien", origin: "Lyon" },
  { quote: { en: "Warm, unhurried and real. My kids still talk about rolling couscous.", fr: "Chaleureux, sans hâte et vrai. Mes enfants en parlent encore.", ar: "دافئة وهادئة وحقيقية. أطفالي ما زالوا يتحدثون عن فتل الكسكس." }, author: "Maria", origin: "Madrid" },
];

export const faqs: { q: L10n; a: L10n }[] = [
  { q: { en: "Can you accommodate dietary needs?", fr: "Adaptez-vous les régimes alimentaires ?", ar: "هل تراعون الاحتياجات الغذائية؟" }, a: { en: "Yes — vegetarian, vegan and most allergies. Just tell us when booking.", fr: "Oui — végétarien, végan et la plupart des allergies. Précisez-le à la réservation.", ar: "نعم — نباتي ونباتي صرف ومعظم الحساسيات. أخبرنا عند الحجز." } },
  { q: { en: "How do we find the riad?", fr: "Comment trouver le riad ?", ar: "كيف نصل إلى الرياض؟" }, a: { en: "A family member meets you at a landmark nearby and walks you in through the medina.", fr: "Un membre de la famille vous retrouve à un point de repère proche et vous guide.", ar: "يلتقيك أحد أفراد العائلة عند معلم قريب ويرافقك عبر المدينة." } },
  { q: { en: "Is it suitable for children?", fr: "Est-ce adapté aux enfants ?", ar: "هل التجربة مناسبة للأطفال؟" }, a: { en: "Absolutely. Children under 6 join free.", fr: "Absolument. Gratuit pour les moins de 6 ans.", ar: "بالتأكيد. الأطفال دون 6 سنوات مجاناً." } },
  { q: { en: "What is your cancellation policy?", fr: "Quelle est la politique d'annulation ?", ar: "ما سياسة الإلغاء؟" }, a: { en: "Free cancellation up to 48 hours before your evening. (Placeholder policy)", fr: "Annulation gratuite jusqu'à 48 h avant. (Politique d'exemple)", ar: "إلغاء مجاني حتى 48 ساعة قبل الأمسية. (سياسة مثال)" } },
];
