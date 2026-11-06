import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

const EXPENSE_TYPES = [
  "Alimentação",
  "Combustivel",
  "Despesa Veículo",
  "Estacionamento",
  "Hospedagem",
  "Material de Instalação",
  "Material Diverso",
  "Outras Despesas",
  "Pagamento",
  "Uso e Consumo",
];

const ENTRY_TYPES = [
  "Saldo Inicial",
  "Devolução/Estorno",
  "Outros recebimentos",
  "Recebimento de cliente",
  "Reembolso",
  "Serviço Prestado",
  "Venda de produto",
];

function buildMapsUrl(lat, lng) {
  if (!lat || !lng) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

async function reverseGeocodeCity(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error("Falha ao consultar a cidade.");
  }

  const json = await response.json();
  const address = json?.address || {};

  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state_district ||
    ""
  );
}

function ActionButtons({ isDraft, isActive, onActivate, onDeactivate, onDelete }) {
  if (!isDraft) return null;

  if (isActive) {
    return (
      <button
        type="button"
        onClick={onDeactivate}
        className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Inativar
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onActivate}
        className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        Ativar
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Excluir
      </button>
    </div>
  );
}

export default function Show() {
  const { trip, flash, errors } = usePage().props;
  const [gpsStatus, setGpsStatus] = useState("unknown");

  const isDraft =
    trip.status === "draft" &&
    (trip.approval_status === "draft" || trip.approval_status === "rejected");
  const isPending = trip.approval_status === "pending";
  const isApproved = trip.approval_status === "approved";
  const isRejected = trip.approval_status === "rejected";

  const pdfUrl = `${route("employee.trips.pdf", trip.id)}?t=${Date.now()}`;

  const reloadTrip = () => {
    router.reload({
      only: ["trip", "flash", "errors"],
      preserveScroll: true,
    });
  };

  const tripForm = useForm({
    vehicle_id: trip.vehicle?.id || "",
    trip_name: trip.trip_name || "",
    city_origin: trip.city_origin || "",
    city_destination: trip.city_destination || "",
    start_date: trip.start_date || "",
    end_date: trip.end_date || "",
    route_description: trip.route_description || "",
    km_start: trip.km_start ?? "",
    km_end: trip.km_end ?? "",
    km_start_photo: null,
    km_end_photo: null,
  });

  const expenseForm = useForm({
    type: "",
    company_name: "",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10),
    description: "",
    latitude: "",
    longitude: "",
    city_name: "",
    expense_origin: "company",
    with_helper: false,
    receipt: null,
  });

  const entryForm = useForm({
    type: "",
    amount: "",
    description: "",
    receipt: null,
  });

  const billingForm = useForm({
    billing_date: new Date().toISOString().slice(0, 10),
    description: "",
    amount: "",
    notes: "",
  });

  const totalKmPreview = useMemo(() => {
    const start = tripForm.data.km_start === "" ? null : Number(tripForm.data.km_start);
    const end = tripForm.data.km_end === "" ? null : Number(tripForm.data.km_end);

    if (start === null || end === null || Number.isNaN(start) || Number.isNaN(end) || end < start) {
      return trip.total_km ?? "-";
    }

    return end - start;
  }, [tripForm.data.km_start, tripForm.data.km_end, trip.total_km]);

  useEffect(() => {
    const checkGpsPermission = async () => {
      try {
        if (!navigator.permissions || !navigator.permissions.query) {
          setGpsStatus("unsupported");
          return;
        }

        const result = await navigator.permissions.query({ name: "geolocation" });
        setGpsStatus(result.state);

        result.onchange = () => {
          setGpsStatus(result.state);
        };
      } catch {
        setGpsStatus("unsupported");
      }
    };

    checkGpsPermission();
  }, []);

  const saveTrip = (e) => {
    e.preventDefault();

    tripForm.submit("put", route("employee.trips.update", trip.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const addExpense = (e) => {
    e.preventDefault();

    expenseForm.post(route("employee.expenses.store", trip.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        expenseForm.reset(
          "type",
          "company_name",
          "amount",
          "expense_date",
          "description",
          "latitude",
          "longitude",
          "city_name",
          "expense_origin",
          "with_helper",
          "receipt"
        );
        expenseForm.setData("expense_date", new Date().toISOString().slice(0, 10));
        expenseForm.setData("expense_origin", "company");
        expenseForm.setData("with_helper", false);
        reloadTrip();
      },
    });
  };

  const addEntry = (e) => {
    e.preventDefault();

    entryForm.post(route("employee.entries.store", trip.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        entryForm.reset("type", "amount", "description", "receipt");
        reloadTrip();
      },
    });
  };

  const addBilling = (e) => {
    e.preventDefault();

    billingForm.post(route("employee.billings.store", trip.id), {
      preserveScroll: true,
      onSuccess: () => {
        billingForm.reset("billing_date", "description", "amount", "notes");
        billingForm.setData("billing_date", new Date().toISOString().slice(0, 10));
        reloadTrip();
      },
    });
  };

  const finish = () => {
    if (!confirm("Finalizar viagem? Depois disso você não edita mais.")) return;

    router.post(route("employee.trips.finish", trip.id), {}, {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const activateExpense = (expense) => {
    router.post(route("employee.expenses.activate", expense.id), {}, {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const deactivateExpense = (expense) => {
    router.post(route("employee.expenses.deactivate", expense.id), {}, {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const deleteExpense = (expense) => {
    if (!confirm("Deseja excluir esta despesa permanentemente?")) return;

    router.delete(route("employee.expenses.destroy", expense.id), {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const activateEntry = (entry) => {
    router.post(route("employee.entries.activate", entry.id), {}, {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const deactivateEntry = (entry) => {
    router.post(route("employee.entries.deactivate", entry.id), {}, {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const deleteEntry = (entry) => {
    if (!confirm("Deseja excluir esta entrada permanentemente?")) return;

    router.delete(route("employee.entries.destroy", entry.id), {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const activateBilling = (billing) => {
    router.post(route("employee.billings.activate", billing.id), {}, {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const deactivateBilling = (billing) => {
    router.post(route("employee.billings.deactivate", billing.id), {}, {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const deleteBilling = (billing) => {
    if (!confirm("Deseja excluir este item de faturamento permanentemente?")) return;

    router.delete(route("employee.billings.destroy", billing.id), {
      preserveScroll: true,
      onSuccess: reloadTrip,
    });
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS não suportado neste dispositivo.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude).toFixed(7);
        const lng = Number(position.coords.longitude).toFixed(7);

        expenseForm.setData("latitude", lat);
        expenseForm.setData("longitude", lng);
        setGpsStatus("granted");

        let city = "";

        try {
          city = await reverseGeocodeCity(lat, lng);
          expenseForm.setData("city_name", city || "");
        } catch {
          expenseForm.setData("city_name", "");
        }

        let msg = "Localização capturada com sucesso.";
        if (city) msg += `\nCidade mais próxima: ${city}`;
        if (typeof position.coords.accuracy === "number") {
          msg += `\nPrecisão aproximada: ${Math.round(position.coords.accuracy)}m`;
        }

        alert(msg);
      },
      (error) => {
        let message = "Não foi possível capturar a localização.";

        if (error?.code === 1) {
          message = "Permissão de localização negada.";
          setGpsStatus("denied");
        } else if (error?.code === 2) {
          message = "Localização indisponível.";
        } else if (error?.code === 3) {
          message = "Tempo esgotado ao tentar capturar localização.";
        }

        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const clearGPS = () => {
    expenseForm.setData("latitude", "");
    expenseForm.setData("longitude", "");
    expenseForm.setData("city_name", "");
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Viagem #{trip.id}</h2>
          <p className="text-sm text-slate-500">
            Gerencie dados da viagem, entradas, despesas, faturamento e localização.
          </p>
        </div>
      }
    >
      <Head title={`Viagem ${trip.id}`} />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {flash.ok}
            </div>
          )}

          {errors?.finish && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.finish}
            </div>
          )}

          {isPending && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Viagem enviada para aprovação. A edição fica bloqueada até a empresa decidir.
            </div>
          )}

          {isApproved && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Viagem aprovada. Edição bloqueada.
            </div>
          )}

          {isRejected && trip.rejection_reason && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <div className="font-semibold">Viagem reprovada. Motivo:</div>
              <div className="mt-1">{trip.rejection_reason}</div>
            </div>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="text-lg font-semibold text-slate-900">
                  {trip.trip_name || "Sem descrição"}
                </div>
                <div className="text-sm text-slate-500">
                  {trip.city_origin} → {trip.city_destination}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Status:</span>{" "}
                  <span className="uppercase">{trip.status}</span>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Aprovação:</span>{" "}
                  <span className="uppercase">{trip.approval_status}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href={route("employee.trips.index")}
                >
                  Voltar
                </Link>

                <a
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  target="_blank"
                  rel="noreferrer"
                  href={pdfUrl}
                >
                  Gerar PDF
                </a>

                {isDraft && (
                  <button
                    type="button"
                    onClick={finish}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Finalizar viagem
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Entradas ativas
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  R$ {trip.totals?.active_entries ?? "0.00"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Despesas ativas
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  R$ {trip.totals?.active_expenses ?? "0.00"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Saldo
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  R$ {trip.totals?.balance_active ?? "0.00"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Faturamento ativo
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  R$ {trip.totals?.active_billings ?? "0.00"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  KM total
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {trip.total_km ?? "-"}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Itens de faturamento ficam separados de entradas, despesas e saldo. Eles somam apenas entre si.
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">Dados da viagem</h3>
              <p className="text-sm text-slate-500">
                Informe KM inicial e KM final. O total de KM é calculado automaticamente.
              </p>
            </div>

            <form onSubmit={saveTrip} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <input type="hidden" value={tripForm.data.vehicle_id} readOnly />

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nome da viagem</label>
                <input
                  type="text"
                  value={tripForm.data.trip_name}
                  onChange={(e) => tripForm.setData("trip_name", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.trip_name} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Origem</label>
                <input
                  type="text"
                  value={tripForm.data.city_origin}
                  onChange={(e) => tripForm.setData("city_origin", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.city_origin} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Destino</label>
                <input
                  type="text"
                  value={tripForm.data.city_destination}
                  onChange={(e) => tripForm.setData("city_destination", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.city_destination} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Data inicial</label>
                <input
                  type="date"
                  value={tripForm.data.start_date}
                  onChange={(e) => tripForm.setData("start_date", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.start_date} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Data final</label>
                <input
                  type="date"
                  value={tripForm.data.end_date}
                  onChange={(e) => tripForm.setData("end_date", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.end_date} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">KM inicial</label>
                <input
                  type="number"
                  value={tripForm.data.km_start}
                  onChange={(e) => tripForm.setData("km_start", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.km_start} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">KM final</label>
                <input
                  type="number"
                  value={tripForm.data.km_end}
                  onChange={(e) => tripForm.setData("km_end", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.km_end} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total de KM calculado
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {totalKmPreview}
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição da rota</label>
                <textarea
                  rows="3"
                  value={tripForm.data.route_description}
                  onChange={(e) => tripForm.setData("route_description", e.target.value)}
                  disabled={!isDraft}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <FieldError msg={tripForm.errors.route_description} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Foto KM inicial</label>
                <input
                  type="file"
                  onChange={(e) => tripForm.setData("km_start_photo", e.target.files?.[0] || null)}
                  disabled={!isDraft}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:opacity-60"
                />
                <FieldError msg={tripForm.errors.km_start_photo} />
                {trip.km_start_photo_url && (
                  <a
                    href={trip.km_start_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
                  >
                    Ver anexo atual
                  </a>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Foto KM final</label>
                <input
                  type="file"
                  onChange={(e) => tripForm.setData("km_end_photo", e.target.files?.[0] || null)}
                  disabled={!isDraft}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:opacity-60"
                />
                <FieldError msg={tripForm.errors.km_end_photo} />
                {trip.km_end_photo_url && (
                  <a
                    href={trip.km_end_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
                  >
                    Ver anexo atual
                  </a>
                )}
              </div>

              {isDraft && (
                <div className="lg:col-span-2">
                  <button
                    type="submit"
                    disabled={tripForm.processing}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {tripForm.processing ? "Salvando..." : "Salvar dados da viagem"}
                  </button>
                </div>
              )}
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Entradas</h3>
                <p className="text-sm text-slate-500">Valores recebidos durante a viagem.</p>
              </div>

              <div className="text-sm text-slate-500">
                <span className="font-medium">Ativas:</span> R$ {trip.totals?.active_entries ?? "0.00"}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-medium">Total geral:</span> R$ {trip.totals?.all_entries ?? "0.00"}
              </div>
            </div>

            {isDraft && (
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

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Comprovante</label>
                  <input
                    type="file"
                    onChange={(e) => entryForm.setData("receipt", e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <FieldError msg={entryForm.errors.receipt} />
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
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
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

                    <ActionButtons
                      isDraft={isDraft}
                      isActive={entry.is_active}
                      onActivate={() => activateEntry(entry)}
                      onDeactivate={() => deactivateEntry(entry)}
                      onDelete={() => deleteEntry(entry)}
                    />
                  </div>
                </div>
              ))}

              {(trip.entries || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhuma entrada ainda.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Itens para faturamento posterior</h3>
                <p className="text-sm text-slate-500">
                  Esses itens somam apenas entre si e não entram em despesas, entradas ou saldo.
                </p>
              </div>

              <div className="text-sm text-slate-500">
                <span className="font-medium">Ativos:</span> R$ {trip.totals?.active_billings ?? "0.00"}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-medium">Total geral:</span> R$ {trip.totals?.all_billings ?? "0.00"}
              </div>
            </div>

            {isDraft && (
              <form onSubmit={addBilling} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                    placeholder="Ex.: 1500,00"
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

                <button
                  disabled={billingForm.processing}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 lg:col-span-2"
                >
                  {billingForm.processing ? "Adicionando..." : "Adicionar item de faturamento"}
                </button>
              </form>
            )}

            <div className="mt-5 space-y-3">
              {(trip.billings || []).map((billing) => (
                <div key={billing.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">
                        {billing.description} — R$ {billing.amount}
                        {!billing.is_active && (
                          <span className="ml-2 text-sm font-normal text-slate-500">(inativo)</span>
                        )}
                      </div>

                      <div className="mt-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">Data:</span>{" "}
                        {billing.billing_date || "-"}
                      </div>

                      {billing.notes && (
                        <div className="mt-2 text-sm text-slate-600">{billing.notes}</div>
                      )}
                    </div>

                    <ActionButtons
                      isDraft={isDraft}
                      isActive={billing.is_active}
                      onActivate={() => activateBilling(billing)}
                      onDeactivate={() => deactivateBilling(billing)}
                      onDelete={() => deleteBilling(billing)}
                    />
                  </div>
                </div>
              ))}

              {(trip.billings || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhum item de faturamento ainda.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Despesas</h3>
                <p className="text-sm text-slate-500">Lance gastos, comprovantes e localização da despesa.</p>
              </div>

              <div className="text-sm text-slate-500">
                <span className="font-medium">Ativas:</span> R$ {trip.totals?.active_expenses ?? "0.00"}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-medium">Total geral:</span> R$ {trip.totals?.all_expenses ?? "0.00"}
              </div>
            </div>

            {isDraft && (
              <form onSubmit={addExpense} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Tipo</label>
                  <select
                    value={expenseForm.data.type}
                    onChange={(e) => expenseForm.setData("type", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Selecione</option>
                    {EXPENSE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={expenseForm.errors.type} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Empresa</label>
                  <input
                    type="text"
                    value={expenseForm.data.company_name}
                    onChange={(e) => expenseForm.setData("company_name", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <FieldError msg={expenseForm.errors.company_name} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.data.amount}
                    onChange={(e) => expenseForm.setData("amount", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <FieldError msg={expenseForm.errors.amount} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Data da despesa</label>
                  <input
                    type="date"
                    value={expenseForm.data.expense_date}
                    onChange={(e) => expenseForm.setData("expense_date", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <FieldError msg={expenseForm.errors.expense_date} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Origem da despesa</label>
                  <select
                    value={expenseForm.data.expense_origin}
                    onChange={(e) => expenseForm.setData("expense_origin", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="company">Empresa</option>
                    <option value="service">Serviço</option>
                  </select>
                  <FieldError msg={expenseForm.errors.expense_origin} />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <input
                    id="with_helper"
                    type="checkbox"
                    checked={expenseForm.data.with_helper}
                    onChange={(e) => expenseForm.setData("with_helper", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  <label htmlFor="with_helper" className="text-sm font-medium text-slate-700">
                    Com ajudante
                  </label>
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição</label>
                  <textarea
                    rows="3"
                    value={expenseForm.data.description}
                    onChange={(e) => expenseForm.setData("description", e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <FieldError msg={expenseForm.errors.description} />
                </div>

                <div className="lg:col-span-2 rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Localização</div>
                      <div className="text-xs text-slate-500">
                        Status GPS: {gpsStatus === "granted"
                          ? "permitido"
                          : gpsStatus === "denied"
                          ? "negado"
                          : gpsStatus === "prompt"
                          ? "aguardando"
                          : gpsStatus === "unsupported"
                          ? "não suportado"
                          : "desconhecido"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={captureGPS}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Capturar GPS
                      </button>

                      <button
                        type="button"
                        onClick={clearGPS}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Limpar GPS
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Latitude</label>
                      <input
                        type="text"
                        value={expenseForm.data.latitude}
                        readOnly
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Longitude</label>
                      <input
                        type="text"
                        value={expenseForm.data.longitude}
                        readOnly
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Cidade mais próxima</label>
                      <input
                        type="text"
                        value={expenseForm.data.city_name}
                        readOnly
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Comprovante</label>
                  <input
                    type="file"
                    onChange={(e) => expenseForm.setData("receipt", e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <FieldError msg={expenseForm.errors.receipt} />
                </div>

                <button
                  disabled={expenseForm.processing}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 lg:col-span-2"
                >
                  {expenseForm.processing ? "Adicionando..." : "Adicionar despesa"}
                </button>
              </form>
            )}

            <div className="mt-5 space-y-3">
              {(trip.expenses || []).map((expense) => (
                <div key={expense.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
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
                          <span className="font-medium text-slate-700">Data:</span>{" "}
                          {expense.expense_date || "-"}
                        </span>
                        <span>
                          <span className="font-medium text-slate-700">Cidade:</span>{" "}
                          {expense.city_name || "-"}
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

                      {(expense.latitude || expense.longitude) && (
                        <div className="mt-1 text-xs text-slate-500">
                          GPS: {expense.latitude || "-"} / {expense.longitude || "-"}
                        </div>
                      )}

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

                    <ActionButtons
                      isDraft={isDraft}
                      isActive={expense.is_active}
                      onActivate={() => activateExpense(expense)}
                      onDeactivate={() => deactivateExpense(expense)}
                      onDelete={() => deleteExpense(expense)}
                    />
                  </div>
                </div>
              ))}

              {(trip.expenses || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  Nenhuma despesa ainda.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}