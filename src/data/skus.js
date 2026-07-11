// ================= API URLs =================

// ---- BRAND (LP + CP merged) ----
const BRAND_API_URL = ""; // Brand product data API — abhi tak nahi bani
const BRAND_VOLUME_DISCOUNT_API_URL = ""; // Brand ka apna Volume Discount sheet — abhi nahi bani
const BRAND_FIRO_DISCOUNT_API_URL = ""; // Brand ka apna FIRO sheet — abhi nahi bani

// ---- LOT (Lot Sale) ----
const LOT_API_URL =
  "https://script.google.com/macros/s/AKfycbwbEwNR8sT9rELWPco3WFFwpEFl-Xg7EuKZ1NSEfoHmZKYRCzQY12-nhzj6khrXQOweRg/exec";

  const LOT_VOLUME_DISCOUNT_API_URL =
  "https://script.google.com/macros/s/AKfycbzaH1ytviDdRK809w9mkOwONc3W-l71V1r_kGnu1WafOBNNIq00FLfmg5XNrjDZMUW5nw/exec";

  const LOT_FIRO_DISCOUNT_API_URL =
  "https://script.google.com/macros/s/AKfycbx1umqO_4WiPxTTVv3OXcxSLUZFqo6d8MubR2Um_tTuJS8tP_LvHQzxYPw9rCPknvSLkA/exec";

const INTRO_OFFER_API_URL = 
   "https://script.google.com/macros/s/AKfycbzPn7WxZZqzTNzibGw4CB5D3LrzO1wvDMRvoIwKFk0qFcqYxhmwBsyiAk1ZNzS6XwFN5A/exec";

  export const skuLines = []; // fallback

// ================= Helpers =================

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Ek raw sheet row ko variant object mein convert karta hai.
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

    unitPerCartoon: row["Unit per Cartoon / Bag"] ?? null,
    cd: row["C*D"] ?? null,
    consumerDiscount: row["Consumer Discount"] ?? null,
    dealerDiscount: row["Dealer Discount"] ?? null,
    consumerPriceBag: row["Consumer Price / Bag"] ?? null,
    mrpPerKg: row["MRP / Kg"] ?? null,
    consumerPricePerKg: row["Consumer Price / Kg"] ?? null,
    dealerPricePerKg: row["Dealer Price / KG"] ?? null,

    volumeTiers: [],
    firoOffers: [],
    introOffer: null, // 👈 YE LINE ADD KAREIN
  };
}

/**
 * Brand ke raw data (LP-/CP- prefix wale rows) ko EK single group mein
 * combine karta hai. Prefix sirf per-row metadata (packaging, channel)
 * decide karne ke liye use hota hai, lekin ab alag tabs nahi banti —
 * sab ek hi "Brand" tab ke andar dikhenge.
 */
function transformBrandData(rawRows) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) return null;

  const validRows = rawRows.filter(
    (row) => row["SKU ID"] && String(row["SKU ID"]).trim() !== ""
  );

  if (validRows.length === 0) return null;

  const variants = validRows.map((row) => {
    const isLoosePack = String(row["SKU ID"]).trim().toUpperCase().startsWith("LP-");

    return mapRowToVariant(row, isLoosePack
      ? {
          series: "LP (Loose Pack)",
          packagingType: "Printed Pouch",
          channelCategory: "General Trade, Wholesale",
          skuStatus: "Active",
          primaryUse: "Retail loose sale, HoReCa bulk supply",
          pitch: "Yeh loose sale range hai, retailer customer ke hisaab se bech sakta hai aur movement strong rehta hai.",
        }
      : {
          series: "CP (Consumer Pack)",
          packagingType: "Printed Pouch",
          channelCategory: "Modern Trade, Quick Commerce, D2C Website, Export",
          skuStatus: "Active",
          primaryUse: "Daily cooking, retailer resale",
          pitch: "Yeh premium consumer pack range hai, brand lovers aur daily household use ke liye strong hai.",
        }
    );
  });

  return {
    id: "brand",
    name: "Brand SKU",
    icon: "⭐",
    variants,
  };
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
        pitch: "Yeh lot based bulk sale hai, wholesalers/caterers ke liye fast movement aur cash flow product hai.",
      })
    ),
  };
}

// ================= Introductory Offer Helpers =================

function groupIntroOffers(rawRows) {
  const map = {};
  rawRows.forEach((row) => {
    const skuId = row["SKU ID"];
    if (!skuId) return;
    // Ek SKU par ek hi active intro offer maante hain
    map[skuId] = {
      introId: row["INTD_ID"],
      minQty: Number(row["Minimum Order Qty"]) || 0,
      gift: row["GIFT"] || "",
      remarks: row["Remarks"] || "",
    };
  });
  return map;
}

