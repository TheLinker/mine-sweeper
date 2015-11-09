
var Board = function (sizex, sizey, bombs) {
    this.sizex = sizex || 10;
    this.sizey = sizey || 10;
    this.bombs = bombs || 10;
    this.found = 0;
    this.checkboard = [];
}

Board.prototype.init_checkboard = function (selector) {
    this.checkboard = [];
    for(var i=0;i<this.sizey;i++) {
        var tmp = [];
        for(var j=0;j<this.sizex;j++) {
            var new_cell = new Cell(j, i);
            tmp.push(new_cell);
        }
        this.checkboard.push(tmp);
    }

    if(selector) {
        $(selector).html("");
        $(selector).append(this.get_table());
        this.install_events();
    }
}

Board.prototype.init_bombs = function () {
    /*this.checkboard[0][0].has_bomb = true;
    this.checkboard[1][1].has_bomb = true;
    this.checkboard[2][2].has_bomb = true;
    this.checkboard[3][3].has_bomb = true;
    this.checkboard[4][4].has_bomb = true;
    this.checkboard[5][5].has_bomb = true;
    this.checkboard[6][6].has_bomb = true;
    this.checkboard[7][7].has_bomb = true;
    this.checkboard[8][8].has_bomb = true;
    this.checkboard[9][9].has_bomb = true;*/

    this.bombs = Math.min(this.bombs, this.sizey*this.sizex);

    for(var i = 0 ; i < this.bombs ; i++) {
        col = Math.floor(Math.random() * this.sizex);
        row = Math.floor(Math.random() * this.sizey);

        if(this.checkboard[row][col].has_bomb) i--;
        this.checkboard[row][col].has_bomb = true;
    }

    this.found = 0;
    this.update_found_div();
}

Board.prototype.get_table = function () {
    var a_table = $('<table>');

    $.each(this.checkboard, function(rown, row) {
        var one_row = $('<tr>');
        $.each(row, function(coln, cell) {
            one_row.append(cell.get_cell());
        });
        a_table.append(one_row.clone());
    });

    return a_table;
}

Board.prototype.install_events = function () {
    $('body, html').contextmenu(function(ev) {
        ev.preventDefault();
        return false;
    });
    $(".cell-closed").mousedown(function (ev) {
        ev.preventDefault();

        var col = $(this).attr('data-col');
        var row = $(this).attr('data-row');

        switch (ev.which) {
            case 1:
                board.reveal_cell(row, col);
                break;
            case 3:
                board.flag_cell(row, col);
                break;
        }
    })
}

Board.prototype.end_game = function () {
    stop_watch();
    $(".cell-closed").unbind('mousedown');
}

Board.prototype.reveal_cell = function (cell_row,cell_col) {
    var res = this.checkboard[cell_row][cell_col].reveal();
    switch(res) {
    case 2: 
        //GAME OVER
        $.each(this.checkboard, function(row) {
            $.each(this, function(col, val) {
                if(val.has_bomb) val.reveal(true);
                if(val.flagged) val.reveal(true);
            });
        });

        this.end_game();
    break;
    case 3:
        start_watch();
        var arr = [[ 1, 0],[ 0, 1],
                   [-1, 0],[ 0,-1],
                   [ 1, 1],[-1,-1],
                   [ 1,-1],[-1, 1]];

        //Cuento cuantas bombas hay alrededor
        var count = 0;

        for(var i = 0 ; i < arr.length ; i++) {
            var vec = arr[i];
            new_col = parseInt(cell_col) + arr[i][1];
            new_row = parseInt(cell_row) + arr[i][0];

            if(typeof this.checkboard[new_row] !== 'undefined' && 
               typeof this.checkboard[new_row][new_col] !== 'undefined' && 
               this.checkboard[new_row][new_col].has_bomb)
                count++;
        }

        //Si hay >= 1 lo muestro
        if(count != 0) 
            this.checkboard[cell_row][cell_col].set_text(count);

        //Si no, sigo la recursividad
        else
            for(var i = 0 ; i < arr.length ; i++) {
                new_col = parseInt(cell_col) + arr[i][1];
                new_row = parseInt(cell_row) + arr[i][0];

                if(typeof this.checkboard[new_row] !== 'undefined' && 
                   typeof this.checkboard[new_row][new_col] !== 'undefined' &&
                   !this.checkboard[new_row][new_col].revealed)
                    this.reveal_cell(new_row, new_col);
            };
    break;
    }

    //Me fijo si ya termino el juego
    var faltan = 0;
    $.each(this.checkboard, function(row) {
        $.each(this, function(col, val) {
            if(!val.has_bomb && !val.revealed) faltan++;
        });
    });
    if(faltan === 0)
        this.end_game();
}

Board.prototype.flag_cell = function (cell_row,cell_col) {
    var res = this.checkboard[cell_row][cell_col].flag();

    if(res) this.found ++ ;
    else    this.found -- ;
    this.update_found_div();

    return res;
}

Board.prototype.update_found_div = function (cell_row,cell_col) {
    $('#found').val(this.found + " / " + this.bombs);
}