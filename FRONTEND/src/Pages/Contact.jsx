import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlowCard from '../Components/GlowCard';

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="w-full relative overflow-hidden bg-white min-h-screen">
      {/* Background blobs */}
      <div className="absolute top-[-5%] left-[-10%] w-[35%] h-[35%] bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-5%] right-[-10%] w-[45%] h-[45%] bg-purple-50 rounded-full blur-3xl opacity-60"></div>

      {/* Grid Pattern Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center max-w-2xl mx-auto mb-16"
        >
           <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-4">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Touch</span>
           </h1>
           <p className="text-slate-500 text-sm">Have questions regarding routing, SLAs, or technical bugs? Direct your requests into the hub below.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
           {/* Contact Info column */}
           <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
           >
              {[
                { icon: <Mail size={20}/>, title: "Emails Support", detail: "support@campusbridge.edu", color: "from-emerald-500 to-teal-400" },
                { icon: <Phone size={20}/>, title: "Helpline Dial", detail: "+1 (800) 555-CB-HELP", color: "from-blue-500 to-indigo-400" },
                { icon: <MapPin size={20}/>, title: "Main Office", detail: "Admin Block, Suite 302", color: "from-violet-500 to-purple-400" }
              ].map((item, idx) => (
                <GlowCard key={idx} className="bg-white">
                  <motion.div variants={itemVariants} className="p-6 flex items-center gap-4 group">
                     <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{item.detail}</p>
                     </div>
                  </motion.div>
                </GlowCard>
              ))}

              <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white relative overflow-hidden shadow-xl group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-all duration-500"></div>
                 <h4 className="font-bold text-md mb-2 flex items-center gap-2"><MessageSquare size={18} className="text-indigo-400"/> Operational Hours</h4>
                 <p className="text-xs text-slate-300 leading-relaxed mb-4">Our administrative faculty support desk answers requests within a standard SLA window.</p>
                 <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Mon - Fri • 9:00 AM - 6:00 PM
                 </div>
              </motion.div>
           </motion.div>

           {/* Contact Form column */}
           <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-100/30"
           >
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">FullName</label>
                       <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Campus Email</label>
                       <input type="email" placeholder="j.doe@campus.edu" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject</label>
                    <input type="text" placeholder="E.g., Authentication issue" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium" />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message</label>
                    <textarea rows="4" placeholder="Type your concerns detailing exact SLA queries..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none font-medium"></textarea>
                 </div>

                 <button type="button" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    Send Message <Send size={16}/>
                 </button>
              </form>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
