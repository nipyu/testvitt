// pages/manage-booking.js

// Reuses handleManageBookingSearch from components/modals.js
// We just need to make sure the modal wrapper isn't required.

document.addEventListener('DOMContentLoaded', () => {
  // If we are on manage-booking.html, ensure the result container is hidden on load
  const resContainer = document.getElementById('mb-result-container');
  if(resContainer) {
    resContainer.style.display = 'none';
  }
});
