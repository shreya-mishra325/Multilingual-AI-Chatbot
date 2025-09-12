import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Here’s a farming tip 🌱: Keep soil moist." },
      ]);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-green-600 dark:text-green-400 mb-4 block">
        ← Back
      </Link>
      <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Bot className="w-7 h-7 text-orange-500" /> Farming Chatbot
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Ask your smart assistant for farming tips
      </p>

      <div className="flex flex-col h-[60vh] bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender === "bot"
                  ? "bg-green-100 dark:bg-green-700 text-left"
                  : "bg-blue-100 dark:bg-blue-700 ml-auto text-right"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
