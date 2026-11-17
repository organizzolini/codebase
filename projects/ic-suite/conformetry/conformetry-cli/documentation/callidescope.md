<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 61 |
| Files | 28 |
| Calls traced | 76 |
| Call stacks | 16 |
| Deepest stack | 15 |
| Stacks through recursion | 0 |
| Unfollowable calls | 4 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 15 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `InstancesCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 InstancesCommand.run(_passedParameters: string[], options: InstancesCommandOptions): Promise<void> [projects/ic-suite/conformetry/conformetry-cli/src/modules/instances/instances.command.ts:85]
   ↳ Writes every instance found, filtered to the given templates.
  └─> ConfigurationService.resolveInventoriedInstances(…): InventoriedInstance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:321]
     ↳ Lists every instance found, paired with the templates that explain it.
    └─> InstanceDiscoveryService.resolveInventoriedInstances(args: ResolveInventoryArguments): InventoriedInstance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:199]
       ↳ Lists every instance found, paired with the templates that explain it. `templateNames` narrows the pairing, dropping…
      └─> InstanceDiscoveryService.takeInventory(…): { templates: TemplateDefinition[]; weighed: { instance: Instance; pairings: InventoriedPairing[]; }[]; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:261]
         ↳ Weighs every instance the globs find against every declared template.
        └─> InstanceDiscoveryService.map(…)(instance: Instance): { instance: Instance; pairings: InventoriedPairing[]; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:273]
          └─> InstanceDiscoveryService.weighInstance(…): { instance: Instance; pairings: InventoriedPairing[]; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:80]
             ↳ Weighs one instance against every template, best fit first.
            └─> InstanceDiscoveryMatchingService.matchTemplates(…): TemplateMatch[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:160]
               ↳ Weighs every template sharing a file with the instance, best-first.
              └─> InstanceDiscoveryMatchingService.map(…)(…): { matchedFileCount: number; matchRatio: number; template: TemplateDefinition; placeholderValues: Substitutions; substitutions: Substitutions; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:166]
                └─> TemplateDiscoveryService.countMatchingFiles(…): number [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:133]
                   ↳ Counts how many of a template's files the instance path already has.
                  └─> TemplateDiscoveryService.filter(…)(templateFilePath: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:142]
                    └─> TemplateDiscoveryService.resolveInstanceFilePath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:189]
                       ↳ Maps a template file path to the instance file path it governs.
                      └─> RenderingService.renderPath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:125]
                         ↳ Renders a template path with mustache.
                        └─> RenderingService.assertEverySubstitutionSupplied(…): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:32]
                           ↳ Refuses to render a template asking for a value nobody supplied.
                          └─> RenderingService.collectInterpolatedNames(template: string): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:72]
                             ↳ Every placeholder a template interpolates, deduplicated.
                            └─> RenderingService.walk(spans: TemplateSpans): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:74]
```

