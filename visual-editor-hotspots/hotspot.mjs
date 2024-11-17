import HTMLBuilder from '../utillities/HtmlBuilder.mjs';

export class Hotspot {
  constructor({ id, containerId, x, y, title = '' }) {
    this.id = id;
    this.containerId = containerId;
    this.x = x;
    this.y = y;
    this.title = title;
  }
  toNode(){
    const htmlBuilder = new HTMLBuilder();

    return htmlBuilder.create('div', {
      id: this.id,
      class: 'js-hotspot-app-item hotspot-app-item',
      draggable: true,
      dataTitle: this.title
    }).style({
      top: this.y,
      left: this.x,
    }).toNode();
  }
}
