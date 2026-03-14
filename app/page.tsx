import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { goaActivities, goaHotels, popularDestinations } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const featuredHotels = goaHotels.slice(0, 3);
  const featuredActivities = goaActivities.slice(0, 3);
  const destinations = popularDestinations.slice(0, 4);

  return (
    <div className="bg-background text-foreground">
      <Navbar />

      <section className="relative min-h-[60vh] overflow-hidden md:min-h-[85vh]">
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=80"
          alt="Cinematic mountain and lake destination"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(160,82,45,0.48)] via-[rgba(227,83,54,0.24)] to-[rgba(245,245,220,0.10)]" />

        <div className="tm-container relative z-10 flex min-h-[60vh] flex-col justify-center py-16 text-white md:min-h-[85vh]">
          <p className="tm-label text-white/90">WORLDWIDE CURATED EXPERIENCES</p>
          <h1 className="tm-hero-title mt-4 max-w-4xl text-white">
            The easiest way to plan your next unforgettable journey.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-white/90">
            Discover destinations, compare stays, and build a personalized itinerary with premium design and trusted recommendations.
          </p>
        </div>

        <div className="tm-container relative z-20 -mt-12 pb-8 md:-mt-16">
          <div className="tm-search-shell flex flex-col gap-2 p-2 md:flex-row md:items-center md:gap-0">
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none md:border-r md:border-border">
              <MapPin className="h-[18px] w-[18px] text-muted-foreground" />
              <div>
                <p className="tm-label">Where</p>
                <p className="text-sm text-[color:var(--color-text-tertiary)]">Search destinations</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none md:border-r md:border-border">
              <CalendarDays className="h-[18px] w-[18px] text-muted-foreground" />
              <div>
                <p className="tm-label">Check-in</p>
                <p className="text-sm text-[color:var(--color-text-tertiary)]">Add dates</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none md:border-r md:border-border">
              <CalendarDays className="h-[18px] w-[18px] text-muted-foreground" />
              <div>
                <p className="tm-label">Check-out</p>
                <p className="text-sm text-[color:var(--color-text-tertiary)]">Add dates</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none">
              <Users className="h-[18px] w-[18px] text-muted-foreground" />
              <div>
                <p className="tm-label">Travelers</p>
                <p className="text-sm text-[color:var(--color-text-tertiary)]">2 guests</p>
              </div>
            </div>
            <button className="tm-btn-primary h-12 w-full gap-2 md:ml-2 md:w-auto md:px-6">
              <Search className="h-[18px] w-[18px]" />
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="tm-container py-12 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="tm-label">TRENDING NOW</p>
            <h2 className="tm-h2 mt-2">Featured Destinations</h2>
          </div>
          <Link href="/search" className="text-sm font-medium text-primary hover:text-[color:var(--color-primary-hover)]">
            Explore all
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => (
            <Link key={destination.name} href="/search" className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src={destination.coverImage}
                alt={destination.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(160,82,45,0.72)] via-[rgba(160,82,45,0.28)] to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-display text-2xl font-bold text-white">{destination.name}</h3>
                <p className="text-sm text-white/75">{destination.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="tm-container pb-12 md:pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="tm-label">TOP STAYS</p>
            <h2 className="tm-h2 mt-2">Boutique Hotels You Will Love</h2>
          </div>
          <Link href="/search" className="text-sm font-medium text-primary hover:text-[color:var(--color-primary-hover)]">
            View all stays
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredHotels.map((hotel) => (
            <article key={hotel.id} className="tm-card">
              <div className="tm-card-image">
                <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-semibold text-foreground">{hotel.name}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">{hotel.city}, {hotel.country}</p>
                <p className="mt-3">
                  <span className="text-xl font-bold text-foreground">{formatCurrency(hotel.pricePerNight, hotel.currency)}</span>
                  <span className="ml-1 text-[13px] text-muted-foreground">per night</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tm-container pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="tm-label">EXPERIENCES</p>
            <h2 className="tm-h2 mt-2">Curated Activities</h2>
          </div>
          <Link href="/planner" className="tm-btn-secondary py-2.5">
            Build itinerary
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredActivities.map((activity) => (
            <article key={activity.id} className="tm-card">
              <div className="tm-card-image">
                <Image src={activity.image} alt={activity.name} fill className="object-cover" />
              </div>
              <div className="p-4">
                <span className="tm-badge tm-badge-adventure">{activity.category}</span>
                <h3 className="font-display mt-2 text-lg font-semibold text-foreground">{activity.name}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">{activity.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

