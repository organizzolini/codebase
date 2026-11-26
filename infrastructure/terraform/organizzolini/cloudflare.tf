# Imported, never created: the zone already holds the owner's DNS.
import {
  to = cloudflare_zone.organizzolini_net
  id = var.cloudflare_zone_id
}

resource "cloudflare_zone" "organizzolini_net" {
  name = "organizzolini.net"

  account = {
    id = var.cloudflare_account_id
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "random_bytes" "tunnel_secret" {
  length = 32
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "organizzolini" {
  account_id    = var.cloudflare_account_id
  name          = "organizzolini"
  config_src    = "cloudflare"
  tunnel_secret = random_bytes.tunnel_secret.base64
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "organizzolini" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.organizzolini.id

  config = {
    ingress = [
      {
        hostname = var.hostname
        path     = "^/graphql"
        service  = "http://caelundas-api.caelundas.svc.cluster.local:6173"
      },
      {
        hostname = var.hostname
        service  = "http://caelundas-web.caelundas.svc.cluster.local:80"
      },
      {
        service = "http_status:404"
      },
    ]
  }
}

resource "cloudflare_dns_record" "organizzolini_caelundas" {
  zone_id = var.cloudflare_zone_id
  name    = "caelundas"
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.organizzolini.id}.cfargotunnel.com"
  proxied = true
  ttl     = 1
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "organizzolini" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.organizzolini.id
}
