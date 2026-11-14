import { ChevronDown, GraduationCap, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { NewProgramDialog } from "@/components/programs/new-program-dialog";
import { useProgramSwitcher } from "@/hooks/use-program-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export function ProgramSwitcher() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [newProgramOpen, setNewProgramOpen] = useState(false);
  const { activeProgram, setActiveProgramId, programs } = useProgramSwitcher();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            ref={triggerRef}
            render={
              <SidebarMenuButton
                size="lg"
                className="w-full select-none px-1.5"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCap />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span
                    dir="auto"
                    title={activeProgram.name}
                    className="truncate text-start font-medium"
                  >
                    {activeProgram.name}
                  </span>
                  {activeProgram.institution && (
                    <span
                      dir="auto"
                      title={activeProgram.institution}
                      className="truncate text-start text-muted-foreground text-xs"
                    >
                      {activeProgram.institution}
                    </span>
                  )}
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
              <div className="max-h-72 overflow-y-auto overscroll-contain">
                {programs.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => {
                      setActiveProgramId(p.id);
                    }}
                  >
                    <span className="flex min-w-0 flex-col gap-0.5 leading-tight">
                      <span
                        dir="auto"
                        title={p.name}
                        className="truncate text-start text-foreground/80"
                      >
                        {p.name}
                      </span>
                      {p.institution && (
                        <span
                          dir="auto"
                          title={p.institution}
                          className="truncate text-start text-[11px] text-muted-foreground/70 group-focus/dropdown-menu-item:opacity-60"
                        >
                          {p.institution}
                        </span>
                      )}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setNewProgramOpen(true)}
              >
                <Plus /> New program
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <NewProgramDialog
          open={newProgramOpen}
          onOpenChange={setNewProgramOpen}
          finalFocus={triggerRef}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
