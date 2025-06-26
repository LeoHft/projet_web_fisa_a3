import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
// Importe tes modules API comme sur PC
import { getAllMessages, sendMessage } from "../api/modules/messages";
import { getUser } from "../api/modules/users";
import { getPostById } from "../api/modules/posts";

export default function MobileMessagesPage() {
  const { id } = useParams();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [friend, setFriend] = useState(null);
  const [Messages, setMessages] = useState([]);

  // Récupération des infos utilisateur + messages
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      if (!id) return;
      try {
        const userData = await getUser(id);
        setFriend(userData);
        const allMessages = await getAllMessages(id);

        // Harmonisation des messages (comme sur PC)
        const updatedMessages = await Promise.all(
          allMessages.map(async (message) => {
            const isMe = message.receiverId === parseInt(id);
            const msg = { ...message, from: isMe ? "moi" : message.from };
            if (msg.isSharing && msg.sharedId) {
              try {
                const post = await getPostById(msg.sharedId);
                msg.post = post;
                msg.post.author =
                  (await getUser(post.userId))?.username || "Auteur inconnu";
              } catch {
                // ignore
              }
            }
            return msg;
          })
        );
        setMessages(updatedMessages);
      } catch (e) {
        setMessages([]);
      }
    };
    fetchUserAndMessages();
  }, [id]);

  // Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Messages]);

  // Envoi d'un message texte
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessage = {
      from: "moi",
      text: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    try {
      await sendMessage({
        receiverId: id,
        text: input,
        isSharing: false,
        sharedId: null,
      });
    } catch {
      // Optionnel : gestion d'erreur d'envoi
    }
  };

  // Carte de post harmonisée (mobile-friendly)
  const PostCard = ({ post }) => (
    <div className="group mt-3 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl shadow-lg p-0 overflow-hidden w-full max-w-xs transition-transform duration-300 hover:scale-105 hover:shadow-2xl text-start">
      {post.imageUrl && (
        <div className="relative">
          <img
            src={post.imageUrl}
            alt="Image du post"
            className="w-full h-32 object-cover"
          />
          <span className="absolute top-2 left-2 bg-white/80 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
            {post.author}
          </span>
        </div>
      )}
      <div className="p-4">
        {post.title && (
          <h3 className="text-base font-bold text-indigo-700 mb-1">{post.title}</h3>
        )}
        <p className="text-gray-800 text-sm font-medium mb-2 line-clamp-3 break-words">
          {post.content}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">
            {new Intl.DateTimeFormat("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "2-digit",
            }).format(new Date(post.createdAt))}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] bg-white bg-opacity-50 backdrop-blur-md rounded-lg">
      {id ? (
        <>
          {/* Mobile Header */}
          <div className="flex items-center px-4 py-3 bg-[#45668e] text-white shadow-lg sticky top-0 z-50">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-lg font-bold mr-3">
              <img
                src={friend?.image?.image ? `data:image/jpg;base64,${friend.image.image}` : "/assets/default.png"}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
              />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <h1 className="text-lg font-semibold truncate">{friend?.username || "Contact"}</h1>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-[#f7f8fa] px-2 py-2"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e4e6ea' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="py-2 space-y-4">
              {Messages.map((msg, index) => {
                const isMe = msg.receiverId === id || msg.from === "moi";
                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        relative max-w-[85%] min-w-[60px] px-4 py-3 rounded-2xl transition-all duration-200 shadow-md
                        ${isMe
                          ? "bg-gradient-to-br from-indigo-100 to-blue-50 text-right text-gray-900 rounded-br-md"
                          : "bg-white text-left text-gray-900 rounded-bl-md border border-[#e4e6eb]"}
                        hover:shadow-lg
                      `}
                    >
                      {/* Texte du message */}
                      {msg.text && (
                        <p className="break-words text-base mb-1">{msg.text}</p>
                      )}
                      {/* Carte du post */}
                      {msg.post && <PostCard post={msg.post} />}
                      {/* Heure */}
                      <span
                        className={`block text-xs mt-2 text-gray-400 ${
                          isMe ? "text-right" : "text-left"
                        }`}
                      >
                        {msg.createdAt
                          ? new Intl.DateTimeFormat("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(msg.createdAt))
                          : msg.time}
                      </span>
                      {/* Triangle décoratif */}
                      <div
                        className={`
                          absolute bottom-0 w-3 h-3
                          ${isMe
                            ? "right-0 translate-x-[40%] bg-indigo-100 clip-path-triangle-right"
                            : "left-0 -translate-x-[40%] bg-white border-l border-b border-[#e4e6eb] clip-path-triangle-left"}
                        `}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Mobile Input */}
          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 px-2 py-3 border-t border-gray-200 bg-white sticky bottom-0 rounded-b-lg"
          >
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                className="w-full resize-none bg-[#f2f3f5] border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#45668e] focus:border-transparent text-base max-h-32 min-h-[48px]"
                rows={1}
                style={{ height: "auto", minHeight: "48px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 128) + "px";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex-shrink-0 w-12 h-12 bg-[#45668e] text-white rounded-full flex items-center justify-center font-semibold hover:bg-[#3d5a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </>
      ) : ( 
        <div className="flex flex-col items-center justify-center h-full p-6 text-center rounded-lg shadow-lg">
          <div className="w-24 h-24 bg-[#45668e] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-[#45668e]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Vos Messages
          </h2>
          <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
            Sélectionnez un dialogue ou commencez une nouvelle conversation pour discuter avec vos amis
          </p>
        </div>
      )}
    </div>
  );
}
