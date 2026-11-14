import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { listPrograms } from "@/server-funcs/programs";
import { getActiveProgramIdCookie } from "@/server-funcs/session-prefs";

export const Route = createFileRoute("/app/_main")({
  beforeLoad: async () => {
    const [programs, activeProgramIdFromCookie] = await Promise.all([
      listPrograms(),
      getActiveProgramIdCookie(),
    ]);

    if (programs.length === 0) {
      throw redirect({ to: "/app/new-program" });
    }

    const activeProgramId = activeProgramIdFromCookie ?? programs[0].id;

    return { programs, activeProgramId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <SidebarProvider className="min-h-0 overflow-hidden">
        <div className="flex h-full w-screen overflow-hidden">
          <AppSidebar />
          <Card className="relative m-2 ml-0 h-auto flex-1 overflow-hidden">
            <Outlet />
            <CardHeader>
              <CardTitle className="gap-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Threads</BreadcrumbPage>
                    </BreadcrumbItem>
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>alo</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  </BreadcrumbList>
                </Breadcrumb>
              </CardTitle>
              <CardAction side="right">
                {/* TODO: Implement search functionality when live-state supports full text search */}
                {/* <Search placeholder="Search" /> */}

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="ghost" size="sm">
                        <Settings2 />
                        Display
                      </Button>
                    }
                  />
                  <PopoverContent
                    className="flex flex-col gap-4 p-4"
                    align="end"
                  >
                    <div className="flex w-full items-center gap-2">
                      <div className="mr-auto">Order by</div>
                      <Select>
                        <SelectTrigger className="w-48" data-size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem></SelectItem>
                        </SelectContent>
                      </Select>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="outline"
                              size="sm"
                              className="size-8"
                            >
                              aaa
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Change order direction
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center overflow-y-auto">
              <div className="m-auto flex flex-1 flex-col items-center justify-center gap-4 p-4 text-foreground-secondary"></div>
            </CardContent>
          </Card>
        </div>
      </SidebarProvider>
    </div>
  );
}
