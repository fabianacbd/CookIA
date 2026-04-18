import { useState, useEffect, Component } from "react";

// Error boundary — captura cualquier error de render y muestra mensaje útil
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary:", error, info); }
  reset = () => { this.setState({ error: null }); this.props.onReset?.(); };
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40,textAlign:"center",background:"#fff",borderRadius:20,margin:20,maxWidth:500}}>
          <h2 style={{color:"#cc4444"}}>⚠️ Error al mostrar la receta</h2>
          <p style={{color:"#555",fontSize:14,marginBottom:20}}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button onClick={this.reset} style={{background:"#2d8a3e",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontWeight:700}}>
            Cerrar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const COMMON_INGREDIENTS = [
  "Patatas","Pollo","Cebolla","Leche","Huevos","Lechuga","Tomate",
  "Ajo","Jamón","Queso","Arroz","Pasta","Zanahoria","Pimiento",
  "Atún","Mantequilla","Harina","Aceite","Limón","Espinacas"
];

const FOOD_FACTS = [
  "1/3 de todos los alimentos producidos se desperdicia cada año 🌍",
  "España desperdicia 7.7 millones de toneladas de comida al año 🇪🇸",
  "Reducir el desperdicio ayuda a combatir el cambio climático 🌱",
  "Aprovechar los restos puede ahorrarte hasta 1.500€ al año 💰",
];

const NEWS_ITEMS = [
  {
    category: "INFORME GENERAL",
    title: "Los hogares españoles redujeron el desperdicio alimentario un 4,3% en 2024",
    excerpt: "Según el último Panel del MAPA, se desperdiciaron 48,9 millones de kg menos que en 2023. La tendencia decreciente se mantiene por cuarto año consecutivo, acumulando un 19,5% de reducción desde 2020.",
    source: "Ministerio de Agricultura, Pesca y Alimentación",
    date: "Informe 2024",
    image: "https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=600&q=80",
    url: "https://www.mapa.gob.es/es/alimentacion/temas/desperdicio/",
  },
  {
    category: "LEY",
    title: "España aprueba la Ley de Prevención de las Pérdidas y el Desperdicio Alimentario",
    excerpt: "El BOE publicó la Ley 1/2025 el 2 de abril de 2025: la primera norma estatal que obliga a toda la cadena alimentaria a elaborar planes de prevención del desperdicio. España se convierte así en el tercer país de la UE con regulación específica.",
    source: "BOE — Ley 1/2025, de 1 de abril",
    date: "Abril 2025",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2025-6597",
  },
  {
    category: "DATOS",
    title: "Las frutas y verduras suponen el 46,2% del desperdicio doméstico",
    excerpt: "Los productos hortofrutícolas siguen siendo los más desperdiciados en los hogares españoles. Las naranjas aumentaron un 8,4% y el resto de frutas frescas un 3,6% en volumen tirado durante 2024.",
    source: "Panel de Cuantificación del Desperdicio Alimentario",
    date: "2024",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80",
    url: "https://www.mapa.gob.es/es/alimentacion/temas/desperdicio/desperdicio-alimentario-hogares/",
  },
  {
    category: "ACCIÓN",
    title: "España logra su mínimo histórico en desperdicio de alimentos en 2024",
    excerpt: "En 2024 se desperdiciaron 48,9 millones de kilos o litros menos que el año anterior en los hogares españoles, un 19,5% menos que en 2020. Es la cifra más baja desde que existen registros (2016), gracias a políticas públicas, campañas de concienciación y nuevos hábitos sociales.",
    source: "Plataforma Tierra",
    date: "Agosto 2025",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    url: "https://www.plataformatierra.es/actualidad/espana-logra-minimo-historico-desperdicio-alimentos",
  },
  {
    category: "CONSEJOS",
    title: "Más de 60 recetas de aprovechamiento para no tirar comida",
    excerpt: "Recetas fáciles organizadas por ingrediente: qué hacer con sobras de pollo asado, restos de arroz blanco, pan duro, verduras maduras o pescado. La cocina de aprovechamiento es parte de la tradición española y la mejor forma de reducir el desperdicio en casa.",
    source: "PequeRecetas",
    date: "Actualizado 2025",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80",
    url: "https://www.pequerecetas.com/receta/recetas-aprovechamiento-sobras-comidas/",
  },
];

// Mapa curado: keyword → ID de Unsplash (fotos de PLATOS COCINADOS verificadas)
const DISH_PHOTOS = {
  omelette:"1525351484163-7529414344d8", tortilla:"1525351484163-7529414344d8",
  eggs:"1525351484163-7529414344d8", frittata:"1525351484163-7529414344d8", scrambled:"1525351484163-7529414344d8",
  pasta:"1567620905732-2d1ec7ab7445", spaghetti:"1567620905732-2d1ec7ab7445",
  noodles:"1567620905732-2d1ec7ab7445", carbonara:"1567620905732-2d1ec7ab7445",
  soup:"1547592166-23ac45744acd", stew:"1547592166-23ac45744acd", broth:"1547592166-23ac45744acd",
  chowder:"1547592166-23ac45744acd", cream:"1547592166-23ac45744acd", puree:"1547592166-23ac45744acd",
  chicken:"1598515213692-b26b0d5e4e27", roasted:"1598515213692-b26b0d5e4e27", grilled:"1598515213692-b26b0d5e4e27",
  salad:"1546069901-ba9599a7e63c", bowl:"1546069901-ba9599a7e63c",
  paella:"1534422298391-e4f8c172dddb", rice:"1536304993831-5c6261d9b1e0", risotto:"1536304993831-5c6261d9b1e0",
  potato:"1518779578993-ec3579fee39f", potatoes:"1518779578993-ec3579fee39f",
  fries:"1518779578993-ec3579fee39f", mashed:"1518779578993-ec3579fee39f",
  croquettes:"1565299624946-b28f40a0ae38", fried:"1565299624946-b28f40a0ae38", breaded:"1565299624946-b28f40a0ae38",
  tuna:"1559847812-b5cbcccf0e86", fish:"1559847812-b5cbcccf0e86",
  baked:"1559847812-b5cbcccf0e86", seared:"1559847812-b5cbcccf0e86",
  sandwich:"1528735602780-2552fd46c7af", toast:"1528735602780-2552fd46c7af", crepes:"1528735602780-2552fd46c7af",
  ham:"1528735602780-2552fd46c7af", bread:"1509440159596-0249088772ff",
  cheese:"1486297678162-eb2a19b0a32d",
  vegetables:"1540420773420-3a05bb8d945a", veggies:"1540420773420-3a05bb8d945a",
  stir:"1540420773420-3a05bb8d945a", sauteed:"1540420773420-3a05bb8d945a",
  pizza:"1565299624946-b28f40a0ae38",
  dessert:"1563729784474-d77dbb933a9e", cake:"1563729784474-d77dbb933a9e",
  pudding:"1563729784474-d77dbb933a9e", flan:"1563729784474-d77dbb933a9e",
  dish:"1504674900247-0877df9cc836", food:"1504674900247-0877df9cc836",
  cooked:"1504674900247-0877df9cc836", homemade:"1504674900247-0877df9cc836", plate:"1504674900247-0877df9cc836",
};

