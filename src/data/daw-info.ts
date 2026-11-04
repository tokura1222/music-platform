/**
 * Zion DAW page content. EVERYTHING here is provisional ("仮") until the app ships.
 * Edit this file only; the page renders it as-is and labels it as provisional.
 */

export type FeatureStatus = '試作中' | '計画中' | '検討中';

export const FEATURES: { name: string; desc: string; status: FeatureStatus }[] = [
  { name: '音源の分離', desc: '混ざった音源を、ボーカル・ベース・ドラム・その他のステムに分けます。', status: '試作中' },
  { name: 'ステムの編集', desc: '分けたトラックを切る・並べる・整える。', status: '試作中' },
  { name: 'パートの差し替え', desc: '別の音に差し替えて、聴き比べます。', status: '試作中' },
  { name: '再ミックス', desc: 'レベルなどを調整して、もう一度まとめます。', status: '試作中' },
  { name: 'ステム/ミックスの書き出し', desc: '音声ファイルとして書き出します。', status: '試作中' },
  { name: 'Zion Music の素材と連携', desc: 'サイトの楽曲素材を取り込んで使えるようにすること。無料/有料の区分は検討中です。', status: '検討中' },
];

/** Not a compatibility claim: these are the DAWs the workflow is being designed to sit alongside. */
export const COMPANION_DAWS = ['Cubase', 'Studio One', 'Ableton Live'];

export const SPECS: [string, string][] = [
  ['対応OS', 'Windows(想定)。macOS は未定'],
  ['形態', 'デスクトップアプリ(インストール型)'],
  ['CPU / メモリ / 空き容量', '未定(試作の測定後に掲載します)'],
  ['インターネット接続', '未定(分離処理をオフラインで行えるかを含め検討中)'],
  ['出力形式', 'WAV など(確定したら掲載します)'],
];

export type Plan = { name: string; price: string; note: string; points: string[] };

export const PLANS: Plan[] = [
  {
    name: '先行登録者向け',
    price: '¥X,XXX(仮)',
    note: 'ウェイトリスト登録者を想定した特別価格案',
    points: ['買い切り(案)', '発売時に価格が変わる場合があります'],
  },
  {
    name: '通常版',
    price: '¥XX,XXX(仮)',
    note: '正式発売時の価格案',
    points: ['買い切り / 年額プランは検討中', 'アップデート提供期間は未定'],
  },
];

export const ROADMAP: { stage: string; desc: string; current?: boolean }[] = [
  { stage: '試作', desc: '分離・編集・差し替え・再ミックスの一連の流れを検証中', current: true },
  { stage: '限定テスト', desc: 'ウェイトリスト登録者の一部に先行提供(予定)' },
  { stage: '先行販売', desc: '先行登録者向け価格で販売(予定)' },
  { stage: '正式版', desc: '一般販売。Music の素材連携も順次(予定)' },
];

export const FAQS: [string, string][] = [
  ['いつ発売ですか?', '時期は未定です。ウェイトリストに登録いただいた方へ、進み具合とあわせてお知らせします。'],
  ['価格はいくらですか?', '現在の金額は仮のものです。確定したらこのページと、ウェイトリスト登録者にお知らせします。'],
  ['Cubase / Studio One / Ableton Live の代わりになりますか?', '置き換えではなく、併用を想定しています。ステムを書き出して、お使いのDAWで続きの作業をする使い方を考えています。各DAWでの動作確認は今後行い、確認できた範囲だけをお知らせします。'],
  ['どのOSで使えますか?', 'まずは Windows を想定しています。macOS は未定です。'],
  ['分離の品質はどのくらいですか?', 'AIによる分離は、曲によって精度が変わり、完全に分けられない場合があります。品質の目安は、デモと試作版の結果をもとに掲載します。'],
  ['権利の面で注意することは?', 'お手持ちの音源は、ご自身に利用する権利のあるものに限ってお使いください。個別の権利判断への助言はできません。詳しくは利用規約をご覧ください。'],
  ['返金はできますか?', 'デジタル商品の性質上、原則として返金は難しい予定です。詳細は販売開始時に「特定商取引法に基づく表記」へ明記します。'],
];
