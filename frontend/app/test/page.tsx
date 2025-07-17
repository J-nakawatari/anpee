"use client";

export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">SVGテストページ</h1>
      
      <div className="space-y-4">
        <div>
          <p>1. 通常のimgタグ:</p>
          <img src="/logo.svg" alt="Logo" width="100" height="100" />
        </div>
        
        <div>
          <p>2. 絶対パス:</p>
          <img src="http://localhost:3000/logo.svg" alt="Logo" width="100" height="100" />
        </div>
        
        <div>
          <p>3. オブジェクトタグ:</p>
          <object data="/logo.svg" type="image/svg+xml" width="100" height="100">
            SVGが表示されません
          </object>
        </div>
        
        <div>
          <p>4. 背景画像として:</p>
          <div 
            className="w-24 h-24 bg-orange-100" 
            style={{ backgroundImage: 'url(/logo.svg)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
          />
        </div>
        
        <div>
          <p>5. テスト用SVG:</p>
          <img src="/test-logo.svg" alt="Test Logo" width="100" height="100" />
        </div>
      </div>
    </div>
  );
}