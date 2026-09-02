/* ==========================================================================
   Medieval & Classical Antique Interactive Scripts
   ========================================================================== */

function initMedievalEffects() {
  // 1. Interactive Wax Seal Break
  const waxSeal = document.getElementById("waxSealDemo");
  if (waxSeal) {
    waxSeal.addEventListener("click", () => {
      waxSeal.classList.toggle("broken");
      if (waxSeal.classList.contains("broken")) {
        showToast("📜 Royal Decree Unsealed: King's secret message revealed!");
        const parchmentBody = document.getElementById("parchmentText");
        if (parchmentBody) {
          parchmentBody.innerHTML = "<strong>[ROYAL DECREE]</strong><br>By order of the Grand Realm, the bearer of this seal is hereby granted full mastery over Web Graphics & Medieval Craftsmanship.";
        }
      } else {
        showToast("🔒 Royal Seal Restored.");
        const parchmentBody = document.getElementById("parchmentText");
        if (parchmentBody) {
          parchmentBody.innerText = "In witness whereof, we have affixed our Great Imperial Wax Seal to this ancient parchment under the light of the celestial heavens...";
        }
      }
    });
  }

  // 6. Interactive Astrolabe Rotation
  const astrolabe = document.getElementById("astrolabeWidget");
  const needle = document.getElementById("astrolabeNeedle");
  if (astrolabe && needle) {
    let isDragging = false;
    
    function updateNeedleAngle(e) {
      const rect = astrolabe.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
      const angleDeg = (angleRad * 180) / Math.PI + 90;
      needle.style.transform = `rotate(${angleDeg}deg)`;
    }

    astrolabe.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateNeedleAngle(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (isDragging) updateNeedleAngle(e);
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }
}

document.addEventListener("DOMContentLoaded", initMedievalEffects);
