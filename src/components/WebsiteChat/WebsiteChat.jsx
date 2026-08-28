import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { API_BASE_URL, getPosts } from "../../services/api";
import websiteLogo from "../../Rubavu.jpeg";

const MAX_POSTS = 200;

const WEBSITE_KNOWLEDGE = `
Rubavu Today ni urubuga rw'amakuru rwo muri Rubavu n'ibice biyegereye.
Ibyiciro by'amakuru ni Amakuru, Ubukungu, Imikino, Imyidagaduro n'Uburezi.
Abasura urubuga bashobora kureba amakuru mashya, gushakisha inkuru, gufungura inkuru yose, gusoma izifitanye isano, gusangiza inkuru, kureba amashusho no gutanga ibitekerezo.
Umufasha asobanura imikorere y'urubuga mu buryo busobanutse, agatanga inkuru zijyanye n'ikibazo kandi agakoresha gusa amakuru yatanzwe.
Niba igisubizo kitari mu makuru yatanzwe, abivuge mu Kinyarwanda kandi ayobore umukoresha kuri Shakisha.
`;

const cleanText = (value) => String(value || "").trim();

const postTitle = (post) => cleanText(post?.title) || "Inkuru ya Rubavu Today";

const postHref = (post) => {
    const postId = post?.id || post?._id;
    return postId ? `/post/${postId}` : "/";
};

