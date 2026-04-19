import "server-only";
import Stripe from "stripe";

let _client: Stripe | null = null;
export function stripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _client = new Stripe(key);
  return _client;
}

const PRICE_CENTS_BY_DURATION: Record<30 | 45 | 60, number> = {
  30: Number(process.env.STRIPE_PRICE_30 ?? 4000),
  45: Number(process.env.STRIPE_PRICE_45 ?? 5000),
  60: Number(process.env.STRIPE_PRICE_60 ?? 6000),
};

export function priceCentsFor(duration: 30 | 45 | 60): number {
  return PRICE_CENTS_BY_DURATION[duration];
}
