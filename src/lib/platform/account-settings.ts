export type BrandAccountSettingsSection = {
  value: "account" | "notifications" | "danger";
  label: string;
  title: string;
  description?: string;
  body: string;
  tone?: "default" | "danger";
};

export function getBrandAccountSettingsSections(): BrandAccountSettingsSection[] {
  return [
    {
      value: "account",
      label: "Account",
      title: "Email address",
      body: "This is the email address currently signed in to your brand account.",
    },
    {
      value: "notifications",
      label: "Notifications",
      title: "Email notifications",
      body:
        "If you are subscribed, we will email you when you have new, unread messages from creators. These notifications are included with your subscription and cannot be turned off while your account is active.",
    },
    {
      value: "danger",
      label: "Danger",
      title: "Delete account",
      description: "Permanently delete your account and all associated data.",
      body:
        "This will permanently delete your account, your campaign, and all associated data. This action cannot be undone.",
      tone: "danger",
    },
  ];
}
