import fs from "fs";
import path from "path";
import csv from "csv-parser";

const csvPath = path.join(process.cwd(), "src/data/price_data.csv");
let cachedData = [];

function loadCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        cachedData = results;
        resolve();
      })
      .on("error", reject);
  });
}
await loadCSV();

export async function getPriceAdvisory(commodity, state, district) {
  try {
    if (!commodity) return "❌ Please provide a commodity.";

    console.log("getPriceAdvisory called with:", commodity, state, district);
    state = state && state.toLowerCase() !== "unknown" ? state : null;
    district = district && district.toLowerCase() !== "unknown" ? district : null;

    let matches = [];

    if (state && district) {
      matches = cachedData.filter(
        (r) =>
          r.Commodity?.toLowerCase() === commodity.toLowerCase() &&
          r.State?.toLowerCase() === state.toLowerCase() &&
          r.District?.toLowerCase() === district.toLowerCase()
      );
    }
    if (!matches.length && district) {
      matches = cachedData.filter(
        (r) =>
          r.Commodity?.toLowerCase() === commodity.toLowerCase() &&
          r.District?.toLowerCase() === district.toLowerCase()
      );
    }
    if (!matches.length && state) {
      matches = cachedData.filter(
        (r) =>
          r.Commodity?.toLowerCase() === commodity.toLowerCase() &&
          r.State?.toLowerCase() === state.toLowerCase()
      );
    }

    if (!matches.length) {
      matches = cachedData.filter(
        (r) => r.Commodity?.toLowerCase() === commodity.toLowerCase()
      );
    }

    if (!matches.length) {
      return `❌ Sorry, no price data available for ${commodity}${
        district ? " in " + district : state ? " in " + state : ""
      }.`;
    }

    return matches
  .map((r) => {
    const min = r.MinPrice ?? "N/A";
    const max = r.MaxPrice ?? "N/A";
    const modal = r.ModalPrice ?? "N/A";
    const arrival = r.Arrival_Date ?? "N/A";

    return (
      `📍 ${r.District}, ${r.State} - ${r.Market}\n` +
      `🌾 ${r.Commodity}\n` +
      `• Arrival Date: ${arrival}\n` +
      `• Minimum: ₹${min} per quintal\n` +
      `• Maximum: ₹${max} per quintal\n` +
      `• Modal: ₹${modal} per quintal\n`
    );
  })
  .join("\n\n");

  } catch (error) {
    console.error("Error in getPriceAdvisory:", error.message);
    return "❌ Sorry, I faced an issue while fetching price data. Please try again later.";
  }
}
