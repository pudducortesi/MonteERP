import { Briefcase, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types";

interface ViewerDashboardProps {
  user: User;
}

export function ViewerDashboard({ user }: ViewerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Benvenuto, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          I deal assegnati in sola lettura
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My deals */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              I Tuoi Deal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessun deal assegnato
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I deal dove sei viewer appariranno qui
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Activity timeline */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              Timeline Attività
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessuna attività recente
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Le attività dei deal assegnati appariranno qui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
