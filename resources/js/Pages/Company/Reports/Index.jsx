import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

function badge(status, approval) {
  const s = (status || "").toLowerCase();
  const a = (approval || "").toLowerCase();

  if (s === "draft" && a === "rejected") {
    return {
      text: "Devolvida",
      cls: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (s === "draft") {
    return {
      text: "Rascunho",
      cls: "border-gray-200 bg-gray-50 text-gray-700",
    };
  }

  if (s === "finished" && a === "pending") {
    return {
      text: "Pendente",
      cls: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (a === "approved") {
    return {
      text: "Aprovada",
      cls: "border-green-200 bg-green-50 text-green-700",
    };
  }

  if (a === "rejected") {
    return {
      text: "Reprovada",
      cls: "border-red-200 bg-red-50 text-red-700",
    };
  }

  return {
    text: (a || s || "-").toUpperCase(),
    cls: "border-gray-200 bg-gray-50 text-gray-700",
  };
}

export default function Index() {
  const { trips, filters } = usePage().props;

  const [form, setForm] = useState({
    trip_id: filters?.trip_id || "",
    employee: filters?.employee || "",
    origin: filters?.origin || "",
    destination: filters?.destination || "",
    date_from: filters?.date_from || "",
    date_to: filters?.date_to || "",
    situation: filters?.situation || "",
    expense_type: filters?.expense_type || "",
    entry_type: filters?.entry_type || "",
  });

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function submit(e) {
    e.preventDefault();

    router.get(route("company.reports.index"), form, {
      preserveScroll: true,
      preserveState: true,
    });
  }

  function clear() {
    router.get(route("company.reports.index"));
  }

  const qs = new URLSearchParams(form).toString();
  const pdfSummaryUrl =
    route("company.reports.pdf.summary") + (qs ? `?${qs}` : "");
  const pdfDetailedUrl =
    route("company.reports.pdf.detailed") + (qs ? `?${qs}` : "");

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Relatórios</h2>
          <p className="text-sm text-slate-500">
            Filtre viagens e gere PDFs resumidos ou detalhados.
          </p>
        </div>
      }
    >
      <Head title="Relatórios" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          <form
            onSubmit={submit}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Filtros do relatório
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Use os campos abaixo para refinar a consulta.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  ID da viagem
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.trip_id}
                  onChange={(e) => updateField("trip_id", e.target.value)}
                  placeholder="Ex: 12"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Funcionário
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.employee}
                  onChange={(e) => updateField("employee", e.target.value)}
                  placeholder="Nome do funcionário"
                />
              </div>

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
                  Data início
                </label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.date_from}
                  onChange={(e) => updateField("date_from", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Data fim
                </label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.date_to}
                  onChange={(e) => updateField("date_to", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tipo de despesa
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.expense_type}
                  onChange={(e) => updateField("expense_type", e.target.value)}
                  placeholder="Ex: Combustível"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tipo de entrada
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.entry_type}
                  onChange={(e) => updateField("entry_type", e.target.value)}
                  placeholder="Ex: Reembolso"
                />
              </div>

              <div className="xl:col-span-1">
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

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
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

                <a
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  target="_blank"
                  rel="noreferrer"
                  href={pdfSummaryUrl}
                >
                  PDF Resumo
                </a>

                <a
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  target="_blank"
                  rel="noreferrer"
                  href={pdfDetailedUrl}
                >
                  PDF Detalhado
                </a>
              </div>

              <Link
                className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                href={route("company.trips.index")}
              >
                Voltar para viagens
              </Link>
            </div>
          </form>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Resultado do relatório
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Visualize rapidamente entradas, despesas e saldo por viagem.
              </p>
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">
                      Viagem
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Funcionário
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Datas
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Situação
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Entradas
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Despesas
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Saldo
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {trips.data.map((t) => {
                    const b = badge(t.status, t.approval_status);

                    return (
                      <tr
                        key={t.id}
                        className="border-t border-slate-100 align-top"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          #{t.id} — {t.city_origin} → {t.city_destination}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {t.employee_name || "-"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {t.start_date || "-"} → {t.end_date || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${b.cls}`}
                          >
                            {b.text}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap text-slate-700">
                          R$ {t.totals.active_entries}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap text-slate-700">
                          R$ {t.totals.active_expenses}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap font-semibold text-slate-900">
                          R$ {t.totals.balance}
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
                    );
                  })}

                  {trips.data.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-sm text-slate-500">
                        Nenhuma viagem encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 xl:hidden">
              {trips.data.map((t) => {
                const b = badge(t.status, t.approval_status);

                return (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          #{t.id} — {t.city_origin} → {t.city_destination}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {t.start_date || "-"} → {t.end_date || "-"}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${b.cls}`}
                      >
                        {b.text}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div>
                        <span className="font-medium text-slate-800">
                          Funcionário:
                        </span>{" "}
                        {t.employee_name || "-"}
                      </div>

                      <div>
                        <span className="font-medium text-slate-800">
                          Entradas:
                        </span>{" "}
                        R$ {t.totals.active_entries}
                      </div>

                      <div>
                        <span className="font-medium text-slate-800">
                          Despesas:
                        </span>{" "}
                        R$ {t.totals.active_expenses}
                      </div>

                      <div>
                        <span className="font-medium text-slate-800">
                          Saldo:
                        </span>{" "}
                        <span className="font-semibold text-slate-900">
                          R$ {t.totals.balance}
                        </span>
                      </div>
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