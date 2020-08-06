'use strict';

function updateUser(id) {
    let f = document.getElementById(id);
    let req = new XMLHttpRequest();
    
    function reqListener(e) {
        document.getElementById('modal_' + id).checked = false;
        location.reload();
    }

    req.addEventListener("load", reqListener);
    req.open('PUT', '/account/' + id, true);
    req.setRequestHeader("Content-Type", "application/json");
    var data = formToJSON(f.elements);
    req.send(JSON.stringify(data));
}

/**
 * From https://www.learnwithjason.dev/blog/get-form-values-as-json/
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
const formToJSON = elements => [].reduce.call(elements, (data, element) => {
    if(!element.disabled && isValidValue(element)){
        data[element.name] = element.value;
    }
    return data;
  }, {});

/**
 * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the value should be added, false if not
 */
const isValidValue = element => {
    return (!['checkbox', 'radio'].includes(element.type) || element.checked);
  };