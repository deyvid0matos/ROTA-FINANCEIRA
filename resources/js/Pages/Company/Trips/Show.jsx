import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-rose-600">{msg}</div>;
}

function buildMapsUrl(lat, lng) {
  if (!lat || !lng) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}

const ENTRY_TYPES = [
  "Saldo Inicial",
  "Devolução/Estorno",
  "Outros recebimentos",
  "Recebimento de cliente",
  "Reembolso",
  "Serviço Prestado",
  "Venda de produto",
];

export default function Show() {
  const { trip, flash } = usePage().props;
  const rejectForm = useForm({ rejection_reason: "" });

  const entryForm = useForm({
    type: "",
    amount: "",
    description: "",
  });

  const billingForm = useForm({
    billing_date: "",
    description: "",
    amount: "",
    notes: "",
  });

  const [editingBillingId, setEditingBillingId] = useState(null);

  const isPending = trip.approval_status === "pending";
  const isApproved = trip.approval_status === "approved";
  const isRejected = trip.approval_status === "rejected";
  const canManageFinancials = trip.approval_status !== "approved";

  const approve = () => {
    if (!confirm("Aprovar esta viagem?")) return;
    router.post(route("company.trips.approve", trip.id), {}, { preserveScroll: true });
  };

  const reject = (e) => {
    e.preventDefault();
    if (!confirm("Reprovar esta viagem e devolver para correção?")) return;

    rejectForm.post(route("company.trips.reject", trip.id), {
      preserveScroll: true,
      onSuccess: () => rejectForm.reset("rejection_reason"),
    });
  };

  const reopenApproval = () => {
    if (!confirm("Reabrir aprovação? Isso vai voltar para pendente.")) return;
    router.post(route("company.trips.reopen", trip.id), {}, { preserveScroll: true });
  };

  const addEntry = (e) => {
    e.preventDefault();

    entryForm.post(route("company.entries.store", trip.id), {
      preserveScroll: true,
      onSuccess: () => {
        entryForm.reset("type", "amount", "description");
      },
    });
  };

  const startEditBilling = (billing) => {
    setEditingBillingId(billing.id);
    billingForm.setData({
      billing_date: billing.billing_date
        ? billing.billing_date.split("/").reverse().join("-")
        : "",
      description: billing.description || "",
      amount: billing.amount || "",
      notes: billing.notes || "",
    });
    billingForm.clearErrors();
  };

  const cancelEditBilling = () => {
    setEditingBillingId(null);
    billingForm.reset("billing_date", "description", "amount", "notes");
    billingForm.clearErrors();
  };

  const saveBilling = (e, billingId) => {
    e.preventDefault();

    billingForm.put(route("company.billings.update", billingId), {
      preserveScroll: true,
      onSuccess: () => {
        cancelEditBilling();
      },
    });
  };

  useEffect(() => {
    if (trip.status !== "draft") return;

    const interval = window.setInterval(() => {
      router.reload({
        only: ["trip", "flash", "errors"],
        preserveScroll: true,
      });
    }, 15000);

    return () => window.clearInterval(interval);
  }, [trip.id, trip.status]);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Viagem #{trip.id}</h2>
          <p className="text-sm text-slate-500">Detalhes completos da viagem e análise financeira.</p>
        </div>
      }
    >
      <Head title={`Viagem ${trip.id}`} />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
              {flash.ok}
            </div>
          )}

          {isApproved && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Viagem aprovada. Para lançar entrada ou editar faturamento, reabra a aprovação.
            </div>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-900">{trip.trip_name || "Sem descrição"}</div>
                <div className="mt-1 text-sm text-slate-500">{trip.city_origin} → {trip.city_destination}</div>
                <div className="mt-2 text-sm text-slate-500">
                  Aprovação: <span className="font-semibold uppercase text-slate-800">{trip.approval_status}</span>
                </div>

                {isRejected && trip.rejection_reason && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    <div className="font-semibold">Motivo da reprovação:</div>
                    <div className="mt-1 opacity-90">{trip.rejection_reason}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  href={route("company.trips.index", { status: trip.status === "draft" ? "live" : "pending" })}
                >
                  Voltar
                </Link>

                <a
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  target="_blank"
                  rel="noreferrer"
                  href={route("company.trips.pdf", trip.id)}
                >
                  Gerar PDF
                </a>

                {(isApproved || isRejected) && (
                  <button
                    type="button"
                    onClick={reopenApproval}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Reabrir aprovação
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Funcionário" value={trip.employee?.full_name || "-"} />
              <InfoCard
                label="Veículo"
                value={trip.vehicle ? `${trip.vehicle.brand} ${trip.vehicle.model} - ${trip.vehicle.plate}` : "-"}
              />
              <InfoCard label="Entradas ativas" value={`R$ ${trip.totals?.active_entries ?? "0.00"}`} />
              <InfoCard label="Despesas ativas" value={`R$ ${trip.totals?.active_expenses ?? "0.00"}`} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Saldo" value={`R$ ${trip.totals?.balance_active ?? "0.00"}`} />
              <InfoCard label="Faturamento ativo" value={`R$ ${trip.totals?.active_billings ?? "0.00"}`} />
              <InfoCard label="KM inicial" value={trip.km_start ?? "-"} />
              <InfoCard label="KM final" value={trip.km_end ?? "-"} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCard label="KM total calculado" value={trip.total_km ?? "-"} />
              <InfoCard label="Faturamento total" value={`R$ ${trip.totals?.all_billings ?? "0.00"}`} />
            </div>

            {trip.status === "draft" && (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Acompanhamento ao vivo ativado. Esta tela recarrega sozinha a cada 15 segundos.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Datas</div>
                <div className="mt-2 text-sm text-slate-600">
                  {trip.start_date || "-"} → {trip.end_date || "-"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Descrição da rota</div>
                <div className="mt-2 text-sm text-slate-600">{trip.route_description || "-"}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Foto KM inicial</div>
                {trip.km_start_photo_url ? (
                  <a
                    className="mt-2 inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
                    href={trip.km_start_photo_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver anexo
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">Sem anexo.</div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Foto KM final</div>
                {trip.km_end_photo_url ? (
                  <a
                    className="mt-2 inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
                    href={trip.km_end_photo_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver anexo
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">Sem anexo.</div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Entradas</h3>
                <p className="text-sm text-slate-500">Lançamentos de entrada da viagem.</p>
              </div>

              <div className="text-sm text-slate-500">
                <span className="font-medium">Ativas:</span> R$ {trip.totals?.active_entries ?? "0.00"}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-medium">Total:</span> R$ {trip.totals?.all_entries ?? "0.00"}
              </div>
            </div>

            {canManageFinancials && (
              <form onSubmit={addEntry} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Tipo</label>
                  <select
                    value={entryForm.data.type}
                    onChange={(e) => entryForm.setData("type", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Selecione</option>
                    {ENTRY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={entryForm.errors.type} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entryForm.data.amount}
                    onChange={(e) => entryForm.setData("amount", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <FieldError msg={entryForm.errors.amount} />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição</label>
                  <textarea
                    rows="3"
                    value={entryForm.data.description}
                    onChange={(e) => entryForm.setData("description", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <FieldError msg={entryForm.errors.description} />
                </div>

                <button
                  disabled={entryForm.processing}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 lg:col-span-2"
                >
                  {entryForm.processing ? "Adicionando..." : "Adicionar entrada"}
                </button>
              </form>
            )}

            <div className="mt-5 space-y-3">
              {(trip.entries || []).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">
                    {entry.type} — R$ {entry.amount}
                    {!entry.is_active && (
                      <span className="ml-2 text-sm font-normal text-slate-500">(inativa)</span>
                    )}
                  </div>

                  {entry.description && (
                    <div className="mt-1 text-sm text-slate-600">{entry.description}</div>
                  )}

                  {entry.receipt_url && (
                    <a
                      className="mt-2 inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
                      target="_blank"
                      rel="noreferrer"
                      href={entry.receipt_url}
                    >
                      Ver comprovante
                    </a>
                  )}
                </div>
              ))}

              {(trip.entries || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhuma entrada.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Itens para faturamento posterior</h3>
                <p className="text-sm text-slate-500">
                  Esses itens não entram no saldo da viagem.
                </p>
              </div>

              <div className="text-sm text-slate-500">
                <span className="font-medium">Ativos:</span> R$ {trip.totals?.active_billings ?? "0.00"}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-medium">Total:</span> R$ {trip.totals?.all_billings ?? "0.00"}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(trip.billings || []).map((billing) => (
                <div key={billing.id} className="rounded-2xl border border-slate-200 p-4">
                  {editingBillingId === billing.id ? (
                    <form onSubmit={(e) => saveBilling(e, billing.id)} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Data</label>
                        <input
                          type="date"
                          value={billingForm.data.billing_date}
                          onChange={(e) => billingForm.setData("billing_date", e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                        <FieldError msg={billingForm.errors.billing_date} />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Valor</label>
                        <input
                          type="text"
                          value={billingForm.data.amount}
                          onChange={(e) => billingForm.setData("amount", e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                        <FieldError msg={billingForm.errors.amount} />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição</label>
                        <input
                          type="text"
                          value={billingForm.data.description}
                          onChange={(e) => billingForm.setData("description", e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                        <FieldError msg={billingForm.errors.description} />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Observação</label>
                        <textarea
                          rows="3"
                          value={billingForm.data.notes}
                          onChange={(e) => billingForm.setData("notes", e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                        <FieldError msg={billingForm.errors.notes} />
                      </div>

                      <div className="lg:col-span-2 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={billingForm.processing}
                          className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {billingForm.processing ? "Salvando..." : "Salvar faturamento"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditBilling}
                          className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900">
                            {billing.description} — R$ {billing.amount}
                            {!billing.is_active && (
                              <span className="ml-2 text-sm font-normal text-slate-500">(inativo)</span>
                            )}
                          </div>

                          <div className="mt-2 text-sm text-slate-500">
                            <span className="font-medium text-slate-700">Data:</span> {billing.billing_date || "-"}
                          </div>

                          {billing.notes && (
                            <div className="mt-2 text-sm text-slate-600">{billing.notes}</div>
                          )}
                        </div>

                        {canManageFinancials && (
                          <button
                            type="button"
                            onClick={() => startEditBilling(billing)}
                            className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {(trip.billings || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhum item de faturamento.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Despesas</h3>
                <p className="text-sm text-slate-500">Lançamentos de despesa da viagem.</p>
              </div>

              <div className="text-sm text-slate-500">
                <span className="font-medium">Ativas:</span> R$ {trip.totals?.active_expenses ?? "0.00"}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-medium">Total:</span> R$ {trip.totals?.all_expenses ?? "0.00"}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(trip.expenses || []).map((expense) => (
                <div key={expense.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">
                    {expense.type} — R$ {expense.amount}
                    {!expense.is_active && (
                      <span className="ml-2 text-sm font-normal text-slate-500">(inativa)</span>
                    )}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">{expense.company_name || "-"}</div>

                  {expense.description && (
                    <div className="mt-1 text-sm text-slate-600">{expense.description}</div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span>
                      <span className="font-medium text-slate-700">Data:</span> {expense.expense_date || "-"}
                    </span>
                    <span>
                      <span className="font-medium text-slate-700">Cidade:</span> {expense.city_name || "-"}
                    </span>
                    <span>
                      <span className="font-medium text-slate-700">Origem:</span>{" "}
                      {expense.expense_origin === "service" ? "Serviço" : "Empresa"}
                    </span>
                    <span>
                      <span className="font-medium text-slate-700">Ajudante:</span>{" "}
                      {expense.with_helper ? "Sim" : "Não"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {expense.receipt_url && (
                      <a
                        className="text-sm font-medium text-slate-700 underline underline-offset-4"
                        target="_blank"
                        rel="noreferrer"
                        href={expense.receipt_url}
                      >
                        Ver comprovante
                      </a>
                    )}

                    {expense.latitude && expense.longitude && (
                      <a
                        className="text-sm font-medium text-slate-700 underline underline-offset-4"
                        target="_blank"
                        rel="noreferrer"
                        href={buildMapsUrl(expense.latitude, expense.longitude)}
                      >
                        Abrir no mapa
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {(trip.expenses || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhuma despesa.
                </div>
              )}
            </div>
          </section>

          {isPending && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={approve}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Aprovar viagem
                </button>
              </div>

              <form onSubmit={reject} className="mt-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Motivo da reprovação</label>
                <textarea
                  rows="4"
                  value={rejectForm.data.rejection_reason}
                  onChange={(e) => rejectForm.setData("rejection_reason", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <FieldError msg={rejectForm.errors.rejection_reason} />

                <button
                  type="submit"
                  disabled={rejectForm.processing}
                  className="mt-3 inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {rejectForm.processing ? "Reprovando..." : "Reprovar viagem"}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}