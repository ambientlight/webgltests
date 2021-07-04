import { createProgram, resizeCanvasToDisplaySize, loadShader } from './webgl-utils'
const vertexShader: string = require('./shaders/vertex-shader-2d.glsl')
const fragmentShader: string = require('./shaders/fragment-shader-2d.glsl')

const composeProgram = (gl: WebGLRenderingContext, shaderSources: { source: string, type: GLenum}[], error?: (string) => void) => {
  const shaders = shaderSources.map(({source, type}) => loadShader(gl, source, type, error));
  return createProgram(gl, shaders, undefined, undefined, undefined)
}

const main = () => {
  // Get A WebGL context
  const canvas: HTMLCanvasElement = document.querySelector("#c");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error('gl context undefined')
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = composeProgram(gl, [{ source: vertexShader, type: gl.VERTEX_SHADER}, { source: fragmentShader, type: gl.FRAGMENT_SHADER }]);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // set the resolution
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // draw
  const primitiveType = gl.TRIANGLES;
  const count = 6;
  offset = 0;
  gl.drawArrays(primitiveType, offset, count);
}

main();
