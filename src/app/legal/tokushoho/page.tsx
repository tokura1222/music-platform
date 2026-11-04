import type { Metadata } from 'next';
import { LegalLayout } from '@/components/site/legal-layout';
import { SELLER } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
  alternates: { canonical: '/legal/tokushoho' },
};

const rows: [string, React.ReactNode][] = [
  ['販売事業者', SELLER.name],
  ['運営統括責任者', SELLER.representative],
  ['所在地', SELLER.address],
  ['電話番号', SELLER.phone],
  ['メールアドレス', SELLER.email],
  ['適格請求書発行事業者登録番号', SELLER.invoiceNo],
  ['販売価格', '各サービス・商品の購入ページに表示します(表示価格は税込)。'],
  ['商品代金以外の必要料金', 'インターネット接続料金、通信料金等はお客様のご負担となります。'],
  ['お支払い方法', 'クレジットカード等(決済代行: Stripe)。利用可能な方法は購入ページに表示します。'],
  ['お支払い時期', '購入手続き時に決済されます。サブスクリプションの場合は、契約更新日ごとに課金されます。'],
  ['商品の引き渡し時期', 'デジタル商品は決済完了後、ただちにダウンロードまたは利用可能になります。納品を伴うサービスは、各ページに記載の日数で納品します。'],
  ['返品・キャンセル', 'デジタル商品の性質上、購入後の返品・返金はお受けできません。ただし、商品に重大な不具合があり当方で解消できない場合は、この限りではありません。サブスクリプションは次回更新日前までに解約でき、解約後は次回以降の課金は発生しません。'],
  ['動作環境', '各アプリのページに記載します。'],
];

export default function TokushohoPage() {
  return (
    <LegalLayout title="特定商取引法に基づく表記" updated="2026-11-02(ドラフト)">
      <p className="rounded border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        ※ 現在は雛形です。「【要記入】」の項目を、公開・販売開始前に実際の情報へ置き換えてください(src/lib/site-config.ts)。内容は法律の専門家の確認を推奨します。
      </p>
      <dl className="divide-y divide-border border-y border-border">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-4 md:grid-cols-[14rem_1fr] md:gap-6">
            <dt className="font-semibold">{k}</dt>
            <dd className="text-muted-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </LegalLayout>
  );
}
