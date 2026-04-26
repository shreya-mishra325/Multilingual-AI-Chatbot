import fs from "fs";
import csv from "csv-parser";

const csvPath = new URL("../data/price_data.csv", import.meta.url);
let cachedData = [];
let isLoaded = false;

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

async function ensureDataLoaded() {
  if (!isLoaded) {
    await loadCSV();
    isLoaded = true;
  }
}

const STATES = [
  "uttar pradesh",
  "punjab",
  "haryana",
  "bihar",
  "maharashtra",
  "odisha"
];

function normalizeLocation(district, state) {
  if (!district) return { district: null, state };
  const lower = district.toLowerCase();
  if (STATES.includes(lower)) {
    return { district: null, state: lower };
  }
  return { district, state };
}

function clean(val) {
  if (!val) return null;
  if (Array.isArray(val)) return val[0];
  return String(val).trim();
}

function normalizeCrop(crop) {
  if (!crop) return null;
  const c = crop.toLowerCase();
  if (c.includes("chilli") || c.includes("chili")) return "green chilli";
  return c;
}

async function getPriceAdvisory(commodity, state, district) {
  try {
    await ensureDataLoaded();
    commodity = normalizeCrop(clean(commodity));
    state = clean(state);
    district = clean(district);

    const loc = normalizeLocation(district, state);
    district = loc.district;
    state = loc.state || state;

    if (!commodity) return "❌ Please provide a commodity.";

    state = state && state.toLowerCase() !== "unknown" ? state.toLowerCase() : null;
    district = district && district.toLowerCase() !== "unknown" ? district.toLowerCase() : null;

    let matches = [];

    if (state && district) {
      matches = cachedData.filter(
        (r) =>
          r.Commodity?.toLowerCase() === commodity &&
          r.State?.toLowerCase() === state &&
          r.District?.toLowerCase() === district
      );
    }

    if (!matches.length && district) {
      matches = cachedData.filter(
        (r) =>
          r.Commodity?.toLowerCase() === commodity &&
          r.District?.toLowerCase() === district
      );
    }

    if (!matches.length && state) {
      matches = cachedData.filter(
        (r) =>
          r.Commodity?.toLowerCase() === commodity &&
          r.State?.toLowerCase() === state
      );
    }

    if (!matches.length) {
      matches = cachedData.filter(
        (r) => r.Commodity?.toLowerCase() === commodity
      );
    }

    if (!matches.length) {
      return `❌ Sorry, no price data available for ${commodity}${
        district ? " in " + district : state ? " in " + state : ""
      }.`;
    }

    return matches
      .slice(0, 5)
      .map((r) =>
          `📍 ${r.District}, ${r.State} - ${r.Market}\n` +
          `🌾 ${r.Commodity}\n` +
          `• Arrival Date: ${r.Arrival_Date}\n` +
          `• Minimum: ₹${r.MinPrice} per quintal\n` +
          `• Maximum: ₹${r.MaxPrice} per quintal\n` +
          `• Modal: ₹${r.ModalPrice} per quintal`
      )
      .join("\n\n");
  } catch (error) {
    console.error("Error in getPriceAdvisory:", error.message);
    return "❌ Sorry, I faced an issue while fetching price data. Please try again later.";
  }
}

export {getPriceAdvisory};