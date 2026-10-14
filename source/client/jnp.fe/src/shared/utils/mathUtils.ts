/**
 * Calculates percentages that sum up exactly to 100 using the Largest Remainder Method.
 * @param values Array of numbers representing the raw data
 * @returns Array of integers summing to 100
 */
export const getRoundedPercentages = (values: number[]): number[] => {
  const total = values.reduce((sum, val) => sum + val, 0);
  if (total === 0) return values.map(() => 0);

  // 1. Calculate raw percentages
  const percentages = values.map((v) => (v / total) * 100);

  // 2. Separate into floor values and remainders
  const floorValues = percentages.map((p) => Math.floor(p));
  const floorSum = floorValues.reduce((sum, val) => sum + val, 0);
  
  // 3. Calculate difference from 100
  let diff = 100 - floorSum;

  const remainders = percentages.map((p, i) => ({
    index: i,
    remainder: p - floorValues[i],
  }));

  // 4. Sort by remainder descending
  remainders.sort((a, b) => b.remainder - a.remainder);

  // 5. Distribute the difference to the ones with largest remainders
  for (let i = 0; i < diff; i++) {
    floorValues[remainders[i].index]++;
  }

  return floorValues;
};
