#!/bin/zsh
mkdir -p ~/.pglaunch

curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.zsh | cat >~/.pglaunch/fx.zsh
grep "source ~/.pglaunch/fx.zsh" ~/.zshrc &>/dev/null || echo "source ~/.pglaunch/fx.zsh" >>~/.zshrc
