/**
 * Choreography of the light ribbons ("Seda de Luz").
 *
 * Every ribbon is a cubic Bézier curve whose four control points are written in screen-relative
 * units (x, y in −1…1 of the visible half-extent at the ribbon depth), so the composition adapts to
 * any aspect ratio. Each section of the page has its own pose; the shader adds the living motion
 * (noise, twist, pointer attraction) on top of the blended pose.
 */
import { SCENES } from "../lab-state";

export type Vec2 = readonly [number, number];
export type RibbonPose = {
  points: readonly [Vec2, Vec2, Vec2, Vec2];
  /** Depth of the ribbon plane (world z). Far ribbons are wider, softer and dimmer. */
  z: number;
  /** Sheet width in world units. */
  width: number;
  /** Overall light of the ribbon. */
  intensity: number;
  /** Twist of the silk along its length (radians). */
  twist: number;
  /** Amplitude of the noise that keeps it alive. */
  noise: number;
};

export const RIBBON_COUNT = { desktop: 7, reduced: 5, mobile: 4 } as const;
/** The loader line sits just below the logo, a little under the vertical centre. */
export const LOADER_LINE_Y = -.2;
/** In the final call to action the line rests below the button, never across the title. */
export const CALM_LINE_Y = -.64;

const hash = (n: number) => { const x = Math.sin(n * 91.3458 + 12.9898) * 43758.5453; return x - Math.floor(x); };
/** Three depth layers: near, middle, far. */
const layerOf = (i: number) => (i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2);
const LAYER_Z = [1.4, -.6, -3.2];
const LAYER_WIDTH = [.5, .85, 1.25];
const LAYER_LIGHT = [.95, .6, .34];

function base(i: number, points: RibbonPose["points"], overrides: Partial<RibbonPose> = {}): RibbonPose {
  const layer = layerOf(i);
  return { points, z: LAYER_Z[layer], width: LAYER_WIDTH[layer] * (.8 + hash(i + 4) * .5), intensity: LAYER_LIGHT[layer], twist: 2.2 + hash(i + 9) * 2.4, noise: .35, ...overrides };
}

/** Hero: diagonal sweeps from the right towards the centre, crossing on the right like the reference. */
function hero(i: number): RibbonPose {
  const r1 = hash(i + 1), r2 = hash(i + 2), r3 = hash(i + 3);
  if (i % 2 === 0) {
    // From the lower right, sweeping up towards the centre-top; the crossing stays on the right third.
    return base(i, [[1.4, -1.05 + r1 * .4], [.86 + r2 * .14, -.3 + r3 * .25], [.62 + r3 * .15, .32 + r1 * .2], [.12 - r2 * .3, 1.3]]);
  }
  // From the lower left edge, under the hero copy, rising to the upper right.
  return base(i, [[-1.4, -.82 + r1 * .14], [-.1 + r2 * .25, -.74 + r3 * .12], [.62 + r1 * .2, -.08 + r2 * .2], [1.42, .5 + r3 * .4]]);
}

/** Manifesto: the silk opens and hugs the top and bottom edges, leaving the text in clean black. */
function manifesto(i: number): RibbonPose {
  const side = i % 2 === 0 ? 1 : -1, r = hash(i + 5);
  const y = side * (.78 + r * .16);
  const pose = base(i, [[-1.35, y + side * .1], [-.4, y - side * (.12 + r * .1)], [.4, y + side * .08], [1.35, y - side * .05]]);
  return { ...pose, intensity: pose.intensity * .8 };
}

/** Solutions: horizontal waves that pass behind the row of cards and light their borders. */
function solutions(i: number, count: number): RibbonPose {
  const t = count > 1 ? i / (count - 1) : .5, r = hash(i + 6);
  // The band sits behind the row of cards (lower half of the screen), never across the title.
  const y = -.66 + t * .58;
  return base(i, [[-1.35, y + (r - .5) * .3], [-.45, y + .22 * (r - .4)], [.45, y - .22 * (r - .5)], [1.35, y + (r - .5) * .25]], { twist: 1.4 + r, noise: .25 });
}

