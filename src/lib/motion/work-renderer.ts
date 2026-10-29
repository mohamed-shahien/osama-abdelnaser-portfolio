import type { WorkImage } from '@/types/work';

export type WorkFrame = {
  current: number;
  speed: number;
  spacing: number;
  focus: number;
  mouse: number;
  hover: number[];
};
type Point = [number, number, number];
export type WorkBounds = { index: number; points: [number, number][]; depth: number };
const vertex = `
attribute vec2 aPoint;
uniform mat4 uCamera;
uniform vec2 uSize;
uniform float uFlat,uSpeed,uCurve,uSpacing,uFocus,uHover,uMouse,uPositionX;
varying vec2 vUv;
varying float vFocus;
vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y+s*p.z,-s*p.y+c*p.z);}
vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.z,p.y,s*p.x+c*p.z);}
vec3 rz(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
void main(){
 float f=smoothstep(0.,1.,1.-smoothstep(0.,.8,abs(uFlat)));
 float shift=sign(uFlat)*smoothstep(.1,.9,abs(uFlat))*uSpacing;
 float bend=sin((aPoint.y+.5)*2.)*.4*clamp(uSpeed*2.,-2.,2.)*uCurve;
 vec3 p=vec3(uFlat+shift-bend,aPoint.y*uSize.y,-aPoint.x*uSize.x-uSize.x*.5-1.);
 p.x-=uSize.x*.5;
 p=rx(p,.06681*f*uFocus);p=ry(p,-.36331*f*uFocus);p=rz(p,-.51318*f*uFocus);
 p.x+=uSize.x*.5;p.y+=uHover*smoothstep(.05,.4,1.-f)*.25;
 p=rz(p,.2884);p=ry(p,-2.2884);p=rx(p,.0215);
 p+=vec3(uPositionX,2.1,5.1);p=ry(p,-uMouse*.05);
 gl_Position=uCamera*vec4(p,1.);vUv=aPoint+.5;vFocus=f;
}`;
const fragment = `
precision highp float;
uniform sampler2D uImage;
uniform vec2 uSize;
uniform float uAspect,uHover;
varying vec2 vUv;varying float vFocus;
void main(){
 vec2 uv=vUv;float a=uSize.x/uSize.y;
 if(a<uAspect)uv.x=(uv.x-.5)*(a/uAspect)+.5;else uv.y=(uv.y-.5)*(uAspect/a)+.5;
 uv=(uv-.5)*(1.-uHover*smoothstep(.65,.95,vFocus)*.156)+.5;
 gl_FragColor=texture2D(uImage,uv);
}`;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function rotate(p: Point, axis: number, angle: number): Point {
  const c = Math.cos(angle),
    s = Math.sin(angle),
    [x, y, z] = p;
  return axis === 0
    ? [x, c * y + s * z, -s * y + c * z]
    : axis === 1
      ? [c * x - s * z, y, s * x + c * z]
      : [c * x - s * y, s * x + c * y, z];
}
function camera(aspect: number) {
  const eye: Point = [20, 12.1, 16.6],
    target: Point = [-7, -2.1, 1.3];
  const normalize = (p: Point): Point => {
    const l = Math.hypot(...p);
    return p.map((v) => v / l) as Point;
  };
  const cross = (a: Point, b: Point): Point => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const dot = (a: Point, b: Point) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
  const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const x = normalize(cross([0, 1, 0], z)),
    y = cross(z, x);
  const sx = 2 / (10.8 * aspect),
    sy = 2 / 10.8,
    sz = -2 / 999.9;
  return new Float32Array([
    sx * x[0],
    sy * y[0],
    sz * z[0],
    0,
    sx * x[1],
    sy * y[1],
    sz * z[1],
    0,
    sx * x[2],
    sy * y[2],
    sz * z[2],
    0,
    -sx * dot(x, eye),
    -sy * dot(y, eye),
    -sz * dot(z, eye) - 1000.1 / 999.9,
    1,
  ]);
}

