// Single source of truth for the branch secretariat contact details.
export const BRANCH_CONTACT = {
  name: "Chief Charles Obegolu Bar Centre",
  addressLines: [
    "Chief Charles Obegolu Bar Centre",
    "Obeledu, Anaocha LGA",
    "Anambra State, Nigeria",
  ],
  phones: ["08134012458", "07033482194"],
  email: "secretariat@nbaanaocha.org.ng",
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

// Practice-fee (BPF) tiers — 2026 NBA national rates. SANs and Honourable
// Benchers pay the top rate regardless of years of call.
export const BPF_TIERS = {
  amount_0_4:     5000,
  amount_5_9:     10000,
  amount_10_14:   17500,
  amount_15_plus: 25000,
  amount_san:     50000,
};

// Member seniority ranks. SAN / Bencher is admin-set and overrides the
// year-of-call tier for tiered dues.
export const RANK_LABELS: Record<string, string> = {
  regular: "Regular",
  san:     "Senior Advocate (SAN)",
  bencher: "Honourable Bencher",
};

export function getYearsOfCall(yearOfCall: string | null | undefined): number {
  if (!yearOfCall) return 0;
  const parsed = parseInt(yearOfCall);
  if (isNaN(parsed)) return 0;
  return Math.max(0, new Date().getFullYear() - parsed);
}

export function getDueAmount(
  item: { is_tiered: boolean; amount_0_4: number | null; amount_5_9: number | null; amount_10_14: number | null; amount_15_plus: number | null; amount_san: number | null; flat_amount: number | null },
  yearOfCall: string | null | undefined,
  rank?: string | null
): number {
  if (!item.is_tiered) return Number(item.flat_amount ?? 0);
  // SANs and Honourable Benchers pay the top tier when one is set on the item.
  if ((rank === "san" || rank === "bencher") && item.amount_san != null) {
    return Number(item.amount_san);
  }
  const years = getYearsOfCall(yearOfCall);
  if (years < 5)  return Number(item.amount_0_4     ?? 0);
  if (years < 10) return Number(item.amount_5_9     ?? 0);
  if (years < 15) return Number(item.amount_10_14   ?? 0);
  return Number(item.amount_15_plus ?? 0);
}

export const SERVICE_LABELS: Record<string, string> = {
  nba_diary:                 "NBA Diary",
  nba_id_card:               "NBA ID Card",
  nba_vehicle_plate:         "NBA Vehicle Customized Plate Number",
};

export const SERVICE_FEES: Record<string, number> = {
  nba_diary:                 6000,
  nba_id_card:               5000,
  nba_vehicle_plate:         230000,
};
