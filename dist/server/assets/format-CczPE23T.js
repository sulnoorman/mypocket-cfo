function formatMoney(amount, currency) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const locale = currency === "IDR" ? "id-ID" : "en-US";
  const maximumFractionDigits = currency === "IDR" ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits
  }).format(safeAmount);
}
function formatDateFromUnix(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1e3);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  });
}
export {
  formatDateFromUnix as a,
  formatMoney as f
};
