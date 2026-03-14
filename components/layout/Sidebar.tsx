"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  HelpCircle,
  Heart,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageCircle,
  Plane,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Planner", icon: Sparkles, href: "/planner" },
  { label: "Destinations", icon: Search, href: "/search" },
  { label: "Invitations", icon: Users, href: "/invitations" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
] as const;

type Status = "draft" | "active" | "completed";

interface SidebarTrip {
  id: string;
  title: string;
  destination: string;
  country: string;
  status: string;
}

function getStatusDotColor(status: Status): string {
  switch (status) {
    case "active":
      return "bg-primary";
    case "completed":
      return "bg-[color:var(--color-earth)]";
    case "draft":
    default:
      return "bg-[color:var(--color-sand)]";
  }
}

function getFlagEmoji(country: string): string {
  if (country === "India") return "🇮🇳";
  if (country === "Indonesia") return "🇮🇩";
  if (country === "France") return "🇫🇷";
  if (country === "Japan") return "🇯🇵";
  if (country === "Thailand") return "🇹🇭";
  return "🌍";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [recentTrips, setRecentTrips] = useState<SidebarTrip[]>([]);
  const [userPlan, setUserPlan] = useState<"basic" | "pro">("basic");
  const { newCount, fetchItems, isLoaded } = useWishlistStore();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  useEffect(() => {
    if (!isLoaded) fetchItems();
  }, [isLoaded, fetchItems]);

  useEffect(() => {
    // Fetch user's recent trips
    fetch("/api/itinerary/user")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentTrips(data.slice(0, 3));
        }
      })
      .catch(() => {
        // Silently fail — sidebar still renders
      });
  }, []);

  // Fetch user plan
  useEffect(() => {
    fetch("/api/user/plan")
      .then((res) => (res.ok ? res.json() : { plan: "basic" }))
      .then((data) => setUserPlan(data.plan || "basic"))
      .catch(() => { });
  }, []);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/signin";
        },
      },
    });
  };

  return (
    <ShadcnSidebar
      variant="sidebar"
      side="left"
      className="border-r border-[color:var(--color-border)] bg-[rgba(255,255,255,0.96)]"
    >
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(244,164,96,0.4)] bg-[color:var(--color-sand-light)] text-primary shadow-[var(--shadow-xs)]">
            <Plane className="h-[18px] w-[18px]" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-primary">
            TravelMind
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-[0.1em] text-[color:var(--color-text-tertiary)]">
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/" || pathname.startsWith(item.href)
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-11 rounded-[var(--radius-md)] px-3 text-[15px] font-medium text-[color:var(--color-text-secondary)] transition-all duration-150 ease-out hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-earth)]",
                        isActive && "bg-[color:var(--color-sand-light)] text-[color:var(--color-earth)] before:absolute before:left-0 before:top-2 before:h-7 before:w-[3px] before:rounded-r-full before:bg-primary",
                      )}
                    >
                      <Link href={item.href} className="relative">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.label === "Wishlist" && newCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-xs">
                            {newCount > 9 ? "9+" : newCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "h-11 rounded-[var(--radius-md)] px-3 text-[15px] font-medium",
                    userPlan === "pro"
                      ? "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-earth)]"
                      : "cursor-not-allowed text-[color:var(--color-text-tertiary)]"
                  )}
                  disabled={userPlan !== "pro"}
                >
                  {userPlan === "pro" ? (
                    <Link href="/chat">
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                      <Lock className="ml-auto h-3 w-3 text-[color:var(--color-text-tertiary)]" />
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {userPlan !== "pro" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-11 rounded-[var(--radius-md)] px-3 text-[15px] font-medium text-primary hover:bg-[color:var(--color-sand-light)] hover:text-[color:var(--color-primary-hover)]"
                  >
                    <Link href="/choose-plan">
                      <Crown className="h-4 w-4" />
                      <span>Upgrade to Pro</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-[0.1em] text-[color:var(--color-text-tertiary)]">
            TRIPS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {recentTrips.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-3 py-2 text-xs text-[color:var(--color-text-tertiary)] italic">
                    No trips yet — plan your first!
                  </div>
                </SidebarMenuItem>
              ) : (
                recentTrips.map((trip) => (
                  <SidebarMenuItem key={trip.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs shadow-[var(--shadow-xs)] transition-all duration-150 ease-out hover:border-[color:var(--color-sand)] hover:bg-[color:var(--color-white)]"
                    >
                      <Link href={`/itinerary/${trip.id}/view`}>
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            getStatusDotColor(trip.status as Status),
                          )}
                        />
                        <span className="flex min-w-0 flex-col">
                            <span className="max-w-[9rem] truncate text-[11px] font-medium text-[color:var(--color-text-primary)]">
                            {trip.title}
                          </span>
                            <span className="text-[11px] text-[color:var(--color-text-secondary)]">
                            {trip.destination} {getFlagEmoji(trip.country)}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="px-4 pb-4 pt-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-left shadow-[var(--shadow-xs)] transition-all duration-150 ease-out hover:border-[color:var(--color-sand)] hover:bg-[color:var(--color-white)]"
              aria-label="Open account menu"
            >
              <div className="flex items-center gap-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={userName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                    {getInitials(userName)}
                  </div>
                )}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-[color:var(--color-text-primary)]">{userName}</span>
                    <span className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      userPlan === "pro"
                        ? "bg-primary text-white"
                        : "bg-[color:var(--color-sand-light)] text-[color:var(--color-earth)]"
                    )}>
                      {userPlan === "pro" && <Crown className="h-2.5 w-2.5" />}
                      {userPlan}
                    </span>
                  </div>
                  <span className="text-xs text-[color:var(--color-text-secondary)]">{userEmail}</span>
                </div>
              </div>
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-56 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-white)] p-2 shadow-[var(--shadow-lg)]"
          >
            <div className="mb-1 px-2 py-1">
              <p className="text-[11px] font-semibold tracking-[0.1em] text-[color:var(--color-text-tertiary)]">
                ACCOUNT
              </p>
            </div>

            <button
              type="button"
              className="flex h-10 w-full items-center gap-2 rounded-[var(--radius-md)] px-3 text-[15px] font-medium text-[color:var(--color-text-secondary)] transition-colors duration-150 ease-out hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-earth)]"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="flex h-10 w-full items-center gap-2 rounded-[var(--radius-md)] px-3 text-[15px] font-medium text-[color:var(--color-text-secondary)] transition-colors duration-150 ease-out hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-earth)]"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-10 w-full items-center gap-2 rounded-[var(--radius-md)] px-3 text-[15px] font-medium text-primary transition-colors duration-150 ease-out hover:bg-[color:var(--color-sand-light)] hover:text-[color:var(--color-primary-hover)]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
