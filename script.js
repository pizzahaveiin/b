/* ═══════════════════════════════════════════
   Perfect Pizza Point – Loyalty System
   Single JS file (Entry + Admin logic)
   ═══════════════════════════════════════════ */

// ──── CONFIGURATION ────
// ⚠️  PASTE YOUR DEPLOYED APPS SCRIPT WEB APP URL HERE:
const API_URL = 'https://script.google.com/macros/s/AKfycbzjSOcLI0LAqaIcf9t43Og0-pfgu0iO44e8URBh4IzEEuGX3_71yB-HweTXCwrQUYJH/exec';

// Runtime cache
let APP_CONFIG = null;       // { minAmount, cycle, rewardValue }
let CURRENT_CUSTOMER = null; // customer data from reward
let LAST_ENTRY_RESULT = null;
let ADMIN_DATA = null;
let ADMIN_AUTHENTICATED = false;
let ALL_ENTRIES_CACHE = [];
let DASHBOARD_PERIOD = '7d'; // 'today' | '7d' | '30d' | 'all'
let visibleEntriesLimit = 30;

// ──── POS THEME COLOR PRESETS ────
const THEME_PRESETS = [
  {
    id: 'sunset-tomato',
    name: 'Sunset Tomato',
    primary: '#FF4B2B',
    gradient: 'linear-gradient(135deg, #FF416C, #FF4B2B)',
    gradientHover: 'linear-gradient(135deg, #FF4B2B, #FF416C)',
    glow: 'rgba(255, 75, 43, 0.4)'
  },
  {
    id: 'golden-honey',
    name: 'Golden Honey',
    primary: '#faa307',
    gradient: 'linear-gradient(135deg, #f48c06, #faa307)',
    gradientHover: 'linear-gradient(135deg, #faa307, #f48c06)',
    glow: 'rgba(250, 163, 7, 0.4)'
  },
  {
    id: 'fresh-basil',
    name: 'Fresh Basil',
    primary: '#10B981',
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
    gradientHover: 'linear-gradient(135deg, #10B981, #059669)',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  {
    id: 'tuscan-plum',
    name: 'Tuscan Plum',
    primary: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
    gradientHover: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    glow: 'rgba(139, 92, 246, 0.4)'
  },
  {
    id: 'mediterranean-blue',
    name: 'Mediterranean',
    primary: '#3B82F6',
    gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    gradientHover: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    glow: 'rgba(59, 130, 246, 0.4)'
  },
  {
    id: 'charcoal-night',
    name: 'Charcoal Night',
    primary: '#374151',
    gradient: 'linear-gradient(135deg, #1F2937, #374151)',
    gradientHover: 'linear-gradient(135deg, #374151, #1F2937)',
    glow: 'rgba(55, 65, 81, 0.4)'
  },
  {
    id: 'coral-punch',
    name: 'Coral Punch',
    primary: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #EE5253, #FF6B6B)',
    gradientHover: 'linear-gradient(135deg, #FF6B6B, #EE5253)',
    glow: 'rgba(255, 107, 107, 0.4)'
  },
  {
    id: 'forest-pine',
    name: 'Forest Pine',
    primary: '#166534',
    gradient: 'linear-gradient(135deg, #14532D, #166534)',
    gradientHover: 'linear-gradient(135deg, #166534, #14532D)',
    glow: 'rgba(22, 101, 52, 0.4)'
  },
  {
    id: 'sweet-peach',
    name: 'Sweet Peach',
    primary: '#F97316',
    gradient: 'linear-gradient(135deg, #EA580C, #F97316)',
    gradientHover: 'linear-gradient(135deg, #F97316, #EA580C)',
    glow: 'rgba(249, 115, 22, 0.4)'
  },
  {
    id: 'crimson-velvet',
    name: 'Crimson Velvet',
    primary: '#991B1B',
    gradient: 'linear-gradient(135deg, #7F1D1D, #991B1B)',
    gradientHover: 'linear-gradient(135deg, #991B1B, #7F1D1D)',
    glow: 'rgba(153, 27, 27, 0.4)'
  },
  {
    id: 'electric-indigo',
    name: 'Electric Indigo',
    primary: '#4F46E5',
    gradient: 'linear-gradient(135deg, #3730A3, #4F46E5)',
    gradientHover: 'linear-gradient(135deg, #4F46E5, #3730A3)',
    glow: 'rgba(79, 70, 229, 0.4)'
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    primary: '#DB2777',
    gradient: 'linear-gradient(135deg, #BE185D, #DB2777)',
    gradientHover: 'linear-gradient(135deg, #DB2777, #BE185D)',
    glow: 'rgba(219, 39, 119, 0.4)'
  },
  {
    id: 'mint-green',
    name: 'Mint Green',
    primary: '#059669',
    gradient: 'linear-gradient(135deg, #047857, #059669)',
    gradientHover: 'linear-gradient(135deg, #059669, #047857)',
    glow: 'rgba(5, 150, 105, 0.4)'
  },
  {
    id: 'classic-olive',
    name: 'Classic Olive',
    primary: '#65A30D',
    gradient: 'linear-gradient(135deg, #4D7C0F, #65A30D)',
    gradientHover: 'linear-gradient(135deg, #65A30D, #4D7C0F)',
    glow: 'rgba(101, 163, 13, 0.4)'
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    primary: '#0D9488',
    gradient: 'linear-gradient(135deg, #0F766E, #0D9488)',
    gradientHover: 'linear-gradient(135deg, #0D9488, #0F766E)',
    glow: 'rgba(13, 148, 136, 0.4)'
  },
  {
    id: 'desert-clay',
    name: 'Desert Clay',
    primary: '#EA580C',
    gradient: 'linear-gradient(135deg, #C2410C, #EA580C)',
    gradientHover: 'linear-gradient(135deg, #EA580C, #C2410C)',
    glow: 'rgba(234, 88, 12, 0.4)'
  },
  {
    id: 'orchid-purple',
    name: 'Orchid Purple',
    primary: '#C084FC',
    gradient: 'linear-gradient(135deg, #A855F7, #C084FC)',
    gradientHover: 'linear-gradient(135deg, #C084FC, #A855F7)',
    glow: 'rgba(192, 132, 252, 0.4)'
  },
  {
    id: 'royal-velvet',
    name: 'Royal Velvet',
    primary: '#7C3AED',
    gradient: 'linear-gradient(135deg, #6D28D9, #7C3AED)',
    gradientHover: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
    glow: 'rgba(124, 58, 237, 0.4)'
  },
  {
    id: 'autumn-sage',
    name: 'Autumn Sage',
    primary: '#0F766E',
    gradient: 'linear-gradient(135deg, #115E59, #0F766E)',
    gradientHover: 'linear-gradient(135deg, #0F766E, #115E59)',
    glow: 'rgba(15, 118, 110, 0.4)'
  },
  {
    id: 'neon-violet',
    name: 'Neon Violet',
    primary: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
    gradientHover: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    glow: 'rgba(139, 92, 246, 0.4)'
  },
  {
    id: 'sunset-gold',
    name: 'Sunset Gold',
    primary: '#D97706',
    gradient: 'linear-gradient(135deg, #B45309, #D97706)',
    gradientHover: 'linear-gradient(135deg, #D97706, #B45309)',
    glow: 'rgba(217, 119, 6, 0.4)'
  },
  {
    id: 'copper-bronze',
    name: 'Copper Bronze',
    primary: '#CA8A04',
    gradient: 'linear-gradient(135deg, #A16207, #CA8A04)',
    gradientHover: 'linear-gradient(135deg, #CA8A04, #A16207)',
    glow: 'rgba(202, 138, 4, 0.4)'
  },
  {
    id: 'soft-charcoal',
    name: 'Soft Charcoal',
    primary: '#4B5563',
    gradient: 'linear-gradient(135deg, #374151, #4B5563)',
    gradientHover: 'linear-gradient(135deg, #4B5563, #374151)',
    glow: 'rgba(75, 85, 99, 0.4)'
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    primary: '#EC4899',
    gradient: 'linear-gradient(135deg, #F472B6, #EC4899)',
    gradientHover: 'linear-gradient(135deg, #EC4899, #F472B6)',
    glow: 'rgba(236, 72, 153, 0.4)'
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    primary: '#A78BFA',
    gradient: 'linear-gradient(135deg, #C4B5FD, #A78BFA)',
    gradientHover: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
    glow: 'rgba(167, 139, 250, 0.4)'
  }
];

function getActiveThemeColors() {
  const savedThemeId = localStorage.getItem('ppp_pos_theme_id') || 'sunset-tomato';
  const theme = THEME_PRESETS.find(t => t.id === savedThemeId) || THEME_PRESETS[0];
  
  let hex = theme.primary;
  if (hex.startsWith('#')) hex = hex.slice(1);
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }
  
  return {
    primary: theme.primary,
    gradient: theme.gradient,
    glow: theme.glow,
    rgb: `${r}, ${g}, ${b}`,
    rgba: (alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`
  };
}

function applyTheme(themeId) {
  const theme = THEME_PRESETS.find(t => t.id === themeId) || THEME_PRESETS[0];
  const root = document.documentElement;
  
  root.style.setProperty('--brand-primary', theme.primary);
  root.style.setProperty('--brand-gradient', theme.gradient);
  root.style.setProperty('--brand-gradient-hover', theme.gradientHover);
  root.style.setProperty('--brand-glow', theme.glow);
  
  localStorage.setItem('ppp_pos_theme_id', theme.id);
  
  const colors = getActiveThemeColors();
  root.style.setProperty('--brand-primary-rgb', colors.rgb);
  
  updateAdminThemeUI(theme.id);
  
  const dbSection = document.getElementById('sectionDashboard');
  if (dbSection && dbSection.classList.contains('active')) {
    renderAllDashboardComponents();
  }
}

function renderAdminThemePresets() {
  const grid = document.getElementById('adminThemeOptionsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const currentThemeId = localStorage.getItem('ppp_pos_theme_id') || 'sunset-tomato';
  
  THEME_PRESETS.forEach(theme => {
    const card = document.createElement('div');
    card.className = 'theme-option-card' + (theme.id === currentThemeId ? ' active' : '');
    card.dataset.themeId = theme.id;
    card.onclick = () => applyTheme(theme.id);
    
    card.innerHTML = `
      <div class="theme-preview-dot" style="background: ${theme.gradient};"></div>
      <div class="theme-option-name">${theme.name}</div>
    `;
    grid.appendChild(card);
  });
}

function updateAdminThemeUI(activeThemeId) {
  const cards = document.querySelectorAll('.theme-option-card');
  cards.forEach(card => {
    if (card.dataset.themeId === activeThemeId) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Initialize theme preset immediately before rendering starts
(function initPOSTheme() {
  const savedThemeId = localStorage.getItem('ppp_pos_theme_id') || 'sunset-tomato';
  const theme = THEME_PRESETS.find(t => t.id === savedThemeId) || THEME_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', theme.primary);
  root.style.setProperty('--brand-gradient', theme.gradient);
  root.style.setProperty('--brand-gradient-hover', theme.gradientHover);
  root.style.setProperty('--brand-glow', theme.glow);
  
  // Set rgb variable on startup
  const colors = getActiveThemeColors();
  root.style.setProperty('--brand-primary-rgb', colors.rgb);
})();

async function saveAdminCreds() {
  const user = document.getElementById('newAdminUser').value.trim();
  const pass = document.getElementById('newAdminPass').value.trim();
  const confirmPass = document.getElementById('confirmAdminPass').value.trim();
  
  if (!user || !pass) {
    toast('Username and password cannot be empty.', 'error');
    return;
  }
  if (pass !== confirmPass) {
    toast('Passwords do not match.', 'error');
    return;
  }
  
  const btn = document.getElementById('btnUpdateAdminCreds');
  const originalText = btn.innerText;
  btn.innerText = 'Saving...';
  btn.disabled = true;
  
  try {
    const res = await apiDirect({ action: 'updateAdminCreds', username: user, password: pass });
    if (res.success) {
      toast('Admin credentials updated successfully!', 'success');
      document.getElementById('newAdminUser').value = '';
      document.getElementById('newAdminPass').value = '';
      document.getElementById('confirmAdminPass').value = '';
      
      // Force update config cache
      if (APP_CONFIG) {
        APP_CONFIG.username = user;
        APP_CONFIG.password = pass;
      }
    } else {
      toast(res.error || 'Failed to update credentials.', 'error');
    }
  } catch (e) {
    console.error('Credentials update failed', e);
    toast('Error updating credentials: ' + e.message, 'error');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// ──── GOOGLE SHEET CACHE SYSTEM ────
const CACHE_KEY_PREFIX = 'ppp_sheet_cache_';
const CACHE_TIMESTAMP_KEY = 'ppp_sheet_cache_timestamp';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Actions whose responses can be cached
const CACHEABLE_ACTIONS = ['getConfig', 'getCustomer', 'getAllEntries', 'getAdminData', 'getCategories', 'getTableCount', 'getDishes', 'getFlavoursMap'];

/** Store an API response in localStorage cache */
function setCacheItem(cacheKey, data) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + cacheKey, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache write failed (storage full?)', e);
  }
}

/** Retrieve an API response from localStorage cache (returns null if missing or expired) */
function getCacheItem(cacheKey) {
  try {
    const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!ts) return null;
    const age = Date.now() - Number(ts);
    if (age > CACHE_MAX_AGE_MS) {
      // Cache too old, treat as empty
      return null;
    }
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + cacheKey);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/** Load cached data into memory variables on startup */
function initializeMemoryFromCache() {
  APP_CONFIG = getCacheItem('getConfig');
  ALL_ENTRIES_CACHE = getCacheItem('getAllEntries') || [];
  ADMIN_DATA = getCacheItem('getAdminData');
}
initializeMemoryFromCache();

/** Build a unique cache key from API params */
function buildCacheKey(params) {
  const action = params.action;
  // For customer lookups, include mobile in the key
  if (action === 'getCustomer' && params.mobile) {
    return action + '_' + params.mobile;
  }
  return action;
}

/** Clear all sheet-related cache data */
function clearSheetCache(silent = false) {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  if (!silent) toast('🗑️ Cache cleared successfully.', 'success');
}

/** Sync cache (clear then download) */
async function syncSheetCache() {
  clearSheetCache(true);
  await downloadSheetCache(false);
}

/** Download all key data from Google Sheets and store in cache */
async function downloadSheetCache(silent = false) {
  const btn = document.getElementById('btnCacheSync');
  if (btn && !silent) {
    btn.classList.add('downloading');
    btn.style.pointerEvents = 'none';
  }
  if (!silent) toast('⬇️ Downloading data to cache…', 'info');

  try {
    // Fetch all major data endpoints in parallel
    const [config, entries, adminData, categories, tableCount, dishes, flavoursMap] = await Promise.all([
      apiDirect({ action: 'getConfig' }),
      apiDirect({ action: 'getAllEntries' }),
      apiDirect({ action: 'getAdminData' }),
      apiDirect({ action: 'getCategories' }),
      apiDirect({ action: 'getTableCount' }),
      apiDirect({ action: 'getDishes' }), // fetches all dishes
      apiDirect({ action: 'getFlavoursMap' }) // fetches all flavors grouped by dishIndex
    ]);

    // Store each response
    setCacheItem('getConfig', config);
    setCacheItem('getAllEntries', entries);
    setCacheItem('getAdminData', adminData);
    setCacheItem('getCategories', categories);
    setCacheItem('getTableCount', tableCount);
    setCacheItem('getDishes', dishes);
    setCacheItem('getFlavoursMap', flavoursMap);

    // Set the cache timestamp
    localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));

    if (document.getElementById('sectionDashboard') && document.getElementById('sectionDashboard').classList.contains('active')) {
      renderAllDashboardComponents();
    }

    if (!silent) toast('✅ Data cached successfully! App will use cached data.', 'success');
  } catch (e) {
    console.error('Cache download failed', e);
    if (!silent) toast('❌ Cache download failed: ' + e.message, 'error');
  }

  if (btn && !silent) {
    btn.classList.remove('downloading');
    btn.style.pointerEvents = '';
  }
}

/** Toggle cache button visibility based on current section */
function updateIntegrationDockVisibility() {
  const dock = document.getElementById('integrationDock');
  if (!dock) return;
  
  const adminActive = document.getElementById('sectionAdmin')?.classList.contains('active');
  const posActive = document.getElementById('sectionPos')?.classList.contains('active');
  const posDrilldownVisible = posActive && !document.getElementById('posMenuDrilldownView')?.classList.contains('hidden');
  
  if (adminActive || posDrilldownVisible) {
    dock.style.display = 'none';
  } else {
    dock.style.display = '';
  }
}

function updateCacheButtonsVisibility(sectionName) {
  const btnSync = document.getElementById('btnCacheSync');
  if (btnSync) {
    const shouldShow = sectionName !== 'admin';
    btnSync.style.display = shouldShow ? '' : 'none';
  }
  updateIntegrationDockVisibility();
}

/** Check if the remaining width requires icon-only bottom navigation */
function updateNavDockResponsive() {
  const body = document.body;
  const isSplitActive = body.classList.contains('split-active');
  const splitWidth = isSplitActive ? (parseFloat(body.style.getPropertyValue('--split-width')) || 0) : 0;
  const remainingWidth = window.innerWidth - splitWidth;
  
  const dock = document.getElementById('navDock');
  if (dock) {
    if (remainingWidth < 550) {
      dock.classList.add('nav-icon-only');
    } else {
      dock.classList.remove('nav-icon-only');
    }
  }

  // Handle narrow split view to overlay modals full-screen
  if (isSplitActive && remainingWidth < 500) {
    body.classList.add('split-overlay-full');
  } else {
    body.classList.remove('split-overlay-full');
  }
  
  // Re-position active page indicator line after button widths adjust
  setTimeout(() => {
    updateNavIndicator(document.querySelector('.nav-btn.active'));
  }, 50);
}

// ──── Month-Day Heatmap ────
let mdHeatmapType = 'amount';

function setMdHeatmapType(type, btn) {
  mdHeatmapType = type;
  document.querySelectorAll('#mdHeatmapToggle .toggle-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  calculateMdHeatmap();
}

function calculateMdHeatmap() {
  const matrix = Array.from({ length: 12 }, () => Array(31).fill(0));
  
  ALL_ENTRIES_CACHE.forEach(entry => {
    if (!entry.date) return;
    const parts = entry.date.split('-');
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10) - 1;
      if (month >= 0 && month < 12 && day >= 0 && day < 31) {
        if (mdHeatmapType === 'amount') matrix[month][day] += entry.amount || 0;
        else if (mdHeatmapType === 'cash') matrix[month][day] += entry.cash || 0;
        else if (mdHeatmapType === 'upi') matrix[month][day] += entry.upi || 0;
        else if (mdHeatmapType === 'card') matrix[month][day] += entry.card || 0;
        else matrix[month][day] += 1;
      }
    }
  });

  renderMdHeatmap(matrix);
}

function renderMdHeatmap(matrix) {
  const container = document.getElementById('mdHeatmapContainer');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let maxVal = 0;
  matrix.forEach(row => row.forEach(v => { if (v > maxVal) maxVal = v; }));

  let html = '<div class="md-heatmap-grid">';
  // Header row (days 1-31)
  html += '<div class="heatmap-label"></div>';
  for (let d = 1; d <= 31; d++) {
    html += '<div class="heatmap-header">' + d + '</div>';
  }
  // Data rows (months)
  for (let m = 0; m < 12; m++) {
    html += '<div class="heatmap-label">' + months[m] + '</div>';
    for (let d = 0; d < 31; d++) {
      const val = matrix[m][d];
      const intensity = maxVal > 0 ? val / maxVal : 0;
      const bg = intensity === 0
        ? 'var(--dot-empty)'
        : 'rgba(232, 93, 4, ' + (0.15 + intensity * 0.85) + ')';
      const displayVal = mdHeatmapType === 'entries' ? val : '₹' + val;

      let cellClasses = ['heatmap-cell'];
      if (d < 4) cellClasses.push('edge-left');
      if (d > 26) cellClasses.push('edge-right');
      if (m < 2) cellClasses.push('edge-top');
      const classAttr = cellClasses.join(' ');

      html += '<div class="' + classAttr + '" style="background:' + bg + '; cursor: pointer;" onclick="selectHeatmapDate(' + m + ', ' + d + ')">' +
        '<div class="heatmap-tooltip">' + months[m] + ' ' + (d + 1) + ' — ' + displayVal + '</div>' +
        '</div>';
    }
  }
  html += '</div>';
  container.innerHTML = html;
}

function selectHeatmapDate(monthIndex, dayIndex) {
  let year = new Date().getFullYear();
  if (ALL_ENTRIES_CACHE && ALL_ENTRIES_CACHE.length > 0) {
    const matchedEntry = ALL_ENTRIES_CACHE.find(e => {
      if (!e.date) return false;
      const parts = e.date.split('-');
      return parts.length === 3 && (parseInt(parts[1], 10) - 1) === monthIndex && (parseInt(parts[2], 10) - 1) === dayIndex;
    });
    if (matchedEntry) {
      year = parseInt(matchedEntry.date.split('-')[0], 10);
    } else {
      const latestDate = ALL_ENTRIES_CACHE[0].date;
      if (latestDate && latestDate.includes('-')) {
        year = parseInt(latestDate.split('-')[0], 10);
      }
    }
  }

  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(dayIndex + 1).padStart(2, '0');
  const dateStr = `${year}-${mm}-${dd}`;

  const dateInput = document.getElementById('bestSellersDateFilter');
  if (dateInput) {
    dateInput.value = dateStr;
    loadBestSellers();
    
    // Smooth scroll to the Best Sellers card
    const bestSellersCard = dateInput.closest('.card');
    if (bestSellersCard) {
      bestSellersCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    toast(`Filtered Today's Top 5 for ${monthNames[monthIndex]} ${dayIndex + 1}, ${year}`, 'success');
  }
}

// ──── HARDCODED WHATSAPP TEMPLATE (removes admin dependency) ────
const WHATSAPP_TEMPLATE = "https://api.whatsapp.com/send?phone=91<number>&text=*Perfect%20Pizza%20Point*%F0%9F%8D%95%0A%0A%F0%9F%93%8A%20Current%20visit%20count%20%3A%20<completedvisit>%0A%F0%9F%92%B0%C2%A0%20Billing%20Amount%20%3D%20%E2%82%B9<amount>%0A%E2%9C%89%EF%B8%8F%20<message>%0A%0A%F0%9F%94%97%20Useful%20links%3A%0A%E2%9D%A4%EF%B8%8F%20Insta%20page%20%3A%20https%3A%2F%2Finstagram.com%2Fperfect_pizza_point_p3%0A%F0%9F%8D%95%20Zomato%20%3A%20https%3A%2F%2Fzomato.onelink.me%2Fxqzv%2F0o9285p4%0A%F0%9F%8D%94%20Swiggy%20%3A%20https%3A%2F%2Fwww.swiggy.com%2Fmenu%2F765590%0A%F0%9F%A4%9D%20Loyalty%20%3A%20<loyality>%0A%E2%98%8E%EF%B8%8F%20Phone%20No%3A%20%2B918319798869";

// ──── HELPERS ────

/**
 * IST date/time helpers — using the Intl API.
 *
 * The old approach manually added +5:30 ms to new Date(). That double-counts
 * the offset when the browser is already in IST, and gives wrong results in
 * every other timezone. The Intl API is the correct, locale-agnostic way to
 * express a moment in a specific IANA timezone.
 */

/** Returns the current date as "YYYY-MM-DD" in IST. */
function istDateStr() {
  // en-CA locale natively formats dates as YYYY-MM-DD.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

/** Returns the current time as "HH:MM:SS" in IST. */
function istTimeStr() {
  // en-GB with hour12:false produces 24-hour HH:MM:SS with no AM/PM suffix.
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12:  false,
    hour:    '2-digit',
    minute:  '2-digit',
    second:  '2-digit'
  });
}

/** Direct API call (always hits network, no cache) */
async function apiDirect(params) {
  const qs = new URLSearchParams(params).toString();
  const url = API_URL + '?' + qs;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

/** Cache-aware API call helper */
async function api(params) {
  const action = params.action;
  
  // Special offline interception for getFlavours
  if (action === 'getFlavours') {
    const cachedMap = getCacheItem('getFlavoursMap');
    if (cachedMap && cachedMap.flavoursMap) {
      const fList = cachedMap.flavoursMap[params.dishIndex] || [];
      return { flavours: fList.map(name => ({ name })) };
    }
  }

  // Only try cache for cacheable read-only actions
  if (CACHEABLE_ACTIONS.includes(action)) {
    const cacheKey = buildCacheKey(params);
    const cached = getCacheItem(cacheKey);
    if (cached !== null) {
      // If we requested getDishes with a parentIndex, filter the cached global dishes array locally
      if (action === 'getDishes' && params.parentIndex !== undefined && params.parentIndex !== null && params.parentIndex !== '') {
        const filtered = (cached.dishes || []).filter(d => Number(d.parentIndex) === Number(params.parentIndex));
        return { dishes: filtered };
      }
      return cached;
    }
  }
  // Fallback to network
  return apiDirect(params);
}

/** Toast */
function toast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3500);
}

/** Show / hide helpers */
function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }
function showErr(id) { document.getElementById(id).classList.add('visible'); }
function hideErr(id) { document.getElementById(id).classList.remove('visible'); }

// ──── THEME TOGGLE ────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('ppp_theme', isDark ? 'light' : 'dark');
}

(function initTheme() {
  const saved = localStorage.getItem('ppp_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeToggle').textContent = '☀️';
  }
})();

// ──── SECTION NAV ────
function showSection(name) {
  const searchBox = document.getElementById('navbarSearchContainer');
  if (searchBox) searchBox.style.display = 'none';
  
  document.getElementById('sectionHome').classList.remove('active');
  document.getElementById('sectionPos').classList.remove('active');
  if (document.getElementById('sectionAllEntries')) {
    document.getElementById('sectionAllEntries').classList.remove('active');
  }
  if (document.getElementById('sectionDashboard')) {
    document.getElementById('sectionDashboard').classList.remove('active');
  }
  if (document.getElementById('sectionKitchen')) {
    document.getElementById('sectionKitchen').classList.remove('active');
  }
  document.getElementById('sectionAdmin').classList.remove('active');

  document.getElementById('navHome').classList.remove('active');
  document.getElementById('navPos').classList.remove('active');
  if (document.getElementById('navKitchen')) {
    document.getElementById('navKitchen').classList.remove('active');
  }
  if (document.getElementById('navAllEntries')) {
    document.getElementById('navAllEntries').classList.remove('active');
  }
  if (document.getElementById('navDashboard')) {
    document.getElementById('navDashboard').classList.remove('active');
  }
  document.getElementById('navAdmin').classList.remove('active');

  let activeBtn;
  if (name === 'admin') {
    document.getElementById('sectionAdmin').classList.add('active');
    activeBtn = document.getElementById('navAdmin');
    activeBtn.classList.add('active');
    // Always require re-auth when opening admin
    ADMIN_AUTHENTICATED = false;
    show('adminLoginWrap');
    hide('adminPOSPanel');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    hideErr('errLogin');
  } else if (name === 'dashboard') {
    if (document.getElementById('sectionDashboard')) {
      document.getElementById('sectionDashboard').classList.add('active');
    }
    activeBtn = document.getElementById('navDashboard');
    if (activeBtn) activeBtn.classList.add('active');
    loadDashboardData();
  } else if (name === 'pos') {
    document.getElementById('sectionPos').classList.add('active');
    activeBtn = document.getElementById('navPos');
    activeBtn.classList.add('active');
    initPos();
  } else if (name === 'kitchen') {
    if (document.getElementById('sectionKitchen')) {
      document.getElementById('sectionKitchen').classList.add('active');
    }
    activeBtn = document.getElementById('navPos');
    if (activeBtn) activeBtn.classList.add('active');
    renderKitchenView();
  } else if (name === 'allEntries') {
    if (document.getElementById('sectionAllEntries')) {
      document.getElementById('sectionAllEntries').classList.add('active');
    }
    activeBtn = document.getElementById('navAllEntries');
    if (activeBtn) activeBtn.classList.add('active');
    loadAllEntries();
  } else {
    document.getElementById('sectionHome').classList.add('active');
    activeBtn = document.getElementById('navHome');
    activeBtn.classList.add('active');
    updateHomePendingItemsUI();
  }
  
  updateNavIndicator(activeBtn);
  updateCacheButtonsVisibility(name);
}

function updateNavIndicator(btn) {
  if (!btn) return;
  const indicator = document.getElementById('navIndicator');
  const dock = document.getElementById('navDock');
  if (!indicator || !dock) return;
  
  const dockRect = dock.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  
  indicator.style.width = btnRect.width + 'px';
  indicator.style.left = (btnRect.left - dockRect.left) + 'px';
}

// Initial positioning and resize listener for the animated dock indicator
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Outfit', system-ui, -apple-system, sans-serif";
  }
  // Initialize POS data on startup since POS is the default page
  initPos();

  setTimeout(() => {
    updateNavIndicator(document.querySelector('.nav-btn.active'));
    updateNavDockResponsive();
  }, 100);
  window.addEventListener('resize', () => {
    updateNavIndicator(document.querySelector('.nav-btn.active'));
    updateNavDockResponsive();
  });

  // Restore saved loyalty state on page load/reload
  restoreLoyaltyState();
  
  // Initialize third-party integration dock
  fetchIntegrationLinks();
  initResizer();
});

