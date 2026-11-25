// ============================================================
// Demo Data — FABRICS
// OWNER: Replace this file with real products.
// All prices, stock, descriptions, and photos are placeholder demo values.
// ============================================================

export interface FabricPhoto {
  src: string;    // path relative to /public
  alt: string;
}

export interface Fabric {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  pricePerMeter: number;       // DEMO price — owner must set real prices
  stockMeters: number;         // DEMO stock — owner must set real stock
  color: string;               // e.g. "navy", "charcoal", "cream"
  colorLabel: { ar: string; en: string };
  material: string;            // e.g. "wool", "cotton"
  materialLabel: { ar: string; en: string };
  pattern: string;             // "plain" | "checks" | "stripes" | "other"
  patternLabel: { ar: string; en: string };
  category: string;            // "jacket" | "trousers" | "suit" | "coat"
  categoryLabel: { ar: string; en: string };
  photos: FabricPhoto[];       // first photo = card image; second = hover mannequin image
  hidden: boolean;
}

// ⚠️  DEMO MODE — all data below is placeholder.
// Photos below use placeholder URLs; replace with real uploaded photos.
const PLACEHOLDER_DRAPED = "/demo/fabric-draped-placeholder.svg";
const PLACEHOLDER_MANNEQUIN = "/demo/fabric-mannequin-placeholder.svg";

export const demoFabrics: Fabric[] = [
  {
    id: "fab-001",
    nameAr: "صوف ميرينو كحلي",
    nameEn: "Navy Merino Wool",
    descriptionAr: "⚠️ نموذج تجريبي — يرجى إضافة الوصف الحقيقي. قماش صوفي ناعم بلون كحلي غامق، مثالي للبدلات الرسمية.",
    descriptionEn: "⚠️ DEMO — replace with real description. A fine navy merino wool, ideal for formal suits.",
    pricePerMeter: 0,   // ⚠️ DEMO — price not set
    stockMeters: 0,     // ⚠️ DEMO — stock not set
    color: "navy",
    colorLabel: { ar: "كحلي", en: "Navy" },
    material: "wool",
    materialLabel: { ar: "صوف", en: "Wool" },
    pattern: "plain",
    patternLabel: { ar: "سادة", en: "Plain" },
    category: "suit",
    categoryLabel: { ar: "بدلة", en: "Suit" },
    photos: [
      { src: PLACEHOLDER_DRAPED, alt: "Navy merino wool draped" },
      { src: PLACEHOLDER_MANNEQUIN, alt: "Navy merino wool on mannequin" },
    ],
    hidden: false,
  },
  {
    id: "fab-002",
    nameAr: "تويد رمادي للجاكيت",
    nameEn: "Grey Tweed Jacket Fabric",
    descriptionAr: "⚠️ نموذج تجريبي — يرجى إضافة الوصف الحقيقي. تويد رمادي كلاسيكي لجاكيت ريفي أنيق.",
    descriptionEn: "⚠️ DEMO — replace with real description. Classic grey tweed for a refined country jacket.",
    pricePerMeter: 0,
    stockMeters: 0,
    color: "grey",
    colorLabel: { ar: "رمادي", en: "Grey" },
    material: "wool",
    materialLabel: { ar: "صوف", en: "Wool" },
    pattern: "other",
    patternLabel: { ar: "أنماط أخرى", en: "Other Patterns" },
    category: "jacket",
    categoryLabel: { ar: "جاكيت", en: "Jacket" },
    photos: [
      { src: PLACEHOLDER_DRAPED, alt: "Grey tweed draped" },
      { src: PLACEHOLDER_MANNEQUIN, alt: "Grey tweed on mannequin" },
    ],
    hidden: false,
  },
  {
    id: "fab-003",
    nameAr: "كتان بيج للبنطلون",
    nameEn: "Beige Linen Trouser Fabric",
    descriptionAr: "⚠️ نموذج تجريبي — يرجى إضافة الوصف الحقيقي. كتان خفيف بيج للبناطيل الصيفية.",
    descriptionEn: "⚠️ DEMO — replace with real description. Light beige linen, ideal for summer trousers.",
    pricePerMeter: 0,
    stockMeters: 0,
    color: "beige",
    colorLabel: { ar: "بيج", en: "Beige" },
    material: "linen",
    materialLabel: { ar: "كتان", en: "Linen" },
    pattern: "plain",
    patternLabel: { ar: "سادة", en: "Plain" },
    category: "trousers",
    categoryLabel: { ar: "بنطلون", en: "Trousers" },
    photos: [
      { src: PLACEHOLDER_DRAPED, alt: "Beige linen draped" },
      { src: PLACEHOLDER_MANNEQUIN, alt: "Beige linen on mannequin" },
    ],
    hidden: false,
  },
  {
    id: "fab-004",
    nameAr: "صوف كاشمير للمعطف",
    nameEn: "Cashmere Coat Wool",
    descriptionAr: "⚠️ نموذج تجريبي — يرجى إضافة الوصف الحقيقي. كاشمير فاخر لمعطف شتوي دافئ.",
    descriptionEn: "⚠️ DEMO — replace with real description. Luxurious cashmere for a warm winter overcoat.",
    pricePerMeter: 0,
    stockMeters: 0,
    color: "camel",
    colorLabel: { ar: "كامل", en: "Camel" },
    material: "cashmere",
    materialLabel: { ar: "كاشمير", en: "Cashmere" },
    pattern: "plain",
    patternLabel: { ar: "سادة", en: "Plain" },
    category: "coat",
    categoryLabel: { ar: "معطف", en: "Coat" },
    photos: [
      { src: PLACEHOLDER_DRAPED, alt: "Camel cashmere draped" },
      { src: PLACEHOLDER_MANNEQUIN, alt: "Camel cashmere on mannequin" },
    ],
    hidden: false,
  },
  {
    id: "fab-005",
    nameAr: "كتان مخطط للبدلة",
    nameEn: "Striped Linen Suit Fabric",
    descriptionAr: "⚠️ نموذج تجريبي — يرجى إضافة الوصف الحقيقي. قماش كتاني بخطوط رفيعة للبدل الصيفية.",
    descriptionEn: "⚠️ DEMO — replace with real description. Fine striped linen for summer suits.",
    pricePerMeter: 0,
    stockMeters: 0,
    color: "white",
    colorLabel: { ar: "أبيض", en: "White" },
    material: "linen",
    materialLabel: { ar: "كتان", en: "Linen" },
    pattern: "stripes",
    patternLabel: { ar: "خطوط", en: "Stripes" },
    category: "suit",
    categoryLabel: { ar: "بدلة", en: "Suit" },
    photos: [
      { src: PLACEHOLDER_DRAPED, alt: "Striped linen draped" },
      { src: PLACEHOLDER_MANNEQUIN, alt: "Striped linen on mannequin" },
    ],
    hidden: false,
  },
  {
    id: "fab-006",
    nameAr: "صوف مربعات للجاكيت",
    nameEn: "Checked Wool Jacket Fabric",
    descriptionAr: "⚠️ نموذج تجريبي — يرجى إضافة الوصف الحقيقي. صوف بنقوش مربعات للجاكيت الكلاسيكي.",
    descriptionEn: "⚠️ DEMO — replace with real description. Classic checked wool for a traditional jacket.",
    pricePerMeter: 0,
    stockMeters: 0,
    color: "brown",
    colorLabel: { ar: "بني", en: "Brown" },
    material: "wool",
    materialLabel: { ar: "صوف", en: "Wool" },
    pattern: "checks",
    patternLabel: { ar: "مربعات", en: "Checks" },
    category: "jacket",
    categoryLabel: { ar: "جاكيت", en: "Jacket" },
    photos: [
      { src: PLACEHOLDER_DRAPED, alt: "Checked wool draped" },
      { src: PLACEHOLDER_MANNEQUIN, alt: "Checked wool on mannequin" },
    ],
    hidden: false,
  },
];

