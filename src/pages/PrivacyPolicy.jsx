import React from "react";
import { Link } from "react-router-dom";
import InfoPage, {
  InfoSection,
  InfoParagraph,
  InfoList,
} from "../components/StaticPage/InfoPage";
import { useLanguage } from "../context/LanguageContext";

const CONTENT = {
  en: {
    title: "Privacy Policy",
    lede: "This Privacy Policy explains how Rubavu Today collects, uses and protects the information of our readers. We are committed to keeping your data safe.",
    sections: [
      {
        heading: "Information We Collect",
        paragraphs: [],
        list: [
          "Browsing information such as pages visited, time spent and approximate location, collected through standard web analytics.",
          "Information you voluntarily share when you contact us or submit feedback via WhatsApp or our contact page.",
          "Information you submit as a comment or reaction on an article.",
        ],
      },
      {
        heading: "How We Use Your Information",
        paragraphs: [
          "We use this information to deliver and improve our news service, understand what our readers find useful, respond to your questions, and keep the platform secure.",
        ],
        list: [],
      },
      {
        heading: "Cookies and Analytics",
        paragraphs: [
          "Our website may use cookies and similar technologies to remember your language preference and improve your experience. This data is used in an aggregated way and is never sold to third parties.",
        ],
        list: [],
      },
      {
        heading: "Third-Party Services",
        paragraphs: [
          "We link to external platforms such as WhatsApp and social networks to provide our readers with convenient contact and sharing options. Those services operate under their own privacy policies.",
        ],
        list: [],
      },
      {
        heading: "Your Choices",
        paragraphs: [
          "You can clear cookies and browsing data at any time from your browser settings. If you have questions about your data, please contact us.",
        ],
        list: [],
      },
      {
        heading: "Contact",
        paragraphs: [],
        list: [],
        contact: true,
      },
    ],
  },
  rw: {
    title: "Politiki y'ibanga",
    lede: "Iyi politiki y'ibanga isobanura ukuntu Rubavu Today ikusanya, ikoresha kandi ikarinda amakuru y'abasoma bacu. Twiyemeje kugumana amakuru yawe mu mutekano.",
    sections: [
      {
        heading: "Amakuru twakusanya",
        paragraphs: [],
        list: [
          "Amakuru y'ikoreshwa ry'urubuga nk'impapuro zasuwewe, igihe kimanze, n'ahantu uri, akusanywa mu buryo busanzwe.",
          "Amakuru utanga ku bushake bwawe ubwo utwandikira cyangwa utanga igitekerezo kuri WhatsApp cyangwa ku rupapuro rwacu rwo Guhumana.",
          "Amakuru utanga mu gusobanura (commentaires) cyangwa mu bitekerezo kuri inkuru.",
        ],
      },
      {
        heading: "Uburyo twakoresha amakuru yawe",
        paragraphs: [
          "Dukoresha aya makuru kugira ngo duteze imbere serivisi z'amakuru zacu, tumenye ibyo abasoma bacu bibona ari byiza, dusubize ibibazo byanyu, kandi turinde urubuga.",
        ],
        list: [],
      },
      {
        heading: "Cookies n'ubugenzuzi",
        paragraphs: [
          "Urubuga rwacu rushobora gukoresha cookies kugira ngo rwibuke ururimi wahisemo no kugufasha neza. Aya makuru akoreshwa mu buryo rusange kandi ntiyigurishwa ku bandi.",
        ],
        list: [],
      },
      {
        heading: "Serivisi z'amatsinda ya gatatu",
        paragraphs: [
          "Tuhuza ku nzego z'indaki nka WhatsApp na social network kugira ngo abasoma bacu babone uburyo bworoshiye bwo guhuza no gusangira. Izo serivisi zikorera mu buryo bwazoe.",
        ],
        list: [],
      },
      {
        heading: "Uburenganzira bwawe",
        paragraphs: [
          "Ushobora gusiba cookies n'amakuru y'ikoreshwa igihe icyo ari cyo cyose mu buryo bwindora (browser). Niba ufite ikibazo kuri amakuru yawe, twandikire.",
        ],
        list: [],
      },
      {
        heading: "Guhumana",
        paragraphs: [],
        list: [],
        contact: true,
      },
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    lede: "Cette politique de confidentialité explique comment Rubavu Today collecte, utilise et protège les informations de nos lecteurs. Nous nous engageons à protéger vos données.",
    sections: [
      {
        heading: "Informations que nous collectons",
        paragraphs: [],
        list: [
          "Informations de navigation telles que les pages visitées, le temps passé et la localisation approximative, collectées par des outils d'analyse standard.",
          "Informations que vous partagez volontairement en nous contactant via WhatsApp ou notre page de contact.",
          "Informations soumises comme commentaire ou réaction sur un article.",
        ],
      },
      {
        heading: "Comment nous utilisons vos informations",
        paragraphs: [
          "Nous utilisons ces informations pour fournir et améliorer notre service d'actualités, comprendre ce que nos lecteurs apprécient, répondre à vos questions et sécuriser la plateforme.",
        ],
        list: [],
      },
      {
        heading: "Cookies et analyses",
        paragraphs: [
          "Notre site peut utiliser des cookies pour mémoriser votre préférence linguistique et améliorer votre expérience. Ces données sont utilisées de façon agrégée et ne sont jamais vendues.",
        ],
        list: [],
      },
      {
        heading: "Services tiers",
        paragraphs: [
          "Nous proposons des liens vers des plateformes externes comme WhatsApp et les réseaux sociaux pour le contact et le partage. Ces services ont leurs propres politiques de confidentialité.",
        ],
        list: [],
      },
      {
        heading: "Vos choix",
        paragraphs: [
          "Vous pouvez effacer les cookies à tout moment depuis les paramètres de votre navigateur. Pour toute question sur vos données, contactez-nous.",
        ],
        list: [],
      },
      {
        heading: "Contact",
        paragraphs: [],
        list: [],
        contact: true,
      },
    ],
  },
  sw: {
    title: "Sera ya Faragha",
    lede: "Sera hii ya faragha inaelezea jinsi Rubavu Today inavyokusanya, kutumia na kulinda taarifa za wasomaji wetu. Tumejitolea kulinda data zako.",
    sections: [
      {
        heading: "Taarifa Tunazokusanya",
        paragraphs: [],
        list: [
          "Taarifa za kuvinjari kama kurasa zilizotembelewa, muda uliotumika na mahali, zinazokusanywa na zana za kawaida za uchambuzi.",
          "Taarifa unazoshiriki kwa hiari unapotufikia kupitia WhatsApp au ukurasa wetu wa mawasiliano.",
          "Taarifa unazowasilisha kama maoni au mwitikio kwenye makala.",
        ],
      },
      {
        heading: "Jinsi Tunavyotumia Taarifa Zako",
        paragraphs: [
          "Tunatumia taarifa hizi kutoa na kuboresha huduma zetu za habari, kuelewa kile wasomaji wanachokithamini, kujibu maswali yako na kulinda mfumo.",
        ],
        list: [],
      },
      {
        heading: "Vidakuzi na Uchambuzi",
        paragraphs: [
          "Tovuti yetu inaweza kutumia vidakuzi kukumbuka lugha yako na kuboresha uzoefu wako. Data hizi hutumiwa kwa jumla na hazijawahi kuuzwa kwa wengine.",
        ],
        list: [],
      },
      {
        heading: "Huduma za Mtu wa Tatu",
        paragraphs: [
          "Tunatoa viungo kwa majukwaa ya nje kama WhatsApp na mitandao ya kijamii kwa mawasiliano na kushiriki. Huduma hizo hufuata sera zao za faragha.",
        ],
        list: [],
      },
      {
        heading: "Chaguo Lako",
        paragraphs: [
          "Unaweza kufuta vidakuzi wakati wowote kupitia mipangilio ya kivinjari chako. Kwa maswali yoyote kuhusu data zako, wasiliana nasi.",
        ],
        list: [],
      },
      {
        heading: "Mawasiliano",
        paragraphs: [],
        list: [],
        contact: true,
      },
    ],
  },
};

const PrivacyPolicy = () => {
  const { language, t } = useLanguage();
  const content = CONTENT[language] || CONTENT.en;

  return (
    <InfoPage title={content.title} lede={content.lede}>
      {content.sections.map((section) => (
        <InfoSection key={section.heading} heading={section.heading}>
          {section.paragraphs.map((paragraph) => (
            <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
          ))}

          {section.list.length > 0 && <InfoList items={section.list} />}

          {section.contact && (
            <InfoParagraph>
              {language === "rw"
                ? "Ushobora kuduhamagara kuri WhatsApp"
                : language === "fr"
                  ? "Vous pouvez nous joindre sur WhatsApp"
                  : language === "sw"
                    ? "Unaweza kutufikia kwenye WhatsApp"
                    : "You can reach us on WhatsApp"}{" "}
              <Link
                to="/contact"
                className="font-semibold text-red-600 hover:text-red-800"
              >
                {t("contactUs")}
              </Link>
              .
            </InfoParagraph>
          )}
        </InfoSection>
      ))}
    </InfoPage>
  );
};

export default PrivacyPolicy;