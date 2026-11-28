import type { Locale } from "@/lib/i18n";

const formatters: Record<Locale, Intl.NumberFormat> = {
  // Western digits in both languages: clearer for prices and matches how Egyptian shops print them.
  ar: new Intl.NumberFormat("ar-EG-u-nu-latn", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 2 }),
  en: new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 2 }),
};

/** Formats an amount in Egyptian pounds, e.g. "EGP 1,250" / "‏1,250 ج.م.‏". */
export function formatPrice(amount: number, locale: Locale): string {
  return formatters[locale].format(amount);
}
