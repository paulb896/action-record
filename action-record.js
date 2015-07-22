
var actionRecordUtils = actionRecordUtils || {
  cssPath: function(el) {
    if (!(el instanceof Element)) return;
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += '#' + el.id;
        } else {
            var sib = el, nth = 1;
            while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousSibling) && nth++);
            selector += ":nth-child("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(" > ");
  },
  isBackspaceEvent: function(event) {
    return (event.type == 'keydown' && (event.keyCode == 8));
  },

  /**
   * Return a list of all selected options.
   *
   * @param  {Object[]} options
   *
   * @return {object[]} Selected options;
   */
  removeUnselected: function(options) {
    var selectedOptions = [];
    for(var i in options) {
      if (options[i].selected) {
        selectedOptions.push(options[i]);
      }
    }
    return selectedOptions;
  },

  /**
   * Subtracts the delay before the first action.
   *
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  subtractFirstActionDelay: function(options) {
    var firstActionStartTime = options[0].actionTime;
    for(var i in options) {
      options[i].actionTime -= firstActionStartTime;
    }
    return options;
  }
}

var actionRecord = actionRecord || {
  actionList: [],
  record:null,
  play:null,
  actionInfo:null,
  startDate:null,
  eventTypes: 'click keypress keydown',
  inputListenerSelector: 'input',
  playStartCallback: function() {},
  playEndCallback: function() {},
  recordStartCallback: function() {},
  recordEndCallback: function() {},
  getRecordElement: function() {
    if (!actionRecord.record) {
      actionRecord.record = document.createElement('button');
      actionRecord.record.style.width = '100px';
      actionRecord.record.style.height = '50px';
      actionRecord.record.style.color = '#decccc';
      actionRecord.record.innerHTML = '&#9679;';
      actionRecord.record.style.fontSize = '28px';
      actionRecord.record.title = 'record';
    }

    return actionRecord.record;
  },
  getStopElement: function() {
    if (!actionRecord.stop) {
      actionRecord.stop = document.createElement('button');
      actionRecord.stop.style.width = '100px';
      actionRecord.stop.style.height = '50px';
      actionRecord.stop.style.color = 'blue';
      actionRecord.stop.innerHTML = '&#9642;';
      actionRecord.stop.style.fontSize = '28px';
      actionRecord.stop.title = 'stop';
    }

    return actionRecord.stop;
  },
  getPlayElement: function() {
    if (!actionRecord.play) {
      actionRecord.play = document.createElement('button');
      actionRecord.play.style.width = '100px';
      actionRecord.play.style.height = '50px';
      actionRecord.play.style.color = '#b8dbb8';
      actionRecord.play.innerHTML = '&#9656;';
      actionRecord.play.style.fontSize = '28px';
      actionRecord.play.title = 'play';
    }

    return actionRecord.play;
  },
  getActionInfoElement: function() {
    if (!actionRecord.actionInfo) {
      actionRecord.actionInfo = document.createElement('select');
      actionRecord.actionInfo.style.width = '100%';
      actionRecord.actionInfo.style.height = '150px';
      actionRecord.actionInfo.style.fontSize = '15px';
      actionRecord.actionInfo.multiple = true;
    }

    return actionRecord.actionInfo;
  },
  getControlsElement: function() {
    var container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.backgroundColor = '#fafafa';
    container.style.position = 'fixed';
    container.style.right = '30px';
    container.style.bottom = '30px';

    container.appendChild(actionRecord.getActionInfoElement());
    container.appendChild(actionRecord.getRecordElement());
    container.appendChild(actionRecord.getStopElement());
    container.appendChild(actionRecord.getPlayElement());

    return container;
  },

  isInvalidEvent: function(event) {
    if (event.type === 'keydown' && !actionRecordUtils.isBackspaceEvent(event)) {
      return true;
    }

    return false;
  },

  /**
   * Callback function for input event.
   *
   * @param  {object} event HTML input field event.
   */
  bindInputListener: function (event) {
    if (actionRecord.isInvalidEvent(event)) {
      return;
    }

    var actionInfoElement = document.createElement('option');
    actionInfoElement.actionEvent = event;
    actionInfoElement.selected = true;
    actionInfoElement.selector = actionRecordUtils.cssPath(event.target);
    actionInfoElement.element = event.target;
    actionInfoElement.actionTime = (new Date()).getTime() - actionRecord.startDate.getTime();
    actionInfoElement.innerHTML = event.type + ' ' + (event.keyCode ? String.fromCharCode(event.keyCode): '') + ' @ ' + actionInfoElement.actionTime + 'ms';
    actionRecord.actionInfo.appendChild(actionInfoElement);
  },

  stopListeners: function (event) {
    var recordableElements = document.querySelectorAll(actionRecord.inputListenerSelector);
    var eventTypes = actionRecord.eventTypes.split(' ');
    actionRecord.stop.style.color = 'blue';
    actionRecord.record.style.color = '#decccc';
    for(var i = 0; i < recordableElements.length; i++) {
      for(var j = 0; j < eventTypes.length; j++) {
        recordableElements[i].removeEventListener(
          eventTypes[j],
          actionRecord.bindInputListener,
          true,
          true
        );
      }
    }
  },

  startListeners: function (event) {
    var recordableElements = document.querySelectorAll(actionRecord.inputListenerSelector);
    var eventTypes = actionRecord.eventTypes.split(' ');
    actionRecord.startDate = new Date();
    actionRecord.stopListeners();

    actionRecord.stop.style.color = 'lightBlue';
    actionRecord.record.style.color = 'red';

    for(var i = 0; i < recordableElements.length; i++) {
      for(var j = 0; j < eventTypes.length; j++) {
        recordableElements[i].recordEvent =
          recordableElements[i].addEventListener(
            eventTypes[j],
            actionRecord.bindInputListener,
            true,
            true
          );
      }
    }
  },

  /**
   * Call a given event on a given element after a given timeout.
   *
   * @param  {Object} element
   * @param  {Object} event
   * @param  {int} time in ms until event is called.
   */
  callAction: function (element, event, time) {
    setTimeout(function() {
      if (actionRecordUtils.isBackspaceEvent(event)) {
        element.value = element.value.substring(0, element.value.length - 1);
      } else if (event.type == 'keypress') {
        element.value += String.fromCharCode(event.keyCode);
      } else {
        element.click();
      }
    }, time);
  },

  /**
   * [playActions description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  playActions: function (event) {
    var actionOptionElement;
    var longestActionTime = 0;
    var startingAction = 0;
    var selectedOptions = (actionRecordUtils.removeUnselected(actionRecord.actionInfo.options));
    selectedOptions = actionRecordUtils.subtractFirstActionDelay(selectedOptions);

    actionRecord.playStartCallback();
    actionRecord.play.style.color = 'green';
    actionRecord.stop.style.color = 'lightBlue';

    for(var i = 0; i < selectedOptions.length; i++) {
      actionOptionElement = selectedOptions[i];
      longestActionTime = selectedOptions[i].actionTime || longestActionTime;
      actionRecord.callAction(
        actionOptionElement.actionEvent.target,
        actionOptionElement.actionEvent,
        actionOptionElement.actionTime
      );
    }

    setTimeout(function() {
      actionRecord.playEndCallback();
      actionRecord.play.style.color = '#b8dbb8';
      actionRecord.stop.style.color = 'blue';
    }, longestActionTime);
  },

  /**
   * Attach Controls to given container.
   *
   * @param  {object} controlsContainer Appends controls here.
   */
  attachControls: function(controlsContainer) {
    if (!controlsContainer) {
      controlsContainer = document.body;
    };

    controlsContainer.appendChild(actionRecord.getControlsElement());
    actionRecord.play.addEventListener('click', actionRecord.playActions);
    actionRecord.record.addEventListener('click', actionRecord.startListeners);
    actionRecord.stop.addEventListener('click', actionRecord.stopListeners);
  }
};
