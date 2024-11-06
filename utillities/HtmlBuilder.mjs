class HTMLBuilder {
  constructor() {
    this.value = '';
  }

  #formatCamelCaseToDashed = ( str ) => {
    return str.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
  }

  create( tagName, attributes = {} ) {
    const htmlElement = document.createElement( tagName );
    Object.keys( attributes ).filter(k => attributes[k] !== null).forEach( key => htmlElement.setAttribute( this.#formatCamelCaseToDashed( key ), attributes[key] ) );
    this.value = htmlElement
    return this;
  }

  content( content ) {
    this.value.innerHTML = content;
    return this;
  }

  style( styles ) {
    Object.keys( styles ).forEach( key => this.value.style[key] = styles[key] );
    return this;
  }

  on( event, fn ) {
    this.value.addEventListener( event, fn );
    return this;
  }

  off( event, fn ) {
    this.value.removeEventListener( event, fn );
    return this;
  }

  wrapAround( childNode ) {
    this.value.append( childNode );
    return this;
  }

  appendTo( parentNode ) {
    parentNode.append( this.value );
  }

  prependTo( parentNode ) {
    parentNode.prepend( this.value );
  }

  toNode() {
    return this.value;
  }
}

export default HTMLBuilder;
