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

  # No public hostname exists yet: every request gets a 404 until an application adds its rules.
  config = {
    ingress = [
      {
        service = "http_status:404"
      },
    ]
  }
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "organizzolini" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.organizzolini.id
}
