import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Groq es ultrarrápido — Llama 3.3 70B tarda 1-3 segundos
const MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

// Modelo con visión para análisis de fotos de nevera
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));

const PROMPT_PREVIEW = (count = 6, ingredientList = "") => `You are a Spanish chef. Generate exactly ${count} DIFFERENT recipes.

⚠️ CRITICAL RULE — READ CAREFULLY:
The user has THESE ingredients and ONLY these: ${ingredientList}
You MUST ONLY use ingredients from this exact list. You CANNOT invent or add any other ingredient.

WHAT IS ALLOWED:
- Any ingredient from the user's list above.
- Basic pantry staples ONLY: salt (sal), pepper (pimienta), olive oil (aceite), water (agua).

WHAT IS FORBIDDEN:
- Do NOT add eggs unless "huevos" is in the list.
- Do NOT add flour unless "harina" is in the list.
- Do NOT add milk, butter, cheese, meat, fish, or any ingredient NOT in the user's list.
- If a classic recipe needs an ingredient the user doesn't have, SKIP THAT RECIPE and propose a different dish.

EXAMPLE (if user has: tomate, ajo, queso, cebolla):
✅ VALID: "Queso fundido con tomate y cebolla" (uses only tomate, queso, cebolla)
❌ INVALID: "Tortilla de queso y cebolla" (needs huevos, which is NOT in the list)

RESPOND ONLY with pure JSON, no markdown, no explanations:
{"recipes":[{"name":"Tortilla de patatas","dishKeyword":"spanish potato omelette dish","time":"20 min","servings":2,"difficulty":"Fácil","ingredients":["huevos","patatas"],"calories":350,"saved_grams":400}]}

- name: creative but coherent recipe name in Spanish, describing exactly what the dish contains
- dishKeyword: 3-4 words in English describing the PLATED COOKED DISH for a food photo search
- difficulty: exactly "Fácil", "Media", or "Difícil"
- saved_grams: integer between 200 and 800
- Vary techniques: soup, stir-fry, baked, salad, stew, roasted, grilled, etc.`;

const PROMPT_STEPS = (allowedIngredients = "") => `You are a chef. Give step-by-step instructions for this recipe.

⚠️ CRITICAL RULE:
The cook only has these ingredients: ${allowedIngredients}
Plus basic pantry staples: salt, pepper, olive oil, water.

You MUST:
- Only mention ingredients from the list above OR the basic staples.
- NEVER mention "caldo de verduras", "caldo de pollo", "stock", "broth" or any ingredient NOT in the list.
- If the recipe traditionally uses something the cook doesn't have (like broth), use water + salt instead.
- NEVER mention sugar, milk, butter, flour, eggs, or any other ingredient unless it's explicitly in the list.

RESPOND ONLY with pure JSON, no markdown: {"steps":["step1","step2","step3","step4","step5"]}
Write steps in Spanish. Maximum 5 clear and concise steps. Do NOT add "Paso 1:" or numbers at the start - just the instruction.`;

const VISION_PROMPT = `You are analyzing a photo of a fridge, pantry, or food items.

CRITICAL RULES:
1. Only list food items that are CLEARLY AND UNAMBIGUOUSLY visible in the photo.
2. Do NOT guess, infer, or invent any ingredient that you cannot actually see.
3. If the image is blurry, dark, too far, or you are not SURE what's there, return an empty list with confidence "baja".
4. Do NOT list ingredients that are typically in a fridge but not visible in this specific photo.
5. If you see packaging but cannot clearly identify the contents, skip it.

RESPOND ONLY with pure JSON, no markdown:
{"ingredients":["ingrediente1","ingrediente2"],"confidence":"alta|media|baja","note":"brief note in Spanish"}

- List ingredients in Spanish (e.g., "huevos", "leche", "tomates")
- Omit salt, pepper, oil, and common spices
- confidence: "alta" only if you are 100% sure of every item. "media" if somewhat sure. "baja" if uncertain.
- If you cannot identify any clear ingredient, return empty ingredients array and confidence "baja"`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const groqHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
});

