import {
  Home,
  FileText,
  Settings,
  UsersRound,
  ClipboardList,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import { jwtDecode } from 'jwt-decode'

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Insights",
    url: "#",
    icon: FileText,
  },
  {
    title: "Projects",
    url: "#",
    icon: ClipboardList,
  },
  {
    title: "Teams",
    url: "/dashboard/teams",
    icon: UsersRound,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

let decodedToken: string

const token = localStorage.getItem("token") as string
if (token) {
decodedToken = jwtDecode(token)
}

export function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
          <SidebarFooter>
            <NavUser user={decodedToken}/>
          </SidebarFooter>
    </Sidebar>
  );
}
