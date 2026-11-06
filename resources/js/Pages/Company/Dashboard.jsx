import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

function ActionCard({ title, description, href, dark = false }) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 ${
        dark
          ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
      }`}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className={`mt-2 text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-500"}`}>
        {description}
      </div>
      <div className={`mt-4 text-sm font-semibold ${dark ? "text-white" : "text-slate-700"}`}>
        Abrir módulo
      </div>
    </Link>
  );
}

export default function CompanyDashboard() {
  const { auth } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">Painel da Empresa</h2>
          <p className="text-sm text-slate-500">Acompanhe cadastros, viagens e relatórios da empresa.</p>
        </div>
      }
    >
      <Head title="Painel da Empresa" />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="text-sm font-medium text-slate-500">Bem-vindo</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {auth?.user?.name || "Usuário"}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              Aqui você pode gerenciar funcionários, veículos, viagens e relatórios em um só lugar.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              title="Funcionários"
              description="Cadastre, edite e acompanhe os funcionários vinculados à empresa."
              href={route("company.employees.index")}
              dark
            />
            <ActionCard
              title="Veículos"
              description="Controle a frota da empresa e mantenha os veículos organizados."
              href={route("company.vehicles.index")}
            />
            <ActionCard
              title="Viagens"
              description="Analise viagens enviadas, aprove, reprove e acompanhe os detalhes."
              href={route("company.trips.index")}
            />
            <ActionCard
              title="Relatórios"
              description="Visualize relatórios resumidos e detalhados com filtros."
              href={route("company.reports.index")}
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm sm:p-5">
            Use o menu superior para navegar entre os módulos. Em telas menores, o menu fica disponível no botão lateral superior.
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}