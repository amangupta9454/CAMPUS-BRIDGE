import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Phone, LogIn, LayoutDashboard, LogOut, ShieldAlert, GraduationCap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isStudent = localStorage.getItem('student') !== null;
  const isFaculty = localStorage.getItem('faculty') !== null;
  const isAdmin = localStorage.getItem('admin') !== null;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (isStudent) localStorage.removeItem('student');
    if (isFaculty) localStorage.removeItem('faculty');
    if (isAdmin) localStorage.removeItem('admin');
    toast.success('Logged out successfully');
    navigate(isAdmin ? '/admin/login' : isFaculty ? '/faculty/login' : '/student/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'About', path: '/about', icon: <GraduationCap size={18} /> },
    { name: 'Contact', path: '/contact', icon: <Phone size={18} /> },
    { name: 'Complaint', path: '/complaints', icon: <AlertCircle size={18} /> },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full z-50 top-0 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo - Left */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="CampusBridge Logo" className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-300" />
              <div className="flex flex-col">
                 <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">CampusBridge</span>
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mt-0.5">Resolution</p>
              </div>
            </Link>
            
            <div className="h-6 w-px bg-slate-200 ml-1 hidden md:block"></div>
            
            {/* Added logos */}
            <img src="/hiet.png" alt="HIET Logo" className="h-8 w-auto object-contain hidden md:block hover:scale-105 transition-transform duration-300" />
            <img src="/sunstone.jpg" alt="Sunstone Logo" className="h-7 w-auto object-contain rounded hidden md:block hover:scale-105 transition-transform duration-300" />
          </div>

          {/* Center Links - Desktop */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 font-medium transition-colors"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                <Link
                  to={isAdmin ? "/admin/dashboard" : isFaculty ? "/faculty/dashboard" : "/student/dashboard"}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium transition-colors border border-transparent hover:bg-slate-50 px-3 py-1.5 rounded-lg"
                >
                  <LayoutDashboard size={18} />
                  {isAdmin ? "Admin Dashboard" : isFaculty ? "Faculty Dashboard" : "Dashboard"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/student/login"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  <LogIn size={18} />
                  Login
                </Link>
                <Link
                  to="/admin/login"
                  className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
                >
                  <ShieldAlert size={18} />
                  Admin
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-indigo-600 focus:outline-none p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] border-b border-slate-200 pb-4' : 'max-h-0'}`}>
        <div className="px-4 pt-2 space-y-2 bg-white flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center gap-2 font-medium py-3 px-2 rounded-lg transition-colors"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          <div className="h-px bg-slate-100 my-2"></div>

          {token ? (
            <>
              <Link
                 to={isFaculty ? "/faculty/dashboard" : "/student/dashboard"}
                className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center gap-2 font-medium py-3 px-2 rounded-lg transition-colors"
              >
                <LayoutDashboard size={18} />
                {isFaculty ? "Faculty Dashboard" : "Dashboard"}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium py-3 px-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/student/login"
                className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center gap-2 font-medium py-3 px-2 rounded-lg transition-colors"
              >
                <LogIn size={18} />
                Login
              </Link>
              <Link
                to="/admin/login"
                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium py-3 px-2 rounded-lg transition-colors mt-2"
              >
                <ShieldAlert size={18} />
                Admin
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
