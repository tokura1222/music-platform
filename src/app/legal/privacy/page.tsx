import type { Metadata } from 'next';
import { LegalLayout, Clause } from '@/components/site/legal-layout';
import { SELLER } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  alternates: { canonical: '/legal/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー" updated="2026-11-02(ドラフト)">
      <p className="rounded border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        ※ 雛形です。実際の運用に合わせて見直し、専門家の確認を受けてください。
      </p>
      <Clause title="1. 取得する情報">
        <p>当サイトでは、次の情報を取得することがあります。</p>
        <ul className="list-disc pl-6">
          <li>お問い合わせ・お試し・ウェイトリスト登録時にご入力いただく情報(メールアドレス、お名前、ご要望など)</li>
          <li>購入手続きに必要な情報(決済代行サービス Stripe が取得します。カード番号は当方では保持しません)</li>
          <li>アクセス情報(閲覧ページ、再生・「いいね」などの利用状況、端末・ブラウザ情報、Cookie 等)</li>
          <li>お預かりした動画・音声ファイル(切り抜き等のサービス提供のため)</li>
        </ul>
      </Clause>
      <Clause title="2. 利用目的">
        <ul className="list-disc pl-6">
          <li>サービスの提供、納品、サポート対応</li>
          <li>新機能・先行案内・重要なお知らせの連絡(ウェイトリストにご登録の方)</li>
          <li>決済、ライセンス管理、不正利用の防止</li>
          <li>サイトの利用状況の分析と改善</li>
        </ul>
      </Clause>
      <Clause title="3. 外部サービスの利用">
        <p>当サイトは、次の外部サービスを利用しています。それぞれのサービスのプライバシーポリシーに従って情報が取り扱われます。</p>
        <ul className="list-disc pl-6">
          <li>Google Analytics(アクセス解析)</li>
          <li>Stripe(決済)</li>
          <li>Vercel / Upstash(ホスティング・データ保存)</li>
          <li>Notion 等のフォーム(お問い合わせ・申込の受付)</li>
        </ul>
      </Clause>
      <Clause title="4. 第三者提供">
        <p>法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。ただし、上記の外部サービスに業務を委託する場合を除きます。</p>
      </Clause>
      <Clause title="5. お預かりしたファイルの扱い">
        <p>お預かりした動画・音声は、ご依頼のサービス提供のためにのみ使用し、納品後、合理的な期間内に削除します。事例として公開する場合は、事前にご本人の許可を得ます。</p>
      </Clause>
      <Clause title="6. 開示・訂正・削除の請求">
        <p>ご本人からの開示・訂正・削除等のご請求は、下記の窓口で受け付けます。</p>
        <p>お問い合わせ: {SELLER.email}</p>
      </Clause>
      <Clause title="7. 改定">
        <p>本ポリシーは、必要に応じて改定します。重要な変更は当サイト上でお知らせします。</p>
      </Clause>
    </LegalLayout>
  );
}