**2. `TemplatesCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 TemplatesCommand.run(_passedParameters: string[], options: TemplatesCommandOptions): Promise<void> [projects/ic-suite/conformetry/conformetry-cli/src/modules/templates/templates.command.ts:92]
   ↳ Writes every declared template, filtered to the given instances.
  └─> ConfigurationService.resolveInventoriedTemplates(…): InventoriedTemplate[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:328]
     ↳ Lists every template declared, paired with the instances it explains.
    └─> InstanceDiscoveryService.resolveInventoriedTemplates(args: ResolveInventoryArguments): InventoriedTemplate[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:222]
       ↳ Lists every template declared, paired with the instances it explains. `instancePatterns` narrows which instances count.
      └─> InstanceDiscoveryService.takeInventory(…): { templates: TemplateDefinition[]; weighed: { instance: Instance; pairings: InventoriedPairing[]; }[]; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:261]
         ↳ Weighs every instance the globs find against every declared template.
        └─> InstanceDiscoveryService.map(…)(instance: Instance): { instance: Instance; pairings: InventoriedPairing[]; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:273]
          └─> InstanceDiscoveryService.weighInstance(…): { instance: Instance; pairings: InventoriedPairing[]; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:80]
             ↳ Weighs one instance against every template, best fit first.
            └─> InstanceDiscoveryMatchingService.matchTemplates(…): TemplateMatch[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:160]
               ↳ Weighs every template sharing a file with the instance, best-first.
              └─> InstanceDiscoveryMatchingService.map(…)(…): { matchedFileCount: number; matchRatio: number; template: TemplateDefinition; placeholderValues: Substitutions; substitutions: Substitutions; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:166]
                └─> TemplateDiscoveryService.countMatchingFiles(…): number [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:133]
                   ↳ Counts how many of a template's files the instance path already has.
                  └─> TemplateDiscoveryService.filter(…)(templateFilePath: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:142]
                    └─> TemplateDiscoveryService.resolveInstanceFilePath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:189]
                       ↳ Maps a template file path to the instance file path it governs.
                      └─> RenderingService.renderPath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:125]
                         ↳ Renders a template path with mustache.
                        └─> RenderingService.assertEverySubstitutionSupplied(…): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:32]
                           ↳ Refuses to render a template asking for a value nobody supplied.
                          └─> RenderingService.collectInterpolatedNames(template: string): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:72]
                             ↳ Every placeholder a template interpolates, deduplicated.
                            └─> RenderingService.walk(spans: TemplateSpans): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:74]
```

**3. `ValidateCommand.run`** — depth ≥ 14 · decorated-method

```text
🚀 ValidateCommand.run(_passedParameters: string[], options: ValidateCommandOptions): Promise<void> [projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:339]
   ↳ Runs validation and reports every difference found.
  └─> ValidationService.validate(args: RunValidationArguments): RunValidationResult [projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:177]
     ↳ Validates every instance and returns the differences found.
    └─> ConfigurationService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:212]
       ↳ Resolves every instance to the template, or templates, that explain it.
      └─> InstanceDiscoveryService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:119]
         ↳ Resolves every instance to the template, or templates, that explain it.
        └─> InstanceDiscoveryMatchingService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:102]
           ↳ Resolves every instance to the template, or templates, that explain it.
          └─> InstanceDiscoveryMatchingService.matchTemplates(…): TemplateMatch[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:160]
             ↳ Weighs every template sharing a file with the instance, best-first.
            └─> InstanceDiscoveryMatchingService.map(…)(…): { matchedFileCount: number; matchRatio: number; template: TemplateDefinition; placeholderValues: Substitutions; substitutions: Substitutions; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:166]
              └─> TemplateDiscoveryService.countMatchingFiles(…): number [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:133]
                 ↳ Counts how many of a template's files the instance path already has.
                └─> TemplateDiscoveryService.filter(…)(templateFilePath: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:142]
                  └─> TemplateDiscoveryService.resolveInstanceFilePath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:189]
                     ↳ Maps a template file path to the instance file path it governs.
                    └─> RenderingService.renderPath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:125]
                       ↳ Renders a template path with mustache.
                      └─> RenderingService.assertEverySubstitutionSupplied(…): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:32]
                         ↳ Refuses to render a template asking for a value nobody supplied.
                        └─> RenderingService.collectInterpolatedNames(template: string): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:72]
                           ↳ Every placeholder a template interpolates, deduplicated.
                          └─> RenderingService.walk(spans: TemplateSpans): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:74]
```

<details>
<summary>13 more call stacks</summary>

**4. `GenerateCommand.run`** — depth ≥ 11 · decorated-method

