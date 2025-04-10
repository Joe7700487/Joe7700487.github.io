function main () {
    //INIT: init all the global variables we need
    var grid = [];
    var rows = 10;
    var cols = 10;
    var height = rows * 35;
    var width = cols * 35;
    var start;
    var end;

    //OUTPUT: draw the grid onto the screen with the grid code
    var outputGrid = function (gridCode) {
        document.getElementById('outputId').innerHTML = gridCode;
        document.getElementById('tableId').style.width = width + 'px';
        document.getElementById('tableId').style.height = height + 'px';                    
    }
    //OUTPUT: functions to draw different types of tiles
    var outputObstacle = function (x, y) {
        document.getElementById(grid[x][y].id).style.backgroundColor = 'black';
    }
    var outputGround = function (x, y) {
        document.getElementById(grid[x][y].id).style.backgroundColor = 'white';
    }
    var outputOpenSet = function (x, y) {
        document.getElementById(grid[x][y].id).style.backgroundColor = 'green';
    }
    var outputClosedSet = function (x, y) {
        document.getElementById(grid[x][y].id).style.backgroundColor = 'red';
    }
    var outputCurrent = function (x, y) {
        document.getElementById(grid[x][y].id).style.backgroundColor = 'blue';
    }
    var outputStart = function (x, y) {
        document.getElementById(grid[x][y].id).style.backgroundColor = 'grey';
    }
    var outputEnd = function (x, y) {
        document.getElementById(grid[x][y].id).style.backgroundColor = 'yellow';
    }
    var outputImage = function () {
        document.getElementById('imgId').style.opacity = 1;                
    }
    var removeImage = function () {
        document.getElementById('imgId').style.opacity = 0;                
    }

    //OUTPUT: output the current position of the mouse to the screen
    var outputMousePosition = function (mouse) {
        document.getElementById('debugId').innerHTML = 
        'placed obstacle: x: ' + mouse.x + ' y: ' + mouse.y;                
    }


    //PROCESS: 
    //PROCESS:  function to define each tiles properties
    var Tile = function (x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.gcost;
        this.hcost;
        this.fcost;
        this.neighbors = [];
        this.parent;
        this.obstacle;
        this.start = false;
        this.end = false;

        // calls the function that finds the distance between this. and the end
        this.sethCost = function (tile, end) {
            this.hcost = gethCost(tile, end);
        }

        //when you want to find the neighbosr of a tile call this function
        this.getNeighbors = function (tile) {
            this.neighbors = getNeighbors(tile);
        }
    }

    //PROCESS: turn the grid into code to display on the screen
    var createGridCode = function () {
        var table = '<table id="tableId">';
        //looks at each row
        for (y = 0; y < rows; y++) {
            //looks at each column in each row
            table = table + '<tr>';
            for (x = 0; x < cols; x++) {                      
                table = table + '<td class="tile" ' + 'id="' + x + '-' + y + '">' + '</td>';
            }
        }
        table = table + '</table>';
        return table;
    }

    //PROCESS: creates the the 2d array so we can define each tile
    var createArray = function () {
        //looks at each row                
        for (y = 0; y < rows; y++) {
            var gridArray = [];
            //looks at each column in each row
            for (x = 0; x < cols; x++) {
                gridArray.push(0);
            }
            grid.push(gridArray);
        }
    }

    //PROCESS: assign each tile their respective data values
    var assignValues = function () {
        var id;
        var gcost;
        var hcost;
        //looks at each row
        for (y = 0; y < rows; y++) {
            //looks at each column in each row
            for (x = 0; x < cols; x++) {
                id = x + '-' + y;
                grid[x][y] = new Tile(x, y, id);
            }
        }
    }

    //PROCESS: give each tile a 1/5 chance to be an obstacle
    var assignRandomObstacles = function () {
        //looks at each row   
        for (y = 0; y < rows; y++) {
            //looks at each column in each row
            for (x = 0; x < cols; x++) {
                var random = Math.floor(Math.random() * 5);
                //if the random number is 1 make the tile an obstacle
                if (random == 1) {
                    grid[x][y].obstacle = true;
                    outputObstacle(x, y);
                }
                else {
                    grid[x][y].obstacle = false;
                }
            }
        }
    }

    //PROCESS: tell each tile who their neihgbors are
    var assignNeighbors = function () {
        //looks at each row   
        for (y = 0; y < rows; y++) {
            //looks at each column in each row
            for (x = 0; x < cols; x++) {
                grid[x][y].getNeighbors(grid[x][y]);
            }
        }
    }

    //PROCESS: sets all the obstacles to false
    var refreshGrid = function () {
        //looks at each row                 
        for (y = 0; y < rows; y++) {
            //looks at each column in each row
            for (x = 0; x < cols; x++) {
                //if the tile is an obstacle output color it
                if (grid[x][y].obstacle) {
                    outputObstacle(x, y);
                }
                //if the tile is the start tile color it
                else if (grid[x][y].start) {
                    outputStart(x, y);
                }
                //if the tile is the end tile color it
                else if (grid[x][y].end) {
                    outputEnd(x, y);
                }
                //if the tile is anything else make it white
                else {
                    outputGround(x, y);
                }
            }
        }
    }

    //PROCESS: makes the obstical value in every node false
    var resetGrid = function () {
        //looks at each row 
        for (y = 0; y < rows; y++) { 
            //looks at each column in each row
            for (x = 0; x < cols; x++) {
                grid[x][y].obstacle = false
            }
        }
        refreshGrid();
    }

    //PROCESS: return all the neighbors of the given tile as an array
    var getNeighbors = function (tile) {
        var newArray = [];
        //if statements ensure that only neighbors within the grid get pushed
        if (tile.y > 0) {
            newArray.push(grid[tile.x][tile.y - 1]);                    
        }
        if (tile.y < cols - 1) {            
            newArray.push(grid[tile.x][tile.y + 1]);                            
        }
        if (tile.x > 0) {            
            newArray.push(grid[tile.x - 1][tile.y]);                           
        }
        if (tile.x < rows - 1) {            
            newArray.push(grid[tile.x + 1][tile.y]);                        
        }

        if (tile.y > 0 && tile.x > 0) {
            newArray.push(grid[tile.x - 1][tile.y - 1]);                    
        }
        if (tile.y < cols - 1 && tile.x < rows - 1) {            
            newArray.push(grid[tile.x + 1][tile.y + 1]);                            
        }
        if (tile.x > 0 && tile.y < cols - 1) {            
            newArray.push(grid[tile.x - 1][tile.y + 1]);                           
        }
        if (tile.x < rows - 1 && tile.y > 0) {            
            newArray.push(grid[tile.x + 1][tile.y - 1]);                        
        }
        return newArray;
    }

    //PROCESS: get the heuristic distance from the given tile to the end tile
    var gethCost = function (tile, end) {
        var xDifference = end.x - tile.x;
        var yDifference = end.y - tile.y;
        var hcost = Math.pow(xDifference, 2) + Math.pow(yDifference, 2);
        hcost = Math.sqrt(hcost);
        hcost = hcost * 100
        return(hcost);
    }

    //PROCESS: check if 'array' contains 'tile'
    var contains = function (array, tile) {
        var status = false;
        index = array.indexOf(tile);
        if (index > -1) {
            status = true;
        }
        return status;
    }

    //PROCESS: find the distance between 2 points
    var hyp = function (current, neighbor) {
        var a = current.x - neighbor.x;
        var b = current.y - neighbor.y;
        var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        c = c * 100;
        //c = Math.floor(c);
        return c;
    }

    //PROCESS: gets the current position of the 
    //          mouse and does math to convert it to grid squares
    var getMousePos = function () {
        var cursorx = Math.ceil(event.clientX / (width / cols));
        var cursory = Math.ceil(event.clientY / (height / rows));
        var cursor = {
            x: cursorx,
            y: cursory
        }
        return cursor;
    }

    //PROCESS: finds what path the algorithm found as the best 
    //          path and returns it as an array of tiles
    var reconstructPath = function (current) {
        var temp = current;
        var path = [];
        path.push(temp);
        while (temp.parent) {
            path.push(temp.parent);
            temp = temp.parent;
        }
        return path;
    }

    //PROCESS: a* recursive pathfinding algorithm 
    var aStar = function (start, end) {
        var openSet = [start];

        start.gcost = 0;
        start.sethCost(start, end);
        start.fcost = start.hcost + start.gcost;

        var closedSet = [];
        var path = [];
        var current;
        var fcosts = [];
        var index;
        var tentativegScore;
        var lowest = Infinity;
        var loopamount = 0;
        var loop = function () {
            setTimeout( function () {
                //outputs every tile in openset
                for (i in openSet) {
                    outputOpenSet(openSet[i].x, openSet[i].y);
                }
                //outputs every tile in closedset
                for (i in closedSet) {
                    outputClosedSet(closedSet[i].x, closedSet[i].y);
                }

                //find the node with the lowest fcost in openset
                var lowest = Infinity;
                for (i in openSet) {
                    //if the current tile is lower than the old lowest make replace it
                    if (lowest > openSet[i].fcost) {
                        lowest = openSet[i].fcost
                        current = openSet[i];
                    }
                }
                outputCurrent(current.x, current.y);

                //check if the current tile is the end
                if (current.x == end.x && current.y == end.y) {
                    console.log('solved');

                    path = reconstructPath(current);
                    //outputs every tile in path
                    for (i in path) {
                        outputCurrent(path[i].x, path[i].y);
                    }

                    outputImage();
                    
                    loopamount = Infinity;
                }

                //remove current from openset and add it to closed set
                if (contains(openSet, current)) {
                    index = openSet.indexOf(current);
                    openSet.splice(index, 1);
                    closedSet.push(current);                            
                }

                // check every neighbor of current and add it to openset if its not 
                //  in closedset
                for (i in current.neighbors) {
                    var neighbor = current.neighbors[i];
                    
                    var g = 0;
                    // if the neighbor is not in closedSet 
                    //  and is not an obstacle evaluate it
                    if (contains(closedSet, neighbor) == false && !neighbor.obstacle) {
                        // if the neighbor is diagnal to current add sqrt(2) to g
                        if (neighbor.x != current.x && neighbor.y != current.y) {
                            g = current.gcost + (Math.sqrt(2) * 100);
                        }
                        // if the neighbor is orthogonal to current add 100 to g
                        else {
                            g = current.gcost + 100;                               
                        }
                        // if neighbor in openSet has a worse value 
                        //  than this new g value replace it
                        if (contains(openSet, neighbor)) {
                            if (g > neighbor.gcost) { 
                                neighbor.gcost = g;
                            }
                        }
                        // if none of those set g then make it default
                        else {
                            neighbor.gcost = g;
                            openSet.push(neighbor);
                        }
                        neighbor.sethCost(neighbor, end);
                        neighbor.fcost = neighbor.hcost + neighbor.gcost;
                        neighbor.parent = current;
                    }

                }
                //if there is no solution stop the loop and drwa the red x
                if (openSet.length == 0) {
                    document.getElementById('imgId').src = 
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Red_X.svg/1200px-Red_X.svg.png';
                    outputImage();
                    alert('no solution');                            
                    loopamount = Infinity;
                }

                loopamount++
                if (loopamount < Infinity) {
                    loop();
                }
            }, 0);
        }
        loop();
    }
    ///////////////////////////////////////////////////////////////////////////////////
    //INPUT EVENTS
    //INPUT: load default grid
    document.body.onload = function () {
        var gridCode = createGridCode();
        outputGrid(gridCode);                 
        createArray();
        assignValues();
        assignNeighbors();
    }

    //INPUT: output the new grid taking the grid size as input
    document.getElementById('buttonid').onclick = function () {
        var size = document.getElementById('xinput').value;
        document.getElementById('yinput').value = size;
        var y = document.getElementById('yinput').value;

        cols = size;
        rows = size;

        height;
        width;  

        var gridCode = createGridCode();
        outputGrid(gridCode);                 
        createArray();
        assignValues();
        assignNeighbors();
    }

    //INPUT: get the tile the cursor is hovering over
    document.onmousedown = function (event) {
        removeImage();
        document.getElementById('imgId').src = 
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Checkmark.svg/2304px-Checkmark.svg.png';
        var mouse = getMousePos();

        if (mouse.x < cols + 1 && mouse.y < rows + 1) {
            grid[mouse.x - 1][mouse.y - 1].obstacle = true;
            refreshGrid();                    
        }

        outputMousePosition(mouse);
    }

    //INPUT: define the start tile based on user input
    document.getElementById('setStartButtonId').onclick = function () {
        var x = document.getElementById('startxinput').value - 1;
        var y = document.getElementById('startyinput').value - 1;
        grid[x][y].obstacle = false;
        grid[x][y].start = true;
        start = grid[x][y];
        refreshGrid();
    }
    // define the end tile based on user input
    document.getElementById('setEndButtonId').onclick = function () {
        var temp;

        var x = document.getElementById('endxinput').value - 1;
        var y = document.getElementById('endyinput').value - 1;
        grid[x][y].obstacle = false;
        grid[x][y].end = true;
        end = grid[x][y];
        refreshGrid();
    }

    //INPUT: create random obstacles
    document.getElementById('obstaclesButtonId').onclick = function () {
        assignRandomObstacles();
    }

    //INPUT: clear all obstacles
    document.getElementById('clearObstaclesButtonId').onclick = function () {
        resetGrid();
    }

    //INPUT: start the algorithm with the current settings
    document.getElementById('startButtonId').onclick = function () {
        // start = grid[0][0];
        // end = grid[cols - 1][rows - 1];
        // outputObstacle(end.x, end.y);
        aStar(start, end);
    }
}
main();