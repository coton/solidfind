// SolidFind — shared data (loaded first, exposes globals)

// ── Main categories: tagline + sub-categories ───────────────────
const MAIN_CATS = [
  {
    num: '01', name: 'Construction',
    tagline: 'Find construction professionals for residential, commercial and hospitality projects.',
    subs: ['Residential', 'Commercial', 'Hospitality'],
  },
  {
    num: '02', name: 'Renovation',
    tagline: 'Find renovation professionals for complete upgrades, targeted improvements, and structural work.',
    subs: ['Complete house', 'Living room', 'Kitchen', 'Bathroom', 'Bedroom', 'Electricity', 'Plumbing', 'Roofing', 'Waterproofing', 'Pool', 'Mold treatment', 'Tiling', 'Painting', 'Aircon'],
  },
  {
    num: '03', name: 'Architecture',
    tagline: 'Find architecture studios or companies for concept design, planning, and project development.',
    subs: ['Residential', 'Commercial', 'Renovations & extensions', 'Sustainable / eco-archi.'],
  },
  {
    num: '04', name: 'Interior',
    tagline: 'Find interior professionals for space planning, styling, furniture and full interior projects.',
    subs: ['Residential', 'Commercial', 'Hospitality', 'Furnitures', 'Lighting', 'Styling & decoration'],
  },
  {
    num: '05', name: 'Real Estate',
    tagline: 'Find real estate professionals for property acquisition, sales, and investment opportunities.',
    subs: ['Residential', 'Commercial', 'Land & development plots', 'Property management', 'Legal & notary services'],
  },
];

const SIZE_OPTS = ['Solo / Couple', 'Family / Co-Hosting', 'Shared / Community'];
const SIZE_RANGE = { 'Solo / Couple': '1–2', 'Family / Co-Hosting': '3–6', 'Shared / Community': '7+' };

// Bali regencies / city
const LOCATIONS = ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Buleleng', 'Karangasem', 'Klungkung', 'Bangli', 'Jembrana'];

const subsFor = (mainName) => (MAIN_CATS.find(m => m.name === mainName) || {}).subs || [];

