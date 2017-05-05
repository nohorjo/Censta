/**
 * Prevent text selection
 */
document.onselectstart = function () { return false; }

/**
 * Custom context menu
 */
function contextMenu() {
}

function init() {
    //Prevent default context menu
    if (document.addEventListener) {
        document.addEventListener('contextmenu', function (e) { contextMenu(); e.preventDefault(); }, false);
    } else {
        document.attachEvent('oncontextmenu', function () { contextMenu(); window.event.returnValue = false; });
    }

    $("#transDate").datepicker();
}

/**
 * Needed for Trident
 */
setTimeout(init, 1000);

function alertHi(){
    alert('hi');
}