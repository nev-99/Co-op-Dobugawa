const AURA_MAX_RANGE = 200;
const AURA_MAX_MULT = 1.8;

function updateAura(units) {
  // Lec（B）とDuke（C）を抽出
  const lecs = units.filter((u) => u.card && u.card.id === "B");
  const dukes = units.filter((u) => u.card && u.card.id === "C");

  // === Dukeオーラ処理 ===
  // LecとDukeの距離に応じて、両者に攻撃力バフを付与する
  // ・距離が近いほど倍率が上昇
  // ・最大倍率は AURA_MAX_MULT
  // ・範囲外（AURA_MAX_RANGE以上）ではバフなし（倍率1）
  lecs.forEach((lec) => {
    dukes.forEach((duke) => {
      // 2ユニット間の距離を計算
      const dist = Math.hypot(lec.x - duke.x, lec.y - duke.y);

      let mult = 1;

      // 範囲内なら距離に応じて倍率を線形補間
      if (dist < AURA_MAX_RANGE) {
        const ratio = 1 - dist / AURA_MAX_RANGE;
        mult = 1 + ratio * (AURA_MAX_MULT - 1);
      }

      // === バフ更新処理 ===
      // 前回と倍率が変わった場合のみ再計算することで、
      // 不要な攻撃力の再計算を防ぐ
      if (lec.duoMultiplier !== mult) {
        // 現在の倍率を一度打ち消してから新しい倍率を適用
        // （累積バグ防止）
        lec.attack = (lec.attack / lec.duoMultiplier) * mult;
        duke.attack = (duke.attack / duke.duoMultiplier) * mult;

        // 最新の倍率を保存
        lec.duoMultiplier = mult;
        duke.duoMultiplier = mult;
      }
    });
  });
}
