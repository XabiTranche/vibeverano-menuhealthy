import { NavLink, Navigate, Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom'
import React from 'react'
import { ArrowLeft, Calendar, BookOpen, ShoppingCart, Users, Filter, Search, RefreshCw } from 'lucide-react'

// ===== MOCK DATA =====
const mockData = {
  week: {
    range: 'Semana del 4 al 10 ago',
    status: 'draft',
    days: [
      { slug: 'lunes', name: 'Lunes 4', meals: [
        { slot: 'breakfast', name: 'Tostadas con aguacate y huevo', kcal: 320, prot: '12g', time: '10 min' },
        { slot: 'lunch', name: 'Pollo al limón con arroz', kcal: 485, prot: '35g', time: '30 min', recipeId: 'pollo-limon' },
        { slot: 'dinner', name: 'Sopa de verduras con quinoa', kcal: 245, prot: '14g', time: '25 min' },
        { slot: 'snack', name: null },
      ]},
      { slug: 'martes', name: 'Martes 5', meals: [
        { slot: 'breakfast', name: 'Yogur con granola y frutos rojos', kcal: 280, prot: '8g', time: '5 min' },
        { slot: 'lunch', name: 'Ensalada mediterránea', kcal: 310, prot: '18g', time: '15 min' },
        { slot: 'dinner', name: null },
      ]},
      { slug: 'miercoles', name: 'Miércoles 6', meals: [
        { slot: 'breakfast', name: 'Smoothie de espinacas y plátano', kcal: 210, prot: '6g', time: '5 min' },
        { slot: 'lunch', name: null },
        { slot: 'dinner', name: null },
      ]},
    ],
  },
  recipes: [
    { id: 'pollo-limon', name: 'Pollo al limón con arroz', type: 'lunch', emoji: '🍗', color: '#f0e0c8', tags: ['Comida', 'Sin gluten'], kcal: 485, prot: '35g', carbs: '42g', fats: '15g', time: '30 min', inUse: true, usageText: 'Lunes 4 (comida), Jueves 7 (comida)', ingredients: ['Pechuga de pollo — 400g', 'Arroz basmati — 200g', 'Limón — 2 unidades', 'Aceite de oliva — 2 cucharadas', 'Ajo — 3 dientes', 'Caldo de pollo — 150ml', 'Sal y pimienta'], compatibility: ['Apto para toda la familia', 'Sin alérgenos registrados', 'Compatible con objetivo de Carlos (perder peso)'] },
    { id: 'ensalada', name: 'Ensalada mediterránea', type: 'lunch', emoji: '🥗', color: '#d4e8c8', tags: ['Comida', 'Cena', 'Vegana'], kcal: 310, prot: '18g', carbs: '28g', fats: '12g', time: '15 min', inUse: true, usageText: 'Martes 5 (comida)', ingredients: ['Tomate — 2 uds', 'Pepino — 1 ud', 'Aceitunas — 50g', 'Queso feta — 80g', 'Aceite de oliva — 2 cuch.', 'Orégano'], compatibility: ['Apto para toda la familia', 'Sin alérgenos registrados'] },
    { id: 'yogur-granola', name: 'Yogur con granola y frutos rojos', type: 'breakfast', emoji: '🥣', color: '#fde8d8', tags: ['Desayuno', 'Vegetariana'], kcal: 280, prot: '8g', carbs: '35g', fats: '10g', time: '5 min', inUse: false, ingredients: ['Yogur natural — 200g', 'Granola — 40g', 'Frutos rojos — 80g', 'Miel — 1 cuch.'], compatibility: ['Apto para toda la familia'] },
    { id: 'sopa-quinoa', name: 'Sopa de verduras con quinoa', type: 'dinner', emoji: '🍲', color: '#e8dcc8', tags: ['Cena', 'Vegana', 'Sin gluten'], kcal: 245, prot: '14g', carbs: '30g', fats: '8g', time: '25 min', inUse: false, ingredients: ['Quinoa — 100g', 'Calabacín — 1 ud', 'Zanahoria — 2 uds', 'Caldo vegetal — 500ml', 'Espinacas — 100g'], compatibility: ['Apto para toda la familia', 'Sin alérgenos registrados'] },
    { id: 'hummus', name: 'Hummus con palitos de zanahoria', type: 'snack', emoji: '🥕', color: '#f5e8d0', tags: ['Snack', 'Vegana', 'Sin gluten'], kcal: 180, prot: '6g', carbs: '18g', fats: '9g', time: '10 min', inUse: false, ingredients: ['Garbanzos — 200g', 'Tahini — 2 cuch.', 'Limón — 1 ud', 'Zanahoria — 3 uds', 'Aceite de oliva'], compatibility: ['Apto para toda la familia'] },
  ],
  shopping: [
    { category: 'Verduras', items: [{ name: 'Tomates', qty: '1 kg', done: false }, { name: 'Espinacas', qty: '300g', done: false }, { name: 'Aguacate', qty: '4 uds', done: false }, { name: 'Zanahoria', qty: '500g', done: false }, { name: 'Limón', qty: '4 uds', done: false }] },
    { category: 'Proteínas', items: [{ name: 'Pechuga de pollo', qty: '800g', done: true }, { name: 'Huevos', qty: '12 uds', done: false }, { name: 'Garbanzos', qty: '400g', done: true }] },
    { category: 'Lácteos', items: [{ name: 'Yogur natural', qty: '6 uds', done: false }, { name: 'Leche', qty: '2L', done: true }] },
    { category: 'Cereales', items: [{ name: 'Arroz basmati', qty: '500g', done: false }, { name: 'Quinoa', qty: '300g', done: false }, { name: 'Granola', qty: '400g', done: false }, { name: 'Pan integral', qty: '1 ud', done: false }] },
  ],
  family: {
    members: [
      { id: 'carlos', initial: 'C', name: 'Carlos (Yo)', goal: 'Perder peso', restriction: '🚫 Intolerancia lactosa', primary: true },
      { id: 'maria', initial: 'M', name: 'María', goal: 'Mantenimiento', restriction: '🚫 Alergia frutos secos', primary: false },
      { id: 'lucas', initial: 'L', name: 'Lucas', goal: '8 años', restriction: null, primary: false },
      { id: 'sofia', initial: 'S', name: 'Sofía', goal: '5 años', restriction: null, primary: false },
    ],
    meals: ['Desayuno', 'Comida', 'Cena'],
    restrictions: ['Sin lactosa (Carlos)', 'Sin frutos secos (María)'],
  },
}

const slotColors = { breakfast: 'var(--color-category-breakfast)', lunch: 'var(--color-category-lunch)', dinner: 'var(--color-category-dinner)', snack: 'var(--color-category-snack)' }
const slotLabels = { breakfast: 'desayuno', lunch: 'comida', dinner: 'cena', snack: 'snack' }

// ===== APP =====
export default function App() {
  const location = useLocation()
  const isDetailPage = location.pathname.startsWith('/recetas/') && location.pathname !== '/recetas'

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/plan" replace />} />
        <Route path="/plan" element={<PlanScreen />} />
        <Route path="/recetas" element={<RecipesScreen />} />
        <Route path="/recetas/:recipeId" element={<RecipeDetailScreen />} />
        <Route path="/compra" element={<ShoppingScreen />} />
        <Route path="/familia" element={<FamilyScreen />} />
      </Routes>
      {!isDetailPage && <TabBar />}
    </div>
  )
}

