import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

function StatCard({ label, value, hint, tone = "default" }) {
  const tones = {
    default: "border-slate-200 bg-white",
    dark: "border-slate-900 bg-slate-900 text-white",
    success: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-rose-200 bg-rose-50",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${tones[tone] || tones.default}`}>
      <div className="text-sm opacity-70">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value ?? 0}</div>
      {hint ? <div className="mt-2 text-xs opacity-70 leading-relaxed">{hint}</div> : null}
    </div>
  );
}

function Badge({ status }) {
  const s = (status || "").toLowerCase();

  const cls =
    s === "pending"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : s === "approved"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : s === "rejected"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : s === "draft"
            ? "border-slate-200 bg-slate-50 text-slate-700"
            : "border-slate-200 bg-slate-50 text-slate-700";

  const label =
    s === "pending" ? "PENDENTE" :
    s === "approved" ? "APROVADA" :
    s === "rejected" ? "REPROVADA" :
    s === "draft" ? "RASCUNHO" :
    (status || "-").toUpperCase();

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

export default function Dashboard() {
  const { stats, recent, flash } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Resumo rápido das suas viagens e aprovações.</p>
        </div>
      }
    >
      <Head title="Dashboard Funcionário" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
              {flash.ok}
            </div>
          )}

          {flash?.erro && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
              {flash.erro}
            </div>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Ações rápidas</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Comece uma nova viagem ou acompanhe as que já estão em andamento.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  href={route("employee.trips.create")}
                >
                  Nova viagem
                </Link>

                <Link
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href={route("employee.trips.index")}
                >
                  Minhas viagens
                </Link>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total de viagens" value={stats?.total ?? 0} tone="dark" />
            <StatCard label="Rascunhos" value={stats?.draft ?? 0} hint="Viagens que você ainda pode editar." />
            <StatCard label="Pendentes" value={stats?.pending ?? 0} hint="Aguardando aprovação da empresa." tone="warning" />
            <StatCard label="Aprovadas" value={stats?.approved ?? 0} tone="success" />
            <StatCard label="Reprovadas" value={stats?.rejected ?? 0} hint="Voltaram para correção." tone="danger" />
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Viagens recentes</h3>
                <p className="mt-1 text-sm text-slate-500">Últimas viagens atualizadas por você.</p>
              </div>

              <Link
                className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                href={route("employee.trips.index")}
              >
                Ver todas
              </Link>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Rota</th>
                    <th className="px-6 py-4 text-left font-semibold">Datas</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Aprovação</th>
                    <th className="px-6 py-4 text-left font-semibold">Atualizado</th>
                    <th className="px-6 py-4 text-right font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {(recent || []).map((t) => (
                    <tr key={t.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {t.city_origin} → {t.city_destination}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {t.start_date || "-"} → {t.end_date || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={t.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={t.approval_status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">{t.updated_at || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                          href={route("employee.trips.show", t.id)}
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {(recent || []).length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan="6">
                        Nenhuma viagem ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {(recent || []).map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {t.city_origin} → {t.city_destination}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {t.start_date || "-"} → {t.end_date || "-"}
                      </div>
                    </div>

                    <Link
                      className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                      href={route("employee.trips.show", t.id)}
                    >
                      Abrir
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge status={t.status} />
                    <Badge status={t.approval_status} />
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Atualizado: {t.updated_at || "-"}
                  </div>
                </div>
              ))}

              {(recent || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhuma viagem ainda.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 shadow-sm sm:p-5">
            <span className="font-semibold text-slate-800">Dica:</span> mantenha as viagens em{" "}
            <b>rascunho</b> enquanto adiciona entradas, despesas e anexos. Só finalize quando
            estiver tudo conferido.
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}