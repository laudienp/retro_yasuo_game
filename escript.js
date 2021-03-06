
var width;
var height;
var selectedBlock;

var block = ["resources/editor/void.png", "resources/editor/grassy_dirt.png", "resources/editor/dirt.png", "resources/editor/cave_dirt.png", "resources/editor/sona_block.png"];
var spawn = "resources/editor/spawn.png";
var exit = "resources/editor/exit.png";
var poro = "resources/editor/poro_editor.png";
var poroVolant = "resources/editor/poroVolant_editor.png";

var imgDiv = document.getElementById("palette");

for(var i = 0; i < block.length;i++)
{
    imgDiv.innerHTML += "<img src='"+block[i]+"' width='64' height='64' onclick=selectBlock('"+i+"')>";
}

imgDiv.innerHTML += "<br><img src='"+spawn+"' width='64' height='64' onclick=selectBlock('x')>";
imgDiv.innerHTML += "<img src='"+exit+"' width='64' height='64' onclick=selectBlock('e')>";
imgDiv.innerHTML += "<img src='"+poro+"' width='64' height='64' onclick=selectBlock('p')>";
imgDiv.innerHTML += "<img src='"+poroVolant+"' width='64' height='64' onclick=selectBlock('v')>";

var selectInfoTxt = document.getElementById("selectionInfo");


function generate()
{
    width = document.getElementById("map_width").value;
    height = document.getElementById("map_height").value;

    var tab = document.getElementById("tab");

    var htmlTab = "<table>";

    for(var y = 0;y<height;y++)
    {
        htmlTab += "<tr>";
        for(var x = 0; x < width; x++)
        {
            var id = x + "-" + y;
            var onclick = "updateBlock('"+ id+ "')";
            htmlTab += "<td id="+ id + " onclick=" + onclick +"><img id='img"+id+"' src='"+block[0]+"' width='64' height='64'></td>";
        }
        htmlTab += "</tr>";
    }

    htmlTab += "</table>";

    tab.innerHTML = htmlTab;
    
    document.getElementById("converterButton").hidden = false; //draw the export button
}

function selectBlock(select)
{
    selectedBlock = select;
    selectInfoTxt.innerHTML = "selected block " + select; 
}

function updateBlock(id)
{
    var index = block[selectedBlock];
    if(selectedBlock == "x")
        index = spawn;
    if(selectedBlock == "e")
        index = exit;
    if(selectedBlock == "p")
        index = poro;
    if(selectedBlock == "v")
        index = poroVolant;
    document.getElementById(id).innerHTML = "<img id='img"+id+"' src='"+ index +"' width='64' height='64'>";
}

function convertMap()
{
    var output= "";
    for(var y=0; y<height;y++)
    {
        output += "\"";
        for(var x=0; x<width;x++)
        {
            var imgsrc = document.getElementById("img"+x+"-"+y).src;

            if(imgsrc.includes(spawn))
                output += "x ";
            else if(imgsrc.includes(exit))
                output += "e ";
            else if(imgsrc.includes(poro))
                output += "p ";
            else if(imgsrc.includes(poroVolant))
                output += "v ";

            else
            {
                for(var i=0; i<block.length;i++)
                {
                    if(imgsrc.includes(block[i]))
                    {
                        output += i +" ";
                    }
                }
            }
        }
        if(y!=height-1)
            output += "\\n\" + \n";
        else
            output += "\"\n";
    }

    console.log(output);
    var out = document.getElementById("output");
    out.innerHTML = output;
    out.select();

    document.execCommand("copy");
    var elem = document.getElementById("hide");

    if(elem != null)
        elem.id = "fadeOutAnim";
    else
    {
        elem = document.getElementById("fadeOutAnim");
        var newo = elem.cloneNode(true);
        elem.parentNode.replaceChild(newo, elem);
    }
}

function loadMap()
{
    var stringdata = document.getElementById("maploader");
    
    var stringLevel = stringdata.value;
    var plusexplode = stringLevel.split("+");

    for(var i = 0;i<plusexplode.length;i++)
    {
        var firstIndex = plusexplode[i].indexOf("\"")+1;
        var lastIndex = plusexplode[i].lastIndexOf("\"")-3;
        if(i == plusexplode.length-1)
            lastIndex = plusexplode[i].lastIndexOf("\"")-1;
        var result = plusexplode[i].substring(firstIndex, lastIndex);
        plusexplode[i] = result;
    }

    console.log(plusexplode);
    width = plusexplode[0].split(' ').length;
    height = plusexplode.length;

    console.log(width + " " + height);

    var tablehtml = "<table>";

    for(var y = 0; y < height; y++)
    {
        var substring = plusexplode[y].split(' ');

        tablehtml += "<tr>";
        for(var x = 0; x < width; x++)
        {
            var elem = substring[x];

            var index;
            if(elem == "x")
                index = spawn;
            else if(elem == "e")
                index = exit;
            else if(elem == "p")
                index = poro;
            else if(elem == "v")
                index = poroVolant;
            else
                index = block[elem];

                console.log(index);
                var id = x + "-" + y;
                var onclick = "updateBlock('"+ id+ "')";
                tablehtml += "<td id="+ id + " onclick=" + onclick +"><img id='img"+id+"' src='"+index+"' width='64' height='64'></td>";
        }
        tablehtml += "</tr>";
    }

    tablehtml += "</table>";

    document.getElementById("tab").innerHTML = tablehtml;

    stringdata.value = "";
    document.getElementById("converterButton").hidden = false; //draw the export button
}

    