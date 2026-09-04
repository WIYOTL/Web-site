import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ArrowRight, Bell, BookOpen, Check, ChevronLeft, ChevronRight, CircleUserRound,
  Compass, ExternalLink, Github, Heart, Instagram, Layers3, LockKeyhole, LogIn,
  Mail, Menu, MessageCircle, Moon, MoreHorizontal, Play, Plus, Search, Settings,
  Sparkles, Star, UserPlus, Users, X, Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Category = 'Jeux vidéo' | 'Applications' | 'Intelligence Artificielle' | 'Mods et Shaders';
type Project = {
  id: string; name: string; category: Category; type: string; platforms: string[]; status: string;
  price: string; description: string; image: string; accent: string; featured?: boolean; tags: string[];
};
type Action = { project_id: string; is_wishlisted: boolean; is_following: boolean };
type Page = 'home' | 'projects' | 'gallery' | 'about' | 'contact' | 'legal' | 'profile';

const images = {
  city: 'https://images.pexels.com/photos/37911520/pexels-photo-37911520.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  cityTwo: 'https://images.pexels.com/photos/3337211/pexels-photo-3337211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  glass: 'https://images.pexels.com/photos/11458867/pexels-photo-11458867.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  code: 'https://images.pexels.com/photos/6424590/pexels-photo-6424590.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  mountain: 'https://images.pexels.com/photos/207130/pexels-photo-207130.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  forest: 'https://images.pexels.com/photos/14332269/pexels-photo-14332269.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

const projects: Project[] = [
  { id: 'shadow-of-the-city', name: 'Shadow of the City', category: 'Jeux vidéo', type: 'Jeu vidéo', platforms: ['PC', 'Consoles'], status: 'En développement', price: 'Bientôt disponible', description: 'Une ville verticale, des secrets enfouis et une ombre qui vous observe.', image: images.city, accent: '#2f8cff', featured: true, tags: ['Narratif', 'Exploration'] },
  { id: 'solkars-chronicles', name: "The Legend of the Seven Worlds: Solkar's Chronicles", category: 'Jeux vidéo', type: 'Jeu vidéo', platforms: ['PC', 'Consoles', 'Mobiles'], status: 'En développement', price: 'Bientôt disponible', description: 'Sept mondes. Une légende. Le début d’un voyage sans limite.', image: images.mountain, accent: '#4ca8ff', tags: ['Aventure', 'Fantasy'] },
  { id: 'the-last-echoe', name: 'The Last Echoe', category: 'Jeux vidéo', type: 'Jeu vidéo', platforms: ['PC'], status: 'Suggestions pour vous', price: 'Bientôt disponible', description: 'Écoutez ce qui reste lorsque le monde devient silencieux.', image: images.forest, accent: '#83bfff', tags: ['Atmosphérique', 'Indépendant'] },
  { id: 'treeport', name: 'Treeport', category: 'Applications', type: 'Application', platforms: ['PC', 'Mobiles'], status: 'Nouveau', price: 'Gratuit', description: 'Un espace calme pour organiser vos idées, vos projets et vos journées.', image: images.glass, accent: '#56d4c7', featured: true, tags: ['Productivité', 'Organisation'] },
  { id: 'project-builder-pro', name: 'Project Builder Pro', category: 'Applications', type: 'Logiciel technique', platforms: ['PC'], status: 'Sorti récemment', price: 'Gratuit', description: 'Construisez plus vite. Visualisez mieux. Donnez forme à vos idées.', image: images.code, accent: '#3ba7ff', tags: ['Création', 'Outils'] },
  { id: 'shark-ai', name: 'Shark.AI', category: 'Intelligence Artificielle', type: 'Projet IA', platforms: ['PC', 'Cloud'], status: 'En développement', price: 'Bientôt disponible', description: 'Une intelligence artificielle pensée pour explorer de nouvelles possibilités.', image: images.glass, accent: '#6ee7ff', featured: true, tags: ['IA', 'Recherche'] },
  { id: 'the-monsters-walk', name: "The Monster's Walk", category: 'Mods et Shaders', type: 'Mod Minecraft', platforms: ['Minecraft Java'], status: 'Nouveau', price: 'Gratuit', description: 'Le monde cubique ne sera plus jamais tout à fait le même.', image: images.cityTwo, accent: '#6d9fff', tags: ['Minecraft', 'Mod'] },
  { id: 'mirror-shaders', name: 'Mirror Shaders', category: 'Mods et Shaders', type: 'Shader Pack Minecraft', platforms: ['Minecraft Java'], status: 'Terminé', price: 'Gratuit', description: 'Une lumière plus profonde, des reflets plus vivants, un monde réinventé.', image: images.mountain, accent: '#7cc9ff', tags: ['Minecraft', 'Shader Pack'] },
];

const categories: Category[] = ['Jeux vidéo', 'Applications', 'Intelligence Artificielle', 'Mods et Shaders'];
const slides = [
  { eyebrow: 'Nouveautés', title: 'L\u2019avenir prend forme.', text: 'D\u00e9couvrez les nouveaux projets qui ouvrent le prochain chapitre de Wiyotl.', image: images.city, projectId: 'shadow-of-the-city' },
  { eyebrow: 'Nouveautés', title: 'Solkar\u2019s Chronicles', text: 'Sept mondes. Une l\u00e9gende. Le voyage commence bient\u00f4t.', image: images.mountain, projectId: 'solkars-chronicles' },
  { eyebrow: 'Nouveautés', title: 'Cr\u00e9er, autrement.', text: 'Des outils num\u00e9riques con\u00e7us pour transformer les id\u00e9es en exp\u00e9riences.', image: images.glass, projectId: 'treeport' },
];

function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('wiyotl-sidebar') !== 'closed');
  const [slide, setSlide] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [session, setSession] = useState<{ email?: string } | null>(null);
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [activeGallery, setActiveGallery] = useState<Project | null>(null);

  useEffect(() => { localStorage.setItem('wiyotl-sidebar', sidebarOpen ? 'open' : 'closed'); }, [sidebarOpen]);
  useEffect(() => {
    const timer = window.setInterval(() => setSlide(current => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session?.user ? { email: data.session.user.email } : null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession?.user ? { email: nextSession.user.email } : null);
      if (nextSession?.user) {
        (async () => {
          if (!supabase) return;
          const { data } = await supabase.from('wiyotl_project_actions').select('project_id, is_wishlisted, is_following');
          if (data) setActions(Object.fromEntries(data.map(action => [action.project_id, action])));
        })();
      } else setActions({});
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const openProject = (project: Project) => { setSelectedProject(project); setPage('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const navigate = (nextPage: Page) => { setSelectedProject(null); setProfileOpen(false); setPage(nextPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggleAction = async (project: Project, kind: 'wishlist' | 'following') => {
    if (!session || !supabase) { setAuthOpen(true); return; }
    const current = actions[project.id] || { project_id: project.id, is_wishlisted: false, is_following: false };
    const next = { ...current, [kind === 'wishlist' ? 'is_wishlisted' : 'is_following']: !current[kind === 'wishlist' ? 'is_wishlisted' : 'is_following'] };
    setActions(prev => ({ ...prev, [project.id]: next }));
    const { error } = await supabase.from('wiyotl_project_actions').upsert({ project_id: project.id, is_wishlisted: next.is_wishlisted, is_following: next.is_following }, { onConflict: 'user_id,project_id' });
    if (error) setActions(prev => ({ ...prev, [project.id]: current }));
  };

  const resultProjects = useMemo(() => projects.filter(project => `${project.name} ${project.category} ${project.type} ${project.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-is-open' : 'sidebar-is-closed'}`}>
      <Sidebar page={page} onNavigate={navigate} onClose={() => setSidebarOpen(false)} onProfile={() => setProfileOpen(true)} />
      <div className="app-main">
        <TopBar onSearch={() => setSearchOpen(true)} onProfile={() => setProfileOpen(true)} session={session} sidebarOpen={sidebarOpen} onMenuOpen={() => setSidebarOpen(true)} />
        <main>
          {page === 'home' && <Home slide={slide} setSlide={setSlide} onNavigate={navigate} onProject={openProject} onGallery={(project) => { setActiveGallery(project); setPage('gallery'); }} actions={actions} onAction={toggleAction} />}
          {page === 'projects' && <Projects selected={selectedProject} onProject={openProject} actions={actions} onAction={toggleAction} onBack={() => setSelectedProject(null)} />}
          {page === 'gallery' && <Gallery active={activeGallery} onSelect={setActiveGallery} />}
          {page === 'about' && <About />}
          {page === 'contact' && <Contact />}
          {page === 'legal' && <Legal />}
          {page === 'profile' && <Profile session={session} actions={actions} onAuth={() => setAuthOpen(true)} onNavigate={navigate} />}
        </main>
        <Footer onNavigate={navigate} />
      </div>
      {searchOpen && <SearchPanel query={query} setQuery={setQuery} results={resultProjects} onClose={() => { setSearchOpen(false); setQuery(''); }} onProject={openProject} />}
      {profileOpen && <ProfilePopover session={session} onClose={() => setProfileOpen(false)} onAuth={() => { setProfileOpen(false); setAuthOpen(true); }} onNavigate={navigate} />}
      {authOpen && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
    </div>
  );
}

function Sidebar({ page, onNavigate, onClose, onProfile }: { page: Page; onNavigate: (page: Page) => void; onClose: () => void; onProfile: () => void }) {
  const links: { label: string; page: Page; icon: ReactNode }[] = [
    { label: 'Accueil', page: 'home', icon: <Compass size={18} /> }, { label: 'À propos', page: 'about', icon: <Sparkles size={18} /> }, { label: 'Projets', page: 'projects', icon: <Layers3 size={18} /> }, { label: 'Galerie', page: 'gallery', icon: <Play size={18} /> }, { label: 'Contact', page: 'contact', icon: <MessageCircle size={18} /> },
  ];
  return <aside className="sidebar">
    <div className="sidebar-brand"><img src="/wiyotl_logo.webp" alt="Wiyotl" /><button className="icon-button sidebar-toggle" onClick={onClose} aria-label="Fermer le menu"><X size={17} /></button></div>
    <div className="sidebar-rule" />
    <nav>{links.map(link => <button key={link.page} className={`nav-link ${page === link.page ? 'active' : ''}`} onClick={() => { onNavigate(link.page); onClose(); }}>{link.icon}<span>{link.label}</span></button>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-note"><Zap size={15} /><span>Créer le futur.</span></div><button className="nav-link" onClick={() => { onProfile(); onClose(); }}><CircleUserRound size={18} /><span>Mon espace</span></button></div>
  </aside>;
}

function TopBar({ onSearch, onProfile, session, sidebarOpen, onMenuOpen }: { onSearch: () => void; onProfile: () => void; session: { email?: string } | null; sidebarOpen: boolean; onMenuOpen: () => void }) {
  return <header className="topbar">{!sidebarOpen && <button className="mobile-menu icon-button" onClick={onMenuOpen} aria-label="Ouvrir le menu"><Menu size={20} /></button>}<div className="topbar-status"><span className="status-dot" /> Studio indépendant · Créations en mouvement</div><div className="topbar-actions"><button className="top-action" onClick={onSearch}><Search size={18} /><span>Rechercher</span><kbd>⌘ K</kbd></button><button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><i /></button><button className="account-button" onClick={onProfile}>{session ? <span className="avatar">{session.email?.[0]?.toUpperCase() || 'W'}</span> : <CircleUserRound size={20} />}<span>{session ? 'Mon compte' : 'Se connecter'}</span></button></div></header>;
}

function Home({ slide, setSlide, onNavigate, onProject, onGallery, actions, onAction }: { slide: number; setSlide: (value: number) => void; onNavigate: (page: Page) => void; onProject: (project: Project) => void; onGallery: (project: Project) => void; actions: Record<string, Action>; onAction: (project: Project, kind: 'wishlist' | 'following') => void }) {
  const current = slides[slide];
  const featured = projects.filter(project => project.featured);
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());
  const [newsVisible, setNewsVisible] = useState(true);
  const statusFilters = ['En développement', 'Sorti récemment', 'Nouveau', 'Suggestions pour vous', 'Terminé'];
  const statusCounts = useMemo(() => { const counts: Record<string, number> = {}; projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; }); return counts; }, []);
  const categoryCounts = useMemo(() => { const counts: Record<string, number> = {}; projects.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; }); return counts; }, []);
  const toggleStatus = (s: string) => setActiveStatuses(prev => { const next = new Set(prev); if (next.has(s)) next.delete(s); else next.add(s); return next; });
  const toggleCategory = (cat: Category) => setActiveCategories(prev => { const next = new Set(prev); if (next.has(cat)) next.delete(cat); else next.add(cat); return next; });
  const visibleCategories = activeCategories.size === 0 ? categories : categories.filter(cat => activeCategories.has(cat));
  const hasMatches = visibleCategories.some(cat => projects.some(p => p.category === cat && (activeStatuses.size === 0 || activeStatuses.has(p.status))));
  return <>
    <section className="hero-slider" style={{ backgroundImage: `url(${current.image})` }}><div className="hero-shade" /><div className="hero-content"><span className="eyebrow">{current.eyebrow}</span><h1>{current.title}</h1><p>{current.text}</p><button className="primary-button" onClick={() => { const p = projects.find(p => p.id === current.projectId); if (p) onProject(p); }}>Découvrir<ArrowRight size={17} /></button></div><div className="hero-label">Nouveautés <span>{String(slide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span></div><div className="slider-controls"><button className="circle-control" onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} aria-label="Slide précédent"><ChevronLeft size={18} /></button><button className="circle-control" onClick={() => setSlide((slide + 1) % slides.length)} aria-label="Slide suivant"><ChevronRight size={18} /></button></div></section>
    <section className="intro"><img src="/wiyotl_logo.webp" alt="Wiyotl" className="main-logo" /><p className="tagline">Créer le futur. <span>Inspirer le monde.</span></p></section>
    <section className="section-block news-section"><div className="section-heading"><div><span className="section-kicker"><i className="blue-square" /> Actualités</span></div><div className="heading-controls"><button className={`toggle-square ${newsVisible ? 'active' : ''}`} onClick={() => setNewsVisible(v => !v)}>{newsVisible ? <Check size={13} /> : <Plus size={13} />}</button><span>Afficher les actualités</span></div></div>{newsVisible ? <><div className="news-filters"><div className="filter-group"><span className="filter-label">Statut</span>{statusFilters.map(s => <button key={s} className={`filter-chip ${activeStatuses.has(s) ? 'selected' : ''}`} onClick={() => toggleStatus(s)}>{s} <i>({statusCounts[s] || 0})</i></button>)}</div><div className="filter-group"><span className="filter-label">Catégorie</span>{categories.map(cat => <button key={cat} className={`filter-chip ${activeCategories.has(cat) ? 'selected' : ''}`} onClick={() => toggleCategory(cat)}>{cat} <i>({categoryCounts[cat] || 0})</i></button>)}</div></div>{hasMatches ? <div className="news-carousel">{visibleCategories.map(category => <CategoryColumn key={category} category={category} activeStatuses={activeStatuses} onProject={onProject} actions={actions} onAction={onAction} />)}</div> : <div className="news-empty"><p>Aucun projet ne correspond aux filtres sélectionnés.</p></div>}</> : <div className="news-empty"><p>Les actualités sont masquées. Activez l'option pour les afficher.</p></div>}</section>
    <section className="section-block featured-section"><div className="section-heading compact"><div><span className="section-kicker"><i className="blue-square" /> Sélection Wiyotl</span><h2>À la une.</h2></div><button className="text-button" onClick={() => onNavigate('projects')}>Voir tous les projets <ArrowRight size={16} /></button></div><Carousel items={featured} actions={actions} onProject={onProject} onAction={onAction} /></section>
    <section className="about-cta"><img src="/wiyotl_logo.webp" alt="Wiyotl" className="about-cta-logo" /><button className="primary-button" onClick={() => onNavigate('about')}>En savoir plus sur Wiyotl <ArrowRight size={17} /></button></section>
    <section className="section-block discover-strip"><div><span className="section-kicker"><i className="blue-square" /> Galerie</span><h2>Entrez dans<br /><em>nos univers.</em></h2></div><div className="gallery-preview" onClick={() => onGallery(projects[0])}><img src={images.cityTwo} alt="Univers Wiyotl" /><div><span>Explorer les images</span><ArrowRight size={17} /></div></div></section>
  </>;
}

function Carousel({ items, actions, onProject, onAction }: { items: Project[]; actions: Record<string, Action>; onProject: (project: Project) => void; onAction: (project: Project, kind: 'wishlist' | 'following') => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector<HTMLElement>('.project-card')?.offsetWidth || 320;
    track.scrollBy({ left: direction * (cardWidth + 17), behavior: 'smooth' });
  };
  return <div className="carousel"><button className="carousel-arrow carousel-arrow-left" onClick={() => scrollBy(-1)} aria-label="Précédent"><ChevronLeft size={20} /></button><div className="carousel-track" ref={trackRef}>{items.map(project => <div className="carousel-slide" key={project.id}><ProjectCard project={project} actions={actions} onProject={onProject} onAction={onAction} /></div>)}</div><button className="carousel-arrow carousel-arrow-right" onClick={() => scrollBy(1)} aria-label="Suivant"><ChevronRight size={20} /></button></div>;
}

function CategoryColumn({ category, activeStatuses, onProject, actions, onAction }: { category: Category; activeStatuses: Set<string>; onProject: (project: Project) => void; actions: Record<string, Action>; onAction: (project: Project, kind: 'wishlist' | 'following') => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const categoryProjects = projects.filter(project => project.category === category && (activeStatuses.size === 0 || activeStatuses.has(project.status)));
  if (categoryProjects.length === 0) return null;
  const scrollBy = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector<HTMLElement>('.news-card')?.offsetWidth || 280;
    track.scrollBy({ left: direction * (cardWidth + 14), behavior: 'smooth' });
  };
  return <div className="category-column">
    <div className="category-title"><div><span>{category === 'Jeux vidéo' ? '01' : category === 'Applications' ? '02' : category === 'Intelligence Artificielle' ? '03' : '04'}</span><h3>{category}</h3><p>{category === 'Jeux vidéo' ? 'PC · Consoles · Mobiles' : category === 'Applications' ? 'PC · Mobiles' : category === 'Intelligence Artificielle' ? 'Recherche · Outils' : 'Minecraft · Java'}</p></div><button className="more-button" aria-label={`Options ${category}`}><MoreHorizontal size={18} /></button></div>
    <div className="category-carousel">
      <button className="carousel-arrow carousel-arrow-left small" onClick={() => scrollBy(-1)} aria-label="Précédent"><ChevronLeft size={18} /></button>
      <div className="category-track" ref={trackRef}>{categoryProjects.map(project => <button className="news-card" key={project.id} onClick={() => onProject(project)}><img src={project.image} alt="" /><span className="news-card-body"><strong>{project.name}</strong><small>{project.status} · {project.price}</small><em>{project.platforms.join(' · ')}</em></span></button>)}</div>
      <button className="carousel-arrow carousel-arrow-right small" onClick={() => scrollBy(1)} aria-label="Suivant"><ChevronRight size={18} /></button>
    </div>
  </div>;
}

function Projects({ selected, onProject, actions, onAction, onBack }: { selected: Project | null; onProject: (project: Project) => void; actions: Record<string, Action>; onAction: (project: Project, kind: 'wishlist' | 'following') => void; onBack: () => void }) {
  if (selected) return <ProjectDetail project={selected} actions={actions} onAction={onAction} onBack={onBack} />;
  return <div className="page-wrap"><PageHeader kicker="Collection Wiyotl" title={<>Tous les <em>projets.</em></>} text="Des expériences, des outils et des mondes imaginés pour ouvrir de nouvelles voies." /><div className="project-toolbar"><span>{projects.length} créations</span><div><button className="filter-chip selected">Tous</button>{categories.map(category => <button key={category} className="filter-chip">{category}</button>)}</div></div><div className="projects-page-grid">{projects.map(project => <ProjectCard key={project.id} project={project} actions={actions} onProject={onProject} onAction={onAction} />)}</div></div>;
}

function ProjectCard({ project, actions, onProject, onAction }: { project: Project; actions: Record<string, Action>; onProject: (project: Project) => void; onAction: (project: Project, kind: 'wishlist' | 'following') => void }) {
  const action = actions[project.id];
  return <article className="project-card"><div className="project-image"><img src={project.image} alt={project.name} /><span className="status-badge"><i />{project.status}</span><button className={`wish-button ${action?.is_wishlisted ? 'is-active' : ''}`} onClick={() => onAction(project, 'wishlist')} aria-label="Ajouter à la liste de souhaits"><Heart size={17} fill={action?.is_wishlisted ? 'currentColor' : 'none'} /></button><div className="card-gradient" /></div><div className="project-card-content"><div className="card-meta"><span>{project.category}</span><span>{project.price}</span></div><h3>{project.name}</h3><p>{project.description}</p><div className="card-footer"><span className="platforms">{project.platforms.join(' · ')}</span><div className="card-actions"><button className={`follow-icon ${action?.is_following ? 'is-active' : ''}`} onClick={() => onAction(project, 'following')} aria-label="Suivre le projet"><Plus size={15} /></button><button className="learn-button" onClick={() => onProject(project)}>En savoir plus <ArrowRight size={15} /></button></div></div></div></article>;
}

function ProjectDetail({ project, actions, onAction, onBack }: { project: Project; actions: Record<string, Action>; onAction: (project: Project, kind: 'wishlist' | 'following') => void; onBack: () => void }) {
  const action = actions[project.id];
  return <div className="detail-page"><button className="back-button" onClick={onBack}><ChevronLeft size={17} /> Retour aux projets</button><div className="detail-hero"><img src={project.image} alt={project.name} /><div className="detail-overlay" /><div className="detail-heading"><span className="eyebrow">{project.category} · {project.type}</span><h1>{project.name}</h1><p>{project.description}</p></div></div><div className="detail-info"><div className="detail-main"><span className="section-kicker"><i className="blue-square" /> À propos du projet</span><p className="detail-description">{project.description} Wiyotl imagine ici une expérience singulière, pensée avec soin et construite pour durer.</p><div className="detail-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><div className="detail-facts"><Fact label="Type" value={project.type} /><Fact label="Plateformes" value={project.platforms.join(' · ')} /><Fact label="Statut" value={project.status} /><Fact label="Prix" value={project.price} /></div></div><div className="detail-actions"><button className={`primary-button ${action?.is_wishlisted ? 'action-on' : ''}`} onClick={() => onAction(project, 'wishlist')}><Heart size={17} fill={action?.is_wishlisted ? 'currentColor' : 'none'} /> {action?.is_wishlisted ? 'Dans votre liste' : 'Ajouter aux souhaits'}</button><button className={`outline-button ${action?.is_following ? 'action-on' : ''}`} onClick={() => onAction(project, 'following')}><Plus size={17} /> {action?.is_following ? 'Projet suivi' : 'Suivre le projet'}</button></div><div className="detail-gallery"><div className="section-heading compact"><div><span className="section-kicker"><i className="blue-square" /> Galerie</span><h2>Un aperçu de <em>l’univers.</em></h2></div></div><div className="detail-gallery-grid"><img src={project.image} alt="" /><img src={project.category === 'Applications' ? images.code : images.cityTwo} alt="" /><img src={project.category === 'Jeux vidéo' ? images.mountain : images.glass} alt="" /></div></div></div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="fact"><span>{label}</span><strong>{value}</strong></div>; }
function PageHeader({ kicker, title, text }: { kicker: string; title: ReactNode; text: string }) { return <div className="page-header"><span className="section-kicker"><i className="blue-square" /> {kicker}</span><h1>{title}</h1><p>{text}</p></div>; }

function Gallery({ active, onSelect }: { active: Project | null; onSelect: (project: Project) => void }) {
  return <div className="page-wrap"><PageHeader kicker="Regardez de plus près" title={<>La <em>galerie.</em></>} text="Images de production, fragments d’univers et détails qui donnent vie aux créations Wiyotl." /><div className="gallery-select">{projects.map(project => <button className={active?.id === project.id ? 'active' : ''} key={project.id} onClick={() => onSelect(project)}><img src={project.image} alt="" /><span>{project.name}</span><ArrowRight size={15} /></button>)}</div>{active ? <div className="gallery-wall"><div className="gallery-wall-heading"><div><span className="section-kicker"><i className="blue-square" /> Projet sélectionné</span><h2>{active.name}</h2></div><span>{active.type}</span></div><div className="gallery-mosaic"><img className="mosaic-large" src={active.image} alt={active.name} /><img src={active.category === 'Jeux vidéo' ? images.cityTwo : images.code} alt="" /><img src={images.glass} alt="" /><img src={active.category === 'Mods et Shaders' ? images.mountain : images.forest} alt="" /></div></div> : <div className="empty-gallery"><Play size={30} /><p>Sélectionnez un projet pour explorer son univers.</p></div>}</div>;
}

function About() { return <div className="page-wrap about-page"><PageHeader kicker="L’identité Wiyotl" title={<>Plus qu’un studio.<br /><em>Une impulsion.</em></>} text="Wiyotl rassemble des créations qui n’ont pas peur de prendre des chemins différents." /><div className="about-grid"><AboutBlock number="01" title="C’est quoi Wiyotl ?">Wiyotl est un studio indépendant qui crée des jeux vidéo, des applications, des outils numériques, des logiciels techniques et des projets d’intelligence artificielle. Chaque création possède son propre univers, son propre objectif et sa propre identité, tout en faisant partie de l’aventure Wiyotl.</AboutBlock><AboutBlock number="02" title="Pourquoi Wiyotl ?">Wiyotl est né de l’envie de créer des expériences qui donnent envie de découvrir, de jouer et d’explorer. Jeux vidéo, applications, logiciels et technologies sont autant de façons de donner vie à de nouvelles idées.</AboutBlock><AboutBlock number="03" title="Vision sur le long terme">Construire Wiyotl comme une marque capable de créer des expériences et des technologies dans des domaines variés, tout en conservant une identité reconnaissable et une volonté constante d’innover.</AboutBlock></div><div className="about-quote"><Star size={20} /><p>Créer le futur.<br /><span>Inspirer le monde.</span></p></div></div>; }
function AboutBlock({ number, title, children }: { number: string; title: string; children: ReactNode }) { return <article className="about-block"><span>{number}</span><h2>{title}</h2><p>{children}</p></article>; }
function Contact() { return <div className="page-wrap contact-page"><PageHeader kicker="Restons en mouvement" title={<>Parlons de la<br /><em>suite.</em></>} text="Une question, une idée ou simplement envie d’échanger ? Wiyotl est à portée de message." /><div className="contact-grid"><div className="contact-card primary-contact"><span className="contact-icon"><Mail size={21} /></span><small>Email général</small><a href="mailto:contact.wiyotl@gmail.com">contact.wiyotl@gmail.com</a><p>Pour toute demande, collaboration ou question au sujet de Wiyotl.</p></div><div className="contact-links"><SocialLink icon={<Github size={19} />} label="GitHub" handle="github.com/WIYOTL" href="https://github.com/WIYOTL" /><SocialLink icon={<Instagram size={19} />} label="Instagram" handle="instagram.com/wiyotl" href="https://www.instagram.com/wiyotl/" /><SocialLink icon={<MessageCircle size={19} />} label="DEV Community" handle="dev.to/wiyotl" href="https://dev.to/wiyotl" /></div></div></div>; }
function SocialLink({ icon, label, handle, href }: { icon: ReactNode; label: string; handle: string; href: string }) { return <a className="social-link" href={href} target="_blank" rel="noreferrer">{icon}<span><strong>{label}</strong><small>{handle}</small></span><ExternalLink size={15} /></a>; }
function Legal() { return <div className="page-wrap legal-page"><PageHeader kicker="Informations" title={<>Mentions <em>légales.</em></>} text="Les informations essentielles concernant l’utilisation de ce site." /><div className="legal-copy"><h2>Propriété des contenus</h2><p>Les contenus, visuels, textes, logo, logiciels, code et créations présentés sur ce site sont protégés par les droits applicables. Sauf indication contraire, toute reproduction, modification, distribution ou utilisation commerciale est interdite sans autorisation préalable.</p><h2>Marque</h2><p>« Wiyotl » est une marque déposée. Les noms et éléments associés aux projets restent la propriété de leurs détenteurs respectifs.</p><h2>Contact</h2><p>Pour toute demande relative aux contenus présentés sur ce site, veuillez écrire à contact.wiyotl@gmail.com.</p></div></div>; }

function Profile({ session, actions, onAuth, onNavigate }: { session: { email?: string } | null; actions: Record<string, Action>; onAuth: () => void; onNavigate: (page: Page) => void }) { const wished = projects.filter(project => actions[project.id]?.is_wishlisted); const followed = projects.filter(project => actions[project.id]?.is_following); return <div className="page-wrap profile-page"><PageHeader kicker="Votre espace" title={<>Mon <em>compte.</em></>} text={session ? `Bienvenue dans votre espace Wiyotl${session.email ? `, ${session.email}` : ''}.` : 'Connectez-vous pour retrouver vos choix et suivre vos projets favoris.'} />{session ? <div className="profile-grid"><div className="profile-summary"><div className="big-avatar">{session.email?.[0]?.toUpperCase() || 'W'}</div><h2>{session.email}</h2><span>Membre Wiyotl</span><button className="outline-button" onClick={() => supabase?.auth.signOut()}>Déconnexion</button></div><div className="profile-content"><div className="profile-stat-row"><Stat icon={<Heart size={18} />} value={String(wished.length)} label="Souhaits" /><Stat icon={<Plus size={18} />} value={String(followed.length)} label="Projets suivis" /><Stat icon={<Bell size={18} />} value="0" label="Notifications" /></div><div className="profile-list"><h2>Ma liste de souhaits</h2>{wished.length ? wished.map(project => <button className="profile-project" key={project.id} onClick={() => onNavigate('projects')}><img src={project.image} alt="" /><span>{project.name}<small>{project.status}</small></span><ArrowRight size={16} /></button>) : <p className="muted">Vos projets favoris apparaîtront ici.</p>}</div></div></div> : <div className="sign-in-card"><LockKeyhole size={28} /><h2>Votre espace créatif</h2><p>Créez un compte pour sauvegarder vos projets favoris et recevoir les évolutions qui vous intéressent.</p><button className="primary-button" onClick={onAuth}><LogIn size={17} /> Se connecter</button></div>}</div>; }
function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) { return <div className="profile-stat">{icon}<strong>{value}</strong><span>{label}</span></div>; }

function SearchPanel({ query, setQuery, results, onClose, onProject }: { query: string; setQuery: (value: string) => void; results: Project[]; onClose: () => void; onProject: (project: Project) => void }) { return <div className="overlay search-overlay"><div className="search-panel"><div className="search-input-wrap"><Search size={20} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un projet, une catégorie..." /><button className="icon-button" onClick={onClose}><X size={18} /></button></div>{query ? <div className="search-results">{results.length ? results.map(project => <button key={project.id} onClick={() => { onProject(project); onClose(); }}><img src={project.image} alt="" /><span><strong>{project.name}</strong><small>{project.category} · {project.status}</small></span><ArrowRight size={16} /></button>) : <p className="muted">Aucun résultat pour « {query} ».</p>}</div> : <div className="search-hint"><Sparkles size={18} /><p>Recherchez parmi les jeux, applications, projets IA, mods et shaders.</p></div>}</div></div>; }
function ProfilePopover({ session, onClose, onAuth, onNavigate }: { session: { email?: string } | null; onClose: () => void; onAuth: () => void; onNavigate: (page: Page) => void }) { return <div className="overlay popover-overlay" onClick={onClose}><div className="profile-popover" onClick={event => event.stopPropagation()}><button className="popover-close icon-button" onClick={onClose}><X size={17} /></button>{session ? <><div className="popover-user"><span className="avatar large">{session.email?.[0]?.toUpperCase() || 'W'}</span><div><strong>{session.email}</strong><small>Membre Wiyotl</small></div></div><button className="popover-link" onClick={() => { onNavigate('profile'); onClose(); }}><CircleUserRound size={17} /> Mon profil</button><button className="popover-link"><Heart size={17} /> Liste de souhaits</button><button className="popover-link"><Settings size={17} /> Paramètres</button><button className="popover-link" onClick={() => supabase?.auth.signOut()}><LogIn size={17} /> Déconnexion</button></> : <><div className="popover-user"><span className="avatar large"><CircleUserRound size={21} /></span><div><strong>Votre espace Wiyotl</strong><small>Wishlist et projets suivis</small></div></div><button className="primary-button full" onClick={onAuth}>Se connecter <ArrowRight size={16} /></button><button className="popover-signup" onClick={onAuth}>Créer un compte <UserPlus size={15} /></button></>}</div></div>; }
function AuthModal({ mode, setMode, onClose, onSuccess }: { mode: 'login' | 'signup'; setMode: (mode: 'login' | 'signup') => void; onClose: () => void; onSuccess: () => void }) { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const submit = async (event: FormEvent) => { event.preventDefault(); if (!supabase) { setError('Le compte est momentanément indisponible.'); return; } setLoading(true); setError(''); const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (result.error) setError('Vérifiez votre adresse et votre mot de passe, puis réessayez.'); else onSuccess(); setLoading(false); }; return <div className="overlay auth-overlay"><div className="auth-modal"><button className="icon-button auth-close" onClick={onClose}><X size={18} /></button><div className="auth-mark">W.</div><span className="section-kicker"><i className="blue-square" /> Espace Wiyotl</span><h2>{mode === 'login' ? 'Ravi de vous revoir.' : 'Entrez dans l’aventure.'}</h2><p>{mode === 'login' ? 'Retrouvez vos projets favoris et vos suivis.' : 'Créez votre espace pour garder une trace de vos découvertes.'}</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.com" /></label><label>Mot de passe<input type="password" required minLength={6} value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button full" disabled={loading}>{loading ? 'Connexion...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={16} /></button></form><button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Pas encore de compte ? Créer un compte' : 'Déjà membre ? Se connecter'}</button></div></div>; }
function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) { return <footer className="footer"><div className="footer-brand"><img src="/wiyotl_logo.webp" alt="Wiyotl" /><p>Créer le futur.<br /><span>Inspirer le monde.</span></p></div><div className="footer-links"><div><strong>Explorer</strong><button onClick={() => onNavigate('projects')}>Projets</button><button onClick={() => onNavigate('gallery')}>Galerie</button><button onClick={() => onNavigate('about')}>À propos</button></div><div><strong>Contact</strong><button onClick={() => onNavigate('contact')}>Nous écrire</button><a href="https://github.com/WIYOTL" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.instagram.com/wiyotl/" target="_blank" rel="noreferrer">Instagram</a></div><div><strong>Informations</strong><button onClick={() => onNavigate('legal')}>Mentions légales</button><span>© 2026 Wiyotl.</span><span>Tous droits réservés.</span></div></div><div className="footer-bottom"><span>Wiyotl est une marque déposée.</span><span>Studio indépendant · France</span></div></footer>; }

export default App;
