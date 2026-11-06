const CACHE_NAME = "controle-viagens-static-v3";
const STATIC_ASSETS = [
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();

            await Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );

            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== "GET") {
        return;
    }

    if (url.origin !== self.location.origin) {
        return;
    }

    const inertiaHeader =
        request.headers.get("X-Inertia") ||
        request.headers.get("x-inertia");

    const isDynamicAppRoute =
        url.pathname.startsWith("/employee/") ||
        url.pathname.startsWith("/company/") ||
        url.pathname.startsWith("/super/") ||
        url.pathname.startsWith("/dashboard") ||
        url.pathname.startsWith("/profile") ||
        url.pathname.startsWith("/account/") ||
        url.pathname.includes("/pdf") ||
        url.pathname.startsWith("/storage/") ||
        inertiaHeader;

    if (isDynamicAppRoute) {
        event.respondWith(
            fetch(request, { cache: "no-store" }).catch(() => {
                return new Response("Sem conexão no momento.", {
                    status: 503,
                    statusText: "Offline",
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                });
            })
        );
        return;
    }

    const isStaticAsset =
        url.pathname.startsWith("/build/") ||
        url.pathname.startsWith("/icons/") ||
        url.pathname === "/manifest.json" ||
        url.pathname.endsWith(".js") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".png") ||
        url.pathname.endsWith(".jpg") ||
        url.pathname.endsWith(".jpeg") ||
        url.pathname.endsWith(".svg") ||
        url.pathname.endsWith(".webp") ||
        url.pathname.endsWith(".woff") ||
        url.pathname.endsWith(".woff2");

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return networkResponse;
                });
            })
        );
        return;
    }

    event.respondWith(
        fetch(request, { cache: "no-store" }).catch(() => {
            return new Response("Sem conexão no momento.", {
                status: 503,
                statusText: "Offline",
                headers: { "Content-Type": "text/plain; charset=utf-8" },
            });
        })
    );
});