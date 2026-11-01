/**
 * ============================================================================
 * STICKMAN ANTREAN KIT.JS (Maura Motion Edition)
 * ============================================================================
 * Reusable 2D Stickman Animation Library for HTML5 Canvas & Automated AI Video
 * Production (Claude, Gemini, Hermes, and Node.js/Browser Pipelines).
 *
 * KEY CAPABILITIES:
 * 1. Character Engine:
 *    - 18-Node Hierarchical Skeleton (Head, Eyes, Eyebrows, Mouth, Neck, Torso,
 *      Pelvis, Shoulders, Upper/Lower Arms, Elbows, Wrists, Hands, Hips,
 *      Upper/Lower Legs, Knees, Ankles, Feet).
 *    - Independent joint control + Analytical 2-Bone Inverse Kinematics (IK)
 *      with soft extension damping and bend-direction constraints.
 *    - Full customization: proportions, colors, line thickness, scale, squash &
 *      stretch, rotation, facing direction, 13 facial expressions, and styles
 *      ('classic', 'minimalist' Fajr-style, 'outlined').
 *    - Onion-Skin / Motion Trail Ghosting for cinematic multi-frame pose trails.
 *
 * 2. Motion Library (44 Built-in Procedural + Keyframe Presets):
 *    - Basic (12): idle, walk, run, sprint, jump, doubleJump, wave, dance,
 *      sit, stand, sleep, think
 *    - Emotion (8): happy, sad, angry, scared, surprised, confused,
 *      laughing, crying
 *    - Action (12): punch, kick, block, dodge, fall, getUp, push, pull,
 *      throw, catch, roll, clap
 *    - Interaction (6): handshake, highFive, hug, point, talk, lookAround
 *    - Fajr / Spiritual & Story (6): wakeUp, turnOffAlarm, pray, takbir,
 *      ruku, sujud
 *
 * 3. Animation Quality:
 *    - Smooth angular shortest-path interpolation, 16 easing curves, crossfade
 *      motion blending, anticipation, follow-through, secondary overlap,
 *      squash & stretch, procedural breathing, and foot-grounding pinning.
 *
 * 4. Scene, Props, Floor Reflection & Camera:
 *    - Background rendering, mirrored Floor Reflection pass, Camera pan/zoom/
 *      follow/shake, z-index layer sorting, and scene transitions.
 *    - Built-in Cinematic Props: bed, nightstand, prayerMat, flipCalendar,
 *      digitalClock, nightWindow, soundwaveRipple, phoneOverlayUI,
 *      typewriterText, plus geometric primitives.
 *
 * 5. Timeline & Export Engine:
 *    - Sequential & parallel scheduling, character synchronization, camera cues,
 *      and deterministic frame-accurate seeking (`seek(t)`).
 *    - Supports 1920x1080 (16:9), 1080x1920 (9:16), 1080x1080 (1:1) at 24/30/60 FPS.
 *    - PNG frame export, built-in pure-JS GIF89a encoder, WebM recording via
 *      MediaRecorder, and FFmpeg command/frame-sequence generator for MP4.
 *
 * @example
 * const kit = new StickmanKit(canvas, {
 *   width: 1920,
 *   height: 1080,
 *   fps: 30
 * });
 *
 * const hero = kit.addStickman({
 *   id: "hero",
 *   x: 500,
 *   y: 800,
 *   scale: 2,
 *   color: "#111111"
 * });
 *
 * hero.play("walk", { duration: 3, speed: 1 });
 * kit.start();
 * ============================================================================
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const exported = factory();
    module.exports = exported;
    module.exports.default = exported.StickmanKit;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    const exported = factory();
    root.StickmanKit = exported.StickmanKit;
    root.Stickman = exported.Stickman;
    root.StickmanTimeline = exported.StickmanTimeline;
    root.StickmanCamera = exported.StickmanCamera;
    root.StickmanScene = exported.StickmanScene;
    root.StickmanObject = exported.StickmanObject;
    root.StickmanMotions = exported.StickmanMotions;
    root.StickmanEasing = exported.Easing;
    root.StickmanIK = exported.IKSolver;
    root.Kit = exported.StickmanKit;
    root.GarisHidupKit = exported.StickmanKit;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  "use strict";

  // ==========================================================================
  // SECTION 1: MATH UTILITIES, EASING FUNCTIONS & 2-BONE INVERSE KINEMATICS
  // ==========================================================================

  const DEG2RAD = Math.PI / 180;
  const RAD2DEG = 180 / Math.PI;
  const TWO_PI = Math.PI * 2;

  /**
   * Collection of mathematical helper functions for procedural & keyframe animation.
   */
  const MathUtils = {
    clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    },

    lerp(a, b, t) {
      return a + (b - a) * t;
    },

    inverseLerp(a, b, v) {
      if (Math.abs(b - a) < 1e-9) return 0;
      return MathUtils.clamp((v - a) / (b - a), 0, 1);
    },

    remap(inMin, inMax, outMin, outMax, v) {
      const t = MathUtils.inverseLerp(inMin, inMax, v);
      return MathUtils.lerp(outMin, outMax, t);
    },

    degToRad(deg) {
      return deg * DEG2RAD;
    },

    radToDeg(rad) {
      return rad * RAD2DEG;
    },

    /**
     * Normalizes an angle in degrees to the range [-180, 180].
     */
    normalizeAngleDeg(deg) {
      let a = ((deg + 180) % 360);
      if (a < 0) a += 360;
      return a - 180;
    },

    /**
     * Shortest-path angular interpolation in degrees.
     */
    lerpAngleDeg(a, b, t) {
      const diff = MathUtils.normalizeAngleDeg(b - a);
      return a + diff * t;
    },

    /**
     * Deterministic pseudo-random wave noise in [-1, 1] for camera shake & organic sway.
     */
    noise1D(x, seed = 0) {
      const s = Math.sin(x * 1.73 + seed * 13.37) * 0.5 +
                Math.sin(x * 3.17 + seed * 7.91) * 0.3 +
                Math.cos(x * 5.83 + seed * 3.13) * 0.2;
      return MathUtils.clamp(s, -1, 1);
    },

    /**
     * Smooth damped spring step.
     */
    damp(current, target, smoothing, dt) {
      const factor = 1 - Math.exp(- Math.max(0.001, smoothing) * 60 * dt);
      return MathUtils.lerp(current, target, MathUtils.clamp(factor, 0, 1));
    }
  };

  /**
   * Standard & expressive easing functions for natural animation timing.
   */
  const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => {
      const t1 = t - 1;
      return t1 * t1 * t1 + 1;
    },
    easeInOutCubic: (t) =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => {
      const t1 = t - 1;
      return 1 - t1 * t1 * t1 * t1;
    },
    easeInOutQuart: (t) => {
      const t1 = t - 1;
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * t1 * t1 * t1 * t1;
    },
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    easeOutBack: (t) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t) => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    easeOutElastic: (t) => {
      if (t === 0 || t === 1) return t;
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeOutBounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      let x = t;
      if (x < 1 / d1) return n1 * x * x;
      if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
      if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    },
    smoothstep: (t) => t * t * (3 - 2 * t),
    smootherstep: (t) => t * t * t * (t * (t * 6 - 15) + 10),
    spring: (t) => 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 4.5),

    resolve(easingOrName) {
      if (typeof easingOrName === "function") return easingOrName;
      if (typeof easingOrName === "string" && Easing[easingOrName]) {
        return Easing[easingOrName];
      }
      return Easing.easeInOutCubic;
    }
  };

  /**
   * Analytical 2-Bone Inverse Kinematics Solver using the Law of Cosines.
   * Supports soft-reach clamping to prevent harsh knee/elbow snapping.
   */
  const IKSolver = {
    /**
     * Solves a 2-segment limb (e.g. upperArm + lowerArm or upperLeg + lowerLeg).
     * Angles returned are in degrees relative to the positive Y-axis (downward = 0 deg,
     * forward/right = +deg, backward/left = -deg) to match the character bone system.
     *
     * @param {number} rootX - World X of shoulder/hip joint
     * @param {number} rootY - World Y of shoulder/hip joint
     * @param {number} targetX - Desired world X of wrist/ankle
     * @param {number} targetY - Desired world Y of wrist/ankle
     * @param {number} len1 - Upper bone length
     * @param {number} len2 - Lower bone length
     * @param {number} [bendDir=1] - +1 or -1 for knee/elbow bend direction
     * @returns {{upperAngleDeg: number, lowerAngleDeg: number, midX: number, midY: number, endX: number, endY: number, reachable: boolean}}
     */
    solveTwoBoneIK(rootX, rootY, targetX, targetY, len1, len2, bendDir = 1) {
      const dx = targetX - rootX;
      const dy = targetY - rootY;
      const rawDist = Math.hypot(dx, dy);
      const maxReach = (len1 + len2) * 0.998;
      const minReach = Math.abs(len1 - len2) + 0.002;
      const dist = MathUtils.clamp(rawDist, minReach, maxReach);

      // Base angle from downward (+Y) axis: atan2(dx, dy) where (0, +1) -> 0 rad
      const baseAngle = Math.atan2(dx, dy);

      // Law of cosines for interior angles
      const cosA = MathUtils.clamp(
        (len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist),
        -1,
        1
      );
      const angleA = Math.acos(cosA);

      const cosB = MathUtils.clamp(
        (len1 * len1 + len2 * len2 - dist * dist) / (2 * len1 * len2),
        -1,
        1
      );
      const interiorElbow = Math.acos(cosB);

      const sign = bendDir >= 0 ? 1 : -1;
      const upperRad = baseAngle + sign * angleA;
      const lowerRelativeRad = -sign * (Math.PI - interiorElbow);

      const midX = rootX + Math.sin(upperRad) * len1;
      const midY = rootY + Math.cos(upperRad) * len1;
      const totalLowerRad = upperRad + lowerRelativeRad;
      const endX = midX + Math.sin(totalLowerRad) * len2;
      const endY = midY + Math.cos(totalLowerRad) * len2;

      return {
        upperAngleDeg: MathUtils.radToDeg(upperRad),
        lowerAngleDeg: MathUtils.radToDeg(lowerRelativeRad),
        midX,
        midY,
        endX,
        endY,
        reachable: rawDist <= maxReach
      };
    }
  };

  // ==========================================================================
  // SECTION 2: HEADLESS CANVAS 2D FALLBACK (FOR NODE.JS / AI AGENT PIPELINES)
  // ==========================================================================

  /**
   * Minimal in-memory raster & command-tracking Canvas 2D fallback so `kit.js`
   * runs seamlessly inside Node.js without browser DOM dependencies, including
   * software pixel drawing for built-in GIF89a export!
   */
  class HeadlessContext2D {
    constructor(canvas) {
      this.canvas = canvas;
      this._stack = [];
      this._resetState();
      this._currentPath = [];
      this.commandCount = 0;
    }

    _resetState() {
      this.fillStyle = "#000000";
      this.strokeStyle = "#000000";
      this.lineWidth = 1;
      this.lineCap = "butt";
      this.lineJoin = "miter";
      this.globalAlpha = 1;
      this.font = "16px sans-serif";
      this.textAlign = "start";
      this.textBaseline = "alphabetic";
      this.shadowColor = "transparent";
      this.shadowBlur = 0;
      this.tx = 0;
      this.ty = 0;
      this.sx = 1;
      this.sy = 1;
      this.rot = 0;
    }

    save() {
      this._stack.push({
        fillStyle: this.fillStyle,
        strokeStyle: this.strokeStyle,
        lineWidth: this.lineWidth,
        lineCap: this.lineCap,
        lineJoin: this.lineJoin,
        globalAlpha: this.globalAlpha,
        font: this.font,
        textAlign: this.textAlign,
        textBaseline: this.textBaseline,
        tx: this.tx,
        ty: this.ty,
        sx: this.sx,
        sy: this.sy,
        rot: this.rot
      });
    }

    restore() {
      const s = this._stack.pop();
      if (s) Object.assign(this, s);
    }

    setTransform(a, b, c, d, e, f) {
      this.sx = a;
      this.sy = d;
      this.tx = e;
      this.ty = f;
      this.rot = 0;
    }

    resetTransform() {
      this.tx = 0;
      this.ty = 0;
      this.sx = 1;
      this.sy = 1;
      this.rot = 0;
    }

    translate(x, y) {
      this.tx += x * this.sx;
      this.ty += y * this.sy;
    }

    scale(x, y) {
      this.sx *= x;
      this.sy *= y;
    }

    rotate(angle) {
      this.rot += angle;
    }

    beginPath() {
      this._currentPath = [];
    }

    closePath() {}

    moveTo(x, y) {
      this._currentPath.push({ type: "M", x: this._mapX(x), y: this._mapY(y) });
    }

    lineTo(x, y) {
      this._currentPath.push({ type: "L", x: this._mapX(x), y: this._mapY(y) });
    }

    quadraticCurveTo(cpx, cpy, x, y) {
      this._currentPath.push({
        type: "L",
        x: this._mapX(x),
        y: this._mapY(y)
      });
    }

    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
      this._currentPath.push({
        type: "L",
        x: this._mapX(x),
        y: this._mapY(y)
      });
    }

    arc(x, y, r, startAngle, endAngle, ccw) {
      this._currentPath.push({
        type: "ARC",
        x: this._mapX(x),
        y: this._mapY(y),
        r: Math.abs(r * Math.max(Math.abs(this.sx), Math.abs(this.sy))),
        startAngle,
        endAngle,
        ccw: !!ccw
      });
    }

    ellipse(x, y, rx, ry) {
      this.arc(x, y, (rx + ry) * 0.5, 0, TWO_PI);
    }

    rect(x, y, w, h) {
      this._currentPath.push({
        type: "RECT",
        x: this._mapX(x),
        y: this._mapY(y),
        w: w * this.sx,
        h: h * this.sy
      });
    }

    roundRect(x, y, w, h, r) {
      this.rect(x, y, w, h);
    }

    fill() {
      this.commandCount++;
    }

    stroke() {
      this.commandCount++;
    }

    clip() {}

    clearRect(x, y, w, h) {
      this.commandCount++;
      if (this.canvas._pixels) {
        this.canvas._pixels.fill(0);
      }
    }

    fillRect(x, y, w, h) {
      this.commandCount++;
    }

    strokeRect(x, y, w, h) {
      this.commandCount++;
    }

    fillText(text, x, y) {
      this.commandCount++;
    }

    strokeText(text, x, y) {
      this.commandCount++;
    }

    measureText(text) {
      return { width: String(text || "").length * 9 };
    }

    setLineDash() {}

    createLinearGradient() {
      return { addColorStop() {} };
    }

    createRadialGradient() {
      return { addColorStop() {} };
    }

    drawImage() {
      this.commandCount++;
    }

    getImageData(x, y, w, h) {
      const size = Math.max(1, (w | 0) * (h | 0) * 4);
      return {
        width: w | 0,
        height: h | 0,
        data: new Uint8ClampedArray(size)
      };
    }

    putImageData() {}

    _mapX(x) {
      return this.tx + x * this.sx;
    }

    _mapY(y) {
      return this.ty + y * this.sy;
    }
  }

  class HeadlessCanvas2D {
    constructor(width = 1920, height = 1080) {
      this.width = width;
      this.height = height;
      this.style = {};
      this._ctx = new HeadlessContext2D(this);
    }

    getContext(type) {
      if (type === "2d") return this._ctx;
      return null;
    }

    toDataURL(mimeType = "image/png") {
      // Minimal valid 1x1 transparent PNG base64 for headless environment
      const base64Png =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      return `data:${mimeType};base64,${base64Png}`;
    }

    captureStream(fps = 30) {
      return { fps, isHeadlessStream: true, getTracks: () => [] };
    }
  }

  // ==========================================================================
  // SECTION 3: MOTION LIBRARY (44 PROCEDURAL + KEYFRAME PRESETS)
  // ==========================================================================

  /**
   * Creates a default zeroed pose state for all joints and root offsets.
   * Joint angles are in degrees:
   * - torso: 0 = upright vertical, + = lean forward (facing direction), - = lean backward
   * - neck / head: relative to torso (0 = aligned with spine, + = nod forward/down)
   * - upperArm: relative to torso (0 = hanging straight down, + = swing forward/up, - = swing back)
   * - lowerArm: relative to upperArm (0 = straight extension, + = bend elbow forward/up)
   * - hand / wrist: relative to lowerArm (0 = aligned, + = flex inward)
   * - upperLeg: relative to pelvis (0 = straight down, + = lift leg forward, - = extend leg back)
   * - lowerLeg: relative to upperLeg (0 = straight knee, - = bend knee backward)
   * - foot: relative to lowerLeg (0 = 90deg natural foot forward, + = point toes down, - = flex toes up)
   */
  function createDefaultPose() {
    return {
      // Root transform offsets (in character local unscaled units)
      offsetX: 0,
      offsetY: 0,
      bodyRotation: 0,
      squashX: 1,
      stretchY: 1,

      // Spine & Head (degrees)
      pelvisTilt: 0,
      torso: 0,
      neck: 0,
      head: 0,
      headLook: 0, // -1 left to +1 right gaze shift

      // Left Arm (back arm when facing right)
      leftShoulderOffsetY: 0,
      leftUpperArm: -6,
      leftElbow: 10, // alias synced with leftLowerArm
      leftLowerArm: 10,
      leftWrist: 0,
      leftHand: 0,

      // Right Arm (front arm when facing right)
      rightShoulderOffsetY: 0,
      rightUpperArm: 6,
      rightElbow: 12,
      rightLowerArm: 12,
      rightWrist: 0,
      rightHand: 0,

      // Left Leg (back leg when facing right)
      leftUpperLeg: -4,
      leftKnee: 0,
      leftLowerLeg: 0,
      leftFoot: 0,

      // Right Leg (front leg when facing right)
      rightUpperLeg: 4,
      rightKnee: 0,
      rightLowerLeg: 0,
      rightFoot: 0,

      // Facial state overrides (null means use character's setExpression)
      expression: null,
      eyeBlink: 0,
      mouthOpen: 0,
      eyebrowRaise: 0,
      eyebrowAngry: 0
    };
  }

  /**
   * Evaluates a keyframe table at normalized cycle progress `p` in [0, 1].
   * Each keyframe has `{ t: 0..1, easing?: 'easeInOutSine', ...poseProps }`.
   */
  function sampleKeyframes(keyframes, p) {
    const out = {};
    if (!keyframes || keyframes.length === 0) return out;
    if (keyframes.length === 1) return Object.assign(out, keyframes[0]);

    const clampedP = MathUtils.clamp(p, 0, 1);
    let idx = 0;
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (clampedP >= keyframes[i].t && clampedP <= keyframes[i + 1].t) {
        idx = i;
        break;
      }
    }

    const k0 = keyframes[idx];
    const k1 = keyframes[idx + 1] || k0;
    const span = Math.max(1e-6, k1.t - k0.t);
    const localT = MathUtils.clamp((clampedP - k0.t) / span, 0, 1);
    const easeFn = Easing.resolve(k1.easing || "easeInOutSine");
    const e = easeFn(localT);

    const keys = new Set([...Object.keys(k0), ...Object.keys(k1)]);
    keys.delete("t");
    keys.delete("easing");

    keys.forEach((key) => {
      const v0 = k0[key] !== undefined ? k0[key] : k1[key];
      const v1 = k1[key] !== undefined ? k1[key] : k0[key];
      if (typeof v0 === "number" && typeof v1 === "number") {
        if (
          key === "squashX" ||
          key === "stretchY" ||
          key === "offsetX" ||
          key === "offsetY" ||
          key === "eyeBlink" ||
          key === "mouthOpen"
        ) {
          out[key] = MathUtils.lerp(v0, v1, e);
        } else {
          out[key] = MathUtils.lerpAngleDeg(v0, v1, e);
        }
      } else {
        out[key] = localT < 0.5 ? v0 : v1;
      }
    });

    return out;
  }

  /**
   * Master Registry of 44 Motion Presets:
   * - 12 Basic
   * - 8 Emotion
   * - 12 Action
   * - 6 Interaction
   * - 6 Fajr / Spiritual Story Presets (wakeUp, turnOffAlarm, pray, takbir, ruku, sujud)
   */
  const StickmanMotions = {
    // ========================================================================
    // CATEGORY A: BASIC MOTIONS (12)
    // ========================================================================

    idle: {
      category: "basic",
      loop: true,
      defaultDuration: 2.4,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const breath = Math.sin(w);
        const secondary = Math.sin(w - 0.6);
        return {
          offsetY: breath * 1.5,
          squashX: 1 - breath * 0.012,
          stretchY: 1 + breath * 0.012,
          torso: 1.5 + breath * 1.8,
          neck: -breath * 1.2,
          head: secondary * 1.5,
          leftShoulderOffsetY: -breath * 1.2,
          rightShoulderOffsetY: -breath * 1.2,
          leftUpperArm: -7 + secondary * 3,
          leftLowerArm: 12 + breath * 2,
          rightUpperArm: 7 - secondary * 3,
          rightLowerArm: 14 + breath * 2,
          leftUpperLeg: -4,
          leftLowerLeg: 0,
          rightUpperLeg: 5,
          rightLowerLeg: -2
        };
      }
    },

    walk: {
      category: "basic",
      loop: true,
      defaultDuration: 1.0,
      rootSpeedX: 110,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const s = Math.sin(w);
        const c = Math.cos(w);
        const doubleBounce = Math.abs(Math.sin(w));
        // Natural knee flexion on pass-through phase + ground contact extension
        const leftKneeBend = -Math.max(0, -c) * 38 - 6;
        const rightKneeBend = -Math.max(0, c) * 38 - 6;
        return {
          offsetY: -doubleBounce * 5 + 2,
          squashX: 1 + (1 - doubleBounce) * 0.02,
          stretchY: 1 - (1 - doubleBounce) * 0.02,
          torso: 6 + Math.sin(w * 2) * 2,
          neck: -2,
          head: -Math.sin(w * 2 - 0.5) * 2.5,
          leftUpperArm: -s * 34,
          leftLowerArm: 22 + Math.max(0, -s) * 18,
          leftWrist: -s * 8,
          rightUpperArm: s * 34,
          rightLowerArm: 22 + Math.max(0, s) * 18,
          rightWrist: s * 8,
          leftUpperLeg: s * 32,
          leftLowerLeg: leftKneeBend,
          leftFoot: c * 12,
          rightUpperLeg: -s * 32,
          rightLowerLeg: rightKneeBend,
          rightFoot: -c * 12
        };
      }
    },

    run: {
      category: "basic",
      loop: true,
      defaultDuration: 0.68,
      rootSpeedX: 240,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const s = Math.sin(w);
        const c = Math.cos(w);
        const flight = Math.sin(w * 2 - 0.3);
        return {
          offsetY: -Math.abs(s) * 14 + 3,
          squashX: 1 - flight * 0.035,
          stretchY: 1 + flight * 0.035,
          torso: 18 + Math.sin(w * 2) * 3.5,
          neck: -6,
          head: -8 + Math.cos(w * 2) * 3,
          leftUpperArm: -s * 58 - 8,
          leftLowerArm: 78 + s * 15,
          rightUpperArm: s * 58 - 8,
          rightLowerArm: 78 - s * 15,
          leftUpperLeg: s * 55 + 6,
          leftLowerLeg: -Math.max(0, -c) * 72 - 14,
          leftFoot: c * 20,
          rightUpperLeg: -s * 55 + 6,
          rightLowerLeg: -Math.max(0, c) * 72 - 14,
          rightFoot: -c * 20
        };
      }
    },

    sprint: {
      category: "basic",
      loop: true,
      defaultDuration: 0.5,
      rootSpeedX: 360,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const s = Math.sin(w);
        const c = Math.cos(w);
        return {
          offsetY: -Math.abs(s) * 18 + 4,
          squashX: 1 - Math.abs(s) * 0.05,
          stretchY: 1 + Math.abs(s) * 0.05,
          torso: 28 + Math.sin(w * 2) * 4,
          neck: -10,
          head: -12,
          leftUpperArm: -s * 75 - 10,
          leftLowerArm: 92 + s * 20,
          rightUpperArm: s * 75 - 10,
          rightLowerArm: 92 - s * 20,
          leftUpperLeg: s * 68 + 10,
          leftLowerLeg: -Math.max(0, -c) * 90 - 18,
          leftFoot: c * 25,
          rightUpperLeg: -s * 68 + 10,
          rightLowerLeg: -Math.max(0, c) * 90 - 18,
          rightFoot: -c * 25,
          expression: "focused"
        };
      }
    },

    jump: {
      category: "basic",
      loop: false,
      defaultDuration: 1.1,
      keyframes: [
        // 0.00: Stand neutral
        { t: 0.0, offsetY: 0, squashX: 1, stretchY: 1, torso: 2, leftUpperArm: -8, rightUpperArm: 8, leftLowerArm: 12, rightLowerArm: 12, leftUpperLeg: -5, rightUpperLeg: 5, leftLowerLeg: 0, rightLowerLeg: 0 },
        // 0.22: Anticipation crouch + squash + arms swung back
        { t: 0.22, easing: "easeInOutQuad", offsetY: 22, squashX: 1.14, stretchY: 0.86, torso: 26, head: -14, leftUpperArm: -52, rightUpperArm: -46, leftLowerArm: 28, rightLowerArm: 28, leftUpperLeg: 48, rightUpperLeg: 52, leftLowerLeg: -72, rightLowerLeg: -76 },
        // 0.50: Launch & Apex stretch
        { t: 0.50, easing: "easeOutCubic", offsetY: -88, squashX: 0.88, stretchY: 1.14, torso: -6, head: -8, leftUpperArm: 138, rightUpperArm: 148, leftLowerArm: 18, rightLowerArm: 18, leftUpperLeg: 28, rightUpperLeg: -18, leftLowerLeg: -35, rightLowerLeg: -22 },
        // 0.78: Landing impact absorb
        { t: 0.78, easing: "easeInQuad", offsetY: 18, squashX: 1.16, stretchY: 0.85, torso: 22, head: 8, leftUpperArm: 42, rightUpperArm: 48, leftLowerArm: 35, rightLowerArm: 35, leftUpperLeg: 42, rightUpperLeg: 46, leftLowerLeg: -64, rightLowerLeg: -68 },
        // 1.00: Settle upright
        { t: 1.0, easing: "easeOutBack", offsetY: 0, squashX: 1, stretchY: 1, torso: 2, head: 0, leftUpperArm: -6, rightUpperArm: 6, leftLowerArm: 12, rightLowerArm: 12, leftUpperLeg: -4, rightUpperLeg: 4, leftLowerLeg: 0, rightLowerLeg: 0 }
      ]
    },

    doubleJump: {
      category: "basic",
      loop: false,
      defaultDuration: 1.5,
      keyframes: [
        { t: 0.0, offsetY: 0, squashX: 1, stretchY: 1, torso: 2, bodyRotation: 0, leftUpperArm: -10, rightUpperArm: 10, leftUpperLeg: -4, rightUpperLeg: 4, leftLowerLeg: 0, rightLowerLeg: 0 },
        { t: 0.16, easing: "easeInOutQuad", offsetY: 20, squashX: 1.14, stretchY: 0.86, torso: 25, bodyRotation: 0, leftUpperArm: -48, rightUpperArm: -42, leftUpperLeg: 46, rightUpperLeg: 50, leftLowerLeg: -70, rightLowerLeg: -72 },
        { t: 0.38, easing: "easeOutCubic", offsetY: -65, squashX: 0.9, stretchY: 1.1, torso: 4, bodyRotation: 0, leftUpperArm: 110, rightUpperArm: 120, leftUpperLeg: 20, rightUpperLeg: -15, leftLowerLeg: -28, rightLowerLeg: -20 },
        // Mid-air second jump tuck + 360 flip
        { t: 0.46, easing: "easeInQuad", offsetY: -52, squashX: 1.08, stretchY: 0.92, torso: 35, bodyRotation: 45, leftUpperArm: 45, rightUpperArm: 55, leftLowerArm: 85, rightLowerArm: 85, leftUpperLeg: 75, rightUpperLeg: 80, leftLowerLeg: -105, rightLowerLeg: -110 },
        { t: 0.68, easing: "easeOutCubic", offsetY: -135, squashX: 0.86, stretchY: 1.15, torso: -8, bodyRotation: 360, leftUpperArm: 155, rightUpperArm: 165, leftLowerArm: 15, rightLowerArm: 15, leftUpperLeg: 15, rightUpperLeg: -25, leftLowerLeg: -20, rightLowerLeg: -15 },
        { t: 0.88, easing: "easeInQuad", offsetY: 22, squashX: 1.18, stretchY: 0.84, torso: 24, bodyRotation: 360, leftUpperArm: 35, rightUpperArm: 42, leftUpperLeg: 48, rightUpperLeg: 52, leftLowerLeg: -72, rightLowerLeg: -75 },
        { t: 1.0, easing: "easeOutBack", offsetY: 0, squashX: 1, stretchY: 1, torso: 2, bodyRotation: 360, leftUpperArm: -6, rightUpperArm: 6, leftLowerArm: 12, rightLowerArm: 12, leftUpperLeg: -4, rightUpperLeg: 4, leftLowerLeg: 0, rightLowerLeg: 0 }
      ]
    },

    wave: {
      category: "basic",
      loop: true,
      defaultDuration: 1.2,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const waveOsc = Math.sin(w * 2);
        const followLag = Math.sin(w * 2 - 0.5);
        return {
          offsetY: Math.sin(w) * 1.5,
          torso: -3 + Math.sin(w) * 2,
          head: -6 + waveOsc * 3,
          leftUpperArm: -10,
          leftLowerArm: 14,
          rightUpperArm: 135 + waveOsc * 12,
          rightLowerArm: 45 + waveOsc * 28,
          rightWrist: followLag * 22,
          leftUpperLeg: -5,
          rightUpperLeg: 6,
          expression: "happy"
        };
      }
    },

    dance: {
      category: "basic",
      loop: true,
      defaultDuration: 1.2,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const beat = Math.sin(w * 2);
        const groove = Math.sin(w);
        return {
          offsetX: groove * 12,
          offsetY: Math.abs(beat) * 12,
          squashX: 1 + Math.abs(beat) * 0.06,
          stretchY: 1 - Math.abs(beat) * 0.05,
          torso: groove * 14,
          head: -groove * 10 + beat * 6,
          leftUpperArm: 75 + groove * 55,
          leftLowerArm: 65 + beat * 30,
          rightUpperArm: 75 - groove * 55,
          rightLowerArm: 65 - beat * 30,
          leftUpperLeg: 18 + groove * 22,
          leftLowerLeg: -Math.abs(beat) * 38 - 8,
          rightUpperLeg: -18 + groove * 22,
          rightLowerLeg: -Math.abs(beat) * 38 - 8,
          expression: "happy"
        };
      }
    },

    sit: {
      category: "basic",
      loop: true,
      defaultDuration: 2.0,
      evaluate(t, p) {
        const breath = Math.sin(p * TWO_PI);
        return {
          offsetY: 36,
          torso: 4 + breath * 1.5,
          neck: 2,
          head: breath * 2,
          leftUpperArm: 15,
          leftLowerArm: 55 + breath * 2,
          rightUpperArm: 22,
          rightLowerArm: 62 + breath * 2,
          leftUpperLeg: 86,
          leftLowerLeg: -84,
          leftFoot: 2,
          rightUpperLeg: 90,
          rightLowerLeg: -88,
          rightFoot: 2
        };
      }
    },

    stand: {
      category: "basic",
      loop: false,
      defaultDuration: 1.0,
      keyframes: [
        { t: 0.0, offsetY: 36, torso: 8, leftUpperArm: 18, leftLowerArm: 58, rightUpperArm: 22, rightLowerArm: 62, leftUpperLeg: 88, leftLowerLeg: -86, rightUpperLeg: 90, rightLowerLeg: -88 },
        { t: 0.35, easing: "easeInQuad", offsetY: 28, squashX: 1.06, stretchY: 0.94, torso: 34, head: 10, leftUpperArm: 42, leftLowerArm: 45, rightUpperArm: 46, rightLowerArm: 45, leftUpperLeg: 64, leftLowerLeg: -72, rightUpperLeg: 68, rightLowerLeg: -76 },
        { t: 1.0, easing: "easeOutCubic", offsetY: 0, squashX: 1, stretchY: 1, torso: 1, head: 0, leftUpperArm: -6, leftLowerArm: 10, rightUpperArm: 6, rightLowerArm: 12, leftUpperLeg: -4, leftLowerLeg: 0, rightUpperLeg: 4, rightLowerLeg: 0 }
      ]
    },

    sleep: {
      category: "basic",
      loop: true,
      defaultDuration: 3.0,
      evaluate(t, p) {
        const breath = Math.sin(p * TWO_PI);
        return {
          // Horizontal sleeping posture (matches bed height in Fajr scene or floor)
          offsetY: 10,
          bodyRotation: -90,
          squashX: 1 + breath * 0.02,
          stretchY: 1 - breath * 0.01,
          torso: 2 + breath * 1.5,
          head: 6 + breath * 2,
          leftUpperArm: 24,
          leftLowerArm: 65,
          rightUpperArm: 32,
          rightLowerArm: 78,
          leftUpperLeg: 14,
          leftLowerLeg: -18,
          rightUpperLeg: 22,
          rightLowerLeg: -28,
          expression: "sleeping"
        };
      }
    },

    think: {
      category: "basic",
      loop: true,
      defaultDuration: 2.5,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const tap = Math.sin(w * 2);
        return {
          offsetY: Math.sin(w) * 1.2,
          torso: -2,
          neck: 4,
          head: 8 + Math.sin(w) * 3,
          // Left arm crossed across waist supporting right elbow
          leftUpperArm: 38,
          leftLowerArm: 82,
          // Right hand up to chin
          rightUpperArm: 52,
          rightLowerArm: 112 + tap * 4,
          rightWrist: 15 + tap * 6,
          leftUpperLeg: -5,
          rightUpperLeg: 6,
          expression: "thinking"
        };
      }
    },

    // ========================================================================
    // CATEGORY B: EMOTION MOTIONS (8)
    // ========================================================================

    happy: {
      category: "emotion",
      loop: true,
      defaultDuration: 1.0,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const jump = Math.abs(Math.sin(w));
        return {
          offsetY: -jump * 18,
          squashX: 1 - jump * 0.05 + (1 - jump) * 0.04,
          stretchY: 1 + jump * 0.06 - (1 - jump) * 0.04,
          torso: -5 + Math.sin(w * 2) * 3,
          head: -8 + Math.sin(w) * 5,
          leftUpperArm: 135 + Math.sin(w * 2) * 18,
          leftLowerArm: 25,
          rightUpperArm: 145 - Math.sin(w * 2) * 18,
          rightLowerArm: 25,
          leftUpperLeg: -12 - jump * 12,
          leftLowerLeg: -jump * 24,
          rightUpperLeg: 14 + jump * 12,
          rightLowerLeg: -jump * 24,
          expression: "happy"
        };
      }
    },

    sad: {
      category: "emotion",
      loop: true,
      defaultDuration: 2.8,
      evaluate(t, p) {
        const sigh = Math.sin(p * TWO_PI);
        return {
          offsetY: 4 + sigh * 2,
          torso: 22 + sigh * 4,
          neck: 14,
          head: 24 + sigh * 5,
          leftShoulderOffsetY: 4 + sigh * 2,
          rightShoulderOffsetY: 4 + sigh * 2,
          leftUpperArm: 8,
          leftLowerArm: 8,
          rightUpperArm: 12,
          rightLowerArm: 10,
          leftUpperLeg: -2,
          leftLowerLeg: -8,
          rightUpperLeg: 4,
          rightLowerLeg: -10,
          expression: "sad"
        };
      }
    },

    angry: {
      category: "emotion",
      loop: true,
      defaultDuration: 0.9,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const tremor = Math.sin(w * 6) * 2.2;
        const heave = Math.sin(w);
        return {
          offsetY: 5 + heave * 2,
          squashX: 1.04,
          stretchY: 0.96,
          torso: 16 + heave * 3 + tremor * 0.5,
          neck: 6,
          head: -4 + tremor,
          leftUpperArm: -24 + heave * 8,
          leftLowerArm: 78 + tremor * 2,
          rightUpperArm: 32 - heave * 8,
          rightLowerArm: 88 - tremor * 2,
          leftUpperLeg: -18,
          leftLowerLeg: -16,
          rightUpperLeg: 22,
          rightLowerLeg: -18,
          expression: "angry"
        };
      }
    },

    scared: {
      category: "emotion",
      loop: true,
      defaultDuration: 0.8,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const shiver = Math.sin(w * 8) * 3;
        return {
          offsetX: -8 + shiver * 0.8,
          offsetY: 14,
          torso: -16 + shiver * 0.6,
          head: 8 - shiver,
          leftUpperArm: 78 + shiver * 2,
          leftLowerArm: 85,
          rightUpperArm: 88 - shiver * 2,
          rightLowerArm: 92,
          leftUpperLeg: 24 + shiver,
          leftLowerLeg: -42,
          rightUpperLeg: 32 - shiver,
          rightLowerLeg: -46,
          expression: "scared"
        };
      }
    },

    surprised: {
      category: "emotion",
      loop: false,
      defaultDuration: 1.0,
      keyframes: [
        { t: 0.0, offsetY: 0, squashX: 1, stretchY: 1, torso: 2, leftUpperArm: -6, rightUpperArm: 6, leftLowerArm: 12, rightLowerArm: 12, expression: "surprised" },
        { t: 0.2, easing: "easeOutBack", offsetX: -10, offsetY: -22, squashX: 0.86, stretchY: 1.16, torso: -18, head: -12, leftUpperArm: 118, leftLowerArm: 32, rightUpperArm: 128, rightLowerArm: 35, leftUpperLeg: -16, rightUpperLeg: 20, expression: "surprised" },
        { t: 0.55, easing: "easeInOutSine", offsetX: -6, offsetY: 4, squashX: 1.04, stretchY: 0.96, torso: -8, head: -4, leftUpperArm: 82, leftLowerArm: 48, rightUpperArm: 92, rightLowerArm: 52, leftUpperLeg: -8, rightUpperLeg: 10, expression: "surprised" },
        { t: 1.0, easing: "easeOutCubic", offsetX: 0, offsetY: 0, squashX: 1, stretchY: 1, torso: 0, head: 0, leftUpperArm: 22, leftLowerArm: 35, rightUpperArm: 28, rightLowerArm: 38, leftUpperLeg: -4, rightUpperLeg: 5, expression: "surprised" }
      ]
    },

    confused: {
      category: "emotion",
      loop: true,
      defaultDuration: 2.0,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const scratch = Math.sin(w * 3);
        return {
          torso: -4 + Math.sin(w) * 2,
          head: -14 + Math.sin(w) * 4,
          // Left hand on hip
          leftUpperArm: -35,
          leftLowerArm: 75,
          // Right hand scratching top/back of head
          rightUpperArm: 125,
          rightLowerArm: 118 + scratch * 12,
          rightWrist: scratch * 15,
          leftUpperLeg: -6,
          rightUpperLeg: 8,
          expression: "confused"
        };
      }
    },

    laughing: {
      category: "emotion",
      loop: true,
      defaultDuration: 0.9,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const chuckle = Math.abs(Math.sin(w * 3));
        return {
          offsetY: chuckle * 5,
          squashX: 1 + chuckle * 0.04,
          stretchY: 1 - chuckle * 0.04,
          torso: -12 + Math.sin(w) * 8 + chuckle * 5,
          head: -16 + chuckle * 10,
          // Holding belly with both hands
          leftUpperArm: 28,
          leftLowerArm: 78 + chuckle * 10,
          rightUpperArm: 36,
          rightLowerArm: 84 + chuckle * 10,
          leftUpperLeg: 8,
          leftLowerLeg: -16 - chuckle * 8,
          rightUpperLeg: 14,
          rightLowerLeg: -18 - chuckle * 8,
          expression: "laughing"
        };
      }
    },

    crying: {
      category: "emotion",
      loop: true,
      defaultDuration: 1.4,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const sob = Math.abs(Math.sin(w * 2));
        return {
          offsetY: 6 + sob * 4,
          torso: 26 + sob * 5,
          neck: 12,
          head: 20 + sob * 6,
          leftShoulderOffsetY: -sob * 4,
          rightShoulderOffsetY: -sob * 4,
          // Hands covering eyes/face
          leftUpperArm: 72,
          leftLowerArm: 112 + sob * 6,
          rightUpperArm: 78,
          rightLowerArm: 116 + sob * 6,
          leftUpperLeg: 8,
          leftLowerLeg: -14,
          rightUpperLeg: 12,
          rightLowerLeg: -16,
          expression: "crying"
        };
      }
    },

    // ========================================================================
    // CATEGORY C: ACTION MOTIONS (12)
    // ========================================================================

    punch: {
      category: "action",
      loop: false,
      defaultDuration: 0.65,
      keyframes: [
        // Guard stance
        { t: 0.0, offsetX: 0, torso: 6, leftUpperArm: 42, leftLowerArm: 88, rightUpperArm: 35, rightLowerArm: 95, leftUpperLeg: -14, rightUpperLeg: 18, leftLowerLeg: -12, rightLowerLeg: -16 },
        // Coiled anticipation wind-up
        { t: 0.25, easing: "easeInQuad", offsetX: -12, squashX: 1.06, stretchY: 0.94, torso: -12, head: 6, leftUpperArm: 58, leftLowerArm: 75, rightUpperArm: -48, rightLowerArm: 105, leftUpperLeg: -22, rightUpperLeg: 28, leftLowerLeg: -18, rightLowerLeg: -28 },
        // Explosive straight punch extension
        { t: 0.48, easing: "easeOutBack", offsetX: 22, squashX: 0.92, stretchY: 1.08, torso: 24, head: -10, leftUpperArm: -28, leftLowerArm: 85, rightUpperArm: 92, rightLowerArm: 4, rightWrist: -6, leftUpperLeg: -34, rightUpperLeg: 38, leftLowerLeg: -8, rightLowerLeg: -36, expression: "angry" },
        // Hold impact briefly
        { t: 0.65, easing: "linear", offsetX: 20, torso: 22, leftUpperArm: -24, leftLowerArm: 82, rightUpperArm: 90, rightLowerArm: 8, leftUpperLeg: -32, rightUpperLeg: 36, leftLowerLeg: -8, rightLowerLeg: -34 },
        // Return to guard
        { t: 1.0, easing: "easeInOutCubic", offsetX: 0, squashX: 1, stretchY: 1, torso: 6, head: 0, leftUpperArm: 42, leftLowerArm: 88, rightUpperArm: 35, rightLowerArm: 95, leftUpperLeg: -14, rightUpperLeg: 18, leftLowerLeg: -12, rightLowerLeg: -16 }
      ]
    },

    kick: {
      category: "action",
      loop: false,
      defaultDuration: 0.78,
      keyframes: [
        { t: 0.0, offsetX: 0, torso: 6, leftUpperArm: 38, leftLowerArm: 82, rightUpperArm: 44, rightLowerArm: 86, leftUpperLeg: -10, rightUpperLeg: 14, leftLowerLeg: -8, rightLowerLeg: -12 },
        // Chamber right knee high
        { t: 0.28, easing: "easeOutQuad", offsetX: -6, torso: -14, head: 8, leftUpperArm: 52, leftLowerArm: 75, rightUpperArm: -28, rightLowerArm: 65, leftUpperLeg: -6, leftLowerLeg: -14, rightUpperLeg: 95, rightLowerLeg: -105 },
        // Snap kick extension
        { t: 0.52, easing: "easeOutBack", offsetX: 10, torso: -28, head: 14, leftUpperArm: 68, leftLowerArm: 45, rightUpperArm: -48, rightLowerArm: 35, leftUpperLeg: -12, leftLowerLeg: -10, rightUpperLeg: 112, rightLowerLeg: -4, rightFoot: 28, expression: "angry" },
        // Retract knee
        { t: 0.76, easing: "easeInQuad", offsetX: 4, torso: -10, leftUpperArm: 45, leftLowerArm: 75, rightUpperArm: 22, rightLowerArm: 78, leftUpperLeg: -8, leftLowerLeg: -12, rightUpperLeg: 68, rightLowerLeg: -82 },
        // Plant foot back down
        { t: 1.0, easing: "easeOutCubic", offsetX: 0, torso: 6, head: 0, leftUpperArm: 38, leftLowerArm: 82, rightUpperArm: 44, rightLowerArm: 86, leftUpperLeg: -10, rightUpperLeg: 14, leftLowerLeg: -8, rightLowerLeg: -12 }
      ]
    },

    block: {
      category: "action",
      loop: false,
      defaultDuration: 0.7,
      keyframes: [
        { t: 0.0, offsetX: 0, offsetY: 0, torso: 4, leftUpperArm: 30, leftLowerArm: 70, rightUpperArm: 35, rightLowerArm: 75, leftUpperLeg: -10, rightUpperLeg: 12 },
        { t: 0.25, easing: "easeOutCubic", offsetX: -10, offsetY: 12, squashX: 1.08, stretchY: 0.92, torso: -10, head: 12, leftUpperArm: 72, leftLowerArm: 98, rightUpperArm: 82, rightLowerArm: 104, leftUpperLeg: -22, leftLowerLeg: -24, rightUpperLeg: 32, rightLowerLeg: -34 },
        // Absorb impact knockback
        { t: 0.55, easing: "easeOutElastic", offsetX: -18, offsetY: 15, squashX: 1.12, stretchY: 0.9, torso: -14, head: 15, leftUpperArm: 68, leftLowerArm: 102, rightUpperArm: 78, rightLowerArm: 108, leftUpperLeg: -24, leftLowerLeg: -28, rightUpperLeg: 34, rightLowerLeg: -38 },
        { t: 1.0, easing: "easeInOutQuad", offsetX: -8, offsetY: 10, squashX: 1, stretchY: 1, torso: -6, head: 8, leftUpperArm: 65, leftLowerArm: 95, rightUpperArm: 75, rightLowerArm: 100, leftUpperLeg: -18, leftLowerLeg: -20, rightUpperLeg: 26, rightLowerLeg: -28 }
      ]
    },

    dodge: {
      category: "action",
      loop: false,
      defaultDuration: 0.75,
      keyframes: [
        { t: 0.0, offsetX: 0, offsetY: 0, torso: 4, leftUpperArm: 25, leftLowerArm: 65, rightUpperArm: 30, rightLowerArm: 70, leftUpperLeg: -8, rightUpperLeg: 10, leftLowerLeg: -6, rightLowerLeg: -8 },
        // Deep evasive duck & weave back
        { t: 0.38, easing: "easeOutCubic", offsetX: -28, offsetY: 32, squashX: 1.15, stretchY: 0.86, torso: 38, head: -18, leftUpperArm: -25, leftLowerArm: 55, rightUpperArm: 48, rightLowerArm: 88, leftUpperLeg: 58, leftLowerLeg: -82, rightUpperLeg: 68, rightLowerLeg: -92 },
        { t: 0.68, easing: "easeInOutSine", offsetX: -22, offsetY: 26, torso: 28, head: -12, leftUpperArm: 15, leftLowerArm: 65, rightUpperArm: 52, rightLowerArm: 82, leftUpperLeg: 45, leftLowerLeg: -68, rightUpperLeg: 55, rightLowerLeg: -75 },
        { t: 1.0, easing: "easeOutBack", offsetX: 0, offsetY: 0, squashX: 1, stretchY: 1, torso: 4, head: 0, leftUpperArm: 25, leftLowerArm: 65, rightUpperArm: 30, rightLowerArm: 70, leftUpperLeg: -8, rightUpperLeg: 10, leftLowerLeg: -6, rightLowerLeg: -8 }
      ]
    },

    fall: {
      category: "action",
      loop: false,
      defaultDuration: 1.1,
      keyframes: [
        { t: 0.0, offsetX: 0, offsetY: 0, bodyRotation: 0, torso: 2, leftUpperArm: -6, rightUpperArm: 6, leftUpperLeg: -4, rightUpperLeg: 4 },
        // Lose balance backward, arms flail up
        { t: 0.3, easing: "easeInQuad", offsetX: -12, offsetY: -4, bodyRotation: -28, torso: -18, head: 15, leftUpperArm: 115, leftLowerArm: 25, rightUpperArm: 135, rightLowerArm: 20, leftUpperLeg: 32, leftLowerLeg: -25, rightUpperLeg: 48, rightLowerLeg: -18, expression: "surprised" },
        // Hit the floor horizontally
        { t: 0.68, easing: "easeInCubic", offsetX: -36, offsetY: 10, bodyRotation: -90, squashX: 1.18, stretchY: 0.84, torso: 8, head: 18, leftUpperArm: 45, leftLowerArm: 35, rightUpperArm: 65, rightLowerArm: 40, leftUpperLeg: 18, leftLowerLeg: -28, rightUpperLeg: 28, rightLowerLeg: -35 },
        // Secondary bounce & settle flat
        { t: 0.84, easing: "easeOutQuad", offsetX: -40, offsetY: 46, bodyRotation: -88, squashX: 0.96, stretchY: 1.04, torso: 4, head: 8, leftUpperArm: 25, leftLowerArm: 20, rightUpperArm: 35, rightLowerArm: 25, leftUpperLeg: 8, leftLowerLeg: -12, rightUpperLeg: 14, rightLowerLeg: -18 },
        { t: 1.0, easing: "easeOutBounce", offsetX: -42, offsetY: 10, bodyRotation: -90, squashX: 1, stretchY: 1, torso: 2, head: 4, leftUpperArm: 15, leftLowerArm: 12, rightUpperArm: 22, rightLowerArm: 15, leftUpperLeg: 6, leftLowerLeg: -8, rightUpperLeg: 10, rightLowerLeg: -12, expression: "sad" }
      ]
    },

    getUp: {
      category: "action",
      loop: false,
      defaultDuration: 1.3,
      keyframes: [
        { t: 0.0, offsetX: -42, offsetY: 10, bodyRotation: -90, torso: 2, head: 4, leftUpperArm: 15, leftLowerArm: 12, rightUpperArm: 22, rightLowerArm: 15, leftUpperLeg: 6, leftLowerLeg: -8, rightUpperLeg: 10, rightLowerLeg: -12 },
        // Prop torso up on hands/elbows
        { t: 0.35, easing: "easeInOutQuad", offsetX: -28, offsetY: 42, bodyRotation: -45, torso: 22, head: 12, leftUpperArm: -35, leftLowerArm: 68, rightUpperArm: -28, rightLowerArm: 75, leftUpperLeg: 48, leftLowerLeg: -75, rightUpperLeg: 62, rightLowerLeg: -88 },
        // Push to one knee crouch
        { t: 0.7, easing: "easeInOutCubic", offsetX: -12, offsetY: 26, bodyRotation: 0, torso: 32, head: -8, leftUpperArm: 28, leftLowerArm: 55, rightUpperArm: 38, rightLowerArm: 62, leftUpperLeg: 42, leftLowerLeg: -78, rightUpperLeg: 72, rightLowerLeg: -85 },
        // Stand upright
        { t: 1.0, easing: "easeOutBack", offsetX: 0, offsetY: 0, bodyRotation: 0, torso: 2, head: 0, leftUpperArm: -6, leftLowerArm: 12, rightUpperArm: 6, rightLowerArm: 12, leftUpperLeg: -4, leftLowerLeg: 0, rightUpperLeg: 4, rightLowerLeg: 0 }
      ]
    },

    push: {
      category: "action",
      loop: true,
      defaultDuration: 1.3,
      rootSpeedX: 45,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const s = Math.sin(w);
        const c = Math.cos(w);
        const strain = Math.sin(w * 2);
        return {
          offsetY: 14 + Math.abs(s) * 4,
          torso: 34 + strain * 3,
          neck: -10,
          head: -16 + strain * 2,
          leftUpperArm: 64 + strain * 4,
          leftLowerArm: 22 - strain * 6,
          leftWrist: -35,
          rightUpperArm: 68 - strain * 4,
          rightLowerArm: 24 + strain * 6,
          rightWrist: -35,
          leftUpperLeg: s * 32 + 12,
          leftLowerLeg: -Math.max(0, -c) * 48 - 22,
          rightUpperLeg: -s * 32 + 12,
          rightLowerLeg: -Math.max(0, c) * 48 - 22,
          expression: "angry"
        };
      }
    },

    pull: {
      category: "action",
      loop: true,
      defaultDuration: 1.4,
      rootSpeedX: -45,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const haul = Math.sin(w);
        return {
          offsetX: -haul * 10,
          offsetY: 12 + Math.abs(haul) * 4,
          torso: -26 - haul * 8,
          head: 14 + haul * 4,
          leftUpperArm: 68 - haul * 22,
          leftLowerArm: 42 + haul * 38,
          rightUpperArm: 74 - haul * 22,
          rightLowerArm: 46 + haul * 38,
          leftUpperLeg: 28 + haul * 14,
          leftLowerLeg: -36 - haul * 12,
          rightUpperLeg: -12 + haul * 14,
          rightLowerLeg: -22 - haul * 10,
          expression: "angry"
        };
      }
    },

    throw: {
      category: "action",
      loop: false,
      defaultDuration: 0.85,
      keyframes: [
        { t: 0.0, offsetX: 0, torso: 4, leftUpperArm: 20, leftLowerArm: 45, rightUpperArm: 25, rightLowerArm: 65, leftUpperLeg: -6, rightUpperLeg: 8 },
        // Wind-up step back, right arm cocked high behind head
        { t: 0.35, easing: "easeInOutQuad", offsetX: -16, offsetY: 8, torso: -22, head: 10, leftUpperArm: 78, leftLowerArm: 25, rightUpperArm: -75, rightLowerArm: 95, leftUpperLeg: 32, leftLowerLeg: -28, rightUpperLeg: -26, rightLowerLeg: -32 },
        // Whip release forward
        { t: 0.62, easing: "easeOutBack", offsetX: 18, offsetY: 4, torso: 28, head: -14, leftUpperArm: -38, leftLowerArm: 55, rightUpperArm: 105, rightLowerArm: 8, rightWrist: 25, leftUpperLeg: -32, leftLowerLeg: -12, rightUpperLeg: 42, rightLowerLeg: -38 },
        // Follow-through & recovery
        { t: 1.0, easing: "easeOutCubic", offsetX: 8, offsetY: 0, torso: 6, head: 0, leftUpperArm: -8, leftLowerArm: 18, rightUpperArm: 22, rightLowerArm: 28, leftUpperLeg: -10, leftLowerLeg: -4, rightUpperLeg: 14, rightLowerLeg: -8 }
      ]
    },

    catch: {
      category: "action",
      loop: false,
      defaultDuration: 0.8,
      keyframes: [
        // Ready reach out
        { t: 0.0, offsetX: 0, offsetY: 0, torso: 8, leftUpperArm: 72, leftLowerArm: 22, rightUpperArm: 78, rightLowerArm: 24, leftUpperLeg: -8, rightUpperLeg: 14 },
        // Absorb impact into chest, bend knees & lean back slightly
        { t: 0.38, easing: "easeOutCubic", offsetX: -14, offsetY: 14, squashX: 1.1, stretchY: 0.91, torso: -12, head: 8, leftUpperArm: 38, leftLowerArm: 88, rightUpperArm: 44, rightLowerArm: 92, leftUpperLeg: -18, leftLowerLeg: -26, rightUpperLeg: 32, rightLowerLeg: -38, expression: "surprised" },
        // Stabilize holding object
        { t: 1.0, easing: "easeOutBack", offsetX: -6, offsetY: 4, squashX: 1, stretchY: 1, torso: 2, head: 2, leftUpperArm: 42, leftLowerArm: 76, rightUpperArm: 48, rightLowerArm: 80, leftUpperLeg: -10, leftLowerLeg: -10, rightUpperLeg: 16, rightLowerLeg: -14, expression: "happy" }
      ]
    },

    roll: {
      category: "action",
      loop: false,
      defaultDuration: 1.0,
      keyframes: [
        { t: 0.0, offsetX: 0, offsetY: 0, bodyRotation: 0, torso: 6, leftUpperArm: 12, rightUpperArm: 16, leftUpperLeg: -6, rightUpperLeg: 8 },
        // Crouch & dive into tuck
        { t: 0.22, easing: "easeInQuad", offsetX: 22, offsetY: 34, bodyRotation: 65, squashX: 1.12, stretchY: 0.88, torso: 42, head: 28, leftUpperArm: 85, leftLowerArm: 75, rightUpperArm: 92, rightLowerArm: 78, leftUpperLeg: 78, leftLowerLeg: -98, rightUpperLeg: 84, rightLowerLeg: -104 },
        // Mid-roll inverted tuck
        { t: 0.55, easing: "linear", offsetX: 68, offsetY: 42, bodyRotation: 210, squashX: 1.08, stretchY: 0.92, torso: 48, head: 32, leftUpperArm: 65, leftLowerArm: 95, rightUpperArm: 72, rightLowerArm: 98, leftUpperLeg: 88, leftLowerLeg: -112, rightUpperLeg: 92, rightLowerLeg: -116 },
        // Exit roll onto feet crouch
        { t: 0.82, easing: "easeOutQuad", offsetX: 112, offsetY: 24, bodyRotation: 345, squashX: 1.1, stretchY: 0.9, torso: 28, head: 10, leftUpperArm: 38, leftLowerArm: 48, rightUpperArm: 44, rightLowerArm: 52, leftUpperLeg: 52, leftLowerLeg: -72, rightUpperLeg: 58, rightLowerLeg: -78 },
        // Stand up clean
        { t: 1.0, easing: "easeOutBack", offsetX: 125, offsetY: 0, bodyRotation: 360, squashX: 1, stretchY: 1, torso: 4, head: 0, leftUpperArm: -6, leftLowerArm: 14, rightUpperArm: 8, rightLowerArm: 16, leftUpperLeg: -6, leftLowerLeg: 0, rightUpperLeg: 8, rightLowerLeg: 0 }
      ]
    },

    clap: {
      category: "action",
      loop: true,
      defaultDuration: 0.75,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const clapWave = Math.abs(Math.sin(w * 2));
        return {
          offsetY: Math.sin(w) * 2,
          torso: 2 + Math.sin(w) * 2,
          head: -4 + clapWave * 4,
          leftUpperArm: 48 + clapWave * 14,
          leftLowerArm: 62 + clapWave * 24,
          rightUpperArm: 54 - clapWave * 10,
          rightLowerArm: 68 + clapWave * 24,
          leftUpperLeg: -5,
          rightUpperLeg: 6,
          expression: "happy"
        };
      }
    },

    // ========================================================================
    // CATEGORY D: INTERACTION MOTIONS (6)
    // ========================================================================

    handshake: {
      category: "interaction",
      loop: true,
      defaultDuration: 1.2,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const shake = Math.sin(w * 3);
        return {
          torso: 8 + Math.sin(w) * 2,
          head: 4 + shake * 2,
          leftUpperArm: -8,
          leftLowerArm: 14,
          rightUpperArm: 52 + shake * 8,
          rightLowerArm: 34 + shake * 12,
          rightWrist: shake * 10,
          leftUpperLeg: -10,
          rightUpperLeg: 14,
          expression: "happy"
        };
      }
    },

    highFive: {
      category: "interaction",
      loop: false,
      defaultDuration: 0.9,
      keyframes: [
        { t: 0.0, offsetY: 0, torso: 2, leftUpperArm: -8, rightUpperArm: 12, rightLowerArm: 20 },
        { t: 0.25, easing: "easeInQuad", offsetY: 8, torso: -8, rightUpperArm: 65, rightLowerArm: 85 },
        // High slap apex
        { t: 0.52, easing: "easeOutBack", offsetX: 8, offsetY: -12, squashX: 0.94, stretchY: 1.06, torso: 10, head: -12, leftUpperArm: -18, leftLowerArm: 28, rightUpperArm: 138, rightLowerArm: 12, rightWrist: -15, leftUpperLeg: -12, rightUpperLeg: 18, expression: "happy" },
        { t: 1.0, easing: "easeOutCubic", offsetX: 0, offsetY: 0, squashX: 1, stretchY: 1, torso: 2, head: 0, leftUpperArm: -6, rightUpperArm: 8, rightLowerArm: 14, leftUpperLeg: -4, rightUpperLeg: 6, expression: "happy" }
      ]
    },

    hug: {
      category: "interaction",
      loop: false,
      defaultDuration: 1.4,
      keyframes: [
        { t: 0.0, offsetX: 0, torso: 2, leftUpperArm: -6, leftLowerArm: 12, rightUpperArm: 6, rightLowerArm: 12 },
        // Open arms wide welcoming
        { t: 0.35, easing: "easeOutQuad", offsetX: 6, torso: -6, head: -6, leftUpperArm: 78, leftLowerArm: 12, rightUpperArm: 92, rightLowerArm: 14, leftUpperLeg: -8, rightUpperLeg: 12, expression: "happy" },
        // Warm embrace wrap inward
        { t: 0.7, easing: "easeInOutCubic", offsetX: 16, torso: 14, head: 8, leftUpperArm: 68, leftLowerArm: 76, rightUpperArm: 74, rightLowerArm: 82, leftUpperLeg: -14, rightUpperLeg: 18, expression: "happy" },
        { t: 1.0, easing: "easeInOutSine", offsetX: 14, torso: 12, head: 6, leftUpperArm: 66, leftLowerArm: 78, rightUpperArm: 72, rightLowerArm: 84, leftUpperLeg: -12, rightUpperLeg: 16, expression: "happy" }
      ]
    },

    point: {
      category: "interaction",
      loop: true,
      defaultDuration: 1.5,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const bob = Math.sin(w);
        return {
          torso: 6 + bob * 1.5,
          head: -4 + bob * 2,
          leftUpperArm: -12,
          leftLowerArm: 18,
          rightUpperArm: 88 + bob * 3,
          rightLowerArm: 4,
          rightWrist: 0,
          leftUpperLeg: -8,
          rightUpperLeg: 10
        };
      }
    },

    talk: {
      category: "interaction",
      loop: true,
      defaultDuration: 1.6,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const g1 = Math.sin(w);
        const g2 = Math.cos(w * 2);
        return {
          torso: 3 + g1 * 3,
          head: g1 * 5 + g2 * 3,
          leftUpperArm: 22 + g1 * 18,
          leftLowerArm: 58 + g2 * 22,
          leftWrist: g1 * 15,
          rightUpperArm: 34 - g1 * 22,
          rightLowerArm: 68 - g2 * 25,
          rightWrist: -g2 * 18,
          leftUpperLeg: -5,
          rightUpperLeg: 6,
          mouthOpen: Math.abs(Math.sin(w * 4)) * 0.85
        };
      }
    },

    lookAround: {
      category: "interaction",
      loop: true,
      defaultDuration: 2.4,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const scan = Math.sin(w);
        return {
          torso: scan * 10,
          neck: scan * 6,
          head: scan * 14,
          headLook: scan,
          // Right hand shading forehead
          rightUpperArm: 108,
          rightLowerArm: 112,
          leftUpperArm: -14,
          leftLowerArm: 22,
          leftUpperLeg: -8,
          rightUpperLeg: 10
        };
      }
    },

    // ========================================================================
    // CATEGORY E: FAJR / SPIRITUAL STORY PRESETS (6 SPECIAL PRESETS)
    // ========================================================================

    /**
     * Rising from horizontal sleep on the bed -> sitting on the edge -> rubbing eyes.
     * Replicates the exact Day 1–39 "First Minute" wake-up motion in the Fajr video.
     */
    wakeUp: {
      category: "fajr",
      loop: false,
      defaultDuration: 1.8,
      keyframes: [
        // Lying asleep in bed
        { t: 0.0, offsetX: 0, offsetY: 10, bodyRotation: -90, torso: 2, head: 6, leftUpperArm: 24, leftLowerArm: 65, rightUpperArm: 32, rightLowerArm: 78, leftUpperLeg: 14, leftLowerLeg: -18, rightUpperLeg: 22, rightLowerLeg: -28 },
        // Sit upright in bed, legs still extended on mattress
        { t: 0.42, easing: "easeInOutCubic", offsetX: 12, offsetY: 34, bodyRotation: 0, torso: 14, head: 18, leftUpperArm: 32, leftLowerArm: 55, rightUpperArm: 78, rightLowerArm: 108, leftUpperLeg: 88, leftLowerLeg: -14, rightUpperLeg: 90, rightLowerLeg: -18 },
        // Rubbing eyes / forehead with hand while sitting on edge of bed
        { t: 0.72, easing: "easeInOutSine", offsetX: 24, offsetY: 36, bodyRotation: 0, torso: 22, head: 24, leftUpperArm: 25, leftLowerArm: 62, rightUpperArm: 86, rightLowerArm: 114, leftUpperLeg: 86, leftLowerLeg: -84, rightUpperLeg: 88, rightLowerLeg: -86 },
        // Ready to stand up from bed edge
        { t: 1.0, easing: "easeOutQuad", offsetX: 28, offsetY: 36, bodyRotation: 0, torso: 10, head: 6, leftUpperArm: 18, leftLowerArm: 48, rightUpperArm: 24, rightLowerArm: 54, leftUpperLeg: 86, leftLowerLeg: -84, rightUpperLeg: 88, rightLowerLeg: -86 }
      ]
    },

    /**
     * Reaching toward the bedside nightstand to silence the phone alarm ("Before the Alarm").
     */
    turnOffAlarm: {
      category: "fajr",
      loop: false,
      defaultDuration: 1.2,
      keyframes: [
        { t: 0.0, offsetY: 0, torso: 4, head: 6, leftUpperArm: -6, leftLowerArm: 14, rightUpperArm: 12, rightLowerArm: 18, leftUpperLeg: -6, rightUpperLeg: 8 },
        { t: 0.5, easing: "easeInOutCubic", offsetY: 12, torso: 36, head: 22, leftUpperArm: 15, leftLowerArm: 35, rightUpperArm: 74, rightLowerArm: 16, leftUpperLeg: 24, leftLowerLeg: -32, rightUpperLeg: 38, rightLowerLeg: -44 },
        { t: 1.0, easing: "easeOutCubic", offsetY: 0, torso: 4, head: 4, leftUpperArm: -6, leftLowerArm: 14, rightUpperArm: 10, rightLowerArm: 18, leftUpperLeg: -4, rightUpperLeg: 6 }
      ]
    },

    /**
     * Takbiratul Ihram -> Qiyam (standing in prayer with hands folded on chest, head bowed).
     */
    takbir: {
      category: "fajr",
      loop: false,
      defaultDuration: 1.4,
      keyframes: [
        // Standing upright
        { t: 0.0, offsetY: 0, torso: 1, head: 4, leftUpperArm: -4, leftLowerArm: 10, rightUpperArm: 4, rightLowerArm: 10, leftUpperLeg: -2, rightUpperLeg: 2 },
        // Raise hands to ears (Takbir)
        { t: 0.4, easing: "easeInOutSine", offsetY: 0, torso: 1, head: 8, leftUpperArm: 72, leftLowerArm: 98, rightUpperArm: 78, rightLowerArm: 102, leftUpperLeg: -2, rightUpperLeg: 2 },
        // Fold hands calmly over chest (Qiyam)
        { t: 1.0, easing: "easeInOutCubic", offsetY: 0, torso: 3, neck: 6, head: 16, leftUpperArm: 28, leftLowerArm: 88, rightUpperArm: 34, rightLowerArm: 94, leftUpperLeg: -2, rightUpperLeg: 2 }
      ]
    },

    /**
     * Ruku' (bowing 90 degrees with flat horizontal back and hands resting on knees).
     */
    ruku: {
      category: "fajr",
      loop: false,
      defaultDuration: 1.2,
      keyframes: [
        // From Qiyam
        { t: 0.0, offsetY: 0, torso: 3, head: 16, leftUpperArm: 28, leftLowerArm: 88, rightUpperArm: 34, rightLowerArm: 94, leftUpperLeg: -2, rightUpperLeg: 2, leftLowerLeg: 0, rightLowerLeg: 0 },
        // Bow torso to ~88 degrees horizontal, hands straight to knees
        { t: 0.55, easing: "easeInOutCubic", offsetX: -10, offsetY: 8, torso: 86, neck: 0, head: 4, leftUpperArm: -4, leftLowerArm: 8, rightUpperArm: 0, rightLowerArm: 8, leftUpperLeg: -4, rightUpperLeg: 0, leftLowerLeg: -2, rightLowerLeg: -2 },
        { t: 1.0, easing: "linear", offsetX: -10, offsetY: 8, torso: 86, neck: 0, head: 4, leftUpperArm: -4, leftLowerArm: 8, rightUpperArm: 0, rightLowerArm: 8, leftUpperLeg: -4, rightUpperLeg: 0, leftLowerLeg: -2, rightLowerLeg: -2 }
      ]
    },

    /**
     * Sujud (prostration on the prayer mat with forehead, palms, knees, and toes on the floor).
     */
    sujud: {
      category: "fajr",
      loop: false,
      defaultDuration: 1.5,
      keyframes: [
        // From standing / Qiyam
        { t: 0.0, offsetX: 0, offsetY: 0, torso: 4, head: 14, leftUpperArm: 26, leftLowerArm: 84, rightUpperArm: 30, rightLowerArm: 88, leftUpperLeg: -2, leftLowerLeg: 0, rightUpperLeg: 2, rightLowerLeg: 0 },
        // Lowering to knees
        { t: 0.45, easing: "easeInOutQuad", offsetX: 4, offsetY: 44, torso: 42, head: 18, leftUpperArm: 38, leftLowerArm: 35, rightUpperArm: 42, rightLowerArm: 38, leftUpperLeg: 58, leftLowerLeg: -118, rightUpperLeg: 62, rightLowerLeg: -122 },
        // Full prostration (Sujud) with forehead touching prayer mat
        { t: 1.0, easing: "easeInOutCubic", offsetX: 12, offsetY: 10, torso: 108, neck: 8, head: 12, leftUpperArm: 26, leftLowerArm: 64, rightUpperArm: 30, rightLowerArm: 68, leftUpperLeg: 42, leftLowerLeg: -126, leftFoot: 35, rightUpperLeg: 46, rightLowerLeg: -128, rightFoot: 35 }
      ]
    },

    /**
     * Complete continuous Fajr Prayer cycle (Takbir -> Qiyam -> Ruku -> I'tidal -> Sujud -> Jalsah -> Sujud),
     * matching the Day 1 to Day 40 fast-forward sequence in the video.
     */
    pray: {
      category: "fajr",
      loop: true,
      defaultDuration: 6.0,
      keyframes: [
        // 0.00: Takbiratul Ihram
        { t: 0.0, offsetX: 0, offsetY: 0, torso: 2, head: 10, leftUpperArm: 74, leftLowerArm: 98, rightUpperArm: 78, rightLowerArm: 102, leftUpperLeg: -2, leftLowerLeg: 0, rightUpperLeg: 2, rightLowerLeg: 0 },
        // 0.14: Qiyam (standing hands folded)
        { t: 0.14, easing: "easeInOutCubic", offsetX: 0, offsetY: 0, torso: 3, head: 16, leftUpperArm: 28, leftLowerArm: 88, rightUpperArm: 34, rightLowerArm: 94, leftUpperLeg: -2, leftLowerLeg: 0, rightUpperLeg: 2, rightLowerLeg: 0 },
        // 0.28: Hold Qiyam
        { t: 0.28, easing: "linear", offsetX: 0, offsetY: 0, torso: 3, head: 16, leftUpperArm: 28, leftLowerArm: 88, rightUpperArm: 34, rightLowerArm: 94, leftUpperLeg: -2, leftLowerLeg: 0, rightUpperLeg: 2, rightLowerLeg: 0 },
        // 0.42: Ruku (bowing 90 deg)
        { t: 0.42, easing: "easeInOutCubic", offsetX: -10, offsetY: 8, torso: 86, head: 4, leftUpperArm: -4, leftLowerArm: 8, rightUpperArm: 0, rightLowerArm: 8, leftUpperLeg: -4, leftLowerLeg: -2, rightUpperLeg: 0, rightLowerLeg: -2 },
        // 0.54: I'tidal (rising back to standing)
        { t: 0.54, easing: "easeInOutCubic", offsetX: 0, offsetY: 0, torso: 2, head: 12, leftUpperArm: -4, leftLowerArm: 10, rightUpperArm: 4, rightLowerArm: 10, leftUpperLeg: -2, leftLowerLeg: 0, rightUpperLeg: 2, rightLowerLeg: 0 },
        // 0.70: First Sujud (prostration)
        { t: 0.70, easing: "easeInOutCubic", offsetX: 12, offsetY: 10, torso: 108, head: 12, leftUpperArm: 26, leftLowerArm: 64, rightUpperArm: 30, rightLowerArm: 68, leftUpperLeg: 42, leftLowerLeg: -126, rightUpperLeg: 46, rightLowerLeg: -128 },
        // 0.84: Sitting between two prostrations (Jalsah / Tahiyyat)
        { t: 0.84, easing: "easeInOutCubic", offsetX: -4, offsetY: 46, torso: 6, head: 16, leftUpperArm: 18, leftLowerArm: 56, rightUpperArm: 22, rightLowerArm: 60, leftUpperLeg: 68, leftLowerLeg: -142, rightUpperLeg: 72, rightLowerLeg: -145 },
        // 0.94: Second Sujud
        { t: 0.94, easing: "easeInOutCubic", offsetX: 12, offsetY: 10, torso: 108, head: 12, leftUpperArm: 26, leftLowerArm: 64, rightUpperArm: 30, rightLowerArm: 68, leftUpperLeg: 42, leftLowerLeg: -126, rightUpperLeg: 46, rightLowerLeg: -128 },
        // 1.00: Rise smoothly back to Qiyam
        { t: 1.0, easing: "easeInOutCubic", offsetX: 0, offsetY: 0, torso: 3, head: 14, leftUpperArm: 28, leftLowerArm: 88, rightUpperArm: 34, rightLowerArm: 94, leftUpperLeg: -2, leftLowerLeg: 0, rightUpperLeg: 2, rightLowerLeg: 0 }
      ]
    },

    // ========================================================================
    // CATEGORY F: GARIS HIDUP / QUEUE STORY PRESETS (6 PRESETS)
    // ========================================================================

    /**
     * Antre sabar: berdiri tegak santai, berat badan bergeser dikit, tangan lemas.
     */
    waitQueue: {
      category: "garishidup",
      loop: true,
      defaultDuration: 2.2,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const sway = Math.sin(w);
        return {
          offsetY: Math.abs(sway) * 1.2,
          torso: 2 + sway * 1.2,
          head: 3 + sway * 1.5,
          leftUpperArm: -6 + sway * 2,
          leftLowerArm: 16,
          rightUpperArm: 8 - sway * 2,
          rightLowerArm: 18,
          leftUpperLeg: -5,
          leftLowerLeg: 0,
          rightUpperLeg: 6,
          rightLowerLeg: -2
        };
      }
    },

    /**
     * Alasan penyerobot ("BENTAR DOANG" / "BURU-BURU"):
     * angkat satu tangan dekat kepala/dada gaya menyepelekan sambil condong ke depan.
     */
    cutQueueExcuse: {
      category: "garishidup",
      loop: true,
      defaultDuration: 1.2,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const nod = Math.sin(w * 2);
        return {
          offsetY: Math.abs(nod) * 2,
          torso: 8 + nod * 2,
          head: -4 + nod * 4,
          leftUpperArm: -12,
          leftLowerArm: 22,
          rightUpperArm: 78 + nod * 8,
          rightLowerArm: 88 + nod * 10,
          leftUpperLeg: -10,
          leftLowerLeg: -6,
          rightUpperLeg: 14,
          rightLowerLeg: -8
        };
      }
    },

    /**
     * Protagonis menegur penyerobot & menunjuk ke belakang antrean,
     * atau mengulurkan tangan menenangkan ke ibu & anak di belakang.
     */
    reprimandPoint: {
      category: "garishidup",
      loop: false,
      defaultDuration: 1.5,
      keyframes: [
        { t: 0.0, torso: 2, head: 0, leftUpperArm: -6, leftLowerArm: 14, rightUpperArm: 8, rightLowerArm: 16, leftUpperLeg: -5, rightUpperLeg: 5 },
        // Firmly raise hand to stop the cutter / point to the back
        { t: 0.35, easing: "easeOutCubic", torso: 6, head: 4, leftUpperArm: -10, leftLowerArm: 18, rightUpperArm: 68, rightLowerArm: 18, leftUpperLeg: -8, rightUpperLeg: 10 },
        { t: 0.75, easing: "easeInOutSine", torso: 4, head: 6, leftUpperArm: -8, leftLowerArm: 16, rightUpperArm: 54, rightLowerArm: 24, leftUpperLeg: -6, rightUpperLeg: 8 },
        { t: 1.0, easing: "easeOutQuad", torso: 2, head: 2, leftUpperArm: -6, leftLowerArm: 14, rightUpperArm: 10, rightLowerArm: 18, leftUpperLeg: -5, rightUpperLeg: 5 }
      ]
    },

    /**
     * Jalan ke belakang antrean karena malu (kepala tertunduk, satu tangan garuk belakang kepala).
     */
    walkShame: {
      category: "garishidup",
      loop: true,
      defaultDuration: 1.1,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const s = Math.sin(w);
        const c = Math.cos(w);
        return {
          offsetY: Math.abs(s) * 4 + 2,
          torso: 16 + Math.sin(w * 2) * 2,
          neck: 10,
          head: 20,
          // Right hand raised rubbing back of head/neck in embarrassment
          rightUpperArm: 95 + s * 6,
          rightLowerArm: 112,
          leftUpperArm: -s * 20,
          leftLowerArm: 24,
          leftUpperLeg: s * 26,
          leftLowerLeg: -Math.max(0, -c) * 32 - 6,
          rightUpperLeg: -s * 26,
          rightLowerLeg: -Math.max(0, c) * 32 - 6
        };
      }
    },

    /**
     * Petugas melayani di loket (menyerahkan tiket / menekan bel).
     */
    serveCounter: {
      category: "garishidup",
      loop: true,
      defaultDuration: 1.8,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const reach = Math.sin(w);
        return {
          torso: 8 + reach * 3,
          head: 6 + reach * 2,
          leftUpperArm: 24,
          leftLowerArm: 58,
          rightUpperArm: 48 + reach * 16,
          rightLowerArm: 42 - reach * 14,
          leftUpperLeg: -4,
          rightUpperLeg: 6
        };
      }
    },

    /**
     * Orang tua menggandeng tangan anak dengan lembut di antrean.
     */
    holdChildHand: {
      category: "garishidup",
      loop: true,
      defaultDuration: 2.4,
      evaluate(t, p) {
        const w = p * TWO_PI;
        const breath = Math.sin(w);
        return {
          offsetY: breath * 1.2,
          torso: 4 + breath * 1.5,
          head: 10 + breath * 2,
          leftUpperArm: -6,
          leftLowerArm: 14,
          // Front arm reaching slightly forward/down toward child
          rightUpperArm: 28 + breath * 2,
          rightLowerArm: 12,
          leftUpperLeg: -5,
          rightUpperLeg: 6
        };
      }
    }
  };

  // ==========================================================================
  // SECTION 4: STICKMAN CHARACTER ENGINE (18-NODE SKELETON + IK + GHOSTING)
  // ==========================================================================

  let _characterAutoId = 1;

  /**
   * Represents an articulated 2D Stickman character with 18 skeletal nodes,
   * independent joint control, 2-bone IK, facial expressions, squash & stretch,
   * and onion-skin motion-trail ghosting.
   */
  class Stickman {
    /**
     * @param {Object} [config={}]
     * @param {string} [config.id] - Unique identifier
     * @param {number} [config.x=400] - Foot/ground X anchor (or pelvis X if anchor='pelvis')
     * @param {number} [config.y=700] - Foot/ground Y coordinate
     * @param {number} [config.scale=1] - Uniform scale multiplier
     * @param {number} [config.scaleX=1] - Horizontal scale multiplier
     * @param {number} [config.scaleY=1] - Vertical scale multiplier
     * @param {number} [config.rotation=0] - Global rotation in degrees
     * @param {number|string} [config.facing=1] - 1 / 'right' or -1 / 'left'
     * @param {string} [config.color='#FFFFFF'] - Primary stroke/fill color
     * @param {string} [config.headColor] - Head fill color (defaults to color)
     * @param {number} [config.lineWidth=6] - Base limb stroke thickness
     * @param {string} [config.style='classic'] - 'classic' | 'minimalist' | 'outlined'
     * @param {string} [config.expression='neutral'] - Initial facial expression
     * @param {Object} [config.proportions] - Custom segment lengths
     * @param {Object|boolean} [config.ghosting] - Onion-skin motion trail settings
     */
    constructor(config = {}) {
      this.id = config.id || `stickman_${_characterAutoId++}`;
      this.name = config.name || this.id;
      this.x = config.x !== undefined ? Number(config.x) : 400;
      this.y = config.y !== undefined ? Number(config.y) : 700;
      this.zIndex = config.zIndex !== undefined ? Number(config.zIndex) : 10;
      this.visible = config.visible !== undefined ? Boolean(config.visible) : true;
      this.opacity = config.opacity !== undefined ? Number(config.opacity) : 1;

      this.scale = config.scale !== undefined ? Number(config.scale) : 1;
      this.scaleX = config.scaleX !== undefined ? Number(config.scaleX) : 1;
      this.scaleY = config.scaleY !== undefined ? Number(config.scaleY) : 1;
      this.rotation = config.rotation !== undefined ? Number(config.rotation) : 0;

      this.facing =
        config.facing === "left" || config.facing === -1 ? -1 : 1;

      this.color = config.color || "#F7F5E8";
      this.headColor = config.headColor || this.color;
      this.backLimbOpacity =
        config.backLimbOpacity !== undefined ? Number(config.backLimbOpacity) : 0.72;
      this.lineWidth = config.lineWidth !== undefined ? Number(config.lineWidth) : 13;
      this.style = config.style || "garishidup"; // 'classic' | 'minimalist' | 'outlined' | 'neuron' | 'chunky'
      this.outlineColor = config.outlineColor || "#141414";
      this.outlineWidth = config.outlineWidth !== undefined ? Number(config.outlineWidth) : 6;
      this.backLimbColor = config.backLimbColor || "#B4B4B4";
      this.glowColor =
        config.glowColor !== undefined
          ? config.glowColor
          : this.style === "neuron" || this.style === "chunky"
          ? "rgba(255, 255, 255, 0.32)"
          : null;
      this.glowBlur = config.glowBlur !== undefined ? Number(config.glowBlur) : 18;
      this.handProps = Object.assign(
        { left: null, right: null, overheadCanvas: null },
        config.handProps || {}
      );
      this.expression =
        config.expression || (this.style === "minimalist" ? "minimalist" : "neutral");

      // Customizable anatomical proportions (in unscaled local pixels; total standing height ~155px)
      this.proportions = Object.assign(
        {
          headRadius: 14,
          neckLength: 7,
          torsoLength: 48,
          shoulderOffset: 4, // distance below top of torso
          upperArmLength: 28,
          lowerArmLength: 26,
          handLength: 7,
          upperLegLength: 34,
          lowerLegLength: 34,
          footLength: 11
        },
        config.proportions || {}
      );

      // Current pose, manual overrides, and IK targets
      this.pose = createDefaultPose();
      this.jointOverrides = {};
      this.ikTargets = {
        leftArm: null,
        rightArm: null,
        leftLeg: null,
        rightLeg: null
      };

      // Computed world-space joint dictionary (populated by computeForwardKinematics)
      this.joints = {};
      this._initJointMap();

      // Animation Playback & Crossfade Blending State
      this.currentMotion = "idle";
      this.motionOptions = {
        duration: StickmanMotions.idle.defaultDuration,
        speed: 1,
        loop: true
      };
      this.motionTime = 0;
      this.isPlaying = true;
      this.previousPose = null;
      this.blendElapsed = 0;
      this.blendDuration = 0.22;

      // Onion-Skin / Motion Trail Ghosting (used in the Fajr video)
      const ghostCfg =
        typeof config.ghosting === "object" && config.ghosting !== null
          ? config.ghosting
          : { enabled: Boolean(config.ghosting) };
      this.ghosting = {
        enabled: Boolean(ghostCfg.enabled),
        maxFrames: ghostCfg.maxFrames || 4,
        interval: ghostCfg.interval || 0.08,
        opacity: ghostCfg.opacity !== undefined ? ghostCfg.opacity : 0.24,
        color: ghostCfg.color || null,
        _timer: 0,
        _snapshots: []
      };

      // Secondary procedural state (blink timer, floating zZ / tear particles)
      this._blinkTimer = 0;
      this._particles = [];

      // Perform initial FK calculation
      this.computeForwardKinematics();
    }

    _initJointMap() {
      const names = [
        "pelvis",
        "torso",
        "neck",
        "head",
        "leftEye",
        "rightEye",
        "leftEyebrow",
        "rightEyebrow",
        "mouth",
        "leftShoulder",
        "leftUpperArm",
        "leftElbow",
        "leftLowerArm",
        "leftWrist",
        "leftHand",
        "rightShoulder",
        "rightUpperArm",
        "rightElbow",
        "rightLowerArm",
        "rightWrist",
        "rightHand",
        "leftHip",
        "leftUpperLeg",
        "leftKnee",
        "leftLowerLeg",
        "leftAnkle",
        "leftFoot",
        "rightHip",
        "rightUpperLeg",
        "rightKnee",
        "rightLowerLeg",
        "rightAnkle",
        "rightFoot"
      ];
      names.forEach((n) => {
        this.joints[n] = { name: n, x: this.x, y: this.y, angle: 0 };
      });
    }

    // ------------------------------------------------------------------------
    // Public Character Control Methods
    // ------------------------------------------------------------------------

    /**
     * Plays a named motion preset on this character with smooth crossfade transition.
     * @param {string} motionName - Name of motion preset in `StickmanMotions`
     * @param {Object} [options={}]
     * @param {number} [options.duration] - Total duration in seconds
     * @param {number} [options.speed=1] - Playback speed multiplier
     * @param {boolean} [options.loop] - Whether to loop the motion
     * @param {number} [options.blendDuration=0.2] - Crossfade transition duration
     * @param {boolean} [options.moveRoot=false] - Whether walk/run moves `this.x` automatically
     */
    play(motionName, options = {}) {
      const preset = StickmanMotions[motionName];
      if (!preset) {
        throw new Error(
          `[StickmanKit] Unknown motion preset "${motionName}". Available presets: ${Object.keys(
            StickmanMotions
          ).join(", ")}`
        );
      }

      if (this.currentMotion !== motionName || options.forceRestart) {
        this.previousPose = Object.assign({}, this.pose);
        this.blendElapsed = 0;
        this.blendDuration =
          options.blendDuration !== undefined ? Number(options.blendDuration) : 0.2;
        this.motionTime = 0;
      }

      this.currentMotion = motionName;
      this.motionOptions = {
        duration:
          options.duration !== undefined
            ? Number(options.duration)
            : preset.defaultDuration || 1.0,
        speed: options.speed !== undefined ? Number(options.speed) : 1,
        loop: options.loop !== undefined ? Boolean(options.loop) : Boolean(preset.loop),
        moveRoot: Boolean(options.moveRoot),
        fromX: options.fromX,
        toX: options.toX,
        fromY: options.fromY,
        toY: options.toY,
        onComplete: typeof options.onComplete === "function" ? options.onComplete : null,
        _completedFired: false
      };

      this.isPlaying = true;
      return this;
    }

    pause() {
      this.isPlaying = false;
      return this;
    }

    resume() {
      this.isPlaying = true;
      return this;
    }

    stop() {
      this.isPlaying = false;
      this.motionTime = 0;
      this.play("idle", { blendDuration: 0.15 });
      this.isPlaying = false;
      this.update(0);
      return this;
    }

    setPosition(x, y) {
      if (x !== undefined && x !== null) this.x = Number(x);
      if (y !== undefined && y !== null) this.y = Number(y);
      this.computeForwardKinematics();
      return this;
    }

    setScale(scaleX, scaleY) {
      if (scaleY === undefined) {
        this.scale = Number(scaleX);
        this.scaleX = 1;
        this.scaleY = 1;
      } else {
        this.scaleX = Number(scaleX);
        this.scaleY = Number(scaleY);
      }
      this.computeForwardKinematics();
      return this;
    }

    setRotation(deg) {
      this.rotation = Number(deg);
      this.computeForwardKinematics();
      return this;
    }

    setFacing(dir) {
      this.facing = dir === "left" || dir === -1 ? -1 : 1;
      this.computeForwardKinematics();
      return this;
    }

    setColor(color, headColor) {
      this.color = color;
      this.headColor = headColor || color;
      return this;
    }

    setExpression(expressionName) {
      this.expression = expressionName;
      return this;
    }

    /**
     * Attaches or removes a visual prop on the stickman's hands or overhead hold
     * (e.g., `{ right: { type: 'paintbrush', color: '#2979FF' }, overheadCanvas: { tier: 3, progress: 1 } }`).
     */
    setHandProps(props = {}) {
      Object.assign(this.handProps, props);
      return this;
    }

    setProportions(newProportions = {}) {
      Object.assign(this.proportions, newProportions);
      this.computeForwardKinematics();
      return this;
    }

    /**
     * Enables or configures onion-skin motion trail ghosting (like the Fajr video).
     */
    setGhosting(enabled, options = {}) {
      this.ghosting.enabled = Boolean(enabled);
      if (options.maxFrames !== undefined) this.ghosting.maxFrames = options.maxFrames;
      if (options.interval !== undefined) this.ghosting.interval = options.interval;
      if (options.opacity !== undefined) this.ghosting.opacity = options.opacity;
      if (options.color !== undefined) this.ghosting.color = options.color;
      if (!enabled) this.ghosting._snapshots = [];
      return this;
    }

    /**
     * Independently overrides a specific joint angle in degrees.
     * Supports aliases like `leftElbow` -> `leftLowerArm`, `rightKnee` -> `rightLowerLeg`.
     */
    setJointAngle(jointName, angleDeg) {
      const aliasMap = {
        leftElbow: "leftLowerArm",
        rightElbow: "rightLowerArm",
        leftKnee: "leftLowerLeg",
        rightKnee: "rightLowerLeg"
      };
      const canonical = aliasMap[jointName] || jointName;
      this.jointOverrides[canonical] = Number(angleDeg);
      this.computeForwardKinematics();
      return this;
    }

    clearJointOverrides() {
      this.jointOverrides = {};
      this.computeForwardKinematics();
      return this;
    }

    /**
     * Sets a world-space 2-Bone Inverse Kinematics target for an arm or leg.
     * @param {'leftArm'|'rightArm'|'leftLeg'|'rightLeg'} limb
     * @param {number} targetX
     * @param {number} targetY
     * @param {number} [bendDir]
     */
    setIKTarget(limb, targetX, targetY, bendDir) {
      if (!Object.prototype.hasOwnProperty.call(this.ikTargets, limb)) {
        throw new Error(
          `[StickmanKit] Invalid IK limb "${limb}". Use 'leftArm', 'rightArm', 'leftLeg', or 'rightLeg'.`
        );
      }
      const defaultBend = limb.includes("Arm") ? 1 : -1;
      this.ikTargets[limb] = {
        x: Number(targetX),
        y: Number(targetY),
        bendDir: bendDir !== undefined ? bendDir : defaultBend
      };
      this.computeForwardKinematics();
      return this;
    }

    clearIKTarget(limb) {
      if (limb) {
        this.ikTargets[limb] = null;
      } else {
        this.ikTargets.leftArm = null;
        this.ikTargets.rightArm = null;
        this.ikTargets.leftLeg = null;
        this.ikTargets.rightLeg = null;
      }
      this.computeForwardKinematics();
      return this;
    }

    getJoint(jointName) {
      return this.joints[jointName] || null;
    }

    // ------------------------------------------------------------------------
    // Update & Forward/Inverse Kinematics Solver
    // ------------------------------------------------------------------------

    update(dt) {
      const safeDt = Math.max(0, Number(dt) || 0);

      // Update motion timer
      const preset = StickmanMotions[this.currentMotion] || StickmanMotions.idle;
      const speed = this.motionOptions.speed || 1;
      const cycleDuration = Math.max(
        0.05,
        this.motionOptions.loop
          ? preset.defaultDuration || 1.0
          : this.motionOptions.duration || preset.defaultDuration || 1.0
      );

      if (this.isPlaying) {
        this.motionTime += safeDt * speed;
      }

      // Compute normalized cycle progress `p` in [0, 1]
      let p = this.motionTime / cycleDuration;
      if (this.motionOptions.loop) {
        p = p % 1;
        if (p < 0) p += 1;
      } else {
        if (p >= 1) {
          p = 1;
          if (!this.motionOptions._completedFired && this.motionOptions.onComplete) {
            this.motionOptions._completedFired = true;
            this.motionOptions.onComplete(this);
          }
        }
      }

      // Evaluate raw motion pose
      let rawPose = createDefaultPose();
      if (typeof preset.evaluate === "function") {
        Object.assign(rawPose, preset.evaluate(this.motionTime, p, this));
      } else if (Array.isArray(preset.keyframes)) {
        Object.assign(rawPose, sampleKeyframes(preset.keyframes, p));
      }

      // Apply crossfade motion blending if transitioning from a previous motion
      if (this.previousPose && this.blendDuration > 0 && this.blendElapsed < this.blendDuration) {
        this.blendElapsed += safeDt;
        const blendT = Easing.smoothstep(
          MathUtils.clamp(this.blendElapsed / this.blendDuration, 0, 1)
        );
        const blended = createDefaultPose();
        Object.keys(blended).forEach((k) => {
          const prevV = this.previousPose[k];
          const currV = rawPose[k];
          if (typeof prevV === "number" && typeof currV === "number") {
            if (
              k === "squashX" ||
              k === "stretchY" ||
              k === "offsetX" ||
              k === "offsetY" ||
              k === "eyeBlink" ||
              k === "mouthOpen"
            ) {
              blended[k] = MathUtils.lerp(prevV, currV, blendT);
            } else {
              blended[k] = MathUtils.lerpAngleDeg(prevV, currV, blendT);
            }
          } else {
            blended[k] = blendT < 0.5 ? prevV : currV;
          }
        });
        rawPose = blended;
        if (this.blendElapsed >= this.blendDuration) {
          this.previousPose = null;
        }
      }

      // Apply manual joint overrides on top of evaluated motion
      Object.keys(this.jointOverrides).forEach((key) => {
        rawPose[key] = this.jointOverrides[key];
      });

      // Keep elbow/knee aliases synchronized
      rawPose.leftElbow = rawPose.leftLowerArm;
      rawPose.rightElbow = rawPose.rightLowerArm;
      rawPose.leftKnee = rawPose.leftLowerLeg;
      rawPose.rightKnee = rawPose.rightLowerLeg;

      this.pose = rawPose;

      // Optional root locomotion translation
      if (this.isPlaying && this.motionOptions.moveRoot && preset.rootSpeedX) {
        this.x += preset.rootSpeedX * this.facing * this.scale * speed * safeDt;
      }
      if (
        this.motionOptions.fromX !== undefined &&
        this.motionOptions.toX !== undefined &&
        this.motionOptions.duration > 0
      ) {
        const overallT = MathUtils.clamp(
          this.motionTime / Math.max(0.001, this.motionOptions.duration),
          0,
          1
        );
        this.x = MathUtils.lerp(this.motionOptions.fromX, this.motionOptions.toX, overallT);
      }
      if (
        this.motionOptions.fromY !== undefined &&
        this.motionOptions.toY !== undefined &&
        this.motionOptions.duration > 0
      ) {
        const overallT = MathUtils.clamp(
          this.motionTime / Math.max(0.001, this.motionOptions.duration),
          0,
          1
        );
        this.y = MathUtils.lerp(this.motionOptions.fromY, this.motionOptions.toY, overallT);
      }

      // Automatic blinking & particle updates
      this._blinkTimer += safeDt;
      if (this._blinkTimer > 3.6) {
        this._blinkTimer = 0;
      }

      // Compute forward & inverse kinematics
      this.computeForwardKinematics();

      // Capture onion-skin ghost snapshot if enabled
      if (this.ghosting.enabled && safeDt > 0) {
        this.ghosting._timer += safeDt;
        if (this.ghosting._timer >= this.ghosting.interval) {
          this.ghosting._timer = 0;
          this.ghosting._snapshots.unshift(this._cloneJointSnapshot());
          if (this.ghosting._snapshots.length > this.ghosting.maxFrames) {
            this.ghosting._snapshots.length = this.ghosting.maxFrames;
          }
        }
      }

      return this;
    }

    _cloneJointSnapshot() {
      const snap = {};
      Object.keys(this.joints).forEach((k) => {
        snap[k] = {
          x: this.joints[k].x,
          y: this.joints[k].y,
          angle: this.joints[k].angle
        };
      });
      snap.headRadius =
        this.proportions.headRadius *
        this.scale *
        ((Math.abs(this.scaleX) + Math.abs(this.scaleY)) * 0.5);
      snap.lineWidth = this.lineWidth * this.scale;
      return snap;
    }

    /**
     * Computes exact world-space positions for all 18 skeletal nodes and facial
     * landmarks, then applies any active 2-Bone IK solvers.
     */
    computeForwardKinematics() {
      const p = this.proportions;
      const pose = this.pose;
      const sx = this.scale * this.scaleX * (pose.squashX || 1);
      const sy = this.scale * this.scaleY * (pose.stretchY || 1);
      const avgScale = (Math.abs(sx) + Math.abs(sy)) * 0.5;
      const dir = this.facing >= 0 ? 1 : -1;

      const standingLegHeight = (p.upperLegLength + p.lowerLegLength) * sy;

      // Pelvis world coordinates (`this.y` represents floor contact Y when offsetY=0)
      const pelvisX = this.x + (pose.offsetX || 0) * dir * sx;
      const pelvisY = this.y - standingLegHeight + (pose.offsetY || 0) * sy;

      const globalRotRad = MathUtils.degToRad((this.rotation || 0) + (pose.bodyRotation || 0) * dir);

      // Helper to step from a parent joint along an angle in degrees
      // Angle convention: 0 deg = straight down (+Y), +90 deg = facing direction (+X * dir)
      // For torso/neck/head going UPWARD from pelvis: 0 deg = straight up (-Y), +deg = lean forward (+X * dir)
      const stepUp = (ox, oy, deg, len) => {
        const rad = MathUtils.degToRad(deg * dir) + globalRotRad;
        return {
          x: ox + Math.sin(rad) * len * avgScale,
          y: oy - Math.cos(rad) * len * avgScale,
          rad
        };
      };

      const stepDown = (ox, oy, deg, len) => {
        const rad = MathUtils.degToRad(deg * dir) - globalRotRad;
        return {
          x: ox + Math.sin(rad) * len * avgScale,
          y: oy + Math.cos(rad) * len * avgScale,
          rad
        };
      };

      // 1. Pelvis & Spine
      this.joints.pelvis = { name: "pelvis", x: pelvisX, y: pelvisY, angle: pose.torso };
      this.joints.leftHip = { name: "leftHip", x: pelvisX, y: pelvisY, angle: pose.torso };
      this.joints.rightHip = { name: "rightHip", x: pelvisX, y: pelvisY, angle: pose.torso };

      const torsoEnd = stepUp(pelvisX, pelvisY, pose.torso, p.torsoLength);
      this.joints.torso = {
        name: "torso",
        x: torsoEnd.x,
        y: torsoEnd.y,
        angle: pose.torso
      };

      // Shoulders (slightly below top of torso)
      const shoulderLen = Math.max(0, p.torsoLength - p.shoulderOffset);
      const shoulderBase = stepUp(pelvisX, pelvisY, pose.torso, shoulderLen);
      const leftShoulderY = shoulderBase.y + (pose.leftShoulderOffsetY || 0) * sy;
      const rightShoulderY = shoulderBase.y + (pose.rightShoulderOffsetY || 0) * sy;

      this.joints.leftShoulder = {
        name: "leftShoulder",
        x: shoulderBase.x,
        y: leftShoulderY,
        angle: pose.torso
      };
      this.joints.rightShoulder = {
        name: "rightShoulder",
        x: shoulderBase.x,
        y: rightShoulderY,
        angle: pose.torso
      };

      // 2. Neck & Head
      const neckDeg = pose.torso + (pose.neck || 0);
      const neckEnd = stepUp(torsoEnd.x, torsoEnd.y, neckDeg, p.neckLength);
      this.joints.neck = { name: "neck", x: neckEnd.x, y: neckEnd.y, angle: neckDeg };

      const headDeg = neckDeg + (pose.head || 0);
      const headCenter = stepUp(neckEnd.x, neckEnd.y, headDeg, p.headRadius);
      this.joints.head = {
        name: "head",
        x: headCenter.x,
        y: headCenter.y,
        angle: headDeg,
        radius: p.headRadius * avgScale
      };

      // Facial Feature Positions (Eyes, Eyebrows, Mouth)
      const hr = p.headRadius * avgScale;
      const headForwardX = Math.cos(headCenter.rad) * dir;
      const headForwardY = Math.sin(headCenter.rad) * dir;
      const headUpX = Math.sin(headCenter.rad);
      const headUpY = -Math.cos(headCenter.rad);

      const gazeShift = (pose.headLook || 0) * hr * 0.15;
      const eyeForwardOffset = hr * 0.32 + gazeShift;
      const eyeSpread = hr * 0.24;

      this.joints.leftEye = {
        name: "leftEye",
        x: headCenter.x + headForwardX * (eyeForwardOffset - eyeSpread * 0.5) + headUpX * (hr * 0.12),
        y: headCenter.y + headForwardY * (eyeForwardOffset - eyeSpread * 0.5) + headUpY * (hr * 0.12),
        angle: headDeg
      };
      this.joints.rightEye = {
        name: "rightEye",
        x: headCenter.x + headForwardX * (eyeForwardOffset + eyeSpread * 0.5) + headUpX * (hr * 0.12),
        y: headCenter.y + headForwardY * (eyeForwardOffset + eyeSpread * 0.5) + headUpY * (hr * 0.12),
        angle: headDeg
      };
      this.joints.leftEyebrow = {
        name: "leftEyebrow",
        x: this.joints.leftEye.x + headUpX * (hr * 0.24),
        y: this.joints.leftEye.y + headUpY * (hr * 0.24),
        angle: headDeg
      };
      this.joints.rightEyebrow = {
        name: "rightEyebrow",
        x: this.joints.rightEye.x + headUpX * (hr * 0.24),
        y: this.joints.rightEye.y + headUpY * (hr * 0.24),
        angle: headDeg
      };
      this.joints.mouth = {
        name: "mouth",
        x: headCenter.x + headForwardX * (hr * 0.34) - headUpX * (hr * 0.32),
        y: headCenter.y + headForwardY * (hr * 0.34) - headUpY * (hr * 0.32),
        angle: headDeg
      };

      // 3. Left Arm Chain (Shoulder -> Elbow -> Wrist -> Hand)
      let lUpperArmDeg = pose.leftUpperArm - pose.torso * 0.5;
      let lLowerArmDeg = lUpperArmDeg + pose.leftLowerArm;
      if (this.ikTargets.leftArm) {
        const ik = IKSolver.solveTwoBoneIK(
          this.joints.leftShoulder.x,
          this.joints.leftShoulder.y,
          this.ikTargets.leftArm.x,
          this.ikTargets.leftArm.y,
          p.upperArmLength * avgScale,
          p.lowerArmLength * avgScale,
          this.ikTargets.leftArm.bendDir * dir
        );
        lUpperArmDeg = ik.upperAngleDeg * dir;
        lLowerArmDeg = (ik.upperAngleDeg + ik.lowerAngleDeg) * dir;
      }

      const lElbow = stepDown(
        this.joints.leftShoulder.x,
        this.joints.leftShoulder.y,
        lUpperArmDeg,
        p.upperArmLength
      );
      const lWrist = stepDown(lElbow.x, lElbow.y, lLowerArmDeg, p.lowerArmLength);
      const lHandDeg = lLowerArmDeg + (pose.leftWrist || 0) + (pose.leftHand || 0);
      const lHand = stepDown(lWrist.x, lWrist.y, lHandDeg, p.handLength);

      this.joints.leftUpperArm = { name: "leftUpperArm", x: lElbow.x, y: lElbow.y, angle: lUpperArmDeg };
      this.joints.leftElbow = { name: "leftElbow", x: lElbow.x, y: lElbow.y, angle: lUpperArmDeg };
      this.joints.leftLowerArm = { name: "leftLowerArm", x: lWrist.x, y: lWrist.y, angle: lLowerArmDeg };
      this.joints.leftWrist = { name: "leftWrist", x: lWrist.x, y: lWrist.y, angle: lLowerArmDeg };
      this.joints.leftHand = { name: "leftHand", x: lHand.x, y: lHand.y, angle: lHandDeg };

      // 4. Right Arm Chain
      let rUpperArmDeg = pose.rightUpperArm - pose.torso * 0.5;
      let rLowerArmDeg = rUpperArmDeg + pose.rightLowerArm;
      if (this.ikTargets.rightArm) {
        const ik = IKSolver.solveTwoBoneIK(
          this.joints.rightShoulder.x,
          this.joints.rightShoulder.y,
          this.ikTargets.rightArm.x,
          this.ikTargets.rightArm.y,
          p.upperArmLength * avgScale,
          p.lowerArmLength * avgScale,
          this.ikTargets.rightArm.bendDir * dir
        );
        rUpperArmDeg = ik.upperAngleDeg * dir;
        rLowerArmDeg = (ik.upperAngleDeg + ik.lowerAngleDeg) * dir;
      }

      const rElbow = stepDown(
        this.joints.rightShoulder.x,
        this.joints.rightShoulder.y,
        rUpperArmDeg,
        p.upperArmLength
      );
      const rWrist = stepDown(rElbow.x, rElbow.y, rLowerArmDeg, p.lowerArmLength);
      const rHandDeg = rLowerArmDeg + (pose.rightWrist || 0) + (pose.rightHand || 0);
      const rHand = stepDown(rWrist.x, rWrist.y, rHandDeg, p.handLength);

      this.joints.rightUpperArm = { name: "rightUpperArm", x: rElbow.x, y: rElbow.y, angle: rUpperArmDeg };
      this.joints.rightElbow = { name: "rightElbow", x: rElbow.x, y: rElbow.y, angle: rUpperArmDeg };
      this.joints.rightLowerArm = { name: "rightLowerArm", x: rWrist.x, y: rWrist.y, angle: rLowerArmDeg };
      this.joints.rightWrist = { name: "rightWrist", x: rWrist.x, y: rWrist.y, angle: rLowerArmDeg };
      this.joints.rightHand = { name: "rightHand", x: rHand.x, y: rHand.y, angle: rHandDeg };

      // 5. Left Leg Chain (Hip -> Knee -> Ankle -> Foot)
      let lUpperLegDeg = pose.leftUpperLeg;
      let lLowerLegDeg = lUpperLegDeg + pose.leftLowerLeg;
      if (this.ikTargets.leftLeg) {
        const ik = IKSolver.solveTwoBoneIK(
          pelvisX,
          pelvisY,
          this.ikTargets.leftLeg.x,
          this.ikTargets.leftLeg.y,
          p.upperLegLength * avgScale,
          p.lowerLegLength * avgScale,
          this.ikTargets.leftLeg.bendDir * dir
        );
        lUpperLegDeg = ik.upperAngleDeg * dir;
        lLowerLegDeg = (ik.upperAngleDeg + ik.lowerAngleDeg) * dir;
      }

      const lKnee = stepDown(pelvisX, pelvisY, lUpperLegDeg, p.upperLegLength);
      const lAnkle = stepDown(lKnee.x, lKnee.y, lLowerLegDeg, p.lowerLegLength);
      const lFootDeg = lLowerLegDeg + 85 + (pose.leftFoot || 0);
      const lFoot = stepDown(lAnkle.x, lAnkle.y, lFootDeg, p.footLength);

      this.joints.leftUpperLeg = { name: "leftUpperLeg", x: lKnee.x, y: lKnee.y, angle: lUpperLegDeg };
      this.joints.leftKnee = { name: "leftKnee", x: lKnee.x, y: lKnee.y, angle: lUpperLegDeg };
      this.joints.leftLowerLeg = { name: "leftLowerLeg", x: lAnkle.x, y: lAnkle.y, angle: lLowerLegDeg };
      this.joints.leftAnkle = { name: "leftAnkle", x: lAnkle.x, y: lAnkle.y, angle: lLowerLegDeg };
      this.joints.leftFoot = { name: "leftFoot", x: lFoot.x, y: lFoot.y, angle: lFootDeg };

      // 6. Right Leg Chain
      let rUpperLegDeg = pose.rightUpperLeg;
      let rLowerLegDeg = rUpperLegDeg + pose.rightLowerLeg;
      if (this.ikTargets.rightLeg) {
        const ik = IKSolver.solveTwoBoneIK(
          pelvisX,
          pelvisY,
          this.ikTargets.rightLeg.x,
          this.ikTargets.rightLeg.y,
          p.upperLegLength * avgScale,
          p.lowerLegLength * avgScale,
          this.ikTargets.rightLeg.bendDir * dir
        );
        rUpperLegDeg = ik.upperAngleDeg * dir;
        rLowerLegDeg = (ik.upperAngleDeg + ik.lowerAngleDeg) * dir;
      }

      const rKnee = stepDown(pelvisX, pelvisY, rUpperLegDeg, p.upperLegLength);
      const rAnkle = stepDown(rKnee.x, rKnee.y, rLowerLegDeg, p.lowerLegLength);
      const rFootDeg = rLowerLegDeg + 85 + (pose.rightFoot || 0);
      const rFoot = stepDown(rAnkle.x, rAnkle.y, rFootDeg, p.footLength);

      this.joints.rightUpperLeg = { name: "rightUpperLeg", x: rKnee.x, y: rKnee.y, angle: rUpperLegDeg };
      this.joints.rightKnee = { name: "rightKnee", x: rKnee.x, y: rKnee.y, angle: rUpperLegDeg };
      this.joints.rightLowerLeg = { name: "rightLowerLeg", x: rAnkle.x, y: rAnkle.y, angle: rLowerLegDeg };
      this.joints.rightAnkle = { name: "rightAnkle", x: rAnkle.x, y: rAnkle.y, angle: rLowerLegDeg };
      this.joints.rightFoot = { name: "rightFoot", x: rFoot.x, y: rFoot.y, angle: rFootDeg };

      return this.joints;
    }

    // ------------------------------------------------------------------------
    // Rendering (Ghost Trails, Back Limbs, Spine, Head, Facial Features, Front Limbs)
    // ------------------------------------------------------------------------

    render(ctx, options = {}) {
      if (!this.visible || this.opacity <= 0) return;

      ctx.save();
      const baseAlpha = ctx.globalAlpha * this.opacity;

      // 1. Render Onion-Skin Ghosting Snapshots (if enabled and not in reflection pass)
      if (
        this.ghosting.enabled &&
        !options.isReflection &&
        this.ghosting._snapshots.length > 0
      ) {
        const count = this.ghosting._snapshots.length;
        for (let i = count - 1; i >= 0; i--) {
          const snap = this.ghosting._snapshots[i];
          const falloff = (count - i) / (count + 1);
          ctx.save();
          ctx.globalAlpha = baseAlpha * this.ghosting.opacity * falloff;
          this._renderSkeletonFromJoints(
            ctx,
            snap,
            this.ghosting.color || this.color,
            this.ghosting.color || this.headColor,
            snap.lineWidth || this.lineWidth * this.scale,
            true
          );
          ctx.restore();
        }
      }

      // 2. Render Main Character Skeleton
      ctx.globalAlpha = baseAlpha;
      const scaledLineWidth = Math.max(
        1.5,
        this.lineWidth * this.scale * ((Math.abs(this.scaleX) + Math.abs(this.scaleY)) * 0.5)
      );

      this._renderSkeletonFromJoints(
        ctx,
        this.joints,
        this.color,
        this.headColor,
        scaledLineWidth,
        false
      );

      ctx.restore();
    }

    _renderSkeletonFromJoints(ctx, j, strokeColor, headFillColor, lw, isGhost) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const isNeuron = this.style === "neuron" || this.style === "chunky" || this.style === "garishidup" || this.style === "capsule";
      const isGaris = this.style === "garishidup" || this.style === "capsule";
      const borderW = isNeuron ? Math.max(3, this.outlineWidth * this.scale) : 0;

      const drawSegment = (p1, p2, width, color, alphaMult = 1, isBackLimb = false) => {
        if (!p1 || !p2) return;
        ctx.save();
        if (isNeuron && !isGhost) {
          if (this.glowColor && !isBackLimb) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = this.glowBlur * this.scale;
          }
          // Outer dark border stroke
          ctx.strokeStyle = this.outlineColor;
          ctx.lineWidth = width + borderW;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.shadowBlur = 0;
          // Inner fill stroke (shaded gray for back limbs, bright white for front limbs)
          ctx.strokeStyle = isBackLimb ? this.backLimbColor : color;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        } else {
          ctx.globalAlpha *= alphaMult;
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      };

      const backAlpha = isGhost ? 0.85 : this.backLimbOpacity;

      // Back Leg (Left Leg)
      drawSegment(j.pelvis, j.leftKnee, lw * 0.96, strokeColor, backAlpha, true);
      drawSegment(j.leftKnee, j.leftAnkle, lw * 0.88, strokeColor, backAlpha, true);
      drawSegment(j.leftAnkle, j.leftFoot, lw * 0.78, strokeColor, backAlpha, true);

      // Back Arm (Left Arm)
      drawSegment(j.leftShoulder, j.leftElbow, lw * 0.88, strokeColor, backAlpha, true);
      drawSegment(j.leftElbow, j.leftWrist, lw * 0.80, strokeColor, backAlpha, true);
      drawSegment(j.leftWrist, j.leftHand, lw * 0.72, strokeColor, backAlpha, true);

      // Torso & Neck
      drawSegment(j.pelvis, j.torso, isGaris ? lw * 1.65 : isNeuron ? lw * 1.35 : lw * 1.12, strokeColor, 1, false);
      drawSegment(j.torso, j.neck, lw * 0.92, strokeColor, 1, false);

      // Head
      const headRadius =
        (j.head && j.head.radius) ||
        j.headRadius ||
        this.proportions.headRadius * this.scale;
      if (j.head) {
        ctx.save();
        if (isNeuron && !isGhost && this.glowColor) {
          ctx.shadowColor = this.glowColor;
          ctx.shadowBlur = this.glowBlur * this.scale;
        }
        ctx.beginPath();
        ctx.arc(j.head.x, j.head.y, headRadius, 0, TWO_PI);
        if (this.style === "outlined") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
          ctx.lineWidth = lw * 0.85;
          ctx.strokeStyle = strokeColor;
          ctx.stroke();
        } else if (isNeuron) {
          if (isGaris) {
            const grad = ctx.createRadialGradient(
              j.head.x - headRadius * 0.28,
              j.head.y - headRadius * 0.28,
              headRadius * 0.1,
              j.head.x,
              j.head.y,
              headRadius
            );
            grad.addColorStop(0, headFillColor);
            grad.addColorStop(1, this.backLimbColor || headFillColor);
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = headFillColor;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.lineWidth = Math.max(2, borderW * 0.55);
          ctx.strokeStyle = this.outlineColor;
          ctx.stroke();
        } else {
          ctx.fillStyle = headFillColor;
          ctx.fill();
        }
        ctx.restore();

        // Facial Expressions (skipped for ghost snapshots or 'minimalist' / 'neuron' style)
        const activeExpr = this.pose.expression || this.expression;
        if (
          !isGhost &&
          this.style !== "minimalist" &&
          !isNeuron &&
          activeExpr !== "minimalist"
        ) {
          this._renderFacialExpression(ctx, j, headRadius, activeExpr);
        } else if (!isGhost && activeExpr === "sleeping") {
          this._renderSleepZzz(ctx, j.head, headRadius);
        }
      }

      // Front Leg (Right Leg)
      drawSegment(j.pelvis, j.rightKnee, lw * 0.98, strokeColor, 1, false);
      drawSegment(j.rightKnee, j.rightAnkle, lw * 0.90, strokeColor, 1, false);
      drawSegment(j.rightAnkle, j.rightFoot, lw * 0.80, strokeColor, 1, false);

      // Front Arm (Right Arm)
      drawSegment(j.rightShoulder, j.rightElbow, lw * 0.90, strokeColor, 1, false);
      drawSegment(j.rightElbow, j.rightWrist, lw * 0.82, strokeColor, 1, false);
      drawSegment(j.rightWrist, j.rightHand, lw * 0.74, strokeColor, 1, false);

      // Hand Props (Paintbrush, Ruler, or Overhead Painting Canvas)
      if (!isGhost && this.handProps) {
        this._renderHandProps(ctx, j);
      }
    }

    _renderFacialExpression(ctx, j, hr, expr) {
      if (!j.leftEye || !j.rightEye || !j.mouth) return;

      // Determine contrasting feature color (white on dark head, dark on light head)
      const isLightHead =
        /^#([fF]{3}|[fF]{6}|[eE][0-9a-fA-F]{5}|[dD][0-9a-fA-F]{5})$/.test(
          String(this.headColor).trim()
        ) || this.style === "outlined";
      const featureColor = isLightHead ? "#111111" : "#FFFFFF";

      ctx.save();
      ctx.strokeStyle = featureColor;
      ctx.fillStyle = featureColor;
      ctx.lineWidth = Math.max(1.2, hr * 0.12);
      ctx.lineCap = "round";

      const isBlinking =
        this._blinkTimer > 3.45 ||
        expr === "sleeping" ||
        expr === "laughing" ||
        expr === "crying";

      // 1. Eyes
      const eyeR = Math.max(1.4, hr * 0.12);
      [j.leftEye, j.rightEye].forEach((eye) => {
        ctx.beginPath();
        if (isBlinking) {
          ctx.moveTo(eye.x - eyeR * 1.2, eye.y);
          ctx.lineTo(eye.x + eyeR * 1.2, eye.y);
          ctx.stroke();
        } else if (expr === "happy") {
          ctx.arc(eye.x, eye.y + eyeR * 0.4, eyeR * 1.1, Math.PI, TWO_PI);
          ctx.stroke();
        } else if (expr === "surprised" || expr === "scared") {
          ctx.arc(eye.x, eye.y, eyeR * 1.35, 0, TWO_PI);
          ctx.fill();
        } else {
          ctx.arc(eye.x, eye.y, eyeR, 0, TWO_PI);
          ctx.fill();
        }
      });

      // 2. Eyebrows
      const browLen = hr * 0.22;
      const dir = this.facing >= 0 ? 1 : -1;
      let leftBrowTilt = 0;
      let rightBrowTilt = 0;
      if (expr === "angry" || expr === "focused") {
        leftBrowTilt = 0.35 * dir;
        rightBrowTilt = -0.35 * dir;
      } else if (expr === "sad" || expr === "crying" || expr === "scared") {
        leftBrowTilt = -0.3 * dir;
        rightBrowTilt = 0.3 * dir;
      } else if (expr === "confused" || expr === "thinking") {
        leftBrowTilt = -0.25 * dir;
        rightBrowTilt = 0.35 * dir;
      }

      if (j.leftEyebrow && j.rightEyebrow) {
        ctx.beginPath();
        ctx.moveTo(j.leftEyebrow.x - browLen, j.leftEyebrow.y - browLen * leftBrowTilt);
        ctx.lineTo(j.leftEyebrow.x + browLen, j.leftEyebrow.y + browLen * leftBrowTilt);
        ctx.moveTo(j.rightEyebrow.x - browLen, j.rightEyebrow.y - browLen * rightBrowTilt);
        ctx.lineTo(j.rightEyebrow.x + browLen, j.rightEyebrow.y + browLen * rightBrowTilt);
        ctx.stroke();
      }

      // 3. Mouth
      const mx = j.mouth.x;
      const my = j.mouth.y;
      const mw = hr * 0.28;
      ctx.beginPath();
      if (this.pose.mouthOpen > 0.1) {
        ctx.arc(mx, my, mw * (0.4 + this.pose.mouthOpen * 0.5), 0, TWO_PI);
        ctx.fill();
      } else if (expr === "happy" || expr === "laughing") {
        ctx.arc(mx, my - mw * 0.2, mw, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      } else if (expr === "sad" || expr === "crying" || expr === "scared") {
        ctx.arc(mx, my + mw * 0.6, mw * 0.9, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
      } else if (expr === "surprised") {
        ctx.arc(mx, my, mw * 0.55, 0, TWO_PI);
        ctx.stroke();
      } else if (expr === "angry") {
        ctx.moveTo(mx - mw, my + mw * 0.2);
        ctx.lineTo(mx + mw, my - mw * 0.15);
        ctx.stroke();
      } else {
        ctx.moveTo(mx - mw * 0.7, my);
        ctx.lineTo(mx + mw * 0.7, my);
        ctx.stroke();
      }

      ctx.restore();

      if (expr === "sleeping") {
        this._renderSleepZzz(ctx, j.head, hr);
      }
    }

    _renderSleepZzz(ctx, headJoint, hr) {
      ctx.save();
      ctx.fillStyle = this.color;
      const phase = (this.motionTime * 0.9) % 1;
      for (let i = 0; i < 2; i++) {
        const p = (phase + i * 0.5) % 1;
        const zx = headJoint.x + (10 + p * 18) * (this.facing >= 0 ? 1 : -1);
        const zy = headJoint.y - hr - 8 - p * 26;
        const size = Math.round(hr * (0.65 + p * 0.45));
        ctx.globalAlpha = Math.sin(p * Math.PI) * 0.75 * this.opacity;
        ctx.font = `bold ${size}px monospace`;
        ctx.fillText("z", zx, zy);
      }
      ctx.restore();
    }

    _renderHandProps(ctx, j) {
      const s = this.scale;
      const dir = this.facing >= 0 ? 1 : -1;

      // Right hand prop (e.g. paintbrush)
      if (this.handProps.right && j.rightHand) {
        const hp = this.handProps.right;
        ctx.save();
        ctx.translate(j.rightHand.x, j.rightHand.y);
        const angleRad = MathUtils.degToRad((j.rightHand.angle || 45) * dir - 35 * dir);
        ctx.rotate(angleRad);
        // Brush handle
        ctx.fillStyle = hp.color || "#E53935";
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.roundRect(-3 * s, -26 * s, 6 * s, 26 * s, 2 * s);
        ctx.fill();
        ctx.stroke();
        // Brush bristles tip
        ctx.fillStyle = hp.tipColor || "#FFB300";
        ctx.beginPath();
        ctx.arc(0, -29 * s, 4 * s, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
      }

      // Held overhead painting canvas (when holding up finished artwork at 00:10-00:14)
      if (this.handProps.overheadCanvas && j.head) {
        const art = this.handProps.overheadCanvas;
        const cw = (art.width || 165) * s;
        const ch = (art.height || 120) * s;
        const cx = j.head.x + (art.offsetX || 0) * s;
        const cy = j.head.y - (this.proportions.headRadius * s + ch * 0.72);
        StickmanObject.drawLandscapeArtwork(ctx, cx - cw * 0.5, cy - ch * 0.5, cw, ch, {
          tier: art.tier !== undefined ? art.tier : 3,
          progress: art.progress !== undefined ? art.progress : 1,
          borderColor: "#FFFFFF"
        });
      }
    }
  }

  // ==========================================================================
  // SECTION 5: SCENE OBJECTS & FAJR CINEMATIC PROPS
  // ==========================================================================

  let _objectAutoId = 1;

  /**
   * Represents a renderable scene prop or UI graphic (including architectural
   * and storytelling props from the Fajr stickman video).
   *
   * Supported `type` values:
   * - 'bed': Minimalist side-profile bed with headboard, pillow, and blanket
   * - 'nightstand': Bedside table with optional glowing phone
   * - 'prayerMat': Low-profile prayer mat (sajadah) with fringe
   * - 'flipCalendar': Wall calendar ("DAY 1" .. "DAY 40") with animated falling pages
   * - 'digitalClock': Rounded digital clock widget ("4:40" + "🔔 FAJR 4:40")
   * - 'nightWindow': Framed night window with crescent moon, stars, and city/mosque silhouette
   * - 'soundwaveRipple': Concentric expanding alarm soundwave circles
   * - 'phoneOverlayUI': iPhone Fajr alarm modal ("Swipe to wake up for Fajr" / Arabic text)
   * - 'typewriterText': Multi-line text with character-by-character typewriter effect
   * - 'rect' / 'box', 'circle', 'line', 'text', 'custom'
   */
  class StickmanObject {
    constructor(config = {}) {
      this.id = config.id || `obj_${_objectAutoId++}`;
      this.type = config.type || "rect";
      this.x = config.x !== undefined ? Number(config.x) : 0;
      this.y = config.y !== undefined ? Number(config.y) : 0;
      this.width = config.width !== undefined ? Number(config.width) : 100;
      this.height = config.height !== undefined ? Number(config.height) : 100;
      this.radius = config.radius !== undefined ? Number(config.radius) : 40;
      this.rotation = config.rotation !== undefined ? Number(config.rotation) : 0;
      this.scale = config.scale !== undefined ? Number(config.scale) : 1;
      this.zIndex = config.zIndex !== undefined ? Number(config.zIndex) : 5;
      this.visible = config.visible !== undefined ? Boolean(config.visible) : true;
      this.opacity = config.opacity !== undefined ? Number(config.opacity) : 1;
      this.reflectable =
        config.reflectable !== undefined
          ? Boolean(config.reflectable)
          : ["bed", "nightstand", "prayerMat", "rect", "box", "circle"].includes(this.type);

      this.color = config.color || "#555555";
      this.SecondaryColor = config.secondaryColor || "#333333";
      this.strokeColor = config.strokeColor || null;
      this.lineWidth = config.lineWidth || 2;
      this.facing = config.facing === "left" || config.facing === -1 ? -1 : 1;

      // Custom prop properties (for calendar, clock, typewriter, ripples, custom render)
      this.props = Object.assign({}, config.props || {}, config);
      this.onRender = typeof config.render === "function" ? config.render : null;
      this._elapsed = 0;
    }

    setPosition(x, y) {
      if (x !== undefined) this.x = Number(x);
      if (y !== undefined) this.y = Number(y);
      return this;
    }

    setProps(newProps = {}) {
      Object.assign(this.props, newProps);
      if (newProps.x !== undefined) this.x = newProps.x;
      if (newProps.y !== undefined) this.y = newProps.y;
      if (newProps.opacity !== undefined) this.opacity = newProps.opacity;
      if (newProps.visible !== undefined) this.visible = newProps.visible;
      return this;
    }

    update(dt) {
      this._elapsed += Math.max(0, Number(dt) || 0);
    }

    render(ctx, options = {}) {
      if (!this.visible || this.opacity <= 0) return;
      if (options.isReflection && !this.reflectable) return;

      ctx.save();
      ctx.globalAlpha *= this.opacity;
      ctx.translate(this.x, this.y);
      if (this.rotation) ctx.rotate(MathUtils.degToRad(this.rotation));
      if (this.scale !== 1) ctx.scale(this.scale, this.scale);

      switch (this.type) {
        case "bed":
          this._renderBed(ctx);
          break;
        case "nightstand":
          this._renderNightstand(ctx);
          break;
        case "prayerMat":
          this._renderPrayerMat(ctx);
          break;
        case "flipCalendar":
          this._renderFlipCalendar(ctx);
          break;
        case "digitalClock":
          this._renderDigitalClock(ctx);
          break;
        case "nightWindow":
          this._renderNightWindow(ctx);
          break;
        case "soundwaveRipple":
          this._renderSoundwaveRipple(ctx);
          break;
        case "phoneOverlayUI":
          this._renderPhoneOverlayUI(ctx);
          break;
        case "typewriterText":
          this._renderTypewriterText(ctx);
          break;
        case "loketCounter":
          this._renderLoketCounter(ctx);
          break;
        case "hangingSign":
          this._renderHangingSign(ctx);
          break;
        case "queueFloorStrip":
          this._renderQueueFloorStrip(ctx);
          break;
        case "speechBubble":
          this._renderSpeechBubble(ctx);
          break;
        case "highlightedTitle":
          this._renderHighlightedTitle(ctx);
          break;
        case "hangingLamp":
          this._renderHangingLamp(ctx);
          break;
        case "artCabinet":
          this._renderArtCabinet(ctx);
          break;
        case "easel":
          this._renderEasel(ctx);
          break;
        case "canvasPile":
          this._renderCanvasPile(ctx);
          break;
        case "sparkle":
          this._renderSparkle(ctx);
          break;
        case "motor":
          this._renderMotor(ctx);
          break;
        case "mobil":
          this._renderMobil(ctx);
          break;
        case "markaParkir":
          this._renderMarkaParkir(ctx);
          break;
        case "circle":
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(0, 0, this.radius, 0, TWO_PI);
          ctx.fill();
          if (this.strokeColor) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
          }
          break;
        case "line":
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.lineWidth;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(this.props.x2 || this.width, this.props.y2 || 0);
          ctx.stroke();
          break;
        case "text":
          ctx.fillStyle = this.color;
          ctx.font = this.props.font || "bold 28px monospace";
          ctx.textAlign = this.props.align || "center";
          ctx.textBaseline = this.props.baseline || "middle";
          ctx.fillText(String(this.props.text || ""), 0, 0);
          break;
        case "custom":
          if (this.onRender) this.onRender(ctx, this, options);
          break;
        case "rect":
        case "box":
        default:
          ctx.fillStyle = this.color;
          ctx.fillRect(0, 0, this.width, this.height);
          if (this.strokeColor) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeRect(0, 0, this.width, this.height);
          }
          break;
      }

      ctx.restore();
    }

    // ------------------------------------------------------------------------
    // Specialized Renderers for the Fajr Video Props
    // ------------------------------------------------------------------------

    /**
     * Renders a minimalist side-profile bed anchored at (x, y = floor level).
     */
    _renderBed(ctx) {
      const w = this.width || 270;
      const h = this.height || 95;
      const dir = this.facing >= 0 ? 1 : -1;

      ctx.save();
      if (dir === -1) {
        ctx.scale(-1, 1);
      }

      // Headboard (on left side in local space, i.e., outer wall side)
      ctx.fillStyle = "#3A3A3A";
      ctx.fillRect(0, -h, 16, h);

      // Footboard
      ctx.fillRect(w - 14, -h * 0.68, 14, h * 0.68);

      // Bed frame & Mattress
      ctx.fillStyle = "#4A4A4A";
      ctx.fillRect(14, -h * 0.45, w - 26, h * 0.28);

      // Pillow
      ctx.fillStyle = "#7A7A7A";
      ctx.beginPath();
      ctx.roundRect(22, -h * 0.62, 48, 16, 6);
      ctx.fill();

      // Blanket / Duvet
      ctx.fillStyle = "#666666";
      ctx.beginPath();
      ctx.roundRect(58, -h * 0.60, w - 74, 24, [10, 12, 0, 0]);
      ctx.fill();

      ctx.restore();
    }

    /**
     * Renders a bedside nightstand with a smartphone on top.
     */
    _renderNightstand(ctx) {
      const w = this.width || 48;
      const h = this.height || 76;

      ctx.fillStyle = "#484848";
      ctx.fillRect(0, -h, w, h);
      ctx.fillStyle = "#2E2E2E";
      ctx.fillRect(5, -h + 8, w - 10, h * 0.35);

      // Phone on top of nightstand
      if (this.props.hasPhone !== false) {
        const glowing = Boolean(this.props.phoneGlowing);
        if (glowing) {
          const grad = ctx.createRadialGradient(w * 0.5, -h - 4, 2, w * 0.5, -h - 4, 34);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.75)");
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(w * 0.5, -h - 4, 34, 0, TWO_PI);
          ctx.fill();
        }
        ctx.fillStyle = glowing ? "#FFFFFF" : "#888888";
        ctx.fillRect(w * 0.25, -h - 5, w * 0.5, 5);
      }
    }

    /**
     * Renders a flat prayer mat (sajadah) on the floor.
     */
    _renderPrayerMat(ctx) {
      const w = this.width || 135;
      const h = this.height || 5;
      ctx.fillStyle = this.color || "#6E6E6E";
      ctx.fillRect(-w * 0.5, -h, w, h);
      // Tassels / fringe on both ends
      ctx.fillStyle = "#AAAAAA";
      ctx.fillRect(-w * 0.5 - 6, -h + 1, 6, h - 1);
      ctx.fillRect(w * 0.5, -h + 1, 6, h - 1);
    }

    /**
     * Renders the wall-mounted flip calendar ("DAY 1" to "DAY 40") with falling sheets.
     */
    _renderFlipCalendar(ctx) {
      const w = this.width || 220;
      const h = this.height || 210;
      const day = this.props.day !== undefined ? this.props.day : 1;
      const fallingPages = this.props.fallingPages || [];

      // Outer backing board
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 10);
      ctx.fill();

      // Top dark header strip & binding rings
      ctx.fillStyle = "#1E1E1E";
      ctx.fillRect(-w * 0.5 + 8, -h * 0.5 + 8, w - 16, 12);
      ctx.fillStyle = "#BBBBBB";
      ctx.fillRect(-w * 0.28, -h * 0.5 - 10, 12, 24);
      ctx.fillRect(w * 0.28 - 12, -h * 0.5 - 10, 12, 24);

      // "DAY" label
      ctx.fillStyle = "#222222";
      ctx.font = `bold ${Math.round(h * 0.12)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DAY", 0, -h * 0.18);

      // Day Number
      ctx.fillStyle = "#111111";
      ctx.font = `bold ${Math.round(h * 0.42)}px sans-serif`;
      ctx.fillText(String(day), 0, h * 0.14);

      // Render translucent falling/peeling sheets if active
      fallingPages.forEach((fp) => {
        ctx.save();
        ctx.globalAlpha *= fp.opacity !== undefined ? fp.opacity : 0.35;
        ctx.translate(fp.offsetX || 0, fp.offsetY || 35);
        ctx.rotate(MathUtils.degToRad(fp.angle || -12));
        ctx.fillStyle = "#EAEAEA";
        ctx.beginPath();
        ctx.roundRect(-w * 0.48, -h * 0.45, w * 0.96, h * 0.9, 8);
        ctx.fill();
        ctx.fillStyle = "#222222";
        ctx.font = `bold ${Math.round(h * 0.11)}px monospace`;
        ctx.fillText("DAY", 0, -h * 0.16);
        ctx.font = `bold ${Math.round(h * 0.38)}px sans-serif`;
        ctx.fillText(String(fp.day !== undefined ? fp.day : day), 0, h * 0.14);
        ctx.restore();
      });
    }

    /**
     * Renders the center Fajr digital clock widget ("4:40" + "🔔 FAJR 4:40").
     */
    _renderDigitalClock(ctx) {
      const w = this.width || 140;
      const h = this.height || 58;
      const timeText = this.props.time || "4:40";
      const subText = this.props.subText || "FAJR 4:40";

      ctx.fillStyle = "#161616";
      ctx.strokeStyle = "#3E3E3E";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(h * 0.52)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(timeText, 0, 2);

      if (subText) {
        ctx.fillStyle = "#9A9A9A";
        ctx.font = `bold ${Math.round(h * 0.25)}px monospace`;
        ctx.fillText(subText, 0, h * 0.85);
      }
    }

    /**
     * Renders the framed bedroom night window with crescent moon, stars & city/mosque skyline.
     */
    _renderNightWindow(ctx) {
      const w = this.width || 270;
      const h = this.height || 215;

      // Outer frame
      ctx.fillStyle = "#080808";
      ctx.strokeStyle = "#343434";
      ctx.lineWidth = 6;
      ctx.fillRect(-w * 0.5, -h * 0.5, w, h);

      // Stars
      ctx.fillStyle = "#BBBBBB";
      const stars = [
        [-0.36, -0.34, 1.5],
        [-0.18, -0.22, 1.2],
        [-0.28, -0.08, 1.4],
        [0.08, -0.35, 1.5],
        [0.35, -0.10, 1.3]
      ];
      stars.forEach(([sx, sy, sr]) => {
        ctx.beginPath();
        ctx.arc(sx * w, sy * h, sr, 0, TWO_PI);
        ctx.fill();
      });

      // Crescent / Full Moon
      const moonX = w * 0.22;
      const moonY = -h * 0.18;
      const moonR = Math.min(w, h) * 0.11;
      ctx.fillStyle = "#DCDCDC";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, TWO_PI);
      ctx.fill();
      if (this.props.crescent !== false) {
        ctx.fillStyle = "#080808";
        ctx.beginPath();
        ctx.arc(moonX - moonR * 0.45, moonY - moonR * 0.1, moonR * 0.88, 0, TWO_PI);
        ctx.fill();
      }

      // City / Mosque Silhouette Skyline at bottom of window
      ctx.fillStyle = "#1B1B1B";
      const baseY = h * 0.5;
      const buildings = [
        [-0.48, 0.18, 0.28],
        [-0.30, 0.20, 0.38],
        [-0.10, 0.16, 0.22],
        [0.06, 0.22, 0.34],
        [0.28, 0.20, 0.25]
      ];
      buildings.forEach(([bx, bw, bh]) => {
        ctx.fillRect(bx * w, baseY - bh * h, bw * w, bh * h);
      });

      // Tiny lit building windows
      ctx.fillStyle = "#888888";
      ctx.fillRect(-w * 0.24, baseY - h * 0.30, 6, 4);
      ctx.fillRect(-w * 0.24, baseY - h * 0.22, 6, 4);
      ctx.fillRect(w * 0.12, baseY - h * 0.26, 5, 4);

      // Window cross muntins & outer border
      ctx.strokeStyle = "#2E2E2E";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.5);
      ctx.lineTo(0, h * 0.5);
      ctx.stroke();

      ctx.strokeStyle = "#3A3A3A";
      ctx.lineWidth = 6;
      ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
    }

    /**
     * Renders expanding concentric soundwave circles (alarm ringing visual).
     */
    _renderSoundwaveRipple(ctx) {
      const count = this.props.waveCount || 3;
      const maxR = this.props.maxRadius || 680;
      const speed = this.props.speed || 0.55;
      const phase = (this._elapsed * speed) % 1;

      ctx.strokeStyle = this.color || "#FFFFFF";
      ctx.lineWidth = this.lineWidth || 1.5;

      for (let i = 0; i < count; i++) {
        const p = (phase + i / count) % 1;
        const r = Math.max(4, p * maxR);
        ctx.save();
        ctx.globalAlpha *= (1 - p) * 0.45;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TWO_PI);
        ctx.stroke();
        ctx.restore();
      }
    }

    /**
     * Renders the iPhone Fajr alarm card ("Swipe to wake up for Fajr").
     */
    _renderPhoneOverlayUI(ctx) {
      const w = this.width || 240;
      const h = this.height || 420;

      // Phone body & bezel
      ctx.fillStyle = "#101010";
      ctx.strokeStyle = "#555555";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 28);
      ctx.fill();
      ctx.stroke();

      // Dynamic Island notch
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.roundRect(-w * 0.16, -h * 0.45, w * 0.32, 12, 6);
      ctx.fill();

      // Header text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(w * 0.068)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this.props.title || "Swipe to wake up for Fajr",
        0,
        -h * 0.30
      );

      // 4 Sunrise swipe tracks
      const trackW = w * 0.80;
      const trackH = h * 0.11;
      for (let i = 0; i < 4; i++) {
        const ty = -h * 0.14 + i * (trackH + 12);
        ctx.fillStyle = "#1D1D1D";
        ctx.beginPath();
        ctx.roundRect(-trackW * 0.5, ty, trackW, trackH, trackH * 0.5);
        ctx.fill();

        const isRight = i === 2;
        const knobX = isRight
          ? trackW * 0.5 - trackH * 0.5
          : -trackW * 0.5 + trackH * 0.5;
        ctx.strokeStyle = "#777777";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(knobX, ty + trackH * 0.5, trackH * 0.42, 0, TWO_PI);
        ctx.stroke();

        // Arrows
        ctx.fillStyle = "#777777";
        ctx.font = `${Math.round(trackH * 0.42)}px monospace`;
        ctx.fillText(isRight ? "< < <" : "> > >", 0, ty + trackH * 0.52);
      }
    }

    /**
     * Renders multi-line text with optional typewriter progress `progress` in [0, 1].
     */
    _renderTypewriterText(ctx) {
      const fullText = String(this.props.text || "");
      const progress =
        this.props.progress !== undefined ? MathUtils.clamp(this.props.progress, 0, 1) : 1;
      const charCount = Math.floor(fullText.length * progress);
      const visibleText = fullText.slice(0, charCount);
      const lines = visibleText.split("\n");

      ctx.fillStyle = this.color || "#FFFFFF";
      ctx.font = this.props.font || "bold 28px monospace";
      ctx.textAlign = this.props.align || "center";
      ctx.textBaseline = "middle";

      const lineHeight = this.props.lineHeight || 40;
      lines.forEach((line, idx) => {
        ctx.fillText(line, 0, idx * lineHeight);
      });
    }

    // ------------------------------------------------------------------------
    // Specialized Renderers for "GARIS HIDUP - Antrean" Scene
    // ------------------------------------------------------------------------

    _renderLoketCounter(ctx) {
      const w = this.width || 110;
      const h = this.height || 140;

      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 4, w * 0.65, 10, 0, 0, TWO_PI);
      ctx.fill();

      ctx.fillStyle = "#525A61";
      ctx.strokeStyle = "#12161A";
      ctx.lineWidth = 3.5;
      ctx.fillRect(-w * 0.5, -h, w, h);
      ctx.strokeRect(-w * 0.5, -h, w, h);

      ctx.beginPath();
      ctx.moveTo(-w * 0.5, -h * 0.48);
      ctx.lineTo(w * 0.5, -h * 0.48);
      ctx.stroke();

      ctx.fillStyle = "#6C757D";
      ctx.fillRect(-w * 0.56, -h - 10, w * 1.12, 12);
      ctx.strokeRect(-w * 0.56, -h - 10, w * 1.12, 12);

      ctx.fillStyle = "#EAECEE";
      ctx.fillRect(-w * 0.36, -h - 16, 24, 6);
      ctx.strokeRect(-w * 0.36, -h - 16, 24, 6);

      ctx.fillStyle = "#BFC9CA";
      ctx.beginPath();
      ctx.arc(w * 0.22, -h - 10, 10, Math.PI, TWO_PI);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.22, -h - 22, 2.5, 0, TWO_PI);
      ctx.fill();
    }

    _renderHangingSign(ctx) {
      const w = this.width || 300;
      const h = this.height || 66;
      const wireLen = this.props.wireLength || 90;
      const bg = this.color || "#EAE6DF";
      const textColor = this.props.textColor || "#121518";
      const borderColor = this.strokeColor || "#2C353D";

      ctx.strokeStyle = "#566573";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.34, -h * 0.5);
      ctx.lineTo(-w * 0.34, -h * 0.5 - wireLen);
      ctx.moveTo(w * 0.34, -h * 0.5);
      ctx.lineTo(w * 0.34, -h * 0.5 - wireLen);
      ctx.stroke();

      ctx.fillStyle = bg;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 12);
      ctx.fill();
      ctx.stroke();

      const text = String(this.props.text || "ANTREAN");
      const hasArrow = Boolean(this.props.leftArrow);
      ctx.fillStyle = textColor;
      ctx.font = this.props.font || `bold ${Math.round(h * 0.44)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (hasArrow) {
        const ax = -w * 0.32;
        const ay = 0;
        const aw = h * 0.45;
        ctx.beginPath();
        ctx.moveTo(ax - aw * 0.5, ay);
        ctx.lineTo(ax, ay - aw * 0.38);
        ctx.lineTo(ax, ay - aw * 0.14);
        ctx.lineTo(ax + aw * 0.45, ay - aw * 0.14);
        ctx.lineTo(ax + aw * 0.45, ay + aw * 0.14);
        ctx.lineTo(ax, ay + aw * 0.14);
        ctx.lineTo(ax, ay + aw * 0.38);
        ctx.closePath();
        ctx.fill();
        ctx.fillText(text, w * 0.08, 2);
      } else {
        ctx.fillText(text, 0, 2);
      }
    }

    _renderQueueFloorStrip(ctx) {
      const w = this.width || 620;
      const h = this.height || 16;
      const activeRatio =
        this.props.activeRatio !== undefined
          ? MathUtils.clamp(this.props.activeRatio, 0, 1)
          : 1.0;

      const leftX = -w * 0.5;
      const activeW = w * activeRatio;

      ctx.fillStyle = "#5C4B2B";
      ctx.strokeStyle = "#1B1E23";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(leftX, -h * 0.5, w, h, h * 0.5);
      ctx.fill();
      ctx.stroke();

      if (activeW > 4) {
        ctx.save();
        ctx.shadowColor = "rgba(245, 176, 65, 0.65)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#F5B041";
        ctx.beginPath();
        ctx.roundRect(leftX, -h * 0.5, activeW, h, h * 0.5);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = "#1B1E23";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(leftX, -h * 0.5, activeW, h, h * 0.5);
        ctx.stroke();
      }

      const chevronCount = 7;
      ctx.strokeStyle = "rgba(255, 245, 210, 0.55)";
      ctx.lineWidth = 2;
      for (let i = 1; i <= chevronCount; i++) {
        const cx = leftX + (w / (chevronCount + 1)) * i;
        ctx.beginPath();
        ctx.moveTo(cx + 4, -h * 0.25);
        ctx.lineTo(cx - 3, 0);
        ctx.lineTo(cx + 4, h * 0.25);
        ctx.stroke();
      }
    }

    _renderSpeechBubble(ctx) {
      const text = String(this.props.text || "BENTAR DOANG");
      const w = this.width || Math.max(180, text.length * 18 + 36);
      const h = this.height || 54;
      const tailX = this.props.tailOffsetX || 0;

      ctx.save();
      ctx.fillStyle = "#F7F5F0";
      ctx.strokeStyle = "#181B20";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(-w * 0.5, -h, w, h, 12);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tailX - 10, -2);
      ctx.lineTo(tailX + 2, 26);
      ctx.lineTo(tailX + 12, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F7F5F0";
      ctx.fillRect(tailX - 9, -5, 20, 6);

      ctx.fillStyle = "#14171A";
      ctx.font = this.props.font || `bold ${Math.round(h * 0.40)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, -h * 0.5);
      ctx.restore();
    }

    _renderHighlightedTitle(ctx) {
      const progress =
        this.props.progress !== undefined
          ? MathUtils.clamp(this.props.progress, 0, 1)
          : 1;
      if (progress <= 0.01) return;

      const fontSize = this.props.fontSize || 42;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textBaseline = "middle";

      const line1Words = this.props.words1 || ["Antre", "itu", "bukan", "soal", "waktu."];
      const totalSteps = 7;
      const currentStep = progress * totalSteps;

      ctx.textAlign = "center";
      const visibleLine1 = line1Words
        .slice(0, Math.min(5, Math.ceil(currentStep)))
        .join(" ");
      if (visibleLine1) {
        ctx.fillStyle = "#F4F6F7";
        ctx.fillText(visibleLine1, 0, 0);
      }

      if (currentStep > 5.0) {
        const y2 = fontSize * 1.32;
        const showMenghargai = currentStep > 5.8;
        ctx.fillStyle = "#F4F6F7";
        if (!showMenghargai) {
          ctx.fillText("Soal", 0, y2);
        } else {
          const part1 = "Soal ";
          const part2 = this.props.words2 || "menghargai.";
          const w1 = ctx.measureText(part1).width;
          const w2 = ctx.measureText(part2).width;
          const x0 = -(w1 + w2) / 2;
          ctx.fillText(part1, x0 + w1 / 2, y2);
          ctx.fillStyle = "#F5B041";
          ctx.fillText(part2, x0 + w1 + w2 / 2, y2);
        }
      }
    }

    // ------------------------------------------------------------------------
    // Specialized Renderers untuk studio pelukis (edisi Maura Motion)
    // ------------------------------------------------------------------------

    /**
     * Renders an overhead pendant lamp with cord, dome shade, glowing bulb diffuser,
     * and a warm radial studio spotlight cone.
     */
    _renderHangingLamp(ctx) {
      const w = this.width || 160;
      const h = this.height || 54;
      const cordLen = this.props.cordLength || 220;
      const spotRadius = this.props.spotlightRadius || 540;
      const spotAlpha =
        this.props.spotlightOpacity !== undefined ? this.props.spotlightOpacity : 0.24;

      // 1. Warm radial spotlight cone illuminating the workspace below
      if (spotRadius > 0 && spotAlpha > 0) {
        const grad = ctx.createRadialGradient(
          0,
          spotRadius * 0.55,
          20,
          0,
          spotRadius * 0.55,
          spotRadius
        );
        grad.addColorStop(0, `rgba(245, 210, 170, ${spotAlpha})`);
        grad.addColorStop(0.55, `rgba(195, 155, 115, ${spotAlpha * 0.45})`);
        grad.addColorStop(1, "rgba(17, 16, 18, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, spotRadius * 0.55, spotRadius, 0, TWO_PI);
        ctx.fill();
      }

      // 2. Suspension cord from top of screen
      ctx.strokeStyle = "#4A4A4A";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -cordLen);
      ctx.lineTo(0, -h);
      ctx.stroke();

      // 3. Top fixture neck
      ctx.fillStyle = "#5A5A5A";
      ctx.fillRect(-10, -h - 10, 20, 12);

      // 4. Dome shade
      ctx.fillStyle = "#3E3E42";
      ctx.strokeStyle = "#222225";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.5, Math.PI, TWO_PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5. Glowing warm-white diffuser underside
      ctx.fillStyle = "#FFFDF8";
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.47, 11, 0, 0, TWO_PI);
      ctx.fill();
    }

    /**
     * Renders the central two-door art cabinet / workbench with neat brush cup & palette
     * on the left, messy paint splatters on the right, and `#1` / `#16` counters on the doors.
     */
    _renderArtCabinet(ctx) {
      const w = this.width || 560;
      const h = this.height || 230;

      // Shadow base
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 8, w * 0.54, 18, 0, 0, TWO_PI);
      ctx.fill();

      // Main cabinet body
      ctx.fillStyle = "#1D1D20";
      ctx.strokeStyle = "#101012";
      ctx.lineWidth = 4;
      ctx.fillRect(-w * 0.5, -h, w, h);
      ctx.strokeRect(-w * 0.5, -h, w, h);

      // Top counter lip
      ctx.fillStyle = "#2A2A2E";
      ctx.fillRect(-w * 0.52, -h - 12, w * 1.04, 14);
      ctx.strokeRect(-w * 0.52, -h - 12, w * 1.04, 14);

      // Left & Right cabinet doors
      const doorW = w * 0.46;
      const doorH = h * 0.82;
      ctx.fillStyle = "#161619";
      ctx.fillRect(-w * 0.48, -h + h * 0.1, doorW, doorH);
      ctx.strokeRect(-w * 0.48, -h + h * 0.1, doorW, doorH);
      ctx.fillRect(w * 0.02, -h + h * 0.1, doorW, doorH);
      ctx.strokeRect(w * 0.02, -h + h * 0.1, doorW, doorH);

      // Center door handles
      ctx.strokeStyle = "#D8D8D8";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-14, -h * 0.55);
      ctx.lineTo(-14, -h * 0.38);
      ctx.moveTo(14, -h * 0.55);
      ctx.lineTo(14, -h * 0.38);
      ctx.stroke();

      // Door Counter Texts (e.g. "#1" on left, "#1" .. "#16" on right)
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(h * 0.14)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (this.props.leftCountText) {
        ctx.fillText(String(this.props.leftCountText), -w * 0.25, -h * 0.45);
      }
      if (this.props.rightCountText) {
        ctx.fillText(String(this.props.rightCountText), w * 0.25, -h * 0.45);
      }

      // Left Tabletop Props (Perfectionist: Red Brush Cup + Neat Palette)
      const topY = -h - 12;
      ctx.fillStyle = "#C62828";
      ctx.fillRect(-w * 0.42, topY - 28, 18, 28);
      // Brushes in cup
      ctx.strokeStyle = "#8D6E63";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-w * 0.41, topY - 28);
      ctx.lineTo(-w * 0.43, topY - 42);
      ctx.moveTo(-w * 0.39, topY - 28);
      ctx.lineTo(-w * 0.38, topY - 44);
      ctx.stroke();

      // Neat wooden palette on left
      ctx.fillStyle = "#D7B377";
      ctx.beginPath();
      ctx.ellipse(-w * 0.16, topY - 4, 28, 8, 0, 0, TWO_PI);
      ctx.fill();
      ["#E53935", "#FDD835", "#1E88E5", "#43A047"].forEach((c, idx) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(-w * 0.19 + idx * 9, topY - 5, 3, 0, TWO_PI);
        ctx.fill();
      });

      // Right Tabletop Props (Action Taker: Colorful Paint Splatters)
      const splatterCount = this.props.splatterLevel !== undefined ? this.props.splatterLevel : 8;
      const splatColors = ["#1E88E5", "#E53935", "#FDD835", "#8E24AA", "#FB8C00", "#43A047"];
      for (let i = 0; i < splatterCount; i++) {
        ctx.fillStyle = splatColors[i % splatColors.length];
        const sx = w * 0.05 + ((i * 37) % Math.round(w * 0.38));
        const sy = topY - 2 - (i % 3) * 3;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 6 + (i % 4) * 2, 2.5, 0, 0, TWO_PI);
        ctx.fill();
      }
    }

    /**
     * Renders a tabletop wooden A-frame easel with an evolving landscape painting.
     */
    _renderEasel(ctx) {
      const w = this.width || 165;
      const h = this.height || 120;
      const tier = this.props.tier !== undefined ? this.props.tier : 1;
      const progress = this.props.progress !== undefined ? this.props.progress : 1;
      const hasCanvas = this.props.hasCanvas !== false;

      // Wooden A-frame easel legs & mast extending above and below canvas
      ctx.strokeStyle = "#795548";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      // Left leg
      ctx.moveTo(0, -h - 24);
      ctx.lineTo(-w * 0.35, 16);
      // Right leg
      ctx.moveTo(0, -h - 24);
      ctx.lineTo(w * 0.35, 16);
      // Center mast
      ctx.moveTo(0, -h - 28);
      ctx.lineTo(0, 16);
      ctx.stroke();

      // Horizontal shelf bar
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(-w * 0.54, -8, w * 1.08, 8);

      // Canvas on easel
      if (hasCanvas) {
        StickmanObject.drawLandscapeArtwork(ctx, -w * 0.5, -h - 6, w, h, {
          tier,
          progress,
          borderColor: "#FFFFFF"
        });
      }
    }

    /**
     * Renders the growing stack of completed landscape paintings on the floor in front
     * of the cabinet, plus an optional mid-air flying canvas being tossed!
     */
    _renderCanvasPile(ctx) {
      const count = Math.max(0, Math.floor(this.props.count || 0));
      const w = this.width || 165;
      const h = this.height || 110;

      // Draw up to 10 visible stacked canvases with deterministic angles
      const visibleCount = Math.min(count, 10);
      for (let i = 0; i < visibleCount; i++) {
        const actualNum = count - visibleCount + i + 1;
        const tier = actualNum <= 3 ? 1 : actualNum <= 7 ? 2 : 3;
        const angleDeg = ((actualNum * 19) % 28) - 14;
        const ox = ((actualNum * 13) % 26) - 13;
        const oy = -i * 4;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(MathUtils.degToRad(angleDeg));
        StickmanObject.drawLandscapeArtwork(ctx, -w * 0.5, -h * 0.5, w, h, {
          tier,
          progress: 1,
          borderColor: "#FFFFFF"
        });
        ctx.restore();
      }

      // Optional mid-air tossed canvas
      if (this.props.flyingCanvas && this.props.flyingCanvas.active) {
        const fc = this.props.flyingCanvas;
        const p = MathUtils.clamp(fc.progress || 0, 0, 1);
        const fx = MathUtils.lerp(fc.fromX || 90, 0, p);
        const fy =
          MathUtils.lerp(fc.fromY || -280, -visibleCount * 4, p) -
          Math.sin(p * Math.PI) * 65;
        const fRot = MathUtils.lerp(-15, 25, p);

        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(MathUtils.degToRad(fRot));
        StickmanObject.drawLandscapeArtwork(ctx, -w * 0.48, -h * 0.48, w * 0.96, h * 0.96, {
          tier: fc.tier || 2,
          progress: 1,
          borderColor: "#FFFFFF"
        });
        ctx.restore();
      }
    }

    /**
     * Renders twinkling "+" sparkle icons around a triumphant character.
     */
    _renderSparkle(ctx) {
      const s = this.scale || 1;
      const pulse = 0.65 + 0.35 * Math.sin(this._elapsed * 6);
      ctx.save();
      ctx.strokeStyle = this.color || "#FFFFFF";
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";

      const points = this.props.points || [
        [-115, -45, 10],
        [115, 30, 8],
        [-95, 55, 7]
      ];
      points.forEach(([px, py, rad], idx) => {
        const r = rad * pulse * (idx % 2 === 0 ? 1 : 0.85);
        ctx.beginPath();
        ctx.moveTo(px - r, py);
        ctx.lineTo(px + r, py);
        ctx.moveTo(px, py - r);
        ctx.lineTo(px, py + r);
        ctx.stroke();
      });
      ctx.restore();
    }

    _renderMotor(ctx) {
      const w = this.width || 200;
      const h = this.height || 120;
      ctx.save();
      ctx.strokeStyle = "#C8CDD2";
      ctx.fillStyle = "#2A2F36";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      // dua roda
      [[-w*0.32,0],[w*0.32,0]].forEach(([rx,ry]) => {
        ctx.beginPath(); ctx.arc(rx, ry, h*0.22, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      });
      // bodi
      ctx.strokeStyle = this.color || "#E74C3C";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-w*0.32, -h*0.1); ctx.lineTo(-w*0.05, -h*0.45);
      ctx.lineTo(w*0.25, -h*0.42); ctx.lineTo(w*0.32, -h*0.05);
      ctx.stroke();
      // setang + jok
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(w*0.25, -h*0.42); ctx.lineTo(w*0.30, -h*0.62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w*0.18, -h*0.48); ctx.lineTo(w*0.05, -h*0.48); ctx.stroke();
      // miring jika jatuh
      ctx.restore();
    }

    _renderMobil(ctx) {
      const w = this.width || 320;
      const h = this.height || 130;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath(); ctx.ellipse(0, 4, w*0.48, 10, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = this.color || "#5D6D7E";
      ctx.strokeStyle = "#12161A";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w*0.5, -h*0.55, w, h*0.55, 14);
      ctx.fill(); ctx.stroke();
      // kabin + kaca
      ctx.fillStyle = "#1B2631";
      ctx.beginPath();
      ctx.roundRect(-w*0.28, -h*0.95, w*0.56, h*0.42, 12);
      ctx.fill(); ctx.stroke();
      // roda
      ctx.fillStyle = "#15181C";
      [[-w*0.32],[w*0.32]].forEach(([rx]) => {
        ctx.beginPath(); ctx.arc(rx, 0, h*0.20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#7F8C8D";
        ctx.beginPath(); ctx.arc(rx, 0, h*0.09, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#15181C";
      });
      // lampu
      ctx.fillStyle = "#F9E79F";
      ctx.fillRect(w*0.5-8, -h*0.42, 8, 12);
    }

    _renderMarkaParkir(ctx) {
      const w = this.width || 620;
      const h = this.height || 16;
      const n = this.props.slots || 5;
      ctx.strokeStyle = "#F4F6F7";
      ctx.lineWidth = 5;
      ctx.globalAlpha *= 0.85;
      // garis dasar
      ctx.beginPath(); ctx.moveTo(-w*0.5, 0); ctx.lineTo(w*0.5, 0); ctx.stroke();
      // sekat slot
      for (let i = 0; i <= n; i++) {
        const x = -w*0.5 + (w/n)*i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, -h*3.2); ctx.stroke();
      }
      ctx.globalAlpha /= 0.85;
    }

    /**
     * Static helper that draws the 3-tier evolving landscape artwork on any canvas
     * (used on the easels, the flying tossed canvas, the floor stack, and held overhead).
     * - Tier 1 (#1-#3): Simple blue sky, yellow sun, crude brown triangles, blue water
     * - Tier 2 (#4-#7): Deeper sky, twin mountains with snow caps, clouds, water reflection
     * - Tier 3 (#8-#16 & Perfectionist final): Rich purple-orange sunset gradient,
     *   starry twilight sky, layered mountain silhouettes, glowing sunset reflection on lake
     */
    static drawLandscapeArtwork(ctx, x, y, w, h, opts = {}) {
      const tier = opts.tier !== undefined ? opts.tier : 3;
      const progress =
        opts.progress !== undefined ? MathUtils.clamp(opts.progress, 0, 1) : 1;

      ctx.save();
      // White canvas base & border
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#18181B";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();

      const pad = 4;
      const ix = x + pad;
      const iy = y + pad;
      const iw = w - pad * 2;
      const ih = h - pad * 2;

      if (progress <= 0.02) {
        ctx.restore();
        return;
      }

      ctx.beginPath();
      ctx.rect(ix, iy, iw, ih);
      ctx.clip();

      if (tier === 0) {
        // Early Perfectionist warm airbrush glow on white canvas (00:01 - 00:04)
        const radGrad = ctx.createRadialGradient(
          ix + iw * 0.5,
          iy + ih * 0.55,
          4,
          ix + iw * 0.5,
          iy + ih * 0.55,
          iw * 0.45 * progress
        );
        radGrad.addColorStop(0, "rgba(255, 167, 38, 0.85)");
        radGrad.addColorStop(1, "rgba(255, 167, 38, 0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(ix, iy, iw, ih);
      } else if (tier === 1) {
        // Tier 1: Simple blue sky + yellow sun + brown triangles + blue water
        ctx.fillStyle = "#2979FF";
        ctx.fillRect(ix, iy, iw, ih * 0.72 * progress);
        if (progress > 0.3) {
          ctx.fillStyle = "#0D47A1";
          ctx.fillRect(ix, iy + ih * 0.72, iw, ih * 0.28);
          // Sun
          ctx.fillStyle = "#FFEA00";
          ctx.beginPath();
          ctx.arc(ix + iw * 0.75, iy + ih * 0.26, ih * 0.11, 0, TWO_PI);
          ctx.fill();
        }
        if (progress > 0.55) {
          // Crude brown mountain triangle
          ctx.fillStyle = "#6D4C41";
          ctx.beginPath();
          ctx.moveTo(ix + iw * 0.08, iy + ih * 0.72);
          ctx.lineTo(ix + iw * 0.36, iy + ih * 0.28);
          ctx.lineTo(ix + iw * 0.66, iy + ih * 0.72);
          ctx.closePath();
          ctx.fill();
        }
      } else if (tier === 2) {
        // Tier 2: Crisp sky, snow-capped dual mountains, clouds & water
        const skyG = ctx.createLinearGradient(0, iy, 0, iy + ih * 0.72);
        skyG.addColorStop(0, "#1565C0");
        skyG.addColorStop(1, "#64B5F6");
        ctx.fillStyle = skyG;
        ctx.fillRect(ix, iy, iw, ih * 0.72 * progress);

        ctx.fillStyle = "#0D47A1";
        ctx.fillRect(ix, iy + ih * 0.72, iw, ih * 0.28);

        if (progress > 0.4) {
          // Mountains
          ctx.fillStyle = "#5D4037";
          ctx.beginPath();
          ctx.moveTo(ix + iw * 0.05, iy + ih * 0.72);
          ctx.lineTo(ix + iw * 0.34, iy + ih * 0.24);
          ctx.lineTo(ix + iw * 0.65, iy + ih * 0.72);
          ctx.fill();

          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(ix + iw * 0.42, iy + ih * 0.72);
          ctx.lineTo(ix + iw * 0.72, iy + ih * 0.32);
          ctx.lineTo(ix + iw * 0.96, iy + ih * 0.72);
          ctx.fill();
        }
      } else {
        // Tier 3: Masterpiece purple-orange twilight sunset + mountains + lake reflection
        const skyG = ctx.createLinearGradient(0, iy, 0, iy + ih * 0.74);
        skyG.addColorStop(0, "#1A0933");
        skyG.addColorStop(0.5, "#6A1B4D");
        skyG.addColorStop(1, "#FF8F00");
        ctx.fillStyle = skyG;
        ctx.fillRect(ix, iy, iw, ih * 0.74 * Math.min(1, progress * 1.2));

        if (progress > 0.35) {
          // Dark lake water at bottom
          ctx.fillStyle = "#120824";
          ctx.fillRect(ix, iy + ih * 0.74, iw, ih * 0.26);

          // Glowing sun on horizon
          ctx.fillStyle = "#FFF176";
          ctx.beginPath();
          ctx.arc(ix + iw * 0.5, iy + ih * 0.68, ih * 0.09, 0, TWO_PI);
          ctx.fill();
        }

        if (progress > 0.6) {
          // Left & Right mountain ranges framing sunset
          ctx.fillStyle = "#23112B";
          ctx.beginPath();
          ctx.moveTo(ix, iy + ih * 0.74);
          ctx.lineTo(ix + iw * 0.26, iy + ih * 0.34);
          ctx.lineTo(ix + iw * 0.48, iy + ih * 0.74);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#190B21";
          ctx.beginPath();
          ctx.moveTo(ix + iw * 0.46, iy + ih * 0.74);
          ctx.lineTo(ix + iw * 0.76, iy + ih * 0.30);
          ctx.lineTo(ix + iw, iy + ih * 0.74);
          ctx.closePath();
          ctx.fill();

          // Shimmering sunset reflection lines on water
          ctx.strokeStyle = "#FFB74D";
          ctx.lineWidth = 1.8;
          for (let r = 0; r < 4; r++) {
            const ry = iy + ih * (0.78 + r * 0.05);
            const rw = iw * (0.18 - r * 0.03);
            ctx.beginPath();
            ctx.moveTo(ix + iw * 0.5 - rw, ry);
            ctx.lineTo(ix + iw * 0.5 + rw, ry);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    }
  }

  // ==========================================================================
  // SECTION 6: CAMERA & SCENE ENGINE (WITH FLOOR REFLECTION & TRANSITIONS)
  // ==========================================================================

  /**
   * 2D Virtual Camera supporting Pan, Zoom, Target Follow, and Procedural Shake.
   */
  class StickmanCamera {
    constructor(config = {}) {
      this.x = config.x !== undefined ? Number(config.x) : 0;
      this.y = config.y !== undefined ? Number(config.y) : 0;
      this.zoom = config.zoom !== undefined ? Number(config.zoom) : 1;
      this.rotation = config.rotation !== undefined ? Number(config.rotation) : 0;

      // Target pan/zoom interpolation
      this._panAnim = null;
      this._zoomAnim = null;

      // Follow target state
      this.followTarget = null;
      this.followSmoothing = 0.12;
      this.followOffsetX = 0;
      this.followOffsetY = 0;

      // Shake state
      this._shakeIntensity = 0;
      this._shakeDuration = 0;
      this._shakeElapsed = 0;
      this._shakeFrequency = 28;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    pan(x, y) {
      this.x = Number(x) || 0;
      this.y = Number(y) || 0;
      this._panAnim = null;
      return this;
    }

    panTo(targetX, targetY, duration = 1.0, easing = "easeInOutCubic") {
      if (duration <= 0) return this.pan(targetX, targetY);
      this._panAnim = {
        startX: this.x,
        startY: this.y,
        targetX: Number(targetX),
        targetY: Number(targetY),
        duration: Number(duration),
        elapsed: 0,
        easing: Easing.resolve(easing)
      };
      return this;
    }

    setZoom(zoom) {
      this.zoom = Math.max(0.05, Number(zoom) || 1);
      this._zoomAnim = null;
      return this;
    }

    zoomTo(targetZoom, duration = 1.0, easing = "easeInOutCubic") {
      if (duration <= 0) return this.setZoom(targetZoom);
      this._zoomAnim = {
        startZoom: this.zoom,
        targetZoom: Math.max(0.05, Number(targetZoom)),
        duration: Number(duration),
        elapsed: 0,
        easing: Easing.resolve(easing)
      };
      return this;
    }

    follow(target, options = {}) {
      this.followTarget = target;
      this.followSmoothing =
        options.smoothing !== undefined ? Number(options.smoothing) : 0.12;
      this.followOffsetX = Number(options.offsetX) || 0;
      this.followOffsetY = Number(options.offsetY) || 0;
      return this;
    }

    stopFollow() {
      this.followTarget = null;
      return this;
    }

    shake(intensity = 12, duration = 0.4, frequency = 30) {
      this._shakeIntensity = Number(intensity);
      this._shakeDuration = Number(duration);
      this._shakeFrequency = Number(frequency);
      this._shakeElapsed = 0;
      return this;
    }

    reset() {
      this.x = 0;
      this.y = 0;
      this.zoom = 1;
      this.rotation = 0;
      this._panAnim = null;
      this._zoomAnim = null;
      this.followTarget = null;
      this._shakeDuration = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      return this;
    }

    update(dt, viewportWidth = 1920, viewportHeight = 1080) {
      const safeDt = Math.max(0, Number(dt) || 0);

      if (this._panAnim) {
        this._panAnim.elapsed += safeDt;
        const t = MathUtils.clamp(this._panAnim.elapsed / this._panAnim.duration, 0, 1);
        const e = this._panAnim.easing(t);
        this.x = MathUtils.lerp(this._panAnim.startX, this._panAnim.targetX, e);
        this.y = MathUtils.lerp(this._panAnim.startY, this._panAnim.targetY, e);
        if (t >= 1) this._panAnim = null;
      }

      if (this._zoomAnim) {
        this._zoomAnim.elapsed += safeDt;
        const t = MathUtils.clamp(this._zoomAnim.elapsed / this._zoomAnim.duration, 0, 1);
        const e = this._zoomAnim.easing(t);
        this.zoom = MathUtils.lerp(this._zoomAnim.startZoom, this._zoomAnim.targetZoom, e);
        if (t >= 1) this._zoomAnim = null;
      }

      if (this.followTarget) {
        const tx =
          (this.followTarget.x || 0) + this.followOffsetX - viewportWidth * 0.5;
        const ty =
          (this.followTarget.y || 0) + this.followOffsetY - viewportHeight * 0.65;
        this.x = MathUtils.damp(this.x, tx, this.followSmoothing, safeDt);
        this.y = MathUtils.damp(this.y, ty, this.followSmoothing, safeDt);
      }

      if (this._shakeDuration > 0 && this._shakeElapsed < this._shakeDuration) {
        this._shakeElapsed += safeDt;
        const decay = 1 - MathUtils.clamp(this._shakeElapsed / this._shakeDuration, 0, 1);
        const phase = this._shakeElapsed * this._shakeFrequency;
        this.shakeOffsetX = MathUtils.noise1D(phase, 1) * this._shakeIntensity * decay;
        this.shakeOffsetY = MathUtils.noise1D(phase, 2) * this._shakeIntensity * decay;
      } else {
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      }
    }

    applyTransform(ctx, viewportWidth, viewportHeight) {
      const cx = viewportWidth * 0.5;
      const cy = viewportHeight * 0.5;
      ctx.translate(cx + this.shakeOffsetX, cy + this.shakeOffsetY);
      ctx.scale(this.zoom, this.zoom);
      if (this.rotation) ctx.rotate(MathUtils.degToRad(this.rotation));
      ctx.translate(-cx - this.x, -cy - this.y);
    }
  }

  /**
   * Represents a Scene container with background styling, floor reflection
   * settings, and scene-level objects.
   */
  class StickmanScene {
    constructor(config = {}) {
      this.id = config.id || "default_scene";
      this.name = config.name || this.id;
      this.background =
        config.background !== undefined ? config.background : "#0D0D0D";
      this.transparent = Boolean(config.transparent);
      this.floorY = config.floorY !== undefined ? Number(config.floorY) : null;
      this.floorColor = config.floorColor || "#141414";
      this.floorLineColor = config.floorLineColor || "#383838";

      // Floor Reflection Settings (matches the mirrored floor in the Fajr video)
      const refl = config.reflection || {};
      this.reflection = {
        enabled: Boolean(refl.enabled),
        opacity: refl.opacity !== undefined ? Number(refl.opacity) : 0.16,
        maxDepth: refl.maxDepth || 260
      };

      this.onRenderBackground =
        typeof config.onRenderBackground === "function" ? config.onRenderBackground : null;
      this.onRenderForeground =
        typeof config.onRenderForeground === "function" ? config.onRenderForeground : null;
    }

    renderBackground(ctx, width, height) {
      if (this.transparent) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      if (typeof this.background === "object" && this.background !== null) {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        const stops = this.background.stops || [
          [0, this.background.from || "#0B0B0B"],
          [1, this.background.to || "#1A1A1A"]
        ];
        stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = this.background || "#0D0D0D";
      }
      ctx.fillRect(0, 0, width, height);

      if (this.floorY !== null) {
        ctx.fillStyle = this.floorColor;
        ctx.fillRect(-width, this.floorY, width * 3, height * 2);
        if (this.floorLineColor) {
          ctx.strokeStyle = this.floorLineColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-width, this.floorY);
          ctx.lineTo(width * 2, this.floorY);
          ctx.stroke();
        }
      }

      if (this.onRenderBackground) {
        this.onRenderBackground(ctx, width, height, this);
      }
    }
  }

  // ==========================================================================
  // SECTION 7: ANIMATION TIMELINE ENGINE (SEQUENTIAL, PARALLEL & SYNC)
  // ==========================================================================

  /**
   * Timeline controller supporting scheduled character motions, camera tracks,
   * prop property tracks, scene transitions, and frame-accurate deterministic seeking.
   *
   * @example
   * timeline.add(hero, "walk", { start: 0, duration: 3 });
   * timeline.add(hero, "jump", { start: 3, duration: 1 });
   * timeline.add(hero, "wave", { start: 4, duration: 2 });
   */
  class StickmanTimeline {
    constructor(kit = null, config = {}) {
      this.kit = kit;
      this.id = config.id || "main_timeline";
      this.entries = [];
      this.cameraTracks = [];
      this.objectTracks = [];
      this.callbacks = [];
      this.currentTime = 0;
      this.loop = Boolean(config.loop);
      this.isPlaying = true;
    }

    /**
     * Adds a character motion clip to the timeline.
     *
     * @param {Stickman|string} target - Stickman instance or ID
     * @param {string} motionName - Motion preset name (e.g., 'walk', 'jump', 'pray')
     * @param {Object} [options={}]
     * @param {number} [options.start] - Start time in seconds (defaults to end of target's last clip)
     * @param {number} [options.duration=1] - Duration in seconds
     * @param {number} [options.end] - Optional explicit end time (overrides duration)
     * @param {number} [options.speed=1] - Motion playback speed
     * @param {number} [options.fromX] - Optional start X position
     * @param {number} [options.toX] - Optional end X position
     * @param {number} [options.fromY] - Optional start Y position
     * @param {number} [options.toY] - Optional end Y position
     * @param {number|string} [options.facing] - Facing direction override
     * @param {string} [options.expression] - Facial expression override
     * @param {boolean} [options.ghosting] - Enable/disable onion-skin ghosting during clip
     */
    add(target, motionName, options = {}) {
      const targetId = typeof target === "string" ? target : target && target.id;
      let start = options.start;
      if (start === undefined) {
        start = this.getLastEndTimeForTarget(targetId);
      }
      start = Math.max(0, Number(start) || 0);

      const preset = StickmanMotions[motionName];
      const defaultDur = (preset && preset.defaultDuration) || 1.0;
      const duration =
        options.end !== undefined
          ? Math.max(0.01, Number(options.end) - start)
          : options.duration !== undefined
          ? Math.max(0.01, Number(options.duration))
          : defaultDur;

      const entry = {
        id: `clip_${this.entries.length + 1}`,
        target,
        targetId,
        motionName,
        start,
        duration,
        end: start + duration,
        speed: options.speed !== undefined ? Number(options.speed) : 1,
        loop:
          options.loop !== undefined
            ? Boolean(options.loop)
            : Boolean(preset && preset.loop),
        fromX: options.fromX,
        toX: options.toX,
        fromY: options.fromY,
        toY: options.toY,
        facing: options.facing,
        expression: options.expression,
        ghosting: options.ghosting,
        easing: Easing.resolve(options.easing || "linear"),
        onStart: options.onStart || null,
        onUpdate: options.onUpdate || null,
        onComplete: options.onComplete || null,
        _started: false,
        _completed: false
      };

      this.entries.push(entry);
      return this;
    }

    /**
     * Adds a sequential chain of clips for one or more characters.
     */
    sequence(clips = []) {
      let cursor = this.getTotalDuration();
      clips.forEach((c) => {
        const dur = c.duration !== undefined ? Number(c.duration) : 1.0;
        this.add(c.target, c.motion, Object.assign({}, c, { start: cursor, duration: dur }));
        cursor += dur;
      });
      return this;
    }

    /**
     * Synchronizes two or more characters to perform an interaction simultaneously
     * (e.g., handshake, highFive, hug, pray).
     */
    sync(characters = [], motionName = "handshake", options = {}) {
      const start =
        options.start !== undefined ? Number(options.start) : this.getTotalDuration();
      const duration = options.duration !== undefined ? Number(options.duration) : 1.5;

      characters.forEach((char, idx) => {
        const facing =
          options.autoFace !== false && characters.length === 2
            ? idx === 0
              ? 1
              : -1
            : undefined;
        this.add(
          char,
          motionName,
          Object.assign({}, options, { start, duration, facing })
        );
      });
      return this;
    }

    /**
     * Schedules a camera pan/zoom/shake keyframe cue on the timeline.
     */
    addCamera(options = {}) {
      const start = Number(options.start) || 0;
      const duration = options.duration !== undefined ? Number(options.duration) : 1.0;
      this.cameraTracks.push({
        start,
        duration,
        end: start + duration,
        fromX: options.fromX,
        toX: options.toX !== undefined ? options.toX : options.x,
        fromY: options.fromY,
        toY: options.toY !== undefined ? options.toY : options.y,
        fromZoom: options.fromZoom,
        toZoom: options.toZoom !== undefined ? options.toZoom : options.zoom,
        shakeIntensity: options.shakeIntensity || options.shake || 0,
        easing: Easing.resolve(options.easing || "easeInOutCubic"),
        _triggered: false
      });
      return this;
    }

    /**
     * Schedules property animations or custom callbacks for scene props/objects.
     */
    addObjectTrack(targetObj, options = {}) {
      const start = Number(options.start) || 0;
      const duration = options.duration !== undefined ? Number(options.duration) : 1.0;
      this.objectTracks.push({
        target: targetObj,
        start,
        duration,
        end: start + duration,
        from: options.from || {},
        to: options.to || {},
        onUpdate: options.onUpdate || null,
        easing: Easing.resolve(options.easing || "linear")
      });
      return this;
    }

    /**
     * Schedules a custom event callback at a specific timestamp in seconds.
     */
    addEvent(timeSeconds, callback) {
      this.callbacks.push({
        time: Number(timeSeconds) || 0,
        callback,
        _fired: false
      });
      return this;
    }

    getLastEndTimeForTarget(targetId) {
      let maxEnd = 0;
      this.entries.forEach((e) => {
        if (!targetId || e.targetId === targetId) {
          if (e.end > maxEnd) maxEnd = e.end;
        }
      });
      return maxEnd;
    }

    getTotalDuration() {
      let maxEnd = 0;
      this.entries.forEach((e) => {
        if (e.end > maxEnd) maxEnd = e.end;
      });
      this.cameraTracks.forEach((c) => {
        if (c.end > maxEnd) maxEnd = c.end;
      });
      this.objectTracks.forEach((o) => {
        if (o.end > maxEnd) maxEnd = o.end;
      });
      return maxEnd;
    }

    reset() {
      this.currentTime = 0;
      this.entries.forEach((e) => {
        e._started = false;
        e._completed = false;
      });
      this.cameraTracks.forEach((c) => {
        c._triggered = false;
      });
      this.callbacks.forEach((cb) => {
        cb._fired = false;
      });
      return this;
    }

    clear() {
      this.entries = [];
      this.cameraTracks = [];
      this.objectTracks = [];
      this.callbacks = [];
      this.currentTime = 0;
      return this;
    }

    /**
     * Advances the timeline by `dt` seconds.
     */
    update(dt) {
      if (!this.isPlaying) return;
      const safeDt = Math.max(0, Number(dt) || 0);
      this.seek(this.currentTime + safeDt, safeDt);
    }

    /**
     * Deterministically evaluates the entire timeline at `timeSeconds`.
     */
    seek(timeSeconds, stepDt = 0) {
      const totalDur = this.getTotalDuration();
      let t = Math.max(0, Number(timeSeconds) || 0);
      if (this.loop && totalDur > 0 && t > totalDur) {
        this.reset();
        t = t % totalDur;
      }
      this.currentTime = t;

      // 1. Fire scheduled point callbacks
      this.callbacks.forEach((cb) => {
        if (!cb._fired && t >= cb.time) {
          cb._fired = true;
          if (typeof cb.callback === "function") cb.callback(t, this);
        }
      });

      // 2. Evaluate character clips
      this.entries.forEach((entry) => {
        const char = this._resolveCharacter(entry.target, entry.targetId);
        if (!char) return;

        if (t >= entry.start && t <= entry.end) {
          if (!entry._started) {
            entry._started = true;
            if (entry.facing !== undefined) char.setFacing(entry.facing);
            if (entry.expression !== undefined) char.setExpression(entry.expression);
            if (entry.ghosting !== undefined) char.setGhosting(entry.ghosting);
            char.play(entry.motionName, {
              duration: entry.duration,
              speed: entry.speed,
              loop: entry.loop
            });
            if (entry.onStart) entry.onStart(char, entry);
          }

          const localElapsed = (t - entry.start) * entry.speed;
          const progress = MathUtils.clamp((t - entry.start) / entry.duration, 0, 1);
          const easedP = entry.easing(progress);

          if (entry.fromX !== undefined && entry.toX !== undefined) {
            char.x = MathUtils.lerp(entry.fromX, entry.toX, easedP);
          }
          if (entry.fromY !== undefined && entry.toY !== undefined) {
            char.y = MathUtils.lerp(entry.fromY, entry.toY, easedP);
          }

          // Deterministic pose evaluation at localElapsed
          char.motionTime = localElapsed;
          char.isPlaying = false;
          char.update(stepDt);
          char.isPlaying = true;

          if (entry.onUpdate) entry.onUpdate(char, progress, entry);
        } else if (t > entry.end && entry._started && !entry._completed) {
          entry._completed = true;
          if (entry.onComplete) entry.onComplete(char, entry);
        }
      });

      // 3. Evaluate camera tracks
      if (this.kit && this.kit.camera) {
        const cam = this.kit.camera;
        this.cameraTracks.forEach((track) => {
          if (t >= track.start && t <= track.end) {
            if (!track._triggered) {
              track._triggered = true;
              if (track.fromX === undefined) track.fromX = cam.x;
              if (track.fromY === undefined) track.fromY = cam.y;
              if (track.fromZoom === undefined) track.fromZoom = cam.zoom;
              if (track.shakeIntensity > 0) {
                cam.shake(track.shakeIntensity, track.duration);
              }
            }
            const p = MathUtils.clamp((t - track.start) / track.duration, 0, 1);
            const e = track.easing(p);
            if (track.toX !== undefined) {
              cam.x = MathUtils.lerp(track.fromX, track.toX, e);
            }
            if (track.toY !== undefined) {
              cam.y = MathUtils.lerp(track.fromY, track.toY, e);
            }
            if (track.toZoom !== undefined) {
              cam.zoom = MathUtils.lerp(track.fromZoom, track.toZoom, e);
            }
          }
        });
      }

      // 4. Evaluate object tracks
      this.objectTracks.forEach((track) => {
        const obj =
          typeof track.target === "string" && this.kit
            ? this.kit.getObject(track.target)
            : track.target;
        if (!obj) return;
        if (t >= track.start && t <= track.end) {
          const p = MathUtils.clamp((t - track.start) / track.duration, 0, 1);
          const e = track.easing(p);
          Object.keys(track.to).forEach((k) => {
            const v0 =
              track.from[k] !== undefined
                ? track.from[k]
                : obj[k] !== undefined
                ? obj[k]
                : obj.props[k] || 0;
            const v1 = track.to[k];
            const val =
              typeof v0 === "number" && typeof v1 === "number"
                ? MathUtils.lerp(v0, v1, e)
                : p < 0.5
                ? v0
                : v1;
            if (k in obj) obj[k] = val;
            obj.props[k] = val;
          });
          if (track.onUpdate) track.onUpdate(obj, p, t);
        }
      });

      return this;
    }

    _resolveCharacter(target, targetId) {
      if (target && typeof target === "object" && target instanceof Stickman) {
        return target;
      }
      if (this.kit && targetId) {
        return this.kit.getStickman(targetId);
      }
      return null;
    }
  }

  // ==========================================================================
  // SECTION 8: PURE-JS GIF89A ENCODER (ZERO EXTERNAL DEPENDENCIES)
  // ==========================================================================

  /**
   * Self-contained GIF89a LZW binary encoder so `kit.exportGIF()` produces a
   * real, standards-compliant animated `.gif` (Uint8Array / Blob) in both
   * Browser and Node.js without external dependencies.
   */
  const GIF89aEncoder = {
    encodeFrames(framesRGBA, width, height, fps = 15) {
      const bytes = [];
      const writeByte = (b) => bytes.push(b & 0xff);
      const writeShort = (s) => {
        bytes.push(s & 0xff, (s >> 8) & 0xff);
      };
      const writeString = (str) => {
        for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i));
      };

      // Header: GIF89a
      writeString("GIF89a");
      writeShort(width);
      writeShort(height);
      // Global Color Table Flag (1), Color Resolution (7), Sort (0), Size of GCT (7 -> 256 colors)
      writeByte(0xf7);
      writeByte(0); // Background color index
      writeByte(0); // Pixel aspect ratio

      // 256-entry RGB 6-8-5 + grayscale ramp palette (covers full color + 36 pure grayscale shades)
      for (let i = 0; i < 256; i++) {
        if (i < 216) {
          const r = Math.floor(i / 36) * 51;
          const g = (Math.floor(i / 6) % 6) * 51;
          const b = (i % 6) * 51;
          writeByte(r);
          writeByte(g);
          writeByte(b);
        } else {
          const gray = Math.min(255, Math.round(((i - 216) / 39) * 255));
          writeByte(gray);
          writeByte(gray);
          writeByte(gray);
        }
      }

      // Netscape 2.0 Infinite Loop Application Extension
      writeByte(0x21);
      writeByte(0xff);
      writeByte(11);
      writeString("NETSCAPE2.0");
      writeByte(3);
      writeByte(1);
      writeShort(0);
      writeByte(0);

      const delayCs = Math.max(2, Math.round(100 / Math.max(1, fps)));

      framesRGBA.forEach((rgba) => {
        // Graphic Control Extension
        writeByte(0x21);
        writeByte(0xf9);
        writeByte(4);
        writeByte(0x04); // Do not dispose
        writeShort(delayCs);
        writeByte(0);
        writeByte(0);

        // Image Descriptor
        writeByte(0x2c);
        writeShort(0);
        writeShort(0);
        writeShort(width);
        writeShort(height);
        writeByte(0); // Use Global Color Table

        // Map RGBA pixels to palette indices
        const pixelCount = width * height;
        const indexed = new Uint8Array(pixelCount);
        for (let p = 0; p < pixelCount; p++) {
          const r = rgba[p * 4] || 0;
          const g = rgba[p * 4 + 1] || 0;
          const b = rgba[p * 4 + 2] || 0;
          // Use high-precision grayscale ramp for near-monochrome pixels (ideal for Fajr video!)
          if (Math.abs(r - g) < 8 && Math.abs(g - b) < 8) {
            indexed[p] = 216 + Math.min(39, Math.round((r / 255) * 39));
          } else {
            const ri = Math.round((r / 255) * 5);
            const gi = Math.round((g / 255) * 5);
            const bi = Math.round((b / 255) * 5);
            indexed[p] = ri * 36 + gi * 6 + bi;
          }
        }

        // LZW Minimum Code Size = 8
        writeByte(8);
        const lzwBytes = this._lzwEncode(indexed, 8);
        let offset = 0;
        while (offset < lzwBytes.length) {
          const chunkLen = Math.min(255, lzwBytes.length - offset);
          writeByte(chunkLen);
          for (let k = 0; k < chunkLen; k++) {
            writeByte(lzwBytes[offset + k]);
          }
          offset += chunkLen;
        }
        writeByte(0); // Block terminator
      });

      // Trailer
      writeByte(0x3b);
      return new Uint8Array(bytes);
    },

    _lzwEncode(indexedPixels, minCodeSize = 8) {
      const clearCode = 1 << minCodeSize;
      const eoiCode = clearCode + 1;
      const out = [];
      let bitBuffer = 0;
      let bitCount = 0;
      let codeSize = minCodeSize + 1;

      const emitCode = (code) => {
        bitBuffer |= code << bitCount;
        bitCount += codeSize;
        while (bitCount >= 8) {
          out.push(bitBuffer & 0xff);
          bitBuffer >>= 8;
          bitCount -= 8;
        }
      };

      // Emit periodic Clear Codes so codeSize stays at 9 bits (fast, deterministic & compact)
      emitCode(clearCode);
      let symbolCounter = 0;
      for (let i = 0; i < indexedPixels.length; i++) {
        emitCode(indexedPixels[i]);
        symbolCounter++;
        if (symbolCounter >= 250) {
          emitCode(clearCode);
          symbolCounter = 0;
        }
      }
      emitCode(eoiCode);
      if (bitCount > 0) {
        out.push(bitBuffer & 0xff);
      }
      return out;
    }
  };

  // ==========================================================================
  // SECTION 9: MAIN STICKMANKIT ENGINE CLASS
  // ==========================================================================

  const RESOLUTION_PRESETS = {
    "1080p": { width: 1920, height: 1080 },
    landscape: { width: 1920, height: 1080 },
    "1920x1080": { width: 1920, height: 1080 },
    vertical: { width: 1080, height: 1920 },
    shorts: { width: 1080, height: 1920 },
    reels: { width: 1080, height: 1920 },
    "1080x1920": { width: 1080, height: 1920 },
    square: { width: 1080, height: 1080 },
    "1080x1080": { width: 1080, height: 1080 }
  };

  /**
   * Main Controller Class for the Stickman Motion Kit.
   */
  class StickmanKit {
    /**
     * @param {HTMLCanvasElement|Object} [canvasOrOptions] - Canvas element or config object
     * @param {Object} [options={}]
     * @param {number} [options.width=1920] - Canvas width (1920, 1080, etc.)
     * @param {number} [options.height=1080] - Canvas height (1080, 1920, etc.)
     * @param {string} [options.preset] - Optional resolution preset ('1920x1080', '1080x1920', '1080x1080')
     * @param {number} [options.fps=30] - Target frame rate (24, 30, or 60)
     * @param {string} [options.background='#0D0D0D'] - Background color or gradient
     * @param {boolean} [options.transparent=false] - Enable transparent background
     * @param {number} [options.floorY] - Optional floor Y level
     * @param {Object} [options.reflection] - Floor reflection settings `{ enabled: true, opacity: 0.16 }`
     */
    constructor(canvasOrOptions, options = {}) {
      let canvas = canvasOrOptions;
      let cfg = options;

      if (
        canvasOrOptions &&
        typeof canvasOrOptions.getContext !== "function" &&
        typeof canvasOrOptions === "object"
      ) {
        cfg = canvasOrOptions;
        canvas = cfg.canvas || null;
      }

      const presetDims =
        (cfg.preset && RESOLUTION_PRESETS[cfg.preset]) ||
        (cfg.resolution && RESOLUTION_PRESETS[cfg.resolution]) ||
        null;

      this.width =
        cfg.width !== undefined
          ? Number(cfg.width)
          : presetDims
          ? presetDims.width
          : 1920;
      this.height =
        cfg.height !== undefined
          ? Number(cfg.height)
          : presetDims
          ? presetDims.height
          : 1080;
      this.fps = [24, 30, 60].includes(Number(cfg.fps))
        ? Number(cfg.fps)
        : Number(cfg.fps) || 30;

      // Resolve or create Canvas & 2D Context
      if (!canvas) {
        if (typeof document !== "undefined" && typeof document.createElement === "function") {
          canvas = document.createElement("canvas");
        } else {
          canvas = new HeadlessCanvas2D(this.width, this.height);
        }
      }
      this.canvas = canvas;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext("2d");

      // Core Collections
      this.characters = new Map();
      this.objects = new Map();
      this.scenes = new Map();
      this.timelines = new Map();

      // Default Scene, Camera & Timeline
      const defaultScene = new StickmanScene({
        id: "default",
        background: cfg.background !== undefined ? cfg.background : "#0D0D0D",
        transparent: Boolean(cfg.transparent),
        floorY: cfg.floorY !== undefined ? cfg.floorY : null,
        floorColor: cfg.floorColor,
        floorLineColor: cfg.floorLineColor,
        reflection: cfg.reflection
      });
      this.scenes.set(defaultScene.id, defaultScene);
      this.activeScene = defaultScene;

      this.camera = new StickmanCamera(cfg.camera || {});
      this.timeline = new StickmanTimeline(this, { id: "main" });
      this.timelines.set("main", this.timeline);

      if (cfg.autoScene) {
        StickmanKit.createAntreanScene(this, cfg);
      }

      // Scene Transition Overlay State
      this._transition = null;

      // Loop & Recording State
      this.isRunning = false;
      this.elapsedTime = 0;
      this._rafId = null;
      this._lastFrameTimestamp = 0;
      this._activeRecorder = null;
    }

    // ------------------------------------------------------------------------
    // Character Management API
    // ------------------------------------------------------------------------

    /**
     * Creates and registers a new Stickman character in the scene.
     * @param {Object} config
     * @returns {Stickman}
     */
    addStickman(config = {}) {
      const char =
        config instanceof Stickman ? config : new Stickman(config);
      this.characters.set(char.id, char);
      return char;
    }

    /**
     * Removes a Stickman character by ID or instance.
     */
    removeStickman(idOrInstance) {
      const id =
        typeof idOrInstance === "string"
          ? idOrInstance
          : idOrInstance && idOrInstance.id;
      return this.characters.delete(id);
    }

    getStickman(id) {
      return this.characters.get(id) || null;
    }

    // ------------------------------------------------------------------------
    // Convenience Character Proxies (Operate on target character or first character)
    // ------------------------------------------------------------------------

    _resolveTargetCharacter(charOrId) {
      if (charOrId instanceof Stickman) return charOrId;
      if (typeof charOrId === "string" && this.characters.has(charOrId)) {
        return this.characters.get(charOrId);
      }
      const first = this.characters.values().next();
      return first.done ? null : first.value;
    }

    /**
     * Plays a motion preset on a specific character (or the primary character if omitted),
     * or resumes global playback if called with no arguments.
     */
    play(charOrMotion, motionOrOptions, maybeOptions) {
      if (charOrMotion === undefined) {
        return this.start();
      }
      if (typeof charOrMotion === "string" && StickmanMotions[charOrMotion]) {
        const char = this._resolveTargetCharacter();
        if (char) char.play(charOrMotion, motionOrOptions || {});
        return this;
      }
      const char = this._resolveTargetCharacter(charOrMotion);
      if (char && typeof motionOrOptions === "string") {
        char.play(motionOrOptions, maybeOptions || {});
      }
      return this;
    }

    pause() {
      this.isRunning = false;
      if (this._rafId !== null) {
        if (typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(this._rafId);
        } else {
          clearTimeout(this._rafId);
        }
        this._rafId = null;
      }
      return this;
    }

    stop() {
      this.pause();
      this.elapsedTime = 0;
      this.timeline.reset();
      this.characters.forEach((char) => char.stop());
      this.render();
      return this;
    }

    setPosition(charOrX, xOrY, maybeY) {
      if (typeof charOrX === "number") {
        const char = this._resolveTargetCharacter();
        if (char) char.setPosition(charOrX, xOrY);
      } else {
        const char = this._resolveTargetCharacter(charOrX);
        if (char) char.setPosition(xOrY, maybeY);
      }
      return this;
    }

    setScale(charOrScaleX, scaleXOrY, maybeScaleY) {
      if (typeof charOrScaleX === "number") {
        const char = this._resolveTargetCharacter();
        if (char) char.setScale(charOrScaleX, scaleXOrY);
      } else {
        const char = this._resolveTargetCharacter(charOrScaleX);
        if (char) char.setScale(scaleXOrY, maybeScaleY);
      }
      return this;
    }

    setExpression(charOrExpr, maybeExpr) {
      if (typeof charOrExpr === "string" && !this.characters.has(charOrExpr)) {
        const char = this._resolveTargetCharacter();
        if (char) char.setExpression(charOrExpr);
      } else {
        const char = this._resolveTargetCharacter(charOrExpr);
        if (char) char.setExpression(maybeExpr);
      }
      return this;
    }

    // ------------------------------------------------------------------------
    // Scene, Object & Timeline Management API
    // ------------------------------------------------------------------------

    addScene(sceneConfig = {}) {
      const scene =
        sceneConfig instanceof StickmanScene
          ? sceneConfig
          : new StickmanScene(sceneConfig);
      this.scenes.set(scene.id, scene);
      if (sceneConfig.active !== false) {
        this.activeScene = scene;
      }
      return scene;
    }

    setScene(sceneId, transitionOptions = null) {
      const nextScene = this.scenes.get(sceneId);
      if (!nextScene) {
        throw new Error(`[StickmanKit] Scene "${sceneId}" not found.`);
      }
      if (transitionOptions && transitionOptions.duration > 0) {
        this.transitionScene(nextScene, transitionOptions);
      } else {
        this.activeScene = nextScene;
      }
      return this.activeScene;
    }

    transitionScene(nextSceneOrOptions, options = {}) {
      const cfg =
        nextSceneOrOptions instanceof StickmanScene
          ? Object.assign({ nextScene: nextSceneOrOptions }, options)
          : nextSceneOrOptions || {};
      this._transition = {
        type: cfg.type || "fade", // 'fade' | 'wipeLeft' | 'wipeRight' | 'flash'
        color: cfg.color || "#000000",
        duration: Number(cfg.duration) || 0.8,
        elapsed: 0,
        nextScene: cfg.nextScene || null,
        _switched: false
      };
      return this;
    }

    addObject(objectConfig = {}) {
      const obj =
        objectConfig instanceof StickmanObject
          ? objectConfig
          : new StickmanObject(objectConfig);
      this.objects.set(obj.id, obj);
      return obj;
    }

    removeObject(idOrInstance) {
      const id =
        typeof idOrInstance === "string"
          ? idOrInstance
          : idOrInstance && idOrInstance.id;
      return this.objects.delete(id);
    }

    getObject(id) {
      return this.objects.get(id) || null;
    }

    addTimeline(timelineConfig = {}) {
      const tl =
        timelineConfig instanceof StickmanTimeline
          ? timelineConfig
          : new StickmanTimeline(this, timelineConfig);
      this.timelines.set(tl.id, tl);
      if (timelineConfig.primary !== false) {
        this.timeline = tl;
      }
      return tl;
    }

    // ------------------------------------------------------------------------
    // Core Update & Render Loop
    // ------------------------------------------------------------------------

    start() {
      if (this.isRunning) return this;
      this.isRunning = true;
      const frameIntervalMs = 1000 / this.fps;
      this._lastFrameTimestamp =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      const tick = (now) => {
        if (!this.isRunning) return;
        const currentNow =
          now !== undefined
            ? now
            : typeof performance !== "undefined"
            ? performance.now()
            : Date.now();
        const elapsedMs = currentNow - this._lastFrameTimestamp;

        if (elapsedMs >= frameIntervalMs * 0.9) {
          const dt = Math.min(0.1, elapsedMs / 1000);
          this._lastFrameTimestamp = currentNow;
          this.update(dt);
          this.render();
        }

        if (typeof requestAnimationFrame === "function") {
          this._rafId = requestAnimationFrame(tick);
        } else {
          this._rafId = setTimeout(tick, Math.round(frameIntervalMs));
        }
      };

      if (typeof requestAnimationFrame === "function") {
        this._rafId = requestAnimationFrame(tick);
      } else {
        this._rafId = setTimeout(tick, Math.round(frameIntervalMs));
      }
      return this;
    }

    /**
     * Steps the simulation forward by `dt` seconds.
     */
    update(dt = 1 / this.fps) {
      const safeDt = Math.max(0, Number(dt) || 0);
      this.elapsedTime += safeDt;

      // 1. Update active timelines
      this.timelines.forEach((tl) => {
        if (tl.entries.length > 0 || tl.cameraTracks.length > 0 || tl.objectTracks.length > 0) {
          tl.update(safeDt);
        }
      });

      // 2. Update characters not actively driven by timeline clips at current time
      const activeTimelineTargets = new Set();
      this.timelines.forEach((tl) => {
        tl.entries.forEach((e) => {
          if (tl.currentTime >= e.start && tl.currentTime <= e.end) {
            const char = tl._resolveCharacter(e.target, e.targetId);
            if (char) activeTimelineTargets.add(char.id);
          }
        });
      });

      this.characters.forEach((char) => {
        if (!activeTimelineTargets.has(char.id)) {
          char.update(safeDt);
        }
      });

      // 3. Update scene objects
      this.objects.forEach((obj) => obj.update(safeDt));

      // 4. Update camera
      this.camera.update(safeDt, this.width, this.height);

      // 5. Update scene transition overlay
      if (this._transition) {
        this._transition.elapsed += safeDt;
        const p = this._transition.elapsed / this._transition.duration;
        if (p >= 0.5 && !this._transition._switched && this._transition.nextScene) {
          this._transition._switched = true;
          this.activeScene = this._transition.nextScene;
        }
        if (p >= 1) {
          this._transition = null;
        }
      }

      return this;
    }

    /**
     * Renders the complete frame: Background -> Floor Reflection Pass ->
     * Z-Sorted Characters & Objects -> Scene Foreground -> Transition Overlay.
     */
    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const scene = this.activeScene;

      ctx.save();
      ctx.resetTransform();

      // 1. Render Background (in screen or camera space)
      scene.renderBackground(ctx, w, h);

      // 2. Enter World Camera Transform
      ctx.save();
      this.camera.applyTransform(ctx, w, h);

      // Gather & sort all renderables by zIndex
      const renderables = [
        ...Array.from(this.objects.values()),
        ...Array.from(this.characters.values())
      ].filter((item) => item.visible);
      renderables.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      // 3. Floor Reflection Pass (if enabled on scene and floorY is set)
      if (scene.reflection && scene.reflection.enabled && scene.floorY !== null) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-w, scene.floorY, w * 3, h * 2);
        ctx.clip();

        ctx.translate(0, scene.floorY * 2);
        ctx.scale(1, -1);
        ctx.globalAlpha = scene.reflection.opacity;

        renderables.forEach((item) => {
          item.render(ctx, { isReflection: true, floorY: scene.floorY });
        });

        ctx.restore();

        // Subtle vertical fade gradient over the reflection floor
        const fadeGrad = ctx.createLinearGradient(
          0,
          scene.floorY,
          0,
          scene.floorY + scene.reflection.maxDepth
        );
        fadeGrad.addColorStop(0, "rgba(13, 13, 13, 0.15)");
        fadeGrad.addColorStop(1, scene.floorColor || "#0D0D0D");
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(-w, scene.floorY, w * 3, scene.reflection.maxDepth);
      }

      // 4. Main World Render Pass
      renderables.forEach((item) => {
        item.render(ctx, { isReflection: false });
      });

      if (scene.onRenderForeground) {
        scene.onRenderForeground(ctx, w, h, scene);
      }

      ctx.restore(); // End Camera Transform

      // 5. Render Scene Transition Overlay (if active)
      if (this._transition) {
        const p = MathUtils.clamp(
          this._transition.elapsed / this._transition.duration,
          0,
          1
        );
        ctx.save();
        if (this._transition.type === "wipeLeft") {
          ctx.fillStyle = this._transition.color;
          const wipeW = Math.sin(p * Math.PI) * w;
          ctx.fillRect(0, 0, wipeW, h);
        } else {
          // Smooth fade in/out peak at p = 0.5
          ctx.globalAlpha = Math.sin(p * Math.PI);
          ctx.fillStyle = this._transition.color;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
      }

      ctx.restore();
      return this;
    }

    // ------------------------------------------------------------------------
    // Export & Video Recording Engine (PNG, GIF89a, WebM MediaRecorder, FFmpeg)
    // ------------------------------------------------------------------------

    /**
     * Exports the current canvas frame as a PNG/JPEG Data URL (and optionally triggers download in browser).
     * @param {Object} [options={}]
     * @param {string} [options.format='image/png'] - 'image/png' or 'image/jpeg'
     * @param {number} [options.quality=1] - Quality [0..1]
     * @param {boolean} [options.download=false] - Trigger browser file download
     * @param {string} [options.filename='stickman-frame.png']
     * @returns {string} Data URL
     */
    exportFrame(options = {}) {
      this.render();
      const format = options.format || "image/png";
      const quality = options.quality !== undefined ? Number(options.quality) : 1;
      const dataUrl =
        typeof this.canvas.toDataURL === "function"
          ? this.canvas.toDataURL(format, quality)
          : "";

      if (
        options.download &&
        typeof document !== "undefined" &&
        typeof document.createElement === "function"
      ) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = options.filename || "stickman-frame.png";
        a.click();
      }
      return dataUrl;
    }

    /**
     * Deterministically steps through the animation from `startTime` to `startTime + duration`
     * at `fps` and collects PNG Data URLs (ideal for AI pipelines & FFmpeg frame stitching).
     */
    renderFrameSequence(options = {}) {
      const duration =
        options.duration !== undefined
          ? Number(options.duration)
          : Math.max(1, this.timeline.getTotalDuration() || 2);
      const fps = options.fps || this.fps;
      const startTime = options.startTime || 0;
      const totalFrames = Math.max(1, Math.ceil(duration * fps));
      const dt = 1 / fps;
      const frames = [];

      this.pause();
      for (let i = 0; i < totalFrames; i++) {
        const t = startTime + i * dt;
        if (this.timeline.entries.length > 0) {
          this.timeline.seek(t, dt);
        } else {
          this.update(dt);
        }
        this.render();
        const dataUrl = this.exportFrame({ format: options.format || "image/png" });
        frames.push({ frameIndex: i, time: t, dataUrl });
        if (typeof options.onFrame === "function") {
          options.onFrame(frames[i], i, totalFrames);
        }
      }
      return frames;
    }

    /**
     * Exports an animated GIF89a binary (`Uint8Array` and `dataUrl`) using the
     * built-in pure-JS GIF89a encoder.
     */
    exportGIF(options = {}) {
      const duration = options.duration !== undefined ? Number(options.duration) : 2.0;
      const fps = options.fps || 12;
      const gifWidth = options.width || Math.min(480, this.width);
      const gifHeight =
        options.height || Math.round((gifWidth / this.width) * this.height);
      const totalFrames = Math.max(1, Math.round(duration * fps));
      const dt = 1 / fps;
      const framesRGBA = [];

      this.pause();
      for (let i = 0; i < totalFrames; i++) {
        const t = i * dt;
        if (this.timeline.entries.length > 0) {
          this.timeline.seek(t, dt);
        } else {
          this.update(dt);
        }
        this.render();
        const imgData = this.ctx.getImageData(0, 0, gifWidth, gifHeight);
        framesRGBA.push(imgData.data);
      }

      const bytes = GIF89aEncoder.encodeFrames(framesRGBA, gifWidth, gifHeight, fps);
      return {
        bytes,
        width: gifWidth,
        height: gifHeight,
        frameCount: totalFrames,
        mimeType: "image/gif"
      };
    }

    /**
     * Records the canvas animation to a WebM video using the HTML5 `MediaRecorder` API.
     * Note: Native browser `MediaRecorder` outputs WebM (`video/webm;codecs=vp9` or `vp8`).
     * For MP4 H.264 conversion, use `kit.getFFmpegCommand()` with the exported WebM or PNG frames.
     *
     * @param {Object} [options={}]
     * @param {number} [options.duration=5] - Recording duration in seconds
     * @param {number} [options.fps=this.fps] - Capture frame rate
     * @param {string} [options.mimeType='video/webm;codecs=vp9']
     * @param {number} [options.videoBitsPerSecond=8000000]
     * @param {boolean} [options.download=false] - Auto-download `.webm` file when finished
     * @param {string} [options.filename='stickman-animation.webm']
     * @returns {Promise<{blob: Blob|null, url: string, mimeType: string, ffmpegCommand: string}>}
     */
    record(options = {}) {
      const durationSec =
        options.duration !== undefined
          ? Number(options.duration)
          : Math.max(2, this.timeline.getTotalDuration() || 3);
      const fps = options.fps || this.fps;
      const filename = options.filename || "stickman-animation.webm";
      const mp4Filename = filename.replace(/\.webm$/i, "") + ".mp4";
      const ffmpegCmd = this.getFFmpegCommand({
        input: filename,
        output: mp4Filename,
        fps
      });

      // Headless / Node.js fallback: deterministically render frames and resolve metadata
      if (
        typeof MediaRecorder === "undefined" ||
        typeof this.canvas.captureStream !== "function" ||
        (this.canvas.captureStream(fps) && this.canvas.captureStream(fps).isHeadlessStream)
      ) {
        const frames = this.renderFrameSequence({ duration: durationSec, fps });
        return Promise.resolve({
          blob: null,
          url: "",
          mimeType: "video/webm",
          framesRendered: frames.length,
          ffmpegCommand: ffmpegCmd,
          note:
            "MediaRecorder is browser-only; rendered deterministic frame sequence for FFmpeg pipeline."
        });
      }

      return new Promise((resolve, reject) => {
        try {
          const stream = this.canvas.captureStream(fps);
          const candidateTypes = [
            options.mimeType,
            "video/webm;codecs=vp9",
            "video/webm;codecs=vp8",
            "video/webm"
          ].filter(Boolean);

          let chosenMime = "video/webm";
          if (typeof MediaRecorder.isTypeSupported === "function") {
            for (const mime of candidateTypes) {
              if (MediaRecorder.isTypeSupported(mime)) {
                chosenMime = mime;
                break;
              }
            }
          }

          const chunks = [];
          const recorder = new MediaRecorder(stream, {
            mimeType: chosenMime,
            videoBitsPerSecond: options.videoBitsPerSecond || 8000000
          });
          this._activeRecorder = recorder;

          recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
          };

          recorder.onerror = (err) => reject(err);

          recorder.onstop = () => {
            this._activeRecorder = null;
            const blob = new Blob(chunks, { type: chosenMime });
            const url =
              typeof URL !== "undefined" && URL.createObjectURL
                ? URL.createObjectURL(blob)
                : "";
            if (
              options.download &&
              url &&
              typeof document !== "undefined" &&
              typeof document.createElement === "function"
            ) {
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              a.click();
            }
            resolve({
              blob,
              url,
              mimeType: chosenMime,
              ffmpegCommand: ffmpegCmd
            });
          };

          recorder.start(100);
          this.start();

          setTimeout(() => {
            if (recorder.state !== "inactive") {
              recorder.stop();
            }
            this.pause();
          }, Math.round(durationSec * 1000));
        } catch (err) {
          reject(err);
        }
      });
    }

    /**
     * Generates a ready-to-run FFmpeg CLI command to convert exported WebM or
     * PNG frame sequences into high-compatibility MP4 (H.264 / yuv420p).
     */
    getFFmpegCommand(options = {}) {
      const fps = options.fps || this.fps;
      const output = options.output || "output.mp4";
      if (options.fromFramesPattern) {
        return `ffmpeg -y -framerate ${fps} -i "${options.fromFramesPattern}" -c:v libx264 -pix_fmt yuv420p -crf 18 "${output}"`;
      }
      const input = options.input || "stickman-animation.webm";
      return `ffmpeg -y -i "${input}" -r ${fps} -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart "${output}"`;
    }

    // ------------------------------------------------------------------------
    // Built-in "GARIS HIDUP - Antrean" Scene Builder (12.3s Vertical 9:16)
    // ------------------------------------------------------------------------

    static createAntreanScene(kit, options = {}) {
      const theme = options.theme || "antrean";
      const T = theme === "parkir"
        ? { sign1: "PARKIR", sign2: "SABAR", bub1: "SEBENTAR", bub2: "KEBEBURU",
            w1: ["Sabar", "itu", "bukan", "soal", "menang."], w2: "menahan diri." }
        : { sign1: "LOKET", sign2: "ANTREAN", bub1: "BENTAR DOANG", bub2: "BURU-BURU",
            w1: ["Antre", "itu", "bukan", "soal", "waktu."], w2: "menghargai." };
      const __line1 = ["Antre", "itu", "bukan", "soal", "waktu."];
      if (theme === "parkir") {
        return StickmanKit._buildParkirScene(kit, options, T);
      }
      const w = kit.width;
      const h = kit.height;
      const floorY = Math.round(h * 0.685);
      const ceilingY = Math.round(h * 0.305);

      kit.activeScene.background = {
        stops: [
          [0.0, "#10171E"],
          [0.55, "#1C2833"],
          [1.0, "#0A0E13"]
        ]
      };
      kit.activeScene.floorY = null;
      kit.activeScene.reflection.enabled = false;

      // 1. Ceiling Line across the scene
      kit.addObject({
        id: "gh_ceiling_line",
        type: "line",
        x: 0,
        y: ceilingY,
        color: "#4A555E",
        lineWidth: 3,
        zIndex: 2,
        props: { x2: w, y2: 0 }
      });

      // 2. Hanging Signs: "LOKET" (left) and "⬅ ANTREAN" (center)
      const loketSign = kit.addObject({
        id: "gh_sign_loket",
        type: "hangingSign",
        x: w * 0.115,
        y: ceilingY + h * 0.088,
        width: w * 0.15,
        height: h * 0.032,
        color: "#2C3E50",
        strokeColor: "#485F73",
        zIndex: 4,
        props: {
          text: T.sign1,
          textColor: "#EAECEE",
          wireLength: h * 0.072,
          leftArrow: false
        }
      });

      const antreanSign = kit.addObject({
        id: "gh_sign_antrean",
        type: "hangingSign",
        x: w * 0.515,
        y: ceilingY + h * 0.052,
        width: w * 0.30,
        height: h * 0.038,
        color: "#EAE6DF",
        strokeColor: "#1C2228",
        zIndex: 4,
        props: {
          text: T.sign2,
          textColor: "#14181C",
          wireLength: h * 0.033,
          leftArrow: true
        }
      });

      // 3. Service Counter ("LOKET") on the left
      const counter = kit.addObject({
        id: "gh_counter",
        type: "loketCounter",
        x: w * 0.155,
        y: floorY,
        width: w * 0.105,
        height: h * 0.076,
        zIndex: 12
      });

      // 4. Glowing Yellow Queue Floor Strip
      const queueStrip = kit.addObject({
        id: "gh_queue_strip",
        type: "queueFloorStrip",
        x: w * 0.525,
        y: floorY + 4,
        width: w * 0.56,
        height: 15,
        zIndex: 5,
        props: { activeRatio: 1.0 }
      });

      // 5. (dihapus: watermark teks — bersih tanpa tulisan merek)

      // 6. Speech Bubble ("BENTAR DOANG" / "BURU-BURU")
      const speechBubble = kit.addObject({
        id: "gh_speech_bubble",
        type: "speechBubble",
        x: w * 0.34,
        y: floorY - h * 0.19,
        width: w * 0.27,
        height: h * 0.032,
        visible: false,
        zIndex: 25,
        props: { text: T.bub1, tailOffsetX: 12 }
      });

      // 7. Top Moral Narrative Title ("Antre itu bukan soal waktu. Soal menghargai.")
      const moralTitle = kit.addObject({
        id: "gh_moral_title",
        type: "highlightedTitle",
        x: w * 0.5,
        y: h * 0.20,
        zIndex: 25,
        props: {
          fontSize: Math.round(w * 0.041),
          progress: 0,
          words1: T.w1,
          words2: T.w2
        }
      });

      // 8. Characters (6 Cast Members)
      const baseScale = (h / 1920) * 1.48;

      const clerk = kit.addStickman({
        id: "gh_clerk",
        x: w * 0.09,
        y: floorY,
        scale: baseScale * 0.96,
        color: "#7E878F",
        backLimbColor: "#5A626A",
        style: "garishidup",
        facing: 1,
        zIndex: 8
      });

      const customer1 = kit.addStickman({
        id: "gh_customer1",
        x: w * 0.21,
        y: floorY,
        scale: baseScale * 0.96,
        color: "#7E878F",
        backLimbColor: "#5A626A",
        style: "garishidup",
        facing: -1,
        zIndex: 10
      });

      const protagonist = kit.addStickman({
        id: "gh_protagonist",
        x: w * 0.44,
        y: floorY,
        scale: baseScale * 1.04,
        color: "#F7F5E8",
        backLimbColor: "#D5D2C4",
        glowColor: "rgba(255, 248, 215, 0.38)",
        glowBlur: 24,
        style: "garishidup",
        facing: -1,
        zIndex: 15
      });

      const parent = kit.addStickman({
        id: "gh_parent",
        x: w * 0.57,
        y: floorY,
        scale: baseScale * 0.96,
        color: "#7E878F",
        backLimbColor: "#5A626A",
        style: "garishidup",
        facing: -1,
        zIndex: 11
      });

      const child = kit.addStickman({
        id: "gh_child",
        x: w * 0.615,
        y: floorY,
        scale: baseScale * 0.56,
        color: "#7E878F",
        backLimbColor: "#5A626A",
        style: "garishidup",
        facing: -1,
        zIndex: 12
      });

      const cutter1 = kit.addStickman({
        id: "gh_cutter1",
        x: w * 1.12,
        y: floorY + 8,
        scale: baseScale * 0.96,
        color: "#7E878F",
        backLimbColor: "#5A626A",
        style: "garishidup",
        facing: -1,
        zIndex: 16
      });

      const cutter2 = kit.addStickman({
        id: "gh_cutter2",
        x: w * 1.22,
        y: floorY + 8,
        scale: baseScale * 0.96,
        color: "#7E878F",
        backLimbColor: "#5A626A",
        style: "garishidup",
        facing: -1,
        zIndex: 14
      });

      // 9. Program the 12.3-second Story Timeline
      const tl = kit.timeline;
      tl.clear();

      tl.add(clerk, "serveCounter", { start: 0, duration: 12.3 });

      tl.add(customer1, "waitQueue", { start: 0, duration: 8.4, fromX: w * 0.21, toX: w * 0.21 });
      tl.add(customer1, "walk", { start: 8.4, duration: 1.4, fromX: w * 0.21, toX: -w * 0.12, facing: -1 });

      tl.add(protagonist, "waitQueue", { start: 0, duration: 3.4, fromX: w * 0.44, toX: w * 0.44, facing: -1 });
      tl.add(protagonist, "waitQueue", { start: 3.4, duration: 2.2, fromX: w * 0.44, toX: w * 0.435, facing: -1 });
      tl.add(protagonist, "reprimandPoint", { start: 5.6, duration: 1.1, fromX: w * 0.435, toX: w * 0.435, facing: -1 });
      tl.add(protagonist, "reprimandPoint", { start: 6.7, duration: 1.1, fromX: w * 0.435, toX: w * 0.435, facing: 1 });
      tl.add(protagonist, "waitQueue", { start: 7.8, duration: 1.6, fromX: w * 0.435, toX: w * 0.435, facing: -1 });
      tl.add(protagonist, "walk", { start: 9.4, duration: 1.3, fromX: w * 0.435, toX: w * 0.215, facing: -1 });
      tl.add(protagonist, "waitQueue", { start: 10.7, duration: 1.6, fromX: w * 0.215, toX: w * 0.215, facing: -1 });

      tl.add(parent, "holdChildHand", { start: 0, duration: 4.5, fromX: w * 0.57, toX: w * 0.57 });
      tl.add(parent, "sad", { start: 4.5, duration: 3.8, fromX: w * 0.57, toX: w * 0.555 });
      tl.add(parent, "holdChildHand", { start: 8.3, duration: 1.2, fromX: w * 0.555, toX: w * 0.555 });
      tl.add(parent, "walk", { start: 9.5, duration: 1.3, fromX: w * 0.555, toX: w * 0.37 });
      tl.add(parent, "holdChildHand", { start: 10.8, duration: 1.5, fromX: w * 0.37, toX: w * 0.37 });

      tl.add(child, "waitQueue", { start: 0, duration: 9.5, fromX: w * 0.615, toX: w * 0.615 });
      tl.add(child, "walk", { start: 9.5, duration: 1.3, fromX: w * 0.615, toX: w * 0.425 });
      tl.add(child, "waitQueue", { start: 10.8, duration: 1.5, fromX: w * 0.425, toX: w * 0.425 });

      tl.add(cutter1, "walk", { start: 1.6, duration: 2.0, fromX: w * 1.08, toX: w * 0.355, facing: -1 });
      tl.add(cutter1, "cutQueueExcuse", { start: 3.6, duration: 3.2, fromX: w * 0.355, toX: w * 0.355, facing: 1 });
      tl.add(cutter1, "walkShame", { start: 6.8, duration: 2.1, fromX: w * 0.355, toX: w * 0.69, facing: 1 });
      tl.add(cutter1, "waitQueue", { start: 8.9, duration: 0.7, fromX: w * 0.69, toX: w * 0.69, facing: -1 });
      tl.add(cutter1, "walk", { start: 9.6, duration: 1.3, fromX: w * 0.69, toX: w * 0.51, facing: -1 });
      tl.add(cutter1, "waitQueue", { start: 10.9, duration: 1.4, fromX: w * 0.51, toX: w * 0.51, facing: -1 });

      tl.add(cutter2, "walk", { start: 3.8, duration: 0.9, fromX: w * 0.95, toX: w * 0.285, facing: -1 });
      tl.add(cutter2, "cutQueueExcuse", { start: 4.7, duration: 2.4, fromX: w * 0.285, toX: w * 0.285, facing: 1 });
      tl.add(cutter2, "walkShame", { start: 7.1, duration: 2.1, fromX: w * 0.285, toX: w * 0.78, facing: 1 });
      tl.add(cutter2, "waitQueue", { start: 9.2, duration: 0.5, fromX: w * 0.78, toX: w * 0.78, facing: -1 });
      tl.add(cutter2, "walk", { start: 9.7, duration: 1.3, fromX: w * 0.78, toX: w * 0.59, facing: -1 });
      tl.add(cutter2, "waitQueue", { start: 11.0, duration: 1.3, fromX: w * 0.59, toX: w * 0.59, facing: -1 });

      tl.addObjectTrack(queueStrip, {
        start: 0,
        duration: 12.3,
        onUpdate(strip, p, t) {
          if (t >= 3.6 && t < 4.7) {
            speechBubble.visible = true;
            speechBubble.x = w * 0.34;
            speechBubble.props.text = T.bub1;
          } else if (t >= 4.7 && t < 5.8) {
            speechBubble.visible = true;
            speechBubble.x = w * 0.26;
            speechBubble.props.text = T.bub2;
          } else {
            speechBubble.visible = false;
          }

          if (t < 4.4) {
            strip.props.activeRatio = 1.0;
          } else if (t >= 4.4 && t < 8.4) {
            strip.props.activeRatio = 0.42;
          } else {
            const recoverP = MathUtils.clamp((t - 8.4) / 0.7, 0, 1);
            strip.props.activeRatio = MathUtils.lerp(0.42, 1.0, recoverP);
          }

          if (t < 7.9) {
            moralTitle.props.progress = 0;
          } else {
            moralTitle.props.progress = MathUtils.clamp((t - 7.9) / 1.4, 0, 1);
          }
        }
      });

      return {
        clerk,
        customer1,
        protagonist,
        parent,
        child,
        cutter1,
        cutter2,
        counter,
        loketSign,
        antreanSign,
        queueStrip,
        speechBubble,
        moralTitle
      };
    }

    static _buildParkirScene(kit, options, T) {
      const w = kit.width;
      const h = kit.height;
      const floorY = Math.round(h * 0.685);
      const ceilingY = Math.round(h * 0.305);
      kit.activeScene.background = {
        stops: [[0.0, "#2C1A3E"], [0.55, "#4A2C5A"], [1.0, "#14101C"]]
      };
      kit.activeScene.floorY = null;
      kit.activeScene.reflection.enabled = false;
      kit.addObject({
        id: "ghp_sign_parkir", type: "hangingSign",
        x: w * 0.5, y: ceilingY + h * 0.055, width: w * 0.30, height: h * 0.038,
        color: "#EAE6DF", strokeColor: "#1C2228", zIndex: 4,
        props: { text: "PARKIR", textColor: "#14181C", wireLength: h * 0.033, leftArrow: false }
      });
      kit.addObject({
        id: "ghp_marka", type: "markaParkir",
        x: w * 0.5, y: floorY + 4, width: w * 0.72, height: 15, zIndex: 5,
        props: { slots: 5 }
      });
      const motorColors = ["#E74C3C", "#2E86C1", "#27AE60"];
      [0.22, 0.42, 0.62].forEach((fx, i) => kit.addObject({
        id: `ghp_motor${i}`, type: "motor",
        x: w * fx, y: floorY, width: w * 0.13, height: h * 0.062, zIndex: 10,
        props: {}, color: motorColors[i]
      }));
      const motorJatuh = kit.addObject({
        id: "ghp_motor_jatuh", type: "motor",
        x: w * 0.80, y: floorY + 6, width: w * 0.13, height: h * 0.062, zIndex: 10,
        rotation: 0, props: {}, color: "#F39C12"
      });
      kit.addObject({
        id: "ghp_mobil", type: "mobil",
        x: w * 0.08, y: floorY, width: w * 0.20, height: h * 0.068, zIndex: 9,
        props: {}, color: "#5D6D7E"
      });
      const speechBubble = kit.addObject({
        id: "ghp_speech_bubble", type: "speechBubble",
        x: w * 0.66, y: floorY - h * 0.19, width: w * 0.24, height: h * 0.032,
        visible: false, zIndex: 25, props: { text: T.bub1, tailOffsetX: 12 }
      });
      const moralTitle = kit.addObject({
        id: "ghp_moral_title", type: "highlightedTitle",
        x: w * 0.5, y: h * 0.20, zIndex: 25,
        props: { fontSize: Math.round(w * 0.041), progress: 0, words1: T.w1, words2: T.w2 }
      });
      const bs = (h / 1920) * 1.48;
      const mk = (id, fx, col, glow) => kit.addStickman(Object.assign({
        id, x: w * fx, y: floorY, scale: bs * 0.96, color: col,
        backLimbColor: "#5A626A", style: "garishidup", facing: -1, zIndex: 14
      }, glow ? { color: "#F7F5E8", backLimbColor: "#D5D2C4", glowColor: "rgba(255,248,215,0.38)", glowBlur: 24, scale: bs * 1.04, zIndex: 15 } : {}));
      const penabrak = mk("ghp_penabrak", 1.05, "#7E878F");
      const korban = mk("ghp_korban", 0.80, "#7E878F");
      const saksi = mk("ghp_saksi", 0.50, null, true);
      const tukang = mk("ghp_tukang", 0.12, "#7E878F");
      const tl = kit.timeline;
      tl.clear();
      tl.add(penabrak, "walk", { start: 0.5, duration: 2.0, fromX: w * 1.05, toX: w * 0.80, facing: -1 });
      tl.add(penabrak, "push", { start: 2.5, duration: 1.0, fromX: w * 0.80, toX: w * 0.80, facing: -1 });
      tl.add(penabrak, "run", { start: 3.5, duration: 1.6, fromX: w * 0.80, toX: w * 1.15, facing: 1 });
      tl.add(korban, "walk", { start: 4.2, duration: 1.6, fromX: w * 1.05, toX: w * 0.80, facing: -1 });
      tl.add(korban, "surprised", { start: 5.8, duration: 1.0, fromX: w * 0.80, toX: w * 0.80 });
      tl.add(korban, "sad", { start: 6.8, duration: 2.5, fromX: w * 0.80, toX: w * 0.80 });
      tl.add(korban, "happy", { start: 10.5, duration: 1.8, fromX: w * 0.80, toX: w * 0.80 });
      tl.add(saksi, "waitQueue", { start: 0, duration: 5.0, fromX: w * 0.50, toX: w * 0.50, facing: 1 });
      tl.add(saksi, "walk", { start: 5.0, duration: 1.2, fromX: w * 0.50, toX: w * 0.72, facing: 1 });
      tl.add(saksi, "push", { start: 6.2, duration: 1.6, fromX: w * 0.72, toX: w * 0.74, facing: 1 });
      tl.add(saksi, "reprimandPoint", { start: 7.8, duration: 1.2, fromX: w * 0.74, toX: w * 0.74, facing: 1 });
      tl.add(saksi, "happy", { start: 10.5, duration: 1.8, fromX: w * 0.74, toX: w * 0.74, facing: -1 });
      tl.add(tukang, "serveCounter", { start: 0, duration: 12.3, fromX: w * 0.12, toX: w * 0.12 });
      tl.addObjectTrack(motorJatuh, { start: 0, duration: 12.3,
        onUpdate(obj, p, t) {
          if (t < 2.8) obj.rotation = 0;
          else if (t < 3.4) obj.rotation = -68 * Math.min(1, (t - 2.8) / 0.6);
          else if (t < 6.2) obj.rotation = -68;
          else if (t < 7.0) obj.rotation = -68 * (1 - (t - 6.2) / 0.8);
          else obj.rotation = 0;
          if (t >= 2.5 && t < 3.6) { speechBubble.visible = true; speechBubble.props.text = T.bub1; }
          else if (t >= 3.6 && t < 4.6) { speechBubble.visible = true; speechBubble.props.text = T.bub2; }
          else speechBubble.visible = false;
          moralTitle.props.progress = t < 8.5 ? 0 : Math.min(1, (t - 8.5) / 1.4);
        } });
      return { penabrak, korban, saksi, tukang, motorJatuh, speechBubble, moralTitle };
    }
  }

  // Static references for convenient inspection by AI agents
  StickmanKit.Stickman = Stickman;
  StickmanKit.StickmanTimeline = StickmanTimeline;
  StickmanKit.StickmanCamera = StickmanCamera;
  StickmanKit.StickmanScene = StickmanScene;
  StickmanKit.StickmanObject = StickmanObject;
  StickmanKit.StickmanMotions = StickmanMotions;
  StickmanKit.Easing = Easing;
  StickmanKit.MathUtils = MathUtils;
  StickmanKit.IKSolver = IKSolver;
  StickmanKit.GIF89aEncoder = GIF89aEncoder;
  StickmanKit.HeadlessCanvas2D = HeadlessCanvas2D;
  StickmanKit.VERSION = "2.0.0";

  StickmanKit.GarisHidupKit = StickmanKit;

  return {
    StickmanKit,
    GarisHidupKit: StickmanKit,
    Stickman,
    StickmanTimeline,
    StickmanCamera,
    StickmanScene,
    StickmanObject,
    StickmanMotions,
    Easing,
    MathUtils,
    IKSolver,
    GIF89aEncoder,
    HeadlessCanvas2D
  };
});