async function restoreLoyaltyState() {
  const formOpen = localStorage.getItem('ppp_loyalty_form_open') === 'true';
  const savedMobile = localStorage.getItem('ppp_loyalty_mobile') || '';
  
  if (savedMobile) {
    document.getElementById('inputMobile').value = savedMobile;
  }
  
  if (formOpen && savedMobile) {
    await handleAddEntry();
  }
  
  updateHomePendingItemsUI();
}

// ──── FETCH CONFIG ON LOAD ────
async function loadConfig() {
  try {
    APP_CONFIG = await api({ action: 'getConfig' });
    document.getElementById('minAmtLabel').textContent = APP_CONFIG.minAmount;
  } catch (e) {
    console.error('Config load failed', e);
  }
}
loadConfig();

// ══════════════════════════════════════
//  HOME – CUSTOMER ENTRY SYSTEM
// ══════════════════════════════════════

async function handleAddEntry() {
  const mobileInput = document.getElementById('inputMobile');
  const mobile = mobileInput.value.trim();
  hideErr('errMobile');

  if (!/^\d{10}$/.test(mobile)) {
    showErr('errMobile');
    mobileInput.classList.add('error');
    return;  // keep field intact so user can correct the typo
  }
  mobileInput.classList.remove('error');

  const btn = document.getElementById('btnAddEntry');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Checking…';

  // ── Instantly open the entry form with placeholder customer data ──
  CURRENT_CUSTOMER = {
    found: false, mobile,
    totalEntries: 0, rewardsClaimed: 0,
    eligible: false, lastVisitDate: ''
  };
  openEntryForm(mobile, CURRENT_CUSTOMER);
  mobileInput.value = '';

  btn.disabled = false;
  btn.innerHTML = '➕ Add Entry';

  if (!mobile) {
    checkAmountAndToggleButtons();
    return;
  }

  // ── Background: run the original duplicate-check against Google Sheets ──
  try {
    const cust = await api({ action: 'getCustomer', mobile });
    CURRENT_CUSTOMER = cust;

    const todayDate = istDateStr();
    if (cust.found && cust.lastVisitDate === todayDate) {
      toast('Entry already added today. You can generate a receipt without adding an entry.', 'info');
    } else {
      const cycle = APP_CONFIG ? APP_CONFIG.cycle : 10;
      const needsClaim = cust.found && cust.eligible &&
        cust.rewardsClaimed < cust.totalEntries / cycle;

      if (needsClaim) {
        toast('🎁 Customer must claim reward before new entry!', 'info');
        show('rowDetailsBtn');
      }
    }

    checkAmountAndToggleButtons();
  } catch (e) {
    console.error('Background duplicate check failed', e);
  }
}

function handleWithoutMobileEntry() {
  const mobileInput = document.getElementById('inputMobile');
  if (mobileInput) {
    mobileInput.value = '';
    localStorage.setItem('ppp_loyalty_mobile', '');
  }
  
  CURRENT_CUSTOMER = {
    found: false, mobile: '',
    totalEntries: 0, rewardsClaimed: 0,
    eligible: false, lastVisitDate: ''
  };
  openEntryForm('', CURRENT_CUSTOMER);
}

async function handleDispMobileInput() {
  const dispInput = document.getElementById('dispMobile');
  dispInput.value = dispInput.value.replace(/\D/g, '');
  const mobile = dispInput.value.trim();
  
  localStorage.setItem('ppp_loyalty_mobile', mobile);
  
  if (mobile === '') {
    CURRENT_CUSTOMER = {
      found: false, mobile: '',
      totalEntries: 0, rewardsClaimed: 0,
      eligible: false, lastVisitDate: ''
    };
    hide('rowDetailsBtn');
    checkAmountAndToggleButtons();
    return;
  }
  
  if (!/^\d{10}$/.test(mobile)) {
    CURRENT_CUSTOMER = {
      found: false, mobile,
      totalEntries: 0, rewardsClaimed: 0,
      eligible: false, lastVisitDate: ''
    };
    hide('rowDetailsBtn');
    checkAmountAndToggleButtons();
    return;
  }
  
  try {
    CURRENT_CUSTOMER = {
      found: false, mobile,
      totalEntries: 0, rewardsClaimed: 0,
      eligible: false, lastVisitDate: ''
    };
    checkAmountAndToggleButtons();
    
    const cust = await api({ action: 'getCustomer', mobile });
    if (document.getElementById('dispMobile').value.trim() !== mobile) {
      return; 
    }
    
    CURRENT_CUSTOMER = cust;
    
    const todayDate = istDateStr();
    if (cust.found && cust.lastVisitDate === todayDate) {
      toast('Entry already added today. You can generate a receipt without adding an entry.', 'info');
    } else {
      const cycle = APP_CONFIG ? APP_CONFIG.cycle : 10;
      const needsClaim = cust.found && cust.eligible &&
        cust.rewardsClaimed < cust.totalEntries / cycle;

      if (needsClaim) {
        toast('🎁 Customer must claim reward before new entry!', 'info');
        show('rowDetailsBtn');
      } else {
        hide('rowDetailsBtn');
      }
    }
    
    checkAmountAndToggleButtons();
  } catch (e) {
    console.error('Disp mobile duplicate check failed', e);
  }
}

function checkAmountAndToggleButtons() {
  const amountInput = document.getElementById('inputAmount');
  const amountVal = amountInput.value.trim();
  const amount = parseInt(amountVal, 10);
  const minAmt = APP_CONFIG ? APP_CONFIG.minAmount : 100;
  
  const btnSave = document.getElementById('btnSaveEntry');
  const btnReceipt = document.getElementById('btnReceiptOnly');
  const btnClaim = document.getElementById('btnClaimForce');

  // If mobile is blank or the default "no mobile" number, always show only the Receipt button
  const dispMobile = document.getElementById('dispMobile');
  const mobile = dispMobile ? dispMobile.value.trim() : '';
  if (!mobile) {
    btnSave.style.display = 'none';
    btnReceipt.style.display = '';
    btnClaim.style.display = 'none';
    if (!isNaN(amount) && amount > 0) {
      hideErr('errAmount');
      amountInput.classList.remove('error');
    }
    return;
  }

  // If mobile is entered but not 10 digits, hide save/receipt/claim buttons to block invalid data
  if (mobile && !/^\d{10}$/.test(mobile)) {
    btnSave.style.display = 'none';
    btnReceipt.style.display = 'none';
    btnClaim.style.display = 'none';
    return;
  }

  // If reward system is OFF, always show only the Receipt button
  const rewardOn = APP_CONFIG ? APP_CONFIG.rewardSystemOn !== false : true;
  if (!rewardOn) {
    btnSave.style.display = 'none';
    btnReceipt.style.display = '';
    btnClaim.style.display = 'none';
    if (!isNaN(amount) && amount > 0) {
      hideErr('errAmount');
      amountInput.classList.remove('error');
    }
    return;
  }

  const todayDate = istDateStr();
  const alreadyAddedToday = CURRENT_CUSTOMER && CURRENT_CUSTOMER.found && CURRENT_CUSTOMER.lastVisitDate === todayDate;

  const cycle = APP_CONFIG ? APP_CONFIG.cycle : 10;
  const needsClaim = CURRENT_CUSTOMER && CURRENT_CUSTOMER.found && CURRENT_CUSTOMER.eligible &&
    CURRENT_CUSTOMER.rewardsClaimed < CURRENT_CUSTOMER.totalEntries / cycle;

  // Clear err if valid or positive (since receipt only is valid)
  if (!isNaN(amount) && amount > 0) {
    hideErr('errAmount');
    amountInput.classList.remove('error');
  }

  if (amountVal !== '' && (isNaN(amount) || amount < minAmt)) {
    // Explicitly entered a value that is less than ₹100
    btnSave.style.display = 'none';
    btnReceipt.style.display = '';
    btnClaim.style.display = 'none';
  } else {
    // Empty input or value >= ₹100
    if (alreadyAddedToday) {
      btnSave.style.display = '';
      btnSave.disabled = true;
      btnSave.innerHTML = '🚫 Already Added Today';
      btnReceipt.style.display = '';
      btnClaim.style.display = 'none';
    } else if (needsClaim) {
      btnSave.style.display = 'none';
      btnReceipt.style.display = 'none';
      btnClaim.style.display = '';
    } else {
      btnSave.style.display = '';
      btnSave.disabled = false;
      btnSave.innerHTML = '💾 Save Entry';
      btnReceipt.style.display = 'none';
      btnClaim.style.display = 'none';
    }
  }
}

function openEntryForm(mobile, cust) {
  document.getElementById('dispMobile').value = mobile;
  document.getElementById('dispDate').value = istDateStr();
  document.getElementById('dispTime').value = istTimeStr();
  
  const savedAmount = localStorage.getItem('ppp_loyalty_amount');
  if (savedAmount) {
    document.getElementById('inputAmount').value = savedAmount;
  } else if (window.PENDING_POS_TOTAL) {
    document.getElementById('inputAmount').value = window.PENDING_POS_TOTAL;
    window.PENDING_POS_TOTAL = null;
  } else {
    document.getElementById('inputAmount').value = '';
  }
  
  const savedMsg = localStorage.getItem('ppp_loyalty_message');
  if (savedMsg !== null) {
    document.getElementById('inputMessage').value = savedMsg;
  } else {
    document.getElementById('inputMessage').value = 'Thank You, Visit Again';  // default message
  }
  
  hideErr('errAmount');
  hide('rowWhatsapp');
  hide('rowDetailsBtn');

  const cycle = APP_CONFIG ? APP_CONFIG.cycle : 10;
  const needsClaim = cust.found && cust.eligible &&
    cust.rewardsClaimed < cust.totalEntries / cycle;

  if (needsClaim) {
    toast('🎁 Customer must claim reward before new entry!', 'info');
    show('rowDetailsBtn');
  }

  checkAmountAndToggleButtons();
  resetPaymentMode();

  show('cardEntryForm');
  document.getElementById('inputAmount').focus();

  // Save current form status to localStorage
  localStorage.setItem('ppp_loyalty_form_open', 'true');
  localStorage.setItem('ppp_loyalty_mobile', mobile);
}

function closeEntryForm() {
  hide('cardEntryForm');
  CURRENT_CUSTOMER = null;
  LAST_ENTRY_RESULT = null;
  localStorage.removeItem('ppp_loyalty_form_open');
  localStorage.removeItem('ppp_loyalty_mobile');
  localStorage.removeItem('ppp_loyalty_amount');
  localStorage.removeItem('ppp_loyalty_message');
  localStorage.removeItem('ppp_pendingOrderItems');
  resetPaymentMode();
  updateHomePendingItemsUI();
}

function updateHomePendingItemsUI() {
  const pendingItemsJson = localStorage.getItem('ppp_pendingOrderItems');
  const card = document.getElementById('cardPendingOrderItems');
  const tbody = document.getElementById('homeOrderItemsBody');
  
  if (!card || !tbody) return;
  
  if (pendingItemsJson) {
    try {
      const items = JSON.parse(pendingItemsJson);
      if (items && items.length > 0) {
        tbody.innerHTML = '';
        items.forEach((item, index) => {
          const qty = Number(item.qty) || 0;
          const price = Number(item.price) || 0;
          const total = qty * price;
          const freeQty = Number(item.freeQty) || 0;
          const isFullyFree = (freeQty === qty);
          const tr = document.createElement('tr');
          if (isFullyFree) {
            tr.style.opacity = '0.6';
          }
          const variantSuffix = item.flavour ? ` (${item.flavour})` : '';
          
          let checkboxesHtml = '';
          for (let c = 1; c <= qty; c++) {
            const checked = c <= freeQty ? 'checked' : '';
            checkboxesHtml += `<input type="checkbox" ${checked} onchange="toggleRowCheckbox(${index})" class="free-chk-${index}" style="width: 18px; height: 18px; cursor: pointer; margin: 0 3px;" />`;
          }

          const activeTotal = (qty - freeQty) * price;

          tr.innerHTML = `
            <td style="padding: 0.5rem; text-align: left; font-size: 0.9rem; ${isFullyFree ? 'text-decoration: line-through;' : ''}">${item.dishName}${variantSuffix}</td>
            <td style="padding: 0.5rem; text-align: center; font-size: 0.9rem;">${qty}</td>
            <td style="padding: 0.5rem; text-align: right; font-size: 0.9rem; ${isFullyFree ? 'text-decoration: line-through;' : ''}">₹${price}</td>
            <td style="padding: 0.5rem; text-align: right; font-weight: 700; font-size: 0.9rem;">
              ${freeQty > 0 ? `<span style="text-decoration: line-through; font-weight: normal; margin-right: 5px; color: var(--text-muted);">₹${total}</span>₹${activeTotal}` : `₹${total}`}
            </td>
            <td style="padding: 0.5rem; text-align: center; white-space: nowrap;">
              ${checkboxesHtml}
            </td>
          `;
          tbody.appendChild(tr);
        });
        show('cardPendingOrderItems');
        return;
      }
    } catch (e) {
      console.error('Error parsing pending order items for UI', e);
    }
  }
  
  hide('cardPendingOrderItems');
}

function updatePendingItemFreeQty(index, freeQty) {
  const pendingItemsJson = localStorage.getItem('ppp_pendingOrderItems');
  if (!pendingItemsJson) return;
  try {
    const items = JSON.parse(pendingItemsJson);
    if (items[index]) {
      items[index].freeQty = freeQty;
      items[index].free = (freeQty === items[index].qty); 
      localStorage.setItem('ppp_pendingOrderItems', JSON.stringify(items));
      updateHomePendingItemsUI();
      recalculatePendingTotal();
    }
  } catch (e) {
    console.error('Error updating pending item free qty state', e);
  }
}

function toggleRowCheckbox(index) {
  const chks = document.querySelectorAll(`.free-chk-${index}`);
  let checkedCount = 0;
  chks.forEach(chk => {
    if (chk.checked) checkedCount++;
  });
  updatePendingItemFreeQty(index, checkedCount);
}

function recalculatePendingTotal() {
  const pendingItemsJson = localStorage.getItem('ppp_pendingOrderItems');
  if (!pendingItemsJson) return;
  try {
    const items = JSON.parse(pendingItemsJson);
    let total = 0;
    items.forEach(item => {
      const qty = Number(item.qty) || 0;
      const freeQty = Number(item.freeQty) || 0;
      const price = Number(item.price) || 0;
      total += (qty - freeQty) * price;
    });
    const amountInput = document.getElementById('inputAmount');
    if (amountInput) {
      amountInput.value = total;
    }
  } catch (e) {
    console.error('Error recalculating pending total', e);
  }
}

// ══════════════════════════════════════
//  PAYMENT MODE LOGIC
// ══════════════════════════════════════

let PAYMENT_STATE = { mode: 'cash', cashAmt: 0, upiAmt: 0, cardAmt: 0 };

function selectPaymentMode(mode) {
  PAYMENT_STATE.mode = mode;
  if (mode === 'split') {
    openSplitModal();
  } else {
    // For single-mode payments, amounts are computed at save time from the total
    PAYMENT_STATE.cashAmt = 0;
    PAYMENT_STATE.upiAmt = 0;
    PAYMENT_STATE.cardAmt = 0;
  }
}

function resetPaymentMode() {
  PAYMENT_STATE = { mode: 'cash', cashAmt: 0, upiAmt: 0, cardAmt: 0 };
  const cashRadio = document.querySelector('input[name="paymentMode"][value="cash"]');
  if (cashRadio) cashRadio.checked = true;
}

function getPaymentAmounts(totalAmount) {
  if (PAYMENT_STATE.mode === 'split') {
    return { cashAmt: PAYMENT_STATE.cashAmt, upiAmt: PAYMENT_STATE.upiAmt, cardAmt: PAYMENT_STATE.cardAmt };
  }
  const result = { cashAmt: 0, upiAmt: 0, cardAmt: 0 };
  if (PAYMENT_STATE.mode === 'cash') result.cashAmt = totalAmount;
  else if (PAYMENT_STATE.mode === 'upi') result.upiAmt = totalAmount;
  else if (PAYMENT_STATE.mode === 'card') result.cardAmt = totalAmount;
  return result;
}

// Split Modal
function openSplitModal() {
  const amount = parseInt(document.getElementById('inputAmount').value, 10) || 0;
  document.getElementById('splitTotalBadge').textContent = 'Total: ₹' + amount;
  document.getElementById('splitCash').value = '';
  document.getElementById('splitUpi').value = '';
  document.getElementById('splitCard').value = '';
  validateSplitTotal();
  document.getElementById('modalSplit').classList.add('open');
}

function closeSplitModal() {
  document.getElementById('modalSplit').classList.remove('open');
  // If split wasn't confirmed, revert to cash
  if (PAYMENT_STATE.mode === 'split' && PAYMENT_STATE.cashAmt === 0 && PAYMENT_STATE.upiAmt === 0 && PAYMENT_STATE.cardAmt === 0) {
    const cashRadio = document.querySelector('input[name="paymentMode"][value="cash"]');
    if (cashRadio) cashRadio.checked = true;
    PAYMENT_STATE.mode = 'cash';
  }
}

function validateSplitTotal() {
  const total = parseInt(document.getElementById('inputAmount').value, 10) || 0;
  const cash = parseInt(document.getElementById('splitCash').value, 10) || 0;
  const upi = parseInt(document.getElementById('splitUpi').value, 10) || 0;
  const card = parseInt(document.getElementById('splitCard').value, 10) || 0;
  const sum = cash + upi + card;
  const remaining = total - sum;
  
  const el = document.getElementById('splitRemaining');
  const btn = document.getElementById('btnSplitDone');
  
  if (remaining === 0 && total > 0) {
    el.textContent = '✅ Amounts match perfectly!';
    el.className = 'split-remaining valid';
    btn.disabled = false;
  } else {
    el.textContent = remaining > 0 ? `Remaining: ₹${remaining}` : `Over by: ₹${Math.abs(remaining)}`;
    el.className = 'split-remaining invalid';
    btn.disabled = true;
  }
}

function confirmSplitPayment() {
  const cash = parseInt(document.getElementById('splitCash').value, 10) || 0;
  const upi = parseInt(document.getElementById('splitUpi').value, 10) || 0;
  const card = parseInt(document.getElementById('splitCard').value, 10) || 0;
  
  PAYMENT_STATE.cashAmt = cash;
  PAYMENT_STATE.upiAmt = upi;
  PAYMENT_STATE.cardAmt = card;
  
  document.getElementById('modalSplit').classList.remove('open');
  toast('✅ Split payment set: Cash ₹' + cash + ' | UPI ₹' + upi + ' | Card ₹' + card, 'success');
}

async function handleSaveEntry() {
  const mobile = document.getElementById('dispMobile').value.trim();
  if (mobile && !/^\d{10}$/.test(mobile)) {
    toast('Please enter a valid 10-digit mobile number or leave it empty.', 'error');
    return;
  }
  const amount = parseInt(document.getElementById('inputAmount').value, 10);
  const date   = document.getElementById('dispDate').value;
  const time   = istTimeStr(); // refresh time
  const message = document.getElementById('inputMessage').value.trim();
  const rewardOn = APP_CONFIG ? APP_CONFIG.rewardSystemOn !== false : true;
  const minAmt = APP_CONFIG ? APP_CONFIG.minAmount : 100;

  hideErr('errAmount');
  // When reward system is OFF, skip minimum amount validation (just need amount > 0)
  if (rewardOn) {
    if (isNaN(amount) || amount < minAmt) {
      showErr('errAmount');
      document.getElementById('inputAmount').classList.add('error');
      return;
    }
  } else {
    if (isNaN(amount) || amount <= 0) {
      showErr('errAmount');
      document.getElementById('inputAmount').classList.add('error');
      return;
    }
  }
  document.getElementById('inputAmount').classList.remove('error');

  const btn = document.getElementById('btnSaveEntry');

  // ── Instant UI update — no waiting for the server ──
  btn.disabled = true;
  btn.innerHTML = '✔ Saved';

  const orderItems = localStorage.getItem('ppp_pendingOrderItems') || '';
  const payAmts = getPaymentAmounts(amount);

  if (!mobile) {
    // Skip optimistic loyalty UI logic, just toast success
    toast('✅ Bill generated successfully!', 'success');
    
    // Optimistically update cache
    const newCacheEntry = {
      mobile: mobile,
      numEntries: null,
      amount: amount,
      date: date,
      time: time,
      cash: payAmts.cashAmt,
      upi: payAmts.upiAmt,
      card: payAmts.cardAmt,
      orderItems: orderItems,
      source: 'bill'
    };
    ALL_ENTRIES_CACHE.unshift(newCacheEntry);
    setCacheItem('getAllEntries', ALL_ENTRIES_CACHE);
    
    if (document.getElementById('sectionDashboard') && document.getElementById('sectionDashboard').classList.contains('active')) {
      prependActivityRow(newCacheEntry);
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    }
    
    try {
      const result = await api({ action: 'addbillEntry', mobile, amount, date, time, message, cashAmt: payAmts.cashAmt, upiAmt: payAmts.upiAmt, cardAmt: payAmts.cardAmt, orderItems });
      if (result.error) {
        toast(result.error, 'error');
        btn.disabled = false;
        btn.innerHTML = '💾 Save Entry';
        return;
      }
      
      // Clear persistent entry data from localStorage now that it is saved on server
      localStorage.removeItem('ppp_loyalty_form_open');
      localStorage.removeItem('ppp_loyalty_mobile');
      localStorage.removeItem('ppp_loyalty_amount');
      localStorage.removeItem('ppp_loyalty_message');
      localStorage.removeItem('ppp_pendingOrderItems');
      updateHomePendingItemsUI();
      
      // Dynamic sync
      if (typeof downloadSheetCache === 'function') {
        downloadSheetCache(true);
      }
      
      // Wait 2 seconds, then return to home screen
      setTimeout(() => {
        closeEntryForm();
      }, 2000);
    } catch (e) {
      console.error('Save bill failed', e);
      toast('Error saving bill', 'error');
      btn.disabled = false;
      btn.innerHTML = '💾 Save Entry';
    }
    return;
  }

  // Compute optimistic entry data so the UI can render immediately
  const cycle = APP_CONFIG ? APP_CONFIG.cycle : 10;
  const estimatedTotal = CURRENT_CUSTOMER && CURRENT_CUSTOMER.found
    ? CURRENT_CUSTOMER.totalEntries + 1
    : 1;
  const optimisticResult = {
    totalEntries: estimatedTotal,
    rewardsClaimed: CURRENT_CUSTOMER ? (CURRENT_CUSTOMER.rewardsClaimed || 0) : 0,
    eligible: false,
    cycle: cycle,
    index: estimatedTotal
  };

  toast('✅ Entry saved! Visit #' + optimisticResult.index, 'success');
  buildWhatsAppLink(optimisticResult, mobile, amount, message);
  show('rowWhatsapp');
  show('rowDetailsBtn');

  // ── Background: persist to Google Sheets (original flow) ──
  try {
    const result = await api({ action: 'addEntry', mobile, amount, date, time, message, cashAmt: payAmts.cashAmt, upiAmt: payAmts.upiAmt, cardAmt: payAmts.cardAmt, orderItems });
    if (result.error) {
      toast(result.error, 'error');
      btn.disabled = false;
      btn.innerHTML = '💾 Save Entry';
      hide('rowWhatsapp');
      hide('rowDetailsBtn');
      return;
    }

    // Clear persistent entry data from localStorage since it is saved successfully
    localStorage.removeItem('ppp_loyalty_form_open');
    localStorage.removeItem('ppp_loyalty_mobile');
    localStorage.removeItem('ppp_loyalty_amount');
    localStorage.removeItem('ppp_loyalty_message');
    localStorage.removeItem('ppp_pendingOrderItems');
    updateHomePendingItemsUI();

    LAST_ENTRY_RESULT = result;
    CURRENT_CUSTOMER = {
      found: true, mobile,
      totalEntries: result.totalEntries,
      rewardsClaimed: result.rewardsClaimed,
      eligible: result.eligible,
      lastVisitDate: date
    };

    // Refresh WhatsApp link with actual server data
    buildWhatsAppLink(result, mobile, amount, message);

    // If now eligible, show claim button
    const actualCycle = result.cycle || cycle;
    if (result.eligible && result.rewardsClaimed < result.totalEntries / actualCycle) {
      document.getElementById('btnClaimForce').style.display = '';
    }

    // Optimistically update cache and trigger background sync
    const newCacheEntry = {
      mobile: mobile,
      numEntries: result.totalEntries,
      amount: amount,
      date: date,
      time: time,
      cash: payAmts.cashAmt,
      upi: payAmts.upiAmt,
      card: payAmts.cardAmt,
      orderItems: orderItems,
      source: 'entry'
    };
    ALL_ENTRIES_CACHE.unshift(newCacheEntry);
    setCacheItem('getAllEntries', ALL_ENTRIES_CACHE);
    
    // Refresh currently open sections if needed
    if (document.getElementById('sectionDashboard').classList.contains('active')) {
      prependActivityRow(newCacheEntry);
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } else if (document.getElementById('sectionAllEntries') && document.getElementById('sectionAllEntries').classList.contains('active')) {
      loadAllEntries();
    }
    
    // Background sync to ensure full parity
    downloadSheetCache(true);

  } catch (e) {
    toast('Error saving: ' + e.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '💾 Save Entry';
  }
}

// ──── RECEIPT ONLY (NO DB SAVE) ────
async function handleReceiptOnly() {
  const mobile = document.getElementById('dispMobile').value.trim();
  if (mobile && !/^\d{10}$/.test(mobile)) {
    toast('Please enter a valid 10-digit mobile number or leave it empty.', 'error');
    return;
  }
  const amount = parseInt(document.getElementById('inputAmount').value, 10);
  const date   = document.getElementById('dispDate').value;
  const time   = istTimeStr(); // refresh time
  const message = document.getElementById('inputMessage').value.trim();

  hideErr('errAmount');
  if (isNaN(amount) || amount <= 0) {
    toast('Please enter a valid billing amount.', 'error');
    document.getElementById('inputAmount').classList.add('error');
    return;
  }
  document.getElementById('inputAmount').classList.remove('error');

  const btn = document.getElementById('btnReceiptOnly');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving Receipt…';

  const payAmts = getPaymentAmounts(amount);
  const orderItems = localStorage.getItem('ppp_pendingOrderItems') || '';

  if (!mobile) {
    toast('✅ Bill generated successfully!', 'success');
    
    localStorage.removeItem('ppp_loyalty_form_open');
    localStorage.removeItem('ppp_loyalty_mobile');
    localStorage.removeItem('ppp_loyalty_amount');
    localStorage.removeItem('ppp_loyalty_message');
    localStorage.removeItem('ppp_pendingOrderItems');
    updateHomePendingItemsUI();
    
    // Optimistically update cache
    const newCacheEntry = {
      mobile: mobile,
      numEntries: null,
      amount: amount,
      date: date,
      time: time,
      cash: payAmts.cashAmt,
      upi: payAmts.upiAmt,
      card: payAmts.cardAmt,
      orderItems: orderItems,
      source: 'bill'
    };
    ALL_ENTRIES_CACHE.unshift(newCacheEntry);
    setCacheItem('getAllEntries', ALL_ENTRIES_CACHE);
    
    if (document.getElementById('sectionDashboard') && document.getElementById('sectionDashboard').classList.contains('active')) {
      prependActivityRow(newCacheEntry);
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    }
    
    try {
      await api({
        action: 'addbillEntry',
        mobile,
        amount,
        date,
        time,
        message,
        cashAmt: payAmts.cashAmt,
        upiAmt: payAmts.upiAmt,
        cardAmt: payAmts.cardAmt,
        orderItems
      });
      
      if (typeof downloadSheetCache === 'function') {
        downloadSheetCache(true);
      }
      
      setTimeout(() => {
        closeEntryForm();
        btn.disabled = false;
        btn.innerHTML = '🧾 Generate Receipt Only';
      }, 2000);
    } catch (e) {
      console.error('Failed to save receipt to bill', e);
      toast('Error saving bill', 'error');
      btn.disabled = false;
      btn.innerHTML = '🧾 Generate Receipt Only';
    }
    return;
  }

  try {
    // Save uncounted/receipt-only entry to bill in the background
    await api({
      action: 'addbillEntry',
      mobile,
      amount,
      date,
      time,
      message,
      cashAmt: payAmts.cashAmt,
      upiAmt: payAmts.upiAmt,
      cardAmt: payAmts.cardAmt,
      orderItems
    });
    toast('✅ Receipt saved to database!', 'success');

    // Clear persistent entry data from localStorage since it is saved
    localStorage.removeItem('ppp_loyalty_form_open');
    localStorage.removeItem('ppp_loyalty_mobile');
    localStorage.removeItem('ppp_loyalty_amount');
    localStorage.removeItem('ppp_loyalty_message');
    localStorage.removeItem('ppp_pendingOrderItems');
    updateHomePendingItemsUI();

    // Optimistically update cache and trigger background sync
    const newCacheEntry = {
      mobile: mobile,
      numEntries: null,
      amount: amount,
      date: date,
      time: time,
      cash: payAmts.cashAmt,
      upi: payAmts.upiAmt,
      card: payAmts.cardAmt,
      orderItems: orderItems,
      source: 'bill'
    };
    ALL_ENTRIES_CACHE.unshift(newCacheEntry);
    setCacheItem('getAllEntries', ALL_ENTRIES_CACHE);
    
    // Refresh currently open sections if needed
    if (document.getElementById('sectionDashboard').classList.contains('active')) {
      prependActivityRow(newCacheEntry);
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } else if (document.getElementById('sectionAllEntries') && document.getElementById('sectionAllEntries').classList.contains('active')) {
      loadAllEntries();
    }
    
    // Background sync to ensure full parity
    downloadSheetCache(true);
    
  } catch (e) {
    console.error('Failed to save receipt to bill', e);
    toast('⚠️ WhatsApp receipt generated, but database sync failed.', 'warning');
  }

  btn.disabled = false;
  btn.innerHTML = '🧾 Generate Receipt Only';

  // Build the WhatsApp link using the current customer's data, without adding a loyalty entry
  buildWhatsAppLink(CURRENT_CUSTOMER, mobile, amount, message, false);
  show('rowWhatsapp');
  show('rowDetailsBtn');
}

// ──── ALL ENTRIES LISTING ────
async function loadAllEntries() {
  const tbody = document.getElementById('allEntriesTableBody');
  const mobileList = document.getElementById('allEntriesMobileList');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;"><span class="spinner" style="border-top-color:var(--brand-primary)"></span> Loading entries...</td></tr>';
  if (mobileList) {
    mobileList.innerHTML = '<div style="text-align:center; padding: 2rem;"><span class="spinner" style="border-top-color:var(--brand-primary)"></span> Loading entries...</div>';
  }

  try {
    const entries = await api({ action: 'getAllEntries' });
    ALL_ENTRIES_CACHE = entries || [];
    resetEntriesFilters(); // Reset controls and trigger rendering
  } catch (e) {
    console.error('Failed to load all entries', e);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--danger);">Error loading entries. Please try again.</td></tr>';
    if (mobileList) {
      mobileList.innerHTML = '<div style="text-align:center;color:var(--danger);padding:2rem;">Error loading entries. Please try again.</div>';
    }
  }
}

