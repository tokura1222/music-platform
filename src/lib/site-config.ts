/**
 * Site-wide settings that must be filled in by the operator.
 * Anything left as PENDING renders as a visible "要記入" marker so it cannot
 * be shipped by accident.
 */
export const PENDING = '【要記入】';

export const SITE_URL = 'https://www.zion-online.com';

/** Waitlist form (e.g. a Notion/Google form). Set NEXT_PUBLIC_DAW_WAITLIST_URL in Vercel. */
export const DAW_WAITLIST_URL = process.env.NEXT_PUBLIC_DAW_WAITLIST_URL ?? '';

/** Seller information for the 特定商取引法に基づく表記. Fill in before enabling payments. */
export const SELLER = {
  name: PENDING, // 販売事業者(個人事業主の場合は氏名/屋号)
  representative: PENDING, // 運営統括責任者
  address: PENDING, // 所在地(請求があれば遅滞なく開示、とする場合はその旨を記載)
  phone: PENDING, // 電話番号(同上)
  email: PENDING, // 問い合わせ先メール
  invoiceNo: PENDING, // 適格請求書発行事業者の登録番号(未登録なら「未登録」)
} as const;

/**
 * Stripe Payment Link for the paid Zion 切り抜き plan.
 * Create it in the Stripe Dashboard, then set NEXT_PUBLIC_ZION_CHECKOUT_URL in Vercel.
 * While unset, the page shows "販売準備中" instead of a buy button.
 */
export const ZION_CHECKOUT_URL = process.env.NEXT_PUBLIC_ZION_CHECKOUT_URL ?? '';

/** Shown on the post-purchase page. Fill in your real turnaround. */
export const ZION_DELIVERY_NOTE = PENDING; // 例: 「動画受領後、3営業日以内にお届けします」
