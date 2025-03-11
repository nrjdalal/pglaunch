#!/bin/bash
mkdir -p ~/.pglaunch

if [[ "$SHELL" == "/bin/zsh" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.sh | cat >~/.pglaunch/fx.zsh
  grep "source ~/.pglaunch/fx.zsh" ~/.zshrc &>/dev/null || echo "source ~/.pglaunch/fx.zsh" >>~/.zshrc

  echo
  echo "pglaunch successfully installed!"
  echo -e "\e[36mPlease run 'pglaunch -h' to get started.\e[0m"
  echo
  exec zsh
  return 0
fi

if [[ "$SHELL" == "/bin/bash" ]]; then
  curl -s https://raw.githubusercontent.com/nrjdalal/pglaunch/master/bin/fx.sh | cat >~/.pglaunch/fx.bash
  grep "source ~/.pglaunch/fx.bash" ~/.bashrc &>/dev/null || echo "source ~/.pglaunch/fx.bash" >>~/.bashrc

  echo
  echo "pglaunch successfully installed!"
  echo "Please run 'pglaunch -h' to get started."
  echo
  exec bash
  return 0
fi

echo
echo "Unsupported shell: $SHELL!"
echo "Please use bash or zsh, addtionally you can manually source the fx.sh file from the repository."
echo "More shells to be supported soon."
echo
return 1
