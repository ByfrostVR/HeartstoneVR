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
    Leap.Controller.plugin('handFist', handFist);
  } else if (typeof module !== 'undefined') {
    module.exports.handFist = handFist
  } else {
    throw '\'typeof module\' is undefined'
  }
}).call(typeof self !== 'undefined' ? self : this)
