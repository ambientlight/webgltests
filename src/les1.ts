import { projection, rotate, translate, scale } from './m3';
import { setupSlider } from './webgl-lessons-ui';
import { createProgram, resizeCanvasToDisplaySize, loadShader } from './webgl-utils'
const vertexShader: string = require('./shaders/les1-vertex-shader-2d.glsl')
const fragmentShader: string = require('./shaders/les1-fragment-shader-2d.glsl')

const composeProgram = (gl: WebGLRenderingContext, shaderSources: { source: string, type: GLenum}[], error?: (string) => void) => {
  const shaders = shaderSources.map(({source, type}) => loadShader(gl, source, type, error));
  return createProgram(gl, shaders, undefined, undefined, undefined)
}

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas: HTMLCanvasElement = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  const program = composeProgram(gl, [
    { source: vertexShader, type: gl.VERTEX_SHADER}, 
    { source: fragmentShader, type: gl.FRAGMENT_SHADER }
  ]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer.
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Set Geometry.
  setGeometry(gl);

  var translation = [200, 150];
  var angleInRadians = 0;
  var scaleXY = [1, 1];

  drawScene();

  // Setup a ui.
  setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  setupSlider("#angle", {slide: updateAngle, max: 360});
  setupSlider("#scaleX", {value: scaleXY[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  setupSlider("#scaleY", {value: scaleXY[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  function updateScale(index) {
    return function(event, ui) {
      scaleXY[index] = ui.value;
      drawScene();
    };
  }

  // Draw the scene.
  function drawScene() {
    const canvas: any = gl.canvas;
    resizeCanvasToDisplaySize(canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    // Compute the matrix
    var matrix = projection(canvas.clientWidth, canvas.clientHeight);
    matrix = translate(matrix, translation[0], translation[1]);
    matrix = rotate(matrix, angleInRadians);
    matrix = scale(matrix, scaleXY[0], scaleXY[1]);

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
  }
}

// Fill the buffer with the values that define a triangle.
// Note, will put the values in whatever buffer is currently
// bound to the ARRAY_BUFFER bind point
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
            0, -100,
          150,  125,
        -175,  100]),
    gl.STATIC_DRAW);
}

main();