// ── Professionals (base set) ────────────────────────────────────
const PRO_BASE = [
  // Construction
  { id: 'p2',  name: 'Karya Wisma',   main: 'Construction', discipline: 'General contractor',     city: 'Badung',     size: 'Large',  subs: ['Commercial', 'Hospitality'],                  rating: 4.7, reviewCount: 142, verified: true,  photo: '../../assets/photo-construction-wide.jpg', desc: 'A full-service general contractor delivering commercial and hospitality builds across South Bali. Structure, MEP coordination and fit-out under one roof, with fixed schedules and transparent monthly billing.' },
  { id: 'p7',  name: 'Beton Murni',   main: 'Construction', discipline: 'Structural & concrete',  city: 'Denpasar',   size: 'Large',  subs: ['Commercial'],                                 rating: 4.7, reviewCount: 97,  verified: true,  photo: '../../assets/concrete-1.jpg', desc: 'Structural and concrete specialists for mid- to large-scale commercial projects. Formwork, reinforcement and cast-in-place expertise backed by in-house QA and tested mix designs.' },
  { id: 'p12', name: 'Cor & Co',      main: 'Construction', discipline: 'Foundations & shell',    city: 'Gianyar',    size: 'Medium', subs: ['Residential', 'Commercial'],                  rating: 4.6, reviewCount: 41,  verified: true,  photo: '../../assets/concrete-2.jpg', desc: 'Foundations and building-shell contractor for residential and commercial sites. Piling, slabs and superstructure delivered to engineer drawings with careful on-site supervision.' },
  { id: 'p4',  name: 'Kayu & Beton',  main: 'Construction', discipline: 'Build & materials',      city: 'Tabanan',    size: 'Small',  subs: ['Residential', 'Hospitality'],                 rating: 4.6, reviewCount: 0,  verified: false, photo: '../../assets/photo-bricks.jpg', desc: 'Boutique builder and materials supplier pairing local timber with concrete for warm, durable homes and small hospitality projects. Hands-on owner involvement on every site.' },
  // Renovation
  { id: 'p6',  name: 'Sketsa Build',  main: 'Renovation',   discipline: 'Renovation & remodel',   city: 'Denpasar',   size: 'Medium', subs: ['Kitchen', 'Bathroom', 'Tiling'],              rating: 4.5, reviewCount: 64,  verified: false, photo: '../../assets/photo-detail.jpg', desc: 'Kitchen and bathroom remodels with crisp tiling and tidy wet-works. Detailed scopes, dust control and clear day-by-day schedules so you can keep living at home during the works.' },
  { id: 'p10', name: 'Tata Ulang',    main: 'Renovation',   discipline: 'Home renovation',        city: 'Buleleng',   size: 'Small',  subs: ['Complete house', 'Painting', 'Aircon'],       rating: 4.3, reviewCount: 58,  verified: true,  photo: '../../assets/photo-bricks.jpg', desc: 'Whole-house renovations and repaints that refresh tired homes end to end. Handles aircon, finishes and snagging with a small, reliable crew you will see on site daily.' },
  { id: 'p16', name: 'Pulih Karya',   main: 'Renovation',   discipline: 'Wet works & waterproofing', city: 'Badung',  size: 'Medium', subs: ['Bathroom', 'Waterproofing', 'Pool', 'Plumbing'], rating: 4.6, reviewCount: 47, verified: true, photo: '../../assets/photo-warm.jpg', desc: 'Specialists in waterproofing, pools and plumbing for tropical conditions. Leak diagnosis, membrane systems and bathroom rebuilds backed by workmanship warranties.' },
  // Architecture
  { id: 'p1',  name: 'Studio Tarra',  main: 'Architecture', discipline: 'Architecture studio',    city: 'Gianyar',    size: 'Medium', subs: ['Residential', 'Sustainable / eco-archi.'], services: MAIN_CATS.map(m => ({ name: m.name, subs: [...m.subs] })), sizes: [...SIZE_OPTS], areas: [...LOCATIONS],    rating: 4.9, reviewCount: 86,  verified: true,  photo: '../../assets/photo-architecture.jpg', desc: 'An architecture studio working in a tropical-modern language with a strong sustainability bias. Concept through construction documents, with measured briefs and locally-sourced materials.' },
  { id: 'p5',  name: 'Atelier Banda', main: 'Architecture', discipline: 'Residential architect',  city: 'Denpasar',   size: 'Small',  subs: ['Residential'],                                rating: 5.0, reviewCount: 28,  verified: true,  photo: '../../assets/photo-house.jpg', desc: 'Residential architect crafting calm, light-filled homes tailored to site and climate. Close client collaboration from first sketch to handover, with a small annual project cap.' },
  { id: 'p11', name: 'Reka Arsitek',  main: 'Architecture', discipline: 'Architecture & planning', city: 'Badung',    size: 'Large',  subs: ['Commercial', 'Renovations & extensions'],     rating: 4.8, reviewCount: 73,  verified: true,  photo: '../../assets/photo-construction-wide.jpg', desc: 'Commercial architecture and planning practice handling extensions, fit-outs and new builds. Strong on permitting, code and contractor coordination for complex sites.' },
  // Interior
  { id: 'p3',  name: 'Rumah Tenang',  main: 'Interior',     discipline: 'Interior design',        city: 'Gianyar',    size: 'Small',  subs: ['Residential', 'Styling & decoration'],        rating: 4.8, reviewCount: 51,  verified: false, photo: '../../assets/photo-warm.jpg', desc: 'Residential interior design with a quiet, layered aesthetic. Space planning, styling and bespoke joinery that make everyday rooms feel considered and restful.' },
  { id: 'p9',  name: 'Ruang Hangat',  main: 'Interior',     discipline: 'Interior & styling',     city: 'Denpasar',   size: 'Small',  subs: ['Residential', 'Furnitures', 'Lighting'],      rating: 4.9, reviewCount: 44,  verified: true,  photo: '../../assets/photo-warm.jpg', desc: 'Interiors, furniture and lighting for warm, characterful homes. Sourcing, custom pieces and full styling delivered as one coordinated package.' },
  { id: 'p13', name: 'Pola Interior', main: 'Interior',     discipline: 'Commercial interior',    city: 'Badung',     size: 'Medium', subs: ['Commercial', 'Hospitality', 'Lighting'],      rating: 4.5, reviewCount: 62,  verified: false, photo: '../../assets/photo-detail.jpg', desc: 'Commercial and hospitality interiors for cafes, offices and villas. Brand-led concepts, lighting design and full procurement with on-site installation oversight.' },
  // Real Estate
  { id: 'p8',  name: 'Grha Estate',   main: 'Real Estate',  discipline: 'Property & listings',    city: 'Karangasem', size: 'Large',  subs: ['Residential', 'Property management'],         rating: 4.4, reviewCount: 39,  verified: true,  photo: '../../assets/photo-house.jpg', desc: 'Property listings and management across East Bali. Sales, leasing and day-to-day estate management handled by a responsive, locally-rooted team.' },
  { id: 'p14', name: 'Sewa Properti', main: 'Real Estate',  discipline: 'Rentals & sales',        city: 'Klungkung',  size: 'Small',  subs: ['Residential'],                                rating: 4.2, reviewCount: 0,  verified: false, photo: '../../assets/photo-architecture.jpg', desc: 'Rentals and resale specialists for residential property. Honest valuations, tenant placement and straightforward paperwork for owners and buyers alike.' },
  { id: 'p15', name: 'Nusa Properti', main: 'Real Estate',  discipline: 'Land & development',     city: 'Tabanan',    size: 'Large',  subs: ['Land & development plots', 'Commercial', 'Legal & notary services'], rating: 4.6, reviewCount: 88, verified: true, photo: '../../assets/photo-house.jpg', desc: 'Land, development plots and commercial real estate with full legal and notary support. Due diligence, zoning guidance and investment structuring under one roof.' },
];