async function callGroq(messages, maxTokens = 1000, model = MODEL, retries = 2) {
  console.log(`🤖 Groq: ${model}${retries < 2 ? ` (intento ${3 - retries}/3)` : ""}`);
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: groqHeaders(),
    body: JSON.stringify({
      model, messages, temperature: 0.7, max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const status = res.status;
    console.warn(`⚠️ ${model} → HTTP ${status}: ${err?.error?.message?.slice(0, 80)}`);

    // Retry on 502/503/529 (cold start / overloaded)
    if ((status === 502 || status === 503 || status === 529) && retries > 0) {
      console.log(`⏳ Cold start detectado, reintentando en 2s...`);
      await new Promise(r => setTimeout(r, 2000));
      return callGroq(messages, maxTokens, model, retries - 1);
    }

    // Fallback to smaller model on rate limit or persistent error
    if (model !== FALLBACK_MODEL) {
      console.log(`🔄 Cambiando a modelo fallback: ${FALLBACK_MODEL}`);
      return callGroq(messages, maxTokens, FALLBACK_MODEL, retries);
    }
  }
  return res;
}

function parseJSON(text) {
  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.search(/[\[{]/);
  const end = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
  if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1);
  return JSON.parse(clean);
}

// ── POST /api/recipes ─────────────────────────────────────────────────────────
app.post("/api/recipes", async (req, res) => {
  const { ingredients, count = 6 } = req.body;
  if (!ingredients?.length) return res.status(400).json({ error: "Añade al menos un ingrediente." });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY no configurada." });

  console.log(`\n📥 ${count} recetas — ${ingredients.length} ingredientes: ${ingredients.join(", ")}`);
  const start = Date.now();

  const messages = [
    { role: "system", content: PROMPT_PREVIEW(count, ingredients.join(", ")) },
    { role: "user", content: `My ingredients: ${ingredients.join(", ")}. Generate ${count} recipes using ONLY these.` },
  ];

  // Más tokens para permitir 6 recetas completas
  const response = await callGroq(messages, 2000);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(502).json({ error: "Error de Groq", details: err });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  let parsed;
  try { parsed = parseJSON(text); }
  catch { return res.status(500).json({ error: "Formato inesperado. Intenta de nuevo.", rawResponse: text }); }

  // ── FILTRO DE SEGURIDAD — descarta recetas con ingredientes no permitidos ──
  const PANTRY_BASICS = ["sal","pimienta","aceite","agua","aceite de oliva","salt","pepper","oil","water",
    "azúcar","sugar","vinagre","vinegar","especias","spices","hierbas","herbs"];

  // Normaliza: quita acentos, minúsculas, elimina palabras de medida
  const normalize = (s) => s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(de|del|la|el|los|las|al|un|una|con|sin)\b/g, " ")
    .replace(/\s+/g, " ").trim();

  const userIngredientsNorm = ingredients.map(normalize);
  const pantryNorm = PANTRY_BASICS.map(normalize);

  // Comprueba si un ingrediente de la receta está en la lista del usuario o en la despensa
  const isAllowed = (ing) => {
    const norm = normalize(ing);
    if (pantryNorm.some(p => norm.includes(p) || p.includes(norm))) return true;
    return userIngredientsNorm.some(u => norm.includes(u) || u.includes(norm));
  };

  const originalCount = parsed.recipes?.length || 0;
  if (Array.isArray(parsed.recipes)) {
    parsed.recipes = parsed.recipes.filter(r => {
      if (!Array.isArray(r.ingredients)) return false;
      const invalid = r.ingredients.filter(i => !isAllowed(i));
      if (invalid.length > 0) {
        console.log(`   ❌ Descartada "${r.name}" — ingredientes no permitidos: ${invalid.join(", ")}`);
        return false;
      }
      return true;
    });
  }

  const filteredCount = parsed.recipes?.length || 0;
  if (filteredCount < originalCount) {
    console.log(`   🔍 Filtro: ${originalCount} → ${filteredCount} recetas válidas`);
  }

  if (filteredCount === 0) {
    return res.status(422).json({
      error: "La IA generó recetas con ingredientes no disponibles. Añade más ingredientes o intenta de nuevo."
    });
  }

  console.log(`✅ ${filteredCount} recetas en ${((Date.now()-start)/1000).toFixed(1)}s\n`);
  return res.json(parsed);
});

// ── POST /api/recipe-steps ────────────────────────────────────────────────────
app.post("/api/recipe-steps", async (req, res) => {
  const { name, ingredients, userIngredients } = req.body;
  if (!name) return res.status(400).json({ error: "Falta el nombre de la receta." });

  console.log(`\n📋 Pasos: ${name}`);
  const start = Date.now();
  // Si hay userIngredients (del usuario), úsalos como lista permitida. Si no, usa los de la receta.
  const allowed = Array.isArray(userIngredients) && userIngredients.length > 0
    ? userIngredients
    : (Array.isArray(ingredients) ? ingredients : []);
  const ingList = allowed.join(", ");
  const messages = [
    { role: "system", content: PROMPT_STEPS(ingList) },
    { role: "user", content: `Recipe: ${name}. Ingredients available: ${ingList}. Remember: use ONLY these ingredients plus salt, pepper, oil, water.` },
  ];

  const response = await callGroq(messages, 500);
  if (!response.ok) return res.status(502).json({ error: "No se pudieron cargar los pasos." });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  let parsed;
  try { parsed = parseJSON(text); }
  catch { return res.status(500).json({ error: "Error al cargar pasos." }); }

  // ── Sanitizar pasos: sustituye ingredientes prohibidos por equivalentes ──
  // Reglas de sustitución para ingredientes comunes que suele añadir la IA
  const SUBSTITUTIONS = [
    { pattern: /caldo\s+de\s+\w+/gi, replacement: "agua con sal" },
    { pattern: /\bcaldo\b/gi, replacement: "agua con sal" },
    { pattern: /\bbroth\b/gi, replacement: "agua" },
    { pattern: /\bstock\b/gi, replacement: "agua" },
  ];

  if (Array.isArray(parsed.steps)) {
    parsed.steps = parsed.steps.map(step => {
      let s = String(step);
      for (const { pattern, replacement } of SUBSTITUTIONS) {
        s = s.replace(pattern, replacement);
      }
      return s;
    });
  }

  console.log(`✅ Pasos en ${((Date.now()-start)/1000).toFixed(1)}s\n`);
  return res.json(parsed);
});

// ── POST /api/analyze-photo ───────────────────────────────────────────────────
app.post("/api/analyze-photo", async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: "No se recibió ninguna imagen." });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY no configurada." });

  console.log(`\n📸 Analizando foto (${Math.round(image.length*0.75/1024)} KB)...`);
  const start = Date.now();

  const messages = [{
    role: "user",
    content: [
      { type: "image_url", image_url: { url: `data:${mimeType || "image/jpeg"};base64,${image}` } },
      { type: "text", text: VISION_PROMPT },
    ],
  }];

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: groqHeaders(),
    body: JSON.stringify({
      model: VISION_MODEL, messages, max_tokens: 400,
      temperature: 0.1,  // temperatura baja = más conservador, menos alucinaciones
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error(`❌ Vision HTTP ${response.status}:`, JSON.stringify(err));
    return res.status(502).json({ error: "Error al analizar la imagen", details: err });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  let parsed;
  try { parsed = parseJSON(text); }
  catch { return res.status(500).json({ error: "No se pudo interpretar la imagen.", rawResponse: text }); }

  console.log(`✅ Detectados en ${((Date.now()-start)/1000).toFixed(1)}s: ${parsed.ingredients?.join(", ")}\n`);
  return res.json(parsed);
});

