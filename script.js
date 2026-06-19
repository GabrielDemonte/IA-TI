function doLogin() {
  const email = document.getElementById('inp-email').value.trim();
  const pass = document.getElementById('inp-pass').value;
  const err = document.getElementById('login-err');
  if (!email || !email.includes('@')) { err.textContent = 'Por favor, insira um e-mail válido.'; return; }
  if (pass.length < 6) { err.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; return; }
  err.textContent = '';
  document.getElementById('user-name').textContent = email.split('@')[0];
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  initGame();
}
document.getElementById('inp-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
document.getElementById('inp-email').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('inp-pass').focus(); });

function drawField() {
  const canvas = document.getElementById('field-canvas');
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const stripes = 10;
  const sw = W / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2d8a27' : '#279122';
    ctx.fillRect(i * sw, 0, sw, H);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  const cx = W / 2;
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, H * 0.75, 60, 0, Math.PI * 2); ctx.stroke();
  const pw = W * 0.55, ph = H * 0.28, px = (W-pw)/2, py = H-ph;
  ctx.strokeRect(px, py, pw, ph);
  const gw = W * 0.28, gh = H * 0.12, gx = (W-gw)/2, gy = H-gh;
  ctx.strokeRect(gx, gy, gw, gh);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(cx, H*0.58, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, H-H*0.18, 4, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, H-H*0.18, 40, Math.PI, 0); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, W-4, H-4);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, W, 30);
  const crowdColors = ['#e63946','#4361ee','#f77f00','#06d6a0','#ffd700','#ef476f','#9b59b6','#fff'];
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = crowdColors[i % crowdColors.length];
    const cx2 = 10 + (i * 21) % (W - 20);
    const cy2 = 6 + (i % 3) * 6;
    ctx.beginPath(); ctx.arc(cx2, cy2, 3, 0, Math.PI*2); ctx.fill();
  }
}

const gkSvg = document.getElementById('gk-svg');
const ballWrap = document.getElementById('ball-wrap');
const msgArea = document.getElementById('msg-area');
const confirmBtn = document.getElementById('confirm-btn');
const lockIcon = document.getElementById('lock-icon');
const field = document.getElementById('field');
const goalWrap = document.getElementById('goal-wrap');
const shootBtns = document.querySelectorAll('.shoot-btn');

let gkPct = 50, gkDir = 1, animating = false, goalScored = false, legPhase = 0;

function initGame() {
  drawField();
  moveGK();
  animateSway();
}

function animateSway() {
  if (goalScored) return;
  legPhase += 0.07;
  const sway = Math.sin(legPhase) * 2.5;
  const group = document.getElementById('gk-body-group');
  if (group) group.setAttribute('transform', `translate(${sway},0)`);
  requestAnimationFrame(animateSway);
}

function moveGK() {
  if (goalScored) return;
  if (!animating) {
    gkPct += gkDir * 1.0;
    if (gkPct >= 80) { gkPct = 80; gkDir = -1; }
    if (gkPct <= 10) { gkPct = 10; gkDir =  1; }
    gkSvg.style.left = gkPct + '%';
  }
  requestAnimationFrame(moveGK);
}

function getGKZone() {
  if (gkPct < 35) return 'left';
  if (gkPct > 58) return 'right';
  return 'center';
}

function shoot(dir) {
  if (animating || goalScored) return;
  animating = true;
  shootBtns.forEach(b => b.disabled = true);
  const saved = (dir === getGKZone()) || (Math.random() < 0.18);
  const goalRect = goalWrap.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  const goalLeftPx = goalRect.left - fieldRect.left;
  const goalW = goalRect.width;
  const goalTopPx = goalRect.top - fieldRect.top;
  const goalH = goalRect.height;

  let targetLeft;
  if (dir === 'left')       targetLeft = goalLeftPx + goalW * 0.12;
  else if (dir === 'right') targetLeft = goalLeftPx + goalW * 0.80;
  else                      targetLeft = goalLeftPx + goalW * 0.46;

  const targetBottom = saved
    ? fieldRect.height - (goalTopPx + goalH * 0.50)
    : fieldRect.height - (goalTopPx + goalH * 0.68);

  ballWrap.style.transition = 'left 0.52s ease-in, bottom 0.52s ease-in, width 0.52s, height 0.52s';
  ballWrap.style.transform = 'none';
  ballWrap.style.left = targetLeft + 'px';
  ballWrap.style.bottom = targetBottom + 'px';
  ballWrap.style.width = saved ? '28px' : '22px';
  ballWrap.style.height = saved ? '28px' : '22px';

  if (saved) {
    const diveLeft = dir === 'left'
      ? (goalLeftPx + goalW * 0.03) + 'px'
      : dir === 'right'
        ? (goalLeftPx + goalW * 0.72) + 'px'
        : (goalLeftPx + goalW * 0.38) + 'px';
    setTimeout(() => {
      gkSvg.style.transition = 'left 0.2s ease-out';
      gkSvg.style.left = diveLeft;
    }, 160);
  }

  setTimeout(() => {
    if (saved) {
      msgArea.innerHTML = '❌ Defesa incrível! Tente novamente.';
      msgArea.style.color = '#e63946';
      setTimeout(() => {
        ballWrap.style.transition = 'all 0.4s ease';
        ballWrap.style.left = '50%';
        ballWrap.style.transform = 'translateX(-50%)';
        ballWrap.style.bottom = '76px';
        ballWrap.style.width = '42px';
        ballWrap.style.height = '42px';
        setTimeout(() => {
          animating = false;
          shootBtns.forEach(b => b.disabled = false);
          msgArea.style.color = '#FFD700';
          msgArea.innerHTML = '🎯 Escolha a direção do chute!';
          gkSvg.style.transition = '';
        }, 500);
      }, 300);
    } else {
      goalScored = true;
      msgArea.innerHTML = '⚽ GOL! Botão desbloqueado! 🎉';
      msgArea.style.color = '#27ae60';
      spawnConfetti();
      setTimeout(() => {
        confirmBtn.classList.add('unlocked');
        lockIcon.textContent = '🔓';
        confirmBtn.onclick = () => {
          msgArea.innerHTML = '✅ Confirmado! Você é campeão! 🏆';
          msgArea.style.color = '#FFD700';
        };
      }, 350);
    }
  }, 560);
}

function spawnConfetti() {
  const colors = ['#FFD700','#e63946','#4361ee','#06d6a0','#f77f00','#fff','#9b59b6'];
  for (let i = 0; i < 50; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    const size = 6 + Math.random() * 8;
    c.style.width = size + 'px'; c.style.height = size + 'px';
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.left = (3 + Math.random()*94) + '%';
    c.style.top = '0';
    c.style.animationDelay = (Math.random()*0.7)+'s';
    c.style.animationDuration = (1.0+Math.random()*0.6)+'s';
    field.appendChild(c);
    setTimeout(() => c.remove(), 2600);
  }
}

window.addEventListener('resize', () => {
  if (document.getElementById('game-screen').style.display !== 'none') drawField();
});