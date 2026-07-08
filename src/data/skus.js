// ================= API URLs =================

// LP + CP dono ki nayi API (raw/flat format, SKU ID prefix se "LP-" / "CP-" pehchana jayega)
const LP_CP_API_URL =
  "";

// LS (Lot Sale) ki API — raw/flat format
const LOT_API_URL =
  "https://script.google.com/macros/s/AKfycbwbEwNR8sT9rELWPco3WFFwpEFl-Xg7EuKZ1NSEfoHmZKYRCzQY12-nhzj6khrXQOweRg/exec";

  // {
    // "SKU ID": "Lot-0009 | AMASIA | UTTAM | BHOG | 30 KG",
    // "SKu Name": "AMASIA | UTTAM | BHOG | WAND | 30 KG",
    // "Unit": "30 KG",
    // "Unit per Cartoon / Bag": 1,
    // "C*D": 30,
    // "MRP Per Cartoon / Bag": 4899,
    // "Consumer Discount": 0.2,
    // "Dealer Discount": 0.2,
    // "Consumer Price / Bag": 3919.2,
    // "Delaer Price / Bag": 3135.3599999999997,
    // "MRP / Kg": 163.3,
    // "Consumer Price / Kg": 130.64,
    // "Dealer Price / KG": 104.51199999999999
  // }

export const skuLines = []; // fallback

// ================= Helpers =================

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Ek raw sheet row (LP/CP/LS teeno ka same shape hai)
 * ko variant object mein convert karta hai.
 */
function mapRowToVariant(row, { series, packagingType, channelCategory, skuStatus, primaryUse, pitch }) {
  const skuId = row["SKU ID"];
  const name = row["SKu Name"] || skuId;

  return {
    id: slugify(skuId),
    skuId: skuId,
    name: name,
    skuCode: skuId,
    grade: "Basmati Rice",
    grainLength: "",
    moisture: packagingType,
    broken: channelCategory,
    packSizes: row["Unit"] || "",
    description: pitch,
    inStock: true,
    series: series,
    packagingType: packagingType,
    usp: "",
    mrp: row["MRP Per Cartoon / Bag"] ?? null,
    dealerPrice: row["Delaer Price / Bag"] ?? row["Dealer Price / Bag"] ?? null,
    moq: 2,
    currentStock: 4,
    offer: "NIL",
    offerValidTill: "NIL",
    primaryUse: primaryUse,
    image: "",
    productType: series,
    channelCategory: channelCategory,
    skuStatus: skuStatus,
    pushRegion: "Delhi-NCR",
    suggestedPitch: pitch,
    whyChoose: "",
    aboutProduct: "",

    // Extra raw pricing fields
    unitPerCartoon: row["Unit per Cartoon / Bag"] ?? null,
    cd: row["C*D"] ?? null,
    consumerDiscount: row["Consumer Discount"] ?? null,
    dealerDiscount: row["Dealer Discount"] ?? null,
    consumerPriceBag: row["Consumer Price / Bag"] ?? null,
    mrpPerKg: row["MRP / Kg"] ?? null,
    consumerPricePerKg: row["Consumer Price / Kg"] ?? null,
    dealerPricePerKg: row["Dealer Price / KG"] ?? null,
  };
}

/**
 * LP + CP ke raw combined data ko prefix ("LP-" / "CP-") se
 * split karke 2 alag groups banata hai.
 */
function transformLpCpData(rawRows) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) return [];

  const validRows = rawRows.filter(
    (row) => row["SKU ID"] && String(row["SKU ID"]).trim() !== ""
  );

  const lpRows = validRows.filter((row) =>
    String(row["SKU ID"]).trim().toUpperCase().startsWith("LP-")
  );

  const cpRows = validRows.filter((row) =>
    String(row["SKU ID"]).trim().toUpperCase().startsWith("CP-")
  );

  const groups = [];

  if (lpRows.length > 0) {
    groups.push({
      id: "lp-loose-pack",
      name: "LP (Loose Pack) SKU",
      icon: "⭐",
      variants: lpRows.map((row) =>
        mapRowToVariant(row, {
          series: "LP (Loose Pack)",
          packagingType: "Printed Pouch",
          channelCategory: "General Trade, Wholesale",
          skuStatus: "Active",
          primaryUse: "Retail loose sale, HoReCa bulk supply",
          pitch:
            "Yeh loose sale range hai, retailer customer ke hisaab se bech sakta hai aur movement strong rehta hai.",
        })
      ),
    });
  }

  if (cpRows.length > 0) {
    groups.push({
      id: "cp-consumer-pack",
      name: "CP (Consumer Pack) SKU",
      icon: "⭐",
      variants: cpRows.map((row) =>
        mapRowToVariant(row, {
          series: "CP (Consumer Pack)",
          packagingType: "Printed Pouch",
          channelCategory: "Modern Trade, Quick Commerce, D2C Website, Export",
          skuStatus: "Active",
          primaryUse: "Daily cooking, retailer resale",
          pitch:
            "Yeh premium consumer pack range hai, brand lovers aur daily household use ke liye strong hai.",
        })
      ),
    });
  }

  return groups;
}

/**
 * LS (Lot Sale) ke raw data ko ek group mein convert karta hai.
 */
function transformLotSaleData(rawRows) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) return null;

  const validRows = rawRows.filter(
    (row) => row["SKU ID"] && String(row["SKU ID"]).trim() !== ""
  );

  if (validRows.length === 0) return null;

  return {
    id: "ls-lot-sale",
    name: "LS (Lot Sale) SKU",
    icon: "⭐",
    variants: validRows.map((row) =>
      mapRowToVariant(row, {
        series: "LS (Lot Sale)",
        packagingType: "PP Bag",
        channelCategory: "Wholesale",
        skuStatus: "Seasonal",
        primaryUse: "Bulk trading and redistribution",
        pitch:
          "Yeh lot based bulk sale hai, wholesalers/caterers ke liye fast movement aur cash flow product hai.",
      })
    ),
  };
}

// ================= Fetchers =================

async function fetchLpCpData() {
  // Agar API URL abhi set nahi hai, to fetch hi skip kar do
  if (!LP_CP_API_URL) {
    console.warn("LP+CP API URL abhi set nahi hai — LP/CP data skip ho raha hai.");
    return [];
  }

  try {
    const res = await fetch(LP_CP_API_URL, {
      method: "GET",
      next: { revalidate: 10 },
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const rawData = await res.json();
    if (!Array.isArray(rawData)) return [];

    return transformLpCpData(rawData);
  } catch (error) {
    console.error("Failed to fetch LP+CP data:", error);
    return [];
  }
}

async function fetchLotSaleData() {
  try {
    const res = await fetch(LOT_API_URL, {
      method: "GET",
      next: { revalidate: 10 },
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const rawData = await res.json();
    if (!Array.isArray(rawData)) return null;

    return transformLotSaleData(rawData);
  } catch (error) {
    console.error("Failed to fetch LS (Lot Sale) data:", error);
    return null;
  }
}

// ================= Main Export =================

export async function getSkuLines() {
  try {
    const [lpCpGroups, lotSaleGroup] = await Promise.all([
      fetchLpCpData(),
      fetchLotSaleData(),
    ]);

    const combined = [...lpCpGroups];

    if (lotSaleGroup) {
      combined.push(lotSaleGroup);
    }

    return combined;
  } catch (error) {
    console.error("Failed to fetch SKU lines:", error);
    return skuLines; // fallback
  }
}