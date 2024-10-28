import CustomElementBase from '../custom-element-base.mjs';

class CheckboxWithUncheckedValue extends CustomElementBase {

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
      this.inputUncheckedValue.value = this[this.constructor.properties["unchecked-value"]] || 'default to empty string';
      this.triggerEvent(this.constructor.events.change, this.inputCheckbox);
    }
  };

  eventHandlers = {
    [this.constructor.events.change]: (objEvent) => {
      this.inputUncheckedValue.disabled = this.querySelector(this.constructor.selectors.inputCheckboxChecked) !== null;
      console.log('eventHandlers', objEvent.type, this.constructor.selectors.inputCheckboxChecked, this.querySelector(this.constructor.selectors.inputCheckboxChecked), this.inputUncheckedValue)
    }
  };
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('window DOMContentLoaded');
  CheckboxWithUncheckedValue.define();
});
