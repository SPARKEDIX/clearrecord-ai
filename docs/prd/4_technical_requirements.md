# Technical Requirements

### Stack Summary
- **Platform**: Responsive website (desktop, tablet, mobile)
- **Frontend**: Next.js (React 18+, App Router)
- **Backend**: Firebase (Firebase Auth, Firebase Cloud Functions, Firebase Storage)
- **Database**: Firebase Firestore (NoSQL)
- **Theme Support**: System (auto-detects OS/browser preference)
- **Visual Style**: Playful (Spotify Dark color palette, Lexend font)

### Recommended Library Table
| Library | Ecosystem | Purpose | Why It Fits |
|---------|-----------|---------|-------------|
| Firebase JS SDK v10+ | NPM | Integrates Next.js with Firebase services (Auth, Firestore, Storage, Cloud Functions) | Official Google-maintained library, fully compatible with Next.js and Firebase stack |
| React Hook Form | NPM | Form state management and validation for upload and account forms | Lightweight, works seamlessly with Next.js, reduces boilerplate for form handling and validation |
| Tailwind CSS | NPM | Utility-first CSS for consistent styling and responsive design | Native Next.js support, enforces consistent spacing and design tokens, easy to implement the specified color palette and font |
| Framer Motion | NPM | Animations and transitions for UI elements (progress bars, screen transitions, hover states) | React/Next.js compatible, lightweight, supports the playful visual style with smooth micro-interactions |
| TanStack Query (React Query) | NPM | Server state management for API calls to Firebase Cloud Functions | Handles caching, loading states, and error handling for async operations, integrates natively with Next.js |
| PDFMake | NPM | Client-side PDF generation for audit reports | Browser-native, no server-side dependencies required for report generation, fully customizable for the required report format |
| React Dropzone | NPM | Drag-and-drop file upload functionality | Accessible, lightweight, works with Next.js, supports the required file validation rules |

### Layered Architecture Overview
1. **Presentation/UI Layer**: Next.js pages and React components, handles user interactions, renders UI, and manages client-side state
2. **State Management Layer**: TanStack Query for server state, React Hook Form for form state, React Context for authentication state
3. **Application/Business Logic Layer**: Next.js API routes (for server-side operations) and Firebase Cloud Functions (for AI scanning, file processing), handles business rules, validation, and workflow orchestration
4. **API/Service Layer**: Firebase SDK wrappers that abstract Firebase service calls (Auth, Firestore, Storage) for use in the application layer
5. **Data Access Layer**: Firestore security rules, data validation, and query logic, ensures secure access to stored user-specific data
6. **Database/Storage Layer**: Firebase Firestore (structured data for users, audits, flagged items, reports), Firebase Storage (encrypted uploaded social media archives)
7. **Authentication/Authorization Layer**: Firebase Auth, handles user authentication, session management, and access control for user-specific data
8. **External Integrations Layer**: AI scanning service (third-party API or custom model deployed on Firebase ML) for risk categorization of social media content

