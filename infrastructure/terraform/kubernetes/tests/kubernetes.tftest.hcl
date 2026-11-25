mock_provider "linode" {}

mock_provider "cloudflare" {}

mock_provider "random" {}

# The zone is imported, so it is overridden. The readiness wait is a provisioner, which plans never run.
override_resource {
  target = terraform_data.cluster_ready
}

# A plan never runs provisioners, and an overridden ID keeps the record's content known in a plan.
override_resource {
  target          = cloudflare_zero_trust_tunnel_cloudflared.cluster
  override_during = plan
  values = {
    id = "0123456789abcdef0123456789abcdef"
  }
}

override_resource {
  target = cloudflare_zone.organizzolini_net
}

variables {
  linode_token          = "mock-token"
  cloudflare_api_token  = "mock-token"
  cloudflare_account_id = "0123456789abcdef0123456789abcdef"
  cloudflare_zone_id    = "fedcba9876543210fedcba9876543210"
  k8s_version           = "1.34"
}

run "the_cluster_is_the_small_autoscaling_organizzolini_codebase" {
  command = plan

  assert {
    condition     = linode_lke_cluster.cluster.label == "organizzolini-codebase"
    error_message = "The cluster must be labelled organizzolini-codebase."
  }

  assert {
    condition     = linode_lke_cluster.cluster.region == "us-iad"
    error_message = "The cluster must sit in us-iad."
  }

  assert {
    condition     = linode_lke_cluster.cluster.pool[0].type == "g6-standard-2"
    error_message = "The pool must use the g6-standard-2 node type."
  }

  assert {
    condition     = linode_lke_cluster.cluster.pool[0].autoscaler[0].min == 1 && linode_lke_cluster.cluster.pool[0].autoscaler[0].max == 2
    error_message = "The pool autoscaler must run between 1 and 2 nodes."
  }

  assert {
    condition     = linode_lke_cluster.cluster.control_plane[0].high_availability == false
    error_message = "The control plane must be standard, not high availability."
  }
}

run "the_tunnel_sends_graphql_to_the_api_and_everything_else_to_the_web" {
  command = plan

  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[0].hostname == "caelundas.organizzolini.net" && cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[0].path == "^/graphql" && cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[0].service == "http://caelundas-api.caelundas.svc.cluster.local:3000"
    error_message = "The first ingress rule must send /graphql on the public host to the API on port 3000."
  }

  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[1].hostname == "caelundas.organizzolini.net" && cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[1].service == "http://caelundas-web.caelundas.svc.cluster.local:80"
    error_message = "The second ingress rule must send the public host's other paths to the web on port 80."
  }

  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[2].service == "http_status:404"
    error_message = "The last ingress rule must answer 404 for anything else."
  }
}

run "the_caelundas_record_is_a_proxied_cname_to_the_tunnel" {
  command = plan

  assert {
    condition     = cloudflare_dns_record.caelundas.type == "CNAME"
    error_message = "The caelundas record must be a CNAME."
  }

  assert {
    condition     = cloudflare_dns_record.caelundas.proxied == true
    error_message = "The caelundas record must be proxied."
  }

  assert {
    condition     = endswith(cloudflare_dns_record.caelundas.content, ".cfargotunnel.com")
    error_message = "The caelundas record must point at the tunnel's cfargotunnel.com name."
  }
}

run "nothing_outside_organizzolini_net_is_named" {
  command = plan

  # The Lexico guard: every hostname the config names must sit under organizzolini.net.
  assert {
    condition     = endswith(cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[0].hostname, ".organizzolini.net") && endswith(cloudflare_zero_trust_tunnel_cloudflared_config.cluster.config.ingress[1].hostname, ".organizzolini.net")
    error_message = "Every ingress hostname must end with organizzolini.net."
  }

  assert {
    condition     = "${cloudflare_dns_record.caelundas.name}.organizzolini.net" == "caelundas.organizzolini.net"
    error_message = "The DNS record must name a host under organizzolini.net."
  }

  assert {
    condition     = cloudflare_zone.organizzolini_net.name == "organizzolini.net"
    error_message = "The imported zone must be organizzolini.net."
  }
}
