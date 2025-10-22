"use client"; // ✅ Required for using usePathname and React hooks

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  LayoutDashboard,
  UserPlus,
  Upload,
  AlertTriangle,
  FileText,
  Bell,
  BarChart3,
  Settings,
  Search,
  CheckCircle,
  Users,
  MapPin,
  Shield,
  Stamp,
  Database,
  Fingerprint,
  Pause,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  AlertOctagon,
  ClipboardList,
  FileSearch,
  StickyNote,
  History,
  ShieldAlert,
  Scale
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { UserRole as OriginalUserRole } from "@/app/types"

type UserRole = OriginalUserRole | 'spu_officer' | 'risk' | 'compliance';

// Navigation items by role
const navigationByRole: Record<UserRole, any[]> = {
  'pb': [
    {
      title: "Main",
      items: [
    
        {
          title: "Dashboard",
          url: "/dashboard/pb/applications",
          icon: LayoutDashboard,
        },
        {
          title: "New Application",
          url: "/dashboard/applicant",
          icon: UserPlus,
        },
  
      ],
    },
    {
      title: "Documents",
      items: [
        {
          title: "Upload Documents",
          url: "/dashboard/documents",
          icon: Upload,
        },
     
      ],
    },

  ],
  'spu': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/spu",
          icon: LayoutDashboard,
        },
 
      ],
    },
   
  ],
  'spu_officer': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/officer",
          icon: LayoutDashboard,
        },
        {
          title: "Assigned Applications",
          url: "/dashboard/officer/assigned",
          icon: ClipboardList,
          badge: "8",
        },
        {
          title: "In Review",
          url: "/dashboard/officer/in-review",
          icon: FileSearch,
          badge: "3",
        },
        {
          title: "Completed Reviews",
          url: "/dashboard/officer/completed",
          icon: CheckCircle,
        },
      ],
    },
    {
      title: "Verification",
      items: [
        {
          title: "Document Checklist",
          url: "/dashboard/officer/document-checklist",
          icon: ClipboardList,
        },
        {
          title: "Add Comments",
          url: "/dashboard/officer/comments",
          icon: StickyNote,
        },
      ],
    },
    {
      title: "Activity",
      items: [
        {
          title: "My Review Logs",
          url: "/dashboard/officer/logs",
          icon: History,
        },
        {
          title: "Notifications",
          url: "/dashboard/officer/notifications",
          icon: Bell,
          badge: "5",
        },
      ],
    },
  ],

  'cops': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/cops",
          icon: LayoutDashboard,
        },
       
      ],
    },
   
  ],
  'eamvu': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/eamvu",
          icon: LayoutDashboard,
        },
        
        {
          title: "Assigned Applications",
          url: "/dashboard/eamvu/assigned",
          icon: Users,
        },
        
      ],
    },
   
  ],
  'eamvu_officer': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/eamvu_officer",
          icon: LayoutDashboard,
        },
      ],
    },
  ],
  'ciu': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/ciu",
          icon: LayoutDashboard,
        },
      
      ],
    },
   
  ],
  'rru': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/rru",
          icon: LayoutDashboard,
        },
        {
          title: "Under Review",
          url: "/dashboard/rru/under-review",
          icon: Pause,
          badge: "12",
        },
        {
          title: "Resume Application",
          url: "/dashboard/rru/resume-application",
          icon: RotateCcw,
        },
        {
          title: "Returned Application",
          url: "/dashboard/rru/returned-application",
          icon: AlertTriangle,
        },
      ],
    },
   
  ],
  'risk': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/risk",
          icon: LayoutDashboard,
        },
        
      ],
    },
  ],
  'compliance': [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/compliance",
          icon: LayoutDashboard,
        },
       
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: UserRole;
}

export function AppSidebar({ userRole = 'pb', ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const navigationItems = navigationByRole[userRole] || navigationByRole['pb'];
  
  const roleDisplayNames: Record<UserRole, string> = {
    'pb': 'Personal Banking',
    'spu': 'Sales Processing Unit',
    'spu_officer': 'Sales Processing Officer',
    'cops': 'Consumer Operations',
    'eamvu': 'External Asset Management',
    'eamvu_officer': 'External Asset Management Officer',
    'ciu': 'Central Investigation Unit',
    'rru': 'Rejection Review Unit',
    'risk': 'Risk Management',
    'compliance': 'Compliance Department',
  };

  return (
    <Sidebar {...props} >
      <SidebarHeader className="border-b border-sidebar-border pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/10 transition-colors">
              <Link href={`/dashboard/${userRole}`}>
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                  <Building2 className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent text-base">ILOS</span>
                  <span className="truncate text-xs text-muted-foreground font-medium">{roleDisplayNames[userRole]}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-2">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title} className="px-2">
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-2 mb-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item: any) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.url}
                      className="hover:bg-sidebar-accent/10 transition-all duration-200 rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-md"
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="ml-auto shadow-sm text-xs px-2 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}