# Shared tflint configuration for every Terraform root. A root with its own
# .tflint.hcl uses that instead. The terraform ruleset is bundled in the pinned
# tflint binary, so the pin is the tflint version and no `tflint --init` or
# network access is needed. The linode and cloudflare providers publish no
# ruleset, so only the terraform one is enabled.
plugin "terraform" {
  enabled = true
  preset  = "all"
}
