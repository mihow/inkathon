provider "aws" {
  region = "us-west-2"
}

data "aws_route53_zone" "website" {
  name = "bunsen.town."
}

variable "naked_domain_name" {
  default = "ink-in-the-loop.bunsen.town"
}

resource "aws_s3_bucket" "website" {
  bucket = "${var.naked_domain_name}"

  acl = "public-read"

  website {
    index_document = "index.html"
    error_document = "404.html"
  }

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": ["s3:GetObject"],
    "Resource": ["arn:aws:s3:::${var.naked_domain_name}/*"]
  }]
}
POLICY

  provisioner "local-exec" {
    command = "aws s3 sync www/ s3://${var.naked_domain_name}/"
  }

}

resource "aws_route53_record" "website" {
  zone_id = "${data.aws_route53_zone.website.zone_id}"
  name    = "${var.naked_domain_name}"
  type    = "A"

  alias = {
    name                   = "${aws_s3_bucket.website.website_endpoint}"
    zone_id                = "${aws_s3_bucket.website.hosted_zone_id}"
    evaluate_target_health = false
  }

  provisioner "local-exec" {
    command = "dig ${var.naked_domain_name}"
  }
}

output "url" {
  value = "http://${var.naked_domain_name}"
}