/* global document performance */

//Map Object
var map = {
    //User input variables init value
    mapSize: 6,
    chunkSize: 6,
    minVal: -3,
    maxVal: 12,
    baseElevation: 0,
    varienceFactor: 2,
    //Time to run the object functions
    functionTime: new Array(),
    printDebug: function(){
        //Chunk Array in Text Format
        var chunkList = ""; 
        for(var i = 1; i <= Math.pow(this.mapSize,2); i++){
            if(i == Math.pow(this.mapSize,2)){
                chunkList += "chunk"+i; 
            }
            else{
                chunkList += "chunk"+i + ", "
            }
        }
        //Print out Debug Information
        document.getElementById("map").innerHTML += "<pre>"+"Map Length: "+this.mapSize+"\nChunk Size: "+this.chunkSize+"\nMinimum Height Voxel Value: "+this.minVal+"\nMaximum Height Voxel Value: "+this.maxVal+"\nAmount of Chunks: "+Math.pow(this.mapSize,2)+"\nAmount of Voxels: "+Math.pow(this.mapSize,2)*Math.pow(this.chunkSize,2)+"\nAmount of Voxels per Chunk: "+Math.pow(this.chunkSize,2)+"\nAll Chunks: "+chunkList+"\nObject Data:"+JSON.stringify(this)+"\nGeneration Time Elapsed: "+(map.functionTime[1] - map.functionTime[0])/1000+"s"+"</pre>";
    },
    loadInputs: function(){
        //Take the inputs from the HTML form and assign them to variables in the "map" object
        this.mapSize = parseInt(document.getElementById("mapSize").value);
        this.chunkSize = parseInt(document.getElementById("chunkSize").value);
        this.minVal = parseInt(document.getElementById("minVal").value);
        this.maxVal = parseInt(document.getElementById("maxVal").value);
        this.baseElevation = parseInt(document.getElementById("baseElevation").value);
        this.varienceFactor = Math.abs(parseInt(document.getElementById("varienceFactor").value));
    },
    createChunks: function(){
        //Create all the chunks based off the "mapSize" variable
        for(var i = 1; i <= Math.pow(this.mapSize,2); i++){
        this["chunk"+i] = [];
            for(var j = 1; j <= Math.pow(this.chunkSize,2); j++){
                this["chunk"+i].push(0);
            }
        }
    },
    biasRan: function(inputVal){
        var currentVal = inputVal + (Math.floor(Math.random()*(this.varienceFactor*2+1)-this.varienceFactor));
        if (currentVal <= this.minVal){
            currentVal = this.minVal;
        }
        else if (currentVal >= this.maxVal){
            currentVal = this.maxVal;
        }
        return currentVal;
        
    },
    averageCorners: function(chunkX, chunkY){
        return Math.ceil((chunkX+chunkY)/2);
    },
    assignCorners: function(){
        for(var i = 1; i <= Math.pow(this.mapSize,2); i++){
            if(i == 1){
                this["chunk"+i][0] = this.biasRan(this.baseElevation);                                           //Top Left
                this["chunk"+i][this.chunkSize-1] = this.biasRan(this.baseElevation);                            //Top Right
                this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize] = this.biasRan(this.baseElevation);   //Bottom Left
                this["chunk"+i][Math.pow(this.chunkSize,2)-1] = this.biasRan(this.baseElevation);                //Bottom Right
            }
            else if(i >= 2 && i <= this.mapSize){
                this["chunk"+i][0] = this["chunk"+(i-1)][this.chunkSize-1];
                this["chunk"+i][this.chunkSize-1] = this.biasRan(this["chunk"+(i-1)][this.chunkSize-1]);
                this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize] = this["chunk"+(i-1)][Math.pow(this.chunkSize,2)-1];
                this["chunk"+i][Math.pow(this.chunkSize,2)-1] = this.biasRan(this.averageCorners(this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize], this["chunk"+i][this.chunkSize-1]));
            }
            else if(i % this.mapSize == 1 && i != 1){
                this["chunk"+i][0] = this["chunk"+(i-this.mapSize)][Math.pow(this.chunkSize,2)-this.chunkSize];
                this["chunk"+i][this.chunkSize-1] = this["chunk"+(i-this.mapSize)][Math.pow(this.chunkSize,2)-1];
                this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize] = this.biasRan(this["chunk"+(i-this.mapSize)][Math.pow(this.chunkSize,2)-this.chunkSize]);
                this["chunk"+i][Math.pow(this.chunkSize,2)-1] = this.biasRan(this.averageCorners(this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize], this["chunk"+i][this.chunkSize-1]))
            }
            else {
                this["chunk"+i][0] = this["chunk"+(i-1)][this.chunkSize-1];
                this["chunk"+i][this.chunkSize-1] = this["chunk"+(i-this.mapSize)][Math.pow(this.chunkSize,2)-1];
                this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize] = this["chunk"+(i-1)][Math.pow(this.chunkSize,2)-1];
                this["chunk"+i][Math.pow(this.chunkSize,2)-1] = this.biasRan(this.averageCorners(this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize], this["chunk"+i][this.chunkSize-1]))
            }
        }
    },
    rowInterpolation: function(){
        for(var i = 1; i <= Math.pow(this.mapSize,2); i++){
            var corner = [this["chunk"+i][0], this["chunk"+i][this.chunkSize-1], this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize], this["chunk"+i][Math.pow(this.chunkSize,2)-1]]
            for(var j = 2; j <= this.chunkSize-1; j++){
                var val = Math.round((((j-1)*(corner[1]-corner[0]))/(this.chunkSize-1))+corner[0]);
                this["chunk"+i][j-1] = val;
                val = Math.round((((j-1)*(corner[3]-corner[2]))/(this.chunkSize-1))+corner[2]);
                this["chunk"+i][j+(Math.pow(this.chunkSize,2)-this.chunkSize)-1] = val;
            }
        }
    },
    collumnInterpolation: function(){
        for(var i = 1; i <= Math.pow(this.mapSize,2); i++){
            for(var j = 1; j <= this.chunkSize; j++){
                for(var k = 1; k<= this.chunkSize-2; k++){
                    var top = this["chunk"+i][j-1];
                    var bottom = this["chunk"+i][Math.pow(this.chunkSize,2)-this.chunkSize+j-1]
                    this["chunk"+i][this.chunkSize*(k)+j-1] = Math.round((bottom-top)/(this.chunkSize-2)*k+top)
                }
            }
        }
    },
    draw: function(){
        var size = document.getElementById("viewSlider").value;
        var chunkSize = this.chunkSize;
        var mapSize = this.mapSize;
        var canvas = document.getElementById('canvas');
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.canvas.width  = size*chunkSize*mapSize;
            ctx.canvas.height = size*chunkSize*mapSize;
            for(var t=0; t<mapSize; t++){
                for(var l=0; l<mapSize; l++){
                    for(var i=0; i<chunkSize; i++){
                        for(var j=0; j<chunkSize; j++){
                        var value = this["chunk"+((l)+(t*mapSize)+1)][(i)+(j*chunkSize)];
                        var color;
                        if(value == -3) color = '#286ca8';
                        else if(value == -2) color = '#2b6ec9';
                        else if(value == -1) color = '#4d89db';
                        else if(value == 0) color = '#64a0f2';
                        else if(value == 1) color = '#FEFAF5';
                        else if(value == 2) color = '#D8F5B7';
                        else if(value == 3) color = '#B2EB6F';
                        else if(value == 4) color = '#BCED81';
                        else if(value == 5) color = '#b2eb6f';
                        else if(value == 6) color = '#a5de62';
                        else if(value == 7) color = '#A0D266';
                        else if(value == 8) color = '#90C256';
                        else if(value == 9) color = '#7CA64A';
                        else if(value == 10) color = '#7CA151';
                        else if(value == 11) color = '#7D9C57';
                        else if(value == 12) color = '#7D985E';
                        else color = '#000000';
                        ctx.fillStyle = color;
                        ctx.fillRect(i*size+l*size*chunkSize, j*size+t*size*chunkSize, size, size);
                        ctx.fillStyle = "rgb(255,255,255)";
                        ctx.font = "25px Arial";
                        //ctx.fillText(value, i*size+l*size*chunkSize+10, j*size+t*size*chunkSize+size-10);
                       }
                    }
                    ctx.lineWidth=3;
                    ctx.strokeStyle = "rgb(255,255,255)";
                    ctx.setLineDash([5, 10]);
                    //ctx.strokeRect(l*chunkSize*size, t*chunkSize*size, size*chunkSize, size*chunkSize);
                }
            }
        }
    }, 
    clear: function(){
        document.getElementById("map").innerHTML = null;
    },
    generate: function(){
        //Get starting time for debug
        this.functionTime[0] = performance.now();
        //-------- NON-DEBUG STUFF ------------------
        //Clear the "map" div
        this.clear();
        //Reassign Inputs of Form to Object
        this.loadInputs();
        //Create the Initial Chunks
        this.createChunks();
        //Assign Block Corner Values for Chunks
        this.assignCorners();
        this.rowInterpolation();
        this.collumnInterpolation();
        //Draw the final map
        //this.draw();
        //-------------------------------------------
        //Get final time for debug
        this.functionTime[1] = performance.now();
        //Display debug menu
        this.printDebug();
    }
};