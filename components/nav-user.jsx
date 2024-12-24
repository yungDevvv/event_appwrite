import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  KeyRound,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useModal } from "@/hooks/use-modal"
import { signOut } from "@/lib/appwrite/server/appwrite"

export function NavUser({
  user
}) {

  const { onOpen } = useModal();

  return (
    (<DropdownMenu className="bg-white">
      <DropdownMenuTrigger
        className="w-full rounded-md outline-none ring-ring data-[state=open]:bg-accent bg-white">
        <div
          className="flex items-center gap-2 px-2 py-1.5 text-left text-sm transition-all">
          {/* <Avatar className="h-7 w-7 rounded-md border">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              className="animate-in fade-in-50 zoom-in-90" />
            <AvatarFallback className="rounded-md">CN</AvatarFallback>
          </Avatar> */}

          <div className="grid flex-1 leading-none">
            <div className="font-medium text-clientprimary">{user.first_name} {user.last_name}</div>
            <div className="text-sm text-zinc-500">{user.email}</div>
            {/* <div className="overflow-hidden text-xs text-muted-foreground">
              <div className="line-clamp-1">{user.email}</div>
            </div> */}
          </div>
          <ChevronsUpDown className="ml-auto mr-0.5 h-4 w-4 text-muted-foreground/50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={4}>
        {/* <DropdownMenuLabel className="p-0 font-normal"> */}
        {/* <div
            className="flex items-center gap-2 px-1 py-1.5 text-left text-sm transition-all"> */}
        {/* <Avatar className="h-7 w-7 rounded-md">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar> */}
        {/* <div className="grid flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="overflow-hidden text-xs text-muted-foreground">
                <div className="line-clamp-1">{user.email}</div>
              </div>
            </div>
          </div>
        </DropdownMenuLabel> */}
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2">
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            Account
          </DropdownMenuItem>

        </DropdownMenuGroup> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem className="gap-2" onClick={() => onOpen("change-password")}>
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          Vaihda salasana
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={async () => await signOut()}>
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Kirjaudu ulos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>)
  );
}
