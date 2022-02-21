/**
 * Picross, a picross/nonogram game for Sailfish
 *
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
 * Authors: Matti Viljanen
 */
import QtQuick 2.0
import Sailfish.Silica 1.0

Label {
    anchors.horizontalCenter: parent.horizontalCenter
    width: parent.width - 2*Theme.horizontalPageMargin
    horizontalAlignment: Text.AlignHCenter
    wrapMode: Text.Wrap
}
