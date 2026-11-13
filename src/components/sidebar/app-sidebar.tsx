import { Link, useMatches } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import type * as React from "react";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ProgramSwitcher } from "./program-switcher";

interface Item {
  title: string;
  url: string;
  route: string;
  icon?: React.ComponentType<Record<string, never>>;
  items?: Item[];
  collapsible?: boolean;
}

const items: Item[] = [
  {
    title: "Dashboard",
    url: "/app/",
    route: "/app/_main",
    icon: Activity,
  },
];

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const matches = useMatches();
  return (
    <Sidebar
      variant="inset"
      // collapsible="offcanvas"
      className="bg-none"
      {...props}
    >
      <SidebarHeader className="bg-none flex-row">
        <ProgramSwitcher />
      </SidebarHeader>
      <SidebarContent className="bg-none">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    data-active={matches.some(
                      (match) => match.routeId === item.route,
                    )}
                    render={
                      <Link to={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                  {item.items && item.items.length > 0 && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={matches.some(
                              (match) => match.routeId === subItem.route,
                            )}
                            render={
                              <Link to={subItem.url}>
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </Link>
                            }
                          />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