const normalize = (value) =>
    cleanText(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const getDate = (post) => {
    const value = post?.createdDate || post?.created_at || post?.createdAt;
    const date = value ? new Date(value) : null;

    return date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString("rw-RW", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "";
};

const getTime = (post) => {
    const value = post?.createdDate || post?.created_at || post?.createdAt;
    const time = value ? new Date(value).getTime() : 0;

    return Number.isNaN(time) ? 0 : time;
};

const findPosts = (posts, question) => {
    const terms = normalize(question)
        .split(/\s+/)
        .filter((term) => term.length > 2);

    if (!terms.length) return [];

    return posts
        .map((post) => {
            const haystack = normalize(
                Object.entries(post || {})
                    .filter(([key]) => !["image", "id", "_id"].includes(key))
                    .map(([, value]) => typeof value === "object" ? JSON.stringify(value) : value)
                    .join(" ")
            );
            const score = terms.reduce(
                (total, term) => total + (haystack.includes(term) ? 1 : 0),
                0
            );

            return { post, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ post }) => post);
};

const detectLanguage = () => "rw";

const localized = {
    rw: {
        welcome: "Muraho! Ndi umufasha wa Rubavu Today. Wabaza amakuru mashya, ibyiciro, cyangwa ugashaka inkuru runaka.",
        greeting: "Muraho neza! Nakwereka amakuru mashya cyangwa nkagufasha kubona inkuru ushaka.",
        about: "Rubavu Today ni urubuga rw'amakuru rufasha abantu kumenya amakuru yo muri Rubavu n'ahandi. Rukubiyemo Amakuru, Ubukungu, Imikino, Imyidagaduro n'Uburezi.",
        categories: (items) => `Ibyiciro biboneka kuri Rubavu Today ni: ${items.join(", ")}.`,
        latest: (items) => `Amakuru agezweho ni:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Koresha akazu ka Shakisha inkuru cyangwa wandike umutwe w'inkuru ushaka.",
        matches: "Nabonye izi nkuru zijyanye n'ibyo wanditse:",
        empty: "Ntabwo nabonye inkuru ihuye neza n'ibyo wanditse. Nshobora kugufasha kureba Amakuru agezweho, Ubukungu, Imikino, Imyidagaduro cyangwa Uburezi. Andika umutwe w'inkuru, izina ry'umuntu, cyangwa ingingo ushaka.",
        unavailable: "Nta makuru abonetse ubu. Ongera ugerageze nyuma.",
    },
    en: {
        welcome: "Hello! I am the Rubavu Today assistant. Ask about the latest news, categories, or find a specific article.",
        greeting: "Hello! I can show you the latest news or help you find an article.",
        about: "Rubavu Today is a news website covering Rubavu and surrounding communities. It includes News, Business, Sports, Entertainment, and Education departments.",
        categories: (items) => `Rubavu Today categories include: ${items.join(", ")}.`,
        latest: (items) => `The latest news is:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Use the search box or type the title or subject of the article you want.",
        matches: "I found these articles related to your question:",
        empty: "I could not find an exact article match yet. I can help with the latest news, Business, Sports, Entertainment, Education, or any topic published on Rubavu Today. Try an article title, person, or subject.",
        unavailable: "No news is available right now. Please try again later.",
    },
    fr: {
        welcome: "Bonjour ! Je suis l'assistant de Rubavu Today. Demandez les dernières nouvelles, les rubriques ou un article précis.",
        greeting: "Bonjour ! Je peux vous montrer les dernières nouvelles ou vous aider à trouver un article.",
        about: "Rubavu Today est un site d'actualités consacré à Rubavu et aux communautés voisines. Il propose les rubriques actualités, économie, sport, divertissement et éducation.",
        categories: (items) => `Les rubriques de Rubavu Today sont : ${items.join(", ")}.`,
        latest: (items) => `Les dernières nouvelles sont :\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Utilisez la recherche ou écrivez le titre ou le sujet de l'article recherché.",
        matches: "Voici les articles liés à votre question :",
        empty: "Je n'ai pas trouvé d'article correspondant exactement. Je peux vous aider avec les actualités, l'économie, le sport, le divertissement ou l'éducation. Essayez un titre, un nom ou un sujet.",
        unavailable: "Aucune nouvelle n'est disponible pour le moment. Réessayez plus tard.",
    },
    sw: {
        welcome: "Habari! Mimi ni msaidizi wa Rubavu Today. Uliza kuhusu habari mpya, kategoria, au tafuta makala.",
        greeting: "Habari! Ninaweza kukuonyesha habari mpya au kukusaidia kupata makala.",
        about: "Rubavu Today ni tovuti ya habari kuhusu Rubavu na jamii zinazozunguka. Ina habari, biashara, michezo, burudani na elimu.",
        categories: (items) => `Kategoria za Rubavu Today ni: ${items.join(", ")}.`,
        latest: (items) => `Habari mpya ni:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Tumia kisanduku cha kutafuta au andika kichwa cha makala unayotaka.",
        matches: "Nimepata makala hizi zinazohusiana na swali lako:",
        empty: "Sikupata makala inayolingana kabisa. Ninaweza kusaidia kuhusu habari mpya, biashara, michezo, burudani au elimu. Andika kichwa, jina au mada.",
        unavailable: "Hakuna habari kwa sasa. Tafadhali jaribu tena baadaye.",
    },
    es: {
        welcome: "¡Hola! Soy el asistente de Rubavu Today. Pregunta por las últimas noticias, categorías o un artículo.",
        greeting: "¡Hola! Puedo mostrarte las últimas noticias o ayudarte a encontrar un artículo.",
        about: "Rubavu Today es un sitio de noticias sobre Rubavu y las comunidades cercanas. Incluye noticias, negocios, deportes, entretenimiento y educación.",
        categories: (items) => `Las categorías de Rubavu Today son: ${items.join(", ")}.`,
        latest: (items) => `Las últimas noticias son:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Usa el buscador o escribe el título o tema del artículo que buscas.",
        matches: "Encontré estos artículos relacionados con tu pregunta:",
        empty: "No encontré un artículo exacto. Puedo ayudarte con noticias, negocios, deportes, entretenimiento o educación. Prueba con un título, nombre o tema.",
        unavailable: "No hay noticias disponibles ahora. Inténtalo más tarde.",
    },
    pt: {
        welcome: "Olá! Sou o assistente do Rubavu Today. Pergunte pelas notícias, categorias ou por um artigo.",
        greeting: "Olá! Posso mostrar as notícias recentes ou ajudar a encontrar um artigo.",
        about: "Rubavu Today é um site de notícias sobre Rubavu e as comunidades próximas. Inclui notícias, negócios, desporto, entretenimento e educação.",
        categories: (items) => `As categorias do Rubavu Today são: ${items.join(", ")}.`,
        latest: (items) => `As notícias recentes são:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Use a pesquisa ou escreva o título ou assunto do artigo que procura.",
        matches: "Encontrei estes artigos relacionados à sua pergunta:",
        empty: "Não encontrei um artigo exato. Posso ajudar com notícias, negócios, desporto, entretenimento ou educação. Tente um título, nome ou assunto.",
        unavailable: "Não há notícias disponíveis agora. Tente novamente mais tarde.",
    },
};

const answerQuestion = (question, posts) => {
    const normalizedQuestion = normalize(question);
    const language = detectLanguage(question);
    const copy = localized[language] || localized.en;
    const latestPosts = [...posts]
        .sort((a, b) => getTime(b) - getTime(a))
        .slice(0, 3);
    const categories = [...new Set(posts.map((post) => cleanText(post.category)).filter(Boolean))];
    const matchedPosts = findPosts(posts, question);

    if (!normalizedQuestion) {
        return {
            text: copy.welcome,
        };
    }

    if (/muraho|hello|hi|bonjour|hola|habari|amakuru yawe/.test(normalizedQuestion)) {
        return {
            text: copy.greeting,
        };
    }

    if (/rubavu today|website|urubuga|site|about|iki ikora|what do you do|que fait|que es/.test(normalizedQuestion)) {
        return { text: copy.about };
    }

    if (/category|categories|ibyiciro|sections|igice|kategoria|rubrique/.test(normalizedQuestion)) {
        return {
            text: categories.length
                ? copy.categories(categories)
                : copy.unavailable,
        };
    }

    if (/latest|new|mashya|agezweho|uyu munsi|amakuru|nouvelles|noticias|leo|habari mpya/.test(normalizedQuestion) && !matchedPosts.length) {
        return {
            text: latestPosts.length
                ? copy.latest(latestPosts.map((post) => postTitle(post)))
                : copy.unavailable,
            posts: latestPosts,
        };
    }

    if (/search|shaka|ndashaka|find|chercher|buscar|procurar|tafuta|kubona/.test(normalizedQuestion)) {
        return {
            text: copy.search,
            posts: matchedPosts,
        };
    }

    if (matchedPosts.length) {
        return {
            text: `${copy.matches}\n${matchedPosts.map((post) => `• ${postTitle(post)}${getDate(post) ? ` (${getDate(post)})` : ""}`).join("\n")}`,
            posts: matchedPosts,
        };
    }

    return {
        text: copy.empty,
    };
};

const buildWebsiteContext = (posts) => [
    WEBSITE_KNOWLEDGE.trim(),
    "Published website articles:",
    ...posts.slice(0, MAX_POSTS).map((post) => [
        `Title: ${postTitle(post)}`,
        `Category: ${cleanText(post.category)}`,
        `Date: ${getDate(post)}`,
        `Summary: ${cleanText(post.summary || post.description || post.content).slice(0, 500)}`,
        `Author: ${cleanText(post.author || post.author_name)}`,
        `Article link: ${postHref(post)}`,
    ].join("\n")),
].join("\n\n");

const MessageBubble = ({ message, onPostClick }) => (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        <div
            className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === "user"
                ? "rounded-br-sm bg-red-600 text-white"
                : "rounded-bl-sm bg-slate-100 text-slate-800"
                }`}
        >
            <p className="whitespace-pre-line">{message.text}</p>
            {message.posts?.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-slate-200 pt-2">
                    {message.posts.map((post) => (
                        <button
                            key={post.id || post._id || postTitle(post)}
                            type="button"
                            onClick={() => onPostClick(post)}
                            className="block w-full text-left text-xs font-bold text-red-700 transition hover:text-red-900"
                        >
                            {postTitle(post)} <span aria-hidden="true">→</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default function WebsiteChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "assistant",
            text: "Muraho! Ndi umufasha wa Rubavu Today. Wabaza amakuru mashya cyangwa ugashaka inkuru runaka.",
        },
    ]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        getPosts()
            .then((data) => {
                if (mounted) setPosts(Array.isArray(data) ? data.slice(0, MAX_POSTS) : []);
            })
            .catch(() => {
                if (mounted) setPosts([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const quickQuestions = useMemo(
        () => [
            "Amakuru mashya ni ayahe?",
            "Ni ibihe byiciro bihari?",
            "Rubavu Today ikora iki?",
            "Shaka inkuru zivuga ku bukungu",
        ],
        []
    );

    const sendQuestion = async (value = question) => {
        const text = cleanText(value);
        if (!text || isLoading) return;

        const previousMessages = messages;
        setQuestion("");
        setIsLoading(true);
        setMessages((current) => [
            ...current,
            { id: `user-${Date.now()}`, role: "user", text },
        ]);

        try {
            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: text,
                    history: previousMessages.map((message) => ({
                        role: message.role,
                        content: message.text,
                    })),
                    websiteContext: buildWebsiteContext(posts),
                }),
            });
            const data = await response.json();

            if (!response.ok || !data.answer) {
                throw new Error(data.error || "AI request failed");
            }

            const linkedPosts = answerQuestion(text, posts).posts || [];

            setMessages((current) => [
                ...current,
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    text: data.answer,
                    posts: linkedPosts,
                },
            ]);
        } catch (error) {
            const answer = answerQuestion(text, posts);
            setMessages((current) => [
                ...current,
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    ...answer,
                    text: answer.text,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const openPost = (post) => {
        window.location.href = postHref(post);
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && (
                <section
                    aria-label="Umufasha wa Rubavu Today"
                    className="fixed bottom-20 right-3 z-[60] flex h-[min(560px,calc(100vh-110px))] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-5"
                >
                    <header className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                                <img src={websiteLogo} alt="Rubavu Today" className="h-full w-full object-cover" />
                            </span>
                            <div>
                                <h2 className="font-body text-sm font-bold">Rubavu Today AI</h2>
                                <p className="text-[10px] text-slate-300">Baza amakuru ya Rubavu Today</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Funga umufasha"
                            className="rounded-full p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </header>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-white px-3 py-4">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} onPostClick={openPost} />
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-xs text-slate-500">
                                    Ndimo gushaka igisubizo...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50 p-3">
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {quickQuestions.map((quickQuestion) => (
                                <button
                                    key={quickQuestion}
                                    type="button"
                                    onClick={() => sendQuestion(quickQuestion)}
                                    className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 transition hover:border-red-500 hover:text-red-600"
                                >
                                    {quickQuestion}
                                </button>
                            ))}
                        </div>
                        <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                sendQuestion();
                            }}
                        >
                            <input
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                placeholder="Andika ikibazo cyawe hano..."
                                aria-label="Andika ikibazo"
                                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                            <button
                                type="submit"
                                disabled={!question.trim() || isLoading}
                                aria-label="Ohereza ikibazo"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send size={16} aria-hidden="true" />
                            </button>
                        </form>
                    </div>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-label={isOpen ? "Funga Rubavu Today AI" : "Fungura Rubavu Today AI"}
                title={isOpen ? "Funga umufasha wa Rubavu Today" : "Fungura umufasha wa Rubavu Today"}
                className="group fixed bottom-4 right-3 z-[60] flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-red-600 p-0.5 text-white shadow-lg transition hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 sm:right-5"
            >
                {isOpen ? (
                    <X size={21} aria-hidden="true" />
                ) : (
                    <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                        <img src={websiteLogo} alt="Umufasha wa Rubavu Today" className="h-full w-full rounded-full object-cover" />
                        <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-white">
                            <MessageCircle size={10} aria-hidden="true" />
                        </span>
                    </span>
                )}
            </button>
        </>
    );
}
