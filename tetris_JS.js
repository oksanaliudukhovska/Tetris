

const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROW = 20;
let playfield;
let cells;
let isPaused = false;
let timedId;
let isGameOver = false;
let overlay = document.querySelector('.overlay');
// console.log(overlay);
let scoreElement = document.querySelector('.scope');
// console.log(scoreElement);
let btnRestast = document.querySelector('.btnRestart');
let score = 0;

const TETROMINO_NAMES = [
    'O',
    'L',
    'G',
    'S',
    'Z',
    'I',
    'T'
]
const TETROMINOES = {
    'O' : [
        [1, 1],
        [1, 1]
    ],
   'L' : [
       [0, 0, 1],
       [1, 1, 1],
       [0, 0, 0]
   ],
   'G' : [
    [0, 1, 1],
    [0, 1, 0],
    [0, 1, 0]
],
'   S' : [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
],
    'Z' : [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
],
'I' : [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
],
'T' : [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0]
]   
}

let tetromino = {
name: '',
matrix: [],
column: 0,
row: 0
}

// COMMON
function init(){
    score = 0;
    scoreElement.innerHTML = 0;
    isGameOver = false;
    generatePlayfield();
    cells = document.querySelectorAll('.tetris div');
    generateTetromino();

    moveDown();
   //draw();
}

function convertPositionToIndex(row, col) {
    return row * PLAYFIELD_COLUMNS + col;
}

function randomFigure(array){
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];

} 

// GENERATION 
function generateTetromino() {
    const nameTetro = randomFigure(TETROMINO_NAMES);
    const matrix = TETROMINOES[nameTetro];

    const columnTetro = Math.floor(PLAYFIELD_COLUMNS / 2 - matrix.length / 2);
    const rowTetro = -2;  

    tetromino = {
        name: nameTetro,
        matrix: matrix,
        column: columnTetro,
        row: rowTetro,
    }
}

function generatePlayfield(){

    for(let i = 0; i < PLAYFIELD_COLUMNS * PLAYFIELD_ROW; i++){
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }
    playfield = new Array(PLAYFIELD_ROW).fill()
    .map( ()=>new Array(PLAYFIELD_COLUMNS).fill(0))
  // console.table(playfield);
}

// KEYBOARD & Clicks
btnRestast.addEventListener('click', function(){
    document.querySelector('.tetris').innerHTML = '';
    overlay.style.display = 'none';
    init();
})

document.addEventListener('keydown', onKeyDown)

function onKeyDown(event){
  //console.log(event);
 
    if(event.key == 'Escape'){
        togglePaused();
    }
    if(!isPaused){
        if(event.key == ' '){
          dropTetrominoDown()
        }
        if(event.key == 'ArrowUp'){
            rotate()
        }
        if(event.key == 'ArrowRight'){
            moveTetraminoRight()
        }
        if(event.key == 'ArrowLeft'){
            moveTetraminoLeft()
        }
        if(event.key == 'ArrowDown'){
            moveTetraminoDown() 
        }
    }
    draw()
}

function moveTetraminoDown(){
    tetromino.row += 1;
    if(!isValid()){
        tetromino.row -= 1;
        placeTetramino()
    }
   
}
function moveTetraminoLeft(){
    tetromino.column -= 1;
        if(!isValid()){
            tetromino.column += 1;
        }
}
function moveTetraminoRight(){
    tetromino.column += 1;
    if(!isValid()){
        tetromino.column -= 1;
    } 
}
function draw(){
   cells.forEach( el => el.removeAttribute('class') )
    drawPlayfield();
    drawTetromino();
}

function dropTetrominoDown(){
    while(isValid()){
     tetromino.row++;
    }
    tetromino.row--; 
}

function togglePaused(){
    if(isPaused){
     startLoop()
    }
    else{
        stopLoop();
    }
  
    isPaused = !isPaused;

} 



// ROTATE

// temporary
// let showRotated = [
//    [1,2,3],
 //   [4,5,6],
  //  [7,8,9]
// ]

function rotate(){
    rotateTetronimo();
    draw();
}

