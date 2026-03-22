import { Settings, Bell, Shield, Users, Database, Palette } from "lucide-react";

const sections = [
  {
    icon: Users,
    title: "User Management",
    desc: "Manage roles, permissions, and user access across the organization",
    fields: [
      { label: "Default Role", value: "Advocate" },
      { label: "Invite Link", value: "ema-demo.vercel.app/join/abc123" },
      { label: "SSO Provider", value: "Google Workspace" },
    ]
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Configure email, SMS, and in-app notification preferences",
    fields: [
      { label: "Session Reminders", value: "24 hours before" },
      { label: "Note Due Alerts", value: "48 hours after session" },
      { label: "Pairing Alerts", value: "Enabled" },
    ]
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    desc: "HIPAA-aligned data handling, audit logs, and retention policies",
    fields: [
      { label: "Data Retention", value: "7 years" },
      { label: "Audit Logs", value: "Enabled" },
      { label: "2FA Required", value: "For coordinators+" },
    ]
  },
  {
    icon: Database,
    title: "Integrations",
    desc: "Connect Moodle LMS, email providers, and external data sources",
    fields: [
      { label: "Moodle LMS", value: "Connected (demo disabled)" },
      { label: "Email Provider", value: "SendGrid" },
      { label: "SMS Provider", value: "Twilio" },
    ]
  },
];

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
          ✦ Demo — changes inactive
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-8">Platform configuration for Every Mother's Advocate</p>

      <div className="space-y-5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#14363718" }}>
                  <Icon className="w-5 h-5" style={{ color: "#143637" }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">{section.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{section.desc}</p>
                </div>
              </div>
              <div className="space-y-3 border-t border-gray-100 pt-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{field.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{field.value}</span>
                      <button className="text-xs text-gray-300 border border-gray-200 rounded-md px-2 py-1 cursor-not-allowed" disabled>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border border-gray-200 rounded-xl p-5 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#eb462d18" }}>
            <Palette className="w-5 h-5" style={{ color: "#eb462d" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Branding</h2>
            <p className="text-xs text-gray-400 mt-0.5">Organization logo, colors, and email templates</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-gray-200" style={{ background: "#143637" }} />
            <span className="text-xs text-gray-500">Primary — #143637</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-gray-200" style={{ background: "#eb462d" }} />
            <span className="text-xs text-gray-500">Accent — #eb462d</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-gray-200" style={{ background: "#f2a035" }} />
            <span className="text-xs text-gray-500">Tertiary — #f2a035</span>
          </div>
        </div>
      </div>
    </div>
  );
}
