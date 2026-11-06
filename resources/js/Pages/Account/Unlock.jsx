import { Head, useForm, usePage, Link } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="text-red-600 text-sm mt-1">{msg}</div>;
}

export default function Unlock() {
  const { flash } = usePage().props;

  const form = useForm({
    code: "",
  });

  const submit = (e) => {
    e.preventDefault();
    form.post(route("account.unlock.store"), { preserveScroll: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Head title="Desbloqueio" />

      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Desbloqueio por chave</h1>
          <p className="text-sm opacity-70">
            Assinatura vencida ou empresa bloqueada. Insira a chave gerada pelo Admin Master.
          </p>
        </div>

        {flash?.ok && (
          <div className="p-3 rounded-xl bg-green-100 font-semibold">{flash.ok}</div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Chave</label>
            <input
              className="w-full border rounded-xl p-3 uppercase"
              placeholder="ABCD-EFGH-IJKL"
              value={form.data.code}
              onChange={(e) => form.setData("code", e.target.value)}
            />
            <FieldError msg={form.errors.code} />
          </div>

          <button
            disabled={form.processing}
            className="w-full bg-black text-white rounded-xl p-3"
          >
            {form.processing ? "Validando..." : "Validar"}
          </button>

          <div className="text-sm opacity-70 flex items-center justify-between">
            <Link className="underline" href={route("login")}>Voltar</Link>
            <span>Chave expira em até 7 dias.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
