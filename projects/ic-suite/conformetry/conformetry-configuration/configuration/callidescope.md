<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 186 |
| Files | 39 |
| Calls traced | 169 |
| Call stacks | 6 |
| Deepest stack | 10 |
| Stacks through recursion | 0 |
| Unfollowable calls | 7 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 14 |
| `maximumBreadth` | 5 |

### Call stacks (depth)

**1. `InstanceDiscoveryService.matchTemplates`** — depth ≥ 10 · orphan-root

```text
🚀 InstanceDiscoveryService.matchTemplates(…): TemplateMatch[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:131]
   ↳ Ranks every template that shares a file with one instance, best first.
  └─> InstanceDiscoveryMatchingService.matchTemplates(…): TemplateMatch[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:180]
     ↳ Weighs every template that shares at least one file with the instance, best-first.
    └─> InstanceDiscoveryMatchingService.map(…)(…): { matchedFileCount: number; matchRatio: number; template: TemplateDefinition; placeholderValues: Substitutions; substitutions: Substitutions; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:186]
      └─> TemplateDiscoveryService.countMatchingFiles(…): number [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:146]
         ↳ Counts how many of a template's files the instance path already has.
        └─> TemplateDiscoveryService.filter(…)(templateFilePath: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:155]
          └─> TemplateDiscoveryService.resolveInstanceFilePath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:204]
             ↳ Maps a template file path to the instance file path it governs.
            └─> RenderingService.renderPath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:142]
               ↳ Renders a template path with mustache, the same way contents are rendered.
              └─> RenderingService.assertEverySubstitutionSupplied(…): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:35]
                 ↳ Refuses to render a template asking for a value nobody supplied.
                └─> RenderingService.collectInterpolatedNames(template: string): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:80]
                   ↳ Every placeholder a template interpolates, deduplicated.
                  └─> RenderingService.walk(spans: TemplateSpans): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:82]
```

**2. `InputService.resolveInputsFromValues`** — depth ≥ 8 · orphan-root

```text
🚀 InputService.resolveInputsFromValues(args: ResolveInputsFromValuesArguments): Promise<Record<string, string>> [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:195]
   ↳ Resolves inputs from values the caller already parsed.
  └─> InputService.resolveInputs(…): Promise<Record<string, string>> [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:53]
     ↳ Walks a schema, taking each value from the resolver or a prompt.
    └─> InputService.acceptProvidedValue(args: { input: SchemaInput; value: string; }): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:39]
       ↳ Validates a value the caller already had, throwing if it is invalid.
      └─> InputSchemaService.validateValue(args: { input: SchemaInput; value: unknown; }): string | true [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:158]
         ↳ Validates a value, returning `true` or the reason it failed.
        └─> InputSchemaService.validateEnum(args: { input: SchemaInput; value: string; }): string | true [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:39]
           ↳ Validates a value against a schema `enum`, when one is declared.
          └─> InputSchemaService.readEnumValues(propertySchema: unknown): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:123]
             ↳ Reads the string members of a schema `enum`.
            └─> InputSchemaService.readSchemaProperty(propertySchema: unknown, key: string): unknown [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:26]
               ↳ Reads one property off a schema fragment when it is an object.
              └─> InputSchemaService.find(…)([entryKey]: [string, any]): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:31]
```

**3. `InputPromptingService.validate`** — depth 6 · orphan-root

```text
🚀 InputPromptingService.validate(value: unknown): string | true [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:105]
  └─> InputSchemaService.validateValue(args: { input: SchemaInput; value: unknown; }): string | true [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:158]
     ↳ Validates a value, returning `true` or the reason it failed.
    └─> InputSchemaService.validateEnum(args: { input: SchemaInput; value: string; }): string | true [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:39]
       ↳ Validates a value against a schema `enum`, when one is declared.
      └─> InputSchemaService.readEnumValues(propertySchema: unknown): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:123]
         ↳ Reads the string members of a schema `enum`.
        └─> InputSchemaService.readSchemaProperty(propertySchema: unknown, key: string): unknown [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:26]
           ↳ Reads one property off a schema fragment when it is an object.
          └─> InputSchemaService.find(…)([entryKey]: [string, any]): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:31]
```

