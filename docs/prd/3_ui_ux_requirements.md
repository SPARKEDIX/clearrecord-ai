# UI/UX Requirements

### Color Token Table
| Token | Hex Value | Role |
|-------|-----------|------|
| Primary | #1DB954 | Core interactive elements, CTAs, score highlights, and active states |
| Secondary | #191414 | High-emphasis static surfaces, dark mode base background for header/footer |
| Accent | #1ED760 | Secondary interactive elements, hover states, success indicators, and score highlights |
| Background | #121212 | Full page base background, modal backdrops |
| Surface | #181818 | Elevated surfaces, cards, form containers, and input backgrounds |
| Text | #FFFFFF | All primary text content, headings, body copy, labels, and button text |

### Font Family
**Font Family:** Lexend (exact as specified, no substitution)

### Design Guidance
- **Spacing System**: 8px base grid, all spacing values are multiples of 8 (8, 16, 24, 32, 48, 64px) for consistent layout across all screens
- **Border Radius**: 8px for cards, buttons, form inputs, and tags; 12px for modals and large containers; 4px for small badges and indicators
- **Elevation and Shadows**: No heavy drop shadows; use subtle 1px solid #FFFFFF (10% opacity) borders for elevated surfaces to align with the playful Spotify dark style
- **Button States**:
  - Default: Primary background (#1DB954), white text, 8px border radius, 16px horizontal padding, 12px vertical padding
  - Hover: Accent background (#1ED760), 1.02 scale transition, 200ms ease
  - Pressed/Active: Darker green (#169c46), 0.98 scale transition
  - Focus: 2px solid #1ED760 outline, 4px offset from element
  - Disabled: 40% opacity, no hover/active effects, cursor not-allowed
  - Loading: White spinner centered in button, "Processing..." text at 60% opacity
- **Form Controls**: Inputs have Surface background (#181818), 1px solid #FFFFFF (20% opacity) border, 8px border radius, 12px padding. Validation error state uses 1px solid #FF4444 border with error text below input. Validation success state uses 1px solid #1DB954 border with a success checkmark icon.
- **Responsive Behavior**: Mobile-first design with breakpoints at 768px (tablet) and 1024px (desktop). Mobile uses single-column layout, full-width cards/buttons, and bottom navigation for core actions. Tablet uses 2-column grid for dashboard and review feed. Desktop uses 3-column layout with a max-width 1200px centered container.
- **Theme Support**: System theme only (no manual toggle). The UI automatically detects the user’s OS/browser theme preference and applies the corresponding color tokens. The provided dark palette is the default; light mode uses the following recommended derived tokens: Background: #FFFFFF, Surface: #F5F5F5, Text: #121212 (all other tokens remain unchanged).
- **Playful Style Implementation**: Use smooth micro-interactions (scale transitions, animated progress bars, bounce animations for score updates), friendly rounded iconography, bright accent color for positive feedback, approachable copy tone, and subtle screen transitions to create a welcoming, non-intimidating experience.
- **Accessibility**:
  - WCAG 2.1 AA compliant: All text has minimum 4.5:1 contrast ratio (all provided colors meet this requirement)
  - Minimum 48x48px touch targets for all interactive elements
  - Full keyboard navigation support with visible focus states for all focusable elements
  - Semantic HTML structure for all screens, proper ARIA labels for icons and non-text elements
  - Font scaling supports up to 200% zoom without layout breakage
  - Screen reader announcements for scan progress, score updates, and action confirmations

### Core Screens
1. **Upload Screen**
   - Purpose: Allow users to upload their social media data archive for scanning
   - Wireframe structure (top to bottom): Header with logo and navigation → Hero section with headline "Check Your Digital Hygiene Before Your Next Job Application" → Drag-and-drop upload zone with file picker button → Supported platforms list (Facebook, Instagram, Twitter/X, LinkedIn, TikTok) → Hidden error message area → Footer with privacy policy link
   - Key UI components: Drag-and-drop zone, file picker button, platform icons, error toast, privacy badge
   - Primary user action: Upload a valid social media archive file
   - States: Empty (default, no file uploaded), Loading (file uploading, progress bar), Error (invalid file type/size, error message with retry button), Success (file uploaded, auto-navigate to scan screen)

2. **Scan Progress Screen**
   - Purpose: Show real-time progress of the AI risk scanning process
   - Wireframe structure (top to bottom): Header with logo and navigation → Progress header with "Scanning Your Content" headline → Animated progress bar with percentage complete → Estimated time remaining text → List of completed scan steps (Upload validated, Parsing content, Analyzing risk categories, Generating score) with checkmarks for completed steps → Cancel scan button
   - Key UI components: Progress bar, step list, cancel button, loading spinner
   - Primary user action: Wait for scan to complete or cancel scan
   - States: Processing (scan in progress, steps updating), Completed (auto-navigate to review feed), Error (scan failed, error message with retry button), Cancelled (return to upload screen)

3. **Risk Review Feed Screen**
   - Purpose: Allow users to review flagged content items and take action
   - Wireframe structure (top to bottom): Header with logo and navigation → Score summary card (current Digital Hygiene Score, number of flagged items) → Filter bar (filter by risk level, filter by risk category) → List of flagged item cards (sorted by risk level) → Bulk action bar (appears when items are selected) → Load more button
   - Key UI components: Score card, filter dropdowns, flagged item cards, action buttons (mark reviewed, delete, untag), bulk action bar, load more button
   - Primary user action: Review flagged items and take action to clean up risky content
   - States: Loading (loading initial feed), Empty (no flagged items, "Great job! No risky content found" message), Error (failed to load feed, retry button), Partial loaded (loading more items)

4. **Score & Report Screen**
   - Purpose: Display the final Digital Hygiene Score and allow report download
   - Wireframe structure (top to bottom): Header with logo and navigation → Large score display (0-100 number, color-coded: red <50, yellow 50-79, green 80-100) → Score breakdown by risk category (bar chart) → Recommended actions list → Download report buttons (Full Report, Employer Redacted Report) → Share score button
   - Key UI components: Score display, bar chart, action list, download buttons, share button
   - Primary user action: Download the PDF report or share the score
   - States: Loading (generating report, loading spinner), Success (report generated, download links active), Error (report generation failed, retry button)

5. **Dashboard Screen (Authenticated Users)**
   - Purpose: Show user’s scan history and quick access to past reports
   - Wireframe structure (top to bottom): Header with logo, navigation, user profile dropdown → Welcome message with user’s name → Stats cards (total audits, average score, total flagged items removed) → List of past audits (date, score, number of flagged items, view report button) → New audit button (floating action button on mobile, top right on desktop)
   - Key UI components: Stats cards, audit list, new audit button, profile dropdown, floating action button
   - Primary user action: View past audits or start a new audit
   - States: Loading (loading audit history), Empty (no past audits, "Start your first audit" message with CTA button), Error (failed to load history, retry button)