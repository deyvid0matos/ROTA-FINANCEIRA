import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

function Badge({ status, tripStatus }) {
  const approval = (status || "").toLowerCase();
  const baseStatus = (tripStatus || "").toLowerCase();

  const cls =
    baseStatus === "draft"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : approval === "pending"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : approval === "approved"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : approval === "rejected"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-slate-50 text-slate-700";

  const label =
    baseStatus === "draft"
      ? "EM ANDAMENTO"
      : approval === "pending"
        ? "PENDENTE"
        : approval === "approved"
          ? "APROVADA"
          : approval === "rejected"
            ? "REPROVADA"
            : (status || "-").toUpperCase();

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

export default function Index() {
  const { trips, filter } = usePage().props;

  const tabBtn = (key, label) => (
    <Link
      href={route("company.trips.index", { status: key })}
      preserveScroll
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
        (filter || "pending") === key
          ? "border border-slate-900 bg-slate-900 text-white"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Viagens</h2>
          <p className="text-sm text-slate-500">
            Acompanhe viagens em andamento, pendentes, aprovadas e reprovadas.
          </p>
        </div>
      }
    >
      <Head title="Viagens" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {tabBtn("live", "Em andamento")}
              {tabBtn("pending", "Pendentes")}
              {tabBtn("approved", "Aprovadas")}
              {tabBtn("rejected", "Reprovadas")}
              {tabBtn("all", "Todas")}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <h3 className="text-lg font-semibold text-slate-900">Lista de viagens</h3>
              <p className="mt-1 text-sm text-slate-500">
                Em “Em andamento”, o gerente pode acompanhar viagens abertas quase em tempo real.
              </p>
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Viagem</th>
                    <th className="px-6 py-4 text-left font-semibold">Funcionário</th>
                    <th className="px-6 py-4 text-left font-semibold">Veículo</th>
                    <th className="px-6 py-4 text-left font-semibold">Datas</th>
                    <th className="px-6 py-4 text-left font-semibold">KM</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {trips.data.map((t) => (
                    <tr key={t.id} className="border-t border-slate-100 align-top">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {t.city_origin} → {t.city_destination}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Descrição: {t.trip_name || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {t.employee_profile?.full_name || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {t.vehicle ? `${t.vehicle.brand} ${t.vehicle.model} - ${t.vehicle.plate}` : "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {t.start_date || "-"} → {t.end_date || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500">Total</div>
                        <div className="font-semibold text-slate-900">{t.total_km ?? "-"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge status={t.approval_status} tripStatus={t.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                          href={route("company.trips.show", t.id)}
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {trips.data.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan="7">
                        Nenhuma viagem neste filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 xl:hidden">
              {trips.data.map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {t.city_origin} → {t.city_destination}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Descrição: {t.trip_name || "-"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {t.start_date || "-"} → {t.end_date || "-"}
                      </div>
                    </div>

                    <Badge status={t.approval_status} tripStatus={t.status} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div><span className="font-medium text-slate-800">Funcionário:</span> {t.employee_profile?.full_name || "-"}</div>
                    <div><span className="font-medium text-slate-800">Veículo:</span> {t.vehicle ? `${t.vehicle.brand} ${t.vehicle.model} - ${t.vehicle.plate}` : "-"}</div>
                    <div><span className="font-medium text-slate-800">KM total:</span> {t.total_km ?? "-"}</div>
                  </div>

                  <div className="mt-4">
                    <Link
                      className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                      href={route("company.trips.show", t.id)}
                    >
                      Abrir viagem
                    </Link>
                  </div>
                </div>
              ))}

              {trips.data.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhuma viagem neste filtro.
                </div>
              )}
            </div>
          </section>

          {trips.links?.length > 3 && (
            <div className="flex flex-wrap gap-2">
              {trips.links.map((l, idx) => (
                <Link
                  key={idx}
                  href={l.url || "#"}
                  preserveScroll
                  className={`inline-flex min-h-[42px] items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    l.active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  } ${!l.url ? "pointer-events-none opacity-50" : ""}`}
                  dangerouslySetInnerHTML={{ __html: l.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
