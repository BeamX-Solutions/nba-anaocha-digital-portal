// Single source of truth for the branch secretariat contact details.
export const BRANCH_CONTACT = {
  name: "Chief Charles Obegolu Bar Centre",
  addressLines: [
    "Chief Charles Obegolu Bar Centre",
    "Obeledu, Anaocha LGA",
    "Anambra State, Nigeria",
  ],
  phones: ["08134012458", "07033482194"],
  website: "www.nbaanaocha.org.ng",
} as const;

// Branch committees. Used both on the landing page and as the admin dropdown
// when assigning a committee member, so the names stay in sync.
export const COMMITTEE_NAMES = [
  "Human Rights",
  "ICT & Tech",
  "Women Forum",
  "Young Lawyers",
  "Disciplinary",
  "Journal",
  "Welfare",
  "Publicity",
  "Sports",
  "Bar Centre",
] as const;

export const DUES_CATEGORY_LABELS: Record<string, string> = {
  branch_dues:    "Branch Dues",
  bpf_compliance: "Bar Practicing Fee (BPF)",
  welfare:        "Welfare Levy",
  levy:           "Special Levy",
};

// BPF tiers by years of call (2026 NBA national rates)
export const BPF_TIERS = {
  amount_0_4:     5000,
  amount_5_9:     10000,
  amount_10_14:   17500,
  amount_15_plus: 25000,
};

export function getYearsOfCall(yearOfCall: string | null | undefined): number {
  if (!yearOfCall) return 0;
  const parsed = parseInt(yearOfCall);
  if (isNaN(parsed)) return 0;
  return Math.max(0, new Date().getFullYear() - parsed);
}

export function getDueAmount(
  item: { is_tiered: boolean; amount_0_4: number | null; amount_5_9: number | null; amount_10_14: number | null; amount_15_plus: number | null; flat_amount: number | null },
  yearOfCall: string | null | undefined
): number {
  if (!item.is_tiered) return Number(item.flat_amount ?? 0);
  const years = getYearsOfCall(yearOfCall);
  if (years < 5)  return Number(item.amount_0_4     ?? 0);
  if (years < 10) return Number(item.amount_5_9     ?? 0);
  if (years < 15) return Number(item.amount_10_14   ?? 0);
  return Number(item.amount_15_plus ?? 0);
}

export const SERVICE_LABELS: Record<string, string> = {
  nba_diary:                 "NBA Diary",
  nba_id_card:               "NBA ID Card",
  apc:                       "Annual Practicing Certificate",
  letter_of_good_standing:   "Letter of Good Standing",
  stamp_seal:                "Stamp & Seal",
  title_document_front_page: "Title Document Front Page",
  nba_vehicle_plate:         "NBA Vehicle Customized Plate Number",
};

export const SERVICE_FEES: Record<string, number> = {
  nba_diary:                 5000,
  nba_id_card:               3000,
  apc:                       5000,
  letter_of_good_standing:   3000,
  stamp_seal:                10000,
  title_document_front_page: 5000,
  nba_vehicle_plate:         10000,
};