function renderAllEntriesTable(entries) {
  const tbody = document.getElementById('allEntriesTableBody');
  const mobileList = document.getElementById('allEntriesMobileList');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (mobileList) mobileList.innerHTML = '';

  // Calculate and display mini stats for the current view
  updateEntriesStats(entries);

  // Handle Load More button visibility
  const loadMoreContainer = document.getElementById('entriesLoadMoreContainer');
  if (loadMoreContainer) {
    if (entries && entries.length > visibleEntriesLimit) {
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }

  const slicedEntries = (entries || []).slice(0, visibleEntriesLimit);

  if (slicedEntries && slicedEntries.length > 0) {
    slicedEntries.forEach((e) => {
      // Find the absolute index in the global entries cache for showEntryDetails
      const absoluteIdx = ALL_ENTRIES_CACHE.indexOf(e);

      // Format payment modes string (with custom green/indigo/orange pills)
      const modes = [];
      if (e.cash > 0) modes.push(`<span class="pm-pill pm-cash">Cash: ₹${e.cash}</span>`);
      if (e.upi > 0) modes.push(`<span class="pm-pill pm-upi">UPI: ₹${e.upi}</span>`);
      if (e.card > 0) modes.push(`<span class="pm-pill pm-card">Card: ₹${e.card}</span>`);
      
      let modesHtml = modes.join('');
      if (!modesHtml) {
        modesHtml = `<span class="pm-pill pm-cash">Cash: ₹${e.amount}</span>`;
      }

      const visitNum = (e.numEntries === null || e.numEntries === undefined || isNaN(e.numEntries)) ? '—' : e.numEntries;

      let itemsHtml = '<span style="color:var(--text-muted); font-size: 0.85rem;">—</span>';
      if (e.orderItems) {
        try {
          const items = JSON.parse(e.orderItems);
          if (Array.isArray(items) && items.length > 0) {
            itemsHtml = '<div class="ordered-items-list">';
            items.forEach(item => {
              const flavourSuffix = item.flavour ? ` (${item.flavour})` : '';
              itemsHtml += `
                <span class="ordered-item-badge">
                  <span class="item-badge-category">${item.categoryName}</span>
                  <span class="item-badge-name">${item.dishName}${flavourSuffix}</span>
                  <span class="item-badge-qty">×${item.qty}</span>
                </span>
              `;
            });
            itemsHtml += '</div>';
          }
        } catch(err) {
          // Ignore parse errors or old string entries
        }
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-primary);">📱 +91 ${e.mobile}</td>
        <td>${e.date}</td>
        <td>${e.time}</td>
        <td style="font-weight: 800; color: var(--brand-primary); font-size: 0.95rem;">₹${e.amount}</td>
        <td><div style="display: flex; flex-wrap: wrap; gap: 4px;">${modesHtml}</div></td>
        <td>${itemsHtml}</td>
        <td style="text-align: center; font-weight: 600; color: var(--text-secondary);">Visit #${visitNum}</td>
        <td style="text-align: center;">
          <div class="flex-row" style="justify-content: center; gap: 0.35rem;">
            <button class="btn btn--secondary btn--sm" onclick="initiateEditEntry(${absoluteIdx})" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" title="Edit Entry">✏️</button>
            <button class="btn btn--danger btn--sm" onclick="initiateDeleteEntry(${absoluteIdx})" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" title="Delete Entry">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);

      // Mobile list rendering showing mobile number, amount, and details 'i' button in one horizontal line
      if (mobileList) {
        const card = document.createElement('div');
        card.className = 'mobile-entry-card fade-in';
        card.innerHTML = `
          <div class="mobile-entry-card__phone" style="font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">📱 +91 ${e.mobile}</div>
          <div class="mobile-entry-card__amount" style="flex: 1; text-align: right; margin-right: 0.25rem; font-size: 1.1rem; font-weight: 800; color: var(--brand-primary);">₹${e.amount}</div>
          <button class="btn btn--outline" onclick="showEntryDetails(${absoluteIdx})" style="width: 32px; height: 32px; border-radius: 50%; padding: 0; min-width: 32px; display: inline-flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 0.95rem; border-color: var(--brand-primary); color: var(--brand-primary); transition: all 0.2s; background: transparent;" title="View Details">i</button>
        `;
        mobileList.appendChild(card);
      }
    });
  } else {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">No entries found matching filters.</td></tr>';
    if (mobileList) {
      mobileList.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:2rem;">No entries found matching filters.</div>';
    }
  }
}

function updateEntriesStats(entries) {
  const totalSalesEl = document.getElementById('entriesTotalSales');
  const totalCountEl = document.getElementById('entriesTotalCount');
  const avgValueEl = document.getElementById('entriesAvgValue');
  const paymentBreakdownEl = document.getElementById('entriesPaymentBreakdown');

  if (!entries || entries.length === 0) {
    if (totalSalesEl) totalSalesEl.textContent = '₹0';
    if (totalCountEl) totalCountEl.textContent = '0';
    if (avgValueEl) avgValueEl.textContent = '₹0';
    if (paymentBreakdownEl) paymentBreakdownEl.textContent = '₹0 / ₹0 / ₹0';
    return;
  }

  const count = entries.length;
  let totalSales = 0;
  let cashTotal = 0;
  let upiTotal = 0;
  let cardTotal = 0;

  entries.forEach(e => {
    totalSales += e.amount || 0;
    cashTotal += e.cash > 0 ? e.cash : (e.upi === 0 && e.card === 0 ? e.amount : 0);
    upiTotal += e.upi || 0;
    cardTotal += e.card || 0;
  });

  const avg = Math.round(totalSales / count);

  if (totalSalesEl) totalSalesEl.textContent = `₹${totalSales.toLocaleString('en-IN')}`;
  if (totalCountEl) totalCountEl.textContent = count.toLocaleString('en-IN');
  if (avgValueEl) avgValueEl.textContent = `₹${avg.toLocaleString('en-IN')}`;
  if (paymentBreakdownEl) {
    paymentBreakdownEl.innerHTML = `
      <span style="color: #10b981;">₹${(cashTotal/1000).toFixed(1)}k</span> / 
      <span style="color: #6366f1;">₹${(upiTotal/1000).toFixed(1)}k</span> / 
      <span style="color: #ff4b2b;">₹${(cardTotal/1000).toFixed(1)}k</span>
    `;
  }
}

function filterEntries(resetLimit = true) {
  if (resetLimit) {
    visibleEntriesLimit = 30;
  }
  const searchVal = document.getElementById('entriesSearchInput').value.trim();
  const dateVal = document.getElementById('entriesDateFilter').value;
  const paymentVal = document.getElementById('entriesPaymentFilter').value;

  let filtered = ALL_ENTRIES_CACHE || [];

  // 1. Search by mobile number
  if (searchVal) {
    filtered = filtered.filter(e => e.mobile && e.mobile.includes(searchVal));
  }

  // 2. Filter by date
  if (dateVal) {
    filtered = filtered.filter(e => e.date === dateVal);
  }

  // 3. Filter by payment mode
  if (paymentVal && paymentVal !== 'all') {
    filtered = filtered.filter(e => {
      if (paymentVal === 'cash') return e.cash > 0;
      if (paymentVal === 'upi') return e.upi > 0;
      if (paymentVal === 'card') return e.card > 0;
      return true;
    });
  }

  renderAllEntriesTable(filtered);
}

function resetEntriesFilters() {
  const searchInput = document.getElementById('entriesSearchInput');
  const dateFilter = document.getElementById('entriesDateFilter');
  const paymentFilter = document.getElementById('entriesPaymentFilter');

  if (searchInput) searchInput.value = '';
  if (dateFilter) dateFilter.value = '';
  if (paymentFilter) paymentFilter.value = 'all';

  visibleEntriesLimit = 30;
  renderAllEntriesTable(ALL_ENTRIES_CACHE || []);
}

function loadMoreEntries() {
  visibleEntriesLimit += 50;
  filterEntries(false);
}

function showEntryDetails(index) {
  const entry = ALL_ENTRIES_CACHE[index];
  if (!entry) return;

  const container = document.getElementById('modalEntryDetailsBody');
  if (!container) return;

  const modes = [];
  if (entry.cash > 0) modes.push(`Cash: ₹${entry.cash}`);
  if (entry.upi > 0) modes.push(`UPI: ₹${entry.upi}`);
  if (entry.card > 0) modes.push(`Card: ₹${entry.card}`);
  let modesStr = modes.join(', ');
  if (!modesStr) {
    modesStr = `Cash: ₹${entry.amount}`;
  }

  const visitNum = (entry.numEntries === null || entry.numEntries === undefined || isNaN(entry.numEntries)) ? '—' : entry.numEntries;

  let itemsHtml = '<span style="color:var(--text-muted); font-size: 0.85rem;">—</span>';
  if (entry.orderItems) {
    try {
      const items = JSON.parse(entry.orderItems);
      if (Array.isArray(items) && items.length > 0) {
        itemsHtml = '<div class="ordered-items-list" style="display:flex; flex-direction:column; gap:0.5rem;">';
        items.forEach(item => {
          const flavourSuffix = item.flavour ? ` (${item.flavour})` : '';
          itemsHtml += `
            <div class="ordered-item-badge" style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:none;">
              <span>
                <strong style="color:var(--brand-primary); font-size:0.75rem; text-transform:uppercase; margin-right:4px;">${item.categoryName}</strong>
                <span>${item.dishName}${flavourSuffix}</span>
              </span>
              <strong style="white-space:nowrap; margin-left:8px;">×${item.qty}</strong>
            </div>
          `;
        });
        itemsHtml += '</div>';
      }
    } catch(err) {
      // Ignore parse error
    }
  }

  container.innerHTML = `
    <div class="detail-row">
      <span style="color:var(--text-muted);">Mobile Number</span>
      <strong style="color:var(--text-light);">+91 ${entry.mobile}</strong>
    </div>
    <div class="detail-row">
      <span style="color:var(--text-muted);">Date & Time</span>
      <strong style="color:var(--text-light);">${entry.date} ${entry.time}</strong>
    </div>
    <div class="detail-row">
      <span style="color:var(--text-muted);">Grand Total</span>
      <strong style="color:var(--brand-primary); font-size:1.2rem;">₹${entry.amount}</strong>
    </div>
    <div class="detail-row">
      <span style="color:var(--text-muted);">Payment Mode</span>
      <strong style="color:var(--text-light);">${modesStr}</strong>
    </div>
    <div class="detail-row">
      <span style="color:var(--text-muted);">Visit #</span>
      <strong style="color:var(--text-light);">${visitNum}</strong>
    </div>
    <div class="detail-row">
      <div style="color:var(--text-muted); margin-bottom:0.5rem;">Ordered Items</div>
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-input); border-radius:8px; padding:0.75rem; width: 100%;">
        ${itemsHtml}
      </div>
    </div>
    
    <div class="flex-row mt-4" style="gap: 0.75rem; width: 100%;">
      <button class="btn btn--secondary btn--block" onclick="closeEntryDetailsModal(); initiateEditEntry(${index});" style="font-size: 0.9rem;">✏️ Edit Entry</button>
      <button class="btn btn--danger btn--block" onclick="closeEntryDetailsModal(); initiateDeleteEntry(${index});" style="font-size: 0.9rem;">🗑️ Delete Entry</button>
    </div>
  `;

  document.getElementById('modalEntryDetails').classList.add('open');
}

function closeEntryDetailsModal() {
  document.getElementById('modalEntryDetails').classList.remove('open');
}

// ──── WHATSAPP LINK ────
function buildWhatsAppLink(result, mobile, amount, message, isLoyaltyEntry = true) {
  let template = WHATSAPP_TEMPLATE;
  const cycle    = (result && result.cycle) || (APP_CONFIG ? APP_CONFIG.cycle : 10);
  const total    = (result && typeof result.totalEntries === 'number') ? result.totalEntries : 0;

  // cyclePosition
  const mod = total % cycle;
  const cyclePosition = total === 0 ? 0 : (mod === 0 ? cycle : mod);
  const completedVisit = cyclePosition + '/' + cycle;

  // loyalty link
  const loyaltyNum = total === 0 ? 0 : (mod === 0 ? cycle : cyclePosition);
  const loyaltyLink = 'https://perfectpizzapoint.github.io/' + loyaltyNum + '/';

  if (!isLoyaltyEntry) {
    template = template.replace('%F0%9F%93%8A%20Current%20visit%20count%20%3A%20<completedvisit>%0A', '');
    template = template.replace('%F0%9F%A4%9D%20Loyalty%20%3A%20<loyality>%0A', '');
  }

  let link = template
    .replace('<number>', mobile)
    .replace('<completedvisit>', encodeURIComponent(completedVisit))
    .replace('<amount>', amount)
    .replace('<message>', encodeURIComponent(message || ''))
    .replace('<loyality>', encodeURIComponent(loyaltyLink));

  document.getElementById('linkWhatsapp').href = link;
}

// ──── CLAIM REWARD ────
async function handleClaimReward() {
  const mobile = document.getElementById('dispMobile').value;
  const btn = document.getElementById('btnClaimForce');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Claiming…';

  try {
    const result = await api({ action: 'claimReward', mobile });
    if (result.error) {
      toast(result.error, 'error');
      btn.disabled = false;
      btn.innerHTML = '🎁 Claim Reward';
      return;
    }

    toast('🎉 Reward claimed! Free meal up to ₹' + result.rewardValue, 'success');
    CURRENT_CUSTOMER = {
      found: true, mobile,
      totalEntries: result.totalEntries,
      rewardsClaimed: result.rewardsClaimed,
      eligible: result.eligible,
      lastVisitDate: CURRENT_CUSTOMER ? CURRENT_CUSTOMER.lastVisitDate : ''
    };

    btn.innerHTML = '✔ Claimed';
    btn.disabled = true;

    // Recalculate button visibility and state based on new CURRENT_CUSTOMER data
    checkAmountAndToggleButtons();

    show('rowDetailsBtn');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '🎁 Claim Reward';
  }
}

// ══════════════════════════════════════
//  CUSTOMER DETAILS MODAL
// ══════════════════════════════════════

function openDetailsModal() {
  if (!CURRENT_CUSTOMER || !CURRENT_CUSTOMER.found) {
    toast('No customer data available.', 'error');
    return;
  }
  
  const displayMobile = CURRENT_CUSTOMER.mobile && CURRENT_CUSTOMER.mobile.trim() !== ''
    ? '+91 ' + CURRENT_CUSTOMER.mobile
    : 'Walk-in / No Mobile';
  const profileEl = document.getElementById('profileMobileDisp');
  if (profileEl) profileEl.textContent = displayMobile;

  renderDots();
  renderRewardEmojis();
  renderEligibility();
  hide('pastEntriesWrap');
  document.getElementById('btnShowDetails').textContent = '📄 Show Details';
  document.getElementById('modalDetails').classList.add('open');
}

function closeDetailsModal() {
  document.getElementById('modalDetails').classList.remove('open');
}

function renderDots() {
  const container = document.getElementById('dotsContainer');
  container.innerHTML = '';
  const c = CURRENT_CUSTOMER;
  const cycle = APP_CONFIG ? APP_CONFIG.cycle : 10;
  const total = c.totalEntries;
  const fullCycles = Math.floor(total / cycle);
  const remainder = total % cycle;
  const rowsNeeded = fullCycles + (remainder > 0 ? 1 : 0);

  for (let row = 0; row < Math.max(rowsNeeded, 1); row++) {
    const div = document.createElement('div');
    div.className = 'dots-cycle';

    const label = document.createElement('span');
    label.className = 'dots-cycle__label';
    const start = row * cycle + 1;
    const end = start + cycle - 1;
    label.textContent = start + '–' + end;
    div.appendChild(label);

    const dotsRow = document.createElement('div');
    dotsRow.className = 'dots-row';

    for (let d = 0; d < cycle; d++) {
      const dotIndex = row * cycle + d + 1;
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (dotIndex <= total) {
        dot.classList.add('filled');
        // Mark cycle-completion dots as reward
        if (dotIndex % cycle === 0) dot.classList.add('reward');
      }
      dot.title = 'Visit ' + dotIndex;
      dotsRow.appendChild(dot);
    }
    div.appendChild(dotsRow);
    container.appendChild(div);
  }
}

function renderRewardEmojis() {
  const container = document.getElementById('rewardEmojis');
  const badge = document.getElementById('rewardCountBadge');
  container.innerHTML = '';
  const count = CURRENT_CUSTOMER.rewardsClaimed || 0;
  if (badge) badge.textContent = count;
  
  if (count === 0) {
    container.innerHTML = '<span style="font-size:.82rem;color:var(--text-muted);">None yet</span>';
    return;
  }
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'reward-emoji';
    span.textContent = '🍕';
    span.style.animationDelay = (i * 0.08) + 's';
    container.appendChild(span);
  }
}

function renderEligibility() {
  const banner = document.getElementById('eligibilityBanner');
  const c = CURRENT_CUSTOMER;
  const cycle = APP_CONFIG ? APP_CONFIG.cycle : 10;
  const rewardVal = APP_CONFIG ? APP_CONFIG.rewardValue : 150;
  const needsClaim = c.eligible && c.rewardsClaimed < c.totalEntries / cycle;

  if (needsClaim) {
    banner.innerHTML =
      '<div class="eligibility-banner eligible">' +
      '🎉 Eligible for Reward! Free meal up to ₹' + rewardVal +
      '</div>';
  } else {
    const mod = c.totalEntries % cycle;
    const remain = cycle - mod;
    banner.innerHTML =
      '<div class="eligibility-banner not-eligible">' +
      '📊 ' + (mod === 0 && c.totalEntries > 0 ? cycle : mod) + '/' + cycle +
      ' visits completed. ' + (mod === 0 && c.totalEntries > 0 ? 0 : remain) +
      ' more to next reward.' +
      '</div>';
  }
}

async function loadPastEntries() {
  const btn = document.getElementById('btnShowDetails');
  const wrap = document.getElementById('pastEntriesWrap');

  if (!wrap.classList.contains('hidden')) {
    hide('pastEntriesWrap');
    btn.textContent = '📄 Show Details';
    return;
  }

  btn.innerHTML = '<span class="spinner"></span> Loading…';
  btn.disabled = true;

  try {
    const mobile = CURRENT_CUSTOMER.mobile;
    const data = await api({ action: 'getCustomerDetails', mobile });
    const tbody = document.getElementById('pastEntriesBody');
    tbody.innerHTML = '';

    if (data.entries && data.entries.length > 0) {
      data.entries.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + e.index + '</td>' +
          '<td>' + e.mobile + '</td>' +
          '<td>₹' + e.amount + '</td>' +
          '<td>' + e.date + '</td>' +
          '<td>' + e.time + '</td>' +
          '<td>' + (e.message || '—') + '</td>';
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No entries found.</td></tr>';
    }
    show('pastEntriesWrap');
    btn.textContent = '📄 Hide Details';
  } catch (e) {
    toast('Error loading details: ' + e.message, 'error');
    btn.textContent = '📄 Show Details';
  }
  btn.disabled = false;
}

// ══════════════════════════════════════
//  ADMIN PANEL
// ══════════════════════════════════════
async function handleAdminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  hideErr('errLogin');

  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Logging in…';

  try {
    const authResult = await api({ action: 'getAdminCreds', inputUser: user, inputPass: pass });

    if (!authResult.authenticated) {
      showErr('errLogin');
      btn.disabled = false;
      btn.innerHTML = 'Login to Dashboard';
      return;
    }

    ADMIN_AUTHENTICATED = true;
    hide('adminLoginWrap');
    show('adminPOSPanel');
    loadAdminPOSConfig();
    toast('Welcome, Admin! 🎉', 'success');
  } catch (e) {
    toast('Login error: ' + e.message, 'error');
  }
  btn.disabled = false;
  btn.innerHTML = 'Login to Dashboard';
}


// ──── Dashboard Render ────
let todayView = 'entries';

function setDashboardPeriod(period, btn) {
  DASHBOARD_PERIOD = period;
  // Update active state on buttons
  document.querySelectorAll('#periodFilter .period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Re-render everything
  renderAllDashboardComponents();
}

function renderAllDashboardComponents() {
  const entries = getFilteredEntries();
  
  try {
    renderKpiStrip(entries);
  } catch (e) {
    console.error('Error rendering KPI Strip:', e);
  }
  
  try {
    renderRevenueTrendChart(entries);
  } catch (e) {
    console.error('Error rendering Revenue Trend Chart:', e);
  }
  
  try {
    renderPaymentBreakdownChart(entries);
  } catch (e) {
    console.error('Error rendering Payment Breakdown Chart:', e);
  }
  
  try {
    renderPaymentDonut(entries);
  } catch (e) {
    console.error('Error rendering Payment Donut Chart:', e);
  }
  
  try {
    renderBestSellers(entries);
  } catch (e) {
    console.error('Error rendering Best Sellers:', e);
  }
  
  try {
    renderTodaySummaryCard();
  } catch (e) {
    console.error('Error rendering Today Summary Card:', e);
  }
  
  try {
    renderCustomerBase(entries);
  } catch (e) {
    console.error('Error rendering Customer Base Chart:', e);
  }
  
  try {
    renderTopLoyalists();
  } catch (e) {
    console.error('Error rendering Top Loyalists:', e);
  }
  
  try {
    renderRecentActivity();
  } catch (e) {
    console.error('Error rendering Recent Activity:', e);
  }
  
  try {
    calculateMdHeatmap();
  } catch (e) {
    console.error('Error rendering Month-Day Heatmap:', e);
  }
  
  try {
    calculateHeatmap();
  } catch (e) {
    console.error('Error rendering Peak Hours Map:', e);
  }
  
  try {
    calculateTimeBetweenVisits();
  } catch (e) {
    console.error('Error rendering Revisit Frequency Chart:', e);
  }
  
  try {
    updateLastSyncedLabel();
  } catch (e) {
    console.error('Error updating sync label:', e);
  }
}

function updateLastSyncedLabel() {
  const label = document.getElementById('lastSyncedLabel');
  if (!label) return;
  
  const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!ts) {
    label.textContent = 'Last synced: Never';
    return;
  }
  
  const diffMs = Date.now() - Number(ts);
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    label.textContent = 'Last synced: Just now';
  } else if (diffMins === 1) {
    label.textContent = 'Last synced: 1 min ago';
  } else if (diffMins < 60) {
    label.textContent = `Last synced: ${diffMins} mins ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    label.textContent = `Last synced: ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
}

if (!window.lastSyncedInterval) {
  window.lastSyncedInterval = setInterval(() => {
    const section = document.getElementById('sectionDashboard');
    if (section && section.classList.contains('active')) {
      updateLastSyncedLabel();
    }
  }, 30000);
}

function getFilteredEntries() {
  const today = istDateStr();
  const now = new Date();
  
  switch (DASHBOARD_PERIOD) {
    case 'today':
      return ALL_ENTRIES_CACHE.filter(e => e.date === today);
    case '7d':
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 7);
      const d7Str = d7.toISOString().split('T')[0];
      return ALL_ENTRIES_CACHE.filter(e => e.date >= d7Str);
    case '30d':
      const d30 = new Date(now);
      d30.setDate(d30.getDate() - 30);
      const d30Str = d30.toISOString().split('T')[0];
      return ALL_ENTRIES_CACHE.filter(e => e.date >= d30Str);
    case 'all':
    default:
      return ALL_ENTRIES_CACHE;
  }
}

function getPriorPeriodEntries() {
  const today = istDateStr();
  const now = new Date();
  
  switch (DASHBOARD_PERIOD) {
    case 'today':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return ALL_ENTRIES_CACHE.filter(e => e.date === yesterdayStr);
    case '7d':
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 7);
      const d7Str = d7.toISOString().split('T')[0];
      const d14 = new Date(now);
      d14.setDate(d14.getDate() - 14);
      const d14Str = d14.toISOString().split('T')[0];
      return ALL_ENTRIES_CACHE.filter(e => e.date >= d14Str && e.date < d7Str);
    case '30d':
      const d30 = new Date(now);
      d30.setDate(d30.getDate() - 30);
      const d30Str = d30.toISOString().split('T')[0];
      const d60 = new Date(now);
      d60.setDate(d60.getDate() - 60);
      const d60Str = d60.toISOString().split('T')[0];
      return ALL_ENTRIES_CACHE.filter(e => e.date >= d60Str && e.date < d30Str);
    case 'all':
    default:
      return [];
  }
}

function computeKpiData(entries) {
  const today = istDateStr();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  })();

  const todayEntries = ALL_ENTRIES_CACHE.filter(e => e.date === today);
  const yesterdayEntries = ALL_ENTRIES_CACHE.filter(e => e.date === yesterday);

  const todayRevenue = todayEntries.reduce((s, e) => s + (e.amount || 0), 0);
  const yesterdayRevenue = yesterdayEntries.reduce((s, e) => s + (e.amount || 0), 0);
  const todayRevenueΔ = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : null;

  const periodRevenue = entries.reduce((s, e) => s + (e.amount || 0), 0);
  const periodCount = entries.length;
  const periodAvg = periodCount > 0 ? Math.round(periodRevenue / periodCount) : 0;

  // Prior period for delta
  const priorEntries = getPriorPeriodEntries();
  const priorRevenue = priorEntries.reduce((s, e) => s + (e.amount || 0), 0);
  const periodRevenueΔ = priorRevenue > 0
    ? Math.round(((periodRevenue - priorRevenue) / priorRevenue) * 100)
    : null;

  // Sparkline: last 7 days daily revenue
  const sparkData = getLast7DaysDailyRevenue();

  return {
    todayRevenue, todayRevenueΔ, todayCount: todayEntries.length,
    periodRevenue, periodRevenueΔ, periodCount, periodAvg,
    sparkData
  };
}

function getLast7DaysDailyRevenue() {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const dayTotal = ALL_ENTRIES_CACHE
      .filter(e => e.date === dateStr)
      .reduce((s, e) => s + (e.amount || 0), 0);
    result.push(dayTotal);
  }
  return result;
}

