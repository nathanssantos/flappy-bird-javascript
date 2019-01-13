function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'barrier-border')
    const body = newElement('div', 'barrier-body')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

function BarrierPair(height, gap, x) {
    this.element = newElement('div', 'barrier-pair')

    this.superior = new Barrier(true)
    this.inferior = new Barrier(false)

    this.element.appendChild(this.superior.element)
    this.element.appendChild(this.inferior.element)

    this.randomGap = () => {
        const superiorHeight = Math.random() * (height - gap)
        const inferiorHeight = height - gap - superiorHeight
        this.superior.setHeight(superiorHeight)
        this.inferior.setHeight(inferiorHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.randomGap()
    this.setX(x)
}

function Barriers(height, width, gap, space, notifyPoint) {
    this.pairs = [
        new BarrierPair(height, gap, width),
        new BarrierPair(height, gap, width + space),
        new BarrierPair(height, gap, width + space * 2),
        new BarrierPair(height, gap, width + space * 3)
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.randomGap()
            }

            const middle = width / 2
            const crossedMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            if (crossedMiddle) notifyPoint()
        })
    }
}

function Bird(gameHeight) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'images/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false
    window.onmousedown = e => flying = true
    window.onmouseup = e => flying = false 

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxFlyingHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxFlyingHeight) {
            this.setY(maxFlyingHeight)
        } else {
            this.setY(newY)
        }
    }
    this.setY(gameHeight / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function overlayCheck(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function collision(bird, barriers) {
    let collision = false
    barriers.pairs.forEach(barrierPair => {
        if (!collision) {
            const superior = barrierPair.superior.element
            const inferior = barrierPair.inferior.element
            collision = overlayCheck(bird.element, superior)
                || overlayCheck(bird.element, inferior)

        }
    })
    return collision
}


function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[flappy-bird]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400,
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            barriers.animate()
            bird.animate()

            if(collision(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()