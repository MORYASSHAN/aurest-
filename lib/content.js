// All site copy lives here so sections stay purely presentational.
// Copy is intentionally short: one idea per line.

export const about = {
  eyebrow: 'About Aurest',
  title: 'Science that reaches the patient.',
  lead:
    "A deep-tech biotechnology company from Jaipur, Rajasthan. We don't just publish papers. We build real products that save real lives.",
  path: {
    intro: 'People still die from problems science already understands.',
    nodes: [
      { label: 'Trauma', text: 'Someone bleeds out on a highway because help arrived too late.' },
      { label: 'Heart attack', text: 'Heart muscle is lost, and it never grows back.' },
      { label: 'Medicine', text: 'A good drug fails because the body destroys it before it works.' },
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
          title: 'Hemorrhage control',
          text: 'Stopping dangerous bleeding faster and more safely, in accidents, on the battlefield and in surgery.',
        },
        {
          title: 'Rapid diagnostics',
          text: 'Low-cost tests that find disease early, even in small clinics with limited equipment.',
        },
        {
          title: 'Immunological medicine',
          text: 'Smarter treatments that work with the immune system, not against it.',
        },
      ],
    },
    {
      key: 'values',
      tab: 'What we stand for',
      items: [
        {
          title: 'Scientific rigour',
          text: "Every idea is tested in the lab. If the data doesn't support it, we don't claim it.",
        },
        {
          title: 'Made in India',
          text: 'Designed and manufactured here, so cost never decides who gets treated.',
        },
        {
          title: 'Global impact',
          text: 'These problems exist in every country. Our solutions are built for the world.',
        },
      ],
    },
  ],
};

export const technology = {
  eyebrow: 'Our Technology',
  title: ['Four technologies.', 'One mission: keep people alive.'],
  lead: "Designed and developed in our own laboratory. Each one targets a moment where today's medicine falls short.",
  items: [
    {
      id: 'v-seal',
      name: 'V Seal',
      visual: 'seal',
      tagline: 'Stops the bleed. Seals the vessel.',
      problem:
        'Most products for bleeding control are passive. They soak up blood and wait for a clot, which often comes too late.',
      solution:
        'V Seal acts directly at the damaged blood vessel and forms a strong seal, so bleeding stops quickly.',
      points: [
        'Simple enough for paramedics, soldiers and first responders',
        'Controls bleeding in places surgeons struggle to reach',
        'Affordable for every hospital in India',
      ],
      usedIn: ['Road accidents', 'Battlefield care', 'Surgery', 'Emergency response'],
      status: { label: 'Patent pending', detail: 'Indian Patent Application No. 202611070798', kind: 'patent' },
    },
    {
      id: 'venom-seal',
      name: 'Venom Seal',
      visual: 'clot',
      tagline: "Learning from nature's fastest clotting system.",
      problem: 'Some snake venoms clot blood within seconds. In the most severe bleeding, that speed matters.',
      solution:
        'A bioengineered product inspired by how these compounds trigger clotting, with no real venom and nothing toxic.',
      points: [
        'Built for the most dangerous bleeding',
        'Takes the clotting power, leaves out the danger',
        'With V Seal, covers every bleeding emergency',
      ],
      usedIn: ['Severe trauma', 'Military medicine', 'High-risk surgery'],
      status: { label: 'Laboratory stage', kind: 'lab' },
    },
    {
      id: 'cell-fuse',
      name: 'Cell Fuse',
      visual: 'cells',
      tagline: "Saving cells before it's too late.",
      problem:
        "After a heart attack, many damaged cells are still alive, but they die over the next few hours. Heart muscle never grows back.",
      solution:
        'Cell Fuse delivers what damaged cells need to survive, in the short window before damage becomes permanent.',
      points: [
        'Heart attacks, brain and spinal cord injuries',
        'Severe burns and crush injuries',
        'Keeps donor organs healthy before transplant',
      ],
      usedIn: ['Heart attacks', 'Brain and spinal injury', 'Burns', 'Organ transplants'],
      status: { label: 'Laboratory stage', kind: 'lab' },
    },
    {
      id: 'aurest-kage',
      name: 'Aurest Kage',
      visual: 'kage',
      tagline: 'Protect it. Guide it. Release it at the right place.',
      problem:
        "Many good medicines fail not because they don't work, but because the body breaks them down before they arrive.",
      solution: 'Kage means "shadow" in Japanese. Our delivery platform hides medicine from the body\'s defences.',
      points: [
        "Protects the medicine so it isn't destroyed",
        'Guides it to the exact organ or tissue',
        'Releases it only when it arrives',
      ],
      usedIn: ['Cancer', 'Autoimmune diseases', 'Gene therapy', 'All Aurest products'],
      status: { label: 'Laboratory stage', kind: 'lab' },
    },
  ],
};

export const vision = {
  eyebrow: 'Our Vision',
  title: 'This is just the beginning.',
  lead: "Our four technologies are Phase One. Here's where we're heading next, with goals we're committed to for decades.",
  items: [
    {
      name: 'Organ Bioprinting',
      problem: 'Patients die waiting for organ donors who never come.',
      idea: "Print living tissue from the patient's own cells. No donor, no waiting list, no rejection.",
      steps: ['Skin', 'Cartilage', 'Blood vessels', 'Liver tissue'],
      goal: 'Organ replacement every Indian can afford.',
    },
    {
      name: 'Haemodust',
      problem: 'Donated blood spoils in weeks, needs a fridge and a matching blood type.',
      idea: '"Blood in a packet": a dry powder you mix with clean water and give to anyone.',
      compare: [
        { label: 'Lasts', from: '35 to 42 days', to: 'Years' },
        { label: 'Storage', from: 'Fridge', to: 'Room temp' },
        { label: 'Blood type', from: 'Must match', to: 'Anyone' },
      ],
      goal: 'Blood support in every ambulance, army kit and village clinic.',
    },
    {
      name: 'The Dream Protocol',
      problem: 'How do we make the human body harder to kill?',
      idea: "Understand the body's breaking points, like unstoppable bleeding or brain cells starved of oxygen, and push them back.",
      goal: 'More time for doctors to save lives.',
    },
  ],
  closing: [{ text: 'Widen the window in which' }, { text: 'a life can be saved.', hl: true }],
};

export const founder = {
  eyebrow: 'Founder',
  name: 'Priyanshu Sharma',
  role: 'Founder & CEO, Aurest Biotech',
  photo: '/images/founder.png',
  initials: 'PS',
  linkedin: 'https://www.linkedin.com/in/priyanshu-sharma-1a5a33429/',
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
};
