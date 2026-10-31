import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "サイトについて | Zion Online",
  description: "Zion Onlineについて、使い方、新曲追加ペースなどの情報。",
}

export default function AboutUsPage() {
  return (
    <div className="h-full px-4 py-6 lg:px-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Zion Online について
          </h1>
          <p className="text-muted-foreground leading-7">
            Zion Online（ザイオン・オンライン）は無料オリジナル音楽素材サイトです。動画に使えるBGMを探している皆様のために、安心してお使い頂けるBGMを無料で公開しています。もちろん動画、インターネット、放送、その他様々なシーンで自由にお使い頂けます。
          </p>
          <p className="text-muted-foreground leading-7 mt-4">
            ご連絡はこちら：<a href="mailto:info@zion-online.com" className="text-primary hover:underline">info@zion-online.com</a>
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            使い方
          </h2>
          <p className="text-muted-foreground leading-7">
            ジャンル、用途、雰囲気などから楽曲を探し、ダウンロードボタンを押すだけで楽曲のMP3データをダウンロードできます。あとはご自由にお使いください。楽曲の曲名をクリックすると楽曲の個別のページにアクセスでき、詳細な情報を確認することができます。
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            収益など
          </h2>
          <p className="text-muted-foreground leading-7">
            サイト広告を掲載しておりますのでぜひクリックお願いします。YouTubeチャンネルでの収益化も予定しておりますので、そちらも宜しくお願い致します。
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            新曲追加ペース
          </h2>
          <p className="text-muted-foreground leading-7">
            定期的に新曲を追加していく予定です。皆様の動画制作やコンテンツ制作に役立てるよう、幅広いジャンルの楽曲を増やしていきますので、応援宜しくお願い致します。
          </p>
        </div>
      </div>
    </div>
  )
}
