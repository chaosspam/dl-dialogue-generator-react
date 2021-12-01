/**
 * Shorthand for document.getElementById
 * @param {string} elementId - id of the element to get
 * @returns {Element} - element with the id
 */
function id(elementId) {
  return document.getElementById(elementId);
}

/**
 * Shorthand for document.querySelector
 * @param {string} selector - selector of the element to get
 * @returns {Element} - first element matching the selector
 */
function qs(selector) {
  return document.querySelector(selector);
}

/**
 * Shorthand for document.querySelectorAll
 * @param {string} selector - selector of the elements to get
 * @returns {NodeList} - element that matches at least one of the specified selectors
 */
function qsa(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Returns the tab to append before based on the position
 * @param {number} x - x position of the event
 * @param {number} y - y position of the event
 * @returns {HTMLLIElement} - tab that comes after the position
 */
function getDragAfterElement(x, y) {
  const tabs = [...qsa(".tab-bar li:not(#addLayer, .dragging)")];

  let after = null;
  let afterRightMost = -1;
  let minXOffset = Number.POSITIVE_INFINITY;
  let minYOffset = Number.POSITIVE_INFINITY;
  let maxBoxY = 0;
  let maxBoxX = 0;

  for (let i = 0; i < tabs.length; i++) {
    const box = tabs[i].getBoundingClientRect();
    const boxY = box.top + box.height / 2;
    if (boxY > maxBoxY) {
      maxBoxY = boxY;
    }
  }

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const box = tab.getBoundingClientRect();
    const offsetX = x - (box.right - box.width / 2);
    const offsetY = y - box.bottom;

    // The tab is on the row if the mouse is above the row
    const activeRow = offsetY < 0 && -offsetY <= minYOffset
    if (activeRow) {
      minYOffset = Math.abs(offsetY);

      if (offsetX < 0) {
        if (-offsetX < minXOffset) {
          after = tab;
          minXOffset = -offsetX;
        }
      }
      else if (box.right > maxBoxX) {
        maxBoxX = box.right;
        afterRightMost = i + 1;
      }
    }
  }

  if (after === null && afterRightMost >= 0 && afterRightMost < tabs.length - 1) {
    after = tabs[afterRightMost];
  }

  return after;
}

/**
 * Returns the JSON object from the response of a request to the URL
 * @param {string} url - url to fetch from
 * @returns {Object} JSON object fron response
 */
async function fetchJson(url) {
  try {
    let response = await fetch(url);
    if (response.ok) {
      let json = await response.json();
      return json;
    } else {
      throw new Error(await response.text());
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Creates and returns the image element with given souce
 * @param {string} src - source of the image
 * @returns {Promise} - resolves to the image element if the image loads successfully
 */
function loadImage(src) {
  let img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export { id, qs, qsa, fetchJson, loadImage, getDragAfterElement };