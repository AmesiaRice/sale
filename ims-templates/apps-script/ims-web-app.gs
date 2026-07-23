/**
 * IMS Web App — deploy this SAME script separately for Brand IMS and Lot IMS.
 *
 * Setup (per sheet — do this twice, once for Brand, once for Lot):
 *   1. Import the matching template (IMS_Brand.xlsx or IMS_Lot.xlsx) into a new
 *      Google Sheet: File > Import > Upload > Replace spreadsheet.
 *   2. In that Sheet: Extensions > Apps Script.
 *   3. Delete any starter code, paste this entire file, Save.
 *   4. Deploy > New deployment > type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone with the link
 *   5. Copy the resulting .../exec URL.
 *   6. Paste it into src/data/skus.js as IMS_BRAND_API_URL (for the Brand
 *      deployment) or IMS_LOT_API_URL (for the Lot deployment).
 *
 * Contract:
 *   GET  <exec-url>                 -> JSON array of IMS_Stock rows
 *   POST <exec-url>  { action: "deductStock", data: { skuId, quantity, reference, addedBy } }
 *                                   -> appends one OUT row to IMS_Ledger
 */

var STOCK_SHEET_NAME = "IMS_Stock";
var LEDGER_SHEET_NAME = "IMS_Ledger";

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STOCK_SHEET_NAME);
  var rows = sheetToObjects(sheet);
  return jsonResponse(rows);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (body.action === "deductStock") {
      return handleDeductStock(body.data || {});
    }

    return jsonResponse({ success: false, message: "Unknown action: " + body.action });
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

function handleDeductStock(data) {
  if (!data.skuId || !data.quantity) {
    return jsonResponse({ success: false, message: "skuId and quantity are required" });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LEDGER_SHEET_NAME);
  var quantity = Math.abs(Number(data.quantity)) || 0;

  // Quantity column stays POSITIVE (matches manual-entry convention), but
  // Signed Qty is computed HERE rather than left for a sheet formula —
  // appendRow() does not auto-propagate a per-row formula into new rows
  // (that only happens when typing into the Sheets UI), so leaving this
  // blank would silently break any Current Stock formula that sums it.
  sheet.appendRow([
    new Date(),
    data.skuId,
    "OUT",
    quantity,
    -quantity, // Signed Qty — OUT is always negative
    data.reference || "",
    data.addedBy || "System",
  ]);

  return jsonResponse({ success: true });
}

/**
 * Sheet rows -> array of {header: value} objects, same convention every
 * other Apps Script endpoint in this project already uses.
 */
function sheetToObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row.every(function (cell) { return cell === "" || cell === null; })) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    rows.push(obj);
  }

  return rows;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
