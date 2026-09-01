import React from "react";
import { Link } from "react-router-dom";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import InfoPage, {
  InfoSection,
  InfoParagraph,
} from "../components/StaticPage/InfoPage";
import { useLanguage } from "../context/LanguageContext";

const WHATSAPP_URL = "https://wa.me/250788945200";
const WHATSAPP_DISPLAY = "+250 788 945 200";

const CONTENT = {
  rw: {
    title: "Guhamagara",
    lede: "Waba ufite ikibazo, igitekerezo cyangwa ushaka kuguhuza na Rubavu Today? Twandikire kuri WhatsApp cyangwa udusuye hano mu karere ka Rubavu.",
    phoneLabel: "Telefoni / WhatsApp",
    locationLabel: "Aho duherereye",
    location: "Rubavu, u Rwanda",
    chatCta: "Tangira ikiganiro kuri WhatsApp",
    advertise: "Kwamamaza na Rubavu Today",
    advertiseText:
      "Kwamamaza kuri Rubavu Today ni ukugera ku basomyi benshi bo mu karere ka Rubavu, mu Rwanda no hanze yarwo. Ushobora kumenyekanisha ikirango cyawe ku rubuga rwacu mu byiciro bitandukanye by'amakuru.",
    advertiseCta: "Fata ikiganiro cy'ubwamamaza",
  },
  en: {
    title: "Contact Us",
    lede: "Have a question, a story tip, or feedback for Rubavu Today? Reach out to us on WhatsApp or visit us here in Rubavu District.",
    phoneLabel: "Phone / WhatsApp",
    locationLabel: "Our location",
    location: "Rubavu, Rwanda",
    chatCta: "Start a WhatsApp chat",
    advertise: "Advertise With Us",
    advertiseText:
      "Advertising on Rubavu Today lets you reach a growing audience across Rubavu District, Rwanda and beyond. Your brand can be featured across our well-organised news categories.",
    advertiseCta: "Start an advertising conversation",
  },
  fr: {
    title: "Contact",
    lede: "Une question, une suggestion d'article ou un retour pour Rubavu Today ? Contactez-nous sur WhatsApp ou rendez-vous à Rubavu.",
    phoneLabel: "Téléphone / WhatsApp",
    locationLabel: "Notre emplacement",
    location: "Rubavu, Rwanda",
    chatCta: "Démarrer une conversation WhatsApp",
    advertise: "Faites de la publicité avec nous",
    advertiseText:
      "Faire de la publicité sur Rubavu Today vous permet de toucher un public grandissant dans le district de Rubavu, au Rwanda et au-delà. Votre marque peut figurer dans nos rubriques d'information bien organisées.",
    advertiseCta: "Démarrer une conversation publicitaire",
  },
  sw: {
    title: "Wasiliana Nasi",
    lede: "Una swali, kidokezo cha hadithi, au maoni kwa Rubavu Today? Tufikie kupitia WhatsApp au ututembelee hapa wilayani Rubavu.",
    phoneLabel: "Simu / WhatsApp",
    locationLabel: "Mahali tulipo",
    location: "Rubavu, Rwanda",
    chatCta: "Anza mazungumzo ya WhatsApp",
    advertise: "Tangaza Nasi",
    advertiseText:
      "Kutangaza kwenye Rubavu Today kunakufikisha kwa hadhira inayokua katika wilaya ya Rubavu, Rwanda na nje yake. Biashara yako inaweza kuonekana kwenye kategoria zetu nzuri za habari.",
    advertiseCta: "Anza mazungumzo ya utangazaji",
  },
};

const ContactCard = ({ icon, label, children }) => (
  <div className="flex items-start gap-3">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-slate-900">{children}</div>
    </div>
  </div>
);

const Contact = () => {
  const { language, t } = useLanguage();
  const content = CONTENT[language] || CONTENT.en;

  return (
    <InfoPage title={content.title} lede={content.lede}>
      <InfoSection heading={content.title}>
        <div className="space-y-5">
          <ContactCard
            icon={<Phone size={20} aria-hidden="true" />}
            label={content.phoneLabel}
          >
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-red-600"
            >
              {WHATSAPP_DISPLAY}
            </a>
          </ContactCard>

          <ContactCard
            icon={<MapPin size={20} aria-hidden="true" />}
            label={content.locationLabel}
          >
            {content.location}
          </ContactCard>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            <MessageCircle size={18} aria-hidden="true" />
            {content.chatCta}
          </a>
        </div>
      </InfoSection>

      <InfoSection heading={content.advertise} id="advertise">
        <InfoParagraph>{content.advertiseText}</InfoParagraph>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-900 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
        >
          <MessageCircle size={18} aria-hidden="true" />
          {content.advertiseCta}
        </a>

        <p className="text-xs text-slate-500">
          <Link to="/privacy-policy" className="font-semibold text-slate-600 underline-offset-2 transition hover:text-red-600">
            {t("privacyPolicy")}
          </Link>{" "}
          ·{" "}
          <Link to="/terms" className="font-semibold text-slate-600 underline-offset-2 transition hover:text-red-600">
            {t("termsConditions")}
          </Link>
        </p>
      </InfoSection>
    </InfoPage>
  );
};

export default Contact;