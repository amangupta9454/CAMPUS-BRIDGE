import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, BookOpen, CheckCircle2, ArrowLeft, ChevronDown,
  FileText, UserCheck, AlertTriangle, Lock, Scale, Ban, Globe,
  MessageSquare, RefreshCw, Clock
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

const AccordionItem = ({ num, title, children, isOpen, toggle }) => (
  <div className={`rounded-2xl border overflow-hidden transition-all ${isOpen ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-slate-100'}`}>
    <button
      onClick={toggle}
      className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors ${isOpen ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'}`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{num}</span>
        <span className={`font-bold text-sm ${isOpen ? 'text-indigo-800' : 'text-slate-800'}`}>{title}</span>
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
        <ChevronDown size={17} className={isOpen ? 'text-indigo-600' : 'text-slate-400'} />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-5 pt-2 text-slate-600 text-sm leading-relaxed border-t border-indigo-100 space-y-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const termsSections = [
  {
    num: '01',
    icon: <FileText size={20} className="text-indigo-600" />,
    title: 'Acceptance of Terms',
    content: (
      <>
        <p>By accessing or using CampusBridge — the campus complaint resolution platform — you unconditionally agree to these Terms and Conditions. These terms apply to all users including students, faculty members, and administrative staff of affiliated educational institutions.</p>
        <p>If you are under 18, you must have the express consent of a parent or guardian before using this platform. Continued use after any update to these terms constitutes your acceptance of the revised terms.</p>
        <div className="flex items-start gap-2 bg-indigo-50 rounded-xl p-3">
          <CheckCircle2 size={15} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-700 font-medium">These Terms were last updated: March 2026 and comply with standard Indian IT regulation guidelines.</p>
        </div>
      </>
    )
  },
  {
    num: '02',
    icon: <UserCheck size={20} className="text-emerald-600" />,
    title: 'Account Registration & Security',
    content: (
      <>
        <p>You must provide accurate, complete, and current registration information. Your account is personal and non-transferable. You are responsible for maintaining the confidentiality of your credentials.</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
          <li>Use your official institution email address</li>
          <li>Do not share login credentials with anyone</li>
          <li>Immediately report any suspected unauthorized access</li>
          <li>Log out from shared devices after every session</li>
        </ul>
        <p>CampusBridge reserves the right to deactivate accounts that violate these provisions without prior notice.</p>
      </>
    )
  },
  {
    num: '03',
    icon: <AlertTriangle size={20} className="text-amber-600" />,
    title: 'Complaint Submission Policy',
    content: (
      <>
        <p>Complaints submitted on CampusBridge must be genuine, factual, and related to legitimate campus grievances. The following are strictly prohibited:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
          <li>Filing false, misleading, or duplicate complaints</li>
          <li>Submitting complaints intended to harass faculty or staff</li>
          <li>Using the protest system for political or personal vendettas</li>
          <li>Flooding the system with spam submissions</li>
        </ul>
        <p>Violations may result in permanent account suspension and escalation to institutional disciplinary authorities.</p>
      </>
    )
  },
  {
    num: '04',
    icon: <Lock size={20} className="text-purple-600" />,
    title: 'Anonymity & Privacy',
    content: (
      <>
        <p>CampusBridge is built on a privacy-first principle. Student identities are never directly exposed to faculty dashboards. All complaint references visible to faculty use anonymized internal IDs.</p>
        <p>However, note the following:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
          <li>Administrative staff with elevated roles may access identifying information for audit purposes</li>
          <li>Anonymity does not protect against disciplinary action for abuse of the platform</li>
          <li>Legal orders may compel disclosure of any data stored in our systems</li>
        </ul>
        <p>Review our <Link to="/privacy" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</Link> for comprehensive data handling information.</p>
      </>
    )
  },
  {
    num: '05',
    icon: <Clock size={20} className="text-blue-600" />,
    title: 'SLA & Resolution Timelines',
    content: (
      <>
        <p>Service Level Agreements (SLAs) define the expected resolution timelines based on complaint priority:</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { priority: 'High', time: '24 hrs', color: 'bg-red-50 text-red-700 border-red-200' },
            { priority: 'Medium', time: '72 hrs', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { priority: 'Low', time: '168 hrs', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          ].map(s => (
            <div key={s.priority} className={`rounded-xl border px-3 py-2 ${s.color}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider">{s.priority}</p>
              <p className="font-black text-lg">{s.time}</p>
            </div>
          ))}
        </div>
        <p>Delays beyond SLA thresholds trigger automatic escalation alerts to the administration. Faculty are contractually expected to respond within these windows.</p>
      </>
    )
  },
  {
    num: '06',
    icon: <Ban size={20} className="text-red-600" />,
    title: 'Prohibited Activities',
    content: (
      <>
        <p>The following activities are expressly prohibited on CampusBridge:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
          <li>Attempting to bypass authentication or access others' accounts</li>
          <li>Reverse engineering, scraping, or automating API calls</li>
          <li>Uploading malicious files disguised as complaint attachments</li>
          <li>Using the platform for commercial solicitation</li>
          <li>Impersonating faculty, students, or administrative staff</li>
          <li>Coordinating with others to file coordinated false complaints</li>
        </ul>
        <p>Violations may be reported to law enforcement per applicable Indian IT Act provisions.</p>
      </>
    )
  },
  {
    num: '07',
    icon: <RefreshCw size={20} className="text-teal-600" />,
    title: 'Modifications & Updates',
    content: (
      <>
        <p>CampusBridge reserves the right to modify, suspend, or discontinue any part of the service at any time without prior notice. We may update these Terms periodically to reflect:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
          <li>Changes in applicable law or regulation</li>
          <li>New platform features or workflows</li>
          <li>Internal policy adjustments from institutional management</li>
          <li>Security requirement updates</li>
        </ul>
        <p>Using the platform after any modification constitutes acceptance of updated terms.</p>
      </>
    )
  },
  {
    num: '08',
    icon: <Scale size={20} className="text-slate-600" />,
    title: 'Governing Law & Dispute Resolution',
    content: (
      <>
        <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with CampusBridge shall be resolved as follows:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
          <li>First, through internal institutional grievance redressal mechanisms</li>
          <li>Then via formal arbitration under the Arbitration and Conciliation Act, 1996</li>
          <li>Subject to the exclusive jurisdiction of courts in Uttar Pradesh, India</li>
        </ul>
        <p>For queries, write to our support team via the <Link to="/contact" className="text-indigo-600 font-semibold hover:underline">Contact page</Link>.</p>
      </>
    )
  },
];

const Terms = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="w-full bg-white min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50 translate-x-[20%] translate-y-[-20%]" />
        <div className="absolute bottom-0 left-0 w-[35%] h-[35%] bg-purple-50 rounded-full blur-3xl opacity-40 translate-x-[-20%] translate-y-[20%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">

        {/* Hero */}
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-5">
            <ShieldAlert size={14} /> Last Updated: March 2026
          </div>
          <h1 className="text-5xl font-black text-slate-800 leading-tight tracking-tight mb-4">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Conditions</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            These terms govern your access and use of the CampusBridge complaint resolution platform. Please read carefully — by using any part of this platform, you agree to be bound by these terms.
          </p>
        </FadeIn>

        {/* Quick summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {[
            { label: 'Sections', val: '8', color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Effective Date', val: 'Mar 2026', color: 'text-purple-600 bg-purple-50' },
            { label: 'Jurisdiction', val: 'India (UP)', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'SLA Guarantee', val: '24–168hr', color: 'text-amber-600 bg-amber-50' },
          ].map((c, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <p className={`text-lg font-black ${c.color.split(' ')[0]}`}>{c.val}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{c.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Accordion */}
        <FadeIn delay={0.1} className="space-y-3">
          {termsSections.map((sec, i) => (
            <AccordionItem
              key={i}
              num={sec.num}
              title={sec.title}
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {sec.content}
            </AccordionItem>
          ))}
        </FadeIn>

        {/* Disclaimer */}
        <FadeIn delay={0.2} className="mt-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">Important Disclaimer</p>
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                These Terms are provided for informational purposes and govern platform use within affiliated institutions. CampusBridge is not liable for decisions made by institutional administration based on complaint data. All disciplinary actions remain the sole responsibility of the institution.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Back link */}
        <FadeIn delay={0.3} className="mt-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
            <ArrowLeft size={16} /> Back to Homepage
          </Link>
        </FadeIn>
      </div>
    </div>
  );
};

export default Terms;
