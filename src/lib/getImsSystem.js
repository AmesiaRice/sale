// lib/getImsSystem.js
// Cart flatten hone ke baad variant ka parent group (brand/lot) pata nahi
// chalta, lekin series/productType survive karta hai — isi se decide karte
// hain ki order-time IMS deduct call kaunsi IMS (Brand ya Lot) ko jaayegi.

export function getImsSystem(item) {
  const series = item?.productType || item?.series || "";
  return String(series).toUpperCase().startsWith("LS") ? "lot" : "brand";
}
