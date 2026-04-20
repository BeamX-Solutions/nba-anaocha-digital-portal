# NBA Anaocha Digital Portal

A full-stack digital portal for the Nigerian Bar Association, Anaocha Branch — replacing manual, paper-based processes with a web application covering membership management, service applications, and legal document preparation.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: ShadCN UI components with Tailwind CSS
- **Backend**: Supabase (auth, database, storage, edge functions)
- **AI**: Anthropic Claude API for document generation
- **Hosting**: Vercel
- **Testing**: Vitest + Playwright (E2E)
- **Linting**: ESLint

## Features

### Member Portal
- Registration & Authentication (email/password and Google OAuth)
- Profile Management (photo upload, office details, year of call)
- Service Applications (NBA Diary, ID Card, BAIN, Stamp & Seal, Title Document Front Page)
- Application Tracking with real-time status updates
- Member Directory with search and privacy controls
- In-app Notifications
- Settings for password and visibility management

### Remuneration Portal
- AI-powered legal document generation (compliant with Legal Practitioners' Remuneration Order 2023)
- Precedent document upload and reformatting
- Document management (view, edit, delete drafts)
- Document search by reference number
- Payment history tracking (gateway integration pending)

### Admin Panel
- Dashboard with live statistics
- Application approval/rejection with notifications
- Member management (search, edit, suspend)
- Document completion marking
- Contact message management
- Broadcast notifications

## Live Demo

**URL**: https://nba-anaocha-digital-portal.vercel.app

## Repository

**GitHub**: https://github.com/BeamX-Solutions/nba-anaocha-digital-portal

## Local Development Setup

### Prerequisites
- Node.js & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account and project

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/BeamX-Solutions/nba-anaocha-digital-portal.git
   cd nba-anaocha-digital-portal
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key
   - Add Anthropic API key for document generation

4. Start the development server:
   ```sh
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode

### Testing

Run unit tests:
```sh
npm run test
```

Run E2E tests with Playwright:
```sh
npx playwright test
```

### Deployment

The project is configured for Vercel deployment. Push to the main branch to trigger automatic deployment.

### Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/` in order
3. Configure authentication providers (email and Google OAuth)
4. Set up storage buckets for file uploads
5. Deploy edge functions from `supabase/functions/`

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Security

- All data is stored with Row Level Security (RLS) in Supabase
- Authentication handled by Supabase Auth
- Input validation using Zod schemas
- HTTPS enforced in production

### License

This project is proprietary and confidential for NBA Anaocha Branch use only.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
