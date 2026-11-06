import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    full_name: "",
    cpf: "",
    phone: "",
    job_title: "",
    can_travel: false,
    email: "",
    password: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("company.employees.store"));
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Novo funcionário</h2>
          <p className="text-sm text-slate-500">
            Cadastre um novo colaborador e crie o acesso dele ao sistema.
          </p>
        </div>
      }
    >
      <Head title="Novo funcionário" />

      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
        <form
          onSubmit={submit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h3 className="text-lg font-semibold text-slate-900">Dados do funcionário</h3>
            <p className="mt-1 text-sm text-slate-500">
              Preencha as informações principais e os dados de login.
            </p>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6">
            <section className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Nome completo
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={data.full_name}
                  onChange={(e) => setData("full_name", e.target.value)}
                  placeholder="Digite o nome completo"
                />
                <FieldError msg={errors.full_name} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    CPF
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    value={data.cpf}
                    onChange={(e) => setData("cpf", e.target.value)}
                    placeholder="Digite o CPF"
                  />
                  <FieldError msg={errors.cpf} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Telefone
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                    placeholder="Digite o telefone"
                  />
                  <FieldError msg={errors.phone} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Função
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={data.job_title}
                  onChange={(e) => setData("job_title", e.target.value)}
                  placeholder="Ex: Motorista, Técnico, Auxiliar"
                />
                <FieldError msg={errors.job_title} />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={data.can_travel}
                  onChange={(e) => setData("can_travel", e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    Pode realizar viagens
                  </div>
                  <div className="text-xs text-slate-500">
                    Marque esta opção para permitir que o funcionário seja usado nas viagens.
                  </div>
                </div>
              </label>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-slate-900">Login do funcionário</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Esses dados serão usados para acesso ao sistema.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="email@empresa.com"
                  />
                  <FieldError msg={errors.email} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Senha
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    placeholder="Digite a senha"
                  />
                  <FieldError msg={errors.password} />
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Link
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href={route("company.employees.index")}
            >
              Voltar
            </Link>

            <button
              disabled={processing}
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? "Salvando..." : "Criar funcionário"}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}