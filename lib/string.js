/*
*   string.js
*   String class extension
*/

String.prototype.cutInRows = function(maxCharsByRow,maxTotalChars){
    var cntChars=0;
    var words = this.split(' ');
    var row = "";
    var rows = [];
    var totalChars = 0;
    for (var i=0;i<words.length;i++){
        totalChars+=words[i].length+1;
        if (totalChars>maxTotalChars)
            break; // stop adding chars
        if ((cntChars + words[i].length + 1) > maxCharsByRow){
            rows.push(row);
            row = words[i];
            cntChars = row.length;
        }
        else{
            if (row != "")
                row+=" ";
            row += words[i];
            cntChars += words[i].length;
        }
    }
    rows.push(row);
    return rows;
}