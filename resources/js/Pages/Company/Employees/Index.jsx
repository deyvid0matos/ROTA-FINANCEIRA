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
  const { employees, flash } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Funcionários</h2>
          <p className="text-sm text-slate-500">Gerencie os colaboradores vinculados à empresa.</p>
        </div>
      }
    >
      <Head title="Funcionários" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
              {flash.ok}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Lista de funcionários</h3>
              <p className="text-sm text-slate-500">Cadastre novos usuários e acompanhe o status de cada um.</p>
            </div>

            <Link
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              href={route("company.employees.create")}
            >
              Novo funcionário
            </Link>
          </div>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Nome</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.data.map((e) => (
                    <tr key={e.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-slate-900">{e.full_name}</td>
                      <td className="px-6 py-4 text-slate-600">{e.user?.email || "-"}</td>
                      <td className="px-6 py-4">
                        <StatusPill active={e.is_active} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                          href={route("company.employees.edit", e.id)}
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {employees.data.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan="4">
                        Nenhum funcionário cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {employees.data.map((e) => (
                <div key={e.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{e.full_name}</div>
                      <div className="mt-1 text-sm text-slate-500">{e.user?.email || "-"}</div>
                    </div>
                    <StatusPill active={e.is_active} />
                  </div>

                  <div className="mt-4">
                    <Link
                      className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                      href={route("company.employees.edit", e.id)}
                    >
                      Editar funcionário
                    </Link>
                  </div>
                </div>
              ))}

              {employees.data.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhum funcionário cadastrado.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}