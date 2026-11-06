import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {active ? "ATIVO" : "INATIVO"}
    </span>
  );
}

export default function Index() {
  const { vehicles, flash } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Veículos</h2>
          <p className="text-sm text-slate-500">Acompanhe a frota da empresa e mantenha os dados organizados.</p>
        </div>
      }
    >
      <Head title="Veículos" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
              {flash.ok}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Lista de veículos</h3>
              <p className="text-sm text-slate-500">Cadastre e acompanhe os veículos disponíveis para viagem.</p>
            </div>

            <Link
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              href={route("company.vehicles.create")}
            >
              Novo veículo
            </Link>
          </div>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Placa</th>
                    <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                    <th className="px-6 py-4 text-left font-semibold">KM atual</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.data.map((v) => (
                    <tr key={v.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-slate-900">{v.plate}</td>
                      <td className="px-6 py-4 text-slate-600">{v.type || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">{v.km_current ?? "-"}</td>
                      <td className="px-6 py-4">
                        <StatusPill active={v.is_active} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                          href={route("company.vehicles.edit", v.id)}
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {vehicles.data.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan="5">
                        Nenhum veículo cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {vehicles.data.map((v) => (
                <div key={v.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{v.plate}</div>
                      <div className="mt-1 text-sm text-slate-500">Tipo: {v.type || "-"}</div>
                    </div>
                    <StatusPill active={v.is_active} />
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    KM atual: {v.km_current ?? "-"}
                  </div>

                  <div className="mt-4">
                    <Link
                      className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                      href={route("company.vehicles.edit", v.id)}
                    >
                      Editar veículo
                    </Link>
                  </div>
                </div>
              ))}

              {vehicles.data.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhum veículo cadastrado.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}