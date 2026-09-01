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
    title: "Terms & Conditions",
    lede: "These terms govern your use of the Rubavu Today website. By accessing our platform you agree to the conditions below.",
    sections: [
      {
        heading: "Acceptance of Terms",
        paragraphs: [
          "By visiting or using Rubavu Today you accept these terms. If you do not agree with any part of them, please stop using the platform.",
        ],
        list: [],
      },
      {
        heading: "Use of Content",
        paragraphs: [
          "Articles, images and other content published on Rubavu Today are provided for personal, non-commercial reading. Republishing or reproducing content for commercial purposes requires prior permission.",
        ],
        list: [],
      },
      {
        heading: "Editorial Standards",
        paragraphs: [
          "We aim to publish accurate and balanced news, and we correct errors promptly when they are reported to us. Content reflects the news reporting standards of the platform.",
        ],
        list: [],
      },
      {
        heading: "User Conduct",
        paragraphs: [
          "When commenting or engaging with our content, users must respect others and the law. We reserve the right to remove abusive or unlawful contributions.",
        ],
        list: [],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "The Rubavu Today name, logo and original content are protected. Third-party articles, quotes and images belong to their respective owners.",
        ],
        list: [],
      },
      {
        heading: "Limitation of Liability",
        paragraphs: [
          "Please notify us of any outdated or incorrect information. While we work with care, information may change and should be considered as general news rather than professional advice.",
        ],
        list: [],
      },
      {
        heading: "Changes to These Terms",
        paragraphs: [
          "We may update these terms from time to time. Continued use of the website after changes means you accept the updated terms.",
        ],
        list: [],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions about these terms? Reach out through our contact page.",
        ],
        list: [],
        contact: true,
      },
    ],
  },
  rw: {
    title: "Amabwiriza n'Amasezerano",
    lede: "Aya mabwiriza agenga ikoreshwa ry'urubuga rwa Rubavu Today. Ukoze mu rubuga rwacu wemera aya mabwiriza.",
    sections: [
      {
        heading: "Kwemera amabwiriza",
        paragraphs: [
          "Kubona cyangwa gukoresha Rubavu Today bivuga ko wemeye aya mabwiriza. Niba udahuza na bimwe muri byo, hagarika gukoresha urubuga.",
        ],
        list: [],
      },
      {
        heading: "Gukoresha imibereho",
        paragraphs: [
          "Inkuru, amafoto n'ibindi ububiko bw'urubuga rwa Rubavu Today bitangwa cyane ku gukoreshwa k'umuntu ku giti cye, bitari iby'ubucuruzi. Gusubiramo cyangwa gukoporora ibikorwa by'ubucuruzi bisaba uruhusha.",
        ],
        list: [],
      },
      {
        heading: "Ipaji ry'ubwanditsi",
        paragraphs: [
          "Tugamije gutanga amakuru nyayo kandi y'uburinganire, kandi dukosora amakosa vuba iyo abonetse. Imibereho y'inkuru irebana n'ipaji ry'urubuga.",
        ],
        list: [],
      },
      {
        heading: "Imikorere y'umukoresha",
        paragraphs: [
          "Igihe utanga ibitekerezo cyangwa ukorana ni imibereho yacu, ugomba kubaha abandi n'amategeko. Dufite uburenganzira bwo gukuramo ibitagiranye neza cyangwa ibinyuranya n'amategeko.",
        ],
        list: [],
      },
      {
        heading: "Ubwenga bw'ubutaka",
        paragraphs: [
          "Izina, ikirango n'ibintu by'umwimerere bya Rubavu Today birindwa. Inkuru, amagambo n'amafoto b'indi bisigara ari ubw'abadahafite.",
        ],
        list: [],
      },
      {
        heading: "Urwego rw'icyubahiro",
        paragraphs: [
          "Nyamaza niba hari amakuru ashaje cyangwa atariyo. Ariko n'ubwo dukorana umwete, amakuru ashobora guhindura kandi agomba gufatwa nk'amakuru rusange atari inama y'umwuga.",
        ],
        list: [],
      },
      {
        heading: "Guhindura aya mabwiriza",
        paragraphs: [
          "Dushobora guhindura aya mabwiriza igihe icyo ari cyo cyose. Guhora ukoresha urubuga nyuma y'impinduka bivuga ko wemera mabwiriza mashya.",
        ],
        list: [],
      },
      {
        heading: "Guhumana",
        paragraphs: [
          "Ufite ikibazo kuri aya mabwiriza? Hitamo urupapuro rwacu rwo Guhumana.",
        ],
        list: [],
        contact: true,
      },
    ],
  },
  fr: {
    title: "Conditions générales",
    lede: "Ces conditions régissent l'utilisation du site Rubavu Today. En accédant à notre plateforme, vous acceptez les conditions suivantes.",
    sections: [
      {
        heading: "Acceptation des conditions",
        paragraphs: [
          "En consultant ou en utilisant Rubavu Today, vous acceptez ces conditions. Si vous n'êtes pas d'accord, veuillez cesser d'utiliser la plateforme.",
        ],
        list: [],
      },
      {
        heading: "Utilisation du contenu",
        paragraphs: [
          "Les articles, images et autres contenus sont fournis pour une lecture personnelle et non commerciale. Toute republication à des fins commerciales nécessite une autorisation préalable.",
        ],
        list: [],
      },
      {
        heading: "Normes éditoriales",
        paragraphs: [
          "Nous publions des informations exactes et équilibrées et corrigeons rapidement les erreurs signalées. Le contenu reflète les normes éditoriales de la plateforme.",
        ],
        list: [],
      },
      {
        heading: "Comportement des utilisateurs",
        paragraphs: [
          "En commentant ou en interagissant avec notre contenu, les utilisateurs doivent respecter les autres et la loi. Nous nous réservons le droit de retirer les contributions abusives.",
        ],
        list: [],
      },
      {
        heading: "Propriété intellectuelle",
        paragraphs: [
          "Le nom, le logo et le contenu original de Rubavu Today sont protégés. Les articles et images de tiers appartiennent à leurs propriétaires.",
        ],
        list: [],
      },
      {
        heading: "Limitation de responsabilité",
        paragraphs: [
          "Veuillez nous signaler toute information obsolète ou incorrecte. Bien que nos contenus soient soignés, ils constituent une information générale et non un conseil professionnel.",
        ],
        list: [],
      },
      {
        heading: "Modifications",
        paragraphs: [
          "Nous pouvons modifier ces conditions. La poursuite de l'utilisation du site vaut acceptation des nouvelles conditions.",
        ],
        list: [],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Une question sur ces conditions ? Utilisez notre page de contact.",
        ],
        list: [],
        contact: true,
      },
    ],
  },
  sw: {
    title: "Sheria na Masharti",
    lede: "Masharti haya yanasimamia matumizi ya tovuti ya Rubavu Today. Kwa kufikia mfumo wetu unakubali masharti yafuatayo.",
    sections: [
      {
        heading: "Kukubali Masharti",
        paragraphs: [
          "Kwa kutembelea au kutumia Rubavu Today unakubali masharti haya. Iwapo hukubaliani, tafadhali acha kutumia mfumo.",
        ],
        list: [],
      },
      {
        heading: "Matumizi ya Maudhui",
        paragraphs: [
          "Makala, picha na maudhui mengine yanakusudiwa kusoma kibinafsi na bila biashara. Kuchapisha tena kwa madhumuni ya biashara kunahitaji idhini.",
        ],
        list: [],
      },
      {
        heading: "Viwango vya Uhariri",
        paragraphs: [
          "Tunachapisha habari sahihi na za usawa na kusahihisha makosa mara moja yanaporipotiwa. Maudhui yanaakisi viwango vya uhariri wa mfumo.",
        ],
        list: [],
      },
      {
        heading: "Tabia ya Watumiaji",
        paragraphs: [
          "Wakati wa kutoa maoni au kushiriki maudhui, watumiaji lazima waheshimu wengine na sheria. Tunahifadhi haki ya kuondoa mchango wa matusi.",
        ],
        list: [],
      },
      {
        heading: "Haki za Umiliki",
        paragraphs: [
          "Jina, nembo na maudhui asili ya Rubavu Today yanalindwa. Makala na picha za watu wengine ni mali ya wamiliki wao.",
        ],
        list: [],
      },
      {
        heading: "Ukomo wa Dhima",
        paragraphs: [
          "Tafadhali tujulishe kuhusu taarifa zozote zilizopitwa na wakati au zisizo sahihi. Maudhui yenyewe ni habari ya jumla, si ushauri wa kitaaluma.",
        ],
        list: [],
      },
      {
        heading: "Mabadiliko ya Masharti",
        paragraphs: [
          "Tunaweza kubadilisha masharti haya. Kuendelea kutumia tovuti kumaanisha kukubali masharti mapya.",
        ],
        list: [],
      },
      {
        heading: "Mawasiliano",
        paragraphs: [
          "Maswali kuhusu masharti haya? Tumia ukurasa wetu wa mawasiliano.",
        ],
        list: [],
        contact: true,
      },
    ],
  },
};

const Terms = () => {
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
              <Link
                to="/contact"
                className="font-semibold text-red-600 hover:text-red-800"
              >
                {t("contactUs")} →
              </Link>
            </InfoParagraph>
          )}
        </InfoSection>
      ))}
    </InfoPage>
  );
};

export default Terms;