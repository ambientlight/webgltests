import { createProgram, resizeCanvasToDisplaySize, loadShader } from './webgl-utils'
const vertexShader: string = require('./shaders/les0-vertex-shader-2d.glsl')
const fragmentShader: string = require('./shaders/les0-fragment-shader-2d.glsl')

const composeProgram = (gl: WebGLRenderingContext, shaderSources: { source: string, type: GLenum}[], error?: (string) => void) => {
  const shaders = shaderSources.map(({source, type}) => loadShader(gl, source, type, error));
  return createProgram(gl, shaders, undefined, undefined, undefined)
}

const RANDOM_SIZE_CAP = 500;

const canvas: HTMLCanvasElement = document.querySelector("#c");
const gl = canvas.getContext("webgl");
if (!gl) {
  console.error('gl context undefined')
}

// Get A WebGL context
// Use our boilerplate utils to compile the shaders and link into a program
const program = composeProgram(gl, [
  { source: vertexShader, type: gl.VERTEX_SHADER}, 
  { source: fragmentShader, type: gl.FRAGMENT_SHADER }
]);

const colorUniformLocation = gl.getUniformLocation(program, "u_color");

const main = () => {
  // look up uniform locations
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  
  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER, 
    new Float32Array([
      100, 200,
      800, 200,
      100, 300,

      100, 300,
      800, 200,
      800, 300,
    ]), 
    gl.STATIC_DRAW
  );

  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // set the resolution
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // draw
  // const primitiveType = gl.TRIANGLES;
  // const count = 6;
  // offset = 0;
  // gl.drawArrays(primitiveType, offset, count);

  for (var ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    // This will write to positionBuffer because
    // its the last thing we bound on the ARRAY_BUFFER
    // bind point
    setRectangle(
        gl, randomInt(RANDOM_SIZE_CAP), randomInt(RANDOM_SIZE_CAP), randomInt(RANDOM_SIZE_CAP), randomInt(RANDOM_SIZE_CAP));

    // Set a random color.
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
};

main();

window.onresize = () => {
  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  console.log({ width: gl.canvas.width, height: gl.canvas.height });

  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // draw
  // const primitiveType = gl.TRIANGLES;
  // const count = 6;
  // const offset = 0;
  // gl.drawArrays(primitiveType, offset, count);

  for (var ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    // This will write to positionBuffer because
    // its the last thing we bound on the ARRAY_BUFFER
    // bind point
    setRectangle(
        gl, randomInt(RANDOM_SIZE_CAP), randomInt(RANDOM_SIZE_CAP), randomInt(RANDOM_SIZE_CAP), randomInt(RANDOM_SIZE_CAP));

    // Set a random color.
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
};