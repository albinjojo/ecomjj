export function isVariantOnOffer(variant) {
  if (!variant.offerEnabled || variant.offerPrice == null) return false;

  const now = new Date();
  const start = variant.offerStartDate ? new Date(variant.offerStartDate) : null;
  const end = variant.offerEndDate ? new Date(variant.offerEndDate) : null;

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
}

export function getEffectivePrice(variant) {
  return isVariantOnOffer(variant) ? Number(variant.offerPrice) : Number(variant.price);
}

export function getDiscountPercent(variant) {
  if (!isVariantOnOffer(variant)) return 0;
  const price = Number(variant.price);
  const offerPrice = Number(variant.offerPrice);
  if (!price) return 0;
  return Math.round(((price - offerPrice) / price) * 100);
}

export function getCheapestVariant(variants) {
  if (!variants || variants.length === 0) return null;
  return variants.reduce((cheapest, variant) =>
    getEffectivePrice(variant) < getEffectivePrice(cheapest) ? variant : cheapest
  );
}
