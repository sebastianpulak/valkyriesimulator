import * as u from './utils.js';
import {heroLocaleIds} from './herolocaleids.js';
import {heroLocales} from './herolocales.js';
import {heroPools} from './heropools.js';

Array.prototype.sum = function (prop) {
    var total = 0
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += this[i][prop]
    }
    return total
}

var settings = {
	showlog: true,
	logmaxentry: 500,
	repeat: false,
	pools: [{
		poolname: "energypool",
		pooltext: "Energy Summon",
		poolid: 4
	},
	{
		poolname: "commonchestpool",
		pooltext: "Common Chest",
		poolid: 1
	},
	{
		poolname: "grandchestpool",
		pooltext: "Grand Summon",
		poolid: 2
	},
	{
		poolname: "grandchesteventpool",
		pooltext: "Grand Summon during Event",
		poolid: 34
	},
	{
		poolname: "friendpool",
		pooltext: "Friend Summon",
		poolid: 3
	},
/*	{
		poolname: "lulpool",
		pooltext: "What Summon",
		poolid: 5
	},*/
	{
		poolname: "diamondwarriorpool",
		pooltext: "Diamond Key - Warrior",
		poolid: 501
	},
	{
		poolname: "diamondmagepool",
		pooltext: "Diamond Key - Mage",
		poolid: 502
	},
	{
		poolname: "diamondwandererpool",
		pooltext: "Diamond Key - Wanderer",
		poolid: 503
	},
	{
		poolname: "diamondassassinpool",
		pooltext: "Diamond Key - Assassin",
		poolid: 504
	},
	{
		poolname: "diamondclericpool",
		pooltext: "Diamond Key - Cleric",
		poolid: 505
	}]
}

var data = {


	log: "",
	logcount: 0,
	lastpulledheroid: null,
	highlighthero: 0,
	defaultpoolname: "",
	defaultpooltext: "",
	selectedpool: "energy"
}

let isPool = (id) => {
	return u.findWithAttr(heroPools, "id", id)
}
let isHero = (id) => {
	return u.findWithAttr(heroLocaleIds, "Id", id)
}
let heroNameByID = (id) => {
	let localeID = heroLocaleIds.find( localeIDs => localeIDs.Id === id );
	let herolocale = heroLocales.find( locale => locale.id === localeID.NameLang );
	return herolocale.text
}


function weightCrawler(poolname, itemid, weight) {
	let poolWeight = weight || 0

	// loop through all pools
	let pool = heroPools.find( poolobj => poolobj.id === itemid );

	// loop on the items of the correct pool
	let pooltotalweight = pool.items.sum(1)

	for (var item_i = 0; item_i < pool.items.length; item_i++) {
		pool.items[item_i]
		let itemId = pool.items[item_i][0]
		let itemWeight = pool.items[item_i][1]
		if (isPool(itemId)) {
			// recursive and add up the weight
			//weightCrawler(poolname, itemId, poolWeight*itemWeight)
			//weightCrawler(poolname, itemId, itemWeight/poolWeight)
			weightCrawler(poolname, itemId, (itemWeight/pooltotalweight)*weight)

		} else if (isHero(itemId)) {
			// push total weight into the data object
			data[poolname].push({
				heroid: itemId,
				//totalweight: poolWeight*itemWeight,
				//totalweight: itemWeight/poolWeight
				totalweight: (itemWeight/pooltotalweight)*weight
			})
		}
	}
}

function calcPoolTotalWeight(poolname) {
	let poolweight = 0
	for (var i = 0; i < data[poolname].length; i++) {
		poolweight += data[poolname][i].totalweight
	}
	return poolweight
}

function setItemWeightPercent(poolname) {
	for (var i = 0; i < data[poolname].length; i++) {
		data[poolname][i]["weightpercent"] = data[poolname][i].totalweight / data[poolname+"weight"]
	}
}

