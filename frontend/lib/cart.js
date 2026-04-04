const CART_KEY = 'marketplace-cart';

export function loadCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}
