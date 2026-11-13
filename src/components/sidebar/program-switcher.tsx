import { ChevronDown, GraduationCap, Plus } from "lucide-react";
import { useProgramSwitcher } from "@/hooks/use-program-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export function ProgramSwitcher() {
  const { activeProgram, setActiveProgramId, programs } = useProgramSwitcher();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="w-full px-1.5 select-none"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCap />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeProgram.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Oxford University
                    {/* {activeProgram?.institution ?? ""} */}
                  </span>
                </div>
                <ChevronDown className="opacity-50" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="rounded-lg text-muted-foreground"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Programs
              </DropdownMenuLabel>
              {programs.map((p, index) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => {
                    setActiveProgramId(p.id);
                  }}
                >
                  {p.name}
                  {/* TODO: Bind keyboard shortcut */}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <Plus /> New Program
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
