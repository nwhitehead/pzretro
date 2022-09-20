var old_redraw = redraw;
redraw = function() {
    old_redraw();
    native_screen_fill(state.bgcolor);
    native_sprite_render(canvas.context.nativeId);
    native_flip();
};
consolePrint = console.log;
verbose_logging = true;
canYoutube = false;

var title_suffix = [
    "..................................",
    ".arrow keys to move.(D-Pad).......",
    ".X to action........(A button)....",
    ".Z to undo..........(Y button)....",
    ".R to restart.......(START button)"];

var titletemplate_firstgo = [
    "..................................",
    "..................................",
    "..................................",
    "..................................",
    "..................................",
    "..................................",
    "..........#.start game.#..........",
    ".................................."].concat(title_suffix);

var titletemplate_firstgo_selected = [
    "..................................",
    "..................................",
    "..................................",
    "..................................",
    "..................................",
    "..................................",
    "###########.start game.###########",
    ".................................."].concat(title_suffix);

var titletemplate_select0 = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"...........#.new game.#...........",
	"..................................",
	".............continue............."].concat(title_suffix);

var titletemplate_select1 = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".............new game.............",
	"..................................",
	"...........#.continue.#..........."].concat(title_suffix);

var titletemplate_select0_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"############.new game.############",
	"..................................",
	".............continue............."].concat(title_suffix);

var titletemplate_select1_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".............new game.............",
	"..................................",
	"############.continue.############"].concat(title_suffix);

function generateTitleScreen()
{
    titleMode=showContinueOptionOnTitleScreen()?1:0;

    if (state.levels.length===0) {
        titleImage=intro_template;
        return;
    }

    var title = "PuzzleScript Game";
    if (state.metadata.title!==undefined) {
        title=state.metadata.title;
    }

    if (titleMode===0) {
        if (titleSelected) {
            titleImage = deepClone(titletemplate_firstgo_selected);		
        } else {
            titleImage = deepClone(titletemplate_firstgo);					
        }
    } else {
        if (titleSelection===0) {
            if (titleSelected) {
                titleImage = deepClone(titletemplate_select0_selected);		
            } else {
                titleImage = deepClone(titletemplate_select0);					
            }			
        } else {
            if (titleSelected) {
                titleImage = deepClone(titletemplate_select1_selected);		
            } else {
                titleImage = deepClone(titletemplate_select1);					
            }						
        }
    }

    var noAction = 'noaction' in state.metadata;	
    var noUndo = 'noundo' in state.metadata;
    var noRestart = 'norestart' in state.metadata;
    if (noAction) {
        titleImage[10] = ".X to select........(A button)....";
    }
    if (noUndo) {
        titleImage[11] = "..................................";
    }
    if (noRestart) {
        titleImage[12] = "..................................";
    }
    for (var i=0;i<titleImage.length;i++)
    {
        titleImage[i]=titleImage[i].replace(/\./g, ' ');
    }

    var width = titleImage[0].length;
    var titlelines=wordwrap(title,titleImage[0].length);
    if (state.metadata.author!==undefined){
        if ( titlelines.length>3){
            titlelines.splice(3);
            logWarning("Game title is too long to fit on screen, truncating to three lines.",state.metadata_lines.title,true);
        }
    } else {
        if ( titlelines.length>5){
            titlelines.splice(5);
            logWarning("Game title is too long to fit on screen, truncating to five lines.",state.metadata_lines.title,true);
        }

    }
    for (var i=0;i<titlelines.length;i++) {
        var titleline=titlelines[i];
        var titleLength=titleline.length;
        var lmargin = ((width-titleLength)/2)|0;
        var rmargin = width-titleLength-lmargin;
        var row = titleImage[1+i];
        titleImage[1+i]=row.slice(0,lmargin)+titleline+row.slice(lmargin+titleline.length);
    }
    if (state.metadata.author!==undefined) {
        var attribution="by "+state.metadata.author;
        var attributionsplit = wordwrap(attribution,titleImage[0].length);
        if (attributionsplit[0].length<titleImage[0].length){
            attributionsplit[0]=" "+attributionsplit[0];
        }
        if (attributionsplit.length>3){
            attributionsplit.splice(3);
            logWarning("Author list too long to fit on screen, truncating to three lines.",state.metadata_lines.author,true);
        }
        for (var i=0;i<attributionsplit.length;i++) {
            var line = attributionsplit[i]+" ";
            if (line.length>width){
                line=line.slice(0,width);
            }
            var row = titleImage[3+i];
            titleImage[3+i]=row.slice(0,width-line.length)+line;
        }
    }

}
    