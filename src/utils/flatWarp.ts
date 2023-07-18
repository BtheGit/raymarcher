// A lot of help from https://fdossena.com/?p=quakeFluids/i.md

export const generateSineLookupTable = () => {
  // The level of detail (629) is predetermined to save on certain processor heavy calculations later.
  const table: number[] = [];
  for (let i = 0; i < 629; i++) {
    table.push(Math.sin(i * 0.01) * 16);
  }
  return table;
};

const sineLookupTable = generateSineLookupTable();

export const sine = (initial: number) => {
  const index = Math.floor(Math.abs(initial) % sineLookupTable.length);
  return sineLookupTable[index];
};
