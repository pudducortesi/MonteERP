"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError("Errore nell'invio dell'email. Riprova.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Montesino</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestionale M&A</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-8">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
            Recupera password
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Inserisci la tua email per ricevere un link di recupero.
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 text-sm px-3 py-3 rounded-lg border border-green-200">
                Email inviata con successo. Controlla la tua casella di posta
                per il link di recupero.
              </div>
              <Link
                href="/login"
                className="block text-center w-full bg-[#E87A2E] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#D16A1E] transition-colors"
              >
                Torna al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#374151] mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nome@montesino.it"
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A2E] focus:border-transparent transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E87A2E] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#D16A1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Invio in corso..." : "Invia link di recupero"}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-[#1A1A1A] hover:underline"
                >
                  Torna al login
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Montesino SpA — Sistema gestionale riservato
        </p>
      </div>
    </div>
  );
}
