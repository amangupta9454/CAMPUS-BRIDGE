import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                 CB
               </div>
               <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">CampusBridge</h1>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Resolution Engine</p>
               </div>
             </div>
             <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
               The official portal delivering transparent, anonymous, and streamlined complaint resolutions across higher education campuses.
             </p>
          </div>

          <div>
             <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-xs">Gateways</h4>
             <ul className="space-y-3 text-xs text-slate-400">
                <li><Link to="/student/login" className="hover:text-indigo-600 transition-colors font-medium">Student Portal</Link></li>
                <li><Link to="/faculty/login" className="hover:text-indigo-600 transition-colors font-medium">Faculty Direct</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-600 transition-colors font-medium">Contact Us</Link></li>
                <li><Link to="/about" className="hover:text-indigo-600 transition-colors font-medium">About Us</Link></li>
                <li><Link to="/complaints" className="hover:text-indigo-600 transition-colors font-medium">Complaints</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-xs">Security</h4>
             <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-500"/> <span className="font-medium">256-bit Encryption</span></li>
                <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-500"/> <span className="font-medium">Anonymous Routing</span></li>
                <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-500"/> <span className="font-medium">SSL Certification</span></li>
             </ul>
          </div>

          <div className="space-y-4">
             <h4 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">Stay Updated</h4>
             <p className="text-xs text-slate-500">Subscribe to get real-time SLA metrics regarding campus updates.</p>
             <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter campus email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 transition-all font-medium" />
                <button type="button" className="bg-indigo-600 text-white px-3 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all">Go</button>
             </form>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} CampusBridge Architecture. All rights reserved.</p>
           <div className="flex gap-6 text-sm text-slate-400 font-medium">
             <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
