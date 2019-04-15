var yearsAdjustment;

function bodyLoad() {
    yearsAdjustment = new Date().getFullYear() - 2011;
    addSlider();
    getLocations();
}

function initialLoadFinished() {
    document.body.classList.remove("loading");
    if (getQueryVariable("geography") != null) {
        presetParameters();
    }
}

function presetParameters() {
    var lowerAge = getQueryVariable("lower");
    var upperAge = getQueryVariable("upper");
    var geography = getQueryVariable("geography")

    ageSlider.noUiSlider.set([lowerAge, upperAge]);

    var geographyOption = document.querySelector("select option[value='" + geography + "']");
    if (geographyOption != undefined) {
        geographyOption.parentElement.value = geography;
        geographyUpdated(geographyOption.parentElement);
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (null);
}

function updateUrlState(geographyCode, lowerAge, upperAge) {
    window.history.replaceState('ethnicity', 'ethnicityedit', '?geography=' + geographyCode + "&lower=" + lowerAge + "&upper=" + upperAge);
}

function getLocations() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './diversityExplorer_getLocations.php');
    xhr.onload = function () {
        if (xhr.status === 200) {
            locationDataLoaded(xhr.responseText);
        } else {
            console.log('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
}

function locationDataLoaded(data) {
    try {
        var locationData = JSON.parse(data);
        for (var i = 0; i < locationData.length; i++) {
            var newOption = document.createElement("option");
            newOption.value = locationData[i].GeographyCode;
            newOption.innerHTML = locationData[i].Geography;
            document.querySelector(".geographySelect[geography='" + locationData[i].GeographyType + "']").appendChild(newOption);
        }

        // Get reference data for England and Wales
        getDataForGeography("K04000001", "England and Wales");

    } catch (error) {
        console.log(error);
    }
}

function addSlider() {
    var ageSlider = document.getElementById('ageSlider');

    noUiSlider.create(ageSlider, {
        start: [25, 40],
        connect: true,
        range: {
            'min': 0,
            'max': 80
        },
        step: 1,
        pips: {
            mode: 'count',
            values: 9,
            density: 8
        },
        tooltips: [false, false],
        format: {
            to: function (value) {
                return parseInt(value, 10);
            },
            from: function (value) {
                return parseInt(value, 10);
            }
        }
    });

    ageSlider.noUiSlider.on("change", ageSlideAction);
    ageSlider.noUiSlider.on("slide", ageSlideAction);
    ageSlider.noUiSlider.on("update", function (e) {
        ageSlideAction();
        calculateEthnicity(getSelectedGeography());
    });
}

function ageSlideAction(method) {
    var sliderValues = ageSlider.noUiSlider.get();
    if (sliderValues[0] == sliderValues[1]) {
        ageValue.innerHTML = sliderValues[0] + " years old";
    } else {
        ageValue.innerHTML = sliderValues[0] + " - " + sliderValues[1] + " years old";
    }

}

function calculateEthnicity(geographyCode) {
    var ageRange = ageSlider.noUiSlider.get();
    var lowerAge = ageRange[0];
    var upperAge = ageRange[1];

    if (geographyCode != undefined) {
        var geographyEthnicityObject = geographyEthnicityData[geographyCode].data.calculateBamePercent(lowerAge, upperAge);
        overallValue.innerHTML = (geographyEthnicityObject.percentBAME < 1) ? "<1%" : geographyEthnicityObject.percentBAME + "%";
        overallValueLabel.innerHTML = getValueLabel(geographyCode, lowerAge, upperAge);
        updateBar(0, geographyEthnicityData[geographyCode].name, geographyEthnicityObject.percentBAME);

        var englandWalesEthnicityObject = geographyEthnicityData["K04000001"].data.calculateBamePercent(lowerAge, upperAge);
        englandWalesAverage.innerHTML = "England &amp; Wales average: " + englandWalesEthnicityObject.percentBAME + "%";
        updateBar(1, "England &amp; Wales", englandWalesEthnicityObject.percentBAME);

        updateUrlState(geographyCode, lowerAge, upperAge);
    }
}

function getValueLabel(geographyCode, lowerAge, upperAge) {
    var label = geographyEthnicityData[geographyCode].name + " percent BAME ";
    if (lowerAge == upperAge) {
        var ageString = "(" + lowerAge + " years old)";
    } else {
        var ageString = "(" + lowerAge + " - " + upperAge + " years old)";
    }
    label += ageString;
    return label;

}

var geographyEthnicityData = {};

function geographyUpdated(element) {
    var geography = element.getAttribute("geography");

    document.querySelector("select:not([geography='" + geography + "'])").value = "null";

    var geographyCode = element.value;
    if (geographyEthnicityData[geographyCode] == undefined) {
        var geographyName = element.options[element.selectedIndex].text;
        getDataForGeography(geographyCode, geographyName);
    } else {
        calculateEthnicity(geographyCode);
    }
}

function getSelectedGeography() {
    var selectedGeography = null;
    var activeSelect = document.querySelector('option:checked:not([value="null"])');
    if (activeSelect != undefined) {
        selectedGeography = activeSelect.value;
    }
    return selectedGeography;
}

function getDataForGeography(geographyCode, geographyName) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './diversityExplorer_getData.php?geographycode=' + geographyCode);
    xhr.onload = function () {
        if (xhr.status === 200) {
            geographyEthnicityDataLoaded(xhr.responseText, geographyCode, geographyName);
        } else {
            console.log('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
}

function geographyEthnicityDataLoaded(data, geographyCode, geographyName) {
    try {
        geographyEthnicityData[geographyCode] = {
            "name": geographyName,
            "data": JSON.parse(data)
        }
        if (geographyName == "England and Wales") {
            initialLoadFinished();
        } else {
            calculateEthnicity(geographyCode);
        }
    } catch (e) {
        console.log(e);
    }
}

Array.prototype.calculateBamePercent = function (lowerAge, upperAge) {
    lowerAge = ((lowerAge - yearsAdjustment) < 0) ? 0 : lowerAge - yearsAdjustment;
    upperAge = ((upperAge - yearsAdjustment) < 0) ? 0 : upperAge - yearsAdjustment;

    var headingsToCategories = {
        "All categories: Ethnic group": "TotalPopulation",
        "White: Total": "TotalWhite"
    }

    var outputEthnicityData = {
        "TotalPopulation": 0,
        "TotalWhite": 0
    }

    var addData = false;
    for (var i = 0; i < this.length; i++) {
        var lowerAgeBand = this[i].LowerAgeBoundary;
        var upperAgeBand = this[i].UpperAgeBoundary;
        var multiplier = 1;

        if (lowerAge >= lowerAgeBand && lowerAge <= upperAgeBand) {
            multiplier = calculateMultiplier(lowerAge, lowerAgeBand, upperAgeBand);
            addData = true;
        }
        if (upperAge >= lowerAgeBand && upperAge <= upperAgeBand) {
            multiplier = calculateMultiplier(upperAge, lowerAgeBand, upperAgeBand);
        }
        console.log(multiplier);

        if (upperAge < lowerAgeBand) {
            addData = false;
        }

        if (addData == true) {
            var category = headingsToCategories[this[i].Ethnicity];
            outputEthnicityData[category] += parseInt(multiplier * Number(this[i].Count), 10);
        }
    }

    outputEthnicityData.percentBAME = parseInt(100 * (1 - (outputEthnicityData.TotalWhite / outputEthnicityData.TotalPopulation)), 10);

    return outputEthnicityData;
}

function calculateMultiplier(age, lowerAgeBand, upperAgeBand) {
    if (lowerAgeBand == upperAgeBand) {
        var multiplier = 1;
    } else {
        var multiplier = ((age - lowerAgeBand + 1) / (upperAgeBand - lowerAgeBand + 1));
    }
    return multiplier;
}

function updateBar(barIndex, name, percent) {
    var holder = document.querySelectorAll(".barRow")[barIndex];

    var barTitle = holder.querySelector(".barTitle");
    barTitle.innerHTML = name;
    barTitle.title = name;

    var bar = holder.querySelector(".bar");
    bar.style.width = (percent < 1) ? "2px" : percent + "%";

    var barPercent = holder.querySelector(".barPercent");
    barPercent.innerHTML = "&nbsp;" + ((percent < 1) ? "<1" : percent) + "%&nbsp;";
    
    var whitePercent = holder.querySelector(".percentWhite");
    whitePercent.innerHTML = 100 - percent + "%";
    
    holder.parentElement.classList.remove("hidden");
}