// ===== TAB BAR =====
function TabBar() {
  const tabs = [
    { to: '/plan', label: 'Plan', icon: <Calendar size={18} /> },
    { to: '/recetas', label: 'Recetas', icon: <BookOpen size={18} /> },
    { to: '/compra', label: 'Compra', icon: <ShoppingCart size={18} /> },
    { to: '/familia', label: 'Familia', icon: <Users size={18} /> },
  ]
  return (
    <nav className="tab-bar">
      {tabs.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `tab-item ${isActive ? 'tab-item--active' : ''}`}>
          <span className="tab-icon">{icon}</span>
          <span className="tab-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// ===== PLAN SCREEN =====
function PlanScreen() {
  return (
    <div className="screen">
      <div className="week-selector">
        <button className="week-arrow">←</button>
        <div className="week-center">
          <div className="week-label">{mockData.week.range}</div>
          <span className="status-badge status-badge--draft">● En borrador</span>
        </div>
        <button className="week-arrow">→</button>
      </div>
      <h1 className="screen-title">Mi semana</h1>
      {mockData.week.days.map((day, i) => (
        <div key={day.slug}>
          {i > 0 && <hr className="day-sep" />}
          <div className="day-section">
            <h2 className="day-header">{day.name}</h2>
            {day.meals.map((meal) => meal.name ? (
              <div key={meal.slot} className={`meal-slot meal-slot--${meal.slot}`}>
                <div className="meal-content">
                  <div className="meal-name">{meal.name}</div>
                  <div className="meal-badges">
                    <span className="badge-nutrient">{meal.kcal} kcal</span>
                    <span className="badge-nutrient">{meal.prot} prot</span>
                    <span className="badge-time">{meal.time}</span>
                  </div>
                </div>
                <button className="btn-swap"><RefreshCw size={14} /></button>
              </div>
            ) : (
              <div key={meal.slot} className="meal-slot meal-slot--empty">
                <div className="meal-content"><div className="meal-name empty-text">+ Añadir {slotLabels[meal.slot]}</div></div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn-primary">Aprobar semana</button>
    </div>
  )
}

// ===== RECIPES SCREEN =====
function RecipesScreen() {
  return (
    <div className="screen">
      <h1 className="screen-title">Recetas</h1>
      <div className="search-bar"><Search size={16} /> Buscar plato o ingrediente...</div>
      <div className="filter-row">
        <span className="chip chip--active">Comida</span>
        <span className="chip chip--active">Sin gluten</span>
        <button className="btn-filter"><Filter size={16} /></button>
      </div>
      {mockData.recipes.map((r) => (
        <NavLink key={r.id} to={`/recetas/${r.id}`} className="recipe-card">
          <div className={`recipe-bar recipe-bar--${r.type}`} />
          <div className="recipe-photo" style={{ background: r.color }}>{r.emoji}</div>
          <div className="recipe-content">
            <div className="recipe-name">{r.name}</div>
            <div className="recipe-tags">{r.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            <div className="meal-badges">
              <span className="badge-nutrient">{r.kcal} kcal</span>
              <span className="badge-nutrient">{r.prot} prot</span>
              <span className="badge-time">{r.time}</span>
            </div>
          </div>
          {r.inUse && <div className="recipe-dot" />}
        </NavLink>
      ))}
      <button className="btn-primary">Nueva receta</button>
    </div>
  )
}

// ===== RECIPE DETAIL =====
function RecipeDetailScreen() {
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const recipe = mockData.recipes.find((r) => r.id === recipeId) || mockData.recipes[0]

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/recetas')}>← Volver</button>
      <h1 className="screen-title" style={{ marginTop: 8 }}>{recipe.name}</h1>
      <div className="filter-row" style={{ marginBottom: 12 }}>
        {recipe.tags.map((t) => <span key={t} className="chip">{t}</span>)}
        <span className="chip">⏱ {recipe.time}</span>
      </div>
      <div className="detail-image" style={{ background: recipe.color }}>{recipe.emoji}</div>
      <hr className="section-sep" />
      <h3 className="section-title">Valores nutricionales</h3>
      <div className="nutri-grid">
        <div className="nutri-box"><div className="nutri-value">{recipe.kcal}</div><div className="nutri-label">kcal</div></div>
        <div className="nutri-box"><div className="nutri-value">{recipe.carbs}</div><div className="nutri-label">carbos</div></div>
        <div className="nutri-box"><div className="nutri-value">{recipe.fats}</div><div className="nutri-label">grasas</div></div>
        <div className="nutri-box"><div className="nutri-value">{recipe.prot}</div><div className="nutri-label">proteína</div></div>
      </div>
      <hr className="section-sep" />
      <h3 className="section-title">Ingredientes</h3>
      <ul className="ingredient-list">{recipe.ingredients.map((ing) => <li key={ing}>{ing}</li>)}</ul>
      <hr className="section-sep" />
      <h3 className="section-title">Compatibilidad familiar</h3>
      {recipe.compatibility.map((c) => (
        <div key={c} className="compat-item"><span className="compat-tick">✓</span> {c}</div>
      ))}
      <hr className="section-sep" />
      {recipe.inUse && <div className="in-use-banner">📅 En uso: {recipe.usageText}</div>}
      <button className="btn-primary" style={{ marginTop: 0 }}>Añadir al plan</button>
      <div className="btn-row">
        <button className="btn-secondary">Editar</button>
        <button className={`btn-danger ${recipe.inUse ? 'btn-danger--disabled' : ''}`}>Eliminar</button>
      </div>
    </div>
  )
}

// ===== SHOPPING SCREEN =====
function ShoppingScreen() {
  return (
    <div className="screen">
      <h1 className="screen-title">Lista de la compra</h1>
      <div className="compra-meta">
        <span className="compra-subtitle">Semana del 4 al 10 ago</span>
        <span className="compra-counter">3/14</span>
      </div>
      {mockData.shopping.map((section) => (
        <div key={section.category}>
          <h4 className="category-header">{section.category}</h4>
          {section.items.map((item) => (
            <ShopItem key={item.name} item={item} />
          ))}
        </div>
      ))}
    </div>
  )
}

function ShopItem({ item }) {
  const [checked, setChecked] = React.useState(item.done)
  return (
    <div className={`shop-item ${checked ? 'shop-item--checked' : ''}`} onClick={() => setChecked(!checked)}>
      <span className="shop-check">{checked ? '✓' : ''}</span>
      <span className="shop-name">{item.name}</span>
      <span className="shop-qty">{item.qty}</span>
    </div>
  )
}

// ===== FAMILY SCREEN =====
function FamilyScreen() {
  return (
    <div className="screen">
      <h1 className="screen-title">Mi familia</h1>
      <div className="family-banner family-banner--ok">✓ Lista para planificar</div>
      <h4 className="category-header">Miembros</h4>
      {mockData.family.members.map((m) => (
        <div key={m.id} className="member-card">
          <div className={`member-avatar ${m.primary ? 'member-avatar--primary' : 'member-avatar--default'}`}>{m.initial}</div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            <div className="member-goal">{m.goal}</div>
            {m.restriction && <span className="tag">{m.restriction}</span>}
            {!m.restriction && <span className="tag" style={{ color: 'var(--color-muted)' }}>Sin restricciones</span>}
          </div>
          <span className="member-arrow">›</span>
        </div>
      ))}
      <hr className="section-sep" style={{ margin: '24px 0 16px' }} />
      <h4 className="category-header">Comidas del día</h4>
      <div className="meals-chips">
        {mockData.family.meals.map((m) => <span key={m} className="chip chip--active">{m}</span>)}
        <span className="chip">Snack</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 8 }}>Selecciona los momentos de comida que planificas</p>
      <hr className="section-sep" style={{ margin: '24px 0 16px' }} />
      <h4 className="category-header">Restricciones del hogar</h4>
      {mockData.family.restrictions.map((r) => <div key={r} className="restriction-item">🚫 {r}</div>)}
      <button className="btn-primary" style={{ marginTop: 24 }}>Añadir miembro</button>
    </div>
  )
}
