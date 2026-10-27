# NAVEEN CHINNAM — Personal Portfolio

A modern, responsive, and interactive personal portfolio website designed to showcase my skills, selected projects, technical experience, and professional social profiles.

The portfolio focuses on a clean professional experience with smooth animations, a cinematic bird-flying introduction, responsive layouts, and secure server-side visitor interaction notifications.

---

## ✨ Features

- 🐦 Animated bird-flying introduction
- 👤 NAVEEN CHINNAM animated opening screen
- 🖼️ Full profile image and premium hero section
- 🎨 Modern dark-themed UI
- ✨ Smooth animations and interactive effects
- 📱 Fully responsive design
- 💻 Desktop, tablet, and mobile support
- 🧑‍💻 Skills and technology showcase
- 🚀 Manually selected portfolio projects
- 🔗 GitHub, LinkedIn, and Instagram integration
- 📧 Secure social-click email notifications
- ⚡ Netlify serverless functions
- 🔐 Server-side API key protection
- 🛡️ Visitor privacy protection
- 🚫 No automatic GitHub repository fetching
- 🚫 No unnecessary contact form
- 🧩 Social interaction tracking with anti-spam protection

---

## 🎬 Portfolio Experience

When a visitor opens the portfolio, they first experience the animated introduction.

```text
Website Opens
     ↓
Bird Flying Animation
     ↓
NAVEEN CHINNAM
     ↓
Portfolio Reveal
     ↓
Hero Section
     ↓
About
     ↓
Skills
     ↓
Selected Projects
     ↓
Connect With Me
```

The introduction is designed to make the first few seconds of the portfolio visually engaging while keeping the overall experience professional.

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- Responsive Web Design
- CSS Animations
- Modern UI/UX techniques

### Backend / Serverless

- Netlify Functions
- Node.js
- Server-side email notification system

### Email

- Resend
- Secure environment variables
- Server-side email dispatch

### Deployment

- Netlify

---

## 📂 Portfolio Sections

### 🏠 Home

Animated introduction with:

- Bird animation
- NAVEEN CHINNAM
- Professional profile image
- Hero section
- Personal introduction

### 👨‍💻 About

A professional overview of my background, interests, technical skills, and development journey.

### ⚙️ Skills

Technologies and programming skills including:

- Python
- C
- Java
- HTML
- CSS
- JavaScript
- React
- Node.js

### 🚀 Selected Projects

The portfolio contains manually selected projects rather than automatically importing GitHub repositories.

Featured projects include:

- WildlifeVision-AI
- HealthContinuum-AI
- LLM-RAG-Comparison
- Netflix Streaming Platform
- SDC-MODULES
- Snake Legends

Each project can include:

- Project description
- Technologies used
- Project image
- Live Demo
- GitHub Repository

---

## 🔗 Social Profiles

The portfolio provides direct links to:

- GitHub
- LinkedIn
- Instagram

GitHub repositories are **not automatically displayed inside the portfolio**.

Instead, visitors can click:

> **View my GitHub profile**

and browse all repositories directly on GitHub.

---

## 📧 Visitor Interaction Notifications

The portfolio includes a secure social interaction notification system.

When a visitor clicks:

- Instagram
- GitHub
- LinkedIn

the portfolio sends an asynchronous event to a secure Netlify Function.

```text
Visitor
   ↓
Social Link Click
   ↓
Netlify Function
   ↓
Resend
   ↓
Portfolio Owner Email
```

The notification contains useful non-sensitive information such as:

- Platform clicked
- Date and time
- Page
- Device type
- Browser
- Portfolio name

### Privacy

The portfolio does **not** attempt to secretly obtain:

- Visitor Gmail address
- Browser history
- Cookies
- Google account information
- Personal identity

Only interaction information required for portfolio analytics/notifications is processed.

---

## 🔐 Security

Sensitive credentials are stored using Netlify environment variables.

Required variables:

```env
NOTIFICATION_EMAIL=your-email@example.com
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=Portfolio Activity <your-verified-sender@example.com>
```

API keys are never stored in frontend JavaScript.

> Never commit real API keys or secrets to GitHub.

---

## 🛡️ Anti-Spam Protection

The social notification system includes a cooldown mechanism to prevent repeated clicks from generating excessive emails.

Repeated clicks on the same platform within the configured cooldown period are suppressed.

Different social platforms can still generate separate interaction notifications.

---

## 📁 Project Structure

```text
portfolio/
│
├── index.html
├── netlify.toml
├── package.json
├── server.js
│
├── css/
│   └── ...
│
├── images/
│   └── ...
│
├── js/
│   ├── auth-identity.js
│   ├── projects-data.js
│   └── ...
│
├── lib/
│   ├── database.js
│   └── notifier.js
│
└── netlify/
    └── functions/
        ├── track-social-click.js
        └── track-interaction.js
```

---

## 🚀 Local Development

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd portfolio
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Add your environment variables:

```env
NOTIFICATION_EMAIL=your-email@example.com
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=Portfolio Activity <your-verified-sender@example.com>
```

Run the development server:

```bash
npm run dev
```

If the project uses the configured local server instead:

```bash
node server.js
```

---

## 🌐 Netlify Deployment

The portfolio is designed to run on Netlify.

### Build

Configure the required build settings in Netlify and make sure the Netlify Functions directory is correctly detected.

### Environment Variables

Add the following variables in:

**Netlify → Site configuration → Environment variables**

```text
NOTIFICATION_EMAIL
RESEND_API_KEY
FROM_EMAIL
```

After adding or changing environment variables, trigger a new deployment.

---

## 📱 Responsive Design

The portfolio is optimized for:

- Mobile phones
- Tablets
- Laptops
- Desktop monitors
- Large displays

The layout automatically adapts to different screen sizes.

---

## ⚡ Performance & UX

The portfolio is designed with:

- Lightweight animations
- Asynchronous notification requests
- Responsive layouts
- Optimized asset loading
- Non-blocking external social links
- Clean navigation
- Mobile-friendly interactions

Social profile links open immediately without waiting for the notification email request to complete.

---

## 🎯 Goals

The main goals of this portfolio are to:

1. Present my technical skills professionally.
2. Showcase my selected projects.
3. Provide an attractive first impression.
4. Make my GitHub and professional profiles easily accessible.
5. Demonstrate frontend and serverless development skills.
6. Provide a modern, responsive user experience.
7. Implement secure visitor interaction notifications.

---

## 📌 Important Security Note

Never commit:

```text
.env
.env.local
API keys
SMTP passwords
Resend API keys
Private tokens
```

to a public repository.

Use Netlify Environment Variables for production secrets.

---

## 👨‍💻 Developer

### NAVEEN CHINNAM

Developer | AI & Full-Stack Enthusiast

Interested in:

- Artificial Intelligence
- Machine Learning
- Full-Stack Development
- Android Development
- RAG Systems
- Computer Vision
- Modern Web Applications

---

## 📬 Connect With Me

**GitHub:**  
https://github.com/naveenchinnam982-spec

**LinkedIn:**  
Add your LinkedIn profile URL

**Instagram:**  
Add your Instagram profile URL

---

## ⭐ Portfolio

Live Portfolio:

**Add your Netlify portfolio URL here**

---

## 📄 License

This project is intended as a personal portfolio project.

© 2026 NAVEEN CHINNAM. All rights reserved.
