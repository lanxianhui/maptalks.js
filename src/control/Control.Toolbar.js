import { isArrayHasData, stringLength } from 'core/util';
import { on, createEl, addClass, stopPropagation, measureDom, isHTML } from 'core/util/dom';
import Control from './Control';

/**
 * @classdesc
 * A toolbar control of the map.
 * @class
 * @category control
 * @extends Control
 * @memberOf control
 * @name Toolbar
 * @param {Object} [options=null] - options defined in [Toolbar]{@link Toolbar#options}
 * @example
 * var toolbar = new Toolbar({
 *     position : 'top-right',
 *     items: [
 *          {
 *            item: 'item1',
 *            click: function () {
 *              alert('item1 clicked');
 *            }
 *          },
 *          {
 *            item: 'item2',
 *            click: function () {
 *              alert('item2 clicked');
 *            }
 *          }
 *      ]
 * }).addTo(map);
 */
export const Toolbar = Control.extend(/** @lends Toolbar.prototype */ {

    /**
     * @property {Object}   options - options
     * @property {String|Object}   [options.position="top-right"]          - position of the toolbar control.
     * @property {Boolean}  [options.vertical=true]                        - Whether the toolbar is a vertical one.
     * @property {Object[]} options.items                                  - items on the toolbar
     */
    options: {
        'height': 28,
        'vertical': false,
        'position': 'top-right',
        'items': {
            //default buttons
        }
    },

    buildOn: function (map) {
        this._map = map;
        var dom = createEl('div');
        var ul = createEl('ul', 'maptalks-toolbar-hx');
        dom.appendChild(ul);

        if (this.options['vertical']) {
            addClass(dom, 'maptalks-toolbar-vertical');
        } else {
            addClass(dom, 'maptalks-toolbar-horizonal');
        }
        var me = this;

        function onButtonClick(fn, index, childIndex, targetDom) {
            var item = me._getItems()[index];
            return function (e) {
                stopPropagation(e);
                return fn({
                    'target': item,
                    'index': index,
                    'childIndex': childIndex,
                    'dom': targetDom
                });
            };
        }

        var items = this.options['items'];
        if (isArrayHasData(items)) {
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                var li = createEl('li');
                if (this.options['height'] !== 28) {
                    li.style.lineHeight = this.options['height'] + 'px';
                }
                li.style.height = this.options['height'] + 'px';
                li.style.cursor = 'pointer';
                if (isHTML(item['item'])) {
                    li.style.textAlign = 'center';
                    var itemSize = measureDom('div', item['item']);
                    //vertical-middle
                    li.innerHTML = '<div style="margin-top:' + (this.options['height'] - itemSize['height']) / 2 + 'px;">' + item['item'] + '</div>';
                } else {
                    li.innerHTML = item['item'];
                }
                if (item['click']) {
                    on(li, 'click', (onButtonClick)(item['click'], i, null, li));
                }
                if (isArrayHasData(item['children'])) {
                    var dropMenu = this._createDropMenu(i);
                    li.appendChild(dropMenu);
                    li._menu = dropMenu;
                    on(li, 'mouseover', function () {
                        this._menu.style.display = '';
                    });
                    on(li, 'mouseout', function () {
                        this._menu.style.display = 'none';
                    });
                }
                ul.appendChild(li);
            }
        }
        return dom;
    },

    _createDropMenu: function (index) {
        var me = this;

        function onButtonClick(fn, index, childIndex) {
            var item = me._getItems()[index]['children'][childIndex];
            return function (e) {
                stopPropagation(e);
                return fn({
                    'target': item,
                    'index': index,
                    'childIndex': childIndex
                });
            };
        }
        var menuDom = createEl('div', 'maptalks-dropMenu');
        menuDom.style.display = 'none';
        menuDom.appendChild(createEl('em', 'maptalks-ico'));
        var menuUL = createEl('ul');
        menuDom.appendChild(menuUL);
        var children = this._getItems()[index]['children'];
        var liWidth = 0,
            i, len;
        for (i = 0, len = children.length; i < len; i++) {
            var size = stringLength(children[i]['item'], '12px');
            if (size.width > liWidth) {
                liWidth = size.width;
            }
        }
        for (i = 0, len = children.length; i < len; i++) {
            var child = children[i];
            var li = createEl('li');
            li.innerHTML = '<a href="javascript:;">' + child['item'] + '</a>';
            li.style.cursor = 'pointer';
            li.style.width = (liWidth + 24) + 'px'; // 20 for text-intent
            on(li.childNodes[0], 'click', (onButtonClick)(child['click'], index, i));
            menuUL.appendChild(li);
        }
        return menuDom;
    },

    _getItems: function () {
        return this.options['items'];
    }
});
