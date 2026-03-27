function cooldownLoop(){
  const r=Math.min((Date.now()-lastAttackTime)/player.attackSpeed,1);
  attackFill.style.width=(r*100)+"%";
  if(r>=1) attackBtn.classList.add("ready");
  else attackBtn.classList.remove("ready");
  requestAnimationFrame(cooldownLoop);
}
cooldownLoop();

function flash(el){
  el.classList.add("flash");
  setTimeout(()=>el.classList.remove("flash"),150);
}

function explosion(){
  const e=document.createElement("div");
  e.className="explosion";
  e.style.left=(260+Math.random()*100)+"px";
  e.style.top=(120+Math.random()*100)+"px";
  battle.appendChild(e);
  setTimeout(()=>e.remove(),300);
}

function enemyLoop(){
  if(!enemy)return;

  const t=Math.random()*enemy.speed;

  enemyTimer=setTimeout(()=>{
    player.hp-=enemy.atk;
    updateUI();
    flash(fieldHp);

    if(player.hp<=0){
      battle.style.display="none";
      advanceBtn.style.display="block";
      enemy=null;
      return;
    }

    enemyLoop();
  },t);
}

attackBtn.onclick=()=>{
  const now=Date.now();
  if(now-lastAttackTime<player.attackSpeed)return;

  lastAttackTime=now;

  enemy.hp-=player.atk;

  explosion();
  flash(enemyDiv);

  if(enemy.hp<=0){
    clearTimeout(enemyTimer);
    battle.style.display="none";
    advanceBtn.style.display="block";
    enemy=null;
  }
};