# HandyLLM in Visual Studio Code

[![vsmarketplace](https://vsmarketplacebadges.dev/version-short/atomiechen.handyllm.svg)][vsmarketplace]
[![Open VSX Version](https://img.shields.io/open-vsx/v/atomiechen/handyllm)][openvsx]
[![PyPI](https://img.shields.io/pypi/v/HandyLLM?logo=pypi&logoColor=white)][pypi]

Make [HandyLLM][handyllm-github] and `hprompt` a breeze in VS Code (and compatible editors).


## Features

### Hprompt syntax highlight

See demo below:

![example screenshot](https://raw.githubusercontent.com/atomiechen/vscode-handyllm/main/demo/example.png)

- Also highlights `hprompt` / `hpr` fenced code blocks in both **Markdown editor** and **Markdown Preview**. 

### Run hprompt file

- Run the active hprompt file from the action button, or right click an `.hprompt` file, or issue from the command palette `Run Hprompt` (keyboard shortcut configured).
- You can change `handyllm` command used in the terminal by setting `handyllm.commandName` (needs installation of [HandyLLM CLI](https://github.com/atomiechen/HandyLLM)). 

See gif below:

![run hprompt](https://raw.githubusercontent.com/atomiechen/vscode-handyllm/main/demo/run.gif)

### Create starter hprompt file

Issue from command palette `New Hprompt File`, or `New File` and then select `Hprompt File`.

See gif below:

![create hprompt](https://raw.githubusercontent.com/atomiechen/vscode-handyllm/main/demo/create.gif)

### Other Useful Enhancements

- **Editor decorations** for Hprompt frontmatter and role lines. You can customize their appearance via settings.
- **Foldable & sticky-scroll headings** for easier navigation.
- **Snippets** for relatively complex Hprompt constructs.
- **Frontmatter YAML validation** with real-time feedback. Requires installation of the [YAML extension][yaml] and proper schema configuration (see next section).


## Frontmatter Validation Setup

Follow these steps to enable YAML validation for Hprompt frontmatter.

- Install the [Red Hat YAML extension][yaml].
- Configure a schema for `*.hprompt.yaml` (hprompt frontmatter virtual documents) by adding the following to your `settings.json`:
	```json
	{
		"yaml.schemas": {
			"https://raw.githubusercontent.com/atomiechen/HandyLLM/main/assets/hprompt-fm.schema.json": "*.hprompt.yaml"
		}
	}
	```
	You can also download the [schema file](https://raw.githubusercontent.com/atomiechen/HandyLLM/main/assets/hprompt-fm.schema.json) and reference it locally if preferred.

Once configured, the frontmatter area supports schema-based hovers and completions while you type.


[handyllm-github]: https://github.com/atomiechen/HandyLLM
[vsmarketplace]: https://marketplace.visualstudio.com/items?itemName=atomiechen.handyllm
[openvsx]: https://open-vsx.org/extension/atomiechen/handyllm
[pypi]: https://pypi.org/project/HandyLLM/
[yaml]: https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml
