import { useState, useEffect, useRef } from "react";
import { Mic, Send, Leaf, Info, Eye, Camera } from "lucide-react";

export default function Chatbotpage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const CHAT_API = "http://localhost:8000/api/chat";
  const WEATHER_API = "http://localhost:8000/weather/advisory";
  const PRICE_API = "http://localhost:8000/price/advisory";
  const SOIL_API = "http://localhost:8000/soil";

  const quickActions = [
    { label: "Farming Tips", icon: <Leaf size={18} />, type: "chat", url: CHAT_API, text: "Give me a farming tip" },
    { label: "Weather Summary", icon: <Info size={18} />, type: "weather", url: WEATHER_API, text: "weather update" },
    { label: "Mandi Prices", icon: <Eye size={18} />, type: "price", url: PRICE_API, text: "latest mandi prices" },
    { label: "Soil Health", icon: <Leaf size={18} />, type: "soil", url: SOIL_API, text: "tell me about soil health" }
  ];

  useEffect(() => {
    const loadVoices = () => setVoices(speechSynthesis.getVoices());
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const sendMessage = async (customText, url = CHAT_API, type = "chat") => {
    if (loading) return;

    const messageText = customText ?? input;
    if (!messageText.trim() && type === "chat") return;

    setLoading(true);
    setInput("");

    if (type === "chat") {
      setMessages(prev => [...prev, { sender: "user", text: messageText }]);
    }

    try {
      let response;

      if (type === "chat") {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText, language: selectedLang })
        });
      } else {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: messageText || "latest advisory", language: selectedLang })
        });
      }

      const data = await response.json();

      let text;
      if (type === "chat") text = data.response || data.reply;
      else if (type === "weather") text = data.advisory || data.response;
      else if (type === "price") text = data.prices || data.response;
      else if (type === "soil") text = data.response || data.advisory;

      if (!text) text = JSON.stringify(data, null, 2);

      setMessages(prev => [...prev, { sender: "bot", text }]);
      speakMessage(text, selectedLang);

    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "❌ Server error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = selectedLang;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);

    recognition.start();
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = () => {
    setMessages(prev => [
      ...prev,
      { sender: "user", text: "📷 Image uploaded" }
    ]);
  };

  const speakMessage = (text, lang) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voice = voices.find(v => v.lang === lang);
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="mt-6 flex flex-col h-[85vh] max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg">

      <div className="p-4 text-white text-lg font-semibold text-center rounded-t-xl" style={{ backgroundColor: "#4f7942" }}>
        🌾 Smart Farming Assistant
      </div>

      <div className="flex gap-2 p-3 justify-center flex-wrap">
        {quickActions.map((a, i) => (
          <button
            key={i}
            onClick={() => sendMessage(a.text, a.url, a.type)}
            className="cursor-pointer flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full transition"
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#4f7942";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.color = "";
            }}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-3 max-w-xs ${
              m.sender === "user"
                ? "ml-auto text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white"
            }`}
            style={{
              backgroundColor: m.sender === "user" ? "#4f7942" : "",
              borderRadius: m.sender === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              whiteSpace: "pre-line"
            }}
          >
            {m.text}
          </div>
        ))}

        {loading && <div className="text-sm text-gray-400">🤖 Thinking…</div>}
      </div>

      <div className="flex gap-3 p-4 border-t dark:border-gray-700 items-center">

        <button
          onClick={startListening}
          className={`cursor-pointer p-2 rounded-full ${listening ? "bg-red-500 text-white" : "bg-gray-300 dark:bg-gray-700 dark:text-white"}`}
        >
          <Mic size={20} />
        </button>

        <button
          onClick={handleCameraClick}
          className="cursor-pointer p-2 rounded-full bg-gray-300 dark:bg-gray-700 dark:text-white"
        >
          <Camera size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          hidden
        />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your farming question..."
          className="flex-1 px-4 py-2 border rounded-full outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />

        <button
          onClick={() => sendMessage()}
          className="cursor-pointer p-2 text-white rounded-full"
          style={{ color: "white", backgroundColor: "#4f7942" }}
        >
          <Send size={20} />
        </button>

      </div>
    </div>
  );
}