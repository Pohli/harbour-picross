/**
 * Picross, a picross/nonogram game for Sailfish
 *
 * Copyright (C) 2015-2018 Bastien Laine
 * Copyright (C) 2019-2022 Matti Viljanen
 *
 * Picross is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Picross is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the GNU General Public License for more details. You should have received a copy of the GNU
 * General Public License along with Picross. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.
 *
 * Authors: Bastien Laine, Matti Viljanen
 */
.import "DB.js" as DB

function initVoid(){
    game.guessMode=false
    game.mySolvingGrid.clear()
    game.nbSolvingFullCell=0
    for(var i=0; i<game.cellCount; i++)
        game.mySolvingGrid.append({"myEstate":"void"})

    for(i=0; i<game.gridSize; i++){
        checkLineX(i)
        checkColX(i)
    }
}
function loadSave(save){
    game.guessMode=false
    game.mySolvingGrid.clear()
    game.nbSolvingFullCell=0
    for(var i=0; i<save.length; i++){
        game.mySolvingGrid.append({"myEstate":save[i]==="0"?"void":save[i]==="1"?"full":save[i]==="2"?"hint":save[i]==="3"?"guess_full":"guess_hint"})
        if(save[i]==="1")
            game.nbSolvingFullCell++

        if(save[i]==="3" || save[i]==="4")
            if(!game.guessMode)
                game.guessMode=true
    }
    for(i=0; i<game.gridSize; i++){
        checkLineX(i)
        checkColX(i)
    }
}


function save(){
    if(game.diff !== -1 && !game.won && !nothingDone()){
        DB.save(game.mySolvingGrid, game.diff, game.level)
        DB.setSavedTime(game.diff, game.level, game.time)
    }
}
function click(grid, x){
    var str=grid.get(x).myEstate
    if(game.guessMode){
        if(str!=="full" && str!=="hint")
            grid.set(x, {"myEstate":str==="guess_full"?"guess_hint":str==="guess_hint"?"void":"guess_full"})
    } else {
        if(str==="full")
            game.nbSolvingFullCell--
        else if (str==="void")
            game.nbSolvingFullCell++

        grid.set(x, {"myEstate":str==="full"?"hint":str==="hint"?"void":"full"})
    }

    checkLineX(Math.floor(x/game.gridSize))
    checkColX(x%game.gridSize)

    launchCheckWin()
}
function doubleClick(grid, x){
    if(!game.guessMode)
        grid.set(x, {"myEstate":"hint"})
    else
        grid.set(x, {"myEstate":"guess_hint"})

    checkLineX(Math.floor(x/game.gridSize))
    checkColX(x%game.gridSize)
}
function slideClick(grid, x, mode){
    var old=grid.get(x).myEstate
    if(game.guessMode){
        if(old!=="full" && old!=="hint")
            grid.set(x, {"myEstate":mode})
    } else {
        if(old!=="full" && mode==="full")
            game.nbSolvingFullCell++
        if(old==="full" && mode!=="full")
            game.nbSolvingFullCell--
        grid.set(x, {"myEstate":mode})
    }
    checkLineX(Math.floor(x/game.gridSize))
    checkColX(x%game.gridSize)
    launchCheckWin()
}

function genIndicLineXFilling(list, grid, x){
    list.clear()
    var cpt=0
    if(grid.count!==0){
        for(var coord=x*game.gridSize; coord<(x+1)*game.gridSize; coord++){
            if(grid.get(coord).myEstate !== "hint" && grid.get(coord).myEstate !== "guess_hint") {
                cpt++
            } else {
                if(cpt!=0)
                    list.append({"size":cpt})
                cpt=0
            }
        }
    }
    if(cpt!=0 || list.count===0)
        list.append({"size":cpt})
}
function genIndicColXFilling(list, grid, x){
    list.clear()
    var cpt=0
    if(grid.count!==0){
        for(var coord=x; coord<x+game.gridSize*(game.gridSize-1)+1; coord+=game.gridSize){
            if(grid.get(coord).myEstate !== "hint" && grid.get(coord).myEstate !== "guess_hint") {
                cpt++
            } else {
                if(cpt!=0)
                    list.append({"size":cpt})
                cpt=0
            }
        }
    }
    if(cpt!=0 || list.count===0)
        list.append({"size":cpt})

}
function genIndicLineX(list, grid, x){
    list.clear()
    var cpt=0
    if(grid.count!==0){
        for(var coord=x*game.gridSize; coord<(x+1)*game.gridSize; coord++){
            if(grid.get(coord).myEstate === "full" || grid.get(coord).myEstate === "guess_full") {
                cpt++
            } else {
                if(cpt!=0)
                    list.append({"size":cpt, "isOk":false})
                cpt=0
            }
        }
    }
    if(cpt!=0 || list.count===0)
        list.append({"size":cpt, "isOk":false})
}
function genIndicColX(list, grid, x){
    list.clear()
    var cpt=0
    if(grid.count!==0){
        for(var coord=x; coord<x+game.gridSize*(game.gridSize-1)+1; coord+=game.gridSize){
            if(grid.get(coord).myEstate === "full" || grid.get(coord).myEstate === "guess_full") {
                cpt++
            } else {
                if(cpt!=0)
                    list.append({"size":cpt, "isOk":false})
                cpt=0
            }
        }
    }
    if(cpt!=0 || list.count===0)
        list.append({"size":cpt, "isOk":false})

}
function genIndicLine(list, grid){
    list.clear()

    for(var i=0; i<game.gridSize; i++){
        var smallList = Qt.createQmlObject('import QtQuick 2.2; \
                        ListModel {}', parent)

        smallList.clear()
        genIndicLineX(smallList, grid, i)
        list.append({"loadedIndic":smallList, "completed":false, "toFill":false, "hasError":false})
    }
}
function genIndicCol(list, grid){
    list.clear()

    for(var i=0; i<game.gridSize; i++){
        var smallList = Qt.createQmlObject('import QtQuick 2.2; \
                        ListModel {}', parent)

        smallList.clear()
        genIndicColX(smallList, grid, i)
        list.append({"loadedIndic":smallList, "completed":false, "toFill":false, "hasError":false})
    }
}

