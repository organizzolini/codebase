# Shared tflint configuration; a root with its own .tflint.hcl uses that
# instead. The terraform ruleset ships in the pinned tflint binary, so no
# `tflint --init` is needed. The linode and cloudflare providers publish none.
plugin "terraform" {
  enabled = true
  preset  = "all"
}
