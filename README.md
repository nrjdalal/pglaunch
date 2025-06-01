# PGLaunch

**Generate multiple PostgreSQL connection strings/databases using CLI for development environments!**

📦 `Zero Config` / `Lightweight` / `Easy-to-Use` CLI for spinning up disposable PostgreSQL containers

[![Twitter](https://img.shields.io/twitter/follow/nrjdalal_com?label=%40nrjdalal_com)](https://twitter.com/nrjdalal_com)
[![npm](https://img.shields.io/npm/v/pglaunch?color=red&logo=npm)](https://www.npmjs.com/package/pglaunch)
[![downloads](https://img.shields.io/npm/dt/pglaunch?color=red&logo=npm)](https://www.npmjs.com/package/pglaunch)
[![stars](https://img.shields.io/github/stars/nrjdalal/pglaunch?color=blue)](https://github.com/nrjdalal/pglaunch)

> #### Instantly launch a disposable PostgreSQL container with a unique database and connection URL - no Docker expertise required.

<img width="800" alt="PGLaunch Demo" src="https://github.com/user-attachments/assets/3043465b-6270-4a6a-824b-fa8c541712ca" />

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
# Keep the container (container are removed on exit/system-restart by default)
npx pglaunch -k
# Confirm launching a second container with the same base name
npx pglaunch -n my-project -c
# View help message
npx pglaunch -v
# View version
npx pglaunch -h
```

---

## ✨ Features

- 🐳 **One-command PostgreSQL**: Spins up an isolated `postgres:alpine` Docker container with sensible defaults.
- 🔗 **Auto-generated connection URL**: Prints a POSTGRES connection URL (e.g. `POSTGRES_URL=postgres://postgres:postgres@localhost:5432/postgres`) so you can plug directly into your app or app's .envs.
- 🎲 **Random port allocation**: If you don’t specify `-p`, PGLaunch finds an available port for you.
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
-k, --keep         Keep the container after exit
                  (default: false)
-c, --confirm      Confirm starting another container with the same name
-v, --version      Display version
-h, --help         Display help
```

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
