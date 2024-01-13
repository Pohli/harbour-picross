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
import QtQuick 2.0
import Sailfish.Silica 1.0
import "../DB.js" as DB

Page{
    id: settingsPage
    RemorsePopup{ id: remorseSettings }
    SilicaFlickable{
        id: settingsFlickable
        VerticalScrollDecorator { flickable: settingsFlickable }
        anchors.fill:parent
        contentHeight: buttonResetSettings.y + buttonResetSettings.height + Theme.paddingLarge
        Column{
            id:settingsCol
            spacing: Theme.paddingMedium
            width: parent.width
            PageHeader{
                title: qsTr("Settings")
            }
            TextSwitch{
                checked: DB.getParameter("vibrate")!==0
                text: qsTr("Vibrate when press-and-hold")
                description: checked?qsTr("Enabled"):qsTr("Disabled")
                onClicked: {
                    DB.setParameter("vibrate", checked ? 1 : 0)
                    game.vibrate=checked
                }
            }
            TextSwitch{
                checked: DB.getParameter("zoomindic")!==0
                text: qsTr("Zoom on indicators")
                description: checked?qsTr("Enabled"):qsTr("Disabled")
                onClicked:{
                    DB.setParameter("zoomindic", checked ? 1 : 0)
                    game.zoomIndic=(checked ? 1 : 0)
                }
            }
            TextSwitch{
                checked: DB.getParameter("autoLoadSave")===1
                text: qsTr("Load saves by default")
                description: checked?qsTr("Saves will be loaded by default"):qsTr("Load them by a long press")
                onClicked: DB.setParameter("autoLoadSave", checked ? 1 : 0)
            }
            TextSwitch{
                checked: DB.getParameter("slideInteractive")===1
                text: qsTr("Swipe through difficulty")
                description: checked?qsTr("Swipe is enabled"):qsTr("Swipe disable. Click on a difficulty name to load it")
                onClicked: DB.setParameter("slideInteractive", checked ? 1 : 0)
            }
            TextSwitch {
                checked: DB.getParameter("showKeypad")===1
                text: qsTr("Show gamepad")
                description: qsTr("Use on-screen arrows, action button and cursor. It supports Bluetooth keyboards, too!")
                onClicked: {
                    DB.setParameter("showKeypad", checked ? 1 : 0)
                    game.showKeypad = checked ? 1 : 0
                }
            }

            Slider {
                id: slider
                width: parent.width
                label: qsTr("Space between separators")
                minimumValue: -1
                maximumValue: 10
                stepSize: 1
                value: DB.getParameter("space")
                valueText: value > -1 ? value : "Auto"
                onValueChanged: {
                    game.space = slider.value
                    DB.setParameter("space", slider.value)
                }
            }
            Button{
                anchors.horizontalCenter: parent.horizontalCenter
                text: qsTr("Clear all databases")
                onClicked:{
                    remorseSettings.execute(qsTr("Clearing all databases"), function(){
                        game.gState = "welcome"
                        game.clearData()
                        game.allLevelsCompleted = false
                        DB.destroyData()
                        DB.initialize()
                    })
                }
            }
            Button{
                anchors.horizontalCenter: parent.horizontalCenter
                text: qsTr("Clear only saves database")
                onClicked:{
                    remorseSettings.execute(qsTr("Clearing only saves database"), function(){
                        DB.destroySaves()
                        DB.initializeSaves()})
                }
            }
            Button{
                id: buttonResetSettings
                anchors.horizontalCenter: parent.horizontalCenter
                text: qsTr("Reset settings")
                onClicked:{
                    remorseSettings.execute(qsTr("Resetting settings"), function(){
                        DB.destroySettings()
                        game.loadSettings()
                        pageStack.pop()
                    })
                }
            }
        }
        Component.onDestruction:{
            game.pause=false
        }
    }
}
