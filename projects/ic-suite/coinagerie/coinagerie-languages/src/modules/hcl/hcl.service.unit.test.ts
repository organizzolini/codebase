import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ScannerModule } from "../scanner/scanner.module";

import { HclService } from "./hcl.service";

describe(HclService, () => {
  let service: HclService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ScannerModule],
      providers: [HclService],
    }).compile();

    service = await module.resolve(HclService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    ["an attribute", "region = var.region", ["region", "var", "region"]],
    ["a hyphenated name", "my-bucket = 1", ["my-bucket"]],
    ["a hash comment", "a = 1 # hidden words", ["a"]],
    ["a slash comment", "a = 1 // hidden words", ["a"]],
    ["a block comment", "a = 1 /* hidden\nwords */ b = 2", ["a", "b"]],
    ["an unterminated block comment", "a /* hidden", ["a"]],
    ["a string value", 'name = "hidden words"', ["name"]],
    ["an interpolation", 'name = "${var.hidden}"', ["name"]],
    ["an escaped quote", String.raw`a = "say \"hidden\"" b = 1`, ["a", "b"]],
    ["an unterminated string", 'a = "hidden\nb = 1', ["a", "b"]],
    [
      "a block header with labels",
      'resource "aws_instance" "web" {\n  ami = "x"\n}',
      ["resource", "aws_instance", "web", "ami"],
    ],
    [
      "a block header with one label",
      'variable "region" {}',
      ["variable", "region"],
    ],
    ["a block header with no label", "locals {\n  a = 1\n}", ["locals", "a"]],
    ["an object key", 'tags = { "Name" = "web" }', ["tags", "Name"]],
    [
      "a key with spaces before the equals",
      'tags = { "Name"  = "web" }',
      ["tags", "Name"],
    ],
    ["a value in a list", 'names = ["a", "b"]', ["names"]],
    [
      "an equality comparison",
      'enabled = var.mode == "hidden"',
      ["enabled", "var", "mode"],
    ],
    [
      "a for expression value",
      'map = { for k in keys : k => "hidden" }',
      ["map", "for", "k", "in", "keys", "k"],
    ],
    ["a here-document", "a = <<EOT\nhidden words\nEOT\nb = 1", ["a", "b"]],
    [
      "an indented here-document",
      "a = <<-EOT\n  hidden\n  EOT\nb = 1",
      ["a", "b"],
    ],
    ["an unterminated here-document", "a = <<EOT\nhidden", ["a"]],
    ["a number literal", "count = 0x10 + 3", ["count"]],
    [
      "a string after a block name that is not a label",
      'a = b "hidden"',
      ["a", "b"],
    ],
    ["nothing", "", []],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
