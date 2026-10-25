// All site copy lives here so sections stay purely presentational.
// Copy is intentionally short: one idea per line.

export const about = {
  eyebrow: 'About Aurest',
  title: 'Science that reaches the patient.',
  lead:
    "A deep-tech biotechnology company. We don't just publish papers. We build real products that save real lives.",
  path: {
    intro: 'People still die from problems science already understands.',
    nodes: [
      { label: 'Trauma', text: 'Someone bleeds out on a highway because help arrived too late.' },
      { label: 'Snakebite', text: 'A farmer collapses in a field because antivenom is three hours away.' },
      { label: 'Blood shortage', text: 'A crash victim dies in shock because donor blood cannot survive without a fridge.' },
      { label: 'Organ failure', text: 'A patient dies on a hospital waiting list because a donor organ never came.' },
      { label: 'Cold chain', text: 'A life-saving medicine fails because tropical heat destroyed it before reaching the village.' },
    ],
    gap: [
      { text: "The knowledge exists. What's missing are products that are" },
      { text: 'fast, simple and affordable', hl: true },
      { text: 'enough to reach everyone.' },
    ],
    close: 'That is the gap Aurest is here to fill.',
  },
  pillars: [
    {
      key: 'focus',
      tab: 'Focus areas',
      items: [
        {
          title: 'Acute trauma & hemostasis',
          text: 'Halting catastrophic arterial hemorrhage and traumatic shock on highways, battlefields, and surgical suites.',
        },
        {
          title: 'Venom neutralization',
          text: 'Universal, pre-hospital countermeasures engineered to disarm lethal venom enzymes directly at the bite site without refrigeration.',
        },
        {
          title: 'Cold-chain elimination',
          text: 'Biopolymer vitrification matrices that keep fragile biologics, vaccines, and insulin stable in high temperatures.',
        },
      ],
    },
    {
      key: 'values',
      tab: 'What we stand for',
      items: [
        {
          title: 'Physical lab truth',
          text: "We don't build theoretical software. Every biomaterial is physically synthesized, formulated, and stress-tested in the laboratory.",
        },
        {
          title: 'Sovereign deep-tech',
          text: 'Invented and manufactured indigenously in India, eliminating dependence on costly foreign imports so life-saving care is affordable.',
        },
        {
          title: 'Built for the extremes',
          text: 'Engineered to perform where infrastructure fails—in scorching heat, zero refrigeration, and remote areas where doctors are hours away.',
        },
      ],
    },
  ],
};

export const technology = {
  eyebrow: 'Our Technology',
  title: ['Three technologies.', 'One mission: keep people alive.'],
  lead: "Designed and developed in our own laboratory. Each one targets a moment where today's medicine falls short.",
  items: [
    {
      id: 'v-seal',
      name: 'V Seal',
      visual: 'seal',
      tagline: 'Stops the bleed. Seals the vessel.',
      problem:
        'Uncontrolled arterial bleeding kills within minutes. Traditional dressings merely soak up blood and wait for slow, passive clotting that often arrives too late.',
      solution:
        'V Seal is an active biopolymer matrix that forms instant covalent tissue bonds and triggers accelerated clot formation.',
      points: [
        'Arrests catastrophic arterial and venous hemorrhage.',
        "Functions independently of the patient's natural coagulation cascade.",
        'Field-ready for combat medics, first responders, and trauma surgeons.',
      ],
      usedIn: ['Road accidents', 'Battlefield trauma', 'Emergency surgery', 'First responder kits'],
      status: { label: 'Patent pending', detail: 'Indian Patent Application No. 202611070798', kind: 'patent' },
    },
    {
      id: 'venom-seal',
      name: 'Venom Seal',
      visual: 'clot',
      tagline: 'Universal pre-hospital venom neutralization.',
      problem:
        'Snakebite is a lethal, time-sensitive emergency. Traditional antivenom requires strict cold-chain refrigeration and hospital IV infusion—often hours too far away.',
      solution:
        'Venom Seal is a broad-spectrum neutralizing paste applied directly at the bite site to chelate metal cofactors, denature toxic enzymes, and halt tissue necrosis.',
      points: [
        'Universal multi-enzyme denaturation across major snake venom classes.',
        'Chelates critical divalent ions to disarm metalloproteinases immediately.',
        '100% room-temperature stable—requires no electricity, cold chain, or doctor.',
      ],
      usedIn: ['Snakebite first aid', 'Agricultural emergencies', 'Military field kits', 'Remote outposts'],
      status: { label: 'Patent pending', detail: 'Indian Patent Application No. 202611070798', kind: 'patent' },
    },
    {
      id: 'aurest-kage',
      name: 'Aurest Kage',
      visual: 'kage',
      tagline: 'Cold-chain-free vitrification for vital biologics.',
      problem:
        'Over $17 Billion in temperature-sensitive biologics spoil annually. Critical insulin, vaccines, and therapeutic proteins degrade rapidly without constant 2°C–8°C refrigeration.',
      solution:
        'Aurest Kage immobilizes fragile protein macromolecules inside an amorphous biopolymer sugar-glass matrix, preserving potency in 40°C+ ambient tropical heat.',
      points: [
        'Completed 30-day thermal stress challenge at 32°C–37°C with Human Insulin.',
        'Vitrifies fragile peptides into an amorphous solid glass with Tg > 55°C.',
        'Bypasses the cold-chain bottleneck for rural healthcare and disaster zones.',
      ],
      usedIn: ['Insulin thermostability', 'Tropical vaccine transport', 'Emergency stockpiles', 'Remote medicine'],
      status: { label: 'Prototype validated', detail: '30-Day Thermal Stress Validated at 32°C–37°C', kind: 'lab' },
    },
  ],
};