### Folder Structure
```
clearrecord-ai/
├── public/                     # Static assets
│   ├── fonts/                  # Lexend font files
│   ├── images/                 # UI icons, platform logos
│   └── favicon.ico
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Authenticated routes
│   │   │   ├── dashboard/      # Dashboard screen
│   │   │   ├── audit/          # Audit history and details
│   │   │   └── report/         # Report generation and download
│   │   ├── (public)/           # Public routes
│   │   │   ├── upload/         # Upload screen
│   │   │   ├── scan/           # Scan progress screen
│   │   │   ├── review/         # Risk review feed screen
│   │   │   ├── score/          # Score and report screen
│   │   │   └── login/          # Login/signup screen
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Root page (redirects to upload or dashboard)
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # Base UI components (buttons, inputs, cards, etc.)
│   │   ├── upload/             # Upload-related components
│   │   ├── scan/               # Scan progress components
│   │   ├── review/             # Review feed components
│   │   ├── score/              # Score display components
│   │   └── layout/             # Header, footer, navigation components
│   ├── lib/                    # Utility and service files
│   │   ├── firebase/           # Firebase SDK initialization and service wrappers
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   ├── storage.ts
│   │   │   └── functions.ts
│   │   ├── utils/              # Helper functions (score calculation, file validation, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   └── constants/          # Static constants (risk categories, color tokens, etc.)
│   ├── styles/                 # Global styles and Tailwind config
│   │   ├── globals.css
│   │   └── tailwind.config.ts
│   └── types/                  # TypeScript type definitions
│       ├── user.ts
│       ├── audit.ts
│       ├── flaggedItem.ts
│       └── report.ts
├── .env.local                  # Local environment variables
├── .env.production             # Production environment variables
├── firebase.json               # Firebase project configuration
├── firestore.rules             # Firestore security rules
├── next.config.js              # Next.js configuration
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### Key Data Flow
(End-to-end primary workflow: Upload → Scan → Review → Generate Report)
```
User → (1) Selects social media archive file → (2) Next.js frontend validates file type/size → (3) Frontend uploads file to Firebase Storage → (4) Firestore creates new Audit record with status 'pending' → (5) Frontend triggers Firebase Cloud Function to start scan → (6) Cloud Function parses archive, extracts content → (7) Cloud Function sends content to AI scanning service → (8) AI service returns risk categories and levels for each content item → (9) Cloud Function saves flagged items to Firestore, updates Audit status to 'completed' and calculates Digital Hygiene Score → (10) Frontend polls Firestore for scan status update → (11) Frontend renders Risk Review Feed with flagged items → (12) User takes action on items (mark reviewed, delete, untag) → (13) Frontend updates FlaggedItem records in Firestore → (14) Frontend recalculates Digital Hygiene Score in real-time → (15) User requests PDF report → (16) Frontend generates PDF using PDFMake with audit data → (17) Frontend uploads PDF to Firebase Storage, saves Report record to Firestore → (18) User downloads PDF report
```

### Firestore Data Model (NoSQL, compatible with Firebase)
#### Collection: `users`
| Field Name | Data Type | Required | Constraints | Purpose |
|------------|-----------|----------|-------------|---------|
| user_id | string | Yes | Primary key, auto-generated UUID | Unique user identifier |
| email | string | Yes | Unique, valid email format | User login email |
| full_name | string | Yes | Max 255 characters | User display name |
| auth_provider | string | Yes | Enum: `email`, `google` | Authentication provider used |
| password_hash | string | No | Required if auth_provider is `email` | Hashed user password |
| created_at | timestamp | Yes | Default: current timestamp | Account creation time |
| updated_at | timestamp | Yes | Default: current timestamp, auto-updated on edit | Last account update time |

#### Collection: `audits`
| Field Name | Data Type | Required | Constraints | Purpose |
|------------|-----------|----------|-------------|---------|
| audit_id | string | Yes | Primary key, auto-generated UUID | Unique audit identifier |
| user_id | string | Yes | Foreign key to `users.user_id` | Owner of the audit |
| upload_date | timestamp | Yes | Default: current timestamp | Date archive was uploaded |
| scan_status | string | Yes | Enum: `pending`, `processing`, `completed`, `failed`, Default: `pending` | Current scan status |
| digital_hygiene_score | number | No | Range: 0-100, only set when scan_status is `completed` | Final Digital Hygiene Score |
| total_items_scanned | number | No | Only set when scan completes | Total number of content items scanned |
| total_flagged_items | number | No | Only set when scan completes | Total number of flagged items found |
| archive_file_path | string | Yes | Max 1024 characters, path to file in Firebase Storage | Path to uploaded archive file |
| created_at | timestamp | Yes | Default: current timestamp | Audit creation time |

#### Collection: `flagged_items`
| Field Name | Data Type | Required | Constraints | Purpose |
|------------|-----------|----------|-------------|---------|
| flagged_item_id | string | Yes | Primary key, auto-generated UUID | Unique flagged item identifier |
| audit_id | string | Yes | Foreign key to `audits.audit_id` | Audit this item belongs to |
| content_text | string | No | Max 5000 characters | Text content of the flagged post/comment |
| media_url | string | No | Max 1024 characters, URL to media in Firebase Storage | URL to associated media (image/video) |
| original_platform | string | Yes | Enum: `facebook`, `instagram`, `twitter`, `linkedin`, `tiktok` | Platform the content was posted on |
| post_date | timestamp | Yes | Date the original content was posted | Original post date |
| risk_category | string | Yes | Enum: `workplace_hostility`, `aggressive_debates`, `profanity`, `substance_references`, `discriminatory_language`, `unprofessional_behavior`, `confidential_info_sharing`, `fake_news`, `extremist_content`, `inappropriate_media`, `privacy_violations`, `dishonest_behavior`, `violent_threats` | Risk category assigned to the content |
| risk_level | string | Yes | Enum: `high`, `medium`, `safe` | Severity level of the risk |
| user_action | string | Yes | Enum: `pending`, `reviewed`, `deleted`, `untagged`, Default: `pending` | Action taken by the user on the item |
| created_at | timestamp | Yes | Default: current timestamp | Item creation time |

#### Collection: `reports`
| Field Name | Data Type | Required | Constraints | Purpose |
|------------|-----------|----------|-------------|---------|
| report_id | string | Yes | Primary key, auto-generated UUID | Unique report identifier |
| audit_id | string | Yes | Foreign key to `audits.audit_id` | Audit the report is for |
| report_type | string | Yes | Enum: `full`, `employer_redacted` | Type of report generated |
| pdf_url | string | Yes | Max 1024 characters, URL to PDF in Firebase Storage | URL to the generated PDF report |
| generated_at | timestamp | Yes | Default: current timestamp | Date report was generated |
| expires_at | timestamp | Yes | Default: 30 days after generation | Date report expires and is deleted |

**Indexes**:
- `audits` collection: Index on `user_id` (fetch all audits for a user), index on `scan_status` (filter pending scans)
- `flagged_items` collection: Index on `audit_id` (fetch all items for an audit), index on `risk_level` (sort by risk level), index on `risk_category` (filter by category)

### Build & Release Checklist
1. **Local Development Setup**
   - Clone repository
   - Install Node.js 18+ and npm/yarn
   - Install Firebase CLI and log in to Firebase account
   - Create Firebase project and configure `firebase.json` with project ID
   - Copy `.env.example` to `.env.local` and fill in Firebase config values (API key, project ID, etc.)
   - Run `npm install` to install dependencies
   - Run `firebase emulators:start` to start local Firebase emulators (Firestore, Storage, Auth, Functions)
   - Run `npm run dev` to start Next.js development server
   - Verify local development server runs at `http://localhost:3000`
