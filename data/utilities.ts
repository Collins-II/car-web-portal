import { ScaleType } from "@/lib/database/models/scales_product";

export const SCALE_TYPE_OPTIONS: ScaleType[] = [
  "Price Computing Scale",
  "Counter Scale",
  "Platform Scale",
  "Hanging Scale",
  "Label Printing Scale",
  "POS Integrated Scale",
  "Jewelry Scale",
  "Pocket Scale",
  "Postal Scale",
  "Luggage Scale",
  "Analytical Balance",
  "Precision Balance",
  "Micro Balance",
  "Moisture Analyzer",
  "Calibration Balance",
  "Floor Scale",
  "Pallet Scale",
  "Crane Scale",
  "Forklift Scale",
  "Hopper Scale",
  "Checkweigher",
  "Weighbridge",
  "Axle Scale",
  "Portable Vehicle Scale",
  "Patient Scale",
  "Wheelchair Scale",
  "Baby Scale",
  "BMI Scale",
  "Livestock Scale",
  "Grain Scale",
  "Produce Scale",
  "Milk Weighing Scale"
];

export type ScaleCategory =
  | "Retail"
  | "Laboratory"
  | "Industrial"
  | "Medical"
  | "Agricultural";

export const SCALE_TYPE_BY_CATEGORY: Record<
  ScaleCategory,
  ScaleType[]
> = {
  Retail: [
    "Price Computing Scale",
    "Counter Scale",
    "Platform Scale",
    "Label Printing Scale",
    "POS Integrated Scale",
    "Pocket Scale"
  ],

  Laboratory: [
    "Analytical Balance",
    "Precision Balance",
    "Micro Balance",
    "Moisture Analyzer",
    "Calibration Balance"
  ],

  Industrial: [
    "Platform Scale",
    "Floor Scale",
    "Pallet Scale",
    "Crane Scale",
    "Forklift Scale",
    "Hopper Scale",
    "Checkweigher",
    "Weighbridge",
    "Axle Scale",
    "Portable Vehicle Scale"
  ],

  Medical: [
    "Patient Scale",
    "Wheelchair Scale",
    "Baby Scale",
    "BMI Scale"
  ],

  Agricultural: [
    "Livestock Scale",
    "Grain Scale",
    "Produce Scale",
    "Milk Weighing Scale",
    "Platform Scale"
  ]
};

const categories = ["Retail", "Laboratory", "Industrial", "Medical", "Agricultural"];

export function getCategoryFromScale(scaleName: string): string | undefined {
  return categories.find(cat => scaleName.startsWith(cat));
}