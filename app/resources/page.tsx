import { Files, BookOpen, Video, FileText, ExternalLink } from "lucide-react";

const resources = [
  {
    category: "Training Materials",
    icon: BookOpen,
    color: "#143637",
    items: [
      { title: "Advocate Onboarding Guide", type: "PDF", size: "2.4 MB", desc: "Complete walkthrough for new advocate orientation and first 30 days" },
      { title: "Trauma-Informed Care Framework", type: "PDF", size: "1.1 MB", desc: "EMA's core methodology for compassionate advocacy" },
      { title: "Session Documentation Best Practices", type: "PDF", size: "890 KB", desc: "How to write effective case notes and session summaries" },
    ]
  },
  {
    category: "Program Tracks",
    icon: FileText,
    color: "#eb462d",
    items: [
      { title: "Prenatal Track Curriculum", type: "PDF", size: "3.2 MB", desc: "12-week prenatal advocacy curriculum and milestone guide" },
      { title: "Postpartum Support Track", type: "PDF", size: "2.8 MB", desc: "Resources for moms in the first year post-birth" },
      { title: "Teen Mom Specialized Track", type: "PDF", size: "1.9 MB", desc: "Age-appropriate materials for adolescent mothers" },
    ]
  },
  {
    category: "Video Training",
    icon: Video,
    color: "#f2a035",
    items: [
      { title: "Active Listening Techniques", type: "Video", size: "45 min", desc: "Moodle module: Building trust through reflective listening" },
      { title: "Goal Setting with Clients", type: "Video", size: "32 min", desc: "Moodle module: SMART goals for advocacy sessions" },
      { title: "Cultural Competency in Advocacy", type: "Video", size: "58 min", desc: "Moodle module: Serving diverse populations effectively" },
    ]
  },
];

export default function ResourcesPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
          ✦ Demo — file downloads inactive
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-8">Training materials, program tracks, and reference documents for advocates and coordinators</p>

      <div className="space-y-8">
        {resources.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.category}>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" style={{ color: section.color }} />
                {section.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group cursor-not-allowed">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${section.color}18` }}>
                        <Files className="w-5 h-5" style={{ color: section.color }} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-300">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {item.type}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{item.title}</div>
                    <div className="text-xs text-gray-400 mb-3 leading-relaxed">{item.desc}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">{item.size}</span>
                      <span className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors">demo only</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 border border-amber-200 bg-amber-50 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#f2a03520" }}>
            <BookOpen className="w-4 h-4" style={{ color: "#f2a035" }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-800 mb-1">Moodle LMS Integration</div>
            <div className="text-xs text-amber-700 leading-relaxed">
              In the production environment, advocates complete required training through Moodle LMS before being activated.
              Coordinator dashboards show Moodle completion status for each advocate, and new advocates cannot be paired
              until onboarding modules are complete.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