```text
🚀 GenerateCommand.run(passedParameters: string[], options: GenerateCommandOptions): Promise<void> [projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:267]
   ↳ Renders the template, reporting a refused command line as one.
  └─> GenerateCommand.generate(…): Promise<void> [projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:59]
     ↳ Resolves the template's inputs and writes its files.
    └─> ConfigurationService.resolveGeneratorInputs(args: ResolveGeneratorInputsArguments): Promise<Record<string, string>> [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:309]
       ↳ Resolves generator inputs from raw command-line arguments.
      └─> InputService.resolveGeneratorInputs(args: ResolveGeneratorInputsArguments): Promise<Record<string, string>> [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:173]
         ↳ Resolves generator inputs from raw command-line arguments.
        └─> InputService.resolveInputs(…): Promise<Record<string, string>> [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:51]
           ↳ Walks a schema, taking each value from the resolver or a prompt.
          └─> InputService.acceptProvidedValue(args: { input: SchemaInput; value: string; }): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:37]
             ↳ Validates a value the caller already had, throwing if it is invalid.
            └─> InputSchemaService.validateValue(args: { input: SchemaInput; value: unknown; }): string | true [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:157]
               ↳ Validates a value, returning `true` or the reason it failed. An empty value fails only when the input is required.
              └─> InputSchemaService.validateEnum(args: { input: SchemaInput; value: string; }): string | true [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:39]
                 ↳ Validates a value against a schema `enum`, when one is declared.
                └─> InputSchemaService.readEnumValues(propertySchema: unknown): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:123]
                   ↳ Reads the string members of a schema `enum`.
                  └─> InputSchemaService.readSchemaProperty(propertySchema: unknown, key: string): unknown [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:26]
                     ↳ Reads one property off a schema fragment when it is an object.
                    └─> InputSchemaService.find(…)([entryKey]: [string, any]): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:31]
```

**5. `InstancesCommand.parseTemplates`** — depth 4 · decorated-method

```text
🚀 InstancesCommand.parseTemplates(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/instances/instances.command.ts:75]
   ↳ Parses the optional template filter.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:220]
     ↳ Splits a comma-delimited filter option into its values.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:113]
       ↳ Splits a comma-delimited filter option into its values.
      └─> InputService.filter(…)(item: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:123]
```

**6. `TemplatesCommand.parseInstances`** — depth 4 · decorated-method

```text
🚀 TemplatesCommand.parseInstances(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/templates/templates.command.ts:73]
   ↳ Parses the optional instance filter.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:220]
     ↳ Splits a comma-delimited filter option into its values.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:113]
       ↳ Splits a comma-delimited filter option into its values.
      └─> InputService.filter(…)(item: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:123]
```

**7. `ValidateCommand.parseInstances`** — depth 4 · decorated-method

```text
🚀 ValidateCommand.parseInstances(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:296]
   ↳ Parses the optional instance glob override.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:220]
     ↳ Splits a comma-delimited filter option into its values.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:113]
       ↳ Splits a comma-delimited filter option into its values.
      └─> InputService.filter(…)(item: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:123]
```

**8. `ValidateCommand.parseLanguages`** — depth 4 · decorated-method

```text
🚀 ValidateCommand.parseLanguages(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:306]
   ↳ Parses the optional language filter.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:220]
     ↳ Splits a comma-delimited filter option into its values.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:113]
       ↳ Splits a comma-delimited filter option into its values.
      └─> InputService.filter(…)(item: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:123]
```

**9. `ValidateCommand.parseTemplates`** — depth 4 · decorated-method

```text
🚀 ValidateCommand.parseTemplates(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:320]
   ↳ Parses the optional template filter.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:220]
     ↳ Splits a comma-delimited filter option into its values.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:113]
       ↳ Splits a comma-delimited filter option into its values.
      └─> InputService.filter(…)(item: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:123]
```

**10. `ValidateCommand.parseThreshold`** — depth 4 · decorated-method

