"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CompanyCard } from "@/components/crm/CompanyCard";
import { CompanyForm } from "@/components/crm/CompanyForm";
import { ContactForm } from "@/components/crm/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  UserPlus,
  UserRound,
  Briefcase,
  Clock,
  Phone,
  Users,
  Mail,
  StickyNote,
  ArrowRightLeft,
  Upload,
} from "lucide-react";
import {
  DEAL_STATUS_LABELS,
  DEAL_TYPE_LABELS,
  formatCurrency,
} from "@/lib/utils/deal";
import type { Company, Contact, Deal, Activity, ActivityType, User } from "@/types";

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  meeting: Users,
  email: Mail,
  note: StickyNote,
  status_change: ArrowRightLeft,
  document_upload: Upload,
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<(Activity & { user?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const supabase = createClient();

  const fetchCompany = useCallback(async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();
    if (data) setCompany(data as Company);
    setLoading(false);
  }, [supabase, companyId]);

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("company_id", companyId)
      .order("full_name");
    if (data) setContacts(data as Contact[]);
  }, [supabase, companyId]);

  const fetchDeals = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select("*")
      .eq("company_id", companyId)
      .order("updated_at", { ascending: false });
    if (data) setDeals(data as Deal[]);
  }, [supabase, companyId]);

  const fetchActivities = useCallback(async () => {
    // Get activities for deals associated with this company
    const { data: companyDeals } = await supabase
      .from("deals")
      .select("id")
      .eq("company_id", companyId);

    if (!companyDeals || companyDeals.length === 0) {
      setActivities([]);
      return;
    }

    const dealIds = companyDeals.map((d) => d.id);
    const { data } = await supabase
      .from("activities")
      .select("*, user:users(id, full_name)")
      .in("deal_id", dealIds)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setActivities(data as unknown as (Activity & { user?: User })[]);
  }, [supabase, companyId]);

  useEffect(() => {
    fetchCompany();
    fetchContacts();
    fetchDeals();
    fetchActivities();
  }, [fetchCompany, fetchContacts, fetchDeals, fetchActivities]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Azienda non trovata</p>
        <Button
          variant="link"
          onClick={() => router.push("/crm/companies")}
        >
          Torna alle aziende
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {company.name}
          </h1>
          {company.sector && (
            <p className="text-sm text-muted-foreground">{company.sector}</p>
          )}
        </div>
      </div>

      {/* Company data card */}
      <CompanyCard company={company} onEdit={() => setEditFormOpen(true)} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contacts */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base text-[#1B2A4A]">
              Contatti ({contacts.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContactFormOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Aggiungi
            </Button>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-6">
                <UserRound className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nessun contatto
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{contact.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[contact.role_title, contact.email]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.is_decision_maker && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 text-[10px]"
                        >
                          DM
                        </Badge>
                      )}
                      {contact.phone && (
                        <span className="text-xs text-muted-foreground">
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Associated deals */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B2A4A]">
              Deal Associati ({deals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="text-center py-6">
                <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nessun deal associato
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">
                        {deal.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.code} · {DEAL_TYPE_LABELS[deal.deal_type]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border font-medium">
                        {DEAL_STATUS_LABELS[deal.status]}
                      </span>
                      {deal.deal_value != null && (
                        <span className="text-xs font-medium">
                          {formatCurrency(deal.deal_value)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activities */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B2A4A]">
            Attività Recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nessuna attività recente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon =
                  activityIcons[activity.activity_type] || StickyNote;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#1B2A4A]/10 shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-[#1B2A4A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user?.full_name} ·{" "}
                        {new Date(activity.created_at).toLocaleDateString(
                          "it-IT",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit forms */}
      <CompanyForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        company={company}
        onSaved={() => {
          fetchCompany();
        }}
      />

      <ContactForm
        open={contactFormOpen}
        onOpenChange={setContactFormOpen}
        preselectedCompanyId={companyId}
        onSaved={fetchContacts}
      />
    </div>
  );
}
