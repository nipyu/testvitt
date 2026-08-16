// api/bookings.js

async function handleBookingSubmit(event) {
  event.preventDefault();

  if(!currentBookingPkg) {
    showToast('Error: No package selected');
    return;
  }

  const submitBtn = document.getElementById('bm-submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Processing...';

  const dateSelect = document.getElementById('bm-date-select').value;
  const numGuests = parseInt(document.getElementById('bm-guests-select').value) || 1;
  const primaryName = document.getElementById('bm-primary-name').value;
  const primaryEmail = document.getElementById('bm-primary-email').value;
  const primaryPhone = document.getElementById('bm-primary-phone').value;
  const primaryLocation = document.getElementById('bm-primary-location').value;

  const guests = [];
  guests.push({
    name: primaryName,
    email: primaryEmail,
    phone: primaryPhone,
    location: primaryLocation,
    is_primary: true
  });

  for(let i = 2; i <= numGuests; i++) {
    guests.push({
      name: document.getElementById(`bm-guest-${i}-name`).value,
      email: document.getElementById(`bm-guest-${i}-email`).value,
      phone: document.getElementById(`bm-guest-${i}-phone`).value || '',
      location: document.getElementById(`bm-guest-${i}-location`).value || '',
      is_primary: false
    });
  }

  const bookingReference = 'NNA-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const totalPricePln = currentBookingPkg.price_pln * numGuests;
  const totalPriceEur = currentBookingPkg.price_eur * numGuests;

  try {
    const { data, error } = await _supabase
      .from('bookings')
      .insert([
        {
          package_id: currentBookingPkg.id,
          package_slug: currentBookingPkg.slug,
          booking_reference: bookingReference,
          date: dateSelect,
          num_guests: numGuests,
          total_price_pln: totalPricePln,
          total_price_eur: totalPriceEur,
          status: 'pending',
          guests: guests
        }
      ]);

    if(error) throw error;

    showToast('Booking initiated! Redirecting to payment...');
    const stripeBaseUrl = "https://buy.stripe.com/7sY6oG5aI3MKcVW4i148001";
    setTimeout(() => {
      window.location.href = `${stripeBaseUrl}?booking_reference=${bookingReference}&total_price=${totalPricePln}`;
    }, 1500);

  } catch(err) {
    console.error(err);
    showToast('Error saving booking. Please try again.');
    submitBtn.disabled = false;
    submitBtn.innerText = 'Confirm Booking';
  }
}
