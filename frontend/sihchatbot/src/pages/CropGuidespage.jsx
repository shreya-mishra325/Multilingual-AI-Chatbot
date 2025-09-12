import { Leaf, Droplet, Sun } from "lucide-react";
import { Link } from "react-router-dom";

export default function CropGuidesPage() {
  const guides = [
    {
      title: "Wheat",
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      details: "Grows best in cool climates, requires well-drained loamy soil.",
    },
    {
      title: "Rice",
      icon: <Droplet className="w-8 h-8 text-blue-600" />,
      details: "Needs standing water, clayey soil, and humid climate.",
    },
    {
      title: "Cotton",
      icon: <Sun className="w-8 h-8 text-yellow-600" />,
      details: "Requires high temperature, black soil, and plenty of sunshine.",
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-green-600 dark:text-green-400 mb-4 block">
        ← Back
      </Link>
      <h2 className="text-3xl font-bold mb-2">Crop Guides</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Learn how to grow different crops effectively
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide, i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              {guide.icon}
              <h3 className="text-xl font-semibold">{guide.title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{guide.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
