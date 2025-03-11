#!/bin/bash
mkdir -p ~/.pglaunch

if command -v pglaunch &>/dev/null; then
  echo "pglaunch is already installed!"
  echo "Please run 'pglaunch -h' to get started."
  return 0
fi

if [[ "$SHELL" == "/bin/zsh" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.sh | cat >~/.pglaunch/fx.zsh
  grep "source ~/.pglaunch/fx.zsh" ~/.zshrc &>/dev/null || echo "source ~/.pglaunch/fx.zsh" >>~/.zshrc

  echo "pglaunch successfully installed for zsh!"
  echo "Please run 'pglaunch -h' to get started."
  exec zsh
  return 0
fi

if [[ "$SHELL" == "/bin/bash" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.sh | cat >~/.pglaunch/fx.bash
  grep "source ~/.pglaunch/fx.bash" ~/.bashrc &>/dev/null || echo "source ~/.pglaunch/fx.bash" >>~/.bashrc

  echo "pglaunch successfully installed for bash!"
  echo "Please run 'pglaunch -h' to get started."
  exec bash
  return 0
fi

echo "Unsupported shell: $SHELL"
echo "Please use bash or zsh, addtionally you can manually source the fx.sh file in this repo."
echo "More shells to be supported soon."
return 1
