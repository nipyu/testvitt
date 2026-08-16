// pages/admin.js

let adminAuthToken = null;

function initAdmin() {
  const token = localStorage.getItem('nna_admin_token');
  if (token === 'authed_dummy_token_123') {
    adminAuthToken = token;
    document.getElementById('admin-login-card').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    renderAdminPackages();
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('admin-user').value;
  const p = document.getElementById('admin-pass').value;
  if(u === 'admin' && p === 'password') {
    adminAuthToken = 'authed_dummy_token_123';
    localStorage.setItem('nna_admin_token', adminAuthToken);
    showToast('Login successful');
    document.getElementById('admin-login-card').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    renderAdminPackages();
  } else {
    showToast('Invalid credentials');
  }
}

function handleAdminLogout() {
  adminAuthToken = null;
  localStorage.removeItem('nna_admin_token');
  document.getElementById('admin-login-card').style.display = 'block';
  document.getElementById('admin-dashboard').style.display = 'none';
  showToast('Logged out');
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-btn-${tab}`).classList.add('active');

  if(tab === 'packages') {
    document.getElementById('admin-tab-packages').style.display = 'block';
    document.getElementById('admin-tab-bookings').style.display = 'none';
    renderAdminPackages();
  } else if(tab === 'bookings') {
    document.getElementById('admin-tab-packages').style.display = 'none';
    document.getElementById('admin-tab-bookings').style.display = 'block';
    fetchAdminBookings();
  }
}

function toggleDisableOptions() {
  const isEnabled = document.getElementById('pkg-form-is-enabled').checked;
  const wrap = document.getElementById('disabled-options-wrap');
  if(!isEnabled) {
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
    document.getElementById('pkg-form-show-homepage').checked = true;
  }
}

function autoGenerateSlug() {
  const title = document.getElementById('pkg-form-title').value;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  document.getElementById('pkg-form-slug').value = slug;
}

function calcEurPrice() {
  const pln = parseFloat(document.getElementById('pkg-form-price-pln').value);
  if(!isNaN(pln)) {
    document.getElementById('pkg-form-price-eur').value = (pln * PLN_TO_EUR).toFixed(2);
  }
}

function resetPackageForm() {
  document.getElementById('pkg-form-id').value = '';
  document.getElementById('pkg-form-title').value = '';
  document.getElementById('pkg-form-slug').value = '';
  document.getElementById('pkg-form-activity').value = '';
  document.getElementById('pkg-form-location').value = '';
  document.getElementById('pkg-form-duration').value = '1';
  document.getElementById('pkg-form-difficulty').value = 'Easy';
  document.getElementById('pkg-form-price-pln').value = '';
  document.getElementById('pkg-form-price-eur').value = '';
  document.getElementById('pkg-form-hero-img').value = '';
  document.getElementById('pkg-form-gallery-imgs').value = '';
  document.getElementById('pkg-form-dates').value = '';
  document.getElementById('pkg-form-amenities').value = '';
  document.getElementById('pkg-form-desc').value = '';
  document.getElementById('pkg-form-itinerary').value = '';
  document.getElementById('pkg-form-priority').value = '0';
  document.getElementById('pkg-form-is-enabled').checked = true;
  document.getElementById('pkg-form-show-homepage').checked = true;
  toggleDisableOptions();
  document.getElementById('admin-form-heading').innerText = '➕ Create New Package';
}

async function handleSavePackage(e) {
  e.preventDefault();

  const id = document.getElementById('pkg-form-id').value;
  const isEnabled = document.getElementById('pkg-form-is-enabled').checked;
  const showOnHomepage = isEnabled ? true : document.getElementById('pkg-form-show-homepage').checked;

  const pkgData = {
    title: document.getElementById('pkg-form-title').value,
    slug: document.getElementById('pkg-form-slug').value,
    activity: document.getElementById('pkg-form-activity').value,
    location: document.getElementById('pkg-form-location').value,
    duration_days: parseInt(document.getElementById('pkg-form-duration').value),
    difficulty: document.getElementById('pkg-form-difficulty').value,
    price_pln: parseFloat(document.getElementById('pkg-form-price-pln').value),
    price_eur: parseFloat(document.getElementById('pkg-form-price-eur').value),
    hero_image_url: document.getElementById('pkg-form-hero-img').value,
    gallery_images: document.getElementById('pkg-form-gallery-imgs').value,
    available_dates: document.getElementById('pkg-form-dates').value.split(',').map(d=>d.trim()).filter(d=>d),
    amenities: document.getElementById('pkg-form-amenities').value.split(',').map(a=>a.trim()).filter(a=>a),
    description: document.getElementById('pkg-form-desc').value,
    itinerary: document.getElementById('pkg-form-itinerary').value,
    priority: parseInt(document.getElementById('pkg-form-priority').value) || 0,
    is_enabled: isEnabled,
    show_on_homepage: showOnHomepage
  };

  try {
    if(id) {
      const { error } = await _supabase.from('packages').update(pkgData).eq('id', id);
      if(error) throw error;
      showToast('Package updated successfully');
    } else {
      const { error } = await _supabase.from('packages').insert([pkgData]);
      if(error) throw error;
      showToast('Package created successfully');
    }
    resetPackageForm();
    await fetchPackages();
    renderAdminPackages();
  } catch(err) {
    console.error(err);
    showToast('Error saving package: ' + err.message);
  }
}

async function renderAdminPackages() {
  await fetchPackages(); // Ensure we have latest data
  const tbody = document.getElementById('admin-packages-list-body');
  if(!tbody) return;
  tbody.innerHTML = '';

  const sorted = [...globalPackages].sort((a,b) => b.priority - a.priority);

  sorted.forEach(p => {
    let statusPill = p.is_enabled
      ? `<span class="status-pill status-paid">Enabled</span>`
      : `<span class="status-pill status-failed">Disabled${p.show_on_homepage ? ' (Visible on HP)' : ' (Hidden)'}</span>`;

    tbody.innerHTML += `
      <tr>
        <td style="font-weight:600">${p.title}</td>
        <td>${p.activity}</td>
        <td>${p.price_pln} PLN</td>
        <td>${p.priority}</td>
        <td>${statusPill}</td>
        <td>
          <button class="btn-sm-edit" onclick="editPackageInAdmin('${p.id}')">Edit</button>
        </td>
      </tr>
    `;
  });
}

function editPackageInAdmin(id) {
  const p = globalPackages.find(x => x.id === id);
  if(!p) return;

  document.getElementById('admin-form-heading').innerText = `✏️ Edit Package: ${p.title}`;
  document.getElementById('pkg-form-id').value = p.id;
  document.getElementById('pkg-form-title').value = p.title;
  document.getElementById('pkg-form-slug').value = p.slug;
  document.getElementById('pkg-form-activity').value = p.activity;
  document.getElementById('pkg-form-location').value = p.location;
  document.getElementById('pkg-form-duration').value = p.duration_days;
  document.getElementById('pkg-form-difficulty').value = p.difficulty;
  document.getElementById('pkg-form-price-pln').value = p.price_pln;
  document.getElementById('pkg-form-price-eur').value = p.price_eur;
  document.getElementById('pkg-form-hero-img').value = p.hero_image_url;

  let galleryStr = '';
  if(Array.isArray(p.gallery_images)) galleryStr = p.gallery_images.join(', ');
  else if(typeof p.gallery_images === 'string') {
    try { galleryStr = JSON.parse(p.gallery_images).join(', '); }
    catch(e) { galleryStr = p.gallery_images; }
  }
  document.getElementById('pkg-form-gallery-imgs').value = galleryStr;

  document.getElementById('pkg-form-dates').value = p.available_dates ? p.available_dates.join(', ') : '';
  document.getElementById('pkg-form-amenities').value = p.amenities ? p.amenities.join(', ') : '';
  document.getElementById('pkg-form-desc').value = p.description;
  document.getElementById('pkg-form-itinerary').value = p.itinerary || '';
  document.getElementById('pkg-form-priority').value = p.priority || 0;

  document.getElementById('pkg-form-is-enabled').checked = p.is_enabled;
  document.getElementById('pkg-form-show-homepage').checked = p.show_on_homepage;
  toggleDisableOptions();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let adminBookingsList = [];
async function fetchAdminBookings() {
  const tbody = document.getElementById('admin-bookings-list-body');
  if(!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Loading bookings...</td></tr>';

  try {
    const { data, error } = await _supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if(error) throw error;
    adminBookingsList = data || [];
    populateAdminBookingFilters();
    renderAdminBookings(adminBookingsList);
  } catch(err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="7">Error loading bookings.</td></tr>';
  }
}

function populateAdminBookingFilters() {
  const pkgFilter = document.getElementById('booking-filter-pkg');
  const dateFilter = document.getElementById('booking-filter-date');
  if(!pkgFilter || !dateFilter) return;

  const pkgs = [...new Set(adminBookingsList.map(b => b.package_slug))];
  const dates = [...new Set(adminBookingsList.map(b => b.date))];

  pkgFilter.innerHTML = '<option value="">All Packages</option>' + pkgs.map(p => `<option value="${p}">${p}</option>`).join('');
  dateFilter.innerHTML = '<option value="">All Dates</option>' + dates.map(d => `<option value="${d}">${d}</option>`).join('');
}

function filterAdminBookings() {
  const search = document.getElementById('booking-search-input').value.toLowerCase();
  const pkg = document.getElementById('booking-filter-pkg').value;
  const date = document.getElementById('booking-filter-date').value;

  const filtered = adminBookingsList.filter(b => {
    let matchSearch = false;
    if(b.booking_reference.toLowerCase().includes(search)) matchSearch = true;
    if(b.guests && b.guests.some(g => g.name.toLowerCase().includes(search) || g.phone.includes(search))) matchSearch = true;

    if(search && !matchSearch) return false;
    if(pkg && b.package_slug !== pkg) return false;
    if(date && b.date !== date) return false;
    return true;
  });

  renderAdminBookings(filtered);
}

function renderAdminBookings(bookings) {
  const tbody = document.getElementById('admin-bookings-list-body');
  if(!tbody) return;
  tbody.innerHTML = '';

  if(bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>';
    return;
  }

  bookings.forEach(b => {
    let statusClass = 'status-pending';
    if(b.status === 'paid') statusClass = 'status-paid';
    if(b.status === 'failed') statusClass = 'status-failed';

    const primaryGuest = b.guests && b.guests.find(g => g.is_primary) || (b.guests && b.guests[0]) || {name: 'Unknown'};

    tbody.innerHTML += `
      <tr>
        <td style="font-weight:700;color:#2952c8">${b.booking_reference}</td>
        <td>${primaryGuest.name}</td>
        <td>${b.package_slug}</td>
        <td>${b.date}</td>
        <td>${b.num_guests}</td>
        <td style="font-weight:600">${b.total_price_pln} PLN</td>
        <td><span class="status-pill ${statusClass}">${b.status}</span></td>
      </tr>
    `;
  });
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('admin-login-card')) {
        initAdmin();
    }
});
