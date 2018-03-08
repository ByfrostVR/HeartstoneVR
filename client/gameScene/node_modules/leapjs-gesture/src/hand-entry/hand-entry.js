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
          if (!id) {
            return
          }

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
            let temp = [calAngle(frame.hand(id).palmNormal, [1, 0, 0]), calAngle(frame.hand(id).palmNormal, [0, 1, 0])]
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
          if (!id) {
            return
          }

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
}).call(typeof self !== 'undefined' ? self : this)