```text
🚀 ValidateCommand.parseThreshold(value: string | undefined): number | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:329]
   ↳ Parses the optional run-level conformance threshold.
  └─> ConfigurationService.parseThresholdOption(value: string | undefined): number | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:232]
     ↳ Parses a threshold option as a ratio from 0 to 1.
    └─> InputService.parseThresholdOption(value: string | undefined): number | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:154]
       ↳ Parses a threshold option as a ratio from 0 to 1.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:129]
         ↳ Trims an optional string option, treating blank as absent.
```

**11. `GenerateCommand.parseConfig`** — depth ≥ 3 · decorated-method

```text
🚀 GenerateCommand.parseConfig(value: string | undefined): string [projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:228]
   ↳ Parses the required configuration path.
  └─> ConfigurationService.requireConfigurationPath(value: string | undefined, surface: string): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:286]
     ↳ Returns the configuration path, or throws when it is absent or blank. `surface` names where the path was expected.
    └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.constants.ts:15]
```

**12. `GenerateCommand.parseDirectory`** — depth 3 · decorated-method

```text
🚀 GenerateCommand.parseDirectory(value: string | undefined): string | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:241]
   ↳ Parses the output directory override.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:227]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:129]
       ↳ Trims an optional string option, treating blank as absent.
```

**13. `GenerateCommand.parseTemplate`** — depth 3 · decorated-method

```text
🚀 GenerateCommand.parseTemplate(value: string | undefined): string | undefined [projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:254]
   ↳ Parses the name of the template to render. Optional, so a bare `generate` reaches the picker.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:227]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:129]
       ↳ Trims an optional string option, treating blank as absent.
```

**14. `InstancesCommand.parseConfig`** — depth ≥ 3 · decorated-method

```text
🚀 InstancesCommand.parseConfig(value: string | undefined): string [projects/ic-suite/conformetry/conformetry-cli/src/modules/instances/instances.command.ts:53]
   ↳ Parses the required configuration path.
  └─> ConfigurationService.requireConfigurationPath(value: string | undefined, surface: string): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:286]
     ↳ Returns the configuration path, or throws when it is absent or blank. `surface` names where the path was expected.
    └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.constants.ts:15]
```

**15. `TemplatesCommand.parseConfig`** — depth ≥ 3 · decorated-method

```text
🚀 TemplatesCommand.parseConfig(value: string | undefined): string [projects/ic-suite/conformetry/conformetry-cli/src/modules/templates/templates.command.ts:60]
   ↳ Parses the required configuration path.
  └─> ConfigurationService.requireConfigurationPath(value: string | undefined, surface: string): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:286]
     ↳ Returns the configuration path, or throws when it is absent or blank. `surface` names where the path was expected.
    └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.constants.ts:15]
```

**16. `ValidateCommand.parseConfig`** — depth ≥ 3 · decorated-method