2. **Environment Variables & Secrets**
   - Ensure all Firebase config values are stored in environment variables, not hardcoded
   - Store AI scanning service API key (if using third-party) in Firebase environment variables for Cloud Functions
   - Ensure production environment variables are set in Firebase hosting and Cloud Functions config
3. **Dependency Installation**
   - Run `npm install` for all dependencies
   - Run `npm audit fix` to resolve known security vulnerabilities
   - Verify all dependencies are compatible with Next.js 14+ and Firebase SDK v10+
4. **Database Setup & Migrations**
   - Deploy Firestore security rules using `firebase deploy --only firestore:rules`
   - Deploy Firestore indexes using `firebase deploy --only firestore:indexes`
   - Initialize Firestore collections with required fields (no seed data required for initial launch)
5. **Development Server Execution**
   - Run `npm run dev` for local development
   - Verify all core screens load correctly, Firebase services connect successfully
   - Test file upload, scan, review, and report generation workflows locally using emulators
6. **Linting & Formatting**
   - Run `npm run lint` to check for code style issues
   - Run `npm run format` to format code with Prettier
   - Ensure no linting errors before committing code
7. **Testing**
   - Run unit tests with `npm run test:unit` (target 80% code coverage for core business logic)
   - Run integration tests with `npm run test:integration` (test Firebase service integrations, scan workflow)
   - Run end-to-end tests with `npm run test:e2e` (test full user workflows: upload → scan → review → report download)
8. **Production Build**
   - Run `npm run build` to generate optimized Next.js production build
   - Verify build completes without errors
   - Test production build locally with `npm run start`
9. **Deployment**
   - Deploy Next.js app to Firebase Hosting using `firebase deploy --only hosting`
   - Deploy Firebase Cloud Functions using `firebase deploy --only functions`
   - Deploy Firestore rules and indexes using `firebase deploy --only firestore`
   - Verify production site is accessible at custom domain
   - Test all core workflows in production environment
10. **Database Migration in Production**
    - No schema migrations required for initial launch (Firestore is schemaless)
    - For future feature updates, deploy new Firestore rules and indexes via Firebase CLI
    - Back up Firestore data regularly using Firebase scheduled backups
11. **Environment Configuration**
    - Verify production environment variables are set correctly in Firebase console
    - Enable Firebase Authentication (email/password and Google providers)
    - Configure Firebase Storage security rules to restrict access to user-specific archives
    - Set up Firebase Cloud Functions region for low latency
12. **Monitoring & Logging**
    - Enable Firebase Crashlytics for frontend error tracking
    - Enable Firebase Cloud Functions logging for backend error tracking
    - Set up Firebase Performance Monitoring to track page load times and API latency
    - Configure alerts for scan failure rates, error rates, and service downtime
13. **Security Checks**
    - Run `npm audit` to check for dependency vulnerabilities
    - Verify Firestore security rules restrict access to user-specific data only
    - Verify Firebase Storage rules prevent unauthorized access to uploaded archives
    - Ensure all API endpoints are authenticated and authorized
    - Verify PDF reports do not expose sensitive user data in employer redacted mode
14. **Rollback Considerations**
    - Use Firebase Hosting rollback feature to revert to previous deployment if issues are found
    - Keep previous Cloud Functions versions deployed for quick rollback
    - Maintain database backups for 30 days to restore data if needed
    - Document rollback steps in internal runbook