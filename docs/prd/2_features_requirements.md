# Features & Requirements

### MoSCoW Feature List
#### Must-Have
- **Social Media Archive Upload**
  - User triggers upload via drag-and-drop zone or file picker button on the upload screen
  - System accepts standard social media archive formats (JSON, CSV, ZIP) from Facebook, Instagram, Twitter/X, LinkedIn, and TikTok
  - System validates file size (max 2GB per upload) and format, displays a clear error message for invalid files with a retry option
  - System encrypts uploaded archives at rest in Firebase Storage
- **AI-Powered Risk Scanning**
  - User initiates scan immediately after successful file upload
  - System scans all uploaded content against 13 predefined hiring-risk categories: workplace hostility, aggressive debates, profanity, substance references, discriminatory language, unprofessional behavior, confidential information sharing, fake news dissemination, extremist content, inappropriate media, privacy violations, dishonest behavior, and violent threats
  - System categorizes each flagged item as High, Medium, or Safe risk based on severity and contextual analysis
  - System displays real-time scan progress with an animated progress bar and estimated time remaining
- **Risk Review Feed**
  - User accesses the review feed automatically after scan completion
  - System displays all flagged items sorted by risk level (High → Medium → Safe) with full context (post text, media preview, original platform, date posted)
  - User can take action on each item: mark as reviewed, delete (if linked to a connected account), or untag/flag for manual follow-up
  - System updates the Digital Hygiene Score in real-time as the user takes action on items
- **Digital Hygiene Score & Report Generation**
  - System calculates a 0-100 Digital Hygiene Score based on the number and severity of flagged items, user actions taken, and total content volume
  - User can view a breakdown of their score by individual risk category
  - User can download a shareable PDF report of their full audit results, score, and recommended actions

#### Should-Have
- **User Account Management**
  - User can create an account using email/password or Google Sign-In
  - Authenticated users can log in to access past audits and saved reports
  - User can permanently delete their account and all associated data
- **Multi-Platform Archive Support**
  - System correctly parses platform-specific archive formats for 5+ major social platforms (Facebook, Instagram, Twitter/X, LinkedIn, TikTok) to extract posts, comments, media, and tags
- **Scan History Dashboard**
  - Authenticated users can view a list of all past audits, including upload date, final score, and number of flagged items
  - User can re-run a scan on a previously uploaded archive to get updated risk assessments
- **Risk Category Filtering**
  - User can filter the review feed by risk category (e.g., only show profanity-related items)
  - User can filter the review feed by risk level (High, Medium, Safe)

#### Could-Have
- **Bulk Action Support**
  - User can select multiple items in the review feed and apply bulk actions (mark as reviewed, delete, untag) to reduce manual work
- **Personalized Recommendations**
  - System generates actionable, personalized recommendations for improving the user’s Digital Hygiene Score based on their specific flagged content
- **Employer-Facing Redacted Report**
  - User can generate a redacted version of the PDF report that only includes the overall score and high-level risk category breakdown, with no specific post details, for sharing with employers
- **Scheduled Content Deletion**
  - User can schedule deletion of risky content for a future date if they want to review it further before removing

### Data to Store
| Entity Name | Field Name | Data Type | Required | Key Status | Purpose |
|-------------|------------|-----------|----------|------------|---------|
| User | user_id | UUID | Yes | Primary Key | Unique user identifier |
| User | email | VARCHAR(255) | Yes | Unique | User login email |
| User | full_name | VARCHAR(255) | Yes | No | User display name |
| User | auth_provider | ENUM('email', 'google') | Yes | No | Authentication provider used |
| User | password_hash | VARCHAR(255) | No | No | Hashed password for email auth users |
| User | created_at | TIMESTAMP | Yes | No | Account creation timestamp |
| Audit | audit_id | UUID | Yes | Primary Key | Unique audit identifier |
| Audit | user_id | UUID | Yes | Foreign Key (User.user_id) | Owner of the audit |
| Audit | upload_date | TIMESTAMP | Yes | No | Date archive was uploaded |
| Audit | scan_status | ENUM('pending', 'processing', 'completed', 'failed') | Yes | No | Current scan status |
| Audit | digital_hygiene_score | INT | No | No | Final 0-100 Digital Hygiene Score |
| Audit | total_items_scanned | INT | No | No | Total content items scanned |
| Audit | total_flagged_items | INT | No | No | Total flagged items found |
| Audit | archive_file_path | VARCHAR(1024) | Yes | No | Path to uploaded archive in Firebase Storage |
| FlaggedItem | flagged_item_id | UUID | Yes | Primary Key | Unique flagged item identifier |
| FlaggedItem | audit_id | UUID | Yes | Foreign Key (Audit.audit_id) | Audit the item belongs to |
| FlaggedItem | content_text | TEXT | No | No | Text of the flagged post/comment |
| FlaggedItem | media_url | VARCHAR(1024) | No | No | URL to associated media in Firebase Storage |
| FlaggedItem | original_platform | ENUM('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok') | Yes | No | Platform the content was posted on |
| FlaggedItem | post_date | TIMESTAMP | Yes | No | Original post date |
| FlaggedItem | risk_category | ENUM('workplace_hostility', 'aggressive_debates', 'profanity', 'substance_references', 'discriminatory_language', 'unprofessional_behavior', 'confidential_info_sharing', 'fake_news', 'extremist_content', 'inappropriate_media', 'privacy_violations', 'dishonest_behavior', 'violent_threats') | Yes | No | Assigned risk category |
| FlaggedItem | risk_level | ENUM('high', 'medium', 'safe') | Yes | No | Risk severity level |
| FlaggedItem | user_action | ENUM('pending', 'reviewed', 'deleted', 'untagged') | Yes | No | Action taken by the user |
| Report | report_id | UUID | Yes | Primary Key | Unique report identifier |
| Report | audit_id | UUID | Yes | Foreign Key (Audit.audit_id) | Audit the report is for |
| Report | report_type | ENUM('full', 'employer_redacted') | Yes | No | Type of report generated |
| Report | pdf_url | VARCHAR(1024) | Yes | No | URL to generated PDF in Firebase Storage |
| Report | generated_at | TIMESTAMP | Yes | No | Report generation timestamp |
| Report | expires_at | TIMESTAMP | Yes | No | Date report is deleted (30 days post-generation) |