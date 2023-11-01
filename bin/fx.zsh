pglaunch() {
  echo

  # check if docker is installed
  which docker &>/dev/null || {
    tput setaf 1
    echo "Docker is not installed. Please install docker and try again."
    tput sgr0
    exit 1
  }

  # check if docker is running
  [[ $(docker info &>/dev/null)? -ne 0 ]] && {
    tput setaf 1
    echo "Docker is not running. Please start docker and try again."
    tput sgr0
    exit 1
  }

  name=""
  port=""

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
    # name for postgres container (default: current directory name)
    -n | --name)
      name="$2"
      if [[ -z "$name" ]]; then
        echo "-n or --name option requires an argument"
        exit 1
      fi
      shift 2
      ;;

    # port for postgres container (default: 5555)
    -p | --port)
      port="$2"
      if [[ -z "$port" ]]; then
        echo "-p or --port option requires an argument"
        exit 1
      fi
      shift 2
      ;;

    *)
      echo "Unknown option: $1"
      exit 1
      ;;
    esac
  done

  # set defaults if not provided
  [[ -z "$name" ]] && name="$(basename $(pwd))"
  [[ -z "$port" ]] && port="5555"

  name="$name-$(openssl rand -base64 3 | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 4)"
  port="$port"
  pguname="postgres"
  pgupass="$(openssl rand -base64 12 | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 12)"
  pgdname="postgres"

  # check if postgres container is already running
  existing=$(docker ps -a | grep 5432 | awk '{print $1}' | head -n 1)
  [[ -n "$existing" ]] && docker rm -f $existing &>/dev/null

  # run postgres container
  docker run --name $name -e POSTGRES_USER=$pguname -e POSTGRES_PASSWORD=$pgupass -e POSTGRES_DB=$pgdname -p $port:5432 -d --rm postgres:alpine &>/dev/null

  echo "POSTGRES_URL=$(tput setaf 14)postgresql://$pguname:$pgupass@localhost:$port/$pgdname$(tput sgr0)"
}
