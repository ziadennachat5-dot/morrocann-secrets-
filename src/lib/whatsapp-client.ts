export interface ClientWhatsappParams {
  phone: string;
  name?: string;
  experienceTitle?: string;
  date?: string;
  lang?: string;
}

export function formatClientWhatsappUrl({
  phone,
  name,
  experienceTitle,
  date,
  lang = "en",
}: ClientWhatsappParams): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  // Local Moroccan number: replace leading 0 with 212
  if (digits.startsWith("0") && digits.length === 10) {
    digits = "212" + digits.slice(1);
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Minimum length check for a valid mobile number with country code
  if (digits.length < 8) return null;

  const clientName = name?.trim() || "";
  const exp = experienceTitle ? ` "${experienceTitle}"` : "";
  const dateStr = date ? ` (${date})` : "";

  let greeting = "";
  if (lang === "fr") {
    greeting = clientName
      ? `Bonjour ${clientName}, c'est l'équipe de Moroccan Secrets concernant votre réservation${exp}${dateStr}. Comment pouvons-nous vous aider ?`
      : `Bonjour, c'est l'équipe de Moroccan Secrets concernant votre réservation${exp}${dateStr}. Comment pouvons-nous vous aider ?`;
  } else if (lang === "ar") {
    greeting = clientName
      ? `مرحباً ${clientName}، معك إدارة أسرار المغرب بخصوص حجزكم${exp}${dateStr}. نسعد بالتواصل معكم وتأكيد التفاصيل!`
      : `مرحباً، معك إدارة أسرار المغرب بخصوص حجزكم${exp}${dateStr}. نسعد بالتواصل معكم وتأكيد التفاصيل!`;
  } else {
    greeting = clientName
      ? `Hello ${clientName}, this is Moroccan Secrets regarding your booking${exp}${dateStr}. How can we assist you?`
      : `Hello, this is Moroccan Secrets regarding your booking${exp}${dateStr}. How can we assist you?`;
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`;
}
