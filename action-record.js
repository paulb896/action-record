
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
  removeUnselected: function(options) {
    var selectedOptions = [];
    for(var i in options) {
      if (options[i].selected) {
        selectedOptions.push(options[i]);
      }
    }
    return selectedOptions;
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
    }

    return actionRecord.record;
  },
  getStopElement: function() {
    if (!actionRecord.stop) {
      actionRecord.stop = document.createElement('button');
      actionRecord.stop.style.width = '100px';
      actionRecord.stop.style.height = '50px';
      actionRecord.stop.style.color = 'blue';
      actionRecord.stop.innerHTML = '&#9632;';
      actionRecord.stop.style.fontSize = '28px';
    }

    return actionRecord.stop;
  },
  getPlayElement: function() {
    if (!actionRecord.play) {
      actionRecord.play = document.createElement('button');
      actionRecord.play.style.width = '100px';
      actionRecord.play.style.height = '50px';
      actionRecord.play.style.color = '#b8dbb8';
      actionRecord.play.innerHTML = '&#9654;';
      actionRecord.play.style.fontSize = '28px';
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
  bindInputListener: function (event) {
    var actionInfoElement = document.createElement('option');
    actionInfoElement.actionEvent = event;
    actionInfoElement.selected = true;
    actionInfoElement.selector = actionRecordUtils.cssPath(event.target);
    actionInfoElement.element = event.target;
    actionInfoElement.actionTime = (new Date()).getTime() - actionRecord.startDate.getTime();
    actionInfoElement.innerHTML = event.type + 'ed ' + (event.keyCode ? String.fromCharCode(event.keyCode): '') + ' @ ' + actionInfoElement.actionTime + 'ms';
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
  playActions: function (event) {
    var actionOptionElement;
    var longestActionTime = 0;
    var selectedOptions = actionRecordUtils.removeUnselected(actionRecord.actionInfo.options);

    // Remove timeout delay if only one action is selected
    if (selectedOptions.length == 1) {
      selectedOptions[0].actionTime = 0;
    }
    actionRecord.playStartCallback();

    actionRecord.play.style.color = 'green';
    actionRecord.stop.style.color = 'lightBlue';

    for(var i = 0; i < selectedOptions.length; i++) {
      actionOptionElement = selectedOptions[i];
      longestActionTime = actionRecord.actionInfo.options[i].actionTime || longestActionTime;
      actionRecord.callAction(
        actionOptionElement.actionEvent.target,
        actionOptionElement.actionEvent,
        actionOptionElement.actionTime
      );
    }

    setTimeout(function() {
      actionRecord.play.style.color = '#b8dbb8';
      actionRecord.stop.style.color = 'blue';

      actionRecord.playEndCallback();
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
