// يفحص طقس المدينة المحددة، ويقارنها بآخر حالة محفوظة، ويرسل إشعار ntfy عند تغيّر ملحوظ.
import { readFile, writeFile } from "node:fs/promises";

const NTFY_TOPIC = process.env.NTFY_TOPIC || "weather-salem-ddf80910";
const CITY_NAME = process.env.CITY_NAME || "مسقط";
const LAT = process.env.CITY_LAT || "23.588";
const LON = process.env.CITY_LON || "58.3829";
const STATE_FILE = new URL("../weather-state.json", import.meta.url);

const DIRS = ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"];
const dirLabel = (deg) => DIRS[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
const angleDiff = (a, b) => {
  let d = (((a - b + 180) % 360) + 360) % 360 - 180;
  return Math.abs(d);
};

async function sendNtfy(title, body) {
  await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: "POST",
    headers: {
      Title: encodeToLatin1(title),
      Priority: "default",
      Tags: "cloud",
    },
    body,
  });
}

// عناوين ntfy يجب أن تكون Latin-1، لذلك نرسل النص العربي في الـ body ونستخدم عنوانًا بسيطًا
function encodeToLatin1(str) {
  return "Weather Alert";
}

async function main() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather fetch failed: " + res.status);
  const data = await res.json();
  const cur = data.current;

  let prev = null;
  try {
    prev = JSON.parse(await readFile(STATE_FILE, "utf-8"));
  } catch (e) {
    prev = null;
  }

  const changes = [];
  if (prev) {
    if (Math.abs(cur.relative_humidity_2m - prev.relative_humidity_2m) > 9) {
      changes.push(`الرطوبة الآن ${Math.round(cur.relative_humidity_2m)}٪ بعد أن كانت ${Math.round(prev.relative_humidity_2m)}٪`);
    }
    if (Math.abs(cur.wind_speed_10m - prev.wind_speed_10m) > 8) {
      changes.push(`سرعة الرياح الآن ${Math.round(cur.wind_speed_10m)} كم/س بعد أن كانت ${Math.round(prev.wind_speed_10m)} كم/س`);
    }
    if (angleDiff(cur.wind_direction_10m, prev.wind_direction_10m) > 40) {
      changes.push(`تحوّل اتجاه الرياح إلى ${dirLabel(cur.wind_direction_10m)} (${Math.round(cur.wind_direction_10m)}°)`);
    }
  }

  if (changes.length) {
    console.log("تغييرات مكتشفة:", changes);
    await sendNtfy(`تنبيه طقس · ${CITY_NAME}`, `${CITY_NAME}: ${changes.join(" — ")}`);
  } else {
    console.log("لا تغيير يستدعي إشعارًا.");
  }

  await writeFile(STATE_FILE, JSON.stringify(cur, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
