export default function HomePage() {
  return (
    <div className="min-h-screen warm-gradient">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-peach-700 mb-4">
            あんぴーちゃん
          </h1>
          <p className="text-xl text-peach-600 mb-8">
            大切な家族を温かく見守るサービス
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/login"
              className="cute-button inline-block"
            >
              ログイン
            </a>
            <a
              href="/register"
              className="bg-white text-peach-500 font-medium py-2 px-4 rounded-cute border-2 border-peach-500 hover:bg-peach-50 transition-colors duration-200 inline-block"
            >
              新規登録
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}