const FALLBACK_PHOTOS = [
  "1504674900247-0877df9cc836",
  "1567620905732-2d1ec7ab7445",
  "1546069901-ba9599a7e63c",
  "1547592166-23ac45744acd",
  "1525351484163-7529414344d8",
  "1598515213692-b26b0d5e4e27",
];

function getRecipeImageFallback(dishKeyword, index) {
  if (dishKeyword) {
    const words = dishKeyword.toLowerCase().split(/[\s,_-]+/);
    for (const word of words) {
      if (DISH_PHOTOS[word]) {
        return `https://images.unsplash.com/photo-${DISH_PHOTOS[word]}?w=500&q=80`;
      }
    }
  }
  return `https://images.unsplash.com/photo-${FALLBACK_PHOTOS[index % FALLBACK_PHOTOS.length]}?w=500&q=80`;
}

// Imagen vía Pexels (backend) con fallback curado
// Fuerza que dishKeyword sea de plato cocinado eliminando palabras de ingrediente crudo
function getRecipeImage(dishKeyword, recipeName, index) {
  const clean = (dishKeyword || recipeName || "cooked food dish")
    .replace(/\b(raw|fresh|ingredient|whole|head|fillet)\b/gi, "")
    .trim();
  const query = encodeURIComponent(clean + " plated dish");
  return `/api/recipe-image?q=${query}&i=${index}`;
}

// Elimina prefijos como "Step 1:", "Paso 2:", "1.", "1)" porque el <ol> ya numera
function cleanStep(step) {
  if (!step) return "";
  return String(step)
    .replace(/^(step|paso)\s*\d+\s*[:.)-]\s*/i, "")
    .replace(/^\d+\s*[:.)-]\s*/, "")
    .replace(/^[-•*]\s*/, "")
    .trim();
}


const LeafIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 9 9 12 7 14c.77-.85 1.82-1.44 3-1.5C14 12 17 8 17 8z"/></svg>;
const FireIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>;
const SavedIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>;
const ClockIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const PlusIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;