// Derive company facts + contact channels from the base record, deterministically,
// so every listing carries: project count, team size, founding year, and socials.
const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '');
const sizeTeam = { 'Solo / Couple': 6, 'Family / Co-Hosting': 20, 'Shared / Community': 60 };
const enrich = (p, seed) => {
  const handle = slug(p.name);
  return {
    projects: 18 + ((p.reviewCount + seed * 7) % 120),
    team: sizeTeam[p.size] || 15,
    founded: 1998 + ((p.reviewCount + seed * 3) % 24),
    contact: {
      email: 'hello@' + handle + '.id',
      whatsapp: '+62 81' + (700000000 + (p.reviewCount * 130000 + seed * 91337) % 99999999),
      facebook: handle,
      instagram: handle + '.id',
      linkedin: p.name.replace(/\s+/g, '-'),
    },
  };
};

// Re-map the legacy size labels onto the unified household/project-size taxonomy
const SIZE_REMAP = { Small: 'Solo / Couple', Medium: 'Family / Co-Hosting', Large: 'Shared / Community' };
PRO_BASE.forEach(p => { p.size = SIZE_REMAP[p.size] || p.size; });

// Triple the set for testing — copies get unique ids and rotated city/size for variety
const PROS = PRO_BASE.flatMap((p, i) => [0, 1, 2].map(k => ({
  ...p,
  ...enrich(p, i + k),
  id: p.id + '-' + k,
  city: k === 0 ? p.city : LOCATIONS[(i + k * 4) % LOCATIONS.length],
  size: k === 0 ? p.size : SIZE_OPTS[(SIZE_OPTS.indexOf(p.size) + k) % SIZE_OPTS.length],
})));

