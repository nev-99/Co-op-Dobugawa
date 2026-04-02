function updateBattleAI(units) {
  // =========================
  // 表示更新（位置・HPバー）
  // =========================
  units.forEach((u) => {
    u.el.style.left = u.x + "px";
    u.el.style.top = u.y + "px";

    const ratio = u.hp / u.maxHp;
    const barWidth = getHpBarWidth(u.type, u.isCommander);

    u.hpbar.style.width = barWidth + "px";
    u.hpfill.style.width = barWidth * ratio + "px";
  });

  // =========================
  // 死亡処理
  // =========================
  units = units.filter((u) => {
    if (u.hp <= 0) {
      if (u.isCommander) {
        alert(u.team === "player" ? "敗北" : "勝利");
        location.reload();
      }

      // カードを再使用可能にしてCD開始
      if (u.card) {
        u.card.active = false;
        u.card.cd = 180;
      }

      u.el.remove();
      return false;
    }
    return true;
  });

  // =========================
  // ヒーラーのターゲット競合管理
  // 「同じ対象に群がる」のを防ぐ
  // =========================
  const healerTargets = new Map(); // target → healer数

  // =========================
  // 各ユニットのAI処理
  // =========================
  units.forEach((u) => {
    if (u.isCommander) return;

    // 攻撃・ヒールのクールダウン
    if (u.cooldown > 0) u.cooldown--;

    // =========================
    // ヒーラー専用AI
    // =========================
    if (u.type === "healer") {
      const allies = units.filter((t) => t.team === u.team && t !== u);

      const NEAR_RANGE = 200;

      // -------------------------
      // ① 近くの味方
      // -------------------------
      let nearby = allies.filter((t) => {
        const d = Math.hypot(t.x - u.x, t.y - u.y);
        return d < NEAR_RANGE;
      });

      // -------------------------
      // ② HP低い順で並べる
      // -------------------------
      const sortByHp = (a, b) => a.hp / a.maxHp - b.hp / b.maxHp;

      nearby = nearby.filter((t) => t.hp < t.maxHp).sort(sortByHp);

      let candidates = nearby;

      // -------------------------
      // ③ 近くにいなければ全体から探す
      // -------------------------
      if (candidates.length === 0) {
        candidates = allies.filter((t) => t.hp < t.maxHp).sort(sortByHp);
      }

      // -------------------------
      // ④ ターゲット分散
      // すでに他ヒーラーが多く付いてる対象は避ける
      // -------------------------
      let target = null;

      for (let t of candidates) {
        const count = healerTargets.get(t) || 0;
        if (count < 2) {
          // 最大2人まで
          target = t;
          healerTargets.set(t, count + 1);
          break;
        }
      }

      // -------------------------
      // ⑤ 行動
      // -------------------------
      if (target) {
        const dx = target.x - u.x;
        const dy = target.y - u.y;
        const dist = Math.hypot(dx, dy);

        // ===== 後列維持 =====
        // 距離が近すぎると少し下がる
        const BACK_DISTANCE = u.range * 0.6;

        if (dist < BACK_DISTANCE) {
          // 少し後ろへ移動（離れる）
          u.x -= (dx / dist) * u.speed;
          u.y -= (dy / dist) * u.speed;
          return;
        }

        // ===== 射程内ならヒール =====
        if (dist <= u.range) {
          if (u.cooldown <= 0) {
            target.hp = Math.min(target.maxHp, target.hp + u.heal);
            u.cooldown = u.cooldownMax;
          }
        } else {
          // 近づく
          u.x += (dx / dist) * u.speed;
          u.y += (dy / dist) * u.speed;
        }
      } else {
        // =========================
        // 誰も回復不要 → 仲間の後ろに付く
        // =========================
        const allies = units.filter((t) => t.team === u.team && t !== u);

        // 一番近い味方を探す
        let nearestAlly = null;
        let minDist = 9999;

        allies.forEach((t) => {
          const d = Math.hypot(t.x - u.x, t.y - u.y);
          if (d < minDist) {
            minDist = d;
            nearestAlly = t;
          }
        });

        if (nearestAlly) {
          // 味方の「後ろ」の位置を計算
          const dir = u.team === "player" ? -1 : 1;

          const targetX = nearestAlly.x + dir * 40; // 後ろに40px
          const targetY = nearestAlly.y;

          const dx = targetX - u.x;
          const dy = targetY - u.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 5) {
            u.x += (dx / dist) * u.speed;
            u.y += (dy / dist) * u.speed;
          }
        }
      }

      return;
    }

    // =========================
    // 通常ユニット（敵を攻撃）
    // =========================
    let targets = units.filter((t) => t.team !== u.team);

    let nearest = null;
    let dist = 9999;

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
        nearest.hp -= u.attack;
        if (u.onAttack) u.onAttack();
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
