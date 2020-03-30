// global variables
// define here
var isAdmin = localStorage.getItem("roomAdmin") || false;
var PLAYERS = {};
var FIRST_LOAD = true;

// request to get room
function getRoom()
{
    var numberRoom = localStorage.getItem("roomNumber");
    $.get(IP +"/room/" + numberRoom, function(room){
        $('#numberRoomText').text("Sala: " + room.number);
        $('#maxPlayersRoomText').text("Número de jogadores: " + room.maxPlayer);
        $('#roundRoomText').text(room.rounds == null ? "Próxima Rodada: " + 1 : "Próxima Rodada: " + (room.rounds.length+1) );
        fillTablePlayer(room.players);
        PLAYERS = room.players;
        canStart(room);
        start(room.started);
        showResult(room)
    }).fail(function() {
        window.location.pathname = "/";
    });
}

// verify if start button is begin to ready
function canStart(data)
{
    if (data.maxPlayer <= data.players.length && !localStorage.getItem("roundFinished"))
    {
        $('#btn-start-room').prop('disabled', false);
    } else {
        $('#btn-start-room').prop('disabled', true);
    }
    checkPlayerInRoom();
}

// verify if player in room
function checkPlayerInRoom()
{
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

// refresh request each 10s
setInterval(function()
{ 
    var table = $("#grid-players").DataTable();
    table.clear().draw();
    getRoom();
}, 5000);

// create room
$("#btn-create-player").click(function(){
    var roomNumber = localStorage.getItem("roomNumber")

    var player = {
        name: $("#namePlayer").val(),
        admin: localStorage.getItem("roomAdmin")
    }

    $.ajax({
        url: IP + '/room/'+ roomNumber +'/player',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(player),
        success: function (data) {
            localStorage.setItem("playerNumber", data.number);
            localStorage.setItem("playerName", data.name);
            $('#createPlayer').modal('hide');
            getRoom();        
        }
    });
});

// fill table player
function fillTablePlayer(result)
{
    var dataSet = [];
    result.forEach(function(data)
    {
        dataSet.push([
            data.name,
            '<button type="button" \
                class="btn btn-dark disabled admin-' + !data.admin + '">Admin</button>',
            '<button type="button" \
                class="btn btn-success admin-' + data.admin + ' admin-room-' + isAdmin + '" \
                onclick="removePlayer(' +  data.number + ')">Remover</button>'
        ]);
    });
    var table = $("#grid-players").DataTable({
        destroy: true,
        searching: false, 
        paging: false, 
        info: false,
        responsive: true,
        data: dataSet,
        columns: [
            { title: 'Nome' },
            { title: 'Admin' },
            { title: 'Remover', visible : isAdmin}
        ],
        "columnDefs": [
            { "width": "80%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "10%", "targets": 2 }
        ]
    });
}

function removePlayer(numberPlayer)
{
    var player = {};
    PLAYERS.forEach(function(p){
        if (p.number == numberPlayer)
        {
            player = p;
        }
    });

    if (!player.admin || localStorage.getItem("playerNumber") != numberPlayer)
    {
        var roomNumber = localStorage.getItem("roomNumber")
        $.ajax({
            url: IP + '/room/'+ roomNumber +'/player/' + player.number + '/remove', 
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                getRoom();        
            }
        });
    }
}

// event click to generate link
$("#btn-link-room").click(function()
{
    $('#linkRoom').modal('show');
    var roomNumber = localStorage.getItem("roomNumber")
    $("#textLinkRoom").val(window.location.origin + "?room=" + roomNumber);
});

// event click to copy link
$("#btn-copy-link-room").click(function(){
    var copyText = document.getElementById("textLinkRoom");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
    $('#linkRoom').modal('hide');
});

// event click to start round
$("#btn-start-room").click(function()
{
    var roomNumber = localStorage.getItem("roomNumber")

    $.ajax({
        url: IP + '/room/'+ roomNumber +'/start', 
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            start(data.started);
        }
    });
});

// start round
function start(started)
{
    if (started)
    {
        window.location.href = "round.html";
        localStorage.setItem("roundFinished", false);
    }
}

function showResult(room)
{
    if (room.rounds && FIRST_LOAD)
    {
        var rounds = room.rounds;
        rounds.forEach(function(round){
            $('#numberRoundModalResultText').text("Resultado da Rodada: " + round.number);
            round.results.forEach(function(result)
            {
                if (!round.calculed)
                {
                    var player = result.player;
                    $('<div id="' + 'player_id_' + player.number + '">' + player.name + '</div>').appendTo('#areaResult');
                    var categories = result.categories;
                    categories.forEach(function(catResult){
                        CATEGORIES.forEach(function(catDefault)
                        {
                            if (catDefault.value == catResult.value )
                            {
                                $('<div id="' + '"player_id_"' + player.number + '_category_name_' + catResult.value + '">' + catDefault.name + " - "  + catResult.word + '</div>')
                                    .appendTo('#player_id_' + player.number);
                            }
                        });
                    })
                }
            });
        })
        FIRST_LOAD = false;
    }
}

// show modal player
if (localStorage.getItem("playerNumber") == null)
{
    $('#createPlayer').modal('show');
} else {
    getRoom();
    if (localStorage.getItem("roundFinished"))
    {
        setTimeout(() => {
            $('#resultRound').modal('show');
        }, 5000);
    }
}