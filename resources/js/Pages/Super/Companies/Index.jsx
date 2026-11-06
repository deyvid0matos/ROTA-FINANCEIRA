import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

function getStatus(company) {
  const now = new Date();
  const expires =
    company.subscription_ends_at ? new Date(company.subscription_ends_at) : null;

  if (!company.is_active) {
    return { label: "Bloqueada", color: "bg-rose-100 text-rose-700 border-rose-200" };
  }

  if (expires && expires < now) {
    return { label: "Vencida", color: "bg-amber-100 text-amber-700 border-amber-200" };
  }

  return { label: "Ativa", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

export default function Index() {
  const { companies, flash } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Empresas</h2>
          <p className="text-sm text-slate-500">
            Gerencie empresas cadastradas, planos e assinaturas.
          </p>
        </div>
      }
    >
      <Head title="Empresas" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 space-y-6">
        {flash?.ok && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
            {flash.ok}
          </div>
        )}

        {/* AÇÕES */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3 flex-wrap">
            <Link
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              href={route("super.companies.create")}
            >
              Nova empresa
            </Link>

            <Link
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href={route("super.dashboard")}
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* TABELA */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left font-semibold">Empresa</th>
                  <th className="p-4 text-left font-semibold">CNPJ</th>
                  <th className="p-4 text-left font-semibold">Cidade/UF</th>
                  <th className="p-4 text-left font-semibold">Plano</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Vencimento</th>
                  <th className="p-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody>
                {companies.data.map((c) => {
                  const status = getStatus(c);

                  return (
                    <tr
                      key={c.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        {c.name}
                      </td>

                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {c.cnpj || "-"}
                      </td>

                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {c.city || "-"}
                        {c.state ? `/${c.state}` : ""}
                      </td>

                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {c.plan_rel?.name || c.plan || "-"}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {c.subscription_ends_at
                          ? new Date(c.subscription_ends_at).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <Link
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                          href={route("super.companies.edit", c.id)}
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {companies.data.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-10 text-center text-sm text-slate-500"
                    >
                      Nenhuma empresa cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINAÇÃO */}
        <div className="flex flex-wrap gap-2">
          {companies.links.map((l, idx) => (
            <Link
              key={idx}
              href={l.url || "#"}
              className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition
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
      </div>
    </AuthenticatedLayout>
  );
}