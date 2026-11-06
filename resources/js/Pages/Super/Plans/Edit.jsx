import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function Edit() {
  const { plan, flash } = usePage().props;

  const form = useForm({
    name: plan.name || "",
    code: plan.code || "",
    price: plan.price || "",
    is_active: !!plan.is_active,
  });

  const submit = (e) => {
    e.preventDefault();
    form.put(route("super.plans.update", plan.id), {
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Editar Plano
          </h2>
          <p className="text-sm text-slate-500">
            Atualize informações do plano de assinatura.
          </p>
        </div>
      }
    >
      <Head title={`Plano ${plan.name}`} />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-6">
        {flash?.ok && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
            {flash.ok}
          </div>
        )}

        <form
          onSubmit={submit}
          className="rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Informações do plano
            </h3>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nome
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
              />
              <FieldError msg={form.errors.name} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Código
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={form.data.code}
                onChange={(e) => form.setData("code", e.target.value)}
              />
              <FieldError msg={form.errors.code} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Preço (R$)
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={form.data.price}
                onChange={(e) => form.setData("price", e.target.value)}
              />
              <FieldError msg={form.errors.price} />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={!!form.data.is_active}
                onChange={(e) => form.setData("is_active", e.target.checked)}
              />
              Plano ativo
            </label>
          </div>

          <div className="flex gap-3 border-t border-slate-200 px-6 py-5">
            <button
              disabled={form.processing}
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {form.processing ? "Salvando..." : "Salvar"}
            </button>

            <Link
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={route("super.plans.index")}
            >
              Voltar
            </Link>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}