export const vision = {
  eyebrow: 'Our Vision',
  title: 'This is just the beginning.',
  lead:
    "Our three core technologies are Phase One. Here's where we're heading next, with biological moonshots we're committed to for decades.",
  items: [
    {
      name: 'Haemodust',
      problem:
        'Natural donor blood spoils in 42 days, requires cold-chain refrigeration, and demands strict blood-type matching—making it completely unavailable in rural crashes, ambulances, and remote combat zones.',
      idea:
        "'Blood in a packet': a room-temperature dry powder that reconstitutes into an oxygen-carrying volume expander in 3 seconds when mixed with clean saline.",
      compare: [
        { label: 'Shelf Life', from: '35 to 42 days', to: '5+ Years' },
        { label: 'Storage', from: '2°C–8°C Fridge', to: 'Room Temp (-40°C to +55°C)' },
        { label: 'Compatibility', from: 'Type matching required', to: 'Universal for anyone' },
      ],
      goal: 'Oxygen-carrying resuscitation in every ambulance, military combat kit, and rural health center.',
    },
    {
      name: 'Organ Bioprinting',
      problem:
        'Millions of patients die worldwide on waiting lists for donor organs that never arrive, while toxic lifelong immunosuppressants slowly destroy healthy tissue.',
      idea:
        "3D bioprinting living, vascularized organs directly from the patient's own reprogrammed cells—zero donors, zero waiting lists, and zero immune rejection.",
      steps: ['Vascularized skin', 'Cartilage & bone', 'Microvessels', 'Complex whole organs'],
      goal: 'On-demand organ replacement manufactured indigenously at a fraction of global transplant costs.',
    },
    {
      name: 'Artificial Thymus Matrix',
      problem:
        'Autoimmune diseases force millions onto lifelong toxic immunosuppressants that shut down the entire immune system just to slow down rogue self-attacking T-cells.',
      idea:
        'An implantable 3D biopolymer sponge that lures attacking T-cells in-vivo, transfects them with FOXP3 mRNA, and re-educates them into permanent peacekeeper regulatory T-cells.',
      steps: ['Chemokine lure', 'FOXP3 transfection', 'Epigenetic lock', 'Organ protection'],
      goal: 'Permanent remission of autoimmune disease without suppressing the immune system.',
    },
  ],
  closing: [{ text: 'Widen the window in which' }, { text: 'a life can be saved.', hl: true }],
};

export const founder = {
  eyebrow: 'Founder',
  name: 'Priyanshu Sharma',
  role: 'Founder & CEO, Aurest Biotech',
  photo: '/images/founder.webp',
  initials: 'PS',
  linkedin: 'https://www.linkedin.com/in/priyanshu-sharma-1a5a33429/',
  x: 'https://x.com/itzpriyn',
  youtube: 'https://youtube.com/@founderpriyanshu?si=1qTqlO8P0oEqhAyz',
  highlights: [
    { value: '18', label: 'Age he founded Aurest' },
    { value: '2', label: 'Patent applications filed' },
    { value: 'MNIT', label: 'Research base, Jaipur' },
  ],
  paragraphs: [
    'Priyanshu Sharma started Aurest Biotech at 18, while most people his age were still choosing a college.',
    "It began with one question he couldn't let go of: why do people still die from problems that science already understands?",
    'There was no shortcut. He taught himself molecular biology, biochemistry and biomedical engineering by reading research papers and spending long hours in the lab, running experiments, failing, adjusting and trying again.',
    "Today he has invented Aurest's core technologies, filed two patent applications in his own name, built working prototypes and set up a registered company. He leads Aurest's research from the MNIT Innovation and Incubation Centre in Jaipur.",
  ],
  quote: 'I am not here to participate in the future of world biotech. I am here to build it.',
};

export const partners = {
  eyebrow: 'Our Ecosystem',
  title: "Backed by India's leading innovation institutions.",
  items: [
    {
      short: 'MIIC',
      name: 'MNIT Innovation and Incubation Centre',
      org: 'Malaviya National Institute of Technology, Jaipur',
      url: 'https://miic.mnit.ac.in/',
      logo: null, // e.g. '/logos/miic.png' once the official logo is added
      text: "A leading deep-tech incubator at one of India's top NITs. Aurest runs its core lab research here, with modern lab facilities and guidance from experienced academic and industry mentors.",
    },
    {
      short: 'AIC MUJ',
      name: 'Atal Incubation Centre',
      org: 'Manipal University Jaipur, supported by Atal Innovation Mission, NITI Aayog',
      url: 'https://www.aicmuj.com/',
      logo: null, // e.g. '/logos/aic.png' once the official logo is added
      text: "The Government of India's flagship programme for innovation and startups. Its incubation centres support deep-tech companies with mentorship, funding access and national networks.",
    },
  ],
};

export const contact = {
  eyebrow: 'Contact',
  title: "Let's build something that matters.",
  lead: "The future of medicine will be written in biology, and India can lead it. We're looking for people who want to be part of that.",
  audiences: [
    { key: 'research', title: 'Research institutions', text: 'Joint research, testing and validation.' },
    { key: 'clinical', title: 'Doctors and hospitals', text: 'Test and improve our products in real clinical settings.' },
    { key: 'investor', title: 'Investors', text: 'Take life-saving technology from the lab to the people who need it.' },
  ],
  close: "If you believe in what we're building, let's talk.",
  email: 'aurestbiotech@gmail.com',
  location: 'Jaipur, Rajasthan, India',
  linkedin: 'https://www.linkedin.com/in/priyanshu-sharma-1a5a33429/',
  x: 'https://x.com/itzpriyn',
  youtube: 'https://youtube.com/@founderpriyanshu?si=1qTqlO8P0oEqhAyz',
};