/** Native WebGL bent pages. Rendered only when input, a texture, or a finite tween changes. */
export function createWorkRenderer(
  canvas: HTMLCanvasElement,
  initialProjects: readonly { cover: WorkImage }[],
  invalidate: () => void,
) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  if (!gl) return;
  function shader(kind: number, source: string) {
    if (!gl) throw new Error('WebGL unavailable');
    const result = gl.createShader(kind);
    if (!result) throw new Error('Shader allocation failed');
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(result);
      gl.deleteShader(result);
      throw new Error(error ?? 'Shader compilation failed');
    }
    return result;
  }
  const vs = shader(gl.VERTEX_SHADER, vertex),
    fs = shader(gl.FRAGMENT_SHADER, fragment),
    program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error(message ?? 'Page shader linking failed');
  }
  const names = [
    'uCamera',
    'uSize',
    'uFlat',
    'uSpeed',
    'uCurve',
    'uSpacing',
    'uFocus',
    'uHover',
    'uMouse',
    'uPositionX',
    'uAspect',
    'uImage',
  ] as const;
  const uniforms = Object.fromEntries(
    names.map((name) => [name, gl.getUniformLocation(program, name)]),
  ) as Record<(typeof names)[number], WebGLUniformLocation | null>;
  const points: number[] = [],
    indices: number[] = [],
    segments = 40;
  for (let y = 0; y <= segments; y++)
    for (let x = 0; x <= segments; x++) points.push(x / segments - 0.5, y / segments - 0.5);
  for (let y = 0; y < segments; y++)
    for (let x = 0; x < segments; x++) {
      const i = y * (segments + 1) + x;
      indices.push(i, i + 1, i + segments + 1, i + 1, i + segments + 2, i + segments + 1);
    }
  const buffer = gl.createBuffer(),
    elements = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  const attribute = gl.getAttribLocation(program, 'aPoint');
  const textures = new Map<number, { texture: WebGLTexture; aspect: number; used: number }>();
  const pending = new Map<number, HTMLImageElement>();
  let width = 1,
    height = 1,
    mobile = false,
    matrix = camera(1),
    disposed = false,
    clock = 0;
  let projects = initialProjects;
  const getTexture = (index: number) => {
    const cached = textures.get(index);
    if (cached) {
      cached.used = ++clock;
      return cached;
    }
    if (!pending.has(index)) {
      const project = projects[index];
      if (!project) return;
      const image = new Image();
      pending.set(index, image);
      image.decoding = 'async';
      image.onload = () => {
        pending.delete(index);
        if (disposed) return;
        const texture = gl.createTexture();
        if (!texture) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        textures.set(index, {
          texture,
          aspect: image.naturalWidth / image.naturalHeight,
          used: ++clock,
        });
        if (textures.size > 12) {
          const oldest = [...textures].sort((a, b) => a[1].used - b[1].used)[0];
          if (oldest) {
            gl.deleteTexture(oldest[1].texture);
            textures.delete(oldest[0]);
          }
        }
        invalidate();
      };
      image.onerror = () => pending.delete(index);
      image.src = project.cover.src;
    }
  };
  const projectPoint = (
    vx: number,
    vy: number,
    flat: number,
    hover: number,
    frame: WorkFrame,
  ): [number, number, number] => {
    const w = mobile ? 3 : 4.492,
      h = mobile ? 2 : 3.658,
      f = smooth(0, 1, 1 - smooth(0, 0.8, Math.abs(flat)));
    const bend =
      Math.sin((vy + 0.5) * 2) *
      0.4 *
      Math.max(-2, Math.min(2, -frame.speed * 2)) *
      (mobile ? 1.15 : 2.25);
    let p: Point = [
      flat + Math.sign(flat) * smooth(0.1, 0.9, Math.abs(flat)) * frame.spacing - bend - w * 0.5,
      vy * h,
      -vx * w - w * 0.5 - 1,
    ];
    p = rotate(p, 0, 0.06681 * f * frame.focus);
    p = rotate(p, 1, -0.36331 * f * frame.focus);
    p = rotate(p, 2, -0.51318 * f * frame.focus);
    p[0] += w * 0.5;
    p[1] += hover * smooth(0.05, 0.4, 1 - f) * 0.25;
    p = rotate(p, 2, 0.2884);
    p = rotate(p, 1, -2.2884);
    p = rotate(p, 0, 0.0215);
    p = [p[0] + (mobile ? 3.8 : 4.3), p[1] + 2.1, p[2] + 5.1];
    p = rotate(p, 1, -frame.mouse * 0.05);
    const v = (row: number) =>
      (matrix[row] ?? 0) * p[0] +
      (matrix[row + 4] ?? 0) * p[1] +
      (matrix[row + 8] ?? 0) * p[2] +
      (matrix[row + 12] ?? 0);
    return [(v(0) + 1) * width * 0.5, (1 - v(1)) * height * 0.5, v(2)];
  };
  return {
    updateProjects(next: readonly { cover: WorkImage }[]) {
      textures.forEach((item, index) => {
        if (projects[index]?.cover.src === next[index]?.cover.src) return;
        gl.deleteTexture(item.texture);
        textures.delete(index);
      });
      pending.forEach((image, index) => {
        if (projects[index]?.cover.src === next[index]?.cover.src) return;
        image.onload = null;
        image.onerror = null;
        image.src = '';
        pending.delete(index);
      });
      projects = next;
    },
    resize(w: number, h: number) {
      width = w;
      height = h;
      mobile = w <= 767;
      matrix = camera(w / h);
      const ratio = Math.min(devicePixelRatio, mobile ? 1.25 : 1.5);
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(frame: WorkFrame): WorkBounds[] {
      if (disposed) return [];
      // Keep the previous canvas frame while a newly inserted cover decodes.
      if (!getTexture(Math.max(0, Math.min(projects.length - 1, Math.round(frame.current)))))
        return [];
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
      gl.uniformMatrix4fv(uniforms.uCamera, false, matrix);
      gl.uniform2f(uniforms.uSize, mobile ? 3 : 4.492, mobile ? 2 : 3.658);
      gl.uniform1f(uniforms.uSpeed, -frame.speed);
      gl.uniform1f(uniforms.uCurve, mobile ? 1.15 : 2.25);
      gl.uniform1f(uniforms.uSpacing, frame.spacing);
      gl.uniform1f(uniforms.uFocus, frame.focus);
      gl.uniform1f(uniforms.uMouse, mobile ? 0 : frame.mouse);
      gl.uniform1f(uniforms.uPositionX, mobile ? 3.8 : 4.3);
      const bounds: WorkBounds[] = [];
      for (let i = 0; i < projects.length; i++) {
        const flat = frame.current - i;
        if (Math.abs(flat) > 5.5) continue;
        const index = i,
          hover = frame.hover[index] ?? 0;
        const texture = getTexture(index);
        if (!texture) continue;
        gl.uniform1f(uniforms.uFlat, flat);
        gl.uniform1f(uniforms.uHover, hover);
        gl.uniform1f(uniforms.uAspect, texture.aspect);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        gl.uniform1i(uniforms.uImage, 0);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        const polygon: [number, number][] = [];
        for (let edge = 0; edge < 4; edge++)
          for (let j = 0; j <= 8; j++) {
            const t = j / 8;
            const vx = edge === 0 ? t - 0.5 : edge === 1 ? 0.5 : edge === 2 ? 0.5 - t : -0.5;
            const vy = edge === 0 ? -0.5 : edge === 1 ? t - 0.5 : edge === 2 ? 0.5 : 0.5 - t;
            const p = projectPoint(vx, vy, flat, hover, frame);
            polygon.push([p[0], p[1]]);
          }
        bounds.push({ index, points: polygon, depth: projectPoint(0, 0, flat, hover, frame)[2] });
      }
      return bounds;
    },
    dispose() {
      disposed = true;
      pending.forEach((image) => {
        image.onload = null;
        image.onerror = null;
        image.src = '';
      });
      pending.clear();
      textures.forEach((item) => gl.deleteTexture(item.texture));
      textures.clear();
      gl.deleteBuffer(buffer);
      gl.deleteBuffer(elements);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