function makeSparkline(dataArray, width = 80, height = 28) {
  if (!dataArray || dataArray.length < 2) return '';
  const max = Math.max(...dataArray);
  const min = Math.min(...dataArray);
  const range = max - min || 1;
  const step = width / (dataArray.length - 1);
  const points = dataArray.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="kpi-sparkline">
    <polyline points="${points}" fill="none" stroke="var(--sparkline-line)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function renderKpiStrip(entries) {
  const kpi = computeKpiData(entries);
  const totalCustomers = ADMIN_DATA ? ADMIN_DATA.totalCustomers : 0;
  const rewardsGiven = ADMIN_DATA ? ADMIN_DATA.rewardsGiven : 0;
  const conversionRate = ADMIN_DATA ? ADMIN_DATA.conversionRate : 0;

  const container = document.getElementById('kpiStrip');
  if (!container) return;

  const todayDeltaHtml = kpi.todayRevenueΔ !== null
    ? (kpi.todayRevenueΔ >= 0
        ? `<span class="kpi-delta up">↑ +${kpi.todayRevenueΔ}%</span>`
        : `<span class="kpi-delta down">↓ ${kpi.todayRevenueΔ}%</span>`)
    : '';

  const periodDeltaHtml = kpi.periodRevenueΔ !== null
    ? (kpi.periodRevenueΔ >= 0
        ? `<span class="kpi-delta up">↑ +${kpi.periodRevenueΔ}%</span>`
        : `<span class="kpi-delta down">↓ ${kpi.periodRevenueΔ}%</span>`)
    : '';

  // Get period label
  let periodLabel = 'Period';
  if (DASHBOARD_PERIOD === '7d') periodLabel = '7 Days';
  else if (DASHBOARD_PERIOD === '30d') periodLabel = '30 Days';
  else if (DASHBOARD_PERIOD === 'all') periodLabel = 'All-Time';
  else if (DASHBOARD_PERIOD === 'today') periodLabel = 'Today';

  const html = `
    <!-- Card 1: Today's Revenue (Hero) -->
    <div class="kpi-card kpi-card--hero">
      <div>
        <div class="kpi-label">Today's Revenue</div>
        <div class="kpi-value">₹${kpi.todayRevenue.toLocaleString('en-IN')}</div>
      </div>
      <div>
        ${todayDeltaHtml}
        ${makeSparkline(kpi.sparkData, 120, 32)}
      </div>
    </div>

    <!-- Card 2: Period Revenue -->
    <div class="kpi-card">
      <div>
        <div class="kpi-label">${periodLabel} Revenue</div>
        <div class="kpi-value">₹${kpi.periodRevenue.toLocaleString('en-IN')}</div>
      </div>
      <div>
        ${periodDeltaHtml}
        ${makeSparkline(kpi.sparkData, 80, 24)}
      </div>
    </div>

    <!-- Card 3: Today's Orders -->
    <div class="kpi-card">
      <div>
        <div class="kpi-label">Today's Orders</div>
        <div class="kpi-value">${kpi.todayCount}</div>
      </div>
      <div>
        <span class="kpi-label" style="font-size:10px; margin-top:8px; display:block;">Live orders</span>
      </div>
    </div>

    <!-- Card 4: Total Customers -->
    <div class="kpi-card">
      <div>
        <div class="kpi-label">Total Customers</div>
        <div class="kpi-value">${totalCustomers.toLocaleString('en-IN')}</div>
      </div>
      <div>
        <span class="kpi-label" style="font-size:10px; margin-top:8px; display:block;">Registered</span>
      </div>
    </div>

    <!-- Card 5: Avg Order Value -->
    <div class="kpi-card">
      <div>
        <div class="kpi-label">Avg Order Value</div>
        <div class="kpi-value">₹${kpi.periodAvg.toLocaleString('en-IN')}</div>
      </div>
      <div>
        <span class="kpi-label" style="font-size:10px; margin-top:8px; display:block;">Per order</span>
      </div>
    </div>

    <!-- Card 6: Rewards Given -->
    <div class="kpi-card">
      <div>
        <div class="kpi-label">Rewards Given</div>
        <div class="kpi-value">${rewardsGiven.toLocaleString('en-IN')}</div>
      </div>
      <div>
        <span class="kpi-label" style="font-size:10px; margin-top:8px; display:block;">Loyalty free meals</span>
      </div>
    </div>

    <!-- Card 7: Loyalty Conv. Rate -->
    <div class="kpi-card">
      <div>
        <div class="kpi-label">Loyalty Conv.</div>
        <div class="kpi-value">${conversionRate}%</div>
      </div>
      <div>
        <span class="kpi-label" style="font-size:10px; margin-top:8px; display:block;">Claim rate</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

let revenueTrendChart = null;
let paymentBreakdownChart = null;
let paymentDonutChart = null;

function renderRevenueTrendChart(entries) {
  const canvas = document.getElementById('chartRevenueTrend');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (revenueTrendChart) revenueTrendChart.destroy();

  const { labels, data } = getRevenueTrendData(entries);

  revenueTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue',
        data,
        borderColor: getActiveThemeColors().primary,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: getActiveThemeColors().primary,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx: chartCtx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = chartCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          const colors = getActiveThemeColors();
          gradient.addColorStop(0, colors.rgba(0.25));
          gradient.addColorStop(1, colors.rgba(0));
          return gradient;
        },
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `₹${item.raw.toLocaleString('en-IN')}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => v >= 1000 ? `₹${(v/1000).toFixed(1)}K` : `₹${v}`,
            font: { family: 'Outfit', size: 11 }
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          ticks: { font: { family: 'Outfit', size: 11 }, maxRotation: 30 },
          grid: { display: false }
        }
      }
    }
  });
}

function getRevenueTrendData(entries) {
  if (DASHBOARD_PERIOD === 'today') {
    // Hourly grouping
    const hourly = Array(24).fill(0);
    entries.forEach(e => {
      if (!e.time) return;
      const hour = parseInt(e.time.split(':')[0], 10);
      if (hour >= 0 && hour < 24) hourly[hour] += e.amount || 0;
    });
    const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
    return { labels, data: hourly };
  }
  
  if (DASHBOARD_PERIOD === '7d') {
    return getDailyGrouped(entries, 7);
  }

  if (DASHBOARD_PERIOD === '30d') {
    return getDailyGrouped(entries, 30);
  }

  // All time: monthly grouping
  const monthly = {};
  entries.forEach(e => {
    if (!e.date) return;
    const [year, month] = e.date.split('-');
    const key = `${year}-${month}`;
    monthly[key] = (monthly[key] || 0) + (e.amount || 0);
  });
  const keys = Object.keys(monthly).sort();
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return {
    labels: keys.map(k => {
      const [y, m] = k.split('-');
      return `${monthNames[parseInt(m,10)-1]} '${y.slice(2)}`;
    }),
    data: keys.map(k => monthly[k])
  };
}

function getDailyGrouped(entries, days) {
  const labels = [];
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const amount = entries
      .filter(e => e.date === dateStr)
      .reduce((s, e) => s + (e.amount || 0), 0);
    
    const label = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
    labels.push(label);
    data.push(amount);
  }
  return { labels, data };
}

function renderPaymentBreakdownChart(entries) {
  const canvas = document.getElementById('chartPaymentBreakdown');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (paymentBreakdownChart) paymentBreakdownChart.destroy();

  const { labels, cashData, upiData, cardData } = getPaymentBreakdownData(entries);

  paymentBreakdownChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Cash',
          data: cashData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.25)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'UPI',
          data: upiData,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Card',
          data: cardData,
          borderColor: getActiveThemeColors().primary,
          backgroundColor: getActiveThemeColors().rgba(0.25),
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: getActiveThemeColors().primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      animation: { duration: 500 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: 'Outfit', size: 11 }, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: (item) => `${item.dataset.label}: ₹${item.raw.toLocaleString('en-IN')}`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          stacked: true,
          ticks: {
            callback: (v) => v >= 1000 ? `₹${(v/1000).toFixed(1)}K` : `₹${v}`,
            font: { family: 'Outfit', size: 11 }
          }
        }
      }
    }
  });
}

function getPaymentBreakdownData(entries) {
  if (DASHBOARD_PERIOD === 'today') {
    // Hourly
    const cashData = Array(24).fill(0);
    const upiData = Array(24).fill(0);
    const cardData = Array(24).fill(0);
    entries.forEach(e => {
      if (!e.time) return;
      const hour = parseInt(e.time.split(':')[0], 10);
      if (hour >= 0 && hour < 24) {
        cashData[hour] += e.cash || 0;
        upiData[hour] += e.upi || 0;
        cardData[hour] += e.card || 0;
      }
    });
    const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
    return { labels, cashData, upiData, cardData };
  }
  
  if (DASHBOARD_PERIOD === '7d' || DASHBOARD_PERIOD === '30d') {
    // Daily
    const days = DASHBOARD_PERIOD === '7d' ? 7 : 30;
    const labels = [];
    const cashData = [];
    const upiData = [];
    const cardData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const dayEntries = entries.filter(e => e.date === dateStr);
      cashData.push(dayEntries.reduce((s, e) => s + (e.cash || 0), 0));
      upiData.push(dayEntries.reduce((s, e) => s + (e.upi || 0), 0));
      cardData.push(dayEntries.reduce((s, e) => s + (e.card || 0), 0));
      
      const label = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
      labels.push(label);
    }
    return { labels, cashData, upiData, cardData };
  }
  
  // All time: monthly
  const monthly = {};
  entries.forEach(e => {
    if (!e.date) return;
    const [year, month] = e.date.split('-');
    const key = `${year}-${month}`;
    if (!monthly[key]) {
      monthly[key] = { cash: 0, upi: 0, card: 0 };
    }
    monthly[key].cash += e.cash || 0;
    monthly[key].upi += e.upi || 0;
    monthly[key].card += e.card || 0;
  });
  const keys = Object.keys(monthly).sort();
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = keys.map(k => {
    const [y, m] = k.split('-');
    return `${monthNames[parseInt(m,10)-1]} '${y.slice(2)}`;
  });
  return {
    labels,
    cashData: keys.map(k => monthly[k].cash),
    upiData: keys.map(k => monthly[k].upi),
    cardData: keys.map(k => monthly[k].card)
  };
}

function renderPaymentDonut(entries) {
  const ctx = document.getElementById('chartPaymentDonut');
  if (!ctx) return;
  
  if (paymentDonutChart) paymentDonutChart.destroy();
  
  let cash = 0, upi = 0, card = 0;
  entries.forEach(e => {
    cash += e.cash || 0;
    upi += e.upi || 0;
    card += e.card || 0;
  });
  
  const total = cash + upi + card;
  const totalsEl = document.getElementById('paymentMixTotals');
  if (totalsEl) {
    totalsEl.innerHTML = `
      <span>
        <span class="mix-label">💵 Cash</span>
        <span class="mix-value">₹${cash.toLocaleString('en-IN')}</span>
      </span>
      <span>
        <span class="mix-label">📱 UPI</span>
        <span class="mix-value">₹${upi.toLocaleString('en-IN')}</span>
      </span>
      <span>
        <span class="mix-label">💳 Card</span>
        <span class="mix-value">₹${card.toLocaleString('en-IN')}</span>
      </span>
    `;
  }

  if (total === 0) {
    paymentDonutChart = new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e2e8f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '70%'
      }
    });
    return;
  }
  
  paymentDonutChart = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Cash', 'UPI', 'Card'],
      datasets: [{
        data: [cash, upi, card],
        backgroundColor: ['#10B981', '#6366F1', getActiveThemeColors().primary],
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      cutout: '70%'
    }
  });
}
function renderBestSellers(entries) {
  const dateInput = document.getElementById('bestSellersDateFilter');
  let targetDate = istDateStr();
  if (dateInput) {
    if (!dateInput.value) {
      dateInput.value = targetDate;
    } else {
      targetDate = dateInput.value;
    }
  }
  const filteredEntries = ALL_ENTRIES_CACHE.filter(e => e.date === targetDate);
  renderBestSellersRanked(filteredEntries, 'dailyBestSellersList');
  renderBestSellersRanked(ALL_ENTRIES_CACHE, 'overallBestSellersList');
}

function getBestSellersData(entries) {
  const tally = {};
  entries.forEach(entry => {
    if (!entry.orderItems) return;
    try {
      const items = JSON.parse(entry.orderItems);
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (!item.qty || item.qty <= 0) return;
          const flavourSuffix = item.flavour ? ` (${item.flavour})` : '';
          const key = `${item.dishName}${flavourSuffix}`;
          tally[key] = (tally[key] || 0) + item.qty;
        });
      }
    } catch (e) {
      // Ignore
    }
  });

  return Object.entries(tally)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);
}

function renderBestSellersRanked(entries, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const sorted = getBestSellersData(entries);
  const top5 = sorted.slice(0, 5);

  if (top5.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem; font-size:13px;">No data for this period.</p>';
    return;
  }

  const maxQty = top5[0].qty;
  const medals = ['🥇', '🥈', '🥉', '4', '5'];

  let html = top5.map((item, i) => {
    const pct = Math.round((item.qty / maxQty) * 100);
    const rankLabel = medals[i];
    return `<div class="best-seller-row">
      <span class="bs-rank">${rankLabel}</span>
      <div class="bs-info">
        <span class="bs-name">${item.name}</span>
        <div class="bs-bar-wrap">
          <div class="bs-bar" style="width:${pct}%"></div>
        </div>
      </div>
      <span class="bs-count">${item.qty}</span>
    </div>`;
  }).join('');

  if (sorted.length > 5) {
    const listType = containerId === 'dailyBestSellersList' ? 'today' : 'all-time';
    html += `
      <div style="margin-top: auto; padding-top: 12px; text-align: center;">
        <button class="btn btn--outline btn--sm" style="width: 100%;" onclick="showAllBestSellers('${listType}')">View All</button>
      </div>
    `;
  }

  container.innerHTML = html;
}

function showAllBestSellers(listType) {
  let entries = [];
  let title = '';
  
  if (listType === 'today') {
    const dateInput = document.getElementById('bestSellersDateFilter');
    let targetDate = istDateStr();
    if (dateInput && dateInput.value) {
      targetDate = dateInput.value;
    }
    entries = ALL_ENTRIES_CACHE.filter(e => e.date === targetDate);
    let dateObj = new Date(targetDate);
    let formattedDate = targetDate;
    if (!isNaN(dateObj)) {
      formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    title = `Today's Best Sellers (${formattedDate})`;
  } else {
    entries = ALL_ENTRIES_CACHE;
    title = 'All-Time Best Sellers';
  }
  
  const sorted = getBestSellersData(entries);
  const container = document.getElementById('bestSellersAllList');
  const titleContainer = document.getElementById('bestSellersAllTitle');
  
  if (titleContainer) {
    titleContainer.innerHTML = `<span class="icon">${listType === 'today' ? '📈' : '🏆'}</span> ${title}`;
  }
  
  if (!container) return;
  
  if (sorted.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No data available.</p>';
  } else {
    const maxQty = sorted[0].qty;
    container.innerHTML = sorted.map((item, i) => {
      const pct = Math.round((item.qty / maxQty) * 100);
      const rankLabel = i < 3 ? ['🥇', '🥈', '🥉'][i] : (i + 1);
      return `<div class="best-seller-row">
        <span class="bs-rank">${rankLabel}</span>
        <div class="bs-info">
          <span class="bs-name">${item.name}</span>
          <div class="bs-bar-wrap">
            <div class="bs-bar" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="bs-count">${item.qty}</span>
      </div>`;
    }).join('');
  }
  
  openModal('modalBestSellersAll');
}

let customerTiersChart = null;

function renderCustomerBase(entries) {
  const ctx = document.getElementById('chartCustomerTiers');
  if (!ctx) return;
  
  if (customerTiersChart) customerTiersChart.destroy();
  
  const visitCounts = {};
  ALL_ENTRIES_CACHE.forEach(e => {
    if (!e.mobile || e.mobile.trim() === '') return;
    visitCounts[e.mobile] = (visitCounts[e.mobile] || 0) + 1;
  });
  
  let regulars = 0;  // 2+ visits
  let oneTimers = 0; // 1 visit
  
  Object.values(visitCounts).forEach(count => {
    if (count >= 2) regulars++;
    else oneTimers++;
  });
  
  const total = regulars + oneTimers;
  const pillsEl = document.getElementById('tierPills');
  if (pillsEl) {
    pillsEl.innerHTML = `
      <span class="tier-pill" style="background:rgba(232, 93, 4, 0.15); color:#e85d04;">🤝 Regulars: ${regulars}</span>
      <span class="tier-pill" style="background:rgba(209, 213, 219, 0.3); color:var(--text-secondary);">🌱 One-timers: ${oneTimers}</span>
    `;
  }
  
  if (total === 0) {
    customerTiersChart = new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e2e8f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '70%'
      }
    });
    return;
  }
  
  customerTiersChart = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Regulars (2+)', 'One-timers (1)'],
      datasets: [{
        data: [regulars, oneTimers],
        backgroundColor: [getActiveThemeColors().primary, '#d1d5db'],
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      cutout: '70%'
    }
  });
}

function renderTopLoyalists() {
  const ul = document.getElementById('topCustomersList');
  if (!ul) return;
  
  const sortSelect = document.getElementById('loyalistSort');
  const sortBy = sortSelect ? sortSelect.value : 'visits';
  
  const customerMap = {};
  ALL_ENTRIES_CACHE.forEach(e => {
    if (!e.mobile || e.mobile.trim() === '') return;
    if (!customerMap[e.mobile]) {
      customerMap[e.mobile] = { mobile: e.mobile, visits: 0, revenue: 0 };
    }
    customerMap[e.mobile].visits += 1;
    customerMap[e.mobile].revenue += (e.amount || 0);
  });
  
  const list = Object.values(customerMap);
  if (sortBy === 'visits') {
    list.sort((a, b) => b.visits - a.visits);
  } else {
    list.sort((a, b) => b.revenue - a.revenue);
  }
  
  const top8 = list.slice(0, 8);
  if (top8.length === 0) {
    ul.innerHTML = '<li style="color:var(--text-muted); font-size:13px; text-align:center; padding:1rem;">No customer records yet.</li>';
    return;
  }
  
  ul.innerHTML = top8.map((c, i) => {
    const displayMobile = c.mobile;
    
    const valueLabel = sortBy === 'visits' ? `${c.visits} visits` : `₹${c.revenue.toLocaleString('en-IN')}`;

    return `<li style="cursor:pointer;" onclick="openLoyalistProfile('${c.mobile}')">
      <div style="display:flex; align-items:center;">
        <span class="top-list__rank" style="margin-right:8px; font-weight:700;">#${i + 1}</span>
        <span>${displayMobile}</span>
      </div>
      <span style="font-weight:700; color:var(--brand-primary);">${valueLabel}</span>
    </li>`;
  }).join('');
}

async function openLoyalistProfile(mobile) {
  try {
    toast('Loading customer profile…', 'info');
    const cust = await api({ action: 'getCustomer', mobile });
    CURRENT_CUSTOMER = cust;
    openDetailsModal();
  } catch (e) {
    toast('Error opening profile: ' + e.message, 'error');
  }
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivityFeed');
  if (!container) return;
  
  const recent = [...ALL_ENTRIES_CACHE]
    .sort((a, b) => {
      const dateA = a.date + 'T' + (a.time || '00:00:00');
      const dateB = b.date + 'T' + (b.time || '00:00:00');
      return dateB.localeCompare(dateA);
    })
    .slice(0, 10);

  if (!recent.length) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:2rem; font-size:13px;">No transactions recorded yet.</p>';
    return;
  }

  container.innerHTML = recent.map((e, i) => {
    const absoluteIndex = ALL_ENTRIES_CACHE.indexOf(e);
    
    const displayMobile = e.mobile && e.mobile.trim() !== ''
      ? e.mobile
      : 'Walk-in';
      
    const modeIcon = { cash: '💵', upi: '📱', card: '💳', split: '✂️' }[e.paymentMode] || '💵';
    
    let itemsStr = '—';
    if (e.orderItems) {
      try {
        const items = JSON.parse(e.orderItems);
        if (Array.isArray(items) && items.length > 0) {
          itemsStr = items.map(it => `${it.dishName}×${it.qty || 1}`).join(', ');
        }
      } catch (err) {}
    }
    
    const dateLabel = e.date ? e.date.substring(5) : '';
    const timeLabel = e.time ? e.time.substring(0, 5) : '';
    const timeDisplay = `${dateLabel} ${timeLabel}`;
    
    return `<div class="activity-row" onclick="showEntryDetails(${absoluteIndex})" style="cursor:pointer;">
      <div class="activity-time">${timeDisplay}</div>
      <div class="activity-customer">${displayMobile}</div>
      <div class="activity-amount">₹${(e.amount || 0).toLocaleString('en-IN')}</div>
      <div class="activity-mode">${modeIcon}</div>
      <div class="activity-items" title="${itemsStr}">${itemsStr}</div>
    </div>`;
  }).join('');
}

function prependActivityRow(e) {
  const feed = document.getElementById('recentActivityFeed');
  if (!feed) return;
  
  if (feed.querySelector('p')) {
    feed.innerHTML = '';
  }
  
  const displayMobile = e.mobile && e.mobile.trim() !== ''
    ? e.mobile
    : 'Walk-in';
    
  const modeIcon = { cash: '💵', upi: '📱', card: '💳', split: 'split' }[e.cash ? (e.upi ? 'split' : (e.card ? 'split' : 'cash')) : (e.upi ? (e.card ? 'split' : 'upi') : 'card')] || '💵';
  
  let itemsStr = '—';
  if (e.orderItems) {
    try {
      const items = JSON.parse(e.orderItems);
      if (Array.isArray(items) && items.length > 0) {
        itemsStr = items.map(it => `${it.dishName}×${it.qty || 1}`).join(', ');
      }
    } catch (err) {}
  }
  
  const dateLabel = e.date ? e.date.substring(5) : '';
  const timeLabel = e.time ? e.time.substring(0, 5) : '';
  
  const absoluteIndex = ALL_ENTRIES_CACHE.indexOf(e);
  
  const row = document.createElement('div');
  row.className = 'activity-row activity-row--new';
  row.onclick = () => showEntryDetails(absoluteIndex);
  row.style.cursor = 'pointer';
  row.innerHTML = `
    <div class="activity-time">${dateLabel} ${timeLabel}</div>
    <div class="activity-customer">${displayMobile}</div>
    <div class="activity-amount">₹${(e.amount || 0).toLocaleString('en-IN')}</div>
    <div class="activity-mode">${modeIcon}</div>
    <div class="activity-items" title="${itemsStr}">${itemsStr}</div>
  `;
  
  feed.prepend(row);
  
  const rows = feed.querySelectorAll('.activity-row');
  if (rows.length > 10) {
    rows[rows.length - 1].remove();
  }
  
  requestAnimationFrame(() => {
    row.classList.add('activity-row--visible');
  });
}

function renderTodaySummaryCard() {
  const valEl = document.getElementById('todayValue');
  const deltaEl = document.getElementById('todayDelta');
  if (!valEl) return;
  
  const today = istDateStr();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  })();
  
  const todayEntries = ALL_ENTRIES_CACHE.filter(e => e.date === today);
  const yesterdayEntries = ALL_ENTRIES_CACHE.filter(e => e.date === yesterday);
  
  const todayRevenue = todayEntries.reduce((s, e) => s + (e.amount || 0), 0);
  const yesterdayRevenue = yesterdayEntries.reduce((s, e) => s + (e.amount || 0), 0);
  
  const todayCount = todayEntries.length;
  const yesterdayCount = yesterdayEntries.length;
  
  if (todayView === 'entries') {
    valEl.textContent = todayCount + (todayCount === 1 ? ' entry' : ' entries');
    const diff = todayCount - yesterdayCount;
    if (diff > 0) {
      deltaEl.textContent = `↑ +${diff} vs yesterday`;
      deltaEl.className = 'today-delta positive';
    } else if (diff < 0) {
      deltaEl.textContent = `↓ ${diff} vs yesterday`;
      deltaEl.className = 'today-delta negative';
    } else {
      deltaEl.textContent = `→ 0 vs yesterday`;
      deltaEl.className = 'today-delta';
    }
  } else {
    valEl.textContent = '₹' + todayRevenue.toLocaleString('en-IN');
    const diff = todayRevenue - yesterdayRevenue;
    const sign = diff >= 0 ? '+' : '';
    if (diff > 0) {
      deltaEl.textContent = `↑ ${sign}₹${diff.toLocaleString('en-IN')} vs yesterday`;
      deltaEl.className = 'today-delta positive';
    } else if (diff < 0) {
      deltaEl.textContent = `↓ ₹${Math.abs(diff).toLocaleString('en-IN')} vs yesterday`;
      deltaEl.className = 'today-delta negative';
    } else {
      deltaEl.textContent = `→ ₹0 vs yesterday`;
      deltaEl.className = 'today-delta';
    }
  }
}

function setTodayView(view, btn) {
  todayView = view;
  document.querySelectorAll('#todayToggle .toggle-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTodaySummaryCard();
}

// ──── Heatmap ────
let heatmapType = 'amount';

function setHeatmapType(type, btn) {
  heatmapType = type;
  document.querySelectorAll('#heatmapToggle .toggle-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  calculateHeatmap();
}

function calculateHeatmap() {
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
  
  ALL_ENTRIES_CACHE.forEach(entry => {
    if (!entry.date || !entry.time) return;
    const dObj = new Date(entry.date);
    const dayOfWeek = dObj.getDay();
    const parts = entry.time.split(':');
    if (parts.length >= 1 && !isNaN(dayOfWeek)) {
      const hour = parseInt(parts[0], 10);
      if (hour >= 0 && hour < 24) {
        if (heatmapType === 'amount') matrix[dayOfWeek][hour] += entry.amount || 0;
        else matrix[dayOfWeek][hour] += 1;
      }
    }
  });

  renderHeatmap(matrix);
}

function renderHeatmap(matrix) {
  const container = document.getElementById('heatmapContainer');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let maxVal = 0;
  let peakDayIdx = 0;
  let peakHourIdx = 0;
  
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const v = matrix[d][h];
      if (v > maxVal) {
        maxVal = v;
        peakDayIdx = d;
        peakHourIdx = h;
      }
    }
  }

  let html = '<div class="heatmap-grid">';
  // Header row
  html += '<div class="heatmap-label"></div>';
  for (let h = 0; h < 24; h++) {
    html += '<div class="heatmap-header">' + h + '</div>';
  }
  // Data rows
  for (let d = 0; d < 7; d++) {
    html += '<div class="heatmap-label">' + days[d] + '</div>';
    for (let h = 0; h < 24; h++) {
      const val = matrix[d][h];
      const intensity = maxVal > 0 ? val / maxVal : 0;
      const bg = intensity === 0
        ? 'var(--dot-empty)'
        : 'rgba(232, 93, 4, ' + (0.15 + intensity * 0.85) + ')';

      let cellClasses = ['heatmap-cell'];
      if (h < 3) cellClasses.push('edge-left');
      if (h > 20) cellClasses.push('edge-right');
      if (d < 2) cellClasses.push('edge-top');
      const classAttr = cellClasses.join(' ');

      html += '<div class="' + classAttr + '" style="background:' + bg + '">' +
        '<div class="heatmap-tooltip">' + days[d] + ' ' + h + ':00 — ' + val + '</div>' +
        '</div>';
    }
  }
  html += '</div>';
  container.innerHTML = html;

  // Peak callout
  const peakCallout = document.getElementById('peakHoursCallout');
  if (peakCallout) {
    if (maxVal > 0) {
      const ampm = peakHourIdx >= 12 ? 'PM' : 'AM';
      const displayHour = peakHourIdx % 12 || 12;
      peakCallout.textContent = `🔥 Busiest: ${days[peakDayIdx]} at ${displayHour}${ampm}`;
      peakCallout.style.display = 'block';
    } else {
      peakCallout.style.display = 'none';
    }
  }
}

// ──── Time Between Visits ────
let tbvChart = null;