async function fetchIntroOffers() {
  if (!INTRO_OFFER_API_URL) return {};
  try {
    const res = await fetch(INTRO_OFFER_API_URL, { method: "GET", next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const rawData = await res.json();
    if (!Array.isArray(rawData)) return {};
    return groupIntroOffers(rawData);
  } catch (error) {
    console.error("Failed to fetch Introductory Offers:", error);
    return {};
  }
}

// ================= Generic Discount Fetchers =================
// Ab reusable — Brand aur Lot dono apni-apni URL ke sath isi function ko call karenge.

function groupByMinQty(rawRows) {
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

async function fetchVolumeDiscounts(apiUrl) {
  if (!apiUrl) return {};
  try {
    const res = await fetch(apiUrl, { method: "GET", next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const rawData = await res.json();
    if (!Array.isArray(rawData)) return {};
    const activeRows = rawData.filter((row) => row["Active Status"] === "Active");
    return groupByMinQty(activeRows);
  } catch (error) {
    console.error("Failed to fetch Volume Discounts:", error);
    return {};
  }
}

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

async function fetchFiroOffers(apiUrl) {
  if (!apiUrl) return {};
  try {
    const res = await fetch(apiUrl, { method: "GET", next: { revalidate: 30 } });
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
 * Volume + FIRO discount STACK hote hain (Volume base, FIRO extra upar).
 */
export function calculateBestPrice(variant, quantity) {
  const basePrice = variant.dealerPrice || 0;

  let volumeBenefit = 0;
  if (Array.isArray(variant.volumeTiers)) {
    variant.volumeTiers.forEach((tier) => {
      if (quantity >= tier.minQty && tier.benefitPerBag > volumeBenefit) {
        volumeBenefit = tier.benefitPerBag;
      }
    });
  }

  let firoBenefit = 0;
  let activeFiro = null;
  if (Array.isArray(variant.firoOffers)) {
    variant.firoOffers.forEach((offer) => {
      if (isLiveFiroOffer(offer) && quantity >= offer.minQty && offer.benefitPerBag > firoBenefit) {
        firoBenefit = offer.benefitPerBag;
        activeFiro = offer;
      }
    });
  }

  const totalDiscount = volumeBenefit + firoBenefit;

  let appliedType = "None";
  if (volumeBenefit > 0 && firoBenefit > 0) appliedType = "Volume + FIRO";
  else if (firoBenefit > 0) appliedType = "FIRO";
  else if (volumeBenefit > 0) appliedType = "Volume";

  return {
    basePrice,
    volumeDiscount: volumeBenefit,
    firoDiscount: firoBenefit,
    discountPerBag: totalDiscount,
    finalPrice: basePrice - totalDiscount,
    appliedType,
    activeFiro,
  };
}

// ================= Product Data Fetchers =================

async function fetchBrandData() {
  if (!BRAND_API_URL) {
    console.warn("Brand API URL abhi set nahi hai — Brand data skip ho raha hai.");
    return null;
  }
  try {
    const res = await fetch(BRAND_API_URL, { method: "GET", next: { revalidate: 10 } });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const rawData = await res.json();
    if (!Array.isArray(rawData)) return null;
    return transformBrandData(rawData);
  } catch (error) {
    console.error("Failed to fetch Brand data:", error);
    return null;
  }
}

async function fetchLotSaleData() {
  try {
    const res = await fetch(LOT_API_URL, { method: "GET", next: { revalidate: 10 } });
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
    const [
      brandGroup,
      lotSaleGroup,
      brandVolumeDiscounts,
      brandFiroOffers,
      lotVolumeDiscounts,
      lotFiroOffers,
      introOffers,
    ] = await Promise.all([
      fetchBrandData(),
      fetchLotSaleData(),
      fetchVolumeDiscounts(BRAND_VOLUME_DISCOUNT_API_URL),
      fetchFiroOffers(BRAND_FIRO_DISCOUNT_API_URL),
      fetchVolumeDiscounts(LOT_VOLUME_DISCOUNT_API_URL),
      fetchFiroOffers(LOT_FIRO_DISCOUNT_API_URL),
      fetchIntroOffers(),
    ]);

    const combined = [];

    // Brand group ko uski apni discount maps se attach karo
    if (brandGroup) {
      brandGroup.variants.forEach((variant) => {
        variant.volumeTiers = brandVolumeDiscounts[variant.skuId] || [];
        variant.firoOffers = brandFiroOffers[variant.skuId] || [];
        variant.introOffer = null; // 👈 ADD KIYA — Brand ke liye abhi intro offer nahi hai
      });
      combined.push(brandGroup);
    }

    // Lot group ko uski apni discount maps se attach karo
    if (lotSaleGroup) {
      lotSaleGroup.variants.forEach((variant) => {
        variant.volumeTiers = lotVolumeDiscounts[variant.skuId] || [];
        variant.firoOffers = lotFiroOffers[variant.skuId] || [];
        variant.introOffer = introOffers[variant.skuId] || null; // 👈 ADD KIYA — sirf Lot ke liye
      });
      combined.push(lotSaleGroup);
    }

    return combined;
  } catch (error) {
    console.error("Failed to fetch SKU lines:", error);
    return skuLines;
  }
}