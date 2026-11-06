import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {

    const user = usePage().props?.auth?.user ?? null;
    const role = user?.role || '';

    const [mobileMenu, setMobileMenu] = useState(false);

    const navigationLinks = useMemo(() => {

        if (role === 'super_admin') {
            return [
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Empresas', href: route('super.companies.index') },
                { label: 'Planos', href: route('super.plans.index') },
            ];
        }

        if (role === 'company_admin') {
            return [
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Funcionários', href: route('company.employees.index') },
                { label: 'Veículos', href: route('company.vehicles.index') },
                { label: 'Viagens', href: route('company.trips.index') },
                { label: 'Relatórios', href: route('company.reports.index') },
            ];
        }

        if (role === 'employee') {
            return [
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Viagens', href: route('employee.trips.index') },
                { label: 'Relatórios', href: route('employee.reports.index') },
            ];
        }

        return [{ label: 'Dashboard', href: route('dashboard') }];

    }, [role]);

    return (

        <div className="min-h-screen bg-gray-50">

            {/* NAVBAR */}

            <nav className="bg-white border-b">

                <div className="system-container flex justify-between items-center h-16">

                    <div className="flex items-center gap-6">

                        <Link href={route('dashboard')}>
                            <ApplicationLogo className="h-8 w-auto text-gray-800" />
                        </Link>

                        {/* DESKTOP MENU */}

                        <div className="hidden md:flex gap-6">
                            {navigationLinks.map(item => (
                                <NavLink
                                    key={item.label}
                                    href={item.href}
                                    active={route().current(item.href)}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                    </div>


                    {/* USER */}

                    <div className="hidden md:flex items-center gap-4">

                        {user && (

                            <Dropdown>

                                <Dropdown.Trigger>

                                    <button className="flex items-center gap-2 text-sm font-medium">

                                        {user.name}

                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.7a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"/>
                                        </svg>

                                    </button>

                                </Dropdown.Trigger>

                                <Dropdown.Content>

                                    <Dropdown.Link href={route('profile.edit')}>
                                        Perfil
                                    </Dropdown.Link>

                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Sair
                                    </Dropdown.Link>

                                </Dropdown.Content>

                            </Dropdown>

                        )}

                    </div>


                    {/* MOBILE BUTTON */}

                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className="md:hidden"
                    >

                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                            <path stroke="currentColor" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>

                    </button>

                </div>


                {/* MOBILE MENU */}

                {mobileMenu && (

                    <div className="md:hidden border-t bg-white">

                        <div className="system-container py-3 flex flex-col gap-3">

                            {navigationLinks.map(item => (
                                <ResponsiveNavLink
                                    key={item.label}
                                    href={item.href}
                                >
                                    {item.label}
                                </ResponsiveNavLink>
                            ))}

                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>

                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Sair
                            </ResponsiveNavLink>

                        </div>

                    </div>

                )}

            </nav>


            {/* HEADER */}

            {header && (

                <header className="bg-white border-b">

                    <div className="system-container py-6">
                        {header}
                    </div>

                </header>

            )}


            {/* CONTENT */}

            <main className="system-container py-6">
                {children}
            </main>

        </div>

    );
}