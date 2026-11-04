# Zion 切り抜き: Stripe Payment Link 設定手順

コードは用意済みです。Stripe 側の作業と環境変数の設定だけで販売を開始できます。

## 1. 事前に済ませること(販売開始前に必須)
- [ ] `src/lib/site-config.ts` の販売者情報(`SELLER`)と `ZION_DELIVERY_NOTE` を実際の内容に書き換える
- [ ] `/legal/tokushoho`・`/legal/privacy`・`/legal/terms` の「【要記入】」と雛形を確認し、必要なら専門家のレビューを受ける
- [ ] `src/data/zion-info.ts` の料金(`PLANS`)を確定価格にし、「仮」表示を外す(料金セクションの見出しバッジは `src/app/apps/zion/page.tsx`)

## 2. Stripe ダッシュボードで商品と Payment Link を作る
1. 商品カタログ → 商品を追加(名称: 例「Zion 切り抜き 1本」、価格: 確定価格、通貨: JPY、一回限り)
2. 「Payment Links」→ 作成 → 上の商品を選択
3. 設定のおすすめ
   - **支払い完了後**: 「確認ページを表示」ではなく「リダイレクト」を選び、`https://www.zion-online.com/apps/zion/thanks` を指定
   - **利用規約への同意を求める**: 有効化し、規約URLに `https://www.zion-online.com/legal/terms` を設定
   - **顧客情報**: メールアドレスは必須(領収書送付のため)
   - **請求書/領収書**: 領収書メールを有効に(インボイス対応が必要な場合は請求書の作成を有効に)
   - **税**: 消費税の扱いを Stripe Tax か手動で設定(価格は税込表示)
4. まずは **テストモード**で Payment Link を作り、テストカード(4242 4242 4242 4242)で購入→完了ページの遷移まで確認

## 3. サイトにリンクを差し込む
Vercel のプロジェクト設定 → Environment Variables:

| 名前 | 値 |
|---|---|
| `NEXT_PUBLIC_ZION_CHECKOUT_URL` | Payment Link の URL(`https://buy.stripe.com/...`) |

保存して再デプロイすると、`/apps/zion` の料金カードの「販売準備中」が「購入する」ボタンに変わります。
テストモードのリンクで一通り確認してから、本番モードのリンクに差し替えてください(Preview 環境にテスト用、Production に本番用、と分けると安全です)。

## 4. 運用メモ
- 購入ボタンのクリックは GA4 のイベント `begin_checkout`(`item_name: zion-clips`)として記録されます。
- 購入者への連絡・納品は、現状は手作業です。件数が増えたら Webhook(`checkout.session.completed`)で自動化します。
- 返金・キャンセルの方針は特商法ページに合わせてください。Stripe 側の返金は、ダッシュボードの決済詳細から行えます。
