import CustomElementBase from '../custom-element-base.mjs'
import {Hotspot} from './hotspot.mjs'

class VisualEditorHotspot extends CustomElementBase {
  static tagName = 'visual-editor-hotspot'

  static customEventPrefix = this.tagName + ':'

  static frame = null

  static properties = {
    'activeHotspotId': 'activeHotspotId'
  }

  static selectors = {
    app: '.js-hotspot-app',
    dataInput: '.js-hotspot-data-input',
    hotspotItem: '.js-hotspot-app-item',
    hotspotItemContainer: '.js-hotspot-app-items',
    hotspotImage: '.js-hotspot-app-image',
    hotspotItemPopup: '.js-hotspot-app-item-popup',
    hotspotItemPopupSaveBtn: '.js-hotspot-app-item-save',
    hotspotItemPopupDeleteBtn: '.js-hotspot-app-item-delete',
    hotspotItemPopupCloseBtn: '.js-hotspot-app-close-popup',
    hotspotImageSelectBtn: '.js-hotspot-app-image-select'
  }

  static events = {
    click: 'click',
    dragstart: 'dragstart',
    dragover: 'dragover',
    dragend: 'dragend',
  }
  static observedProperties = [this.properties['activeHotspotId']]
  static observedEvents = [this.events.click, this.events.dragstart, this.events.dragover, this.events.dragend]

  constructor() {
    super()
    this.app = this.querySelector(this.constructor.selectors.app)
    this.hotspotItems = this.querySelectorAll(this.constructor.selectors.hotspotItem)
    this.hotspotItemContainer = this.querySelector(this.constructor.selectors.hotspotItemContainer)
    this.hotspotItemImage = this.querySelector(this.constructor.selectors.hotspotImage)
    this.hotspotContentPopup = this.querySelector(this.constructor.selectors.hotspotItemPopup)
    this.hotspotContentPopupSave = this.querySelector(this.constructor.selectors.hotspotItemPopupSaveBtn)
    this.hotspotContentPopupDelete = this.querySelector(this.constructor.selectors.hotspotItemPopupDeleteBtn)
    this.hotspotContentPopupClose = this.querySelector(this.constructor.selectors.hotspotItemPopupCloseBtn)
    this.hotspotImageSelect = this.querySelector(this.constructor.selectors.hotspotImageSelectBtn)
    this.dataInput = this.querySelector(this.constructor.selectors.dataInput)
    this.frame = window.location // SWIFT =>  window.frameElement.contentWindow.location;
    this.data = {
      image: '',
      hotspots: []
    }
    this.activeHotspotId = ''

    this.renderHotspots()
  };

  eventHandlers = {
    [this.constructor.events.click]: (objEvent) => {
      //console.log('defaultPrevented', objEvent.defaultPrevented, objEvent.isDefaultPrevented)
      const hasOpenEditor = this.activeHotspotId !== ''

      if(this.hotspotImageSelect && objEvent.target === this.hotspotImageSelect){
        return this.selectImage('https://loremflickr.com/800/600')
      }

      if (!hasOpenEditor) {
        if (objEvent.target === this.hotspotItemImage) {
          this.addHotspot(objEvent)
        } else if (Array.from(this.hotspotItems).includes(objEvent.target)) {
          this.activeHotspotId = objEvent.target.id
          this.showContentEditor(objEvent)
        }
      } else {
        if (objEvent.target === this.hotspotContentPopupClose || objEvent.target !== this.hotspotContentPopup && !objEvent.target.closest(this.constructor.selectors.hotspotItemPopup)) {
          this.hideContentEditor()
        } else {
          if (objEvent.target === this.hotspotContentPopupSave) {
            this.saveHotspot()
          } else if (objEvent.target === this.hotspotContentPopupDelete) {
            if (confirm('Delete Hotspot?')) {
              this.deleteHotspot()
            }
          }
        }
      }

    },
    [this.constructor.events.dragstart]: (objEvent) => {
      objEvent.stopPropagation()
      if (objEvent.target.id === this.activeHotspotId) {
        objEvent.preventDefault()
      } else {
        this.hideContentEditor()
        this.moveHotspot(objEvent)
      }
    },
    [this.constructor.events.dragover]: (objEvent) => {
      objEvent.preventDefault()
    },
    [this.constructor.events.dragend]: (objEvent) => {
      objEvent.stopPropagation()
      this.dropHotSpot(objEvent)
    }
  }



  getGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  getPosition(event) {
    const image = this.hotspotItemImage
    const parentOffset = image.offsetParent
    return {
      x: (((event.pageX - parentOffset.offsetLeft) + document.body.scrollLeft) / image.clientWidth * 100),
      y: (((event.pageY - parentOffset.offsetTop) + document.body.scrollTop) / image.clientHeight * 100)
    }
  }

  ensureElementInViewport(domElm) {
    const elmRect = domElm.getBoundingClientRect()
    const appRect = this.app.getBoundingClientRect()
    const halfWidth = elmRect.width / 2
    const halfHeight = elmRect.height / 2

    let left = parseFloat(window.getComputedStyle(domElm).left) || 0
    let top = parseFloat(window.getComputedStyle(domElm).top) || 0

    if (elmRect.left < appRect.left) {
      left = halfWidth + 10
    } else if (elmRect.right > appRect.right) {
      left = appRect.width - halfWidth - 10
    }

    if (elmRect.top < appRect.top) {
      top = elmRect.height + 10
    } else if (elmRect.bottom > appRect.bottom) {
      top = appRect.height - halfHeight - 10
    }

    domElm.style.left = `${left}px`
    domElm.style.top = `${top}px`
  }

