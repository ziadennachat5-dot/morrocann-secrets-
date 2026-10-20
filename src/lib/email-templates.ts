import { BRAND_NAME } from "./brand";
import type { Lang } from "./i18n";

export type BookingEmailKind =
  | "booking_received"
  | "booking_confirmed"
  | "booking_reminder"
  | "booking_cancelled"
  | "review_request";

export type BookingEmailData = {
  guestName: string;
  experienceTitle: string;
  date: string;
  guests: number;
  bookingReference: string;
  meetingPoint: string;
  whatsappUrl: string;
  logoUrl: string;
  reviewUrl?: string;
};

type EmailCopy = {
  subject: string;
  title: string;
  greeting: string;
  intro: string;
  date: string;
  experience: string;
  guests: string;
  reference: string;
  meetingPoint: string;
  meetingPointFallback: string;
  whatsapp: string;
  review: string;
  footer: string;
};

const localizedCopy: Record<Lang, Record<BookingEmailKind, EmailCopy>> = {
  en: {
    booking_received: {
      subject: "We received your booking request",
      title: "Your request is with us",
      greeting: "Hello",
      intro:
        "Thank you. We have received your booking request and will follow up about confirmation.",
      date: "Date",
      experience: "Experience",
      guests: "Guests",
      reference: "Reference",
      meetingPoint: "Meeting point",
      meetingPointFallback: "Meeting point details will be shared directly before your visit.",
      whatsapp: "Contact us on WhatsApp",
      review: "Leave a review",
      footer: "A warm welcome from",
    },
    booking_confirmed: {
      subject: "Your booking is confirmed",
      title: "Your evening is confirmed",
      greeting: "Hello",
      intro: "Your booking is confirmed. We look forward to welcoming you.",
      date: "Date",
      experience: "Experience",
      guests: "Guests",
      reference: "Reference",
      meetingPoint: "Meeting point",
      meetingPointFallback: "Meeting point details will be shared directly before your visit.",
      whatsapp: "Contact us on WhatsApp",
      review: "Leave a review",
      footer: "A warm welcome from",
    },
    booking_reminder: {
      subject: "A reminder about your upcoming booking",
      title: "Your evening is coming up",
      greeting: "Hello",
      intro:
        "This is a reminder about your upcoming booking. Please contact us if you need to confirm any details.",
      date: "Date",
      experience: "Experience",
      guests: "Guests",
      reference: "Reference",
      meetingPoint: "Meeting point",
      meetingPointFallback: "Meeting point details will be shared directly before your visit.",
      whatsapp: "Contact us on WhatsApp",
      review: "Leave a review",
      footer: "A warm welcome from",
    },
    booking_cancelled: {
      subject: "Your booking has been cancelled",
      title: "Booking cancelled",
      greeting: "Hello",
      intro:
        "Your booking has been marked as cancelled. Contact us if you believe this is a mistake.",
      date: "Date",
      experience: "Experience",
      guests: "Guests",
      reference: "Reference",
      meetingPoint: "Meeting point",
      meetingPointFallback: "Meeting point details are not applicable to this cancelled booking.",
      whatsapp: "Contact us on WhatsApp",
      review: "Leave a review",
      footer: "A warm welcome from",
    },
    review_request: {
      subject: "How was your evening?",
      title: "Thank you for joining us",
      greeting: "Hello",
      intro:
        "We hope you enjoyed your evening. If you would like, share an honest review of your experience.",
      date: "Date",
      experience: "Experience",
      guests: "Guests",
      reference: "Reference",
      meetingPoint: "Meeting point",
      meetingPointFallback: "Meeting point details were shared directly before your visit.",
      whatsapp: "Contact us on WhatsApp",
      review: "Leave a review",
      footer: "A warm welcome from",
    },
  },
  fr: {
    booking_received: {
      subject: "Nous avons reçu votre demande de réservation",
      title: "Votre demande a bien été reçue",
      greeting: "Bonjour",
      intro:
        "Merci. Nous avons reçu votre demande et reviendrons vers vous pour confirmer la réservation.",
      date: "Date",
      experience: "Expérience",
      guests: "Personnes",
      reference: "Référence",
      meetingPoint: "Point de rendez-vous",
      meetingPointFallback:
        "Les détails du rendez-vous vous seront communiqués avant votre visite.",
      whatsapp: "Nous contacter sur WhatsApp",
      review: "Laisser un avis",
      footer: "Avec nos salutations chaleureuses,",
    },
    booking_confirmed: {
      subject: "Votre réservation est confirmée",
      title: "Votre soirée est confirmée",
      greeting: "Bonjour",
      intro: "Votre réservation est confirmée. Nous avons hâte de vous accueillir.",
      date: "Date",
      experience: "Expérience",
      guests: "Personnes",
      reference: "Référence",
      meetingPoint: "Point de rendez-vous",
      meetingPointFallback:
        "Les détails du rendez-vous vous seront communiqués avant votre visite.",
      whatsapp: "Nous contacter sur WhatsApp",
      review: "Laisser un avis",
      footer: "Avec nos salutations chaleureuses,",
    },
    booking_reminder: {
      subject: "Rappel concernant votre prochaine réservation",
      title: "Votre soirée approche",
      greeting: "Bonjour",
      intro:
        "Petit rappel concernant votre réservation. Contactez-nous si vous souhaitez confirmer un détail.",
      date: "Date",
      experience: "Expérience",
      guests: "Personnes",
      reference: "Référence",
      meetingPoint: "Point de rendez-vous",
      meetingPointFallback:
        "Les détails du rendez-vous vous seront communiqués avant votre visite.",
      whatsapp: "Nous contacter sur WhatsApp",
      review: "Laisser un avis",
      footer: "Avec nos salutations chaleureuses,",
    },
    booking_cancelled: {
      subject: "Votre réservation a été annulée",
      title: "Réservation annulée",
      greeting: "Bonjour",
      intro:
        "Votre réservation a été marquée comme annulée. Contactez-nous si cela vous semble incorrect.",
      date: "Date",
      experience: "Expérience",
      guests: "Personnes",
      reference: "Référence",
      meetingPoint: "Point de rendez-vous",
      meetingPointFallback:
        "Le point de rendez-vous ne s'applique pas à cette réservation annulée.",
      whatsapp: "Nous contacter sur WhatsApp",
      review: "Laisser un avis",
      footer: "Avec nos salutations chaleureuses,",
    },
    review_request: {
      subject: "Comment s'est passée votre soirée ?",
      title: "Merci d'avoir partagé ce moment avec nous",
      greeting: "Bonjour",
      intro:
        "Nous espérons que votre soirée vous a plu. Si vous le souhaitez, partagez un avis sincère sur votre expérience.",
      date: "Date",
      experience: "Expérience",
      guests: "Personnes",
      reference: "Référence",
      meetingPoint: "Point de rendez-vous",
      meetingPointFallback:
        "Les détails du rendez-vous vous ont été communiqués avant votre visite.",
      whatsapp: "Nous contacter sur WhatsApp",
      review: "Laisser un avis",
      footer: "Avec nos salutations chaleureuses,",
    },
  },
  ar: {
    booking_received: {
      subject: "لقد استلمنا طلب الحجز",
      title: "تم استلام طلبك",
      greeting: "مرحباً",
      intro: "شكراً لك. استلمنا طلب الحجز وسنتواصل معك لتأكيده.",
      date: "التاريخ",
      experience: "التجربة",
      guests: "عدد الضيوف",
      reference: "رقم المرجع",
      meetingPoint: "نقطة اللقاء",
      meetingPointFallback: "سنرسل إليك تفاصيل نقطة اللقاء مباشرة قبل زيارتك.",
      whatsapp: "تواصل معنا عبر واتساب",
      review: "اترك تقييماً",
      footer: "مع أطيب التحيات من",
    },
    booking_confirmed: {
      subject: "تم تأكيد حجزك",
      title: "تم تأكيد أمسيتك",
      greeting: "مرحباً",
      intro: "تم تأكيد حجزك. نتطلع إلى استقبالك.",
      date: "التاريخ",
      experience: "التجربة",
      guests: "عدد الضيوف",
      reference: "رقم المرجع",
      meetingPoint: "نقطة اللقاء",
      meetingPointFallback: "سنرسل إليك تفاصيل نقطة اللقاء مباشرة قبل زيارتك.",
      whatsapp: "تواصل معنا عبر واتساب",
      review: "اترك تقييماً",
      footer: "مع أطيب التحيات من",
    },
    booking_reminder: {
      subject: "تذكير بشأن حجزك القادم",
      title: "اقترب موعد أمسيتك",
      greeting: "مرحباً",
      intro: "هذا تذكير بشأن حجزك القادم. تواصل معنا إذا أردت تأكيد أي تفاصيل.",
      date: "التاريخ",
      experience: "التجربة",
      guests: "عدد الضيوف",
      reference: "رقم المرجع",
      meetingPoint: "نقطة اللقاء",
      meetingPointFallback: "سنرسل إليك تفاصيل نقطة اللقاء مباشرة قبل زيارتك.",
      whatsapp: "تواصل معنا عبر واتساب",
      review: "اترك تقييماً",
      footer: "مع أطيب التحيات من",
    },
    booking_cancelled: {
      subject: "تم إلغاء حجزك",
      title: "تم إلغاء الحجز",
      greeting: "مرحباً",
      intro: "تم وضع علامة الإلغاء على حجزك. تواصل معنا إذا كنت تعتقد أن ذلك غير صحيح.",
      date: "التاريخ",
      experience: "التجربة",
      guests: "عدد الضيوف",
      reference: "رقم المرجع",
      meetingPoint: "نقطة اللقاء",
      meetingPointFallback: "لا تنطبق تفاصيل نقطة اللقاء على هذا الحجز الملغى.",
      whatsapp: "تواصل معنا عبر واتساب",
      review: "اترك تقييماً",
      footer: "مع أطيب التحيات من",
    },
    review_request: {
      subject: "كيف كانت أمسيتك؟",
      title: "شكراً لانضمامك إلينا",
      greeting: "مرحباً",
      intro: "نأمل أن تكون قد استمتعت بأمسيتك. إذا رغبت، شاركنا رأيك الصادق حول تجربتك.",
      date: "التاريخ",
      experience: "التجربة",
      guests: "عدد الضيوف",
      reference: "رقم المرجع",
      meetingPoint: "نقطة اللقاء",
      meetingPointFallback: "أرسلنا إليك تفاصيل نقطة اللقاء مباشرة قبل زيارتك.",
      whatsapp: "تواصل معنا عبر واتساب",
      review: "اترك تقييماً",
      footer: "مع أطيب التحيات من",
    },
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

export function renderBookingEmail(
  kind: BookingEmailKind,
  language: Lang,
  data: BookingEmailData,
): { subject: string; html: string; text: string } {
  const copy = localizedCopy[language][kind];
  const rtl = language === "ar";
  const meetingPoint = data.meetingPoint.trim() || copy.meetingPointFallback;
  const emailRows: [string, string][] = [
    [copy.experience, data.experienceTitle],
    [copy.date, data.date],
    [copy.guests, String(data.guests)],
    [copy.reference, data.bookingReference],
    [copy.meetingPoint, meetingPoint],
  ];
  const rowsHtml = emailRows
    .map(
      ([label, value]) =>
        `<tr><th align="start" style="padding:10px;border-bottom:1px solid #eadfd2;color:#6b6259">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #eadfd2">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const reviewButton =
    kind === "review_request" && data.reviewUrl
      ? `<p style="margin:24px 0"><a href="${escapeHtml(data.reviewUrl)}" style="background:#8B1A1A;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${escapeHtml(copy.review)}</a></p>`
      : "";
  const subject = `${copy.subject} — ${BRAND_NAME}`;
  const html = `<!doctype html><html lang="${language}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head><body style="margin:0;background:#FDFCF9;color:#2A2A2A;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FDFCF9"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #eadfd2;border-radius:12px;overflow:hidden"><tr><td align="center" style="padding:24px;border-bottom:3px solid #C9A24B"><img src="${escapeHtml(data.logoUrl)}" alt="${escapeHtml(BRAND_NAME)}" width="200" style="display:block;width:200px;max-width:80%;height:auto"></td></tr><tr><td dir="${rtl ? "rtl" : "ltr"}" style="padding:28px"><h1 style="margin:0 0 16px;color:#8B1A1A;font-size:28px">${escapeHtml(copy.title)}</h1><p style="margin:0 0 8px">${escapeHtml(copy.greeting)} ${escapeHtml(data.guestName)},</p><p style="line-height:1.65">${escapeHtml(copy.intro)}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:20px">${rowsHtml}</table>${reviewButton}<p style="margin-top:24px"><a href="${escapeHtml(data.whatsappUrl)}" style="color:#2F5D34">${escapeHtml(copy.whatsapp)}</a></p><p style="margin-top:32px;color:#6b6259">${escapeHtml(copy.footer)}<br><strong>${escapeHtml(BRAND_NAME)}</strong></p></td></tr></table></td></tr></table></body></html>`;
  const text = [
    `${copy.title} — ${BRAND_NAME}`,
    `${copy.greeting} ${data.guestName},`,
    copy.intro,
    ...emailRows.map(([label, value]) => `${label}: ${value}`),
    ...(kind === "review_request" && data.reviewUrl ? [`${copy.review}: ${data.reviewUrl}`] : []),
    `${copy.whatsapp}: ${data.whatsappUrl}`,
    `${copy.footer} ${BRAND_NAME}`,
  ].join("\n\n");
  return { subject, html, text };
}
