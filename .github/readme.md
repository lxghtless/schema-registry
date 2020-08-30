<h3 align="center">
	Lxghtless Schema Registry
</h3>

<p align="center">
	A CP-like Schema Registry that doesn't use Kafka for storage.
</p>

<p align="center">
	<i>Currently in an experimental state.</i>
</p>

<p align="center">
	<a href="https://www.typescriptlang.org/">
		<img src="https://aleen42.github.io/badges/src/typescript.svg" />
	</a>
	<a href="https://eslint.org/">
		<img src="https://aleen42.github.io/badges/src/eslint.svg" />
	</a>
	<a href="https://nodejs.org/">
		<img src="https://aleen42.github.io/badges/src/node.svg" />
	</a>
	<a href="https://www.docker.com/">
		<img src="https://aleen42.github.io/badges/src/docker.svg" />
	</a>
</p>

## Docker

Build Container

```console
$ docker build -t lxghtless/schema-registry:latest .
```

Run Container

```console
$ docker run -d --name lxghtless-schema-registry -p 8081:8081 lxghtless/schema-registry:latest
```

## Development

Install dependencies

```console
$ yarn
```

Lint (fix)

```console
$ yarn lint
```

Run Knex.js Migrations

```console
$ yarn migrate
```

Build

```console
$ yarn build
```

Run (local development)

```console
$ yarn dev
```

## TODO

- Add `/config` routes.
- Make `knex` client & options configurable.
- Expand and improve compatibility modes.
- Tests.