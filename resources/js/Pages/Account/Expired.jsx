import { Head, Link } from "@inertiajs/react";

export default function Expired() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Head title="Assinatura vencida" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 space-y-3">
        <h1 className="text-xl font-semibold">Assinatura vencida</h1>
        <p className="text-sm opacity-80">
          A assinatura da empresa venceu. Você pode pedir renovação ao responsável ou usar uma chave temporária.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link className="px-4 py-3 rounded-xl bg-black text-white" href={route("account.unlock")}>
            Inserir chave
          </Link>
          <Link className="px-4 py-3 rounded-xl border" href={route("login")}>
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
