import { useRouter } from "@tanstack/react-router";
import { EllipsisVerticalIcon, LogOutIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { clearCachedSession } from "@/lib/session-cache";

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// Grapheme-aware so emoji and combining accents are never split in half.
const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => {
      const [first] = graphemes.segment(word);
      return first.segment.toUpperCase();
    })
    .join("");

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const displayName = user.name.trim() || user.email.split("@")[0];
  const initials = getInitials(displayName);

  const avatar = (
    <Avatar className="size-8 rounded-lg after:rounded-lg">
      {user.avatar && (
        <AvatarImage src={user.avatar} alt="" className="rounded-lg" />
      )}
      <AvatarFallback className="rounded-lg">
        {initials || <UserRoundIcon className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );

  const handleLogout = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Couldn’t log out. Please try again.");
      return;
    }

    clearCachedSession();
    await router.navigate({ to: "/" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] aria-expanded:bg-muted motion-reduce:active:scale-100"
              />
            }
          >
            {avatar}
            <div className="grid min-w-0 flex-1 text-left text-sm leading-snug">
              <span className="truncate font-medium" title={displayName}>
                {displayName}
              </span>
              <span
                className="truncate text-foreground/70 text-xs"
                title={user.email}
              >
                {user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  {avatar}
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-snug">
                    <span className="font-medium [overflow-wrap:anywhere]">
                      {displayName}
                    </span>
                    <span className="text-muted-foreground text-xs [overflow-wrap:anywhere]">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
