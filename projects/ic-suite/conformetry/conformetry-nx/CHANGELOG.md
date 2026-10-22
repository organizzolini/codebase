## 0.0.48 (2026-10-22)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.47
- Updated conformetry-generation to 0.0.47
- Updated conformetry-validation to 0.0.46
- Updated conformetry-output to 0.0.46

## 0.0.47 (2026-10-21)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.46
- Updated conformetry-generation to 0.0.46
- Updated conformetry-validation to 0.0.45
- Updated conformetry-output to 0.0.45

## 0.0.46 (2026-10-20)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.45
- Updated conformetry-generation to 0.0.45
- Updated conformetry-validation to 0.0.44
- Updated conformetry-output to 0.0.44

## 0.0.45 (2026-10-20)

### 💅 Refactors

- **configuration:** ♻️ relocate internal projects and rename shared packages ([#1708](https://github.com/organizzolini/codebase/pull/1708))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.44
- Updated conformetry-generation to 0.0.44
- Updated conformetry-validation to 0.0.43
- Updated conformetry-output to 0.0.43

## 0.0.44 (2026-10-20)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.43
- Updated conformetry-generation to 0.0.43
- Updated conformetry-validation to 0.0.42
- Updated conformetry-output to 0.0.42

## 0.0.43 (2026-10-18)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.42
- Updated conformetry-generation to 0.0.42
- Updated conformetry-validation to 0.0.41
- Updated conformetry-output to 0.0.41

## 0.0.42 (2026-10-18)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.41
- Updated conformetry-generation to 0.0.41
- Updated conformetry-validation to 0.0.40
- Updated conformetry-output to 0.0.40

## 0.0.41 (2026-10-18)

### 🚀 Features

- **conformetry:** ✨ run configured generator hooks from the Nx plugin ([#1697](https://github.com/organizzolini/codebase/pull/1697), [#1683](https://github.com/organizzolini/codebase/issues/1683), [#1684](https://github.com/organizzolini/codebase/issues/1684), [#1685](https://github.com/organizzolini/codebase/issues/1685))
- ⚠️  **conformetry:** ✨ expose the filesystem and configuration directory to hooks ([#1695](https://github.com/organizzolini/codebase/pull/1695), [#1679](https://github.com/organizzolini/codebase/issues/1679))

### ⚠️  Breaking Changes

- **conformetry:** ✨ expose the filesystem and configuration directory to hooks  ([#1695](https://github.com/organizzolini/codebase/pull/1695), [#1679](https://github.com/organizzolini/codebase/issues/1679))
  `GenerationService.runGenerator` in the published
  `@conformetry/generation` now requires `configurationDirectoryPath`, so
  an embedder calling it must pass the absolute directory of its
  configuration file; the title carries `!` so the squash releases it as
  such.
  - This is stacked on #1693.

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.40
- Updated conformetry-generation to 0.0.40
- Updated conformetry-validation to 0.0.39
- Updated conformetry-output to 0.0.39

## 0.0.40 (2026-10-18)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.39
- Updated conformetry-generation to 0.0.39
- Updated conformetry-validation to 0.0.38
- Updated conformetry-output to 0.0.38

## 0.0.39 (2026-10-18)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.38
- Updated conformetry-generation to 0.0.38
- Updated conformetry-validation to 0.0.37
- Updated conformetry-output to 0.0.37

## 0.0.38 (2026-10-18)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.37
- Updated conformetry-generation to 0.0.37
- Updated conformetry-validation to 0.0.36
- Updated conformetry-output to 0.0.36

## 0.0.37 (2026-10-18)

### 🚀 Features

- **conformetry,configuration,caelundas,lexico,meanderaw,callidescope:** ✨ place generators by instances ([#1670](https://github.com/organizzolini/codebase/pull/1670))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.36
- Updated conformetry-generation to 0.0.36
- Updated conformetry-validation to 0.0.35
- Updated conformetry-output to 0.0.35

## 0.0.36 (2026-10-16)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.35
- Updated conformetry-generation to 0.0.35
- Updated conformetry-validation to 0.0.34
- Updated conformetry-output to 0.0.34

## 0.0.35 (2026-10-16)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.34
- Updated conformetry-generation to 0.0.34
- Updated conformetry-validation to 0.0.33
- Updated conformetry-output to 0.0.33

## 0.0.34 (2026-10-16)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.33
- Updated conformetry-generation to 0.0.33
- Updated conformetry-validation to 0.0.32
- Updated conformetry-output to 0.0.32

## 0.0.33 (2026-10-16)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.32
- Updated conformetry-generation to 0.0.32
- Updated conformetry-validation to 0.0.31
- Updated conformetry-output to 0.0.31

## 0.0.32 (2026-10-16)

### 🔥 Performance

- **configuration,conformetry,scripts:** ⚡️ raise local pre-commit parallelism and overlap conformetry ([#1663](https://github.com/organizzolini/codebase/pull/1663))

## 0.0.31 (2026-10-16)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.31
- Updated conformetry-generation to 0.0.31
- Updated conformetry-validation to 0.0.30
- Updated conformetry-output to 0.0.30

## 0.0.30 (2026-10-15)

### 💅 Refactors

- **callidescope,codependix,codometer,conformetry:** ♻️ require --config on every ic-suite command line ([#1598](https://github.com/organizzolini/codebase/pull/1598))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.30
- Updated conformetry-generation to 0.0.30
- Updated conformetry-validation to 0.0.29
- Updated conformetry-output to 0.0.29

## 0.0.29 (2026-10-15)

### 💅 Refactors

- **configuration,documentation:** ♻️ move the configuration folder into an nx project ([#1509](https://github.com/organizzolini/codebase/pull/1509))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.29
- Updated conformetry-generation to 0.0.29
- Updated conformetry-validation to 0.0.28
- Updated conformetry-output to 0.0.28

## 0.0.28 (2026-10-15)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.28
- Updated conformetry-generation to 0.0.28
- Updated conformetry-validation to 0.0.27
- Updated conformetry-output to 0.0.27

## 0.0.27 (2026-10-15)

### 🚀 Features

- **ic-suite,configuration:** ✨ name root files after their project and declare root modules ([#1588](https://github.com/organizzolini/codebase/pull/1588), [#1480](https://github.com/organizzolini/codebase/issues/1480))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.27
- Updated conformetry-generation to 0.0.27
- Updated conformetry-validation to 0.0.26
- Updated conformetry-output to 0.0.26

## 0.0.26 (2026-10-15)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.26
- Updated conformetry-generation to 0.0.26
- Updated conformetry-validation to 0.0.25
- Updated conformetry-output to 0.0.25

## 0.0.25 (2026-10-15)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.25
- Updated conformetry-generation to 0.0.25
- Updated conformetry-validation to 0.0.24
- Updated conformetry-output to 0.0.24

## 0.0.24 (2026-10-15)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.24
- Updated conformetry-generation to 0.0.24
- Updated conformetry-validation to 0.0.23
- Updated conformetry-output to 0.0.23

## 0.0.23 (2026-10-15)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.23
- Updated conformetry-generation to 0.0.23
- Updated conformetry-validation to 0.0.22
- Updated conformetry-output to 0.0.22

## 0.0.22 (2026-10-15)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.22
- Updated conformetry-generation to 0.0.22
- Updated conformetry-validation to 0.0.21
- Updated conformetry-output to 0.0.21

## 0.0.21 (2026-10-15)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.21
- Updated conformetry-generation to 0.0.21
- Updated conformetry-validation to 0.0.20
- Updated conformetry-output to 0.0.20

## 0.0.20 (2026-10-14)

### 🩹 Fixes

- **conformetry:** 🐛 let the sync generator run under nx g ([#1560](https://github.com/organizzolini/codebase/pull/1560))

## 0.0.19 (2026-10-13)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.20
- Updated conformetry-generation to 0.0.20
- Updated conformetry-validation to 0.0.19
- Updated conformetry-output to 0.0.19

## 0.0.18 (2026-10-13)

### 💅 Refactors

- **configuration,codometer,validation:** ♻️ nest every project under a single projects folder ([#1439](https://github.com/organizzolini/codebase/pull/1439))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.19
- Updated conformetry-generation to 0.0.19
- Updated conformetry-validation to 0.0.18
- Updated conformetry-output to 0.0.18

## 0.0.17 (2026-10-13)

### 🩹 Fixes

- **callidescope,codependix,configuration:** 🐛 harden the codependix nx plugin for consumers outside this workspace ([#1444](https://github.com/organizzolini/codebase/pull/1444), [#1433](https://github.com/organizzolini/codebase/issues/1433))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.18
- Updated conformetry-generation to 0.0.18
- Updated conformetry-validation to 0.0.17
- Updated conformetry-output to 0.0.17

## 0.0.16 (2026-10-13)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.17
- Updated conformetry-generation to 0.0.17
- Updated conformetry-validation to 0.0.16
- Updated conformetry-output to 0.0.16

## 0.0.15 (2026-10-13)

### 🩹 Fixes

- **caelundas,conformetry:** 🐛 require an explicit directory instead of defaulting the destination ([#1395](https://github.com/organizzolini/codebase/pull/1395))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.16
- Updated conformetry-generation to 0.0.16
- Updated conformetry-validation to 0.0.15
- Updated conformetry-output to 0.0.15

## 0.0.14 (2026-10-12)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.15
- Updated conformetry-generation to 0.0.15
- Updated conformetry-validation to 0.0.14
- Updated conformetry-output to 0.0.14

## 0.0.13 (2026-10-12)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.14
- Updated conformetry-generation to 0.0.14
- Updated conformetry-validation to 0.0.13
- Updated conformetry-output to 0.0.13

## 0.0.12 (2026-10-09)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.13
- Updated conformetry-generation to 0.0.13
- Updated conformetry-validation to 0.0.12
- Updated conformetry-output to 0.0.12

## 0.0.11 (2026-10-08)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.12
- Updated conformetry-generation to 0.0.12
- Updated conformetry-validation to 0.0.11
- Updated conformetry-output to 0.0.11

## 0.0.10 (2026-10-08)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.11
- Updated conformetry-generation to 0.0.11
- Updated conformetry-validation to 0.0.10
- Updated conformetry-output to 0.0.10

## 0.0.9 (2026-10-08)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.10
- Updated conformetry-generation to 0.0.10
- Updated conformetry-validation to 0.0.9
- Updated conformetry-output to 0.0.9

## 0.0.8 (2026-10-08)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.8
- Updated conformetry-generation to 0.0.8
- Updated conformetry-validation to 0.0.8
- Updated conformetry-output to 0.0.8

## 0.0.7 (2026-10-08)

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.7
- Updated conformetry-generation to 0.0.7
- Updated conformetry-validation to 0.0.7
- Updated conformetry-output to 0.0.7

## 0.0.6 (2026-10-08)

### 🚀 Features

- **meanderaw:** ✨ replace families with pattern characteristics ([#1335](https://github.com/organizzolini/codebase/pull/1335))
- **conformetry,lexico:** ✨ add frontend conformetry templates and infer validation inputs ([#1301](https://github.com/organizzolini/codebase/pull/1301))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.6
- Updated conformetry-generation to 0.0.6
- Updated conformetry-validation to 0.0.6
- Updated conformetry-output to 0.0.6

## 0.0.5 (2026-10-06)

### 💅 Refactors

- **ic-suite:** ♻️ rename @codebase/logger to @codebase/observability ([#1208](https://github.com/organizzolini/codebase/pull/1208))

### 🧱 Updated Dependencies

- Updated conformetry-configuration to 0.0.5
- Updated conformetry-generation to 0.0.5
- Updated conformetry-validation to 0.0.5
- Updated conformetry-output to 0.0.5