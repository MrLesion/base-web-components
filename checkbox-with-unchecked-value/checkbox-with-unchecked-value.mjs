import CustomElementBase from '../custom-element-base.mjs';

class CheckboxWithUncheckedValue extends CustomElementBase {
	static tagName = 'checkbox-with-unchecked-value';
	static customEventPrefix = this.tagName + ':';
	static classes = {}
	static selectors = {
		inputCheckbox: 'input[type="checkbox"]',
	};
	static attributes = {
		value: 'value'
	};
	static properties = {
		value: 'value'
	};
	static events = {
		change: 'change'
	};
	static observedAttributes = [];
	static observedProperties = [this.properties.value];
	static observedEvents = [this.events.change];

	constructor() {
		super();

		this.inputCheckbox = this.querySelector(this.constructor.selectors.inputCheckbox);
		this.inputValue = this.inputCheckbox.insertAdjacentElement('afterend', document.createElement('input'));
		if (this.inputValue !== null) {
			this.inputValue.name = this.inputCheckbox.name;
			this.inputCheckbox.removeAttribute('name');
			this.inputValue.type = 'hidden';
			this.inputValue.value = this.inputCheckbox.checked;
		}
		this.value = this.inputValue.value
	};

	eventHandlers = {
		[this.constructor.events.change]: (objEvent) => {
			this.inputValue.value = this.inputCheckbox.checked;
			console.log('eventHandlers', objEvent.type, this.inputValue.value, this.inputCheckbox.checked)
		}
	};
	attributeHandlers = {};
	propertyHandlers = {
		[this.constructor.properties.value]: {
			get: (strPropertyName) => {
				const strReturnValue = this.getAttribute(strPropertyName);
				console.log('prop getter with custom handler', strPropertyName, strReturnValue);
				return strReturnValue;
			},
			set: (value) => {
				console.log('prop setter with custom handler', this.constructor.properties.value, value);
				const strValue = String(value) ?? '';
				this.setAttribute(this.constructor.properties.value, strValue);
			}
		}
	};
}

window.addEventListener('DOMContentLoaded', () => {
	console.log('window DOMContentLoaded');
	CheckboxWithUncheckedValue.define();
});