function calculateTimeBetweenVisits() {
  const byMobile = {};
  
  ALL_ENTRIES_CACHE.forEach(r => {
    if (!r.mobile || !r.date) return;
    const m = r.mobile;
    if (!m || m.trim() === '') return;
    if (!byMobile[m]) byMobile[m] = [];
    byMobile[m].push(new Date(r.date));
  });

  const gaps = [];
  Object.keys(byMobile).forEach(m => {
    const dates = byMobile[m].sort((a, b) => a - b);
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.round((dates[i] - dates[i - 1]) / 86400000);
      if (diff >= 0) gaps.push(diff);
    }
  });

  let data = { avg: 0, min: 0, max: 0, totalGaps: 0, distribution: {} };

  if (gaps.length > 0) {
    const avg = Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 100) / 100;
    const min = Math.min(...gaps);
    const max = Math.max(...gaps);

    const dist = {
      'Same Day': 0,
      '1-2 Days': 0,
      '3-5 Days': 0,
      '6-10 Days': 0,
      '11-20 Days': 0,
      '21-30 Days': 0,
      '30+ Days': 0
    };
    gaps.forEach(g => {
      if (g === 0) dist['Same Day']++;
      else if (g <= 2) dist['1-2 Days']++;
      else if (g <= 5) dist['3-5 Days']++;
      else if (g <= 10) dist['6-10 Days']++;
      else if (g <= 20) dist['11-20 Days']++;
      else if (g <= 30) dist['21-30 Days']++;
      else dist['30+ Days']++;
    });

    data = { avg, min, max, totalGaps: gaps.length, distribution: dist };
  }

  show('tbvContainer');

  const statsGrid = document.getElementById('tbvStats');
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-card__value">${data.avg}d</div>
        <div class="stat-card__label">Avg Gap</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${data.min}d</div>
        <div class="stat-card__label">Min Gap</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${data.max}d</div>
        <div class="stat-card__label">Max Gap</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${data.totalGaps || 0}</div>
        <div class="stat-card__label">Total Pairs</div>
      </div>
    `;
  }

  const dist = data.distribution || {};
  const labels = ['Same Day', '1-2 Days', '3-5 Days', '6-10 Days', '11-20 Days', '21-30 Days', '30+ Days'];
  const values = labels.map(k => dist[k] || 0);

  const canvas = document.getElementById('chartTBV');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (tbvChart) tbvChart.destroy();
  
  tbvChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Customer Gaps',
        data: values,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx: chartCtx, chartArea } = chart;
          const colors = getActiveThemeColors();
          if (!chartArea) return colors.rgba(0.7);
          const gradient = chartCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, colors.rgba(0.4));
          gradient.addColorStop(1, colors.rgba(0.85));
          return gradient;
        },
        hoverBackgroundColor: (context) => {
          const chart = context.chart;
          const { ctx: chartCtx, chartArea } = chart;
          const colors = getActiveThemeColors();
          if (!chartArea) return colors.rgba(0.9);
          const gradient = chartCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, colors.rgba(0.7));
          gradient.addColorStop(1, colors.rgba(1));
          return gradient;
        },
        borderRadius: 8,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(26, 24, 28, 0.95)',
          titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
          bodyFont: { family: 'Outfit', size: 12 },
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (item) => ` ${item.raw} return visits`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(128, 128, 128, 0.12)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(128, 128, 128, 0.8)',
            font: { family: 'Outfit', size: 10 }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(128, 128, 128, 0.8)',
            font: { family: 'Outfit', size: 10 }
          }
        }
      }
    }
  });
}

// ══════════════════════════════════════
//  POS SYSTEM LOGIC
// ══════════════════════════════════════

// Unique session ID per browser tab — used to identify and ignore self-echo SSE events
const SESSION_ID = Math.random().toString(36).substr(2, 12) + '_' + Date.now();

let POS_STATE = {
  tableCount: 0,
  tableCategories: [], // Configured table layout categories/sections
  currentTableId: null,
  currentCategoryIndex: null,
  categories: [],
  dishes: [], // dishes for current category
  tableOrders: JSON.parse(localStorage.getItem('ppp_tables') || '{}'),
  flavoursMap: {},
  combos: []
};

function initializeLocalTableOrders(serverOrders) {
  POS_STATE.tableOrders = {};
  if (POS_STATE.tableCategories && POS_STATE.tableCategories.length > 0) {
    let globalIndex = 1;
    POS_STATE.tableCategories.forEach(cat => {
      const count = Number(cat.count) || 0;
      for (let i = 1; i <= count; i++) {
        const uniqueId = `table_${cat.id}_${i}`;
        // Map from server unique ID, or fallback to the old global numerical index if present
        POS_STATE.tableOrders[uniqueId] = (serverOrders && (serverOrders[uniqueId] || serverOrders[globalIndex])) || {};
        globalIndex++;
      }
    });
  } else {
    // Fallback if no categories
    for (let i = 1; i <= POS_STATE.tableCount; i++) {
      POS_STATE.tableOrders[i] = (serverOrders && serverOrders[i]) || {};
    }
  }
}

function getUniqueTablesTopic() {
  try {
    if (API_URL && API_URL.includes('/s/')) {
      const parts = API_URL.split('/s/')[1];
      if (parts) {
        const subParts = parts.split('/')[0];
        if (subParts) {
          return 'ppp_tables_' + subParts.substring(0, 16);
        }
      }
    }
  } catch (e) {
    console.error('Error parsing API_URL for topic', e);
  }
  return 'ppp_tables_default_fallback';
}

function startTablesEventListener() {
  if (window.tablesEventSource) return;
  
  const topic = getUniqueTablesTopic();
  const url = `https://ntfy.sh/${topic}/sse`;
  
  window.tablesEventSource = new EventSource(url);
  window.tablesEventSource.onmessage = async (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload && payload.message) {
        const msgData = JSON.parse(payload.message);
        if (msgData && msgData.action === 'table_updated') {
          // Self-echo suppression: ignore events sent by THIS browser tab
          if (msgData.senderId && msgData.senderId === SESSION_ID) {
            return;
          }
          
          if (msgData.orderData !== undefined) {
            // Instant optimistic update using the payload!
            if (msgData.tableId) {
                if (Object.keys(msgData.orderData).length === 0) {
                   POS_STATE.tableOrders[msgData.tableId] = {};
                } else {
                   POS_STATE.tableOrders[msgData.tableId] = msgData.orderData;
                }
            }
            
            // Check for new kitchen items/chimes
            if (typeof checkAndPlayKitchenAlert === 'function') {
              checkAndPlayKitchenAlert(POS_STATE.tableOrders);
            }
            
            localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
            
            // Re-render UI depending on active view
            if (POS_STATE.currentTableId === null) {
              showPosTables();
            }
            
            const reportView = document.getElementById('posLiveTablesReportView');
            if (reportView && !reportView.classList.contains('hidden')) {
              renderLiveTablesReportContent();
            }
            
            if (POS_STATE.currentTableId !== null) {
              renderPosMenuGrid();
            }

            const kitchenSection = document.getElementById('sectionKitchen');
            if (kitchenSection && kitchenSection.classList.contains('active')) {
              renderKitchenView();
            }
          } else {
            // Fallback: Fetch the latest table data from database if payload was too large
            const res = await apiDirect({ action: 'getTablesData' });
            if (res && !res.error) {
              // Check for new kitchen items/chimes before updating state
              if (typeof checkAndPlayKitchenAlert === 'function') {
                checkAndPlayKitchenAlert(res);
              }

              // Merge server orders into local state
              if (POS_STATE.tableCategories && POS_STATE.tableCategories.length > 0) {
                POS_STATE.tableCategories.forEach(cat => {
                  const count = Number(cat.count) || 0;
                  for (let i = 1; i <= count; i++) {
                    const uniqueId = `table_${cat.id}_${i}`;
                    if (res[uniqueId]) {
                      POS_STATE.tableOrders[uniqueId] = res[uniqueId];
                    }
                  }
                });
              } else {
                for (let i = 1; i <= POS_STATE.tableCount; i++) {
                  if (res[i]) {
                    POS_STATE.tableOrders[i] = res[i];
                  }
                }
              }
              localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
              
              // Re-render UI depending on active view
              if (POS_STATE.currentTableId === null) {
                showPosTables();
              }
              
              const reportView = document.getElementById('posLiveTablesReportView');
              if (reportView && !reportView.classList.contains('hidden')) {
                renderLiveTablesReportContent();
              }
              
              if (POS_STATE.currentTableId !== null) {
                renderPosMenuGrid();
              }

              const kitchenSection = document.getElementById('sectionKitchen');
              if (kitchenSection && kitchenSection.classList.contains('active')) {
                renderKitchenView();
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error handling tables SSE event', e);
    }
  };
  
  window.tablesEventSource.onerror = (e) => {
    console.warn('Tables SSE error, reconnecting...', e);
  };
}

async function notifyTableUpdate(tableId, orderData) {
  try {
    const topic = getUniqueTablesTopic();
    const payload = { 
      action: 'table_updated', 
      tableId: tableId, 
      senderId: SESSION_ID 
    };
    
    // Attach orderData if provided
    if (orderData !== undefined) {
      payload.orderData = orderData;
    }
    
    let bodyString = JSON.stringify(payload);
    
    // ntfy.sh free tier has a 4KB limit. 3500 chars leaves a safe margin.
    if (bodyString.length > 3500) {
      delete payload.orderData;
      bodyString = JSON.stringify(payload);
    }
    
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      body: bodyString
    });
  } catch (err) {
    console.error('Failed to dispatch pub/sub update notification', err);
  }
}

async function initPos() {
  try {
    const res = await api({ action: 'getTableCount' });
    POS_STATE.tableCount = res.count || 0;
    POS_STATE.tableCategories = res.categories || [];
  } catch (e) {
    console.error('Failed to load table count and categories', e);
  }

  // Pre-fetch menu tree in background to eliminate load latency when opening tables
  api({ action: 'getMenuTree' }).then(res => {
    POS_STATE.menuTree = res.nodes || [];
  }).catch(e => console.error('Failed to pre-fetch menu tree', e));

  // Fetch combos
  api({ action: 'getCombos' }).then(res => {
    POS_STATE.combos = res.combos || [];
    renderCombosList();
  }).catch(e => console.error('Failed to fetch combos', e));

  // Fetch active table orders from Google Sheets on start
  try {
    const serverOrders = await apiDirect({ action: 'getTablesData' });
    if (serverOrders && !serverOrders.error) {
      // Preserve any active edits the user made while waiting for this fetch
      const currentTableOrder = POS_STATE.currentTableId ? POS_STATE.tableOrders[POS_STATE.currentTableId] : null;
      
      initializeLocalTableOrders(serverOrders);
      
      if (POS_STATE.currentTableId !== null && currentTableOrder) {
        POS_STATE.tableOrders[POS_STATE.currentTableId] = currentTableOrder;
      }
      
      localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
      
      if (POS_STATE.currentTableId === null) {
        showPosTables();
      } else {
        const activeParentId = (POS_STATE.posMenuHistory && POS_STATE.posMenuHistory.length > 0) 
          ? POS_STATE.posMenuHistory[POS_STATE.posMenuHistory.length - 1] 
          : 0;
        renderPosMenuLevel(activeParentId);
      }
      
      const kitchenSection = document.getElementById('sectionKitchen');
      if (kitchenSection && kitchenSection.classList.contains('active')) {
        renderKitchenView();
      }
    }
  } catch (e) {
    console.error('Failed to load table orders from server, using local fallback', e);
  }

  // Initialize occupiedSince helper timestamps for local state robustness
  if (POS_STATE.tableOrders) {
    let updated = false;
    for (let tableId in POS_STATE.tableOrders) {
      const order = POS_STATE.tableOrders[tableId];
      if (order && Object.keys(order).some(k => k !== 'occupiedSince' && order[k].qty > 0)) {
        if (!order.occupiedSince) {
          order.occupiedSince = Date.now();
          updated = true;
        }
      }
    }
    if (updated) {
      localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
    }
  }
  
  if (POS_STATE.currentTableId === null) {
    showPosTables();
  }

  // Start event-driven updates listener
  startTablesEventListener();
}

let tableSyncTimers = {};

function syncTableData(tableId) {
  if (tableSyncTimers[tableId]) {
    clearTimeout(tableSyncTimers[tableId]);
  }
  
  // Dispatch instant optimistic pub/sub update to other devices!
  const currentOrder = POS_STATE.tableOrders[tableId] || {};
  const currentItems = getOrderItemsArray(currentOrder);
  notifyTableUpdate(tableId, currentItems.length > 0 ? currentOrder : {});
  
  tableSyncTimers[tableId] = setTimeout(async () => {
    delete tableSyncTimers[tableId];
    try {
      const order = POS_STATE.tableOrders[tableId] || {};
      const items = getOrderItemsArray(order);
      const hasItems = items.length > 0;
      
      if (hasItems) {
        let grandTotal = 0;
        items.forEach(item => {
          if (item.status !== 'Cancelled') {
            grandTotal += (item.qty * item.price);
          }
        });
        
        await apiDirect({
          action: 'saveTableData',
          tableId: tableId,
          orderItemsJson: JSON.stringify(order),
          occupiedSince: order.occupiedSince || '',
          grandTotal: grandTotal
        });
      } else {
        await apiDirect({
          action: 'clearTableData',
          tableId: tableId
        });
      }
    } catch (e) {
      console.error('Failed to sync table ' + tableId + ' to backend', e);
    }
  }, 1000);
}

function updateTableTimers() {
  const view = document.getElementById('posTablesView');
  if (!view || view.classList.contains('hidden')) return;
  
  const updateTimerElement = (uniqueId) => {
    const timerEl = document.getElementById(`table-timer-${uniqueId}`);
    if (!timerEl) return;
    
    const order = POS_STATE.tableOrders[uniqueId];
    const items = getOrderItemsArray(order);
    const hasOrder = order && items.some(i => i.qty > 0 && i.status !== 'Cancelled');
    
    if (hasOrder && order.occupiedSince) {
      const elapsedMs = Date.now() - order.occupiedSince;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const hrs = Math.floor(elapsedSec / 3600);
      const mins = Math.floor((elapsedSec % 3600) / 60);
      const secs = elapsedSec % 60;
      
      const pad = (num) => String(num).padStart(2, '0');
      const timeStr = hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
      
      timerEl.textContent = `⏱️ ${timeStr}`;
      timerEl.style.display = 'inline-flex';
    } else {
      timerEl.textContent = '';
      timerEl.style.display = 'none';
    }
  };

  if (POS_STATE.tableCategories && POS_STATE.tableCategories.length > 0) {
    POS_STATE.tableCategories.forEach(cat => {
      const count = Number(cat.count) || 0;
      for (let i = 1; i <= count; i++) {
        updateTimerElement(`table_${cat.id}_${i}`);
      }
    });
  } else {
    for (let i = 1; i <= POS_STATE.tableCount; i++) {
      updateTimerElement(i);
    }
  }
}

// Start updating table timers globally every second
if (!window.tableTimerInterval) {
  window.tableTimerInterval = setInterval(updateTableTimers, 1000);
}

function createTableCard(uniqueId, displayNum, categoryName) {
  const card = document.createElement('div');
  card.onclick = () => openPosTable(uniqueId);
  card.setAttribute('data-table-id', uniqueId);
  
  const order = POS_STATE.tableOrders[uniqueId];
  const items = getOrderItemsArray(order);
  const hasOrder = order && items.some(i => i.qty > 0 && i.status !== 'Cancelled');
  
  if (hasOrder) {
    card.className = 'pos-table-card occupied';
    
    let totalBill = 0;
    const itemList = [];
    items.forEach(item => {
      if (item.status === 'Cancelled') return;
      if (item.qty > 0) {
        itemList.push(`${item.qty}x ${item.name}`);
        totalBill += (item.qty * item.price);
      }
    });
    
    const itemsSummary = itemList.join(', ');
    
    card.innerHTML = `
      <div class="table-card-header">
        <span class="table-badge occupied">Occupied</span>
        <span class="table-bill-total">₹${totalBill}</span>
      </div>
      <div class="table-card-body">
        <div class="table-icon"><img src="occupied.png" alt="Occupied"></div>
        <div class="table-name">Table ${displayNum}</div>
        <div class="table-timer" id="table-timer-${uniqueId}">⏱️ --:--</div>
      </div>
      ${itemsSummary ? `<div class="table-items-list"><div class="table-items-summary" title="${itemsSummary}">${itemsSummary}</div></div>` : ''}
    `;
  } else {
    card.className = 'pos-table-card free';
    card.innerHTML = `
      <div class="table-card-header">
        <span class="table-badge free">Free</span>
        <span></span>
      </div>
      <div class="table-card-body">
        <div class="table-icon"><img src="free.png" alt="Free"></div>
        <div class="table-name">Table ${displayNum}</div>
        <div class="table-timer" id="table-timer-${uniqueId}" style="display: none;"></div>
      </div>
    `;
  }
  return card;
}

function showPosTables() {
  const searchBox = document.getElementById('navbarSearchContainer');
  if (searchBox) searchBox.style.display = 'none';

  POS_STATE.currentTableId = null;
  hide('posMenuDrilldownView');
  hide('posLiveTablesReportView');
  show('posTablesView');
  
  const container = document.getElementById('posTablesGrid');
  container.innerHTML = '';
  
  if (POS_STATE.tableCount === 0) {
    container.style.display = 'grid'; // Restore grid
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No tables configured. Please configure in Admin.</p>';
    return;
  }
  
  if (POS_STATE.tableCategories && POS_STATE.tableCategories.length > 0) {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '2rem';
    
    POS_STATE.tableCategories.forEach(cat => {
      const section = document.createElement('div');
      section.className = 'table-category-group';
      
      const title = document.createElement('h3');
      title.className = 'table-category-group-title';
      title.style.fontSize = '1.25rem';
      title.style.fontWeight = '700';
      title.style.color = 'var(--text-secondary)';
      title.style.marginBottom = '1rem';
      title.textContent = cat.name;
      section.appendChild(title);
      
      const grid = document.createElement('div');
      grid.className = 'pos-tables-grid';
      
      const count = Number(cat.count) || 0;
      for (let i = 1; i <= count; i++) {
        const uniqueId = `table_${cat.id}_${i}`;
        const card = createTableCard(uniqueId, i, cat.name);
        grid.appendChild(card);
      }
      
      section.appendChild(grid);
      container.appendChild(section);
    });
  } else {
    // Fallback if no categories
    container.style.display = 'grid'; // Restore grid
    for (let i = 1; i <= POS_STATE.tableCount; i++) {
      const card = createTableCard(i, i, 'General');
      container.appendChild(card);
    }
  }
  updateTableTimers();
  updateIntegrationDockVisibility();
}

async function openLiveTablesReport() {
  hide('posTablesView');
  show('posLiveTablesReportView');
  
  const content = document.getElementById('posLiveTablesReportContent');
  if (content) {
    content.innerHTML = `
      <p style="text-align:center; padding: 3rem 0; color:var(--text-secondary);">
        <span class="spinner" style="border-top-color:var(--brand-primary); display:inline-block; width:1.5rem; height:1.5rem; vertical-align:middle; margin-right:0.5rem;"></span>
        Fetching latest table data from database...
      </p>
    `;
  }
  
  try {
    const res = await apiDirect({ action: 'getTablesData' });
    if (res && !res.error) {
      POS_STATE.tableOrders = res;
      localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
      renderLiveTablesReportContent();
    } else {
      if (content) {
        content.innerHTML = `<p style="text-align:center; color:var(--brand-primary); padding: 2rem 0;">Error loading tables data from server.</p>`;
      }
    }
  } catch (err) {
    console.error('Failed to load live tables report', err);
    if (content) {
      content.innerHTML = `<p style="text-align:center; color:var(--brand-primary); padding: 2rem 0;">Failed to connect to database.</p>`;
    }
  }
}

function closeLiveTablesReport() {
  hide('posLiveTablesReportView');
  show('posTablesView');
  showPosTables();
}

function renderLiveTablesReportContent() {
  const content = document.getElementById('posLiveTablesReportContent');
  if (!content) return;
  content.innerHTML = '';
  
  const occupiedTables = [];
  
  if (POS_STATE.tableCategories && POS_STATE.tableCategories.length > 0) {
    POS_STATE.tableCategories.forEach(cat => {
      const count = Number(cat.count) || 0;
      for (let i = 1; i <= count; i++) {
        const uniqueId = `table_${cat.id}_${i}`;
        const order = POS_STATE.tableOrders[uniqueId];
        const items = getOrderItemsArray(order);
        if (order && items.some(item => item.qty > 0)) {
          occupiedTables.push({ id: uniqueId, displayNum: i, categoryName: cat.name, order: order });
        }
      }
    });
  } else {
    for (let i = 1; i <= POS_STATE.tableCount; i++) {
      const order = POS_STATE.tableOrders[i];
      const items = getOrderItemsArray(order);
      if (order && items.some(item => item.qty > 0)) {
        occupiedTables.push({ id: i, displayNum: i, categoryName: 'General', order: order });
      }
    }
  }
  
  if (occupiedTables.length === 0) {
    content.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:1.1rem; padding: 2.5rem 0;">No tables are currently occupied.</p>';
    return;
  }
  
  let html = `<div class="live-report-wrapper">`;
  let totalRevenue = 0;
  
  occupiedTables.forEach(item => {
    const tableId = item.id;
    const displayNum = item.displayNum;
    const categoryName = item.categoryName;
    const order = item.order;
    
    // Calculate elapsed time details
    let durationStr = 'N/A';
    let timeStr = 'N/A';
    if (order.occupiedSince) {
      const occupiedTime = new Date(order.occupiedSince);
      timeStr = occupiedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const elapsedMs = Date.now() - order.occupiedSince;
      const elapsedMins = Math.floor(elapsedMs / 60000);
      if (elapsedMins < 60) {
        durationStr = `${elapsedMins}m ago`;
      } else {
        const hrs = Math.floor(elapsedMins / 60);
        const mins = elapsedMins % 60;
        durationStr = `${hrs}h ${mins}m ago`;
      }
    }
    
    let tableBillTotal = 0;
    let itemsHtml = '';
    
    const items = getOrderItemsArray(order);
    const aggregatedItems = {};
    
    items.forEach(dish => {
      if (dish.status === 'Cancelled' || dish.qty <= 0) return;
      // Keyed by name and price
      const key = `${dish.name}_${dish.price}`;
      if (!aggregatedItems[key]) {
        aggregatedItems[key] = {
          name: dish.name,
          price: dish.price,
          qty: 0
        };
      }
      aggregatedItems[key].qty += dish.qty;
    });
    
    Object.keys(aggregatedItems).forEach(key => {
      const dish = aggregatedItems[key];
      const itemTotal = dish.qty * dish.price;
      tableBillTotal += itemTotal;
      
      itemsHtml += `
        <div class="report-item-row">
          <span class="report-item-qty">${dish.qty}x</span>
          <span class="report-item-name">${dish.name}</span>
          <span class="report-item-price">₹${dish.price} each</span>
          <span class="report-item-total">₹${itemTotal}</span>
        </div>
      `;
    });
    
    totalRevenue += tableBillTotal;
    
    html += `
      <div class="report-table-card glass-card mb-4">
        <div class="report-table-header">
          <h3 class="report-table-title">Table ${displayNum} <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-secondary);">(${categoryName})</span></h3>
          <div class="report-table-meta">
            <span class="report-meta-badge">Occupied since: ${timeStr} (${durationStr})</span>
          </div>
        </div>
        <div class="report-table-body">
          <div class="report-items-header">Items Summary:</div>
          <div class="report-items-list">
            ${itemsHtml}
          </div>
          <div class="report-table-footer">
            <span>Subtotal:</span>
            <span class="report-table-grand-total">₹${tableBillTotal}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  html += `
    <div class="report-summary-footer glass-card p-3 flex-between">
      <span class="report-summary-text">Total Active Tables: <strong>${occupiedTables.length}</strong></span>
      <span class="report-summary-revenue">Total Active Revenue: <strong>₹${totalRevenue}</strong></span>
    </div>
  </div>`;
  
  content.innerHTML = html;
}

// ══════════════════════════════════════
//  POS DYNAMIC MENU DRILL-DOWN
// ══════════════════════════════════════

async function openPosTable(tableId) {
  const searchBox = document.getElementById('navbarSearchContainer');
  if (searchBox) searchBox.style.display = 'block';

  POS_STATE.currentTableId = tableId;
  if (!POS_STATE.tableOrders[tableId]) {
    POS_STATE.tableOrders[tableId] = {};
  }
  
  hide('posTablesView');
  show('posMenuDrilldownView');
  
  if (!POS_STATE.menuTree || POS_STATE.menuTree.length === 0) {
    const grid = document.getElementById('posMenuGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
          <span class="spinner" style="width:36px; height:36px; border-width:3.5px; border-color: var(--brand-primary) transparent var(--brand-primary) transparent; animation: spin 1s linear infinite;"></span>
          <div style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.95rem; font-weight: 500;">Loading Menu Items...</div>
        </div>
      `;
    }
    try {
      const res = await api({ action: 'getMenuTree' });
      POS_STATE.menuTree = res.nodes || [];
    } catch (e) {
      toast('Failed to load menu', 'error');
    }
  }
  
  POS_STATE.posMenuHistory = []; // stack of parentIds
  
  const savedState = localStorage.getItem('ppp_order_panel_open');
  const shouldOpen = (savedState === null || savedState === 'true');
  togglePosOrderPanel(shouldOpen);
  
  renderPosMenuLevel(0);
  updateIntegrationDockVisibility();
}

function togglePosOrderPanel(forceState) {
  const panel = document.querySelector('.pos-order-panel');
  const layout = document.querySelector('.pos-table-layout');
  if (!panel) return;
  
  const isCurrentlyOpen = panel.classList.contains('open');
  const shouldOpen = (typeof forceState === 'boolean') ? forceState : !isCurrentlyOpen;
  
  if (shouldOpen) {
    panel.classList.add('open');
    if (layout) layout.classList.add('panel-open');
    localStorage.setItem('ppp_order_panel_open', 'true');
  } else {
    panel.classList.remove('open');
    if (layout) layout.classList.remove('panel-open');
    localStorage.setItem('ppp_order_panel_open', 'false');
  }
}

function renderPosMenuLevel(parentId) {
  const header = document.getElementById('posBreadcrumbHeader');
  const backBtn = document.getElementById('posBackLevelBtn');
  
  // Update History Stack
  if (parentId === 0) {
    POS_STATE.posMenuHistory = [0];
  } else {
    const idx = POS_STATE.posMenuHistory.indexOf(parentId);
    if (idx !== -1) {
      POS_STATE.posMenuHistory = POS_STATE.posMenuHistory.slice(0, idx + 1);
    } else {
      POS_STATE.posMenuHistory.push(parentId);
    }
  }
  
  // Render Breadcrumbs
  let breadcrumbHtml = `<span class="breadcrumb-item ${parentId === 0 ? 'active' : ''}" onclick="renderPosMenuLevel(0)">Menu</span>`;
  let currentId = 0;
  for (let i = 1; i < POS_STATE.posMenuHistory.length; i++) {
    currentId = POS_STATE.posMenuHistory[i];
    if (currentId === 'combos_virtual') {
      breadcrumbHtml += `<span class="breadcrumb-separator">/</span>`;
      const isActive = (i === POS_STATE.posMenuHistory.length - 1);
      breadcrumbHtml += `<span class="breadcrumb-item ${isActive ? 'active' : ''}" onclick="renderPosMenuLevel('combos_virtual')">Combos</span>`;
    } else {
      const node = POS_STATE.menuTree.find(n => n.index === currentId);
      if (node) {
        breadcrumbHtml += `<span class="breadcrumb-separator">/</span>`;
        const isActive = (i === POS_STATE.posMenuHistory.length - 1);
        breadcrumbHtml += `<span class="breadcrumb-item ${isActive ? 'active' : ''}" onclick="renderPosMenuLevel(${currentId})">${node.name}</span>`;
      }
    }
  }
  if (header) {
    header.innerHTML = `<div class="breadcrumb-wrapper">${breadcrumbHtml}</div>`;
  }
  
  if (backBtn) {
    backBtn.style.display = POS_STATE.posMenuHistory.length > 1 ? 'inline-block' : 'none';
  }
  
  // Clear search field since we are navigating folders
  const searchInput = document.getElementById('posMenuSearchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  const clearBtn = document.getElementById('btnClearPosSearch');
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  const dropdown = document.getElementById('posMenuSearchDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
  }

  renderPosMenuGrid();
}

function handlePosMenuSearch() {
  const input = document.getElementById('posMenuSearchInput');
  const query = input ? input.value.toLowerCase().trim() : '';
  const clearBtn = document.getElementById('btnClearPosSearch');
  const dropdown = document.getElementById('posMenuSearchDropdown');
  
  if (clearBtn) {
    clearBtn.style.display = query ? 'block' : 'none';
  }
  
  if (!dropdown) return;
  
  if (!query) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }
  
  // Search matching leaf nodes or combos (name or keyword)
  const matches = POS_STATE.menuTree.filter(node => {
    const isCombo = Number(node.parentIndex) === -1;
    const hasChildren = POS_STATE.menuTree.some(n => Number(n.parentIndex) === Number(node.index));
    const isLeaf = !hasChildren && (node.price !== null && node.price !== '');
    if (!isLeaf && !isCombo) return false;
    
    const nameMatch = node.name.toLowerCase().includes(query);
    const keywordMatch = node.keyword ? String(node.keyword).toLowerCase().includes(query) : false;
    return nameMatch || keywordMatch;
  });
  
  // Sort matches priority-wise:
  matches.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    const kwA = String(a.keyword || '').toLowerCase();
    const kwB = String(b.keyword || '').toLowerCase();
    
    const getScore = (name, kw) => {
      if (name.startsWith(query)) return 1;
      if (kw && kw.startsWith(query)) return 2;
      if (name.includes(' ' + query)) return 3;
      if (kw && kw.includes(' ' + query)) return 4;
      if (name.includes(query)) return 5;
      if (kw && kw.includes(query)) return 6;
      return 99;
    };
    
    const scoreA = getScore(nameA, kwA);
    const scoreB = getScore(nameB, kwB);
    
    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }
    
    return Number(a.index) - Number(b.index);
  });
  
  if (matches.length === 0) {
    dropdown.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No items found.</div>';
    dropdown.style.display = 'block';
    return;
  }
  
  const order = POS_STATE.tableOrders[POS_STATE.currentTableId];
  const orderItems = getOrderItemsArray(order);
  
  dropdown.innerHTML = '';
  matches.forEach(node => {
    const itemRow = document.createElement('div');
    itemRow.className = 'pos-search-dropdown-item';
    
    const isCombo = Number(node.parentIndex) === -1;
    if (isCombo) {
      itemRow.innerHTML = `
        <div class="item-details" style="cursor:pointer; flex:1;">
          <div class="item-name" style="color: #ec4899; font-weight:700;">🎁 ${node.name} (Combo)</div>
          <div class="item-price" style="color: var(--text-secondary); font-size:0.8rem;">Select package to customize</div>
        </div>
        <button class="btn btn--primary btn--sm" onclick="startComboResolution('${node.index}'); event.stopPropagation();" style="border-radius:20px; font-size:0.75rem; background:linear-gradient(135deg,#db2777,#ec4899); border:none; padding:0.35rem 0.75rem; cursor:pointer;">
          Select
        </button>
      `;
      itemRow.style.cursor = 'pointer';
      itemRow.onclick = () => {
        startComboResolution(node.index);
        dropdown.style.display = 'none';
      };
    } else {
      let currentQty = 0;
      if (orderItems) {
        currentQty = orderItems.filter(i => i.nodeIndex === node.index && i.status !== 'Cancelled').reduce((sum, i) => sum + i.qty, 0);
      }
      
      const safeName = node.name.replace(/'/g, "\\'");
      itemRow.innerHTML = `
        <div class="item-details" style="flex:1;">
          <div class="item-name">${node.name}</div>
          <div class="item-price">₹${node.price}</div>
        </div>
        <div class="qty-selector">
          <button class="qty-btn" onclick="updatePosItemQty(${node.index}, '${safeName}', ${node.price}, -1); event.stopPropagation();">-</button>
          <div class="qty-display" id="qty-search-item-${node.index}">${currentQty}</div>
          <button class="qty-btn" onclick="updatePosItemQty(${node.index}, '${safeName}', ${node.price}, 1); event.stopPropagation();">+</button>
        </div>
      `;
    }
    dropdown.appendChild(itemRow);
  });
  
  dropdown.style.display = 'block';
}

