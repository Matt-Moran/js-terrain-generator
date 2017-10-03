class Map {
  // Constructor assigns inputs to the object
  constructor (mapSize, chunkSize, minVal, maxVal, baseElevation, varienceFactor) {
    this.mapSize = mapSize
    this.chunkSize = chunkSize
    this.minVal = minVal
    this.maxVal = maxVal
    this.baseElevation = baseElevation
    this.varienceFactor = varienceFactor
  }

  // Utility functions used in the generation process functions
  biasRan (inputVal) {
    var currentVal = inputVal + (Math.floor(Math.random() * (this.varienceFactor * 2 + 1) - this.varienceFactor))
    if (currentVal <= this.minVal) {
      currentVal = this.minVal
    } else if (currentVal >= this.maxVal) {
      currentVal = this.maxVal
    }
    return currentVal
  }

  //Averages two corner values
  averageCorners (cornerX, cornerY) {
    return Math.ceil((cornerX + cornerY) / 2)
  }

  //Generates the initial chunk arrays in the object determined by the "mapSize" value
  createChunks () {
    for (var i = 1; i <= Math.pow(this.mapSize, 2); i++) {
      this['chunk' + i] = []
      for (var j = 1; j <= Math.pow(this.chunkSize, 2); j++) {
        this['chunk' + i].push(0)
      }
    }
  }

  // Functions that are used in the generation process
  assignCorners () {
    for (var i = 1; i <= Math.pow(this.mapSize, 2); i++) {
      if (i === 1) {
        this['chunk' + i][0] = this.biasRan(this.baseElevation) // Top Left
        this['chunk' + i][this.chunkSize - 1] = this.biasRan(this.baseElevation) // Top Right
        this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize] = this.biasRan(this.baseElevation) // Bottom Left
        this['chunk' + i][Math.pow(this.chunkSize, 2) - 1] = this.biasRan(this.baseElevation) // Bottom Right
      } else if (i >= 2 && i <= this.mapSize) {
        this['chunk' + i][0] = this['chunk' + (i - 1)][this.chunkSize - 1]
        this['chunk' + i][this.chunkSize - 1] = this.biasRan(this['chunk' + (i - 1)][this.chunkSize - 1])
        this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize] = this['chunk' + (i - 1)][Math.pow(this.chunkSize, 2) - 1]
        this['chunk' + i][Math.pow(this.chunkSize, 2) - 1] = this.biasRan(this.averageCorners(this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize], this['chunk' + i][this.chunkSize - 1]))
      } else if (i % this.mapSize === 1 && i !== 1) {
        this['chunk' + i][0] = this['chunk' + (i - this.mapSize)][Math.pow(this.chunkSize, 2) - this.chunkSize]
        this['chunk' + i][this.chunkSize - 1] = this['chunk' + (i - this.mapSize)][Math.pow(this.chunkSize, 2) - 1]
        this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize] = this.biasRan(this['chunk' + (i - this.mapSize)][Math.pow(this.chunkSize, 2) - this.chunkSize])
        this['chunk' + i][Math.pow(this.chunkSize, 2) - 1] = this.biasRan(this.averageCorners(this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize], this['chunk' + i][this.chunkSize - 1]))
      } else {
        this['chunk' + i][0] = this['chunk' + (i - 1)][this.chunkSize - 1]
        this['chunk' + i][this.chunkSize - 1] = this['chunk' + (i - this.mapSize)][Math.pow(this.chunkSize, 2) - 1]
        this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize] = this['chunk' + (i - 1)][Math.pow(this.chunkSize, 2) - 1]
        this['chunk' + i][Math.pow(this.chunkSize, 2) - 1] = this.biasRan(this.averageCorners(this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize], this['chunk' + i][this.chunkSize - 1]))
      }
    }
  }

  rowInterpolation () {
    for (var i = 1; i <= Math.pow(this.mapSize, 2); i++) {
      var corner = [this['chunk' + i][0], this['chunk' + i][this.chunkSize - 1], this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize], this['chunk' + i][Math.pow(this.chunkSize, 2) - 1]]
      for (var j = 2; j <= this.chunkSize - 1; j++) {
        var val = Math.round((((j - 1) * (corner[1] - corner[0])) / (this.chunkSize - 1)) + corner[0])
        this['chunk' + i][j - 1] = val
        val = Math.round((((j - 1) * (corner[3] - corner[2])) / (this.chunkSize - 1)) + corner[2])
        this['chunk' + i][j + (Math.pow(this.chunkSize, 2) - this.chunkSize) - 1] = val
      }
    }
  }

  collumnInterpolation () {
    for (var i = 1; i <= Math.pow(this.mapSize, 2); i++) {
      for (var j = 1; j <= this.chunkSize; j++) {
        for (var k = 1; k <= this.chunkSize - 2; k++) {
          var top = this['chunk' + i][j - 1]
          var bottom = this['chunk' + i][Math.pow(this.chunkSize, 2) - this.chunkSize + j - 1]
          this['chunk' + i][this.chunkSize * (k) + j - 1] = Math.round((bottom - top) / (this.chunkSize - 2) * k + top)
        }
      }
    }
  }

  // run four steps to generate a map
  generate () {
    this.createChunks()
    this.assignCorners()
    this.rowInterpolation()
    this.collumnInterpolation()
    return this
  }
  
  // "get" functions
  getChunk (chunkVal) {
    if (this['chunk' + chunkVal] !== null) return this['chunk' + chunkVal]
  }
  
  getVoxel (chunkVal, voxelVal) {
    if (this['chunk' + chunkVal] !== null || this['chunk' + chunkVal][voxelVal] !== null) return this['chunk' + chunkVal][voxelVal]
  }
}