// ── The signed-in company (drives the dashboard) ────────────────
const COMPANY = {
  id: 'me', name: 'Studio Tarra', main: 'Architecture', discipline: 'Architecture studio',
  city: 'Gianyar', size: 'Medium', rating: 4.9, reviewCount: 86, verified: true,
  subs: ['Residential', 'Sustainable / eco-archi.'],
  photo: '../../assets/photo-architecture.jpg',
  desc: 'An architecture studio working in a tropical-modern language with a strong sustainability bias. Concept through construction documents, with measured briefs and locally-sourced materials.',
  completion: 72, bookmarks: 248, bookmarksWeek: 18,

  // company facts shown on the public profile
  projects: 64, team: 24, founded: 2011,

  // services & coverage exactly as entered on the profile-edit page.
  // (this company is fully activated — every category, size and region — to
  //  demonstrate a maximised profile.)
  services: MAIN_CATS.map(m => ({ name: m.name, subs: [...m.subs] })),
  sizes: [...SIZE_OPTS],
  areas: [...LOCATIONS],
  contact: {
    email: 'hello@studiotarra.id',
    whatsapp: '+62 812 3456 7890',
    facebook: 'studiotarra',
    instagram: 'studiotarra.id',
    linkedin: 'Studio-Tarra',
  },

  // up to 12 portfolio images/videos (Pro Account benefit)
  gallery: [
    '../../assets/photo-architecture.jpg', '../../assets/photo-bricks.jpg',
    '../../assets/photo-house.jpg', '../../assets/photo-detail.jpg',
    '../../assets/photo-warm.jpg', '../../assets/concrete-1.jpg',
    '../../assets/concrete-2.jpg', '../../assets/photo-construction-wide.jpg',
    '../../assets/photo-architecture.jpg', '../../assets/photo-house.jpg',
    '../../assets/photo-detail.jpg', '../../assets/photo-warm.jpg',
  ],

  // ── Pro Account analytics (extended dashboard) ───────────────
  analytics: {
    viewsThisMonth: 1284,
    viewsMonthDelta: 22,          // % vs last month
    totalViews: 9460,
    byMonth: [                    // last 8 months of profile views
      { m: 'Nov', v: 540 }, { m: 'Dec', v: 610 }, { m: 'Jan', v: 720 },
      { m: 'Feb', v: 690 }, { m: 'Mar', v: 880 }, { m: 'Apr', v: 1010 },
      { m: 'May', v: 1052 }, { m: 'Jun', v: 1284 },
    ],
    foundVia: [                   // where viewers came from — mostly by location
      { label: 'Location search', pct: 58 },
      { label: 'Category browse', pct: 27 },
      { label: 'Direct / shared', pct: 15 },
    ],
    // the regions clients most often found this company through
    topLocations: [
      { city: 'Badung',   pct: 41 },
      { city: 'Denpasar', pct: 23 },
      { city: 'Gianyar',  pct: 17 },
      { city: 'Tabanan',  pct: 11 },
      { city: 'Other',    pct: 8 },
    ],
  },

  // new reviews awaiting acknowledgement (drives the dashboard bell)
  notifications: [
    { author: 'Pak Andi', rating: 5, when: '2h ago',    text: 'Quiet, careful, and absolutely on time.' },
    { author: 'Bu Maya',  rating: 5, when: 'Yesterday',  text: 'Drawings were clear, the build was clean.' },
    { author: 'Pak Joko', rating: 4, when: '3 days ago', text: 'Calm, organised process the whole way.' },
  ],

  reviews: [
    { author: 'Pak Andi', context: 'Renovation · 2 months ago', rating: 5, isNew: true, text: 'Quiet, careful, and absolutely on time. Solid work from brief to handover.' },
    { author: 'Bu Maya',  context: 'New build · 5 months ago',  rating: 5, isNew: true, text: 'Patient through every iteration. Drawings were clear, the build was clean.' },
    { author: 'Pak Joko', context: 'Interior · 3 weeks ago',    rating: 4, isNew: true, text: 'Great communication and a calm, organised process the whole way through.' },
    { author: 'Bu Sari',  context: 'Extension · 6 months ago',  rating: 5, text: 'They handled the permits and contractors so we never had to chase anyone.' },
  ],
};

Object.assign(window, { MAIN_CATS, SIZE_OPTS, SIZE_RANGE, LOCATIONS, subsFor, PROS, COMPANY });

// ── The signed-in individual (drives the user / "For individuals" dashboard) ──
const USER = {
  name: 'Andi Pratama',
  email: 'andi.pratama@gmail.com',
  household: 'Family / Co-Hosting',
  savedIds: [
    // a deliberately large Construction set to exercise the "see all" behaviour
    'p2-0', 'p2-1', 'p2-2', 'p7-0', 'p7-1', 'p7-2', 'p12-0', 'p12-1', 'p12-2', 'p4-0',
    // a few across other categories
    'p1-0', 'p5-0', 'p6-0', 'p16-0', 'p3-0', 'p9-0', 'p8-0',
  ],
  reviews: [
    { companyId: 'p1-0', company: 'Studio Tarra', main: 'Architecture', rating: 5, when: '2 weeks ago', text: 'Calm, careful and exactly on schedule. The drawings made every decision easy.' },
    { companyId: 'p6-0', company: 'Sketsa Build',  main: 'Renovation',   rating: 4, when: '3 months ago', text: 'Tidy wet-works and clear daily updates — we could keep living at home throughout.' },
    { companyId: 'p8-0', company: 'Grha Estate',   main: 'Real Estate',  rating: 5, when: '6 months ago', text: 'Honest valuation and zero chasing. Paperwork handled end to end.' },
    { companyId: 'p2-0', company: 'Karya Wisma',   main: 'Construction', rating: 5, when: '8 months ago', text: 'Big build, calmly run. Monthly billing was transparent the whole way.' },
    { companyId: 'p3-0', company: 'Rumah Tenang',  main: 'Interior',     rating: 4, when: '10 months ago', text: 'Lovely, restful rooms. A couple of small delays but communication was good.' },
  ],
};
// resolve saved ids to full pro records, grouped by main category
const SAVED = USER.savedIds.map(id => PROS.find(p => p.id === id)).filter(Boolean);
const SAVED_BY_CAT = MAIN_CATS
  .map(m => ({ cat: m.name, num: m.num, items: SAVED.filter(p => p.main === m.name) }))
  .filter(g => g.items.length > 0);

