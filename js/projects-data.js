// projects-data.js - Genuine Project Data for Naveen Chinnam
// Contains full architecture details, real GitHub repositories, live demo URLs, and tech stacks.

const PROJECTS_DATA = [
  {
    id: 'wildlife-vision',
    title: 'WildlifeVision-AI',
    tagline: 'Autonomous Drone Wildlife Monitoring & Animal Detection System',
    category: 'ai-ml',
    categoryName: 'AI & Computer Vision',
    featured: true,
    image: 'images/projects/wildlife-vision.jpg',
    github: 'https://github.com/naveenchinnam982-spec/WildlifeVision-AI',
    demo: 'https://github.com/naveenchinnam982-spec/WildlifeVision-AI',
    stats: [
      { label: 'Accuracy', value: '98.4%' },
      { label: 'Latency', value: '< 28ms' },
      { label: 'Classes', value: '18 Wildlife Species' }
    ],
    tech: ['TypeScript', 'PyTorch', 'OpenCV', 'YOLOv8', 'FastAPI', 'Drone Telemetry'],
    overview: 'WildlifeVision-AI is an end-to-end aerial surveillance and computer vision platform engineered to combat poaching and track endangered species via real-time drone aerial feeds.',
    problem: 'Traditional wildlife conservation depends on manual ground patrols and stationary camera traps, which suffer from massive blind spots, high danger in rugged terrain, and delayed response to poaching threats.',
    solution: 'Designed and deployed deep learning object detection models optimized for high-altitude oblique drone video. Combines real-time inference with thermal signature analysis, GPS geolocation tagging, and automated intrusion alerts.',
    features: [
      'High-frame-rate animal classification across dense canopy and grassland terrain',
      'Thermal overlay processing for nocturnal wildlife tracking and poacher detection',
      'Automated bounding box tracking with persistent trajectory mapping',
      'Lightweight edge inference pipeline deployable directly on companion drone computers',
      'Interactive control dashboard with live telemetry HUD (altitude, speed, battery, heading)'
    ],
    architecture: 'Input Video Stream -> Frame Preprocessor -> YOLOv8 Multi-Scale Feature Pyramid -> ByteTrack Tracker -> Telemetry Fusion -> WebSocket Live Dashboard'
  },
  {
    id: 'health-continuum',
    title: 'HealthContinuum-AI',
    tagline: 'Predictive Healthcare Analytics & Continuum Monitoring Platform',
    category: 'ai-ml',
    categoryName: 'AI & Health Tech',
    featured: true,
    image: 'images/projects/health-continuum.jpg',
    github: 'https://github.com/naveenchinnam982-spec/HealthContinuum-AI',
    demo: 'https://healthcontinuum-ai-maruthi.vercel.app',
    stats: [
      { label: 'Sensitivity', value: '96.2%' },
      { label: 'Parameters', value: '14 Bio-Markers' },
      { label: 'Status', value: 'Live on Vercel' }
    ],
    tech: ['Python', 'Machine Learning', 'FastAPI', 'React', 'Vercel', 'Predictive Modeling'],
    overview: 'An intelligent medical analytics platform providing real-time patient continuum tracking, early cardiac arrhythmia detection, and longitudinal bio-marker trend forecasting.',
    problem: 'Episodic hospital checkups often miss early warning signs of cardiovascular deterioration and glycemic spikes, leading to preventable critical emergencies.',
    solution: 'Engineered predictive machine learning pipelines that continuously ingest patient vital streams (ECG, HRV, blood glucose) to compute real-time risk scores and alert clinical staff before critical failure.',
    features: [
      'Automated annotation of ECG waveforms (P-wave, QRS complex, T-wave)',
      'Neural network-driven arrhythmia and hypertensive risk probability scoring',
      'Personalized clinical recommendations and medication adherence tracking',
      'Responsive, HIPAA-compliant glassmorphic clinical interface with dark mode',
      'Live deployment accessible worldwide on Vercel and Netlify'
    ],
    architecture: 'Biometric Wearable / Sensor Stream -> Temporal Convolutional Network -> Risk Scoring Engine -> RESTful FastAPI Backend -> Interactive React Dashboard'
  },
  {
    id: 'llm-rag-comparison',
    title: 'LLM-RAG-Comparison',
    tagline: 'Vector Retrieval & Large Language Model Architecture Benchmark',
    category: 'ai-ml',
    categoryName: 'AI & RAG Systems',
    featured: false,
    image: 'images/projects/llm-rag.jpg',
    github: 'https://github.com/naveenchinnam982-spec/LLM-RAG-Comparison',
    demo: 'https://github.com/naveenchinnam982-spec/LLM-RAG-Comparison',
    stats: [
      { label: 'Retrieval Latency', value: '42ms' },
      { label: 'Evaluated Models', value: '4 LLMs' },
      { label: 'Context Rerank', value: 'Cross-Encoder' }
    ],
    tech: ['Kotlin', 'Python', 'Vector DB', 'ChromaDB', 'LLMs', 'RAG Triad'],
    overview: 'An empirical benchmark framework evaluating precision, recall, hallucinations, and latency across dense vector retrieval, sparse lexical search, and hybrid RAG pipelines.',
    problem: 'Generative AI applications frequently suffer from hallucinations and stale context when interacting with proprietary enterprise knowledge bases without standardized benchmarking.',
    solution: 'Built an automated testbed comparing cosine similarity clustering against cross-encoder re-ranking across multi-modal queries, calculating RAG Triad scores (context relevance, groundedness, answer relevance).',
    features: [
      'Side-by-side prompt benchmarking across Llama 3, GPT-4, and Claude architectures',
      '3D UMAP vector embedding space projection for visual cluster analysis',
      'Hybrid retrieval combining BM25 keyword matching with dense embedding search',
      'Automated factuality scoring and latency profiling'
    ],
    architecture: 'Query Input -> Embedding Generator -> ChromaDB Dense Index -> Cross-Encoder Re-ranker -> Top-K Context Injector -> LLM Synthesis'
  },
  {
    id: 'netflix-clone',
    title: 'Netflix Video Platform',
    tagline: 'High-Performance Video Streaming Platform with Modern Web Stack',
    category: 'full-stack',
    categoryName: 'Full Stack & Web',
    featured: true,
    image: 'images/projects/netflix-clone.jpg',
    github: 'https://github.com/naveenchinnam982-spec/netflix-clone',
    demo: 'https://netflix-clone-naveen-644e.vercel.app',
    stats: [
      { label: 'Lighthouse', value: '98/100' },
      { label: 'State Sync', value: 'Real-time' },
      { label: 'Hosting', value: 'Vercel' }
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Cloudinary'],
    overview: 'A feature-complete digital media streaming web app built with Next.js, featuring responsive video previews, personalized watchlist syncing, and ultra-fluid animations.',
    problem: 'Building high-performance video streaming user interfaces with smooth trailer carousels and instantaneous search without layout shifts or memory leaks is challenging on the web.',
    solution: 'Architected server-side rendered (SSR) catalog pages with Next.js, utilizing Cloudinary CDN for adaptive streaming delivery and Firebase for instantaneous user watchlist synchronization.',
    features: [
      'Dynamic hero banner with embedded trailer preview playback',
      'Horizontally scrollable categorized media shelves with hover zoom cards',
      'User authentication and personalized "My List" cloud persistence',
      'Responsive design perfectly formatted for mobile, tablet, and 4K desktop screens',
      'Optimized asset loading with sub-second page transitions'
    ],
    architecture: 'Next.js App Router -> TMDB Media API -> Cloudinary Video CDN -> Firebase Auth & Firestore -> Tailwind Glass UI'
  },
  {
    id: 'sdc-modules',
    title: 'SDC-MODULES (Android Studio)',
    tagline: 'Modular Native Android Applications & Architecture Modules',
    category: 'mobile',
    categoryName: 'Mobile & Android',
    featured: false,
    image: 'images/projects/sdc-android.jpg',
    github: 'https://github.com/naveenchinnam982-spec/SDC-MODULES',
    demo: 'https://github.com/naveenchinnam982-spec/SDC-MODULES',
    stats: [
      { label: 'Platform', value: 'Android 14' },
      { label: 'Language', value: 'Kotlin & Java' },
      { label: 'UI Standard', value: 'Material 3' }
    ],
    tech: ['Android Studio', 'Kotlin', 'Java', 'XML', 'Jetpack', 'Room DB'],
    overview: 'A comprehensive collection of production-grade native Android applications focusing on modern architecture patterns (MVVM), local SQLite/Room persistence, and Material Design 3.',
    problem: 'Learning modern mobile development requires navigating complex device lifecycles, background worker threads, and multi-screen state without crashes.',
    solution: 'Constructed an architectural laboratory containing modular applications implementing clean architecture, background services, notifications, and dynamic UI layouts.',
    features: [
      'TaskFlow: Task and productivity management app with notification alarms',
      'Koin Wallet: Personal finance tracker with dynamic expense charting',
      'Connectify: Social feed module with image caching and interactive likes',
      'Built strictly adhering to Android Jetpack guidelines and Material Design 3'
    ],
    architecture: 'Kotlin Coroutines -> ViewModel -> LiveData / Flow -> Repository Pattern -> Room Database'
  },
  {
    id: 'snake-legends',
    title: 'Snake Legends Arcade',
    tagline: 'Modern Cyberpunk Arcade Game with HTML5 Canvas & Particle Physics',
    category: 'web-apps',
    categoryName: 'Interactive Web',
    featured: false,
    image: 'images/projects/snake-legends.jpg',
    github: 'https://github.com/naveenchinnam982-spec/snake-legends',
    demo: 'https://snakegame982.netlify.app/',
    stats: [
      { label: 'FPS', value: '60 FPS' },
      { label: 'Engine', value: 'Custom Canvas' },
      { label: 'Deploy', value: 'Netlify' }
    ],
    tech: ['HTML5 Canvas', 'CSS3 Variables', 'JavaScript ES6+', 'Audio Synthesis'],
    overview: 'A retro-futuristic arcade game featuring smooth 60 FPS snake motion, particle burst explosions, procedural power-ups, and audio feedback.',
    problem: 'Many classic web games lack responsiveness, feeling clunky with delayed keyboard inputs and low visual fidelity on modern high-refresh screens.',
    solution: 'Built a zero-dependency game loop utilizing `requestAnimationFrame`, delta-time physics calculation, touch swipe controllers for mobile, and localized high-score storage.',
    features: [
      'Glow-mesh vector grid with dynamic trail physics',
      'Fluid controls for both desktop keyboard arrows/WASD and mobile touch swipes',
      'Multi-level difficulty scaling and obstacle modes',
      'Instantaneous browser loading with zero bundle weight'
    ],
    architecture: 'Game Loop -> Delta Time Updater -> Canvas 2D Context Renderer -> Particle Engine -> LocalStorage High Scores'
  },
  {
    id: 'healthai',
    title: 'Healthai Diagnostic Web App',
    tagline: 'AI Medical Symptom Analyzer & Healthcare Assistant',
    category: 'ai-ml',
    categoryName: 'AI & Health Tech',
    featured: false,
    image: 'images/projects/health-continuum.jpg',
    github: 'https://github.com/naveenchinnam982-spec/Healthai',
    demo: 'https://healthai-wdq.vercel.app',
    stats: [
      { label: 'Response', value: '< 1s' },
      { label: 'Framework', value: 'FastAPI' },
      { label: 'Deploy', value: 'Vercel' }
    ],
    tech: ['Python', 'Machine Learning', 'HTML5', 'CSS3', 'REST API'],
    overview: 'A focused symptom assessment web application providing initial triage insights and disease probability indicators based on patient input patterns.',
    problem: 'Access to rapid, preliminary health information in remote areas is limited, causing confusion before patients consult certified physicians.',
    solution: 'Developed an intuitive multi-step symptom diagnostic form backed by a trained classification model offering informational health guidance.',
    features: [
      'Interactive multi-symptom selector with immediate probability inference',
      'Clean accessibility-focused layout for quick mobile access',
      'Integrated medical disclaimers and emergency hotline shortcuts'
    ],
    architecture: 'Form Inputs -> Python ML Classifier -> Probability Engine -> Responsive Web View'
  }
];
