import fs from "fs";
import path from "path";
import csv from "csv-parser";

const csvPath = path.join(process.cwd(), "src/data/price_data.csv");
console.log("CSV file exists?", fs.existsSync(csvPath));

async function readCSVFallback(commodity, state, district) {
  const results = [];
  return new Promise((resolve) => {
    fs.createReadStream(path.join(process.cwd(), "src/data/price_data.csv"))
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        const record = results.find(
  (r) =>
    r.Commodity?.toLowerCase() === commodity.toLowerCase() &&
    (!state || r.State?.toLowerCase() === state.toLowerCase()) &&
    (!district || r.District?.toLowerCase() === district.toLowerCase())
);


        resolve(record || null);
      });
  });
}

export async function getPriceAdvisory(commodity, state, district) {
  try {
    if (!commodity) return "❌ Please provide a commodity.";

    console.log("getPriceAdvisory called with:", commodity, state, district);

    const record = await readCSVFallback(commodity, state, district);
    console.log("CSV record found:", record);

    if (!record) {
      return `❌ Sorry, no price data available for ${commodity} in ${district || state || "your area"}.`;
    }

    return (
      `🌾 In ${record.District} (${record.State}), ${record.Commodity} is selling at:\n` +
      `Minimum: ₹${record.Min_x0020_Price} per quintal\n` +
      `Maximum: ₹${record.Max_x0020_Price} per quintal\n` +
      `Modal: ₹${record.Modal_x0020_Price} per quintal\n` +
      `Mandi: ${record.Market}`
);

  } catch (error) {
    return "❌ Sorry, I faced an issue while fetching price data. Please try again later.";
  }
}

