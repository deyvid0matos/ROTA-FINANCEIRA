import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {active ? "Ativa" : "Bloqueada"}
    </span>
  );
}

export default function Edit() {
  const { company, plans, recentKeys, companyAdmins, flash } = usePage().props;

  const form = useForm({
    name: company.name || "",
    legal_name: company.legal_name || "",
    cnpj: company.cnpj || "",

    city: company.city || "",
    state: company.state || "",
    address: company.address || "",
    address_number: company.address_number || "",
    neighborhood: company.neighborhood || "",
    zip_code: company.zip_code || "",
    phone: company.phone || "",
    company_email: company.company_email || "",

    responsible_name: company.responsible_name || "",
    responsible_cpf: company.responsible_cpf || "",
    responsible_email: company.responsible_email || "",

    plan_id: company.plan_id || "",
    plan: company.plan || "",
    subscription_ends_at: company.subscription_ends_at
      ? String(company.subscription_ends_at).slice(0, 10)
      : "",

    logo: null,
  });

  const unlockForm = useForm({ hours: 24 });

  const adminForm = useForm({
    name: "",
    email: "",
    password: "",
  });

  const adminAction = useForm({});

  const submit = (e) => {
    e.preventDefault();
    form.put(route("super.companies.update", company.id), {
      preserveScroll: true,
      forceFormData: true,
    });
  };

  const activate = () =>
    unlockForm.post(route("super.companies.activate", company.id), {
      preserveScroll: true,
    });

  const deactivate = () =>
    unlockForm.post(route("super.companies.deactivate", company.id), {
      preserveScroll: true,
    });

  const createUnlockKey = (e) => {
    e.preventDefault();
    unlockForm.post(route("super.companies.unlockKey", company.id), {
      preserveScroll: true,
    });
  };

  const createAdmin = (e) => {
    e.preventDefault();
    adminForm.post(route("super.companies.createAdmin", company.id), {
      preserveScroll: true,
      onSuccess: () => adminForm.reset("name", "email", "password"),
    });
  };

  const setAdminActive = (userId, active) => {
    const ok = confirm(active ? "Ativar este gerente?" : "Desativar este gerente?");
    if (!ok) return;

    adminAction.post(
      route(
        active
          ? "super.companies.admins.activate"
          : "super.companies.admins.deactivate",
        {
          company: company.id,
          user: userId,
        }
      ),
      { preserveScroll: true }
    );
  };

  const deleteAdmin = (userId) => {
    const ok = confirm(
      "Excluir este gerente PERMANENTEMENTE?\n\nIsso pode afetar histórico de aprovações. Confirma?"
    );
    if (!ok) return;

    adminAction.delete(
      route("super.companies.admins.destroy", {
        company: company.id,
        user: userId,
      }),
      { preserveScroll: true }
    );
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Editar Empresa
            </h2>
            <StatusBadge active={company.is_active} />
          </div>
          <p className="text-sm text-slate-500">
            Atualize dados da empresa, assinatura, logo, chaves temporárias e gerentes.
          </p>
        </div>
      }
    >
      <Head title={`Empresa ${company.name}`} />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-6">
          {flash?.ok && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
              {flash.ok}
            </div>
          )}

          {flash?.error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-semibold text-rose-800">
              {flash.error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href={route("super.companies.index")}
            >
              Voltar
            </Link>

            {company.is_active ? (
              <button
                type="button"
                onClick={deactivate}
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Bloquear empresa
              </button>
            ) : (
              <button
                type="button"
                onClick={activate}
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Desbloquear empresa
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* FORM EMPRESA */}
            <form
              onSubmit={submit}
              className="xl:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Dados da empresa
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Revise informações cadastrais, plano e identidade visual.
                </p>
              </div>

              <div className="space-y-8 px-5 py-5 sm:px-6 sm:py-6">
                {/* EMPRESA */}
                <section className="space-y-4">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Identificação
                    </h4>
                    <p className="text-sm text-slate-500">
                      Nome fantasia, razão social e canais principais.
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
                      />
                      <FieldError msg={form.errors.cnpj} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        E-mail da empresa
                      </label>
                      <input
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        value={form.data.company_email}
                        onChange={(e) => form.setData("company_email", e.target.value)}
                      />
                      <FieldError msg={form.errors.company_email} />
                    </div>
                  </div>
                </section>

                {/* ENDEREÇO */}
                <section className="space-y-4 border-t border-slate-200 pt-8">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Endereço e contato
                    </h4>
                    <p className="text-sm text-slate-500">
                      Informações para localização e comunicação.
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
                        onChange={(e) =>
                          form.setData("address_number", e.target.value)
                        }
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
                        onChange={(e) =>
                          form.setData("neighborhood", e.target.value)
                        }
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
                      Dados da pessoa responsável pela empresa.
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
                        onChange={(e) =>
                          form.setData("responsible_name", e.target.value)
                        }
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
                        onChange={(e) =>
                          form.setData("responsible_cpf", e.target.value)
                        }
                      />
                      <FieldError msg={form.errors.responsible_cpf} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        E-mail
                      </label>
                      <input
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        value={form.data.responsible_email}
                        onChange={(e) =>
                          form.setData("responsible_email", e.target.value)
                        }
                      />
                      <FieldError msg={form.errors.responsible_email} />
                    </div>
                  </div>
                </section>

                {/* ASSINATURA */}
                <section className="space-y-4 border-t border-slate-200 pt-8">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Assinatura e plano
                    </h4>
                    <p className="text-sm text-slate-500">
                      Controle do plano ativo e vencimento da assinatura.
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
                      />
                      <FieldError msg={form.errors.plan} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Assinatura até
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        value={form.data.subscription_ends_at}
                        onChange={(e) =>
                          form.setData("subscription_ends_at", e.target.value)
                        }
                      />
                      <FieldError msg={form.errors.subscription_ends_at} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Status:</span>{" "}
                    {company.is_active ? "Ativa" : "Bloqueada"}{" "}
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="font-semibold text-slate-800">
                      Assinatura até:
                    </span>{" "}
                    {company.subscription_ends_at
                      ? String(company.subscription_ends_at).slice(0, 10)
                      : "-"}
                  </div>
                </section>

                {/* LOGO */}
                <section className="space-y-4 border-t border-slate-200 pt-8">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Logo
                    </h4>
                    <p className="text-sm text-slate-500">
                      Atualize a logo usada no sistema e nos PDFs.
                    </p>
                  </div>

                  {company.logo_url && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 text-sm font-medium text-slate-700">
                        Logo atual
                      </div>
                      <img
                        src={company.logo_url}
                        alt="Logo"
                        className="h-16 max-w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        form.setData("logo", e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                    />
                    <FieldError msg={form.errors.logo} />
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:px-6">
                <button
                  disabled={form.processing}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {form.processing ? "Salvando..." : "Salvar alterações"}
                </button>

                <Link
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href={route("super.companies.index")}
                >
                  Voltar
                </Link>
              </div>
            </form>

            {/* SIDEBAR */}
            <div className="space-y-6">
              {/* CHAVES */}
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Chave temporária
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Gere uma chave para desbloqueio temporário da empresa.
                  </p>
                </div>

                <div className="space-y-4 px-5 py-5">
                  <form
                    onSubmit={createUnlockKey}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      type="number"
                      min="1"
                      max="168"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:max-w-[110px]"
                      value={unlockForm.data.hours}
                      onChange={(e) => unlockForm.setData("hours", e.target.value)}
                    />

                    <button
                      className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={unlockForm.processing}
                    >
                      {unlockForm.processing ? "Gerando..." : "Gerar chave"}
                    </button>
                  </form>

                  <div className="space-y-3">
                    {(recentKeys || []).map((k) => (
                      <div
                        key={k.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="font-semibold text-slate-900">
                          {k.code}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {k.hours}h • expira em{" "}
                          {String(k.expires_at).slice(0, 10)} •{" "}
                          {k.used_at
                            ? `usada em ${String(k.used_at).slice(0, 10)}`
                            : "não usada"}
                        </div>
                      </div>
                    ))}

                    {(recentKeys || []).length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        Nenhuma chave gerada.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* CRIAR GERENTE */}
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Criar gerente
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Esse usuário entra como <strong>company_admin</strong>.
                  </p>
                </div>

                <form onSubmit={createAdmin} className="space-y-4 px-5 py-5">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Nome
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={adminForm.data.name}
                      onChange={(e) => adminForm.setData("name", e.target.value)}
                    />
                    <FieldError msg={adminForm.errors.name} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      E-mail
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={adminForm.data.email}
                      onChange={(e) => adminForm.setData("email", e.target.value)}
                    />
                    <FieldError msg={adminForm.errors.email} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Senha
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={adminForm.data.password}
                      onChange={(e) =>
                        adminForm.setData("password", e.target.value)
                      }
                    />
                    <FieldError msg={adminForm.errors.password} />
                    <div className="mt-1 text-xs text-slate-500">
                      Mínimo de 8 caracteres.
                    </div>
                  </div>

                  <button
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={adminForm.processing}
                  >
                    {adminForm.processing ? "Criando..." : "Criar gerente"}
                  </button>
                </form>
              </section>

              {/* GERENTES */}
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Gerentes da empresa
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Ative, desative ou exclua administradores da empresa.
                  </p>
                </div>

                <div className="space-y-3 px-5 py-5">
                  {(companyAdmins || []).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="font-semibold text-slate-900">{a.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{a.email}</div>
                      <div className="mt-2 text-sm text-slate-500">
                        Ativo: {a.is_active ? "Sim" : "Não"}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {a.is_active ? (
                          <button
                            type="button"
                            className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={adminAction.processing}
                            onClick={() => setAdminActive(a.id, false)}
                          >
                            Desativar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={adminAction.processing}
                            onClick={() => setAdminActive(a.id, true)}
                          >
                            Ativar
                          </button>
                        )}

                        <button
                          type="button"
                          className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={adminAction.processing}
                          onClick={() => deleteAdmin(a.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}

                  {(companyAdmins || []).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                      Nenhum gerente cadastrado.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}