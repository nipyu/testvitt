// pages/home.js

let currentSort = 'featured';
let currentDiff = 'all';

async function initHome() {
  await fetchPackages();
  renderTrips(globalPackages);
}

function getFilteredTrips() {
  let filtered = globalPackages.filter(p => {
    if (!p.show_on_homepage) return false;
    if (currentDiff !== 'all' && p.difficulty.toLowerCase() !== currentDiff) return false;
    return true;
  });

  if (currentSort === 'featured') {
    filtered.sort((a, b) => b.priority - a.priority);
  } else if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price_pln - b.price_pln);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price_pln - a.price_pln);
  } else if (currentSort === 'duration-asc') {
    filtered.sort((a, b) => a.duration_days - b.duration_days);
  } else if (currentSort === 'duration-desc') {
    filtered.sort((a, b) => b.duration_days - a.duration_days);
  }

  return filtered;
}

function applyFilters() {
  const filtered = getFilteredTrips();
  renderTrips(filtered);
  document.getElementById('filtersClear').style.display = (currentSort!=='featured' || currentDiff!=='all') ? 'inline' : 'none';
}

function clearFilters() {
  setDiff(document.querySelector('.diff-btn[onclick*="all"]'));
  setSort('featured', document.querySelector('.sort-btn[onclick*="featured"]'));
  applyFilters();
}

function setDiff(btn) {
  currentDiff = btn.innerText.toLowerCase();
  if(currentDiff === 'all difficulties') currentDiff = 'all';
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function setSort(s, btn) {
  currentSort = s;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function toggleFilters() {
  const fb = document.getElementById('filtersBody');
  const fa = document.getElementById('filtersArrow');
  if(fb.style.display === 'none') {
    fb.style.display = 'block';
    fa.style.transform = 'rotate(180deg)';
  } else {
    fb.style.display = 'none';
    fa.style.transform = 'rotate(0deg)';
  }
}

function renderTrips(data) {
  const list = document.getElementById('tripsList');
  const count = document.getElementById('tripCount');

  if (!list || !count) return;

  count.innerText = `Showing ${data.length} trips`;
  list.innerHTML = '';

  data.forEach(trip => {
    let diffColor = '#22c55e';
    if(trip.difficulty === 'Medium') diffColor = '#eab308';
    if(trip.difficulty === 'Hard') diffColor = '#ef4444';

    const disabledClass = trip.is_enabled ? '' : 'disabled';
    const disabledText = trip.is_enabled ? '' : '<div style="position:absolute;top:10px;right:10px;background:rgba(239, 68, 68, 0.9);color:#fff;font-family:'Montserrat',sans-serif;font-weight:800;font-size:0.75rem;padding:4px 10px;border-radius:6px;z-index:2;text-transform:uppercase;">Coming Soon</div>';

    // Instead of navigateToPackage(slug), we use traditional link
    const ctaBtn = trip.is_enabled
      ? `<button class="btn-book" onclick="openBookingModalDirect('${trip.slug}')">Book Now</button>`
      : `<button class="btn-book disabled">Coming Soon</button>`;

    const detailsBtn = trip.is_enabled
      ? `<a href="package.html?slug=${trip.slug}" class="btn-details">Details</a>`
      : `<button class="btn-details disabled">Details</button>`;

    const imgFilter = trip.is_enabled ? '' : 'filter: grayscale(100%);';

    list.innerHTML += `
      <div class="trip-card">
        <div class="trip-img" style="background-image:url('${trip.hero_image_url}'); ${imgFilter}">
          ${disabledText}
          <div class="topbar">
            <span>🏷️ ${trip.activity}</span>
            <span>📍 ${trip.location}</span>
          </div>
        </div>
        <div class="trip-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <h3 class="trip-title">${trip.title}</h3>
            <span class="trip-diff" style="background:${diffColor}">${trip.difficulty}</span>
          </div>
          <div class="trip-info">
            <span>⏱️ ${trip.duration_days} Day${trip.duration_days > 1 ? 's' : ''}</span>
          </div>
          <p class="trip-desc">${trip.description.substring(0, 100)}...</p>
          <div class="trip-footer">
            <div>
              <div class="trip-price-pln">${trip.price_pln.toFixed(2)} PLN</div>
              <div class="trip-price-eur">~${trip.price_eur.toFixed(2)} EUR</div>
            </div>
            <div style="display:flex;gap:8px">
              ${detailsBtn}
              ${ctaBtn}
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function openBookingModalDirect(slug) {
  const pkg = globalPackages.find(p => p.slug === slug);
  if(pkg && pkg.is_enabled) {
    openBookingModal(pkg, pkg.available_dates?.[0], 1);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('tripsList')) {
        initHome();
    }
});