function renderHeroes(poolname) {
	u.eleByID("poolheroes").innerHTML = ""
	for (var i = 0; i < data[poolname].length; i++) {
		if (data[poolname][i]["totalweight"] !== 0) {

			let text = "<tr class=\"hero-"+data[poolname][i]["heroid"]+"\">"
			text += "<td class=\"w70\">"+data[poolname][i]["heroid"]+"</td>"
			text += "<td class=\"w200\">"+heroNameByID(data[poolname][i]["heroid"])+"</td>"
			text += "<td class=\"w120\">"+u.percent(data[poolname][i]["weightpercent"], 6)+"%</td>"
			text += "<td id=\""+poolname+"-pulls-"+data[poolname][i]["heroid"]+"\" class=\"aligncenter w70\"></td>"
			text += "<td class=\"aligncenter w120\"><span id=\""+poolname+"-pullspercent-"+data[poolname][i]["heroid"]+"\"></span></td>"
			text += "</tr>"

			u.eleByID("poolheroes").innerHTML += text
		}
	}
}

function pullEntry(poolname, heroid) {
	let hero = data[poolname].find( hero => hero.heroid === heroid );
	if (hero.hasOwnProperty('count')) {
		hero.count++
	} else {
		hero.count = 1
	}
	data[poolname+"pullcount"]++
}
function printEntry(heroid) {
	if (!settings.repeat) {
		let msg = "<span class=\"heroentry hero-"+heroid+"\" onmouseover=\"highlightHero(this)\" data-heroid=\""+heroid+"\">"+heroNameByID(heroid)+"</span> "
		data.log += msg
	}
	data.logcount++
}

function pull(poolname, amount) {
	let weights = data[poolname].map(function (hero) {
	    return hero.totalweight
	})

	for (var i = 0; i < amount; i++) {
		let selectionIndex = u.weightedRandom(weights)
		let heropulled = data[poolname][selectionIndex].heroid

		pullEntry(poolname,heropulled)
		data.lastpulledheroid = heropulled
		if (settings.showlog) {
			printEntry(heropulled)
		}
	}
}
function clear(poolname) {
	data[poolname+"pullcount"] = 0
	data[poolname]
	for (var i = 0; i < data[poolname].length; i++) {
		if (data[poolname][i].hasOwnProperty("count")) {
			data[poolname][i].count = 0
		}
	}
}
function initPool(poolname, poolid) {
	weightCrawler(poolname, poolid, 1)
	data[poolname+"weight"] = calcPoolTotalWeight(poolname)
	setItemWeightPercent(poolname)
}

function setCurrentPoolUI(poolname, pooltext) {
	renderHeroes(poolname)
	u.eleByID("pullbuttons").innerHTML = '<button id="'+poolname+'_pull_1">'+pooltext+' x1</button>'
	+ '<button id="'+poolname+'_pull_10">'+pooltext+' x10</button>'
	+ '<button id="'+poolname+'_pull_100">'+pooltext+' x100</button>'
	+ '<button id="'+poolname+'_pull_10000">'+pooltext+' x10000</button>'
	+ '<button id="'+poolname+'_clear">Clear '+pooltext+' Pulls</button>'
	u.eleByID(poolname+"_pull_1").onclick = function() {
		pull(poolname,1)
	}
	u.eleByID(poolname+"_pull_10").onclick = function() {
		pull(poolname,10)
	}
	u.eleByID(poolname+"_pull_100").onclick = function() {
		pull(poolname,100)
	}
	u.eleByID(poolname+"_pull_10000").onclick = function() {
		pull(poolname,10000)
	}
	u.eleByID(poolname+"_clear").onclick = function() {
		clear(poolname)
	}
}

function updateNav() {
	u.updateAttributeByID("simulator", "data-view", data.selectedpool)
}

