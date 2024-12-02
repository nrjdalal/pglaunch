# [pglaunch - PostgreSQL/Redis Database Launcher](https://www.npmjs.com/package/pglaunch)

pglaunch is a simple script to launch a PostgreSQL or Redis docker container. It can be used to quickly launch a database for testing or development purposes.

> Options are available to keep the container running after the script exits and to specify the name and port of the container.

```
pglaunch [options]

Options:
  -h, --help               show this help message
  -v, --version            show version number
  -k, --keep               keep container after restart or exit
  -n, --name <name>        name for docker container
                           (default: current directory name)
  -p, --port <port>        port for service container
                           (default: 5555 for postgres, 6379 for redis)
  -s, --service <service>  service to launch (default: postgres, options: postgres, redis)
```

Star this project on [GitHub](https://github.com/nrjdalal/pglaunch#readme) if you find it useful.

## Installation

```
npx pglaunch
```

Other package managers are also supported.

Current implemented for bash/zsh shell.

## Examples

1. Launch a PostgreSQL container with the default name and port:

```
pglaunch
```

> POSTGRES_URL=<span style="color: cyan">postgresql://postgres:895UhteoUadR@localhost:5555/postgres</span>

2. Launch a PostgreSQL container with a custom name and port:

```
pglaunch -n awesome-project -p 5432 && docker ps --format "table {{.Names}}"
```

> POSTGRES_URL=<span style="color: cyan">postgresql://postgres:895UhteoUadR@localhost:<span style="color: orange">5432</span>/postgres</span><br/><br/>NAMES<br/><span style="color: orange">awesome-project-y6zT</span>

3. Launch a PostgreSQL container and keep it running after the script exits:

```
pglaunch -k
```

> POSTGRES_URL=<span style="color: cyan">postgresql://postgres:895UhteoUadR@localhost:5555/postgres</span>

4. Launch a PostgreSQL container with a custom name and port and keep it running after the script exits:

```
pglaunch -n awesome-project -p 5432 -k && docker ps --format "table {{.Names}}"
```

> POSTGRES_URL=<span style="color: cyan">postgresql://postgres:895UhteoUadR@localhost:<span style="color: orange">5432</span>/postgres</span><br/><br/>NAMES<br/><span style="color: orange">awesome-project-y6zT</span>

> Similar examples can be used for Redis. Just add the `-s redis` option.

## License

MIT
