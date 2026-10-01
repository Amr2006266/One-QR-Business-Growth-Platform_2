import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Facebook,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  QrCode,
  Share2,
  Star,
  Twitter,
  Youtube,
} from "lucide-react";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  googleMapsUrl: string | null;
  googleReviewUrl: string | null;
  whatsappNumber: string | null;
};

type SocialLink = {
  id: string;
  platform: string;
  label: string | null;
  url: string;
};

type Offer = {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  expiresAt: string | null;
};

type PublicProfile = { business: Business; links: SocialLink[]; offers: Offer[] };

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  twitter: Twitter,
  youtube: Youtube,
  whatsapp: MessageCircle,
  website: Globe,
  custom: ArrowUpRight,
};

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function eventForLink(platform: string) {
  if (platform === "google_review") return "google_review_click";
  if (platform === "google_maps") return "google_maps_click";
  if (platform === "phone") return "phone_click";
  if (platform === "whatsapp") return "whatsapp_click";
  if (platform === "website") return "website_click";
  return "link_click";
}

export default function PublicBusinessPage({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share page");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/b/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Profile unavailable");
        return response.json() as Promise<PublicProfile>;
      })
      .then(setProfile)
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  const track = (platform: string, targetId?: string, targetLabel?: string) => {
    if (!profile) return;
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: profile.business.id,
        eventType: eventForLink(platform),
        targetId,
        targetLabel,
      }),
      keepalive: true,
    }).catch(() => undefined);
  };

  const sharePage = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: profile?.business.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel("Link copied");
        window.setTimeout(() => setShareLabel("Share page"), 1800);
      }
    } catch {
      setShareLabel("Share page");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f2] px-5 py-20 text-center text-sm text-gray-500">
        Loading business profile...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#f5f6f2] px-5 py-20 text-center">
        <QrCode className="mx-auto mb-4 h-8 w-8 text-emerald-700" />
        <h1 className="text-xl font-bold text-gray-900">This OneQR page is unavailable</h1>
        <p className="mt-2 text-sm text-gray-600">Check the link or try again later.</p>
        <a href="/" className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:underline">Go to OneQR</a>
      </main>
    );
  }

  const { business, links, offers } = profile;
  const primaryColor = business.primaryColor ?? "#15803d";
  const actions = [
    isHttpUrl(business.googleReviewUrl) && {
      id: "google-review",
      platform: "google_review",
      label: "Leave a Google review",
      url: business.googleReviewUrl,
      Icon: Star,
    },
    isHttpUrl(business.googleMapsUrl) && {
      id: "google-maps",
      platform: "google_maps",
      label: "Get directions",
      url: business.googleMapsUrl,
      Icon: MapPin,
    },
    business.phone && {
      id: "phone",
      platform: "phone",
      label: `Call ${business.name}`,
      url: `tel:${business.phone.replace(/[^+\d]/g, "")}`,
      Icon: Phone,
    },
    business.whatsappNumber && {
      id: "whatsapp",
      platform: "whatsapp",
      label: "Chat on WhatsApp",
      url: `https://wa.me/${business.whatsappNumber.replace(/\D/g, "")}`,
      Icon: MessageCircle,
    },
    isHttpUrl(business.website) && {
      id: "website",
      platform: "website",
      label: "Visit our website",
      url: business.website,
      Icon: Globe,
    },
    ...links.filter((link) => isHttpUrl(link.url)).map((link) => ({
      id: link.id,
      platform: link.platform,
      label: link.label || `Visit ${link.platform}`,
      url: link.url,
      Icon: platformIcons[link.platform as keyof typeof platformIcons] ?? ArrowUpRight,
    })),
  ].filter((action): action is NonNullable<typeof action> => Boolean(action));

  return (
    <main className="min-h-screen bg-[#f5f6f2] px-4 py-6 sm:py-10" style={{ "--profile-accent": primaryColor } as React.CSSProperties}>
      <article className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-900/5">
        <header className="relative flex min-h-48 items-end overflow-hidden bg-cover bg-center p-5" style={{ backgroundColor: primaryColor, backgroundImage: business.coverImageUrl ? `linear-gradient(0deg, ${primaryColor}cc, transparent), url(${business.coverImageUrl})` : undefined }}>
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"><QrCode className="h-3.5 w-3.5" /> OneQR</span>
            <button type="button" onClick={sharePage} aria-label={shareLabel} title={shareLabel} className="rounded-lg bg-black/20 p-2 text-white backdrop-blur-sm hover:bg-black/30"><Share2 className="h-4 w-4" /></button>
          </div>
          <div className="relative flex items-end gap-3 text-white">
            {business.logoUrl ? <img src={business.logoUrl} alt="" className="h-14 w-14 rounded-xl bg-white object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-xl bg-white text-xl font-bold" style={{ color: primaryColor }}>{business.name.slice(0, 1).toUpperCase()}</div>}
            <div><p className="text-xs font-semibold capitalize text-white/80">{business.category}</p><h1 className="text-2xl font-extrabold leading-tight">{business.name}</h1></div>
          </div>
        </header>

        <section className="px-5 pb-2 pt-4">
          {business.description && <p className="text-sm leading-relaxed text-gray-600">{business.description}</p>}
          {(business.address || business.city || business.country) && (
            <a href={business.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent([business.address, business.city, business.country].filter(Boolean).join(", "))}`} target="_blank" rel="noreferrer" onClick={() => track("google_maps", undefined, "Get directions")} className="mt-4 flex items-start gap-2 text-sm text-gray-600 hover:text-gray-900">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: primaryColor }} />
              <span>{[business.address, business.city, business.country].filter(Boolean).join(", ")}</span>
              <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-gray-400" />
            </a>
          )}
        </section>

        <section className="space-y-3 px-5 py-5">
          {actions.map(({ id, platform, label, url, Icon }) => (
            <a key={id} href={url} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noreferrer" : undefined} onClick={() => track(platform, id, label)} className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-[var(--profile-accent)] hover:bg-gray-50">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100" style={{ color: primaryColor }}><Icon className="h-4 w-4" /></span>
              <span className="flex-1">{label}</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </a>
          ))}
          {actions.length === 0 && <p className="py-6 text-center text-sm text-gray-500">This business has not added any links yet.</p>}
        </section>

        {offers.length > 0 && (
          <section className="border-t border-gray-100 px-5 py-5">
            <h2 className="mb-3 text-sm font-bold text-gray-900">Offers</h2>
            <div className="space-y-3">
              {offers.map((offer) => (
                <article key={offer.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-bold text-amber-950"><span className="mr-2">{offer.emoji || "🎁"}</span>{offer.title}</h3>
                  {offer.description && <p className="mt-1 text-sm text-amber-900/75">{offer.description}</p>}
                  {offer.expiresAt && <p className="mt-2 text-xs text-amber-800">Ends {new Date(offer.expiresAt).toLocaleDateString()}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="border-t border-gray-100 px-5 py-4 text-center text-xs text-gray-400">
          Powered by <a href="/" className="font-bold" style={{ color: primaryColor }}>OneQR</a>
        </footer>
      </article>
    </main>
  );
}