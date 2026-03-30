// === チャージ系ユニット専用処理 ===

/** spawnUnit 内で呼び出し：チャージ用 DOM とプロパティを生成 */
function initCharge(unit, card, stats, el) {
  unit.charge = 0;
  unit.chargeMax = card.id === "B" ? stats.maxHp * 10 : 0;
  unit.chargebar = null;
  unit.chargefill = null;
  unit.isCharged = false;
  unit.buffTimer = 0;

  if (card.id === "B") {
    const chargebar = document.createElement("div");
    chargebar.className = "chargebar";

    const chargefill = document.createElement("div");
    chargefill.className = "chargefill";

    chargebar.appendChild(chargefill);
    el.appendChild(chargebar);

    unit.chargebar = chargebar;
    unit.chargefill = chargefill;
  }
}

/** 攻撃時のチャージ加算処理 */
function onAttackCharge(unit) {
  if (unit.card.id !== "B") return;
  if (unit.buffTimer > 0) return;

  unit.charge += 10;

  if (unit.charge >= unit.chargeMax) {
    unit.charge = unit.chargeMax;
    unit.isCharged = true;
    unit.el.classList.add("charged");
  }
}

/** チャージ完了ユニットをクリックしてバフ発動 */
function activateChargeBuff(units, e) {
  units.forEach((u) => {
    if (!u.isCharged) return;

    const rect = u.el.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      u.attack *= 2.5;
      u.cooldownMax *= 0.5;
      u.buffTimer = 180;

      u.isCharged = false;
      u.el.classList.remove("charged");
    }
  });
}

/** 毎フレーム：バフタイマー減算 & チャージバー描画更新 */
function updateCharge(u) {
  if (u.buffTimer > 0) {
    u.buffTimer--;
    if (u.buffTimer === 0) {
      u.attack /= 2.5;
      u.cooldownMax /= 0.5;
      u.charge = 0;
    }
  }

  if (u.chargefill) {
    const ratio = u.charge / u.chargeMax;
    u.chargefill.style.width = ratio * 100 + "%";
  }
}
