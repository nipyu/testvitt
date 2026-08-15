-- Supabase Schema for NNA VITTALO Adventure Travel

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create `packages` table
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    location TEXT NOT NULL,
    duration_days INT NOT NULL DEFAULT 1,
    price_pln NUMERIC(10, 2) NOT NULL,
    difficulty TEXT NOT NULL,
    description TEXT NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    hero_image_url TEXT,
    departure_dates DATE[] DEFAULT '{}'
);

-- 2. Create `bookings` table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    primary_contact_name TEXT NOT NULL,
    primary_contact_phone TEXT NOT NULL,
    primary_contact_email TEXT NOT NULL,
    primary_contact_location TEXT NOT NULL,
    number_of_guests INT NOT NULL DEFAULT 1,
    guest_details JSONB DEFAULT '[]'::jsonb,
    departure_date DATE NOT NULL,
    total_price_pln NUMERIC(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) & Access Policies
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to packages
CREATE POLICY "Allow public read access to packages" ON packages
    FOR SELECT USING (true);

-- Allow public insert access to bookings
CREATE POLICY "Allow public insert access to bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Allow public read access to bookings (for Manage Booking feature)
CREATE POLICY "Allow public select access to bookings" ON bookings
    FOR SELECT USING (true);

-- Seed Initial Adventure Packages
INSERT INTO packages (slug, title, activity_type, location, duration_days, price_pln, difficulty, description, amenities, hero_image_url, departure_dates)
VALUES
(
    'kayaking-getaway',
    'Kayaking Getaway — Rivers & Lakes',
    'Kayaking',
    'Wolka Kozodawska, Warsaw, Poland',
    1,
    259.00,
    'Beginner',
    'Paddle through scenic rivers and lakes. Suitable for everyone — beginners to experienced paddlers. Kayak, safety gear and a riverbank campsite all included. Experience peaceful waterways and pristine countryside views.',
    ARRAY['Kayak & Paddle Equipment', 'Professional Guide / Instructor', 'Meals & Snacks Included', 'Safety Gear & Life Jacket', 'Transport from Meeting Point'],
    'https://images.unsplash.com/photo-1554913968-6ba85b94df1f?w=800&auto=format&fit=crop',
    ARRAY['2026-04-26'::DATE, '2026-05-10'::DATE, '2026-06-01'::DATE]
),
(
    'surfing-camp',
    'Surfing Camp — Catch Your First Wave',
    'Surfing',
    'Baltic Coast, Gdansk, Poland',
    5,
    899.00,
    'Beginner',
    'Feel the power of the ocean! A 5-day surf camp with pro instructors. Board, wetsuit and beachside accommodation all included. Learn wave reading, popping up, and catching coastal swells.',
    ARRAY['Surfboard & Wetsuit Rental', 'Pro Surf Instructor', 'Beachside Lodging Included', 'Daily Breakfast & Lunch', 'Safety Briefings & Video Analysis'],
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop',
    ARRAY['2026-05-15'::DATE, '2026-06-12'::DATE, '2026-07-10'::DATE]
),
(
    'hiking-in-tatra',
    'Hiking in Tatra — Mountain Trails',
    'Hiking',
    'Tatra National Park, Zakopane, Poland',
    3,
    399.00,
    'Intermediate',
    'Discover the magic of the Polish mountains. Morskie Oko, Rysy peak, Kościeliska Valley. Experienced Tatra mountain guide included alongside mountain shelter accommodation.',
    ARRAY['Certified Mountain Guide', 'Hut Accommodation', 'Topographic Map & Compass', 'Trail Meals & Hydration', 'National Park Entry Passes'],
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop',
    ARRAY['2026-05-20'::DATE, '2026-06-18'::DATE, '2026-07-15'::DATE]
),
(
    'ski-trip-alps',
    'Ski Trip — Alpine Slopes Adventure',
    'Skiing',
    'Tatra Mountains / Alps, Poland',
    4,
    999.00,
    'Intermediate',
    'White slopes, adrenaline and après-ski. Ski school, equipment rental, lift pass and a cosy mountain lodge all in the price for an unforgettable winter escape.',
    ARRAY['Skipass Included', 'Ski & Boot Equipment', 'Mountain Lodge Stay', 'Professional Ski Instructor', 'Après-ski Evening Pass'],
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop',
    ARRAY['2026-11-15'::DATE, '2026-12-05'::DATE, '2027-01-10'::DATE]
),
(
    'camping-weekend',
    'Camping Weekend — Stars & Campfire',
    'Camping',
    'Polish Countryside / Forests, Poland',
    3,
    259.00,
    'Beginner',
    'Escape the city for 3 days of wild adventures, bonfires and sleeping under a sky full of stars. Tent, sleeping bag and all campfire meals included.',
    ARRAY['Tent & Thermal Sleeping Bag', 'Campfire Meals & BBQ', 'Outdoor Games & Gear', 'Experienced Outdoor Leader', 'First Aid & Safety Kit'],
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop',
    ARRAY['2026-05-01'::DATE, '2026-06-05'::DATE, '2026-07-03'::DATE]
),
(
    'auschwitz-memorial-tour',
    'Auschwitz-Birkenau — Memorial & Museum Tour',
    'City Tours',
    'Oświęcim, Poland',
    1,
    299.00,
    'Beginner',
    'A deeply moving guided tour of the Auschwitz-Birkenau Memorial and Museum. Expert historians guide you through this UNESCO World Heritage site with round-trip transport.',
    ARRAY['Official Museum Entry Ticket', 'Expert Historian Guide', 'Round-trip Air-conditioned Transport', 'Headset Audio System', 'Information Booklet'],
    'https://images.unsplash.com/photo-1574715826360-7c02d0153097?w=800&auto=format&fit=crop',
    ARRAY['2026-05-05'::DATE, '2026-05-19'::DATE, '2026-06-09'::DATE]
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    activity_type = EXCLUDED.activity_type,
    location = EXCLUDED.location,
    duration_days = EXCLUDED.duration_days,
    price_pln = EXCLUDED.price_pln,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    amenities = EXCLUDED.amenities,
    hero_image_url = EXCLUDED.hero_image_url,
    departure_dates = EXCLUDED.departure_dates;
