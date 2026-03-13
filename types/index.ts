export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  currencyPreference: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  pricePerNight: number;
  currency: string;
  rating: number;
  stars: number;
  images: string[];
  amenities: string[];
  lat: number;
  lng: number;
  description: string;
  externalId: string;
}

export type ActivityCategory =
  | "beach"
  | "restaurant"
  | "museum"
  | "adventure"
  | "culture"
  | "nightlife"
  | "shopping"
  | "nature"
  | "wellness";

export interface Activity {
  id: string;
  name: string;
  city: string;
  category: ActivityCategory;
  price: number;
  currency: string;
  duration: number;
  rating: number;
  image: string;
  description: string;
  lat: number;
  lng: number;
  openingHours?: string;
  externalId: string;
}

export interface TravelEvent {
  id: string;
  name: string;
  city: string;
  date: string;
  price: number;
  currency: string;
  venue: string;
  image: string;
  description: string;
  category: string;
  url: string;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipitationChance: number;
  windSpeed: number;
  icon: string;
}

export interface ItineraryItem {
  id: string;
  type: "hotel" | "activity" | "event" | "transport";
  itemId: string;
  data: Hotel | Activity | TravelEvent;
  startTime: string;
  endTime: string;
  notes?: string;
  estimatedCost: number;
  currency: string;
  orderIndex: number;
}

export interface ItinerarySlot {
  period: "morning" | "afternoon" | "evening";
  items: ItineraryItem[];
}

export interface RouteSegment {
  from: string;
  to: string;
  distanceKm: number;
  durationMinutes: number;
  mode: "walking" | "driving" | "transit";
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  weather?: WeatherDay;
  slots: ItinerarySlot[];
  hotel?: Hotel;
  totalCost: number;
  route?: RouteSegment[];
}

export type TravelStyle = "relaxed" | "adventure" | "cultural" | "luxury" | "budget";

export interface Collaborator {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  isOnline: boolean;
  lastSeen: Date;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalBudget: number;
  currency: string;
  travelers: number;
  travelStyle: TravelStyle;
  days: ItineraryDay[];
  shareToken: string;
  status: "draft" | "active" | "completed";
  collaborators: Collaborator[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  userId: string;
  userName: string;
  vote: 1 | -1;
}

export interface WishlistItem {
  id: string;
  itineraryId: string;
  addedByUserId: string;
  addedByName: string;
  type: "hotel" | "activity" | "event";
  data: Hotel | Activity | TravelEvent;
  votes: Vote[];
  addedAt: Date;
}

export type BudgetRange = "under-10k" | "10k-30k" | "30k-60k" | "60k-1L" | "above-1L";

export interface TripIntent {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  travelers: number;
  travelStyle: TravelStyle;
  interests: string[];
  budgetRange: BudgetRange;
}

export interface BudgetBreakdown {
  accommodation: number;
  activities: number;
  food: number;
  transport: number;
  events: number;
  total: number;
  currency: string;
}

export interface CityInfo {
  name: string;
  country: string;
  safetyScore: number;
  costOfLiving: number;
  qualityOfLife: number;
  currency: string;
  timezone: string;
  language: string;
}

export interface Booking {
  id: string;
  userId: string;
  itineraryId: string;
  itemType: "hotel" | "activity" | "event";
  itemData: Hotel | Activity | TravelEvent;
  amount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  stripeSessionId: string;
  createdAt: Date;
}

export interface TripStats {
  totalTrips: number;
  countries: number;
  totalSpent: number;
  avgTripDuration: number;
  mostVisitedCity: string;
  totalDistance: number;
}
