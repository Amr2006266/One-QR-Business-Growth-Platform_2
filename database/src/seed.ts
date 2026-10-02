import { dbService } from "./db.ts";
import { scryptSync, randomBytes } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const derived = scryptSync(password, salt, 64);
  return `${salt}.${derived.toString("base64url")}`;
}

export function runSeed() {
  console.log("🌱 Starting database seeding for OneQR...");

  // 1. Create Default Users (Tester, Google User, Apple User)
  const defaultPasswordHash = hashPassword("password123456");

  // Main tester user
  let testerUser = dbService.getUserByEmail("tester@oneqr.com");
  if (!testerUser) {
    testerUser = dbService.createUser({
      id: "usr_tester_01",
      email: "tester@oneqr.com",
      name: "Ahmed Hassan (Tester)",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      passwordHash: defaultPasswordHash,
      authProvider: "email",
      subscriptionPlan: "business",
      subscriptionStatus: "active",
      isAdmin: true,
      isSuspended: false,
    });
    console.log("✅ Created tester user: tester@oneqr.com (password: password123456)");
  }

  // Google OAuth User
  let googleUser = dbService.getUserByEmail("google.tester@gmail.com");
  if (!googleUser) {
    googleUser = dbService.createUser({
      id: "usr_google_02",
      email: "google.tester@gmail.com",
      name: "Google Verified User",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      authProvider: "google",
      authProviderId: "google_oauth_sub_109283746",
      subscriptionPlan: "pro",
      subscriptionStatus: "active",
      isAdmin: false,
      isSuspended: false,
    });
    console.log("✅ Created Google OAuth user: google.tester@gmail.com");
  }

  // Apple OAuth User
  let appleUser = dbService.getUserByEmail("apple.tester@privaterelay.appleid.com");
  if (!appleUser) {
    appleUser = dbService.createUser({
      id: "usr_apple_03",
      email: "apple.tester@privaterelay.appleid.com",
      name: "Apple Verified User",
      avatarUrl: null,
      authProvider: "apple",
      authProviderId: "apple_oauth_sub_847362519",
      subscriptionPlan: "pro",
      subscriptionStatus: "active",
      isAdmin: false,
      isSuspended: false,
    });
    console.log("✅ Created Apple OAuth user: apple.tester@privaterelay.appleid.com");
  }

  // 2. Create Dummy Business: "Brew & Bite Lounge"
  const businessSlug = "brew-and-bite";
  let business = dbService.getBusinessBySlug(businessSlug);

  if (!business) {
    business = dbService.createBusiness({
      id: "biz_brew_bite_01",
      ownerId: testerUser.id,
      name: "Brew & Bite Lounge",
      slug: businessSlug,
      description: "Artisan Coffee, Gourmet Burgers & Handcrafted Desserts in the heart of Cairo. Scan to browse our menu, get special deals, and connect with us.",
      category: "cafe",
      logoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      primaryColor: "#15803d",
      phone: "+20 100 987 6543",
      email: "hello@brewandbite.com",
      website: "https://brewandbite.example.com",
      address: "15 Nile Corniche, Downtown Cairo",
      city: "Cairo",
      country: "Egypt",
      googleMapsUrl: "https://maps.google.com/?q=Brew+And+Bite+Cairo",
      googlePlaceId: "ChIJ_z_dummy_place_id",
      googleReviewUrl: "https://g.page/r/brewandbite/review",
      rating: 4.9,
      reviewCount: 385,
      whatsappNumber: "+201009876543",
      totalScans: 142,
      totalClicks: 289,
      isActive: true,
    });
    console.log(`✅ Created dummy business: ${business.name} (/b/${business.slug})`);

    // 3. Create Social Media Ads & Links
    const links = [
      {
        id: "lnk_fb_01",
        platform: "facebook" as const,
        label: "Facebook Official Page & Summer Ad Promo",
        url: "https://facebook.com/brewandbite.official",
        displayOrder: 1,
        clicks: 52,
      },
      {
        id: "lnk_ig_02",
        platform: "instagram" as const,
        label: "Instagram Reels & Behind The Scenes Ad",
        url: "https://instagram.com/brewandbite",
        displayOrder: 2,
        clicks: 98,
      },
      {
        id: "lnk_tt_03",
        platform: "tiktok" as const,
        label: "TikTok Viral Food Videos & Special Ad",
        url: "https://tiktok.com/@brewandbite",
        displayOrder: 3,
        clicks: 74,
      },
      {
        id: "lnk_wa_04",
        platform: "whatsapp" as const,
        label: "Chat directly on WhatsApp (Order & Support)",
        url: "https://wa.me/201009876543",
        displayOrder: 4,
        clicks: 65,
      },
      {
        id: "lnk_web_05",
        platform: "website" as const,
        label: "Visit Our Official Website & Order Online",
        url: "https://brewandbite.example.com",
        displayOrder: 5,
        clicks: 40,
      },
      {
        id: "lnk_maps_06",
        platform: "google_maps" as const,
        label: "Get Directions on Google Maps",
        url: "https://maps.google.com/?q=Brew+And+Bite+Cairo",
        displayOrder: 6,
        clicks: 85,
      },
      {
        id: "lnk_review_07",
        platform: "google_review" as const,
        label: "⭐ Leave a 5-Star Google Review",
        url: "https://g.page/r/brewandbite/review",
        displayOrder: 7,
        clicks: 110,
      },
    ];

    for (const link of links) {
      dbService.createLink({ ...link, businessId: business.id });
    }
    console.log(`✅ Created ${links.length} social media ad links`);

    // 4. Create Menu / Services / Promos
    const menuOffers = [
      {
        id: "off_01",
        title: "Signature Spanish Latte",
        description: "Double shot of premium espresso with sweetened condensed milk and cinnamon velvet foam.",
        price: "95 EGP",
        emoji: "☕",
        tag: "Bestseller",
        expiresAt: "Ongoing",
      },
      {
        id: "off_02",
        title: "Smoked Wagyu Gourmet Burger",
        description: "200g Black Angus Wagyu beef, truffle garlic aioli, aged English cheddar, caramelized onions on buttery brioche.",
        price: "220 EGP",
        emoji: "🍔",
        tag: "Chef's Special",
        expiresAt: "Ongoing",
      },
      {
        id: "off_03",
        title: "Pistachio San Sebastian Cheesecake",
        description: "Traditional Basque burnt cheesecake served warm with melted Belgian white chocolate & pure Sicilian pistachio cream.",
        price: "130 EGP",
        emoji: "🍰",
        tag: "Popular",
        expiresAt: "Ongoing",
      },
      {
        id: "off_04",
        title: "Weekend Ad Promo: Buy 1 Drink Get 1 Free!",
        description: "Exclusive social media ad reward! Show this screen at the cashier to redeem your free specialty beverage.",
        price: "FREE 🎁",
        emoji: "🎉",
        tag: "Ad Campaign Deal",
        expiresAt: "Limited Time",
      },
    ];

    for (const offer of menuOffers) {
      dbService.createOffer({ ...offer, businessId: business.id });
    }
    console.log(`✅ Created ${menuOffers.length} menu & promotional items`);

    // 5. Create Default Dynamic QR Code
    const qr = dbService.createQRCode({
      id: "qr_brew_bite_01",
      businessId: business.id,
      label: "Main Counter & Table Display QR",
      destinationUrl: `http://localhost:5173/b/${business.slug}`,
      scans: 142,
    });
    console.log(`✅ Created QR code: ${qr.label} -> ${qr.destinationUrl}`);

    // 6. Generate Realistic Past 7 Days Analytics Events
    const now = new Date();
    const eventTypes: Array<{ type: any; count: number; label?: string }> = [
      { type: "qr_scan", count: 142 },
      { type: "google_review_click", count: 78, label: "Google Review" },
      { type: "google_maps_click", count: 62, label: "Google Maps" },
      { type: "whatsapp_click", count: 45, label: "WhatsApp" },
      { type: "link_click", count: 50, label: "Instagram" },
      { type: "link_click", count: 32, label: "Facebook" },
      { type: "link_click", count: 28, label: "TikTok" },
      { type: "website_click", count: 22, label: "Website" },
    ];

    let eventIdx = 0;
    for (const item of eventTypes) {
      for (let i = 0; i < item.count; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const eventDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 36000000);
        dbService.recordEvent({
          id: `ev_${eventIdx++}`,
          businessId: business.id,
          eventType: item.type,
          targetLabel: item.label,
          ipHash: `ip_hash_${Math.floor(Math.random() * 100)}`,
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
          createdAt: eventDate.toISOString(),
        });
      }
    }
    console.log("✅ Seeded realistic analytics events across 7 days");
  }

  console.log("✨ Database seeding complete!");
  return { business, testerUser };
}

// Run if directly called
runSeed();
