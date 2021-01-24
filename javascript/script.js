// declaring variables to retrieve elements from html and work with them in jQuery
var searchInput = $("#search-bar");
var searchButton = $("#search-button")
var clearButton = $("#clear-button");
var searchDiv = $("#search");
var historyDiv = $("#history");
var weatherContent = $("#weather-content");
var cityName = $("#city-name");
var currentDayIcon = $("#icon")
var temp = $("#temp");
var humidity = $("#humidity");
var windSpeed = $("#wspeed");
var uvIndex = $("#uv");
var fiveDayForecast = $("#cards");
var cityList;

// stuff that needs to be done first as the page loads
$(document).ready(function() {
    // checking if the localStorage item "list" exists, if not sets it to an empty array, if it does stores it in js array
    if (localStorage.getItem("list") == null) {
        cityList = [];
        localStorage.setItem("list",JSON.stringify(cityList));
    } else {
        cityList = JSON.parse(localStorage.getItem("list"));
        historyClick(cityList[cityList.length-1]);
    }
    
    // populates page with previous search history if there is any. note: this loop does nothing if there was no "list" in
    // local storage as cityList.length would be 0
    for (var i=0;i<cityList.length;i++) {
        var hButton = createHistoryButton(cityList[i]);
        historyDiv.prepend(hButton);
        historyDiv.attr("style","display: block;");
        if (i != cityList.length-1) {
            hButton.attr("style","border-top: lightgrey 1px solid");
        }
    }
});

// implements "clear history" button
clearButton.on("click", function() {
    localStorage.setItem("list",JSON.stringify([]));
    historyDiv.empty();
    cityList = [];
    historyDiv.attr("style","display: none;");
});

// implements search button
searchButton.on("click", function(event) {
    event.preventDefault();

    var historyButton = createHistoryButton(searchInput.val());
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+searchInput.val()+"&appid=eb152b9f91aaa5406eae378de1186186";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        fiveDayForecast.empty();
        historyDiv.prepend(historyButton);
        historyDiv.attr("style","display: block;");
        var historyButtonList = $(".h-button");
        for (var i=1;i<historyButtonList.length;i++) {
            historyButtonList[i].style.borderTop = "lightgrey 1px solid";
        }
        cityList.push(searchInput.val());
        localStorage.setItem("list",JSON.stringify(cityList));
        showWeather(response);
    }).fail(function() {
        var error = $("<p>").text("Warning: Please enter a valid city name");
        error.attr("style","color: red;");
        $("form").after(error);
        setTimeout(function() {
            error.remove();
        }, 5000);
    });

    queryURL = "https://api.openweathermap.org/data/2.5/forecast?q="+searchInput.val()+"&appid=eb152b9f91aaa5406eae378de1186186"
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {forecast5Day(response)});
});

function KtoC(temp) {
    var tempC = temp-273.15;
    return tempC.toFixed(2);
}

function showWeather(apiResponse) {
    var currentDateText = moment.unix(apiResponse.dt).utcOffset(apiResponse.timezone/3600).format("[(]DD[/]MM[/]YYYY[)]");
    cityName.text(apiResponse.name+" "+currentDateText);
    currentDayIcon.attr("src","http://openweathermap.org/img/wn/"+apiResponse.weather[0].icon+".png");
    currentDayIcon.attr("style","display: inline;");
    cityName.after(currentDayIcon);
    temp.text("Temperature: "+KtoC(apiResponse.main.temp)+"°C");
    humidity.text("Humidity: "+apiResponse.main.humidity+"%");
    windSpeed.text("Wind Speed: "+apiResponse.wind.speed+" MPH");
        
    var lat = apiResponse.coord.lat;
    var lon = apiResponse.coord.lon;
    var newQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&appid=eb152b9f91aaa5406eae378de1186186";
    $.ajax({
        url: newQueryURL,
        method: "GET"
    }).then(function(newResponse) {
        var uvSpan = $("<span>");
        var uvi = newResponse.current.uvi;
        uvSpan.text(uvi);
        if (uvi >= 1 && uvi < 3) {
            uvSpan.addClass("low");
        } else if (uvi >= 3 && uvi < 6) {
            uvSpan.addClass("moderate");
        } else if (uvi >= 6 && uvi < 8) {
            uvSpan.addClass("high");
        } else if (uvi >= 8 && uvi < 11) {
            uvSpan.addClass("very-high");
        } else if (uvi >= 11) {
            uvSpan.addClass("extreme");
        }
        uvIndex.text("UV Index: ");
        uvIndex.append(uvSpan);
        weatherContent.attr("style","display: block;");
    });
}

function forecast5Day(apiResponse) {
    for (var i=0;i<40;i++) {
        var offsetMoment = moment.unix(apiResponse.list[i].dt).utcOffset(apiResponse.city.timezone/3600);
        var timeInt = parseInt(offsetMoment.format("HH:mm"));
        if (timeInt >= 12 && timeInt <= 14) {
            var forecastCard = $("<div>");
            forecastCard.addClass("card forecast");

            var dateHeader = $("<h3>");
            dateHeader.text(offsetMoment.format("[(]DD[/]MM[/]YYYY[)]"));

            var icon = $("<img>");
            icon.attr("src","http://openweathermap.org/img/wn/"+apiResponse.list[i].weather[0].icon+".png");

            var tempContent = $("<p>");
            tempContent.text("Temp: "+KtoC(apiResponse.list[i].main.temp)+"°C");

            var humidityContent = $("<p>");
            humidityContent.text("Humidity: "+apiResponse.list[i].main.humidity+"%");

            forecastCard.append(dateHeader,icon,tempContent,humidityContent);
            fiveDayForecast.append(forecastCard);
        }
    }
}

function createHistoryButton(text) {
    newHistoryButton = $("<div>");
    newHistoryButton.text(text);
    newHistoryButton.addClass("h-button");
    newHistoryButton.on("click",function(){
        historyClick(text);
    });
    return newHistoryButton;
}

function historyClick(text) {
    fiveDayForecast.empty();
    var historyURL = "https://api.openweathermap.org/data/2.5/weather?q="+text+"&appid=eb152b9f91aaa5406eae378de1186186";
    var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?q="+text+"&appid=eb152b9f91aaa5406eae378de1186186";
    $.ajax({
        url: historyURL,
        method: "GET"
    }).then(function(hResponse) {showWeather(hResponse)});
    $.ajax({
        url: fiveDayURL,
        method: "GET"
    }).then(function(fdResponse) {forecast5Day(fdResponse)});
}