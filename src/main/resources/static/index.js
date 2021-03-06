var FIRST_LOAD = true;

// refresh request each 10s
function activeInterval()
{
    setInterval(function()
    { 
        reloadTableRoom();
    }, 10000);
}

// reload rooms in table
function reloadTableRoom()
{
    var table = $("#grid-rooms").DataTable();
    table.clear().draw();
    getRooms();
}

// add event click in row
function addEventTableRoom()
{
    var table = $("#grid-rooms").DataTable();
    $('#grid-rooms tbody').on('click', 'tr', function () {
        if($(this).hasClass('selected')){
            $(this).removeClass('selected');
            localStorage.removeItem("idRoom");
            $('#btn-go-room').hide();
        }
        else{
            var idRoom = Number($(this).find("td").eq(0).html());
            if (!isNaN(idRoom))
            {
                localStorage.setItem("idRoom", idRoom);
                table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#btn-go-room').show();
            }
        }
    });
};

// event click to enter room
$("#btn-go-room").click(function()
{
    goToRoom();
});

function goToRoom(idRoom)
{
    if (idRoom != undefined)
    {
        localStorage.setItem("idRoom", Number(idRoom));
    }
    window.location.href = "room.html";
}

// event click to create room
$("#btn-create-room").click(function()
{
    postCancelRoom();

    $('#errorDivCreateRoom').addClass('d-none'); 

    var categories = $("#categories").val();
    var categoriesObj = [];
    categories.forEach(function(category){
        categoriesObj.push({
            value: category
        })
    });

    var room = {
        maxPlayer: $("#maxPlayer").val(),
        roundTime: $("#roundTime").val(),
        totalRounds: $("#totalRounds").val(),
        letters: $("#letters").val(),
        categories: categoriesObj
    }

    $.ajax({
        url: IP +'/room',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(room),
        success: function (data) {
            localStorage.clear();
            localStorage.setItem("idRoom", data.id);
            localStorage.setItem("roomAdmin", true);
            window.location.href = "room.html";
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            $('#errorDivCreateRoom').removeClass('d-none'); 
            $('#errorTextCreateRoom').text("AVISO! " + XMLHttpRequest.responseJSON.message);
        }
    });
});

// event click to cancel room
$("#btn-cancel-room").click(function(){
    postCancelRoom();
});

// fill table room
function fillTableRoom(result)
{
    var dataSet = [];
    result.forEach(function(data)
    {
        dataSet.push([
            data.id,
            (data.players == null ? 0 : data.players.length) + "(" + data.maxPlayer  + ")"
        ]);
    });
    var table = $("#grid-rooms").DataTable({
        destroy: true,
        searching: false, 
        paging: false, 
        info: false,
        responsive: true,
        data: dataSet,
        columns: [
            { title: 'Número da sala' },
            { title: 'Número de jogadores (máximo)' }
        ],
        language: {
            emptyTable: "Sem salas disponíveis"
        },
        columnDefs: [
            { "width": "80%", "targets": 0 },
            { "width": "20%", "targets": 1 }
        ]
    });
}

// request to get rooms list
function getRooms()
{
    $.get(IP + "/room", function(data, status){
        fillTableRoom(data);
        if (FIRST_LOAD)
        {
            addEventTableRoom();
            activeInterval();
        }
        FIRST_LOAD = false;
    }).fail(function() {
        $('#errorRoom').modal({backdrop: 'static', keyboard: false})
        $('#cancelRoom').modal('hide');
        localStorage.clear();
    });
}

function postCancelRoom()
{
    var idRoom = localStorage.getItem("idRoom");
    var isAdmin = localStorage.getItem("roomAdmin");

    if (isAdmin)
    {
        $.ajax({
            url: IP +'/room/' + idRoom + '/cancel',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                localStorage.clear();
                $('#cancelRoom').modal('hide');
                reloadTableRoom();
            }
        });
    }
}

// alert to cancel room, when root user go to home
function openModalCancelRoom()
{
    var idRoom = localStorage.getItem("idRoom")
    var isAdmin = localStorage.getItem("roomAdmin");

    if (isAdmin)
    {
        $('#cancelRoom').modal('show');
        $('#idRoomTextModalCancelRoom').text("Cancelar Sala: " + idRoom);
    }
}

// init combobox's
function initCBCreateRoom()
{
    LETTERS.forEach(function(letter){
        $('#letters').append($('<option>').val(letter).text(letter).prop("selected", true))
    });

    CATEGORIES.forEach(function(category){
        $('#categories').append($('<option>').val(category.value).text(category.name).prop("selected", true))
    });
}

function getRoomParams()
{
    var url_string = window.location.href;
    var url = new URL(url_string);
    return url.searchParams.get("room");
}

// request to get room status
function checkStatusRoomSession()
{
    var idRoom = localStorage.getItem("idRoom");
    if (idRoom != undefined)
    {
        $.get(IP + "/room/" + idRoom + "/status", function(data){
            if (!data)
            {
                localStorage.clear();
                window.location.pathname = "/";
            }
        });
    }
}

function initHome()
{
    var roomParamUrl = getRoomParams();

    if (roomParamUrl != undefined)
    {
        goToRoom(roomParamUrl);
    } else {
        // load room list
        getRooms();

        // open modal to cancel room
        openModalCancelRoom();

        // init combobox's to create room
        initCBCreateRoom();

        checkStatusRoomSession();
    }
}

initHome();