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
    Leap.Controller.plugin('handSwipe', handSwipe);
  } else if (typeof module !== 'undefined') {
    module.exports.handSwipe = handSwipe
  } else {
    throw '\'typeof module\' is undefined'
  }
}).call(typeof self !== 'undefined' ? self : this)
