import * as Leap from 'leapjs';
import Recording from './recording.js';

export default function Player(controller, options) {
  var player = this;

  options || (options = {});

  // make sure Recording is accessible externally.
  this.Recording = Recording;

  this.options = options;
  this.recording = options.recording;

  this.controller = controller;
  this.resetTimers();
  this.setupLoops();
  this.controller.connection.on('ready', function () {
    player.setupProtocols();
  });

  this.userHasControl = false;

  if (options.recording) {
    // string check via underscore.js
    if (toString.call(options.recording) === '[object String]') {
      options.recording = {
        url: options.recording
      };
    }
    this.setRecording(options.recording);
  }

  document.addEventListener('DOMContentLoaded', function (event) {
    document.body.addEventListener('keydown', function (e) {
      if (e.which === player.options.pauseHotkey) {
        player.toggle();
      }
    }, false);
  });

}

Player.prototype = {
  resetTimers: function () {
    this.timeSinceLastFrame = 0;
    this.lastFrameTime = null;
  },

  setupLoops: function () {
    var player = this;

    // Loop with explicit frame timing
    this.stepFrameLoop = function (timestamp) {
      if (player.state !== 'playing') return;

      if (player.options.lockStep) {

        // same as in sendFrameAt:
        if (!player.recording.advanceFrame()) {
          player.pause();
          player.controller.emit('playback.playbackFinished', player);
          return;
        }

        player.sendFrame(player.recording.currentFrame());

      } else {

        player.sendFrameAt(timestamp || performance.now());

      }

      requestAnimationFrame(player.stepFrameLoop);
    };

  },

  // This is how we intercept frame data early
  // By hooking in before Frame creation, we get data exactly as the frame sends it.
  setupProtocols: function () {
    var player = this;
    var property;
    // This is the original normal protocol, used while in record mode but not recording.

    this.stopProtocol = this.controller.connection.protocol;

    // This consumes all frame data, making the device act as if not streaming
    this.playbackProtocol = function (data) {
      // The old protocol still needs to emit events, so we use it, but intercept Frames
      var eventOrFrame = player.stopProtocol(data);

      if (eventOrFrame instanceof Leap.Frame) {

        if (player.pauseOnHand) {
          if (data.hands.length > 0) {
            player.userHasControl = true;
            player.controller.emit('playback.userTakeControl');
            player.setGraphic();
            player.idle();
          } else if (data.hands.length === 0) {
            if (player.userHasControl) {
              player.userHasControl = false;
              player.setGraphic('wave');
              player.controller.emit('playback.userReleaseControl');
            }

          }
        }

        // prevent the actual frame from getting through
        return {type: 'playback'};
      }
      return eventOrFrame;

    };

    // This pushes frame data, and watches for hands to auto change state.
    // Returns the eventOrFrame without modifying it.
    this.recordProtocol = function (data) {
      var eventOrFrame = player.stopProtocol(data);

      if (eventOrFrame instanceof Leap.Frame) {
        player.recordFrameHandler(data);
      }
      return eventOrFrame;
    };

    // Copy methods/properties from the default protocol over
    for (property in this.stopProtocol) {
      if (this.stopProtocol.hasOwnProperty(property)) {
        this.playbackProtocol[property] = this.stopProtocol[property];
        this.recordProtocol[property] = this.stopProtocol[property];
      }
    }

    // todo: this is messy. Should cover all cases, not just active playback!
    if (this.state === 'playing') {
      this.controller.connection.protocol = this.playbackProtocol;
    }
  },

  // Adds playback = true to artificial frames
  sendFrameAt: function (now) {
    var timeToNextFrame;

    if (this.lastFrameTime) {
      // chrome bug, see: https://code.google.com/p/chromium/issues/detail?id=268213
      // http://jsfiddle.net/pehrlich/35pTx/
      // console.assert(this.lastFrameTime < now);
      if (now < this.lastFrameTime) {
        // this fix will cause an extra animation frame before the lerp frame advances. no big.
        this.lastFrameTime = now;
      } else {
        this.timeSinceLastFrame += (now - this.lastFrameTime);
      }
    }

    this.lastFrameTime = now;

    // handle frame dropping, etc
    while (this.timeSinceLastFrame > (timeToNextFrame = this.recording.timeToNextFrame())) {
      this.timeSinceLastFrame -= timeToNextFrame;
      if (!this.recording.advanceFrame()) {
        this.pause();
        this.controller.emit('playback.playbackFinished', this);
        return;
      }
    }

    this.sendFrame(
      this.recording.createLerpFrameData(this.timeSinceLastFrame / timeToNextFrame)
    );

  },

  sendFrame: function (frameData) {
    var frame = new Leap.Frame(frameData);

    if (!frameData) throw new Error('Frame data not provided');
    this.controller.emit('playback.beforeSendFrame', frameData, frame);

    // send a deviceFrame to the controller:
    // this frame gets picked up by the controllers own animation loop.

    this.controller.processFrame(frame);
    return true;
  },

  sendImmediateFrame: function (frameData) {
    var frame = new Leap.Frame(frameData);

    if (!frameData) throw new Error('Frame data not provided');

    // sends an animation frame to the controller
    this.controller.processFinishedFrame(frame);
    return true;
  },

  setFrameIndex: function (frameIndex) {
    if (frameIndex !== this.recording.frameIndex) {
      if (frameIndex < 0) frameIndex = this.recording.frameCount - 1;
      this.recording.frameIndex = frameIndex % this.recording.frameCount;
      this.sendFrame(this.recording.currentFrame());
    }
  },

  // used after record
  stop: function () {
    this.idle();

    delete this.recording;

    this.recording = new Recording({
      timeBetweenLoops: this.options.timeBetweenLoops,
      loop: this.options.loop,
      requestProtocolVersion: this.controller.connection.opts.requestProtocolVersion,
      serviceVersion: this.controller.connection.protocol.serviceVersion
    });

    this.controller.emit('playback.stop', this);
  },

  // used after play
  pause: function () {
    // todo: we should change this idle state to paused or leave it as playback with a pause flag
    // state should correspond always to protocol handler (through a setter)?
    this.state = 'idle';
    this.hideOverlay();
    this.controller.emit('playback.pause', this);
  },

  idle: function () {
    this.state = 'idle';
    this.controller.connection.protocol = this.stopProtocol;
  },

  toggle: function () {
    if (this.state === 'playing') {
      this.pause();
    } else {
      // handle recording, etc.
      this.play();
    }
  },

  // switches to record mode, which will be begin capturing data when a hand enters the frame,
  // and stop when a hand leaves
  // Todo: replace frameData with a full fledged recording, including metadata.
  record: function () {
    this.clear();
    this.stop();
    this.state = 'recording';
    this.controller.connection.protocol = this.recordProtocol;

    if (!this.controller.streaming()) {
      this.setGraphic('connect');
    }
    // If already showing connect, setGraphic will have no effect.
    this.showOverlay();

    this.controller.emit('playback.record', this);
  },

  // if there is existing frame data, sends a frame with nothing in it
  clear: function () {
    var finalFrame = this.recording.cloneCurrentFrame();

    if (!this.recording || this.recording.blank()) return;

    finalFrame.hands = [];
    finalFrame.fingers = [];
    finalFrame.pointables = [];
    finalFrame.tools = [];
    this.sendImmediateFrame(finalFrame);
  },

  recordPending: function () {
    return this.state === 'recording' && this.recording.blank();
  },

  isRecording: function () {
    return this.state === 'recording' && !this.recording.blank();
  },

  finishRecording: function () {
    this.idle();
    this.recording.setFrames(this.recording.frameData);
    this.controller.emit('playback.recordingFinished', this);
  },

  loaded: function () {
    return this.recording.loaded();
  },

  loading: function () {
    return this.recording.loading;
  },

  playbackMode: function () {
    this.state = 'idle';
    this.controller.connection.protocol = this.playbackProtocol;
  },

  /* Plays back the provided frame data
   * Params {object|boolean}:
   *  - frames: previously recorded frame json
   * - loop: whether or not to loop playback.  Defaults to true.
   */
  play: function () {
    var player;

    if (this.state === 'playing') return;

    if (!this.recording || this.loading() || this.recording.blank()) return;

    this.state = 'playing';
    this.controller.connection.protocol = this.playbackProtocol;

    player = this;

    // prevent the normal controller response while playing
    this.controller.connection.removeAllListeners('frame');
    this.controller.connection.on('frame', function (frame) {

      // resume play when hands are removed:
      if (player.pauseOnHand && player.autoPlay && player.state === 'idle' && frame.hands.length === 0) {
        player.controller.emit('playback.userReleaseControl');
        player.play();
      }

      // The default LeapJS callback processes the frame, which is what we do now:
      player.controller.processFrame(frame);
    });

    // Kick off
    this.resetTimers();
    this.recording.readyPlay();
    this.stepFrameLoop();

    this.controller.emit('playback.play', this);
  },

  // this method replaces connection.handleData when in record mode
  // It accepts the raw connection data which is used to make a frame.
  recordFrameHandler: function (frameData) {
    // Would be better to check controller.streaming() in showOverlay, but that method doesn't exist, yet.
    this.setGraphic('wave');
    if (frameData.hands.length > 0) {
      this.recording.addFrame(frameData);
      this.hideOverlay();
    } else if (!this.recording.blank()) {
      // play will detect state and emit recordingFinished
      // this should actually be split out in to discrete end-recording-state and begin-play-state handlers :-/
      this.finishRecording();
    }
  },

  // Accepts a hash with any of
  // URL, recording, metadata
  // once loaded, the recording is immediately activated
  setRecording: function (options) {
    var player = this;
    var loadComplete = function (frames) {
      // this is called on the context of the recording
      if (player.recording !== this) {
        return;
      }

      if (player.autoPlay) {
        player.play();
        if (player.pauseOnHand && !player.controller.streaming()) {
          player.setGraphic('connect');
        }
      }

      player.controller.emit('playback.recordingSet', this);
    };

    // otherwise, the animation loop may try and play non-existant frames:
    this.pause();

    this.recording = options;

    // Here we turn the existing argument in to a recording
    // this allows frames to be added to the existing object via ajax
    // saving ajax requests
    if (!(options instanceof Recording)) {
      this.recording.__proto__ = Recording.prototype;
      Recording.call(this.recording, {
        timeBetweenLoops: this.options.timeBetweenLoops,
        loop: this.options.loop,
        loadProgress: function (recording, percentage, oEvent) {
          player.controller.emit('playback.ajax:progress', recording, percentage, oEvent);
        }
      });

    }

    if (this.recording.loaded()) {

      loadComplete.call(this.recording, this.recording.frameData);

    } else if (options.url) {

      this.controller.emit('playback.ajax:begin', this, this.recording);

      // called in the context of the recording
      this.recording.loadFrameData(function (frames) {
        loadComplete.call(this, frames);
        player.controller.emit('playback.ajax:complete', player, this);
      });

    }

    return this;
  },

  hideOverlay: function () {
    if (!this.overlay) return;
    this.overlay.style.display = 'none';
  },

  showOverlay: function () {
    if (!this.overlay) return;
    this.overlay.style.display = 'block';
  },

  // Accepts either "connect", "wave", or undefined.
  setGraphic: function (graphicName) {
    if (!this.overlay) return;
    if (this.graphicName === graphicName) return;

    this.graphicName = graphicName;
    switch (graphicName) {
      case 'connect':
        this.overlay.style.display = 'block';
        break;
      case 'wave':
        this.overlay.style.display = 'block';
        break;
      case undefined:
        this.overlay.innerHTML = '';
        break;
    }
  }

};

