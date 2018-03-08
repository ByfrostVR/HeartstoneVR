/**
 * Created by Clovin on 06/11/2017.
 */

/**
 * Created by Clovin on 2017/8/1.
 */
(function () {
  let handDrag

  function calAngle (a, b) {
    return Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2)) * Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2) + Math.pow(b[2], 2))))
  }

  handDrag = function (options) {
    options || (options = {})

    options.distance || (options.distance = 50)

    let beginPos = new Map()
    let beginDir = new Map()
    let status = new Map()

    // use for delete the lost hand from Map
    let activeHand = new Map()
    setInterval(function () {
      for (let key of activeHand.keys()) {
        if (activeHand.get(key) < Date.now() - 10000) {
          beginPos.delete(key)
          beginDir.delete(key)
          status.delete(key)
          activeHand.delete(key)
        }
      }
    }, 300000)

    return {
      hand: function (hand) {
        //  init
        if (!beginPos.get(hand.id)) {
          beginPos.set(hand.id, null)
          status.set(hand.id, 0)
        }
        activeHand.set(hand.id, Date.now())

        //  judge whether the gesture is valid
        if (calAngle(hand.palmNormal, [0, 0, -1]) < 0.785) {
          if (status.get(hand.id) === 0) {
            beginPos.set(hand.id, hand.palmPosition)
            status.set(hand.id, 1)
          }
        } else {
          beginPos.set(hand.id, null)
          status.set(hand.id, 0)
          return
        }

        if (status.get(hand.id) === 2 && Math.abs(hand.palmPosition[0] - beginPos.get(hand.id)[0]) < 30) {
          status.set(hand.id, 0)
          return
        }

        //  judge whether the movement is larger than options.distance
        if (status.get(hand.id) === 1 && hand.palmPosition[0] - beginPos.get(hand.id)[0] >= options.distance) {
          this.emit('dragRight', hand)
          status.set(hand.id, 2)
        } else if (status.get(hand.id) === 1 && beginPos.get(hand.id)[0] - hand.palmPosition[0] >= options.distance) {
          this.emit('dragLeft', hand)
          status.set(hand.id, 2)
        }
      }
    }
  }

  if ((typeof Leap !== 'undefined') && Leap.Controller) {
    Leap.Controller.plugin('handDrag', handDrag)
  } else if (typeof module !== 'undefined') {
    module.exports.handDrag = handDrag
  } else {
    throw '\'typeof module\' is undefined'
  }
}).call(typeof self !== 'undefined' ? self : this);


  /**
   * Created by Clovin on 2017/6/30.
   */
  (function () {
    let handEntry

    function calAngle (a, b) {
      return Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2)) * Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2) + Math.pow(b[2], 2))))
    }

    handEntry = function (options) {
      options || (options = {})

      options.size || (options.size = [1000, 1000, 1000])
      options.center || (options.center = [0, 0, 0])

      let activeHandIds = []

      this.on('deviceStopped', function () {
        let self = this

        // emit event before clear activeHandIds array
        activeHandIds.forEach(function (id) {
          self.emit('handLost', this.lastConnectionFrame.hand(id))
        })

        activeHandIds = []
      })

      return {
        frame: function (frame) {
          let self = this

          let newValidHandIds = null
          newValidHandIds = frame.hands.map(function (hand) {
            let iBox = frame.interactionBox
            iBox.size = options.size
            iBox.center = options.center

            let pos = iBox.normalizePoint(frame.hand(hand.id).palmPosition, true)
            if (pos[0] > 0 && pos[0] < 1 && pos[1] > 0 && pos[1] < 1 && pos[2] > 0 && pos[2] < 1) {
              return hand.id
            }
          })

          //  find the lost hand and remove it from activeHandIds array
          activeHandIds.forEach(function (id) {
            if (!newValidHandIds.includes(id)) {
              self.emit('handLost', self.frame(1).hand(id))

              activeHandIds.splice(activeHandIds.indexOf(id), 1)
            } else {
              //  calculate position
              let iBox = frame.interactionBox
              iBox.size = options.size
              iBox.center = options.center
              frame.hand(id).pos = iBox.normalizePoint(frame.hand(id).palmPosition, true)

              //  calculate direction
              let temp = [calAngle(frame.hand(id).palmNormal, [1, 0, 0]),
                calAngle(frame.hand(id).palmNormal, [0, 1, 0])]
              if (temp[0] <= 0.785) {
                frame.hand(id).direction = 'right'
              } else if (temp[0] >= 2.356) {
                frame.hand(id).direction = 'left'
              } else if (temp[1] <= 0.785) {
                frame.hand(id).direction = 'top'
              } else if (temp[1] >= 2.356) {
                frame.hand(id).direction = 'bottom'
              } else {
                frame.hand(id).direction = null
              }

              self.emit('handMove', frame.hand(id))
            }
          })

          //  find the new hand and push it to the activeHandIds array
          newValidHandIds.forEach(function (id) {
            if (!activeHandIds.includes(id)) {
              activeHandIds.push(id)
              self.emit('handFound', frame.hand(id))
            }
          })
        }
      }
    }

    if ((typeof Leap !== 'undefined') && Leap.Controller) {
      Leap.Controller.plugin('handEntry', handEntry)
    } else if (typeof module !== 'undefined') {
      module.exports.handEntry = handEntry
    } else {
      throw '\'typeof module\' is undefined'
    }
  }).call(typeof self !== 'undefined' ? self : this);

  /**
   * Created by Clovin on 2017/7/25.
   */
  (function () {
    let handFist

    function calAngle (a, b) {
      return Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2)) * Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2) + Math.pow(b[2], 2))))
    }

    handFist = function (options) {
      options || (options = {})

      let status = new Map()

      // use for delete the lost hand from Map
      let activeHand = new Map()
      setInterval(function () {
        for (let key of activeHand.keys()) {
          if (activeHand.get(key) < Date.now() - 10000) {
            status.delete(key)
            activeHand.delete(key)
          }
        }
      }, 300000)

      return {
        hand: function (hand) {
          //  init
          if (!status.get(hand.id)) {
            status.set(hand.id, false)
          }
          activeHand.set(hand.id, Date.now())

          //  calculate the finger bone's direction with hand's palm direction
          let temp = [calAngle(hand.indexFinger.bones[1].direction(), hand.palmNormal),
            calAngle(hand.middleFinger.bones[1].direction(), hand.palmNormal),
            calAngle(hand.ringFinger.bones[1].direction(), hand.palmNormal),
            calAngle(hand.pinky.bones[1].direction(), hand.palmNormal)]

          if (!(temp[0] < 0.42 && temp[1] < 0.42 && temp[2] < 0.42 && temp[3] < 0.42)) {
            status.set(hand.id, false)
            return
          }

          if (status.get(hand.id)) {
            return
          }

          this.emit('handFist', hand)
          status.set(hand.id, true)
        }
      }
    }

    if ((typeof Leap !== 'undefined') && Leap.Controller) {
      Leap.Controller.plugin('handFist', handFist)
    } else if (typeof module !== 'undefined') {
      module.exports.handFist = handFist
    } else {
      throw '\'typeof module\' is undefined'
    }
  }).call(typeof self !== 'undefined' ? self : this);


  /**
   * Created by Clovin on 2017/7/23.
   */
  (function () {
    let handFlip

    function calAngle (a, b) {
      return Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2)) * Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2) + Math.pow(b[2], 2))))
    }

    handFlip = function (options) {
      options || (options = {})

      let beginTime = new Map()
      let status = new Map()

      // use for delete the lost hand from Map
      let activeHand = new Map()
      setInterval(function () {
        for (let key of activeHand.keys()) {
          if (activeHand.get(key) < Date.now() - 10000) {
            beginTime.delete(key)
            status.delete(key)
            activeHand.delete(key)
          }
        }
      }, 300000)

      return {
        hand: function (hand) {
          //  init
          if (!beginTime.get(hand.id)) {
            beginTime.set(hand.id, null)
            status.set(hand.id, 0)
          }
          activeHand.set(hand.id, Date.now())

          let temp = calAngle(hand.palmNormal, [0, 1, 0])
          //  judge status: 0 none , 1 already top , 2 already down
          if (status.get(hand.id) === 0) {
            //  if status is none,set the status when get status
            if (temp < 0.523) {
              status.set(hand.id, 1)
              beginTime.set(hand.id, Date.now())
            } else if (temp > 2.617) {
              status.set(hand.id, 2)
              beginTime.set(hand.id, Date.now())
            }
          } else if (status.get(hand.id) === 1) {
            //  if status is alredy top, emit flipDown event when down
            if (temp < 0.523) {
              beginTime.set(hand.id, Date.now())
              return
            }

            if (Date.now() - beginTime.get(hand.id) > 1000) {
              status.set(hand.id, 0)
              beginTime.set(hand.id, null)
              return
            }

            if (temp > 2.617) {
              this.emit('flipDown', hand)
              status.set(hand.id, 2)
              beginTime.set(hand.id, Date.now())
            }
          } else {
            //  if status is alredy down, emit flipTop event when top
            if (temp > 2.617) {
              beginTime.set(hand.id, Date.now())
              return
            }

            if (Date.now() - beginTime.get(hand.id) > 1000) {
              status.set(hand.id, 0)
              beginTime.set(hand.id, null)
              return
            }

            if (temp < 0.523) {
              this.emit('flipTop', hand)
              status.set(hand.id, 1)
              beginTime.set(hand.id, Date.now())
            }
          }
        }
      }
    }

    if ((typeof Leap !== 'undefined') && Leap.Controller) {
      Leap.Controller.plugin('handFlip', handFlip)
    } else if (typeof module !== 'undefined') {
      module.exports.handFlip = handFlip
    } else {
      throw '\'typeof module\' is undefined'
    }
  }).call(typeof self !== 'undefined' ? self : this);


