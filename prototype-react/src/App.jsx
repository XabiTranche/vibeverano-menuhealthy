import { NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Filter,
  Home,
  Info,
  Leaf,
  Plus,
  Search,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react'

const appData = {
  familySummary: {
    status: 'Listo para planificar',
    pending: 0,
    members: [
      {
        id: 'mama',
        initial: 'M',
        name: 'Mamá',
        rules: ['Sin lactosa', 'Evita picante'],
        goal: 'Mantener energía + cenas rápidas',
      },
      {
        id: 'papa',
        initial: 'P',
        name: 'Papá',
        rules: ['Sin restricciones'],
        goal: 'Perder peso suave',
      },
      {
        id: 'peque-1',
        initial: 'P',
        name: 'Peque 1',
        rules: ['Sin gluten'],
        goal: 'Comer variado',
      },
      {
        id: 'peque-2',
        initial: 'P',
        name: 'Peque 2',
        rules: ['Texturas suaves'],
        goal: 'Sumar verduras sin fricción',
      },
    ],
  },
  week: {
    range: 'Semana del 14–20 julio',
    status: 'Borrador',
    shoppingStatus: 'Lista no actualizada',
    insight: 'La semana prioriza cenas rápidas, platos mediterráneos y compatibilidad sin gluten/sin lactosa.',
    today: {
      lunch: 'Lentejas suaves con verduras',
      dinner: 'Tortilla jugosa + ensalada crujiente',
    },
    days: [
      {
        slug: 'lunes',
        name: 'Lunes',
        match: 'Encaja',
        status: 'Sin conflictos',
        meals: {
          desayuno: { title: 'Porridge de avena y fruta', meta: 'rápido · saciante' },
          comida: { title: 'Pasta sin gluten con verduras', meta: 'batch cooking · niños OK', recipeId: 'pasta-verduras' },
          cena: { title: 'Crema de calabaza + merluza', meta: 'ligera · cena rápida', recipeId: 'merluza-pure' },
        },
      },
      {
        slug: 'martes',
        name: 'Martes',
        match: 'Encaja',
        status: 'Proteína equilibrada',
        meals: {
          desayuno: { title: 'Yogur vegetal con avena', meta: 'sin lactosa · 5 min' },
          comida: { title: 'Arroz con pollo y verduras', meta: 'familiar · congelable', recipeId: 'arroz-pollo' },
          cena: { title: 'Ensalada templada con huevo', meta: 'menos carga mental', recipeId: 'ensalada-templada' },
        },
      },
      {
        slug: 'miercoles',
        name: 'Miércoles',
        match: 'Encaja',
        status: 'Semana en verde',
        meals: {
          desayuno: { title: 'Tostada sin gluten + hummus', meta: 'salado · rápido' },
          comida: { title: 'Garbanzos con calabacín', meta: 'fibra alta · hogar', recipeId: 'garbanzos-calabacin' },
          cena: { title: 'Salmón al horno + puré', meta: 'omega 3 · niños OK', recipeId: 'salmon-pure' },
        },
      },
      {
        slug: 'jueves',
        name: 'Jueves',
        match: 'Ajustado',
        status: 'Compra cambia si sustituyes la cena',
        meals: {
          desayuno: { title: 'Yogur vegetal + fruta + avena', meta: 'rápido · apto sin lactosa' },
          comida: { title: 'Pollo al horno + boniato', meta: 'alto en proteína', recipeId: 'pollo-boniato' },
          cena: { title: 'Crema de calabacín + tortilla', meta: 'niños OK · compra cambia', recipeId: 'crema-tortilla' },
        },
      },
      {
        slug: 'viernes',
        name: 'Viernes',
        match: 'Encaja',
        status: 'Cena flexible',
        meals: {
          desayuno: { title: 'Smoothie verde suave', meta: 'rápido' },
          comida: { title: 'Lentejas suaves', meta: 'cuchara · reconfortante', recipeId: 'lentejas-suaves' },
          cena: { title: 'Tacos de pollo sin gluten', meta: 'divertido · personalizable', recipeId: 'tacos-pollo' },
        },
      },
    ],
  },
  recipes: [
    {
      id: 'lasana-verduras',
      name: 'Lasaña de verduras',
      type: 'Cena',
      minutes: 35,
      servings: 4,
      hero: 'Capas de verduras asadas, tomate suave y bechamel vegetal ligera.',
      tags: ['Sin gluten', 'Sin lactosa', 'Niños OK'],
      goals: ['Alta proteína'],
      status: 'En uso',
      usage: 'En menú activo de esta semana',
      nutrition: { kcal: 420, protein: '22g', carbs: '38g', fats: '14g' },
      ingredients: ['Calabacín', 'Tomate triturado', 'Bechamel veg', 'Láminas sin gluten', 'Mozzarella sin lactosa'],
    },
    {
      id: 'arroz-pollo',
      name: 'Arroz con pollo',
      type: 'Comida',
      minutes: 40,
      servings: 4,
      hero: 'Arroz meloso con pollo, zanahoria y pimiento dulce.',
      tags: ['Compatible niños'],
      goals: ['Equilibrada'],
      status: '',
      usage: 'Aparece como comida del martes',
      nutrition: { kcal: 510, protein: '29g', carbs: '52g', fats: '11g' },
      ingredients: ['Arroz', 'Pechuga de pollo', 'Zanahoria', 'Pimiento', 'Caldo suave'],
    },
    {
      id: 'crema-calabaza',
      name: 'Crema de calabaza',
      type: 'Cena',
      minutes: 20,
      servings: 4,
      hero: 'Crema suave con topping crujiente y aceite de oliva.',
      tags: ['Vegetal'],
      goals: ['Nutrición incompleta'],
      status: 'Incompleta',
      usage: 'Se usa como base de dos cenas rápidas',
      nutrition: { kcal: 260, protein: '7g', carbs: '24g', fats: '10g' },
      ingredients: ['Calabaza', 'Cebolla', 'Patata', 'Caldo vegetal', 'Semillas'],
    },
    {
      id: 'merluza-pure',
      name: 'Merluza + puré',
      type: 'Cena',
      minutes: 25,
      servings: 4,
      hero: 'Pescado blanco al vapor con puré de patata y aceite verde.',
      tags: ['Sin gluten', 'Niños OK'],
      goals: ['Ligera'],
      status: '',
      usage: 'Sustitución rápida compatible para jueves',
      nutrition: { kcal: 340, protein: '28g', carbs: '21g', fats: '9g' },
      ingredients: ['Merluza', 'Patata', 'Aceite de oliva', 'Perejil', 'Limón'],
    },
  ],
  shopping: {
    status: 'Lista desactualizada',
    reason: 'Cambió tras ajustar la cena del jueves',
    diff: ['+ Merluza filetes', '+ Patatas medianas'],
    sections: [
      { name: 'Verduras', items: [{ name: 'Calabacín x2', done: false }, { name: 'Tomate triturado', done: false }, { name: 'Cebolla', done: true }] },
      { name: 'Proteínas', items: [{ name: 'Pechuga de pollo', done: false }, { name: 'Huevos docena', done: false }] },
      { name: 'Despensa', items: [{ name: 'Avena', done: true }, { name: 'Pasta sin gluten', done: false }] },
    ],
  },
  substitutions: [
    {
      id: 'merluza-pure',
      name: 'Merluza + puré',
      fit: 'Compatibilidad total',
      impact: 'Sin cambios críticos',
      tone: 'success',
    },
    {
      id: 'ensalada-templada',
      name: 'Ensalada templada',
      fit: 'OK pero menos saciante',
      impact: 'Revisar objetivo proteína',
      tone: 'warning',
    },
    {
      id: 'pasta-legumbre',
      name: 'Pasta de legumbre',
      fit: 'Compatible',
      impact: 'Añade 2 items a compra',
      tone: 'info',
    },
  ],
}

const tabs = [
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: '/recetas', label: 'Recetas', icon: Leaf },
  { to: '/compra', label: 'Compra', icon: ShoppingCart },
  { to: '/familia', label: 'Familia', icon: Users },
]

