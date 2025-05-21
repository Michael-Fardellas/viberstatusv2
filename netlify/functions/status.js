function roundDuration(mins) {
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  const half = remMins >= 45 ? 1 : remMins >= 15 ? 0.5 : 0;
  return `${hours + half}h`;
}

exports.handler = async function () {
  const now = new Date();
  const greeceNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Athens" }));
  const hour = greeceNow.getHours();

  if (hour >= 2 && hour < 9) {
    const offlineSince = new Date(greeceNow);
    offlineSince.setHours(2, 0, 0, 0);
    const diffMins = Math.floor((greeceNow - offlineSince) / 60000);
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "offline",
        offlineDuration: roundDuration(diffMins)
      })
    };
  }

  const daySeed = new Date(greeceNow);
  daySeed.setHours(0, 0, 0, 0);
  const seed = daySeed.getTime() / 1000;

  function getOfflineSlots(seed) {
    const pseudoRand = (i) => {
      return Math.abs(Math.sin(seed + i) * 10000) % 1;
    };

    const slots = [];
    for (let i = 0; i < 3; i++) {
      const startHour = Math.floor(pseudoRand(i) * 15) + 9;
      const startMinute = Math.floor(pseudoRand(i + 100) * 60);
      const duration = Math.floor(pseudoRand(i + 200) * 120) + 15;
      const start = new Date(daySeed);
      start.setHours(startHour, startMinute, 0, 0);
      const end = new Date(start.getTime() + duration * 60000);
      slots.push({ start, end });
    }
    return slots;
  }

  function getShortDisconnections(seed) {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      const rand = Math.abs(Math.sin(seed + h) * 10000) % 1;
      if (rand < 0.5) continue;
      const minute = Math.floor(rand * 60);
      const duration = Math.floor((Math.abs(Math.cos(seed + h) * 10000) % 5) + 1);
      const start = new Date(daySeed);
      start.setHours(h, minute, 0, 0);
      const end = new Date(start.getTime() + duration * 60000);
      slots.push({ start, end });
    }
    return slots;
  }

  const longSlots = getOfflineSlots(seed);
  const shortSlots = getShortDisconnections(seed);

  for (let slot of [...longSlots, ...shortSlots]) {
    if (greeceNow >= slot.start && greeceNow <= slot.end) {
      const diffMins = Math.floor((greeceNow - slot.start) / 60000);
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: "offline",
          offlineDuration: roundDuration(diffMins)
        })
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "online"
    })
  };
};
