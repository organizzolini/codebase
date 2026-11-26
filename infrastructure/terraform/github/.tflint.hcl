# This root's own tflint configuration: the shared one with a single rule off.
# terraform_standard_module_structure wants an empty outputs.tf, which this
# already-applied root never needed. Re-enable it if the root gains outputs.
plugin "terraform" {
  enabled = true
  preset  = "all"
}

rule "terraform_standard_module_structure" {
  enabled = false
}
