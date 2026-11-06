import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Entrar" />

            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Entrar no sistema
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        Acesse sua conta para gerenciar viagens, despesas e relatórios.
                    </p>
                </div>

                {status && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="E-mail" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-2xl border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:ring-slate-900"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="seuemail@empresa.com"
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Senha" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full rounded-2xl border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:ring-slate-900"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Digite sua senha"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex items-center gap-2">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="text-sm text-slate-600">
                                Lembrar-me
                            </span>
                        </label>
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:bg-slate-800 active:bg-slate-950 disabled:opacity-60"
                            disabled={processing}
                        >
                            {processing ? 'Entrando...' : 'Entrar'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}