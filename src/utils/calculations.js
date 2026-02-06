// Utility functions for order calculations

/**
 * Calculate loyalty discount percentage based on client level
 */
export function getLoyaltyDiscount(loyaltyLevel) {
    const discounts = {
        BRONZE: 0.05,   // 5%
        SILVER: 0.10,   // 10%
        GOLD: 0.15,     // 15%
        PLATINUM: 0.20, // 20%
    };
    return discounts[loyaltyLevel] || 0;
}

/**
 * Calculate subtotal HT (before any discounts)
 */
export function calculateSubtotalHT(items) {
    return items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
}

/**
 * Calculate loyalty discount amount
 */
export function calculateLoyaltyDiscountAmount(subtotalHT, loyaltyLevel) {
    const discountPercent = getLoyaltyDiscount(loyaltyLevel);
    return subtotalHT * discountPercent;
}

/**
 * Calculate promo discount amount
 */
export function calculatePromoDiscountAmount(subtotalHT, promoPercent) {
    return subtotalHT * (promoPercent / 100);
}

/**
 * Calculate HT after discounts
 */
export function calculateHTAfterDiscounts(subtotalHT, loyaltyDiscount, promoDiscount) {
    return subtotalHT - loyaltyDiscount - promoDiscount;
}

/**
 * Calculate TVA (20%)
 */
export function calculateTVA(htAmount) {
    return htAmount * 0.20;
}

/**
 * Calculate total TTC
 */
export function calculateTotalTTC(htAmount, tva) {
    return htAmount + tva;
}

/**
 * Calculate complete order totals
 */
export function calculateOrderTotals(items, loyaltyLevel, promoPercent = 0) {
    const subtotalHT = calculateSubtotalHT(items);
    const loyaltyDiscount = calculateLoyaltyDiscountAmount(subtotalHT, loyaltyLevel);
    const promoDiscount = calculatePromoDiscountAmount(subtotalHT, promoPercent);
    const htAfterDiscounts = calculateHTAfterDiscounts(subtotalHT, loyaltyDiscount, promoDiscount);
    const tva = calculateTVA(htAfterDiscounts);
    const totalTTC = calculateTotalTTC(htAfterDiscounts, tva);

    return {
        subtotalHT: Math.round(subtotalHT * 100) / 100,
        loyaltyDiscount: Math.round(loyaltyDiscount * 100) / 100,
        promoDiscount: Math.round(promoDiscount * 100) / 100,
        htAfterDiscounts: Math.round(htAfterDiscounts * 100) / 100,
        tva: Math.round(tva * 100) / 100,
        totalTTC: Math.round(totalTTC * 100) / 100,
    };
}
