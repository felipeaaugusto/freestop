// global variables
// define here
var isAdmin = localStorage.getItem("roomAdmin") || false;
var PLAYERS = {};
var FIRST_LOAD = true;
var RESULTS = [];

// request to get room
function getRoom()
{
    var numberRoom = localStorage.getItem("roomNumber");
    $.get(IP +"/room/" + numberRoom, function(room){
        $('#numberRoomText').text("Sala: " + room.number);
        $('#maxPlayersRoomText').text("Número de jogadores: " + room.maxPlayer);
        $('#roundRoomText').text(room.rounds == null ? "Próxima Rodada: " + 1 + " (" + room.totalRounds + ")" : "Próxima Rodada: " + (room.rounds.length+1) + " (" + room.totalRounds + ")");
        fillTablePlayer(room);
        PLAYERS = room.players;
        canStart(room);
        start(room.started);
        if (FIRST_LOAD)
        {
            if (localStorage.getItem("roundProcessed") == "true")
            {
                activeInterval();
            }
            showResult(room);
        }
        FIRST_LOAD = false;
    }).fail(function() {
        window.location.pathname = "/";
    });
}

// verify if start button is begin to ready
function canStart(room)
{
    var roundStarted = [];
    var rounds = 0;
    if (room.rounds)
    {
        rounds = room.rounds.length;
        roundStarted = room.rounds.filter(function(round){
           return !round.calculated;
        });

    }

    if (room.maxPlayer <= room.players.length && roundStarted.length == 0 && room.totalRounds >= rounds)
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
function activeInterval()
{
    setInterval(function()
    { 
        var table = $("#grid-players").DataTable();
        table.clear().draw();
        getRoom();
    }, 5000);
}

// create room
$("#btn-create-player").click(function(){
    var roomNumber = localStorage.getItem("roomNumber")
    var playerName = $("#namePlayer").val();
    var player = {
        name: playerName == "" ? null : playerName,
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
            localStorage.setItem("roundProcessed", true);
            $('#createPlayer').modal('hide');
            getRoom();
        },
        error: function(xhr) {
            if (xhr.status == 400)
            {
                $('#errorDivCreatePlayer').removeClass('d-none'); 
                $('#errorTextCreatePlayer').text("AVISO! " + xhr.responseJSON.message);
            } else {
                localStorage.clear();
                window.location.pathname = "/";
            }
        }
    });
});

// fill table player
function fillTablePlayer(room)
{
    var dataSet = [];
    var players = room.players;
    if (players)
    {
        players.forEach(function(data)
        {
            var totalScore = 0;
            if(room.rounds)
            {
                var roundsProcessed = room.rounds.filter(function(round){
                    return round.calculated;
                });
    
                roundsProcessed.forEach(round => {
                    var result = round.results.filter(function(result){
                        return result.player.number == data.number
                    });
                    result.forEach(r => {
                        totalScore += r.score;
                    });
                });
            }

            dataSet.push([
                data.name,
                totalScore,
                '<button type="button" \
                    class="btn btn-success admin-' + data.admin + ' admin-room-' + isAdmin + '" \
                    onclick="removePlayer(' +  data.number + ')">Remover</button>',
                '<button type="button" \
                    class="btn btn-dark disabled admin-' + !data.admin + '">Admin</button>'
            ]);
        });
        var table = $("#grid-players").DataTable({
            destroy: true,
            searching: false, 
            paging: false, 
            info: false,
            responsive: true,
            data: dataSet,
            autoWidth: false,
            columns: [
                { title: 'Nome' },
                { title: 'Pontuação' },
                { title: 'Remover', visible : isAdmin},
                { title: 'Admin' }
            ],
            "columnDefs": [
                { "width": "70%", "targets": 0 },
                { "width": "10%", "targets": 1 },
                { "width": "10%", "targets": 2 },
                { "width": "10%", "targets": 3 }
            ]
        });
    }
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
            success: function () {
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
        localStorage.setItem("roundProcessed", false);
    }
}

