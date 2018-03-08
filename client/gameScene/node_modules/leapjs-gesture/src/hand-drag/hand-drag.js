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
    Leap.Controller.plugin('handDrag', handDrag);
  } else if (typeof module !== 'undefined') {
    module.exports.handDrag = handDrag
  } else {
    throw '\'typeof module\' is undefined'
  }
}).call(typeof self !== 'undefined' ? self : this)
