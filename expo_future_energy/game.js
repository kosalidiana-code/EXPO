/* EXPO Future Energy — Astana survival and energy museum game. */
const world = document.querySelector('#world');
const player = document.querySelector('#player');
const camera = document.querySelector('#camera');
const state = {
  defeated: 0, lives: 3, inside: false, sound: true, robots: [], exhibits: [], found: new Set(),
  invulnerableUntil: 0, gameOver: false, won: false, started: false, keys: new Set()
};
const TOTAL_ROBOTS = 10;
const $ = id => document.getElementById(id);
const make = (tag, parent, attrs = {}) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  parent.appendChild(el);
  return el;
};
const box = (p, pos, size, color, extra = {}) => make('a-box', p, {
  position: pos, width: size[0], height: size[1], depth: size[2],
  material: `color:${color};roughness:.55;metalness:.22`, ...extra
});
const cyl = (p, pos, radius, height, color, extra = {}) => make('a-cylinder', p, {
  position: pos, radius, height, material: `color:${color};roughness:.48;metalness:.3`, ...extra
});
const sph = (p, pos, radius, color, extra = {}) => make('a-sphere', p, {
  position: pos, radius, material: `color:${color};roughness:.38;metalness:.28`, ...extra
});
const txt = (p, value, pos, color = '#fff', width = 5) => make('a-text', p, {
  value, position: pos, align: 'center', color, width, side: 'double', shader: 'msdf'
});
function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => $('toast').classList.add('hidden'), 2400);
}
function speak(text) {
  if (!state.sound || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; utterance.rate = .94; utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}
function ring(parent, pos, radius, color, tubular = .08) {
  return make('a-torus', parent, { position: pos, radius, radiusTubular: tubular,
    rotation: '90 0 0', material: `color:${color};metalness:.68;roughness:.24` });
}
function addTree(x, z, scale = 1) {
  const tree = make('a-entity', world, { position: `${x} 0 ${z}`, scale: `${scale} ${scale} ${scale}` });
  cyl(tree, '0 1.1 0', .18, 2.2, '#665448');
  sph(tree, '0 2.45 0', 1.05, '#496c5b');
  sph(tree, '-.48 2.25 .12', .72, '#5f8a70');
  sph(tree, '.48 2.2 -.12', .72, '#3e604f');
}
function lamp(x, z) {
  cyl(world, `${x} 2 ${z}`, .07, 4, '#344a55');
  sph(world, `${x} 4.08 ${z}`, .18, '#ffe1a1', {
    material: 'color:#ffe1a1;emissive:#ffe1a1;emissiveIntensity:.8'
  });
}
function road(x, z, width, depth) { box(world, `${x} .02 ${z}`, [width, .06, depth], '#35444c'); }
function building(x, z, width, height, depth, color = '#aebdc3', style = 0) {
  const structure = make('a-entity', world, { position: `${x} 0 ${z}` });
  box(structure, `0 ${height / 2} 0`, [width, height, depth], color,
    { material: `color:${color};roughness:.3;metalness:.3` });
  for (let y = 1.3; y < height - 1; y += 1.65) {
    for (let xx = -width / 2 + .65; xx < width / 2 - .35; xx += 1.15) {
      box(structure, `${xx} ${y} ${depth / 2 + .012}`, [.62, .72, .035], style % 2 ? '#b8d8df' : '#6c9cae',
        { material: 'color:#9fc9d6;metalness:.55;roughness:.18' });
    }
  }
  box(structure, `0 ${height + .12} 0`, [width * .8, .18, depth * .8], '#d5e0e3');
}
function createBaiterek() {
  const landmark = make('a-entity', world, { position: '-28 0 -23' });
  cyl(landmark, '0 10 0', .55, 20, '#d9e2e3');
  sph(landmark, '0 21 0', 3.2, '#e6c77f', { material: 'color:#e6c77f;metalness:.5;roughness:.2' });
  cyl(landmark, '0 1 0', 2.1, 2, '#9baeb4');
  ring(landmark, '0 4 0', 1.2, '#d7e0e3');
  txt(landmark, 'BÄITEREK', '0 25 0', '#fff', 8);
}
function buildCity() {
  make('a-plane', world, { position: '0 -.08 0', rotation: '-90 0 0', width: 180, height: 180,
    material: 'color:#a6b2ae;roughness:1' });
  road(0, 0, 9, 150); road(0, 0, 150, 9);
  road(-30, 0, 5, 120); road(30, 0, 5, 120); road(0, -30, 120, 5); road(0, 30, 120, 5);
  for (let n = -65; n <= 65; n += 5) {
    box(world, `${n} .065 0`, [.12, .025, 2.2], '#e4d9b8');
    box(world, `0 .065 ${n}`, [2.2, .025, .12], '#e4d9b8');
  }
  for (let x = -14; x <= 14; x += 2) box(world, `${x} .06 13`, [1.8, .08, 4], '#c9d1ce');
  for (let z = -65; z <= 65; z += 15) {
    for (const x of [-48, -20, 20, 48]) {
      const height = 10 + Math.random() * 17;
      building(x, z, 7 + Math.random() * 3, height, 7 + Math.random() * 3,
        ['#b9c6c9', '#879da6', '#c8d0cf'][Math.floor(Math.random() * 3)], Math.floor(Math.random() * 3));
    }
  }
  createBaiterek();
  const khan = make('a-entity', world, { position: '32 0 -35' });
  cyl(khan, '0 4 0', 7, 8, '#d7e0e1');
  sph(khan, '0 8 0', 7, '#b7cbd0', { scale: '1 .8 1', material: 'color:#b7cbd0;metalness:.25;roughness:.25' });
  txt(khan, 'KHAN SHATYR', '0 17 0', '#fff', 10);
  const arch = make('a-entity', world, { position: '-40 0 35' });
  box(arch, '0 5 0', [15, 10, 1], '#a8b7bd');
  box(arch, '0 11 0', [17, 2, 2], '#d6c18d');
  box(arch, '0 4 0', [2, 8, 2], '#d6c18d');
  txt(arch, 'ASTANA', '0 14 0', '#fff', 8);
  for (let i = 0; i < 60; i++) {
    const x = (Math.random() - .5) * 130, z = (Math.random() - .5) * 130;
    if (Math.abs(x) > 10 || Math.abs(z) > 10) addTree(x, z, .65 + Math.random() * .5);
  }
  for (let z = -55; z <= 55; z += 18) { lamp(-6, z); lamp(6, z); }
  cyl(world, '18 .08 18', 5, .14, '#5f9eae');
  cyl(world, '18 .16 18', 3.6, .05, '#8bc5cf');
  for (let i = 0; i < 5; i++) {
    const bench = make('a-entity', world, { position: `${-13 + i * 6} 0 17` });
    box(bench, '0 .55 0', [2, .14, .65], '#765a43');
    box(bench, '-.7 .28 0', [.12, .55, .12], '#303d42');
    box(bench, '.7 .28 0', [.12, .55, .12], '#303d42');
  }
}
function buildSphere() {
  const pavilion = make('a-entity', world, { id: 'nur-alem', position: '0 0 0' });
  cyl(pavilion, '0 .35 0', 10, .7, '#dce4e5'); ring(pavilion, '0 .76 0', 9.7, '#d8bd7d');
  sph(pavilion, '0 9.2 0', 8.8, '#91c8d8', {
    material: 'color:#8fc7d8;opacity:.23;transparent:true;metalness:.65;roughness:.12;side:double'
  });
  for (let i = 0; i < 24; i++) {
    const angle = i * Math.PI / 12, x = Math.sin(angle) * 8.82, z = Math.cos(angle) * 8.82;
    make('a-cylinder', pavilion, { position: `${x} 9.2 ${z}`, radius: .035, height: 17.2,
      material: 'color:#dce9e9;metalness:.75;roughness:.2', rotation: `0 ${i * 15} 0` });
  }
  for (let y = 3; y <= 15; y += 2.4) {
    const radius = Math.sqrt(Math.max(0, 8.8 * 8.8 - (y - 9.2) * (y - 9.2)));
    if (radius > 1) ring(pavilion, `0 ${y} 0`, radius, '#d9e8e9');
  }
  box(pavilion, '0 2.15 8.65', [3.4, 4.2, .25], '#173d50',
    { material: 'color:#17475c;opacity:.8;transparent:true;metalness:.5' });
  box(pavilion, '0 4.35 8.8', [4, .18, .35], '#e8cf91');
  box(pavilion, '-1.9 2.15 8.8', [.18, 4.3, .35], '#e8cf91');
  box(pavilion, '1.9 2.15 8.8', [.18, 4.3, .35], '#e8cf91');
  txt(pavilion, 'NUR ALEM', '0 18.8 0', '#fff', 8);
  txt(pavilion, 'MUSEUM OF FUTURE ENERGY', '0 17.5 0', '#e4d7b5', 5);
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4, x = Math.sin(angle) * 13, z = Math.cos(angle) * 13;
    box(world, `${x} .06 ${z}`, [2, .08, 2], '#c8d1d1');
  }
}

