import React, { createContext, useState, useContext, useEffect } from "react";
import { translateBatchTexts } from "../services/api";

const LanguageContext = createContext();
const STORAGE_KEY = "selectedLanguage";
const SUPPORTED_LANGUAGES = ["rw", "en", "fr", "sw"];

const getStoredLanguage = () => {
    if (typeof window === "undefined") return "rw";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : "rw";
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};

const TRANSLATIONS = {
    en: {
        // UI Elements
        allNews: "All News",
        categories: "Categories",
        search: "Search",
        language: "Language",
        english: "English",
        french: "Français",
        kiswahili: "Kiswahili",
        kinyarwanda: "Kinyarwanda",

        // Navbar
        latestNews: "Latest News",
        featuredNews: "Featured News",
        trending: "Trending",
        viewAll: "View All",
        previousPost: "Previous post",
        nextPost: "Next post",
        loading: "Loading...",
        trustedNews: "Trusted news, anytime",
        breakingNews: "Breaking News:",
        followUs: "Follow us on",
        noPostsInCategory: "No posts in this category.",

        // Categories
        amakuru: "News",
        ubukungu: "Economy",
        imikino: "Sports",
        imyidagaduro: "Entertainment",
        uburezi: "Education",

        // Post related
        publishedOn: "Published on",
        readMore: "Read more",
        relatedArticles: "Related Articles",
        justNow: "Just now",
        minutesAgo: "{count} min ago",
        hoursAgo: "{count} hr ago",
        yesterday: "Yesterday",
        daysAgo: "{count} days ago",
        newPost: "New",
        noPostsFound: "No posts found",
        loadMore: "Load More",
        result: "result",
        results: "results",
        tryAgain: "Try again with different words.",
        noPostsNow: "No news available right now. Please try again later.",
        backHome: "← Back to Home",
        otherStories: "Other Stories",
        moreStories: "More stories",
        noPhoto: "No photo",
        readStory: "Read full story",
        writtenBy: "Written By:",
        comments: "Comments",
        leaveComment: "Leave a comment",
        yourName: "Your name",
        commentPlaceholder: "Write your comment here...",
        sendComment: "Send Comment",
        noComments: "No comments yet.",
        cancel: "Cancel",
        reply: "Reply",
        send: "Send",
        replyPlaceholder: "Reply...",
        somethingWentWrong: "Something went wrong",
        retry: "Try Again",
        readMoreStories: "Read more stories",
        allStoriesBelow: "All other stories available below.",

        // Common
        home: "Home",
        about: "About",
        contact: "Contact",
        sharePost: "Share post",
        downloadImage: "Download image",
        translationUnavailable: "Automatic translation is temporarily unavailable. Showing the original Kinyarwanda content.",

        // PostCard
        today: "Today",
        readTimeMin: "{count} min read",
        readMorePost: "Read more",
        views: "views",
        copied: "Copied!",
        shareCode: "Share",

        // SearchBar
        searchPlaceholder: "Search news...",
        searchLabel: "Search news",
        recentSearches: "Recent searches",
        matchResults: "Posts matching your search",
        viewAllResults: "View all results",
        clearSearch: "Clear search",
        searching: "Searching...",

        // Footer
        footerRights: "All rights reserved.",
        footerDescription: "Rubavu Today is a modern digital news platform delivering trusted news, stories, entertainment, sports, business and community updates from Rubavu and beyond.",
        quickLinks: "Quick Links",
        newsCategories: "News Categories",
        footerContact: "Contact",
        ourLocation: "Find Us",
        openInGoogleMaps: "Open in Google Maps",
        aboutUs: "About Us",
        contactUs: "Contact Us",
        advertiseWithUs: "Advertise With Us",
        privacyPolicy: "Privacy Policy",
        termsConditions: "Terms & Conditions",

        // NotFound
        pageNotFound: "Page Not Found",
        pageNotFoundDescription: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
        returnHome: "Return to Homepage",

        // Auth / Login
        email: "Email",
        emailPlaceholder: "Enter your email",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        login: "Login",
        loggingIn: "Logging in...",
        loginTitle: "Admin Login",
        loginSubtitle: "Access the admin dashboard",
        invalidCredentials: "Invalid email or password.",
        checkingAuth: "Checking authentication...",
        loginFailed: "Login failed. Please try again.",
    },
    fr: {
        // UI Elements
        allNews: "Toutes les actualités",
        categories: "Catégories",
        search: "Rechercher",
        language: "Langue",
        english: "English",
        french: "Français",
        kiswahili: "Kiswahili",
        kinyarwanda: "Kinyarwanda",

        // Navbar
        latestNews: "Dernières actualités",
        featuredNews: "À la une",
        trending: "Tendances",
        viewAll: "Voir tout",
        previousPost: "Article précédent",
        nextPost: "Article suivant",
        loading: "Chargement...",
        trustedNews: "Des nouvelles fiables, à tout moment",
        breakingNews: "Dernières nouvelles :",
        followUs: "Suivez-nous sur",
        noPostsInCategory: "Aucun article dans cette catégorie.",

        // Categories
        amakuru: "Actualités",
        ubukungu: "Économie",
        imikino: "Sports",
        imyidagaduro: "Divertissement",
        uburezi: "Éducation",

        // Post related
        publishedOn: "Publié le",
        readMore: "Lire la suite",
        relatedArticles: "Articles connexes",
        justNow: "À l'instant",
        minutesAgo: "il y a {count} min",
        hoursAgo: "il y a {count} h",
        yesterday: "Hier",
        daysAgo: "il y a {count} jours",
        newPost: "Nouveau",
        noPostsFound: "Aucun article trouvé",
        loadMore: "Charger plus",
        result: "résultat",
        results: "résultats",
        tryAgain: "Essayez à nouveau avec d'autres mots.",
        noPostsNow: "Aucune actualité disponible pour le moment.",
        backHome: "← Retour à l'accueil",
        otherStories: "Autres articles",
        moreStories: "Plus d'articles",
        noPhoto: "Pas de photo",
        readStory: "Lire l'article complet",
        writtenBy: "Écrit par :",
        comments: "Commentaires",
        leaveComment: "Laissez un commentaire",
        yourName: "Votre nom",
        commentPlaceholder: "Écrivez votre commentaire ici...",
        sendComment: "Envoyer le commentaire",
        noComments: "Aucun commentaire pour le moment.",
        cancel: "Annuler",
        reply: "Répondre",
        send: "Envoyer",
        replyPlaceholder: "Répondre...",
        somethingWentWrong: "Quelque chose s'est mal passé",
        retry: "Réessayer",
        readMoreStories: "Lire plus d'articles",
        allStoriesBelow: "Tous les autres articles disponibles ci-dessous.",

        // Common
        home: "Accueil",
        about: "À propos",
        contact: "Contact",
        sharePost: "Partager l'article",
        downloadImage: "Télécharger l'image",
        translationUnavailable: "La traduction automatique est temporairement indisponible. Affichage du contenu original en kinyarwanda.",

        // PostCard
        today: "Aujourd'hui",
        readTimeMin: "{count} min de lecture",
        readMorePost: "Lire la suite",
        views: "vues",
        copied: "Copié !",
        shareCode: "Partager",

        // SearchBar
        searchPlaceholder: "Rechercher des actualités...",
        searchLabel: "Rechercher des actualités",
        recentSearches: "Recherches récentes",
        matchResults: "Articles correspondant à votre recherche",
        viewAllResults: "Voir tous les résultats",
        clearSearch: "Effacer la recherche",
        searching: "Recherche...",

        // Footer
        footerRights: "Tous droits réservés.",
        footerDescription: "Rubavu Today est une plateforme d'information numérique moderne qui vous propose des nouvelles fiables, des articles, du divertissement, du sport, des affaires et des actualités communautaires de Rubavu et d'ailleurs.",
        quickLinks: "Liens rapides",
        newsCategories: "Rubriques",
        footerContact: "Contact",
        ourLocation: "Nous trouver",
        openInGoogleMaps: "Ouvrir dans Google Maps",
        aboutUs: "À propos",
        contactUs: "Nous contacter",
        advertiseWithUs: "Publicité",
        privacyPolicy: "Politique de confidentialité",
        termsConditions: "Conditions générales",

        // NotFound
        pageNotFound: "Page introuvable",
        pageNotFoundDescription: "La page que vous recherchez a peut-être été supprimée, renommée ou est temporairement indisponible.",
        returnHome: "Retour à l'accueil",

        // Auth / Login
        email: "E-mail",
        emailPlaceholder: "Saisissez votre e-mail",
        password: "Mot de passe",
        passwordPlaceholder: "Saisissez votre mot de passe",
        login: "Connexion",
        loggingIn: "Connexion...",
        loginTitle: "Connexion Admin",
        loginSubtitle: "Accéder au tableau de bord admin",
        invalidCredentials: "E-mail ou mot de passe invalide.",
        checkingAuth: "Vérification de l'authentification...",
        loginFailed: "Échec de la connexion. Veuillez réessayer.",
    },
    sw: {
        // UI Elements
        allNews: "Habari Zote",
        categories: "Kategorya",
        search: "Tafuta",
        language: "Lugha",
        english: "English",
        french: "Français",
        kiswahili: "Kiswahili",
        kinyarwanda: "Kinyarwanda",

        // Navbar
        latestNews: "Habari za Sasa",
        featuredNews: "Habari Kuu",
        trending: "Tahadhari",
        viewAll: "Ona Zote",
        previousPost: "Makala ya Awali",
        nextPost: "Makala Inayofuata",
        loading: "Inakamatia...",
        trustedNews: "Habari za kuaminika, wakati wote",
        breakingNews: "Habari Mpya:",
        followUs: "Tufuate kwenye",
        noPostsInCategory: "Hakuna makala katika kategoria hii.",

        // Categories
        amakuru: "Habari",
        ubukungu: "Uchumi",
        imikino: "Michezo",
        imyidagaduro: "Burudani",
        uburezi: "Elimu",

        // Post related
        publishedOn: "Imechapishwa tarehe",
        readMore: "Soma Zaidi",
        relatedArticles: "Makala Zinazohusiana",
        justNow: "Sasa hivi",
        minutesAgo: "dakika {count} zilizopita",
        hoursAgo: "masaa {count} yaliyopita",
        yesterday: "Jana",
        daysAgo: "siku {count} zilizopita",
        newPost: "Mpya",
        noPostsFound: "Hakuna Makala Iliyopatikana",
        loadMore: "Pakia zaidi",
        result: "matokeo",
        results: "matokeo",
        tryAgain: "Jaribu tena kwa maneno mengine.",
        noPostsNow: "Hakuna habari zinazopatikana kwa sasa.",
        backHome: "← Rudi Nyumbani",
        otherStories: "Makala Nyingine",
        moreStories: "Makala zaidi",
        noPhoto: "Hakuna picha",
        readStory: "Soma makala kamili",
        writtenBy: "Imeandikwa na:",
        comments: "Maoni",
        leaveComment: "Acha maoni",
        yourName: "Jina lako",
        commentPlaceholder: "Andika maoni yako hapa...",
        sendComment: "Tuma Maoni",
        noComments: "Hakuna maoni bado.",
        cancel: "Ghairi",
        reply: "Jibu",
        send: "Tuma",
        replyPlaceholder: "Jibu...",
        somethingWentWrong: "Kuna tatizo limetokea",
        retry: "Jaribu Tena",
        readMoreStories: "Soma makala zaidi",
        allStoriesBelow: "Makala zingine zote zinapatikana hapa chini.",

        // Common
        home: "Nyumbani",
        about: "Kuhusu",
        contact: "Wasiliana",
        sharePost: "Sambaza Makala",
        downloadImage: "Pakua Picha",
        translationUnavailable: "Tafsiri otomatiki haipatikani kwa sasa. Inaonyesha maudhui asili ya Kinyarwanda.",

        // PostCard
        today: "Leo",
        readTimeMin: "Dakika {count} kusoma",
        readMorePost: "Soma Zaidi",
        views: "maoni",
        copied: "Imenakiliwa!",
        shareCode: "Sambaza",

        // SearchBar
        searchPlaceholder: "Tafuta habari...",
        searchLabel: "Tafuta habari",
        recentSearches: "Utafutaji wa hivi karibuni",
        matchResults: "Makala yanayolingana na utafutaji wako",
        viewAllResults: "Ona matokeo yote",
        clearSearch: "Futa utafutaji",
        searching: "Inatafuta...",

        // Footer
        footerRights: "Haki zote zimehifadhiwa.",
        footerDescription: "Rubavu Today ni jukwaa la kisasa la habari za kidijitali linalokuletea habari za kuaminika, makala, burudani, michezo, biashara na taarifa za jamii kutoka Rubavu na nje yake.",
        quickLinks: "Viungo vya Haraka",
        newsCategories: "Kategoria za Habari",
        footerContact: "Wasiliana",
        ourLocation: "Tutafute",
        openInGoogleMaps: "Fungua kwenye Google Maps",
        aboutUs: "Kuhusu Sisi",
        contactUs: "Wasiliana Nasi",
        advertiseWithUs: "Tangaza Nasi",
        privacyPolicy: "Sera ya Faragha",
        termsConditions: "Sheria na Masharti",

        // NotFound
        pageNotFound: "Ukurasa Haupatikani",
        pageNotFoundDescription: "Ukurasa unaoutafuta unaweza kuwa umeondolewa, jina lake limebadilika, au haipatikani kwa sasa.",
        returnHome: "Rudi Nyumbani",

        // Auth / Login
        email: "Barua pepe",
        emailPlaceholder: "Weka barua pepe yako",
        password: "Nenosiri",
        passwordPlaceholder: "Weka nenosiri lako",
        login: "Ingia",
        loggingIn: "Inaingia...",
        loginTitle: "Kuingia kwa Msimamizi",
        loginSubtitle: "Fikia dashibodi ya msimamizi",
        invalidCredentials: "Barua pepe au nenosiri si sahihi.",
        checkingAuth: "Inathibitisha uthibitisho...",
        loginFailed: "Imeshindwa kuingia. Tafadhali jaribu tena.",
    },
    rw: {
        // UI Elements
        allNews: "Amakuru yose",
        categories: "Ibyiciro",
        search: "Shakisha",
        language: "Ururimi",
        english: "English",
        french: "Français",
        kiswahili: "Kiswahili",
        kinyarwanda: "Kinyarwanda",

        // Navbar
        latestNews: "Amakuru mashya",
        featuredNews: "Amakuru y'ibanze",
        trending: "Amakuru Mashya",
        viewAll: "Reba byose",
        previousPost: "Inkuru ibanza",
        nextPost: "Inkuru ikurikira",
        loading: "Rubavu Today irafungura...",
        home: "Ahabanza",
        about: "Abo turi bo",
        contact: "Guhumana",
        sharePost: "Sangiza inkuru",
        downloadImage: "Simbura ishusho",
        translationUnavailable: "Ihindurwa ry'amakuru ntiriboneka kuri ubu. Reba amakuru y'umwimerere y'Ikinyarwanda.",

        // PostCard
        today: "Uyu munsi",
        readTimeMin: "iminota {count} yo gusoma",
        readMorePost: "Soma byinshi",
        views: "abayirebye",
        copied: "Byakoporowe!",
        shareCode: "Sangiza",
        relatedArticles: "Inkuru zifitanye isano",
        justNow: "Ubu",
        minutesAgo: "iminota {count} ishize",
        hoursAgo: "amasaha {count} ashize",
        yesterday: "Ejo hashize",
        daysAgo: "iminsi {count} ishize",
        newPost: "Nshya",

        // SearchBar
        searchPlaceholder: "Shakisha inkuru...",
        searchLabel: "Shakisha inkuru",
        recentSearches: "Ibyashakishijwe vuba",
        matchResults: "Inkuru zihuye n'ibyo washakishije",
        viewAllResults: "Reba ibisubizo byose",
        clearSearch: "Siba ibyo washakishije",
        searching: "Birashakishwa...",

        // Footer
        footerRights: "Uburenganzira bwose burabitswe.",
        footerDescription: "Rubavu Today ni urubuga rw'amakuru rwa kijyambere ruguha amakuru yizerwa, inkuru, imyidagaduro, imikino, ubukungu n'amakuru y'abaturage bo muri Rubavu n'ahandi.",
        quickLinks: "Ihuza ryihuse",
        newsCategories: "Ibyiciro by'amakuru",
        footerContact: "Guhamagara",
        ourLocation: "Aho Duherereye",
        openInGoogleMaps: "Reba muri Google Maps",
        aboutUs: "Abo turi bo",
        contactUs: "Twandikire",
        advertiseWithUs: "Kwamamaza na Rubavu Today",
        privacyPolicy: "Politiki y'ibanga",
        termsConditions: "Amabwiriza n'Amasezerano",

        // NotFound
        pageNotFound: "Ipapuro Ritarabonetse",
        pageNotFoundDescription: "Ipapuro urimo gushaka rishobora kuba ryarakuweho, izina ryaryo ryahindutse, cyangwa ntiriboneka kuri ubu.",
        returnHome: "Subira ku rupapuro rw'ibanze",

        // Auth / Login
        email: "Imeyili",
        emailPlaceholder: "Andika imeyili yawe",
        password: "Ijambobanga",
        passwordPlaceholder: "Andika ijambobanga ryawe",
        login: "Injira",
        loggingIn: "Irinjiye...",
        loginTitle: "Kwinjira kwa Admin",
        loginSubtitle: "Injira muri dashboard y'admin",
        invalidCredentials: "Imeyili cyangwa ijambobanga ntibikwiye.",
        checkingAuth: "Ragenzura ubwemezabwite...",
        loginFailed: "Kwinjira byananiwe. Gerageza nanone.",
    },
};

