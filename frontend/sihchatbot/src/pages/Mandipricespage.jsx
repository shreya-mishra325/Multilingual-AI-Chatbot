import { Link } from "react-router-dom";

export default function MandiPricesPage() {
  const crops = [
    { name: "Wheat", price: "₹2,150 / quintal", change: "+2%" },
    { name: "Rice", price: "₹3,100 / quintal", change: "-1%" },
    { name: "Sugarcane", price: "₹310 / quintal", change: "+0.5%" },
    { name: "Cotton", price: "₹6,500 / quintal", change: "+3%" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-green-600 dark:text-green-400 mb-4 block">
        ← Back
      </Link>
      <h2 className="text-3xl font-bold mb-2">Mandi Prices</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Stay updated with today’s mandi prices
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3">Crop</th>
              <th className="p-3">Price</th>
              <th className="p-3">Change</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop, i) => (
              <tr
                key={i}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{crop.name}</td>
                <td className="p-3">{crop.price}</td>
                <td
                  className={`p-3 font-medium ${
                    crop.change.includes("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {crop.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
