import * as THREE from "three";

const container = document.getElementById("hero3d");

if (container) {
  try {
    initHeroScene(container);
  } catch (err) {
    console.warn("Hero 3D scene failed to initialize:", err);
    container.style.display = "none";
  }
}

function initHeroScene(container) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const supportsHover = window.matchMedia("(hover: hover)").matches;

  // ---- Palette (matches styles.css) ----------------------------------
  const COLOR = {
    accentBlue: "#4f6fd8",
    accentOrange: "204, 132, 52",
    text: "#b5b3b3",
    comment: "#6a6a6d",
  };

  // Whether the pointer is currently over the screen mesh — drives the
  // "Say hello" hint's brightness and the glow's intensity.
  let isHovering = false;

  // ---- Renderer / scene / camera --------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // Zoomed-out framing: fixed camera distance, horizontal FOV solved so the
  // laptop reads at a consistent size once the container goes full-bleed
  // across very different aspect ratios.
  const CAMERA_DISTANCE = 4.4;
  const FRAME_HALF_WIDTH = 2.1;
  const baseHorizontalFov = 2 * Math.atan(FRAME_HALF_WIDTH / CAMERA_DISTANCE);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 1.5, CAMERA_DISTANCE);
  camera.lookAt(0, 0.12, -0.05);

  // ---- Lights -----------------------------------------------------------
  scene.add(new THREE.HemisphereLight(0x8aa0ff, 0x0a0a0c, 0.85));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(1.8, 2.6, 2.2);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xd9e2ff, 0.7, 6);
  fillLight.position.set(-1.2, 1.4, 1.8);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x4f6fd8, 3.5, 7);
  rimLight.position.set(-1.4, 1.6, -1.2);
  scene.add(rimLight);

  const screenGlowLight = new THREE.PointLight(0xbcd0ff, 1.4, 3.5);
  screenGlowLight.position.set(0, 0.95, 0.4);
  scene.add(screenGlowLight);

  // ---- Rig (floating laptop + props) -------------------------------------
  const rig = new THREE.Group();
  scene.add(rig);

  // Laptop base
  const baseWidth = 1.55;
  const baseDepth = 1.05;
  const baseHeight = 0.055;

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth),
    new THREE.MeshStandardMaterial({
      color: 0x3a3a40,
      roughness: 0.35,
      metalness: 0.6,
    })
  );
  base.position.y = baseHeight / 2;
  rig.add(base);

  // Rubber feet
  const footGeom = new THREE.CylinderGeometry(0.02, 0.022, 0.008, 10);
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x050506,
    roughness: 0.9,
  });
  [-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
      const foot = new THREE.Mesh(footGeom, footMat);
      foot.position.set(
        sx * (baseWidth / 2 - 0.09),
        -0.004,
        sz * (baseDepth / 2 - 0.1)
      );
      rig.add(foot);
    });
  });

  // Raised keyboard deck — sized to fill most of the base's back two-thirds,
  // with the keys in turn filling most of the deck (not lost in a sea of
  // surrounding plastic).
  const deckWidth = 1.42;
  const deckDepth = 0.6;
  const deckZ = -baseDepth / 2 + 0.05 + deckDepth / 2;

  const keyboardDeck = new THREE.Mesh(
    new THREE.BoxGeometry(deckWidth, 0.012, deckDepth),
    new THREE.MeshStandardMaterial({
      color: 0x121214,
      roughness: 0.75,
      metalness: 0.1,
    })
  );
  keyboardDeck.position.set(0, baseHeight + 0.006, deckZ);
  rig.add(keyboardDeck);

  // Individual key caps (4 rows + a spacebar row), instanced for a single
  // extra draw call
  const keyRows = 4;
  const keyCols = 12;
  const keysAreaWidth = deckWidth * 0.9;
  const keysAreaDepth = deckDepth * 0.85;
  const rowPitch = keysAreaDepth / (keyRows + 1);
  const keyPitchX = keysAreaWidth / keyCols;
  const keyGeom = new THREE.BoxGeometry(keyPitchX * 0.8, 0.014, rowPitch * 0.78);
  const keyMat = new THREE.MeshStandardMaterial({
    color: 0x1d1d21,
    roughness: 0.5,
    metalness: 0.2,
  });
  const keysMesh = new THREE.InstancedMesh(
    keyGeom,
    keyMat,
    keyRows * keyCols
  );
  const keysStartX = -keysAreaWidth / 2 + keyPitchX / 2;
  const keysStartZ = -keysAreaDepth / 2 + rowPitch / 2;
  const dummy = new THREE.Object3D();
  let keyIndex = 0;
  for (let r = 0; r < keyRows; r++) {
    for (let c = 0; c < keyCols; c++) {
      dummy.position.set(
        keysStartX + c * keyPitchX,
        0.009,
        keysStartZ + r * rowPitch
      );
      dummy.updateMatrix();
      keysMesh.setMatrixAt(keyIndex++, dummy.matrix);
    }
  }
  keyboardDeck.add(keysMesh);

  const spacebar = new THREE.Mesh(
    new THREE.BoxGeometry(keysAreaWidth * 0.42, 0.014, rowPitch * 0.78),
    keyMat
  );
  spacebar.position.set(0, 0.009, keysStartZ + keyRows * rowPitch);
  keyboardDeck.add(spacebar);

  // Power LED
  const powerLed = new THREE.Mesh(
    new THREE.CircleGeometry(0.007, 12),
    new THREE.MeshBasicMaterial({ color: 0x8fffb0 })
  );
  powerLed.rotation.x = -Math.PI / 2;
  powerLed.position.set(deckWidth / 2 - 0.045, 0.007, -deckDepth / 2 + 0.045);
  keyboardDeck.add(powerLed);

  // Trackpad — set apart from the deck with a visible gap, and given its own
  // recessed groove so it reads as a distinct surface rather than a sticker.
  const trackpadWidth = 0.44;
  const trackpadDepth = 0.26;
  const trackpadZ = deckZ + deckDepth / 2 + 0.08 + trackpadDepth / 2;

  const trackpadGroove = new THREE.Mesh(
    new THREE.BoxGeometry(trackpadWidth + 0.035, 0.006, trackpadDepth + 0.035),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1c,
      roughness: 0.8,
      metalness: 0.05,
    })
  );
  trackpadGroove.position.set(0, baseHeight + 0.005, trackpadZ);
  rig.add(trackpadGroove);

  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(trackpadWidth, 0.006, trackpadDepth),
    new THREE.MeshStandardMaterial({
      color: 0x323238,
      roughness: 0.22,
      metalness: 0.15,
    })
  );
  trackpad.position.set(0, baseHeight + 0.009, trackpadZ);
  rig.add(trackpad);

  // Port notches on the right edge of the base
  const portMat = new THREE.MeshStandardMaterial({
    color: 0x050506,
    roughness: 0.6,
  });
  [-0.28, -0.1].forEach((z) => {
    const port = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.02, 0.08),
      portMat
    );
    port.position.set(baseWidth / 2 - 0.001, baseHeight / 2, z);
    rig.add(port);
  });

  // Screen (hinged group)
  const screenWidth = 1.5;
  const screenHeight = 0.98;
  const bezelDepth = 0.045;

  const hinge = new THREE.Group();
  hinge.position.set(0, baseHeight, -baseDepth / 2 + 0.02);
  hinge.rotation.x = -0.28;
  rig.add(hinge);

  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(screenWidth, screenHeight, bezelDepth),
    new THREE.MeshStandardMaterial({
      color: 0x101013,
      roughness: 0.5,
      metalness: 0.4,
    })
  );
  bezel.position.set(0, screenHeight / 2, 0);
  hinge.add(bezel);

  // Webcam
  const webcam = new THREE.Mesh(
    new THREE.CircleGeometry(0.012, 16),
    new THREE.MeshStandardMaterial({
      color: 0x050506,
      roughness: 0.15,
      metalness: 0.6,
    })
  );
  webcam.position.set(0, screenHeight - 0.035, bezelDepth / 2 + 0.001);
  hinge.add(webcam);

  // Screen canvas texture — carries the hero copy
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 512;
  screenCanvas.height = 334;
  const screenCtx = screenCanvas.getContext("2d");
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.minFilter = THREE.LinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;

  const screenFace = new THREE.Mesh(
    new THREE.PlaneGeometry(screenWidth - 0.14, screenHeight - 0.14),
    new THREE.MeshBasicMaterial({ map: screenTexture })
  );
  screenFace.position.set(0, screenHeight / 2, bezelDepth / 2 + 0.002);
  hinge.add(screenFace);

  // Soft additive glow behind the screen
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(screenWidth + 0.7, screenHeight + 0.7),
    new THREE.MeshBasicMaterial({
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.position.set(0, screenHeight / 2, -0.05);
  hinge.add(glow);

  // ---- Screen content: the hero greeting, typed out live -----------------
  const roles = [
    "Software Engineer.",
    "React Developer.",
    "Node.js Developer.",
    "WordPress Developer.",
  ];

  let typedRole = prefersReducedMotion ? roles[0] : "";

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawScreen(showCursor, elapsed) {
    const { width, height } = screenCanvas;
    screenCtx.fillStyle = "#0b0f17";
    screenCtx.fillRect(0, 0, width, height);
    screenCtx.textAlign = "center";
    screenCtx.textBaseline = "alphabetic";

    const centerX = width / 2;
    let y = height / 2 - 64;

    screenCtx.fillStyle = COLOR.comment;
    screenCtx.font = '400 23px "Segoe UI", sans-serif';
    screenCtx.fillText("Welcome, my name is", centerX, y);

    y += 58;
    screenCtx.fillStyle = COLOR.accentBlue;
    screenCtx.font = '700 47px "Segoe UI", sans-serif';
    screenCtx.fillText("James Hooven.", centerX, y);

    y += 56;
    screenCtx.fillStyle = COLOR.text;
    const roleLine = `I am a ${typedRole}`;
    const maxRoleWidth = width - 64;
    let roleFontSize = 32;
    screenCtx.font = `600 ${roleFontSize}px "Segoe UI", sans-serif`;
    let roleWidth = screenCtx.measureText(roleLine).width;
    if (roleWidth > maxRoleWidth) {
      roleFontSize = Math.floor(roleFontSize * (maxRoleWidth / roleWidth));
      screenCtx.font = `600 ${roleFontSize}px "Segoe UI", sans-serif`;
      roleWidth = screenCtx.measureText(roleLine).width;
    }
    screenCtx.fillText(roleLine, centerX, y);

    if (showCursor) {
      screenCtx.fillStyle = COLOR.accentBlue;
      const cursorHeight = roleFontSize * 1.05;
      screenCtx.fillRect(
        centerX + roleWidth / 2 + 5,
        y - cursorHeight * 0.8,
        3,
        cursorHeight
      );
    }

    y += 48;
    const hintText = "Say hello →";
    const hintFontSize = 17;
    screenCtx.font = `700 ${hintFontSize}px "Segoe UI", sans-serif`;
    const hintTextWidth = screenCtx.measureText(hintText).width;

    // A slow breathing pulse gives the button-like chip a "tap me" cue on
    // touch devices, where there's no hover state to lean on.
    const pulse = prefersReducedMotion
      ? 1
      : 0.72 + Math.sin(elapsed * 2.2) * 0.18;
    const chipAlpha = isHovering ? 1 : pulse;
    const chipScale = isHovering ? 1.06 : 1 + (pulse - 0.72) * 0.06;

    const paddingX = 18;
    const paddingY = 10;
    const chipW = (hintTextWidth + paddingX * 2) * chipScale;
    const chipH = (hintFontSize + paddingY * 2) * chipScale;
    const textCenterY = y - hintFontSize * 0.32;

    drawRoundedRect(
      screenCtx,
      centerX - chipW / 2,
      textCenterY - chipH / 2,
      chipW,
      chipH,
      chipH / 2
    );
    screenCtx.strokeStyle = `rgba(${COLOR.accentOrange}, ${chipAlpha})`;
    screenCtx.lineWidth = 2;
    screenCtx.stroke();

    screenCtx.fillStyle = `rgba(${COLOR.accentOrange}, ${chipAlpha})`;
    screenCtx.fillText(hintText, centerX, y);

    const vignette = screenCtx.createRadialGradient(
      centerX,
      height / 2,
      height * 0.25,
      centerX,
      height / 2,
      height * 0.8
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.4)");
    screenCtx.fillStyle = vignette;
    screenCtx.fillRect(0, 0, width, height);

    screenTexture.needsUpdate = true;
  }

  drawScreen(false, 0);

  // Typewriter tick (mirrors the original DOM cadence)
  if (!prefersReducedMotion) {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const current = roles[roleIndex];

      if (deleting) {
        charIndex--;
        typedRole = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      } else {
        charIndex++;
        typedRole = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
      }

      setTimeout(tick, deleting ? 40 : 70);
    };

    setTimeout(tick, 1000);
  }

  // ---- Texture helpers -------------------------------------------------
  function makeGlowTexture() {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, "rgba(79,111,216,0.9)");
    grad.addColorStop(1, "rgba(79,111,216,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ---- Sizing: lock horizontal FOV so the laptop stays a consistent size
  // across the full-bleed hero's wildly different aspect ratios. On narrow
  // (mobile-ish) aspects, tighten the frame and lift the look target so the
  // screen — not a wide slice of desk — dominates the viewport. ------------
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    const aspect = w / h;
    camera.aspect = aspect;

    const mobileT = THREE.MathUtils.clamp(
      THREE.MathUtils.inverseLerp(1.1, 0.5, aspect),
      0,
      1
    );
    const frameHalfWidth = THREE.MathUtils.lerp(
      FRAME_HALF_WIDTH,
      FRAME_HALF_WIDTH * 0.48,
      mobileT
    );
    const horizontalFov = 2 * Math.atan(frameHalfWidth / CAMERA_DISTANCE);

    // Derive vertical FOV from the REAL aspect so the horizontal lock is
    // exact at every screen size — using a clamped/fudged aspect here (as
    // a previous version did) throws off the horizontal result and crops
    // the laptop's edges on narrow phone aspect ratios. A generous vertical
    // FOV on tall narrow screens is harmless — it just shows more empty
    // space above/below a small, centered object — so it isn't capped,
    // beyond a loose safety ceiling for degenerate aspect ratios.
    const verticalFov = 2 * Math.atan(Math.tan(horizontalFov / 2) / aspect);
    camera.fov = Math.min(THREE.MathUtils.radToDeg(verticalFov), 100);

    // Lower look targets push the laptop toward the top of the hero rather
    // than sitting dead-center.
    const lookY = THREE.MathUtils.lerp(0.12, 0.32, mobileT);
    camera.lookAt(0, lookY, -0.05);

    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // ---- Interaction (subtle parallax) ------------------------------------
  let targetRotY = 0;
  let targetRotX = 0;

  if (!prefersReducedMotion && supportsHover) {
    window.addEventListener("pointermove", (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = nx * 0.18;
      targetRotX = ny * 0.06;
    });
  }

  // ---- Screen click-through: the display doubles as a "Contact" shortcut
  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();

  function pointerToNDC(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function isPointerOnScreen() {
    raycaster.setFromCamera(pointerNDC, camera);
    return raycaster.intersectObject(screenFace, false).length > 0;
  }

  container.addEventListener("click", (e) => {
    pointerToNDC(e);
    if (isPointerOnScreen()) {
      const contact = document.getElementById("contact");
      if (contact) {
        contact.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  if (supportsHover) {
    container.addEventListener("pointermove", (e) => {
      pointerToNDC(e);
      const hovering = isPointerOnScreen();
      if (hovering !== isHovering) {
        isHovering = hovering;
        container.style.cursor = hovering ? "pointer" : "";
      }
    });

    container.addEventListener("pointerleave", () => {
      isHovering = false;
      container.style.cursor = "";
    });
  }

  // ---- Animation loop -----------------------------------------------
  const clock = new THREE.Clock();
  let rafId = null;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    const cursorVisible = elapsed % 1 < 0.5;
    drawScreen(cursorVisible, elapsed);

    rig.rotation.y += (targetRotY - rig.rotation.y) * 0.04;
    rig.rotation.x += (targetRotX - rig.rotation.x) * 0.04;
    rig.rotation.z = Math.sin(elapsed * 0.4) * 0.008;
    rig.position.y = Math.sin(elapsed * 0.6) * 0.03;

    const targetGlowOpacity = isHovering ? 0.85 : 0.55;
    glow.material.opacity +=
      (targetGlowOpacity - glow.material.opacity) * 0.08;

    renderer.render(scene, camera);
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  if (prefersReducedMotion) {
    renderer.render(scene, camera);
  } else {
    animate();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else if (rafId === null) {
        clock.getDelta();
        animate();
      }
    });
  }
}
