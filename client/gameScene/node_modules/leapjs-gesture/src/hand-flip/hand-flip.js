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
    Leap.Controller.plugin('handFlip', handFlip);
  } else if (typeof module !== 'undefined') {
    module.exports.handFlip = handFlip
  } else {
    throw '\'typeof module\' is undefined'
  }
}).call(typeof self !== 'undefined' ? self : this)