function showResult(room)
{
    var idPlayerSession = Number(localStorage.getItem("playerNumber"));
    if (room.rounds)
    {
        var roundsFiltered = [];
        roundsFiltered = room.rounds.filter(function(round)
        {
            return !round.calculated;
        });
        
        roundsFiltered.forEach(function(round)
        {
            $('#numberRoundModalResultText').text("Resultado da Rodada: " + round.number);
            RESULTS = round.results;
            RESULTS.forEach(function(result)
            {
                var player = result.player;
                if (idPlayerSession != player.number)
                {
                    $('<div id="' + 'player_id_' + player.number + '" class="col-sm-12 text-center padding-top half-padding-bottom">Jogador</div>').appendTo('#areaResult');
                    var categories = result.categories;
                    categories.forEach(function(catResult){
                        CATEGORIES.forEach(function(catDefault)
                        {
                            if (catDefault.value == catResult.value )
                            {
                            	// row
                            	$('<div id="row_player_id_' + player.number + '_' + catResult.value + '" class="row"></div>').insertAfter('#areaResult');
                                // answer
                            	$('<div id="player_id_' + player.number + '_' + catResult.value + '" class="col">'
                                        + catDefault.name + (catResult.word == "" ? "" : " - " + catResult.word) 
                                    + '</div>').appendTo('#' + 'row_player_id_' + player.number + '_' + catResult.value);
                            	// checkbox
                                $('<div id="answer_player_id_' + player.number + '_' + catResult.value + '" class="col"></div>')
                                	.appendTo('#' + 'row_player_id_' + player.number + '_' + catResult.value);
                                
                                createCheckBoxScore("answer_player_id_" + player.number + "_" + catResult.value, catResult.word == "" ? true : false);
                            }
                        });
                    });
                };
            });
        });

        if (roundsFiltered.length === 0)
        {
            setTimeout(() => {
                $('#resultRound').modal('hide');
                activeInterval();
            }, 1000);
        }
    }
}

function createCheckBoxScore(idElAnswer, isNull)
{
    var defaultValue = (isNull ? "checked" : "") + " " + (isNull ? "disabled" : "");
    $('<input type="radio" id="' + idElAnswer + '_option_1" name="' + idElAnswer + '" value="true" checked ' + defaultValue + '>').appendTo('#' + idElAnswer);
    $('<label for="' + idElAnswer + '_option_1" class="padding-right">SIM</label>').appendTo('#' + idElAnswer);
    $('<input type="radio" id="' + idElAnswer + '_option_2" name="' + idElAnswer + '" value="false" ' + defaultValue + '>').appendTo('#' + idElAnswer);
    $('<label for="' + idElAnswer + '_option_2">NÃO</label>').appendTo('#' + idElAnswer);
}

function processResult()
{
    localStorage.setItem("roundProcessed", true)

    var idRoom = localStorage.getItem("roomNumber");
    var idPlayerSession = localStorage.getItem("playerNumber")
    var correction = {
    	approvals: []
    };

    RESULTS.forEach(result => {
        var player = result.player;
        // envia correção das respostas dos outros players
        if (idPlayerSession != player.number)
        {
            var categories = result.categories;
            var approvals = {
            	player: player,
        		checklist: []
            };
            categories.forEach(category => {
            	var checklist = {
                	valid: $('input[name="answer_player_id_' + player.number + '_' + category.value + '"]:checked').val() == "true" ? true : false,
                	category: category
                };
            	approvals.checklist.push(checklist);
            });
            correction.approvals.push(approvals);
        } else {
        	
        }
    });
    sendResult(idRoom, idPlayerSession, correction);
    activeInterval();
}

function sendResult(idRoom, idPlayerSession, correction)
{
    $.ajax({
        url: IP + '/room/' + idRoom + '/result/' + idPlayerSession, 
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(correction),
        success: function () {}
    });
}

// show modal player
if (localStorage.getItem("playerNumber") == null)
{
    $('#createPlayer').modal({backdrop: 'static', keyboard: false})
} else {
    if (localStorage.getItem("roundProcessed") == "false")
    {
        $('#resultLoading').modal({backdrop: 'static', keyboard: false});
        setTimeout(function () {
            $('#resultRound').modal({backdrop: 'static', keyboard: false});
            $('#resultLoading').modal('hide');
            getRoom();
        }, 5000);
    } else {
        getRoom();
    }
}