function completeRowX(x, toFill){
    if(!toFill){
        for(var j=x*game.gridSize; j<(x+1)*game.gridSize; j++)
            if(game.mySolvingGrid.get(j).myEstate === "void")
                doubleClick(game.mySolvingGrid, j)
    }else{
        for(var k=x*game.gridSize; k<(x+1)*game.gridSize; k++)
            if(game.mySolvingGrid.get(k).myEstate === "void")
                click(game.mySolvingGrid, k)

    }
}
function completeColX(x, toFill){
    if(!toFill){
        for(var j=x; j<game.cellCount; j+=game.gridSize)
            if(game.mySolvingGrid.get(j).myEstate === "void")
                doubleClick(game.mySolvingGrid, j)
    }else{
        for(var k=x; k<game.cellCount; k+=game.gridSize)
            if(game.mySolvingGrid.get(k).myEstate === "void")
                click(game.mySolvingGrid, k)

    }

}

function specialCheckColX(x){
    var indics=game.indicUp.get(x).loadedIndic

    for(var j=0; j<indics.count ; j++)
        indics.setProperty(j, "isOk", false)






    var cpt=0
    var nbIndic=0
    var i=0
    var exit=false
    var lastOk=0

    while(i<game.gridSize && game.mySolvingGrid.get(x+game.gridSize*i).myEstate !== "void" && !exit){
        var state=game.mySolvingGrid.get(x+game.gridSize*i).myEstate
        if(state==="hint" || state==="guess_hint"){
            if(cpt!==0){
                if(cpt===indics.get(nbIndic).size){
                    indics.setProperty(nbIndic, "isOk", true)
                    nbIndic++
                    cpt=0
                    lastOk=i
                } else
                    exit=true
            }
        } else
            cpt++
        i++
    }

    cpt=0
    nbIndic=indics.count-1
    i=game.gridSize-1
    exit=false

    while(i>=lastOk && game.mySolvingGrid.get(x+game.gridSize*i).myEstate !== "void" && !exit){
        state=game.mySolvingGrid.get(x+game.gridSize*i).myEstate
        if(state==="hint" || state==="guess_hint"){
            if(cpt!==0){
                if(cpt===indics.get(nbIndic).size){
                    indics.setProperty(nbIndic, "isOk", true)
                    nbIndic--
                    cpt=0
                } else
                    exit=true
            }
        } else
            cpt++
        i--
    }
}
function specialCheckLineX(x){
    var indics=game.indicLeft.get(x).loadedIndic

    for(var j=0; j<indics.count ; j++)
        indics.setProperty(j, "isOk", false)

    var cpt=0
    var nbIndic=0
    var i=0
    var exit=false
    var lastOk=0

    while(i<game.gridSize && game.mySolvingGrid.get(x*game.gridSize+i).myEstate !== "void" && !exit){
        var state=game.mySolvingGrid.get(x*game.gridSize+i).myEstate
        if(state==="hint" || state==="guess_hint"){
            if(cpt!==0){
                if(cpt===indics.get(nbIndic).size){
                    indics.setProperty(nbIndic, "isOk", true)
                    nbIndic++
                    lastOk=i
                } else {
                    exit=true
                }
                cpt=0
            }
        } else
            cpt++
        i++
    }


    cpt=0
    nbIndic=indics.count-1
    i=game.gridSize-1
    exit=false

    while(i>=lastOk && game.mySolvingGrid.get(x*game.gridSize+i).myEstate !== "void" && !exit){
        state=game.mySolvingGrid.get(x*game.gridSize+i).myEstate
        if(state==="hint" || state==="guess_hint"){
            if(cpt!==0){
                if(cpt===indics.get(nbIndic).size){
                    indics.setProperty(nbIndic, "isOk", true)
                    nbIndic--
                } else
                    exit=true
                cpt=0
            }
        } else
            cpt++
        i--
    }
}

