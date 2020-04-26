// global variables
// define here
var isAdmin = localStorage.getItem("roomAdmin") || false;
var PLAYERS = {};
var FIRST_LOAD = true;
var RESULTS = [];
var LAST_RELOAD = 0;
var ROUNDS_PROCESSED = 0;
var ROOM = {};
var STOP_LOAD = false;
var CHAT_LAST = 0;
// request to get room
function getRoom()
{
	if (!STOP_LOAD)
	{
		var numberRoom = localStorage.getItem("idRoom");
		$.get(IP +"/room/" + numberRoom, function(room){
			$('#numberRoomText').text("Sala: " + room.id);
			$('#maxPlayersRoomText').text("Número de jogadores: " + room.maxPlayer);
			$('#roundRoomText').text(room.rounds == null ? "Próxima Rodada: " + 1 + " (" + room.totalRounds + ")" : "Próxima Rodada: " + (room.rounds.length+1) + " (" + room.totalRounds + ")");
			if (LAST_RELOAD == undefined)
			{
				LAST_RELOAD = room.players.length || 0;
			}
			fillTablePlayer(room);
			PLAYERS = room.players || 0;
			finished(room);
			canStart(room);
			start(room.started);
			loadChat(room)
			if (FIRST_LOAD)
			{
				if (localStorage.getItem("roundProcessed") == "true")
				{
					activeInterval();
				}
				showResult(room);
				$("#areaChat").animate({ scrollTop: 200000 }, "fast");
			}
			FIRST_LOAD = false;
			ROOM = room;
		}).fail(function() {
			window.location.pathname = "/";
		});	
	}
}

// verify if room is finished
function finished(room)
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
    
    if (room.totalRounds == rounds && roundStarted.length == 0)
    {
    	$('#roomFinished').modal({backdrop: 'static', keyboard: false});
    	var playerWinner = {
    		name: "",
    		totalScore: 0
    	};
    	room.players.forEach(function(player)
        {
            var totalScore = 0;
            if(room.rounds)
            {
                var roundsProcessed = room.rounds.filter(function(round){
                    return round.calculated;
                });
    
                roundsProcessed.forEach(round => {
                    var result = round.results.filter(function(result){
                        return result.player.id == player.id
                    });
                    result.forEach(r => {
                        totalScore += r.score;
                    });
                });
                if (totalScore > playerWinner.totalScore)
            	{
                	playerWinner.name = player.name;
                	playerWinner.totalScore = totalScore;
            	}
            }
        });
    	 $('#roomWinnerResultText').text("Ganhador: " + playerWinner.name + " - " + playerWinner.totalScore);
    	 setTimeout(() => {
    		 $('#btn-finish-room').removeClass("d-none");
		}, 10000);
    	 STOP_LOAD = true;
    }
}

function finishRoom()
{
    var idRoom = localStorage.getItem("idRoom");

    $.ajax({
        url: IP +'/room/' + idRoom + '/cancel',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
        	localStorage.clear();
        	window.location.pathname = "/";
        },
	    error: function(xhr) {
	    	localStorage.clear();
	    	window.location.pathname = "/";
	    }
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

    if (room.maxPlayer <= room.players.length && roundStarted.length == 0 && isAdmin == 'true' && room.totalRounds != rounds)
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
        if (player.id == localStorage.getItem("idPlayer"))
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
        var roundProcessed = [];
        if (ROOM.rounds)
        {
            roundProcessed = ROOM.rounds.filter(function(round){
            	return round.calculated;
            });
        }
    	
    	if (PLAYERS.length != LAST_RELOAD && ROUNDS_PROCESSED != roundProcessed.length)
    	{
    		var table = $("#grid-players").DataTable();
    		table.clear().draw();        	
    	}
        getRoom();
    }, 2000);
}

