import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    type: "car",
    brand: "",
    model: "",
    color: "",
    plate: "",
    km_current: 0,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("company.vehicles.store"));
  };

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h2 className="text-xl font-semibold">Novo veículo</h2>
          <p className="text-sm text-gray-500">
            Cadastre um veículo da empresa.
          </p>
        </div>
      }
    >
      <Head title="Novo veículo" />

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <form
          onSubmit={submit}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b">
            <h3 className="font-semibold text-lg">Dados do veículo</h3>
          </div>

          <div className="p-6 space-y-5">

            <div>
              <label className="block text-sm font-semibold mb-1">
                Tipo
              </label>

              <select
                className="w-full border rounded-2xl p-3"
                value={data.type}
                onChange={(e) => setData("type", e.target.value)}
              >
                <option value="car">Carro</option>
                <option value="moto">Moto</option>
              </select>

              <FieldError msg={errors.type} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Marca
                </label>

                <input
                  className="w-full border rounded-2xl p-3"
                  value={data.brand}
                  onChange={(e) => setData("brand", e.target.value)}
                />

                <FieldError msg={errors.brand} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Modelo
                </label>

                <input
                  className="w-full border rounded-2xl p-3"
                  value={data.model}
                  onChange={(e) => setData("model", e.target.value)}
                />

                <FieldError msg={errors.model} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Cor
                </label>

                <input
                  className="w-full border rounded-2xl p-3"
                  value={data.color}
                  onChange={(e) => setData("color", e.target.value)}
                />

                <FieldError msg={errors.color} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Placa
                </label>

                <input
                  className="w-full border rounded-2xl p-3"
                  value={data.plate}
                  onChange={(e) => setData("plate", e.target.value)}
                />

                <FieldError msg={errors.plate} />
              </div>

            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                KM atual
              </label>

              <input
                type="number"
                className="w-full border rounded-2xl p-3"
                value={data.km_current}
                onChange={(e) => setData("km_current", e.target.value)}
              />

              <FieldError msg={errors.km_current} />
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
              disabled={processing}
              className="px-5 py-3 bg-black text-white rounded-2xl text-sm font-semibold hover:bg-gray-800"
            >
              {processing ? "Salvando..." : "Criar veículo"}
            </button>

          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}