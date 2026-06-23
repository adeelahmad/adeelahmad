<div align="center">

# Adeel Ahmad

**Infrastructure security · Cloud architecture · AI/ML**

Twenty years building from bare metal up — routers, hypervisor clusters, distributed storage, identity stacks — now working at the intersection of **AI and security**: model supply-chain integrity, adversarial fine-tuning detection, and the tooling that makes AI systems trustworthy at enterprise scale.

The constant across every layer: making powerful systems run on hardware you own — and can trust.

[![Blog](https://img.shields.io/badge/Blog-adeelahmad.net-0A0A0A?style=flat-square&logo=hashnode&logoColor=white)](https://blog.adeelahmad.net/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adeelahmadch-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adeelahmadch/)
[![Twitter](https://img.shields.io/badge/𝕏-@adeelahmad-000000?style=flat-square&logo=x&logoColor=white)](https://www.twitter.com/adeelahmad)
[![HuggingFace](https://img.shields.io/badge/🤗-HuggingFace-FFD21E?style=flat-square)](https://huggingface.co/adeelahmad)

</div>

---

### The short version

I started in security early — performing remote vulnerability assessments and penetration testing as a teenager, with a formal recommendation from a US healthcare company's CEO at 16 for finding and remediating production web-app vulnerabilities. That security-first mindset has been the constant through every role since.

Over 13 years I founded and led a technology consultancy that grew to ~40 people, delivering secure platforms and infrastructure for universities, public institutions, and enterprise clients. I built and ran private cloud from bare metal — multi-site clusters, encrypted replication, container hardening, zero-trust networking, kernel-level tuning — which is where the deep expertise in infrastructure security, identity, and compliance-driven engineering came from.

Today, I focus on platform engineering for AI/ML workloads: hardening deployment pipelines with integrity verification and rollback, advancing DevSecOps maturity past target, and serving as **Security Champion** for my squad.

<details>
<summary><b>The longer arc</b></summary>
<br/>

- **Now — CBA.** Staff Platform Engineer (MLOps) on the AI acceleration team. Platform and CI/CD for AI/ML, supply-chain integrity, Security Champion.
- **Founder/CTO — 13 years.** Built a cross-border consultancy to ~40 people across two countries, delivering 80+ engagements: secure platforms, digital-preservation systems, and private cloud built from the metal up. Wore every hat from lead architect to QA.
- **Before that.** White-hat security from age 14 — ISP vuln-hunting and patching in Lahore; a formal remote vulnerability assessment for a US healthcare company at 16, with a CEO recommendation letter.
- **The thread.** Infrastructure security architecture · identity & access management · compliance-driven engineering — now pointed at AI systems.

</details>

---

### Now — AI/ML on Apple Silicon

🧠 **[mlx-grpo-trainer](https://github.com/adeelahmad/mlx-grpo-trainer)** — First MLX implementation of GRPO. Train DeepSeek-R1-style reasoning models entirely on your Mac. No cloud GPUs.

🎯 **[mlx-guided-grpo](https://github.com/adeelahmad/mlx-guided-grpo)** — Curriculum learning + GRPO on Apple Silicon. Structured reasoning-model development, locally.

🤖 **[MacPilot](https://github.com/adeelahmad/MacPilot)** — Control your Mac with natural language. Plain English in, macOS automation out.

---

### AI security & research — the current focus

The work I care most about right now sits where AI meets security:

- **Adversarial fine-tuning detection (paper in prep).** Independent research in mechanistic interpretability — detecting subtle behavioral changes in fine-tuned language models that standard verification methods miss. Geometric metrics over weight space surface what cosine/CKA auditing leaves invisible.
- **Agentic AI attack surface.** Demonstrated, in an enterprise context, how multi-agent systems can be turned into autonomous offensive tools via prompt injection — running reconnaissance and generating payloads with no further human input. The point: agentic systems need a threat model, not just guardrails.
- **Responsible disclosure.** In 2024 I reported a vulnerability in OpenAI's GPT Creator platform through their Bugcrowd program — unauthorized model access and system-message tampering via API request manipulation.
- **The interest.** Model supply-chain integrity, adversarial fine-tuning detection, and building the tooling that makes AI systems trustworthy at enterprise scale.

---

### Certifications

<img src="https://img.shields.io/badge/AWS-Solutions_Architect_Professional-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" /> <img src="https://img.shields.io/badge/AWS-Solutions_Architect_Associate-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" /> <img src="https://img.shields.io/badge/Snowflake-SnowPro_Core-29B5E8?style=for-the-badge&logo=snowflake&logoColor=white" /> <img src="https://img.shields.io/badge/ITIL-V3_Foundations-6D2077?style=for-the-badge&logo=itil&logoColor=white" />

---

### The road here

The ML and AI-security work is built on top of years of doing everything below. All of it informs how I think about AI infrastructure, trust boundaries, and what "running locally" actually means.

<details>
<summary><b>🔧 Bare metal & virtualization</b></summary>
<br/>

Proxmox HA clusters on dedicated servers with Ceph hyper-converged storage over fiber ring. QEMU manual installs from recovery mode — diskless OS via netboot, advanced device emulation, PCI/USB/GPU passthrough. KVM, Firecracker, Cloud Hypervisor, RustVMM, Libvirt, Citrix Hypervisor. LinuxKit for minimal OS builds. I've bootstrapped clusters from nothing — formatting NVMe drives with gdisk, tuning sysctl, setting up VNC for headless installs. Netboot environments with iPXE, TFTP/HTTP PXE boot chains. USB hardware emulation using Raspberry Pi. Docker-in-Docker, QEMU-in-Docker with userspace networking. OpenStack and OpenNebula for private cloud orchestration. If there's no OS on the box, I'll put one there.

</details>

<details>
<summary><b>🌐 Networking</b></summary>
<br/>

MikroTik — dual-WAN load balancing with mangle rules, connection marking, failover routing. VLANs, trunking, L2/L3 switching, bridge interfaces, tap devices for KVM guests. 10G/40G networks over fiber ring and through managed switches. OpenMPTCProuter for WAN bonding. MultiWAN/load balancing with HAProxy. OpenVSwitch, VXLAN, FRRouting for software-defined networking. OSPF, BGP routing. Pinhole NAT, TCP/UDP kernel optimization, custom kernel module development. VPN stack: WireGuard, Nebula P2P (Noise protocol), Tailscale, OpenVPN, IPsec, L2TP, GRE/IPIP tunnels, ZeroTier, sTunnel. Cloudflared tunnels with zero-trust networking. DNS over TLS/HTTPS, self-hosted DNS with Technitium, Pi-hole, AdGuard. Advanced DHCP with custom options. HTTP/HTTPS proxy with and without TLS intercept (Squid). Mail servers: Postfix, Sendmail, Exim. Web servers: Nginx, Caddy, Naxsi WAF. Routers/firewalls: Cisco 2100, Cisco PIX, OPNsense, pfSense, UniFi Security Gateway, OpenWrt, Vyatta, iptables. The kind of networking where you're drawing topology diagrams on napkins.

</details>

<details>
<summary><b>📞 VoIP & telephony</b></summary>
<br/>

Asterisk — vanilla, FreePBX, RasPBX. Audio codec optimization including Opus. chan_dongle for GSM integration, SMS gateway with Kannel over USB modems. FXO/FXS analog integration. Call recording with automated transcription pipelines. 3CX, AWS Connect for cloud-hosted PBX. WebRTC with STUN/ICE for browser-based calling. Built complete phone systems from SIP trunks to desk phones to voicemail-to-email — the kind of setup where you're crimping RJ11s and debugging SIP traces in the same afternoon.

</details>

<details>
<summary><b>💾 Storage & data</b></summary>
<br/>

Ceph hyper-converged clusters on fiber (cephfs on hypervisor clusters), GlusterFS, BtrFS, ZFS. Block storage, object stores, NFS, iSCSI, Samba. Fuse/overlay filesystems. Filesystems across the board: ExtFS, HFS, APFS, XFS. MinIO/S3, rclone with mergerfs for tiered local+cloud storage, JuiceFS. NAS appliances heavily customized with community packages. diskover for filesystem indexing. Block-level data recovery. I've moved petabytes around with rclone's multi-thread streams.

</details>

<details>
<summary><b>🔐 Security, forensics & hardening</b></summary>
<br/>

CIS benchmarks, lynis, rkhunter, chkrootkit, ClamAV, Tripwire. SSH baselines, iptables-persistent, pgaudit, gitleaks. Snort IPS/IDS. Zero Trust architectures. Firewall hardening for DoS/DDoS. Port knocking. Vulnerability scanning with rustscan/nmap. TLS/SSL Certificate Authority with OpenSSL. SSL unpinning with Frida, mitmproxy, TLS intercepting. Reverse shell, SQLmap, WPScan, Netcat. Binary decompilation, overriding function calls in shared libraries (DLLs/.so). OSINT, privilege escalation, rainbow tables. Network packet analysis, HTTP request inspection. Google GRR live forensics. Bot/crawling tooling. Proxying HTTP/HTTPS/SSH. GDPR, FIPS, HIPAA compliance. KMS, CloudHSM, SSM Parameter Store. SOCKS and sockets over SSH. Automated security scanning on cron with email alerts. Started with white-hat pen testing — the kind where you'd find ISP vulns and then help them patch.

</details>

<details>
<summary><b>🔑 Authentication & identity</b></summary>
<br/>

LDAP, Active Directory, OpenLDAP for directory services. SSO with Kerberos, SAML. FreeRADIUS with AAA accounting. Keycloak for auth server deployment. Apple MDM Server for device management. The full identity stack from directory schema design to RADIUS policies to single sign-on federation.

</details>

<details>
<summary><b>🐳 Containers & DevOps</b></summary>
<br/>

Docker — compose patterns, slim builds, Swarm cluster orchestration, volume/network plugin development, hardening with AppArmor profiles (mounts/cgroups), Docker-in-Docker, QEMU in Docker with userspace networking. Podman, Kata Containers for micro-VM isolation. Traefik, Pulumi for IaC. Code-server, self-hosted Gitpod. Cockpit, Netdata, Prometheus + Grafana. ECS/EKS, Kubernetes, serverless with Lambda. CI/CD: GitHub Actions, GitLab CI, Circle CI, Travis CI, CodeBuild/CodePipeline. DORA metrics. Maintained NAS template ecosystems. If it runs in a container, I've probably written the docker-compose for it.

</details>

<details>
<summary><b>📊 Monitoring & observability</b></summary>
<br/>

Prometheus + Grafana dashboards. ELK stack — Elasticsearch, Logstash, Kibana dashboards, Mtail. OpenNMS, Nagios, Cacti, SmokePing for network monitoring. Monit for process supervision. Netdata, Netflow analysis. ARP scan/arpwatch for network discovery. MTR, iPerf for performance testing. nmap/rustscan for scanning. SNMP polling. Fail2ban. The kind of monitoring where you know a disk is dying before the on-call page fires.

</details>

<details>
<summary><b>☁️ Cloud & data engineering</b></summary>
<br/>

AWS — Bedrock, SageMaker, Textract, Comprehend, Transcribe, Glue, Lambda, ECS/EKS, CloudFormation, Connect. Azure. Snowflake + DBT pipelines. Apache Spark, Airflow. Data warehousing, ETL, metadata governance. Databases: Postgres, MariaDB/MySQL, MongoDB, InfluxDB, Redis, Memcache. Apache Solr, Elasticsearch, LevelDB, IndexedDB, MQTT. Caching: Redis, Memcache, FlashCache, Varnish, Squid. Analytics: Metabase, Redash, OpenRefine. GenAI solutions spanning hundreds of terabytes.

</details>

<details>
<summary><b>🎬 Digital preservation & media</b></summary>
<br/>

Built video-to-text pipelines — ffmpeg for frame extraction and deduplication, Tesseract OCR, Kaldi ASR, Deep Speech for transcription, face recognition. Indexing for searchable archives. Contributed to digital repository frameworks and public broadcasting archives. Ruby/Rails/Puma on AWS.

</details>

<details>
<summary><b>🌍 Full-stack & web</b></summary>
<br/>

Svelte (big fan), React, TypeScript, Prisma, Node.js, Deno. Ruby on Rails, Dry-rb, custom gems. PHP — Symfony, Laravel, CodeIgniter, Zend, PHP extension development in C. Java — Spring, Swing. Python — SQLAlchemy, dataclasses, pip package dev. Advanced service workers and browser extensions. Reverse proxies — Fabio, gobetween, reproxy. Diagrams-as-code. The kind of full-stack where you also configure the router the server sits behind.

</details>

---

### What connects it all

Every phase has been about the same two things: **owning your compute, and trusting it.** Building hypervisor clusters instead of renting instances. Running your own DNS instead of using managed services. Standing up your own PBX instead of paying per-seat. Training reasoning models on a Mac Studio instead of paying for GPU hours — and now, making sure the models you run are the models you think you're running. The platform keeps changing. The principle doesn't.

### Tech

```
AI/ML         MLX · PyTorch · GRPO/RLHF · HuggingFace · LLMs · Bedrock · SageMaker
              Mechanistic interpretability · LoRA · Kaldi ASR · Tesseract OCR
Languages     Python · TypeScript · Ruby · Go · Rust · C++ · Swift · Bash
              PHP · Java · Perl · Lua · AppleScript
Cloud         AWS (SA Pro) · Azure · Snowflake · OpenStack · OpenNebula
              Serverless · ECS/EKS · Kubernetes
Infra         Proxmox HA · KVM/QEMU · Firecracker · Cloud Hypervisor · RustVMM
              LinuxKit · Docker · Podman · Kata Containers · Pulumi
Networking    MikroTik · Cisco · pfSense · OPNsense · OpenWrt · Vyatta
              WireGuard · Nebula · Tailscale · OpenVPN · IPsec
              VLANs · OSPF · BGP · OpenVSwitch · VXLAN · HAProxy
VoIP          Asterisk · FreePBX · 3CX · AWS Connect · WebRTC · Kannel SMS
Storage       Ceph · GlusterFS · ZFS · BtrFS · MinIO/S3 · NFS · iSCSI
              rclone · JuiceFS · mergerfs
Data          Postgres · MySQL · MongoDB · Redis · InfluxDB · Elasticsearch
              Snowflake · DBT · Airflow · Spark · Solr · MQTT
Security      CIS · lynis · Snort IDS · Frida · mitmproxy · rustscan
              HIPAA/GDPR · KMS · CloudHSM · Zero Trust · GRR Forensics
Identity      LDAP/AD · Kerberos · SAML · FreeRADIUS · Keycloak · SSO
Monitoring    Prometheus · Grafana · ELK Stack · Nagios · OpenNMS · Cacti
              SmokePing · Netdata · Fail2ban · SNMP
CI/CD         GitHub Actions · GitLab CI · Circle CI · CodeBuild/Pipeline
              Travis CI · DORA Metrics
Web           Svelte · React · Rails · Node.js · Deno · Prisma
              Symfony · Laravel · Spring
```

---

<div align="center">

327 repos · 5k+ starred · Arctic Code Vault Contributor

</div>
