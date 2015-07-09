
var actionRecord = actionRecord || {
  actionList: [],
  record:null,
  play:null,
  actionInfo:null,
  startDate:null,
  getRecordElement: function() {
    if (!actionRecord.record) {
      actionRecord.record = document.createElement('button');
      actionRecord.record.style.width = '100px';
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
      actionRecord.play.style.color = 'green';
      actionRecord.play.innerHTML = '&#9658;';
      actionRecord.play.style.fontSize = '28px';
    }

    return actionRecord.play;
  },
  getActionInfoElement: function() {
    if (!actionRecord.actionInfo) {
      actionRecord.actionInfo = document.createElement('select');
      actionRecord.actionInfo.style.width = '100%';
      actionRecord.actionInfo.style.height = '165px';
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
    actionInfoElement.innerHTML = event.type + 'ed ' + event.target.type;
    actionInfoElement.actionTime = (new Date()).getTime() - actionRecord.startDate.getTime();
    actionInfoElement.actionInfoElement = actionInfoElement;
    actionRecord.actionInfo.appendChild(actionInfoElement);
  },
  stopListeners: function (event) {
    var recordableElements = document.querySelectorAll('input');
    actionRecord.stop.style.color = 'blue';
    actionRecord.record.style.color = '#decccc';
    for(var i = 0; i < recordableElements.length; i++) {
      recordableElements[i].removeEventListener('click', actionRecord.bindInputListener);
    }
  },
  startListeners: function (event) {
    var recordableElements = document.querySelectorAll('input');
    actionRecord.stopListeners();
    actionRecord.stop.style.color = 'lightBlue';
    actionRecord.record.style.color = 'red';
    actionRecord.startDate = new Date();
    for(var i = 0; i < recordableElements.length; i++) {
      recordableElements[i].addEventListener('click', actionRecord.bindInputListener);
    }
  },
  callAction: function (element, time) {
    setTimeout(function() {
      element.actionEvent.target.click();
    }, time);
  },
  playActions: function (event) {
    for(var i = 0; i < actionRecord.actionInfo.options.length; i++) {
      var actionElement = actionRecord.actionInfo.options[i];
      if (!actionElement.selected) {
        continue;
      }
      actionRecord.callAction(actionElement, actionRecord.actionInfo.options[i].actionTime);
    }
  },
  initialize: function(recordElementContainer) {
    recordElementContainer.body.appendChild(actionRecord.getControlsElement());
    actionRecord.play.addEventListener('click', actionRecord.playActions);
    actionRecord.record.addEventListener('click', actionRecord.startListeners);
    actionRecord.stop.addEventListener('click', actionRecord.stopListeners);
  }
};
