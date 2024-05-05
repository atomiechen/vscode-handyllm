# HandyLLM in Visual Studio Code

[![vsmarketplace](https://vsmarketplacebadges.dev/version-short/atomiechen.handyllm.svg)](https://marketplace.visualstudio.com/items?itemName=atomiechen.handyllm) [![PyPI](https://img.shields.io/pypi/v/HandyLLM?logo=pypi&logoColor=white)](https://pypi.org/project/HandyLLM/)

VS Code extension for [HandyLLM](https://github.com/atomiechen/HandyLLM) (>= 0.7.0).

## Features

### Hprompt syntax highlight

See demo below:

![example screenshot](https://raw.githubusercontent.com/atomiechen/vscode-handyllm/main/assets/demo/example.jpg)

### Run hprompt file

- Run the active hprompt file from the action button, or right click an `.hprompt` file, or issue from the command palette `Run Hprompt` (keyboard shortcut configured).
- You can change `handyllm` command used in the terminal by setting `handyllm.commandName` (needs installation of [HandyLLM CLI](https://github.com/atomiechen/HandyLLM)). 

See gif below:

![run hprompt](https://raw.githubusercontent.com/atomiechen/vscode-handyllm/main/assets/demo/run.gif)

### Create starter hprompt file

Issue from command palette `New Hprompt File`, or `New File` and then select `Hprompt File`.

See gif below:

![create hprompt](https://raw.githubusercontent.com/atomiechen/vscode-handyllm/main/assets/demo/create.gif)
