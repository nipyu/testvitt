// components/modals.js

let currentBookingPkg = null;

function openBookingModal(pkg, defaultDate, defaultGuests = 1) {
  currentBookingPkg = pkg;
  document.getElementById('bookingModal').style.display = 'flex';
  document.getElementById('bm-pkg-name').innerText = pkg.title;
  document.getElementById('bm-pkg-loc').innerText = `📍 ${pkg.location}`;

  const dateSelect = document.getElementById('bm-date-select');
  dateSelect.innerHTML = '';
  if (pkg.available_dates && pkg.available_dates.length > 0) {
    pkg.available_dates.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.innerText = d;
      if (d === defaultDate) opt.selected = true;
      dateSelect.appendChild(opt);
    });
  } else {
    const opt = document.createElement('option');
    opt.value = '';
    opt.innerText = 'No dates available';
    dateSelect.appendChild(opt);
  }

  const guestsSelect = document.getElementById('bm-guests-select');
  guestsSelect.innerHTML = '';
  for(let i=1; i<=20; i++){
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerText = `${i} Guest${i > 1 ? 's' : ''}`;
    if (i === defaultGuests) opt.selected = true;
    guestsSelect.appendChild(opt);
  }

  renderGuestDetailsInputs();
  updateBookingModalPriceSummary();
}

function closeBookingModal() {
  document.getElementById('bookingModal').style.display = 'none';
  document.getElementById('bookingForm').reset();
  currentBookingPkg = null;
}

function renderGuestDetailsInputs() {
  const numGuests = parseInt(document.getElementById('bm-guests-select').value) || 1;
  const wrapper = document.getElementById('bm-additional-guests-wrapper');
  wrapper.innerHTML = '';

  for(let i=2; i<=numGuests; i++) {
    wrapper.innerHTML += `
      <div style="margin-top:16px; padding-top:16px; border-top:1px dashed #cbd5e0;">
        <div style="font-family:'Montserrat',sans-serif;font-weight:700;font-size:.85rem;color:#4a5568;margin-bottom:8px">Guest ${i} Details</div>
        <input type="text" class="form-input" id="bm-guest-${i}-name" placeholder="Guest ${i} Name" required>
        <input type="email" class="form-input" id="bm-guest-${i}-email" placeholder="Guest ${i} Email" required>
        <input type="tel" class="form-input" id="bm-guest-${i}-phone" placeholder="Guest ${i} Phone (Optional)">
        <input type="text" class="form-input" id="bm-guest-${i}-location" placeholder="Guest ${i} Location (Optional)">
      </div>
    `;
  }
}

function updateBookingModalPriceSummary() {
  if(!currentBookingPkg) return;
  const numGuests = parseInt(document.getElementById('bm-guests-select').value) || 1;
  const totalPln = currentBookingPkg.price_pln * numGuests;
  const totalEur = currentBookingPkg.price_eur * numGuests;

  document.getElementById('bm-total-price').innerText = `${totalPln.toFixed(2)} PLN`;
  document.getElementById('bm-total-price-eur').innerText = `~${totalEur.toFixed(2)} EUR`;
}

function openManageBookingModal() {
  document.getElementById('manageBookingModal').style.display = 'flex';
  document.getElementById('mb-result-container').style.display = 'none';
  document.getElementById('mb-ref-phone').value = '';
  document.getElementById('mb-lastname').value = '';
}

function closeManageBookingModal() {
  document.getElementById('manageBookingModal').style.display = 'none';
}

async function handleManageBookingSearch(event) {
  event.preventDefault();
  const searchVal = document.getElementById('mb-ref-phone').value.trim();
  const lastName = document.getElementById('mb-lastname').value.trim().toLowerCase();
  const btn = document.getElementById('mb-search-btn');
  const resContainer = document.getElementById('mb-result-container');

  if(!searchVal || !lastName) {
    showToast("Please fill both fields.");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Searching...";
  resContainer.style.display = 'none';

  try {
    let query = _supabase.from('bookings').select('*');
    if (searchVal.startsWith('NNA-')) {
      query = query.eq('booking_reference', searchVal.toUpperCase());
    } else {
      query = query.contains('guests', `[{"phone":"${searchVal}"}]`);
    }

    const { data, error } = await query;
    if(error) throw error;

    let matchedBooking = null;
    if(data && data.length > 0) {
      matchedBooking = data.find(b => {
        if(!b.guests || b.guests.length === 0) return false;
        return b.guests.some(g => g.name.toLowerCase().includes(lastName));
      });
    }

    if(!matchedBooking) {
      showToast("No matching booking found.");
      btn.disabled = false;
      btn.innerText = "Find My Booking";
      return;
    }

    // Render matches
    resContainer.style.display = 'block';

    let statusColor = '#94a3b8';
    if(matchedBooking.status === 'paid') statusColor = '#22c55e';
    if(matchedBooking.status === 'pending') statusColor = '#eab308';
    if(matchedBooking.status === 'failed') statusColor = '#ef4444';

    let guestsHtml = matchedBooking.guests.map(g => `<div>• ${g.name} ${g.is_primary ? '(Primary)' : ''}</div>`).join('');

    resContainer.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #dde4f5; border-radius:12px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h4 style="font-family:'Montserrat',sans-serif;font-weight:800;color:#0f2266;font-size:1.1rem;margin:0;">Ref: ${matchedBooking.booking_reference}</h4>
          <span style="background:${statusColor}; color:#fff; padding:4px 10px; border-radius:20px; font-size:.75rem; font-weight:700; text-transform:uppercase;">${matchedBooking.status}</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:.85rem; color:#4a5568; margin-bottom:16px;">
          <div><strong>Package ID:</strong> ${matchedBooking.package_slug}</div>
          <div><strong>Date:</strong> ${matchedBooking.date}</div>
          <div><strong>Guests:</strong> ${matchedBooking.num_guests}</div>
          <div><strong>Total:</strong> ${matchedBooking.total_price_pln} PLN</div>
        </div>
        <div style="font-size:.85rem; color:#4a5568; border-top:1px solid #e2e8f0; padding-top:12px;">
          <strong style="display:block;margin-bottom:6px;">Guest List:</strong>
          ${guestsHtml}
        </div>
        ${matchedBooking.status === 'pending' ? `
          <div style="margin-top:16px;">
            <a href="https://buy.stripe.com/7sY6oG5aI3MKcVW4i148001?booking_reference=${matchedBooking.booking_reference}&total_price=${matchedBooking.total_price_pln}"
               target="_blank" style="display:block; text-align:center; background:#2952c8; color:#fff; padding:10px; border-radius:8px; font-family:'Montserrat',sans-serif; font-weight:700; text-decoration:none; font-size:.85rem;">
               Complete Payment Now
            </a>
          </div>
        ` : ''}
      </div>
    `;

  } catch(err) {
    console.error(err);
    showToast("An error occurred during search.");
  } finally {
    btn.disabled = false;
    btn.innerText = "Find My Booking";
  }
}
