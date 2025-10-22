"use client"

import { useRouter } from "next/navigation"
import { Bell, User, LogOut, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/app/types"

interface HeaderProps {
  userRole?: UserRole;
}

export function Header({ userRole = "pb" }: HeaderProps) {
  const router = useRouter();

  const roleDisplayNames: Record<UserRole, string> = {
    pb: "Personal Banking",
    spu: "Sales Processing Unit",
    spu_officer: "Sales Processing Officer",
    cops: "Consumer Operations",
    eamvu: "External Asset Management",
    eamvu_officer: "External Asset Management Officer",
    ciu: "Central Investigation Unit",
    rru: "Rejection Review Unit",
    risk: "Risk Management",
    compliance: "Compliance Department",
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <>
      {/* Modern Top Brand Bar */}
      <nav className="shadow-md bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 border-b border-teal-700/30">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* ILOS Branding */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">ILOS</h1>
                <p className="text-xs text-white/90 -mt-1 font-medium">Intelligent Loan Origination</p>
              </div>
            </div>

            {/* AI Badge */}
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-md hidden sm:flex gap-1.5 shadow-sm hover:bg-white/25 transition-colors px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </nav>

      {/* Dashboard Toolbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 shadow-sm">
        <SidebarTrigger className="-ml-1 hover:bg-primary/10 transition-colors" />
        <Separator orientation="vertical" className="mr-2 h-6" />

        <div className="flex flex-1 items-center justify-between">
          {/* Dashboard Role Name */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {roleDisplayNames[userRole]} Dashboard
            </h2>
          </div>

          {/* Notifications + Profile */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse shadow-md">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:border-primary/30 transition-colors rounded-lg shadow-sm">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 shadow-lg">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1.5 p-1">
                    <p className="text-sm font-semibold text-foreground">Account</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{roleDisplayNames[userRole]}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 transition-colors">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 transition-colors">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
