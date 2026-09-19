<div align="center">

# Adeel Ahmad

**Systems engineering · Applied AI · Security**

Nearly two decades of professional engineering — software, networks, virtualization, distributed storage, identity, cloud and AI.

I approach them as **one connected system**: understand the constraints, find the right abstraction, and build something that works beyond the diagram.

**Melbourne, Australia · Hands-on engineer · Founder background**

[![Blog](https://img.shields.io/badge/Blog-adeelahmad.net-0A0A0A?style=flat-square&logo=hashnode&logoColor=white)](https://blog.adeelahmad.net/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adeelahmadch-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adeelahmadch/)
[![Twitter](https://img.shields.io/badge/𝕏-@adeelahmad-000000?style=flat-square&logo=x&logoColor=white)](https://www.twitter.com/adeelahmad)
[![HuggingFace](https://img.shields.io/badge/🤗-HuggingFace-FFD21E?style=flat-square)](https://huggingface.co/adeelahmad)

</div>

---

## What I do

I'm part of **Commonwealth Bank of Australia's AI Centre of Excellence, in the AI Acceleration squad**. My formal title is **Staff Platform Engineer (MLOps)**; my work centres on **applied AI, technical leadership and turning emerging AI capabilities into usable enterprise solutions**. I'm also the squad's Security Champion.

Before CBA, I worked on GenAI engineering at **Lyrebird Health** and AWS cloud consulting at **Cevo**. Earlier, I founded and led **Xoho Tech** for 13 years, growing the consultancy to around 40 people and delivering software, digital-preservation systems and infrastructure for universities, public institutions and enterprise clients.

Founder did not mean stepping away from implementation. I wrote software, designed systems, ran networks, handled security, worked with customers and led delivery. That is where the range comes from: **cloud learned on top of on-premises systems; AI learned on top of software, infrastructure and security.**

My independent work now focuses on **agent infrastructure, model behaviour and integrity, local ML, and the systems underneath them**. The personal projects below are separate from my employer's work.

## Selected work

### Agents, controls and continuity

| Project | What I'm building |
|---|---|
| **[AgentRC](https://github.com/adeelahmad/agentrc)** · [agentrc.ai](https://agentrc.ai) | A **working-draft specification** and Go/BuildKit reference tooling for portable agent declarations. A Dockerfile-shaped `Agentfile` describes identity, capabilities, instructions and typed policy requests through OCI metadata. The platform decides what to grant, narrow or reject; declaration is separate from enforcement. |
| **[agent-handoff](https://github.com/adeelahmad/package)** | Portable, versioned handoffs between agent sessions: settled decisions, open questions, ordered tasks and selectively queried history. A self-contained Go binary handles packaging and structural validation; the agent supplies the content. Built after a useful phone conversation needed to continue in another AI environment the next morning. |
| **[agentic-agile](https://github.com/adeelahmad/agentic-agile)** | Human-gated planning followed by coding-agent execution with hook-enforced TDD checks and worktree isolation. Explicit controls around probabilistic agents, rather than relying on instructions alone. |

### Models on hardware I own

**[mlx-grpo-trainer](https://github.com/adeelahmad/mlx-grpo-trainer)** and **[mlx-guided-grpo](https://github.com/adeelahmad/mlx-guided-grpo)** — MLX-based reinforcement-learning and fine-tuning work on Apple Silicon, including GRPO, curriculum-guided training and configurable rewards.

**[mlx-lm-lens](https://github.com/adeelahmad/mlx-lm-lens)** — tooling for inspecting transformer behaviour: per-layer predictions, activation drift and comparisons between base and adapted models. Part of my independent exploration of how fine-tuning changes behaviour and how those changes can be measured.

**[MacPilot](https://github.com/adeelahmad/MacPilot)** — macOS automation combining natural-language instructions with native accessibility, screen-analysis and operating-system APIs.

### Filesystems and networking — still hands-on

**[JuiceFS fork](https://github.com/adeelahmad/juicefs)** — development across ZFS-style dataset management, content-addressed storage, snapshots, replication, cache hierarchies, object-storage adapters and NBD/iSCSI block access. The work spans storage interfaces, protocol behaviour, integrity checks and deployment across a mixed homelab. This is **fork development, not an upstream JuiceFS release**; implementation and release status vary by feature and branch.

**[OpenWrt traffic control — merged upstream](https://github.com/YusDyr/luci-app-trafficctl/pull/27)** — corrected bidirectional limiting and shaping by tracing Linux bridge hooks, conntrack/NAT ordering and IFB/HTB behaviour on a live router. Added routed-subnet visibility, port-forward controls and supporting tests. Merged in **August 2026**.

**[YouTube filesystem for rclone](https://github.com/adeelahmad/rclone/tree/feat/ytfs)** — built for **parental control**, not as a filesystem exercise: expose parent-selected channels and playlists as read-only media that Emby can consume alongside local content. Includes metadata and manifest-driven selection. Personal-fork work; the [upstream proposal](https://github.com/rclone/rclone/pull/9657) was closed without merging.

## How I tend to build

When I don't understand how something works, I tend to build the piece underneath it.

That is why wanting to understand Kubernetes led me to build a three-host Proxmox/Ceph/ZFS cluster at home, with more than 150 TB of storage and a 25 GbE fabric. It is also why a parental-control problem became a filesystem adapter, and a lost conversation became a versioned handoff tool.

A recurring design choice is to **separate what should survive from what should be replaceable**. Agent declarations should not be tied to one runtime. Useful decisions should not disappear with a chat session. Storage capabilities should not depend unnecessarily on one backend.

The abstraction still has to respect reality: a read-only source stays read-only; declaring a permission does not grant it; passing a unit test does not replace testing the real system.

## AI before it was my job title

| When | What I was doing |
|---|---|
| **4 June 2021** | **Received access to OpenAI's private API beta**, while running Xoho Tech in Pakistan. This is the access-granted date, not the application date. |
| **24 October 2023** | Shared an [AutoGen prototype modelling an AWS customer team](https://colab.research.google.com/gist/adeelahmad/e26b3e6888fe2066d2ac8ea7911e4f07/iterative-approach-to-discovering-gen-ai-opportunities-for-business-impact-aws-cloud-professionals-as-autoagents.ipynb): role-specific agents, human oversight, critique and approval, code execution, and generation of another team of specialist agents. |
| **2024** | [Presented a serverless second-brain architecture](https://www.youtube.com/watch?v=pR-Z0Q0i4AI): personal knowledge, semantic retrieval, source metadata, small/local models and asynchronous processing. The principle was to use models to reason over selected knowledge, rather than rely only on their training data. |
| **2025–26** | Applied AI at CBA, alongside independent work in MLX/GRPO, model inspection, agent controls, portable agent definitions and versioned work handoffs. |

## The engineering underneath

These are not all equal-depth specialisms, and they are not just a list of technologies I've encountered. They are areas I've worked in over time; the projects above show where that experience is still being exercised.

<details>
<summary><b>💻 Software engineering and the web</b></summary>
<br/>

Application development from table-layout web pages, jQuery and CoffeeScript through Angular, React, Svelte and TypeScript. Backend work in Python, Ruby/Rails, PHP, Go and Java; systems work with C/C++ and Rust; automation with Bash, Perl, Lua and AppleScript, plus Swift work on Apple platforms. PHP frameworks and extension development, service workers, browser extensions, APIs, databases and deployment — not just the application code in isolation.

</details>

<details>
<summary><b>🔧 Virtualization, Linux and private infrastructure</b></summary>
<br/>

My hypervisor experience started with VMware around the PureLogics period, followed by Citrix XenServer 5/6/7 and later Proxmox/KVM/QEMU. It grew into hyper-converged Ceph/ZFS clusters, live migration, OpenStack, OpenNebula, netboot and device passthrough. Later work includes Firecracker, rust-vmm, Cloud Hypervisor and container isolation. Proxmox was an evolution of that experience, not the beginning of it.

</details>

<details>
<summary><b>🌐 Networks, routing and observability</b></summary>
<br/>

Cisco PIX firewalls, Catalyst switches and routers; later Vyatta, pfSense, OPNsense, MikroTik and OpenWrt. VLANs, L2/L3 switching, OSPF/BGP, FRRouting, Open vSwitch/VXLAN, NAT, multi-WAN routing and fibre networks. WireGuard, IPsec, Nebula, Tailscale and ZeroTier; self-hosted DNS, HTTP proxies and TLS inspection. Monitoring with Prometheus/Grafana, ELK, Nagios, OpenNMS, Cacti, SmokePing, Netdata, SNMP and packet-level diagnostics. Recent OpenWrt work connects that background directly to Linux traffic-control implementation.

</details>

<details>
<summary><b>💾 Storage, filesystems and data services</b></summary>
<br/>

ZFS, Ceph/RADOS/CephFS, GlusterFS, Btrfs, ext4 and XFS; block and object storage, NFS, iSCSI, Samba and FUSE. MinIO/S3, rclone, mergerfs and JuiceFS; snapshots, replication, backups and NAS integration. Application and metadata stores include PostgreSQL, MySQL/MariaDB, MongoDB, Redis and InfluxDB, with Solr/Elasticsearch for search. My JuiceFS fork takes this from operating storage into implementing cache, dataset, integrity and block-protocol behaviour.

</details>

<details>
<summary><b>🔐 Security and identity</b></summary>
<br/>

Security work began in my teens, including a formal vulnerability assessment for a US healthcare company at 16 and a recommendation from its CEO. Later work spans application testing, infrastructure hardening, packet and API analysis, identity federation and responsible disclosure. LDAP/Active Directory, Kerberos, SAML, FreeRADIUS, Keycloak, OAuth/OIDC, Cloudflare access/tunnel tooling, workload identity and least-privilege design. Tooling includes Nmap, mitmproxy, Frida, Snort, CIS automation and gitleaks. My current interests include agent authorization, isolation, prompt-injection boundaries and model integrity.

</details>

<details>
<summary><b>☁️ Cloud, containers and delivery</b></summary>
<br/>

AWS, Azure and private cloud; Docker/Compose/Swarm, container plugin development, AppArmor, Kubernetes, ECS/EKS, Podman and Kata. Infrastructure as code, CI/CD, observability and operational tooling, including GitHub Actions, GitLab CI, CircleCI and CodeBuild/CodePipeline. AWS work includes Bedrock, SageMaker, Lambda, Glue, Textract, Comprehend and Transcribe; data-integration work includes Snowflake and dbt. Cloud is another implementation choice, not a replacement for understanding the system beneath it.

</details>

<details>
<summary><b>🧠 ML, media and digital preservation</b></summary>
<br/>

Before GenAI: searchable audiovisual archives, FFmpeg pipelines, OCR with Tesseract, speech recognition with Kaldi and DeepSpeech, face recognition and metadata systems. Later: retrieval-augmented applications, vector search, multi-provider LLM orchestration, agent workflows, evaluation, synthetic data, quantization, LoRA and GRPO on MLX. Digital-preservation work connected media, metadata, storage and search long before those became inputs to my AI work.

</details>

<details>
<summary><b>📞 Telephony and connected devices</b></summary>
<br/>

Asterisk PBX work began around the same early-career period as VMware, with FreePBX and later 3CX. SIP, Opus tuning, GSM integration with chan_dongle, SMS gateways, call recording, transcription and WebRTC/STUN/ICE. Also hands-on with IoT integrations, Zigbee and Z-Wave.

</details>

## Certifications earned

AWS Solutions Architect — Professional · AWS Solutions Architect — Associate · Snowflake SnowPro Core · ITIL v3 Foundation

---

### What connects it all

**Owning your compute, and trusting it.**

For me, that means understanding what a system depends on, who controls it, what it is allowed to do, and how to verify its behaviour. Sometimes the right answer is a managed cloud service. Sometimes it is a small model on my Mac, a self-hosted service or a change to the storage system itself.

The common thread is practical: **understand the mechanism, make the important state explicit, and verify the result.**

<div align="center">

**Arctic Code Vault Contributor**

</div>
