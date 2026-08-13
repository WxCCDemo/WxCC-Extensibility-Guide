// Homepage — API Capabilities freshness
// Adds live stats to the Solutions & Samples and Dev Radar cards on load.
// No scheduler dependency: this just reflects whatever is currently
// committed to samples.html / data/latest.json at the moment the page
// is opened, the same way js/samples-refresh.js does for the gallery.

function addCapabilityTag(containerId, label) {
  const container = document.getElementById(containerId);
  if (!container || !label) return;
  const span = document.createElement("span");
  span.className = "tag tag-cyan";
  span.textContent = label;
  container.appendChild(span);
}

async function refreshHomeCapabilityStats() {
  // Live sample count from the actual gallery (curated + auto-added by scan.mjs)
  try {
    const res = await fetch(`samples.html?_=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const count = doc.querySelectorAll(".sample-cards-grid .sample-card").length;
      if (count) addCapabilityTag("samplesCapabilityTags", `${count} samples live`);
    }
  } catch {
    // Leave the static "14 Playbooks" tag as the fallback
  }

  // Live last-scan freshness for the Dev Radar card
  try {
    const res = await fetch(`data/latest.json?_=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const latest = await res.json();
      if (latest.generatedAt) {
        const days = Math.floor((Date.now() - new Date(latest.generatedAt).getTime()) / 86400000);
        const label = days < 1 ? "Scanned today" : days === 1 ? "Scanned 1 day ago" : `Scanned ${days}d ago`;
        addCapabilityTag("radarCapabilityTags", label);
      }
    }
  } catch {
    // Leave the static "Daily scan" tag as the fallback
  }
}

refreshHomeCapabilityStats();
