const game = document.getElementById("game");

const distanceText = document.getElementById("distanceText");
const cigText = document.getElementById("cigText");
const meterFill = document.getElementById("meterFill");

const advanceBtn = document.getElementById("advanceBtn");
const useCigBtn = document.getElementById("useCigBtn");

const message = document.getElementById("message");
const messageText = document.getElementById("messageText");
const nextBtn = document.getElementById("nextBtn");

const battle = document.getElementById("battle");
const enemyDiv = document.getElementById("enemy");

const attackBtn = document.getElementById("attackBtn");
const attackFill = document.getElementById("attackFill");

const hpFill = document.getElementById("hpFill");
const fieldHpFill = document.getElementById("fieldHpFill");
const fieldHp = document.getElementById("fieldHp");

/* 状態 */
let player = {
  hp:30,
  maxHp:30,
  atk:5,
  attackSpeed:1000,
  cigs:3
};

let enemy=null;
let enemyTimer=null;

let currentDistance=0;
const goalDistance=1000;
let lastAttackTime=0;

let healing=0;
let healRate=0;

/* UI */
function updateUI(){
  distanceText.textContent=currentDistance+"m / "+goalDistance+"m";
  cigText.textContent="タバコ: "+player.cigs+"本";
  meterFill.style.width=(currentDistance/goalDistance*100)+"%";
  hpFill.style.width=(player.hp/player.maxHp*100)+"%";
  fieldHpFill.style.width=(player.hp/player.maxHp*100)+"%";

  if(player.hp>=player.maxHp || currentDistance>=goalDistance){
    useCigBtn.style.display="none";
  }else{
    useCigBtn.style.display="block";
  }
}

/* 回復 */
function startHeal(amount){
  healing=amount;
  healRate=amount/2000;
  fieldHp.style.display="block";
}

function healLoop(){
  if(healing>0){
    const d=healRate*16;
    player.hp=Math.min(player.hp+d,player.maxHp);
    healing-=d;
    if(healing<=0) fieldHp.style.display="none";
    updateUI();
  }
  requestAnimationFrame(healLoop);
}
healLoop();

/* アイテム */
function clearItems(){
  document.querySelectorAll(".item").forEach(e=>e.remove());
}

function spawnItems(){
  clearItems();

  if(Math.random()<0.5){
    const isCig=Math.random()<0.3;

    if(!isCig && player.hp>=player.maxHp) return;

    const item=document.createElement("div");
    item.className="item "+(isCig?"cig":"stub");

    item.style.left=Math.random()*600+"px";
    item.style.top=(240+Math.random()*200)+"px";

    item.onclick=()=>{
      if(isCig){
        player.cigs++;
      }else{
        startHeal(5);
      }
      item.remove();
      updateUI();
    };

    game.appendChild(item);
  }
}

/* タバコ */
useCigBtn.onclick=()=>{
  if(player.cigs<=0)return;
  player.cigs--;
  startHeal(player.maxHp);
  updateUI();
};

/* 遷移 */
nextBtn.onclick=()=>{
  window.location.href="stage2.html";
};

/* 進む */
advanceBtn.onclick=()=>{

  if(currentDistance>=goalDistance)return;

  currentDistance+=Math.floor(Math.random()*120)+80;

  if(currentDistance>=goalDistance){
    currentDistance=goalDistance;

    clearItems();
    battle.style.display="none";

    messageText.textContent="セブンに到着した";
    message.style.display="block";
    nextBtn.style.display="block";

    advanceBtn.style.display="none";
    return;
  }

  spawnItems();

  if(Math.random()<0.3){
    enemy={hp:20,atk:3,speed:2000};
    battle.style.display="block";
    advanceBtn.style.display="none";
    enemyLoop();
  }

  updateUI();
};

updateUI();
