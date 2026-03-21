type Threshold = {
  /** good threshold value (good <> needs improvement) */
  good: number;
  /** needs improvement threshold value (needs improvement <> poor) */
  needs_improvement: number;
};

export const thresholds: Record<string, Threshold> = {
  largest_contentful_paint: {
    good: 2500,
    needs_improvement: 4000,
  },
  interaction_to_next_paint: {
    good: 200,
    needs_improvement: 500,
  },
  cumulative_layout_shift: {
    good: 0.1,
    needs_improvement: 0.25,
  },
};

export function getStatus(value: number, threshold: Threshold) {
  if (value <= threshold.good) {
    return "good";
  } else if (value <= threshold.needs_improvement) {
    return "needs improvement";
  } else {
    return "poor";
  }
}
