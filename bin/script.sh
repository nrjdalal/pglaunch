#!/bin/zsh
mkdir -p ~/.pglaunch

if [[ "$SHELL" == "/bin/zsh" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.zsh | cat >~/.pglaunch/fx.zsh
  grep "source ~/.pglaunch/fx.zsh" ~/.zshrc &>/dev/null || echo "source ~/.pglaunch/fx.zsh" >>~/.zshrc

  exec zsh
fi

if [[ "$SHELL" == "/bin/bash" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.bash | cat >~/.pglaunch/fx.bash
  grep "source ~/.pglaunch/fx.bash" ~/.bashrc &>/dev/null || echo "source ~/.pglaunch/fx.bash" >>~/.bashrc

  exec bash
fi

echo "Unsupported shell: $SHELL"