/** Product: the silk contours the product capture on the right, like a moving spotlight frame. */
function product(i: number): RibbonPose {
  const over = i % 2 === 0 ? 1 : -1, r = hash(i + 7);
  const cx = .52, cy = -.05, rx = .52 + r * .1, ry = .7 + r * .14;
  return base(i, [[cx - rx - .2, cy + over * .05], [cx - rx * .7, cy + over * ry * 1.25], [cx + rx * .7, cy + over * ry * 1.25], [cx + rx + .2, cy - over * .05]], { twist: 1 + r, noise: .2 });
}

/** Portfolio: everything converges into a horizontal beam that recedes like a tunnel of light. */
function portfolio(i: number): RibbonPose {
  const r = hash(i + 8), lane = (i % 2 === 0 ? 1 : -1) * (.015 + r * .05);
  return base(i, [[-1.5, lane * 3], [-.5, lane], [.5, -lane], [1.5, lane * 2]], { z: -7 + layerOf(i) * 3.5 + r, width: .22 + r * .2, twist: .6, noise: .12, intensity: 1.1 });
}

/** Calm (process + final call to action): a single line of light — the same line as the loader. */
export function calm(i: number, y = LOADER_LINE_Y): RibbonPose {
  return base(i, [[-1.25, y], [-.4, y], [.4, y], [1.25, y]], { z: 0, width: i === 0 ? .05 : .03, twist: 0, noise: .02, intensity: i === 0 ? 1.15 : .14 });
}

export function poseFor(scene: number, i: number, count: number): RibbonPose {
  switch (SCENES[scene]) {
    case "hero": return hero(i);
    case "manifesto": return manifesto(i);
    case "solutions": return solutions(i, count);
    case "product": return product(i);
    case "portfolio": return portfolio(i);
    default: return calm(i, CALM_LINE_Y);
  }
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

/** Blends the poses of the two scenes around the (fractional) scene index, then the loader opening. */
export function blendedPose(scene: number, open: number, i: number, count: number): RibbonPose {
  const a = Math.max(0, Math.min(SCENES.length - 1, Math.floor(scene)));
  const b = Math.min(SCENES.length - 1, a + 1);
  const t = ease(Math.min(1, Math.max(0, scene - a)));
  const from = poseFor(a, i, count), to = poseFor(b, i, count);
  let pose: RibbonPose = {
    points: from.points.map((point, k) => [mix(point[0], to.points[k][0], t), mix(point[1], to.points[k][1], t)] as const) as unknown as RibbonPose["points"],
    z: mix(from.z, to.z, t), width: mix(from.width, to.width, t), intensity: mix(from.intensity, to.intensity, t),
    twist: mix(from.twist, to.twist, t), noise: mix(from.noise, to.noise, t),
  };
  if (open < 1) {
    // Opening: every ribbon starts folded into the loader line, then unfolds into its pose.
    const line = calm(i), o = ease(open);
    pose = {
      points: pose.points.map((point, k) => [mix(line.points[k][0], point[0], o), mix(line.points[k][1], point[1], o)] as const) as unknown as RibbonPose["points"],
      z: mix(0, pose.z, o), width: mix(.03, pose.width, o), intensity: mix(i === 0 ? 1.15 : .3, pose.intensity, o), twist: pose.twist * o, noise: pose.noise * o,
    };
  }
  return pose;
}

/** Cubic Bézier in screen-relative units. */
export function bezier(points: RibbonPose["points"], u: number): [number, number] {
  const v = 1 - u;
  const a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
  return [a * points[0][0] + b * points[1][0] + c * points[2][0] + d * points[3][0], a * points[0][1] + b * points[1][1] + c * points[2][1] + d * points[3][1]];
}