// Translation function for post content
export const translatePost = (post, targetLanguage) => {
    if (targetLanguage === "en" || !post) return post;

    // For now, we just return the post as-is since we don't have translations from the API
    // In a real scenario, you'd have translated content in your database
    return post;
};

// Translate category names
export const translateCategory = (category, language) => {
    const categoryMap = {
        "Amakuru": { en: "News", fr: "Actualités", sw: "Habari", rw: "Amakuru" },
        "Ubukungu": { en: "Economy", fr: "Économie", sw: "Uchumi", rw: "Ubukungu" },
        "Imikino": { en: "Sports", fr: "Sports", sw: "Michezo", rw: "Imikino" },
        "Imyidagaduro": { en: "Entertainment", fr: "Divertissement", sw: "Burudani", rw: "Imyidagaduro" },
        "Uburezi": { en: "Education", fr: "Éducation", sw: "Elimu", rw: "Uburezi" },
    };

    return categoryMap[category]?.[language] || category;
};

// Translate a single post's fields via the backend batch service.
export const translateSinglePost = async (post, targetLanguage, sourceLanguage) => {
    if (!post || !targetLanguage || targetLanguage === "rw") return post;

    const [title, description, summary] = await translateBatchTexts(
        [post.title, post.description, post.summary || post.content],
        targetLanguage,
        sourceLanguage
    );

    return {
        ...post,
        title: title || post.title,
        description: description || post.description,
        summary: summary || post.summary || post.content,
        content: summary || post.content,
        category: translateCategory(post.category, targetLanguage),
    };
};