function rotateTetronimo(){
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    // showRotated = rotateMatrix(showRotated) //
    tetromino.matrix = rotatedMatrix;
    if(!isValid()){
        tetromino.matrix = oldMatrix;
    }
}

function rotateMatrix(matrixTetromino){
    const N = matrixTetromino.length;
    const rotateMatrix = [];
  
    for(let i = 0; i < N; i++){
     rotateMatrix[i] = [];
     for(let j =0; j < N; j++){
        rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
     }
    }
    return rotateMatrix;
}

// COLLISIONS

function isValid(){
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column =0; column < matrixSize; column++){
           if(isOutsideOfGameboard(row, column)){return false}
           if(hasCollisions(row, column)){return false}
        }
       
      }   
      return true;
}
function isOutsideOfTopGameboard(row){
    return tetromino.row + row < 0;

}

function isOutsideOfGameboard(row, column){
    return tetromino.matrix[row][column] &&
    (tetromino.row + row >= PLAYFIELD_ROW || 
    tetromino.column + column < 0 ||
    tetromino.column + column >= PLAYFIELD_COLUMNS)
}

function hasCollisions(row, column){
    return tetromino.matrix[row][column] && playfield[tetromino.row + row]?.[tetromino.column + column]
}

// DRAW 
function drawTetromino(){
  const name = tetromino.name;
  const tetrominoMatrixSize = tetromino.matrix.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column =0; column < tetrominoMatrixSize; column++){
        // код для примера алгоритма разротора фигур
       // const cellIndex = convertPositionToIndex(tetromino.row +row, tetromino.column + column);
        // cells[cellIndex].innerHTML = showRotated[row][column];
       if(isOutsideOfTopGameboard(row)){ continue}
        if(!tetromino.matrix[row][column]){continue}
         const cellIndex = convertPositionToIndex(tetromino.row +row, tetromino.column + column);
        cells[cellIndex].classList.add(name);
    }
   
  }
}

function drawPlayfield(){
    for ( let row = 0; row < PLAYFIELD_ROW; row++ ) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
    if(!playfield[row][column]) continue;
    const nameFigure = playfield[row][column];
    const cellIndex = convertPositionToIndex(row, column);

     cells[cellIndex].classList.add(nameFigure);
    }
     
 }
}

function countScore(destroyRows){
  if(destroyRows == 1){
    score += 100;
  }
  if(destroyRows == 2){
    score += 200;
  }
  if(destroyRows == 3){
    score += 400;
  }
  if(destroyRows == 4){
    score += 800;
  }
  scoreElement.innerHTML = score;
}

function placeTetramino(){
    const tetrominoMatrixSize = tetromino.matrix.length;
    for( let row = 0; row < tetrominoMatrixSize; row++ ) {
        for(let column = 0; column < tetrominoMatrixSize; column++) {
            if(isOutsideOfTopGameboard(row)){
            isGameOver = true;
            overlay.style.display = 'flex';
            return;
            }
           if(tetromino.matrix[row][column]){
           playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
        }
        }
         
     }
   // console.log(playfield);
   let filledRows = findFilledRows();
   //console.log(filledRows);
   removeFillRow(filledRows);
   countScore(filledRows.length);
    generateTetromino() 
}

function findFilledRows(){
    const fillRows = [];
    for (let row = 0; row < PLAYFIELD_ROW; row++) {
       let filledColumns = 0;
      for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
        if(playfield[row][column] != 0) {
           filledColumns++;
        }   
      }
      if(PLAYFIELD_COLUMNS == filledColumns){
       fillRows.push(row);
      }
       }
      return fillRows;
   }

 function removeFillRow(filledRows){
  for(let i = 0; i < filledRows.length; i++){
    const row = filledRows[i];
    dropRowsAbove(row);
  }
 }

function dropRowsAbove(rowDelete){
    for (let row = rowDelete; row > 0; row--) {
        playfield[row] = playfield[row -1];         
        }
        playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}





function moveDown(){

    moveTetraminoDown();
    draw();
    stopLoop();
    startLoop();
}

function startLoop(){
  timedId = setTimeout( ()=> requestAnimationFrame (moveDown), 700 )

}// свободное падение

function stopLoop(){
 clearTimeout(timedId);
 timedId = null;
}


 init();

