import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

function statusBadge(t) {
  const status = (t.status || "").toLowerCase();
  const approval = (t.approval_status || "").toLowerCase();

  if (status === "draft") {
    if (approval === "rejected") {
      return {
        text: "Devolvida p/ correção",
        cls: "border-rose-200 bg-rose-50 text-rose-700",
      };
    }

    return {
      text: "Rascunho",
      cls: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }

  if (status === "finished") {
    if (approval === "pending") {
      return {
        text: "Aguardando aprovação",
        cls: "border-blue-200 bg-blue-50 text-blue-700",
      };
    }

    if (approval === "approved") {
      return {
        text: "Aprovada",
        cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (approval === "rejected") {
      return {
        text: "Reprovada",
        cls: "border-rose-200 bg-rose-50 text-rose-700",
      };
    }

    return {
      text: "Finalizada",
      cls: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    text: t.status || "-",
    cls: "border-slate-200 bg-slate-50 text-slate-700",
  };
}

export default function Index() {
  const { trips, filters, flash } = usePage().props;

  const [form, setForm] = useState({
    origin: filters?.origin || "",
    destination: filters?.destination || "",
    description: filters?.description || "",
    situation: filters?.situation || "",
  });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();

    router.get(route("employee.trips.index"), form, {
      preserveState: true,
      preserveScroll: true,
    });
  }

  function clear() {
    router.get(route("employee.trips.index"));
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Minhas viagens</h2>
          <p className="text-sm text-slate-500">
            Acompanhe rascunhos, viagens enviadas e aprovações.
          </p>
        </div>
      }
    >
      <Head title="Minhas Viagens" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {flash.ok}
            </div>
          )}

          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Lista de viagens</h3>
              <p className="text-sm text-slate-500">
                Abra uma viagem para editar os dados, lançar despesas e anexar comprovantes.
              </p>
            </div>

            <Link
              href={route("employee.trips.create")}
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Nova viagem
            </Link>
          </section>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Filtros</h3>
              <p className="mt-1 text-sm text-slate-500">
                Você pode filtrar por origem, destino, descrição e situação.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Origem
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.origin}
                  onChange={(e) => updateField("origin", e.target.value)}
                  placeholder="Cidade origem"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Destino
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  placeholder="Cidade destino"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Descrição
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Nome da viagem"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Situação
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.situation}
                  onChange={(e) => updateField("situation", e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="draft">Rascunho</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovada</option>
                  <option value="rejected">Reprovada</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              <button
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="submit"
              >
                Filtrar
              </button>

              <button
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={clear}
              >
                Limpar
              </button>
            </div>
          </form>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <h3 className="text-lg font-semibold text-slate-900">Viagens cadastradas</h3>
              <p className="mt-1 text-sm text-slate-500">
                A descrição da viagem aparece ao lado da rota para facilitar a identificação.
              </p>
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Viagem</th>
                    <th className="px-6 py-4 text-left font-semibold">Datas</th>
                    <th className="px-6 py-4 text-left font-semibold">Situação</th>
                    <th className="px-6 py-4 text-right font-semibold">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {trips.data.map((t) => {
                    const badge = statusBadge(t);

                    return (
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
                          {t.start_date || "-"} → {t.end_date || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                            href={route("employee.trips.show", t.id)}
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {trips.data.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan="4">
                        Nenhuma viagem encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 xl:hidden">
              {trips.data.map((t) => {
                const badge = statusBadge(t);

                return (
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

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </div>

                    <div className="mt-4">
                      <Link
                        className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                        href={route("employee.trips.show", t.id)}
                      >
                        Abrir viagem
                      </Link>
                    </div>
                  </div>
                );
              })}

              {trips.data.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhuma viagem encontrada.
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
