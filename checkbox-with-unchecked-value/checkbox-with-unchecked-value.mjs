import CustomElementBase from '../custom-element-base.mjs';

class CheckboxWithUncheckedValue extends CustomElementBase {
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value
  static tagName = 'checkbox-with-unchecked-value';
  static customEventPrefix = this.tagName + ':';
  static selectors = {
    inputCheckbox: 'input[type="checkbox"]',
    inputCheckboxChecked: 'input[type="checkbox"]:checked',
  };
  static properties = {
    'unchecked-value': 'unchecked-value'
  };
  static events = {
    change: 'change'
  };
  static observedProperties = [this.properties['unchecked-value']];
  static observedEvents = [this.events.change];

  constructor() {
    super();

    this.inputCheckbox = this.querySelector(this.constructor.selectors.inputCheckbox);
    this.inputUncheckedValue = this.insertAdjacentElement('beforeend', document.createElement('input'));
    if (this.inputUncheckedValue !== null) {
      this.inputUncheckedValue.name = this.inputCheckbox.name;
      this.inputUncheckedValue.type = 'hidden';
      this.inputUncheckedValue.value = this[this.constructor.properties["unchecked-value"]] || '';
      this.syncInputUncheckedValueWithInputCheckbox();
    }
  };

  eventHandlers = {
    [this.constructor.events.change]: (objEvent) => {
      this.syncInputUncheckedValueWithInputCheckbox();
      //console.log('defaultPrevented', objEvent.defaultPrevented, objEvent.isDefaultPrevented)
      console.log('eventHandlers', objEvent.type, this.constructor.selectors.inputCheckboxChecked, this.querySelector(this.constructor.selectors.inputCheckboxChecked), this.inputUncheckedValue)
    }
  };

  syncInputUncheckedValueWithInputCheckbox(){
    this.inputUncheckedValue.disabled = this.querySelector(this.constructor.selectors.inputCheckboxChecked) !== null;
  };
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('window DOMContentLoaded');
  CheckboxWithUncheckedValue.define();
});
