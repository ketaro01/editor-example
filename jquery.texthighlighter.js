import jQuery from "jquery";
/**
 * @license jQuery Text Highlighter
 * Copyright (C) 2011 - 2013 by mirz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function($, window, document, undefined) {
  const nodeTypes = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3
  };

  const plugin = {
    name: "textHighlighter"
  };

  function TextHighlighter(element, options) {
    this.context = element;
    this.$context = $(element);
    this.options = $.extend({}, $[plugin.name].defaults, options);
    this.init();
  }

  TextHighlighter.prototype = {
    init() {
      this.$context.addClass(this.options.contextClass);
      this.bindEvents();
    },

    destroy() {
      this.unbindEvents();
      this.$context.removeClass(this.options.contextClass);
      this.$context.removeData(plugin.name);
    },

    bindEvents() {
      // MODIFIED by ATLASSIAN
      //            this.$context.bind('mouseup', {self: this}, this.highlightHandler);
    },

    unbindEvents() {
      // MODIFIED by ATLASSIAN
      //            this.$context.unbind('mouseup', this.highlightHandler);
    },

    highlightHandler(event) {
      const self = event.data.self;
      self.doHighlight();
    },

    /**
     * Highlights currently selected text.
     */
    // MODIFIED by ATLASSIAN
    // Method takes a range argument that overrides the current range on page
    // Method now returns the normalized highlight nodes
    doHighlight(rangeObj) {
      const range = rangeObj || this.getCurrentRange();
      if (!range || range.collapsed) return;
      const rangeText = range.toString();
      let normalizedHighlights = "";
      if (this.options.onBeforeHighlight(range) == true) {
        const $wrapper = $.textHighlighter.createWrapper(this.options);

        const createdHighlights = this.highlightRange(range, $wrapper);

        normalizedHighlights = this.normalizeHighlights(createdHighlights);
        this.options.onAfterHighlight(normalizedHighlights, rangeText);
      }

      this.removeAllRanges();
      // MODIFIED BY ATLASSIAN
      // Added this return statement
      return normalizedHighlights;
    },

    /**
     * Returns first range of current selection object.
     */
    getCurrentRange() {
      const selection = this.getCurrentSelection();

      let range;
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }
      return range;
    },

    removeAllRanges() {
      const selection = this.getCurrentSelection();
      selection.removeAllRanges();
    },

    /**
     * Returns current selection object.
     */
    getCurrentSelection() {
      const currentWindow = this.getCurrentWindow();
      let selection;

      if (currentWindow.getSelection) {
        selection = currentWindow.getSelection();
      } else if ($("iframe").length) {
        $("iframe", top.document).each(function() {
          if (this.contentWindow === currentWindow) {
            selection = rangy.getIframeSelection(this);
            return false;
          }
        });
      } else {
        selection = rangy.getSelection();
      }

      return selection;
    },

    /**
     * Returns owner window of this.context.
     */
    getCurrentWindow() {
      const currentDoc = this.getCurrentDocument();
      if (currentDoc.defaultView) {
        return currentDoc.defaultView; // Non-IE
      } else {
        return currentDoc.parentWindow; // IE
      }
    },

    /**
     * Returns owner document of this.context.
     */
    getCurrentDocument() {
      // if ownerDocument is null then context is document
      return this.context.ownerDocument
        ? this.context.ownerDocument
        : this.context;
    },

    /**
     * Wraps given range (highlights it) object in the given wrapper.
     */
    highlightRange(range, $wrapper) {
      if (range.collapsed) return;

      // Don't highlight content of these tags
      const ignoreTags = [
        "SCRIPT",
        "STYLE",
        "SELECT",
        "BUTTON",
        "OBJECT",
        "APPLET"
      ];
      let startContainer = range.startContainer;
      let endContainer = range.endContainer;
      const ancestor = range.commonAncestorContainer;
      let goDeeper = true;

      if (range.endOffset == 0) {
        while (
          !endContainer.previousSibling &&
          endContainer.parentNode != ancestor
        ) {
          endContainer = endContainer.parentNode;
        }
        endContainer = endContainer.previousSibling;
      } else if (endContainer.nodeType == nodeTypes.TEXT_NODE) {
        if (range.endOffset < endContainer.nodeValue.length) {
          endContainer.splitText(range.endOffset);
        }
      } else if (range.endOffset > 0) {
        endContainer = endContainer.childNodes.item(range.endOffset - 1);
      }

      if (startContainer.nodeType == nodeTypes.TEXT_NODE) {
        if (range.startOffset == startContainer.nodeValue.length) {
          goDeeper = false;
        } else if (range.startOffset > 0) {
          startContainer = startContainer.splitText(range.startOffset);
          if (endContainer == startContainer.previousSibling)
            endContainer = startContainer;
        }
      } else if (range.startOffset < startContainer.childNodes.length) {
        startContainer = startContainer.childNodes.item(range.startOffset);
      } else {
        startContainer = startContainer.nextSibling;
      }

      let done = false;
      let node = startContainer;
      const highlights = [];

      do {
        if (goDeeper && node.nodeType == nodeTypes.TEXT_NODE) {
          if (/\S/.test(node.nodeValue)) {
            const wrapper = $wrapper.clone(true).get(0);
            const nodeParent = node.parentNode;

            // highlight if node is inside the context
            if (
              $.contains(this.context, nodeParent) ||
              nodeParent === this.context
            ) {
              const highlight = $(node)
                .wrap(wrapper)
                .parent()
                .get(0);
              highlights.push(highlight);
            }
          }

          goDeeper = false;
        }
        if (
          node == endContainer &&
          (!endContainer.hasChildNodes() || !goDeeper)
        ) {
          done = true;
        }

        if ($.inArray(node.tagName, ignoreTags) != -1) {
          goDeeper = false;
        }
        if (goDeeper && node.hasChildNodes()) {
          node = node.firstChild;
        } else if (node.nextSibling != null) {
          node = node.nextSibling;
          goDeeper = true;
        } else {
          node = node.parentNode;
          goDeeper = false;
        }
      } while (!done);

      return highlights;
    },

    /**
     * Normalizes highlights - nested highlights are flattened and sibling higlights are merged.
     */
    normalizeHighlights(highlights) {
      this.flattenNestedHighlights(highlights);
      this.mergeSiblingHighlights(highlights);

      // omit removed nodes
      const normalizedHighlights = $.map(highlights, hl => {
        if (typeof hl.parentElement != "undefined") {
          // IE
          return hl.parentElement != null ? hl : null;
        } else {
          return hl.parentNode != null ? hl : null;
        }
      });

      return normalizedHighlights;
    },

    flattenNestedHighlights(highlights) {
      const self = this;

      $.each(highlights, function(i) {
        const $highlight = $(this);
        const $parent = $highlight.parent();
        const $parentPrev = $parent.prev();
        const $parentNext = $parent.next();

        if (self.isHighlight($parent)) {
          if (
            $parent.css("background-color") !=
            $highlight.css("background-color")
          ) {
            if (
              self.isHighlight($parentPrev) &&
              !$highlight.get(0).previousSibling &&
              $parentPrev.css("background-color") !=
                $parent.css("background-color") &&
              $parentPrev.css("background-color") ==
                $highlight.css("background-color")
            ) {
              $highlight.insertAfter($parentPrev);
            }

            if (
              self.isHighlight($parentNext) &&
              !$highlight.get(0).nextSibling &&
              $parentNext.css("background-color") !=
                $parent.css("background-color") &&
              $parentNext.css("background-color") ==
                $highlight.css("background-color")
            ) {
              $highlight.insertBefore($parentNext);
            }

            if ($parent.is(":empty")) {
              $parent.remove();
            }
          } else {
            const newNode = document.createTextNode($parent.text());

            $parent.empty();
            $parent.append(newNode);
            $(highlights[i]).remove();
          }
        }
      });
    },

    mergeSiblingHighlights(highlights) {
      const self = this;

      function shouldMerge(current, node) {
        return node &&
          node.nodeType == nodeTypes.ELEMENT_NODE &&
          $(current).css("background-color") ==
            $(node).css("background-color") &&
          $(node).hasClass(self.options.highlightedClass)
          ? true
          : false;
      }

      $.each(highlights, function() {
        const highlight = this;

        const prev = highlight.previousSibling;
        const next = highlight.nextSibling;

        if (shouldMerge(highlight, prev)) {
          var mergedTxt = $(prev).text() + $(highlight).text();
          $(highlight).text(mergedTxt);
          $(prev).remove();
        }
        if (shouldMerge(highlight, next)) {
          var mergedTxt = $(highlight).text() + $(next).text();
          $(highlight).text(mergedTxt);
          $(next).remove();
        }
      });
    },

    /**
     * Sets color of future highlights.
     */
    setColor(color) {
      this.options.color = color;
    },

    /**
     * Returns current highlights color.
     */
    getColor() {
      return this.options.color;
    },

    /**
     * Removes all highlights in given element or in context if no element given.
     */
    removeHighlights(element) {
      const container = element !== undefined ? element : this.context;

      const unwrapHighlight = function(highlight) {
        return $(highlight)
          .contents()
          .unwrap()
          .get(0);
      };

      const mergeSiblingTextNodes = function(textNode) {
        const prev = textNode.previousSibling;
        const next = textNode.nextSibling;

        if (prev && prev.nodeType == nodeTypes.TEXT_NODE) {
          textNode.nodeValue = prev.nodeValue + textNode.nodeValue;
          prev.parentNode.removeChild(prev);
        }
        if (next && next.nodeType == nodeTypes.TEXT_NODE) {
          textNode.nodeValue = textNode.nodeValue + next.nodeValue;
          next.parentNode.removeChild(next);
        }
      };

      const self = this;
      const $highlights = this.getAllHighlights(container, true);
      $highlights.each(function() {
        if (self.options.onRemoveHighlight(this) == true) {
          const textNode = unwrapHighlight(this);
          //TODO: temporary solution handle case1.
          //We will investigating more and solve all case in this ticket https://jira.atlassian.com/browse/CONFDEV-25772
          //mergeSiblingTextNodes(textNode);
        }
      });
    },

    /**
     * Returns all highlights in given container. If container is a highlight itself and
     * andSelf is true, container will be also returned
     */
    getAllHighlights(container, andSelf) {
      const classSelectorStr = `.${this.options.highlightedClass}`;
      let $highlights = $(container).find(classSelectorStr);
      if (
        andSelf == true &&
        $(container).hasClass(this.options.highlightedClass)
      ) {
        $highlights = $highlights.add(container);
      }
      return $highlights;
    },

    /**
     * Returns true if element is highlight, ie. has proper class.
     */
    isHighlight($el) {
      return $el.hasClass(this.options.highlightedClass);
    },

    /**
     * Serializes all highlights to stringified JSON object.
     */
    // Modifed by ATLASSIAN
    // Add highlights argument to function. This allows a caller specified set of highlight nodes
    // to be serialized. If no argument is passed, this.getAllHighlights() will be used instead
    serializeHighlights(highlights) {
      const $highlights = highlights || this.getAllHighlights(this.context);
      const refEl = this.context;
      const hlDescriptors = [];
      const self = this;

      const getElementPath = function(el, refElement) {
        const path = [];

        do {
          const elIndex = $.inArray(el, el.parentNode.childNodes);
          path.unshift(elIndex);
          el = el.parentNode;
        } while (el !== refElement);

        return path;
      };

      $highlights.each((i, highlight) => {
        let offset = 0; // Hl offset from previous sibling within parent node.
        const length = highlight.firstChild.length;
        const hlPath = getElementPath(highlight, refEl);
        const wrapper = $(highlight)
          .clone()
          .empty()
          .get(0).outerHTML;

        if (
          highlight.previousSibling &&
          highlight.previousSibling.nodeType === nodeTypes.TEXT_NODE
        ) {
          offset = highlight.previousSibling.length;
        }

        // Modified by ATLASSIAN
        // Remove unneeded data from hlDescriptors to save storage on server side
        hlDescriptors.push([
          //wrapper,
          $(highlight).text(),
          hlPath.join(":"),
          offset,
          length
        ]);
      });

      return JSON.stringify(hlDescriptors);
    },

    /**
     * Deserializes highlights from stringified JSON given as parameter.
     */
    // Modified by ATLASSIAN
    // Override deserializeHighlights to take wrapper parameter
    deserializeHighlights(json, wrapper) {
      try {
        var hlDescriptors = JSON.parse(json);
      } catch (e) {
        throw new Error(`Can't parse serialized highlights: ${e}`);
      }
      const highlights = [];
      const self = this;

      const deserializationFn = function(hlDescriptor) {
        // Modified by ATLASSIAN
        // Provide static wrapper HTML string, instead of storing it for each descriptor
        //var wrapper = hlDescriptor[0];
        const hlText = hlDescriptor[0];
        const hlPath = hlDescriptor[1].split(":");
        const elOffset = hlDescriptor[2];
        const hlLength = hlDescriptor[3];
        let elIndex = hlPath.pop();
        let idx = null;
        let node = self.context;
        // end Modified by ATLASSIAN
        while ((idx = hlPath.shift()) !== undefined) {
          node = node.childNodes[idx];
        }

        if (
          node.childNodes[elIndex - 1] &&
          node.childNodes[elIndex - 1].nodeType === nodeTypes.TEXT_NODE
        ) {
          elIndex -= 1;
        }

        // removeHighlighter 사용 시 문자열 노드가 분리되기떄문에 normalize
        node.normalize();
        const textNode = node.childNodes[elIndex];

        const hlNode = textNode.splitText(elOffset);
        hlNode.splitText(hlLength);

        if (hlNode.nextSibling && hlNode.nextSibling.nodeValue == "") {
          hlNode.parentNode.removeChild(hlNode.nextSibling);
        }

        if (hlNode.previousSibling && hlNode.previousSibling.nodeValue == "") {
          hlNode.parentNode.removeChild(hlNode.previousSibling);
        }

        // ADDED by Atlassian
        if (hlText !== hlNode.nodeValue) {
          throw new Error("Different text");
        }

        const highlight = $(hlNode)
          .wrap(wrapper)
          .parent()
          .get(0);
        highlights.push(highlight);
      };
      // MODIFIED by Atlassian
      let isDeserializable = true;

      $.each(hlDescriptors, (i, hlDescriptor) => {
        try {
          deserializationFn(hlDescriptor);
        } catch (e) {
          console &&
            console.warn &&
            console.warn(`Can't deserialize ${i}-th descriptor. Cause: ${e}`);
          // MODIFIED by Atlassian
          isDeserializable = false;
          return true;
        }
      });
      // MODIFIED by Atlassian
      return isDeserializable && highlights;
    }
  };

  /**
   * Returns TextHighlighter instance.
   */
  $.fn.getHighlighter = function() {
    return this.data(plugin.name);
  };

  $.fn[plugin.name] = function(options) {
    return this.each(function() {
      if (!$.data(this, plugin.name)) {
        $.data(this, plugin.name, new TextHighlighter(this, options));
      }
    });
  };

  $.textHighlighter = {
    /**
     * Returns HTML element to wrap selected text in.
     */
    createWrapper(options) {
      return $("<span></span>")
        .css("backgroundColor", options.color)
        .addClass(options.highlightedClass);
    },
    defaults: {
      color: "#ffff7b",
      highlightedClass: "highlighted",
      contextClass: "highlighter-context",
      onRemoveHighlight() {
        return true;
      },
      onBeforeHighlight() {
        return true;
      },
      onAfterHighlight() {}
    }
  };
})(jQuery, window, document);
