// app/api/order/route.js
// Forwards orders to Google Apps Script Web App.
// Apps Script may return a 302 redirect — fetch follows it automatically.

import { NextResponse } from "next/server";
import { IMS_BRAND_API_URL, IMS_LOT_API_URL } from "@/data/skus";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzaJ32zgutjosdLzqWjkYg9Qaa5sRZf-Fuo6g-G7Ie9xKPhe_UQQVxvwjqIdHUCMnemUA/exec";

const IMS_API_URLS = {
  brand: IMS_BRAND_API_URL,
  lot: IMS_LOT_API_URL,
};

// Ek IMS (Brand/Lot) ke exec URL par ek OUT deduct call bhejta hai.
// Best-effort hai — IMS abhi deploy nahi hui ho (URL khaali) ya request fail
// ho jaye, to bhi order response fail nahi hona chahiye, kyunki order already
// Orders sheet mein likha ja chuka hai.
async function deductOne(imsSystem, skuId, quantity, reference,retailerId, label) {
  const apiUrl = IMS_API_URLS[imsSystem];
  if (!apiUrl) {
    console.warn(`IMS deduct skipped for ${skuId}: no URL configured for imsSystem="${imsSystem}"`);
    return;
  }

  const requestBody = {
    action: "deductStock",
    data: { skuId, quantity, reference, retailerId, addedBy: "System" },
  };

  console.log(`IMS deduct request${label ? ` (${label})` : ""} (${imsSystem}):`, JSON.stringify(requestBody));

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();
    console.log(`IMS deduct response (${imsSystem}, status ${res.status}) for ${skuId}:`, text);
  } catch (error) {
    console.error(`IMS (${imsSystem}) stock deduction failed for ${skuId}:`, error);
  }
}

// Order Sheet mein likhne ke baad, har line item ke liye uski IMS (Brand/Lot)
// mein OUT stock deduct karta hai. Agar item ne Introductory Offer qualify
// kiya hai to uske saath jo gift (hamesha Brand IMS ka SKU) di ja rahi hai,
// uska stock bhi alag se deduct karta hai — gift order payload mein ek
// separate line item nahi hota, isliye ye yahan handle karna padta hai.
async function deductImsStock(orderData) {
  await Promise.all(
    orderData.map(async (item) => {
      await deductOne(item.imsSystem, item.skuCode, item.quantity, item.orderId,item.retailerId);

      if (item.giftSkuId && item.giftQty) {
        await deductOne("brand", item.giftSkuId, item.giftQty, item.orderId, item.retailerId, "gift");
      }
    })
  );
}

// Apps Script can be slow on cold start — give it room.
export const maxDuration = 30; // seconds (Vercel)

export async function POST(req) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s

  try {
    const body = await req.json();
    console.log("Order batch received:", Array.isArray(body) ? body.length : 1);

    // Normalize to array for batch sending
    const orderData = Array.isArray(body) ? body : [body];

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetName: "Orders", data: orderData }),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const text = await response.text();

    if (!response.ok) {
      console.error("Apps Script HTTP error:", response.status, text);
      return NextResponse.json(
        {
          success: false,
          message: `Apps Script responded with status ${response.status}`,
          raw: text,
        },
        { status: 502 }
      );
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        success: false,
        message: "Invalid (non-JSON) response from Apps Script",
        raw: text,
      };
    }

    if (result.success !== false) {
      // Order Orders sheet mein safalta se likha gaya — ab IMS stock deduct karo.
      // Best-effort: iska result order response ko affect nahi karta.
      deductImsStock(orderData);
    }

    return NextResponse.json(result);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Order API Error:", error);

    const isAbort = error?.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: isAbort
          ? "Request to Apps Script timed out"
          : error.message || "Request failed",
      },
      { status: isAbort ? 504 : 500 }
    );
  }
}
