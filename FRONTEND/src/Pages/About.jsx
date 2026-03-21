import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Target, Heart, Award, Users, Zap, ArrowRight,
  CheckCircle2, MessageSquare, BookOpen, Globe, Code2,
  TrendingUp, Star, Building2, Layers, Eye, Lock
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, type: 'spring', stiffness: 80 }}
    className={className}
  >
    {children}
  </motion.div>
);

const SectionBadge = ({ text, color = 'indigo' }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-${color}-50 text-${color}-700 border border-${color}-200 mb-4`}>
    <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} />
    {text}
  </div>
);

const teamMembers = [
  { name: 'Aman Gupta', role: 'Full-Stack Architect', avatar: 'AG', color: 'bg-indigo-600' },
  { name: 'Priya Sharma', role: 'UX Lead', avatar: 'PS', color: 'bg-purple-600' },
  { name: 'Rohan Singh', role: 'Backend Engineer', avatar: 'RS', color: 'bg-blue-600' },
  { name: 'Divya Patel', role: 'Database Engineer', avatar: 'DP', color: 'bg-emerald-600' },
];

const milestones = [
  { year: '2023', title: 'Problem Identified', desc: 'Students at HIET struggled to reach faculty for complaint resolution. Manual processes led to weeks-long delays.', color: 'border-indigo-400' },
  { year: 'Q1 2024', title: 'Prototype Built', desc: 'First version of CampusBridge launched internally with basic complaint submission and faculty notification.', color: 'border-purple-400' },
  { year: 'Q3 2024', title: 'Admin Module Added', desc: 'Full admin dashboard with SLA tracking, analytics, and overdue alerts brought system-wide visibility.', color: 'border-blue-400' },
  { year: '2025', title: 'Lost & Found + Scale', desc: 'Lost & Found module, email notifications, and real-time updates added. Platform expanded campus-wide.', color: 'border-emerald-400' },
  { year: 'Now', title: 'Production Ready', desc: 'Serving 1,000+ users across students, faculty, and admin with 94% complaint resolution rate and counting.', color: 'border-amber-400' },
];

const values = [
  { icon: <Eye size={22} className="text-indigo-600" />, title: 'Radical Transparency', desc: 'Every complaint is trackable from submission to closure. Students always know where their issue stands — no black boxes.', bg: 'bg-indigo-50' },
  { icon: <Lock size={22} className="text-purple-600" />, title: 'Privacy by Design', desc: "Student identities are encrypted at rest and never exposed to faculty dashboards. Anonymity isn't optional — it's the default.", bg: 'bg-purple-50' },
  { icon: <Zap size={22} className="text-amber-600" />, title: 'Speed of Resolution', desc: 'SLA timers start the moment a complaint is submitted. High-priority issues trigger instant faculty notifications within minutes.', bg: 'bg-amber-50' },
  { icon: <Heart size={22} className="text-red-500" />, title: 'Student-First Culture', desc: 'Every design decision starts with the question: how does this make life easier for a student with a real problem?', bg: 'bg-red-50' },
  { icon: <Globe size={22} className="text-emerald-600" />, title: 'Campus-Wide Coverage', desc: 'Faculty, admin, and students all operate from a single unified platform — ensuring no complaint falls through a departmental gap.', bg: 'bg-emerald-50' },
  { icon: <Code2 size={22} className="text-blue-600" />, title: 'Built to Scale', desc: 'MERN stack with optimized MongoDB queries, Cloudinary media, and stateless JWT auth — ready for multi-campus deployment.', bg: 'bg-blue-50' },
];

const stats = [
  { val: '1,000+', label: 'Active Users', icon: <Users size={20} />, color: 'text-indigo-600 bg-indigo-50' },
  { val: '94%', label: 'Resolution Rate', icon: <TrendingUp size={20} />, color: 'text-emerald-600 bg-emerald-50' },
  { val: '<24hr', label: 'Avg. Response', icon: <Zap size={20} />, color: 'text-amber-600 bg-amber-50' },
  { val: '100%', label: 'Privacy Guaranteed', icon: <ShieldCheck size={20} />, color: 'text-purple-600 bg-purple-50' },
];

const techStack = [
  { name: 'MongoDB', desc: 'NoSQL database for flexible complaint storage', tag: 'Database' },
  { name: 'Express.js', desc: 'RESTful MVC backend with JWT auth', tag: 'Backend' },
  { name: 'React + Vite', desc: 'Fast, component-driven SPA frontend', tag: 'Frontend' },
  { name: 'Node.js', desc: 'Scalable server runtime', tag: 'Runtime' },
  { name: 'Cloudinary', desc: 'Cloud media for complaint attachments & Lost & Found photos', tag: 'Media' },
  { name: 'Nodemailer', desc: 'HTML email notifications for every lifecycle event', tag: 'Notifications' },
];

const About = () => {
  return (
    <div className="w-full bg-white min-h-screen overflow-x-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[50%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50 translate-x-[-30%] translate-y-[-30%]" />
        <div className="absolute bottom-0 right-0 w-[45%] h-[40%] bg-purple-50 rounded-full blur-3xl opacity-50 translate-x-[20%] translate-y-[20%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">

        {/* ── HERO ── */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-5">
            <Building2 size={14} /> About CampusBridge
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 leading-tight tracking-tight mb-5">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Every Voice</span><br />on Campus
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-2xl mx-auto">
            CampusBridge is a full-stack complaint management platform designed to eliminate the communication gap between students, faculty, and administration — ensuring every issue is heard, tracked, and resolved.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link to="/student/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-sm">
              Get Started <ArrowRight size={15} />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-slate-700 font-bold px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition-all text-sm">
              Contact Team
            </Link>
          </div>
        </FadeIn>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-28">
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all hover:-translate-y-1 text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-black text-slate-800">{s.val}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ── MISSION & VISION ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-28">
          {[
            {
              icon: <Target size={26} className="text-indigo-600" />,
              badge: 'Our Mission',
              color: 'indigo',
              title: 'Faster Resolutions, Fairer Campus',
              desc: "CampusBridge's mission is to make campus grievance resolution instant, transparent, and fair. We believe that when a student raises a concern, the institution's response should be swift and accountable — not lost in email chains or notice boards.",
              points: ['Sub-24-hour SLA enforcement', 'Multi-tier escalation (Student → Faculty → Admin)', 'Real-time status updates for every complaint'],
            },
            {
              icon: <Star size={26} className="text-purple-600" />,
              badge: 'Our Vision',
              color: 'purple',
              title: 'A Campus Where No Voice Goes Unheard',
              desc: "We envision a future where campus institutions are no longer black boxes. CampusBridge will expand to every college, university, and institution — making transparent, data-driven complaint management the standard.",
              points: ['Multi-campus deployment capability', 'AI-powered complaint routing (coming soon)', 'Open-source community roadmap'],
            }
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className={`bg-gradient-to-br from-${item.color}-50/60 to-white rounded-3xl border border-${item.color}-100 p-8 h-full hover:shadow-lg transition-all`}>
                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-100 flex items-center justify-center mb-5`}>{item.icon}</div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-${item.color}-100 text-${item.color}-700 mb-3`}>{item.badge}</div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{item.desc}</p>
                <ul className="space-y-2">
                  {item.points.map((pt, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <CheckCircle2 size={14} className={`text-${item.color}-500 flex-shrink-0`} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ── TIMELINE ── */}
        <FadeIn className="mb-28">
          <div className="text-center mb-12">
            <SectionBadge text="Our Journey" color="blue" />
            <h2 className="text-3xl font-black text-slate-800">From Idea to Institution</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">How CampusBridge evolved from a student pain-point into a production-grade campus management platform.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-purple-200 to-emerald-200 transform md:-translate-x-px" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative flex md:items-center gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 pl-16 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`bg-white rounded-2xl border-l-4 ${m.color} shadow-sm p-5 hover:shadow-md transition-all`}>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.year}</span>
                      <h4 className="font-black text-slate-800 mt-1 text-base">{m.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed mt-2">{m.desc}</p>
                    </div>
                  </div>
                  {/* Center dot */}
                  <div className="absolute left-4 md:left-1/2 top-5 w-4 h-4 rounded-full bg-white border-2 border-indigo-400 shadow-md transform md:-translate-x-2" />
                  {/* Empty opposing side */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── VALUES ── */}
        <FadeIn className="mb-28">
          <div className="text-center mb-12">
            <SectionBadge text="Core Values" color="purple" />
            <h2 className="text-3xl font-black text-slate-800">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all"
              >
                <div className={`w-11 h-11 ${v.bg} rounded-xl flex items-center justify-center mb-4`}>{v.icon}</div>
                <h4 className="font-black text-slate-800 mb-2">{v.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* ── TECH STACK ── */}
        <FadeIn className="mb-28">
          <div className="text-center mb-12">
            <SectionBadge text="Technology" color="blue" />
            <h2 className="text-3xl font-black text-slate-800">Built With the Best Stack</h2>
            <p className="text-slate-500 text-sm mt-2">Full MERN architecture with cloud-native services for production reliability.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded">{t.tag}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* ── TEAM ── */}
        <FadeIn className="mb-24">
          <div className="text-center mb-12">
            <SectionBadge text="Team" color="indigo" />
            <h2 className="text-3xl font-black text-slate-800">The People Behind It</h2>
            <p className="text-slate-500 text-sm mt-2">A passionate team from HIET dedicated to solving real campus problems.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {teamMembers.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center hover:shadow-md transition-all"
              >
                <div className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-3 shadow-md`}>
                  {m.avatar}
                </div>
                <p className="font-black text-slate-800 text-sm">{m.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{m.role}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* ── CTA ── */}
        <FadeIn>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-3">Ready to Join?</p>
              <h2 className="text-3xl font-black mb-4">Your Complaint Deserves a Resolution</h2>
              <p className="text-indigo-100 text-sm mb-8 max-w-lg mx-auto">Register today and experience a campus where every voice is heard, every issue is tracked, and every complaint finds closure.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/student/register" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition text-sm shadow-lg">
                  Student Registration <ArrowRight size={15} />
                </Link>
                <Link to="/faculty/register" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm">
                  Faculty Portal
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
};

export default About;
