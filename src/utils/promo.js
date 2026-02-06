export function isValidPromoCode(code){
  if (!code || typeof code !== 'string') return false;
  return /^PROMO-\d{4}$/.test(code);
}

export function normalizePromo(code){
  return (code || '').trim().toUpperCase();
}
