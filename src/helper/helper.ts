/**
 * Shorthand for document.getElementById
 * @param {string} elementId - id of the element to get
 * @returns {Element} - element with the id
 */
function id(elementId: string) {
  return document.getElementById(elementId);
}

/**
 * Shorthand for document.querySelector
 * @param {string} selector - selector of the element to get
 * @returns {Element} - first element matching the selector
 */
function qs(selector: string) {
  return document.querySelector(selector);
}

/**
 * Shorthand for document.querySelectorAll
 * @param {string} selector - selector of the elements to get
 * @returns {NodeList} - element that matches at least one of the specified selectors
 */
function qsa(selector: string) {
  return document.querySelectorAll(selector);
}

/**
 * Returns the JSON object from the response of a request to the URL
 * @param {string} url - url to fetch from
 * @returns {Object} JSON object fron response
 */
async function fetchJson(url: string) {
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
function loadImage(src: string): Promise<HTMLImageElement> {
  let img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export { id, qs, qsa, fetchJson, loadImage };
