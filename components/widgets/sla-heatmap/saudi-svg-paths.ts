// Simplified SVG paths for Saudi Arabia's 13 administrative regions
// Used as choropleth base. svgRegionId matches Cluster.svgRegionId in the DB.
// ViewBox: 0 0 800 900 — coordinate system calibrated to KSA bounding box.

export interface SvgRegion {
  id: string
  nameEn: string
  nameAr: string
  // Approximate centroid for tooltip anchor
  cx: number
  cy: number
  d: string
}

export const SAUDI_REGIONS: SvgRegion[] = [
  {
    id: "riyadh",
    nameEn: "Riyadh",
    nameAr: "الرياض",
    cx: 450,
    cy: 480,
    d: "M340 310 L560 310 L590 430 L580 570 L420 590 L350 530 L330 420 Z",
  },
  {
    id: "makkah",
    nameEn: "Makkah",
    nameAr: "مكة المكرمة",
    cx: 185,
    cy: 490,
    d: "M100 350 L260 350 L280 420 L300 530 L250 620 L150 640 L80 580 L70 460 Z",
  },
  {
    id: "madinah",
    nameEn: "Madinah",
    nameAr: "المدينة المنورة",
    cx: 200,
    cy: 310,
    d: "M100 210 L300 210 L310 290 L280 360 L260 380 L100 380 L90 320 Z",
  },
  {
    id: "qassim",
    nameEn: "Qassim",
    nameAr: "القصيم",
    cx: 340,
    cy: 285,
    d: "M290 220 L420 220 L440 280 L430 340 L310 350 L280 300 Z",
  },
  {
    id: "eastern",
    nameEn: "Eastern Province",
    nameAr: "المنطقة الشرقية",
    cx: 590,
    cy: 360,
    d: "M560 180 L700 200 L730 350 L710 500 L680 580 L590 560 L560 430 L540 300 Z",
  },
  {
    id: "asir",
    nameEn: "Asir",
    nameAr: "عسير",
    cx: 240,
    cy: 665,
    d: "M150 610 L320 600 L340 680 L300 760 L220 790 L140 740 L130 670 Z",
  },
  {
    id: "tabuk",
    nameEn: "Tabuk",
    nameAr: "تبوك",
    cx: 155,
    cy: 175,
    d: "M80 80 L260 80 L280 180 L260 240 L100 240 L70 180 Z",
  },
  {
    id: "hail",
    nameEn: "Hail",
    nameAr: "حائل",
    cx: 330,
    cy: 200,
    d: "M270 140 L420 140 L440 210 L430 250 L270 250 L250 200 Z",
  },
  {
    id: "northern-borders",
    nameEn: "Northern Borders",
    nameAr: "الحدود الشمالية",
    cx: 380,
    cy: 100,
    d: "M270 60 L540 60 L550 120 L540 150 L270 150 L260 110 Z",
  },
  {
    id: "jazan",
    nameEn: "Jazan",
    nameAr: "جازان",
    cx: 165,
    cy: 775,
    d: "M120 740 L220 730 L230 790 L210 840 L150 850 L110 810 Z",
  },
  {
    id: "najran",
    nameEn: "Najran",
    nameAr: "نجران",
    cx: 330,
    cy: 760,
    d: "M280 700 L420 690 L440 780 L410 840 L290 850 L260 780 Z",
  },
  {
    id: "baha",
    nameEn: "Al-Baha",
    nameAr: "الباحة",
    cx: 218,
    cy: 615,
    d: "M180 590 L270 585 L280 645 L250 670 L180 665 L165 635 Z",
  },
  {
    id: "jawf",
    nameEn: "Al-Jawf",
    nameAr: "الجوف",
    cx: 290,
    cy: 110,
    d: "M200 70 L380 70 L390 140 L380 175 L200 175 L190 130 Z",
  },
]