// Translate many posts in a SINGLE batch request (one HTTP call for the page).
export const translatePostsBatch = async (posts, targetLanguage, sourceLanguage) => {
    if (!Array.isArray(posts) || posts.length === 0 || !targetLanguage || targetLanguage === "rw") {
        return posts;
    }

    // Collect every field we need to translate, keeping a map back to each post.
    const jobs = [];
    posts.forEach((post, postIndex) => {
        if (!post) return;
        jobs.push({ postIndex, kind: "title", text: post.title });
        jobs.push({ postIndex, kind: "description", text: post.description });
        const summaryText = post.summary || post.content;
        jobs.push({ postIndex, kind: "summary", text: summaryText });
    });

    const texts = jobs.map((job) => job.text);
    const translated = await translateBatchTexts(texts, targetLanguage, sourceLanguage);

    // Reassemble posts from the flat translated array.
    return posts.map((post, postIndex) => {
        if (!post) return post;
        const found = {};
        jobs.forEach((job, jobIndex) => {
            if (job.postIndex !== postIndex) return;
            found[job.kind] = translated[jobIndex];
        });

        return {
            ...post,
            title: found.title || post.title,
            description: found.description || post.description,
            summary: found.summary || post.summary || post.content,
            content: found.summary || post.content,
            category: translateCategory(post.category, targetLanguage),
        };
    });
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(getStoredLanguage);
    const [translating, setTranslating] = useState(false);
    const [translationUnavailable, setTranslationUnavailableState] = useState(false);

    const setLanguage = (nextLanguage) => {
        if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return;
        if (nextLanguage === language) return;
        setLanguageState(nextLanguage);
    };

    const setTranslationUnavailable = (value) => {
        setTranslationUnavailableState(Boolean(value));
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, language);
        }
    }, [language]);

    const t = (key) => {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || key;
    };

    const value = {
        language,
        setLanguage,
        translating,
        setTranslating,
        translationUnavailable,
        setTranslationUnavailable,
        t,
        LANGUAGES: {
            en: { name: "English", flag: "🇬🇧" },
            fr: { name: "Français", flag: "🇫🇷" },
            sw: { name: "Kiswahili", flag: "🇹🇿" },
            rw: { name: "Kinyarwanda", flag: "🇷🇼" },
        },
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
