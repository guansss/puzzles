export function rand(min, max) {
    return Math.random() * (max - min) + min;
}

export function clamp(value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
