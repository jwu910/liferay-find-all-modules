# Liferay Find All Modules
This project will find and list all osb-modules that contain build.gradle files to bring a more pleasant experience to module deployment.

## Installation
```
npm install --global liferay-find-all-modules
```

## Usage
```
fam -h
```
To get started.

`fam` can be excuted with or without arguments. Any arguments passed with the invocation of `fam` will be used as commands to execute against every located osb-module.

Example:
```
fam gradle clean deploy
```
Will prompt you to select any found osb-modules, and then run `gradle clean deploy` for each selected module.

## Contributing
Please feel free to file an issue or send a PR. I'm always looking to make our dev experience a little easier.

## Other projects
[Check It Out](https://github.com/jwu910/check-it-out) - Easily see and checkout your git branches
