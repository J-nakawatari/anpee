#!/bin/bash
# Next.jsプロジェクトの自動セットアップスクリプト

echo "Setting up Next.js project..."

# frontendディレクトリに移動
mkdir -p frontend
cd frontend

# package.jsonを作成
cat > package.json << 'EOF'
{
  "name": "anpee-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3003",
    "build": "next build",
    "start": "next start -p 3003",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
EOF

# Next.jsと関連パッケージをインストール
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/react-dom @types/node eslint eslint-config-next

# Tailwind CSS v4 alphaをインストール
npm install -D tailwindcss@next postcss autoprefixer

# その他の必要なパッケージをインストール
npm install clsx tailwind-merge lucide-react sonner@2.0.3 react-hook-form@7.55.0 zod @hookform/resolvers
npm install axios swr recharts date-fns js-cookie
npm install next-csrf

# shadcn/ui関連パッケージ
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label
npm install @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator
npm install @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-tooltip
npm install @radix-ui/react-slot

echo "Package installation completed!"