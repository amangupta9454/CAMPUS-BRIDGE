<h1 align="center" style="color:#0d6efd;">🎨 CampusBridge — Frontend Client</h1>

<p align="center">
The frontend application for <b>CampusBridge</b>. It is a highly responsive, high-performance SPA (Single Page Application) built with <b>React 19</b>, <b>Vite</b>, and <b>TailwindCSS v4</b>. It provides role-specific dashboards for Students, Faculty, and Administrators to interact with the anonymous complaint and SLA tracking systems.
</p>

<hr>

<h2 style="color:#6f42c1;">💻 Tech Stack & Libraries</h2>

<ul>
<li><b>Framework:</b> <code>React 19</code> built with <code>Vite</code> for lightning-fast HMR and optimized production builds.</li>
<li><b>Styling UI:</b> <code>TailwindCSS v4</code> for modern, utility-first UI design and glassmorphism components.</li>
<li><b>Routing:</b> <code>react-router-dom v7</code> for seamless, protected route handling and navigation.</li>
<li><b>Animations:</b> <code>framer-motion</code> for buttery-smooth page transitions and micro-interactions.</li>
<li><b>Data Fetching:</b> <code>axios</code> with interceptors configured for JWT authorization headers.</li>
<li><b>Icons & Visuals:</b> <code>lucide-react</code> for crisp vector icons.</li>
<li><b>Notifications:</b> <code>react-hot-toast</code> for sleek, non-intrusive interactive alerts.</li>
<li><b>Data Visualization:</b> <code>recharts</code> to render the Admin overview statistics.</li>
</ul>

<hr>

<h2 style="color:#198754;">📂 Directory Structure</h2>

<pre>
FRONTEND/
├── public/                 # Static assets (logos, architecture diagrams)
├── src/
│   ├── Components/
│   │   ├── Admin/          # Admin dashboard & analytical view pages
│   │   ├── Faculty/        # Faculty complaint tracking & SLA management
│   │   ├── Student/        # Student anonymous complaints & forms
│   │   └── Shared/         # Navbar, Footer, GlowCards, Lost & Found Grids
│   ├── Pages/              # Top-level route pages (Home, About, Privacy, Terms)
│   ├── App.jsx             # Main router & layout configuration
│   ├── index.css           # Global Tailwind utilities and base styles
│   └── main.jsx            # Application entry point
├── .env                    # Environment variables (VITE_BACKEND_URL)
├── vite.config.js          # Vite bundler configuration
└── package.json            # Client dependencies and build scripts
</pre>

<hr>

<h2 style="color:#fd7e14;">⚙️ Running the Frontend Locally</h2>

<h3>1. Install Dependencies</h3>
<pre><code>npm install</code></pre>

<h3>2. Configure Environment</h3>
Create a <code>.env</code> file in the <code>FRONTEND/</code> root:
<pre><code>VITE_BACKEND_URL=http://localhost:5000</code></pre>

<h3>3. Start Development Server</h3>
<pre><code>npm run dev</code></pre>
<p>The application will start on <code>http://localhost:5173</code>.</p>

<hr>

<h2 style="color:#dc3545;">📜 Available Scripts</h2>
<ul>
<li><code>npm run dev</code>: Starts the Vite dev server with instant HMR.</li>
<li><code>npm run build</code>: Compiles and minifies the application for production deployment.</li>
<li><code>npm run preview</code>: Serves the production build locally to test routing and assets.</li>
<li><code>npm run lint</code>: Runs ESLint to identify code quality issues.</li>
</ul>
