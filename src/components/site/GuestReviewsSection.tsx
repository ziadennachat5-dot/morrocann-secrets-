import { useState } from "react";
import { Star, Quote, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

export interface GuestReviewItem {
  author: string;
  badge: { en: string; fr: string; ar: string };
  timeAgo: { en: string; fr: string; ar: string };
  quote: { en: string; fr: string; ar: string };
  rating: number;
}

export const REAL_GOOGLE_REVIEWS: GuestReviewItem[] = [
  {
    author: "BrenEnAJ Bosma",
    badge: {
      en: "Local Guide · 23 reviews",
      fr: "Local Guide · 23 avis",
      ar: "مرشد محلي · 23 تقييماً",
    },
    timeAgo: { en: "7 months ago", fr: "il y a 7 mois", ar: "منذ 7 أشهر" },
    rating: 5,
    quote: {
      en: "Beautiful and heartwarming experience to have Iftar in Said’s family home. The food was amazing, the best we had in Morocco. We felt so welcome and it was very nice to speak to Said and his family members. It was an honor to be your guest, Said, thank you again. We recommend everyone who is interested in an authentic Moroccan experience to contact Said and book dinner or lunch with this kind and lovely family.",
      fr: "Une expérience magnifique et réconfortante de partager l'Iftar dans la maison familiale de Saïd. La nourriture était incroyable, la meilleure que nous ayons mangée au Maroc. Nous nous sommes sentis tellement bien accueillis et c'était un plaisir d'échanger avec Saïd et sa famille. Ce fut un honneur d'être vos invités, Saïd, merci encore. Nous recommandons vivement à tous ceux qui recherchent une expérience marocaine authentique de réserver avec cette famille si gentille et bienveillante.",
      ar: "تجربة رائعة وتثلج الصدر بالإفطار في بيت عائلة سعيد. كان الطعام مذهلاً وأفضل ما تذوقناه في المغرب. شعرنا بحفاوة ترحيب كبيرة وكان الحديث مع سعيد وأفراد عائلته جميلاً جداً. لقد كان شرفاً لنا أن نكون ضيوفك يا سعيد، شكراً جزيلاً لك. نوصي بشدة كل من يبحث عن تجربة مغربية أصيلة بالتواصل مع سعيد وحجز عشاء أو غداء مع هذه العائلة الكريمة.",
    },
  },
  {
    author: "Vlada Ivanova",
    badge: {
      en: "Local Guide · 9 reviews",
      fr: "Local Guide · 9 avis",
      ar: "مرشد محلي · 9 تقييمات",
    },
    timeAgo: { en: "1 year ago", fr: "il y a 1 an", ar: "منذ سنة" },
    rating: 5,
    quote: {
      en: "An amazing experience! Dinner with a local family according to Moroccan traditions—very tasty and authentic. Thank you to the family for their hospitality. It was the most delicious dinner of several courses and dessert during our entire vacation in Morocco, better than any restaurant! We highly recommend it.",
      fr: "Une expérience incroyable ! Un dîner avec une famille locale selon les pures traditions marocaines — délicieux et authentique. Merci à la famille pour leur hospitalité. C'était le dîner le plus délicieux de toutes nos vacances au Maroc avec plusieurs plats et desserts, bien meilleur que dans n'importe quel restaurant ! Nous le recommandons vivement.",
      ar: "تجربة مدهشة! عشاء مع عائلة محلية وفقاً للتقاليد المغربية الأصيلة — لذيذ للغاية وأصيل. شكراً للعائلة على كرم ضيافتهم. كان ألذ عشاء متعدد الأطباق والحلويات طوال عطلتنا في المغرب، أفضل بكثير من أي مطعم! نوصي به بشدة.",
    },
  },
  {
    author: "Simone Nuck",
    badge: {
      en: "Local Guide · 30 reviews",
      fr: "Local Guide · 30 avis",
      ar: "مرشد محلي · 30 تقييماً",
    },
    timeAgo: { en: "9 months ago", fr: "il y a 9 mois", ar: "منذ 9 أشهر" },
    rating: 5,
    quote: {
      en: "Best experience and really best food in Marrakech! We were warmly and impeccably welcomed by Said and his entire family. We had dinner with them in a beautiful privately owned home. The food was outstanding and cooked with so much love.",
      fr: "La meilleure expérience et vraiment la meilleure nourriture de Marrakech ! Nous avons été accueillis chaleureusement et impeccablement par Saïd et toute sa famille. Nous avons dîné avec eux dans une magnifique maison privée. La nourriture était remarquable et préparée avec tellement d'amour.",
      ar: "أفضل تجربة وألذ طعام في مراكش على الإطلاق! استقبلنا سعيد وعائلته الكريمة بحرارة وإتقان. تناولنا العشاء معهم في منزلهم الخاص الجميل. كان الطعام استثنائياً ومطهواً بكثير من الحب.",
    },
  },
  {
    author: "Ronnie van Venrooij",
    badge: {
      en: "Local Guide · 11 reviews",
      fr: "Local Guide · 11 avis",
      ar: "مرشد محلي · 11 تقييماً",
    },
    timeAgo: { en: "6 months ago", fr: "il y a 6 mois", ar: "منذ 6 أشهر" },
    rating: 5,
    quote: {
      en: "A truly enjoyable and well-organized experience from start to finish. We were warmly welcomed by Said and immediately felt at ease. He gave us a short but interesting tour, which was a great addition to the overall experience.",
      fr: "Une expérience vraiment agréable et parfaitement organisée du début à la fin. Nous avons été chaleureusement accueillis par Saïd et nous nous sommes immédiatement sentis à l'aise. Il nous a offert une visite courte mais passionnante du quartier, ce qui a été un formidable plus à l'expérience.",
      ar: "تجربة ممتعة ومنظمة بشكل ممتاز من البداية إلى النهاية. استقبلنا سعيد بدفء وشعرنا بالراحة والاطمئنان على الفور. أخذنا في جولة قصيرة لكنها شيقة للغاية في الحي، مما أضاف لمسة رائعة للتجربة بأكملها.",
    },
  },
  {
    author: "Marco Fusaro",
    badge: {
      en: "Local Guide · 44 reviews",
      fr: "Local Guide · 44 avis",
      ar: "مرشد محلي · 44 تقييماً",
    },
    timeAgo: { en: "1 year ago", fr: "il y a 1 an", ar: "منذ سنة" },
    rating: 5,
    quote: {
      en: "An unforgettable and truly authentic Moroccan experience. From the moment we stepped into the house, we felt like part of the family. The meal was absolutely delicious, homemade, rich in flavour, and served with such warmth and generosity.",
      fr: "Une expérience marocaine inoubliable et profondément authentique. Dès que nous avons franchi la porte de la maison, nous nous sommes sentis comme des membres de la famille. Le repas était absolument succulent, fait maison, riche en saveurs et servi avec une générosité et une chaleur immenses.",
      ar: "تجربة مغربية لا تُنسى وأصيلة بامتياز. منذ لحظة دخولنا المنزل، شعرنا وكأننا جزء من العائلة. كانت الوجبة لذيذة للغاية، محضرة منزلياً بنكهات غنية، وقُدمت بكل دفء وكرم.",
    },
  },
  {
    author: "dwight hwang",
    badge: {
      en: "Google Review · 7 reviews",
      fr: "Avis Google · 7 avis",
      ar: "تقييم جوجل · 7 تقييمات",
    },
    timeAgo: { en: "1 month ago", fr: "il y a 1 mois", ar: "منذ شهر" },
    rating: 5,
    quote: {
      en: "My family of three were welcomed into Said’s home and we had a wonderfully unique evening of delicious home-cooked meal and learning with his very hospitable family. Said is very friendly and considerate. He explains all the cultural traditions with great care.",
      fr: "Ma famille de trois personnes a été accueillie dans la maison de Saïd et nous avons passé une soirée merveilleusement unique, avec un délicieux repas fait maison et des échanges enrichissants avec sa famille si accueillante. Saïd est très sympathique et attentionné. Il explique toutes les traditions culturelles avec grand soin.",
      ar: "تم الترحيب بعائلتي المكونة من ثلاثة أفراد في منزل سعيد، وقضينا أمسية فريدة ورائعة استمتعنا فيها بوجبة منزلية لذيذة وتعرفنا على الثقافة مع عائلته المضيافة للغاية. سعيد ودود ومحب للغاية ويشرح جميع التقاليد الثقافية بعناية فائقة.",
    },
  },
  {
    author: "Cathy Stresing",
    badge: {
      en: "Google Review · 15 reviews",
      fr: "Avis Google · 15 avis",
      ar: "تقييم جوجل · 15 تقييماً",
    },
    timeAgo: { en: "1 year ago", fr: "il y a 1 an", ar: "منذ سنة" },
    rating: 5,
    quote: {
      en: "We were made to feel like family from the moment we met Said. The welcome from his family made the evening exceptional. The food was wonderful but it was really secondary to the experience! Getting to dress up in traditional Moroccan clothes was a fun and unique experience!",
      fr: "Nous nous sommes sentis comme en famille dès notre rencontre avec Saïd. L'accueil chaleureux de sa famille a rendu cette soirée exceptionnelle. La nourriture était formidable, mais le vrai plus était l'expérience humaine ! Pouvoir s'habiller avec des vêtements traditionnels marocains a été un moment très amusant et unique !",
      ar: "شعرنا وكأننا من أهل البيت منذ اللحظة الأولى التي التقينا فيها بسعيد. كان ترحيب عائلته كفيلاً بجعل الأمسية استثنائية. الطعام كان رائعاً، لكن التجربة الإنسانية كانت الأجمل! وارتداء الملابس التقليدية المغربية كان تجربة ممتعة ومميزة حقاً!",
    },
  },
  {
    author: "Jeremy Iggers",
    badge: {
      en: "Local Guide · 7 reviews",
      fr: "Local Guide · 7 avis",
      ar: "مرشد محلي · 7 تقييمات",
    },
    timeAgo: { en: "6 months ago", fr: "il y a 6 mois", ar: "منذ 6 أشهر" },
    rating: 5,
    quote: {
      en: "My group had a delightful time with Said and his family. We started with a short walking tour of the neighborhood, and then sat down to a delicious Moroccan dinner. But the real highlight of the evening was the hospitality, and the family’s warm welcome. Highly recommended.",
      fr: "Mon groupe a passé un moment délicieux avec Saïd et sa famille. Nous avons commencé par une petite balade dans le quartier, avant de nous asseoir pour un savoureux dîner marocain. Mais le véritable point fort de la soirée a été l'hospitalité et l'accueil chaleureux de la famille. Hautement recommandé.",
      ar: "قضت مجموعتي وقتاً ممتعاً للغاية مع سعيد وعائلته. بدأنا بجولة مشي قصيرة في الحي، ثم جلسنا لتناول عشاء مغربي لذيذ. لكن النقطة الأبرز في الأمسية كانت حسن الضيافة والترحيب الدافئ من العائلة. نوصي بها بشدة.",
    },
  },
  {
    author: "Joshua Belk",
    badge: {
      en: "Google Review · 3 reviews",
      fr: "Avis Google · 3 avis",
      ar: "تقييم جوجل · 3 تقييمات",
    },
    timeAgo: { en: "8 months ago", fr: "il y a 8 mois", ar: "منذ 8 أشهر" },
    rating: 5,
    quote: {
      en: "What can I say, one of the best parts of my trip. Very welcoming, very kind, and Said’s family was very polite. The food was the best that I had while in Morocco and really felt at home. If you get a chance to try, you will not regret the experience!",
      fr: "Que dire, l'un des meilleurs moments de tout mon voyage. Très accueillants, très gentils, et la famille de Saïd était d'une politesse remarquable. La nourriture était la meilleure que j'ai mangée au Maroc et je me suis vraiment senti comme chez moi. Si vous en avez l'occasion, vous ne regretterez pas l'expérience !",
      ar: "ماذا عساي أن أقول، كانت هذه من أفضل محطات رحلتي. ترحيب كبير، لطف بالغ، وعائلة سعيد مهذبة جداً. الطعام كان الأفضل على الإطلاق خلال إقامتي في المغرب وشعرت حقاً كأنني في بيتي. إذا سنحت لك الفرصة، فلن تندم أبداً على هذه التجربة!",
    },
  },
  {
    author: "Shray Patel",
    badge: {
      en: "Local Guide · 23 reviews",
      fr: "Local Guide · 23 avis",
      ar: "مرشد محلي · 23 تقييماً",
    },
    timeAgo: { en: "1 year ago", fr: "il y a 1 an", ar: "منذ سنة" },
    rating: 5,
    quote: {
      en: "Said, thank you to you and your family for an amazing meal and conversations we can share together. We had a wonderful time learning a lot about your family and traditional Moroccan costumes! Amazing food and they even surprised us with a very special birthday surprise for our friend! Thank you for your kind hospitality!",
      fr: "Saïd, merci à toi et à ta famille pour ce repas incroyable et ces riches échanges. Nous avons passé un merveilleux moment à en apprendre davantage sur votre famille et les costumes traditionnels marocains ! La nourriture était fantastique et ils nous ont même préparé une attention surprise pour l'anniversaire de notre ami ! Merci pour votre gentillesse et votre généreuse hospitalité !",
      ar: "سعيد، شكراً لك ولعائلتك الكريمة على هذه الوجبة الرائعة والحديث الجميل الذي شاركناه معاً. قضينا وقتاً ممتعاً وتعرفنا على عائلتك والأزياء المغربية التقليدية! طعام مذهل حتى أنهم فاجأونا باحتفال خاص جداً بمناسبة عيد ميلاد صديقنا! شكراً على كرم ضيافتكم ولطفكم!",
    },
  },
];

export function GuestReviewsSection() {
  const { lang } = useI18n();
  const [showAll, setShowAll] = useState(false);

  const displayedReviews = showAll ? REAL_GOOGLE_REVIEWS : REAL_GOOGLE_REVIEWS.slice(0, 6);

  const titles = {
    eyebrow: {
      en: "GUEST REVIEWS · 5.0 ★ ON GOOGLE",
      fr: "AVIS DE NOS INVITÉS · 5,0 ★ SUR GOOGLE",
      ar: "آراء ضيوفنا · 5.0 ★ على جوجل",
    },
    title: {
      en: "Remembered long after the trip",
      fr: "Un souvenir gravé bien après le voyage",
      ar: "ذكريات تبقى طويلاً في البال",
    },
    subtitle: {
      en: "Real impressions shared by travelers who sat at Said’s family table in Marrakech Medina.",
      fr: "Les retours authentiques de voyageurs accueillis à la table familiale de Saïd dans la Médina de Marrakech.",
      ar: "تجارب وشهادات حقيقية من مسافرين شاركوا مائدة عائلة سعيد في قلب المدينة العتيقة بمراكش.",
    },
    showMore: {
      en: `Show all ${REAL_GOOGLE_REVIEWS.length} reviews`,
      fr: `Voir les ${REAL_GOOGLE_REVIEWS.length} avis`,
      ar: `عرض جميع التقييمات (${REAL_GOOGLE_REVIEWS.length})`,
    },
    showLess: {
      en: "Show less",
      fr: "Afficher moins",
      ar: "عرض أقل",
    },
    verifiedGoogle: {
      en: "Google Review · 5.0 ★",
      fr: "Avis Google · 5,0 ★",
      ar: "تقييم جوجل · 5.0 ★",
    },
  };

  return (
    <section
      id="reviews"
      className="scroll-mt-20 bg-cream section-pad border-t border-stone-300/40"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="ms-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 mb-3">
            <div className="flex items-center text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-oxblood tracking-wide">
              {titles.eyebrow[lang]}
            </span>
          </div>
          <h2 className="text-oxblood font-display font-semibold text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] tracking-tight mb-3">
            {titles.title[lang]}
          </h2>
          <p className="text-ink/80 text-sm sm:text-base leading-relaxed">
            {titles.subtitle[lang]}
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {displayedReviews.map((item, idx) => (
            <article
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-soft hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Decorative top quote mark */}
              <Quote
                className="absolute top-4 end-4 w-8 h-8 text-gold/15 pointer-events-none select-none"
                aria-hidden="true"
              />

              <div>
                {/* Header: Author Avatar & Name & Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full bg-oxblood text-white flex items-center justify-center font-display font-bold text-base shrink-0 shadow-xs"
                    aria-hidden="true"
                  >
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-oxblood text-base truncate">
                      {item.author}
                    </h3>
                    <p className="text-xs text-muted-text truncate">{item.badge[lang]}</p>
                  </div>
                </div>

                {/* Rating Stars + Time Ago */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center text-gold" aria-label="5 out of 5 stars">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-text">{item.timeAgo[lang]}</span>
                </div>

                {/* Review Text */}
                <p className="text-ink/90 text-sm leading-relaxed italic">
                  "{item.quote[lang]}"
                </p>
              </div>

              {/* Card Footer: Verified Google Check */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-muted-text">
                <span className="inline-flex items-center gap-1 text-oxblood font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-moss shrink-0" />
                  {titles.verifiedGoogle[lang]}
                </span>
                <span className="text-[11px] text-muted-text uppercase tracking-wider font-semibold">
                  Said's Table
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Toggle Button for More Reviews */}
        <div className="mt-10 sm:mt-12 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-oxblood/30 bg-white text-oxblood font-semibold text-sm hover:bg-oxblood hover:text-white transition-colors shadow-soft cursor-pointer active:scale-98"
          >
            <span>{showAll ? titles.showLess[lang] : titles.showMore[lang]}</span>
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}