export default function CookIA() {
  const [page, setPage]                     = useState("home");
  const [inputValue, setInputValue]         = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [recipes, setRecipes]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [loadingMsg, setLoadingMsg]         = useState("Consultando al chef virtual...");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [stepsLoading, setStepsLoading]     = useState(false);
  const [savedMeals, setSavedMeals]         = useState(() => {
    try { return JSON.parse(localStorage.getItem("cookia_saved") || "[]"); } catch { return []; }
  });
  const [factIndex, setFactIndex]   = useState(0);
  const [error, setError]           = useState("");
  const [animateCards, setAnimateCards] = useState(false);
  const [searchPanel, setSearchPanel]   = useState(false);
  const [panelInput, setPanelInput]     = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cámara (solo móvil)
  const [isMobile, setIsMobile]         = useState(false);
  const [cameraOpen, setCameraOpen]     = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [analyzing, setAnalyzing]       = useState(false);
  const [detectedIngs, setDetectedIngs] = useState([]);
  const [selectedDetected, setSelectedDetected] = useState([]);
  const [analyzeError, setAnalyzeError] = useState("");

  // Detecta si es móvil al cargar (usando user agent + touch)
  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent || "";
      const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
      const touchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const smallScreen = window.innerWidth <= 900;
      setIsMobile(mobileUA || (touchDevice && smallScreen));
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setFactIndex(f => (f + 1) % FOOD_FACTS.length), 4000);
    return () => clearInterval(i);
  }, []);

  // Precalienta el modelo de IA al cargar para evitar 502 en primer uso
  useEffect(() => {
    fetch("/api/warmup").catch(() => {});
  }, []);

  useEffect(() => {
    try { localStorage.setItem("cookia_saved", JSON.stringify(savedMeals)); } catch {}
  }, [savedMeals]);

  // Mensajes rotativos de carga
  const msgs = ["Analizando ingredientes...", "Consultando al chef IA...", "Combinando sabores...", "Creando recetas únicas..."];
  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setLoadingMsg(msgs[0]);
    const iv = setInterval(() => { i = (i+1) % msgs.length; setLoadingMsg(msgs[i]); }, 3000);
    return () => clearInterval(iv);
  }, [loading]);

  const addIngredient = (name, from="input") => {
    const c = name.trim();
    if (!c || selectedIngredients.includes(c)) return;
    setSelectedIngredients(p => [...p, c]);
    if (from === "input") setInputValue("");
    if (from === "panel") setPanelInput("");
  };
  const removeIngredient = (name) => setSelectedIngredients(p => p.filter(i => i !== name));

  // ── CÁMARA (solo móvil) ─────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setDetectedIngs([]);
      setSelectedDetected([]);
      setAnalyzeError("");
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // permite volver a elegir la misma foto
  };

  const analyzePhoto = async () => {
    if (!photoPreview) return;
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const base64 = photoPreview.split(",")[1];
      const mimeType = photoPreview.split(";")[0].split(":")[1] || "image/jpeg";
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Error al analizar la imagen");
      }
      const data = await res.json();
      if (!data.ingredients?.length) {
        setAnalyzeError(data.note || "No se detectaron ingredientes. Prueba con una foto más clara.");
        return;
      }
      setDetectedIngs(data.ingredients);
      setSelectedDetected(data.ingredients);
    } catch (err) {
      setAnalyzeError(err.message || "Error al analizar. Intenta de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleDetected = (ing) => {
    setSelectedDetected(p => p.includes(ing) ? p.filter(i => i !== ing) : [...p, ing]);
  };

  const useDetected = () => {
    setSelectedIngredients(p => [...new Set([...p, ...selectedDetected])]);
    setCameraOpen(false);
    setPhotoPreview(null);
    setDetectedIngs([]);
    setSelectedDetected([]);
  };

  const closeCamera = () => {
    setCameraOpen(false);
    setPhotoPreview(null);
    setDetectedIngs([]);
    setSelectedDetected([]);
    setAnalyzeError("");
  };

  // FASE 1 — Carga rápida: solo resumen de recetas
  const searchRecipes = async (ings = selectedIngredients) => {
    if (!ings.length) { setError("¡Añade al menos un ingrediente!"); return; }
    setError(""); setLoading(true); setPage("results"); setAnimateCards(false); setSearchPanel(false);

    // Reintenta automáticamente en caso de 502 (cold start del modelo)
    const tryFetch = async (attempt = 1) => {
      const res = await fetch("/api/recipes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ings, count: 6 }),
      });
      if (res.status === 502 && attempt < 3) {
        await new Promise(r => setTimeout(r, 1500));
        return tryFetch(attempt + 1);
      }
      return res;
    };

    try {
      const res = await tryFetch();
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error || `Error ${res.status}`); }
      const data = await res.json();
      setRecipes(data.recipes.map((r, i) => ({
        ...r,
        image: getRecipeImage(r.dishKeyword, r.name, i),
        imageFallback: getRecipeImageFallback(r.dishKeyword, i),
        steps: null,
      })));
      setTimeout(() => setAnimateCards(true), 80);
    } catch (err) {
      setError(err.message || "Error al generar recetas. Intenta de nuevo.");
      setPage("home");
    } finally { setLoading(false); }
  };

  // FASE 2 — Carga de pasos al abrir receta
  const openRecipe = async (recipe) => {
    try {
      // Asegurarse de que recipe es un objeto válido antes de abrir el modal
      if (!recipe || typeof recipe !== "object") return;
      setSelectedRecipe({ ...recipe }); // copia defensiva
      if (Array.isArray(recipe.steps) && recipe.steps.length > 0) return; // Ya cargados
      setStepsLoading(true);
      try {
        const res = await fetch("/api/recipe-steps", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: recipe.name,
            ingredients: recipe.ingredients,
            userIngredients: selectedIngredients, // ← ingredientes originales del usuario
          }),
        });
        if (!res.ok) throw new Error("No se pudieron cargar los pasos");
        const data = await res.json();
        if (!Array.isArray(data.steps)) throw new Error("Formato inesperado");
        const updatedRecipe = { ...recipe, steps: data.steps };
        setRecipes(prev => prev.map(r => r.name === recipe.name ? updatedRecipe : r));
        setSelectedRecipe(updatedRecipe);
      } catch {
        // El modal muestra el mensaje de error, no hace falta hacer nada más
      } finally {
        setStepsLoading(false);
      }
    } catch (err) {
      console.error("Error abriendo receta:", err);
    }
  };

  const markAsDone = (recipe) => {
    setSavedMeals(p => [...p, { ...recipe, date: new Date().toLocaleDateString("es-ES") }]);
    setSelectedRecipe(null);
  };

  const totalSaved = savedMeals.reduce((a, m) => a + (m.saved_grams || 300), 0);
  const totalCO2   = Math.round(totalSaved * 0.0025);
  const progress   = Math.min(100, (totalSaved / 5000) * 100);

  return (
    <div style={s.app}>
      <div style={s.noise} />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner} className="cookia-nav-inner">
          <button onClick={() => setPage("home")} style={s.logo}>Cook<span style={s.acc}>IA</span></button>

          {/* Desktop nav — se oculta en móvil vía CSS */}
          <div style={s.navLinks} className="cookia-nav-desktop">
            <button onClick={() => setPage("home")}    style={page==="home"    ? s.navOn : s.navOff}>Inicio</button>
            <button onClick={() => setPage("results")} style={page==="results" ? s.navOn : s.navOff}>Recetas</button>
            <button onClick={() => setPage("saved")} style={s.navSaved}>
              <SavedIcon />
              {savedMeals.length > 0 ? (
                <span>Comida salvada · {savedMeals.length}</span>
              ) : (
                <span>{savedMeals.length}</span>
              )}
            </button>
          </div>

          {/* Mobile hamburger — se oculta en desktop vía CSS */}
          <button
            onClick={() => setMobileMenuOpen(m => !m)}
            style={s.hamburger}
            className="cookia-hamburger"
            aria-label="Menú"
          >
            <span style={{...s.hamburgerLine, transform: mobileMenuOpen ? "rotate(45deg) translate(5px,5px)" : "none"}} />
            <span style={{...s.hamburgerLine, opacity: mobileMenuOpen ? 0 : 1}} />
            <span style={{...s.hamburgerLine, transform: mobileMenuOpen ? "rotate(-45deg) translate(6px,-6px)" : "none"}} />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div style={s.mobileMenu} className="cookia-mobile-menu">
            <button
              onClick={() => { setPage("home"); setMobileMenuOpen(false); }}
              style={page === "home" ? s.mobileMenuItemOn : s.mobileMenuItem}
            >
              🏠  Inicio
            </button>
            <button
              onClick={() => { setPage("results"); setMobileMenuOpen(false); }}
              style={page === "results" ? s.mobileMenuItemOn : s.mobileMenuItem}
            >
              🍳  Recetas
            </button>
            <button
              onClick={() => { setPage("saved"); setMobileMenuOpen(false); }}
              style={page === "saved" ? s.mobileMenuItemOn : s.mobileMenuItem}
            >
              🌿  {savedMeals.length > 0 ? `Comida salvada · ${savedMeals.length}` : "Comida salvada"}
            </button>
          </div>
        )}
      </nav>

      {/* ── HOME ── */}
      {page === "home" && (
        <main style={s.main} className="cookia-main">
          <section style={s.hero}>
            <div style={s.badge}><LeafIcon /> Reduciendo desperdicios desde 2024</div>
            <h1 style={s.h1} className="cookia-hero-title">Ingredientes que <span style={s.green}>tienes</span>, recetas que <span style={s.underline}>amarás</span></h1>
            <p style={s.sub} className="cookia-hero-sub">Dinos qué hay en tu nevera y nuestra IA creará recetas deliciosas para que no desperdicies nada</p>
            <div style={s.searchBox} className="cookia-search-box">
              <div style={s.row} className="cookia-input-row">
                <input value={inputValue} onChange={e=>setInputValue(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&inputValue.trim()&&addIngredient(inputValue)}
                  placeholder="¿Qué ingredientes tienes en tu despensa?" style={s.input} />
                <button onClick={()=>inputValue.trim()?addIngredient(inputValue):searchRecipes()} style={s.btn}>
                  {inputValue.trim()?"Añadir +":"Buscar"}
                </button>
              </div>
              {selectedIngredients.length > 0 && (
                <div style={s.chips}>
                  {selectedIngredients.map(i=><button key={i} onClick={()=>removeIngredient(i)} style={s.chip}>{i} ✕</button>)}
                </div>
              )}
              {error && <p style={s.err}>{error}</p>}
            </div>

            {/* Botón de cámara — solo visible en móviles */}
            {isMobile && (
              <button onClick={()=>setCameraOpen(true)} style={s.cameraBtn} className="cookia-camera-btn">
                📷 Analizar mi nevera con IA
              </button>
            )}

            <p style={s.label}>Ingredientes comunes:</p>
            <div style={s.quickGrid}>
              {COMMON_INGREDIENTS.filter(i=>!selectedIngredients.includes(i)).slice(0,10).map(i=>(
                <button key={i} onClick={()=>addIngredient(i)} style={s.quickChip}>{i} +</button>
              ))}
            </div>
            {selectedIngredients.length > 0 && (
              <button onClick={()=>searchRecipes()} style={s.bigBtn} className="cookia-big-btn">
                <FireIcon /> Generar recetas con {selectedIngredients.length} ingrediente{selectedIngredients.length>1?"s":""}
              </button>
            )}
          </section>

          <section style={s.statsRow}>
            <div style={s.stat}><span style={s.statN}>{savedMeals.length}</span><span style={s.statL}>Recetas realizadas</span></div>
            <div style={s.stat}><span style={s.statN}>{(totalSaved/1000).toFixed(2)} kg</span><span style={s.statL}>Comida salvada</span></div>
            <div style={s.stat}><span style={s.statN}>{totalCO2} kg CO₂</span><span style={s.statL}>Emisiones evitadas</span></div>
          </section>

          <div style={s.factBar}><span style={{fontSize:20}}>💡</span><span key={factIndex}>{FOOD_FACTS[factIndex]}</span></div>

          {/* Sección de noticias */}
          <section style={s.newsSection}>
            <div style={s.newsHeader}>
              <div>
                <p style={s.newsLabel}>ACTUALIDAD</p>
                <h2 style={s.newsTitle} className="cookia-news-title">El desperdicio alimentario en España</h2>
                <p style={s.newsSub}>Datos, leyes e iniciativas que están marcando la diferencia</p>
              </div>
            </div>

            <div style={s.newsGrid}>
              {NEWS_ITEMS.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={s.newsCard}>
                  <div style={s.newsImgWrap}>
                    <img src={item.image} alt={item.title} style={s.newsImg}
                      onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80";}}/>
                    <span style={s.newsCategoryBadge}>{item.category}</span>
                  </div>
                  <div style={s.newsCardBody}>
                    <h3 style={s.newsCardTitle}>{item.title}</h3>
                    <p style={s.newsCardExcerpt}>{item.excerpt}</p>
                    <div style={s.newsCardFooter}>
                      <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        <span style={s.newsSource}>{item.source}</span>
                        <span style={s.newsDate}>{item.date}</span>
                      </div>
                      <span style={s.newsReadMore}>Leer más →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer style={s.footer}>
            <p style={s.footerText}>
              <strong>CookIA</strong> — Reduciendo el desperdicio alimentario con inteligencia artificial 🌱
            </p>
            <p style={s.footerSmall}>
              Datos basados en el Informe del Desperdicio Alimentario en los Hogares (MAPA, 2024) · Proyecto Final de Grado
            </p>
          </footer>
        </main>
      )}

      {/* ── RESULTS ── */}
      {page === "results" && (
        <main style={s.main}>
          {!loading && (
            <div style={s.topBar} className="cookia-top-bar">
              {/* Fila superior: título pequeño + botones alineados derecha */}
              <div style={s.topBarHeader}>
                <span style={s.topBarLabel}>
                  Buscando con <strong style={{color:"#2d8a3e"}}>{selectedIngredients.length}</strong> ingrediente{selectedIngredients.length!==1?"s":""}
                </span>
                <div style={s.topBarActions} className="cookia-top-bar-actions">
                  <button onClick={()=>setSearchPanel(true)} style={s.addBtn}>
                    <PlusIcon /> Añadir
                  </button>
                  <button onClick={()=>searchRecipes()} style={s.iconBtn} title="Buscar nuevas recetas">
                    <SearchIcon />
                  </button>
                </div>
              </div>

              {/* Fila inferior: chips de ingredientes */}
              {selectedIngredients.length > 0 && (
                <div style={s.chipsLeft}>
                  {selectedIngredients.map(i=>(
                    <button key={i} onClick={()=>removeIngredient(i)} style={s.chipResults}>
                      {i} <span style={{opacity:0.8,marginLeft:4}}>✕</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div style={s.loading}>
              <div style={s.spinWrap}><div style={s.spin}/><span style={s.spinEmoji}>🍳</span></div>
              <p style={s.loadTxt}>{loadingMsg}</p>
              <p style={{color:"#555",fontSize:15,marginTop:20,fontWeight:600}}>Buscando recetas con:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",margin:"12px auto 8px",maxWidth:520}}>
                {selectedIngredients.map(i=>(
                  <span key={i} style={{background:"#2d8a3e",color:"#fff",borderRadius:30,padding:"6px 14px",fontSize:13,fontWeight:600}}>{i}</span>
                ))}
              </div>
              <p style={{color:"#888",fontSize:12,marginTop:16}}>Los modelos gratuitos pueden tardar entre 10 y 25 segundos</p>
            </div>
          ) : (
            <>
              <h2 style={s.resultsTitle} className="cookia-results-title">Recetas encontradas <span style={{color:"#2d8a3e"}}>({recipes.length})</span></h2>
              <div style={s.grid}>
                {recipes.map((recipe, i) => (
                  <div key={i} style={{
                    ...s.card,
                    opacity: animateCards?1:0,
                    transform: animateCards?"translateY(0)":"translateY(24px)",
                    transition: `all 0.45s ease ${i*0.12}s`,
                  }} onClick={()=>openRecipe(recipe)}>
                    <div style={s.cardImgWrap}>
                      <img src={recipe.image} alt={recipe.name} style={s.cardImg}
                        onError={e=>{ e.target.onerror=null; e.target.src=recipe.imageFallback; }}/>
                      <div style={s.imgOverlay}/>
                      <span style={s.diffBadge}>{recipe.difficulty}</span>
                      <span style={s.savedBadge}>🌿 {recipe.saved_grams}g</span>
                    </div>
                    <div style={s.cardBody}>
                      <h3 style={s.cardTitle}>{recipe.name}</h3>
                      <div style={s.cardMeta}>
                        <span style={s.meta}><ClockIcon/> {recipe.time}</span>
                        <span style={s.meta}>🍽️ {recipe.servings} porc.</span>
                        <span style={s.meta}>🔥 {recipe.calories} kcal</span>
                      </div>
                      <p style={s.cardIngs}><strong>Ingredientes: </strong>{recipe.ingredients?.join(", ")}</p>
                      <button style={s.viewBtn} onClick={e=>{e.stopPropagation();openRecipe(recipe);}}>Ver receta →</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:"center",marginTop:32}}>
                <button onClick={()=>setSearchPanel(true)} style={s.outlineBtn}><PlusIcon /> Añadir ingredientes y buscar más</button>
              </div>
            </>
          )}
        </main>
      )}

      {/* ── SAVED ── */}
      {page === "saved" && (
        <main style={s.main}>
          <h2 style={s.resultsTitle}>Tu impacto alimentario 🌱</h2>
          <div style={s.impactBanner} className="cookia-impact-banner">
            <div style={s.impactItem}><span style={s.impactN}>{savedMeals.length}</span><span style={s.impactL}>Comidas</span></div>
            <div style={s.impactDiv} className="cookia-impact-divider"/>
            <div style={s.impactItem}><span style={s.impactN}>{(totalSaved/1000).toFixed(2)} kg</span><span style={s.impactL}>Comida salvada</span></div>
            <div style={s.impactDiv} className="cookia-impact-divider"/>
            <div style={s.impactItem}><span style={s.impactN}>≈{totalCO2} kg</span><span style={s.impactL}>CO₂ evitado</span></div>
          </div>
          <div style={s.progressWrap}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#555",marginBottom:8}}>
              <span>Meta: 5 kg salvados</span><span style={{color:"#2d8a3e",fontWeight:700}}>{Math.round(progress)}%</span>
            </div>
            <div style={s.progressBar}><div style={{...s.progressFill,width:`${progress}%`}}/></div>
          </div>
          {savedMeals.length===0 ? (
            <div style={s.empty}>
              <span style={{fontSize:52}}>🥗</span>
              <p style={{color:"#888"}}>Aún no has marcado recetas como completadas.</p>
              <button onClick={()=>setPage("home")} style={s.bigBtn}>Buscar recetas</button>
            </div>
          ) : (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <h3 style={{margin:0,fontSize:18,fontWeight:800,color:"#1a1a1a"}}>
                  Historial de recetas
                </h3>
                <button
                  onClick={()=>{
                    if (window.confirm("¿Seguro que quieres eliminar todo el historial? Esta acción no se puede deshacer.")) {
                      setSavedMeals([]);
                    }
                  }}
                  style={s.resetBtn}
                  title="Reiniciar contador"
                >
                  🔄 Reiniciar todo
                </button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {savedMeals.slice().reverse().map((meal, revIndex) => {
                  const realIndex = savedMeals.length - 1 - revIndex;
                  return (
                    <div key={realIndex} style={s.savedItem}>
                      <img src={meal.image} alt={meal.name} style={s.savedImg}
                        onError={e=>e.target.src=`https://images.unsplash.com/photo-${FALLBACK_PHOTOS[0]}?w=400&q=80`}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,color:"#1a1a1a"}}>{meal.name}</div>
                        <div style={{fontSize:12,color:"#888"}}>{meal.date} · {meal.saved_grams}g aprovechados</div>
                      </div>
                      <span style={{color:"#2d8a3e",fontWeight:700,fontSize:14,whiteSpace:"nowrap"}}>+{meal.saved_grams}g 🌿</span>
                      <button
                        onClick={()=>{
                          if (window.confirm(`¿Eliminar "${meal.name}" del historial?`)) {
                            setSavedMeals(prev => prev.filter((_, i) => i !== realIndex));
                          }
                        }}
                        style={s.deleteBtn}
                        title="Eliminar esta receta"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      )}

      {/* ── PANEL AÑADIR INGREDIENTES ── */}
      {searchPanel && (
        <div style={s.panelOverlay} onClick={()=>setSearchPanel(false)}>
          <div style={s.panel} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <h3 style={{margin:0,fontSize:20,fontWeight:800}}>🔍 Añadir ingredientes</h3>
              <button onClick={()=>setSearchPanel(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888"}}>✕</button>
            </div>
            <p style={{color:"#666",fontSize:14,marginBottom:16}}>Añade más ingredientes y vuelve a buscar</p>
            <div style={s.row}>
              <input value={panelInput} onChange={e=>setPanelInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&panelInput.trim()&&addIngredient(panelInput,"panel")}
                placeholder="Escribe un ingrediente..." style={s.input} autoFocus/>
              <button onClick={()=>panelInput.trim()&&addIngredient(panelInput,"panel")} style={s.btn}>+</button>
            </div>
            {selectedIngredients.length > 0 && (
              <div style={{marginTop:16}}>
                <p style={s.label}>ACTUALES</p>
                <div style={s.chips}>{selectedIngredients.map(i=><button key={i} onClick={()=>removeIngredient(i)} style={s.chip}>{i} ✕</button>)}</div>
              </div>
            )}
            <div style={{marginTop:16}}>
              <p style={s.label}>AÑADIR RÁPIDO</p>
              <div style={s.quickGrid}>
                {COMMON_INGREDIENTS.filter(i=>!selectedIngredients.includes(i)).map(i=>(
                  <button key={i} onClick={()=>addIngredient(i,"panel")} style={s.quickChip}>{i} +</button>
                ))}
              </div>
            </div>
            <button onClick={()=>searchRecipes()} style={{...s.bigBtn,width:"100%",justifyContent:"center",marginTop:16}}>
              <FireIcon /> Buscar con {selectedIngredients.length} ingrediente{selectedIngredients.length!==1?"s":""}
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL CÁMARA (solo móvil) ── */}
      {cameraOpen && (
        <div style={s.modalOverlay} onClick={closeCamera}>
          <div style={{...s.modal,maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <button onClick={closeCamera} style={s.modalClose}>✕</button>
            <div style={{padding:24}}>
              <h2 style={{fontSize:22,fontWeight:800,marginBottom:8,color:"#1a1a1a",fontFamily:"'Playfair Display',Georgia,serif"}}>
                📷 Analizar nevera
              </h2>
              <p style={{color:"#666",fontSize:14,marginBottom:20,lineHeight:1.5}}>
                Toma una foto de tu nevera o despensa y la IA detectará los ingredientes disponibles.
              </p>

              {!photoPreview ? (
                <>
                  <label style={{...s.bigBtn,width:"100%",justifyContent:"center",marginTop:0,cursor:"pointer",display:"flex"}}>
                    📸 Abrir cámara
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{display:"none"}} />
                  </label>
                  <label style={{...s.outlineBtn,width:"100%",justifyContent:"center",marginTop:10,cursor:"pointer",display:"flex"}}>
                    🖼️ Desde galería
                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{display:"none"}} />
                  </label>
                </>
              ) : (
                <>
                  <img src={photoPreview} alt="Foto nevera" style={{width:"100%",borderRadius:14,marginBottom:16,maxHeight:280,objectFit:"cover"}} />
                  {detectedIngs.length === 0 && !analyzing && (
                    <>
                      <button onClick={analyzePhoto} style={{...s.bigBtn,width:"100%",justifyContent:"center",marginTop:0}}>
                        🔍 Analizar con IA
                      </button>
                      <button onClick={()=>{setPhotoPreview(null);setAnalyzeError("");}}
                        style={{...s.cancelBtn,width:"100%",marginTop:10}}>
                        Cambiar foto
                      </button>
                    </>
                  )}
                  {analyzing && (
                    <div style={{textAlign:"center",padding:"20px 0"}}>
                      <div style={{...s.spin,margin:"0 auto 12px",position:"relative"}} />
                      <p style={{color:"#2d8a3e",fontSize:14,marginTop:12,fontWeight:600}}>
                        Analizando ingredientes...
                      </p>
                    </div>
                  )}
                </>
              )}

              {analyzeError && (
                <div style={{background:"#fff3f3",borderRadius:12,padding:14,marginTop:12,border:"1px solid #ffcccc"}}>
                  <p style={{color:"#cc4444",fontSize:13,margin:0,textAlign:"center"}}>⚠️ {analyzeError}</p>
                </div>
              )}

              {/* Resultados detectados */}
              {detectedIngs.length > 0 && (
                <div style={{background:"#f5f9f0",borderRadius:14,padding:16,border:"1px solid #e8f5ea",marginTop:12}}>
                  <p style={{fontWeight:700,color:"#1a1a1a",margin:"0 0 4px",fontSize:14}}>
                    ✅ Ingredientes detectados
                  </p>
                  <p style={{color:"#666",fontSize:12,margin:"0 0 12px"}}>
                    Toca para deseleccionar los que no tengas
                  </p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                    {detectedIngs.map(ing => {
                      const on = selectedDetected.includes(ing);
                      return (
                        <button key={ing} onClick={()=>toggleDetected(ing)}
                          style={on ? s.chip : {...s.chip,background:"#eee",color:"#888",border:"1px solid #ccc"}}>
                          {on ? "✓ " : ""}{ing}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={useDetected} style={{...s.bigBtn,width:"100%",justifyContent:"center",marginTop:0}}>
                    ✅ Usar {selectedDetected.length} ingrediente{selectedDetected.length!==1?"s":""}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL RECETA ── */}
      {selectedRecipe && (
        <ErrorBoundary onReset={()=>setSelectedRecipe(null)}>
          {(() => {
            const r = selectedRecipe || {};
            return (
          <div style={s.modalOverlay} onClick={()=>setSelectedRecipe(null)}>
            <div style={s.modal} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setSelectedRecipe(null)} style={s.modalClose}>✕</button>

              {/* Imagen */}
              <div style={{position:"relative"}}>
                <img
                  src={r.image || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80`}
                  alt={r.name || "Receta"}
                  style={s.modalImg}
                  onError={e=>{ e.target.onerror=null; e.target.src=r.imageFallback || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80`; }}
                />
                <div style={s.modalImgOverlay}>
                  <h2 style={{color:"#fff",margin:0,fontSize:22,fontWeight:900,fontFamily:"'Playfair Display','Georgia',serif"}}>
                    {r.name || "Receta"}
                  </h2>
                </div>
              </div>

              <div style={s.modalBody}>
                {/* Metadatos */}
                <div style={s.modalMeta}>
                  <div style={s.metaBox}><strong>⏱</strong><span>{r.time || "—"}</span></div>
                  <div style={s.metaBox}><strong>🍽️</strong><span>{r.servings || "—"} porciones</span></div>
                  <div style={s.metaBox}><strong>📊</strong><span>{r.difficulty || "—"}</span></div>
                  <div style={s.metaBox}><strong>🔥</strong><span>{r.calories || "—"} kcal</span></div>
                </div>

                {/* Ingredientes */}
                {Array.isArray(r.ingredients) && r.ingredients.length > 0 && (
                  <div style={s.ingBox}>
                    <strong>INGREDIENTES: </strong>{r.ingredients.join(", ")}
                  </div>
                )}

                {/* Pasos */}
                <h3 style={{fontSize:17,fontWeight:800,marginBottom:12,color:"#1a1a1a"}}>Instrucciones:</h3>

                {stepsLoading ? (
                  <div style={{textAlign:"center",padding:"20px 0"}}>
                    <div style={{...s.spin,margin:"0 auto 12px",position:"relative"}}/>
                    <p style={{color:"#2d8a3e",fontSize:14,marginTop:16}}>Cargando instrucciones...</p>
                  </div>
                ) : Array.isArray(r.steps) && r.steps.length > 0 ? (
                  <ol style={{paddingLeft:20,margin:"0 0 20px"}}>
                    {r.steps.map((step, i) => (
                      <li key={i} style={{marginBottom:10,fontSize:14,lineHeight:1.7,color:"#333"}}>
                        {cleanStep(String(step || ""))}
                      </li>
                    ))}
                  </ol>
                ) : !stepsLoading ? (
                  <p style={{color:"#888",fontSize:14,marginBottom:20}}>
                    No se pudieron cargar los pasos. Cierra y vuelve a abrir la receta.
                  </p>
                ) : null}

                {/* Badge verde */}
                <div style={s.greenBadge}>
                  🌿 Esta receta aprovecha ~{r.saved_grams || 300}g de comida
                </div>

                {/* Acciones */}
                <div style={{display:"flex",gap:10,flexDirection:"column"}}>
                  <button onClick={()=>markAsDone(r)} style={s.doneBtn}>
                    ✅ ¡Ya la hice! Guardar ({r.saved_grams || 300}g salvados)
                  </button>
                  <button onClick={()=>setSelectedRecipe(null)} style={s.cancelBtn}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
            );
          })()}
        </ErrorBoundary>
      )}
    </div>
  );
}

const s = {
  app:{minHeight:"100vh",width:"100%",background:"#f5f9f0",fontFamily:"'Poppins','Segoe UI',-apple-system,sans-serif",position:"relative",overflowX:"hidden"},
  noise:{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`},
  nav:{background:"#2d8a3e",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(45,138,62,0.3)",width:"100%"},
  navInner:{maxWidth:1200,margin:"0 auto",padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56},
  logo:{background:"none",border:"none",cursor:"pointer",fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-0.5px",fontFamily:"inherit"},
  acc:{color:"#b8f5c8",fontStyle:"italic"},
  navLinks:{display:"flex",alignItems:"center",gap:8},
  navOff:{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",cursor:"pointer",color:"rgba(255,255,255,0.9)",fontSize:14,fontWeight:500,padding:"7px 16px",borderRadius:22,transition:"all 0.2s"},
  navOn:{background:"#b8f5c8",border:"1px solid #b8f5c8",cursor:"pointer",color:"#1a5c2a",fontSize:14,fontWeight:700,padding:"7px 16px",borderRadius:22,boxShadow:"0 2px 8px rgba(184,245,200,0.4)"},
  navSaved:{display:"flex",alignItems:"center",gap:6,background:"#b8f5c8",border:"1px solid #b8f5c8",cursor:"pointer",color:"#1a5c2a",fontSize:14,fontWeight:700,padding:"7px 16px",borderRadius:22,boxShadow:"0 2px 8px rgba(184,245,200,0.4)"},
  hamburger:{display:"none",flexDirection:"column",justifyContent:"space-between",width:28,height:22,background:"none",border:"none",cursor:"pointer",padding:0},
  hamburgerLine:{display:"block",height:3,width:"100%",background:"#fff",borderRadius:2,transition:"all 0.25s ease",transformOrigin:"center"},
  mobileMenu:{display:"none",flexDirection:"column",background:"#2d8a3e",borderTop:"1px solid rgba(255,255,255,0.2)",padding:"8px 16px 12px"},
  mobileMenuItem:{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",color:"#fff",fontSize:15,fontWeight:600,padding:"12px 16px",borderRadius:12,marginTop:8,textAlign:"left",width:"100%"},
  mobileMenuItemOn:{display:"flex",alignItems:"center",gap:10,background:"#b8f5c8",border:"1px solid #b8f5c8",cursor:"pointer",color:"#1a5c2a",fontSize:15,fontWeight:800,padding:"12px 16px",borderRadius:12,marginTop:8,textAlign:"left",width:"100%"},
  main:{maxWidth:1200,margin:"0 auto",padding:"32px 40px",position:"relative",zIndex:1},
  hero:{textAlign:"center",paddingBottom:40},
  badge:{display:"inline-flex",alignItems:"center",gap:6,background:"#e8f8ec",color:"#2d8a3e",padding:"6px 16px",borderRadius:30,fontSize:13,fontWeight:600,marginBottom:24,border:"1px solid #c5eacc"},
  h1:{fontSize:48,fontWeight:900,lineHeight:1.15,color:"#1a1a1a",margin:"0 0 16px",letterSpacing:"-1px",fontFamily:"'Playfair Display','Georgia',serif"},
  green:{color:"#2d8a3e"},
  underline:{color:"#1a6b2a",textDecoration:"underline",textDecorationColor:"#b8f5c8",textDecorationThickness:4},
  sub:{fontSize:17,color:"#555",maxWidth:520,margin:"0 auto 32px",lineHeight:1.6},
  searchBox:{background:"#fff",borderRadius:20,padding:20,boxShadow:"0 8px 40px rgba(0,0,0,0.08)",maxWidth:600,margin:"0 auto 24px",border:"1px solid #e8f5ea"},
  row:{display:"flex",gap:10},
  input:{flex:1,border:"1.5px solid #ddd",borderRadius:12,padding:"12px 16px",fontSize:15,outline:"none",fontFamily:"inherit"},
  btn:{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:12,padding:"12px 20px",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},
  chips:{display:"flex",flexWrap:"wrap",gap:8,marginTop:12},
  chip:{background:"#2d8a3e",color:"#fff",border:"none",borderRadius:30,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer"},
  chipResults:{background:"#2d8a3e",color:"#fff",border:"none",borderRadius:22,padding:"0 16px",fontSize:13,fontWeight:600,cursor:"pointer",height:36,display:"inline-flex",alignItems:"center"},
  err:{color:"#e55",fontSize:13,marginTop:8},
  label:{color:"#888",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"},
  quickGrid:{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",maxWidth:620,margin:"0 auto"},
  quickChip:{background:"#e8f8ec",color:"#2d8a3e",border:"1.5px solid #c5eacc",borderRadius:30,padding:"7px 16px",fontSize:13,fontWeight:600,cursor:"pointer"},
  bigBtn:{display:"inline-flex",alignItems:"center",gap:8,background:"#2d8a3e",color:"#fff",border:"none",borderRadius:14,padding:"14px 32px",fontSize:16,fontWeight:700,cursor:"pointer",marginTop:24,boxShadow:"0 4px 20px rgba(45,138,62,0.35)"},
  cameraBtn:{display:"inline-flex",alignItems:"center",gap:8,background:"#2d8a3e",color:"#fff",border:"none",borderRadius:14,padding:"14px 28px",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:24,marginTop:8,boxShadow:"0 4px 20px rgba(45,138,62,0.35)"},
  statsRow:{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:24},
  stat:{background:"#fff",borderRadius:16,padding:"20px 32px",textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",border:"1px solid #e8f5ea",minWidth:140},
  statN:{display:"block",fontSize:28,fontWeight:900,color:"#2d8a3e"},
  statL:{fontSize:12,color:"#888",fontWeight:600,textTransform:"uppercase"},
  factBar:{background:"#2d8a3e",color:"#fff",borderRadius:14,padding:"14px 24px",display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:500},
  topBar:{display:"flex",flexDirection:"column",gap:14,marginBottom:24,background:"#fff",padding:16,borderRadius:16,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"},
  topBarHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"},
  topBarLabel:{fontSize:14,color:"#555",fontWeight:500},
  chipsLeft:{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"},
  topBarActions:{display:"flex",gap:8,alignItems:"center",flexShrink:0},
  iconBtn:{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:12,width:44,height:44,fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0},
  addBtn:{display:"flex",alignItems:"center",gap:6,background:"#e8f8ec",color:"#2d8a3e",border:"1.5px solid #c5eacc",borderRadius:12,padding:"0 16px",fontSize:14,fontWeight:700,cursor:"pointer",height:44,lineHeight:1},
  addBtn:{display:"flex",alignItems:"center",gap:6,background:"#e8f8ec",color:"#2d8a3e",border:"1.5px solid #c5eacc",borderRadius:12,padding:"10px 16px",fontSize:14,fontWeight:700,cursor:"pointer"},
  outlineBtn:{display:"inline-flex",alignItems:"center",gap:8,background:"#f5f9f0",color:"#2d8a3e",border:"2px solid #2d8a3e",borderRadius:14,padding:"12px 24px",fontSize:15,fontWeight:700,cursor:"pointer"},
  loading:{textAlign:"center",padding:"80px 20px"},
  spinWrap:{position:"relative",width:64,height:64,margin:"0 auto 24px"},
  spin:{width:64,height:64,border:"4px solid #e8f8ec",borderTop:"4px solid #2d8a3e",borderRadius:"50%",animation:"spin 0.8s linear infinite",position:"absolute"},
  spinEmoji:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},
  loadTxt:{fontSize:20,fontWeight:700,color:"#2d8a3e",marginBottom:4},
  resultsTitle:{fontSize:28,fontWeight:900,color:"#1a1a1a",marginBottom:24,letterSpacing:"-0.5px",fontFamily:"'Playfair Display','Georgia',serif"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:24},
  card:{background:"#fff",borderRadius:20,boxShadow:"0 6px 30px rgba(0,0,0,0.08)",overflow:"hidden",cursor:"pointer",border:"1px solid #e8f5ea"},
  cardImgWrap:{position:"relative",height:200,overflow:"hidden"},
  cardImg:{width:"100%",height:"100%",objectFit:"cover"},
  imgOverlay:{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.5))"},
  diffBadge:{position:"absolute",top:12,right:12,background:"#2d8a3e",color:"#fff",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700},
  savedBadge:{position:"absolute",bottom:12,left:12,background:"rgba(0,0,0,0.6)",color:"#b8f5c8",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600},
  cardBody:{padding:18},
  cardTitle:{fontSize:19,fontWeight:800,color:"#1a1a1a",margin:"0 0 10px",fontFamily:"'Playfair Display','Georgia',serif"},
  cardMeta:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10},
  meta:{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#666",fontWeight:500},
  cardIngs:{fontSize:13,color:"#555",lineHeight:1.5,marginBottom:14},
  viewBtn:{background:"#2d8a3e",color:"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"},
  panelOverlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",justifyContent:"flex-end"},
  panel:{background:"#fff",width:"min(420px,95vw)",height:"100%",overflowY:"auto",padding:28,boxShadow:"-8px 0 40px rgba(0,0,0,0.15)"},
  impactBanner:{display:"flex",background:"#2d8a3e",color:"#fff",borderRadius:20,padding:"24px 32px",marginBottom:24,justifyContent:"space-around",alignItems:"center",boxShadow:"0 8px 30px rgba(45,138,62,0.3)"},
  impactItem:{textAlign:"center"},
  impactN:{display:"block",fontSize:28,fontWeight:900},
  impactL:{fontSize:11,opacity:0.85},
  impactDiv:{width:1,height:50,background:"rgba(255,255,255,0.3)"},
  progressWrap:{marginBottom:24},
  progressBar:{height:10,background:"#e8f8ec",borderRadius:10,overflow:"hidden"},
  progressFill:{height:"100%",background:"#2d8a3e",borderRadius:10,transition:"width 0.6s ease"},
  empty:{textAlign:"center",padding:"60px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:16},
  savedItem:{display:"flex",alignItems:"center",gap:16,background:"#fff",borderRadius:16,padding:"12px 16px",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",border:"1px solid #e8f5ea"},
  savedImg:{width:60,height:60,borderRadius:12,objectFit:"cover"},
  modalOverlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20},
  modal:{background:"#fff",borderRadius:24,maxWidth:560,width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative",boxShadow:"0 20px 80px rgba(0,0,0,0.3)"},
  modalClose:{position:"absolute",top:16,right:16,zIndex:10,background:"rgba(0,0,0,0.5)",color:"#fff",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:16,fontWeight:700},
  modalImg:{width:"100%",height:240,objectFit:"cover",borderRadius:"24px 24px 0 0"},
  modalImgOverlay:{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)",borderRadius:"24px 24px 0 0",display:"flex",alignItems:"flex-end",padding:"20px 24px"},
  modalBody:{padding:24},
  modalMeta:{display:"flex",marginBottom:16,background:"#f5f9f0",borderRadius:14,overflow:"hidden"},
  metaBox:{flex:1,textAlign:"center",padding:"12px 8px",fontSize:13,display:"flex",flexDirection:"column",gap:4,borderRight:"1px solid #e8f5ea"},
  ingBox:{background:"#fffde8",border:"1.5px solid #ffe08a",borderRadius:12,padding:"12px 16px",fontSize:14,marginBottom:18,lineHeight:1.6},
  greenBadge:{background:"#e8f8ec",border:"1px solid #c5eacc",borderRadius:10,padding:"10px 16px",fontSize:14,color:"#2d8a3e",fontWeight:600,marginBottom:16,textAlign:"center"},
  doneBtn:{background:"#2d8a3e",color:"#fff",border:"none",borderRadius:12,padding:"14px 24px",fontSize:15,fontWeight:700,cursor:"pointer"},
  cancelBtn:{background:"#f0f0f0",color:"#555",border:"none",borderRadius:12,padding:"12px 24px",fontSize:14,fontWeight:600,cursor:"pointer"},
  resetBtn:{background:"#fff",color:"#cc4444",border:"1.5px solid #cc4444",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"},
  deleteBtn:{background:"#fff",color:"#cc4444",border:"1.5px solid #ffcccc",borderRadius:"50%",width:32,height:32,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  // News section — cards horizontales con imagen a la izquierda
  newsSection:{marginTop:60,marginBottom:40},
  newsHeader:{marginBottom:32,textAlign:"center"},
  newsLabel:{color:"#2d8a3e",fontSize:12,fontWeight:700,letterSpacing:"2px",marginBottom:8},
  newsTitle:{fontSize:34,fontWeight:900,color:"#1a1a1a",margin:"0 0 8px",fontFamily:"'Playfair Display','Georgia',serif"},
  newsSub:{fontSize:15,color:"#666",maxWidth:500,margin:"0 auto"},
  newsGrid:{display:"flex",flexDirection:"column",gap:20},
  newsCard:{background:"#fff",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",border:"1px solid #e8f5ea",textDecoration:"none",color:"inherit",display:"grid",gridTemplateColumns:"280px 1fr",transition:"transform 0.2s, box-shadow 0.2s",cursor:"pointer",minHeight:200},
  newsImgWrap:{position:"relative",overflow:"hidden"},
  newsImg:{width:"100%",height:"100%",objectFit:"cover",minHeight:200},
  newsCategoryBadge:{position:"absolute",top:16,left:16,background:"rgba(45,138,62,0.95)",color:"#fff",fontSize:11,fontWeight:700,letterSpacing:"1.5px",padding:"6px 12px",borderRadius:20,backdropFilter:"blur(4px)"},
  newsCardBody:{padding:"24px 28px",display:"flex",flexDirection:"column",gap:10,justifyContent:"space-between"},
  newsCardTitle:{fontSize:20,fontWeight:800,color:"#1a1a1a",margin:0,lineHeight:1.3,fontFamily:"'Playfair Display','Georgia',serif"},
  newsCardExcerpt:{fontSize:14,color:"#555",lineHeight:1.6,margin:0,flex:1},
  newsCardFooter:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:8,gap:12,flexWrap:"wrap"},
  newsSource:{fontSize:12,color:"#2d8a3e",fontWeight:700},
  newsDate:{fontSize:11,color:"#999"},
  newsReadMore:{color:"#2d8a3e",fontSize:13,fontWeight:700,whiteSpace:"nowrap"},
  // Footer
  footer:{textAlign:"center",padding:"40px 20px 20px",borderTop:"1px solid #e8f5ea",marginTop:40},
  footerText:{color:"#555",fontSize:14,margin:"0 0 6px"},
  footerSmall:{color:"#999",fontSize:12,margin:0},
};

if (typeof document !== "undefined") {
  // Google Fonts — Playfair Display (serif editorial) + Poppins (sans-serif moderna)
  if (!document.getElementById("cookia-fonts")) {
    const link = document.createElement("link");
    link.id = "cookia-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Poppins:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }
  const st = document.createElement("style");
  st.textContent = `
    *,*::before,*::after{box-sizing:border-box}
    html,body,#root{margin:0;padding:0;width:100%;min-height:100vh;background:#f5f9f0;font-family:'Poppins','Segoe UI',sans-serif}
    @keyframes spin{to{transform:rotate(360deg)}}
    a[style*="grid-template-columns: 280px"]:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,0.12) !important}

    /* Tablet & desktop normal */
    @media(max-width:720px){
      a[style*="grid-template-columns: 280px"]{grid-template-columns:1fr !important}
      a[style*="grid-template-columns: 280px"] > div:first-child img{min-height:200px !important;max-height:240px !important}
    }

    /* Móvil — apila input y botón del buscador, reduce títulos */
    @media(max-width:600px){
      .cookia-main{padding:20px 16px !important}
      .cookia-hero-title{font-size:32px !important;line-height:1.2 !important}
      .cookia-hero-sub{font-size:15px !important}
      .cookia-search-box{padding:14px !important;margin-bottom:16px !important}
      .cookia-input-row{flex-direction:column !important;gap:8px !important}
      .cookia-input-row input{width:100% !important;font-size:16px !important}
      .cookia-input-row button{width:100% !important;padding:12px !important;justify-content:center !important}
      .cookia-nav-inner{padding:0 16px !important}
      .cookia-camera-btn{width:100% !important;justify-content:center !important}
      .cookia-big-btn{width:100% !important;justify-content:center !important;padding:14px !important}
      .cookia-results-title{font-size:22px !important}
      .cookia-news-title{font-size:26px !important}
      .cookia-top-bar{padding:12px !important;gap:10px !important}
      .cookia-top-bar-actions{justify-content:flex-end !important}

      /* Nav — oculta desktop, muestra hamburguesa */
      .cookia-nav-desktop{display:none !important}
      .cookia-hamburger{display:flex !important}
      .cookia-mobile-menu{display:flex !important}

      /* Impact banner — apila en vertical con buen espaciado */
      .cookia-impact-banner{flex-direction:column !important;gap:16px !important;padding:20px !important}
      .cookia-impact-banner > div:not([class]){width:100%}
      .cookia-impact-divider{width:100% !important;height:1px !important;margin:0 !important}
    }
  `;
  document.head.appendChild(st);
}
