# Change Log

All notable changes to the "vscode-handyllm" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.


## [0.2.1] - 2024-08-10

### Added

- highlight extra property keywords (`tool` and `array`) for convenience
- add `, * and _ to surrounding pairs


## [0.2.0] - 2024-07-05

### Changed

- Hide frontmatter end boundary when it is folded

### Fixed

- Wrap hprompt file name in quotes for run command.


## [0.1.4] - 2024-05-29

### Added

- Foldable frontmatter and messages


## [0.1.3] - 2024-05-22

### Added

- Frontmatter background highlight
- Message boundaries highlight

### Changed

- Rename `keyword.role` to `markup.heading` for themes in the wild to bold this scope

### Removed

- Remove `#` line comment


## [0.1.2] - 2024-05-20

### Added

- Highlighting extra properties of messages
- Parse special typed blocks as YAML
- MIT License

### Removed

- Remove comment highlight to properly highlight completions prompt


## [0.1.1] - 2024-05-05

### Changed

- Update command category and title


## [0.1.0] - 2024-05-05

### Added

- Run hprompt command as menu action, context menu command or command palette command, with keybinding
- Configuration for handyllm command name
- Create hprompt command
- New files use a starter template
- Default turn on word wrap


## [0.0.1] - 2024-04-29

### Added

Basic syntax highlighting for hprompt files:
- Parse each content block as a markdown
- Support embedded languages in markdown
- Use `#` as single line comment
- Injection to highlight %...% variables
- No bracket color

