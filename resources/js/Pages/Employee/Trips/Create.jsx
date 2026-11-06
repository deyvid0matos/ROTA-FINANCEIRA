import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function Create() {
  const { vehicles = [] } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    vehicle_id: "",
    trip_name: "",
    city_origin: "",
    city_destination: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("employee.trips.store"), { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Nova viagem</h2>
          <p className="text-sm text-slate-500">
            Crie uma nova viagem como rascunho para preencher depois.
          </p>
        </div>
      }
    >
      <Head title="Nova Viagem" />

      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Dados iniciais da viagem
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Informe a descrição da viagem, origem, destino e, se quiser, associe um veículo.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Nome / descrição da viagem
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={data.trip_name}
                onChange={(e) => setData("trip_name", e.target.value)}
                placeholder="Ex: Instalação cliente Barreiras"
              />
              <FieldError msg={errors.trip_name} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Veículo (opcional)
              </label>

              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={data.vehicle_id}
                onChange={(e) => setData("vehicle_id", e.target.value)}
              >
                <option value="">— sem veículo —</option>

                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {`${v.brand ?? ""} ${v.model ?? ""}`.trim()} - {v.plate}
                  </option>
                ))}
              </select>

              <FieldError msg={errors.vehicle_id} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Cidade de saída
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={data.city_origin}
                  onChange={(e) => setData("city_origin", e.target.value)}
                  placeholder="Ex: Ibotirama"
                />
                <FieldError msg={errors.city_origin} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Cidade destino
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={data.city_destination}
                  onChange={(e) => setData("city_destination", e.target.value)}
                  placeholder="Ex: Barreiras"
                />
                <FieldError msg={errors.city_destination} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              A viagem será criada como <span className="font-semibold">rascunho</span>,
              então você poderá adicionar despesas, entradas, anexos, faturamento pendente e ajustar os dados depois.
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
              <button
                disabled={processing}
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
              >
                {processing ? "Criando..." : "Criar rascunho"}
              </button>

              <Link
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href={route("employee.trips.index")}
              >
                Voltar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
