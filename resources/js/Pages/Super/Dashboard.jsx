import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

function MetricCard({ label, value, href }) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value ?? "-"}</div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

export default function Dashboard() {
  const { metrics, alerts } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Admin Master
          </h2>
          <p className="text-sm text-slate-500">
            Painel geral do sistema
          </p>
        </div>
      }
    >
      <Head title="Admin Master" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-6">

          {/* MENU PRINCIPAL */}
          <section className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              href={route("super.companies.index")}
            >
              Empresas
            </Link>

            <Link
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={route("super.plans.index")}
            >
              Planos
            </Link>
          </section>

          {/* MÉTRICAS */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <MetricCard
              label="Empresas (total)"
              value={metrics?.companies_total}
              href={route("super.companies.index")}
            />

            <MetricCard
              label="Empresas ativas"
              value={metrics?.companies_active}
              href={route("super.companies.index")}
            />

            <MetricCard
              label="Empresas bloqueadas"
              value={metrics?.companies_blocked}
              href={route("super.companies.index")}
            />

            <MetricCard
              label="Empresas vencidas"
              value={metrics?.companies_expired}
            />

            <MetricCard
              label="Vencem em 7 dias"
              value={metrics?.companies_expiring_7}
            />

            <MetricCard
              label="Vencem em 30 dias"
              value={metrics?.companies_expiring_30}
            />

          </section>

          {/* ALERTAS */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* EMPRESAS VENCENDO */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Empresas vencendo (30 dias)
              </h3>

              <div className="mt-4 space-y-3">

                {(alerts?.expiring_soon || []).map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {c.name}
                      </div>

                      <div className="text-sm text-slate-500">
                        Vence em: {String(c.subscription_ends_at).slice(0, 10)}
                      </div>
                    </div>

                    <Link
                      className="text-sm font-semibold text-slate-700 underline underline-offset-4"
                      href={route("super.companies.edit", c.id)}
                    >
                      Abrir
                    </Link>
                  </div>
                ))}

                {(alerts?.expiring_soon || []).length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    Nenhuma empresa vencendo nos próximos 30 dias.
                  </div>
                )}

              </div>
            </div>

            {/* EMPRESAS BLOQUEADAS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Empresas bloqueadas
              </h3>

              <div className="mt-4 space-y-3">

                {(alerts?.blocked || []).map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {c.name}
                      </div>

                      <div className="text-sm text-slate-500">
                        {c.blocked_reason || "-"}
                      </div>
                    </div>

                    <Link
                      className="text-sm font-semibold text-slate-700 underline underline-offset-4"
                      href={route("super.companies.edit", c.id)}
                    >
                      Abrir
                    </Link>
                  </div>
                ))}

                {(alerts?.blocked || []).length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    Nenhuma empresa bloqueada.
                  </div>
                )}

              </div>
            </div>

          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}