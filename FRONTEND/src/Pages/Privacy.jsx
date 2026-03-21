import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Lock, EyeOff, ShieldCheck, ArrowLeft, Database,
  UserX, Globe, AlertTriangle, Server, RefreshCw,
  Mail, CheckCircle2, Key, Fingerprint, FileSearch
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.55, delay, type: 'spring', stiffness: 90 }}
    className={className}
  >
    {children}
  </motion.div>
);

const PolicyCard = ({ icon, title, color, children }) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all`}>
    <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
    <h3 className="font-black text-slate-800 text-base mb-2">{title}</h3>
    <div className="text-slate-500 text-xs leading-relaxed space-y-2">{children}</div>
  </div>
);

const privacyPillars = [
  {
    icon: <Lock size={20} className="text-indigo-600" />,
    color: 'bg-indigo-50',
    title: 'End-to-End Encryption',
    content: (
      <>
        <p>All data transmitted between your browser and our servers is protected using TLS 1.3 encryption. Passwords are hashed using bcrypt with adaptive salting before storage — your actual password is never stored anywhere.</p>
        <p>JWT tokens used for authentication are signed with a strong HS256 secret and expire after a configurable session period.</p>
      </>
    )
  },
  {
    icon: <EyeOff size={20} className="text-purple-600" />,
    color: 'bg-purple-50',
    title: 'Anonymity by Default',
    content: (
      <>
        <p>When you submit a complaint, your identity is hidden from faculty dashboards. Faculty see only an anonymized complaint reference number — never your name, email, or student ID.</p>
        <p>Only administrators with elevated permissions can access identifying information, and only for audit and escalation purposes.</p>
      </>
    )
  },
  {
    icon: <Database size={20} className="text-blue-600" />,
    color: 'bg-blue-50',
    title: 'Minimal Data Collection',
    content: (
      <>
        <p>We collect only what's necessary: your name, email, institutional ID, and complaint content. We do not collect browsing history, device fingerprints, or third-party tracking data.</p>
        <p>Media uploads (complaint attachments, Lost & Found photos) are stored on Cloudinary with access-controlled URLs that expire.</p>
      </>
    )
  },
  {
    icon: <UserX size={20} className="text-red-500" />,
    color: 'bg-red-50',
    title: 'No Third-Party Data Selling',
    content: (
      <>
        <p>Your personal data is never sold to, rented to, or shared with any third party for commercial purposes. We have no advertising partners.</p>
        <p>Aggregated, non-identifiable statistics (e.g., "X complaints resolved this month") may be used for institutional reporting with no individual linkage.</p>
      </>
    )
  },
  {
    icon: <Server size={20} className="text-emerald-600" />,
    color: 'bg-emerald-50',
    title: 'Secure Infrastructure',
    content: (
      <>
        <p>CampusBridge is hosted on secure cloud infrastructure with automated security patches, CORS restrictions, and API rate-limiting to prevent abuse.</p>
        <p>Rate limiting (via express-rate-limit) prevents brute-force attacks on login endpoints. Helmet.js headers harden HTTP security.</p>
      </>
    )
  },
  {
    icon: <RefreshCw size={20} className="text-amber-600" />,
    color: 'bg-amber-50',
    title: 'Data Retention & Deletion',
    content: (
      <>
        <p>Complaint data is retained for the duration of your active enrollment at the institution. Upon account deactivation or graduation cycle completion, data is archived and anonymized.</p>
        <p>You can request manual deletion of your account and data by contacting the admin team. Requests are processed within 30 days.</p>
      </>
    )
  },
];

const dataTypes = [
  { type: 'Account Information', examples: 'Name, email, student/faculty ID, password (hashed)', retention: 'Active enrollment period', sensitive: false },
  { type: 'Complaint Content', examples: 'Title, description, attachments, category, priority', retention: 'Graduation cycle + 2 years', sensitive: false },
  { type: 'Lost & Found Data', examples: 'Item photos, found location, return details', retention: '1 year post-resolution', sensitive: false },
  { type: 'Authentication Logs', examples: 'Login timestamps, JWT session data, IP address', retention: '90 days', sensitive: false },
  { type: 'Email Communications', examples: 'Notification emails, OTP records', retention: '6 months', sensitive: false },
];

const userRights = [
  { icon: <FileSearch size={18} className="text-indigo-600" />, right: 'Right to Access', desc: 'Request a full copy of all personal data we hold about you at any time.' },
  { icon: <RefreshCw size={18} className="text-blue-600" />, right: 'Right to Rectification', desc: 'Request correction of any inaccurate or incomplete data held about you.' },
  { icon: <UserX size={18} className="text-red-500" />, right: 'Right to Erasure', desc: 'Request deletion of your personal data, subject to legal retention requirements.' },
  { icon: <Key size={18} className="text-amber-600" />, right: 'Right to Data Portability', desc: 'Receive your data in a structured, machine-readable format upon request.' },
  { icon: <Fingerprint size={18} className="text-emerald-600" />, right: 'Right to Object', desc: 'Object to specific data processing activities where we rely on legitimate interest.' },
];

const Privacy = () => {
  return (
    <div className="w-full bg-white min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-purple-50 rounded-full blur-3xl opacity-50 translate-x-[-20%] translate-y-[-20%]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50 translate-x-[20%] translate-y-[20%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">

        {/* Hero */}
        <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-5">
            <ShieldCheck size={14} /> Privacy Guaranteed · March 2026
          </div>
          <h1 className="text-5xl font-black text-slate-800 leading-tight tracking-tight mb-4">
            Your Privacy.<br />
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Commitment.</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl mx-auto">
            CampusBridge is architected around privacy, not just compliant with it. We explain exactly what data we collect, why we collect it, how we protect it, and how you control it.
          </p>
        </FadeIn>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {[
            { icon: <Lock size={16} className="text-indigo-600" />, label: 'TLS 1.3 Encrypted', bg: 'bg-indigo-50' },
            { icon: <EyeOff size={16} className="text-purple-600" />, label: 'Anonymous Complaints', bg: 'bg-purple-50' },
            { icon: <Database size={16} className="text-blue-600" />, label: 'Minimal Data Stored', bg: 'bg-blue-50' },
            { icon: <Globe size={16} className="text-emerald-600" />, label: 'No Data Selling', bg: 'bg-emerald-50' },
          ].map((t, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-8 h-8 ${t.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{t.icon}</div>
                <p className="text-xs font-bold text-slate-700">{t.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Privacy Pillars */}
        <FadeIn className="mb-16">
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">How We Protect Your Data</h2>
          <p className="text-slate-500 text-sm text-center mb-10">Six pillars of privacy built into every layer of the platform.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {privacyPillars.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <PolicyCard icon={p.icon} title={p.title} color={p.color}>{p.content}</PolicyCard>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Data Table */}
        <FadeIn className="mb-16">
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">What Data We Collect</h2>
          <p className="text-slate-500 text-sm text-center mb-8">A transparent breakdown of every data type we store and why.</p>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="text-left px-6 py-4">Data Type</th>
                    <th className="text-left px-6 py-4">Examples</th>
                    <th className="text-left px-6 py-4">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTypes.map((d, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 text-xs whitespace-nowrap">{d.type}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-xs">{d.examples}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg">{d.retention}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        {/* User Rights */}
        <FadeIn className="mb-16">
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Your Rights Over Your Data</h2>
          <p className="text-slate-500 text-sm text-center mb-8">Under applicable privacy law, you have full control over your personal information.</p>
          <div className="space-y-3">
            {userRights.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100">{r.icon}</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{r.right}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Cookies */}
        <FadeIn className="mb-14">
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-3xl border border-indigo-100 p-8">
            <h2 className="text-xl font-black text-slate-800 mb-3">Cookies & Session Storage</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              CampusBridge uses <strong>localStorage</strong> and session-level JWT tokens — not persistent cookies — to manage your authenticated session. We do not use third-party tracking cookies, Google Analytics, or advertising SDKs.
            </p>
            <ul className="space-y-2">
              {[
                'Session tokens expire automatically after inactivity',
                'No cookies are planted on your device by default',
                'No cross-site tracking of any kind',
                'Media CDN requests (Cloudinary) may set performance-level cache headers only',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <CheckCircle2 size={13} className="text-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        {/* Contact */}
        <FadeIn className="mb-12">
          <div className="bg-indigo-600 rounded-3xl p-7 text-white flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <p className="font-black text-base">Privacy Questions?</p>
                <p className="text-indigo-200 text-xs mt-0.5">Our data protection team responds within 48 hours. All requests are handled confidentially.</p>
              </div>
            </div>
            <Link to="/contact" className="flex-shrink-0 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition">
              Contact DPO
            </Link>
          </div>
        </FadeIn>

        <FadeIn className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
            <ArrowLeft size={16} /> Back to Homepage
          </Link>
        </FadeIn>
      </div>
    </div>
  );
};

export default Privacy;
