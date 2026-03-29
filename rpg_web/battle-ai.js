function updateBattleAI(units) {
  units.forEach((u) => {
    u.el.style.left = u.x + "px";
    u.el.style.top = u.y + "px";

    const ratio = u.hp / u.maxHp;
    const barWidth = getHpBarWidth(u.type, u.isCommander);

    u.hpbar.style.width = barWidth + "px";
    u.hpfill.style.width = barWidth * ratio + "px";
  });

  units = units.filter((u) => {
    if (u.hp <= 0) {
      if (u.isCommander) {
        alert(u.team === "player" ? "敗北" : "勝利");
        location.reload();
      }
      if (u.card) {
        u.card.active = false;
        u.card.cd = 180;
      }
      u.el.remove();
      return false;
    }
    return true;
  });

  units.forEach((u) => {
    if (u.isCommander) return;

    if (u.cooldown > 0) u.cooldown--;

    let targets =
      u.type === "healer"
        ? units.filter((t) => t.team === u.team && t.hp < t.maxHp)
        : units.filter((t) => t.team !== u.team);

    let nearest = null,
      dist = 9999;

    targets.forEach((t) => {
      const d = Math.hypot(t.x - u.x, t.y - u.y);
      if (d < dist) {
        dist = d;
        nearest = t;
      }
    });

    if (!nearest) return;

    if (dist <= u.range) {
      if (u.cooldown <= 0) {
        if (u.type === "healer") {
          nearest.hp = Math.min(nearest.maxHp, nearest.hp + u.heal);
        } else {
          nearest.hp -= u.attack;
        }
        u.cooldown = u.cooldownMax;
      }
    } else {
      const dx = nearest.x - u.x;
      const dy = nearest.y - u.y;
      const len = Math.hypot(dx, dy);
      u.x += (dx / len) * u.speed;
      u.y += (dy / len) * u.speed;
    }
  });
}
