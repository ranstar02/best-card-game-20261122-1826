// Lantern Pact — mouse and keyboard input.
// The canvas owns one click handler and one key handler; the game asks
// "what did the player press?" through hit-zones the renderer registers.

export function createInput(canvas) {
  const zones = []; // { x, y, w, h, id, data } — rebuilt every frame
  const listeners = { click: [], key: [] };

  function toLocal(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener('click', (event) => {
    const p = toLocal(event);
    for (let i = zones.length - 1; i >= 0; i--) {
      const z = zones[i];
      if (p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h) {
        for (const fn of listeners.click) fn(z.id, z.data, p);
        return;
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    for (const fn of listeners.key) fn(event.key);
  });

  return {
    // Called by the renderer each frame before it draws clickable things.
    beginFrame() {
      zones.length = 0;
    },
    zone(x, y, w, h, id, data) {
      zones.push({ x, y, w, h, id, data });
    },
    onClick(fn) {
      listeners.click.push(fn);
    },
    onKey(fn) {
      listeners.key.push(fn);
    },
  };
}
