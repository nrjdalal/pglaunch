# PGLaunch

**Generate multiple PostgreSQL connection strings/databases using CLI for development environments!**

📦 `Zero Config` / `Lightweight` / `Easy-to-Use` CLI for spinning up disposable PostgreSQL containers

[![Twitter](https://img.shields.io/twitter/follow/nrjdalal_com?label=%40nrjdalal_com)](https://twitter.com/nrjdalal_com)
[![npm](https://img.shields.io/npm/v/pglaunch?color=red&logo=npm)](https://www.npmjs.com/package/pglaunch)
[![downloads](https://img.shields.io/npm/dt/pglaunch?color=red&logo=npm)](https://www.npmjs.com/package/pglaunch)
[![stars](https://img.shields.io/github/stars/nrjdalal/pglaunch?color=blue)](https://github.com/nrjdalal/pglaunch)

> #### Instantly launch a disposable lightweight PostgreSQL container with a unique database and connection URL - no Docker expertise required.

<img width="800" alt="PGLaunch Demo" src="https://github.com/user-attachments/assets/3043465b-6270-4a6a-824b-fa8c541712ca" />

<!-- prettier-ignore -->
> [!IMPORTANT]
> **Behaviour change:** PGLaunch now publishes the database on `127.0.0.1`, so only this machine can reach it. Versions up to 5.5.7, and 5.6.0-canary.0, published on `0.0.0.0`, which put every database on your network. Pass `--host 0.0.0.0` to get the old behaviour back. See [Network Access](#-network-access).

---

## 📖 Some Examples

### See [Usage](#-usage) to learn more.

```sh
# Launch a Postgres container using the current directory name
npx pglaunch
# Specify a custom name (defaults to current directory name)
npx pglaunch -n my-project
# Specify a custom port (defaults to a random available port)
npx pglaunch -p 5433
# Expose the database to your network (defaults to 127.0.0.1, this machine only)
npx pglaunch --host 0.0.0.0
# Keep the container (container are removed on exit/system-restart by default)
npx pglaunch -k
# Confirm launching a second container with the same base name
npx pglaunch -n my-project -c
# View help message
npx pglaunch -h
# View version
npx pglaunch -v
```

---

## ✨ Features

- 🐳 **One-command PostgreSQL**: Spins up an isolated `postgres:alpine` Docker container with sensible defaults.
- 🔗 **Auto-generated connection URL**: Prints a POSTGRES connection URL so you can plug directly into your app or environments.
- 🎲 **Random port allocation**: If you don’t specify `-p`, PGLaunch finds an available port for you.
- 🔒 **Local by default**: The database is published on `127.0.0.1`, so other devices on your network can't reach it unless you pass `--host`.
- 🛡️ **Name collisions handled**: Detects existing containers with the same base name—warns you unless you use `-c` to confirm.
- ♻️ **Cleanup by default**: Containers are removed on exit/system-restart unless you pass `-k` (keep) to persist them.
- 🔍 **Docker sanity checks**: Verifies Docker is installed and running, with actionable error messages if something’s amiss.
- 🔐 **Minimal configuration**: All you need is Docker; no extra files or environment variables required.

---

## 🚀 Usage

```sh
npx pglaunch [options]
```

- `[options]` are optional, if not specified, PGLaunch will use sensible defaults based on the current directory name and a random available port.

```
-n, --name <name>  Name for PostgresSQL database
                  (default: current directory name)
-p, --port <port>  Port for PostgresSQL database
                  (default: random available port)
    --host <addr>  Host address to publish the port on
                  (default: 127.0.0.1, this machine only;
                  use 0.0.0.0 to expose it to your network)
-k, --keep         Keep the container after exit
                  (default: false)
-c, --confirm      Confirm starting another container with the same name
-v, --version      Display version
-h, --help         Display help
```

---

## 🔒 Network Access

PGLaunch publishes the container's port on `127.0.0.1` by default, so the database is reachable from this machine only. Use `--host <addr>` to publish it on another address:

```sh
# Default: this machine only
npx pglaunch
# Every interface, so any device on your network can connect
npx pglaunch --host 0.0.0.0
# A single interface, e.g. your LAN address
npx pglaunch --host 192.168.1.20
```

`--host` takes an IP address (IPv4 or IPv6), not a hostname. The printed `POSTGRES_URL` points at the address the database is published on: `127.0.0.1` for `0.0.0.0`, `[::1]` for `::`, and the address itself otherwise. For any address other than loopback PGLaunch prints a warning, since every database it starts uses the default `postgres`/`postgres` credentials.

You also need `--host` when the client is not on this machine's loopback, for example:

- on Linux, an app in another container that reaches the host through its gateway (`host.docker.internal` mapped to `host-gateway`)
- a remote Docker daemon (`DOCKER_HOST`), where `127.0.0.1` is the remote machine's loopback

> **Behaviour change:** versions up to 5.5.7, and 5.6.0-canary.0, published on `0.0.0.0` and printed `localhost` in `POSTGRES_URL`. The URL now names `127.0.0.1`, since the database no longer listens on IPv6 (`::1`), which `localhost` can resolve to first.

---

## 🐋 Docker Requirements

- **Docker CLI**: PGLaunch runs `docker --version` to ensure Docker is installed.
- **Docker Daemon**: PGLaunch runs `docker info` under the hood—if the daemon isn’t running, you’ll see a prompt to start it.

If Docker is missing or not running, PGLaunch will print an error like:

```txt
- Docker is not installed. Please install Docker and try again.
  Download it here: https://docs.docker.com/desktop

- Docker is installed but not running.
  Please start the Docker application/daemon and try again.
```

---

## 📦 Install Globally (Optional)

```sh
npm install -g pglaunch
pglaunch [options]
```

---

## 🔗 More Tools

Check out more projects at [github.com/nrjdalal](https://github.com/nrjdalal)

---

## 📄 License

MIT – [LICENSE](https://github.com/nrjdalal/pglaunch/blob/main/LICENSE)
