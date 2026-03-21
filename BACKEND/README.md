<h1 align="center" style="color:#0d6efd;">⚙️ CampusBridge — Backend API</h1>

<p align="center">
The core server ecosystem powering <b>CampusBridge</b>. Built on <b>Node.js</b> and <b>Express.js</b>, it handles secure JWT authentication, SLA ticket tracking, cloud-based visual evidence storage via Cloudinary, and MongoDB document relationships for the entire smart campus infrastructure.
</p>

<hr>

<h2 style="color:#6f42c1;">💻 Tech Stack & Libraries</h2>

<ul>
<li><b>Runtime & Framework:</b> <code>Node.js</code> with <code>Express.js 5+</code> for robust REST API architecture.</li>
<li><b>Database:</b> <code>MongoDB</code> via <code>Mongoose</code> Object Data Modeling (ODM).</li>
<li><b>Security & Auth:</b> <code>bcrypt</code> for password hashing, <code>jsonwebtoken</code> for state-less session management.</li>
<li><b>Security Middleware:</b> <code>helmet</code> for HTTP headers, <code>cors</code> for origin rules, <code>express-rate-limit</code> for brute-force protection.</li>
<li><b>Media Handling:</b> <code>multer</code> for parsing multipart/form-data, integrated with <code>cloudinary</code> for direct cloud asset storage.</li>
<li><b>Communications:</b> <code>nodemailer</code> for dispatching real-time OTPs and complaint status alerts.</li>
</ul>

<hr>

<h2 style="color:#198754;">📂 Directory Structure</h2>

<pre>
BACKEND/
├── config/                 # Service configurations (db.js, cloudinary.js, nodemailer.js)
├── controllers/            # Business logic handlers (admin, faculty, student, lostFound)
├── middleware/             # Express middlewares (auth guards, multer upload arrays)
├── models/                 # Mongoose Data Schemas (Student, Faculty, Admin, Complaint)
├── routes/                 # Express API routing definitions by module
├── utils/                  # Helper utilities (OTP generators, email template renderers)
├── index.js                # Core Express application entry point
├── initAdmin.js            # CLI script to seed the initial Admin user
├── .env                    # Secrets and environment configurations
└── package.json            # Server dependencies and start scripts
</pre>

<hr>

<h2 style="color:#fd7e14;">⚙️ Running the Backend Locally</h2>

<h3>1. Install Dependencies</h3>
<pre><code>npm install</code></pre>

<h3>2. Configure Environment</h3>
Create a <code>.env</code> file in the <code>BACKEND/</code> root:
<pre><code>MONGO_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/campusbridge
PORT=5000
JWT_SECRET=your_super_secret_key_32_chars
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=SecureAdmin123
ADMIN_NAME=Super Admin
</code></pre>

<h3>3. Initialize Admin Account (First time only)</h3>
<pre><code>node initAdmin.js</code></pre>

<h3>4. Start Development Server</h3>
<pre><code>npm run dev</code></pre>
<p>The server will run on <code>http://localhost:5000</code> using Nodemon.</p>

<hr>

<h2 style="color:#dc3545;">🌐 API Routes Quick Reference</h2>

<ul>
<li><code>/api/student/*</code>: Authentication, Dashboard retrieval, Notification sweeps.</li>
<li><code>/api/faculty/*</code>: Authentication, Assigned Complaint lists, SLA updating, remarks.</li>
<li><code>/api/admin/*</code>: System-wide stat tracking via overrides, user lists, and global notification feeds.</li>
<li><code>/api/complaint/*</code>: Creation logic, withdrawal, student feedback mechanics.</li>
<li><code>/api/lostfound/*</code>: Global reporting, return confirmations, bulletin fetching.</li>
</ul>
<p><i>Note: Refer to the root <code>README.md</code> for the complete detailed matrix of all HTTP methods and parameters.</i></p>

<hr>

<h2 style="color:#17a2b8;">📜 Available Scripts</h2>
<ul>
<li><code>npm run dev</code>: Boot the server with Nodemon to auto-restart on file changes.</li>
<li><code>npm start</code>: Start natively using Node (standard production script).</li>
<li><code>npm run init-admin</code>: Seeds the primary admin account straight from your <code>.env</code> configs.</li>
</ul>
