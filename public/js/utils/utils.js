// utils.js
const PLN_TO_EUR = 0.23;

function showToast(msg) {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => {
    t.classList.remove('show');
  }, 3000);
}

function subscribeNewsletter() {
  const email = document.getElementById('nlEmail').value;
  if(!email) return;
  showToast('Subscribed to Newsletter!');
  document.getElementById('nlEmail').value = '';
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}