function App() {
  return (
    <div className="app-shell">
      <div className="device-frame">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/alta-hogar" element={<OnboardingScreen />} />
          <Route path="/plan" element={<WeeklyPlanScreen />} />
          <Route path="/plan/:daySlug" element={<DayDetailScreen />} />
          <Route path="/recetas" element={<RecipesScreen />} />
          <Route path="/recetas/:recipeId" element={<RecipeDetailScreen />} />
          <Route path="/compra" element={<ShoppingScreen />} />
          <Route path="/familia" element={<FamilyScreen />} />
          <Route path="/sustitucion-rapida" element={<SubstitutionScreen />} />
        </Routes>
      </div>
    </div>
  )
}

function HomeRedirect() {
  return <Navigate to="/alta-hogar" replace />
}

function Screen({ title, subtitle, right, cta, children, showNav = true }) {
  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="eyebrow">VibeVerano MenuHealthy</p>
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        {right}
      </header>
      <main className="content">{children}</main>
      {cta ? <div className="sticky-cta">{cta}</div> : null}
      {showNav ? <BottomNav /> : null}
    </div>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function BackButton({ to }) {
  const navigate = useNavigate()
  return (
    <button type="button" aria-label="Volver" className="icon-button" onClick={() => (to ? navigate(to) : navigate(-1))}>
      <ArrowLeft size={20} />
    </button>
  )
}

function OnboardingScreen() {
  return (
    <Screen
      title="Alta del hogar"
      subtitle="Empieza con lo mínimo para generar una semana clara y tranquila."
      showNav={false}
      cta={<NavLink to="/plan" className="button primary full">Continuar al plan semanal</NavLink>}
      right={<div className="progress-pill">Paso 1 · 25%</div>}
    >
      <Card className="hero-card soft-green">
        <div className="inline-row space-between">
          <div>
            <p className="card-kicker">Configura tu hogar</p>
            <h2>1 pregunta principal por pantalla + progreso visible</h2>
          </div>
          <Home className="hero-icon" />
        </div>
      </Card>

      <Card>
        <Label>¿Cuántas personas comen en casa?</Label>
        <div className="option-grid two">
          <Selectable active>2 adultos</Selectable>
          <Selectable active>2 peques</Selectable>
          <Selectable>1 adulto</Selectable>
          <Selectable>Otro hogar</Selectable>
        </div>
      </Card>

      <Card>
        <Label>¿Hay restricciones obligatorias?</Label>
        <div className="chip-wrap">
          {['Sin gluten', 'Sin lactosa', 'Frutos secos', 'Vegetariano'].map((item, index) => (
            <span key={item} className={`chip ${index < 2 ? 'chip-active' : ''}`}>{item}</span>
          ))}
        </div>
      </Card>

      <Card>
        <Label>Objetivo principal</Label>
        <Selectable active icon={<Sparkles size={16} />}>Semana práctica y equilibrada</Selectable>
      </Card>

      <div className="inline-actions">
        <button className="button secondary full">Guardar y seguir luego</button>
        <button className="button tertiary full">Ver progreso</button>
      </div>
    </Screen>
  )
}

function WeeklyPlanScreen() {
  return (
    <Screen
      title="Plan semanal"
      subtitle={appData.week.range}
      cta={<button className="button primary full">Aprobar semana</button>}
      right={<StatusBadge tone="warning">{appData.week.status}</StatusBadge>}
    >
      <Card className="soft-green">
        <div className="inline-row space-between align-start">
          <div>
            <p className="card-kicker">Hoy</p>
            <h2>Estado del hogar bajo control</h2>
            <p className="supporting">{appData.week.insight}</p>
          </div>
          <StatusBadge tone="muted">{appData.week.shoppingStatus}</StatusBadge>
        </div>
        <div className="dual-panel">
          <MiniMeal label="Comida" title={appData.week.today.lunch} />
          <MiniMeal label="Cena" title={appData.week.today.dinner} />
        </div>
      </Card>

      {appData.week.days.map((day) => (
        <Card key={day.slug} className="day-card">
          <div className="inline-row space-between align-start">
            <div>
              <h3>{day.name}</h3>
              <p className="supporting">{day.status}</p>
            </div>
            <StatusBadge tone={day.match === 'Ajustado' ? 'info' : 'success'}>{day.match}</StatusBadge>
          </div>
          <div className="meal-stack compact">
            <MealLine label="Comida" title={day.meals.comida.title} meta={day.meals.comida.meta} />
            <MealLine label="Cena" title={day.meals.cena.title} meta={day.meals.cena.meta} />
          </div>
          <div className="inline-actions two-cols">
            <NavLink to={`/plan/${day.slug}`} className="button secondary full">Ver detalle</NavLink>
            <NavLink to="/sustitucion-rapida" className="button tertiary full">Sustituir <ChevronRight size={16} /></NavLink>
          </div>
        </Card>
      ))}
    </Screen>
  )
}

function DayDetailScreen() {
  const { daySlug } = useParams()
  const day = appData.week.days.find((item) => item.slug === daySlug) ?? appData.week.days[3]
  const recipeMap = Object.fromEntries(appData.recipes.map((recipe) => [recipe.id, recipe]))

  return (
    <Screen
      title="Detalle del día"
      subtitle={`${day.name} · edición clara sin perder contexto`}
      right={<BackButton to="/plan" />}
      cta={<NavLink to="/sustitucion-rapida" className="button primary full">Revisar sustitución rápida</NavLink>}
    >
      <Card className="info-card">
        <div className="inline-row space-between align-start">
          <div>
            <p className="card-kicker">Estado</p>
            <h2>Ajustado tras aprobación</h2>
          </div>
          <StatusBadge tone="info">Revisar</StatusBadge>
        </div>
        <p className="supporting">La cena puede cambiar la compra. El resto del día mantiene objetivos y restricciones.</p>
      </Card>

      {Object.entries(day.meals).map(([slot, meal]) => {
        const linkedRecipe = meal.recipeId ? recipeMap[meal.recipeId] : null
        return (
          <Card key={slot}>
            <p className="card-kicker capitalize">{slot}</p>
            <h3>{meal.title}</h3>
            <p className="supporting">{meal.meta}</p>
            <div className="inline-actions two-cols">
              {linkedRecipe ? (
                <NavLink to={`/recetas/${linkedRecipe.id}`} className="button secondary full">Ver receta</NavLink>
              ) : (
                <button className="button secondary full">Ver receta</button>
              )}
              <NavLink to="/sustitucion-rapida" className="button tertiary full">Cambiar</NavLink>
            </div>
          </Card>
        )
      })}
    </Screen>
  )
}

function RecipesScreen() {
  return (
    <Screen
      title="Catálogo de recetas"
      subtitle="Librería operativa con búsqueda fuerte, filtros visibles y uso conectado al plan."
      cta={<button className="button primary full"><Plus size={18} />Nueva receta</button>}
      right={<div className="icon-chip"><Search size={16} />Buscar</div>}
    >
      <Card>
        <div className="search-bar">
          <Search size={18} />
          <span>Buscar por nombre o ingrediente</span>
        </div>
        <div className="inline-row space-between mt-16">
          <div className="chip-wrap">
            {['Cena', 'Sin gluten', 'Alta proteína'].map((tag) => <span key={tag} className="chip chip-active">{tag}</span>)}
          </div>
          <button type="button" aria-label="Abrir filtros" className="icon-button subtle"><Filter size={16} /></button>
        </div>
      </Card>

      {appData.recipes.map((recipe) => (
        <Card key={recipe.id}>
          <div className="inline-row space-between align-start">
            <div>
              <h3>{recipe.name}</h3>
              <p className="supporting">{recipe.type} · {recipe.minutes} min</p>
            </div>
            {recipe.status ? <StatusBadge tone={recipe.status === 'En uso' ? 'accent' : 'muted'}>{recipe.status}</StatusBadge> : null}
          </div>
          <p className="supporting">{recipe.hero}</p>
          <div className="chip-wrap">
            {recipe.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
          </div>
          <div className="inline-row space-between mt-16 align-center">
            <p className="supporting emphasis">{recipe.usage}</p>
            <NavLink to={`/recetas/${recipe.id}`} className="button tertiary">Ver ficha</NavLink>
          </div>
        </Card>
      ))}
    </Screen>
  )
}

function RecipeDetailScreen() {
  const { recipeId } = useParams()
  const recipe = appData.recipes.find((item) => item.id === recipeId) ?? appData.recipes[0]

  return (
    <Screen
      title="Ficha de receta"
      subtitle="Datos por secciones, operativos y conectados con el plan." 
      right={<BackButton to="/recetas" />}
    >
      <Card className="hero-card terracotta">
        <p className="card-kicker">{recipe.type} · {recipe.minutes} min · {recipe.servings} raciones</p>
        <h2>{recipe.name}</h2>
        <p className="supporting dark-support">{recipe.hero}</p>
        <div className="chip-wrap">
          {recipe.tags.map((tag) => <span key={tag} className="chip chip-soft-light">{tag}</span>)}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Ingredientes" />
        <ul className="bullet-list">
          {recipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
        </ul>
      </Card>

      <Card>
        <SectionTitle title="Nutrición manual" />
        <div className="stats-grid">
          <Stat label="kcal" value={recipe.nutrition.kcal} />
          <Stat label="Proteína" value={recipe.nutrition.protein} />
          <Stat label="HC" value={recipe.nutrition.carbs} />
          <Stat label="Grasas" value={recipe.nutrition.fats} />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Compatibilidad" />
        <div className="chip-wrap">
          {recipe.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
          {recipe.goals.map((goal) => <span key={goal} className="chip">{goal}</span>)}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Uso en planes" />
        <p className="supporting emphasis">{recipe.usage}</p>
        <div className="inline-actions two-cols mt-16">
          <button className="button secondary full">Duplicar / editar</button>
          <button className="button danger full">Borrar bloqueado</button>
        </div>
      </Card>
    </Screen>
  )
}

function ShoppingScreen() {
  return (
    <Screen
      title="Lista de la compra"
      subtitle="Pantalla táctica y rápida para supermercado, con cambios visibles cuando toca ajustar."
      cta={<button className="button primary full">Actualizar lista</button>}
      right={<StatusBadge tone="error">{appData.shopping.status}</StatusBadge>}
    >
      <Card className="warning-card">
        <div className="inline-row align-start gap-12">
          <ShieldAlert size={20} />
          <div>
            <h3>{appData.shopping.status}</h3>
            <p className="supporting">{appData.shopping.reason}</p>
            <div className="diff-list">
              {appData.shopping.diff.map((item) => <span key={item} className="diff-chip">{item}</span>)}
            </div>
          </div>
        </div>
      </Card>

      {appData.shopping.sections.map((section) => (
        <Card key={section.name}>
          <SectionTitle title={section.name} />
          <div className="checklist">
            {section.items.map((item) => (
              <div key={item.name} className={`check-item ${item.done ? 'done' : ''}`}>
                <span className="checkmark">{item.done ? <Check size={16} /> : ''}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <button className="button tertiary full">Ver cambios</button>
    </Screen>
  )
}

function FamilyScreen() {
  return (
    <Screen
      title="Familia / miembros"
      subtitle="Perfiles claros, no clínicos, con restricciones obligatorias y objetivos resumidos."
      cta={<button className="button primary full"><Plus size={18} />Añadir miembro</button>}
      right={<StatusBadge tone="success">{appData.familySummary.status}</StatusBadge>}
    >
      <Card className="soft-green">
        <p className="card-kicker">Estado del hogar</p>
        <h2>{appData.familySummary.status}</h2>
        <p className="supporting">Faltan {appData.familySummary.pending} obligatorios para generar menú.</p>
      </Card>

      {appData.familySummary.members.map((member) => (
        <Card key={member.id}>
          <div className="inline-row gap-16 align-start">
            <div className="avatar">{member.initial}</div>
            <div className="member-content">
              <div className="inline-row space-between align-start">
                <div>
                  <h3>{member.name}</h3>
                  <div className="chip-wrap mt-8">
                    {member.rules.map((rule) => <span key={rule} className="chip">{rule}</span>)}
                  </div>
                </div>
                <button className="button tertiary">Editar <ChevronRight size={16} /></button>
              </div>
              <p className="supporting mt-12">{member.goal}</p>
            </div>
          </div>
        </Card>
      ))}
    </Screen>
  )
}

function SubstitutionScreen() {
  return (
    <Screen
      title="Sustitución rápida"
      subtitle="Bottom sheet con impacto y compatibilidad antes de confirmar."
      right={<BackButton to="/plan/jueves" />}
      cta={<button className="button primary full">Confirmar sustitución</button>}
    >
      <div className="sheet-wrapper">
        <Card className="sheet-card">
          <div className="sheet-handle" />
          <p className="card-kicker">Cena del jueves</p>
          <h2>Crema + tortilla actual</h2>
          <div className="inline-row gap-8 mt-12 wrap">
            <span className="chip chip-active">Sin gluten</span>
            <span className="chip chip-active">Niños OK</span>
            <span className="chip">Compra impacta</span>
          </div>
        </Card>

        {appData.substitutions.map((option) => (
          <Card key={option.id}>
            <div className="inline-row space-between align-start">
              <div>
                <h3>{option.name}</h3>
                <p className="supporting emphasis">{option.fit}</p>
                <p className="supporting">{option.impact}</p>
              </div>
              <ToneDot tone={option.tone} />
            </div>
            <div className="inline-row space-between mt-16 align-center">
              <span className="hint-row"><Info size={14} />Acción: sustituir receta</span>
              <NavLink to={option.id === 'merluza-pure' ? '/recetas/merluza-pure' : '/recetas'} className="button tertiary">Revisar</NavLink>
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  )
}

function Card({ children, className = '' }) {
  return <section className={`card ${className}`.trim()}>{children}</section>
}

function Selectable({ children, active = false, icon }) {
  return <div className={`selectable ${active ? 'active' : ''}`}>{icon}{children}</div>
}

function Label({ children }) {
  return <p className="label">{children}</p>
}

function MiniMeal({ label, title }) {
  return (
    <div className="mini-meal">
      <span>{label}</span>
      <strong>{title}</strong>
    </div>
  )
}

function MealLine({ label, title, meta }) {
  return (
    <div className="meal-line">
      <div>
        <span>{label}</span>
        <strong>{title}</strong>
      </div>
      <small>{meta}</small>
    </div>
  )
}

function StatusBadge({ children, tone = 'muted' }) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

function SectionTitle({ title }) {
  return <h3 className="section-title">{title}</h3>
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ToneDot({ tone }) {
  return <span className={`tone-dot ${tone}`} />
}

export default App
