# NBA Anaocha Digital Portal — Internal Demo Brief
**BeamX Solutions | Prepared for: Chimaobi Ibeh**
**Demo Date: April 7, 2026**
**CONFIDENTIAL — Internal Use Only**

---

## What We Built

A full-stack digital portal for the Nigerian Bar Association, Anaocha Branch — replacing manual, paper-based processes with a web application covering membership management, service applications, and legal document preparation.

**Tech Stack:** React + TypeScript + Vite (frontend), Supabase (auth, database, storage, edge functions), Anthropic Claude API (AI document generation), Vercel (hosting)

**Live URL:** https://nba-anaocha-digital-portal.vercel.app
**Repository:** https://github.com/BeamX-Solutions/nba-anaocha-digital-portal

---

## Two Portals in One

### 1. NBA Anaocha Member Portal
For branch members (lawyers):
- **Registration & Authentication** — email/password and Google OAuth sign-in
- **Profile Management** — photo upload, office details, year of call
- **Apply for Services** — NBA Diary, ID Card, BAIN, Stamp & Seal, Title Document Front Page
- **My Applications** — track status of service requests in real time
- **Find a Member** — search the branch directory, view member profiles with contact details
- **Notifications** — real-time in-app alerts for application updates and account changes
- **Settings** — password management, profile visibility controls

### 2. Remuneration Portal
For legal document preparation, compliant with the Legal Practitioners' Remuneration Order 2023:
- **AI Document Generation** — fill a smart form, Claude AI generates a full compliant legal document draft instantly
- **Precedent Upload** — upload existing documents, AI reformats them for compliance
- **My Documents** — view, expand content, copy reference numbers, delete drafts
- **Find Document** — look up completed documents by reference number (privacy-safe)
- **Payment History** — tracks payment records (gateway integration pending)

### 3. Admin Panel
For the branch secretariat:
- **Dashboard** — live stats (members, applications, documents, contacts)
- **Applications** — approve/reject service applications with instant member notification
- **Members** — search, view, edit profiles, suspend/reinstate accounts
- **Documents** — mark remuneration documents as completed
- **Contact Messages** — read and manage member inquiries
- **Send Notification** — broadcast messages to all members or specific individuals

---

## Key Features to Highlight in Demo

| Feature | Talking Point |
|---|---|
| AI Document Generation | A lawyer fills a form, clicks Generate — a full Deed of Assignment with all standard clauses appears in seconds, formatted as a professional legal document |
| Real-time Notifications | The moment admin approves an application, the member sees it in their bell icon |
| Admin suspension | Suspend a member with one click — they are locked out immediately and notified |
| Member directory | Search any lawyer by name or year of call, view their profile with contact details they have chosen to share |
| Privacy controls | Members control what information is visible to other members via Settings |
| Mobile responsive | Works on any device — lawyers can check applications on the go |
| Reference numbers | Every document gets a unique reference number for tracking and verification |

---

## Suggested Demo Flow (15-20 minutes)

1. **Landing page** — show the about section, remuneration portal banner, clean branding
2. **Sign up as a new member** — show the complete profile flow (takes 60 seconds)
3. **Apply for a service** (NBA ID Card) — file upload, submission, success state
4. **Switch to admin** — show the application appearing, approve it
5. **Back to member** — show the notification arrived instantly in the bell
6. **Remuneration Portal** — fill the Deed of Assignment form, generate AI document, show the formatted output
7. **My Documents** — expand the draft, copy reference number
8. **Find a Member** — search, click a result, view profile dialog
9. **Mobile view** — switch to phone or DevTools mobile emulation

---

## What Is Not Yet Live

Be transparent about these if asked:

| Item | Status | Timeline |
|---|---|---|
| Payment gateway | Documents save as drafts; payment handled offline through secretariat | Next milestone — Paystack/Flutterwave integration |
| Google OAuth | Working but in testing mode (limited to test emails) | Pending Google verification |
| Resources page | Download links are placeholders | Pending PDF uploads from the branch |
| Email templates | Still showing default Supabase/Lovable branding | Quick fix — update in Supabase dashboard |

---

## Potential Client Questions & Answers

**"Can members access each other's personal information?"**
Members control their own visibility. Each member chooses what is shown in the directory through their Settings page.

**"How secure is the data?"**
All data is stored in Supabase with Row Level Security (RLS) — every database query is restricted so users can only access their own records. Authentication is handled by Supabase Auth (industry standard).

**"What happens when a lawyer generates a document — is it stored?"**
Yes, documents are saved to their "My Documents" section with a unique reference number. Completed documents are also searchable by reference number in the Find Document page.

**"How does the AI document generation work?"**
The lawyer fills in the relevant fields (parties, consideration amount, property details, etc.), and our system sends that data to Anthropic's Claude AI model with a specialized legal prompt. The AI generates a full, clause-complete document in seconds.

**"Who manages the system?"**
The branch secretariat has an admin panel where they approve applications, manage members, send notifications, and mark documents as completed.

---

## Commercial Opportunity (BeamX Internal)

This portal is a replicable product. The same architecture can serve:
- Other NBA branches (Onitsha, Awka, Enugu, Lagos — 120+ branches nationwide)
- Other professional associations: ICAN, NMA, NSE, NIOB, CIPM
- Any body that manages members, processes applications, and handles document generation

**Current infrastructure cost:** ~$0/month (Supabase free + Vercel free tier)
**Production scale cost:** ~$25/month (Supabase Pro + Vercel Pro)
**Anthropic API cost:** Pay per use — approximately $0.003 per document generated

---

## Admin Credentials for Demo

- **Admin account:** ibehchimaobi98@gmail.com
- **Test member:** create fresh during demo for authenticity
- **Supabase project:** aovazollojsvttxsyjyx
- **Live URL:** https://nba-anaocha-digital-portal.vercel.app

---

## Outstanding Issues to Fix Before/After Demo

- [ ] Update Supabase email templates (remove Lovable branding, add NBA Anaocha branding)
- [ ] Publish Google OAuth app for production sign-in
- [ ] Upload actual PDFs to Resources page
- [ ] Integrate payment gateway (Paystack recommended for Nigeria)
- [ ] Transfer custom domain (nbaanaocha.org.ng) and point to Vercel

---

*Prepared by BeamX Solutions. Confidential — not for distribution to the client.*