// ── GET /api/recipe-image ─────────────────────────────────────────────────────
// Busca una foto real y específica del plato usando Pexels (requiere PEXELS_API_KEY en .env)
// Fallback automático a loremflickr si no hay key o falla
const imageCache = new Map();

app.get("/api/recipe-image", async (req, res) => {
  const query = (req.query.q || "food").toString().toLowerCase();
  const cacheKey = query;

  if (imageCache.has(cacheKey)) {
    return res.redirect(imageCache.get(cacheKey));
  }

  // Opción 1: Pexels si hay API Key
  if (process.env.PEXELS_API_KEY) {
    try {
      // Force "cooked dish" context so we never get raw ingredient photos
      const cleanQuery = query.replace(/raw|fresh|whole|head|fillet|ingredient/gi, "").trim();
      const searchQuery = encodeURIComponent(cleanQuery + " cooked dish food");
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=5&orientation=landscape`,
        { headers: { "Authorization": process.env.PEXELS_API_KEY } }
      );
      if (pexelsRes.ok) {
        const data = await pexelsRes.json();
        // Pick a random photo from top 5 results for variety
        const photos = data.photos || [];
        if (photos.length > 0) {
          const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 3))];
          if (pick?.src?.large) {
            imageCache.set(cacheKey, pick.src.large);
            return res.redirect(pick.src.large);
          }
        }
      }
    } catch { /* fallback abajo */ }
  }

  // Opción 2 (fallback): loremflickr con tag específico
  const url = `https://loremflickr.com/500/350/${encodeURIComponent(query)}/all?lock=${Math.abs(query.split("").reduce((a,c)=>a+c.charCodeAt(0),0))}`;
  imageCache.set(cacheKey, url);
  return res.redirect(url);
});

// ── GET /api/test ─────────────────────────────────────────────────────────────
app.get("/api/test", async (_, res) => {
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "❌ GROQ_API_KEY no encontrada en .env" });
  
  console.log(`\n🧪 Test — API Key empieza por: ${process.env.GROQ_API_KEY.slice(0, 10)}...`);
  
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: groqHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "Say only: OK" }],
        max_tokens: 10,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Groq HTTP ${response.status}:`, JSON.stringify(data, null, 2));
      return res.status(502).json({
        error: `Groq rechazó la petición (HTTP ${response.status})`,
        status: response.status,
        details: data,
      });
    }
    
    return res.json({
      status: "✅ Groq funcionando correctamente",
      model: MODEL,
      response: data.choices?.[0]?.message?.content,
    });
  } catch (err) {
    console.error("❌ Error de red:", err.message);
    return res.status(500).json({ error: "Error de red", details: err.message });
  }
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok", message: "CookIA con Groq ⚡" }));

// ── GET /api/warmup ───────────────────────────────────────────────────────────
// Pre-calienta el modelo con una petición rápida para evitar el 502 del primer intento
app.get("/api/warmup", async (_, res) => {
  if (!process.env.GROQ_API_KEY) return res.json({ status: "no-key" });
  try {
    console.log("🔥 Warmup...");
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: groqHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "ok" }],
        max_tokens: 5,
      }),
    });
    if (response.ok) {
      console.log("✅ Warmup completado");
      return res.json({ status: "warm" });
    }
    return res.json({ status: "cold", code: response.status });
  } catch {
    return res.json({ status: "error" });
  }
});

// ── Frontend estático ─────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const distPath   = join(__dirname, "..", "dist");

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*$/, (_, res) => res.sendFile(join(distPath, "index.html")));
  console.log(`   Frontend: ✅ ${distPath}`);
} else {
  console.log(`   Frontend: ⚠️  Ejecuta 'npm run build' en cookia/`);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🍳 CookIA backend en http://localhost:${PORT}`);
  console.log(`   ⚡ Usando Groq (ultrarrápido)`);
  console.log(`   Modelo: ${MODEL}`);
  console.log(`   API Key: ${process.env.GROQ_API_KEY ? "✅" : "❌"}\n`);
});
