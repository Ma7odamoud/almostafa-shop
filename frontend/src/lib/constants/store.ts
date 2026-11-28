// Store contact settings — single source of truth for the visit / contact sections.
export const STORE_SETTINGS = {
  ADDRESS_AR: "وسط البلد، القاهرة، مصر",
  ADDRESS_EN: "Downtown Cairo, Egypt",
  HOURS_AR: "السبت – الخميس: 10:00 ص – 10:00 م",
  HOURS_EN: "Sat – Thu: 10:00 AM – 10:00 PM",
  EMAIL: "contactalmostafainfo@gmail.com",
  PHONE: "",
  MAP_LINK: "",
};

export function hasRealValue(val?: string): boolean {
  if (!val) return false;
  return val.trim().length > 0 && !val.includes("[to be provided]") && !val.includes("to be provided");
}
