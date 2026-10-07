export function formatHeight(inches) {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;

    return `${feet}' ${remainingInches}"`;
}

export function formatRate(value) {
    return Number(value).toFixed(1);
}

export function formatPercentage(value) {
    return `${(value * 100).toFixed(0)}%`;
}