function showContent(e, id) {
  document.querySelectorAll('.lesson-content').forEach(el => {
    el.classList.remove('visible');
    el.style.display = 'none';
  });
  document.querySelectorAll('.lesson-tools button').forEach(btn => btn.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.style.display = id === 'flashcard' ? 'grid' : 'block';
    setTimeout(() => target.classList.add('visible'), 10);
  }
  e.currentTarget.classList.add('active');
}
function toggleChat() {
  const chat = document.getElementById('aiChat');
  chat.style.display = chat.style.display === 'block' ? 'none' : 'block';
}
function sendMsg() {
  const input = document.getElementById('aiInput');
  const body = document.getElementById('aiBody');
  if (!input.value.trim()) return;
  const msg = document.createElement('p');
  msg.style.cssText = 'background:#f5e8c0;margin-top:8px;text-align:right;';
  msg.textContent = '🧑 ' + input.value;
  body.appendChild(msg);
  input.value = '';
  body.scrollTop = body.scrollHeight;
}