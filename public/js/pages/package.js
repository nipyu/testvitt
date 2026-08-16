// pages/package.js

let currentPackage = null;

async function initPackagePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    window.location.href = 'index.html';
    return;
  }

  await fetchPackages();
  currentPackage = globalPackages.find(p => p.slug === slug);

  if (!currentPackage) {
    document.getElementById('package-view').innerHTML = '<div style="padding:100px;text-align:center;"><h2>Package not found.</h2><a href="index.html">Return Home</a></div>';
    return;
  }

  renderPackageView(currentPackage);
}

function renderPackageView(pkg) {
  document.getElementById('pkg-view-img').src = pkg.hero_image_url || 'https://images.unsplash.com/photo-1554913968-6ba85b94df1f?w=800';
  document.getElementById('pkg-view-title').innerText = pkg.title;
  document.getElementById('pkg-view-location').innerText = pkg.location;
  document.getElementById('pkg-view-activity').innerText = pkg.activity;
  document.getElementById('pkg-view-duration').innerText = `${pkg.duration_days} Day${pkg.duration_days > 1 ? 's' : ''}`;
  document.getElementById('pkg-view-desc').innerText = pkg.description;

  const badges = document.getElementById('pkg-view-badges');
  badges.innerHTML = '';
  let diffColor = '#22c55e';
  if(pkg.difficulty === 'Medium') diffColor = '#eab308';
  if(pkg.difficulty === 'Hard') diffColor = '#ef4444';
  badges.innerHTML += `<span class="pkg-badge" style="background:${diffColor}">${pkg.difficulty}</span>`;

  const carousel = document.getElementById('pkg-view-carousel');
  carousel.innerHTML = '';
  let galleryImgs = [];
  try {
    galleryImgs = JSON.parse(pkg.gallery_images);
  } catch(e) {
    if(typeof pkg.gallery_images === 'string' && pkg.gallery_images.length > 5) {
      galleryImgs = pkg.gallery_images.split(',').map(s=>s.trim());
    } else {
      galleryImgs = [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop'
      ];
    }
  }

  galleryImgs.forEach(url => {
    carousel.innerHTML += `
      <div class="pkg-carousel-item">
        <img src="${url}" alt="Gallery Image" loading="lazy">
      </div>
    `;
  });

  const amenities = document.getElementById('pkg-view-amenities');
  amenities.innerHTML = '';
  if (pkg.amenities && Array.isArray(pkg.amenities)) {
    pkg.amenities.forEach(a => {
      amenities.innerHTML += `<div class="pkg-amenity-item">✔️ ${a}</div>`;
    });
  }

  const itinSelect = document.getElementById('itinerary-dropdown-select');
  const itinContent = document.getElementById('itinerary-content-display');

  if (pkg.itinerary && pkg.itinerary.trim() !== '') {
    const lines = pkg.itinerary.split('\n');
    window._itinLines = lines;

    itinSelect.innerHTML = '<option value="-1">-- Select a Day --</option>';
    lines.forEach((line, index) => {
      const parts = line.split(':');
      const title = parts[0] ? parts[0].trim() : `Day ${index + 1}`;
      itinSelect.innerHTML += `<option value="${index}">${title}</option>`;
    });

    itinContent.innerHTML = "Select an option above to view details.";
    document.getElementById('pkg-view-itinerary-wrapper').style.display = 'block';
  } else {
    document.getElementById('pkg-view-itinerary-wrapper').style.display = 'none';
  }

  const ctaBtn = document.getElementById('pkg-view-book-btn');
  const floatBtn = document.getElementById('pkg-view-float-book-btn');

  if(!pkg.is_enabled) {
    if(ctaBtn) {
      ctaBtn.innerText = 'Coming Soon';
      ctaBtn.classList.add('disabled');
      ctaBtn.onclick = null;
    }
    if(floatBtn) {
      floatBtn.innerText = 'Coming Soon';
      floatBtn.classList.add('disabled');
      floatBtn.onclick = null;
    }
    const heroOverlay = document.querySelector('.pkg-hero-overlay');
    if(heroOverlay && !document.getElementById('pkg-coming-soon-badge-hero')) {
      const b = document.createElement('div');
      b.id = 'pkg-coming-soon-badge-hero';
      b.style = "position:absolute;top:20px;right:20px;background:rgba(239, 68, 68, 0.9);color:#fff;font-family:'Montserrat',sans-serif;font-weight:800;font-size:0.8rem;padding:6px 14px;border-radius:8px;z-index:10;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 12px rgba(0,0,0,0.3);";
      b.innerText = "Coming Soon";
      heroOverlay.appendChild(b);
    }
  } else {
    if(ctaBtn) {
      ctaBtn.innerText = 'Book This Trip';
      ctaBtn.classList.remove('disabled');
      ctaBtn.onclick = () => openBookingModal(pkg, pkg.available_dates?.[0], 1);
    }
    if(floatBtn) {
      floatBtn.innerText = 'Book Now';
      floatBtn.classList.remove('disabled');
      floatBtn.onclick = () => openBookingModal(pkg, pkg.available_dates?.[0], 1);
    }
  }

  document.getElementById('pkg-view-price-pln').innerText = `${pkg.price_pln.toFixed(2)} PLN`;
  document.getElementById('pkg-view-price-eur').innerText = `(~${pkg.price_eur.toFixed(2)} EUR)`;

  const datesBadges = document.getElementById('pkg-view-dates-badges');
  datesBadges.innerHTML = '';
  if (pkg.available_dates && pkg.available_dates.length > 0) {
    pkg.available_dates.forEach(d => {
      datesBadges.innerHTML += `<span class="pkg-date-badge">📅 ${d}</span>`;
    });
  } else {
    datesBadges.innerHTML = '<span class="pkg-date-badge">Contact for dates</span>';
  }
}

function handleItinerarySelectChange() {
  const select = document.getElementById('itinerary-dropdown-select');
  const contentDisplay = document.getElementById('itinerary-content-display');
  const val = select.value;

  if (val === "-1") {
    contentDisplay.innerHTML = "Select an option above to view details.";
    return;
  }

  const lines = window._itinLines;
  if (lines && lines[val]) {
    const parts = lines[val].split(':');
    if (parts.length > 1) {
      contentDisplay.innerHTML = parts.slice(1).join(':').trim();
    } else {
      contentDisplay.innerHTML = lines[val].trim();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('pkg-view-title')) {
        initPackagePage();
    }
});
