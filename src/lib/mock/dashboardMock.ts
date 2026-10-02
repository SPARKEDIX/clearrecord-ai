import type { Audit, User } from "@/types/models";

export const MOCK_USER: User = {
  user_id: "demo-user-1",
  email: "demo@clearrecord.ai",
  full_name: "Kartik",
  auth_provider: "google",
  created_at: "2026-10-01T00:00:00.000Z"
};

export const MOCK_AUDITS: Audit[] = [
  {
    audit_id: "audit-1",
    user_id: "demo-user-1",
    upload_date: new Date(Date.now() - 2 * 864e5).toISOString(),
    scan_status: "completed",
    digital_hygiene_score: 82,
    total_items_scanned: 1240,
    total_flagged_items: 14,
    archive_file_path: "audits/demo/twitter_archive.zip"
  },
  {
    audit_id: "audit-2",
    user_id: "demo-user-1",
    upload_date: new Date(Date.now() - 9 * 864e5).toISOString(),
    scan_status: "completed",
    digital_hygiene_score: 64,
    total_items_scanned: 2310,
    total_flagged_items: 37,
    archive_file_path: "audits/demo/facebook_archive.zip"
  },
  {
    audit_id: "audit-3",
    user_id: "demo-user-1",
    upload_date: new Date(Date.now() - 21 * 864e5).toISOString(),
    scan_status: "completed",
    digital_hygiene_score: 91,
    total_items_scanned: 860,
    total_flagged_items: 5,
    archive_file_path: "audits/demo/instagram_archive.zip"
  }
];