Object.assign(window, { USER, SAVED, SAVED_BY_CAT });

// ── Back-office: About page content (editable entries; EN) ──────
const ABOUT_CONTENT = {
  tagline: 'An independent platform built to bring clarity, trust & perspective to the places people live in.',
  heroSub: 'For individuals to find professionals — and for professionals to be visible.',
  description:
    "Finding the right professional shouldn't feel random. And being a good professional shouldn't depend only on algorithms or word of mouth.\n\n" +
    "Today, as individuals, it is not easy to find reliable contacts. For professionals, it isn't easy being visible beyond word of mouth and social networks. The market is fragmented. Information is scattered. Visibility is inconsistent. SolidFind now exists to structure that space — not to replace relationships, not to interfere in projects, but to make discovery clear, professional, and accessible.",
  individualDesc: 'For property owners & renters — browse listings, bookmark companies and find the right professionals for your project. Choose your household type: Solo / Couple, Family / Co-Hosting, or Shared / Community and explore from there.',
  companyDesc: 'For construction & renovation professionals — create your company profile, showcase up to 4 project photos, describe your most expert services and their location, and get discovered by potential clients all across Bali.',
  proDesc: 'Your profile, fully yours. Pro gives you top placement in search results, detailed visibility analytics, up to 12 project photos, and access to ad placements across the platform. Built for companies that take their reputation seriously.',
  contactText: 'SolidFind is still in its launching phase. Questions, feedback, or partnership inquiries are all welcome — and please tell us if you find a bug.',
  contactEmail: 'hello@solidfind.id',
};

// ── Back-office: Settings flags (front-end respects these) ──────
const SETTINGS = {
  proEnabled: true,      // Pro feature: pro badge on cards, Pro insights, Pro Account label
  reviewsEnabled: true,  // Review system: review buttons, review sections, company score
  pricingPhase: 'launch' // 'launch' | 'standard'
};

Object.assign(window, { ABOUT_CONTENT, SETTINGS });

// ── Back-office: Featured articles (title / subtitle / categories / cover / blocks) ──
const ARTICLES = [
  {
    id: 'art-permits',
    title: 'Building permits in Bali, explained',
    subtitle: 'What every owner should know about PBG & SLF before breaking ground.',
    cats: ['Construction', 'Renovation', 'Architecture'],
    visible: true,
    cover: '../../assets/photo-construction-wide.jpg',
    blocks: [
      { type: 'text', text: 'Permitting is the step most first-time builders underestimate. Getting it right up front saves months of delay and keeps your project on the legal side of an increasingly enforced framework.' },
      { type: 'heading', text: 'Start with the PBG' },
      { type: 'text', text: 'The Persetujuan Bangunan Gedung (PBG) replaced the old IMB. It approves your building against the technical standards and zoning for your plot, and must be secured before construction begins.' },
      { type: 'image', src: '../../assets/photo-detail.jpg', caption: 'Detailed drawings are submitted as part of the PBG application.' },
      { type: 'quote', text: 'Treat permitting as part of the design phase, not an afterthought — it shapes what you can actually build.', cite: 'Studio Tarra' },
      { type: 'heading', text: 'Then the SLF' },
      { type: 'text', text: 'Once built, the Sertifikat Laik Fungsi (SLF) certifies the building is fit for use. Banks, notaries and serious tenants will ask for it, so budget the time to obtain it before handover.' },
      { type: 'video', poster: '../../assets/photo-house.jpg', caption: 'Walkthrough: a compliant residential build from permit to handover.' },
    ],
  },
  {
    id: 'art-materials',
    title: 'Choosing materials for the tropics',
    subtitle: 'Why local stone, hardwood and lime plaster outlast imported finishes.',
    cats: ['Architecture', 'Interior', 'Renovation'],
    visible: true,
    cover: '../../assets/photo-warm.jpg',
    blocks: [
      { type: 'text', text: 'Bali’s humidity, salt air and intense sun are unforgiving. The materials that age well here are rarely the ones that photograph best in a showroom.' },
      { type: 'heading', text: 'Work with the climate' },
      { type: 'text', text: 'Breathable finishes like lime plaster shrug off moisture that traps behind cement render. Local hardwoods, properly seasoned, move less than imported softwoods.' },
      { type: 'quote', text: 'The cheapest material is the one you never have to replace.', cite: 'Atelier Banda' },
    ],
  },
];

Object.assign(window, { ARTICLES });
