export interface User {
  user_id: string;
  email: string;
  full_name: string;
  auth_provider: "email" | "google";
  created_at: string;
}

export type ScanStatus = "pending" | "processing" | "completed" | "failed";

export interface Audit {
  audit_id: string;
  user_id: string;
  upload_date: string;
  scan_status: ScanStatus;
  digital_hygiene_score: number | null;
  total_items_scanned: number | null;
  total_flagged_items: number | null;
  archive_file_path: string;
}

export type RiskLevel = "high" | "medium" | "safe";

export type RiskCategory =
  | "workplace_hostility"
  | "aggressive_debates"
  | "profanity"
  | "substance_references"
  | "discriminatory_language"
  | "unprofessional_behavior"
  | "confidential_info_sharing"
  | "fake_news"
  | "extremist_content"
  | "inappropriate_media"
  | "privacy_violations"
  | "dishonest_behavior"
  | "violent_threats";

export type UserAction = "pending" | "reviewed" | "deleted" | "untagged";

export interface FlaggedItem {
  flagged_item_id: string;
  audit_id: string;
  content_text?: string;
  media_url?: string;
  original_platform: "facebook" | "instagram" | "twitter" | "linkedin" | "tiktok";
  post_date: string;
  risk_category: RiskCategory;
  risk_level: RiskLevel;
  user_action: UserAction;
}

export interface Report {
  report_id: string;
  audit_id: string;
  report_type: "full" | "employer_redacted";
  pdf_url: string;
  generated_at: string;
  expires_at: string;
}
