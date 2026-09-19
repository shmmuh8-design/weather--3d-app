const CACHE = "weather-3d-v2";
const FILES = ["./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});

// إشعارات النظام الحقيقية (Web Push) — تعمل حتى لو كان التطبيق مغلقًا
self.addEventListener("push", (e) => {
  let data = { title: "تنبيه طقس", body: "هناك تغيّر في حالة الطقس" };
  try {
    if (e.data) data = e.data.json();
  } catch (err) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon.svg",
      badge: "./icon.svg",
      dir: "rtl",
      lang: "ar",
      tag: "weather-alert",
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const existing = clientsArr.find((c) => "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow("./index.html");
    })
  );
});
