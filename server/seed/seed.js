require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const TrialTask = require('../models/TrialTask');
const Milestone = require('../models/Milestone');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      FreelancerProfile.deleteMany({}),
      ClientProfile.deleteMany({}),
      Skill.deleteMany({}),
      Assessment.deleteMany({}),
      AssessmentAttempt.deleteMany({}),
      Project.deleteMany({}),
      Proposal.deleteMany({}),
      TrialTask.deleteMany({}),
      Milestone.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log('[Seed] Cleaned database.');

    // 1. Create Skills
    console.log('[Seed] Inserting Skills...');
    const skillsData = [
      {
        name: 'React.js',
        category: 'Frontend',
        description: 'Component architecture, hooks, state management, Virtual DOM, performance tuning.',
        icon: 'Atom',
        verifiedFreelancersCount: 6,
      },
      {
        name: 'Node.js',
        category: 'Backend',
        description: 'Event loop, asynchronous I/O, streams, Express.js microservices, clustering.',
        icon: 'Server',
        verifiedFreelancersCount: 5,
      },
      {
        name: 'MongoDB',
        category: 'Database',
        description: 'Document schema design, aggregation framework, indexing, sharding, replication.',
        icon: 'Database',
        verifiedFreelancersCount: 5,
      },
      {
        name: 'TypeScript',
        category: 'Frontend',
        description: 'Static typing, generics, utility types, interfaces, type narrowing, compiler configuration.',
        icon: 'Code2',
        verifiedFreelancersCount: 4,
      },
      {
        name: 'Next.js',
        category: 'Full Stack',
        description: 'App Router, Server Components (RSC), SSR, SSG, API routes, SEO architecture.',
        icon: 'Layers',
        verifiedFreelancersCount: 4,
      },
      {
        name: 'Python',
        category: 'Backend',
        description: 'FastAPI, Django, data processing, algorithms, OOP, async concurrency.',
        icon: 'Terminal',
        verifiedFreelancersCount: 3,
      },
      {
        name: 'PostgreSQL',
        category: 'Database',
        description: 'Relational schema, ACID transactions, complex joins, CTEs, query optimization.',
        icon: 'Database',
        verifiedFreelancersCount: 4,
      },
      {
        name: 'Docker',
        category: 'DevOps & Cloud',
        description: 'Containerization, multi-stage builds, Docker Compose, networking, volume storage.',
        icon: 'Box',
        verifiedFreelancersCount: 3,
      },
      {
        name: 'AWS Cloud',
        category: 'DevOps & Cloud',
        description: 'EC2, S3, Lambda, API Gateway, CloudFront, IAM policies, VPC networking.',
        icon: 'Cloud',
        verifiedFreelancersCount: 2,
      },
      {
        name: 'UI/UX Design',
        category: 'Design & UI/UX',
        description: 'Design systems, Figma tokens, responsive layouts, accessibility (a11y), usability.',
        icon: 'Palette',
        verifiedFreelancersCount: 3,
      },
    ];

    const createdSkills = await Skill.insertMany(skillsData);
    const skillMap = {};
    createdSkills.forEach((s) => {
      skillMap[s.name] = s;
    });

    // 2. Create Assessments with realistic technical MCQs
    console.log('[Seed] Creating Skill Assessments...');
    const assessmentsData = [
      {
        skill: skillMap['React.js']._id,
        title: 'React.js Professional Certification Assessment',
        description: 'Evaluates expertise in React 18+ hooks, concurrency, reconciliation, and state flow.',
        durationMinutes: 15,
        passingScore: 70,
        questions: [
          {
            questionText: 'What happens under the hood when setState is called with a function updater `setCount(prev => prev + 1)`?',
            codeSnippet: 'const handleClick = () => {\n  setCount(c => c + 1);\n  setCount(c => c + 1);\n};',
            options: [
              'React queues the state updater functions and processes them in batch sequentially during the next render',
              'React synchronously mutates the state twice before re-rendering immediately',
              'React drops the first updater and only executes the second one',
              'React creates a separate child fiber node for each updater call',
            ],
            correctOptionIndex: 0,
            explanation: 'Functional updaters ensure that state transitions are queued and calculated from the latest pending state during batched updates.',
            difficulty: 'Intermediate',
            points: 10,
          },
          {
            questionText: 'Why does passing an inline object to a context provider without useMemo cause unnecessary re-renders in consumers?',
            codeSnippet: '<AuthContext.Provider value={{ user, logout }}>\n  {children}\n</AuthContext.Provider>',
            options: [
              'Context providers strictly compare values by reference (Object.is)',
              'Context providers serialize objects to JSON strings on every render',
              'The Virtual DOM does not support nested object keys in context',
              'React re-mounts the entire sub-tree whenever context changes',
            ],
            correctOptionIndex: 0,
            explanation: 'A new object reference is created on every render, triggering all context consumers to re-render because Object.is detects reference inequality.',
            difficulty: 'Advanced',
            points: 10,
          },
          {
            questionText: 'What is the primary benefit of `useDeferredValue` or `useTransition` introduced in React 18?',
            codeSnippet: 'const [isPending, startTransition] = useTransition();',
            options: [
              'They allow keeping the current UI responsive by marking non-urgent state updates as interruptible',
              'They automatically run computation in a separate Web Worker thread',
              'They prevent the browser from garbage collecting large lists',
              'They convert React components into native Web Components',
            ],
            correctOptionIndex: 0,
            explanation: 'Transitions mark state updates as non-urgent transitions that yield to user interactions like clicks or typing.',
            difficulty: 'Expert',
            points: 10,
          },
          {
            questionText: 'How does React’s reconciliation algorithm handle list items without a unique `key` prop?',
            codeSnippet: '{items.map((item, index) => <ItemCard key={index} data={item} />)}',
            options: [
              'It falls back to array indices, which causes incorrect state retention when items are reordered or deleted',
              'It generates a cryptographic hash of the DOM element to identify nodes',
              'It throws a runtime fatal crash immediately',
              'It converts all child components into static HTML strings',
            ],
            correctOptionIndex: 0,
            explanation: 'Index keys can lead to subtle bugs because React matches fibers by index, keeping outdated local state attached to newly shifted items.',
            difficulty: 'Intermediate',
            points: 10,
          },
          {
            questionText: 'When using `useEffect`, when is the cleanup function executed?',
            codeSnippet: 'useEffect(() => {\n  const sub = api.subscribe();\n  return () => sub.unsubscribe();\n}, [dep]);',
            options: [
              'Before running the effect on the next render and when the component unmounts',
              'Only when the browser tab is closed',
              'Synchronously before the Virtual DOM mutation occurs',
              'Only once when the application starts',
            ],
            correctOptionIndex: 0,
            explanation: 'Cleanup functions run before the subsequent effect runs (when dependencies change) and when the component unmounts.',
            difficulty: 'Entry',
            points: 10,
          },
        ],
      },
      {
        skill: skillMap['Node.js']._id,
        title: 'Node.js Backend Architecture Assessment',
        description: 'Covers event loop phases, cluster scaling, stream pipelines, and non-blocking I/O.',
        durationMinutes: 15,
        passingScore: 70,
        questions: [
          {
            questionText: 'In which phase of the Node.js Event Loop are callbacks scheduled by `process.nextTick()` executed?',
            codeSnippet: 'process.nextTick(() => console.log("Next Tick"));',
            options: [
              'Immediately after the current operation finishes, before the event loop advances to the next phase (Microtask queue)',
              'Exclusively in the Close callbacks phase',
              'In the Poll phase alongside I/O events',
              'In the Timers phase before setTimeout callbacks',
            ],
            correctOptionIndex: 0,
            explanation: 'process.nextTick is processed as a microtask right after the current operation completes, regardless of the current event loop phase.',
            difficulty: 'Advanced',
            points: 10,
          },
          {
            questionText: 'What is the advantage of using `stream.pipeline` instead of chaining `.pipe()`?',
            codeSnippet: 'const { pipeline } = require("stream/promises");\nawait pipeline(readStream, transform, writeStream);',
            options: [
              'It properly handles error forwarding, stream destruction, and resource cleanup',
              'It converts streams to synchronous operations to avoid CPU bottlenecks',
              'It compresses binary data with Brotli automatically',
              'It increases maximum buffer size from 64KB to 10GB',
            ],
            correctOptionIndex: 0,
            explanation: 'pipeline automatically closes and destroys all streams if one stream errors, preventing memory leaks.',
            difficulty: 'Intermediate',
            points: 10,
          },
          {
            questionText: 'How does Node.js handle CPU-intensive tasks without blocking the main event loop?',
            codeSnippet: 'const { Worker } = require("worker_threads");',
            options: [
              'By delegating tasks to Worker Threads or the internal libuv threadpool',
              'By increasing the JavaScript V8 clock speed',
              'By converting JavaScript bytecode into WebAssembly at runtime',
              'By pausing client TCP connections until the loop is idle',
            ],
            correctOptionIndex: 0,
            explanation: 'Worker threads allow true multi-threaded CPU execution in Node.js while keeping the main loop responsive.',
            difficulty: 'Advanced',
            points: 10,
          },
        ],
      },
      {
        skill: skillMap['MongoDB']._id,
        title: 'MongoDB Data Modeling & Aggregation Assessment',
        description: 'Indexes, compound keys, lookup pipelines, and transactional consistency.',
        durationMinutes: 15,
        passingScore: 70,
        questions: [
          {
            questionText: 'What is the "ESR rule" for designing optimal compound indexes in MongoDB?',
            codeSnippet: 'db.orders.createIndex({ status: 1, createdAt: -1, total: 1 })',
            options: [
              'Equality first, Sort second, Range queries last',
              'Execution first, Sharding second, Replication last',
              'Entity first, String second, Real numbers last',
              'Exact matches only, with String prefixing and Redundancy removal',
            ],
            correctOptionIndex: 0,
            explanation: 'The ESR rule states that index keys should follow Equality filters, followed by Sort fields, followed by Range filters for optimal index scanning.',
            difficulty: 'Expert',
            points: 10,
          },
          {
            questionText: 'Which aggregation stage allows joining documents from another collection in MongoDB?',
            codeSnippet: '{\n  $lookup: {\n    from: "users",\n    localField: "userId",\n    foreignField: "_id",\n    as: "userDetails"\n  }\n}',
            options: [
              '$lookup',
              '$join',
              '$populate',
              '$merge',
            ],
            correctOptionIndex: 0,
            explanation: '$lookup performs a left outer join to an unsharded collection in the same database.',
            difficulty: 'Entry',
            points: 10,
          },
        ],
      },
      {
        skill: skillMap['TypeScript']._id,
        title: 'TypeScript Advanced Type System Assessment',
        description: 'Conditional types, mapped types, template literals, and distributive conditionals.',
        durationMinutes: 15,
        passingScore: 70,
        questions: [
          {
            questionText: 'What does the `keyof` operator produce when applied to an interface?',
            codeSnippet: 'interface User { id: string; name: string; age: number; }\ntype UserKeys = keyof User;',
            options: [
              'A union type of literal string/number keys: "id" | "name" | "age"',
              'An array containing runtime property names: ["id", "name", "age"]',
              'A boolean indicating if the object is frozen',
              'A generic record mapping keys to string types',
            ],
            correctOptionIndex: 0,
            explanation: 'keyof creates a union of literal string and numeric property names known statically on the type.',
            difficulty: 'Intermediate',
            points: 10,
          },
        ],
      },
    ];

    await Assessment.insertMany(assessmentsData);

    // 3. Create Admin User
    console.log('[Seed] Creating Admin User...');
    const adminPassword = await bcrypt.hash('AdminPass123!', 10);
    const adminUser = await User.create({
      name: 'Platform Administrator',
      email: 'admin@skillbridge.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    });

    // 4. Create 3 Clients
    console.log('[Seed] Creating 3 Clients...');
    const clientPass = await bcrypt.hash('ClientPass123!', 10);
    const clientsData = [
      {
        name: 'Sarah Jenkins',
        email: 'client1@skillbridge.com',
        companyName: 'Apex Health Technologies',
        companyWebsite: 'https://apexhealth.io',
        industry: 'Healthcare & Biotech',
        companySize: '51-200',
        description: 'Building HIPAA-compliant telemedicine patient portals and health analytics dashboards.',
        location: 'San Francisco, CA',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Marcus Vance',
        email: 'client2@skillbridge.com',
        companyName: 'NexGen Fintech Labs',
        companyWebsite: 'https://nexgenfin.co',
        industry: 'Fintech & Banking',
        companySize: '11-50',
        description: 'Next-generation algorithmic trading interfaces and decentralized settlement systems.',
        location: 'New York, NY',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Elena Rostova',
        email: 'client3@skillbridge.com',
        companyName: 'Orbital Logistics',
        companyWebsite: 'https://orbitallogistics.com',
        industry: 'Supply Chain & Logistics',
        companySize: '201-500',
        description: 'Global freight tracking and automated container routing platform.',
        location: 'Chicago, IL',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      },
    ];

    const createdClients = [];
    for (const c of clientsData) {
      const u = await User.create({
        name: c.name,
        email: c.email,
        password: clientPass,
        role: 'CLIENT',
        avatar: c.avatar,
        isActive: true,
        isEmailVerified: true,
      });

      const cp = await ClientProfile.create({
        user: u._id,
        companyName: c.companyName,
        companyWebsite: c.companyWebsite,
        industry: c.industry,
        companySize: c.companySize,
        description: c.description,
        location: c.location,
        totalProjectsPosted: 5,
        activeProjects: 2,
        completedProjects: 3,
        totalSpent: 18500,
        averageRating: 4.9,
        totalReviews: 4,
      });

      createdClients.push({ user: u, profile: cp });
    }

    // 5. Create 8 Freelancers with verified skills
    console.log('[Seed] Creating 8 Freelancers...');
    const freelancerPass = await bcrypt.hash('FreelancerPass123!', 10);
    const freelancersInfo = [
      {
        name: 'Alex Rivera',
        email: 'freelancer1@skillbridge.com',
        title: 'Senior Full Stack React & Node Architect',
        bio: '10+ years engineering modern distributed applications with React, Node.js, and TypeScript. Specializing in high-throughput architectures and robust real-time experiences.',
        hourlyRate: 85,
        experienceLevel: 'Expert',
        yearsOfExperience: 8,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'React.js', isVerified: true, score: 96, verificationLevel: 'Expert' },
          { name: 'Node.js', isVerified: true, score: 92, verificationLevel: 'Expert' },
          { name: 'TypeScript', isVerified: true, score: 94, verificationLevel: 'Expert' },
          { name: 'MongoDB', isVerified: true, score: 88, verificationLevel: 'Advanced' },
          { name: 'Docker', isVerified: false, score: 0, verificationLevel: 'None' },
        ],
        completedProjects: 14,
        averageRating: 4.9,
        totalReviews: 12,
        github: 'https://github.com/alexrivera-dev',
        linkedin: 'https://linkedin.com/in/alexrivera',
        website: 'https://alexrivera.dev',
      },
      {
        name: 'Sophia Chen',
        email: 'freelancer2@skillbridge.com',
        title: 'Lead Frontend Engineer & Design Systems Specialist',
        bio: 'Crafting pixel-perfect, accessible, and ultra-responsive SaaS frontends. Deep expert in React, Next.js, and CSS performance.',
        hourlyRate: 75,
        experienceLevel: 'Expert',
        yearsOfExperience: 6,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'React.js', isVerified: true, score: 94, verificationLevel: 'Expert' },
          { name: 'Next.js', isVerified: true, score: 91, verificationLevel: 'Expert' },
          { name: 'UI/UX Design', isVerified: true, score: 89, verificationLevel: 'Advanced' },
          { name: 'TypeScript', isVerified: true, score: 85, verificationLevel: 'Advanced' },
        ],
        completedProjects: 11,
        averageRating: 5.0,
        totalReviews: 9,
        github: 'https://github.com/sophiachen',
        linkedin: 'https://linkedin.com/in/sophiachen',
      },
      {
        name: 'David Okafor',
        email: 'freelancer3@skillbridge.com',
        title: 'Cloud Backend & Microservices Engineer',
        bio: 'Building scalable Node.js & Python backend microservices, resilient MongoDB databases, and event-driven architectures with AWS.',
        hourlyRate: 70,
        experienceLevel: 'Intermediate',
        yearsOfExperience: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'Node.js', isVerified: true, score: 87, verificationLevel: 'Advanced' },
          { name: 'MongoDB', isVerified: true, score: 90, verificationLevel: 'Expert' },
          { name: 'Docker', isVerified: true, score: 82, verificationLevel: 'Advanced' },
          { name: 'AWS Cloud', isVerified: true, score: 80, verificationLevel: 'Advanced' },
          { name: 'React.js', isVerified: false, score: 0, verificationLevel: 'None' },
        ],
        completedProjects: 8,
        averageRating: 4.8,
        totalReviews: 7,
        github: 'https://github.com/davidokafor',
      },
      {
        name: 'Maya Patel',
        email: 'freelancer4@skillbridge.com',
        title: 'Full Stack MERN Developer & API Engineer',
        bio: 'End-to-end MERN stack developer with high emphasis on clean code, RESTful API contract design, and unit testing.',
        hourlyRate: 60,
        experienceLevel: 'Intermediate',
        yearsOfExperience: 4,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'React.js', isVerified: true, score: 85, verificationLevel: 'Advanced' },
          { name: 'Node.js', isVerified: true, score: 83, verificationLevel: 'Advanced' },
          { name: 'MongoDB', isVerified: true, score: 84, verificationLevel: 'Advanced' },
          { name: 'TypeScript', isVerified: true, score: 78, verificationLevel: 'Intermediate' },
        ],
        completedProjects: 6,
        averageRating: 4.7,
        totalReviews: 5,
        github: 'https://github.com/mayapatel',
      },
      {
        name: 'Lucas Silva',
        email: 'freelancer5@skillbridge.com',
        title: 'PostgreSQL & Python Data Systems Engineer',
        bio: 'Specialized in high-performance transactional schemas, complex data aggregations, FastAPI backends, and Next.js full stack apps.',
        hourlyRate: 68,
        experienceLevel: 'Intermediate',
        yearsOfExperience: 4,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'PostgreSQL', isVerified: true, score: 92, verificationLevel: 'Expert' },
          { name: 'Python', isVerified: true, score: 88, verificationLevel: 'Advanced' },
          { name: 'Next.js', isVerified: true, score: 79, verificationLevel: 'Intermediate' },
        ],
        completedProjects: 5,
        averageRating: 4.8,
        totalReviews: 4,
        github: 'https://github.com/lucassilva',
      },
      {
        name: 'Emily Watson',
        email: 'freelancer6@skillbridge.com',
        title: 'React & Mobile React Native Specialist',
        bio: 'Delivering cross-platform mobile and responsive web applications with consistent state management and smooth 60fps animations.',
        hourlyRate: 65,
        experienceLevel: 'Intermediate',
        yearsOfExperience: 3,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'React.js', isVerified: true, score: 88, verificationLevel: 'Advanced' },
          { name: 'UI/UX Design', isVerified: true, score: 82, verificationLevel: 'Advanced' },
          { name: 'TypeScript', isVerified: false, score: 0, verificationLevel: 'None' },
        ],
        completedProjects: 4,
        averageRating: 4.9,
        totalReviews: 4,
        github: 'https://github.com/emilywatson',
      },
      {
        name: 'Kavita Rao',
        email: 'freelancer7@skillbridge.com',
        title: 'DevOps, Docker & AWS Cloud Infrastructure Engineer',
        bio: 'CI/CD pipeline automation, Docker container orchestration, Kubernetes manifests, and cloud infrastructure as code (Terraform).',
        hourlyRate: 90,
        experienceLevel: 'Expert',
        yearsOfExperience: 7,
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'Docker', isVerified: true, score: 95, verificationLevel: 'Expert' },
          { name: 'AWS Cloud', isVerified: true, score: 92, verificationLevel: 'Expert' },
          { name: 'Node.js', isVerified: true, score: 81, verificationLevel: 'Advanced' },
        ],
        completedProjects: 9,
        averageRating: 5.0,
        totalReviews: 8,
        github: 'https://github.com/kavitarao',
      },
      {
        name: 'Liam O’Connor',
        email: 'freelancer8@skillbridge.com',
        title: 'Full Stack Next.js & TypeScript Developer',
        bio: 'Building SEO-optimized web portals, e-commerce storefronts, and serverless architectures using Next.js, Tailwind, and Prisma.',
        hourlyRate: 55,
        experienceLevel: 'Entry',
        yearsOfExperience: 2,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        skills: [
          { name: 'Next.js', isVerified: true, score: 82, verificationLevel: 'Advanced' },
          { name: 'TypeScript', isVerified: true, score: 76, verificationLevel: 'Intermediate' },
          { name: 'React.js', isVerified: true, score: 79, verificationLevel: 'Intermediate' },
        ],
        completedProjects: 2,
        averageRating: 4.6,
        totalReviews: 2,
        github: 'https://github.com/liamoconnor',
      },
    ];

    const createdFreelancers = [];
    for (const f of freelancersInfo) {
      const u = await User.create({
        name: f.name,
        email: f.email,
        password: freelancerPass,
        role: 'FREELANCER',
        avatar: f.avatar,
        isActive: true,
        isEmailVerified: true,
      });

      const profileSkills = f.skills.map((s) => {
        const skillDoc = skillMap[s.name];
        return {
          skill: skillDoc ? skillDoc._id : null,
          name: s.name,
          category: skillDoc ? skillDoc.category : 'Development',
          isVerified: s.isVerified,
          score: s.score,
          verificationLevel: s.verificationLevel,
          verifiedAt: s.isVerified ? new Date('2026-08-15') : null,
          attemptsCount: s.isVerified ? 1 : 0,
        };
      });

      const fp = await FreelancerProfile.create({
        user: u._id,
        title: f.title,
        bio: f.bio,
        hourlyRate: f.hourlyRate,
        experienceLevel: f.experienceLevel,
        yearsOfExperience: f.yearsOfExperience,
        skills: profileSkills,
        completedProjects: f.completedProjects,
        averageRating: f.averageRating,
        totalReviews: f.totalReviews,
        ratingBreakdown: {
          communication: 4.9,
          quality: f.averageRating,
          timeliness: 4.8,
          professionalism: 5.0,
        },
        portfolio: [
          {
            title: 'Enterprise Analytics Engine',
            description: 'Real-time telemetry dashboard handling 50k events/sec with web sockets and charts.',
            projectUrl: 'https://analytics-demo.io',
            githubUrl: `${f.github}/analytics-engine`,
            technologies: ['React.js', 'Node.js', 'MongoDB', 'TypeScript'],
          },
          {
            title: 'Cloud Billing & Subscription Portal',
            description: 'Stripe webhook integration, usage-based metering, and customer invoice automation.',
            projectUrl: 'https://billing-portal.dev',
            githubUrl: `${f.github}/billing-portal`,
            technologies: ['Next.js', 'PostgreSQL', 'Docker'],
          },
        ],
        education: [
          {
            institution: 'University of Technology',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            year: 2021,
          },
        ],
        certifications: [
          {
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            year: 2023,
            url: 'https://aws.amazon.com/verification',
          },
        ],
        github: f.github,
        linkedin: f.linkedin || '',
        website: f.website || '',
        profileCompletion: 95,
      });

      createdFreelancers.push({ user: u, profile: fp });
    }

    // 6. Create 15 Projects
    console.log('[Seed] Creating 15 Projects...');
    const projectsList = [
      {
        title: 'HIPAA-Compliant Telehealth Consultation Dashboard',
        description: 'We need an experienced full-stack engineer to build an encrypted, real-time video consultation dashboard for doctors and patients. Requires secure JWT authentication, WebRTC signaling via Socket.IO, and patient medical record indexing.',
        category: 'Web Development',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'Node.js', category: 'Backend', importance: 'Required' },
          { name: 'MongoDB', category: 'Database', importance: 'Required' },
        ],
        budget: { amount: 3800, type: 'Fixed' },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Expert',
        projectType: 'Complex System',
        clientIndex: 0,
        status: 'In Progress',
        assignedFreelancerIndex: 0, // Alex Rivera
      },
      {
        title: 'Algorithmic Portfolio Rebalancing Dashboard',
        description: 'Build a financial analytics dashboard with high-performance charts, live WebSocket quote streaming, and portfolio allocation calculations. Must support responsive tablet and mobile screens.',
        category: 'Fintech',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'TypeScript', category: 'Frontend', importance: 'Required' },
          { name: 'Next.js', category: 'Full Stack', importance: 'Preferred' },
        ],
        budget: { amount: 2500, type: 'Fixed' },
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Expert',
        projectType: 'One-Time Project',
        clientIndex: 1,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Global Supply Chain Freight Telemetry Platform',
        description: 'Develop an automated cargo container tracking portal integrating IoT sensor data feeds, GPS coordinates mapping, and automated arrival notification triggers.',
        category: 'Web Development',
        requiredSkills: [
          { name: 'Node.js', category: 'Backend', importance: 'Required' },
          { name: 'MongoDB', category: 'Database', importance: 'Required' },
          { name: 'Docker', category: 'DevOps & Cloud', importance: 'Required' },
        ],
        budget: { amount: 4200, type: 'Fixed' },
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Expert',
        projectType: 'Complex System',
        clientIndex: 2,
        status: 'Proposal Review',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Next-Gen SaaS Design System & UI Component Library',
        description: 'Architect and build an accessible, reusable React component library with Tailwind CSS, Storybook documentation, and dark mode tokens for our enterprise cloud suite.',
        category: 'UI/UX Design',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'UI/UX Design', category: 'Design & UI/UX', importance: 'Required' },
          { name: 'TypeScript', category: 'Frontend', importance: 'Preferred' },
        ],
        budget: { amount: 1900, type: 'Fixed' },
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 0,
        status: 'Trial Task',
        assignedFreelancerIndex: null,
      },
      {
        title: 'PostgreSQL Database Performance Optimization & Index Tuning',
        description: 'Audit our existing 50M-row PostgreSQL database. Optimize slow analytical queries, implement compound indexes following ESR guidelines, and configure connection pooling.',
        category: 'Database',
        requiredSkills: [
          { name: 'PostgreSQL', category: 'Database', importance: 'Required' },
          { name: 'Python', category: 'Backend', importance: 'Preferred' },
        ],
        budget: { amount: 1500, type: 'Fixed' },
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 1,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Automated CI/CD Pipeline & AWS Infrastructure Setup',
        description: 'Set up multi-stage Docker container builds, GitHub Actions CI/CD pipeline, and AWS ECS/Fargate cluster deployments with zero downtime rolling updates.',
        category: 'DevOps & Cloud',
        requiredSkills: [
          { name: 'Docker', category: 'DevOps & Cloud', importance: 'Required' },
          { name: 'AWS Cloud', category: 'DevOps & Cloud', importance: 'Required' },
        ],
        budget: { amount: 2800, type: 'Fixed' },
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Expert',
        projectType: 'One-Time Project',
        clientIndex: 2,
        status: 'Completed',
        assignedFreelancerIndex: 6, // Kavita Rao
      },
      {
        title: 'Full Stack E-Commerce Storefront with Next.js App Router',
        description: 'Modern headless e-commerce frontend with fast server-side rendering, instant product search, cart state management, and Stripe checkout integration.',
        category: 'Web Development',
        requiredSkills: [
          { name: 'Next.js', category: 'Full Stack', importance: 'Required' },
          { name: 'TypeScript', category: 'Frontend', importance: 'Required' },
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
        ],
        budget: { amount: 3200, type: 'Fixed' },
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'Ongoing Work',
        clientIndex: 0,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Real-Time Collaborative Document Workspace',
        description: 'Build a rich markdown document editor with live multiplayer cursor sync and version revision history using Socket.IO and Node.js.',
        category: 'Web Development',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'Node.js', category: 'Backend', importance: 'Required' },
          { name: 'TypeScript', category: 'Frontend', importance: 'Preferred' },
        ],
        budget: { amount: 2600, type: 'Fixed' },
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 1,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'FastAPI Data Ingestion Service & Data Pipelines',
        description: 'Develop high-throughput REST endpoints in Python FastAPI to ingest JSON events, validate schemas with Pydantic, and write to PostgreSQL with asyncpg.',
        category: 'Backend',
        requiredSkills: [
          { name: 'Python', category: 'Backend', importance: 'Required' },
          { name: 'PostgreSQL', category: 'Database', importance: 'Required' },
          { name: 'Docker', category: 'DevOps & Cloud', importance: 'Preferred' },
        ],
        budget: { amount: 2100, type: 'Fixed' },
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 2,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Mobile-First Patient Booking & Reminder Application',
        description: 'Clean, responsive appointment scheduling interface with SMS/Email reminders, calendar sync, and localized time zone handling.',
        category: 'Web Development',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'UI/UX Design', category: 'Design & UI/UX', importance: 'Required' },
        ],
        budget: { amount: 1800, type: 'Fixed' },
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 0,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Crypto Wallet & Multi-Signature Asset Manager',
        description: 'Front-end interface connecting to Web3 provider nodes, multi-signature transaction approval workflows, and historical gas price charts.',
        category: 'Fintech',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'TypeScript', category: 'Frontend', importance: 'Required' },
          { name: 'Node.js', category: 'Backend', importance: 'Preferred' },
        ],
        budget: { amount: 3500, type: 'Fixed' },
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Expert',
        projectType: 'Complex System',
        clientIndex: 1,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Fleet Maintenance Scheduling & Driver Log Portal',
        description: 'Portal for vehicle inspections, oil changes, tire replacement logs, and driver work-hour compliance tracking.',
        category: 'Web Development',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'MongoDB', category: 'Database', importance: 'Required' },
        ],
        budget: { amount: 2000, type: 'Fixed' },
        deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 2,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Clinical Trial Data Export & Report Generator',
        description: 'Generate formatted PDF/Excel clinical trial reports from MongoDB datasets with aggregated statistical tables and visual charts.',
        category: 'Healthcare',
        requiredSkills: [
          { name: 'Node.js', category: 'Backend', importance: 'Required' },
          { name: 'MongoDB', category: 'Database', importance: 'Required' },
        ],
        budget: { amount: 1600, type: 'Fixed' },
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 0,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'High-Frequency Market Data Ingestion Cluster',
        description: 'Set up low-latency message queues, Docker microservices, and in-memory cache layers for tick-by-tick FX market feeds.',
        category: 'Fintech',
        requiredSkills: [
          { name: 'Node.js', category: 'Backend', importance: 'Required' },
          { name: 'Docker', category: 'DevOps & Cloud', importance: 'Required' },
          { name: 'TypeScript', category: 'Frontend', importance: 'Preferred' },
        ],
        budget: { amount: 4500, type: 'Fixed' },
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Expert',
        projectType: 'Complex System',
        clientIndex: 1,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
      {
        title: 'Cross-Border Customs Declaration Automated Form Filler',
        description: 'Automated paperwork processing web app with drag-and-drop PDF invoice parsing and customs rule validation.',
        category: 'Web Development',
        requiredSkills: [
          { name: 'React.js', category: 'Frontend', importance: 'Required' },
          { name: 'TypeScript', category: 'Frontend', importance: 'Required' },
          { name: 'Node.js', category: 'Backend', importance: 'Preferred' },
        ],
        budget: { amount: 2400, type: 'Fixed' },
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        experienceRequired: 'Intermediate',
        projectType: 'One-Time Project',
        clientIndex: 2,
        status: 'Open',
        assignedFreelancerIndex: null,
      },
    ];

    const createdProjects = [];
    for (const p of projectsList) {
      const client = createdClients[p.clientIndex];
      const assignedFreelancer = p.assignedFreelancerIndex !== null ? createdFreelancers[p.assignedFreelancerIndex].user : null;

      const proj = await Project.create({
        client: client.user._id,
        assignedFreelancer: assignedFreelancer ? assignedFreelancer._id : null,
        title: p.title,
        description: p.description,
        category: p.category,
        requiredSkills: p.requiredSkills,
        budget: p.budget,
        deadline: p.deadline,
        experienceRequired: p.experienceRequired,
        projectType: p.projectType,
        status: p.status,
        proposalCount: 3,
        completedAt: p.status === 'Completed' ? new Date('2026-09-01') : null,
      });

      createdProjects.push(proj);
    }

    // 7. Create Proposals for Projects
    console.log('[Seed] Creating Sample Proposals...');
    const p1 = createdProjects[0]; // Telehealth Dashboard (Alex assigned)
    const alexProposal = await Proposal.create({
      project: p1._id,
      freelancer: createdFreelancers[0].user._id,
      coverLetter: 'I have 8+ years of experience architecting HIPAA-ready healthcare applications with React, Node.js, and MongoDB. I have previously implemented secure WebRTC video feeds and compliant audit trails. Happy to begin immediately.',
      proposedBudget: 3800,
      estimatedDays: 25,
      relevantExperience: 'Built the patient consultation portal for HealthLink (100k active patients).',
      portfolioLinks: ['https://github.com/alexrivera-dev/telehealth-core'],
      skillMatchPercentage: 96,
      status: 'Accepted',
    });

    // Milestones for Project 1
    console.log('[Seed] Creating Milestones for Active Projects...');
    await Milestone.create([
      {
        project: p1._id,
        title: 'Architecture Blueprint, DB Schema & Auth System',
        description: 'Implement JWT authentication with HttpOnly cookies, RBAC, and MongoDB schema design.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        amount: 1200,
        order: 1,
        status: 'Approved',
        deliverable: {
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          githubUrl: 'https://github.com/alexrivera-dev/telehealth-core/pull/1',
          notes: 'Completed auth controllers, middleware, and database schemas with unit test coverage.',
        },
        clientFeedback: {
          reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: 'Excellent architecture and code organization!',
          status: 'Approved',
        },
      },
      {
        project: p1._id,
        title: 'WebRTC Video Signaling & Consultation Room UI',
        description: 'Build real-time video signaling with Socket.IO and responsive consultation room interface.',
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        amount: 1400,
        order: 2,
        status: 'In Progress',
      },
      {
        project: p1._id,
        title: 'Patient Medical Records EMR Integration & Testing',
        description: 'Build patient history timeline, document attachments, and end-to-end integration tests.',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 1200,
        order: 3,
        status: 'Not Started',
      },
    ]);

    // Trial Task for Project 4 (Design System)
    const p4 = createdProjects[3];
    const sophiaUser = createdFreelancers[1].user;
    const clientSarah = createdClients[0].user;

    const p4Proposal = await Proposal.create({
      project: p4._id,
      freelancer: sophiaUser._id,
      coverLetter: 'I have designed and engineered design systems for multiple high-growth SaaS startups. My focus is on token-driven design, keyboard accessibility (WCAG 2.1 AA), and zero-runtime CSS optimization.',
      proposedBudget: 1900,
      estimatedDays: 14,
      relevantExperience: 'Created the OpenDesign UI kit used by 5,000+ developers.',
      portfolioLinks: ['https://github.com/sophiachen/design-tokens'],
      skillMatchPercentage: 94,
      status: 'Trial Task',
    });

    console.log('[Seed] Creating Trial Task for Evaluation...');
    await TrialTask.create({
      project: p4._id,
      proposal: p4Proposal._id,
      client: clientSarah._id,
      freelancer: sophiaUser._id,
      title: 'Build a Responsive Component Demo with Theme Switcher',
      description: 'Build a responsive button and modal component with light/dark theme toggle, full keyboard navigation support (Escape to close, Focus trap), and clean vanilla/Tailwind styling.',
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      requirements: [
        'Accessible modal with focus trap and ARIA labels',
        'Light and Dark mode toggle support',
        'Clean component props API',
      ],
      evaluationCriteria: [
        'Visual polish and responsive layout fidelity',
        'Clean TypeScript typing and component structure',
        'Accessibility standard compliance',
      ],
      status: 'Submitted',
      submission: {
        submittedAt: new Date(),
        githubUrl: 'https://github.com/sophiachen/trial-task-ui-modal',
        demoUrl: 'https://trial-task-modal-demo.vercel.app',
        explanation: 'Built the modal component adhering to WAI-ARIA authoring practices with smooth entry transitions and theme token propagation.',
      },
    });

    // Completed project review (Project 6 - Kavita Rao)
    const p6 = createdProjects[5];
    const kavitaUser = createdFreelancers[6].user;
    const clientElena = createdClients[2].user;

    console.log('[Seed] Creating Sample Reviews...');
    await Review.create({
      project: p6._id,
      reviewer: clientElena._id,
      reviewee: kavitaUser._id,
      reviewerRole: 'CLIENT',
      rating: 5.0,
      categories: {
        communication: 5,
        quality: 5,
        timeliness: 5,
        professionalism: 5,
      },
      comment: 'Kavita is an outstanding cloud engineer! She migrated our entire Docker stack to AWS ECS flawlessly with automated GitHub Actions CI/CD. Highly recommended!',
    });

    await Review.create({
      project: p6._id,
      reviewer: kavitaUser._id,
      reviewee: clientElena._id,
      reviewerRole: 'FREELANCER',
      rating: 5.0,
      categories: {
        communication: 5,
        quality: 5,
        timeliness: 5,
        professionalism: 5,
      },
      comment: 'Fantastic client to collaborate with. Clear requirements, prompt feedback, and immediate milestone approval.',
    });

    // Sample Conversation & Messages between Client Sarah & Freelancer Alex
    console.log('[Seed] Creating Sample Messages & Conversation...');
    const conv = await Conversation.create({
      participants: [clientSarah._id, createdFreelancers[0].user._id],
      project: p1._id,
      lastMessage: {
        text: 'Milestone 1 looks great! Approved and funds released. Let us move to Milestone 2.',
        sender: clientSarah._id,
        createdAt: new Date(),
      },
    });

    await Message.create([
      {
        conversation: conv._id,
        sender: createdFreelancers[0].user._id,
        recipient: clientSarah._id,
        text: 'Hello Sarah! I have finished setting up the core authentication, RBAC middleware, and MongoDB schemas.',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        conversation: conv._id,
        sender: clientSarah._id,
        recipient: createdFreelancers[0].user._id,
        text: 'Awesome progress, Alex! Checking the code and test coverage now.',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        conversation: conv._id,
        sender: clientSarah._id,
        recipient: createdFreelancers[0].user._id,
        text: 'Milestone 1 looks great! Approved and funds released. Let us move to Milestone 2.',
        createdAt: new Date(Date.now() - 1800000),
      },
    ]);

    // Sample Notifications
    console.log('[Seed] Creating Sample Notifications...');
    await Notification.create([
      {
        recipient: createdFreelancers[0].user._id,
        sender: clientSarah._id,
        type: 'milestone_approved',
        title: 'Milestone 1 Approved! 🎉',
        message: 'Client approved Milestone 1: "Architecture Blueprint, DB Schema & Auth System".',
        link: `/project/${p1._id}`,
        referenceId: p1._id,
        referenceModel: 'Project',
      },
      {
        recipient: clientSarah._id,
        sender: sophiaUser._id,
        type: 'trial_task_submitted',
        title: 'Trial Task Submitted',
        message: 'Sophia Chen submitted her trial task for "Next-Gen SaaS Design System".',
        link: `/client/projects/${p4._id}`,
        referenceId: p4._id,
        referenceModel: 'Project',
      },
    ]);

    console.log('====================================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:');
    console.log('  Email:    admin@skillbridge.com');
    console.log('  Password: AdminPass123!');
    console.log('');
    console.log('Client Accounts:');
    console.log('  Email:    client1@skillbridge.com / ClientPass123!');
    console.log('  Email:    client2@skillbridge.com / ClientPass123!');
    console.log('  Email:    client3@skillbridge.com / ClientPass123!');
    console.log('');
    console.log('Freelancer Accounts:');
    console.log('  Email:    freelancer1@skillbridge.com / FreelancerPass123!');
    console.log('  Email:    freelancer2@skillbridge.com / FreelancerPass123!');
    console.log('  ... up to freelancer8@skillbridge.com');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