// ============================================================
// SIZE GUIDE DATA — DEMO VALUES
// OWNER: Replace the meter amounts below with your real measurements.
// All values in meters. Sizes are approximate — advise customers to
// check with their tailor.
// ============================================================

export const sizeGuide = {
  note: {
    ar: "⚠️ القيم أدناه تقريبية ونموذجية. يرجى التحقق من الكمية مع خياطك قبل الشراء.",
    en: "⚠️ The values below are approximate demo values. Please check the required meterage with your tailor before purchasing.",
  },
  categories: [
    {
      key: "suit",
      labelAr: "بدلة",
      labelEn: "Suit",
      sizes: [
        { size: "XS / 44", meters: 0 },   // ⚠️ DEMO — owner to set
        { size: "S / 46",  meters: 0 },
        { size: "M / 48",  meters: 0 },
        { size: "L / 50",  meters: 0 },
        { size: "XL / 52", meters: 0 },
        { size: "XXL / 54",meters: 0 },
      ],
    },
    {
      key: "jacket",
      labelAr: "جاكيت رياضي",
      labelEn: "Sports Jacket",
      sizes: [
        { size: "XS / 44", meters: 0 },
        { size: "S / 46",  meters: 0 },
        { size: "M / 48",  meters: 0 },
        { size: "L / 50",  meters: 0 },
        { size: "XL / 52", meters: 0 },
        { size: "XXL / 54",meters: 0 },
      ],
    },
    {
      key: "coat",
      labelAr: "معطف ومعطف خارجي",
      labelEn: "Overcoats & Coats",
      sizes: [
        { size: "XS / 44", meters: 0 },
        { size: "S / 46",  meters: 0 },
        { size: "M / 48",  meters: 0 },
        { size: "L / 50",  meters: 0 },
        { size: "XL / 52", meters: 0 },
        { size: "XXL / 54",meters: 0 },
      ],
    },
    {
      key: "trousers",
      labelAr: "بنطلون",
      labelEn: "Trousers",
      sizes: [
        { size: "XS / 44", meters: 0 },
        { size: "S / 46",  meters: 0 },
        { size: "M / 48",  meters: 0 },
        { size: "L / 50",  meters: 0 },
        { size: "XL / 52", meters: 0 },
        { size: "XXL / 54",meters: 0 },
      ],
    },
  ],
};
