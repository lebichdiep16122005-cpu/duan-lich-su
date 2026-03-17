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