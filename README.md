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

## Project Structure

```
filantropi/
├── app
│   ├── AllProgramsPage
│   │   └── page.tsx
│   ├── components
│   │   └── ui
│   │       ├── detail
│   │       │   ├── DisbursementModal.tsx
│   │       │   ├── DonationTypeModal.tsx
│   │       │   ├── LiveDonationBlink.tsx
│   │       │   ├── navbar.tsx
│   │       │   ├── PaymentModal.tsx
│   │       │   ├── ReportModal.tsx
│   │       │   └── WakafPledgeModal.tsx
│   │       ├── donasi
│   │       │   └── campaigncard.tsx
│   │       ├── homepage
│   │       │   ├── balancecard.tsx
│   │       │   ├── carousel.tsx
│   │       │   ├── homeheader.tsx
│   │       │   ├── latestprograms.tsx
│   │       │   ├── navbar.tsx
│   │       │   ├── tentangcard.tsx
│   │       │   ├── tentanglist.tsx
│   │       │   ├── urgentcard.tsx
│   │       │   └── urgentdonation.tsx
│   │       ├── login
│   │       │   └── navbar.tsx
│   │       ├── profile
│   │       │   └── navbar.tsx
│   │       ├── register
│   │       │   └── navbar.tsx
│   │       ├── root
│   │       │   └── BottomNav.tsx
│   │       └── user
│   │           └── navbar.tsx
│   ├── DetailPage
│   │   ├── FormDonasiPage
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── DonasiPage
│   │   └── page.tsx
│   ├── GalangPage
│   │   └── page.tsx
│   ├── HistoryPage
│   │   └── page.tsx
│   ├── HomePage
│   │   └── page.tsx
│   ├── LoginPage
│   │   ├── Masuk
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── PaymentSimulation
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
│   ├── apple.png
│   ├── bandang.jpg
│   ├── banjir.jpg
│   ├── bencana.png
│   ├── blockchain.jpg
│   ├── crypto.jpg
│   ├── donasi.jpg
│   ├── donate.jpg
│   ├── filantropi.png
│   ├── file.svg
│   ├── globe.svg
│   ├── google.png
│   ├── kemas.png
│   ├── logo.png
│   ├── metamask.jpg
│   ├── next.svg
│   ├── profile.png
│   ├── vercel.svg
│   └── window.svg
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
