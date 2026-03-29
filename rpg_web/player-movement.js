function updatePlayerMovement(playerCommander, keys) {
  if (keys["a"] || keys["arrowleft"])
    playerCommander.x -= playerCommander.speed;
  if (keys["d"] || keys["arrowright"])
    playerCommander.x += playerCommander.speed;
  if (keys["w"] || keys["arrowup"])
    playerCommander.y -= playerCommander.speed;
  if (keys["s"] || keys["arrowdown"])
    playerCommander.y += playerCommander.speed;

  playerCommander.x = Math.max(0, Math.min(860, playerCommander.x));
  playerCommander.y = Math.max(0, Math.min(460, playerCommander.y));
}