function updatePoolResult(poolname) {
	/* update table */
	for (var i = 0; i < data[poolname].length; i++) {

		if (data[poolname][i].hasOwnProperty('count')) {
			let heroid = data[poolname][i].heroid
			let count = data[poolname][i].count
			let elementID = poolname+"-pulls-"+heroid
			u.updateTextByID(elementID, count.toLocaleString())

			let elementIDpercent = poolname+"-pullspercent-"+heroid
			let pullspercent = u.percent( count / data[poolname+"pullcount"], 6)
			u.updateTextByID(elementIDpercent, pullspercent+"%")
		}
	}
	u.updateTextByID(poolname+"pullcount", data[poolname+"pullcount"].toLocaleString())
	/* highlight hero id */
	u.updateAttributeByID("poolheroes", "data-highlight", data.highlighthero)
	u.updateAttributeByID("logcontainer", "data-highlight", data.highlighthero)
	/* last pulled */
	if (data.lastpulledheroid) {
		u.updateTextByID("lastpulled", "<span class=\"hero-"+data.lastpulledheroid+"\">"+heroNameByID(data.lastpulledheroid)+"</span>")
		u.updateAttributeByID("lastpulled", "data-heroid", data.lastpulledheroid)
	}

	/* auto pull */
	if (settings.repeat) {
		u.updateTextByID("autopullbutton", "Auto pull is ON")
	} else {
		u.updateTextByID("autopullbutton", "Auto pull is OFF")
	}
	
}

function updateLog() {
	/* logs */
	let logcontainer = u.eleByID("logcontainer")
	if (data.logcount > 0 && data.logcount < settings.logmaxentry) {
		logcontainer.innerHTML += data.log
	} else if (data.logcount >= settings.logmaxentry) {
		u.updateTextByID("logcontainer", "<span>Too many entries</span>")
	}
	data.log = ""
	data.logcount = 0
	if (logcontainer.childElementCount > settings.logmaxentry) {
		let nEntryToRemove = logcontainer.childElementCount - settings.logmaxentry
		for (var i = nEntryToRemove - 1; i >= 0; i--) {
			logcontainer.removeChild(logcontainer.getElementsByTagName('span')[i])
		}
	}
}

document.highlightHero = function (that) {
  data.highlighthero = that.getAttribute("data-heroid")
}

function createLI(id,text) {
	let para = document.createElement("LI");                       // Create a <p> node
	let t = document.createTextNode(text);      // Create a text node
	para.appendChild(t); 
	para.setAttribute("id", id)
	return para
}

function initAll() {
	/*nav buttons*/

	for (var i = 0; i < settings.pools.length; i++) {
		/* add the variables */
		let poolname = settings.pools[i].poolname
		let pooltext = settings.pools[i].pooltext
		let poolid = settings.pools[i].poolid

		if(i === 0) {
			data.defaultpoolname = poolname
			data.defaultpooltext = pooltext
		}

		data[poolname] = []
		data[poolname+"pullcount"] = 0
		/* create buttons */
		let navSimElement = createLI(poolname+"-nav", pooltext)
		u.eleByID("simulatorlist").appendChild(navSimElement)

		u.eleByID(poolname+"-nav").onclick = function() {
			data.selectedpool = poolname
			setCurrentPoolUI(poolname, pooltext)
			console.log(data.selectedpool)
		}

		/* add pull count */
		u.eleByID("pullcounts").innerHTML += pooltext+' <span id="'+poolname+'pullcount">0</span> Pulls<br>'

		/* calculate data */
		initPool(poolname, poolid)

		u.eleByID("autopullbutton").onclick = function() {
			settings.repeat = !settings.repeat
		}
	}
	/* set the default table */
	data.selectedpool = data.defaultpoolname
	setCurrentPoolUI(data.defaultpoolname, data.defaultpooltext)

	console.log(data)
	var updateUI = function () {
		updateNav()
		updatePoolResult(data.selectedpool)
		updateLog()
	}
	var autoPullLoop = function () {
		if (settings.repeat) {
			pull(data.selectedpool,200000)
		}
	}
	let _updateUIId = setInterval(updateUI, 1000 / 5)
	let _autoPullLoopId = setInterval(autoPullLoop, 1000 / 500)
}

initAll()