function createRobot(id, x, z) {
  const robot = make('a-entity', world, {
    id: `robot-${id}`, class: 'clickable robot', position: `${x} 0 ${z}`
  });
  // Detailed mechanical body: torso, shoulder joints, articulated-looking limbs and sensor head.
  box(robot, '0 1.35 0', [.95, 1.25, .62], '#344d5b', { material: 'color:#344d5b;metalness:.72;roughness:.3' });
  box(robot, '0 2.25 0', [.82, .72, .7], '#536d79', { material: 'color:#536d79;metalness:.75;roughness:.25' });
  box(robot, '-.2 2.3 .365', [.13, .12, .04], '#ff526a', { material: 'color:#ff526a;emissive:#ff1d48;emissiveIntensity:1.5' });
  box(robot, '.2 2.3 .365', [.13, .12, .04], '#ff526a', { material: 'color:#ff526a;emissive:#ff1d48;emissiveIntensity:1.5' });
  cyl(robot, '0 2.78 0', .045, .35, '#a9c1c8');
  sph(robot, '0 2.98 0', .12, '#f2c56f', { material: 'color:#f2c56f;emissive:#f2a900;emissiveIntensity:.8' });
  for (const side of [-1, 1]) {
    sph(robot, `${side * .58} 1.78 0`, .19, '#9eb2b8');
    box(robot, `${side * .62} 1.48 0`, [.28, .95, .3], '#536d79', { rotation: `0 0 ${side * 10}` });
    box(robot, `${side * .25} .48 0`, [.3, .75, .35], '#263d48');
    sph(robot, `${side * .25} .12 .02`, .17, '#253944');
  }
  cyl(robot, '0 .05 0', .58, .12, '#233944');
  txt(robot, 'ROGUE', '0 3.25 0', '#ff8a91', 2.8);
  robot.userData = { id, speed: 1.05 + Math.random() * .28, hitAt: 0 };
  state.robots.push(robot);
  return robot;
}
function magicBurst(position) {
  const burst = make('a-entity', world, { position });
  const colors = ['#fff2b2', '#8eeaff', '#c7a4ff'];
  for (let i = 0; i < 22; i++) {
    const angle = i * Math.PI * 2 / 22, color = colors[i % colors.length];
    const particle = sph(burst, `${Math.cos(angle) * .5} ${Math.sin(angle) * .5} 0`, .07, color,
      { material: `color:${color};emissive:${color};emissiveIntensity:1.5` });
    particle.setAttribute('animation', `property: position; to: ${Math.cos(angle) * 2.2} ${Math.sin(angle) * 2.2} 0; dur: 560; easing: easeOutQuad`);
    particle.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 560');
  }
  sph(burst, '0 0 0', .32, '#fff3bd', { material: 'color:#fff3bd;emissive:#fff3bd;emissiveIntensity:2' })
    .setAttribute('animation', 'property: scale; to: 5 5 5; dur: 420; easing: easeOutQuad');
  setTimeout(() => burst.remove(), 740);
}
function updateHUD() {
  $('robot-count').textContent = state.defeated;
  $('life-count').textContent = state.lives;
  $('life-icons').textContent = '♥ '.repeat(state.lives).trim() || '—';
  $('exhibit-count').textContent = state.found.size;
  if (state.defeated >= TOTAL_ROBOTS) {
    state.won = true;
    $('mission-text').textContent = 'City secured! You defeated all 10 robots.';
    showEndScreen(true);
  } else if (!state.inside && !state.gameOver) {
    $('mission-text').textContent = `Defeat ${TOTAL_ROBOTS - state.defeated} more robots to secure Astana.`;
  }
}
function defeatRobot(robot) {
  if (state.inside || state.gameOver || state.won || !robot || robot.dataset.dead) return;
  robot.dataset.dead = 'true';
  const position = robot.object3D.position;
  magicBurst(`${position.x} ${position.y + 1.3} ${position.z}`);
  robot.setAttribute('animation__vanish', 'property: scale; to: 0.01 0.01 0.01; dur: 430; easing: easeInBack');
  robot.setAttribute('animation__rise', `property: position; to: ${position.x} 2.5 ${position.z}; dur: 430`);
  state.defeated++;
  updateHUD();
  notify(`Magic hit! Robot ${state.defeated} of ${TOTAL_ROBOTS} defeated.`);
  setTimeout(() => robot.remove(), 460);
}
function findRobotUnderReticle() {
  // Cast a real Three.js ray from the exact centre of the camera view.
  // A-Frame's getIntersection(robot) can miss grouped entities because the
  // robot is a parent entity and its visible geometry lives in child meshes.
  const threeCamera = camera.sceneEl && camera.sceneEl.camera;
  if (!threeCamera || !window.THREE) return null;
  camera.object3D.updateMatrixWorld(true);
  threeCamera.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0, 0), threeCamera);
  let target = null;
  let nearest = Infinity;
  for (const robot of state.robots) {
    if (!robot.parentNode || robot.dataset.dead || !robot.object3D.visible) continue;
    robot.object3D.updateMatrixWorld(true);
    const hits = ray.intersectObject(robot.object3D, true);
    if (hits.length && hits[0].distance < nearest) {
      nearest = hits[0].distance;
      target = robot;
    }
  }
  return nearest <= 45 ? target : null;
}
function fireWand() {
  if (!state.started || state.inside || state.gameOver || state.won) return;
  const target = findRobotUnderReticle();
  if (target) {
    defeatRobot(target);
  } else {
    notify('Move the center + onto a robot, then press SPACE or LEFT CLICK.');
  }
}
function damagePlayer(robot) {
  const now = performance.now();
  if (state.inside || state.gameOver || state.won || now < state.invulnerableUntil) return;
  state.lives--;
  state.invulnerableUntil = now + 1400;
  const p = player.object3D.position, r = robot.object3D.position;
  const dx = p.x - r.x, dz = p.z - r.z, length = Math.hypot(dx, dz) || 1;
  player.object3D.position.x += dx / length * 1.7;
  player.object3D.position.z += dz / length * 1.7;
  updateHUD();
  notify(`A robot caught you! ${state.lives} ${state.lives === 1 ? 'life' : 'lives'} remaining.`);
  if (state.lives <= 0) {
    state.gameOver = true;
    showEndScreen(false);
  }
}
function showEndScreen(victory) {
  $('end-title').textContent = victory ? 'ASTANA IS SAFE!' : 'MISSION FAILED';
  $('end-copy').textContent = victory
    ? 'You defeated all 10 rogue robots. The city is safe again.'
    : 'The robots overwhelmed you. Enter the EXPO sphere to restore your lives and try again.';
  $('end-stats').textContent = `Robots defeated: ${state.defeated} / ${TOTAL_ROBOTS}`;
  $('recover').classList.toggle('hidden', victory);
  $('restart-end').classList.toggle('hidden', !victory);
  $('end-screen').classList.remove('hidden');
}
function updatePlayer(delta) {
  if (!state.started || state.gameOver || state.won) return;
  const forward = (state.keys.has('KeyW') || state.keys.has('ArrowUp') ? 1 : 0) - (state.keys.has('KeyS') || state.keys.has('ArrowDown') ? 1 : 0);
  const sideways = (state.keys.has('KeyD') || state.keys.has('ArrowRight') ? 1 : 0) - (state.keys.has('KeyA') || state.keys.has('ArrowLeft') ? 1 : 0);
  if (!forward && !sideways) return;
  const yaw = camera.object3D.rotation.y;
  const length = Math.hypot(forward, sideways) || 1;
  const f = forward / length, s = sideways / length;
  const speed = 7 * delta;
  player.object3D.position.x += (-Math.sin(yaw) * f + Math.cos(yaw) * s) * speed;
  player.object3D.position.z += (-Math.cos(yaw) * f - Math.sin(yaw) * s) * speed;
}
function updateRobots(delta) {
  if (!state.started || state.inside || state.gameOver || state.won) return;
  const p = player.object3D.position;
  state.robots.forEach(robot => {
    if (!robot.parentNode || robot.dataset.dead) return;
    const r = robot.object3D.position;
    const dx = p.x - r.x, dz = p.z - r.z, distance = Math.hypot(dx, dz);
    if (distance < 30 && distance > .01) {
      const step = Math.min(robot.userData.speed * delta, Math.max(0, distance - .92));
      r.x += dx / distance * step;
      r.z += dz / distance * step;
      robot.object3D.rotation.y = Math.atan2(dx, dz);
      robot.object3D.position.y = .06 + Math.abs(Math.sin(performance.now() / 150 + robot.userData.id)) * .035;
    }
    if (distance < 1.35) damagePlayer(robot);
  });
}
const exhibits = {
  wind: {
    name: 'Mini Wind Turbine', category: 'WIND ENERGY',
    desc: 'A wind turbine converts the kinetic energy of moving air into electricity. Wind turns the rotor blades, the rotor drives a generator, and the generator produces electrical power. The amount of energy depends on wind speed, turbine design and operating conditions.',
    fact: 'The EXPO 2017 NUR ALEM pavilion included small wind-energy technologies as part of its future-energy theme.',
    voice: 'This is a mini wind turbine. Moving air turns its blades. The rotor drives a generator, which converts mechanical energy into electricity.'
  },
  fabric: {
    name: 'Kinetic Fabric Installation', category: 'KINETIC ART & MOTION',
    desc: 'This lightweight textile installation responds to air currents. Its flexible fabric panels ripple, bend and create flowing wave patterns. In interactive installations, sensors can measure movement and translate it into light, sound or digital information.',
    fact: 'Kinetic energy is the energy an object has because it is moving. This installation makes motion visible through fabric.',
    voice: 'This is a kinetic fabric installation. Air currents make the fabric ripple and wave. Kinetic energy is the energy of motion, and sensors can measure movement in interactive artworks.'
  },
  mobility: {
    name: 'Electric Vehicle', category: 'E-MOBILITY',
    desc: 'An electric vehicle uses an electric motor powered by energy stored in a rechargeable battery. Regenerative braking can convert some of the vehicle’s motion back into electrical energy and return it to the battery. Charging with renewable electricity can reduce operational emissions.',
    fact: 'The EXPO 2017 Future Energy theme included concepts for cleaner urban transport and future mobility.',
    voice: 'This is an electric vehicle. Its electric motor is powered by a rechargeable battery. Regenerative braking can recover part of the energy normally lost while slowing down.'
  },
  solar: {
    name: 'Photovoltaic Solar Panel', category: 'SOLAR ENERGY',
    desc: 'Photovoltaic cells convert sunlight directly into electricity. When light reaches a semiconductor material, it can release electrical charges and create a flow of current. Solar panels are connected into larger arrays and usually work with an inverter and, when needed, a battery system.',
    fact: 'NUR ALEM was designed as a showcase for future energy, including building-integrated photovoltaic technologies.',
    voice: 'This is a photovoltaic solar panel. It converts sunlight directly into electricity using semiconductor cells. Several panels can be connected to power buildings and other equipment.'
  }
};
function makeWindTurbine(parent) {
  const model = make('a-entity', parent, { position: '0 0 0' });
  cyl(model, '0 1.15 0', .12, 2.3, '#aebdc3');
  cyl(model, '0 2.28 0', .22, .42, '#d5dfe2', { rotation: '90 0 0' });
  sph(model, '0 2.28 .2', .16, '#e3c77e');
  const rotor = make('a-entity', model, { position: '0 2.28 .22' });
  for (let i = 0; i < 3; i++) {
    const blade = make('a-cone', rotor, { position: `0 .77 0`, radiusBottom: .13, radiusTop: .025, height: 1.55,
      material: 'color:#edf3f3;metalness:.25;roughness:.35', rotation: `${i * 120} 0 0` });
    blade.object3D.rotation.z = i * Math.PI * 2 / 3;
  }
  rotor.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 4200; loop: true; easing: linear');
  cyl(model, '0 .08 0', .55, .16, '#526a75');
  return model;
}
function makeFabric(parent) {
  const installation = make('a-entity', parent, { position: '0 0 0' });
  // Several narrow, flowing textile ribbons look more like a kinetic fabric sculpture than a solid block.
  for (let i = 0; i < 7; i++) {
    const ribbon = make('a-plane', installation, {
      position: `${(i - 3) * .34} 2.0 0`, width: .42, height: 3.25,
      material: `color:${['#8bb8c8','#a5cbd2','#739fb5','#c1d9dc'][i % 4]};side:double;transparent:true;opacity:.88;roughness:.7`,
      rotation: `${(i - 3) * 2} 0 ${(i - 3) * 2}`
    });
    ribbon.setAttribute('animation', `property: rotation; to: ${(i - 3) * 2} 0 ${(i - 3) * 2 + 12}; dir: alternate; dur: ${1500 + i * 130}; loop: true; easing: easeInOutSine`);
    ribbon.setAttribute('animation__wave', `property: position; to: ${(i - 3) * .34 + .18} 2.08 0; dir: alternate; dur: ${1100 + i * 100}; loop: true; easing: easeInOutSine`);
  }
  cyl(installation, '0 .18 0', .16, .35, '#b6c6ca');
  return installation;
}
function makeElectricCar(parent) {
  const car = make('a-entity', parent, { position: '0 0 0' });
  // Compact modern EV with a clear hood, cabin, glazing, wheel arches and four rubber wheels.
  box(car, '0 .72 0', [2.75, .58, 1.35], '#4f899e', { material: 'color:#4f899e;metalness:.48;roughness:.28' });
  box(car, '0 1.12 -.12', [1.48, .55, 1.12], '#b7d6df', {
    material: 'color:#9fc8d5;opacity:.82;transparent:true;metalness:.25;roughness:.16'
  });
  box(car, '0 .52 .7', [1.9, .12, .05], '#d9e6e8');
  box(car, '0 .72 .7', [.65, .22, .04], '#e7d99c');
  for (const x of [-.88, .88]) {
    for (const z of [-.48, .48]) {
      cyl(car, `${x} .43 ${z}`, .34, .18, '#1b252b', { rotation: '0 0 90' });
      cyl(car, `${x} .43 ${z + (z > 0 ? .1 : -.1)}`, .17, .19, '#aab9bd', { rotation: '0 0 90' });
    }
  }
  box(car, '0 .58 -.7', [2.1, .12, .08], '#dce9e9');
  return car;
}
function makeSolarPanel(parent) {
  const panel = make('a-entity', parent, { position: '0 0 0' });
  cyl(panel, '0 .45 0', .07, .9, '#84979d');
  cyl(panel, '0 .9 0', .07, 1.5, '#84979d');
  box(panel, '0 1.45 0', [2.65, .12, 1.85], '#183f66', {
    rotation: '-18 0 0', material: 'color:#174f78;metalness:.68;roughness:.22'
  });
  for (let x = -1; x <= 1; x++) box(panel, `${x * .65} 1.52 0`, [.035, .025, 1.72], '#b5d5e0', { rotation: '-18 0 0' });
  for (let z = -1; z <= 1; z++) box(panel, `0 1.52 ${z * .55}`, [2.5, .025, .035], '#b5d5e0', { rotation: '-18 0 0' });
  return panel;
}
function buildExhibitObject(parent, key, x, z) {
  const exhibit = make('a-entity', parent, { class: 'clickable exhibit', position: `${x} 0 ${z}`, 'data-exhibit': key });
  if (key === 'wind') makeWindTurbine(exhibit);
  if (key === 'fabric') makeFabric(exhibit);
  if (key === 'mobility') makeElectricCar(exhibit);
  if (key === 'solar') makeSolarPanel(exhibit);
  sph(exhibit, '0 3.5 0', .12, '#f0d18b', { material: 'color:#f0d18b;emissive:#f0d18b;emissiveIntensity:.8' });
  txt(exhibit, exhibits[key].name.toUpperCase(), '0 3.95 0', '#f4f7f4', 5.2);
  exhibit.addEventListener('click', () => openExhibit(key));
  state.exhibits.push(exhibit);
  return exhibit;
}
function openExhibit(key) {
  const data = exhibits[key]; if (!data) return;
  state.found.add(key);
  $('exhibit-count').textContent = state.found.size;
  $('info-category').textContent = data.category;
  $('info-title').textContent = data.name;
  $('info-description').textContent = data.desc;
  $('info-fact').textContent = data.fact;
  $('info-modal').classList.remove('hidden');
  $('listen').onclick = () => speak(data.voice);
  speak(data.voice);
}
function buildInterior() {
  const room = make('a-entity', world, { id: 'museum-interior', visible: false });
  cyl(room, '0 .12 0', 8.4, .24, '#d5e1e4'); ring(room, '0 .27 0', 8.1, '#e4c985');
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6, x = Math.sin(angle) * 7.8, z = Math.cos(angle) * 7.8;
    cyl(room, `${x} 3.1 ${z}`, .09, 6, '#d9e5e8');
  }
  sph(room, '0 8 0', 7.7, '#8ec8d8', { material: 'color:#8ec8d8;opacity:.12;transparent:true;side:double;metalness:.4' });
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4, x = Math.sin(angle) * 4.5, z = Math.cos(angle) * 4.5;
    box(room, `${x} .18 ${z}`, [2.4, .25, 2.4], '#213f4e');
  }
  buildExhibitObject(room, 'wind', -4, -2);
  buildExhibitObject(room, 'fabric', 0, -4);
  buildExhibitObject(room, 'mobility', 4, -2);
  buildExhibitObject(room, 'solar', 0, 3);
  txt(room, 'ENERGY OF TOMORROW', '0 6.3 -1', '#fff', 8);
}
function enterMuseum() {
  if (state.inside || state.won) return;
  state.gameOver = false;
  $('end-screen').classList.add('hidden');
  state.inside = true;
  state.lives = 3;
  updateHUD();
  $('museum-interior').setAttribute('visible', true);
  $('inside-panel').classList.remove('hidden');
  $('enter').textContent = 'INSIDE THE SAFE ZONE';
  $('enter').disabled = true;
  $('hint').textContent = 'Safe zone: explore the exhibits and listen to their explanations.';
  state.robots.forEach(robot => robot.setAttribute('visible', false));
  player.setAttribute('position', '0 1.65 0');
  camera.setAttribute('rotation', '0 0 0');
  $('mission-text').textContent = 'Explore the four interactive energy exhibits.';
  $('exhibit-list').innerHTML = Object.entries(exhibits).map(([key, value]) =>
    `<button class="exhibit-item" data-key="${key}">${value.name}<span>OPEN ↗</span></button>`).join('');
  $('exhibit-list').querySelectorAll('[data-key]').forEach(item =>
    item.addEventListener('click', () => openExhibit(item.dataset.key)));
  notify('Safe zone entered. Your lives have been restored to 3.');
}
function leaveMuseum() {
  if (!state.inside) return;
  state.inside = false;
  $('museum-interior').setAttribute('visible', false);
  $('inside-panel').classList.add('hidden');
  $('enter').textContent = 'ENTER NUR ALEM';
  $('enter').disabled = false;
  $('hint').textContent = 'Aim at a robot and press SPACE or LEFT MOUSE to cast a spell.';
  state.robots.forEach(robot => { if (robot.parentNode && !robot.dataset.dead) robot.setAttribute('visible', true); });
  player.setAttribute('position', '0 1.65 12');
  camera.setAttribute('rotation', '0 0 0');
  $('mission-text').textContent = `Defeat ${TOTAL_ROBOTS - state.defeated} more robots to secure Astana.`;
}
function restartGame() { window.location.reload(); }
function init() {
  try {
    if (!window.AFRAME) throw new Error('A-Frame did not load. Check your internet connection and refresh the page.');
    buildCity();
    buildSphere();
    buildInterior();
    const spots = [[-22, 8], [22, 9], [-35, -5], [35, 12], [-12, -28], [15, -35], [43, -18], [-42, 28], [8, 42], [0, -48]];
    spots.forEach((point, index) => createRobot(index + 1, point[0], point[1]));
    $('loading').classList.add('hidden');
  } catch (error) {
    console.error('EXPO Future Energy initialization failed:', error);
    const loading = $('loading');
    loading.innerHTML = `<div class="load-error"><h2>THE WORLD COULD NOT LOAD</h2><p>${String(error.message || error).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}</p><button onclick="location.reload()">TRY AGAIN</button></div>`;
  }
}
$('start').addEventListener('click', () => {
  state.started = true;
  $('intro').classList.add('hidden'); $('hud').classList.remove('hidden');
  notify('Find the rogue robots. Aim with the center reticle and cast your spell!');
});
$('enter').addEventListener('click', enterMuseum);
$('leave').addEventListener('click', leaveMuseum);
$('close-info').addEventListener('click', () => { $('info-modal').classList.add('hidden'); if ('speechSynthesis' in window) speechSynthesis.cancel(); });
$('listen').addEventListener('click', () => {});
$('sound').addEventListener('click', () => {
  state.sound = !state.sound; $('sound').textContent = state.sound ? 'SOUND: ON' : 'SOUND: OFF';
  if (!state.sound && 'speechSynthesis' in window) speechSynthesis.cancel();
});
$('restart-end').addEventListener('click', restartGame);
$('recover').addEventListener('click', () => { state.gameOver = false; $('end-screen').classList.add('hidden'); enterMuseum(); });
document.addEventListener('keydown', event => {
  if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)) { state.keys.add(event.code); event.preventDefault(); }
  if (event.code === 'Space' && !event.repeat && $('info-modal').classList.contains('hidden')) {
    event.preventDefault(); fireWand();
  }
});
document.addEventListener('keyup', event => state.keys.delete(event.code));
window.addEventListener('blur', () => state.keys.clear());
// The scene canvas receives left-click casts; UI buttons remain unaffected.
const scene = document.querySelector('#scene');
function attachCombatPointer() {
  const canvas = scene.canvas;
  if (!canvas || canvas.dataset.combatPointerReady) return;
  canvas.dataset.combatPointerReady = 'true';
  canvas.addEventListener('pointerdown', event => {
    if (event.button === 0 && state.started) {
      // Do not fire when the player is clicking an HTML interface element.
      fireWand();
    }
  });
}
scene.addEventListener('loaded', attachCombatPointer);
scene.addEventListener('renderstart', attachCombatPointer);
setInterval(() => {
  if (!state.started || state.inside || state.gameOver || state.won) return;
  const p = player.object3D.position, distance = Math.hypot(p.x, p.z);
  if (distance < 12) {
    $('enter').classList.add('active');
    $('hint').textContent = 'You are near NUR ALEM. Enter to restore your lives and explore the museum.';
  } else {
    $('enter').classList.remove('active');
    $('hint').textContent = 'Aim at a robot and press SPACE or LEFT MOUSE to cast a spell.';
  }
}, 350);
let previousFrame = performance.now();
function gameLoop(now) {
  const delta = Math.min((now - previousFrame) / 1000, .05);
  previousFrame = now;
  updatePlayer(delta);
  updateRobots(delta);
  requestAnimationFrame(gameLoop);
}
init();
requestAnimationFrame(gameLoop);
