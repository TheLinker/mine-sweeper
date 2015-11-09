var Cell = function (col,row,bomb) {
    this.revealed = false;
    this.flagged = false;
    this.has_bomb = bomb || false;
    this.classes = [];
    this.update_classes();

    this.col = col;
    this.row = row;
}

Cell.prototype.get_id = function(_prefix) {
    prefix = _prefix || "";
    return prefix + 'cell_' + this.col + '_' + this.row;
}

Cell.prototype.get_cell = function() {
    this.update_classes();

    return $('<td class="'+this.get_classes()+'">')
             .attr('id', this.get_id())
             .attr('data-col', this.col)
             .attr('data-row', this.row);
}

Cell.prototype.get_classes = function() {
    return this.classes.join(" ");
}

Cell.prototype.update_classes = function() {
    this.classes = ['cell'];

    if(this.revealed) {
        this.classes.push('cell-open');

        if(this.flagged) {
            if(this.has_bomb)
                this.classes.push('fa', 'fa-check');
            else
                this.classes.push('fa', 'fa-close');
        } else {
            if(this.has_bomb)
                this.classes.push('fa', 'fa-bomb');
        }

    } else {
        this.classes.push('cell-closed');

        if(this.flagged) this.classes.push('fa', 'fa-flag');
    }
}

Cell.prototype.reveal = function(force) {
    var make_force = force || false;

    if(this.revealed) return 1;


    if(!this.flagged || make_force) {
        this.revealed = true;
    } else return 1;

    this.update_cell();

    if(this.has_bomb) return 2;
    return 3;
}

Cell.prototype.flag = function(force) {
    if(!this.revealed)
        this.flagged = !this.flagged;

    this.update_cell();
    return this.flagged;
}

Cell.prototype.update_cell = function() {
    this.update_classes();

    $(this.get_id('#')).removeClass();
    $(this.get_id('#')).addClass(this.get_classes());
}

Cell.prototype.set_text = function(_text) {
    text = _text || "";

    if(!this.has_bomb && !this.flagged)
        $(this.get_id('#')).html(text);

    return true;
}