import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function Edit() {
  const { vehicle, flash } = usePage().props;

  const form = useForm({
    type: vehicle.type || "car",
    brand: vehicle.brand || "",
    model: vehicle.model || "",
    color: vehicle.color || "",
    plate: vehicle.plate || "",
    km_current: vehicle.km_current ?? 0,
  });

  const submit = (e) => {
    e.preventDefault();
    form.put(route("company.vehicles.update", vehicle.id));
  };

  const activate = () =>
    form.post(route("company.vehicles.activate", vehicle.id));

  const deactivate = () =>
    form.post(route("company.vehicles.deactivate", vehicle.id));

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h2 className="text-xl font-semibold">Editar veículo</h2>
          <p className="text-sm text-gray-500">
            Atualize os dados do veículo.
          </p>
        </div>
      }
    >
      <Head title="Editar veículo" />

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">

        {flash?.ok && (
          <div className="p-3 rounded-xl bg-green-100 font-semibold">
            {flash.ok}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b flex items-start justify-between">

            <div>
              <div className="text-lg font-semibold">{vehicle.plate}</div>
              <div className="text-sm text-gray-500">
                Status: {vehicle.is_active ? "Ativo" : "Inativo"}
              </div>
            </div>

            <div className="flex gap-2">
              {vehicle.is_active ? (
                <button
                  type="button"
                  onClick={deactivate}
                  className="px-4 py-2 border rounded-xl"
                >
                  Desativar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={activate}
                  className="px-4 py-2 bg-black text-white rounded-xl"
                >
                  Ativar
                </button>
              )}
            </div>

          </div>

          <form onSubmit={submit}>

            <div className="p-6 space-y-5">

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Tipo
                </label>

                <select
                  className="w-full border rounded-2xl p-3"
                  value={form.data.type}
                  onChange={(e) => form.setData("type", e.target.value)}
                >
                  <option value="car">Carro</option>
                  <option value="moto">Moto</option>
                </select>

                <FieldError msg={form.errors.type} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Marca
                  </label>

                  <input
                    className="w-full border rounded-2xl p-3"
                    value={form.data.brand}
                    onChange={(e) => form.setData("brand", e.target.value)}
                  />

                  <FieldError msg={form.errors.brand} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Modelo
                  </label>

                  <input
                    className="w-full border rounded-2xl p-3"
                    value={form.data.model}
                    onChange={(e) => form.setData("model", e.target.value)}
                  />

                  <FieldError msg={form.errors.model} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Cor
                  </label>

                  <input
                    className="w-full border rounded-2xl p-3"
                    value={form.data.color}
                    onChange={(e) => form.setData("color", e.target.value)}
                  />

                  <FieldError msg={form.errors.color} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Placa
                  </label>

                  <input
                    className="w-full border rounded-2xl p-3"
                    value={form.data.plate}
                    onChange={(e) => form.setData("plate", e.target.value)}
                  />

                  <FieldError msg={form.errors.plate} />
                </div>

              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  KM atual
                </label>

                <input
                  type="number"
                  className="w-full border rounded-2xl p-3"
                  value={form.data.km_current}
                  onChange={(e) => form.setData("km_current", e.target.value)}
                />

                <FieldError msg={form.errors.km_current} />
              </div>

            </div>

            <div className="border-t px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">

              <Link
                href={route("company.vehicles.index")}
                className="px-5 py-3 border rounded-2xl text-sm font-semibold hover:bg-gray-50"
              >
                Voltar
              </Link>

              <button
                disabled={form.processing}
                className="px-5 py-3 bg-black text-white rounded-2xl text-sm font-semibold hover:bg-gray-800"
              >
                {form.processing ? "Salvando..." : "Salvar alterações"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}