/**
 * Created by Clovin on 2017/7/4.
 */
(function () {
  let handSwipe

  function calAngle (a, b) {
    return Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2)) * Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2) + Math.pow(b[2], 2))))
  }

  handSwipe = function (options) {
    options || (options = {})

    options.verticle || (options.verticle = 70)
    options.horizontal || (options.horizontal = 70)

    let beginPos = new Map()
    let beginDir = new Map()
    let status = new Map()

    // use for delete the lost hand from Map
    let activeHand = new Map()
    setInterval(function () {
      for (let key of activeHand.keys()) {
        if (activeHand.get(key) < Date.now() - 10000) {
          beginPos.delete(key)
          beginDir.delete(key)
          status.delete(key)
          activeHand.delete(key)
        }
      }
    }, 300000)

    return {
      hand: function (hand) {
        //  init
        if (!beginPos.get(hand.id)) {
          beginPos.set(hand.id, null)
          beginDir.set(hand.id, null)
          status.set(hand.id, null)
        }
        activeHand.set(hand.id, Date.now())

        //  judge whether the gesture is valid
        if (!(calAngle(hand.thumb.direction, hand.palmNormal) > 0.78 &&
            calAngle(hand.indexFinger.direction, hand.palmNormal) > 0.78 &&
            calAngle(hand.middleFinger.direction, hand.palmNormal) > 0.78 &&
            calAngle(hand.ringFinger.direction, hand.palmNormal) > 0.78 &&
            calAngle(hand.pinky.direction, hand.palmNormal) > 0.78 &&
            hand.thumb.direction[2] < 0 &&
            hand.indexFinger.direction[2] < 0 &&
            hand.middleFinger.direction[2] < 0 &&
            hand.ringFinger.direction[2] < 0 &&
            hand.pinky.direction[2] < 0)) {
          beginPos.set(hand.id, null)
          status.set(hand.id, null)
          beginDir.set(hand.id, null)
          return
        }

        //  judge swipe's direction
        let direction = null
        let temp = [calAngle(hand.palmNormal, [1, 0, 0]), calAngle(hand.palmNormal, [0, 1, 0])]
        if (temp[0] <= 0.785) {
          direction = 'right'
        } else if (temp[0] >= 2.356) {
          direction = 'left'
        } else if (temp[1] <= 0.785) {
          direction = 'top'
        } else if (temp[1] >= 2.356) {
          direction = 'bottom'
        } else {
          beginPos.set(hand.id, null)
          beginDir.set(hand.id, null)
          status.set(hand.id, null)
          return
        }
        if (!status.get(hand.id) && beginDir.get(hand.id) !== direction) {
          beginDir.set(hand.id, direction)
          beginPos.set(hand.id, hand.palmPosition)
          status.set(hand.id, null)
        }

        let tempPos = beginPos.get(hand.id)
        if ((status.get(hand.id) === 'right' || status.get(hand.id) === 'left') && Math.abs(hand.palmPosition[0] - tempPos[0]) < 30) {
          status.set(hand.id, null)
        } else if ((status.get(hand.id) === 'top' || status.get(hand.id) === 'bottom') && Math.abs(hand.palmPosition[1] - tempPos[1]) < 20) {
          status.set(hand.id, null)
        }

        //  judge whether the movement larger than option.distance
        if (direction === 'right' && hand.palmPosition[0] - tempPos[0] >= options.horizontal && status.get(hand.id) !== 'right') {
          hand.swipeDirection = direction
          this.emit('handSwipe', hand)
          status.set(hand.id, 'right')
        } else if (direction === 'left' && tempPos[0] - hand.palmPosition[0] >= options.horizontal && status.get(hand.id) !== 'left') {
          hand.swipeDirection = direction
          this.emit('handSwipe', hand)
          status.set(hand.id, 'left')
        } else if (direction === 'top' && hand.palmPosition[1] - tempPos[1] >= options.verticle && status.get(hand.id) !== 'top') {
          hand.swipeDirection = direction
          this.emit('handSwipe', hand)
          status.set(hand.id, 'top')
        } else if (direction === 'bottom' && tempPos[1] - hand.palmPosition[1] >= options.verticle && status.get(hand.id) !== 'bottom') {
          hand.swipeDirection = direction
          this.emit('handSwipe', hand)
          status.set(hand.id, 'bottom')
        }
      }
    }
  }

  if ((typeof Leap !== 'undefined') && Leap.Controller) {
    Leap.Controller.plugin('handSwipe', handSwipe)
  } else if (typeof module !== 'undefined') {
    module.exports.handSwipe = handSwipe
  } else {
    throw '\'typeof module\' is undefined'
  }
}).call(typeof self !== 'undefined' ? self : this);
