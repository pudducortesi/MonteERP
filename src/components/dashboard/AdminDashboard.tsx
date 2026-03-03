import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import type { User } from "@/types";

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Bentornato, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Panoramica del gestionale Montesino
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Deal Attivi"
          value="0"
          description="In pipeline"
          icon={Briefcase}
          trend={{ value: "0%", positive: true }}
        />
        <KPICard
          label="Pipeline Value"
          value="€ 0"
          description="Valore totale"
          icon={BarChart3}
          trend={{ value: "0%", positive: true }}
        />
        <KPICard
          label="Fee Forecast"
          value="€ 0"
          description="Success fee attese"
          icon={TrendingUp}
        />
        <KPICard
          label="Fee Incassate YTD"
          value="€ 0"
          description="Anno corrente"
          icon={DollarSign}
          trend={{ value: "0%", positive: true }}
        />
      </div>

      {/* Bottom sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activities */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              Attività Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessuna attività recente
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Le attività appariranno qui quando verranno registrate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              Deal in Scadenza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessun deal in scadenza
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I deal con milestone imminenti appariranno qui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
