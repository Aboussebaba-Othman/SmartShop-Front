export function round2(value){
  const n = Number(value) || 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatMoney(value){
  return round2(value).toFixed(2);
}
