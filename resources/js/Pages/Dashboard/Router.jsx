import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useEffect } from "react";

export default function DashboardRouter() {
    const auth = usePage().props?.auth ?? null;
    const role = auth?.user?.role ?? null;

    useEffect(() => {
        if (!role) return;

        if (role === "super_admin") {
            router.visit(route("super.dashboard"));
            return;
        }

        if (role === "company_admin") {
            router.visit(route("company.dashboard"));
            return;
        }

        if (role === "employee") {
            router.visit(route("employee.dashboard"));
            return;
        }

        console.error("Role inválida:", role);
    }, [role]);

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl">Carregando...</h2>}
        >
            <Head title="Dashboard" />
            <div className="p-6">
                {!role
                    ? "Carregando dados do usuário..."
                    : "Redirecionando..."}
            </div>
        </AuthenticatedLayout>
    );
}