function clearPosMenuSearch() {
  const input = document.getElementById('posMenuSearchInput');
  if (input) {
    input.value = '';
  }
  handlePosMenuSearch();
}

function renderPosMenuGrid() {
  const grid = document.getElementById('posMenuGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const parentId = POS_STATE.posMenuHistory[POS_STATE.posMenuHistory.length - 1] || 0;
  
  const children = POS_STATE.menuTree.filter(n => Number(n.parentIndex) === Number(parentId)).sort((a, b) => a.index - b.index);

  if (children.length === 0 && parentId !== 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color: var(--text-secondary);">Empty.</p>';
    return;
  }
  
  const order = POS_STATE.tableOrders[POS_STATE.currentTableId];
  const orderItems = getOrderItemsArray(order);

  children.forEach(node => {
    const hasChildren = POS_STATE.menuTree.some(n => Number(n.parentIndex) === Number(node.index));
    const isLeaf = !hasChildren && (node.price !== null && node.price !== '');
    const card = document.createElement('div');
    
    // Determine qty
    let currentQty = 0;
    if (orderItems) {
      currentQty = orderItems.filter(i => i.nodeIndex === node.index && i.status !== 'Cancelled').reduce((sum, i) => sum + i.qty, 0);
    }
    
    if (isLeaf) {
      card.id = `pos-item-card-${node.index}`;
      card.className = 'pos-dish-card ' + (currentQty > 0 ? 'active' : '');
      
      let badgeHtml = '<span></span>';
      if (currentQty > 0) {
        // Build status summary string
        const counts = { Pending: 0, Preparing: 0, Ready: 0, Served: 0 };
        orderItems.filter(i => i.nodeIndex === node.index && i.status !== 'Cancelled').forEach(i => {
          counts[i.status] += i.qty;
        });
        
        let summaryParts = [];
        if (counts.Pending > 0) summaryParts.push(`${counts.Pending} P`);
        if (counts.Preparing > 0) summaryParts.push(`${counts.Preparing} Pr`);
        if (counts.Ready > 0) summaryParts.push(`${counts.Ready} Rd 🟢`);
        if (counts.Served > 0) summaryParts.push(`${counts.Served} S`);
        
        badgeHtml = `<span class="table-badge active" style="font-size:0.75rem; padding: 0.15rem 0.4rem;">${summaryParts.join(', ')}</span>`;
      }
      
      const safeName = node.name.replace(/'/g, "\\'");
      card.innerHTML = `
        <div class="table-card-header">
          ${badgeHtml}
        </div>
        <div class="dish-card-body">
          <div class="pos-dish-info" onclick="updatePosItemQty(${node.index}, '${safeName}', ${node.price}, 1)">
            <div class="pos-dish-name">${node.name}</div>
            <div class="pos-dish-price">₹${node.price}</div>
          </div>
          <div class="qty-selector">
            <button class="qty-btn" onclick="updatePosItemQty(${node.index}, '${safeName}', ${node.price}, -1)">-</button>
            <div class="qty-display" id="qty-item-${node.index}">${currentQty}</div>
            <button class="qty-btn" onclick="updatePosItemQty(${node.index}, '${safeName}', ${node.price}, 1)">+</button>
          </div>
        </div>
      `;
    } else {
      // Folder indicator
      let totalChildrenQty = 0;
      if (orderItems) {
        // Find descendants
        const descendants = getDescendantNodeIds(node.index, POS_STATE.menuTree);
        descendants.forEach(dIdx => {
          totalChildrenQty += orderItems.filter(i => i.nodeIndex === dIdx && i.status !== 'Cancelled').reduce((sum, i) => sum + i.qty, 0);
        });
      }
      card.className = 'pos-category-card' + (totalChildrenQty > 0 ? ' active' : '');
      card.innerHTML = `
        <div class="table-card-header">
          ${totalChildrenQty > 0 ? '<span class="table-badge active">' + totalChildrenQty + ' Selected</span>' : '<span></span>'}
        </div>
        <div class="category-card-body" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div class="category-name" style="text-align: center;">${node.name}</div>
        </div>
      `;
      card.onclick = () => renderPosMenuLevel(node.index);
    }
    
    grid.appendChild(card);
  });

  // Render Combos directly below root categories
  if (parentId === 0 && POS_STATE.combos && POS_STATE.combos.length > 0) {
    const div = document.createElement('h2');
    div.className = 'hero-title';
    div.style.gridColumn = '1 / -1';
    div.style.margin = '2rem 0 1rem';
    div.style.textAlign = 'left';
    div.style.width = '100%';
    div.textContent = 'Combos';
    grid.appendChild(div);

    POS_STATE.combos.forEach(combo => {
      const card = document.createElement('div');
      card.className = 'pos-dish-card';
      card.style.cursor = 'pointer';
      card.onclick = () => startComboResolution(combo.id);
      
      card.innerHTML = `
        <div class="table-card-header"></div>
        <div class="dish-card-body" style="display:flex; flex-direction:column; justify-content:center; height:100%; min-height:85px;">
          <div class="pos-dish-info" style="margin-bottom: 0;">
            <div class="pos-dish-name" style="font-weight:700; margin-bottom: 0;">${combo.name}</div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  renderPosOrderPanel();
}

function renderPosOrderPanel() {
  const tableId = POS_STATE.currentTableId;
  if (!tableId) return;
  
  const titleEl = document.getElementById('posOrderPanelTableTitle');
  const countEl = document.getElementById('posOrderPanelItemCount');
  const itemsBody = document.getElementById('posOrderPanelItems');
  const totalEl = document.getElementById('posOrderPanelTotal');
  
  if (!itemsBody) return;
  
  // Format table display name
  let displayName = tableId;
  if (tableId.startsWith('table_')) {
    const parts = tableId.split('_');
    displayName = `Table ${parts[2]} (${parts[1]})`;
  } else {
    displayName = `Table ${tableId}`;
  }
  
  if (titleEl) titleEl.textContent = displayName;
  
  const order = POS_STATE.tableOrders[tableId] || {};
  const orderItems = getOrderItemsArray(order);
  
  // Aggregate active items by nodeIndex
  const aggregated = {};
  let grandTotal = 0;
  let totalItemCount = 0;
  
  if (orderItems && orderItems.length > 0) {
    orderItems.forEach(item => {
      if (item.status === 'Cancelled') return;
      if (!aggregated[item.nodeIndex]) {
        aggregated[item.nodeIndex] = {
          nodeIndex: item.nodeIndex,
          name: item.name,
          price: item.price,
          qty: 0,
          statuses: { Pending: 0, Preparing: 0, Ready: 0, Served: 0 }
        };
      }
      aggregated[item.nodeIndex].qty += item.qty;
      aggregated[item.nodeIndex].statuses[item.status] = (aggregated[item.nodeIndex].statuses[item.status] || 0) + item.qty;
      grandTotal += (item.qty * item.price);
      totalItemCount += item.qty;
    });
  }
  
  if (countEl) countEl.textContent = `${totalItemCount} item${totalItemCount !== 1 ? 's' : ''}`;
  if (totalEl) totalEl.textContent = `₹${grandTotal}`;
  
  const headerCountEl = document.getElementById('posHeaderItemCount');
  if (headerCountEl) headerCountEl.textContent = totalItemCount;
  
  itemsBody.innerHTML = '';
  
  const keys = Object.keys(aggregated);
  if (keys.length === 0) {
    itemsBody.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
        <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;">🛒</div>
        <div style="font-weight: 500;">No items added yet.</div>
        <div style="font-size: 0.8rem; margin-top: 0.25rem;">Select dishes from the menu to start ordering.</div>
      </div>
    `;
    return;
  }
  
  keys.forEach(nodeIdx => {
    const item = aggregated[nodeIdx];
    const row = document.createElement('div');
    row.className = 'order-panel-item-row';
    
    const safeName = item.name.replace(/'/g, "\\'");
    const lineTotal = item.qty * item.price;
    
    // Status summary
    let summaryParts = [];
    if (item.statuses.Pending > 0) summaryParts.push(`${item.statuses.Pending} P`);
    if (item.statuses.Preparing > 0) summaryParts.push(`${item.statuses.Preparing} Pr`);
    if (item.statuses.Ready > 0) summaryParts.push(`${item.statuses.Ready} Rd 🟢`);
    if (item.statuses.Served > 0) summaryParts.push(`${item.statuses.Served} S`);
    const statusBadge = summaryParts.length > 0 ? `<span class="table-badge active" style="font-size:0.65rem; padding: 0.1rem 0.35rem; margin-left: 0.35rem;">${summaryParts.join(', ')}</span>` : '';
    
    row.innerHTML = `
      <div class="order-panel-item-info">
        <div class="order-panel-item-name">${item.name}${statusBadge}</div>
        <div class="order-panel-item-price">₹${item.price} × ${item.qty} = ₹${lineTotal}</div>
      </div>
      <div class="order-panel-item-controls">
        <button class="qty-btn" onclick="updatePosItemQty(${item.nodeIndex}, '${safeName}', ${item.price}, -1)">-</button>
        <div class="qty-display" id="qty-panel-item-${item.nodeIndex}">${item.qty}</div>
        <button class="qty-btn" onclick="updatePosItemQty(${item.nodeIndex}, '${safeName}', ${item.price}, 1)">+</button>
      </div>
    `;
    itemsBody.appendChild(row);
  });
}

function getDescendantNodeIds(parentId, allNodes) {
  let ids = [];
  allNodes.forEach(n => {
    if (n.parentIndex === parentId) {
      ids.push(n.index);
      ids = ids.concat(getDescendantNodeIds(n.index, allNodes));
    }
  });
  return ids;
}

function navigatePosMenuBack() {
  if (POS_STATE.posMenuHistory.length > 1) {
    POS_STATE.posMenuHistory.pop();
    const prevId = POS_STATE.posMenuHistory[POS_STATE.posMenuHistory.length - 1];
    renderPosMenuLevel(prevId);
  }
}

function getOrderItemsArray(order) {
  if (!order) return [];
  if (Array.isArray(order.items)) {
    // Unroll items with qty > 1 to individual line items of qty 1 for display & status tracking
    const normalized = [];
    order.items.forEach(item => {
      const qty = Number(item.qty) || 1;
      if (qty > 1) {
        for (let q = 0; q < qty; q++) {
          normalized.push({
            id: `${item.id}_${q}`,
            nodeIndex: item.nodeIndex,
            name: item.name,
            price: item.price,
            qty: 1,
            status: item.status || 'Pending',
            flavour: item.flavour || ''
          });
        }
      } else {
        normalized.push({
          ...item,
          qty: 1,
          status: item.status || 'Pending'
        });
      }
    });
    return normalized;
  }
  // Convert legacy flat format to array format
  const items = [];
  Object.keys(order).forEach(key => {
    if (key.startsWith('item-') && order[key] && order[key].qty > 0) {
      const nodeIndex = Number(key.replace('item-', ''));
      const qty = Number(order[key].qty) || 0;
      for (let q = 0; q < qty; q++) {
        items.push({
          id: `line_${nodeIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${q}`,
          nodeIndex: nodeIndex,
          name: order[key].name,
          price: order[key].price,
          qty: 1,
          status: order[key].status || 'Pending'
        });
      }
      delete order[key];
    }
  });
  order.items = items;
  return items;
}

function updatePosItemQty(nodeIndex, name, price, delta) {
  const order = POS_STATE.tableOrders[POS_STATE.currentTableId];
  if (!order) return;
  
  const items = getOrderItemsArray(order);
  const hasItemsBefore = items.some(i => i.qty > 0 && i.status !== 'Cancelled');
  
  if (delta > 0) {
    for (let d = 0; d < delta; d++) {
      items.push({
        id: `line_${nodeIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${d}`,
        nodeIndex: nodeIndex,
        name: name,
        price: price,
        qty: 1,
        status: 'Pending'
      });
    }
  } else if (delta < 0) {
    let remainingToCancel = Math.abs(delta);
    
    // Prioritize decrementing in order: Pending -> Preparing -> Ready -> Served
    const priorityOrder = ['Pending', 'Preparing', 'Ready', 'Served'];
    for (const status of priorityOrder) {
      while (remainingToCancel > 0) {
        const line = items.find(i => i.nodeIndex === nodeIndex && i.status === status);
        if (!line) break;
        
        if (status === 'Pending') {
          remainingToCancel -= line.qty;
          const idx = items.indexOf(line);
          if (idx !== -1) items.splice(idx, 1);
        } else {
          // Keep item in log but flag as Cancelled
          line.status = 'Cancelled';
          remainingToCancel -= 1;
        }
      }
    }
  }
  
  // Re-serialize items
  order.items = items;
  
  const hasItemsAfter = items.some(i => i.qty > 0 && i.status !== 'Cancelled');
  
  if (hasItemsAfter && !hasItemsBefore) {
    order.occupiedSince = Date.now();
  } else if (!hasItemsAfter) {
    delete order.occupiedSince;
  }
  
  localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
  syncTableData(POS_STATE.currentTableId);
  
  // Re-render the specific item card by recalculating total qty
  const totalQty = items.filter(i => i.nodeIndex === nodeIndex).reduce((sum, i) => sum + i.qty, 0);
  const qtyDisplay = document.getElementById(`qty-item-${nodeIndex}`);
  if (qtyDisplay) qtyDisplay.textContent = totalQty;
  
  const qtySearchDisplay = document.getElementById(`qty-search-item-${nodeIndex}`);
  if (qtySearchDisplay) qtySearchDisplay.textContent = totalQty;
  
  const cardElement = document.getElementById(`pos-item-card-${nodeIndex}`);
  if (cardElement) {
    const header = cardElement.querySelector('.table-card-header');
    if (totalQty > 0) {
      cardElement.classList.add('active');
      if (header) {
        // Build status summary string
        const counts = { Pending: 0, Preparing: 0, Ready: 0, Served: 0 };
        items.filter(i => i.nodeIndex === nodeIndex).forEach(i => {
          counts[i.status] += i.qty;
        });
        
        let summaryParts = [];
        if (counts.Pending > 0) summaryParts.push(`${counts.Pending} P`);
        if (counts.Preparing > 0) summaryParts.push(`${counts.Preparing} Pr`);
        if (counts.Ready > 0) summaryParts.push(`${counts.Ready} Rd 🟢`);
        if (counts.Served > 0) summaryParts.push(`${counts.Served} S`);
        
        header.innerHTML = `<span class="table-badge active" style="font-size:0.75rem; padding: 0.15rem 0.4rem;">${summaryParts.join(', ')}</span>`;
      }
    } else {
      cardElement.classList.remove('active');
      if (header) header.innerHTML = '<span></span>';
    }
  }

  renderPosOrderPanel();
}

function generateBill() {
  const order = POS_STATE.tableOrders[POS_STATE.currentTableId];
  const orderItems = getOrderItemsArray(order);
  if (!orderItems || orderItems.length === 0) {
    return toast('No dishes added to the table.', 'error');
  }
  
  let grandTotal = 0;
  const tbody = document.getElementById('billTableBody');
  tbody.innerHTML = '';
  
  // Aggregate items by nodeIndex
  const aggregated = {};
  orderItems.forEach(item => {
    if (item.status === 'Cancelled') return;
    if (!aggregated[item.nodeIndex]) {
      aggregated[item.nodeIndex] = {
        name: item.name,
        price: item.price,
        qty: 0
      };
    }
    aggregated[item.nodeIndex].qty += item.qty;
  });
  
  let hasItems = false;
  Object.keys(aggregated).forEach(nodeIdx => {
    const dish = aggregated[nodeIdx];
    if (dish.qty > 0) {
      hasItems = true;
      const total = dish.qty * dish.price;
      grandTotal += total;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dish.name}</td>
        <td style="text-align: center;">${dish.qty}</td>
        <td>₹${dish.price}</td>
        <td style="font-weight: 700;">₹${total}</td>
      `;
      tbody.appendChild(tr);
    }
  });
  
  if (!hasItems) {
    return toast('No dishes added to the table.', 'error');
  }
  
  document.getElementById('billGrandTotal').textContent = '₹' + grandTotal;
  POS_STATE.currentBillTotal = grandTotal;
  
  const proceedBtn = document.getElementById('btnProceedCheckout');
  if (proceedBtn) {
    proceedBtn.disabled = false;
    proceedBtn.innerHTML = 'Proceed';
  }
  
  document.getElementById('modalBill').classList.add('open');
}

function closeBillModal() {
  document.getElementById('modalBill').classList.remove('open');
}

function getNodeCategoryName(nodeIndex) {
  if (!POS_STATE.menuTree || POS_STATE.menuTree.length === 0) return 'Menu';
  const node = POS_STATE.menuTree.find(n => n.index === nodeIndex);
  if (!node) return 'Menu';
  
  // Find immediate parent node in POS_STATE.menuTree
  const parent = POS_STATE.menuTree.find(n => n.index === node.parentIndex);
  if (parent) {
    return parent.name;
  }
  return 'Menu';
}

async function proceedToCheckout() {
  const proceedBtn = document.getElementById('btnProceedCheckout');
  if (proceedBtn) {
    if (proceedBtn.disabled) return;
    proceedBtn.disabled = true;
    proceedBtn.innerHTML = '<span class="spinner"></span> Proceeding...';
  }

  closeBillModal();
  
  const order = POS_STATE.tableOrders[POS_STATE.currentTableId];
  const orderItems = getOrderItemsArray(order);
  const pendingItems = [];
  
  if (orderItems && orderItems.length > 0) {
    const aggregated = {};
    orderItems.forEach(item => {
      if (item.status === 'Cancelled') return;
      if (!aggregated[item.nodeIndex]) {
        aggregated[item.nodeIndex] = {
          name: item.name,
          price: item.price,
          qty: 0,
          categoryName: getNodeCategoryName(item.nodeIndex)
        };
      }
      aggregated[item.nodeIndex].qty += item.qty;
    });
    
    Object.keys(aggregated).forEach(nodeIdx => {
      const item = aggregated[nodeIdx];
      if (item.qty > 0) {
        pendingItems.push({
          categoryName: item.categoryName,
          dishName: item.name,
          flavour: '',
          qty: item.qty,
          price: item.price || 0
        });
      }
    });
  }
  localStorage.setItem('ppp_pendingOrderItems', JSON.stringify(pendingItems));

  // Save total for loyalty form pre-fill
  window.PENDING_POS_TOTAL = POS_STATE.currentBillTotal;
  
  // Capture table ID before state gets reset
  const tableIdToClear = POS_STATE.currentTableId;
  
  // Cancel any pending debounced syncs for this table to prevent race condition revivals
  if (typeof tableSyncTimers !== 'undefined' && tableSyncTimers[tableIdToClear]) {
    clearTimeout(tableSyncTimers[tableIdToClear]);
    delete tableSyncTimers[tableIdToClear];
  }
  
  // Clear the table order
  POS_STATE.tableOrders[tableIdToClear] = {};
  localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
  
  // Clear table order from Google Sheets immediately
  try {
    notifyTableUpdate(tableIdToClear, {});
    await apiDirect({
      action: 'clearTableData',
      tableId: tableIdToClear
    });
  } catch (err) {
    console.error('Failed to clear table order on server', err);
  }
  
  // Clear any existing Loyalty Rewards entry data/state in localStorage and UI
  localStorage.removeItem('ppp_loyalty_form_open');
  localStorage.removeItem('ppp_loyalty_mobile');
  localStorage.removeItem('ppp_loyalty_amount');
  localStorage.removeItem('ppp_loyalty_message');

  // Reset the UI inputs and hide the card
  document.getElementById('inputMobile').value = '';
  document.getElementById('dispMobile').value = '';
  document.getElementById('inputAmount').value = '';
  document.getElementById('inputMessage').value = 'Thank You, Visit Again';
  hide('cardEntryForm');
  hide('rowWhatsapp');
  hide('rowDetailsBtn');
  
  // Reset the POS view back to the main table page
  showPosTables();

  // Switch to home section (Loyalty)
  showSection('home');
  
  // Highlight the mobile input for the user
  document.getElementById('inputMobile').focus();
  toast('Bill generated! Enter customer mobile to apply loyalty.', 'success');
}

async function clearActiveTableFromPOS() {
  const tableId = POS_STATE.currentTableId;
  if (!tableId) return;

  const order = POS_STATE.tableOrders[tableId];
  const items = getOrderItemsArray(order);
  const hasItems = items && items.some(i => i.qty > 0 && i.status !== 'Cancelled');
  if (!hasItems) {
    return toast('This table is already empty.', 'info');
  }

  if (!confirm('Are you sure you want to clear this table? All ordered items will be deleted, and the table will be freed.')) {
    return;
  }

  // Cancel any pending debounced syncs for this table
  if (typeof tableSyncTimers !== 'undefined' && tableSyncTimers[tableId]) {
    clearTimeout(tableSyncTimers[tableId]);
    delete tableSyncTimers[tableId];
  }

  // Clear local order state
  POS_STATE.tableOrders[tableId] = {};
  localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));

  // Sync clear state to server immediately
  try {
    notifyTableUpdate(tableId, {});
    await apiDirect({
      action: 'clearTableData',
      tableId: tableId
    });
    toast('Table cleared successfully', 'success');
  } catch (err) {
    console.error('Failed to clear table on server', err);
    toast('Cleared locally, but failed to sync to server', 'warning');
  }

  // Navigate back to the main table selection view
  showPosTables();
}

// ══════════════════════════════════════
//  POS ADMIN LOGIC
// ══════════════════════════════════════

function loadAdminTableCategories() {
  const tbody = document.getElementById('adminTableCategoriesTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!POS_STATE.tableCategories || POS_STATE.tableCategories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding: 1.5rem 0;">No sections configured.</td></tr>';
    return;
  }
  
  POS_STATE.tableCategories.forEach(cat => {
    const tr = document.createElement('tr');
    tr.id = `admin-table-cat-row-${cat.id}`;
    
    tr.innerHTML = `
      <td>
        <span class="view-mode-${cat.id}">${cat.name}</span>
        <input type="text" class="form-input edit-mode-${cat.id} hidden" value="${cat.name}" id="edit-table-cat-name-${cat.id}" style="width: 100%; max-width: 250px;" />
      </td>
      <td>
        <span class="view-mode-${cat.id}">${cat.count}</span>
        <input type="number" min="1" class="form-input edit-mode-${cat.id} hidden" value="${cat.count}" id="edit-table-cat-count-${cat.id}" style="width: 100%; max-width: 100px;" />
      </td>
      <td style="text-align: center;">
        <div class="view-mode-${cat.id} flex-row" style="justify-content: center; gap: 0.5rem;">
          <button class="btn btn--secondary btn--sm" onclick="editAdminTableCategory(${cat.id})">✏️ Edit</button>
          <button class="btn btn--danger btn--sm" onclick="deleteAdminTableCategory(${cat.id})">🗑️ Delete</button>
        </div>
        <div class="edit-mode-${cat.id} hidden flex-row" style="justify-content: center; gap: 0.5rem;">
          <button class="btn btn--success btn--sm" onclick="saveAdminTableCategoryEdit(${cat.id})">💾 Save</button>
          <button class="btn btn--outline btn--sm" onclick="cancelAdminTableCategoryEdit(${cat.id})">❌ Cancel</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function addAdminTableCategory() {
  const nameInput = document.getElementById('adminTableCategoryName');
  const countInput = document.getElementById('adminTableCategoryCount');
  if (!nameInput || !countInput) return;
  
  const name = nameInput.value.trim();
  const count = parseInt(countInput.value, 10);
  
  if (!name) return toast('Please enter a section name', 'error');
  if (isNaN(count) || count < 1) return toast('Please enter a valid table count (minimum 1)', 'error');
  
  let maxId = 0;
  if (POS_STATE.tableCategories && POS_STATE.tableCategories.length > 0) {
    POS_STATE.tableCategories.forEach(c => {
      if (c.id > maxId) maxId = c.id;
    });
  } else {
    POS_STATE.tableCategories = [];
  }
  
  const newCat = {
    id: maxId + 1,
    name: name,
    count: count
  };
  
  POS_STATE.tableCategories.push(newCat);
  
  // Calculate total tables
  let totalCount = 0;
  POS_STATE.tableCategories.forEach(c => {
    totalCount += c.count;
  });
  POS_STATE.tableCount = totalCount;
  
  try {
    await api({
      action: 'saveTableCategories',
      categoriesJson: JSON.stringify(POS_STATE.tableCategories)
    });
    
    // Clear form inputs
    nameInput.value = '';
    countInput.value = '';
    
    // Synchronize local table orders state with the updated category layout
    const serverOrders = await apiDirect({ action: 'getTablesData' });
    initializeLocalTableOrders(serverOrders);
    
    toast('Table section added', 'success');
    loadAdminTableCategories();
    invalidateLocalCache();
  } catch (e) {
    console.error(e);
    toast('Failed to add table section', 'error');
  }
}

function editAdminTableCategory(catId) {
  document.querySelectorAll(`.view-mode-${catId}`).forEach(el => el.classList.add('hidden'));
  document.querySelectorAll(`.edit-mode-${catId}`).forEach(el => el.classList.remove('hidden'));
}

function cancelAdminTableCategoryEdit(catId) {
  document.querySelectorAll(`.view-mode-${catId}`).forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll(`.edit-mode-${catId}`).forEach(el => el.classList.add('hidden'));
  loadAdminTableCategories();
}

async function saveAdminTableCategoryEdit(catId) {
  const newName = document.getElementById(`edit-table-cat-name-${catId}`).value.trim();
  const newCount = parseInt(document.getElementById(`edit-table-cat-count-${catId}`).value, 10);
  
  if (!newName) return toast('Please enter a section name', 'error');
  if (isNaN(newCount) || newCount < 1) return toast('Please enter a valid table count (minimum 1)', 'error');
  
  const cat = POS_STATE.tableCategories.find(c => c.id === catId);
  if (!cat) return;
  
  cat.name = newName;
  cat.count = newCount;
  
  // Calculate total tables
  let totalCount = 0;
  POS_STATE.tableCategories.forEach(c => {
    totalCount += c.count;
  });
  POS_STATE.tableCount = totalCount;
  
  try {
    await api({
      action: 'saveTableCategories',
      categoriesJson: JSON.stringify(POS_STATE.tableCategories)
    });
    
    const serverOrders = await apiDirect({ action: 'getTablesData' });
    initializeLocalTableOrders(serverOrders);
    
    toast('Table section updated', 'success');
    loadAdminTableCategories();
    invalidateLocalCache();
  } catch (e) {
    console.error(e);
    toast('Failed to update table section', 'error');
  }
}

async function deleteAdminTableCategory(catId) {
  if (!confirm('Are you sure you want to delete this table section? All unoccupied table data in it will be lost.')) return;
  
  POS_STATE.tableCategories = POS_STATE.tableCategories.filter(c => c.id !== catId);
  
  // Calculate total tables
  let totalCount = 0;
  POS_STATE.tableCategories.forEach(c => {
    totalCount += c.count;
  });
  POS_STATE.tableCount = totalCount;
  
  try {
    await api({
      action: 'saveTableCategories',
      categoriesJson: JSON.stringify(POS_STATE.tableCategories)
    });
    
    const serverOrders = await apiDirect({ action: 'getTablesData' });
    initializeLocalTableOrders(serverOrders);
    
    toast('Table section deleted', 'success');
    loadAdminTableCategories();
    invalidateLocalCache();
  } catch (e) {
    console.error(e);
    toast('Failed to delete table section', 'error');
  }
}

function invalidateLocalCache() {
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

// ══════════════════════════════════════
//  ADMIN MENU TREE (Dynamic Hierarchy)
// ══════════════════════════════════════

async function loadAdminMenuTree() {
  const container = document.getElementById('adminMenuTreeContainer');
  if (container) container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);"><span class="spinner"></span> Loading menu tree...</div>';
  
  try {
    const res = await api({ action: 'getMenuTree' });
    POS_STATE.menuTree = res.nodes || [];
    renderAdminMenuTree(POS_STATE.menuTree, 0, 'adminMenuTreeContainer');
  } catch (e) {
    console.error('Failed to load menu tree:', e);
    if (container) container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--danger);">Failed to load menu tree.</div>';
  }
}

function renderAdminMenuTree(nodes, parentId, containerId) {
  const children = nodes.filter(n => Number(n.parentIndex) === Number(parentId)).sort((a, b) => a.index - b.index);
  
  if (parentId === 0) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (children.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No menu items yet. Click "+ Add Root Category" to start.</div>';
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'tree-root';
    children.forEach(child => ul.appendChild(createAdminTreeNodeElement(child, nodes)));
    container.appendChild(ul);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'tree-children';
    children.forEach(child => ul.appendChild(createAdminTreeNodeElement(child, nodes)));
    return ul;
  }
}

function createAdminTreeNodeElement(node, allNodes) {
  const li = document.createElement('li');
  li.className = 'tree-node';
  li.dataset.nodeId = node.index;
  
  const hasChildren = allNodes.some(n => Number(n.parentIndex) === Number(node.index));
  const isLeaf = !hasChildren && (node.price !== null && node.price !== '');
  
  const card = document.createElement('div');
  card.className = 'tree-node-card ' + (isLeaf ? 'leaf-node' : 'folder-node');
  
  const info = document.createElement('div');
  info.className = 'node-info';
  
  const icon = document.createElement('span');
  icon.className = 'node-icon';
  icon.textContent = isLeaf ? '🏷️' : '📁';
  info.appendChild(icon);
  
  const name = document.createElement('span');
  name.className = 'node-name';
  name.textContent = node.name;
  info.appendChild(name);
  
  if (isLeaf) {
    const price = document.createElement('span');
    price.className = 'node-price';
    price.textContent = '₹' + node.price;
    info.appendChild(price);
    
    if (node.keyword) {
      const keywordBadge = document.createElement('span');
      keywordBadge.className = 'node-keyword-badge';
      keywordBadge.textContent = node.keyword;
      keywordBadge.style = 'font-size:0.75rem; background: var(--brand-glow); color: var(--brand-primary); padding: 0.15rem 0.4rem; border-radius: 6px; margin-left: 0.5rem; font-weight: 600;';
      info.appendChild(keywordBadge);
    }
  }
  
  card.appendChild(info);
  
  const actions = document.createElement('div');
  actions.className = 'node-actions';
  
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn--sm btn--primary';
  addBtn.textContent = '+ Add Child';
  addBtn.onclick = () => showAddMenuNodeModal(node.index);
  actions.appendChild(addBtn);
  
  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn--sm btn--secondary';
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => showEditMenuNodeModal(node.index, node.name, isLeaf ? node.price : '', isLeaf ? (node.keyword || '') : '');
  actions.appendChild(editBtn);
  
  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn--sm btn--danger';
  delBtn.textContent = 'Delete';
  delBtn.onclick = () => deleteMenuNode(node.index);
  actions.appendChild(delBtn);
  
  card.appendChild(actions);
  li.appendChild(card);
  
  if (hasChildren) {
    const childrenUl = renderAdminMenuTree(allNodes, node.index, null);
    if (childrenUl) {
      li.appendChild(childrenUl);
    }
  }
  
  return li;
}

function filterAdminMenuTree() {
  const searchTerm = document.getElementById('adminMenuTreeSearch').value.toLowerCase().trim();
  const treeNodes = document.querySelectorAll('.tree-node');
  
  if (!searchTerm) {
    treeNodes.forEach(node => {
      node.style.display = '';
      const ul = node.querySelector('.tree-children');
      if (ul) ul.style.display = '';
    });
    return;
  }
  
  // Hide all initially
  treeNodes.forEach(node => node.style.display = 'none');
  
  // Find matches and reveal them and their parents
  treeNodes.forEach(node => {
    const name = node.querySelector('.node-name').textContent.toLowerCase();
    if (name.includes(searchTerm)) {
      // Reveal this node
      node.style.display = '';
      
      // Reveal all ancestors
      let parent = node.parentElement;
      while (parent && (parent.classList.contains('tree-children') || parent.classList.contains('tree-root'))) {
        const parentNode = parent.closest('.tree-node');
        if (parentNode) {
          parentNode.style.display = '';
          parent.style.display = ''; // Ensure the ul is visible
        }
        parent = parent.parentElement;
      }
      
      // Reveal all descendants (optional, but good for folders)
      const descendantNodes = node.querySelectorAll('.tree-node');
      descendantNodes.forEach(dNode => dNode.style.display = '');
    }
  });
}

function showAddMenuNodeModal(parentId) {
  document.getElementById('addNodeParentId').value = parentId;
  document.getElementById('addNodeName').value = '';
  document.getElementById('addNodePrice').value = '';
  document.getElementById('addNodeKeyword').value = '';
  openModal('modalAddMenuNode');
}

async function submitAddMenuNode() {
  const parentId = document.getElementById('addNodeParentId').value;
  const name = document.getElementById('addNodeName').value.trim();
  const price = document.getElementById('addNodePrice').value.trim();
  const keyword = document.getElementById('addNodeKeyword').value.trim();
  
  if (!name) return toast('Node name is required', 'error');
  
  const modal = document.getElementById('modalAddMenuNode');
  const btn = modal.querySelector('.btn--primary');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Adding...';
  
  try {
    const res = await api({ action: 'addMenuNode', parentIndex: parentId, name: name, price: price, keyword: keyword });
    if (res && res.error) {
      toast('Failed to add node: ' + res.error, 'error');
    } else {
      toast('Node added successfully', 'success');
      closeModal('modalAddMenuNode');
      loadAdminMenuTree();
    }
  } catch (e) {
    toast('Failed to add node', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Add Node';
  }
}

function showEditMenuNodeModal(nodeId, name, price, keyword) {
  document.getElementById('editNodeId').value = nodeId;
  document.getElementById('editNodeName').value = name;
  document.getElementById('editNodePrice').value = price || '';
  document.getElementById('editNodeKeyword').value = keyword || '';
  openModal('modalEditMenuNode');
}

async function submitEditMenuNode() {
  const nodeId = document.getElementById('editNodeId').value;
  const name = document.getElementById('editNodeName').value.trim();
  const price = document.getElementById('editNodePrice').value.trim();
  const keyword = document.getElementById('editNodeKeyword').value.trim();
  
  if (!name) return toast('Node name is required', 'error');
  
  const modal = document.getElementById('modalEditMenuNode');
  const btn = modal.querySelector('.btn--primary');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving...';
  
  try {
    const res = await api({ action: 'updateMenuNode', index: nodeId, name: name, price: price, keyword: keyword });
    if (res && res.error) {
      toast('Failed to update node: ' + res.error, 'error');
    } else {
      toast('Node updated successfully', 'success');
      closeModal('modalEditMenuNode');
      loadAdminMenuTree();
    }
  } catch (e) {
    toast('Failed to update node', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save Changes';
  }
}

async function deleteMenuNode(nodeId) {
  if (!confirm('Are you sure you want to delete this node and ALL its children? This action cannot be undone.')) return;
  
  try {
    await api({ action: 'deleteMenuNode', index: nodeId });
    toast('Node deleted successfully', 'success');
    loadAdminMenuTree();
  } catch (e) {
    toast('Failed to delete node', 'error');
  }
}

async function loadBestSellers() {
  renderBestSellers();
}
async function loadDashboardData() {
  const overlay = document.getElementById('dashboardLoadingOverlay');
  if (overlay) overlay.classList.add('active');

  const container = document.getElementById('kpiStrip');
  if (container && (!ALL_ENTRIES_CACHE || ALL_ENTRIES_CACHE.length === 0)) {
    container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem;"><span class="spinner" style="border-top-color:var(--brand-primary)"></span> Loading dashboard analytics...</div>';
  }
  try {
    // If cache is empty, download cache first
    if (!ALL_ENTRIES_CACHE || ALL_ENTRIES_CACHE.length === 0) {
      await downloadSheetCache(true);
      ALL_ENTRIES_CACHE = getCacheItem('getAllEntries') || [];
    }
    
    ADMIN_DATA = await api({ action: 'getAdminData' });
    
    // Override Today's totals dynamically to keep Dashboard completely real-time
    const today = istDateStr();
    let todayCount = 0;
    let todayAmount = 0;
    ALL_ENTRIES_CACHE.forEach(e => {
      if (e.date === today) {
        todayCount += 1;
        todayAmount += (e.amount || 0);
      }
    });
    
    if (ADMIN_DATA) {
      ADMIN_DATA.todayCount = todayCount;
      ADMIN_DATA.todayAmount = todayAmount;
      
      // Also override total Amount overall
      let totalAmt = 0;
      ALL_ENTRIES_CACHE.forEach(e => totalAmt += (e.amount || 0));
      const totalLength = ALL_ENTRIES_CACHE.length;
      ADMIN_DATA.avgBilling = totalLength > 0 ? Math.round(totalAmt / totalLength) : 0;
      
      // Update overall totals
      ADMIN_DATA.totalVisits = Math.max(ADMIN_DATA.totalVisits, totalLength);
    }

    renderAllDashboardComponents();
  } catch (e) {
    console.error('Failed to load dashboard data', e);
    if (container) {
      container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--danger); padding: 2rem;">Error loading dashboard data.</div>';
    }
  } finally {
    // Hide overlay with a smooth transition
    setTimeout(() => {
      if (overlay) overlay.classList.remove('active');
    }, 600);
  }
}

async function loadAdminPOSConfig() {
  loadAdminMenuTree();
  
  try {
    const res = await api({ action: 'getTableCount' });
    POS_STATE.tableCount = res.count || 0;
    POS_STATE.tableCategories = res.categories || [];
    loadAdminTableCategories();
  } catch(e) {
    console.error('Failed to load table count in POS configuration', e);
  }

  // Prefill Loyalty Reward Settings inputs from current APP_CONFIG
  const inputMinAmount = document.getElementById('adminMinAmount');
  const inputCycle = document.getElementById('adminCycle');
  const inputRewardValue = document.getElementById('adminRewardValue');
  if (APP_CONFIG) {
    if (inputMinAmount) inputMinAmount.value = APP_CONFIG.minAmount !== undefined ? APP_CONFIG.minAmount : '';
    if (inputCycle) inputCycle.value = APP_CONFIG.cycle !== undefined ? APP_CONFIG.cycle : '';
    if (inputRewardValue) inputRewardValue.value = APP_CONFIG.rewardValue !== undefined ? APP_CONFIG.rewardValue : '';
  }

  // Sync reward system toggle state
  syncRewardToggleUI();

  // Load and render theme preset selection
  renderAdminThemePresets();
}

function syncRewardToggleUI() {
  const toggle = document.getElementById('adminRewardToggle');
  const badge = document.getElementById('rewardStatusBadge');
  if (!toggle || !badge) return;

  const isOn = APP_CONFIG ? APP_CONFIG.rewardSystemOn !== false : true;
  toggle.checked = isOn;
  badge.textContent = isOn ? '● Reward System is ON' : '● Reward System is OFF';
  badge.className = 'reward-status-badge ' + (isOn ? 'reward-status-on' : 'reward-status-off');
}

async function handleAdminToggleRewardSystem(checkbox) {
  const newStatus = checkbox.checked ? 1 : 0;
  const badge = document.getElementById('rewardStatusBadge');

  // Optimistic UI update
  if (badge) {
    badge.textContent = checkbox.checked ? '● Reward System is ON' : '● Reward System is OFF';
    badge.className = 'reward-status-badge ' + (checkbox.checked ? 'reward-status-on' : 'reward-status-off');
  }

  try {
    const result = await api({ action: 'updateRewardToggle', status: newStatus });
    if (result.error) {
      toast('Failed to update: ' + result.error, 'error');
      // Revert
      checkbox.checked = !checkbox.checked;
      syncRewardToggleUI();
      return;
    }

    // Update local config
    if (APP_CONFIG) {
      APP_CONFIG.rewardSystemOn = result.rewardSystemOn;
    }
    toast(result.rewardSystemOn ? '🎁 Reward System enabled!' : '🧾 Reward System disabled — bill-only mode active.', 'success');
  } catch (e) {
    toast('Error updating toggle: ' + e.message, 'error');
    // Revert on failure
    checkbox.checked = !checkbox.checked;
    syncRewardToggleUI();
  }
}

async function saveAdminRewardConfig() {
  const inputMinAmount = document.getElementById('adminMinAmount');
  const inputCycle = document.getElementById('adminCycle');
  const inputRewardValue = document.getElementById('adminRewardValue');
  const btn = document.getElementById('btnUpdateRewardConfig');

  if (!inputMinAmount || !inputCycle || !inputRewardValue) return;

  const minAmount = parseFloat(inputMinAmount.value);
  const cycle = parseInt(inputCycle.value, 10);
  const rewardValue = parseFloat(inputRewardValue.value);

  if (isNaN(minAmount) || minAmount < 0) {
    toast('Minimum Bill Amount must be a positive number.', 'error');
    return;
  }
  if (isNaN(cycle) || cycle < 1) {
    toast('Visits Cycle Length must be at least 1.', 'error');
    return;
  }
  if (isNaN(rewardValue) || rewardValue < 0) {
    toast('Reward Valuation Amount must be a positive number.', 'error');
    return;
  }

  // Set button loading state
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Saving...';
  }

  try {
    const res = await apiDirect({
      action: 'updateRewardConfig',
      minAmount: minAmount,
      cycle: cycle,
      rewardValue: rewardValue
    });

    if (res.error) {
      toast('Failed to update config: ' + res.error, 'error');
      return;
    }

    // Update in-memory config
    if (!APP_CONFIG) APP_CONFIG = {};
    APP_CONFIG.minAmount = res.minAmount;
    APP_CONFIG.cycle = res.cycle;
    APP_CONFIG.rewardValue = res.rewardValue;

    // Overwrite the local cache for getConfig
    setCacheItem('getConfig', APP_CONFIG);

    // Refresh UI label
    const label = document.getElementById('minAmtLabel');
    if (label) {
      label.textContent = res.minAmount;
    }

    toast('🎉 Loyalty settings updated successfully!', 'success');

    // Trigger dashboard and cache update in the background silently
    downloadSheetCache(true);
  } catch (err) {
    toast('Network error saving settings: ' + err.message, 'error');
    console.error(err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Save Configurations';
    }
  }
}

/* ══════════════════════════════════════════════════
   THIRD-PARTY INTEGRATION DOCK (resturant_partner)
═════════════════════════════════════════════════════ */

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('open');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    modal.classList.add('hidden');
  }
}

let INTEGRATION_LINKS = [];
let splitCurrentWidth = 40; // Default width percentage for the iframe panel

async function fetchIntegrationLinks() {
  try {
    const res = await api({ action: 'getIntegrationLinks' });
    if (res.links) {
      INTEGRATION_LINKS = res.links;
      renderIntegrationDock();
    }
  } catch (err) {
    console.error('Failed to fetch integration links', err);
  }
}

function toggleIntegrationDock(forceState) {
  const dock = document.getElementById('integrationDock');
  if (!dock) return;
  const isCurrentlyOpen = dock.classList.contains('open');
  const shouldOpen = (typeof forceState === 'boolean') ? forceState : !isCurrentlyOpen;
  
  if (shouldOpen) {
    dock.classList.add('open');
  } else {
    dock.classList.remove('open');
  }
}

function renderIntegrationDock() {
  const dock = document.getElementById('integrationDock');
  if (!dock) return;
  
  let itemsHtml = '';
  INTEGRATION_LINKS.forEach(link => {
    // Generate a favicon URL from Google's service
    const iconUrl = `https://www.google.com/s2/favicons?domain=${link.url}&sz=64`;
    itemsHtml += `
      <button class="dock-btn" onclick="openIntegration('${link.name}', '${link.url}'); toggleIntegrationDock(false);" title="${link.name}">
        <img src="${iconUrl}" alt="${link.name}" onerror="this.src=''; this.onerror=null; this.alt='🌐';">
      </button>
    `;
  });
  
  // Plus Button for Custom Websites
  itemsHtml += `
    <button class="dock-btn" onclick="openModal('modalAddIntegration'); toggleIntegrationDock(false);" title="Add Custom Website">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>
  `;
  
  dock.innerHTML = `
    <button class="dock-trigger-btn" onclick="toggleIntegrationDock(); event.stopPropagation();" title="Quick Integration Links">
      🌐
    </button>
    <div class="dock-items">
      ${itemsHtml}
    </div>
  `;
  
  // Also update the split-view header dropdown select if it exists
  const select = document.getElementById('splitIntegrationSelect');
  const activeTitle = (select && document.getElementById('splitIntegration')?.classList.contains('open'))
    ? (select.options[select.selectedIndex]?.text || '')
    : '';
  updateSplitIntegrationSelect(activeTitle);
}

function updateSplitIntegrationSelect(activeName) {
  const select = document.getElementById('splitIntegrationSelect');
  if (!select) return;
  
  let html = '';
  INTEGRATION_LINKS.forEach(link => {
    const selected = link.name === activeName ? 'selected' : '';
    html += `<option value="${link.url}" ${selected}>${link.name}</option>`;
  });
  select.innerHTML = html;
}

function handleSplitSelectChange(selectElem) {
  const url = selectElem.value;
  const name = selectElem.options[selectElem.selectedIndex].text;
  openIntegration(name, url);
}

function openIntegration(name, url) {
  toggleIntegrationDock(false);
  document.body.classList.add('split-active');
  
  const iframe = document.getElementById('splitIframe');
  const splitTitle = document.getElementById('splitTitle');
  const splitContainer = document.getElementById('splitIntegration');
  
  if (splitTitle) splitTitle.textContent = name;
  if (iframe) iframe.src = url;
  
  updateSplitIntegrationSelect(name);
  
  // Apply calculated width dynamically
  const widthPx = window.innerWidth * (splitCurrentWidth / 100);
  
  if (splitContainer) {
    splitContainer.style.width = `${widthPx}px`;
    splitContainer.classList.add('open');
  }
  
  // Shrink the main body to accommodate the fixed split pane
  document.body.style.paddingRight = `${widthPx}px`;
  document.body.style.setProperty('--split-width', `${widthPx}px`);
  
  // Update responsive bottom navigation
  updateNavDockResponsive();
}

function closeIntegration() {
  document.body.classList.remove('split-active');
  const splitContainer = document.getElementById('splitIntegration');
  if (splitContainer) splitContainer.classList.remove('open');
  document.body.style.paddingRight = '0px';
  document.body.style.setProperty('--split-width', '0px');
  
  const iframe = document.getElementById('splitIframe');
  if (iframe) iframe.src = ''; // stop rendering/media
  
  // Update responsive bottom navigation
  updateNavDockResponsive();
}

function reloadIntegration() {
  const iframe = document.getElementById('splitIframe');
  if (iframe && iframe.src) {
    // Force reload by resetting the src
    const currentSrc = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = currentSrc; }, 50);
  }
}

function openIntegrationNewTab() {
  const iframe = document.getElementById('splitIframe');
  if (iframe && iframe.src) {
    window.open(iframe.src, '_blank');
  }
}

async function handleAddIntegrationSubmit() {
  const nameInput = document.getElementById('inputIntegrationName');
  const urlInput = document.getElementById('inputIntegrationUrl');
  
  if (!nameInput || !urlInput) return;
  
  const name = nameInput.value.trim();
  let url = urlInput.value.trim();
  
  if (!name || !url) {
    toast('Please enter both name and URL', 'error');
    return;
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  const btn = document.getElementById('btnSaveIntegration');
  const originalText = btn.innerText;
  btn.innerText = 'Saving...';
  btn.disabled = true;
  
  try {
    const res = await api({ action: 'addIntegrationLink', name, url });
    if (res.success) {
      toast('Website added successfully', 'success');
      closeModal('modalAddIntegration');
      nameInput.value = '';
      urlInput.value = '';
      
      // Optimistic update
      INTEGRATION_LINKS.push({ name, url });
      renderIntegrationDock();
    } else {
      toast(res.error || 'Failed to add website', 'error');
    }
  } catch(e) {
    console.error(e);
    toast('Error saving website', 'error');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// Split Pane Resizer Logic
function initResizer() {
  const divider = document.getElementById('splitDivider');
  const splitContainer = document.getElementById('splitIntegration');
  if (!divider || !splitContainer) return;
  
  let isDragging = false;
  
  const onDrag = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    // Calculate new width from right side
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const newWidth = window.innerWidth - clientX;
    
    // Constraint width (min 300px, max 80vw)
    const minW = 300;
    const maxW = window.innerWidth * 0.8;
    
    const finalW = Math.max(minW, Math.min(newWidth, maxW));
    
    // Update percentage state
    splitCurrentWidth = (finalW / window.innerWidth) * 100;
    
    splitContainer.style.width = `${finalW}px`;
    document.body.style.paddingRight = `${finalW}px`;
    document.body.style.setProperty('--split-width', `${finalW}px`);
    updateNavDockResponsive();
  };
  
  const onStopDrag = () => {
    if (isDragging) {
      isDragging = false;
      document.body.classList.remove('dragging');
      splitContainer.classList.remove('dragging');
      divider.classList.remove('dragging');
      
      // We also add pointer-events: none to iframe while dragging to prevent iframe from swallowing mouse events
      const iframe = document.getElementById('splitIframe');
      if (iframe) iframe.style.pointerEvents = 'auto';
      
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onStopDrag);
      document.removeEventListener('touchmove', onDrag);
      document.removeEventListener('touchend', onStopDrag);
    }
  };
  
  const onStartDrag = (e) => {
    isDragging = true;
    document.body.classList.add('dragging');
    splitContainer.classList.add('dragging');
    divider.classList.add('dragging');
    
    const iframe = document.getElementById('splitIframe');
    if (iframe) iframe.style.pointerEvents = 'none';
    
    document.addEventListener('mousemove', onDrag, { passive: false });
    document.addEventListener('mouseup', onStopDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', onStopDrag);
  };
  
  divider.addEventListener('mousedown', onStartDrag);
  divider.addEventListener('touchstart', onStartDrag, { passive: true });
}

function switchAdminTab(tabId, btn) {
  // Hide all panels
  const panels = document.querySelectorAll('.admin-tab-panel');
  panels.forEach(panel => {
    panel.classList.remove('active');
  });

  // Deactivate all nav items
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
  });

  // Activate selected panel & button
  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.classList.add('active');
  }
  if (btn) {
    btn.classList.add('active');
  }
}

/* ───── Edit/Delete Entries with Admin Authorization ───── */
function initiateEditEntry(index) {
  window.ADMIN_CONFIRM_ACTION = { type: 'edit', index: index };
  document.getElementById('confirmAdminPassInput').value = '';
  hide('errConfirmAdminPass');
  document.getElementById('modalAdminPasswordConfirm').classList.add('open');
  document.getElementById('confirmAdminPassInput').focus();
}

function initiateDeleteEntry(index) {
  window.ADMIN_CONFIRM_ACTION = { type: 'delete', index: index };
  document.getElementById('confirmAdminPassInput').value = '';
  hide('errConfirmAdminPass');
  document.getElementById('modalAdminPasswordConfirm').classList.add('open');
  document.getElementById('confirmAdminPassInput').focus();
}

function closeAdminPasswordConfirmModal() {
  document.getElementById('modalAdminPasswordConfirm').classList.remove('open');
  document.getElementById('confirmAdminPassInput').value = '';
  hide('errConfirmAdminPass');
}

async function submitAdminPasswordConfirm() {
  const passInput = document.getElementById('confirmAdminPassInput');
  const pass = passInput.value.trim();
  const errEl = document.getElementById('errConfirmAdminPass');
  
  if (!pass) {
    toast('Password cannot be empty.', 'error');
    return;
  }
  
  hide('errConfirmAdminPass');
  const btn = document.getElementById('btnSubmitAdminPasswordConfirm');
  const oldText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Verifying...';
  
  try {
    const res = await api({ action: 'verifyAdminPassword', inputPass: pass });
    if (!res || !res.authenticated) {
      show('errConfirmAdminPass');
      passInput.focus();
      // Apply shake animation
      const modal = document.querySelector('#modalAdminPasswordConfirm .modal');
      if (modal) {
        modal.classList.add('error-shake');
        setTimeout(() => modal.classList.remove('error-shake'), 500);
      }
      btn.disabled = false;
      btn.innerHTML = oldText;
      return;
    }
    
    // Password verified!
    closeAdminPasswordConfirmModal();
    const action = window.ADMIN_CONFIRM_ACTION;
    if (action.type === 'delete') {
      deleteEntryAction(action.index);
    } else if (action.type === 'edit') {
      openEditEntryModal(action.index);
    }
  } catch (e) {
    toast('Error verifying password: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = oldText;
  }
}

async function deleteEntryAction(index) {
  const entry = ALL_ENTRIES_CACHE[index];
  if (!entry) return;
  
  if (!confirm(`Are you sure you want to permanently delete this entry?\nMobile: +91 ${entry.mobile}\nAmount: ₹${entry.amount}\nSource: ${entry.source}`)) {
    return;
  }
  
  toast('Deleting entry...', 'info');
  try {
    const res = await apiDirect({
      action: 'deleteEntryRow',
      mobile: entry.mobile,
      date: entry.date,
      time: entry.time,
      source: entry.source
    });
    
    if (res && res.error) {
      toast(res.error, 'error');
      return;
    }
    
    // Success: remove locally
    ALL_ENTRIES_CACHE.splice(index, 1);
    setCacheItem('getAllEntries', ALL_ENTRIES_CACHE);
    filterEntries();
    toast('Entry deleted successfully!', 'success');
    
    // Invalidate dashboard/re-sync
    if (typeof downloadSheetCache === 'function') {
      downloadSheetCache(true);
    }
  } catch (e) {
    toast('Failed to delete entry: ' + e.message, 'error');
  }
}

function openEditEntryModal(index) {
  const entry = ALL_ENTRIES_CACHE[index];
  if (!entry) return;
  
  window.EDITING_ENTRY_INDEX = index;
  
  document.getElementById('editEntryMobile').value = entry.mobile || '';
  document.getElementById('editEntryAmount').value = entry.amount || '';
  document.getElementById('editEntryCash').value = entry.cash || '';
  document.getElementById('editEntryUpi').value = entry.upi || '';
  document.getElementById('editEntryCard').value = entry.card || '';
  document.getElementById('editEntryMessage').value = entry.message || '';
  
  hide('errEditEntrySplit');
  document.getElementById('modalEditEntry').classList.add('open');
}

function closeEditEntryModal() {
  document.getElementById('modalEditEntry').classList.remove('open');
  hide('errEditEntrySplit');
}

function autoDistributeEditAmount() {
  const total = parseInt(document.getElementById('editEntryAmount').value, 10) || 0;
  const cash = parseInt(document.getElementById('editEntryCash').value, 10) || 0;
  const upi = parseInt(document.getElementById('editEntryUpi').value, 10) || 0;
  const card = parseInt(document.getElementById('editEntryCard').value, 10) || 0;
  
  if (cash > 0 && upi === 0 && card === 0) {
    document.getElementById('editEntryCash').value = total;
  } else if (upi > 0 && cash === 0 && card === 0) {
    document.getElementById('editEntryUpi').value = total;
  } else if (card > 0 && cash === 0 && upi === 0) {
    document.getElementById('editEntryCard').value = total;
  } else if (cash === 0 && upi === 0 && card === 0) {
    document.getElementById('editEntryCash').value = total;
  }
}

async function saveEditedEntry() {
  const index = window.EDITING_ENTRY_INDEX;
  const entry = ALL_ENTRIES_CACHE[index];
  if (!entry) return;
  
  const newMobile = document.getElementById('editEntryMobile').value.trim();
  if (newMobile && !/^\d{10}$/.test(newMobile)) {
    toast('Please enter a valid 10-digit mobile number or leave it empty.', 'error');
    return;
  }
  
  const newAmount = parseInt(document.getElementById('editEntryAmount').value, 10);
  if (isNaN(newAmount) || newAmount < 0) {
    toast('Billing amount must be a positive number.', 'error');
    return;
  }
  
  const newCash = parseInt(document.getElementById('editEntryCash').value, 10) || 0;
  const newUpi = parseInt(document.getElementById('editEntryUpi').value, 10) || 0;
  const newCard = parseInt(document.getElementById('editEntryCard').value, 10) || 0;
  const newMessage = document.getElementById('editEntryMessage').value.trim();
  
  // Validate breakdown sum matches amount
  if (newCash + newUpi + newCard !== newAmount) {
    show('errEditEntrySplit');
    const modal = document.querySelector('#modalEditEntry .modal');
    if (modal) {
      modal.classList.add('error-shake');
      setTimeout(() => modal.classList.remove('error-shake'), 500);
    }
    return;
  }
  
  hide('errEditEntrySplit');
  const btn = document.getElementById('btnSaveEditEntry');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving...';
  
  try {
    const res = await apiDirect({
      action: 'updateEntryRow',
      mobile: entry.mobile,
      date: entry.date,
      time: entry.time,
      source: entry.source,
      newMobile: newMobile,
      newAmount: newAmount,
      newCash: newCash,
      newUpi: newUpi,
      newCard: newCard,
      newMessage: newMessage
    });
    
    if (res && res.error) {
      toast(res.error, 'error');
      return;
    }
    
    // Update locally
    ALL_ENTRIES_CACHE[index].mobile = newMobile;
    ALL_ENTRIES_CACHE[index].amount = newAmount;
    ALL_ENTRIES_CACHE[index].cash = newCash;
    ALL_ENTRIES_CACHE[index].upi = newUpi;
    ALL_ENTRIES_CACHE[index].card = newCard;
    ALL_ENTRIES_CACHE[index].message = newMessage;
    
    setCacheItem('getAllEntries', ALL_ENTRIES_CACHE);
    filterEntries();
    closeEditEntryModal();
    toast('Entry updated successfully!', 'success');
    
    // Invalidate dashboard/re-sync
    if (typeof downloadSheetCache === 'function') {
      downloadSheetCache(true);
    }
  } catch (e) {
    toast('Failed to update entry: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save Changes';
  }
}

/* ══════════════════════════════════════
   KITCHEN DISPLAY SYSTEM (KDS)
   ══════════════════════════════════════ */
function checkAndPlayKitchenAlert(newOrders) {
  const kitchenSection = document.getElementById('sectionKitchen');
  if (!kitchenSection || !kitchenSection.classList.contains('active')) return;
  if (!POS_STATE.tableOrders) return;
  
  let shouldAlert = false;
  Object.keys(newOrders).forEach(tableId => {
    const newOrder = newOrders[tableId] || {};
    const oldOrder = POS_STATE.tableOrders[tableId] || {};
    
    const newItems = getOrderItemsArray(newOrder);
    const oldItems = getOrderItemsArray(oldOrder);
    
    newItems.forEach(newItem => {
      if (newItem.qty > 0) {
        if (newItem.status === 'Pending') {
          const oldItem = oldItems.find(i => i.id === newItem.id);
          if (!oldItem || newItem.qty > oldItem.qty) {
            shouldAlert = true;
          }
        } else if (newItem.status === 'Cancelled') {
          const oldItem = oldItems.find(i => i.id === newItem.id);
          if (!oldItem || oldItem.status !== 'Cancelled') {
            shouldAlert = true;
          }
        }
      }
    });
  });
  
  if (shouldAlert) {
    const audio = document.getElementById('kitchenAlertChime');
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio alert blocked or failed', err));
    }
  }
}

function renderKitchenView() {
  const grid = document.getElementById('kdsGrid');
  if (!grid) return;
  
  const activeOnly = document.getElementById('kitchenActiveOnlyToggle')?.checked ?? true;
  grid.innerHTML = '';
  
  let renderedCards = 0;
  
  Object.keys(POS_STATE.tableOrders).forEach(tableId => {
    const order = POS_STATE.tableOrders[tableId];
    if (!order) return;
    
    const orderItems = getOrderItemsArray(order);
    if (!orderItems || orderItems.length === 0) return;
    
    // Filter active items if activeOnly toggle is checked
    const displayItems = activeOnly 
      ? orderItems.filter(i => i.status !== 'Served' && i.qty > 0) 
      : orderItems.filter(i => i.qty > 0);
      
    if (displayItems.length === 0) return;
    
    renderedCards++;
    
    // Create KDS Card element
    const card = document.createElement('div');
    card.className = 'kds-card';
    
    // Format table display name with resolved category name
    let displayName = tableId;
    if (tableId.startsWith('table_')) {
      const parts = tableId.split('_');
      const catId = parts[1];
      const cat = POS_STATE.tableCategories.find(c => String(c.id) === String(catId));
      const catName = cat ? cat.name : catId;
      displayName = `Table ${parts[2]} (${catName})`;
    } else {
      displayName = `Table ${tableId} (General)`;
    }
    
    // Elapsed time calculation
    const occupiedSince = order.occupiedSince || 0;
    
    const cardHeader = document.createElement('div');
    cardHeader.className = 'kds-card-header';
    cardHeader.innerHTML = `
      <div class="kds-table-name">${displayName}</div>
      <div class="kds-timer" id="kds-timer-${tableId}" data-occupied-since="${occupiedSince}">
        ⏱️ --:--
      </div>
    `;
    card.appendChild(cardHeader);
    
    const itemsList = document.createElement('div');
    itemsList.className = 'kds-items-list';
    
    // Aggregate items by nodeIndex (or name fallback), flavour, and status
    const grouped = {};
    const itemAppearanceOrder = [];
    
    displayItems.forEach(item => {
      const status = item.status || 'Pending';
      const flavour = item.flavour || '';
      const itemIdentifier = (item.nodeIndex !== undefined && item.nodeIndex !== null) ? item.nodeIndex : item.name;
      const itemKey = `${itemIdentifier}_${flavour}`;
      
      if (!itemAppearanceOrder.includes(itemKey)) {
        itemAppearanceOrder.push(itemKey);
      }
      
      const key = `${itemIdentifier}_${flavour}_${status}`;
      if (!grouped[key]) {
        grouped[key] = {
          nodeIndex: item.nodeIndex,
          name: item.name,
          flavour: flavour,
          status: status,
          qty: 0,
          sampleId: item.id,
          itemKey: itemKey
        };
      }
      grouped[key].qty += (item.qty || 1);
    });
    
    const statusOrder = {
      'Pending': 1,
      'Preparing': 2,
      'Ready': 3,
      'Served': 4,
      'Cancelled': 5
    };
    
    const sortedGroups = Object.values(grouped).sort((a, b) => {
      const indexA = itemAppearanceOrder.indexOf(a.itemKey);
      const indexB = itemAppearanceOrder.indexOf(b.itemKey);
      if (indexA !== indexB) {
        return indexA - indexB;
      }
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      return orderA - orderB;
    });
    
    sortedGroups.forEach(group => {
      const status = group.status;
      const lowercaseStatus = status.toLowerCase();
      const nodeIndex = group.nodeIndex;
      const flavour = group.flavour;
      
      const itemRow = document.createElement('div');
      itemRow.className = 'kds-item-row' + (status === 'Cancelled' ? ' cancelled' : '');
      
      const safeName = group.name.replace(/'/g, "\\'");
      // Determine action button
      let actionBtnHtml = '';
      if (status === 'Cancelled') {
        actionBtnHtml = `<button class="kds-action-btn kds-dismiss-btn" onclick="dismissCancelledKdsItem('${tableId}', ${nodeIndex}, '${flavour}', '${safeName}')">Dismiss</button>`;
      } else if (status === 'Pending') {
        actionBtnHtml = `<button class="kds-action-btn" onclick="changeKdsItemStatus('${tableId}', ${nodeIndex}, '${flavour}', 'Pending', 'Preparing', '${safeName}')">Start Prep</button>`;
      } else if (status === 'Preparing') {
        actionBtnHtml = `<button class="kds-action-btn" style="background:#f59e0b;" onclick="changeKdsItemStatus('${tableId}', ${nodeIndex}, '${flavour}', 'Preparing', 'Ready', '${safeName}')">Mark Ready</button>`;
      } else if (status === 'Ready') {
        actionBtnHtml = `<button class="kds-action-btn" style="background:#10b981;" onclick="changeKdsItemStatus('${tableId}', ${nodeIndex}, '${flavour}', 'Ready', 'Served', '${safeName}')">Serve</button>`;
      } else {
        actionBtnHtml = `<span style="color:#10b981; font-weight:700;">✓ Served</span>`;
      }
      
      const flavourSuffix = group.flavour ? ` (${group.flavour})` : '';
      itemRow.innerHTML = `
        <div class="kds-item-info">
          <span class="kds-item-name">${group.name}${flavourSuffix}</span>
          <span class="kds-item-qty">×${group.qty}</span>
        </div>
        <div class="kds-item-status-bar">
          <span class="kds-badge ${lowercaseStatus}">${status}</span>
          ${actionBtnHtml}
        </div>
      `;
      itemsList.appendChild(itemRow);
    });
    
    card.appendChild(itemsList);
    grid.appendChild(card);
  });
  
  if (renderedCards === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:3rem 0; color:var(--text-secondary);">No orders in the kitchen.</p>';
  }
  
  updateKdsTimers();
}

function updateKdsTimers() {
  const timerEls = document.querySelectorAll('.kds-timer');
  timerEls.forEach(el => {
    const occupiedSince = Number(el.getAttribute('data-occupied-since')) || 0;
    if (occupiedSince === 0) {
      el.textContent = '⏱️ --:--';
      return;
    }
    const elapsedMs = Date.now() - occupiedSince;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const hrs = Math.floor(elapsedSec / 3600);
    const mins = Math.floor((elapsedSec % 3600) / 60);
    const secs = elapsedSec % 60;
    
    const pad = (num) => String(num).padStart(2, '0');
    el.textContent = hrs > 0 
      ? `⏱️ ${pad(hrs)}:${pad(mins)}:${pad(secs)}` 
      : `⏱️ ${pad(mins)}:${pad(secs)}`;
  });
}

// Start KDS timer updates every second
if (!window.kdsTimerInterval) {
  window.kdsTimerInterval = setInterval(updateKdsTimers, 1000);
}

async function changeKdsItemStatus(tableId, nodeIndex, flavour, currentStatus, newStatus, itemName) {
  const order = POS_STATE.tableOrders[tableId];
  if (!order) return;
  
  const items = getOrderItemsArray(order);
  const targetFlavour = flavour || '';
  const line = items.find(i => {
    const statusMatch = (i.status || 'Pending') === currentStatus;
    const flavourMatch = (i.flavour || '') === targetFlavour;
    let identifierMatch = false;
    if (nodeIndex !== undefined && nodeIndex !== null && nodeIndex !== 'undefined' && i.nodeIndex !== undefined && i.nodeIndex !== null) {
      identifierMatch = String(i.nodeIndex) === String(nodeIndex);
    } else if (itemName) {
      identifierMatch = i.name === itemName;
    }
    return statusMatch && flavourMatch && identifierMatch;
  });
  if (!line) return;
  
  // Optimistic UI update
  line.status = newStatus;
  order.items = items;
  renderKitchenView();
  
  // Save local state
  localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
  
  // Instant broadcast
  notifyTableUpdate(tableId, order);
  
  try {
    let grandTotal = 0;
    items.forEach(item => {
      if (item.status !== 'Cancelled') {
        grandTotal += (item.qty * item.price);
      }
    });
    const res = await apiDirect({
      action: 'saveTableData',
      tableId: tableId,
      orderItemsJson: JSON.stringify(order),
      occupiedSince: order.occupiedSince || '',
      grandTotal: grandTotal
    });
    if (res && res.error) {
      toast('Failed to update status on server: ' + res.error, 'error');
    }
  } catch (e) {
    console.error('Failed to sync status to server', e);
    toast('Offline: saved locally, will sync later', 'warning');
  }
}

async function dismissCancelledKdsItem(tableId, nodeIndex, flavour, itemName) {
  const order = POS_STATE.tableOrders[tableId];
  if (!order || !Array.isArray(order.items)) return;
  
  const targetFlavour = flavour || '';
  const idx = order.items.findIndex(i => {
    const statusMatch = i.status === 'Cancelled';
    const flavourMatch = (i.flavour || '') === targetFlavour;
    let identifierMatch = false;
    if (nodeIndex !== undefined && nodeIndex !== null && nodeIndex !== 'undefined' && i.nodeIndex !== undefined && i.nodeIndex !== null) {
      identifierMatch = String(i.nodeIndex) === String(nodeIndex);
    } else if (itemName) {
      identifierMatch = i.name === itemName;
    }
    return statusMatch && flavourMatch && identifierMatch;
  });
  if (idx !== -1) {
    order.items.splice(idx, 1);
    
    // Check if there are any active items left
    const items = getOrderItemsArray(order);
    const hasItems = items.some(i => i.qty > 0 && i.status !== 'Cancelled');
    if (!hasItems) {
      delete order.occupiedSince;
    }
    
    // Save to local storage
    localStorage.setItem('ppp_tables', JSON.stringify(POS_STATE.tableOrders));
    
    // Optimistic render
    renderKitchenView();
    
    // Instant broadcast
    notifyTableUpdate(tableId, items.length > 0 ? order : {});
    
    // Sync to server
    try {
      if (items.length > 0) {
        let grandTotal = 0;
        items.forEach(item => {
          if (item.status !== 'Cancelled') {
            grandTotal += (item.qty * item.price);
          }
        });
        await apiDirect({
          action: 'saveTableData',
          tableId: tableId,
          orderItemsJson: JSON.stringify(order),
          occupiedSince: order.occupiedSince || '',
          grandTotal: grandTotal
        });
      } else {
        await apiDirect({
          action: 'clearTableData',
          tableId: tableId
        });
      }
    } catch (e) {
      console.error('Failed to dismiss cancelled item from server', e);
      toast('Failed to sync dismissal to server', 'error');
    }
  }
}

// Close POS search dropdown and integration dock when clicking outside
document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('posMenuSearchDropdown');
  const searchInput = document.getElementById('posMenuSearchInput');
  if (dropdown && searchInput) {
    if (!searchInput.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.style.display = 'none';
    }
  }

  const integrationDock = document.getElementById('integrationDock');
  if (integrationDock && integrationDock.classList.contains('open')) {
    if (!integrationDock.contains(event.target)) {
      toggleIntegrationDock(false);
    }
  }
});

/* =======================================================
   COMBO BUILDER ADMIN & POS LOGIC
======================================================= */

function renderCombosList() {
  const container = document.getElementById('adminCombosList');
  if (!container) return;
  container.innerHTML = '';
  
  if (!POS_STATE.combos || POS_STATE.combos.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding: 1rem 0;">No combos created yet.</p>';
    return;
  }
  
  POS_STATE.combos.forEach(combo => {
    const el = document.createElement('div');
    el.style.display = 'flex';
    el.style.justifyContent = 'space-between';
    el.style.alignItems = 'center';
    el.style.padding = '0.75rem 1rem';
    el.style.background = 'var(--bg-card)';
    el.style.border = '1px solid var(--border-input)';
    el.style.borderRadius = '12px';
    el.style.marginBottom = '0.5rem';
    
    // Resolve node names for display
    const itemNames = combo.nodes.map(nIdx => {
      const node = POS_STATE.menuTree.find(n => Number(n.index) === Number(nIdx));
      return node ? node.name : `[Node #${nIdx}]`;
    }).join(', ');
    
    el.innerHTML = `
      <div style="flex:1; padding-right:1rem;">
        <strong style="color:var(--text-primary); font-size:0.95rem;">${combo.name}</strong>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem;">Items: ${itemNames || 'None'}</div>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn--outline btn--sm" onclick="openComboEditorModal('${combo.id}')" style="padding:0.25rem 0.5rem; font-size:0.75rem;">Edit</button>
        <button class="btn btn--outline btn--sm" onclick="deleteCombo('${combo.id}')" style="padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;">Delete</button>
      </div>
    `;
    container.appendChild(el);
  });
}

function openComboEditorModal(comboId) {
  const isEdit = !!comboId && !String(comboId).startsWith('combo_') && comboId !== '';
  const combo = isEdit ? POS_STATE.combos.find(c => String(c.id) === String(comboId)) : null;
  
  document.getElementById('comboEditorModalTitle').textContent = isEdit ? 'Edit Combo' : 'Create Combo';
  document.getElementById('inputComboId').value = isEdit ? combo.id : '';
  document.getElementById('inputComboName').value = isEdit ? combo.name : '';
  document.getElementById('inputComboKeyword').value = isEdit ? (combo.keyword || '') : '';
  
  const selectedNodes = isEdit ? combo.nodes : [];
  
  const container = document.getElementById('comboItemsSelectorContainer');
  container.innerHTML = '';
  
  // Recursively render checkbox options tree starting from root category nodes (parentIndex === 0)
  buildComboItemsSelectorTree(container, 0, selectedNodes, 0);
  
  openModal('modalComboEditor');
}

function buildComboItemsSelectorTree(container, parentId, selectedNodes, depth) {
  const children = POS_STATE.menuTree.filter(n => Number(n.parentIndex) === Number(parentId)).sort((a, b) => a.index - b.index);
  
  children.forEach(node => {
    const isParent = POS_STATE.menuTree.some(n => Number(n.parentIndex) === Number(node.index));
    const matchedItem = selectedNodes.find(item => item && (typeof item === 'object' ? Number(item.index) === Number(node.index) : Number(item) === Number(node.index)));
    const isChecked = !!matchedItem ? 'checked' : '';
    const qtyVal = (matchedItem && typeof matchedItem === 'object') ? (matchedItem.qty || 1) : 1;
    
    const wrapper = document.createElement('div');
    wrapper.style.marginLeft = `${depth * 1.5}rem`;
    wrapper.style.marginTop = '0.35rem';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '0.5rem';
    
    wrapper.innerHTML = `
      <input type="checkbox" class="combo-node-chk" value="${node.index}" ${isChecked} style="cursor:pointer; width:16px; height:16px;">
      <label style="font-size:0.9rem; font-weight:${isParent ? '700' : '500'}; color:${isParent ? 'var(--brand-primary)' : 'var(--text-primary)'}; cursor:pointer; flex: 1;">
        ${isParent ? '📁' : '🍽️'} ${node.name} ${!isParent && node.price ? `(₹${node.price})` : ''}
      </label>
      <input type="number" class="combo-node-qty" value="${qtyVal}" min="1" style="width: 55px; padding: 0.15rem 0.3rem; border-radius: 6px; border: 1px solid var(--border-input); font-size: 0.85rem; display: ${matchedItem ? 'inline-block' : 'none'};" id="combo-qty-${node.index}">
    `;
    
    const chk = wrapper.querySelector('.combo-node-chk');
    const qtyInput = wrapper.querySelector('.combo-node-qty');
    chk.onchange = () => {
      qtyInput.style.display = chk.checked ? 'inline-block' : 'none';
    };
    
    container.appendChild(wrapper);
    
    if (isParent) {
      buildComboItemsSelectorTree(container, node.index, selectedNodes, depth + 1);
    }
  });
}

async function submitComboForm() {
  const comboId = document.getElementById('inputComboId').value;
  const name = document.getElementById('inputComboName').value.trim();
  const keyword = document.getElementById('inputComboKeyword').value.trim();
  
  if (!name) {
    toast('Please enter a combo name', 'error');
    return;
  }
  
  // Get all checked values with their quantities
  const checkedNodes = [];
  document.querySelectorAll('#comboItemsSelectorContainer .combo-node-chk:checked').forEach(chk => {
    const nodeIndex = Number(chk.value);
    const qtyInput = document.getElementById(`combo-qty-${nodeIndex}`);
    const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
    checkedNodes.push({ index: nodeIndex, qty: qty });
  });
  
  if (checkedNodes.length === 0) {
    toast('Please select at least one item or category', 'error');
    return;
  }
  
  try {
    const res = await api({
      action: 'saveCombo',
      comboId: comboId,
      name: name,
      keyword: keyword,
      nodesJson: JSON.stringify(checkedNodes)
    });
    
    if (res && res.success) {
      closeModal('modalComboEditor');
      toast('Combo saved successfully!', 'success');
      // Reload combos
      const getRes = await api({ action: 'getCombos' });
      POS_STATE.combos = getRes.combos || [];
      renderCombosList();
      
      // Update menu tree too
      api({ action: 'getMenuTree' }).then(treeRes => {
        POS_STATE.menuTree = treeRes.nodes || [];
      }).catch(e => console.error(e));
    } else {
      toast('Failed to save combo: ' + (res?.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    console.error(e);
    toast('Error saving combo: ' + e.message, 'error');
  }
}

async function deleteCombo(comboId) {
  if (!confirm('Are you sure you want to delete this combo?')) return;
  
  try {
    const res = await api({ action: 'deleteCombo', comboId: comboId });
    if (res && res.success) {
      toast('Combo deleted successfully!', 'success');
      // Reload combos
      const getRes = await api({ action: 'getCombos' });
      POS_STATE.combos = getRes.combos || [];
      renderCombosList();
    } else {
      toast('Failed to delete combo: ' + (res?.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    console.error(e);
    toast('Error deleting combo: ' + e.message, 'error');
  }
}

/* ───── POS COMBO SELECTION WIZARD STATE ───── */
let activeComboName = '';
let comboResolutionQueue = [];
let comboResolvedDishes = [];

function startComboResolution(comboId) {
  const combo = POS_STATE.combos.find(c => String(c.id) === String(comboId));
  if (!combo) return;
  
  activeComboName = combo.name;
  comboResolutionQueue = [];
  comboResolvedDishes = [];
  
  combo.nodes.forEach(item => {
    // Handle fallback if database saved with old raw index array [2, 4]
    const index = (item && typeof item === 'object') ? item.index : Number(item);
    const qty = (item && typeof item === 'object') ? (Number(item.qty) || 1) : 1;
    
    const node = POS_STATE.menuTree.find(n => Number(n.index) === Number(index));
    if (!node) return;
    
    const hasChildren = POS_STATE.menuTree.some(n => Number(n.parentIndex) === Number(node.index));
    if (!hasChildren) {
      // Leaf node: auto-resolve immediately!
      for (let i = 0; i < qty; i++) {
        comboResolvedDishes.push(node);
      }
    } else {
      // Parent node: push to wizard queue
      comboResolutionQueue.push({ nodeIndex: index, requiredQty: qty });
    }
  });
  
  processNextComboItem();
}

function processNextComboItem() {
  const footer = document.getElementById('comboResolverFooter');
  if (footer) footer.style.display = 'none';

  if (comboResolutionQueue.length === 0) {
    // Resolution finished! Add resolved dishes to active table order
    closeModal('modalComboResolver');
    if (comboResolvedDishes.length === 0) return;
    
    comboResolvedDishes.forEach(dish => {
      // Re-use standard item addition
      updatePosItemQty(dish.index, dish.name, dish.price, 1);
    });
    
    toast(`${activeComboName} items added to order!`, 'success');
    
    // Reset variables
    activeComboName = '';
    comboResolutionQueue = [];
    comboResolvedDishes = [];
    return;
  }
  
  const step = comboResolutionQueue[0];
  const node = POS_STATE.menuTree.find(n => Number(n.index) === Number(step.nodeIndex));
  
  if (!node) {
    comboResolutionQueue.shift();
    processNextComboItem();
    return;
  }
  
  // Parent node: open resolution choices popup
  const descendants = getDescendantNodeIds(node.index, POS_STATE.menuTree);
  const descendantNodes = descendants.map(idx => POS_STATE.menuTree.find(n => Number(n.index) === Number(idx))).filter(Boolean);
  
  // Find all leaf nodes among descendants
  const leafNodes = descendantNodes.filter(d => !POS_STATE.menuTree.some(n => Number(n.parentIndex) === Number(d.index)));
  
  if (leafNodes.length === 0) {
    comboResolutionQueue.shift();
    processNextComboItem();
    return;
  }
  
  document.getElementById('comboResolverTitle').textContent = activeComboName;
  document.getElementById('comboResolverPrompt').textContent = `Choose ${step.requiredQty} items from "${node.name}":`;
  
  const grid = document.getElementById('comboResolverOptionsGrid');
  grid.innerHTML = '';
  
  // Track selected quantities locally for all leaf dishes
  const selectionMap = {};
  leafNodes.forEach(leaf => selectionMap[leaf.index] = 0);
  
  const getSumSelected = () => Object.values(selectionMap).reduce((sum, v) => sum + v, 0);
  
  if (footer) {
    footer.style.display = 'block';
    const confirmBtn = document.getElementById('btnConfirmComboResolver');
    confirmBtn.disabled = true;
    confirmBtn.textContent = `Confirm Selection (0/${step.requiredQty})`;
    
    confirmBtn.onclick = () => {
      const totalConfirmed = getSumSelected();
      leafNodes.forEach(leaf => {
        const qty = selectionMap[leaf.index];
        for (let i = 0; i < qty; i++) {
          comboResolvedDishes.push(leaf);
        }
      });
      
      step.requiredQty -= totalConfirmed;
      if (step.requiredQty <= 0) {
        comboResolutionQueue.shift();
      }
      processNextComboItem();
    };
  }
  
  function renderAccordionTree(container, parentId, depth) {
    const children = POS_STATE.menuTree.filter(n => Number(n.parentIndex) === Number(parentId)).sort((a, b) => a.index - b.index);
    
    children.forEach(child => {
      const isParent = POS_STATE.menuTree.some(n => Number(n.parentIndex) === Number(child.index));
      
      const wrapper = document.createElement('div');
      wrapper.style.marginLeft = depth === 0 ? '0' : '1rem';
      wrapper.style.marginTop = '0.5rem';
      
      if (isParent) {
        const childDescendants = getDescendantNodeIds(child.index, POS_STATE.menuTree);
        const hasLeaf = childDescendants.some(dIdx => {
           const dNode = POS_STATE.menuTree.find(n => Number(n.index) === Number(dIdx));
           return dNode && !POS_STATE.menuTree.some(n => Number(n.parentIndex) === Number(dIdx));
        });
        if (!hasLeaf) return; // Skip empty folders
        
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.padding = '0.75rem 1rem';
        header.style.background = 'var(--bg-card)';
        header.style.border = '1px solid var(--border-input)';
        header.style.borderRadius = '8px';
        header.style.cursor = 'pointer';
        header.style.fontWeight = '700';
        header.style.userSelect = 'none';
        header.innerHTML = `<span>📁 ${child.name}</span><span style="margin-left:auto; font-size:0.8rem;">▼</span>`;
        
        const childrenContainer = document.createElement('div');
        childrenContainer.style.display = depth === 0 ? 'block' : 'none';
        childrenContainer.style.paddingLeft = '0.5rem';
        childrenContainer.style.borderLeft = '2px solid var(--border-input)';
        childrenContainer.style.marginLeft = '0.5rem';
        childrenContainer.style.marginTop = '0.5rem';
        
        header.onclick = () => {
          if (childrenContainer.style.display === 'none') {
            childrenContainer.style.display = 'block';
            header.querySelector('span:last-child').textContent = '▲';
          } else {
            childrenContainer.style.display = 'none';
            header.querySelector('span:last-child').textContent = '▼';
          }
        };
        
        wrapper.appendChild(header);
        wrapper.appendChild(childrenContainer);
        container.appendChild(wrapper);
        
        renderAccordionTree(childrenContainer, child.index, depth + 1);
      } else {
        const itemRow = document.createElement('div');
        itemRow.className = 'pos-search-dropdown-item';
        itemRow.style.padding = '0.75rem 1rem';
        itemRow.style.border = '1px solid var(--border-input)';
        itemRow.style.borderRadius = '8px';
        itemRow.style.background = 'var(--bg-card)';
        itemRow.style.display = 'flex';
        itemRow.style.justifyContent = 'space-between';
        itemRow.style.alignItems = 'center';
        
        itemRow.innerHTML = `
          <div class="item-details" style="flex:1;">
            <div class="item-name" style="font-weight:600; color:var(--text-primary);">🍽️ ${child.name}</div>
            <div class="item-price" style="font-weight:700; color:var(--brand-primary); margin-top:0.25rem;">₹${child.price}</div>
          </div>
          <div class="qty-selector" style="display:flex; align-items:center; gap:0.5rem;">
            <button class="qty-btn dec-btn" style="width:28px; height:28px; border-radius:50%; border:1px solid var(--border-input); background:var(--bg-card); cursor:pointer;">-</button>
            <div class="qty-display" style="font-weight:700; min-width:20px; text-align:center;">0</div>
            <button class="qty-btn inc-btn" style="width:28px; height:28px; border-radius:50%; border:1px solid var(--border-input); background:var(--bg-card); cursor:pointer;">+</button>
          </div>
        `;
        
        const decrementBtn = itemRow.querySelector('.dec-btn');
        const incrementBtn = itemRow.querySelector('.inc-btn');
        const display = itemRow.querySelector('.qty-display');
        
        const updateUI = () => {
          const sum = getSumSelected();
          const confirmBtn = document.getElementById('btnConfirmComboResolver');
          if (confirmBtn) {
            confirmBtn.textContent = `Confirm Selection (${sum}/${step.requiredQty})`;
            confirmBtn.disabled = (sum !== step.requiredQty);
          }
        };
        
        decrementBtn.onclick = () => {
          if (selectionMap[child.index] > 0) {
            selectionMap[child.index]--;
            display.textContent = selectionMap[child.index];
            updateUI();
          }
        };
        
        incrementBtn.onclick = () => {
          const sum = getSumSelected();
          if (sum < step.requiredQty) {
            selectionMap[child.index]++;
            display.textContent = selectionMap[child.index];
            updateUI();
          } else {
            toast('Maximum quantity reached', 'warning');
          }
        };
        
        wrapper.appendChild(itemRow);
        container.appendChild(wrapper);
      }
    });
  }
  
  renderAccordionTree(grid, node.index, 0);
  openModal('modalComboResolver');
}

function cancelComboResolution() {
  closeModal('modalComboResolver');
  activeComboName = '';
  comboResolutionQueue = [];
  comboResolvedDishes = [];
  toast('Combo selection cancelled.', 'info');
}

