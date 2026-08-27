import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { getPosts } from "../../services/api";
import websiteLogo from "../../Rubavu.jpeg";

const MAX_POSTS = 80;

const cleanText = (value) => String(value || "").trim();

const postTitle = (post) => cleanText(post?.title) || "Inkuru ya Rubavu Today";

const postHref = (post) =>
    post?.slug
        ? `/${post.slug}.html`
        : `/post/${post?.id || post?._id || ""}`;

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

const findPosts = (posts, question) => {
    const terms = normalize(question)
        .split(/\s+/)
        .filter((term) => term.length > 2);

    if (!terms.length) return [];

    return posts
        .map((post) => {
            const haystack = normalize(
                `${postTitle(post)} ${post.category || ""} ${post.summary || ""} ${post.description || ""}`
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

const detectLanguage = (question) => {
    const text = normalize(question);

    if (/muraho|amakuru|ndashaka|shaka|ibyiciro|inkuru|uyu munsi|ni ayahe/.test(text)) return "rw";
    if (/bonjour|bonsoir|merci|nouvelles|chercher|rubrique|article/.test(text)) return "fr";
    if (/habari|asante|tafuta|makala|leo|kategoria|habari mpya/.test(text)) return "sw";
    if (/hola|buenos|gracias|buscar|noticias|categoria|articulo/.test(text)) return "es";
    if (/ola|obrigado|procurar|noticias|categoria|artigo/.test(text)) return "pt";
    if (/hello|hi|latest|news|search|category|article|today|thanks/.test(text)) return "en";

    return "en";
};

const localized = {
    rw: {
        welcome: "Muraho! Ndi umufasha wa Rubavu Today. Wabaza amakuru mashya, ibyiciro, cyangwa ugashaka inkuru runaka.",
        greeting: "Muraho neza! Nakwereka amakuru mashya cyangwa nkagufasha kubona inkuru ushaka.",
        categories: (items) => `Ibyiciro biboneka kuri Rubavu Today ni: ${items.join(", ")}.`,
        latest: (items) => `Amakuru agezweho ni:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Koresha akazu ka Shakisha inkuru cyangwa wandike umutwe w'inkuru ushaka.",
        matches: "Nabonye izi nkuru zijyanye n'ibyo wanditse:",
        empty: "Sinabonye igisubizo gihuye neza. Baza amakuru mashya, ibyiciro, cyangwa wandike umutwe w'inkuru.",
        unavailable: "Nta makuru abonetse ubu. Ongera ugerageze nyuma.",
    },
    en: {
        welcome: "Hello! I am the Rubavu Today assistant. Ask about the latest news, categories, or find a specific article.",
        greeting: "Hello! I can show you the latest news or help you find an article.",
        categories: (items) => `Rubavu Today categories include: ${items.join(", ")}.`,
        latest: (items) => `The latest news is:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Use the search box or type the title or subject of the article you want.",
        matches: "I found these articles related to your question:",
        empty: "I could not find a close match. Ask about the latest news, categories, or enter an article title.",
        unavailable: "No news is available right now. Please try again later.",
    },
    fr: {
        welcome: "Bonjour ! Je suis l'assistant de Rubavu Today. Demandez les dernières nouvelles, les rubriques ou un article précis.",
        greeting: "Bonjour ! Je peux vous montrer les dernières nouvelles ou vous aider à trouver un article.",
        categories: (items) => `Les rubriques de Rubavu Today sont : ${items.join(", ")}.`,
        latest: (items) => `Les dernières nouvelles sont :\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Utilisez la recherche ou écrivez le titre ou le sujet de l'article recherché.",
        matches: "Voici les articles liés à votre question :",
        empty: "Je n'ai pas trouvé de résultat proche. Demandez les dernières nouvelles ou saisissez un titre.",
        unavailable: "Aucune nouvelle n'est disponible pour le moment. Réessayez plus tard.",
    },
    sw: {
        welcome: "Habari! Mimi ni msaidizi wa Rubavu Today. Uliza kuhusu habari mpya, kategoria, au tafuta makala.",
        greeting: "Habari! Ninaweza kukuonyesha habari mpya au kukusaidia kupata makala.",
        categories: (items) => `Kategoria za Rubavu Today ni: ${items.join(", ")}.`,
        latest: (items) => `Habari mpya ni:\n${items.map((item) => `• ${item}`).join("\n")}`,
        search: "Tumia kisanduku cha kutafuta au andika kichwa cha makala unayotaka.",
        matches: "Nimepata makala hizi zinazohusiana na swali lako:",
        empty: "Sikupata jibu linalolingana. Uliza kuhusu habari mpya au andika kichwa cha makala.",
        unavailable: "Hakuna habari kwa sasa. Tafadhali jaribu tena baadaye.",
    },
};

const answerQuestion = (question, posts) => {
    const normalizedQuestion = normalize(question);
    const language = detectLanguage(question);
    const copy = localized[language] || localized.en;
    const latestPosts = [...posts].slice(0, 3);
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
        () => ["Amakuru mashya ni ayahe?", "Ni ibihe byiciro bihari?"],
        []
    );

    const sendQuestion = (value = question) => {
        const text = cleanText(value);
        if (!text || isLoading) return;

        setQuestion("");
        setIsLoading(true);
        setMessages((current) => [
            ...current,
            { id: `user-${Date.now()}`, role: "user", text },
        ]);

        window.setTimeout(() => {
            const answer = answerQuestion(text, posts);
            setMessages((current) => [
                ...current,
                { id: `assistant-${Date.now()}`, role: "assistant", ...answer },
            ]);
            setIsLoading(false);
        }, 350);
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
                                <p className="text-[10px] text-slate-300">Umufasha w'indimi nyinshi</p>
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
                                placeholder="Andika mu rurimi urwo ari rwo rwose..."
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
                className="fixed bottom-4 right-3 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 sm:right-5"
            >
                {isOpen ? (
                    <X size={21} aria-hidden="true" />
                ) : (
                    <img src={websiteLogo} alt="Rubavu Today AI" className="h-full w-full rounded-full object-cover" />
                )}
            </button>
        </>
    );
}