  selectImage(imageSrc){
    this.hotspotItemImage.src = imageSrc;
    this.data.image = imageSrc
    this.hotspotImageSelect.closest('.js-hotspot-app-image-placeholder').remove();
  }

  renderHotspots() {
    //const data = JSON.parse(this.dataInput.value)
    const data = localStorage.getItem(`hotspotApp.${this.id}.data`)
    if (data) {
      this.data = JSON.parse(data)
      this.hotspotItemContainer.innerHTML = ''
      this.data.hotspots.forEach((hotspot) => {
        const hotspotObj = new Hotspot(hotspot)
        this.hotspotItemContainer.appendChild(hotspotObj.toNode())
      })
      this.hotspotItems = this.querySelectorAll(this.constructor.selectors.hotspotItem)

      if(this.data.image && this.hotspotImageSelect){
        this.selectImage(this.data.image)
      }
    }
  }

  setData(reload = false) {
    this.data.image = this.hotspotItemImage.getAttribute('src')
    localStorage.setItem(`hotspotApp.${this.id}.data`, JSON.stringify(this.data))
    //this.dataInput.value = JSON.stringify(this.data)
    fetch(`${location.href}&save=true`, {
      method: 'POST',
      body: JSON.stringify(this.data)
    }).then(() => {
      if (reload) {
        this.frame.reload()
      } else{
        this.renderHotspots()
      }
    })
  }

  getHotspotData(domElm) {
    return new Hotspot({
      id: domElm.dataset.id,
      containerId: this.id,
      x: domElm.style.left,
      y: domElm.style.top
    })
  }

  updateHotspotPosition(event, hotspotId) {
    const hotspot = this.data.hotspots.find(h => h.id === hotspotId)
    const dataIndex = this.data.hotspots.findIndex(h => h.id === hotspotId)
    const dropPosition = this.getPosition(event)

    event.target.style.top = `${dropPosition.y.toFixed(2)}%`
    event.target.style.left = `${dropPosition.x.toFixed(2)}%`
    event.target.classList.remove('is-dragging')

    this.data.hotspots[dataIndex] = Object.assign({}, hotspot, {
      x: event.target.style.left,
      y: event.target.style.top
    })
  }

  addHotspot(event) {
    event.stopPropagation()
    const hotspotPosition = this.getPosition(event)
    const hotspotId = this.getGUID()
    const hotspotNumber = this.hotspotItems.length + 1
    const hotspotObj = new Hotspot({
      id: hotspotId.toString(),
      containerId: this.id,
      x: hotspotPosition.x.toFixed(2) + '%',
      y: hotspotPosition.y.toFixed(2) + '%',
      title: `Hotspot #${hotspotNumber}`
    })
    this.data.hotspots.push(hotspotObj)
    this.hotspotItemContainer.appendChild(hotspotObj.toNode())
    this.hotspotItems = this.querySelectorAll(this.constructor.selectors.hotspotItem)
    //this.hotspotItems = [...Array.from(this.hotspotItems), hotspotObj.toNode()];
    this.setData(false) // true if swift
  }

  deleteHotspot() {
    const hotspotId = this.activeHotspotId
    this.hideContentEditor()
    this.data.hotspots = this.data.hotspots.filter(h => h.id !== hotspotId)
    const hotspotDomElm = this.app.querySelector(`[id="${hotspotId}"]`)
    this.hotspotItemContainer.removeChild(hotspotDomElm)
    this.hotspotItems = this.querySelectorAll(this.constructor.selectors.hotspotItem)
    this.setData(false)
  }

  saveHotspot() {
    const hotspotId = this.activeHotspotId
    this.hideContentEditor()
    const hotspot = this.data.hotspots.find(h => h.id === hotspotId)
    const dataIndex = this.data.hotspots.findIndex(h => h.id === hotspotId)
    const formInputs = this.hotspotContentPopup.querySelectorAll('input')
    const updatedData = {}
    formInputs.forEach((formInput) => {
      const propName = formInput.name.split('.')[1].replace(`_${this.id}`, '')
      updatedData[propName] = formInput.value
    })
    this.data.hotspots[dataIndex] = Object.assign({}, hotspot, updatedData)
    this.setData(false)
  }

  moveHotspot(event) {
    event.target.classList.add('is-dragging')
    event.dataTransfer.setData('text/plain', event.target.id)
  }

  dropHotSpot(event) {
    event.preventDefault()
    const hotspotId = event.dataTransfer.getData('text/plain')
    this.updateHotspotPosition(event, hotspotId)
    this.setData(false)
  }

  showContentEditor(event) {
    const hotspot = this.data.hotspots.find(h => h.id === this.activeHotspotId)
    const position = this.getPosition(event)
    this.hotspotContentPopup.style.top = `${position.y.toFixed(2)}%`
    this.hotspotContentPopup.style.left = `${position.x.toFixed(2)}%`
    this.hotspotContentPopup.classList.add('d-block')
    this.ensureElementInViewport(this.hotspotContentPopup)
    this.hotspotContentPopup.querySelectorAll('input').forEach(input => input.value = '')
    Object.keys(hotspot).forEach((prop) => {
      const inputName = `Hotspot.${prop}_${this.id}`
      const domInput = this.querySelector(`input[name="${inputName}"]`)
      if (domInput !== null) {
        domInput.value = hotspot[prop]
      }
    })
  }

  hideContentEditor() {
    this.activeHotspotId = ''
    this.hotspotContentPopup.classList.remove('d-block')
  }
}

window.addEventListener('DOMContentLoaded', () => {
  VisualEditorHotspot.define()
})
