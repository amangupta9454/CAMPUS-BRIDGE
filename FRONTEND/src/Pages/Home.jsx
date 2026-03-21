import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, Users, ArrowRight, CheckCircle2, User, Activity, Plus, Minus } from 'lucide-react';
import GlowCard from '../Components/GlowCard';



// Accordion Item for FAQ with AnimatePresence
const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden mb-3">
      <button 
        onClick={onClick}
        className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 text-sm hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
           {question}
        </div>
        <div className={`p-1 rounded-lg ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'} transition-colors`}>
           {isOpen ? <Minus size={16}/> : <Plus size={16}/>}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-1 text-slate-500 text-xs leading-relaxed border-t border-slate-50 pr-12">
               {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [openFaq, setOpenFaq] = useState(null);
  
  // Parallax Transform Computations
  const bgY = useTransform(scrollY, [0, 800], [0, 150]);
  const heroTextY = useTransform(scrollY, [0, 500], [0, 60]);
  const logoY = useTransform(scrollY, [0, 800], [0, -80]);
  const statsScale = useTransform(scrollY, [400, 800], [0.96, 1]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="w-full relative overflow-hidden bg-white">
      
      {/* Dynamic Background Elements with Parallax */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-100/40 to-transparent rounded-full blur-3xl opacity-70 z-0"
      ></motion.div>
      <motion.div 
        style={{ y: useTransform(scrollY, [0, 1000], [0, 200]) }}
        className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-purple-100/40 to-transparent rounded-full blur-3xl opacity-70 z-0"
      ></motion.div>

      {/* Grid Pattern Mesh overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] z-0"></div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between z-10">
        <motion.div 
          style={{ y: heroTextY }}
          className="md:w-1/2 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold shadow-sm">
            <span className="flex w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            CampusBridge v2.0 is Live
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
            Resolve Issues <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%] animate-gradient">
              Fairly & Fast.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-slate-500 max-w-lg leading-relaxed">
            The ultimate unified platform bridging the gap between students and faculty. Track, manage, and resolve campus complaints with 100% transparency.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => navigate('/student/login')}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/faculty/login')}
              className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold transition-all"
            >
              Faculty Portal
            </button>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center gap-4 pt-6 text-sm font-semibold text-slate-500">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-indigo-${(i+1)*100} flex items-center justify-center shadow-sm`}>
                   <User size={14} className="text-white"/>
                 </div>
               ))}
             </div>
             <p>Used by 1,000+ students & faculties</p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          style={{ y: logoY }}
          className="md:w-1/2 mt-16 md:mt-0 flex justify-center items-center relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* Floating Logo Framework */}
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10 w-[85%] h-[85%] p-6 flex items-center justify-center bg-white rounded-3xl shadow-2xl border border-slate-100"
            >
               <img src="/logo.png" alt="CampusBridge Logo" className="w-[85%] h-[85%] object-contain" />
            </motion.div>
            
            {/* Background 3D accents behind logo */}
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-indigo-200 rounded-full scale-105 opacity-60"
            ></motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 hidden sm:flex z-20"
            >
               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle2 size={20}/></div>
               <div>
                  <p className="font-bold text-slate-800 text-sm">Issue Resolved</p>
                  <p className="text-xs text-slate-400">2 mins ago</p>
               </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Analytics/Stats Banner */}
      <motion.section 
        style={{ scale: statsScale }}
        className="py-16 bg-slate-900 text-white relative z-10 origin-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
           {[
             { val: "94%", label: "Resolution Rate" },
             { val: "24hrs", label: "Average Response" },
             { val: "5000+", label: "Active Users" },
             { val: "100%", label: "Anonymity Guaranteed" }
           ].map((stat, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity:0, y:20 }} 
               whileInView={{ opacity:1, y:0 }} 
               viewport={{ once: true }}
               transition={{ delay: i*0.1 }}
               className="space-y-1"
             >
               <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">{stat.val}</p>
               <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{stat.label}</p>
             </motion.div>
           ))}
        </div>
      </motion.section>

      {/* Features Section (Bento Grid Style) */}
      <section id="features" className="py-24 bg-slate-50/50 relative z-10 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Why choose CampusBridge?</motion.h2>
            <motion.p variants={itemVariants} className="text-slate-500">We've integrated a powerful matrix of solutions ensuring zero friction and absolute accessibility node constraints.</motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={28}/>, title: "100% Anonymous", desc: "Your identity remains entirely hidden from faculty, ensuring a safe reporting environment.", color: "text-indigo-600" },
              { icon: <Activity size={28}/>, title: "Real-time Tracking", desc: "Monitor exactly where your complaint is, with live status markers and resolution timelines.", color: "text-purple-600" },
              { icon: <BarChart3 size={28}/>, title: "Dual Evaluation", desc: "Two-way feedback engines secure behavioral interactions long after the complaint resolves.", color: "text-blue-600" }
            ].map((feature, idx) => (
              <GlowCard key={idx}>
                <div className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
             initial={{ opacity:0, y:30 }}
             whileInView={{ opacity:1, y:0 }}
             viewport={{ once: true }}
             className="text-center mb-16"
          >
             <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Lifecycle of a Complaint</h2>
             <p className="text-slate-500 max-w-xl mx-auto">See how we speed up the bridge from report onto resolution smoothly.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
             <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-slate-200 z-0"></div>

             {[
               { num: "01", title: "Raise Issue", desc: "Fill out the intuitive descriptive form and upload corresponding images." },
               { num: "02", title: "Faculty Logs", desc: "Anonymous notifications fire over to concerned departments locking SLA window." },
               { num: "03", title: "Track Updates", desc: "Visualise real-time stepper metrics unlocking delayed or resolved statuses." },
               { num: "04", title: "Leave Feedback", desc: "Score interactive matrices securing constraints ensuring dual relationships." }
             ].map((step, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx*0.1 }}
                 className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center relative z-10 flex flex-col items-center"
               >
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 mb-4">
                     {step.num}
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Faculty Leaderboard Section */}
      <section className="py-24 bg-slate-50/50 relative z-10 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
             initial={{ opacity:0, y:30 }}
             whileInView={{ opacity:1, y:0 }}
             viewport={{ once: true }}
             className="text-center mb-16"
          >
             <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Performance Index</h2>
             <p className="text-slate-500 max-w-xl mx-auto text-sm">Departments leading the charge in transparent, fast, and high-quality complaint resolutions.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { dept: "Hostel Administration", speed: "4.8", time: "< 12 hrs", score: 98, color: "from-emerald-500 via-teal-400 to-teal-500" },
               { dept: "Academic Council", speed: "4.6", time: "< 18 hrs", score: 92, color: "from-blue-500 via-indigo-400 to-indigo-500" },
               { dept: "IT Support Desk", speed: "4.9", time: "< 6 hrs", score: 96, color: "from-purple-500 via-purple-400 to-indigo-600" }
             ].map((item, idx) => (
               <GlowCard key={idx} className="bg-white">
                 <div className="p-6">
                   <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-5 rounded-full blur-2xl translate-x-10 -translate-y-10 group-hover:scale-150 transition-all duration-500`}></div>
                   
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-md text-slate-800">{item.dept}</h4>
                      <span className="text-xs font-bold px-2.5 py-1 bg-green-50 text-green-700 rounded-lg flex items-center gap-1">{item.speed} ⭐</span>
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between text-xs text-slate-500">
                         <span>Resolution Index</span>
                         <span className="font-bold text-slate-700">{item.time}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.score}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                         ></motion.div>
                      </div>
                   </div>
                 </div>
               </GlowCard>
             ))}
          </div>
        </div>
      </section>

      {/* Testimonials Voices Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
             initial={{ opacity:0, y:30 }}
             whileInView={{ opacity:1, y:0 }}
             viewport={{ once: true }}
             className="text-center mb-16"
          >
             <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Voices of Resolution</h2>
             <p className="text-slate-500 max-w-xl mx-auto text-sm">Real student outcomes securely administered keeping the matrix robust.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { quote: "The anonymity gave me the courage to report infrastructure flaws. Fixed in 2 days!", user: "Sophomore (CSE)", initial: "S" },
               { quote: "Seamless. I tracked the exact node where my file sat. Extremely transparent routing.", user: "Final Year (ME)", initial: "F" },
               { quote: "The feedback engine is amazing. Both parties get correct closures quickly.", user: "Junior (ECE)", initial: "J" }
             ].map((t, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx*0.1 }}
                 className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-indigo-500"
               >
                  <p className="text-slate-600 text-sm italic mb-6 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-auto border-t border-slate-200/50 pt-4">
                     <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-100">
                        {t.initial}
                     </div>
                     <span className="text-xs font-bold text-slate-500">{t.user}</span>
                  </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-slate-50/50 relative z-10 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-800 mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-500 text-sm">Got questions? We've gathered some transparent responses.</p>
           </div>
           
           <div className="space-y-1">
              {[
                { q: "Is my Identity safe from faculty members?", a: "Yes, 100%. The system encrypts identifiers before rendering queues onto Faculty dashboards." },
                { q: "What happens if a deadline passes without response?", a: "An escalator protocol triggers sending urgent reminders back into administrative alert lists." },
                { q: "Can I withdraw a complaint after raising it?", a: "Absolutely. You retain withdrawal triggers right up with 'Resolved' triggers toggling." }
              ].map((faq, i) => (
                <FAQItem 
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
           </div>
        </div>
      </section>
      
      {/* Ready Section */}
      <section className="py-24 relative z-10 overflow-hidden bg-white">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-900 rounded-3xl p-10 md:p-16 text-center relative shadow-2xl overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>
               
               <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">
                 Ready to make a difference?
               </h2>
               <p className="text-slate-300 mb-10 max-w-xl mx-auto relative z-10 text-base leading-relaxed">
                 Join thousands of students making the campus environment better, faster, and much more responsive.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                  <button onClick={() => navigate('/student/register')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30">
                     Create Student Account
                  </button>
               </div>
            </motion.div>
         </div>
      </section>
      
    </div>
  );
};

export default Home;
