// api/packages.js

// Using the global _supabase client initialized in supabaseClient.js
let globalPackages = [];

async function fetchPackages() {
  try {
    const { data, error } = await _supabase.from('packages').select('*');
    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    if (data && data.length > 0) {
      globalPackages = data;
    } else {
      globalPackages = fallbackPackages; // defined in data
    }
  } catch (err) {
    console.error('Failed to fetch from Supabase. Using fallback.', err);
    globalPackages = fallbackPackages;
  }
}

const fallbackPackages = [
  {
    id: 'pkg-1',
    slug: 'kayaking-getaway',
    title: 'Kayaking Getaway — Rivers & Lakes',
    location: 'Wolka Kozodawska, Warsaw, Poland',
    activity: 'Kayaking',
    duration_days: 1,
    difficulty: 'Easy',
    price_pln: 259.00,
    price_eur: 59.50,
    hero_image_url: 'https://images.unsplash.com/photo-1554913968-6ba85b94df1f?w=800&auto=format&fit=crop',
    available_dates: ['2026-04-26', '2026-05-10', '2026-06-01'],
    amenities: ['Kayak Equipment', 'Safety Gear', 'Guide', 'Transport'],
    description: 'Experience the serene rivers just outside Warsaw...',
    itinerary: 'Morning: Arrival & Briefing\nAfternoon: River Kayaking',
    is_enabled: true,
    show_on_homepage: true,
    priority: 0
  },
  {
    id: 'pkg-2',
    slug: 'mountain-trek',
    title: 'Tatra Mountain Trek — Peaks & Valleys',
    location: 'Zakopane, Poland',
    activity: 'Hiking',
    duration_days: 3,
    difficulty: 'Medium',
    price_pln: 850.00,
    price_eur: 195.50,
    hero_image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop',
    available_dates: ['2026-07-15', '2026-08-10', '2026-09-05'],
    amenities: ['Guide', 'Accommodation', 'Meals', 'Transport'],
    description: 'Explore the stunning Tatra Mountains with experienced guides...',
    itinerary: 'Day 1: Arrival & Acclimatization\nDay 2: Peak Summit\nDay 3: Descent & Departure',
    is_enabled: true,
    show_on_homepage: true,
    priority: 0
  },
  {
    id: 'pkg-3',
    slug: 'cycling-tour',
    title: 'Masurian Lakes Cycling Tour',
    location: 'Masuria, Poland',
    activity: 'Cycling',
    duration_days: 2,
    difficulty: 'Easy',
    price_pln: 450.00,
    price_eur: 103.50,
    hero_image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop',
    available_dates: ['2026-05-20', '2026-06-15', '2026-07-10'],
    amenities: ['Bike Rental', 'Guide', 'Accommodation', 'Meals'],
    description: 'Cycle through the picturesque Masurian Lake District...',
    itinerary: 'Day 1: Arrival & Briefing\nDay 2: Lake Cycling Tour',
    is_enabled: true,
    show_on_homepage: true,
    priority: 0
  },
  {
    id: 'pkg-4',
    slug: 'winter-skiing',
    title: 'Winter Skiing Adventure',
    location: 'Zakopane, Poland',
    activity: 'Skiing',
    duration_days: 4,
    difficulty: 'Hard',
    price_pln: 1200.00,
    price_eur: 276.00,
    hero_image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop',
    available_dates: ['2026-01-15', '2026-02-10', '2026-03-05'],
    amenities: ['Ski Pass', 'Equipment Rental', 'Accommodation', 'Meals'],
    description: 'Hit the slopes in the beautiful winter wonderland of Zakopane...',
    itinerary: 'Day 1: Arrival & Gear Fitting\nDay 2-3: Skiing\nDay 4: Departure',
    is_enabled: true,
    show_on_homepage: true,
    priority: 0
  },
  {
    id: 'pkg-5',
    slug: 'camping-retreat',
    title: 'Forest Camping Retreat',
    location: 'Bialowieza, Poland',
    activity: 'Camping',
    duration_days: 2,
    difficulty: 'Easy',
    price_pln: 300.00,
    price_eur: 69.00,
    hero_image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop',
    available_dates: ['2026-05-15', '2026-06-10', '2026-07-05'],
    amenities: ['Tent', 'Sleeping Bag', 'Meals', 'Guide'],
    description: 'Immerse yourself in nature with a guided camping trip in the primeval Bialowieza Forest...',
    itinerary: 'Day 1: Arrival & Setup\nDay 2: Forest Hike & Departure',
    is_enabled: true,
    show_on_homepage: true,
    priority: 0
  },
  {
    id: 'pkg-6',
    slug: 'rock-climbing',
    title: 'Jura Rock Climbing Experience',
    location: 'Krakow-Czestochowa Upland, Poland',
    activity: 'Climbing',
    duration_days: 1,
    difficulty: 'Medium',
    price_pln: 350.00,
    price_eur: 80.50,
    hero_image_url: 'https://images.unsplash.com/photo-1574715826360-7c02d0153097?w=800&auto=format&fit=crop',
    available_dates: ['2026-04-20', '2026-05-15', '2026-06-10'],
    amenities: ['Climbing Gear', 'Guide', 'Transport'],
    description: 'Challenge yourself with guided rock climbing in the scenic Jura region...',
    itinerary: 'Morning: Arrival & Safety Briefing\nAfternoon: Climbing Sessions',
    is_enabled: false,
    show_on_homepage: true,
    priority: 1
  }
];
