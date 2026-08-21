This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Project Structure

```
filantropi/
├── app
│   ├── AllProgramsPage
│   │   └── page.tsx
│   ├── components
│   │   └── ui
│   │       ├── donasi
│   │       │   └── campaigncard.tsx
│   │       ├── login
│   │       │   └── navbar.tsx
│   │       ├── profile
│   │       │   └── navbar.tsx
│   │       ├── register
│   │       │   └── navbar.tsx
│   │       ├── root
│   │       │   ├── AuthProvider.tsx
│   │       │   └── BottomNav.tsx
│   │       └── user
│   │           └── navbar.tsx
│   ├── DetailPage
│   │   ├── components
│   │   │   ├── BottomActionBar.tsx
│   │   │   ├── CampaignBanner.tsx
│   │   │   ├── CampaignHeader.tsx
│   │   │   ├── CampaignStory.tsx
│   │   │   ├── DisbursementModal.tsx
│   │   │   ├── DonationHistory.tsx
│   │   │   ├── DonationTypeModal.tsx
│   │   │   ├── LiveDonationBlink.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   └── ReportModal.tsx
│   │   ├── FormDonasiPage
│   │   │   └── page.tsx
│   │   ├── hooks
│   │   │   └── useCampaignDetail.ts
│   │   └── page.tsx
│   ├── DonasiPage
│   │   └── page.tsx
│   ├── GalangPage
│   │   └── page.tsx
│   ├── HistoryPage
│   │   └── page.tsx
│   ├── HomePage
│   │   ├── components
│   │   │   ├── carousel.tsx
│   │   │   ├── homeheader.tsx
│   │   │   ├── latestprograms.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── urgentcard.tsx
│   │   │   └── urgentdonation.tsx
│   │   └── page.tsx
│   ├── LoginPage
│   │   ├── Masuk
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── ProfilePage
│   │   ├── PagePenerima
│   │   │   ├── Tipe
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── UserPage
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── ProgramPage
│   │   ├── EditProgram
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── ProgressPage
│   │   └── page.tsx
│   ├── PusatBantuan
│   │   └── page.tsx
│   ├── SyaratKetentuan
│   │   └── page.tsx
│   ├── WakafDetailPage
│   │   ├── components
│   │   │   ├── WakafBottomBar.tsx
│   │   │   ├── WakafPaymentModal.tsx
│   │   │   └── WakafPledgeModal.tsx
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── I18nProvider.tsx
│   ├── layout.tsx
│   └── page.tsx
├── hooks
│   └── useAuth.ts
├── lib
│   ├── api.ts
│   ├── auth.service.ts
│   ├── firebase.ts
│   └── i18n.ts
├── public
│   ├── bandang.jpg
│   ├── banjir.jpg
│   ├── bencana.png
│   ├── donasi.jpg
│   ├── donate.jpg
│   ├── filantropi.png
│   ├── google.png
│   ├── gwi.png
│   ├── kemas.png
│   ├── loaderio-975d61de836d43278f261dffbc5be8a4.txt
│   ├── logo.png
│   └── profile.png
├── store
│   └── useAuthStore.ts
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```