function checkColX(x){
    var indics=game.indicUp.get(x).loadedIndic
    var progress = Qt.createQmlObject('import QtQuick 2.2; \
                    ListModel {}', parent)
    genIndicColX(progress, game.mySolvingGrid, x)

    //Variables
    var completed=(progress.count===indics.count)
    var toFill=false
    var hasError=false

    //Check if we can fill with crosses (i.e. ours indicators correspond)
    for(var i=0; i<progress.count; i++)
        completed=completed&&(progress.get(i).size===indics.get(i).size)

    //If not, check if we can fill with full
    if(!completed){
        genIndicColXFilling(progress, game.mySolvingGrid, x)
        toFill=(progress.count===indics.count)
        for(i=0; i<progress.count; i++)
            toFill=toFill&&(progress.get(i).size===indics.get(i).size)
    }

    //Check if Col is full => error
    if(!completed && !toFill){
        hasError=true
        for(i=0; i<game.gridSize; i++)
            if(game.mySolvingGrid.get(x+game.gridSize*i).myEstate === "void")
                hasError=false
    }

    //Last case, special check
    if(!completed && !toFill && !hasError)
        specialCheckColX(x)

    game.indicUp.setProperty(x, "completed", completed)
    game.indicUp.setProperty(x, "toFill", toFill)
    game.indicUp.setProperty(x, "hasError", hasError)
}
function checkLineX(x){
    var indics=game.indicLeft.get(x).loadedIndic
    var progress = Qt.createQmlObject('import QtQuick 2.2; \
                    ListModel {}', parent)
    genIndicLineX(progress, game.mySolvingGrid, x)

    //Variables
    var completed=(progress.count===indics.count)
    var toFill=false
    var hasError=false

    //Check if we can fill with crosses (i.e. ours indicators correspond)
    for(var i=0; i<progress.count; i++)
        completed=completed&&(progress.get(i).size===indics.get(i).size)

    //If not, check if we can fill with full
    if(!completed){
        genIndicLineXFilling(progress, game.mySolvingGrid, x)
        toFill=(progress.count===indics.count)
        for(var j=0; j<progress.count; j++)
            toFill=toFill&&(progress.get(j).size===indics.get(j).size)
    }

    //Check if Line is full => error
    if(!completed && !toFill){
        hasError=true
        for(i=0; i<game.gridSize; i++)
            if(game.mySolvingGrid.get(x*game.gridSize+i).myEstate === "void")
                hasError=false
    }

    //Last case, special check
    if(!completed && !toFill && !hasError)
        specialCheckLineX(x)

    game.indicLeft.setProperty(x, "completed", completed)
    game.indicLeft.setProperty(x, "toFill", toFill)
    game.indicLeft.setProperty(x, "hasError", hasError)
}

function launchCheckWin(){
    if(game.nbSolvedFullCell===game.nbSolvingFullCell)
        game.checkWin()
}
function checkWin(){
    var check=true
    for(var i=0; i<game.solvedGrid.count; i++){
        if(check){
            if(game.solvedGrid.get(i).myEstate==="full" && game.mySolvingGrid.get(i).myEstate!=="full")
                check=false

            if(game.solvedGrid.get(i).myEstate==="void" && game.mySolvingGrid.get(i).myEstate==="full")
                check=false
        }
    }
    return check
}
function clear(){
    for(var i=0; i<game.mySolvingGrid.count; i++)
        game.mySolvingGrid.set(i, {"myEstate":"void"})

    for(i=0; i<game.gridSize; i++){
        checkLineX(i)
        checkColX(i)
    }
    game.nbSolvingFullCell=0
}
function nothingDone(){
    for(var i=0; i<game.mySolvingGrid.count; i++)
        if(game.mySolvingGrid.get(i).myEstate!=="void")
            return false
    return true
}
function noGuessDone(){
    for(var i=0; i<game.cellCount; i++)
        if(game.mySolvingGrid.get(i).myEstate==="guess_full" || game.mySolvingGrid.get(i).myEstate==="guess_hint")
            return false
    return true
}

function rejectGuesses(){
    for(var i=0; i<game.cellCount; i++){
        var state= game.mySolvingGrid.get(i).myEstate
        if(state==="guess_hint" || state==="guess_full")
            game.mySolvingGrid.setProperty(i, "myEstate", "void")
    }
    for(i=0; i<game.gridSize; i++){
        checkLineX(i)
        checkColX(i)
    }
}
function acceptGuesses(){
    for(var i=0; i<game.cellCount; i++){
        var state=game.mySolvingGrid.get(i).myEstate
        if(state==="guess_hint")
            game.mySolvingGrid.setProperty(i, "myEstate", "hint")
        if(state==="guess_full"){
            game.mySolvingGrid.setProperty(i, "myEstate", "full")
            game.nbSolvingFullCell++
        }
    }
    launchCheckWin()
}
