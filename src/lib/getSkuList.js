// lib/getSkuList.js
// Returns only variant.name values from your API response.

export async function getSkuList() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbxwSphV62nmj7V9ZlFXulQU4zIuwQjF3CD6FZfpYssJrykdWFJqKF5HKRSBRPuJwloQ/exec";

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    // If API returns array directly or inside data property
    const rows = Array.isArray(data) ? data : data.data || [];

    // Extract all variant.name values
    const skuList = rows.flatMap((item) =>
      (item.variants || []).map((variant) => variant.name)
    );

    // Remove empty values, duplicates, and sort
    return [...new Set(skuList.filter(Boolean))].sort();
  } catch (error) {
    console.error("Failed to fetch SKU list:", error);
    return [];
  }
}