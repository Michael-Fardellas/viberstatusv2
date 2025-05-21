async function fetchStatus() {
  const res = await fetch('/.netlify/functions/status');
  const data = await res.json();

  const statusDiv = document.getElementById('status');
  const offlineDuration = document.getElementById('offlineDuration');

  statusDiv.textContent = data.status === 'online' ? '🟢 Online' : '🔴 Offline';

  if (data.status === 'offline' && data.offlineDuration) {
    offlineDuration.textContent = `Offline for ${data.offlineDuration}`;
  } else {
    offlineDuration.textContent = '';
  }
}

fetchStatus();
