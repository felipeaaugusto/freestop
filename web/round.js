// global variables
// define here
var ROUND_STARTED = {}
var ROOM_CATEGORIES = {};
var ROUND_LETTER = {};

// request to get room
function getRoom()
{
    var numberRoom = localStorage.getItem("roomNumber");
    $.get(IP + "/room/" + numberRoom, function(data, status){
        $('#numberRoomText').text("Sala: " + data.number);
        $('#roundRoomText').text("Rodada: " + data.rounds.length);
        checkPlayerInRoom(data.players);
        setTimeRound(data.rounds);
        redirectRoomPage(data.started);
        createInputCategories(data);
    }).fail(function() {
        window.location.pathname = "/";
    });
}

// verify if player in room
function checkPlayerInRoom(players)
{
    var PLAYERS = players;
    var userExist = false;
    PLAYERS.forEach(function(player){
        if (player.number == localStorage.getItem("playerNumber"))
        {
            userExist = true;
        }
    });

    if (!userExist)
    {
        localStorage.clear();
        window.location.pathname = "/";
    }
}

function setTimeRound(rounds)
{
    rounds.forEach(function(round){
        if (round.started)
        {
            ROUND_STARTED = round;
            $('#roundLetterText').text("Letra: " + ROUND_STARTED.letter);
        }
    });
    if (ROUND_STARTED == undefined)
    {
        window.location.href = "room.html";
    }
}

function stopRoundByClick()
{
    var missingCategories = [];
    ROOM_CATEGORIES.forEach(function(category){
        var val = $("#" + category.value).val();
        if (val == "" || val.charAt(0).toUpperCase() != ROUND_STARTED.letter)
        {
            missingCategories.push(category.value)
        }
    });

    if (missingCategories.length > 0)
    {
        $('#roundCategoriesLeftText').text("");
        CATEGORIES.forEach(function(cat){
            missingCategories.forEach(function(errorCat){
                if (cat.value == errorCat){
                    $('#roundCategoriesLeftText').append(cat.name + "<br><br>");
                }
            })
        });
        $('#errorRound').modal('show');
    } else {
        postToStopRound();
    }
}

function stopRoundByTime(dtNow, dtFinish)
{
    if (dtNow.getTime() > dtFinish.getTime())
    {
        postToStopRound();
    }
}

function postToStopRound()
{
    var roomNumber = localStorage.getItem("roomNumber")
    var playerNumber = localStorage.getItem("playerNumber")

    var resultCategories = []

    ROOM_CATEGORIES.forEach(function(category){
        var val = $("#" + category.value).val();
        resultCategories.push({
            value: category.value,
            word: val
        });
    });

    var result = {
        categories: resultCategories
    }

    $.ajax({
        url: IP + '/room/' + roomNumber +'/stop/' + playerNumber,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(result),
        success: function (data) {
            redirectRoomPage(data.started);
        }
    });
}

function redirectRoomPage(started)
{
    if(!started)
    {
        window.location.href = "room.html";
        localStorage.setItem("roundFinished", true);
    }
}

function createInputCategories(room)
{
    ROOM_CATEGORIES = room.categories;
    ROOM_CATEGORIES.forEach(function(catRoom){
        CATEGORIES.forEach(function(cat){
            if (catRoom.value == cat.value) {
                $('<label>').attr({
                    for: cat.value,
                    id: "label_" + cat.value,
                    class: "col-sm-2"
                }).appendTo('#divResponse');
                $("#label_" + cat.value).append(cat.name);
                $('<input>').attr({
                    id: cat.value,
                    name: cat.value,
                    value: '',
                    class: "col-sm-10"
                }).appendTo('#divResponse');
            }
        });
    })
}

// refresh request each 1s
setInterval(function()
{ 
    $.get(IP + "/room/time", function(data){
        var dateFinish = new Date(ROUND_STARTED.dateFinish);
        var dateNow = new Date(data);
        var diff = dateNow.getTime() - dateFinish.getTime();
        var seconds = Math.abs(diff / 1000);
        $('#roundTimeLeftText').text("Tempo restante: " + ~~seconds + "s");
        stopRoundByTime(dateNow, dateFinish);
    });
    var numberRoom = localStorage.getItem("roomNumber");
    $.get(IP +"/room/" + numberRoom, function(room) {
        if (!room.started)
        {
            postToStopRound();
        }
    });
}, 1000);

getRoom();