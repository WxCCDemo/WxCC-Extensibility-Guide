// Sample Gallery — live refresh status
// Reads data/latest.json (written by scripts/scan.mjs, either the daily
// cron in .github/workflows/scan.yml or a manual "Run workflow" trigger)
// and shows when the gallery was last scanned. Re-fetches on page load
// and on manual click of the Refresh button — no polling, no scheduler
// on this side, purely reflects whatever the scan last produced.

const samplesRefreshFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

async function loadSamplesRefreshStatus() {
  const statusEl = document.getElementById("samplesRefreshStatus");
  const detailEl = document.getElementById("samplesRefreshDetail");
  const btn = document.getElementById("samplesRefreshBtn");
  if (!statusEl || !detailEl || !btn) return;

  btn.disabled = true;
  const prevLabel = btn.textContent;
  btn.textContent = "🔄 Checking…";

  try {
    const res = await fetch(`data/latest.json?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`data/latest.json responded ${res.status}`);
    const latest = await res.json();

    const when = latest.generatedAt ? samplesRefreshFmt.format(new Date(latest.generatedAt)) : "unknown";
    const newRepos = latest.summary?.newRepos || 0;
    const updatedRepos = latest.summary?.updatedTrackedRepos || 0;
    const newDiscovery = latest.summary?.newDiscoveryItems || 0;
    const hasChanges = newRepos || updatedRepos || newDiscovery;

    statusEl.textContent = `Last scanned ${when}`;
    detailEl.innerHTML = hasChanges
      ? `${newRepos} new repo(s), ${updatedRepos} update(s), ${newDiscovery} new discovery item(s) in the latest scan. See <a href="radar.html#changes">Dev Radar</a> for details.`
      : `No new changes since the last scan. New samples appear here automatically once detected.`;
  } catch (err) {
    statusEl.textContent = "Could not load latest scan status";
    detailEl.textContent = "data/latest.json wasn't reachable — it may not exist yet if a scan hasn't run.";
  } finally {
    btn.disabled = false;
    btn.textContent = prevLabel;
  }
}

document.getElementById("samplesRefreshBtn")?.addEventListener("click", loadSamplesRefreshStatus);
loadSamplesRefreshStatus();