<details>
<summary>3 more call stacks</summary>

**4. `assertNoCollisions`** — depth ≥ 3 · orphan-root

```text
🚀 assertNoCollisions(…): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.utilities.ts:28]
   ↳ Fails when two generators would answer to the same thing.
  └─> findDuplicates(…): { message: string; path: (string | number)[]; }[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.utilities.ts:62]
     ↳ Reports every key more than one generator claims.
    └─> map(…)(…): { message: string; path: number[]; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.utilities.ts:84]
```

**5. `InstanceDiscoveryService.buildSubstitutions`** — depth 3 · orphan-root

```text
🚀 InstanceDiscoveryService.buildSubstitutions(…): Substitutions [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:111]
   ↳ Builds the substitutions an instance's template is rendered with.
  └─> InstanceDiscoveryMatchingService.buildSubstitutions(instance: Instance): Substitutions [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:97]
     ↳ Builds the substitutions an instance's template is rendered with.
    └─> RenderingService.buildNameSubstitutions(name: string): Substitutions [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:60]
       ↳ Derives the case variants every template can reference from one name.
```

**6. `generatorHookSchema`** — depth 2 · orphan-root

```text
🚀 generatorHookSchema(hookName: string): z.ZodType<GeneratorHook> [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.constants.ts:71]
   ↳ A hook as a config file declares it: a function, and nothing narrower.
  └─> custom(…)(value: unknown): value is Function [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.constants.ts:72]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `InstanceDiscoveryLocatingService.findInstances` | 5 | `InstanceDiscoveryLocatingService.resolveGlobSuffix`, `InstanceDiscoveryLocatingService.globEntries`, `InstanceDiscoveryLocatingService.resolveNameStem`, `InstanceDiscoveryLocatingService.map(…)`, `InstanceDiscoveryLocatingService.toSorted(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:156` |
| `InstanceDiscoveryMatchingService.matchInstances` | 5 | `InstanceDiscoveryMatchingService.buildSubstitutions`, `InstanceDiscoveryMatchingService.matchTemplates`, `InstanceDiscoveryMatchingService.filter(…)`, `InstanceDiscoveryMatchingService.map(…)`, `InstanceDiscoveryMatchingService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:118` |
| `InputPromptingService.promptForInput` | 4 | `InputPromptingService.assertCanPrompt`, `InputSchemaService.readEnumValues`, `InputPromptingService.map(…)`, `InputSchemaService.readPromptMessage` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:90` |

<details>
<summary>104 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `InputService.resolveInputs` | 4 | `InputSchemaService.readPropertyNames`, `InputSchemaService.describeInput`, `InputService.acceptProvidedValue`, `InputService.resolveMissingValue` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:53` |
| `InputService.resolveMissingValue` | 4 | `InputPromptingService.isAtTerminal`, `missingInputError`, `InputPromptingService.promptForInput`, `InputSchemaService.validateValue` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:94` |
| `InstanceDiscoveryService.resolveInventoriedInstances` | 4 | `InstanceDiscoveryService.takeInventory`, `InstanceDiscoveryService.map(…)`, `InstanceDiscoveryService.filter(…)`, `InstanceDiscoveryService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:219` |
| `InstanceDiscoveryService.resolveInventoriedTemplates` | 4 | `InstanceDiscoveryService.takeInventory`, `InstanceDiscoveryService.filter(…)`, `InstanceDiscoveryService.map(…)`, `InstanceDiscoveryService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:244` |
| `InstanceDiscoveryService.takeInventory` | 4 | `TemplateDiscoveryService.collectTemplates`, `InstanceDiscoveryService.findInstances`, `InstanceDiscoveryService.readInventoryGlobs`, `InstanceDiscoveryService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:283` |
| `ConfigurationService.loadConformetryConfiguration` | 4 | `ConfigurationService.resolveConfigurationPath`, `UnknownConfigurationFileTypeError.constructor`, `ConfigurationService.loadConfigurationModule`, `ConfigurationService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:237` |
| `assertNoCollisions` | 3 | `findDuplicates`, `findUnusableNames`, `findReservedNames` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.utilities.ts:28` |
| `findReservedNames` | 3 | `map(…)`, `filter(…)`, `map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.utilities.ts:97` |
| `findUnusableNames` | 3 | `map(…)`, `filter(…)`, `map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.utilities.ts:112` |
| `InputOptionsService.collectOneInput` | 3 | `InputOptionsService.readOptionName`, `InputOptionsService.resolvePropertyName`, `InputOptionsService.readOptionValue` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-options.service.ts:34` |
| `InputSchemaService.validateValue` | 3 | `InputSchemaService.validateEnum`, `InputSchemaService.validateLength`, `InputSchemaService.validatePattern` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:158` |
| `RenderingService.assertEverySubstitutionSupplied` | 3 | `RenderingService.filter(…)`, `RenderingService.collectInterpolatedNames`, `MissingSubstitutionError.constructor` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:35` |
| `InstanceDiscoveryMatchingService.matchTemplates` | 3 | `InstanceDiscoveryMatchingService.toSorted(…)`, `InstanceDiscoveryMatchingService.filter(…)`, `InstanceDiscoveryMatchingService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:180` |
| `InstanceDiscoveryService.readInventoryGlobs` | 3 | `InstanceDiscoveryService.flatMap(…)`, `InstanceDiscoveryService.flatMap(…)`, `InstanceDiscoveryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:62` |
| `InstanceDiscoveryService.weighInstance` | 3 | `InstanceDiscoveryService.map(…)`, `InstanceDiscoveryMatchingService.matchTemplates`, `InstanceDiscoveryMatchingService.buildSubstitutions` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:84` |
| `InstanceDiscoveryService.map(…)` | 3 | `InstanceDiscoveryService.filter(…)`, `InstanceDiscoveryService.map(…)`, `InstanceDiscoveryService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:146` |
| `findDuplicates` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.utilities.ts:62` |
| `InputSchemaService.readEnumValues` | 2 | `InputSchemaService.readSchemaProperty`, `InputSchemaService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:123` |
| `InputPromptingService.assertCanPrompt` | 2 | `InputPromptingService.isAtTerminal`, `missingInputError` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:50` |
| `InputPromptingService.promptForTemplates` | 2 | `InputPromptingService.map(…)`, `InputPromptingService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:144` |
| `InputService.parseCommaDelimitedOption` | 2 | `InputService.filter(…)`, `InputService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:118` |
| `InputService.resolveGeneratorInputs` | 2 | `InputOptionsService.collectGeneratorInputs`, `InputService.resolveInputs` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:180` |
| `TemplateDiscoveryService.collectTemplate` | 2 | `TemplateDiscoveryService.collectFilePaths`, `TemplateDiscoveryService.collectPlaceholderNames` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:97` |
| `TemplateDiscoveryService.prepareDocument` | 2 | `TemplateDiscoveryService.resolveInstanceFilePath`, `RenderingService.renderContent` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:178` |
| `InstanceDiscoveryMatchingService.fillPlaceholders` | 2 | `InstanceDiscoveryMatchingService.map(…)`, `InstanceDiscoveryMatchingService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:73` |
| `InstanceDiscoveryMatchingService.map(…)` | 2 | `InstanceDiscoveryMatchingService.fillPlaceholders`, `TemplateDiscoveryService.countMatchingFiles` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:186` |
| `missingInputError` | 1 | `InputError.constructor` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.constants.ts:55` |
| `missingDirectoryError` | 1 | `InputError.constructor` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.constants.ts:70` |
| `generatorHookSchema` | 1 | `custom(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.constants.ts:71` |
| `InputOptionsService.resolvePropertyName` | 1 | `InputOptionsService.find(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-options.service.ts:100` |
| `InputOptionsService.collectGeneratorInputs` | 1 | `InputOptionsService.collectOneInput` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-options.service.ts:120` |
| `InputSchemaService.readSchemaProperty` | 1 | `InputSchemaService.find(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:26` |
| `InputSchemaService.validateEnum` | 1 | `InputSchemaService.readEnumValues` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:39` |
| `InputSchemaService.validateLength` | 1 | `InputSchemaService.readSchemaProperty` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:53` |
| `InputSchemaService.validatePattern` | 1 | `InputSchemaService.readSchemaProperty` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:85` |
| `InputSchemaService.readPromptMessage` | 1 | `InputSchemaService.readSchemaProperty` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-schema.service.ts:136` |
| `InputPromptingService.validate` | 1 | `InputSchemaService.validateValue` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:105` |
| `InputPromptingService.promptForTemplate` | 1 | `InputPromptingService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:122` |
| `InputPromptingService.map(…)` | 1 | `InputPromptingService.describeChoice` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:126` |
| `InputPromptingService.map(…)` | 1 | `InputPromptingService.describeChoice` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input-prompting.service.ts:154` |
| `InputService.acceptProvidedValue` | 1 | `InputSchemaService.validateValue` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:39` |
| `InputService.parseThresholdOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:161` |
| `InputService.resolveInputsFromValues` | 1 | `InputService.resolveInputs` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/input/input.service.ts:195` |
| `MissingSubstitutionError.constructor` | 1 | `MissingSubstitutionError.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.constants.ts:31` |
| `RenderingService.collectInterpolatedNames` | 1 | `RenderingService.walk` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:80` |
| `RenderingService.renderContent` | 1 | `RenderingService.assertEverySubstitutionSupplied` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:115` |
| `RenderingService.renderPath` | 1 | `RenderingService.assertEverySubstitutionSupplied` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:142` |
| `TemplateDiscoveryService.collectPlaceholderNames` | 1 | `TemplateDiscoveryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:71` |
| `TemplateDiscoveryService.flatMap(…)` | 1 | `TemplateDiscoveryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:77` |
| `TemplateDiscoveryService.flatMap(…)` | 1 | `RenderingService.collectInterpolatedNames` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:81` |
| `TemplateDiscoveryService.collectTemplates` | 1 | `TemplateDiscoveryService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:123` |
| `TemplateDiscoveryService.map(…)` | 1 | `TemplateDiscoveryService.collectTemplate` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:127` |
| `TemplateDiscoveryService.countMatchingFiles` | 1 | `TemplateDiscoveryService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:146` |
| `TemplateDiscoveryService.filter(…)` | 1 | `TemplateDiscoveryService.resolveInstanceFilePath` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:155` |
| `TemplateDiscoveryService.resolveInstanceFilePath` | 1 | `RenderingService.renderPath` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:204` |
| `InstanceDiscoveryLocatingService.globEntries` | 1 | `InstanceDiscoveryLocatingService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:66` |
| `InstanceDiscoveryLocatingService.filter(…)` | 1 | `InstanceDiscoveryLocatingService.isExcluded` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:76` |
| `InstanceDiscoveryLocatingService.isExcluded` | 1 | `InstanceDiscoveryLocatingService.some(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:85` |
| `InstanceDiscoveryLocatingService.resolveGlobSuffix` | 1 | `InstanceDiscoveryLocatingService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:108` |
| `InstanceDiscoveryLocatingService.map(…)` | 1 | `InstanceDiscoveryLocatingService.deriveLocationSubstitutions` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:195` |
| `InstanceDiscoveryMatchingService.map(…)` | 1 | `createPlaceholderValue` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:80` |
| `InstanceDiscoveryMatchingService.buildSubstitutions` | 1 | `RenderingService.buildNameSubstitutions` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:97` |
| `InstanceDiscoveryMatchingService.toSorted(…)` | 1 | `InstanceDiscoveryMatchingService.compareMatches` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:211` |
| `InstanceDiscoveryService.flatMap(…)` | 1 | `InstanceDiscoveryService.readWorkspaceGroups` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:72` |
| `InstanceDiscoveryService.buildSubstitutions` | 1 | `InstanceDiscoveryMatchingService.buildSubstitutions` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:111` |
| `InstanceDiscoveryService.findInstances` | 1 | `InstanceDiscoveryLocatingService.findInstances` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:118` |
| `InstanceDiscoveryService.matchInstances` | 1 | `InstanceDiscoveryMatchingService.matchInstances` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:123` |
| `InstanceDiscoveryService.matchTemplates` | 1 | `InstanceDiscoveryMatchingService.matchTemplates` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:131` |
| `InstanceDiscoveryService.prepareDocuments` | 1 | `InstanceDiscoveryService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:141` |
| `InstanceDiscoveryService.map(…)` | 1 | `TemplateDiscoveryService.prepareDocument` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:152` |
| `InstanceDiscoveryService.readWorkspaceGroups` | 1 | `InstanceDiscoveryService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:186` |
| `InstanceDiscoveryService.filter(…)` | 1 | `InstanceGroupService.isProjectScoped` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:189` |
| `InstanceDiscoveryService.resolveInstanceFiles` | 1 | `InstanceDiscoveryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:195` |
| `InstanceDiscoveryService.flatMap(…)` | 1 | `InstanceDiscoveryService.map(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:196` |
| `InstanceDiscoveryService.map(…)` | 1 | `TemplateDiscoveryService.resolveInstanceFilePath` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:197` |
| `InstanceDiscoveryService.map(…)` | 1 | `InstanceDiscoveryService.filter(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:228` |
| `InstanceDiscoveryService.map(…)` | 1 | `InstanceDiscoveryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:256` |
| `InstanceDiscoveryService.flatMap(…)` | 1 | `InstanceDiscoveryService.find(…)` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:257` |
| `InstanceDiscoveryService.map(…)` | 1 | `InstanceDiscoveryService.weighInstance` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:295` |
| `ConfigurationService.applyGeneratorDefaults` | 1 | `ConfigurationService.applyHookDefaults` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:89` |
| `ConfigurationService.loadConfigurationModule` | 1 | `ConfigurationService.loadJsonConfiguration` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:157` |
| `ConfigurationService.buildNameSubstitutions` | 1 | `RenderingService.buildNameSubstitutions` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:196` |
| `ConfigurationService.collectTemplate` | 1 | `TemplateDiscoveryService.collectTemplate` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:201` |
| `ConfigurationService.collectTemplates` | 1 | `TemplateDiscoveryService.collectTemplates` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:208` |
| `ConfigurationService.findInstances` | 1 | `InstanceDiscoveryService.findInstances` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:216` |
| `ConfigurationService.isAtTerminal` | 1 | `InputPromptingService.isAtTerminal` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:221` |
| `ConfigurationService.isProjectScoped` | 1 | `InstanceGroupService.isProjectScoped` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:226` |
| `ConfigurationService.map(…)` | 1 | `ConfigurationService.applyGeneratorDefaults` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:253` |
| `ConfigurationService.matchInstances` | 1 | `InstanceDiscoveryService.matchInstances` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:257` |
| `ConfigurationService.parseCommaDelimitedOption` | 1 | `InputService.parseCommaDelimitedOption` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:265` |
| `ConfigurationService.parseOptionalOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:272` |
| `ConfigurationService.parseThresholdOption` | 1 | `InputService.parseThresholdOption` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:277` |
| `ConfigurationService.prepareDocuments` | 1 | `InstanceDiscoveryService.prepareDocuments` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:285` |
| `ConfigurationService.promptForTemplate` | 1 | `InputPromptingService.promptForTemplate` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:292` |
| `ConfigurationService.promptForTemplates` | 1 | `InputPromptingService.promptForTemplates` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:299` |
| `ConfigurationService.readWorkspaceGroups` | 1 | `InstanceDiscoveryService.readWorkspaceGroups` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:306` |
| `ConfigurationService.renderContent` | 1 | `RenderingService.renderContent` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:313` |
| `ConfigurationService.renderPath` | 1 | `RenderingService.renderPath` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:320` |
| `ConfigurationService.requireConfigurationPath` | 1 | `ConfigurationPathRequiredError.constructor` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:335` |
| `ConfigurationService.resolveConfigurationPath` | 1 | `ConfigurationService.findWorkspaceRoot` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:356` |
| `ConfigurationService.resolveGeneratorInputs` | 1 | `InputService.resolveGeneratorInputs` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:382` |
| `ConfigurationService.resolveInstanceFiles` | 1 | `InstanceDiscoveryService.resolveInstanceFiles` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:389` |
| `ConfigurationService.resolveInventoriedInstances` | 1 | `InstanceDiscoveryService.resolveInventoriedInstances` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:394` |
| `ConfigurationService.resolveInventoriedTemplates` | 1 | `InstanceDiscoveryService.resolveInventoriedTemplates` | `projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:401` |

</details>
<!-- callidescope:end -->
