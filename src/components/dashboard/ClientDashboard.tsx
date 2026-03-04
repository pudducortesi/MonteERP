import { FolderOpen, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types";

interface ClientDashboardProps {
  user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Benvenuto, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          I tuoi documenti e lo stato dei deal
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My documents */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              I Tuoi Documenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessun documento condiviso
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I documenti condivisi con te appariranno qui
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Deal status */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              Stato Deal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessun deal associato
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Lo stato dei deal dove sei coinvolto apparirà qui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