// will only play back if device is disconnected
// Accepts options:
// - frames: [string] URL of .json frame data
// - autoPlay: [boolean true] Whether to turn on and off playback based off of connection state
// - overlay: [boolean or DOM element] Whether or not to show the overlay: "Connect your Leap Motion Controller"
//            if a DOM element is passed, that will be shown/hidden instead of the default message.
// - pauseOnHand: [boolean true] Whether to stop playback when a hand is in field of view
// - resumeOnHandLost: [boolean true] Whether to stop playback when a hand is in field of view
// - requiredProtocolVersion: clients connected with a lower protocol number will not be able to take control of the
// - timeBetweenLoops: [number, ms] delay between looping playback
// controller with their device.  This option, if set, ovverrides autoPlay
// - pauseHotkey: [number or false, default: 32 (spacebar)] - keycode for pause, bound to body
// - lockStep: replays one recording frame per animation frame, exactly. Rather than trying to preserve playback
// speed of the original recording.
export function playback(scope) {
  var controller = this;
  var autoPlay = scope.autoPlay;
  var pauseOnHand = scope.pauseOnHand;
  var timeBetweenLoops = scope.timeBetweenLoops;
  var requiredProtocolVersion = scope.requiredProtocolVersion;
  var pauseHotkey = scope.pauseHotkey;
  var loop = scope.loop;
  var lockStep = scope.lockStep ;
  var overlay = scope.overlay;
  var setupStreamingEvents = function () {
    if (scope.player.pauseOnHand && controller.connection.opts.requestProtocolVersion < scope.requiredProtocolVersion) {
      console.log(
        'Protocol Version too old (' +
        controller.connection.opts.requestProtocolVersion +
        '), disabling device interaction.');
      scope.player.pauseOnHand = false;
      return;
    }

    if (autoPlay) {
      controller.on('streamingStarted', function () {
        if (scope.player.state === 'recording') {
          scope.player.pause();
          scope.player.setGraphic('wave');
        } else {
          if (pauseOnHand) {
            scope.player.setGraphic('wave');
          } else {
            scope.player.setGraphic();
          }
        }
      });

      controller.on('streamingStopped', function () {
        scope.player.play();
      });
    };
    controller.on('streamingStopped', function () {
      scope.player.setGraphic('connect');
    });
  };

  if (autoPlay === undefined) autoPlay = true;
  if (pauseOnHand === undefined) pauseOnHand = true;
  if (timeBetweenLoops === undefined) timeBetweenLoops = 50;
  if (pauseHotkey === undefined) pauseHotkey = 32; // spacebar
  if (loop === undefined) loop = true;
  if (lockStep === undefined) lockStep = false;

  // A better fix would be to set an onload handler for this, rather than disable the overlay.

  if (overlay === undefined && document.body) {
    overlay = document.createElement('div');
    document.body.appendChild(overlay);
    overlay.style.width = '100%';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '-' + window.getComputedStyle(document.body).getPropertyValue('margin');
    overlay.style.padding = '10px';
    overlay.style.textAlign = 'center';
    overlay.style.fontSize = '18px';
    overlay.style.opacity = '0.8';
    overlay.style.display = 'none';
    overlay.style.zIndex = '10';
    overlay.id = 'connect-leap';
    overlay.style.cursor = 'pointer';
    overlay.addEventListener('click', function () {
      this.style.display = 'none';
      return false;
    }, false);

  }

  scope.player = new Player(this, {
    recording: scope.recording,
    loop: loop,
    pauseHotkey: pauseHotkey,
    timeBetweenLoops: timeBetweenLoops,
    lockStep: lockStep
  });

  // By doing this, we allow player methods to be accessible on the scope
  // this is the controller
  scope.player.overlay = overlay;
  scope.player.pauseOnHand = pauseOnHand;
  scope.player.requiredProtocolVersion = requiredProtocolVersion;
  scope.player.autoPlay = autoPlay;

  // ready happens before streamingStarted, allowing us to check the version before responding to streamingStart/Stop
  // we can't call this any earlier, or protcol version won't be available
  if (this.connection.connected) {
    setupStreamingEvents();
  } else {
    this.on('ready', setupStreamingEvents);
  }

  return {};
};

