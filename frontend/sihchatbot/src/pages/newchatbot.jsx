import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");

  const quickActions = [
    { label: "🌾 Mandi Prices", text: "Tell me about prices of bottle gourd,Chandigarh", url: "https://multilingual-ai-chatbot.onrender.com/price/advisory", type: "query" },
    { label: "🌱 Farming Tips", text: "Give me farming tips", url: "https://multilingual-ai-chatbot.onrender.com/api/chat", type: "message" },
    { label: "🐛 Pest Control", text: "How to control pests in crops?", url: "https://multilingual-ai-chatbot.onrender.com/api/pest/ask", type: "message" },
    { label: "💧 Weather", text: "give me today's weather summary", url:"https://multilingual-ai-chatbot.onrender.com/weather/advisory", type: "message" },
  ];

  const speakMessage = (message, lang) => {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = lang === "hi" ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(speech);
  };

  const sendMessage = async (userMessage, url, type = "message") => {
    if (!userMessage.trim()) return;

    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);

    try {
      let body;
      if (type === "query") {
        body = { query: userMessage, language: "en" };
      } else {
        body = { message: userMessage };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();

      let reply;
      try {
        const data = JSON.parse(text);
        reply = data.reply || data.message || data.response || text;
      } catch {
        reply = text;
      }

      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
      speakMessage(reply, selectedLang);
    } catch (error) {
      console.error("Error talking to backend:", error);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Unable to reach server", sender: "bot" },
      ]);
    }

    setInput("");
  };

  const handleQuickAction = (action) => {
    sendMessage(action.text, action.url, action.type);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto border rounded-lg shadow-lg bg-white dark:bg-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center bg-green-600 text-white dark:bg-green-700">
        <h2 className="text-lg font-bold">🌾 Farming Assistant</h2>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs break-words ${
                msg.sender === "user"
                  ? "bg-green-500 text-white dark:bg-green-600"
                  : "bg-gray-300 dark:bg-gray-700 dark:text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickAction(action)}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t flex gap-2 bg-white dark:bg-gray-900">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={() => sendMessage(input, "https://multilingual-ai-chatbot.onrender.com/api/chat", "message")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
        >
          Send
        </button>
      </div>
    </div>
  );
}
