const Events = (function () {
  'use strict';
  //
  // Variables
  //
  const objEvents = {};
  const arrDelegatedEventsByType = {};

  //
  // Methods
  //
  /**
   * Get the index for the listener
   * @param  {Array}        arrTypeDelegations  The listeners for an event
   * @param  {String|Node}  strSelectorOrNode   The selector to check the target against
   * @param  {Function}     fnCallback          The function to run when the event fires
   * @return {Number}                           The index of the listener
   */
  const getDelegationIndexByTypeAndSelectorAndCallback = function (arrTypeDelegations, strSelectorOrNode, fnCallback) {
    let intReturnValue = -1;
    for (let i = 0; i < arrTypeDelegations.length; i++) {
      if (
        arrTypeDelegations[i].selector === strSelectorOrNode &&
        arrTypeDelegations[i].callback.toString() === fnCallback.toString()
      ) {
        intReturnValue = i;
      }
    }
    return intReturnValue;
  };

  /**
   * Check if the listener callback should run or not
   * @param  {Node}         nodeTarget        The event.target
   * @param  {String|Node}  strSelectorOrNode The selector to check the target against
   * @return {Boolean}                        If true, run listener
   */
  const isTargetContainedBySelector = function (nodeTarget, strSelectorOrNode) {
    let boolReturnValue;
    if ([
      '*',
      'window',
      'document',
      'document.documentElement',
      window,
      document,
      document.documentElement
    ].indexOf(strSelectorOrNode) > -1) {
      boolReturnValue = true;
    } else if (typeof strSelectorOrNode !== 'string') {
      boolReturnValue = strSelectorOrNode === nodeTarget || strSelectorOrNode.contains(nodeTarget) === true;
    } else {
      boolReturnValue = nodeTarget.closest(strSelectorOrNode) !== null;
    }
    return boolReturnValue;
  };
  /**
   * Check if the listener callback should run or not
   * @param  {Node}         nodeTarget        The event.target
   * @param  {String|Node}  strSelectorOrNode The selector to check the target against
   * @return {Node}                        	The dom node on which the event is delegated to
   */
  const getDelegateTarget = function (nodeTarget, strSelectorOrNode) {
    let nodeReturnValue = null;
    if (typeof strSelectorOrNode !== 'string') {
      nodeReturnValue = strSelectorOrNode;
    } else {
      nodeReturnValue = nodeTarget.closest(strSelectorOrNode);
    }
    return nodeReturnValue;
  };

  /**
   * Handle listeners after event fires
   * @param {Event} objEvent The event
   */
  const handleEvent = function (objEvent) {
    console.log('handleEvent', objEvent);
    if (arrDelegatedEventsByType[objEvent.type] !== undefined) {
      for (const objDelegatedEvent of arrDelegatedEventsByType[objEvent.type]) {
        if (isTargetContainedBySelector(objEvent.target, objDelegatedEvent.selector) === true) {
          objEvent.delegateTarget = getDelegateTarget(objEvent.target, objDelegatedEvent.selector);
          objDelegatedEvent.callback(objEvent);
        }
      }
    }
  };

  /**
   * Add an event
   * @param  {String}       strEventTypes     The event type or types (comma separated)
   * @param  {String|Node}  strSelectorOrNode The selector to run the event on
   * @param  {Function}     fnCallback        The function to run when the event fires
   */
  objEvents.on = function (strEventTypes, strSelectorOrNode, fnCallback) {
    // Make sure there's a selector and callback
    if (strSelectorOrNode !== undefined && fnCallback !== undefined) {
      // Loop through each event type
      for (let strEventType of strEventTypes.split(',')) {
        // Remove whitespace
        strEventType = strEventType.trim();
        // If no event of this type yet, setup
        if (arrDelegatedEventsByType[strEventType] === undefined) {
          arrDelegatedEventsByType[strEventType] = [];
          window.addEventListener(strEventType, handleEvent, true);
        }
        // Push to active events
        arrDelegatedEventsByType[strEventType].push({
          selector: strSelectorOrNode,
          callback: fnCallback
        });
      }
    }
  };

  /**
   * Remove an event
   * @param  {String}   strEventTypes     The event type or types (comma separated)
   * @param  {String}   strSelectorOrNode The selector to remove the event from
   * @param  {Function} fnCallback        The function to remove
   */
  objEvents.off = function (strEventTypes, strSelectorOrNode, fnCallback) {
    // Loop through each event type
    for (let strEventType of strEventTypes.split(',')) {
      // Remove whitespace
      strEventType = strEventType.trim();
      // if event type doesn't exist, bail
      if (arrDelegatedEventsByType[strEventType] !== undefined) {
        // If it's the last event of its type, remove entirely
        if (arrDelegatedEventsByType[strEventType].length < 2 || strSelectorOrNode === undefined) {
          delete arrDelegatedEventsByType[strEventType];
          window.removeEventListener(strEventType, handleEvent, true);
        } else {
          // Otherwise, remove event
          const intIndex = getDelegationIndexByTypeAndSelectorAndCallback(arrDelegatedEventsByType[strEventType], strSelectorOrNode, fnCallback);
          if (intIndex > -1) {
            arrDelegatedEventsByType[strEventType].splice(intIndex, 1);
          }
        }
      }
    }
  };

  /**
   * Add an event, and automatically remove it after it's first run
   * @param  {String}   strEventTypes     The event type or types (comma separated)
   * @param  {String}   strSelectorOrNode The selector to run the event on
   * @param  {Function} fnCallback        The function to run when the event fires
   */
  objEvents.once = function (strEventTypes, strSelectorOrNode, fnCallback) {
    objEvents.on(strEventTypes, strSelectorOrNode, function temp(objEvent) {
      fnCallback(objEvent);
      objEvents.off(strEventTypes, strSelectorOrNode, temp);
    });
  };

  /**
   * Get an immutable copy of all active event listeners
   * @return {Object} Active event listeners
   */
  objEvents.get = function () {
    const objReturnValue = {};
    for (const strEventType of arrDelegatedEventsByType) {
      if (arrDelegatedEventsByType.hasOwnProperty(strEventType) === true) {
        objReturnValue[strEventType] = arrDelegatedEventsByType[strEventType];
      }
    }
    return objReturnValue;
  };

  //
  // Return public APIs
  //
  return objEvents;

})();
export {Events};
