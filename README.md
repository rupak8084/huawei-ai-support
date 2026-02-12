# Huawei AI Customer Support

An AI-powered customer service chatbot for Huawei mobile brand, built with Next.js 15, featuring real-time web search capabilities and a beautiful branded interface.

![Huawei Support](https://img.shields.io/badge/Huawei-AI%20Support-red?style=for-the-badge&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- 🤖 **AI-Powered Chat** - Intelligent customer support powered by advanced AI
- 🌐 **Real-time Web Search** - Fetches current information for pricing, deals, and product updates
- 🎨 **Huawei Branding** - Custom red theme matching Huawei's brand identity
- ⚡ **Quick Actions** - Instant responses for common queries
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔄 **Smart Caching** - Efficient message handling for smooth performance
- 🛡️ **Error Handling** - Graceful error recovery and user-friendly messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/huawei-ai-support.git

# Navigate to project directory
cd huawei-ai-support

# Install dependencies
bun install
# or
npm install

# Start development server
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Production Build

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## 📁 Project Structure

```
huawei-ai-support/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── agent/
│   │   │       └── route.ts      # AI agent API endpoint
│   │   ├── globals.css           # Global styles with Huawei theme
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main chat page
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInput.tsx     # Message input component
│   │   │   ├── ChatMessage.tsx   # Message display component
│   │   │   ├── Header.tsx        # App header
│   │   │   ├── QuickActions.tsx  # Quick action buttons
│   │   │   ├── Sidebar.tsx       # Conversation sidebar
│   │   │   └── TypingIndicator.tsx
│   │   ├── ui/                   # Shadcn UI components
│   │   └── ErrorBoundary.tsx     # Error handling
│   └── hooks/                    # Custom React hooks
├── public/                       # Static assets
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🎯 Quick Actions

The app includes 8 quick action buttons for instant responses:

| Action | Description |
|--------|-------------|
| 📱 Products | Huawei smartphones and devices info |
| 🔧 Tech Support | Device troubleshooting help |
| 📦 Track Order | Order tracking assistance |
| 🔄 Returns | Return policy information |
| 🛡️ Warranty | Huawei Care & warranty info |
| 💳 Payment | Payment methods |
| ❓ FAQ | Frequently asked questions |
| 💬 Human Support | Contact Huawei support |

## 🌐 Web Search

Web search automatically triggers for queries containing:
- Time-sensitive: `latest`, `current`, `recent`, `today`
- Pricing: `price`, `cost`, `deal`, `offer`, `discount`
- Comparison: `compare`, `review`, `best`, `top`
- Years: `2024`, `2025`, `2026`
- Products: `mate 70`, `pura 70`, `matebook`, `freebuds`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/huawei-ai-support)

1. Click the button above
2. Connect your GitHub account
3. Click "Deploy"
4. Done! ✅

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-username/huawei-ai-support)

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Build Command: `bun run build`
4. Start Command: `bun run start`
5. Deploy!

## 🔧 Environment Variables

No environment variables are required for basic functionality. The app uses the built-in AI SDK.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **AI SDK**: z-ai-web-dev-sdk
- **Package Manager**: Bun

## 📱 Screenshots

### Desktop View
- Clean chat interface with Huawei branding
- Sidebar for conversation history
- Quick actions for common queries

### Mobile View
- Responsive design
- Collapsible sidebar
- Touch-friendly interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons

---

**Built with ❤️ for Huawei Customer Support Demo**

![Footer](https://img.shields.io/badge/Made%20with-Next.js-black?style=flat-square)
