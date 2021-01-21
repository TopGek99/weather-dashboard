var searchInput = $("#search-bar");
var searchButton = $("#search-button")
var searchDiv = $("#search");
var historyDiv = $("#history")
var weatherContent = $("#weather-content");
var cityName = $("#city-name");
var temp = $("#temp");
var humidity = $("#humidity");
var windSpeed = $("#wspeed");
var uvIndex = $("#uv");

searchButton.on("click", function(event) {
    event.preventDefault();

    var historyButton = $("<div>");
    historyButton.text(searchInput.val());
    historyButton.addClass("h-button");
    historyDiv.append(historyButton);
    historyDiv.attr("style","display: block;");
    var historyButtonList = $(".h-button");
    for (var i=1;i<historyButtonList.length;i++) {
        historyButtonList[i].style.borderTop = "lightgrey 1px solid";
    }

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+searchInput.val()+"&appid=eb152b9f91aaa5406eae378de1186186";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response.name);
        cityName.text(response.name);
        temp.text("Temperature: "+KtoC(response.main.temp)+"°C");
        humidity.text("Humidity: "+response.main.humidity+"%");
        windSpeed.text("Wind Speed: "+response.wind.speed+" MPH");
        
        var lat = response.coord.lat;
        var lon = response.coord.lon;
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
    });

    queryURL = "https://api.openweathermap.org/data/2.5/forecast?q="+searchInput.val()+"&appid=eb152b9f91aaa5406eae378de1186186"
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        for (var i=0;i<40;i++) {
            var offsetMoment = moment(response.list[i].dt,'X').utcOffset(response.city.timezone);
            console.log(offsetMoment.format("[(]DD[/]MM[/]YYYY[)]"));
        }
    });
});

function KtoC(temp) {
    var tempC = temp-273.15;
    return tempC.toFixed(2);
}

