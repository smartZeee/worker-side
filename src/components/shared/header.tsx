import { Button } from "@/components/ui/button"
import { Logo } from "@/components/icons/logo"
import { LogOut, UserCircle } from "lucide-react"

interface PortalHeaderProps {
  portalName: string
  employeeId: string
  onLogout: () => void
}

export default function PortalHeader({ portalName, employeeId, onLogout }: PortalHeaderProps) {
  return (
    <header className="w-full bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <Logo className="h-8 w-8 text-primary" />
          <div className="hidden md:flex items-baseline gap-2">
            <h1 className="text-xl font-headline text-primary">CulinaryFlow</h1>
            <span className="text-sm text-muted-foreground">/</span>
            <h2 className="text-lg font-medium">{portalName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="h-5 w-5" />
            <span className="font-mono">{employeeId}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
