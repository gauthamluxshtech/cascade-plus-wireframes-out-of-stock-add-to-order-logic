// Shared orders for the Out of Stock place-order flow.
// Out of Stock, Order History, Order Report and Order Exceptions Report all read their orders from here:
// the October 2026 sample orders below plus the orders placed from the Out of Stock page in this session.
(function initialiseOutOfStockOrders(globalScope, factory) {
  const api = factory(globalScope);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.CascadeOrders = api;
  }
})(typeof window !== "undefined" ? window : null, function createOutOfStockOrdersApi(globalScope) {
  "use strict";

  const PLACED_KEY = "cascadeOosPlacedOrders";
  const CLEARED_KEY = "cascadeOosClearedAt";
  const ACTIVE_USER_KEY = "cascade.activeUser";
  const TRIED_SUPPLIERS = ["AAH", "Alliance", "Phoenix"];
  const BLOCKED_PRICE_REASON = "blocked as price above drug tariff. call supplier.";
  // Order Placed By for orderhistory-data.js orders (orders before shift sign-in show Not Recorded).
  const PROTOTYPE_OPERATORS = ["Jane Smith", "Aisha Khan", "Tom Evans"];
  const ATTRIBUTION_START = "2026-07-01";

  function storage() {
    try {
      return globalScope ? globalScope.sessionStorage : null;
    } catch (error) {
      return null;
    }
  }

  // Wireframe: placed orders live in sessionStorage, so moving between pages keeps them
  // and refreshing a page returns to the sample data.
  try {
    const store = storage();
    if (store && globalScope.performance?.getEntriesByType("navigation")[0]?.type === "reload") {
      store.removeItem(PLACED_KEY);
      store.removeItem(CLEARED_KEY);
    }
  } catch (error) {
    // Storage is optional in the prototype.
  }

  function readJson(key, fallback) {
    try {
      const raw = storage()?.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      storage()?.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Storage unavailable: the change applies to this page view only.
    }
  }

  function outcome(supplier, pip, requestedQty, receivedQty, status, comment, price = null) {
    return { supplier, pip, requestedQty, receivedQty, status, comment, price, responseCode: "", account: "" };
  }

  // A line that came back out of stock lists each supplier tried with Rec. Qty 0; the price is not known.
  function outOfStockProduct(pip, description, requestedQty, comment = "Out Of Stock", status = "Out of stock") {
    return {
      pip,
      description,
      requestedQty,
      receivedQty: 0,
      status: "Not Fulfilled",
      fulfilledBy: "",
      outcomes: TRIED_SUPPLIERS.map((supplier) => outcome(supplier, pip, requestedQty, 0, status, comment))
    };
  }

  function fulfilledProduct(pip, description, requestedQty, supplier, price = null) {
    return {
      pip,
      description,
      requestedQty,
      receivedQty: requestedQty,
      status: "Completed",
      fulfilledBy: supplier,
      outcomes: [outcome(supplier, pip, requestedQty, requestedQty, "Successful", "OK", price)]
    };
  }

  function sampleOrder(id, dateIso, source, orderedBy, products) {
    return { id, dateIso, status: "Completed", source, orderedBy, products };
  }

  const ERYTHROMYCIN = "Erythromycin 250mg tabs (28)";

  // Sample data only, newest first. source: "oos" = placed from the Out of Stock page, "orderpad" = placed from the Order Pad.
  const SAMPLE_ORDERS = [
    sampleOrder("333420", "2026-10-23T12:20:14", "orderpad", "Jane Smith", [
      outOfStockProduct("8536583", ERYTHROMYCIN, 10),
      outOfStockProduct("1108802", ERYTHROMYCIN, 10),
      outOfStockProduct("1081546", ERYTHROMYCIN, 10),
      outOfStockProduct("7375546", ERYTHROMYCIN, 10)
    ]),
    sampleOrder("333419", "2026-10-23T10:05:47", "orderpad", "Tom Evans", [
      fulfilledProduct("3257672", "Movicol Plain SF 13.7g sachets (30)", 2, "Alliance", 7.42),
      fulfilledProduct("1043590", "Amlodipine 5mg tabs (28)", 4, "AAH", 0.89)
    ]),
    sampleOrder("333418", "2026-10-22T16:09:57", "oos", "Aisha Khan", [
      outOfStockProduct("1281807", "Betamethasone Sodium Phosphate 0.1% eye drops soln (10ml)", 2),
      outOfStockProduct("5014279", "Chlorhexidine mouthwash 0.2% (300ml)", 2),
      outOfStockProduct("4347126", "Proxor pressurised inhalation soln canister 100mcg/6mcg (120 Dose)", 3)
    ]),
    sampleOrder("333417", "2026-10-22T15:09:54", "orderpad", "Jane Smith", [
      outOfStockProduct("5022983", "Salicylic acid 26% soln (10ml)", 2),
      outOfStockProduct("822759", "NI-MAS Dioralyte sachets Blackcur (6)", 3),
      outOfStockProduct("7097520", "Clotrimazole pessary 500mg (1)", 1)
    ]),
    sampleOrder("333416", "2026-10-22T09:41:12", "orderpad", "Tom Evans", [
      outOfStockProduct("3826779", "Rabeprazole 10mg tabs (28)", 8, "Blocked as price above drug tariff. Call supplier.", "Blocked"),
      fulfilledProduct("1166340", "Lansoprazole 30mg caps (28)", 6, "Phoenix", 1.12)
    ]),
    sampleOrder("333415", "2026-10-21T14:18:28", "orderpad", "Aisha Khan", [
      outOfStockProduct("2150498", "Fybogel sachets Plain 3.5g (60)", 2),
      outOfStockProduct("3257672", "Movicol Plain SF 13.7g sachets (30)", 2)
    ]),
    sampleOrder("333414", "2026-10-21T11:21:30", "orderpad", "Jane Smith", [
      outOfStockProduct("8536583", ERYTHROMYCIN, 10),
      outOfStockProduct("1108802", ERYTHROMYCIN, 10)
    ]),
    sampleOrder("333413", "2026-10-20T13:48:32", "orderpad", "Tom Evans", [
      outOfStockProduct("4232773", "Beclu 200mcg 200 dose pressurised inhaler (1)", 1)
    ]),
    sampleOrder("333412", "2026-10-20T09:14:05", "orderpad", "Aisha Khan", [
      outOfStockProduct("1133867", "Ramipril 10mg caps (28)", 3),
      outOfStockProduct("1276070", "Ramipril 10mg caps (28)", 3),
      outOfStockProduct("4059143", "GlucoRX CarePoint Ultra pen 4mm/32g needles 100", 2),
      outOfStockProduct("8071599", "Co-dydramol 10/500 tabs (30)", 1),
      outOfStockProduct("5017504", "Co-dydramol 10/500 tabs (30)", 1)
    ])
  ];

  // Successful orders placed by other Cascade Plus pharmacies (live order history of all customers in production).
  const OTHER_PHARMACY_SUCCESSES = [
    { product: "Betamethasone Sodium Phosphate 0.1% eye drops soln (10ml)", dateIso: "2026-10-22T16:32:18", supplier: "Lexon" },
    { product: "Chlorhexidine mouthwash 0.2% (300ml)", dateIso: "2026-10-22T16:42:31", supplier: "AAH" },
    { product: "Salicylic acid 26% soln (10ml)", dateIso: "2026-10-22T16:23:42", supplier: "Alliance" },
    { product: "NI-MAS Dioralyte sachets Blackcur (6)", dateIso: "2026-10-22T16:31:10", supplier: "Phoenix" },
    { product: "Fybogel sachets Plain 3.5g (60)", dateIso: "2026-10-21T15:12:36", supplier: "B&S Distribution" },
    { product: ERYTHROMYCIN, dateIso: "2026-10-21T12:06:24", supplier: "AAH" },
    { product: "Beclu 200mcg 200 dose pressurised inhaler (1)", dateIso: "2026-10-20T14:18:14", supplier: "Lexon" },
    { product: "GlucoRX CarePoint Ultra pen 4mm/32g needles 100", dateIso: "2026-10-20T12:10:17", supplier: "Phoenix" },
    { product: "Ramipril 10mg caps (28)", dateIso: "2026-10-20T11:46:08", supplier: "Alliance" }
  ];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  // Local date and time as YYYY-MM-DDTHH:MM:SS, the format orderhistory-data.js uses.
  function toLocalIso(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function todayKey(date = new Date()) {
    return toLocalIso(date).slice(0, 10);
  }

  // DD-MM-YYYY - HH:MM:SS, as shown on the Out of Stock page.
  function formatOutOfStockDate(dateIso) {
    const [day, time] = String(dateIso).split("T");
    const [year, month, date] = day.split("-");
    return `${date}-${month}-${year} - ${time}`;
  }

  function productKey(description) {
    return String(description || "").trim().toLowerCase();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function placedOrders() {
    const list = readJson(PLACED_KEY, []);
    return Array.isArray(list) ? list.filter((order) => order && order.id && Array.isArray(order.products)) : [];
  }

  // Sample orders and orders placed in this session, newest first.
  function sharedOrders() {
    return [...placedOrders(), ...clone(SAMPLE_ORDERS)].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  }

  function baseOrderHistory() {
    return Array.isArray(globalScope?.orderHistoryData) ? globalScope.orderHistoryData : [];
  }

  // Every order shown in Order History and the Order Report, newest first.
  function allOrders(baseOrders = baseOrderHistory()) {
    baseOrders.forEach((order, index) => {
      order.orderedBy = order.dateIso < ATTRIBUTION_START
        ? "Not Recorded"
        : order.orderedBy || PROTOTYPE_OPERATORS[index % PROTOTYPE_OPERATORS.length];
    });
    return [...sharedOrders(), ...baseOrders];
  }

  function nextOrderId() {
    const ids = [...sharedOrders(), ...baseOrderHistory()].map((order) => Number(order.id) || 0);
    return String(Math.max(0, ...ids) + 1);
  }

  function activeUser() {
    try {
      return storage()?.getItem(ACTIVE_USER_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function isBlockedByPrice(product) {
    return product.outcomes.some((item) => productKey(item.comment) === BLOCKED_PRICE_REASON);
  }

  // Latest successful order of the same product by any pharmacy and any supplier,
  // later than the out of stock order and not later than now.
  function lastSuccessfulOrder(description, afterIso, now = new Date()) {
    const key = productKey(description);
    const nowIso = toLocalIso(now);
    const ownSuccesses = [...sharedOrders(), ...baseOrderHistory()].flatMap((order) => order.products
      .filter((product) => productKey(product.description) === key)
      .flatMap((product) => product.outcomes
        .filter((item) => Number(item.receivedQty) > 0)
        .map((item) => ({ dateIso: order.dateIso, supplier: item.supplier }))));
    const otherSuccesses = OTHER_PHARMACY_SUCCESSES.filter((item) => productKey(item.product) === key);
    const latest = [...ownSuccesses, ...otherSuccesses]
      .filter((item) => item.dateIso > afterIso && item.dateIso <= nowIso)
      .sort((a, b) => b.dateIso.localeCompare(a.dateIso))[0];
    return latest ? { dateIso: latest.dateIso, supplier: latest.supplier } : null;
  }

  // One entry per product, taken from the latest order that included it. The product is not shown when
  // that order got it, when it was blocked as price above drug tariff, or when the order was cleared.
  function outOfStockEntries(now = new Date()) {
    const clearedAt = readJson(CLEARED_KEY, "");
    const latestByProduct = new Map();
    sharedOrders().forEach((order) => {
      order.products.forEach((product) => {
        const key = productKey(product.description);
        const latest = latestByProduct.get(key);
        if (!latest) latestByProduct.set(key, { order, products: [product] });
        else if (latest.order === order) latest.products.push(product);
      });
    });

    return Array.from(latestByProduct.entries())
      .filter(([, { order, products }]) => !(clearedAt && order.dateIso <= clearedAt)
        && products.every((product) => Number(product.receivedQty) === 0)
        && !products.some(isBlockedByPrice))
      .map(([key, { order, products }]) => ({
        entryId: `${order.id}::${key}`,
        orderId: order.id,
        dateIso: order.dateIso,
        product: products[0].description,
        pip: products[0].pip,
        requested: Number(products[0].requestedQty) || 0,
        lastSuccessfulOrder: lastSuccessfulOrder(products[0].description, order.dateIso, now)
      }));
  }

  function knownPrice(pip) {
    const prices = [...sharedOrders(), ...baseOrderHistory()].flatMap((order) => order.products
      .flatMap((product) => product.outcomes)
      .filter((item) => item.pip === pip && Number(item.receivedQty) > 0 && typeof item.price === "number"));
    return prices.length ? prices[0].price : null;
  }

  // Places the lines as one new order. Wireframe outcome: a line is fulfilled when it has a Last Successful Order,
  // or when the product already came back out of stock from an order placed in this session; otherwise it
  // comes back out of stock. The order status is Completed in both cases.
  function placeOrder(lines, { source = "oos", orderedBy = activeUser(), now = new Date() } = {}) {
    const placed = placedOrders();
    const retried = new Set(placed.flatMap((order) => order.products
      .filter((product) => Number(product.receivedQty) === 0)
      .map((product) => productKey(product.description))));
    const order = {
      id: nextOrderId(),
      dateIso: toLocalIso(now),
      status: "Completed",
      source,
      orderedBy: orderedBy || "Not Recorded",
      products: lines.map((line) => {
        const quantity = Number(line.requested);
        const fulfilled = Boolean(line.lastSuccessfulOrder) || retried.has(productKey(line.product));
        return fulfilled
          ? fulfilledProduct(line.pip, line.product, quantity, line.lastSuccessfulOrder?.supplier || TRIED_SUPPLIERS[0], knownPrice(line.pip))
          : outOfStockProduct(line.pip, line.product, quantity);
      })
    };
    writeJson(PLACED_KEY, [order, ...placed]);
    return order;
  }

  // Clear All empties the Out of Stock page; the cleared orders stay in Order History and both reports.
  function clearOutOfStock(now = new Date()) {
    writeJson(CLEARED_KEY, toLocalIso(now));
  }

  // Order Exceptions Report lines for the shared orders: one per supplier response of every line not fulfilled.
  function exceptionLines() {
    return sharedOrders().flatMap((order) => order.products
      .filter((product) => Number(product.receivedQty) === 0)
      .flatMap((product) => product.outcomes.map((item) => ({
        orderId: order.id,
        date: order.dateIso,
        product: product.description,
        supplierName: item.supplier,
        recQty: Number(item.receivedQty) || 0,
        reqQty: Number(product.requestedQty) || 0,
        category: "Generic",
        supplierComment: item.comment
      }))));
  }

  return {
    activeUser,
    allOrders,
    clearOutOfStock,
    exceptionLines,
    formatOutOfStockDate,
    nextOrderId,
    outOfStockEntries,
    placeOrder,
    todayKey,
    toLocalIso
  };
});
