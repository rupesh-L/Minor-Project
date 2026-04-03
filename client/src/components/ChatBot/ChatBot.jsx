import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "👋 Hi! I'm your bookstore assistant. Ask me about books, authors, or recommendations!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call your backend API
      const response = await axios.post("http://localhost:5000/api/v1/chat", {
        query: input,
      });

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response.data.answer,
          books: response.data.books,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "😔 Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 btn btn-circle btn-primary w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-128 bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden z-50 flex flex-col animate-slideUp">
          {/* Header */}
          <div className="bg-primary text-primary-content p-4 flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full bg-primary-focus flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-bold">Bookstore Assistant</h3>
              <p className="text-xs opacity-90">Ask me about books!</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle ml-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat ${msg.type === "user" ? "chat-end" : "chat-start"}`}
              >
                {msg.type === "bot" && (
                  <div className="chat-image avatar">
                    <div className="w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                <div
                  className={`chat-bubble ${msg.type === "user" ? "chat-bubble-primary" : "bg-base-100"}`}
                >
                  <p className="text-sm">{msg.text}</p>

                  {/* Show book results if any */}
                  {msg.books && msg.books.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-base-300 pt-2">
                      <p className="text-xs font-semibold">📚 Related Books:</p>
                      {msg.books.map((book, i) => (
                        <div
                          key={i}
                          className="text-xs bg-base-200 p-2 rounded-lg"
                        >
                          <p className="font-medium">{book.bookName}</p>
                          <p className="opacity-70">by {book.author}</p>
                          {book.price && (
                            <p className="text-success">${book.price}</p>
                          )}
                          <Link
                            to={`http://localhost:5173/book/${book._id}`}
                            className="text-blue-500 py-1 hover:bg-gray-600 px-4 my-3 inline-block transition font-bold"
                          >
                            Click
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="loading loading-spinner loading-xs text-primary"></span>
                  </div>
                </div>
                <div className="chat-bubble bg-base-100">
                  <span className="loading loading-dots loading-md"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-base-300 bg-base-100"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about books..."
                className="input input-bordered flex-1 input-sm md:input-md"
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm md:btn-md"
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
