#!/bin/bash

mkdir ~/.config/premid/

cd ~/.config/premid/

wget https://github.com/PreMiD/Linux/releases/latest/download/PreMiD-Portable.AppImage && chmod a+x PreMiD*.AppImage

./PreMiD*.AppImage

echo "PreMiD has been started"

echo "Setting up autostart for PreMiD"

wget https://raw.githubusercontent.com/PreMiD/Linux/master/src/util/premid.service -O ~/.config/systemd/user/premid.service

systemctl enable --user premid.service

echo "Successfully installed and setup autostart for PreMiD"