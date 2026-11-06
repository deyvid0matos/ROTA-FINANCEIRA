import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function Create() {
  const { plans, flash } = usePage().props;

  const form = useForm({
    name: "",
    legal_name: "",
    cnpj: "",

    city: "",
    state: "",
    address: "",
    address_number: "",
    neighborhood: "",
    zip_code: "",
    phone: "",
    company_email: "",

    responsible_name: "",
    responsible_cpf: "",
    responsible_email: "",

    plan_id: "",
    plan: "",
    subscription_ends_at: "",

    logo: null,
  });

  const submit = (e) => {
    e.preventDefault();
    form.post(route("super.companies.store"), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Nova Empresa</h2>
          <p className="text-sm text-slate-500">
            Cadastre a empresa, responsável, plano e dados principais.
          </p>
        </div>
      }
    >
      <Head title="Nova Empresa" />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="space-y-6">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
              {flash.ok}
            </div>
          )}

          <form
            onSubmit={submit}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Cadastro da empresa
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Preencha os dados abaixo para criar uma nova empresa no sistema.
              </p>
            </div>

            <div className="space-y-8 px-5 py-5 sm:px-6 sm:py-6">
              {/* DADOS DA EMPRESA */}
              <section className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Dados da empresa
                  </h4>
                  <p className="text-sm text-slate-500">
                    Informações principais de identificação.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Nome fantasia
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.name}
                      onChange={(e) => form.setData("name", e.target.value)}
                      placeholder="Digite o nome fantasia"
                    />
                    <FieldError msg={form.errors.name} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Razão social
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.legal_name}
                      onChange={(e) => form.setData("legal_name", e.target.value)}
                      placeholder="Digite a razão social"
                    />
                    <FieldError msg={form.errors.legal_name} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      CNPJ
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.cnpj}
                      onChange={(e) => form.setData("cnpj", e.target.value)}
                      placeholder="Digite o CNPJ"
                    />
                    <FieldError msg={form.errors.cnpj} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      E-mail da empresa
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.company_email}
                      onChange={(e) => form.setData("company_email", e.target.value)}
                      placeholder="empresa@exemplo.com"
                    />
                    <FieldError msg={form.errors.company_email} />
                  </div>
                </div>
              </section>

              {/* ENDEREÇO E CONTATO */}
              <section className="space-y-4 border-t border-slate-200 pt-8">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Endereço e contato
                  </h4>
                  <p className="text-sm text-slate-500">
                    Dados de localização e comunicação.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Cidade
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.city}
                      onChange={(e) => form.setData("city", e.target.value)}
                      placeholder="Cidade"
                    />
                    <FieldError msg={form.errors.city} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      UF
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.state}
                      onChange={(e) => form.setData("state", e.target.value)}
                      placeholder="UF"
                    />
                    <FieldError msg={form.errors.state} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Telefone
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.phone}
                      onChange={(e) => form.setData("phone", e.target.value)}
                      placeholder="Telefone"
                    />
                    <FieldError msg={form.errors.phone} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Endereço
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.address}
                      onChange={(e) => form.setData("address", e.target.value)}
                      placeholder="Rua, avenida..."
                    />
                    <FieldError msg={form.errors.address} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Número
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.address_number}
                      onChange={(e) => form.setData("address_number", e.target.value)}
                      placeholder="Número"
                    />
                    <FieldError msg={form.errors.address_number} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Bairro
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.neighborhood}
                      onChange={(e) => form.setData("neighborhood", e.target.value)}
                      placeholder="Bairro"
                    />
                    <FieldError msg={form.errors.neighborhood} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      CEP
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.zip_code}
                      onChange={(e) => form.setData("zip_code", e.target.value)}
                      placeholder="CEP"
                    />
                    <FieldError msg={form.errors.zip_code} />
                  </div>
                </div>
              </section>

              {/* RESPONSÁVEL */}
              <section className="space-y-4 border-t border-slate-200 pt-8">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Responsável
                  </h4>
                  <p className="text-sm text-slate-500">
                    Pessoa responsável pela empresa no sistema.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Nome
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.responsible_name}
                      onChange={(e) => form.setData("responsible_name", e.target.value)}
                      placeholder="Nome do responsável"
                    />
                    <FieldError msg={form.errors.responsible_name} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      CPF
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.responsible_cpf}
                      onChange={(e) => form.setData("responsible_cpf", e.target.value)}
                      placeholder="CPF do responsável"
                    />
                    <FieldError msg={form.errors.responsible_cpf} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      E-mail
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.responsible_email}
                      onChange={(e) => form.setData("responsible_email", e.target.value)}
                      placeholder="responsavel@exemplo.com"
                    />
                    <FieldError msg={form.errors.responsible_email} />
                  </div>
                </div>
              </section>

              {/* ASSINATURA E PLANO */}
              <section className="space-y-4 border-t border-slate-200 pt-8">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Assinatura e plano
                  </h4>
                  <p className="text-sm text-slate-500">
                    Selecione o plano e a data da assinatura, se necessário.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Plano (novo)
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.plan_id}
                      onChange={(e) => form.setData("plan_id", e.target.value)}
                    >
                      <option value="">— selecione —</option>
                      {plans?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                    <FieldError msg={form.errors.plan_id} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Plano (legado - opcional)
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.plan}
                      onChange={(e) => form.setData("plan", e.target.value)}
                      placeholder="Ex: basic"
                    />
                    <FieldError msg={form.errors.plan} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Assinatura até (opcional)
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={form.data.subscription_ends_at}
                      onChange={(e) => form.setData("subscription_ends_at", e.target.value)}
                    />
                    <FieldError msg={form.errors.subscription_ends_at} />
                  </div>
                </div>
              </section>

              {/* LOGO */}
              <section className="space-y-4 border-t border-slate-200 pt-8">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Logo da empresa
                  </h4>
                  <p className="text-sm text-slate-500">
                    Usada no dashboard e em relatórios PDF.
                  </p>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => form.setData("logo", e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                  />
                  <FieldError msg={form.errors.logo} />
                  <div className="mt-2 text-sm text-slate-500">
                    Formatos: JPG, PNG ou WEBP. Máx: 5MB.
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:px-6">
              <button
                disabled={form.processing}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {form.processing ? "Salvando..." : "Criar empresa"}
              </button>

              <Link
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href={route("super.companies.index")}
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