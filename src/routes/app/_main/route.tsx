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
      throw redirect({ to: "/sign-in" }); // future needs to redirect to onboarding
    }

    const activeProgramId = activeProgramIdFromCookie ?? programs[0].id;

    return { programs, activeProgramId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col w-full overflow-hidden h-full">
      <SidebarProvider className="min-h-0 overflow-hidden">
        <div className="w-screen h-full flex overflow-hidden">
          <AppSidebar />
          <Card className="flex-1 relative m-2 ml-0 h-auto overflow-hidden">
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
                    className="p-4 flex flex-col gap-4"
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
            <CardContent className="overflow-y-auto items-center flex flex-col  flex-1">
              <div className="text-foreground-secondary flex flex-col items-center justify-center gap-4 m-auto flex-1 p-4"></div>
            </CardContent>
          </Card>
        </div>
      </SidebarProvider>
    </div>
  );
}
