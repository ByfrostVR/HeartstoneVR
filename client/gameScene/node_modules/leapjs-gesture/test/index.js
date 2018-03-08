/**
 * Created by Clovin on 06/11/2017.
 */
let Leap = require('leapjs')
let _ = require('lodash')

let gesture = require('../index')

Leap.Controller.plugin('handEntry', gesture.handEntry.handEntry)
Leap.Controller.plugin('handSwipe', gesture.handSwipe.handSwipe)
Leap.Controller.plugin('handFlip', gesture.handFlip.handFlip)
Leap.Controller.plugin('handFist', gesture.handFist.handFist)
Leap.Controller.plugin('handDrag', gesture.handDrag.handDrag)

/**
 *  Set the Leap Motion Controller's config  and start it
 *
 *  @date 2017/4/22
 *  @author Clovin
 */
function startLeap () {
  let controller = new Leap.Controller({
    enableGestures: true,
    background: true,
    loopWhileDisconnected: 'true'
  })

  controller.use('handEntry', {
    size: [500, 500, 500],
    center: [0, 300, 0]
  })
  controller.use('handSwipe', {
    verticle: 100,
    horizontal: 120
  })
  controller.use('handFlip')
  controller.use('handFist')
  controller.use('handDrag', {
    distance: 120
  })

  controller.on('connect', () => {
    console.log('Connect the Leap Service')
  })

  controller.on('disconnect', () => {
    console.log('Disconnect the Leap Service')
  })

  controller.on('deviceRemoved', () => {
    console.log('The Leap Motion device is unplugged or turned off')
  })

  controller.on('deviceStopped', () => {
    console.log('The Leap Motion device stops providing data')
  })

  controller.on('deviceStreaming', () => {
    console.log('The Leap Motion device starts providing data')
  })

  controller.on('streamingStarted', () => {
    console.log('The Leap Motion service/daemon starts providing data')
  })

  controller.on('streamingStopped', () => {
    console.log('The Leap Motion service/daemon stops providing data')
  })

  let currentHand = []
  controller.on('handFound', (hand) => {
    currentHand.push(hand.id)
    console.log('handFound! id: ', hand.id)
  })

  controller.on('handLost', (hand) => {
    _.remove(currentHand, (id) => id === hand.id)
    console.log('handLost! id: ', hand.id)
  })

  controller.on('handSwipe', (hand) => {
    console.log('handSwipe! ' + hand.swipeDirection + ' id: ', hand.id)
  })

  controller.on('handFist', (hand) => {
    console.log('handFist! id: ' + hand.id)
  })

  controller.on('flipTop', (hand) => {
    console.log('flipTop! id: ', hand.id)
  })

  controller.on('flipDown', (hand) => {
    console.log('flipDown! id: ', hand.id)
  })

  controller.on('dragLeft', (hand) => {
    console.log('dragLeft! id: ', hand.id)
  })

  controller.on('dragRight', (hand) => {
    console.log('dragRight! id: ', hand.id)
  })

  controller.connect()
}

startLeap()
