import { useState, useEffect } from "react";
import { Mic, Send, Leaf, Info, Eye, MoreHorizontal } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en-US");

  const BACKEND_URL = "https://multilingual-ai-chatbot.onrender.com/"; // default

  // 🔹 Dynamic quick action buttons with different endpoints
  const quickActions = [
    {
      label: "Farming Tips",
      icon: <Leaf size={18} />,
      message: "Give me a farming tip",
      url: "https://multilingual-ai-chatbot.onrender.com/api/chat",
    },
    {
      label: "Weather Summary",
      icon: <Info size={18} />,
      message: "Give me today’s weather summary",
      url: "https://multilingual-ai-chatbot.onrender.com/weather/advisory",
    },
    {
      label: "Mandi Prices",
      icon: <Eye size={18} />,
      message: "Analyze crop prices",
      url: "https://multilingual-ai-chatbot.onrender.com/price/advisory",
    },
    {
      label: "More",
      icon: <MoreHorizontal size={18} />,
      message: "Show me more options",
      url: "https://multilingual-ai-chatbot.onrender.com/api/chat",
    },
  ];

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      setVoices(speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Send message to backend
  const sendMessage = async (customMessage, url = BACKEND_URL) => {
    const userMessage = customMessage || input;
    if (!userMessage.trim()) return;

    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      const reply =
        data.reply ||
        data.message ||
        data.response ||
        "Sorry, I didn’t understand that.";

      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
      speakMessage(reply, selectedLang);
    } catch (error) {
      console.error("Error talking to backend:", error);
      const failMsg = "⚠ Unable to reach server. Please try again.";
      setMessages((prev) => [...prev, { text: failMsg, sender: "bot" }]);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // 🎤 Voice input
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = selectedLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  // 🔊 Voice output
  const speakMessage = (message, lang) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = lang;

    const match = voices.find((v) => v.lang === lang);
    if (match) utterance.voice = match;

    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[85vh] w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 bg-green-600 text-white font-bold text-lg sm:text-xl text-center">
        Farming Assistant Chatbot 🌾
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2 p-3 sm:p-4 justify-center">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => sendMessage(action.message, action.url)}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 
                       text-sm text-gray-900 dark:text-gray-100 hover:bg-green-500 hover:text-white 
                       transition"
          >
            {action.icon} {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 sm:p-3 rounded-xl max-w-[85%] sm:max-w-xs break-words ${
              msg.sender === "user"
                ? "bg-green-500 text-white self-end ml-auto"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start"
            }`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="p-2 sm:p-3 border-t border-gray-300 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-2">
        <select
          className="w-full sm:w-auto p-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
        >
          <option value="en-US">English (US)</option>
          <option value="hi-IN">Hindi (India)</option>
          <option value="bn-IN">Bengali (India)</option>
          <option value="ta-IN">Tamil (India)</option>
          <option value="te-IN">Telugu (India)</option>
          <option value="kn-IN">Kannada (India)</option>
        </select>

        <div className="flex items-center gap-2 w-full">
          {/* Mic */}
          <button
            onClick={startListening}
            className={`p-2 rounded-full ${
              listening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            }`}
            title="Start Voice Input"
          >
            <Mic size={20} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            className="flex-1 p-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white 
                       dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}