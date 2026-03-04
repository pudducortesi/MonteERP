import {
  Briefcase,
  CheckSquare,
  Plus,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

interface AdvisorDashboardProps {
  user: User;
}

export function AdvisorDashboard({ user }: AdvisorDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            Bentornato, {user.full_name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">I tuoi deal e task</p>
        </div>

        {/* Quick actions */}
        <div className="hidden sm:flex gap-2">
          <Button size="sm" className="bg-[#1B2A4A] hover:bg-[#253A5E]">
            <Plus className="h-4 w-4 mr-1" />
            Nuovo Deal
          </Button>
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4 mr-1" />
            Nuova Attività
          </Button>
          <Button size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-1" />
            Nuovo Task
          </Button>
        </div>
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
                I deal appariranno qui quando verrai aggiunto al team
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tasks due */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              Task in Scadenza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessun task in scadenza
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I task dei prossimi 7 giorni appariranno qui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A] text-base">
            Attività Recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nessuna attività recente sui tuoi deal
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