```text
🚀 ValidateCommand.parseConfig(value: string | undefined): string [projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:283]
   ↳ Parses the required configuration path.
  └─> ConfigurationService.requireConfigurationPath(value: string | undefined, surface: string): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:286]
     ↳ Returns the configuration path, or throws when it is absent or blank. `surface` names where the path was expected.
    └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.constants.ts:15]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GenerateCommand.generate` | 9 | `GenerateCommand.rejectRemovedGeneratorOption`, `ConfigurationService.resolveConfigurationPath`, `ConfigurationService.loadConformetryConfiguration`, `GenerateCommand.resolveTemplateName`, `GenerateCommand.requireDefinition`, `GenerateCommand.requireDirectory`, `ConfigurationService.resolveGeneratorInputs`, `GenerationService.runGenerator`, `GenerateCommand.map(…)` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:59` |
| `ValidateCommand.run` | 7 | `ConfigurationService.loadConformetryConfiguration`, `ValidateCommand.selectTemplates`, `ValidateCommand.selectInstances`, `ValidateCommand.reportEmptySelection`, `ValidationService.validate`, `ConfigurationService.collectTemplates`, `ValidateCommand.reportResult` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:339` |
| `GenerateCommand.resolveTemplateName` | 4 | `GenerateCommand.map(…)`, `ConfigurationService.isAtTerminal`, `missingTemplateError`, `ConfigurationService.promptForTemplate` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:195` |

<details>
<summary>30 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `InstancesCommand.run` | 4 | `ConfigurationService.loadConformetryConfiguration`, `InventoryService.shortenInstancePaths`, `ConfigurationService.resolveInventoriedInstances`, `InventoryService.describeInstances` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/instances/instances.command.ts:85` |
| `TemplatesCommand.run` | 4 | `ConfigurationService.loadConformetryConfiguration`, `InventoryService.shortenTemplatePairings`, `ConfigurationService.resolveInventoriedTemplates`, `InventoryService.describeTemplates` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/templates/templates.command.ts:92` |
| `ValidateCommand.selectInstances` | 4 | `ValidateCommand.findInstances`, `ValidateCommand.flatMap(…)`, `ValidateCommand.map(…)`, `ValidateCommand.filter(…)` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:204` |
| `GenerateCommand.requireDefinition` | 3 | `GenerateCommand.find(…)`, `unknownTemplateError`, `GenerateCommand.map(…)` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:148` |
| `ValidateCommand.reportEmptySelection` | 3 | `ValidateCommand.map(…)`, `ValidateCommand.map(…)`, `ValidateCommand.filter(…)` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:129` |
| `ValidateCommand.reportResult` | 3 | `ReportingService.formatReport`, `ValidateCommand.filter(…)`, `ValidateCommand.describeFailure` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:168` |
| `ValidateCommand.map(…)` | 3 | `ValidateCommand.find(…)`, `unknownTemplateError`, `ValidateCommand.map(…)` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:259` |
| `GenerateCommand.rejectRemovedGeneratorOption` | 2 | `GenerateCommand.some(…)`, `removedGeneratorOptionError` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:134` |
| `GenerateCommand.run` | 2 | `GenerateCommand.generate`, `GenerateCommand.rejectCommandLine` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:267` |
| `ValidateCommand.describeFailure` | 2 | `ValidateCommand.filter(…)`, `ValidateCommand.map(…)` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:63` |
| `ValidateCommand.findInstances` | 2 | `ValidateCommand.flatMap(…)`, `ConfigurationService.readWorkspaceGroups` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:84` |
| `ValidateCommand.promptForTemplateNames` | 2 | `ConfigurationService.isAtTerminal`, `ConfigurationService.promptForTemplates` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:114` |
| `ValidateCommand.selectTemplates` | 2 | `ValidateCommand.promptForTemplateNames`, `ValidateCommand.map(…)` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:244` |
| `missingTemplateError` | 1 | `InputError.constructor` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.constants.ts:6` |
| `GenerateCommand.requireDirectory` | 1 | `missingDirectoryError` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:176` |
| `GenerateCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:228` |
| `GenerateCommand.parseDirectory` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:241` |
| `GenerateCommand.parseTemplate` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts:254` |
| `InstancesCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/instances/instances.command.ts:53` |
| `InstancesCommand.parseTemplates` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/instances/instances.command.ts:75` |
| `TemplatesCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/templates/templates.command.ts:60` |
| `TemplatesCommand.parseInstances` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/templates/templates.command.ts:73` |
| `ValidateCommand.map(…)` | 1 | `ReportingService.formatPercentage` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:66` |
| `ValidateCommand.flatMap(…)` | 1 | `ConfigurationService.findInstances` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:92` |
| `ValidateCommand.filter(…)` | 1 | `ConfigurationService.readWorkspaceGroups` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:137` |
| `ValidateCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:283` |
| `ValidateCommand.parseInstances` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:296` |
| `ValidateCommand.parseLanguages` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:306` |
| `ValidateCommand.parseTemplates` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:320` |
| `ValidateCommand.parseThreshold` | 1 | `ConfigurationService.parseThresholdOption` | `projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts:329` |

</details>
<!-- callidescope:end -->
