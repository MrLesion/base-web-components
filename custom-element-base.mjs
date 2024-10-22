class CustomElementBase extends HTMLElement {
	static tagName = 'custom-element-base';
	static customEventPrefix = this.tagName + ':';
	static classes = {}
	static selectors = {};
	static attributes = {};
	static properties = {};
	static events = {};
	static observedAttributes = [];
	static observedProperties = [];
	static observedEvents = [];

	static define() {
		console.log('BASE: CustomElementBase define called with', this.tagName);
		if (customElements.get(this.tagName) === undefined) {
			customElements.define(this.tagName, this);
		}
	};


	attributeChangedCallback(name, oldValue, newValue) {
		console.log(`BASE: Attribute ${name} has changed. oldValue: ${oldValue} newValue: ${newValue}`);
		this.attributeHandlers[name](name, oldValue, newValue);
	};

	adoptedCallback() {
		console.log(`BASE: Custom element ${this.nodeName} moved to new page.`);
	};

	disconnectedCallback() {
		// Remove objEvent listener when component is removed from the DOM
		console.log(`BASE: disconnectedCallback ${this.nodeName}`);
	};

	connectedCallback() {
		// Add objEvent listener when component is added to the DOM
		console.log(`BASE: connectedCallback ${this.nodeName} ${this.tagName}`);
	};

	constructor() {
		super();
		const objSubClass = new.target;
		this.bindEvents();
		this.bindProperties(objSubClass);
	};

	bindEvents() {
		// https://hawkticehurst.com/2023/11/you-are-probably-using-connectedcallback-wrong/
		console.log('BASE: bindEvents called with', this);
		if (this.constructor.observedEvents !== undefined) {
			for (const strEventName of this.constructor.observedEvents) {
				console.log('BASE: addEventListener for', strEventName, this);
				this.addEventListener(strEventName, this, true);
			}
		}
	};

	bindProperties(objSubClass) {
		console.log('BASE: bindProperties called with', objSubClass, this);
		console.log('BASE: this', this.constructor.observedProperties);
		console.log('BASE: objSubClass', objSubClass.observedProperties);

		if (objSubClass.observedProperties !== undefined) {
			for (const strPropertyName of objSubClass.observedProperties) {
				Object.defineProperty(this, strPropertyName, {
					get() {
						let strReturnValue = null;
						const objPropertyHandler = this.propertyHandlers[strPropertyName];
						if (objPropertyHandler !== undefined) {
							strReturnValue = objPropertyHandler.get();
							console.log('BASE: prop getter with custom handler', strPropertyName, strReturnValue);
						} else {
							strReturnValue = this.getAttribute(strPropertyName);
							console.log('BASE: prop getter with default handler', strPropertyName, strReturnValue);
						}
						return strReturnValue;
					},
					set(value) {
						const objPropertyHandler = this.propertyHandlers[strPropertyName];
						if (objPropertyHandler !== undefined) {
							objPropertyHandler.set(value);
							console.log('BASE: prop setter with custom handler', strPropertyName, value);
						} else {
							console.log('BASE: prop setter with default handler', strPropertyName, value);
							const strValue = String(value) ?? '';
							this.setAttribute(strPropertyName, strValue);
						}

					}
				});
			}
		}
	};

	handleEvent(objEvent) {
		console.log('BASE: handleEvent called with event type', objEvent.type, this);
		this.eventHandlers[objEvent.type](objEvent);
	};

	triggerEvent(strName, objDetail = {}) {
		console.log('BASE: triggerEvent called with event type', strName, this);
		const objEvent = new CustomEvent(this.constructor.customEventPrefix + strName, {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: objDetail
		});
		return this.dispatchEvent(objEvent);
	};

	eventHandlers = {};
	attributeHandlers = {};
	propertyHandlers = {};
}

export default CustomElementBase;
