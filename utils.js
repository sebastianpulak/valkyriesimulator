
/* formatting */
export let capFirst = (string) => {return string.charAt(0).toUpperCase() + string.slice(1);}
export let percent = (number, decimal) => {
	number = number || 0
	decimal = decimal || 0
	if (number === 0) { return 0 }
	return toDecimal(Math.floor(number * 100 * Math.pow(10, decimal)) / Math.pow(10, decimal),decimal)
}
export let toDecimal = (number, decimal) => {
	number = number || 0
	decimal = decimal || 0
	var dec = Math.pow(10,decimal)
	if (number === 0) { return 0 }
	return Math.round(number * dec) / dec
}
/* DOM */
export let eleByID = (id) => {
	return document.getElementById(id)
}

export let rmByID = (id) => {
	let thisElement = document.getElementById(id)
	thisElement.parentNode.removeChild(thisElement)
}

export let eleByClass = (classname) => {
	return document.getElementsByClassName(classname)
}

export let eleBySelector = (selector) => {
	return document.querySelector(selector)
}

export let getAttributeValueByID = (elementID, attribute) => {
	let thisElement = document.getElementById(elementID)
	return thisElement.getAttribute(attribute)
}

export let updateTextByID = (elementID, text) => {
	text = text || ""
	let thisElement = document.getElementById(elementID)
	if (thisElement.innerHTML !== text.toString()) {
		thisElement.innerHTML = text.toString()
	}
}

export let updateTextBySelector = (elementSelector, text) => {
	text = text || ""
	let thisElement = document.querySelector(elementSelector)
	if (thisElement.innerHTML !== text.toString()) {
		thisElement.innerHTML = text.toString()
	}
}

export let updateAttributeByID = (elementID, attribute, value) => {
	let thisElement = document.getElementById(elementID)
	if (thisElement.getAttribute(attribute) !== value.toString()) {
		thisElement.setAttribute(attribute, value.toString())
	}
}

export let updateAttributeBySelector = (elementSelector, attribute, value) => {
	let thisElement = document.querySelector(elementSelector)
	if (thisElement.getAttribute(attribute) !== value.toString()) {
		thisElement.setAttribute(attribute, value.toString())
	}
}

/* data handling */

export let findWithAttr = (array, attr, value) => {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return false;
}


export let weightedRandom = (weights) => {
	var totalWeight = 0,
		i, random;

	for (i = 0; i < weights.length; i++) {
		totalWeight += weights[i];
	}

	random = Math.random() * totalWeight;

	for (i = 0; i < weights.length; i++) {
		if (random < weights[i]) {
			return i;
		}

		random -= weights[i];
	}

	return -1;
};