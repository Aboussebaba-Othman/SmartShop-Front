// Validation utility functions

/**
 * Validate promo code format (PROMO-XXXX)
 */
export function isValidPromoCode(code) {
    if (!code) return false;
    const pattern = /^PROMO-[A-Z0-9]{4}$/;
    return pattern.test(code);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone) {
    if (!phone) return true; // Optional field
    const pattern = /^[0-9\s\-\+\(\)]{10,}$/;
    return pattern.test(phone);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Validate stock availability
 */
export function hasEnoughStock(requested, available) {
    return requested <= available;
}

/**
 * Validate payment amount constraints
 */
export function validatePaymentAmount(amount, type, remainingAmount) {
    const num = parseFloat(amount);

    if (isNaN(num) || num <= 0) {
        return 'Le montant doit être supérieur à 0';
    }

    if (num > remainingAmount) {
        return 'Le montant dépasse le montant restant';
    }

    if (type === 'ESPÈCES' && num > 20000) {
        return 'Les paiements en espèces sont limités à 20 000 DH';
    }

    return null; // Valid
}
