import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Index() {
  const { plans, flash } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Planos</h2>
          <p className="text-sm text-slate-500">
            Gerencie os planos disponíveis para as empresas.
          </p>
        </div>
      }
    >
      <Head title="Planos" />

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 space-y-6">
        {flash?.ok && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
            {flash.ok}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            href={route("super.plans.create")}
          >
            Novo plano
          </Link>

          <Link
            className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href={route("super.dashboard")}
          >
            Voltar
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left font-semibold">Nome</th>
                  <th className="p-4 text-left font-semibold">Código</th>
                  <th className="p-4 text-left font-semibold">Preço</th>
                  <th className="p-4 text-left font-semibold">Ativo</th>
                  <th className="p-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody>
                {plans.data.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">
                      {p.name}
                    </td>

                    <td className="p-4 text-slate-600">{p.code}</td>

                    <td className="p-4 text-slate-600">
                      R$ {p.price}
                    </td>

                    <td className="p-4 text-slate-600">
                      {p.is_active ? "Sim" : "Não"}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        href={route("super.plans.edit", p.id)}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}

                {plans.data.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-10 text-center text-sm text-slate-500"
                    >
                      Nenhum plano cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {plans.links?.length > 3 && (
          <div className="flex flex-wrap gap-2">
            {plans.links.map((l, idx) => (
              <Link
                key={idx}
                href={l.url || "#"}
                preserveScroll
                className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium
                ${
                  l.active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }
                ${!l.url ? "opacity-40 pointer-events-none" : ""}
                `}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}