// create room
$("#btn-create-player").click(function(){
    var idRoom = localStorage.getItem("idRoom")
    var playerName = $("#namePlayer").val();
    var player = {
        name: playerName == "" ? null : playerName,
        admin: localStorage.getItem("roomAdmin")
    }

    $.ajax({
        url: IP + '/room/'+ idRoom +'/player',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(player),
        success: function (player) {
            localStorage.setItem("idPlayer", player.id);
            localStorage.setItem("playerName", player.name);
            localStorage.setItem("roundProcessed", true);
            $('#createPlayer').modal('hide');
            sendMessageChat(idRoom, player.id, "<strong>entrou na sala!</strong>")
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
    var roundProcessed = [];
    if (room.rounds)
    {
        roundProcessed = room.rounds.filter(function(round){
        	return round.calculated;
        });
    }
	
	var dataSet = [];
    var players = room.players;

    if (players && PLAYERS.length != LAST_RELOAD || ROUNDS_PROCESSED != roundProcessed.length)
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
                        return result.player.id == data.id
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
                    onclick="removePlayer(' +  data.id + ')">Remover</button>',
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
        LAST_RELOAD = PLAYERS.length;
        ROUNDS_PROCESSED = roundProcessed.length;
        $('#resultLoading').modal('hide');
    }
}

function removePlayer(idPlayer)
{
    var player = {};
    PLAYERS.forEach(function(p){
        if (p.id == idPlayer)
        {
            player = p;
        }
    });

    if (!player.admin || localStorage.getItem("idPlayer") != numberPlayer)
    {
        var idRoom = localStorage.getItem("idRoom")
        $.ajax({
            url: IP + '/room/'+ idRoom +'/player/' + player.id + '/remove', 
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
    var idRoom = localStorage.getItem("idRoom")
    $("#textLinkRoom").val(window.location.origin + "?room=" + idRoom);
});

// event click to copy link
$("#btn-copy-link-room").click(function(){
    var copyText = document.getElementById("textLinkRoom");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
    setTimeout(() => {
    	$('#linkRoom').modal('hide');		
	}, 1000);
});

// event click to start round
$("#btn-start-room").click(function()
{
    var idRoom = localStorage.getItem("idRoom")

    $.ajax({
        url: IP + '/room/'+ idRoom +'/start', 
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

function loadChat(room) {
	if (room.chat)
	{
		$("#areaChat").empty();
		room.chat.forEach(function(chat) {
			var date = moment(new Date(chat.date)).format('MM/DD/YYYY HH:mm:ss');
			$('<span class="chat-player">' + chat.player.name + '</span>').appendTo('#areaChat');	
			$('<p><span class="chat-time">' + date + '</span> ' + chat.message + '</p>').appendTo('#areaChat');	
		});
		if (room.chat.length != CHAT_LAST)
		{
			$("#areaChat").animate({ scrollTop: 200000 }, "fast");
			CHAT_LAST = room.chat.length;
		}
	}
}

function showResult(room)
{
    var idPlayerSession = Number(localStorage.getItem("idPlayer"));
    if (room.rounds)
    {
        var roundsFiltered = [];
        roundsFiltered = room.rounds.filter(function(round)
        {
            return !round.calculated;
        });
        
        roundsFiltered.forEach(function(round)
        {
            $('#numberRoundModalResultText').text("Resultado da Rodada: " + round.id);
            RESULTS = round.results;
            RESULTS.forEach(function(result)
            {
                var player = result.player;
                if (idPlayerSession != player.id)
                {
                    $('<div id="' + 'player_id_' + player.id + '" class="col-sm-12 text-center padding-top half-padding-bottom">Jogador</div>').appendTo('#areaResult');
                    var categories = result.categories;
                    categories.forEach(function(catResult){
                        CATEGORIES.forEach(function(catDefault)
                        {
                            if (catDefault.value == catResult.value )
                            {
                            	// row
                            	$('<div id="row_player_id_' + player.id + '_' + catResult.value + '" class="row"></div>').insertAfter('#areaResult');
                                // answer
                            	$('<div id="player_id_' + player.id + '_' + catResult.value + '" class="col">'
                                        + catDefault.name + (catResult.word == "" ? "" : " - " + catResult.word) 
                                    + '</div>').appendTo('#' + 'row_player_id_' + player.id + '_' + catResult.value);
                            	// checkbox
                                $('<div id="answer_player_id_' + player.id + '_' + catResult.value + '" class="col"></div>')
                                	.appendTo('#' + 'row_player_id_' + player.id + '_' + catResult.value);
                                
                                createCheckBoxScore("answer_player_id_" + player.id + "_" + catResult.value, catResult.word == "" ? true : false);
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
	$('#resultLoading').modal({backdrop: 'static', keyboard: false});
    localStorage.setItem("roundProcessed", true)

    var idRoom = localStorage.getItem("idRoom");
    var idPlayerSession = localStorage.getItem("idPlayer")
    var correction = {
    	approvals: []
    };

    RESULTS.forEach(result => {
        var player = result.player;
        // envia correção das respostas dos outros players
        if (idPlayerSession != player.id)
        {
            var categories = result.categories;
            var approvals = {
            	player: player,
        		checklist: []
            };
            categories.forEach(category => {
            	var checklist = {
                	valid: $('input[name="answer_player_id_' + player.id + '_' + category.value + '"]:checked').val() == "true" ? true : false,
                	category: category
                };
            	approvals.checklist.push(checklist);
            });
            correction.approvals.push(approvals);
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

function sendMessage() {
	var messageText = $("#messageText").val();
	if (messageText != "")
	{
		var idRoom = localStorage.getItem("idRoom");
		var idPlayerSession = localStorage.getItem("idPlayer");
		sendMessageChat(idRoom, idPlayerSession, messageText);
		$("#messageText").val("");
	}
}

function sendMessageChat(idRoom, idPlayerSession, message)
{
	var chat = {
		message: message
	}
	
	$.ajax({
		url: IP + '/room/' + idRoom + '/chat/' + idPlayerSession, 
		type: 'post',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(chat),
		success: function () {}
	});
}

// show modal player
if (localStorage.getItem("idPlayer") == null)
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