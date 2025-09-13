import { Camera, Cloud, Leaf, Bot, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions() {
  const actions = [
    {
      title: "Soil Analysis",
      description: "Take photo & get instant analysis",
      icon: <Camera className="w-6 h-6 text-green-600" />,
      link: "/soil-analysis",
    },
    {
      title: "Mandi Prices",
      description: "Check today’s mandi market rates",
      icon: <ShoppingCart className="w-6 h-6 text-yellow-600" />,
      link: "/mandi-prices",
    },
    {
      title: "Crop Guides",
      description: "Learn about growing different crops",
      icon: <Leaf className="w-6 h-6 text-purple-600" />,
      link: "/crop-guides",
    },
    {
      title: "Farming Chatbot",
      description: "Ask AI assistant for farming tips",
      icon: <Bot className="w-6 h-6 text-orange-600" />,
      link: "/chatbot",
    },
  ];

  return (
    <section className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((action, i) => (
          <Link
            to={action.link}
            key={i}
            className="p-5 rounded-xl bg-white dark:bg-gray-900 shadow hover:shadow-md transition flex items-center gap-4"
          >
            {action.icon}
            <div>
              <h3 className="text-lg font-semibold">{action.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
