// ================= API URLs =================

// Volume Discount ki Apps Script API
const VOLUME_DISCOUNT_API_URL =
  "https://script.google.com/macros/s/AKfycbzaH1ytviDdRK809w9mkOwONc3W-l71V1r_kGnu1WafOBNNIq00FLfmg5XNrjDZMUW5nw/exec";

// FIRO (Flash) Discount API
const FIRO_DISCOUNT_API_URL =
  "https://script.google.com/macros/s/AKfycbx1umqO_4WiPxTTVv3OXcxSLUZFqo6d8MubR2Um_tTuJS8tP_LvHQzxYPw9rCPknvSLkA/exec";

// LP + CP dono ki nayi API (raw/flat format, SKU ID prefix se "LP-" / "CP-" pehchana jayega)
const LP_CP_API_URL =
  "";

// LS (Lot Sale) ki API — raw/flat format
const LOT_API_URL =
  "https://script.google.com/macros/s/AKfycbwbEwNR8sT9rELWPco3WFFwpEFl-Xg7EuKZ1NSEfoHmZKYRCzQY12-nhzj6khrXQOweRg/exec";

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

    // 👇 Discount data yahan attach hoga (getSkuLines mein set hoga)
    volumeTiers: [],
    firoOffers: [],
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

// ================= Volume Discount Helpers =================

/**
 * Raw volume discount rows ko SKU ID ke basis par group karta hai,
 * har SKU ke tiers ko Min Qty ke hisaab se ascending sort karta hai.
 */
function groupVolumeDiscounts(rawRows) {
  const map = {};

  rawRows.forEach((row) => {
    const skuId = row["SKU ID"];
    if (!skuId) return;

    if (!map[skuId]) map[skuId] = [];

    map[skuId].push({
      minQty: Number(row["Minimum Order Qty"]) || 0,
      benefitPerBag: Number(row["Volume Benefit ₹/Bag"]) || 0,
    });
  });

  Object.keys(map).forEach((skuId) => {
    map[skuId].sort((a, b) => a.minQty - b.minQty);
  });

  return map;
}

async function fetchVolumeDiscounts() {
  if (!VOLUME_DISCOUNT_API_URL) return {};

  try {
    const res = await fetch(VOLUME_DISCOUNT_API_URL, {
      method: "GET",
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const rawData = await res.json();
    if (!Array.isArray(rawData)) return {};

    const activeRows = rawData.filter(
      (row) => row["Active Status"] === "Active"
    );

    return groupVolumeDiscounts(activeRows);
  } catch (error) {
    console.error("Failed to fetch Volume Discounts:", error);
    return {};
  }
}

// ================= FIRO (Flash) Discount Helpers =================

/**
 * Raw FIRO rows ko SKU ID ke basis par group karta hai.
 * Live/expired ka check UI-render time par hoga (isLiveFiroOffer function se).
 */
function groupFiroOffers(rawRows) {
  const map = {};

  rawRows.forEach((row) => {
    const skuId = row["SKU ID"];
    if (!skuId) return;

    if (!map[skuId]) map[skuId] = [];

    map[skuId].push({
      firoId: row["FIRO ID"],
      firoName: row["FIRO Name"],
      startDateTime: row["Offer Start DateTime"],
      endDateTime: row["Offer End DateTime"],
      minQty: Number(row["Minimum Order Qty"]) || 0,
      benefitPerBag: Number(row["FIRO Benefit ₹/Bag"]) || 0,
      approvalRequired: row["Approval Required?"] === "Yes",
      remarks: row["Remarks"] || "",
    });
  });

  return map;
}

async function fetchFiroOffers() {
  if (!FIRO_DISCOUNT_API_URL) return {};

  try {
    const res = await fetch(FIRO_DISCOUNT_API_URL, {
      method: "GET",
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const rawData = await res.json();
    if (!Array.isArray(rawData)) return {};

    const activeRows = rawData.filter((row) => row["Status"] === "Active");

    return groupFiroOffers(activeRows);
  } catch (error) {
    console.error("Failed to fetch FIRO offers:", error);
    return {};
  }
}

/**
 * Check karta hai ki ek FIRO offer abhi (current time) live hai ya nahi.
 */
export function isLiveFiroOffer(offer) {
  const now = new Date();
  const start = new Date(offer.startDateTime);
  const end = new Date(offer.endDateTime);
  return now >= start && now <= end;
}

/**
 * Diye gaye quantity ke liye best applicable price nikalta hai:
 * - Normal dealer price se start
 * - Volume discount tier apply hota hai (base discount)
 * - Agar koi live FIRO offer bhi qty ke liye eligible hai, to wo Volume ke
 *   UPAR STACK hoga (extra discount) — Volume ke bina FIRO nahi hatega,
 *   dono ek sath add hote hain.
 */
export function calculateBestPrice(variant, quantity) {
  const basePrice = variant.dealerPrice || 0;

  // Best Volume tier dhoondenge (jo bhi highest applicable ho)
  let volumeBenefit = 0;
  if (Array.isArray(variant.volumeTiers)) {
    variant.volumeTiers.forEach((tier) => {
      if (quantity >= tier.minQty && tier.benefitPerBag > volumeBenefit) {
        volumeBenefit = tier.benefitPerBag;
      }
    });
  }

  // Best live FIRO offer dhoondenge
  let firoBenefit = 0;
  let activeFiro = null;
  if (Array.isArray(variant.firoOffers)) {
    variant.firoOffers.forEach((offer) => {
      if (
        isLiveFiroOffer(offer) &&
        quantity >= offer.minQty &&
        offer.benefitPerBag > firoBenefit
      ) {
        firoBenefit = offer.benefitPerBag;
        activeFiro = offer;
      }
    });
  }

  // Dono stack — Volume base hai, FIRO uske upar extra
  const totalDiscount = volumeBenefit + firoBenefit;

  let appliedType = "None";
  if (volumeBenefit > 0 && firoBenefit > 0) {
    appliedType = "Volume + FIRO";
  } else if (firoBenefit > 0) {
    appliedType = "FIRO";
  } else if (volumeBenefit > 0) {
    appliedType = "Volume";
  }

  return {
    basePrice,
    volumeDiscount: volumeBenefit, // alag se breakdown ke liye
    firoDiscount: firoBenefit,     // alag se breakdown ke liye
    discountPerBag: totalDiscount, // total combined discount
    finalPrice: basePrice - totalDiscount,
    appliedType, // "Volume + FIRO" | "FIRO" | "Volume" | "None"
    activeFiro,  // agar FIRO applied hua to uska poora object
  };
}

// ================= Fetchers (LP/CP/LS) =================

async function fetchLpCpData() {
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
    const [lpCpGroups, lotSaleGroup, volumeDiscounts, firoOffers] = await Promise.all([
      fetchLpCpData(),
      fetchLotSaleData(),
      fetchVolumeDiscounts(),
      fetchFiroOffers(),
    ]);

    const combined = [...lpCpGroups];

    if (lotSaleGroup) {
      combined.push(lotSaleGroup);
    }

    // Har variant ke andar uske volume tiers aur FIRO offers attach karo (SKU ID se match)
    combined.forEach((group) => {
      group.variants.forEach((variant) => {
        variant.volumeTiers = volumeDiscounts[variant.skuId] || [];
        variant.firoOffers = firoOffers[variant.skuId] || [];
      });
    });

    return combined;
  } catch (error) {
    console.error("Failed to fetch SKU lines:", error);
    return skuLines; // fallback
  }
}