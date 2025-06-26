// src/pages/MessagesPage.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getAllMessages, sendMessage } from "../api/modules/messages";
import { getUser } from "../api/modules/users";
import { getPostById } from "../api/modules/posts";

export default function MessagesPage() {
  const { id } = useParams();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [friend, setFriend] = useState(null);

  const [Messages, setMessages] = useState([]);

  useEffect(() => {
    if (id) {
      setMessages(Messages[id] || []);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Messages]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(id);
        if (userData && id) {
          setFriend(userData);
          const allMessages = await getAllMessages(id);

          const updatedMessages = allMessages.map((message) => {
            return message.receiverId === parseInt(id)
              ? { ...message, from: "moi" }
              : message;
          });

          for (let i = 0; i < updatedMessages.length; i++) {
            if (updatedMessages[i].isSharing) {
              try {
                const post = await getPostById(updatedMessages[i].sharedId);
                updatedMessages[i].post = post;

                updatedMessages[i].post.author =
                  (await getUser(post.userId))?.username || "Auteur inconnu";
              } catch (error) {
                console.error("Error fetching post for shared message:", error);
              }
            }
          }

          setMessages(updatedMessages);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, [id]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessage = {
      from: "moi",
      text: input,
      createdAt: new Date().toISOString(),
    };

    // Send the message to the backend
    sendMessage({
      receiverId: id,
      text: input,
      isSharing: false, // Assuming this is not a shared message
      sharedId: null, // Assuming this is not a shared message
    })
      .then((response) => {
        console.log("Message sent successfully:", response);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const PostCard = ({ post }) => (
    <div className="group mt-4 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl shadow-xl p-0 overflow-hidden w-full max-w-sm transition-transform duration-300 hover:scale-[1.025] min-w-[350px] hover:shadow-2xl text-start">
      {
        <div className="relative">
          <span className="absolute top-2 right-2 bg-white/80 text-indigo-500 text-xs font-semibold px-2 py-1 rounded-lg shadow">
            {post.author}
          </span>
        </div>
      }
      <div className="p-5">
        {post.title && (
          <h3 className="text-lg font-bold text-indigo-700 mb-1">
            {post.title}
          </h3>
        )}
        <p
          className="text-gray-800 text-base font-medium mb-3 line-clamp-3 max-w-[300px] break-words"
          style={{ wordBreak: "break-word" }}
        >
          {post.content}
        </p>
        <div className="flex items-center justify-between mt-2">
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
    <div className="flex flex-col bg-white bg-opacity-50 backdrop-blur-md h-screen">
      {id ? (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e4e6eb] sticky top-0 z-10 shadow-sm bg-white bg-opacity-50 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5181b8] to-[#3b5998] flex items-center justify-center text-lg font-bold text-white">
              <img
                src={friend?.image?.image ? `data:image/jpg;base64,${friend.image.image}` : "/assets/default.png"}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {friend?.username}
              </h2>
            </div>
          </div>

          {/* Zone de messages*/}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-center bg-8"
          >
            <div className="px-4 py-6 space-y-4">
              {Messages.map((msg, index) => {
                const isMe = msg.receiverId === id || msg.from === "moi";
                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
              relative max-w-[85%] px-4 py-3 rounded-2xl transition-all duration-200
              shadow-md
              ${
                isMe
                  ? "bg-gradient-to-br from-indigo-100 to-blue-50 text-right text-gray-900 rounded-br-md"
                  : "bg-white text-left text-gray-900 rounded-bl-md border border-[#e4e6eb]"
              }
              hover:shadow-lg
            `}
                      style={{ minWidth: "120px" }}
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
                        {new Intl.DateTimeFormat("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(msg.createdAt))}
                      </span>

                      {/* Triangle décoratif */}
                      <div
                        className={`
                absolute bottom-0 w-3 h-3
                ${
                  isMe
                    ? "right-0 translate-x-[40%] bg-indigo-100 clip-path-triangle-right"
                    : "left-0 -translate-x-[40%] bg-white border-l border-b border-[#e4e6eb] clip-path-triangle-left"
                }
              `}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Zone de saisie */}
          <form
            className="flex items-center gap-2 px-4 py-3 border-t border-[#e4e6eb] bg-white bg-opacity-50 backdrop-blur-md sticky bottom-0"
            onSubmit={handleSend}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez un message..."
              className="flex-1 rounded-2xl border border-[#e4e6eb] px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#5181b8] bg-[#f0f2f5] text-gray-900"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-[#5181b8] text-white p-3 rounded-full font-semibold hover:bg-[#4471a6] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center ">
          <div className="bg-[#f0f2f5] rounded-full p-6 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-[#5181b8]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Bienvenue dans vos messages
          </h2>
          <p className="text-gray-600 max-w-md">
            Sélectionnez une conversation ou démarrez une nouvelle discussion
            pour commencer à échanger
          </p>
        </div>
      )}
    </div>
  );
}
