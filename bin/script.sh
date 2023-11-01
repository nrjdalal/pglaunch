#!/bin/bash
mkdir -p ~/.pglaunch

if [[ "$SHELL" == "/bin/zsh" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.sh | cat >~/.pglaunch/fx.zsh
  grep "source ~/.pglaunch/fx.zsh" ~/.zshrc &>/dev/null || echo "source ~/.pglaunch/fx.zsh" >>~/.zshrc

  echo "Please restart your shell to use pglaunch (e.g. exec zsh)"
fi

if [[ "$SHELL" == "/bin/bash" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.sh | cat >~/.pglaunch/fx.bash
  grep "source ~/.pglaunch/fx.bash" ~/.bashrc &>/dev/null || echo "source ~/.pglaunch/fx.bash" >>~/.bashrc

  exec "Please restart your shell to use pglaunch (e.g. exec bash)"
fi

echo "Unsupported shell: $SHELL"
echo "Please use bash or zsh, addtionally you can manually source the fx.sh file in this repo."
echo "More shells to be supported soon."
exit 1
