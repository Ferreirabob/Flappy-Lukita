function newElement(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
  }
  
  function createWall(reverse = false) {
    this.element = newElement('div', 'barrier')
  
    const body = newElement('div', 'body')
    const border = newElement('div', 'border')
  
    this.element.appendChild(reverse? body: border)
    this.element.appendChild(reverse? border: body)
  
    this.setHeight = height => body.style.height = `${height}px`
  }
  
  function createTwoWalls(height, opening, x) {
    this.element = newElement('div', 'pair-of-barrier')
  
    this.superior = new createWall(true)
    this.inferior = new createWall(false)
  
    this.element.appendChild(this.superior.element)
    this.element.appendChild(this.inferior.element)
  
    this.drawOpening = () => {
      const topHeight = Math.random() * (height - opening)
      const bottomHeight = height - opening - topHeight
      this.superior.setHeight(topHeight)
      this.inferior.setHeight(bottomHeight)
    }
  
    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth
  
    this.drawOpening()
    this.setX(x)
  }
  
  function walls(height, width, opening, space, notifyPoint) {
  
    this.pairs = [
      new createTwoWalls(height, opening, width),
      new createTwoWalls(height, opening, width + space),
      new createTwoWalls(height, opening, width + space * 2),
      new createTwoWalls(height, opening, width + space * 3)
    ]
  
    // Moviment speed Rigth to Left
    const movement = 4
  
    this.animate = () => {
      this.pairs.forEach((wall, indice) => {
        wall.setX(wall.getX() - movement)

        // When the element get out game area
        if(wall.getX() < -wall.getWidth()) {
          wall.setX(wall.getX() + space * this.pairs.length)
          wall.drawOpening()
        }
  
        const middle = width / 3.4
        const crossMiddle = wall.getX() + movement >= middle && wall.getX() < middle
        if (crossMiddle) {
          notifyPoint()
        }
      })
    }
  }
  
  function flappy(gameHeight) {
    let fly = false
  
    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/passaro.png'
    this.element.style.transition = 'transform 0.3s'
  
    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`
  
    window.onkeydown = e => fly = true
    window.onkeyup = e => fly = false
  
    this.animate = () => {
      const newY = this.getY() + (fly? 9: -6)
      const maxHeight = gameHeight - this.element.clientHeight - 20
  
      if (newY <= 0) {
        this.setY(0)
      } else if (newY >= maxHeight) {
        this.setY(maxHeight)
      } else {
        this.setY(newY)
      }
    }
  
    this.setY(gameHeight / 2)
  }
  
  function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoint = points => {
      this.element.innerHTML = points
    }
    this.updatePoint(0)
  }
  
  
  function overlaid(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()
  
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
  }
  
  function crash(bird, barriers) {
    let colide = false
    barriers.pairs.forEach(wall => {
      if (!colide) {
        const superior = wall.superior.element
        const inferior = wall.inferior.element
  
        colide = overlaid(bird.element, superior) || overlaid(bird.element, inferior)
      }
    })
  
    return colide
  }
  
  function scoreboard() {
    this.score = 0
    this.setScore = x => this.score = x > this.score? x: this.score
    this.getScore = () => this.score
  }
  
  const score = new scoreboard()
  
  function FlappyBirdGame() {
    let points = 0
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const height = areaDoJogo.clientHeight
    const width = areaDoJogo.clientWidth
  
    const progress = new Progress()
    const barriers = new walls(height, width, 215, 400, () => {
      progress.updatePoint(++points)
    })
    const bird = new flappy(height)
    areaDoJogo.appendChild(progress.element)
    areaDoJogo.appendChild(bird.element)
    barriers.pairs.forEach(wall => areaDoJogo.appendChild(wall.element))
  
    this.start = () => {
      //Game Loop
      const timer = setInterval(() => {
        barriers.animate()
        bird.animate()
        if (crash(bird, barriers)) {
          clearInterval(timer)
          playAgain(points)
        }
      }, 20)
    }
  }
  
  
  function playAgain(newPoint = 0) {
    score.setScore(newPoint)
  
    document.querySelector('[wm-flappy]').innerHTML = ''
    const labelPoints = newElement('p', 'my-point')
  
    labelPoints.innerHTML = `Score: ${newPoint}`
  
    const play = newElement('div', 'play-again')
    const playButton = newElement('button', '')
    playButton.innerHTML = 'Play Again'
  
    play.appendChild(playButton)
    play.appendChild(labelPoints)
  
    document.querySelector('[wm-flappy]').appendChild(play)
    const main = new FlappyBirdGame
    playButton.onclick = () =>{
      main.start()
      play.style.display = 'none'
    }
  }
  
  playAgain()