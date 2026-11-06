import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function Edit() {
  const { employee, flash } = usePage().props;

  const form = useForm({
    full_name: employee.full_name || "",
    cpf: employee.cpf || "",
    phone: employee.phone || "",
    birth_date: employee.birth_date || "",
    job_title: employee.job_title || "",
    can_travel: !!employee.can_travel,

    cnh_number: employee.cnh_number || "",
    cnh_type: employee.cnh_type || "",
    cnh_expiration: employee.cnh_expiration || "",

    work_start: employee.work_start || "",
    lunch_start: employee.lunch_start || "",
    lunch_end: employee.lunch_end || "",
    work_end: employee.work_end || "",

    email: employee.user?.email || "",
    password: "",
  });

  const submit = (e) => {
    e.preventDefault();
    form.put(route("company.employees.update", employee.id));
  };

  const activate = () => form.post(route("company.employees.activate", employee.id));
  const deactivate = () => form.post(route("company.employees.deactivate", employee.id));

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Editar funcionário</h2>
          <p className="text-sm text-slate-500">
            Atualize os dados do colaborador, permissões de viagem e acesso ao sistema.
          </p>
        </div>
      }
    >
      <Head title="Editar Funcionário" />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        {flash?.ok && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {flash.ok}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{employee.full_name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Status: {employee.is_active ? "Ativo" : "Inativo"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {employee.is_active ? (
                <button
                  type="button"
                  onClick={deactivate}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Desativar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={activate}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ativar
                </button>
              )}
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="space-y-6 px-5 py-5 sm:px-6">
              <section className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Nome completo
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    value={form.data.full_name}
                    onChange={(e) => form.setData("full_name", e.target.value)}
                  />
                  <FieldError msg={form.errors.full_name} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      CPF
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.cpf}
                      onChange={(e) => form.setData("cpf", e.target.value)}
                    />
                    <FieldError msg={form.errors.cpf} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Telefone
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.phone}
                      onChange={(e) => form.setData("phone", e.target.value)}
                    />
                    <FieldError msg={form.errors.phone} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Data de nascimento
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.birth_date}
                      onChange={(e) => form.setData("birth_date", e.target.value)}
                    />
                    <FieldError msg={form.errors.birth_date} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Função
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.job_title}
                      onChange={(e) => form.setData("job_title", e.target.value)}
                    />
                    <FieldError msg={form.errors.job_title} />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.data.can_travel}
                    onChange={(e) => form.setData("can_travel", e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      Pode realizar viagens
                    </div>
                    <div className="text-xs text-slate-500">
                      Quando ativado, o funcionário pode ser usado nas operações de viagem.
                    </div>
                  </div>
                </label>
              </section>

              <section className="border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-slate-900">CNH</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Informações opcionais para funcionários que dirigem.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Número
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.cnh_number}
                      onChange={(e) => form.setData("cnh_number", e.target.value)}
                      placeholder="Número da CNH"
                    />
                    <FieldError msg={form.errors.cnh_number} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Tipo
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.cnh_type}
                      onChange={(e) => form.setData("cnh_type", e.target.value)}
                      placeholder="Ex: A, B, AB"
                    />
                    <FieldError msg={form.errors.cnh_type} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Validade
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.cnh_expiration}
                      onChange={(e) => form.setData("cnh_expiration", e.target.value)}
                    />
                    <FieldError msg={form.errors.cnh_expiration} />
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-slate-900">Horário de trabalho</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Campos opcionais para organização da rotina do funcionário.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Entrada
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.work_start}
                      onChange={(e) => form.setData("work_start", e.target.value)}
                    />
                    <FieldError msg={form.errors.work_start} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Almoço início
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.lunch_start}
                      onChange={(e) => form.setData("lunch_start", e.target.value)}
                    />
                    <FieldError msg={form.errors.lunch_start} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Almoço fim
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.lunch_end}
                      onChange={(e) => form.setData("lunch_end", e.target.value)}
                    />
                    <FieldError msg={form.errors.lunch_end} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Saída
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.work_end}
                      onChange={(e) => form.setData("work_end", e.target.value)}
                    />
                    <FieldError msg={form.errors.work_end} />
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-slate-900">Login do funcionário</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Atualize email e senha de acesso quando necessário.
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
                      value={form.data.email}
                      onChange={(e) => form.setData("email", e.target.value)}
                    />
                    <FieldError msg={form.errors.email} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Nova senha (opcional)
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      value={form.data.password}
                      onChange={(e) => form.setData("password", e.target.value)}
                      placeholder="Deixe em branco para manter a atual"
                    />
                    <FieldError msg={form.errors.password} />
                    <div className="mt-1 text-xs text-slate-500">
                      Se deixar vazio, a senha atual será mantida.
                    </div>
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
                disabled={form.processing}
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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