import type { Lang } from "./i18n";

type Localized = Record<Lang, string>;
type LegalDraft = {
  sections: { heading: Localized; body: Localized }[];
};

export const legalDrafts: Record<"privacy" | "terms" | "cancellation", LegalDraft> = {
  privacy: {
    sections: [
      {
        heading: {
          en: "Information handled",
          fr: "Informations traitées",
          ar: "المعلومات التي تتم معالجتها",
        },
        body: {
          en: "The service may handle the contact details and information you submit in booking requests, inquiries, dietary notes, and messages. Please do not send information that is not needed for your request.",
          fr: "Le service peut traiter les coordonnées et les informations que vous transmettez dans vos demandes de réservation, formulaires, notes alimentaires et messages. N'envoyez pas d'informations qui ne sont pas nécessaires à votre demande.",
          ar: "قد تعالج الخدمة بيانات الاتصال والمعلومات التي ترسلها في طلبات الحجز والاستفسارات وملاحظات الطعام والرسائل. يرجى عدم إرسال معلومات غير لازمة لطلبك.",
        },
      },
      {
        heading: {
          en: "Why information is used",
          fr: "Utilisation des informations",
          ar: "أسباب استخدام المعلومات",
        },
        body: {
          en: "Information is intended to be used to respond to you, administer booking requests, protect the service from misuse, and meet applicable legal obligations. The operator must confirm these purposes and the applicable legal basis before publication.",
          fr: "Les informations sont destinées à répondre à vos demandes, gérer les réservations, protéger le service contre les abus et respecter les obligations légales applicables. L'exploitant doit confirmer ces finalités et la base juridique applicable avant publication.",
          ar: "يُقصد استخدام المعلومات للرد عليك وإدارة طلبات الحجز وحماية الخدمة من إساءة الاستخدام والوفاء بالالتزامات القانونية المعمول بها. يجب على المشغل تأكيد هذه الأغراض والأساس القانوني قبل النشر.",
        },
      },
      {
        heading: {
          en: "Providers and retention",
          fr: "Prestataires et conservation",
          ar: "مقدمو الخدمات والاحتفاظ",
        },
        body: {
          en: "The operator must identify the hosting, database, and email providers actually used, set a retention period, and describe any transfers before this notice is published. No retention period or transfer arrangement is asserted in this draft.",
          fr: "Avant publication, l'exploitant doit identifier les prestataires d'hébergement, de base de données et de messagerie réellement utilisés, fixer une durée de conservation et décrire les éventuels transferts. Ce brouillon ne fixe aucune durée ni modalité de transfert.",
          ar: "يجب على المشغل تحديد مزودي الاستضافة وقاعدة البيانات والبريد المستخدمين فعلياً، وتحديد مدة الاحتفاظ، وشرح أي عمليات نقل قبل نشر هذا الإشعار. لا تحدد هذه المسودة مدة احتفاظ أو ترتيبات نقل.",
        },
      },
      {
        heading: {
          en: "Your choices and contact",
          fr: "Vos choix et contact",
          ar: "خياراتك والتواصل",
        },
        body: {
          en: "Before launch, the operator must add a monitored privacy contact and confirm how requests to access, correct, or delete information will be handled under applicable law.",
          fr: "Avant le lancement, l'exploitant doit indiquer un contact confidentialité suivi et confirmer la procédure applicable aux demandes d'accès, de rectification ou de suppression conformément au droit applicable.",
          ar: "قبل الإطلاق، يجب على المشغل إضافة وسيلة تواصل للخصوصية ومراجعتها بانتظام، وتحديد كيفية التعامل مع طلبات الوصول إلى المعلومات أو تصحيحها أو حذفها وفق القانون المعمول به.",
        },
      },
    ],
  },
  terms: {
    sections: [
      {
        heading: { en: "Booking requests", fr: "Demandes de réservation", ar: "طلبات الحجز" },
        body: {
          en: "Submitting a form sends a request, not a confirmed reservation. A reservation exists only after the host explicitly confirms it. The inquiry and gift forms do not take payment.",
          fr: "L'envoi d'un formulaire constitue une demande, pas une réservation confirmée. La réservation n'existe qu'après confirmation explicite de l'hôte. Les formulaires de demande et de cadeau ne prélèvent aucun paiement.",
          ar: "إرسال النموذج هو طلب وليس حجزاً مؤكداً. لا يصبح الحجز قائماً إلا بعد تأكيد المضيف صراحةً. لا تحصّل نماذج الاستفسار والهدايا أي مبلغ.",
        },
      },
      {
        heading: { en: "Experience details", fr: "Détails des expériences", ar: "تفاصيل التجارب" },
        body: {
          en: "Details, availability, prices, meeting arrangements, and included items must be confirmed for the specific request by the host. Published information may be updated when the host corrects it.",
          fr: "L'hôte doit confirmer les détails, disponibilités, prix, modalités de rendez-vous et éléments inclus pour chaque demande. Les informations publiées peuvent être mises à jour par l'hôte.",
          ar: "يجب على المضيف تأكيد التفاصيل والتوفر والأسعار وترتيبات اللقاء وما يشمله العرض لكل طلب. وقد يقوم المضيف بتحديث المعلومات المنشورة.",
        },
      },
      {
        heading: {
          en: "Guest information and conduct",
          fr: "Informations et comportement des invités",
          ar: "معلومات الضيوف والسلوك",
        },
        body: {
          en: "Please provide accurate contact and party details, and share relevant dietary or access needs in advance. The operator must review and complete these terms with any applicable conduct, accessibility, and safety requirements before launch.",
          fr: "Veuillez fournir des coordonnées et informations exactes sur votre groupe et signaler à l'avance les besoins alimentaires ou d'accessibilité utiles. L'exploitant doit compléter ces conditions avec les règles applicables de conduite, d'accessibilité et de sécurité avant le lancement.",
          ar: "يرجى تقديم بيانات اتصال ومعلومات دقيقة عن المجموعة، وإبلاغ المضيف مسبقاً بالاحتياجات الغذائية أو المتعلقة بإمكانية الوصول. يجب على المشغل مراجعة هذه الشروط واستكمال متطلبات السلوك وإمكانية الوصول والسلامة قبل الإطلاق.",
        },
      },
      {
        heading: { en: "Operator details", fr: "Coordonnées de l'exploitant", ar: "بيانات المشغل" },
        body: {
          en: "The legal name, business address, registration details, applicable law, and dispute contact must be supplied and reviewed by a qualified professional before publication.",
          fr: "La dénomination légale, l'adresse professionnelle, les informations d'enregistrement, le droit applicable et le contact relatif aux litiges doivent être fournis et vérifiés par un professionnel qualifié avant publication.",
          ar: "يجب تقديم الاسم القانوني والعنوان المهني وبيانات التسجيل والقانون المعمول به ووسيلة التواصل بشأن النزاعات ومراجعتها من مختص قبل النشر.",
        },
      },
    ],
  },
  cancellation: {
    sections: [
      {
        heading: {
          en: "Current draft status",
          fr: "État actuel du brouillon",
          ar: "حالة المسودة الحالية",
        },
        body: {
          en: "No cancellation period or refund promise is established by this draft. Booking requests remain unavailable until the operator adds and reviews a complete cancellation policy in English, French, and Arabic.",
          fr: "Ce brouillon ne fixe aucun délai d'annulation ni remboursement. Les demandes de réservation restent indisponibles tant que l'exploitant n'a pas ajouté et vérifié une politique complète en anglais, français et arabe.",
          ar: "لا تحدد هذه المسودة مهلة للإلغاء أو وعداً باسترداد الأموال. تظل طلبات الحجز غير متاحة حتى يضيف المشغل سياسة إلغاء كاملة بالإنجليزية والفرنسية والعربية ويراجعها.",
        },
      },
      {
        heading: {
          en: "How to request a change",
          fr: "Demander une modification",
          ar: "كيفية طلب التغيير",
        },
        body: {
          en: "For a confirmed reservation, use the contact channel stated in the host's confirmation correspondence and include the booking reference. The host must confirm any change or cancellation in writing.",
          fr: "Pour une réservation confirmée, utilisez le moyen de contact indiqué dans la confirmation de l'hôte et joignez la référence de réservation. L'hôte doit confirmer par écrit toute modification ou annulation.",
          ar: "للحجز المؤكد، استخدم وسيلة التواصل الواردة في رسالة تأكيد المضيف وأرفق رقم الحجز. يجب على المضيف تأكيد أي تغيير أو إلغاء كتابياً.",
        },
      },
      {
        heading: { en: "Before publication", fr: "Avant publication", ar: "قبل النشر" },
        body: {
          en: "The operator must define deadlines, refund handling, guest and host cancellations, no-shows, and any exceptional circumstances, then obtain professional review under applicable law.",
          fr: "L'exploitant doit définir les délais, les remboursements, les annulations par le client ou l'hôte, les absences et les circonstances exceptionnelles, puis faire vérifier le texte au regard du droit applicable.",
          ar: "يجب على المشغل تحديد المهل والتعامل مع المبالغ المستردة وإلغاء الضيوف والمضيف وعدم الحضور والظروف الاستثنائية، ثم طلب مراجعة النص وفق القانون المعمول به.",
        },
      },
    ],
  },
};
